const mongoose = require('mongoose');

const QuizRoomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    title: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settings: {
        subject: {
            type: String,
            required: true,
            enum: ['java', 'cpp', 'python', 'javascript', 'data-structures', 'algorithms']
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['easy', 'medium', 'hard']
        },
        questionCount: {
            type: Number,
            required: true,
            min: 5,
            max: 30
        },
        timePerQuestion: {
            type: Number,
            default: 30 // seconds
        },
        hostParticipates: {
            type: Boolean,
            default: true
        }
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        avatar: String,
        joinedAt: {
            type: Date,
            default: Date.now
        },
        score: {
            type: Number,
            default: 0
        },
        correctAnswers: {
            type: Number,
            default: 0
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        answers: [{
            questionIndex: Number,
            selectedAnswer: Number,
            isCorrect: Boolean,
            timeSpent: Number,
            answeredAt: Date
        }]
    }],
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        hint: String
    }],
    currentQuestion: {
        type: Number,
        default: 0
    },
    startedAt: Date,
    completedAt: Date,
    winners: [{
        position: Number,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        score: Number,
        xpReward: Number
    }]
}, {
    timestamps: true
});

QuizRoomSchema.methods.generateRoomCode = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

QuizRoomSchema.methods.calculateWinners = function() {
    const sortedParticipants = this.participants
        .filter(p => p.answers.length > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
            return a.timeSpent - b.timeSpent;
        });

    const winners = [];
    const xpRewards = [200, 150, 100]; // 1st, 2nd, 3rd place rewards

    for (let i = 0; i < Math.min(3, sortedParticipants.length); i++) {
        const participant = sortedParticipants[i];
        winners.push({
            position: i + 1,
            user: participant.user,
            username: participant.username,
            score: participant.score,
            xpReward: xpRewards[i]
        });
    }

    this.winners = winners;
    return winners;
};

module.exports = mongoose.model('QuizRoom', QuizRoomSchema);