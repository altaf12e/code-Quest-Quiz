const mongoose = require('mongoose');

let isConnecting = false;

const CLOUD_ATLAS_FALLBACK = 'mongodb+srv://mdsameer0681_db_user:quizpass321@cluster0.934sxts.mongodb.net/codequest?retryWrites=true&w=majority';

const connectDB = async () => {
    if (isConnecting) return;
    isConnecting = true;
    try {
        let uri = process.env.MONGODB_URI;
        // On Render / cloud, if MONGODB_URI is missing or points to localhost/127.0.0.1, use Cloud Atlas
        if (!uri || (process.env.NODE_ENV === 'production' && (uri.includes('localhost') || uri.includes('127.0.0.1')))) {
            uri = CLOUD_ATLAS_FALLBACK;
        }

        const conn = await mongoose.connect(uri, {
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
