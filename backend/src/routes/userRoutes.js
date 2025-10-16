const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, registerValidation, loginValidation } = require('../controllers/userController');

// 通用频率限制配置
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` headers
    legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
    skip: (req) => process.env.NODE_ENV === 'test', // 在测试环境中跳过频率限制
  });
};

// 注册频率限制 - 每小时最多5次注册尝试
const registerLimiter = createRateLimiter(
  60 * 60 * 1000, // 1小时
  5,
  '注册请求过于频繁，请1小时后再试'
);

// 登录频率限制 - 每15分钟最多10次登录尝试
const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15分钟
  10,
  '登录请求过于频繁，请15分钟后再试'
);

// 通用认证频率限制 - 每分钟最多20次请求
const authLimiter = createRateLimiter(
  60 * 1000, // 1分钟
  20,
  '请求过于频繁，请稍后再试'
);

// 用户注册路由
// POST /api/users/register
router.post('/register', authLimiter, registerLimiter, registerValidation, register);

// 用户登录路由
// POST /api/users/login
router.post('/login', authLimiter, loginLimiter, loginValidation, login);

module.exports = router;