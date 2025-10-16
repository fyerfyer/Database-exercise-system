#!/bin/sh

# Docker入口脚本 - 等待数据库就绪并执行迁移

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}SQL-Arena Backend Starting...${NC}"

# 等待PostgreSQL数据库服务就绪
echo -e "${YELLOW}Waiting for PostgreSQL database...${NC}"
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo -e "${RED}Database is unavailable - sleeping${NC}"
  sleep 2
done

echo -e "${GREEN}Database is ready!${NC}"

# 等待数据库完全启动（额外等待时间）
echo -e "${YELLOW}Waiting for database to fully initialize...${NC}"
sleep 5

# 执行数据库迁移
echo -e "${YELLOW}Running database migrations...${NC}"
if npm run migrate:up; then
  echo -e "${GREEN}Database migrations completed successfully!${NC}"
else
  echo -e "${RED}Database migration failed!${NC}"
  exit 1
fi

# 启动应用
echo -e "${GREEN}Starting the application...${NC}"
exec npm start