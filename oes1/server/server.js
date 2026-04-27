const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const QuizRoom = require('./models/QuizRoom');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://localhost:8080'],
        credentials: true
    }
});

connectDB();

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/quiz-room', require('./routes/quizRoom'));
app.use('/api/quiz-room', require('./routes/quizRoom'));

app.get('/', (req, res) => {
    res.json({ message: 'CodeQuest API is running' });
});

// Socket.io for real-time multiplayer
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', async (roomCode) => {
        socket.join(roomCode);
        const room = await QuizRoom.findOne({ roomCode });
        if (room) {
            socket.to(roomCode).emit('participant-joined', {
                participantCount: room.participants.length
            });
        }
    });

    // Start quiz
    socket.on('start-quiz', (roomCode) => {
        io.to(roomCode).emit('quiz-started');
    });

    // Next question
    socket.on('next-question', (data) => {
        io.to(data.roomCode).emit('question-update', {
            questionIndex: data.questionIndex,
            question: data.question
        });
    });

    // Answer submitted
    socket.on('answer-submitted', (data) => {
        socket.to(data.roomCode).emit('participant-answered', {
            username: data.username,
            score: data.score
        });
    });

    // Quiz completed
    socket.on('quiz-completed', (data) => {
        io.to(data.roomCode).emit('quiz-finished', {
            winners: data.winners,
            results: data.results
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
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
    console.log(`🎮 Multiplayer support enabled`);
});
