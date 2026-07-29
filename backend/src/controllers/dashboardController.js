const { Siswa, Kelas, Absensi } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/dashboard/summary
exports.summary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userRole = req.user.role;
    const userId = req.user.id;

    // Build kelas filter for user role (only their wali kelas classes)
    let kelasFilter = {};
    if (userRole === 'user') {
      const userKelas = await Kelas.findAll({
        where: { wali_kelas_id: userId },
        attributes: ['id'],
      });
      const kelasIds = userKelas.map((k) => k.id);
      if (kelasIds.length > 0) {
        kelasFilter = { kelas_id: { [Op.in]: kelasIds } };
      }
    }

    // Total siswa aktif
    const totalSiswa = await Siswa.count({
      where: { status: 'aktif', ...kelasFilter },
    });

    // Kehadiran hari ini — aggregate per status
    const siswaIds = await Siswa.findAll({
      where: { status: 'aktif', ...kelasFilter },
      attributes: ['id'],
      raw: true,
    });
    const siswaIdList = siswaIds.map((s) => s.id);

    let kehadiranHariIni = { Hadir: 0, Sakit: 0, Ijin: 0, Dispen: 0, Alpa: 0 };

    if (siswaIdList.length > 0) {
      const absensiToday = await Absensi.findAll({
        where: {
          tanggal_absen: today,
          siswa_id: { [Op.in]: siswaIdList },
        },
        attributes: [
          'status',
          [fn('COUNT', col('status')), 'jumlah'],
        ],
        group: ['status'],
        raw: true,
      });

      absensiToday.forEach((row) => {
        kehadiranHariIni[row.status] = parseInt(row.jumlah);
      });

      // Tidak ada record = Hadir → Hadir = totalSiswa - total tidak hadir
      const totalTidakHadir = kehadiranHariIni.Sakit + kehadiranHariIni.Ijin + kehadiranHariIni.Dispen + kehadiranHariIni.Alpa;
      kehadiranHariIni.Hadir = totalSiswa - totalTidakHadir;
    }

    // Persentase kehadiran per kelas (hari ini)
    const kelasAll = await Kelas.findAll({
      where: userRole === 'user' && kelasFilter.kelas_id
        ? { id: kelasFilter.kelas_id }
        : {},
      attributes: ['id', 'nama_kelas'],
      raw: true,
    });

    const persentasePerKelas = [];
    for (const k of kelasAll) {
      const totalSiswaKelas = await Siswa.count({
        where: { kelas_id: k.id, status: 'aktif' },
      });

      if (totalSiswaKelas === 0) continue;

      // Hitung tidak hadir (record di DB = pasti tidak hadir)
      const tidakHadirKelas = await Absensi.count({
        where: {
          tanggal_absen: today,
        },
        include: [{
          model: Siswa,
          as: 'siswa',
          where: { kelas_id: k.id, status: 'aktif' },
          attributes: [],
        }],
      });

      // Hadir = total siswa - tidak hadir
      const hadirKelas = totalSiswaKelas - tidakHadirKelas;

      persentasePerKelas.push({
        kelas_id: k.id,
        nama_kelas: k.nama_kelas,
        total_siswa: totalSiswaKelas,
        hadir: hadirKelas,
        persentase: totalSiswaKelas > 0
          ? Math.round((hadirKelas / totalSiswaKelas) * 100)
          : 0,
      });
    }

    // Trend 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    let trendQuery = {
      tanggal_absen: { [Op.between]: [startDate, today] },
    };

    if (siswaIdList.length > 0) {
      trendQuery.siswa_id = { [Op.in]: siswaIdList };
    }

    const trendRaw = await Absensi.findAll({
      where: trendQuery,
      attributes: [
        'tanggal_absen',
        'status',
        [fn('COUNT', col('id')), 'jumlah'],
      ],
      group: ['tanggal_absen', 'status'],
      order: [['tanggal_absen', 'ASC']],
      raw: true,
    });

    // Group trend by date — hitung Hadir = totalSiswa - total tidak hadir per hari
    const trendMap = {};
    trendRaw.forEach((row) => {
      if (!trendMap[row.tanggal_absen]) {
        trendMap[row.tanggal_absen] = { tanggal: row.tanggal_absen, Hadir: 0, Sakit: 0, Ijin: 0, Dispen: 0, Alpa: 0 };
      }
      trendMap[row.tanggal_absen][row.status] = parseInt(row.jumlah);
    });

    // Hitung Hadir per tanggal dari totalSiswa - total tidak hadir
    Object.values(trendMap).forEach((day) => {
      const totalTidakHadir = day.Sakit + day.Ijin + day.Dispen + day.Alpa;
      day.Hadir = totalSiswa - totalTidakHadir;
    });

    const trendMingguan = Object.values(trendMap);

    res.json({
      success: true,
      data: {
        total_siswa_aktif: totalSiswa,
        kehadiran_hari_ini: kehadiranHariIni,
        persentase_per_kelas: persentasePerKelas,
        trend_mingguan: trendMingguan,
        tanggal: today,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};
