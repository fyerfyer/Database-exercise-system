require('dotenv').config();
const request = require('supertest');
const { testConnection, close } = require('../src/db');

// 导入真实的服务器应用
const express = require('express');
const cors = require('cors');
const healthRoutes = require('../src/routes/health');

// 创建测试应用实例（使用真实配置）
const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', healthRoutes);

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
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

describe('Health Check API', () => {
  // 测试开始前等待数据库连接就绪
  beforeAll(async () => {
    // 等待一段时间让数据库启动
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  // 测试结束后清理资源
  afterAll(async () => {
    await close();
  });

  describe('GET /api/health', () => {
    it('should return health status with real database connection', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      // 应该返回 200 状态码（如果数据库连接成功）
      expect([200, 503]).toContain(response.status);
      
      // 基本属性检查
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('memory');

      // 数据库状态检查
      expect(response.body.database).toHaveProperty('status');
      expect(response.body.database).toHaveProperty('message');
      expect(['connected', 'disconnected']).toContain(response.body.database.status);

      // 如果连接成功，应该有 success: true
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.database.status).toBe('connected');
      } else if (response.status === 503) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.database.status).toBe('disconnected');
      }

      // 验证内存信息
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(typeof response.body.memory.used).toBe('number');
      expect(typeof response.body.memory.total).toBe('number');
    });

    it('should test actual database connection', async () => {
      // 直接测试数据库连接函数
      const dbTest = await testConnection();
      expect(dbTest).toHaveProperty('success');
      expect(dbTest).toHaveProperty('message');
      expect(typeof dbTest.success).toBe('boolean');
      
      if (dbTest.success) {
        expect(dbTest.message).toContain('successful');
      } else {
        expect(dbTest).toHaveProperty('error');
      }
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health');

      expect([200, 503]).toContain(response.status);
      const timestamp = response.body.timestamp;
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return uptime as a number', async () => {
      const response = await request(app)
        .get('/api/health');

      expect([200, 503]).toContain(response.status);
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return memory usage information', async () => {
      const response = await request(app)
        .get('/api/health');

      expect([200, 503]).toContain(response.status);
      const memory = response.body.memory;
      expect(typeof memory.used).toBe('number');
      expect(typeof memory.total).toBe('number');
      expect(memory.used).toBeGreaterThanOrEqual(0);
      expect(memory.total).toBeGreaterThanOrEqual(memory.used);
    });

    it('should handle health check gracefully', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return correct environment in test mode', async () => {
      const response = await request(app)
        .get('/api/health');

      expect([200, 503]).toContain(response.status);
      expect(['test', 'development']).toContain(response.body.environment);
    });
  });

  describe('GET / (root endpoint)', () => {
    it('should return API running message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'SQL-Arena API is running');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });
});