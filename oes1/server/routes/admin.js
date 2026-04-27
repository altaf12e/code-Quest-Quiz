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