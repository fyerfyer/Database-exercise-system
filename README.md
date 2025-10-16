# SQL-Arena - 数据库SQL学习练习平台

## 项目概述

SQL-Arena 是一个专注于数据库和SQL的在线学习与练习平台，采用类似LeetCode的模式，支持SQL练习题和简答题两种题型，并计划未来增加实时竞赛功能。

## 技术栈

- **前端**: React + TypeScript + 现代化UI框架
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL 15
- **缓存**: Redis (计划中)
- **容器化**: Docker + docker-compose
- **测试**: Jest + Supertest
- **数据库迁移**: db-migrate

## 项目状态

### ✅ 已完成阶段

#### 阶段 1: 项目初始化与环境搭建
- [x] 前端React项目初始化
- [x] 后端Express项目初始化
- [x] Docker开发环境配置
- [x] Makefile构建工具

#### 阶段 2: 后端基础架构搭建
- [x] PostgreSQL数据库集成
- [x] 连接池管理和健康检查
- [x] 健康检查API (`GET /api/health`)
- [x] 统一错误处理中间件
- [x] Jest测试框架集成
- [x] Docker隔离测试环境

#### 阶段 3: 数据库Schema设计与迁移
- [x] db-migrate迁移工具集成
- [x] 11个核心业务表设计
- [x] 完整的外键约束和索引
- [x] Docker自动化迁移流程
- [x] Schema验证测试(30/31通过)

### 🔄 当前阶段

**阶段 4: 后端用户注册接口开发** (准备开始)
- [ ] 用户注册API (`POST /api/users/register`)
- [ ] 密码哈希和验证
- [ ] 请求体验证中间件
- [ ] 用户系统单元测试

## 数据库Schema

### 核心业务表

1. **用户系统**
   - `users` - 用户基础信息
   - `user_profiles` - 用户扩展信息和学习统计

2. **题库管理**
   - `problems` - 题目信息
   - `test_cases` - 测试用例

3. **提交判题**
   - `submissions` - 提交记录
   - `submission_results` - 判题结果

4. **竞赛系统**
   - `competitions` - 竞赛信息
   - `competition_participants` - 参与者记录

5. **系统管理**
   - `user_problem_stats` - 用户题目统计
   - `system_configs` - 系统配置
   - `notifications` - 通知管理

## 快速开始

### 环境要求
- Node.js 18+
- Docker & docker-compose
- PostgreSQL 15

### 开发环境启动

```bash
# 克隆项目
git clone <repository-url>
cd database-exercise-system

# 启动开发环境
make up

# 查看服务状态
make logs

# 停止服务
make down
```

### 测试

```bash
# 运行测试套件
make test

# 清理测试环境
make test-clean

# 清理所有资源
make clean-all
```

### 数据库迁移

```bash
# 进入后端目录
cd backend

# 执行迁移
npm run migrate:up

# 创建新迁移
npm run migrate:create <migration-name>

# 回滚迁移
npm run migrate:down
```

## API端点

### 当前可用端点

- `GET /` - API基础状态检查
- `GET /api/health` - 健康检查，包含数据库状态和系统信息

### 健康检查响应示例

```json
{
  "status": "ok",
  "timestamp": "2025-10-16T00:00:00.000Z",
  "uptime": 123456,
  "environment": "development",
  "memory": {
    "used": "45.2MB",
    "total": "64.0MB"
  },
  "database": {
    "status": "connected",
    "pool": {
      "totalCount": 5,
      "idleCount": 4,
      "waitingCount": 0
    }
  }
}
```

## 项目结构

```
database-exercise-system/
├── frontend/                   # React前端项目
├── backend/                    # Node.js后端项目
│   ├── src/
│   │   ├── server.js          # Express应用入口
│   │   ├── db.js              # 数据库连接
│   │   └── routes/            # API路由
│   ├── tests/                 # 测试用例
│   ├── migrations/            # 数据库迁移
│   └── docker-entrypoint.sh   # Docker启动脚本
├── docker-compose.yml         # 开发环境配置
├── docker-compose.test.yml    # 测试环境配置
├── Makefile                   # 构建脚本
└── docs/                      # 项目文档
```