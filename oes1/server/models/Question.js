const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        enum: ['java', 'cpp', 'python', 'javascript', 'data-structures', 'algorithms', 'react', 'node', 'sql']
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard', 'marathon']
    },
    subLevel: {
        type: String,
        enum: ['I', 'II', 'III'],
        default: 'I'
    },
    chapter: {
        type: Number,
        default: null // null means it's for general quiz, number means specific chapter
    },
    section: {
        type: String,
        default: 'fundamentals',
        enum: ['fundamentals', 'intermediate', 'advanced', 'practical']
    },
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, 'Must have exactly 4 options']
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    hint: {
        type: String,
        required: true
    },
    xpValue: {
        type: Number,
        default: function() {
            const values = { easy: 10, medium: 25, hard: 50, marathon: 100 };
            return values[this.difficulty];
        }
    }
}, {
    timestamps: true
});

function arrayLimit(val) {
    return val.length === 4;
}

QuestionSchema.index({ subject: 1, difficulty: 1, subLevel: 1 });
QuestionSchema.index({ subject: 1, chapter: 1 });
QuestionSchema.index({ difficulty: 1, section: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
