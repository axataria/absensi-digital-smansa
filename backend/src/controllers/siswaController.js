const { Siswa, Kelas } = require('../models');
const { Op } = require('sequelize');
const { Readable } = require('stream');
const csv = require('csv-parser');
const { LogUpload } = require('../models');

// GET /api/siswa
exports.index = async (req, res) => {
  try {
    const { kelas_id, search, status, page = 1, limit = 50 } = req.query;

    const where = {};
    if (kelas_id) where.kelas_id = kelas_id;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { nama_lengkap: { [Op.iLike]: `%${search}%` } },
        { nis: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows, count } = await Siswa.findAndCountAll({
      where,
      include: [{ model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas', 'tingkat'] }],
      order: [['nama_lengkap', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Siswa index error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/siswa (admin only)
exports.store = async (req, res) => {
  try {
    const { nis, nama_lengkap, kelas_id, jenis_kelamin, status } = req.body;

    if (!nis || !nama_lengkap || !kelas_id) {
      return res.status(400).json({
        success: false,
        message: 'NIS, nama lengkap, dan kelas wajib diisi.',
      });
    }

    // Check if NIS already exists
    const existingNis = await Siswa.findOne({ where: { nis } });
    if (existingNis) {
      return res.status(400).json({ success: false, message: 'NIS sudah digunakan.' });
    }

    // Check kelas exists
    const kelas = await Kelas.findByPk(kelas_id);
    if (!kelas) {
      return res.status(400).json({ success: false, message: 'Kelas tidak ditemukan.' });
    }

    const siswa = await Siswa.create({ nis, nama_lengkap, kelas_id, jenis_kelamin, status });

    const siswaWithKelas = await Siswa.findByPk(siswa.id, {
      include: [{ model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas', 'tingkat'] }],
    });

    res.status(201).json({
      success: true,
      message: 'Siswa berhasil ditambahkan.',
      data: siswaWithKelas,
    });
  } catch (error) {
    console.error('Siswa store error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PUT /api/siswa/:id (admin only)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, nama_lengkap, kelas_id, jenis_kelamin, status } = req.body;

    const siswa = await Siswa.findByPk(id);
    if (!siswa) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    }

    // Check NIS uniqueness if changed
    if (nis && nis !== siswa.nis) {
      const existingNis = await Siswa.findOne({ where: { nis, id: { [Op.ne]: id } } });
      if (existingNis) {
        return res.status(400).json({ success: false, message: 'NIS sudah digunakan.' });
      }
    }

    await siswa.update({ nis, nama_lengkap, kelas_id, jenis_kelamin, status });

    const updated = await Siswa.findByPk(id, {
      include: [{ model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas', 'tingkat'] }],
    });

    res.json({ success: true, message: 'Data siswa berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error('Siswa update error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/siswa/:id (admin only â€” soft delete)
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await Siswa.findByPk(id);
    if (!siswa) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    }

    await siswa.destroy(); // soft delete (paranoid)

    res.json({ success: true, message: 'Siswa berhasil dihapus.' });
  } catch (error) {
    console.error('Siswa destroy error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/siswa/upload-csv (admin only)
exports.uploadCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File CSV wajib diupload.' });
    }

    const results = [];
    const errors = [];
    let totalBaris = 0;

    // Parse CSV
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv())
        .on('data', (row) => {
          totalBaris++;
          results.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    let berhasil = 0;
    let gagal = 0;

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      try {
        const nis = (row.NIS || row.nis || '').toString().trim();
        const nama = (row.Nama || row.nama || row.nama_lengkap || row.NAMA || '').trim();
        const kelasNama = (row.Kelas || row.kelas || row.KELAS || '').trim();
        const jk = (row['Jenis Kelamin'] || row.jenis_kelamin || row.JK || row.jk || '').trim().toUpperCase();

        if (!nis || !nama || !kelasNama) {
          errors.push({ baris: i + 2, pesan: 'NIS, Nama, atau Kelas kosong', data: row });
          gagal++;
          continue;
        }

        // Find or create kelas
        let [kelas] = await Kelas.findOrCreate({
          where: { nama_kelas: kelasNama },
          defaults: { nama_kelas: kelasNama },
        });

        // Upsert siswa
        const [siswa, created] = await Siswa.findOrCreate({
          where: { nis },
          defaults: {
            nis,
            nama_lengkap: nama,
            kelas_id: kelas.id,
            jenis_kelamin: jk === 'L' || jk === 'P' ? jk : null,
            status: 'aktif',
          },
        });

        if (!created) {
          // Update existing
          await siswa.update({
            nama_lengkap: nama,
            kelas_id: kelas.id,
            jenis_kelamin: jk === 'L' || jk === 'P' ? jk : siswa.jenis_kelamin,
          });
        }

        berhasil++;
      } catch (rowError) {
        errors.push({ baris: i + 2, pesan: rowError.message, data: row });
        gagal++;
      }
    }

    // Log upload
    await LogUpload.create({
      nama_file: req.file.originalname,
      total_baris: totalBaris,
      berhasil,
      gagal,
      diupload_oleh: req.user.id,
    });

    res.json({
      success: true,
      message: `Import selesai. ${berhasil} berhasil, ${gagal} gagal dari ${totalBaris} baris.`,
      data: { total_baris: totalBaris, berhasil, gagal, errors: errors.slice(0, 20) },
    });
  } catch (error) {
    console.error('Upload CSV error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses file CSV.' });
  }
};

