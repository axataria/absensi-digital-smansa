const { User } = require('../models');
const { Op } = require('sequelize');

// GET /api/users (admin only)
exports.index = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['nama', 'ASC']],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Users index error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/users (admin only)
exports.store = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan.' });
    }

    const user = await User.create({ nama, email, password, role: role || 'user' });

    res.status(201).json({ success: true, message: 'User berhasil ditambahkan.', data: user.toJSON() });
  } catch (error) {
    console.error('User store error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT /api/users/:id (admin only)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan.' });
      }
    }

    await user.update({ nama, email, role });

    res.json({ success: true, message: 'User berhasil diperbarui.', data: user.toJSON() });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/users/:id (admin only)
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('User destroy error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT /api/users/:id/reset-password (admin only)
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    await user.update({ password });

    res.json({ success: true, message: 'Password berhasil direset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};
