const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kelas = sequelize.define('Kelas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama_kelas: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  tingkat: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  wali_kelas_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  tahun_ajaran: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
}, {
  tableName: 'kelas',
});

module.exports = Kelas;
