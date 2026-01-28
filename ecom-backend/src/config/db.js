const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
    if (!MONGO_URI) {
        throw new Error('Missing MONGO_URI in environment variables');
    }

    // Mongoose 6+ uses sensible defaults; no need for useNewUrlParser/useUnifiedTopology.
    await mongoose.connect(MONGO_URI);

    return mongoose.connection;
}

module.exports = { connectDB };


