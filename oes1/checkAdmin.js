const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

async function checkAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/codequest');
        console.log('Connected to MongoDB');

        // Check if admin user exists
        const adminUser = await User.findOne({ username: 'admin' }).select('+password');
        
        if (!adminUser) {
            console.log('❌ Admin user not found. Creating admin user...');
            
            // Create admin user
            const newAdmin = new User({
                username: 'admin',
                email: 'admin@codequest.com',
                password: 'admin123',
                isAdmin: true,
                level: 99,
                xp: 999999,
                avatar: '👑'
            });
            
            await newAdmin.save();
            console.log('✅ Admin user created successfully');
        } else {
            console.log('✅ Admin user found');
            console.log('Admin details:', {
                username: adminUser.username,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
                level: adminUser.level,
                xp: adminUser.xp
            });
            
            // Test password
            const testPassword = 'admin123';
            const isMatch = await adminUser.matchPassword(testPassword);
            console.log(`Password test for "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
            
            // If password doesn't match, update it
            if (!isMatch) {
                console.log('Updating admin password...');
                adminUser.password = testPassword;
                await adminUser.save();
                console.log('✅ Admin password updated');
            }
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
}

checkAdmin();