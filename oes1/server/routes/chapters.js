const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chapter = require('../models/Chapter');
const Question = require('../models/Question');
const User = require('../models/User');

// Get all chapters for a subject
router.get('/:subject', protect, async (req, res) => {
    try {
        const { subject } = req.params;
        const chapters = await Chapter.find({ subject }).sort({ chapterNumber: 1 });
        
        const user = await User.findById(req.user.id);
        const userProgress = user.chapterProgress.get(subject) || {
            completedChapters: [],
            currentChapter: 1,
            chapterScores: new Map()
        };

        const chaptersWithProgress = chapters.map(chapter => ({
            ...chapter.toObject(),
            isCompleted: userProgress.completedChapters.includes(chapter.chapterNumber),
            isUnlocked: chapter.chapterNumber === 1 || userProgress.completedChapters.includes(chapter.chapterNumber - 1),
            score: userProgress.chapterScores.get(chapter.chapterNumber.toString()) || 0
        }));

        res.json({
            success: true,
            chapters: chaptersWithProgress,
            currentChapter: userProgress.currentChapter
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching chapters' });
    }
});

// Get questions for a specific chapter
router.get('/:subject/:chapterNumber/questions', protect, async (req, res) => {
    try {
        const { subject, chapterNumber } = req.params;
        const chapter = await Chapter.findOne({ subject, chapterNumber: parseInt(chapterNumber) }).lean();
        
        if (!chapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }

        const questions = await Question.find({ 
            subject, 
            chapter: parseInt(chapterNumber) 
        }).select('_id question options correctAnswer hint xpValue').limit(chapter.totalQuestions).lean();

        res.json({
            success: true,
            chapter: chapter,
            questions: questions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching chapter questions' });
    }
});

// Complete a chapter
router.post('/complete', protect, async (req, res) => {
    try {
        const { subject, chapterNumber, score, correctAnswers, totalQuestions } = req.body;
        const user = await User.findById(req.user.id);
        
        const chapter = await Chapter.findOne({ subject, chapterNumber });
        if (!chapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }

        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = accuracy >= chapter.passingScore;

        // Update chapter progress
        let subjectProgress = user.chapterProgress.get(subject) || {
            completedChapters: [],
            currentChapter: 1,
            chapterScores: new Map()
        };

        // Update score
        subjectProgress.chapterScores.set(chapterNumber.toString(), accuracy);

        // Mark as completed if passed and not already completed
        if (passed && !subjectProgress.completedChapters.includes(chapterNumber)) {
            subjectProgress.completedChapters.push(chapterNumber);
            subjectProgress.currentChapter = Math.max(subjectProgress.currentChapter, chapterNumber + 1);
        }

        user.chapterProgress.set(subject, subjectProgress);

        // Award XP based on chapter difficulty
        const xpMultiplier = { beginner: 20, intermediate: 35, advanced: 50 };
        const xpEarned = Math.round((accuracy / 100) * xpMultiplier[chapter.difficulty]);
        
        const levelResult = user.updateXP(xpEarned);
        await user.save();

        res.json({
            success: true,
            passed,
            accuracy,
            xpEarned,
            leveledUp: levelResult.leveledUp,
            newLevel: levelResult.newLevel,
            nextChapterUnlocked: passed
        });
    } catch (error) {
        console.error('Chapter complete error:', error);
        res.status(500).json({ success: false, message: 'Error completing chapter' });
    }
});

// Get user's progress for a subject
router.get('/progress/:subject', protect, async (req, res) => {
    try {
        const { subject } = req.params;
        const user = await User.findById(req.user.id);
        
        const progress = user.chapterProgress.get(subject) || {
            completedChapters: [],
            currentChapter: 1,
            chapterScores: new Map()
        };

        const totalChapters = await Chapter.countDocuments({ subject });
        const completionPercentage = Math.round((progress.completedChapters.length / totalChapters) * 100);

        res.json({
            success: true,
            progress: {
                ...progress,
                totalChapters,
                completionPercentage,
                chapterScores: Object.fromEntries(progress.chapterScores)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching progress' });
    }
});

module.exports = router;