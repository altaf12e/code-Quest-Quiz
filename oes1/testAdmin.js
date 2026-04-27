const mongoose = require('mongoose');
const User = require('./server/models/User');
const Question = require('./server/models/Question');

async function testAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/codequest');
        console.log('Connected to MongoDB');

        // Check admin user
        const adminUser = await User.findOne({ username: 'admin' });
        console.log('Admin user:', adminUser ? 'Found' : 'Not found');
        if (adminUser) {
            console.log('Admin details:', {
                username: adminUser.username,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
                level: adminUser.level,
                xp: adminUser.xp
            });
        }

        // Check total users
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers);

        // Check total questions
        const totalQuestions = await Question.countDocuments();
        console.log('Total questions:', totalQuestions);

        // Check sample questions
        const sampleQuestions = await Question.find().limit(3);
        console.log('Sample questions:', sampleQuestions.map(q => ({
            subject: q.subject,
            difficulty: q.difficulty,
            question: q.question.substring(0, 50) + '...'
        })));

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

testAdmin();