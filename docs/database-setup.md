# 数据库环境配置指南

> 推特大佬电子阅览室 - PostgreSQL 本地开发环境

---

## 前置要求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 已安装并运行
- Docker Compose（Docker Desktop 自带）

## 快速启动

### 1. 配置环境变量

```bash
cp .env.example .env
# 按需修改 .env 中的数据库密码等配置
```

### 2. 启动数据库

```bash
docker compose up -d
```

首次启动时会自动：
- 拉取 PostgreSQL 16 Alpine 镜像
- 创建数据库 `xkol_db`
- 执行 `database/schema.sql` 创建表结构
- 执行 `database/seed.sql` 导入初始数据

### 3. 验证数据库连接

```bash
# 方式一：使用 docker exec
docker exec -it xkol-postgres psql -U xkol -d xkol_db -c "SELECT count(*) FROM categories;"

# 方式二：使用本地 psql 客户端
psql postgresql://xkol:xkol_secret_2026@localhost:5432/xkol_db
```

### 4. 访问 pgAdmin（可选）

浏览器打开 http://localhost:5050

- 邮箱：`admin@xkol.local`
- 密码：`admin123`

添加服务器连接时使用：
- 主机名：`postgres`（Docker 内部网络名称）
- 端口：`5432`
- 用户名：`xkol`
- 密码：`xkol_secret_2026`

## 常用命令

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 停止并删除数据（重新初始化）
docker compose down -v

# 查看日志
docker compose logs postgres

# 进入 PostgreSQL Shell
docker exec -it xkol-postgres psql -U xkol -d xkol_db
```

## Next.js 应用连接

在 Next.js 项目的 `.env.local` 中配置：

```
DATABASE_URL=postgresql://xkol:xkol_secret_2026@localhost:5432/xkol_db
```

## 数据库结构

| 表名 | 说明 | 预估数据量 |
|------|------|-----------|
| `categories` | 类目表（7 个类目） | 7 行 |
| `kols` | KOL 信息表 | 150-180 行 |
| `tweets` | 推文表 | 7,500-9,000 行 |

详细表结构见 `database/schema.sql`。

## 故障排查

### 端口被占用

```bash
# 检查 5432 端口占用
lsof -i :5432

# 如端口被占用，修改 .env 中的 POSTGRES_PORT
POSTGRES_PORT=5433
```

### 重新初始化数据库

```bash
docker compose down -v
docker compose up -d
```

### Docker Desktop 未启动

确保 Docker Desktop 应用已启动且 Docker daemon 正在运行：

```bash
docker info
```
