const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');
const QuizRoom = require('../models/QuizRoom');
const Question = require('../models/Question');
const User = require('../models/User');

// Helper to sanitize questions (never expose correctAnswer during active quiz)
function sanitizeQuestions(questions, includeAnswers = false) {
    if (!questions) return [];
    return questions.map((q, idx) => {
        const item = {
            _id: q._id,
            questionIndex: idx,
            question: q.question,
            options: q.options,
            hint: q.hint
        };
        if (includeAnswers) {
            item.correctAnswer = q.correctAnswer;
        }
        return item;
    });
}

// Create a new quiz room
router.post('/create', protect, async (req, res) => {
    try {
        const { title, subject, difficulty, questionCount, timePerQuestion, hostParticipates } = req.body;

        if (!title || !subject || !difficulty) {
            return res.status(400).json({
                success: false,
                message: 'Title, subject, and difficulty are required.'
            });
        }

        const count = Math.min(30, Math.max(5, parseInt(questionCount) || 10));
        const duration = Math.min(120, Math.max(10, parseInt(timePerQuestion) || 30));

        // Generate unique 6-character room code
        let roomCode;
        let isUnique = false;
        let attempts = 0;
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars 0/O, 1/I

        while (!isUnique && attempts < 20) {
            roomCode = '';
            for (let i = 0; i < 6; i++) {
                roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existing = await QuizRoom.findOne({ roomCode });
            if (!existing) isUnique = true;
            attempts++;
        }

        // Fetch random questions
        let questions = await Question.aggregate([
            { $match: { subject, difficulty } },
            { $sample: { size: count } }
        ]);

        // Fallback: If not enough questions in exact difficulty, fallback to any difficulty for this subject
        if (questions.length < count) {
            console.log(`Only found ${questions.length} questions for ${subject}/${difficulty}. Querying broader pool...`);
            questions = await Question.aggregate([
                { $match: { subject } },
                { $sample: { size: count } }
            ]);
        }

        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: `No questions found for subject: ${subject}. Please choose another subject.`
            });
        }

        // Create quiz room
        const quizRoom = new QuizRoom({
            roomCode,
            title: title.trim(),
            creator: req.user.id,
            settings: {
                subject,
                difficulty,
                questionCount: questions.length,
                timePerQuestion: duration,
                hostParticipates: hostParticipates !== false
            },
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                hint: q.hint || ''
            }))
        });

        // Add creator as participant if they choose to participate
        if (hostParticipates !== false) {
            quizRoom.participants.push({
                user: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar || '🦸',
                isConnected: true
            });
        }

        await quizRoom.save();

        // Generate QR code
        const clientBase = process.env.CLIENT_URL || 'http://localhost:5500';
        const joinUrl = `${clientBase}/multiplayer.html?join=${roomCode}`;
        const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
            margin: 2,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        });

        res.json({
            success: true,
            room: {
                roomCode,
                title: quizRoom.title,
                creator: req.user.id,
                settings: quizRoom.settings,
                participantCount: quizRoom.participants.length,
                qrCode: qrCodeDataUrl,
                joinUrl
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create quiz room' });
    }
});

// Join a quiz room
router.post('/join/:roomCode', protect, async (req, res) => {
    try {
        const roomCode = (req.params.roomCode || '').trim().toUpperCase();
        const room = await QuizRoom.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: `Room "${roomCode}" not found.`
            });
        }

        if (room.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This quiz has already ended.'
            });
        }

        // Check if user already joined
        const existingIndex = room.participants.findIndex(p => p.user && p.user.toString() === req.user.id);
        if (existingIndex !== -1) {
            room.participants[existingIndex].isConnected = true;
            await room.save();

            return res.json({
                success: true,
                message: 'Reconnected to room successfully',
                room: {
                    roomCode: room.roomCode,
                    title: room.title,
                    creator: room.creator,
                    settings: room.settings,
                    status: room.status,
                    participantCount: room.participants.length
                }
            });
        }

        // If quiz is already active and user wasn't a participant
        if (room.status === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Quiz is already in progress and cannot accept new players.'
            });
        }

        // Add new participant
        room.participants.push({
            user: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar || '🦸',
            isConnected: true
        });

        await room.save();

        res.json({
            success: true,
            message: 'Joined room successfully',
            room: {
                roomCode: room.roomCode,
                title: room.title,
                creator: room.creator,
                settings: room.settings,
                status: room.status,
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
        const roomCode = (req.params.roomCode || '').trim().toUpperCase();
        const room = await QuizRoom.findOne({ roomCode })
            .populate('creator', 'username avatar')
            .populate('participants.user', 'username avatar');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const isCompleted = room.status === 'completed';
        const roomData = {
            roomCode: room.roomCode,
            title: room.title,
            creator: room.creator,
            settings: room.settings,
            status: room.status,
            participants: room.participants.map(p => ({
                user: p.user ? (p.user._id || p.user) : null,
                username: p.username,
                avatar: p.avatar,
                score: p.score || 0,
                streak: p.streak || 0,
                correctAnswers: p.correctAnswers || 0,
                isConnected: p.isConnected !== false
            })),
            currentQuestion: room.currentQuestion,
            totalQuestions: room.questions.length,
            winners: room.winners || []
        };

        // Include questions without revealing correctAnswer during active gameplay
        if (room.status === 'active') {
            roomData.questions = sanitizeQuestions(room.questions, false);
        } else if (room.status === 'completed') {
            roomData.questions = sanitizeQuestions(room.questions, true);
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
        const roomCode = (req.params.roomCode || '').trim().toUpperCase();
        const room = await QuizRoom.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.creator.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only creator can start the quiz' });
        }

        if (room.participants.length < 1) {
            return res.status(400).json({ success: false, message: 'Need at least 1 participant to start' });
        }

        room.status = 'active';
        room.startedAt = new Date();
        room.currentQuestion = 0;
        await room.save();

        res.json({ success: true, message: 'Quiz started', currentQuestion: 0 });
    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ success: false, message: 'Failed to start quiz' });
    }
});

// Submit answer via REST
router.post('/:roomCode/answer', protect, async (req, res) => {
    try {
        const roomCode = (req.params.roomCode || '').trim().toUpperCase();
        const { questionIndex, selectedAnswer, timeSpent } = req.body;

        const room = await QuizRoom.findOne({ roomCode });
        if (!room || room.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Invalid room or quiz not active' });
        }

        const participant = room.participants.find(p => p.user && p.user.toString() === req.user.id);
        if (!participant) {
            return res.status(403).json({ success: false, message: 'Not a participant in this room' });
        }

        // Check if already answered
        const alreadyAnswered = participant.answers.some(a => a.questionIndex === questionIndex);
        if (alreadyAnswered) {
            return res.status(400).json({ success: false, message: 'Answer already submitted for this question' });
        }

        const question = room.questions[questionIndex];
        if (!question) {
            return res.status(400).json({ success: false, message: 'Question not found' });
        }

        const isCorrect = (selectedAnswer === question.correctAnswer);
        const actualTimeSpent = Math.max(0, Math.min(room.settings.timePerQuestion, Number(timeSpent) || 0));

        // Calculate score: base 100 + speed bonus up to 50 + streak bonus
        let points = 0;
        let speedBonus = 0;
        let streakBonus = 0;

        if (isCorrect) {
            const timeRemaining = Math.max(0, room.settings.timePerQuestion - actualTimeSpent);
            speedBonus = Math.round((timeRemaining / room.settings.timePerQuestion) * 50);
            participant.streak = (participant.streak || 0) + 1;
            streakBonus = participant.streak > 1 ? Math.min(participant.streak * 10, 50) : 0;
            points = 100 + speedBonus + streakBonus;
            participant.correctAnswers = (participant.correctAnswers || 0) + 1;
        } else {
            participant.streak = 0;
        }

        participant.answers.push({
            questionIndex,
            selectedAnswer,
            isCorrect,
            timeSpent: actualTimeSpent,
            answeredAt: new Date()
        });

        participant.score = (participant.score || 0) + points;
        participant.timeSpent = (participant.timeSpent || 0) + actualTimeSpent;

        await room.save();

        res.json({
            success: true,
            isCorrect,
            points,
            speedBonus,
            streakBonus,
            streak: participant.streak,
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
        const roomCode = (req.params.roomCode || '').trim().toUpperCase();
        const room = await QuizRoom.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        room.status = 'completed';
        room.completedAt = new Date();
        
        const winners = room.calculateWinners();

        // Award XP to all participants
        for (const p of room.participants) {
            if (p.user) {
                const user = await User.findById(p.user);
                if (user) {
                    const winnerEntry = winners.find(w => w.user && w.user.toString() === p.user.toString());
                    const xpReward = winnerEntry ? winnerEntry.xpReward : 50; // 50 XP participation
                    user.updateXP(xpReward);
                    await user.save();
                }
            }
        }

        await room.save();

        res.json({
            success: true,
            winners,
            finalResults: room.participants.map(p => ({
                userId: p.user,
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