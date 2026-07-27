const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Siswa = sequelize.define('Siswa', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nis: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  kelas_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'kelas', key: 'id' },
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('aktif', 'pindah', 'lulus'),
    defaultValue: 'aktif',
  },
}, {
  tableName: 'siswa',
  paranoid: true, // soft delete (deleted_at)
});

module.exports = Siswa;
