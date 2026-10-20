const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');
const Chapter = require('./models/Chapter');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codequest';

const subjects = [
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'data-structures', name: 'Data Structures' },
    { id: 'algorithms', name: 'Algorithms' },
    { id: 'react', name: 'React' },
    { id: 'node', name: 'Node.js' },
    { id: 'sql', name: 'SQL' }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Folders containing question JSON files
        const dirs = [
            path.join(__dirname, '../questeasy'),
            path.join(__dirname, '../questmed'),
            path.join(__dirname, '../questhard')
        ];

        let allQuestions = [];

        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                console.warn(`⚠️ Directory not found: ${dir}`);
                continue;
            }

            const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(dir, file);
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const parsed = JSON.parse(content);

                    if (Array.isArray(parsed)) {
                        for (const q of parsed) {
                            const correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
                            if (correctAnswer !== undefined && Array.isArray(q.options) && q.options.length === 4) {
                                const chapterNum = q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3;
                                let subject = (q.subject || '').toLowerCase().trim();
                                if (subject === 'nodejs') subject = 'node';
                                if (subject === 'data structures') subject = 'data-structures';

                                allQuestions.push({
                                    subject: subject,
                                    difficulty: q.difficulty,
                                    subLevel: q.subLevel || 'I',
                                    section: q.section || 'fundamentals',
                                    chapter: chapterNum,
                                    question: q.question,
                                    options: q.options,
                                    correctAnswer: Number(correctAnswer),
                                    hint: q.hint || 'Think carefully about syntax and concepts.',
                                    xpValue: q.xpValue || (q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 25 : 50)
                                });
                            }
                        }
                    }
                } catch (parseErr) {
                    console.error(`❌ Error parsing ${filePath}:`, parseErr.message);
                }
            }
        }

        console.log(`📋 Found ${allQuestions.length} total questions to seed.`);

        // Clear existing questions and chapters
        await Question.deleteMany({});
        await Chapter.deleteMany({});
        console.log('🗑️  Cleared existing questions & chapters.');

        // Insert new questions
        const inserted = await Question.insertMany(allQuestions, { ordered: false });
        console.log(`✅ Added ${inserted.length} questions to database!`);

        // Seed Chapters for each subject
        const chaptersToSeed = [];
        for (const sub of subjects) {
            chaptersToSeed.push(
                {
                    subject: sub.id,
                    chapterNumber: 1,
                    title: `${sub.name} Fundamentals & Basics`,
                    description: `Learn the foundation, core syntax, and essential concepts of ${sub.name}.`,
                    estimatedTime: 15,
                    difficulty: 'beginner',
                    prerequisites: [],
                    unlockCondition: 'always_available',
                    totalQuestions: 10,
                    passingScore: 70
                },
                {
                    subject: sub.id,
                    chapterNumber: 2,
                    title: `${sub.name} Core & Control Flow`,
                    description: `Deepen your understanding with operations, logic, and standard patterns in ${sub.name}.`,
                    estimatedTime: 20,
                    difficulty: 'intermediate',
                    prerequisites: [1],
                    unlockCondition: 'complete_previous',
                    totalQuestions: 10,
                    passingScore: 70
                },
                {
                    subject: sub.id,
                    chapterNumber: 3,
                    title: `${sub.name} Advanced Techniques`,
                    description: `Master complex logic, optimization, and real-world challenges in ${sub.name}.`,
                    estimatedTime: 25,
                    difficulty: 'advanced',
                    prerequisites: [2],
                    unlockCondition: 'complete_previous',
                    totalQuestions: 10,
                    passingScore: 70
                }
            );
        }

        const insertedChapters = await Chapter.insertMany(chaptersToSeed);
        console.log(`✅ Added ${insertedChapters.length} chapters across all subjects!`);

        // Check and create default admin if not existing
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            await User.create({
                username: 'admin',
                email: 'admin@codequest.com',
                password: 'admin123',
                avatar: '👑',
                isAdmin: true,
                level: 50,
                xp: 10000,
                title: 'Code Legend'
            });
            console.log('👑 Default Admin user created: admin / admin123');
        } else {
            console.log('👑 Admin user already exists.');
        }

        console.log('\n🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    }
}

seedDatabase();
