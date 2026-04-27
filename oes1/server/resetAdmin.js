const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find and update admin user
        const admin = await User.findOne({ username: 'admin' });
        if (admin) {
            admin.password = 'admin123';
            admin.isAdmin = true;
            await admin.save();
            console.log('Admin password reset to: admin123');
        } else {
            // Create new admin
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
            console.log('New admin user created');
        }

        console.log('Username: admin');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetAdmin();