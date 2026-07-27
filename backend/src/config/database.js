const { Sequelize } = require('sequelize');
require('dotenv').config();

// â”€â”€â”€ Supabase (PostgreSQL) connection â”€â”€â”€
// Prefer a single connection string (Supabase "Connection string" / pooler URI).
// Falls back to discrete DB_* variables if DATABASE_URL is not set.
const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, commonOptions);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      ...commonOptions,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
    }
  );
}

module.exports = sequelize;
