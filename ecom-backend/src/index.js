require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/products', productRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'E-commerce Backend API',
        status: 'running',
        timestamp: new Date().toISOString(),
    });
});

async function start() {
    try {
        await connectDB();
        console.log('✅ MongoDB connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message || err);
        process.exit(1);
    }
}

start();

