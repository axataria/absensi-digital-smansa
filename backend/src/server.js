const express = require('express');
const cors = require('cors');
const path = require('path');

// Only load dotenv if .env file exists (not on Vercel)
try { require('dotenv').config(); } catch (e) {}

const sequelize = require('./config/database');
const apiRoutes = require('./routes/api');

// Import models to initialize associations
require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Ensure uploads directory exists ───
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Lazy DB initialization (runs once on first request) ───
let dbInitialized = false;
const initDB = async () => {
  if (dbInitialized) return;
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync();
    console.log('✅ Database tables synced');
    const seed = require('./seeders/seed');
    await seed();
    dbInitialized = true;
  } catch (error) {
    console.error('❌ DB init failed:', error.message);
    throw error;
  }
};

// Init DB middleware — runs once on first API request
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed.' });
  }
});

// ─── API Routes ───
app.use('/api', apiRoutes);

// ─── Health check ───
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: dbInitialized });
});

// ─── Error handling ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Terjadi kesalahan pada server.',
  });
});

// ─── Start server (local dev only) ───
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 E-Absensi API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
