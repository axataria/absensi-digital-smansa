const { Absensi, Siswa, Kelas, User } = require('../models');
const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/database');
const ExcelJS = require('exceljs');

// GET /api/absensi?tanggal=&kelas_id=
exports.index = async (req, res) => {
  try {
    const { tanggal, kelas_id } = req.query;
    const tanggalAbsen = tanggal || new Date().toISOString().split('T')[0];

    const siswaWhere = { status: 'aktif' };
    if (kelas_id) siswaWhere.kelas_id = kelas_id;

    // Get all active students for the class
    const siswaList = await Siswa.findAll({
      where: siswaWhere,
      include: [
        { model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas', 'tingkat'] },
        {
          model: Absensi,
          as: 'absensi',
          where: { tanggal_absen: tanggalAbsen },
          required: false, // LEFT JOIN — include students without attendance record
          attributes: ['id', 'status', 'keterangan', 'diinput_oleh', 'created_at', 'updated_at'],
        },
      ],
      order: [
        [{ model: Kelas, as: 'kelas' }, 'nama_kelas', 'ASC'],
        ['nama_lengkap', 'ASC'],
      ],
    });

    // Map to response format
    const data = siswaList.map((s) => ({
      siswa_id: s.id,
      nis: s.nis,
      nama_lengkap: s.nama_lengkap,
      jenis_kelamin: s.jenis_kelamin,
      kelas: s.kelas,
      status_absensi: s.absensi.length > 0 ? s.absensi[0].status : null,
      keterangan: s.absensi.length > 0 ? s.absensi[0].keterangan : null,
      absensi_id: s.absensi.length > 0 ? s.absensi[0].id : null,
    }));

    res.json({
      success: true,
      data,
      meta: {
        tanggal: tanggalAbsen,
        kelas_id: kelas_id || null,
        total: data.length,
        sudah_diabsen: data.filter((d) => d.status_absensi !== null).length,
      },
    });
  } catch (error) {
    console.error('Absensi index error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/absensi — batch save/update
exports.store = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { tanggal_absen, data } = req.body;

    if (!tanggal_absen || !data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tanggal_absen dan data absensi (array) wajib diisi.',
      });
    }

    const validStatuses = ['Hadir', 'Sakit', 'Ijin', 'Dispen', 'Alpa'];
    const results = { berhasil: 0, gagal: 0, errors: [] };

    for (const item of data) {
      try {
        if (!item.siswa_id || !item.status) {
          results.errors.push({ siswa_id: item.siswa_id, pesan: 'siswa_id dan status wajib diisi' });
          results.gagal++;
          continue;
        }

        if (!validStatuses.includes(item.status)) {
          results.errors.push({ siswa_id: item.siswa_id, pesan: `Status "${item.status}" tidak valid` });
          results.gagal++;
          continue;
        }

        // Upsert: insert or update based on unique key (siswa_id, tanggal_absen)
        const [absensi, created] = await Absensi.findOrCreate({
          where: { siswa_id: item.siswa_id, tanggal_absen },
          defaults: {
            siswa_id: item.siswa_id,
            tanggal_absen,
            status: item.status,
            keterangan: item.keterangan || null,
            diinput_oleh: req.user.id, // auto-set from authenticated user
          },
          transaction: t,
        });

        if (!created) {
          await absensi.update(
            {
              status: item.status,
              keterangan: item.keterangan || absensi.keterangan,
              diinput_oleh: req.user.id,
            },
            { transaction: t }
          );
        }

        results.berhasil++;
      } catch (itemError) {
        results.errors.push({ siswa_id: item.siswa_id, pesan: itemError.message });
        results.gagal++;
      }
    }

    await t.commit();

    res.json({
      success: true,
      message: `Absensi berhasil disimpan. ${results.berhasil} berhasil, ${results.gagal} gagal.`,
      data: results,
    });
  } catch (error) {
    await t.rollback();
    console.error('Absensi store error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan absensi.' });
  }
};

// GET /api/absensi/rekap?start=&end=&kelas_id=
exports.rekap = async (req, res) => {
  try {
    const { start, end, kelas_id } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Parameter start dan end (tanggal) wajib diisi.',
      });
    }

    const siswaWhere = { status: 'aktif' };
    if (kelas_id) siswaWhere.kelas_id = kelas_id;

    const siswaList = await Siswa.findAll({
      where: siswaWhere,
      include: [
        { model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas', 'tingkat'] },
        {
          model: Absensi,
          as: 'absensi',
          where: { tanggal_absen: { [Op.between]: [start, end] } },
          required: false,
          attributes: ['status'],
        },
      ],
      order: [
        [{ model: Kelas, as: 'kelas' }, 'nama_kelas', 'ASC'],
        ['nama_lengkap', 'ASC'],
      ],
    });

    const rekap = siswaList.map((s) => {
      const counts = { Hadir: 0, Sakit: 0, Ijin: 0, Dispen: 0, Alpa: 0 };
      s.absensi.forEach((a) => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      return {
        siswa_id: s.id,
        nis: s.nis,
        nama_lengkap: s.nama_lengkap,
        kelas: s.kelas,
        jenis_kelamin: s.jenis_kelamin,
        ...counts,
        total_hari: total,
        persentase_hadir: total > 0 ? Math.round((counts.Hadir / total) * 100) : 0,
      };
    });

    res.json({ success: true, data: rekap, meta: { start, end, kelas_id: kelas_id || null } });
  } catch (error) {
    console.error('Absensi rekap error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET /api/absensi/export?start=&end=&kelas_id=
exports.export = async (req, res) => {
  try {
    const { start, end, kelas_id } = req.query;

    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Parameter start dan end wajib diisi.' });
    }

    const siswaWhere = { status: 'aktif' };
    if (kelas_id) siswaWhere.kelas_id = kelas_id;

    let targetKelasName = 'Semua Kelas';
    if (kelas_id) {
      const k = await Kelas.findByPk(kelas_id);
      if (k) targetKelasName = k.nama_kelas;
    }

    const siswaList = await Siswa.findAll({
      where: siswaWhere,
      include: [
        { model: Kelas, as: 'kelas', attributes: ['id', 'nama_kelas', 'tingkat'] },
        {
          model: Absensi,
          as: 'absensi',
          where: { tanggal_absen: { [Op.between]: [start, end] } },
          required: false,
          attributes: ['status'],
        },
      ],
      order: [
        [{ model: Kelas, as: 'kelas' }, 'nama_kelas', 'ASC'],
        ['nama_lengkap', 'ASC'],
      ],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'E-Absensi AI System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Rekap Absensi', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // ─── Header Title Rows ───
    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'LAPORAN REKAPITULASI KEHADIRAN SISWA';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E1B2E' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('A2:J2');
    const subTitleCell = sheet.getCell('A2');
    subTitleCell.value = `Periode: ${start} s/d ${end} | Kelas: ${targetKelasName} | Dicetak: ${new Date().toLocaleDateString('id-ID')}`;
    subTitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF6B7280' } };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.addRow([]); // Blank row

    // ─── Table Headers ───
    const headerRow = sheet.addRow([
      'No',
      'NIS',
      'Nama Lengkap Siswa',
      'Kelas',
      'Hadir',
      'Sakit',
      'Ijin',
      'Dispen',
      'Alpa',
      '% Kehadiran',
    ]);

    headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.height = 26;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }, // Indigo brand header
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF312E81' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    // Left align text for Name column header
    sheet.getCell('C4').alignment = { horizontal: 'left', vertical: 'middle' };

    // ─── Table Data ───
    siswaList.forEach((s, i) => {
      const counts = { Hadir: 0, Sakit: 0, Ijin: 0, Dispen: 0, Alpa: 0 };
      s.absensi.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const persentase = total > 0 ? Math.round((counts.Hadir / total) * 100) : 0;

      const row = sheet.addRow([
        i + 1,
        s.nis,
        s.nama_lengkap,
        s.kelas ? s.kelas.nama_kelas : '-',
        counts.Hadir,
        counts.Sakit,
        counts.Ijin,
        counts.Dispen,
        counts.Alpa,
        `${persentase}%`,
      ]);

      row.height = 22;
      row.font = { name: 'Arial', size: 10 };

      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
      row.getCell(9).alignment = { horizontal: 'center' };
      row.getCell(10).alignment = { horizontal: 'center' };

      // Zebra striping
      if (i % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        });
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    // Auto Column Widths
    sheet.columns = [
      { width: 6 },  // No
      { width: 14 }, // NIS
      { width: 32 }, // Nama
      { width: 14 }, // Kelas
      { width: 10 }, // Hadir
      { width: 10 }, // Sakit
      { width: 10 }, // Ijin
      { width: 10 }, // Dispen
      { width: 10 }, // Alpa
      { width: 14 }, // % Hadir
    ];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rekap_absensi_${start}_${end}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat export Excel.' });
  }
};
