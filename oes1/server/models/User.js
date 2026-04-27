const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    avatar: {
        type: String,
        default: '🦸'
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 999
    },

    lastActive: {
        type: Date,
        default: Date.now
    },
    questHistory: [{
        subject: String,
        difficulty: String,
        subLevel: String,
        score: Number,
        xpEarned: Number,
        accuracy: Number,
        totalQuestions: { type: Number, default: 10 },
        correctAnswers: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 300 },
        sectionPerformance: {
            type: Map,
            of: {
                correct: Number,
                total: Number
            },
            default: {}
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    dailyQuests: [{
        id: String,
        description: String,
        type: String, // 'questions', 'accuracy', 'streak', 'subject', 'difficulty'
        target: Number,
        completed: {
            type: Number,
            default: 0
        },
        reward: Number,
        isCompleted: {
            type: Boolean,
            default: false
        },
        subject: String, // for subject-specific quests
        difficulty: String // for difficulty-specific quests
    }],
    lastQuestReset: {
        type: Date,
        default: Date.now
    },
    achievements: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        unlockedAt: {
            type: Date,
            default: Date.now
        }
    }],
    stats: {
        totalQuestions: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        totalTimeSpent: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        favoriteSubject: { type: String, default: '' },
        weeklyXP: { type: Number, default: 0 },
        monthlyXP: { type: Number, default: 0 },
        lastWeekReset: { type: Date, default: Date.now },
        lastMonthReset: { type: Date, default: Date.now }
    },
    preferences: {
        theme: { type: String, default: 'dark' },
        soundEnabled: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true }
    },
    title: {
        type: String,
        default: 'Code Apprentice'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    chapterProgress: {
        type: Map,
        of: {
            completedChapters: [Number],
            currentChapter: { type: Number, default: 1 },
            chapterScores: {
                type: Map,
                of: Number
            }
        },
        default: {}
    },
    unlockedLevels: {
        type: Map,
        of: [String], // Array of unlocked sub-levels for each difficulty
        default: function() {
            return new Map([
                ['easy', ['I']],
                ['medium', []],
                ['hard', []],
                ['marathon', []]
            ]);
        }
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.updateXP = function(xpGained) {
    this.xp += xpGained;
    this.stats.weeklyXP += xpGained;
    this.stats.monthlyXP += xpGained;
    
    const newLevel = this.calculateLevel(this.xp);
    const leveledUp = newLevel > this.level;
    this.level = newLevel;
    
    // Update title based on level
    this.updateTitle();
    
    return { leveledUp, newLevel };
};

UserSchema.methods.calculateLevel = function(xp) {
    let level = 1;
    let totalXPUsed = 0;
    
    while (true) {
        const xpForThisLevel = level * 150 + (level - 1) * 50;
        if (totalXPUsed + xpForThisLevel > xp) break;
        totalXPUsed += xpForThisLevel;
        level++;
    }
    
    return level;
};

UserSchema.methods.getXPForNextLevel = function() {
    return this.level * 150 + (this.level - 1) * 50;
};

UserSchema.methods.getCurrentLevelXP = function() {
    let totalXPUsed = 0;
    for (let i = 1; i < this.level; i++) {
        totalXPUsed += i * 150 + (i - 1) * 50;
    }
    return this.xp - totalXPUsed;
};

UserSchema.methods.updateTitle = function() {
    const titles = {
        1: 'Code Apprentice',
        3: 'Junior Developer', 
        6: 'Code Warrior',
        10: 'Senior Developer',
        15: 'Code Master',
        20: 'Tech Lead',
        25: 'Code Architect',
        35: 'Programming Sage',
        50: 'Code Legend'
    };
    
    const titleLevels = Object.keys(titles).map(Number).sort((a, b) => b - a);
    for (const level of titleLevels) {
        if (this.level >= level) {
            this.title = titles[level];
            break;
        }
    }
};

UserSchema.methods.addAchievement = function(achievementData) {
    const exists = this.achievements.find(a => a.id === achievementData.id);
    if (!exists) {
        this.achievements.push(achievementData);
        return true;
    }
    return false;
};

UserSchema.methods.updateStats = function(questionData) {
    this.stats.totalQuestions += 1;
    if (questionData.correct) {
        this.stats.correctAnswers += 1;
    }
    if (questionData.timeSpent) {
        this.stats.totalTimeSpent += questionData.timeSpent;
    }
    if (this.streak > this.stats.longestStreak) {
        this.stats.longestStreak = this.streak;
    }
};

UserSchema.methods.generateDailyQuests = function() {
    const questTemplates = [
        { type: 'questions', description: 'Answer {target} questions correctly', target: [5, 8, 10], reward: [100, 150, 200] },
        { type: 'accuracy', description: 'Achieve {target}% accuracy in any exam', target: [80, 90, 95], reward: [150, 200, 300] },
        { type: 'streak', description: 'Get {target} correct answers in a row', target: [3, 5, 7], reward: [100, 150, 250] },
        { type: 'subject', description: 'Complete {target} {subject} questions', target: [3, 5], reward: [120, 180], subjects: ['Java', 'Python', 'JavaScript', 'C++'] },
        { type: 'difficulty', description: 'Complete {target} {difficulty} questions', target: [2, 3, 4], reward: [100, 150, 200], difficulties: ['Easy', 'Medium', 'Hard'] },
        { type: 'exam', description: 'Complete {target} full exams', target: [1, 2, 3], reward: [200, 300, 500] }
    ];
    
    const quests = [];
    const questCount = 4; // Generate 4 daily quests
    const usedTypes = new Set();
    
    for (let i = 0; i < questCount; i++) {
        let template;
        let attempts = 0;
        
        // Ensure variety by not repeating quest types
        do {
            template = questTemplates[Math.floor(Math.random() * questTemplates.length)];
            attempts++;
        } while (usedTypes.has(template.type) && attempts < 10);
        
        usedTypes.add(template.type);
        
        const targetIndex = Math.floor(Math.random() * template.target.length);
        const target = template.target[targetIndex];
        const reward = template.reward[targetIndex];
        
        let description = template.description.replace('{target}', target);
        let subject = null;
        let difficulty = null;
        
        if (template.type === 'subject') {
            subject = template.subjects[Math.floor(Math.random() * template.subjects.length)];
            description = description.replace('{subject}', subject);
        }
        
        if (template.type === 'difficulty') {
            difficulty = template.difficulties[Math.floor(Math.random() * template.difficulties.length)];
            description = description.replace('{difficulty}', difficulty);
        }
        
        quests.push({
            id: `quest_${Date.now()}_${i}`,
            description,
            type: template.type,
            target,
            completed: 0,
            reward,
            isCompleted: false,
            subject: subject ? subject.toLowerCase() : null,
            difficulty: difficulty ? difficulty.toLowerCase() : null
        });
    }
    
    this.dailyQuests = quests;
    this.lastQuestReset = new Date();
};

UserSchema.methods.updateQuestProgress = function(questData) {
    const { type, subject, difficulty, accuracy, correctAnswers, examCompleted } = questData;
    let questsUpdated = false;
    
    // Initialize dailyQuests if it doesn't exist
    if (!this.dailyQuests) {
        this.dailyQuests = [];
        return questsUpdated;
    }
    
    this.dailyQuests.forEach(quest => {
        if (quest.isCompleted) return;
        
        let shouldUpdate = false;
        let increment = 0;
        
        switch (quest.type) {
            case 'questions':
                if (correctAnswers > 0) {
                    increment = correctAnswers;
                    shouldUpdate = true;
                }
                break;
            case 'accuracy':
                if (accuracy >= quest.target) {
                    quest.completed = quest.target;
                    quest.isCompleted = true;
                    shouldUpdate = true;
                }
                break;
            case 'streak':
                // This would be handled separately in exam logic
                break;
            case 'subject':
                if (subject === quest.subject && correctAnswers > 0) {
                    increment = correctAnswers;
                    shouldUpdate = true;
                }
                break;
            case 'difficulty':
                if (difficulty === quest.difficulty && correctAnswers > 0) {
                    increment = correctAnswers;
                    shouldUpdate = true;
                }
                break;
            case 'exam':
                if (examCompleted) {
                    increment = 1;
                    shouldUpdate = true;
                }
                break;
        }
        
        if (shouldUpdate && increment > 0) {
            quest.completed = Math.min(quest.completed + increment, quest.target);
            if (quest.completed >= quest.target) {
                quest.isCompleted = true;
                this.xp += quest.reward;
                questsUpdated = true;
            }
        }
    });
    
    return questsUpdated;
};

UserSchema.methods.checkDailyQuestReset = function() {
    const now = new Date();
    
    // Initialize if fields don't exist
    if (!this.dailyQuests) {
        this.dailyQuests = [];
    }
    if (!this.lastQuestReset) {
        this.lastQuestReset = new Date();
    }
    
    const lastReset = new Date(this.lastQuestReset);
    
    // Check if it's a new day (reset at midnight)
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
        this.generateDailyQuests();
        return true;
    }
    
    // Generate quests if none exist
    if (this.dailyQuests.length === 0) {
        this.generateDailyQuests();
        return true;
    }
    
    return false;
};

module.exports = mongoose.model('User', UserSchema);
