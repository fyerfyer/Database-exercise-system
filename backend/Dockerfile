FROM node:18-alpine

WORKDIR /app

# 安装postgresql客户端
RUN apk add --no-cache postgresql-client

COPY package*.json ./

RUN npm install

COPY . .

# 给entrypoint脚本执行权限
RUN chmod +x docker-entrypoint.sh docker-entrypoint-test.sh

EXPOSE 3001

CMD ["npm", "start"]