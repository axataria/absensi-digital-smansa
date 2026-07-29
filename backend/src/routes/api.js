const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticate, checkRole } = require('../middleware/auth');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const siswaController = require('../controllers/siswaController');
const kelasController = require('../controllers/kelasController');
const absensiController = require('../controllers/absensiController');
const userController = require('../controllers/userController');

// ─── Multer config for CSV upload ───
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file CSV yang diperbolehkan.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ═══════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════
router.post('/login', authController.login);

// ═══════════════════════════════════════
// AUTHENTICATED ROUTES (admin & user)
// ═══════════════════════════════════════
router.use(authenticate);

router.post('/logout', authController.logout);
router.get('/me', authController.me);

// Dashboard
router.get('/dashboard/summary', dashboardController.summary);

// Siswa — read only for user
router.get('/siswa', siswaController.index);

// Kelas — read only for user
router.get('/kelas', kelasController.index);

// Absensi — read & write for admin AND user
router.get('/absensi', absensiController.index);
router.post('/absensi', absensiController.store);
router.get('/absensi/rekap', absensiController.rekap);

// ═══════════════════════════════════════
// ADMIN-ONLY ROUTES
// ═══════════════════════════════════════
router.post('/siswa', checkRole('admin'), siswaController.store);
router.put('/siswa/:id', checkRole('admin'), siswaController.update);
router.delete('/siswa/:id', checkRole('admin'), siswaController.destroy);
router.post('/siswa/upload-csv', checkRole('admin'), upload.single('file'), siswaController.uploadCsv);

router.post('/kelas', checkRole('admin'), kelasController.store);
router.put('/kelas/:id', checkRole('admin'), kelasController.update);
router.delete('/kelas/:id', checkRole('admin'), kelasController.destroy);

router.get('/absensi/export', absensiController.export);

router.get('/users', checkRole('admin'), userController.index);
router.post('/users', checkRole('admin'), userController.store);
router.put('/users/:id', checkRole('admin'), userController.update);
router.delete('/users/:id', checkRole('admin'), userController.destroy);
router.put('/users/:id/reset-password', checkRole('admin'), userController.resetPassword);

module.exports = router;
