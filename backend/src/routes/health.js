const express = require('express');
const { testConnection } = require('../db');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    健康检查接口
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    const dbTest = await testConnection();

    // 准备响应数据
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbTest.success ? 'connected' : 'disconnected',
        message: dbTest.message,
        ...(dbTest.error && { error: dbTest.error })
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      }
    };

    // 如果数据库连接失败，返回503状态
    if (!dbTest.success) {
      return res.status(503).json({
        success: false,
        ...healthData,
        message: 'Service unavailable - database connection failed'
      });
    }

    // 一切正常，返回200状态
    res.status(200).json({
      success: true,
      ...healthData
    });

  } catch (error) {
    console.error('Health check failed:', error);

    res.status(500).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;