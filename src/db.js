const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ...(process.env.DB_SSL === 'true'
    ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
    : {})
};

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = initializeDatabase();
  }
  return poolPromise;
}

async function initializeDatabase() {
  if (!DB_CONFIG.host || !DB_CONFIG.user || !DB_CONFIG.database) {
    throw new Error(
      'Konfigurasi database belum lengkap. Pastikan env var DB_HOST, DB_USER, DB_PASSWORD, DB_NAME sudah di-set.'
    );
  }

  const pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  const sqlFile = path.join(__dirname, 'database', 'query.sql');
  if (fs.existsSync(sqlFile)) {
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    const statements = sqlContent
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const stmt of statements) {
      const normalized = stmt.replace(/^CREATE TABLE\s+(\w+)/i, 'CREATE TABLE IF NOT EXISTS $1');
      try {
        await pool.query(normalized);
      } catch (err) {
        console.error('Gagal menjalankan statement schema:', err.message);
      }
    }
  }

  const conn = await pool.getConnection();
  conn.release();
  console.log(`Database '${DB_CONFIG.database}' ready and connected.`);

  return pool;
}

exports.query = async (sql, values = []) => {
  try {
    const pool = await getPool();
    const koneksi = await pool.getConnection();
    try {
      const hasil = await koneksi.query(sql, values);
      return hasil;
    } finally {
      koneksi.release();
    }
  } catch (error) {
    console.error('DB QUERY ERROR:', error.message);
    throw error;
  }
};