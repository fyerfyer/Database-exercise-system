require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3001;

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', healthRoutes);
app.use('/api/users', userRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'SQL-Arena API is running' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 只在非测试环境启动服务器
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`SQL-Arena API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

// 导出app用于测试
module.exports = app;