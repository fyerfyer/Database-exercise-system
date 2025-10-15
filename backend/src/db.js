const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间
  connectionTimeoutMillis: 2000, // 连接超时时间
});

// 监听连接事件
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 执行查询的函数
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// 测试数据库连接
async function testConnection() {
  try {
    const start = Date.now();
    await pool.query('SELECT NOW()');
    const duration = Date.now() - start;
    console.log('Database connection test successful', { duration: `${duration}ms` });
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return {
      success: false,
      message: 'Database connection failed',
      error: error.message
    };
  }
}

// 优雅地关闭连接池
async function close() {
  await pool.end();
  console.log('Database connection pool closed');
}

module.exports = {
  query,
  testConnection,
  close
};