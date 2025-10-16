// 测试环境设置
require('dotenv').config({ path: '.env.test' });

// 设置测试超时时间
jest.setTimeout(60000);

// 监听未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 全局测试前后设置
beforeAll(async () => {
  // 等待数据库连接稳定
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  // 清理资源
  await new Promise(resolve => setTimeout(resolve, 1000));
});