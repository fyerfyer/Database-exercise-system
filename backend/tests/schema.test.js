const { query, close } = require('../src/db');

describe('数据库Schema验证测试', () => {
  beforeAll(async () => {
    try {
      await query('SELECT NOW()');
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await close();
  });

  describe('核心表结构验证', () => {
    test('应该存在users表', async () => {
      const result = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      `);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].table_name).toBe('users');
    });

    test('users表应该包含所有必需字段', async () => {
      const result = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
      `);
      const columns = result.rows.map(row => row.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('username');
      expect(columns).toContain('email');
      expect(columns).toContain('password_hash');
    });

    test('应该存在user_profiles表', async () => {
      const result = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
      `);
      expect(result.rows).toHaveLength(1);
    });

    test('应该存在problems表', async () => {
      const result = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'problems'
      `);
      expect(result.rows).toHaveLength(1);
    });

    test('problems表应该包含必需字段', async () => {
      const result = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'problems'
      `);
      const columns = result.rows.map(row => row.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('title');
      expect(columns).toContain('description');
    });

    test('应该存在test_cases表', async () => {
      const result = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'test_cases'
      `);
      expect(result.rows).toHaveLength(1);
    });

    test('应该存在submissions表', async () => {
      const result = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'submissions'
      `);
      expect(result.rows).toHaveLength(1);
    });
  });

  describe('数据库连接健康检查', () => {
    test('数据库连接应该正常工作', async () => {
      const result = await query('SELECT 1 as test');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test).toBe(1);
    });
  });
});
