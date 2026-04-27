const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        enum: ['java', 'cpp', 'python', 'javascript', 'data-structures', 'algorithms', 'react', 'node', 'sql']
    },
    chapterNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    estimatedTime: {
        type: Number,
        default: 15 // minutes
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    prerequisites: [{
        type: Number // chapter numbers that must be completed first
    }],
    unlockCondition: {
        type: String,
        default: 'complete_previous' // or 'always_available'
    },
    totalQuestions: {
        type: Number,
        default: 10
    },
    passingScore: {
        type: Number,
        default: 70 // percentage
    }
}, {
    timestamps: true
});

ChapterSchema.index({ subject: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', ChapterSchema);