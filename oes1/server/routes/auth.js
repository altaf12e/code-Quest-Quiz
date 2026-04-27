const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const expire = process.env.JWT_EXPIRE || '7d';
    return jwt.sign({ id }, secret, { expiresIn: expire });
};

router.post('/signup', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        console.log('🔐 Signup attempt:', req.body.username);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { username, email, password, avatar } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            const message = userExists.email === email ? 'Email already exists' : 'Username already exists';
            console.log('❌ User exists:', message);
            return res.status(400).json({ 
                success: false, 
                message
            });
        }

        console.log('✅ Creating new user...');
        const user = await User.create({
            username,
            email,
            password,
            avatar: avatar || '🦸'
        });

        // Generate daily quests safely
        try {
            user.generateDailyQuests();
            await user.save();
        } catch (error) {
            console.error('Error generating daily quests:', error);
            user.dailyQuests = [];
            await user.save();
        }

        const token = generateToken(user._id);

        // Safely get level progress
        let levelProgress = { currentLevelXP: 0, xpForNextLevel: 100 };
        try {
            levelProgress = {
                currentLevelXP: user.getCurrentLevelXP() || 0,
                xpForNextLevel: user.getXPForNextLevel() || 100
            };
        } catch (error) {
            console.error('Error calculating level progress:', error);
        }

        console.log('✅ Signup successful for:', username);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                level: user.level || 1,
                xp: user.xp || 0,
                streak: user.streak || 0,
                rank: user.rank || 999,
                title: user.title || 'Code Apprentice',
                questHistory: user.questHistory || [],
                stats: user.stats || {},
                dailyQuests: user.dailyQuests || [],
                achievements: user.achievements || [],
                preferences: user.preferences || { theme: 'dark', soundEnabled: true, notifications: true },
                isAdmin: user.isAdmin || false,
                levelProgress
            }
        });
    } catch (error) {
        console.error('💥 Signup Error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
            return res.status(400).json({
                success: false,
                message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during signup. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        console.log('🔐 Login attempt for:', req.body.username);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user
        console.log('🔍 Looking for user:', username);
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            console.log('❌ User not found:', username);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ User found:', user.username, 'ID:', user._id);
        console.log('🔑 Verifying password...');
        
        // Check password
        const isMatch = await user.matchPassword(password);
        console.log('🔍 Password match result:', isMatch);
        if (!isMatch) {
            console.log('❌ Password mismatch for user:', username);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ Password verified, preparing response...');

        // Update last active
        user.lastActive = Date.now();

        // Initialize missing fields safely
        if (!user.dailyQuests) user.dailyQuests = [];
        if (!user.questHistory) user.questHistory = [];
        if (!user.achievements) user.achievements = [];
        if (!user.stats) user.stats = {};
        if (!user.preferences) user.preferences = { theme: 'dark', soundEnabled: true, notifications: true };

        await user.save();

        const token = generateToken(user._id);

        console.log('✅ Login successful for:', username);

        // Safely get level progress
        let levelProgress = { currentLevelXP: 0, xpForNextLevel: 100 };
        try {
            levelProgress = {
                currentLevelXP: user.getCurrentLevelXP() || 0,
                xpForNextLevel: user.getXPForNextLevel() || 100
            };
        } catch (error) {
            console.error('Error calculating level progress:', error);
        }
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || '🦸',
                level: user.level || 1,
                xp: user.xp || 0,
                streak: user.streak || 0,
                rank: user.rank || 999,
                title: user.title || 'Code Apprentice',
                questHistory: user.questHistory || [],
                stats: user.stats || {},
                dailyQuests: user.dailyQuests || [],
                achievements: user.achievements || [],
                preferences: user.preferences || { theme: 'dark', soundEnabled: true, notifications: true },
                isAdmin: user.isAdmin || (user.username === 'admin'),
                levelProgress
            }
        });
    } catch (error) {
        console.error('💥 Login Error:', {
            message: error.message,
            stack: error.stack,
            username: req.body?.username
        });
        
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email address' });
        }

        // In a real app, you would:
        // 1. Generate a reset token
        // 2. Save it to the user record with expiration
        // 3. Send email with reset link
        // For demo purposes, we'll just confirm the email exists
        
        res.json({
            success: true,
            message: 'Password reset instructions have been sent to your email address'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Test route to create a user for debugging
router.post('/create-test-user', async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: 'sameer' });
        if (existingUser) {
            return res.json({ success: true, message: 'Test user already exists' });
        }
        
        // Create test user
        const user = await User.create({
            username: 'sameer',
            email: 'sameer@test.com',
            password: '123456',
            avatar: '🦸'
        });
        
        res.json({ success: true, message: 'Test user created successfully', userId: user._id });
    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create admin user
router.post('/create-admin', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            return res.json({ success: true, message: 'Admin user already exists' });
        }
        
        // Create admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@codequest.com',
            password: 'admin123',
            avatar: '👑',
            isAdmin: true,
            level: 50,
            xp: 10000,
            title: 'Code Legend'
        });
        
        res.json({ 
            success: true, 
            message: 'Admin user created successfully',
            credentials: {
                username: 'admin',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
