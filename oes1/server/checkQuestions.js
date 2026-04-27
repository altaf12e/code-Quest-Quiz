const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

async function checkQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB');
        
        // Get total count
        const totalQuestions = await Question.countDocuments();
        console.log(`\n📊 TOTAL QUESTIONS: ${totalQuestions}`);
        
        // Count by subject
        console.log('\n📚 BY SUBJECT:');
        const subjects = ['java', 'cpp', 'python', 'javascript', 'data-structures', 'algorithms'];
        
        for (const subject of subjects) {
            const count = await Question.countDocuments({ subject });
            console.log(`${subject.toUpperCase()}: ${count} questions`);
        }
        
        // Count by difficulty
        console.log('\n⚡ BY DIFFICULTY:');
        const difficulties = ['easy', 'medium', 'hard', 'marathon'];
        
        for (const difficulty of difficulties) {
            const count = await Question.countDocuments({ difficulty });
            console.log(`${difficulty.toUpperCase()}: ${count} questions`);
        }
        
        // Detailed breakdown
        console.log('\n🔍 DETAILED BREAKDOWN:');
        for (const subject of subjects) {
            console.log(`\n${subject.toUpperCase()}:`);
            for (const difficulty of difficulties) {
                const count = await Question.countDocuments({ subject, difficulty });
                if (count > 0) {
                    console.log(`  ${difficulty}: ${count}`);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkQuestions();