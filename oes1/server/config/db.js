const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
    if (isConnecting) return;
    isConnecting = true;
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        isConnecting = false;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        isConnecting = false;
        // Do NOT crash the entire process with process.exit(1) on Render!
        // Retrying in the background keeps Express alive to respond to health checks and waking requests
        console.log('🔄 Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
