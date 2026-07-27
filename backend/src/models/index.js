const User = require('./User');
const Kelas = require('./Kelas');
const Siswa = require('./Siswa');
const Absensi = require('./Absensi');
const LogUpload = require('./LogUpload');

// ─── Associations ───

// User ↔ Kelas (wali kelas)
User.hasMany(Kelas, { foreignKey: 'wali_kelas_id', as: 'kelasWali' });
Kelas.belongsTo(User, { foreignKey: 'wali_kelas_id', as: 'waliKelas' });

// Kelas ↔ Siswa
Kelas.hasMany(Siswa, { foreignKey: 'kelas_id', as: 'siswa' });
Siswa.belongsTo(Kelas, { foreignKey: 'kelas_id', as: 'kelas' });

// Siswa ↔ Absensi
Siswa.hasMany(Absensi, { foreignKey: 'siswa_id', as: 'absensi' });
Absensi.belongsTo(Siswa, { foreignKey: 'siswa_id', as: 'siswa' });

// User ↔ Absensi (diinput oleh)
User.hasMany(Absensi, { foreignKey: 'diinput_oleh', as: 'absensiInput' });
Absensi.belongsTo(User, { foreignKey: 'diinput_oleh', as: 'inputOleh' });

// User ↔ LogUpload
User.hasMany(LogUpload, { foreignKey: 'diupload_oleh', as: 'uploads' });
LogUpload.belongsTo(User, { foreignKey: 'diupload_oleh', as: 'uploader' });

module.exports = { User, Kelas, Siswa, Absensi, LogUpload };
