const { Kelas, User, Siswa } = require('../models');
const { fn, col } = require('sequelize');

// GET /api/kelas
exports.index = async (req, res) => {
  try {
    const kelas = await Kelas.findAll({
      include: [
        { model: User, as: 'waliKelas', attributes: ['id', 'nama', 'email'] },
      ],
      attributes: {
        include: [
          [fn('COUNT', col('siswa.id')), 'jumlah_siswa'],
        ],
      },
      include: [
        { model: User, as: 'waliKelas', attributes: ['id', 'nama', 'email'] },
        { model: Siswa, as: 'siswa', attributes: [], where: { status: 'aktif' }, required: false },
      ],
      group: ['Kelas.id', 'waliKelas.id'],
      order: [['tingkat', 'ASC'], ['nama_kelas', 'ASC']],
    });

    res.json({ success: true, data: kelas });
  } catch (error) {
    console.error('Kelas index error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/kelas (admin only)
exports.store = async (req, res) => {
  try {
    const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran } = req.body;

    if (!nama_kelas) {
      return res.status(400).json({ success: false, message: 'Nama kelas wajib diisi.' });
    }

    const kelas = await Kelas.create({ nama_kelas, tingkat, wali_kelas_id, tahun_ajaran });

    res.status(201).json({ success: true, message: 'Kelas berhasil ditambahkan.', data: kelas });
  } catch (error) {
    console.error('Kelas store error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT /api/kelas/:id (admin only)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran } = req.body;

    const kelas = await Kelas.findByPk(id);
    if (!kelas) {
      return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan.' });
    }

    await kelas.update({ nama_kelas, tingkat, wali_kelas_id, tahun_ajaran });

    res.json({ success: true, message: 'Kelas berhasil diperbarui.', data: kelas });
  } catch (error) {
    console.error('Kelas update error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/kelas/:id (admin only)
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const kelas = await Kelas.findByPk(id);
    if (!kelas) {
      return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan.' });
    }

    // Check if kelas has siswa
    const siswaCount = await Siswa.count({ where: { kelas_id: id } });
    if (siswaCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kelas tidak bisa dihapus karena masih memiliki ${siswaCount} siswa.`,
      });
    }

    await kelas.destroy();

    res.json({ success: true, message: 'Kelas berhasil dihapus.' });
  } catch (error) {
    console.error('Kelas destroy error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};
