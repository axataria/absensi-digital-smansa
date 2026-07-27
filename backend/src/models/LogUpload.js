const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogUpload = sequelize.define('LogUpload', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  total_baris: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  berhasil: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gagal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  diupload_oleh: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'log_upload',
});

module.exports = LogUpload;
