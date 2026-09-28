const mysql = require('mysql2/promise');
const config = require('./environment');

// Create MySQL connection pool
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  decimalNumbers: true
});

// Test connection on boot
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Connected successfully to database: ${config.db.database} on ${config.db.host}:${config.db.port}`);
    connection.release();
    return true;
  } catch (err) {
    console.error(`[MySQL Connection Error]:`, err.message);
    return false;
  }
};

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  execute: (sql, params) => pool.execute(sql, params),
  testConnection
};
