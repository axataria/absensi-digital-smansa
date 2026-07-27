const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// ─── API Routes (Mounted on both /api and / for serverless flexibility) ───
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// ─── Serve Frontend Static Assets & SPA Fallback ───
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ─── Health check ───
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// ─── Start server ───
const startServer = async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models (create tables if not exist)
    await sequelize.sync();
    console.log('✅ Database tables synced');

    // Seed data
    const seed = require('./seeders/seed');
    await seed();

    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`\n🚀 E-Absensi API running on http://localhost:${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV}`);
        console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
      });
    }
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    if (!process.env.VERCEL) process.exit(1);
  }
};

startServer();

module.exports = app;
