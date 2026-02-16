# 推特大佬电子阅览室 - Agent Team + Skills 配置

> 开发团队 + Skills 使用策略
> 创建日期：2026-02-16

---

## 一、6 个 Agents 完整配置

### Agent 1: database-architect 🗄️
**角色**：数据库架构师
**模型**：opus（需要深度思考架构设计）

**核心任务**
- [ ] 配置 Docker Compose（PostgreSQL + pgAdmin）
- [ ] 设计数据库 Schema（kols, tweets, categories 表）
- [ ] 创建索引优化查询
- [ ] 编写数据库初始化脚本
- [ ] 编写数据导入脚本

**可用 Skills**
- `/commit` - 提交数据库配置文件（docker-compose.yml, schema.sql）

**输出文件**
- `docker-compose.yml`
- `database/schema.sql`
- `database/seed.sql`
- `scripts/import-data.ts`

**工作量**：1-2 天

---

### Agent 2: data-collector 🤖
**角色**：数据采集工程师
**模型**：opus（需要处理复杂的数据抓取逻辑）

**核心任务**
- [ ] 从调研报告中提取 150-180 个 KOL 清单
- [ ] 去重（Naval、ShaanVP 等跨类目 KOL）
- [ ] 使用 X MCP 工具抓取 KOL 基本信息
- [ ] 抓取每个 KOL 最近 50-100 条推文
- [ ] 数据清洗和格式化（JSON）
- [ ] 验证数据完整性

**可用 Skills**
- `/commit` - 提交抓取的数据文件

**使用的 MCP 工具**
- `mcp__x-mcp__scrape_profile` - 抓取 KOL 个人资料
- `mcp__x-mcp__search_twitter` - 搜索推文
- `mcp__x-mcp__scrape_timeline` - 抓取时间线

**输出文件**
- `data/kols-raw.json` - 原始 KOL 数据
- `data/tweets-raw.json` - 原始推文数据
- `data/kols-cleaned.json` - 清洗后的 KOL 数据
- `data/tweets-cleaned.json` - 清洗后的推文数据
- `scripts/scraper.ts` - 抓取脚本（可复用）

**工作量**：2-3 天

**特殊说明**：
- X MCP 工具已配置好，可以直接使用
- 如遇到限流，分批抓取（每批 20-30 个 KOL）
- 保留原始数据和清洗后数据，方便调试

---

### Agent 3: backend-developer 💻
**角色**：后端开发工程师
**模型**：opus（需要处理复杂的 API 逻辑）

**核心任务**
- [ ] 配置 PostgreSQL 连接（使用 Prisma ORM）
- [ ] 设计 API 接口结构
- [ ] 实现 5 个核心 API：
  - `GET /api/categories` - 获取所有类目
  - `GET /api/categories/[slug]` - 获取类目下的 KOL 列表
  - `GET /api/kols/[username]` - 获取 KOL 详情
  - `GET /api/kols/[username]/tweets` - 获取 KOL 推文（分页）
  - `GET /api/search?q=keyword` - 全局搜索
- [ ] 数据缓存（Redis 或内存缓存）
- [ ] 错误处理和日志

**可用 Skills**
- `/commit` - 分阶段提交 API 代码
- `/review-pr` - 如果有 PR，可以自我审查

**输出文件**
- `app/api/categories/route.ts`
- `app/api/categories/[slug]/route.ts`
- `app/api/kols/[username]/route.ts`
- `app/api/kols/[username]/tweets/route.ts`
- `app/api/search/route.ts`
- `lib/db.ts` - 数据库连接
- `prisma/schema.prisma` - Prisma Schema

**工作量**：2-3 天

**依赖**：database-architect 完成数据库设计

---

### Agent 4: frontend-developer 🎨
**角色**：前端开发工程师
**模型**：opus（需要处理复杂的 React 组件）

**核心任务**
- [ ] 实现 4 个核心页面：
  - `app/page.tsx` - 首页（7个类目卡片）
  - `app/category/[slug]/page.tsx` - 类目详情页
  - `app/kol/[username]/page.tsx` - KOL 详情页
  - `app/search/page.tsx` - 搜索页面
- [ ] 实现可复用组件：
  - `CategoryCard` - 类目卡片
  - `KOLCard` - KOL 卡片
  - `TweetCard` - 推文卡片
  - `SearchBar` - 搜索框
- [ ] 调用 Backend API
- [ ] 分页加载
- [ ] 加载状态处理
- [ ] 错误状态处理

**可用 Skills**
- `/commit` - 分阶段提交页面和组件代码
- `/review-pr` - 代码自审

**输出文件**
- `app/page.tsx`
- `app/category/[slug]/page.tsx`
- `app/kol/[username]/page.tsx`
- `app/search/page.tsx`
- `components/CategoryCard.tsx`
- `components/KOLCard.tsx`
- `components/TweetCard.tsx`
- `components/SearchBar.tsx`

**工作量**：3-4 天

**依赖**：backend-developer 完成 API + ui-designer 完成设计规范

---

### Agent 5: ui-designer 🎨
**角色**：UI/UX 设计师
**模型**：sonnet（设计决策相对直接）

**核心任务**
- [ ] 确定配色方案（主色、辅色、背景色）
- [ ] 设计类目图标（7个类目的 emoji 或图标）
- [ ] 设计组件样式规范：
  - CategoryCard 样式
  - KOLCard 样式
  - TweetCard 样式
  - Button、Input 等基础组件样式
- [ ] 响应式设计规范（桌面端 1920px、1440px、1024px）
- [ ] 字体选择（中英文字体）
- [ ] 间距规范（padding、margin）

**可用 Skills**
- `/commit` - 提交设计规范文档

**输出文件**
- `docs/design-system.md` - 设计规范文档
- `app/globals.css` - 全局样式（Tailwind 配置）
- `tailwind.config.ts` - Tailwind 自定义配置

**工作量**：1-2 天

**依赖**：无（可立即开始）

---

### Agent 6: qa-engineer 🧪
**角色**：测试工程师
**模型**：sonnet（测试任务相对明确）

**核心任务**
- [ ] 编写测试用例清单
- [ ] 功能测试：
  - 首页 7 个类目卡片是否正确显示
  - 点击类目是否正确跳转
  - KOL 列表是否正确显示
  - 推文是否正确显示
  - 搜索功能是否正常
  - Twitter 原文链接是否可跳转
- [ ] 性能测试：
  - 首页加载速度
  - 类目页加载速度
  - KOL 详情页加载速度
- [ ] 兼容性测试（Chrome, Safari, Firefox）
- [ ] 数据准确性验证（随机抽查 10 个 KOL 数据）
- [ ] 编写测试报告

**可用 Skills**
- `/commit` - 提交测试报告

**输出文件**
- `docs/test-cases.md` - 测试用例
- `docs/test-report.md` - 测试报告
- `docs/bugs.md` - Bug 清单（如果有）

**工作量**：1-2 天

**依赖**：frontend-developer 完成开发

---

## 二、开发时间线（10 个工作日）

```
Day 1-2: 基础设施准备（3 个 Agents 并行）
├─ database-architect: 搭建 Docker PostgreSQL
├─ ui-designer: 设计 UI 规范
└─ data-collector: 整理 KOL 清单 + 开始抓取

Day 3-4: 数据采集 + 后端开发（2 个 Agents 并行）
├─ data-collector: 抓取 150-180 个 KOL 数据
└─ backend-developer: 开发 API 接口

Day 5: 数据导入 + API 测试（2 个 Agents 串行）
├─ database-architect: 导入数据到数据库
└─ backend-developer: API 联调测试

Day 6-8: 前端开发（1 个 Agent）
└─ frontend-developer: 开发 4 个页面

Day 9: 联调 + 测试（2 个 Agents 并行）
├─ frontend-developer: 前后端联调
└─ qa-engineer: 功能测试

Day 10: 修复 + 上线（全员）
├─ frontend-developer: 修复 Bug
├─ qa-engineer: 回归测试
└─ Team Lead: 部署 Vercel
```

---

## 三、Skills 使用策略

### 3.1 /commit Skill
**使用场景**：每完成一个功能模块后

**使用 Agents**：
- database-architect: 提交数据库配置和 schema
- data-collector: 提交抓取的数据文件
- backend-developer: 提交 API 代码（分阶段）
- frontend-developer: 提交页面和组件代码（分阶段）
- ui-designer: 提交设计规范
- qa-engineer: 提交测试报告

**建议频率**：
- 每完成一个表/API/页面/组件就提交一次
- 保持小步快跑，便于回滚

### 3.2 /review-pr Skill（如果可用）
**使用场景**：Agent 完成一个大功能模块后，自我审查代码

**使用 Agents**：
- backend-developer: 审查 API 代码质量
- frontend-developer: 审查组件代码质量

### 3.3 其他可能的 Skills
如果有以下 Skills，也可以使用：
- `/test` - 运行测试（qa-engineer 使用）
- `/build` - 构建项目（前端/后端 使用）
- `/deploy` - 部署（Team Lead 使用）

---

## 四、Agent 协作流程

### 4.1 任务依赖关系图
```
database-architect (Day 1-2)
    ↓
data-collector (Day 1-4) → database-architect (Day 5 导入数据)
    ↓                           ↓
ui-designer (Day 1-2) → backend-developer (Day 3-5)
    ↓                           ↓
    └──────→ frontend-developer (Day 6-8)
                    ↓
            qa-engineer (Day 9)
                    ↓
            修复 + 上线 (Day 10)
```

### 4.2 每日站会（可选）
每天结束时，各 Agent 向 Team Lead 汇报：
- 今天完成了什么
- 遇到了什么问题
- 明天计划做什么

---

## 五、数据采集策略（data-collector）

### 5.1 使用 X MCP 工具
- 已配置好，可以直接使用
- 无需额外提供账号密码

### 5.2 抓取流程
```
1. 从 7 个调研报告中提取 KOL 列表
2. 去重（Naval、ShaanVP 等出现在多个类目）
3. 按类目分批抓取：
   - AI 技术: ~50 个 KOL
   - 创业出海: ~40 个 KOL
   - 投资理财: ~36 个 KOL
   - 商业财富: ~40 个 KOL
   - 设计产品: ~40 个 KOL
   - 内容创作: ~12 个 KOL
   - 营销增长: ~23 个 KOL
4. 每批抓取后休息 5 分钟（避免限流）
5. 保存原始数据 + 清洗后数据
```

### 5.3 数据格式
```json
// kols.json
[
  {
    "id": "1",
    "twitterId": "123456789",
    "username": "dotey",
    "displayName": "宝玉",
    "bio": "OpenAI Prompt 工程中文翻译者",
    "avatarUrl": "https://...",
    "followers": 85234,
    "categories": ["AI技术"],
    "tags": ["Prompt", "翻译", "AI工具"]
  }
]

// tweets.json
[
  {
    "id": "1",
    "tweetId": "1234567890",
    "kolUsername": "dotey",
    "content": "OpenAI 刚刚发布了...",
    "likes": 892,
    "retweets": 456,
    "replies": 128,
    "tweetTime": "2026-02-15T18:32:00Z",
    "tweetUrl": "https://x.com/dotey/status/1234567890"
  }
]
```

---

## 六、代码规范

### 6.1 TypeScript 严格模式
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

### 6.2 组件规范
- 使用 TypeScript 类型定义
- Props 必须定义接口
- 使用函数式组件
- 使用 React Hooks

### 6.3 文件命名
- 组件文件：PascalCase（`CategoryCard.tsx`）
- API 路由：kebab-case（`[slug]/route.ts`）
- 工具函数：camelCase（`formatDate.ts`）

---

## 七、预期交付物

### 7.1 代码仓库结构
```
推特大佬电子阅览室/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # 首页
│   ├── category/          # 类目页面
│   ├── kol/               # KOL 详情页
│   ├── search/            # 搜索页
│   └── api/               # API Routes
├── components/            # 可复用组件
├── lib/                   # 工具函数
├── data/                  # 抓取的数据
├── database/              # 数据库 Schema
├── scripts/               # 脚本
├── docs/                  # 文档
├── docker-compose.yml     # Docker 配置
└── prisma/                # Prisma Schema
```

### 7.2 文档
- `docs/design-system.md` - 设计规范
- `docs/api-documentation.md` - API 文档
- `docs/test-report.md` - 测试报告
- `docs/deployment-guide.md` - 部署指南
- `README.md` - 项目说明

---

## 八、风险控制

| 风险 | 应对措施 |
|------|---------|
| X MCP 工具限流 | 分批抓取，每批休息 5 分钟 |
| Docker 环境问题 | 提供详细安装文档 + 备选 SQLite |
| Agent 阻塞 | Team Lead 及时协调，重新分配任务 |
| Vercel 部署失败 | 准备 Railway 备选方案 |

---

**准备好了吗？确认后我立即创建这个 6 人开发团队！** 🚀
