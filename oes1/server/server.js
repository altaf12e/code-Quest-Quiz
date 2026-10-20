const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const QuizRoom = require('./models/QuizRoom');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with broad CORS for localhost, 127.0.0.1, and local IP testing
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

connectDB();

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// REST Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/quiz-room', require('./routes/quizRoom'));

app.get('/', (req, res) => {
    res.json({ message: 'CodeQuest API is running' });
});

// ==========================================
// Authoritative Real-Time Multiplayer Engine
// ==========================================

// In-memory active game rooms
// roomCode -> { roomCode, roomId, hostId, status, settings, questions, currentQuestionIndex, questionStartTime, timer, participants, currentAnswers }
const activeRooms = new Map();

// socket.id -> { roomCode, userId, username }
const socketMap = new Map();

// Helper to get formatted, sorted leaderboard
function getLeaderboard(room) {
    if (!room || !room.participants) return [];
    return Array.from(room.participants.values())
        .map(p => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score || 0,
            streak: p.streak || 0,
            correctAnswers: p.correctAnswers || 0,
            isConnected: p.isConnected !== false,
            hasAnswered: room.currentAnswers ? room.currentAnswers.has(p.userId.toString()) : false
        }))
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.correctAnswers - a.correctAnswers;
        });
}

// Ensure room is loaded in memory
async function getOrCreateActiveRoom(roomCode) {
    const code = roomCode.toUpperCase();
    if (activeRooms.has(code)) {
        return activeRooms.get(code);
    }

    const dbRoom = await QuizRoom.findOne({ roomCode: code });
    if (!dbRoom) return null;

    const participants = new Map();
    for (const p of dbRoom.participants) {
        if (p.user) {
            participants.set(p.user.toString(), {
                userId: p.user.toString(),
                username: p.username,
                avatar: p.avatar || '🦸',
                socketId: null,
                isConnected: p.isConnected !== false,
                score: p.score || 0,
                streak: p.streak || 0,
                correctAnswers: p.correctAnswers || 0,
                timeSpent: p.timeSpent || 0,
                answers: p.answers || []
            });
        }
    }

    const roomData = {
        roomCode: code,
        roomId: dbRoom._id.toString(),
        hostId: dbRoom.creator.toString(),
        status: dbRoom.status || 'waiting',
        settings: dbRoom.settings || { timePerQuestion: 30, questionCount: 10 },
        questions: dbRoom.questions || [],
        currentQuestionIndex: dbRoom.currentQuestion || 0,
        questionStartTime: 0,
        timer: null,
        participants,
        currentAnswers: new Map()
    };

    activeRooms.set(code, roomData);
    return roomData;
}

// Broadcast question authoritatively to all room participants
function broadcastQuestion(roomCode, questionIndex) {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (questionIndex >= room.questions.length) {
        finishQuiz(roomCode);
        return;
    }

    room.currentQuestionIndex = questionIndex;
    room.questionStartTime = Date.now();
    room.status = 'active';
    room.currentAnswers.clear();

    const q = room.questions[questionIndex];
    const duration = room.settings.timePerQuestion || 30;

    console.log(`[Room ${roomCode}] Broadcasting Question ${questionIndex + 1}/${room.questions.length}`);

    // Emit sanitized question (no correctAnswer!)
    io.to(roomCode).emit('question-start', {
        questionIndex,
        totalQuestions: room.questions.length,
        question: {
            question: q.question,
            options: q.options,
            hint: q.hint || ''
        },
        timePerQuestion: duration,
        serverTime: Date.now(),
        leaderboard: getLeaderboard(room)
    });

    // Clear existing timer if any
    if (room.timer) {
        clearTimeout(room.timer);
    }

    // Set server countdown timer
    room.timer = setTimeout(() => {
        console.log(`[Room ${roomCode}] Question ${questionIndex + 1} timer expired`);
        revealQuestionResult(roomCode, questionIndex);
    }, (duration + 1) * 1000); // 1 extra second grace period for network latency
}

// Reveal answer and interim leaderboard
function revealQuestionResult(roomCode, questionIndex) {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.timer) {
        clearTimeout(room.timer);
        room.timer = null;
    }

    room.status = 'showing-answer';
    const q = room.questions[questionIndex];

    // For participants who did not answer, record a timeout
    for (const [userId, participant] of room.participants.entries()) {
        if (!room.currentAnswers.has(userId)) {
            participant.streak = 0;
            participant.answers.push({
                questionIndex,
                selectedAnswer: -1,
                isCorrect: false,
                timeSpent: room.settings.timePerQuestion,
                answeredAt: new Date()
            });
        }
    }

    console.log(`[Room ${roomCode}] Revealing Answer for Question ${questionIndex + 1}. Correct is: ${q.correctAnswer}`);

    // Emit result to everyone in room
    io.to(roomCode).emit('question-result', {
        questionIndex,
        correctAnswer: q.correctAnswer,
        leaderboard: getLeaderboard(room)
    });

    // 1.5 seconds intermission before next question
    room.timer = setTimeout(() => {
        if (questionIndex + 1 < room.questions.length) {
            broadcastQuestion(roomCode, questionIndex + 1);
        } else {
            finishQuiz(roomCode);
        }
    }, 1500);
}

// Complete the quiz, compute winners, award XP
async function finishQuiz(roomCode) {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.timer) {
        clearTimeout(room.timer);
        room.timer = null;
    }

    room.status = 'completed';

    console.log(`[Room ${roomCode}] Quiz finished. Calculating winners...`);

    const sortedParticipants = Array.from(room.participants.values()).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
        return a.timeSpent - b.timeSpent;
    });

    const xpRewards = [200, 150, 100]; // 1st, 2nd, 3rd place rewards
    const winners = [];

    for (let i = 0; i < Math.min(3, sortedParticipants.length); i++) {
        const p = sortedParticipants[i];
        winners.push({
            position: i + 1,
            user: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score,
            xpReward: xpRewards[i]
        });
    }

    // Persist to MongoDB
    try {
        const dbRoom = await QuizRoom.findOne({ roomCode });
        if (dbRoom) {
            dbRoom.status = 'completed';
            dbRoom.completedAt = new Date();
            dbRoom.winners = winners;

            // Update participants data in DB
            dbRoom.participants = sortedParticipants.map(p => ({
                user: p.userId,
                username: p.username,
                avatar: p.avatar,
                score: p.score,
                streak: p.streak,
                correctAnswers: p.correctAnswers,
                timeSpent: p.timeSpent,
                answers: p.answers
            }));

            await dbRoom.save();

            // Award XP to users in database
            for (const p of sortedParticipants) {
                if (p.userId) {
                    const user = await User.findById(p.userId);
                    if (user) {
                        const winner = winners.find(w => w.user === p.userId);
                        const xpGain = winner ? winner.xpReward : 50; // 50 XP participation reward
                        user.updateXP(xpGain);
                        await user.save();
                    }
                }
            }
        }
    } catch (err) {
        console.error(`Error saving completed quiz room ${roomCode}:`, err);
    }

    // Emit final results to everyone in room
    io.to(roomCode).emit('quiz-finished', {
        winners,
        results: sortedParticipants.map((p, idx) => ({
            position: idx + 1,
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score,
            correctAnswers: p.correctAnswers,
            totalQuestions: room.questions.length,
            timeSpent: p.timeSpent
        }))
    });

    // Keep room in memory for 10 minutes then cleanup
    setTimeout(() => {
        activeRooms.delete(roomCode);
    }, 600000);
}

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join room
    socket.on('join-room', async (data) => {
        try {
            const roomCode = (typeof data === 'string' ? data : (data.roomCode || '')).trim().toUpperCase();
            const user = (typeof data === 'object' && data.user) ? data.user : null;

            if (!roomCode) return;

            socket.join(roomCode);

            const room = await getOrCreateActiveRoom(roomCode);
            if (!room) {
                socket.emit('error-message', { message: 'Room not found' });
                return;
            }

            const userId = user ? (user.id || user._id || socket.id) : socket.id;
            const username = user ? user.username : `Player_${socket.id.substring(0, 4)}`;
            const avatar = user ? user.avatar : '🦸';

            socketMap.set(socket.id, { roomCode, userId, username });

            // Add or update participant
            let participant = room.participants.get(userId.toString());
            if (participant) {
                participant.socketId = socket.id;
                participant.isConnected = true;
                if (username) participant.username = username;
                if (avatar) participant.avatar = avatar;
            } else {
                participant = {
                    userId: userId.toString(),
                    username,
                    avatar,
                    socketId: socket.id,
                    isConnected: true,
                    score: 0,
                    streak: 0,
                    correctAnswers: 0,
                    timeSpent: 0,
                    answers: []
                };
                room.participants.set(userId.toString(), participant);

                // Sync to MongoDB if not present
                QuizRoom.findOne({ roomCode }).then(async (dbRoom) => {
                    if (dbRoom && !dbRoom.participants.some(p => p.user && p.user.toString() === userId.toString())) {
                        dbRoom.participants.push({
                            user: userId,
                            username,
                            avatar,
                            isConnected: true
                        });
                        await dbRoom.save();
                    }
                }).catch(err => console.error('Error syncing participant to DB:', err));
            }

            console.log(`👤 User "${username}" (${userId}) joined room "${roomCode}". Total: ${room.participants.size}`);

            // Broadcast room update to everyone in room
            io.to(roomCode).emit('room-update', {
                roomCode,
                status: room.status,
                participantCount: room.participants.size,
                participants: Array.from(room.participants.values()).map(p => ({
                    userId: p.userId,
                    username: p.username,
                    avatar: p.avatar,
                    score: p.score,
                    isConnected: p.isConnected
                }))
            });

            // Reconnection handling: if game is currently active, synchronize this socket immediately
            if (room.status === 'active' || room.status === 'showing-answer') {
                const currentQ = room.questions[room.currentQuestionIndex];
                const elapsed = (Date.now() - room.questionStartTime) / 1000;
                const remaining = Math.max(0, Math.ceil(room.settings.timePerQuestion - elapsed));
                const userAns = room.currentAnswers.get(userId.toString()) || null;

                socket.emit('game-sync', {
                    status: room.status,
                    questionIndex: room.currentQuestionIndex,
                    totalQuestions: room.questions.length,
                    question: {
                        question: currentQ.question,
                        options: currentQ.options,
                        hint: currentQ.hint || ''
                    },
                    timeRemaining: remaining,
                    timePerQuestion: room.settings.timePerQuestion,
                    hasAnswered: !!userAns,
                    userAnswer: userAns,
                    correctAnswer: room.status === 'showing-answer' ? currentQ.correctAnswer : undefined,
                    leaderboard: getLeaderboard(room)
                });
            } else if (room.status === 'completed') {
                socket.emit('quiz-finished', {
                    winners: room.winners || [],
                    results: getLeaderboard(room)
                });
            }
        } catch (error) {
            console.error('Error in join-room socket handler:', error);
        }
    });

    // Start quiz (triggered by host)
    socket.on('start-quiz', async (data) => {
        try {
            const roomCode = (typeof data === 'string' ? data : (data.roomCode || '')).trim().toUpperCase();
            const room = await getOrCreateActiveRoom(roomCode);

            if (!room) return;

            console.log(`🚀 Host started quiz in room "${roomCode}"`);

            // Start countdown (3, 2, 1)
            let countdown = 3;
            io.to(roomCode).emit('quiz-countdown', { count: countdown });

            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    io.to(roomCode).emit('quiz-countdown', { count: countdown });
                } else {
                    clearInterval(countdownInterval);
                    io.to(roomCode).emit('quiz-started');

                    // Broadcast Question 0
                    broadcastQuestion(roomCode, 0);
                }
            }, 1000);

            // Update status in MongoDB
            QuizRoom.updateOne({ roomCode }, { status: 'active', startedAt: new Date(), currentQuestion: 0 }).catch(console.error);
        } catch (error) {
            console.error('Error starting quiz:', error);
        }
    });

    // Authoritative Answer Submission
    socket.on('submit-answer', (data) => {
        try {
            const { roomCode, questionIndex, selectedAnswer, timeSpent } = data;
            const code = (roomCode || '').trim().toUpperCase();
            const room = activeRooms.get(code);

            if (!room || room.status !== 'active') {
                return;
            }

            if (questionIndex !== room.currentQuestionIndex) {
                console.log(`Answer rejected: Question mismatch (${questionIndex} vs current ${room.currentQuestionIndex})`);
                return;
            }

            const socketInfo = socketMap.get(socket.id);
            const userId = socketInfo ? socketInfo.userId : null;
            if (!userId) return;

            // Prevent duplicate answer submission
            if (room.currentAnswers.has(userId.toString())) {
                console.log(`User ${userId} already submitted answer for Question ${questionIndex}`);
                return;
            }

            const participant = room.participants.get(userId.toString());
            if (!participant) return;

            participant.isConnected = true;
            participant.socketId = socket.id;

            const currentQ = room.questions[room.currentQuestionIndex];
            const isCorrect = (selectedAnswer === currentQ.correctAnswer);

            // Authoritative server-side time calculation
            const serverElapsed = Math.min(room.settings.timePerQuestion, Math.max(0.5, (Date.now() - room.questionStartTime) / 1000));
            const actualTime = (timeSpent && timeSpent > 0) ? Math.min(serverElapsed, timeSpent) : serverElapsed;

            // Score calculation: base 100 + speed bonus up to 50 + streak bonus up to 50
            let points = 0;
            let speedBonus = 0;
            let streakBonus = 0;

            if (isCorrect) {
                const timeRemaining = Math.max(0, room.settings.timePerQuestion - actualTime);
                speedBonus = Math.round((timeRemaining / room.settings.timePerQuestion) * 50);
                participant.streak = (participant.streak || 0) + 1;
                streakBonus = participant.streak > 1 ? Math.min(participant.streak * 10, 50) : 0;
                points = 100 + speedBonus + streakBonus;
                participant.correctAnswers = (participant.correctAnswers || 0) + 1;
            } else {
                participant.streak = 0;
            }

            participant.score = (participant.score || 0) + points;
            participant.timeSpent = (participant.timeSpent || 0) + Math.round(actualTime);
            participant.answers.push({
                questionIndex,
                selectedAnswer,
                isCorrect,
                points,
                timeSpent: actualTime,
                answeredAt: new Date()
            });

            // Store in current answers
            room.currentAnswers.set(userId.toString(), {
                selectedAnswer,
                isCorrect,
                points,
                speedBonus,
                streakBonus,
                streak: participant.streak
            });

            console.log(`[Room ${code}] Answer by "${participant.username}": option ${selectedAnswer} (${isCorrect ? 'CORRECT' : 'WRONG'}, +${points} pts, streak: ${participant.streak})`);

            // 1. Send private feedback to this submitter
            socket.emit('answer-feedback', {
                questionIndex,
                selectedAnswer,
                isCorrect,
                points,
                speedBonus,
                streakBonus,
                streak: participant.streak,
                correctAnswer: currentQ.correctAnswer
            });

            // 2. Broadcast updated leaderboard and answer count to room
            io.to(code).emit('leaderboard-update', {
                leaderboard: getLeaderboard(room),
                answeredCount: room.currentAnswers.size,
                totalParticipants: room.participants.size,
                lastAnsweredUser: participant.username
            });

            // 3. Immediately stop timer and advance early when all active participants answered
            const connectedSockets = io.sockets.adapter.rooms.get(code);
            const connectedCount = connectedSockets ? connectedSockets.size : 1;
            const activeParticipants = Array.from(room.participants.values()).filter(p => p.isConnected || (connectedSockets && p.socketId && connectedSockets.has(p.socketId)));

            const allAnswered = activeParticipants.length > 0
                ? activeParticipants.every(p => room.currentAnswers.has(p.userId.toString()))
                : room.currentAnswers.size >= Math.min(room.participants.size, connectedCount);

            if (allAnswered) {
                console.log(`[Room ${code}] All participants answered Question ${questionIndex + 1}. Stopping timer and revealing...`);
                if (room.timer) {
                    clearTimeout(room.timer);
                    room.timer = null;
                }
                io.to(code).emit('timer-stopped');
                setTimeout(() => {
                    revealQuestionResult(code, questionIndex);
                }, 500);
            }
        } catch (error) {
            console.error('Error in submit-answer socket handler:', error);
        }
    });

    // Host stops quiz
    socket.on('stop-quiz', (data) => {
        try {
            const roomCode = (typeof data === 'string' ? data : (data.roomCode || '')).trim().toUpperCase();
            const room = activeRooms.get(roomCode);
            if (room) {
                if (room.timer) clearTimeout(room.timer);
                activeRooms.delete(roomCode);
            }
            QuizRoom.updateOne({ roomCode }, { status: 'completed' }).catch(console.error);
            io.to(roomCode).emit('quiz-stopped', { message: 'Quiz was stopped by the host.' });
        } catch (error) {
            console.error('Error stopping quiz:', error);
        }
    });

    // Host ends waiting room
    socket.on('end-room', (data) => {
        try {
            const roomCode = (typeof data === 'string' ? data : (data.roomCode || '')).trim().toUpperCase();
            activeRooms.delete(roomCode);
            QuizRoom.deleteOne({ roomCode, status: 'waiting' }).catch(console.error);
            io.to(roomCode).emit('room-ended', { message: 'Room was closed by the host.' });
        } catch (error) {
            console.error('Error ending room:', error);
        }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        const info = socketMap.get(socket.id);
        if (info) {
            const { roomCode, userId, username } = info;
            socketMap.delete(socket.id);

            const room = activeRooms.get(roomCode);
            if (room) {
                const participant = room.participants.get(userId.toString());
                if (participant && (participant.socketId === socket.id || !participant.socketId)) {
                    participant.isConnected = false;
                    console.log(`🔌 Player "${username}" disconnected from room "${roomCode}"`);

                    socket.to(roomCode).emit('participant-status-change', {
                        userId,
                        username,
                        isConnected: false
                    });

                    socket.to(roomCode).emit('leaderboard-update', {
                        leaderboard: getLeaderboard(room),
                        answeredCount: room.currentAnswers ? room.currentAnswers.size : 0,
                        totalParticipants: room.participants.size
                    });
                }
            }
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Server Error' 
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🎮 Authoritative Multiplayer Engine running on Socket.IO`);
});
