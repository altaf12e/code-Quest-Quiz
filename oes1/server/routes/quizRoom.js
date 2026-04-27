const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');
const QuizRoom = require('../models/QuizRoom');
const Question = require('../models/Question');
const User = require('../models/User');

// Create a new quiz room
router.post('/create', protect, async (req, res) => {
    try {
        const { title, subject, difficulty, questionCount, timePerQuestion, hostParticipates } = req.body;

        // Generate unique room code
        let roomCode;
        let isUnique = false;
        while (!isUnique) {
            roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await QuizRoom.findOne({ roomCode });
            if (!existing) isUnique = true;
        }

        // Fetch random questions
        console.log(`Fetching questions for subject: ${subject}, difficulty: ${difficulty}, count: ${questionCount}`);
        
        const questions = await Question.aggregate([
            { $match: { subject, difficulty } },
            { $sample: { size: questionCount } }
        ]);
        
        console.log(`Found ${questions.length} questions`);

        if (questions.length < questionCount) {
            // Check total available questions for this subject/difficulty
            const totalAvailable = await Question.countDocuments({ subject, difficulty });
            console.log(`Total available questions: ${totalAvailable}`);
            
            return res.status(400).json({
                success: false,
                message: `Not enough questions available. Found ${questions.length}, need ${questionCount}. Total in DB: ${totalAvailable}`
            });
        }

        // Create quiz room
        const quizRoom = new QuizRoom({
            roomCode,
            title,
            creator: req.user.id,
            settings: {
                subject,
                difficulty,
                questionCount,
                timePerQuestion: timePerQuestion || 30,
                hostParticipates: hostParticipates !== false
            },
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                hint: q.hint
            }))
        });

        // Add creator as participant if they choose to participate
        if (hostParticipates !== false) {
            quizRoom.participants.push({
                user: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar
            });
        }

        await quizRoom.save();

        // Generate QR code
        const joinUrl = `${process.env.CLIENT_URL || 'http://localhost:5500'}/multiplayer.html?join=${roomCode}`;
        const qrCodeDataUrl = await QRCode.toDataURL(joinUrl);

        res.json({
            success: true,
            room: {
                roomCode,
                title,
                creator: req.user.id,
                settings: quizRoom.settings,
                qrCode: qrCodeDataUrl,
                joinUrl
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ success: false, message: 'Failed to create quiz room' });
    }
});

// Join a quiz room
router.post('/join/:roomCode', protect, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await QuizRoom.findOne({ roomCode, status: 'waiting' });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found or already started'
            });
        }

        // Check if user already joined
        const existingParticipant = room.participants.find(p => p.user.toString() === req.user.id);
        if (existingParticipant) {
            return res.json({
                success: true,
                message: 'Already joined',
                room: {
                    roomCode: room.roomCode,
                    title: room.title,
                    creator: room.creator,
                    settings: room.settings,
                    participantCount: room.participants.length
                }
            });
        }

        // Add participant
        room.participants.push({
            user: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar
        });

        await room.save();

        res.json({
            success: true,
            message: 'Joined successfully',
            room: {
                roomCode: room.roomCode,
                title: room.title,
                creator: room.creator,
                settings: room.settings,
                participantCount: room.participants.length
            }
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ success: false, message: 'Failed to join room' });
    }
});

// Get room details
router.get('/:roomCode', protect, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await QuizRoom.findOne({ roomCode })
            .populate('creator', 'username avatar')
            .populate('participants.user', 'username avatar');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const roomData = {
            roomCode: room.roomCode,
            title: room.title,
            creator: room.creator,
            settings: room.settings,
            status: room.status,
            participants: room.participants.map(p => ({
                user: p.user,
                username: p.username,
                avatar: p.avatar,
                score: p.score,
                correctAnswers: p.correctAnswers
            })),
            currentQuestion: room.currentQuestion,
            totalQuestions: room.questions.length,
            winners: room.winners
        };
        
        // Include questions if room is active (for quiz participants)
        if (room.status === 'active') {
            roomData.questions = room.questions;
        }
        
        res.json({
            success: true,
            room: roomData
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ success: false, message: 'Failed to get room details' });
    }
});

// Start quiz
router.post('/:roomCode/start', protect, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await QuizRoom.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.creator.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only creator can start the quiz' });
        }

        const minParticipants = room.settings.hostParticipates ? 2 : 1;
        if (room.participants.length < minParticipants) {
            const message = room.settings.hostParticipates 
                ? 'Need at least 2 participants' 
                : 'Need at least 1 participant';
            return res.status(400).json({ success: false, message });
        }

        room.status = 'active';
        room.startedAt = new Date();
        await room.save();

        res.json({ success: true, message: 'Quiz started' });
    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ success: false, message: 'Failed to start quiz' });
    }
});

// Submit answer
router.post('/:roomCode/answer', protect, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { questionIndex, selectedAnswer, timeSpent } = req.body;

        const room = await QuizRoom.findOne({ roomCode });
        if (!room || room.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Invalid room or quiz not active' });
        }

        const participant = room.participants.find(p => p.user.toString() === req.user.id);
        if (!participant) {
            return res.status(403).json({ success: false, message: 'Not a participant' });
        }

        const question = room.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        // Calculate score (correct answer + speed bonus)
        let points = 0;
        if (isCorrect) {
            const speedBonus = Math.max(0, room.settings.timePerQuestion - timeSpent);
            points = 100 + Math.floor(speedBonus * 2); // Base 100 + speed bonus
        }

        // Update participant
        participant.answers.push({
            questionIndex,
            selectedAnswer,
            isCorrect,
            timeSpent,
            answeredAt: new Date()
        });

        if (isCorrect) {
            participant.correctAnswers += 1;
        }
        participant.score += points;
        participant.timeSpent += timeSpent;

        await room.save();

        res.json({
            success: true,
            isCorrect,
            points,
            correctAnswer: question.correctAnswer
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit answer' });
    }
});

// Complete quiz and calculate winners
router.post('/:roomCode/complete', protect, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await QuizRoom.findOne({ roomCode }).populate('participants.user');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        room.status = 'completed';
        room.completedAt = new Date();
        
        const winners = room.calculateWinners();

        // Award XP to winners
        for (const winner of winners) {
            const user = await User.findById(winner.user);
            if (user) {
                user.updateXP(winner.xpReward);
                await user.save();
            }
        }

        await room.save();

        res.json({
            success: true,
            winners,
            finalResults: room.participants.map(p => ({
                username: p.username,
                avatar: p.avatar,
                score: p.score,
                correctAnswers: p.correctAnswers,
                timeSpent: p.timeSpent
            })).sort((a, b) => b.score - a.score)
        });
    } catch (error) {
        console.error('Complete quiz error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete quiz' });
    }
});

module.exports = router;