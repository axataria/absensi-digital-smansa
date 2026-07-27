const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Absensi = sequelize.define('Absensi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  siswa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'siswa', key: 'id' },
  },
  tanggal_absen: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Hadir', 'Sakit', 'Ijin', 'Dispen', 'Alpa'),
    defaultValue: 'Hadir',
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  diinput_oleh: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'absensi',
  indexes: [
    {
      unique: true,
      fields: ['siswa_id', 'tanggal_absen'],
      name: 'unique_absen',
    },
    {
      fields: ['tanggal_absen'],
      name: 'idx_absensi_tanggal',
    },
  ],
});

module.exports = Absensi;
