const bcrypt = require('bcryptjs');
const { User, Kelas, Siswa } = require('../models');

const seed = async () => {
  try {
    // ─── Users ───
    const admin = await User.findOrCreate({
      where: { email: 'admin@sekolah.sch.id' },
      defaults: {
        nama: 'Administrator',
        email: 'admin@sekolah.sch.id',
        password: 'admin123',
        role: 'admin',
      },
    });

    const guru1 = await User.findOrCreate({
      where: { email: 'guru1@sekolah.sch.id' },
      defaults: {
        nama: 'Budi Santoso',
        email: 'guru1@sekolah.sch.id',
        password: 'guru123',
        role: 'user',
      },
    });

    const guru2 = await User.findOrCreate({
      where: { email: 'guru2@sekolah.sch.id' },
      defaults: {
        nama: 'Siti Rahayu',
        email: 'guru2@sekolah.sch.id',
        password: 'guru123',
        role: 'user',
      },
    });

    console.log('✅ Users seeded');

    // ─── Kelas ───
    const kelasData = [
      { nama_kelas: 'X-1', tingkat: 'X', tahun_ajaran: '2026/2027', wali_kelas_id: guru1[0].id },
      { nama_kelas: 'X-2', tingkat: 'X', tahun_ajaran: '2026/2027', wali_kelas_id: guru2[0].id },
      { nama_kelas: 'XI-IPA-1', tingkat: 'XI', tahun_ajaran: '2026/2027' },
      { nama_kelas: 'XI-IPA-2', tingkat: 'XI', tahun_ajaran: '2026/2027' },
      { nama_kelas: 'XI-IPS-1', tingkat: 'XI', tahun_ajaran: '2026/2027' },
      { nama_kelas: 'XII-IPA-1', tingkat: 'XII', tahun_ajaran: '2026/2027' },
      { nama_kelas: 'XII-IPS-1', tingkat: 'XII', tahun_ajaran: '2026/2027' },
    ];

    const createdKelas = [];
    for (const k of kelasData) {
      const [kelas] = await Kelas.findOrCreate({
        where: { nama_kelas: k.nama_kelas, tahun_ajaran: k.tahun_ajaran },
        defaults: k,
      });
      createdKelas.push(kelas);
    }
    console.log('✅ Kelas seeded');

    // ─── Siswa ───
    const namaSiswa = [
      // X-1
      { nis: '14001', nama_lengkap: 'Ahmad Rizky Pratama', jenis_kelamin: 'L' },
      { nis: '14002', nama_lengkap: 'Anisa Putri Wulandari', jenis_kelamin: 'P' },
      { nis: '14003', nama_lengkap: 'Bima Ardiansyah', jenis_kelamin: 'L' },
      { nis: '14004', nama_lengkap: 'Citra Dewi Lestari', jenis_kelamin: 'P' },
      { nis: '14005', nama_lengkap: 'Dani Setiawan', jenis_kelamin: 'L' },
      { nis: '14006', nama_lengkap: 'Eka Fitriani', jenis_kelamin: 'P' },
      { nis: '14007', nama_lengkap: 'Farhan Maulana', jenis_kelamin: 'L' },
      // X-2
      { nis: '14101', nama_lengkap: 'Galih Permana', jenis_kelamin: 'L' },
      { nis: '14102', nama_lengkap: 'Hana Safitri', jenis_kelamin: 'P' },
      { nis: '14103', nama_lengkap: 'Irfan Hakim', jenis_kelamin: 'L' },
      { nis: '14104', nama_lengkap: 'Jasmine Aurelia', jenis_kelamin: 'P' },
      { nis: '14105', nama_lengkap: 'Kevin Aditya', jenis_kelamin: 'L' },
      { nis: '14106', nama_lengkap: 'Larasati Puspitasari', jenis_kelamin: 'P' },
      // XI-IPA-1
      { nis: '13001', nama_lengkap: 'Muhammad Faisal', jenis_kelamin: 'L' },
      { nis: '13002', nama_lengkap: 'Nadia Rahmawati', jenis_kelamin: 'P' },
      { nis: '13003', nama_lengkap: 'Oscar Ramadhan', jenis_kelamin: 'L' },
      { nis: '13004', nama_lengkap: 'Putri Ayu Ningsih', jenis_kelamin: 'P' },
      // XI-IPS-1
      { nis: '13101', nama_lengkap: 'Rizal Firmansyah', jenis_kelamin: 'L' },
      { nis: '13102', nama_lengkap: 'Sarah Amelia', jenis_kelamin: 'P' },
      { nis: '13103', nama_lengkap: 'Teguh Prasetyo', jenis_kelamin: 'L' },
      // XII-IPA-1
      { nis: '12001', nama_lengkap: 'Umar Abdullah', jenis_kelamin: 'L' },
      { nis: '12002', nama_lengkap: 'Vina Oktaviani', jenis_kelamin: 'P' },
      { nis: '12003', nama_lengkap: 'Wahyu Nugroho', jenis_kelamin: 'L' },
      { nis: '12004', nama_lengkap: 'Xena Maharani', jenis_kelamin: 'P' },
    ];

    // Assign kelas: first 7 → X-1, next 6 → X-2, next 4 → XI-IPA-1, next 3 → XI-IPS-1, last 4 → XII-IPA-1
    const kelasAssignment = [0,0,0,0,0,0,0, 1,1,1,1,1,1, 2,2,2,2, 4,4,4, 5,5,5,5];

    for (let i = 0; i < namaSiswa.length; i++) {
      await Siswa.findOrCreate({
        where: { nis: namaSiswa[i].nis },
        defaults: {
          ...namaSiswa[i],
          kelas_id: createdKelas[kelasAssignment[i]].id,
          status: 'aktif',
        },
      });
    }
    console.log('✅ Siswa seeded (24 siswa)');

    console.log('\n🎉 Semua data berhasil di-seed!');
    console.log('   Admin: admin@sekolah.sch.id / admin123');
    console.log('   Guru1: guru1@sekolah.sch.id / guru123');
    console.log('   Guru2: guru2@sekolah.sch.id / guru123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

module.exports = seed;
