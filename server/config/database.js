const mongoose = require('mongoose');

/**
 * ============================================
 * DATABASE CONNECTION
 * ============================================
 * 
 * MongoDB connection setup for BizCheck
 * Created for: Zeeshan (Jadavpur University)
 */

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizcheck';

        const options = {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        };

        const conn = await mongoose.connect(mongoURI, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Log connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);

        if (process.env.NODE_ENV !== 'development') {
            process.exit(1);
        } else {
            console.warn('⚠️  Running without database in development mode');
        }
    }
};

module.exports = connectDB;
