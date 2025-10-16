'use strict';

/**
 * 数据库Schema集成测试
 * 验证所有核心表和字段是否正确创建
 */

const { Pool } = require('pg');
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

describe('数据库Schema验证测试', () => {
  let testDb;

  beforeAll(async () => {
    // 使用测试数据库连接
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sql_arena_test';
    testDb = new Pool({
      connectionString,
      ssl: false
    });

    // 等待数据库连接就绪
    await testDb.query('SELECT NOW()');
  });

  afterAll(async () => {
    if (testDb) {
      await testDb.end();
    }
    await close();
  });

  describe('核心表结构验证', () => {
    test('应该存在users表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('users');
    });

    test('users表应该包含所有必需字段', async () => {
      const result = await testDb.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map(row => row.column_name);

      // 验证必需字段存在
      expect(columns).toContain('id');
      expect(columns).toContain('username');
      expect(columns).toContain('email');
      expect(columns).toContain('password_hash');
      expect(columns).toContain('role');
      expect(columns).toContain('level');
      expect(columns).toContain('experience');
      expect(columns).toContain('is_active');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');

      // 验证主键约束
      const idColumn = result.rows.find(row => row.column_name === 'id');
      expect(idColumn.data_type).toBe('integer');

      // 验证非空约束
      const usernameColumn = result.rows.find(row => row.column_name === 'username');
      expect(usernameColumn.is_nullable).toBe('NO');

      const emailColumn = result.rows.find(row => row.column_name === 'email');
      expect(emailColumn.is_nullable).toBe('NO');
    });

    test('应该存在user_profiles表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('user_profiles');
    });

    test('应该存在problems表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'problems'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('problems');
    });

    test('problems表应该包含必需字段', async () => {
      const result = await testDb.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'problems'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map(row => row.column_name);

      expect(columns).toContain('id');
      expect(columns).toContain('title');
      expect(columns).toContain('description');
      expect(columns).toContain('type');
      expect(columns).toContain('difficulty');
      expect(columns).toContain('category');
      expect(columns).toContain('tags');
      expect(columns).toContain('table_schema');
      expect(columns).toContain('initial_data');
      expect(columns).toContain('default_score');
      expect(columns).toContain('is_published');
      expect(columns).toContain('created_by');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');
    });

    test('应该存在test_cases表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'test_cases'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('test_cases');
    });

    test('应该存在submissions表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'submissions'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('submissions');
    });

    test('应该存在submission_results表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'submission_results'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('submission_results');
    });

    test('应该存在competitions表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'competitions'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('competitions');
    });

    test('应该存在competition_participants表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'competition_participants'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('competition_participants');
    });

    test('应该存在user_problem_stats表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_problem_stats'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('user_problem_stats');
    });

    test('应该存在system_configs表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'system_configs'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('system_configs');
    });

    test('应该存在notifications表', async () => {
      const result = await testDb.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'notifications'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('notifications');
    });
  });

  describe('外键约束验证', () => {
    test('user_profiles表应该有外键约束到users表', async () => {
      const result = await testDb.query(`
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'user_profiles'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].column_name).toBe('user_id');
      expect(result.rows[0].foreign_table_name).toBe('users');
      expect(result.rows[0].foreign_column_name).toBe('id');
    });

    test('problems表应该有外键约束到users表', async () => {
      const result = await testDb.query(`
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'problems'
          AND kcu.column_name = 'created_by'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].column_name).toBe('created_by');
      expect(result.rows[0].foreign_table_name).toBe('users');
    });

    test('submissions表应该有外键约束到users和problems表', async () => {
      const result = await testDb.query(`
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'submissions'
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(2);

      const userFk = result.rows.find(row => row.column_name === 'user_id');
      expect(userFk).toBeDefined();
      expect(userFk.foreign_table_name).toBe('users');

      const problemFk = result.rows.find(row => row.column_name === 'problem_id');
      expect(problemFk).toBeDefined();
      expect(problemFk.foreign_table_name).toBe('problems');
    });
  });

  describe('索引验证', () => {
    test('users表应该有username和email的索引', async () => {
      const result = await testDb.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'users'
        AND (indexname LIKE '%username%' OR indexname LIKE '%email%')
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(2);
    });

    test('problems表应该有类型、难度和分类的索引', async () => {
      const result = await testDb.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'problems'
        AND (indexname LIKE '%type%' OR indexname LIKE '%difficulty%' OR indexname LIKE '%category%')
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(3);
    });

    test('submissions表应该有用户ID、题目ID和状态的索引', async () => {
      const result = await testDb.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'submissions'
        AND (indexname LIKE '%user_id%' OR indexname LIKE '%problem_id%' OR indexname LIKE '%status%')
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('数据类型验证', () => {
    test('users表的字段应该有正确的数据类型', async () => {
      const result = await testDb.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        AND column_name IN ('username', 'email', 'password_hash')
      `);

      const usernameCol = result.rows.find(row => row.column_name === 'username');
      expect(usernameCol.data_type).toBe('character varying');
      expect(usernameCol.character_maximum_length).toBe(50);

      const emailCol = result.rows.find(row => row.column_name === 'email');
      expect(emailCol.data_type).toBe('character varying');
      expect(emailCol.character_maximum_length).toBe(255);
    });

    test('problems表的tags字段应该是数组类型', async () => {
      const result = await testDb.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'problems'
        AND column_name = 'tags'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('ARRAY');
    });
  });

  describe('API集成测试', () => {
    test('健康检查API应该返回数据库状态', async () => {
      const response = await request(app)
        .get('/api/health');

      // 应该返回 200 或 503 状态码（取决于数据库连接状态）
      expect([200, 503]).toContain(response.status);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('status');
    });
  });
});