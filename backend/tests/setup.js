// 测试环境设置
require('dotenv').config({ path: '.env.test' });

// 设置测试超时时间
jest.setTimeout(30000);

// 监听未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});