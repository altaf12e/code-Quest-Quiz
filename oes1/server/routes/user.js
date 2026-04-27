const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check and reset daily quests if needed
        const questsReset = user.checkDailyQuestReset();
        
        // Generate quests if none exist (for existing users)
        if (!user.dailyQuests || user.dailyQuests.length === 0) {
            user.generateDailyQuests();
        }
        
        await user.save();
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                level: user.level,
                xp: user.xp,
                streak: user.streak,
                rank: user.rank,
                title: user.title,
                dailyQuests: user.dailyQuests,
                questHistory: user.questHistory,
                achievements: user.achievements,
                stats: user.stats,
                preferences: user.preferences,
                levelProgress: {
                    currentLevelXP: user.getCurrentLevelXP(),
                    xpForNextLevel: user.getXPForNextLevel()
                },
                unlockedLevels: user.unlockedLevels
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

function getNextDifficulty(current) {
    const order = ['easy', 'medium', 'hard', 'marathon'];
    const index = order.indexOf(current);
    return index < order.length - 1 ? order[index + 1] : null;
}

router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false })
            .sort({ xp: -1 })
            .limit(10)
            .select('username avatar level xp rank');

        users.forEach((user, index) => {
            user.rank = index + 1;
        });

        await Promise.all(users.map(user => user.save()));

        res.json({
            success: true,
            leaderboard: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
    }
});

router.put('/update-xp', protect, async (req, res) => {
    try {
        const { xpGained } = req.body;
        const user = await User.findById(req.user.id);

        const result = user.updateXP(xpGained);
        await user.save();

        res.json({
            success: true,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            user: {
                level: user.level,
                xp: user.xp
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating XP' });
    }
});

router.post('/quest-complete', protect, async (req, res) => {
    try {
        const { subject, difficulty, score, xpEarned, accuracy, totalQuestions, correctAnswers, timeSpent, sectionPerformance } = req.body;
        const user = await User.findById(req.user.id);

        user.questHistory.push({
            subject,
            difficulty,
            subLevel: req.body.subLevel,
            score: correctAnswers || score || 0,
            xpEarned,
            accuracy,
            totalQuestions: totalQuestions || 10,
            correctAnswers: correctAnswers || score || 0,
            timeSpent: timeSpent || 300,
            sectionPerformance: sectionPerformance || {},
            completedAt: new Date()
        });

        // Unlock next sub-level if passed with 70% or higher
        if (accuracy >= 70) {
            const subLevel = req.body.subLevel;
            const unlockedLevels = user.unlockedLevels.get(difficulty) || [];
            
            if (subLevel === 'I' && !unlockedLevels.includes('II')) {
                unlockedLevels.push('II');
                user.unlockedLevels.set(difficulty, unlockedLevels);
            } else if (subLevel === 'II' && !unlockedLevels.includes('III')) {
                unlockedLevels.push('III');
                user.unlockedLevels.set(difficulty, unlockedLevels);
            }
            
            // Unlock next difficulty's first level
            if (subLevel === 'III') {
                const nextDifficulty = getNextDifficulty(difficulty);
                if (nextDifficulty && !user.unlockedLevels.has(nextDifficulty)) {
                    user.unlockedLevels.set(nextDifficulty, ['I']);
                }
            }
        }

        // Update user stats properly
        if (!user.stats) {
            user.stats = {
                totalQuestions: 0,
                correctAnswers: 0,
                totalTimeSpent: 0,
                longestStreak: 0,
                favoriteSubject: '',
                weeklyXP: 0,
                monthlyXP: 0,
                lastWeekReset: new Date(),
                lastMonthReset: new Date()
            };
        }
        
        user.stats.totalQuestions += totalQuestions || 10;
        user.stats.correctAnswers += correctAnswers || score || 0;
        
        // Update longest streak
        if (user.streak > user.stats.longestStreak) {
            user.stats.longestStreak = user.streak;
        }

        // Update daily quest progress
        const questProgress = user.updateQuestProgress({
            type: 'exam',
            subject: subject,
            difficulty: difficulty,
            accuracy: accuracy,
            correctAnswers: correctAnswers || score || 0,
            examCompleted: true
        });

        const result = user.updateXP(xpEarned);
        await user.save();

        res.json({
            success: true,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                level: user.level,
                xp: user.xp,
                streak: user.streak,
                rank: user.rank,
                title: user.title,
                questHistory: user.questHistory,
                stats: user.stats,
                dailyQuests: user.dailyQuests,
                achievements: user.achievements,
                preferences: user.preferences,
                levelProgress: {
                    currentLevelXP: user.getCurrentLevelXP(),
                    xpForNextLevel: user.getXPForNextLevel()
                },
                unlockedLevels: user.unlockedLevels
            }
        });
    } catch (error) {
        console.error('Quest complete error:', error);
        res.status(500).json({ success: false, message: 'Error saving quest results' });
    }
});

router.put('/update-profile', protect, async (req, res) => {
    try {
        const { username, avatar, preferences } = req.body;
        const user = await User.findById(req.user.id);

        if (username && username !== user.username) {
            const userExists = await User.findOne({ username });
            if (userExists) {
                return res.status(400).json({ success: false, message: 'Username already taken' });
            }
            user.username = username;
        }

        if (avatar) {
            user.avatar = avatar;
        }

        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                level: user.level,
                xp: user.xp,
                streak: user.streak,
                rank: user.rank,
                title: user.title,
                isAdmin: user.isAdmin,
                dailyQuest: user.dailyQuest,
                questHistory: user.questHistory,
                achievements: user.achievements,
                stats: user.stats,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

router.get('/achievements', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const allAchievements = [
            { id: 'first_quest', name: 'First Quest', description: 'Complete your first quest', icon: '🎯', unlocked: user.questHistory.length > 0 },
            { id: 'streak_5', name: 'Hot Streak', description: 'Maintain a 5-day streak', icon: '🔥', unlocked: user.stats.longestStreak >= 5 },
            { id: 'level_10', name: 'Code Warrior', description: 'Reach level 10', icon: '⚔️', unlocked: user.level >= 10 },
            { id: 'perfect_score', name: 'Perfectionist', description: 'Get 100% on any quest', icon: '💯', unlocked: user.questHistory.some(e => e.accuracy === 100) },
            { id: 'java_master', name: 'Java Master', description: 'Complete 10 Java quests', icon: '☕', unlocked: user.questHistory.filter(e => e.subject === 'java').length >= 10 },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Answer 50 questions correctly', icon: '⚡', unlocked: user.stats.correctAnswers >= 50 },
            { id: 'dedicated', name: 'Dedicated Learner', description: 'Study for 5 hours total', icon: '📚', unlocked: user.stats.totalTimeSpent >= 18000 }
        ];
        
        res.json({ success: true, achievements: allAchievements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching achievements' });
    }
});

router.get('/stats', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const stats = {
            ...user.stats,
            accuracy: user.stats.totalQuestions > 0 ? Math.round((user.stats.correctAnswers / user.stats.totalQuestions) * 100) : 0,
            avgTimePerQuestion: user.stats.totalQuestions > 0 ? Math.round(user.stats.totalTimeSpent / user.stats.totalQuestions) : 0,
            totalQuests: user.questHistory.length,
            subjectBreakdown: getSubjectBreakdown(user.questHistory)
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

router.get('/exam-history', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log('User questHistory length:', user.questHistory.length);
        console.log('User questHistory:', user.questHistory);
        
        const examHistory = user.questHistory.map(exam => {
            const correctAnswers = exam.correctAnswers || exam.score || 0;
            const totalQuestions = exam.totalQuestions || 10;
            return {
                id: exam._id,
                subject: exam.subject,
                difficulty: exam.difficulty,
                subLevel: exam.subLevel,
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                accuracy: exam.accuracy,
                xpEarned: exam.xpEarned,
                timeSpent: exam.timeSpent || 300,
                date: exam.completedAt,
                sectionPerformance: exam.sectionPerformance || {
                    fundamentals: { correct: Math.floor(correctAnswers * 0.4), total: Math.floor(totalQuestions * 0.4) },
                    intermediate: { correct: Math.floor(correctAnswers * 0.3), total: Math.floor(totalQuestions * 0.3) },
                    advanced: { correct: Math.floor(correctAnswers * 0.3), total: Math.floor(totalQuestions * 0.3) }
                },
                grade: calculateGrade(exam.accuracy)
            };
        });
        
        res.json({ success: true, examHistory, count: examHistory.length });
    } catch (error) {
        console.error('Error fetching exam history:', error);
        res.status(500).json({ success: false, message: 'Error fetching exam history' });
    }
});

function calculateGrade(accuracy) {
    if (accuracy >= 95) return { letter: 'A+', class: 'excellent' };
    if (accuracy >= 90) return { letter: 'A', class: 'excellent' };
    if (accuracy >= 85) return { letter: 'A-', class: 'excellent' };
    if (accuracy >= 80) return { letter: 'B+', class: 'good' };
    if (accuracy >= 75) return { letter: 'B', class: 'good' };
    if (accuracy >= 70) return { letter: 'B-', class: 'good' };
    if (accuracy >= 65) return { letter: 'C+', class: 'average' };
    if (accuracy >= 60) return { letter: 'C', class: 'average' };
    return { letter: 'F', class: 'poor' };
}

function getSubjectBreakdown(questHistory) {
    const subjects = {};
    questHistory.forEach(quest => {
        if (!subjects[quest.subject]) {
            subjects[quest.subject] = { attempts: 0, totalAccuracy: 0, totalXP: 0 };
        }
        subjects[quest.subject].attempts++;
        subjects[quest.subject].totalAccuracy += quest.accuracy || 0;
        subjects[quest.subject].totalXP += quest.xpEarned || 0;
    });
    
    Object.keys(subjects).forEach(subject => {
        subjects[subject].avgAccuracy = Math.round(subjects[subject].totalAccuracy / subjects[subject].attempts);
    });
    
    return subjects;
}

module.exports = router;
