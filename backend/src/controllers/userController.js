const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');

// JWT密钥，从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_here';

// JWT密钥安全验证
if (!JWT_SECRET || JWT_SECRET === 'your_fallback_secret_here') {
  console.warn('警告：JWT密钥未正确配置，请设置JWT_SECRET环境变量');
  if (process.env.NODE_ENV === 'production') {
    console.error('生产环境必须设置安全的JWT密钥！');
    process.exit(1);
  }
}

// 通用错误处理函数
const handleError = (res, error, defaultMessage = '服务器内部错误', statusCode = 500) => {
  console.error('API错误:', error);
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? defaultMessage : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
};

// 验证错误响应函数
const handleValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: '输入验证失败',
    errors: errors.array()
  });
};

// 成功响应函数
const handleSuccess = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  if (data) {
    response.data = data;
  }
  res.status(statusCode).json(response);
};

// 生成JWT Token的通用函数
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 用户注册
const register = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, errors);
    }

    const { username, email, password } = req.body;

    // 检查用户名或邮箱是否已存在
    const existingUserQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
    const existingUser = await query(existingUserQuery, [username, email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 密码哈希处理
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const insertUserQuery = `
      INSERT INTO users (username, email, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, username, email, created_at
    `;

    const result = await query(insertUserQuery, [username, email, hashedPassword]);
    const newUser = result.rows[0];

    // 生成JWT Token
    const token = generateToken(newUser);

    // 构建用户数据
    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.created_at
    };

    return handleSuccess(res, '用户注册成功', { user: userData, token }, 201);

  } catch (error) {
    return handleError(res, error, '注册过程中发生错误');
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, errors);
    }

    const { email, password } = req.body;

    // 查找用户
    const findUserQuery = 'SELECT id, username, email, password_hash FROM users WHERE email = $1';
    const result = await query(findUserQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const user = result.rows[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成JWT Token
    const token = generateToken(user);

    // 构建用户数据
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    return handleSuccess(res, '登录成功', { user: userData, token });

  } catch (error) {
    return handleError(res, error, '登录过程中发生错误');
  }
};

// 注册验证规则
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),

  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字')
];

// 登录验证规则
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

module.exports = {
  register,
  login,
  registerValidation,
  loginValidation
};