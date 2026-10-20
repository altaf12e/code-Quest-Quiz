const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

// Admin permission middleware
const adminOnly = (req, res, next) => {
    if (!req.user.isAdmin && req.user.username !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Get all users (super optimized)
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
            .select('username email level xp isAdmin')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        
        // Clean avatars and ensure proper data
        const cleanUsers = users.map(user => ({
            _id: user._id,
            username: user.username || 'Unknown',
            email: user.email || 'No email',
            avatar: '👤',
            level: user.level || 1,
            xp: user.xp || 0,
            isAdmin: user.isAdmin || false
        }));
        
        res.json({ success: true, users: cleanUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user
router.delete('/user/:id', protect, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all questions with pagination
router.get('/questions', protect, adminOnly, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        
        const total = await Question.countDocuments();
        const questions = await Question.find()
            .select('_id subject difficulty subLevel question xpValue')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
            
        res.json({ 
            success: true, 
            questions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Admin questions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete question
router.delete('/question/:id', protect, adminOnly, async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper to normalize question object
function normalizeQuestionPayload(q) {
    let subject = (q.subject || '').toLowerCase().trim();
    if (subject === 'nodejs') subject = 'node';
    if (subject === 'data structures') subject = 'data-structures';

    const difficulty = (q.difficulty || 'easy').toLowerCase().trim();
    const correctAns = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;

    return {
        subject,
        difficulty,
        subLevel: q.subLevel || 'I',
        section: q.section || 'fundamentals',
        chapter: q.chapter || (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3),
        question: (q.question || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
        correctAnswer: Number(correctAns),
        hint: (q.hint || 'Think carefully about concepts.').trim(),
        xpValue: Number(q.xpValue) || (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 50)
    };
}

// Add single question
router.post('/question', protect, adminOnly, async (req, res) => {
    try {
        const payload = normalizeQuestionPayload(req.body);
        
        if (!payload.subject || !payload.question) {
            return res.status(400).json({ success: false, message: 'Subject and Question text are required' });
        }
        if (!payload.options || payload.options.length !== 4) {
            return res.status(400).json({ success: false, message: 'Question must have exactly 4 options' });
        }
        if (isNaN(payload.correctAnswer) || payload.correctAnswer < 0 || payload.correctAnswer > 3) {
            return res.status(400).json({ success: false, message: 'Correct answer index must be 0, 1, 2, or 3' });
        }

        const newQuestion = await Question.create(payload);
        res.json({ 
            success: true, 
            message: 'Question added successfully', 
            question: newQuestion 
        });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bulk add multiple questions
router.post('/questions/bulk', protect, adminOnly, async (req, res) => {
    try {
        const { questions } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'A non-empty questions array is required' });
        }

        const normalizedQuestions = [];
        for (let i = 0; i < questions.length; i++) {
            const raw = questions[i];
            const q = normalizeQuestionPayload(raw);

            if (!q.subject || !q.question) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Question at item #${i + 1} is missing subject or question text` 
                });
            }
            if (!q.options || q.options.length !== 4) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Question at item #${i + 1} ("${q.question.substring(0, 30)}...") must have exactly 4 options` 
                });
            }
            if (isNaN(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Question at item #${i + 1} has an invalid correctAnswer (must be 0, 1, 2, or 3)` 
                });
            }

            normalizedQuestions.push(q);
        }

        const inserted = await Question.insertMany(normalizedQuestions, { ordered: false });
        res.json({ 
            success: true, 
            count: inserted.length, 
            message: `Successfully added ${inserted.length} questions!` 
        });
    } catch (error) {
        console.error('Error bulk adding questions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle admin status
router.put('/user/:id/admin', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.isAdmin = !user.isAdmin;
        await user.save();
        
        res.json({ 
            success: true, 
            message: `User ${user.isAdmin ? 'promoted to' : 'demoted from'} admin`,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;