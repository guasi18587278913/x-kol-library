# 推特大佬电子阅览室 V2 改进计划

日期：2026-02-17
目标用户：中国大陆用户（无需翻墙访问）

---

## 核心需求

1. **首页改版**：去掉精选推文和最新推文，改为分类 + 每个分类下所有 KOL 横向卡片
2. **推文 Modal**：点击推文卡片弹出 Modal，展示完整原文 + 中文翻译 + 图片
3. **KOL 头像**：使用真实 Twitter 头像（存入 R2）
4. **图片支持**：抓取推文图片并存入 Cloudflare R2（绕过推特 CDN 封锁）
5. **翻译上线**：部署 cron 服务，对现有英文推文触发翻译

---

## 技术架构决策

### 图片存储：Cloudflare R2
- 推特 CDN（pbs.twimg.com）在中国被墙，必须转存
- 抓取时：下载图片 → 上传 R2 → 存 R2 URL 到数据库
- 成本：10GB 免费，流量永远免费，预计费用 $0/月

### 头像方案
- 抓取 KOL 头像 URL → 下载 → 上传 R2 → 存 R2 URL
- 前端展示使用 R2 URL，不再依赖推特 CDN

### 推文 Modal
- 使用 shadcn/ui Dialog 组件
- 展示：完整原文 + content_zh（中文翻译）+ media_urls（R2 图片）+ 互动数据
- 点击任意推文卡片触发，点击遮罩或 X 关闭

---

## 开发任务分工

### Backend Engineer 负责

**Task A：Cloudflare R2 基础设施**
- 创建 `lib/r2.ts`：R2 客户端初始化 + 图片上传函数
- 依赖：`@aws-sdk/client-s3`（R2 兼容 S3 API）
- 环境变量：`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

**Task B：更新数据库 Schema**
- `kols` 表：`avatar_url` 字段已存在，改为存 R2 URL
- `tweets` 表：`media_urls` 字段已存在（JSONB），存 R2 URL 数组
- `tweets` 表：`tweet_url` 字段已存在，存单条推文链接（非主页链接）
- 无需 migration，字段已有，只是数据需要更新

**Task C：更新抓取脚本**
- 更新 `scripts/scrape-kols.ts` 中的 `McpPost` interface，添加 `imageUrls?: string[]` 和 `tweetUrl?: string`
- 更新 `processMcpProfile` 函数，处理图片 URL 和推文 URL
- 添加 R2 上传逻辑：抓取后自动下载图片 → 上传 R2 → 替换 URL
- 注意：实际执行抓取由主 Agent（有 X MCP 权限）负责，脚本只需准备好

**Task D：翻译 cron 服务部署说明**
- 更新 `services/cron/` 配置
- 写出 Railway 部署步骤文档（写入 docs/deployment/railway.md）
- 确认 DATABASE_URL 格式与 cron 服务兼容

### Frontend Engineer 负责

**Task E：首页改版（使用 frontend-design + shadcn-ui skills）**
- 修改 `app/page.tsx`
- 删除：FeaturedTweets section、LatestTweets section
- 新增：`CategorySection` 组件
  - 每个分类：标题 + 图标 + "查看全部" 链接
  - 该分类下所有 KOL 卡片：横向滚动排列
  - KOL 卡片展示：头像 + 显示名 + @username + 粉丝数
- 获取数据：需要新增 `getKOLsByCategory()` 查询函数

**Task F：推文 Modal（使用 shadcn-ui skill）**
- 新建 `components/TweetModal.tsx`
- 使用 shadcn/ui `Dialog` 组件
- Modal 内容：
  - 顶部：KOL 头像 + 名字 + @username + 时间
  - 正文：完整推文原文
  - 翻译：如果 content_zh 非空，显示中文翻译（带分割线）
  - 图片：如果 media_urls 非空，显示图片网格
  - 底部：点赞/转发/评论数 + X 原文链接（新标签页打开）
- 更新 `TweetCard` 组件：去掉右上角跳转图标，点击整个卡片触发 Modal

**Task G：头像组件更新（使用 vercel-react-best-practices skill）**
- 更新 `components/KOLCard.tsx` 和 `components/TweetCard.tsx`
- 使用 Next.js `Image` 组件加载头像
- 更新 `next.config.js`：添加 R2 域名到 `images.remotePatterns`
- 添加头像加载失败时的 fallback（显示用户名首字母）

### 主 Agent（我）负责

**Task H：实际执行数据重新抓取**
- 等 Task A/C 完成后执行
- 用 X MCP 工具重新抓取所有 KOL
- 捕捉：头像 URL、单条推文 URL、推文图片 URL
- 上传图片到 R2，更新数据库

**Task I：触发翻译**
- 等 cron 服务部署后，手动触发一次翻译
- 或用本地脚本直接调用翻译 API

### QA（使用 code-review + web-design-guidelines skills）

**Task J：代码审查**
- 调用 `code-review` skill 审查所有修改过的文件
- 重点检查：R2 集成安全性、Modal 无障碍访问、Next.js Image 优化

---

## 执行顺序

```
Phase 1（并行）：Task A + Task E + Task F
Phase 2（依赖 A）：Task C
Phase 3（依赖 C）：Task H（主 Agent 重新抓取）
Phase 4（并行）：Task D + Task G
Phase 5：Task I（触发翻译）
Phase 6：Task J（代码审查）
```

---

## 环境变量清单（需新增）

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=xkol-media
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

这些需要在 Cloudflare Dashboard 创建 R2 Bucket 后获取，然后分别加到：
- Vercel 环境变量（前端/API 用）
- Railway/Render 环境变量（cron 服务用）
