# X 大佬电子阅览室 - MVP PRD

> 产品需求文档 v1.0
> 创建日期：2026-02-16
> 负责人：liyadong

---

## 一、产品定位

### 1.1 核心价值
让 Twitter 上的顶级 KOL 知识触手可得 - 按领域分类，一站式浏览大佬的历史推文。

### 1.2 目标用户
- **主要用户**：国内开发者、创业者、产品经理、投资人
- **需求痛点**：
  - Twitter 上优质内容分散，难以系统学习某个领域知识
  - 不知道哪些 KOL 值得关注
  - 想看某个大佬的历史精华推文，但 Twitter 搜索体验差

### 1.3 产品形态
Web 应用，桌面端优先（移动端暂不做）

---

## 二、MVP 功能范围

### 2.1 核心功能（Phase 1，2周交付）

**✅ 必须有**
1. **首页** - 7 个类目卡片展示
2. **类目详情页** - 展示该类目下的所有 KOL 列表
3. **KOL 详情页** - KOL 简介 + 最近 50-100 条推文时间线
4. **基础搜索** - 按 KOL 名称或类目搜索

**❌ 暂不做**
- AI 对话功能（Phase 2）
- 自动更新（Phase 2）
- 用户登录/收藏功能
- 移动端适配
- 其他 81 个类目（先验证 7 个核心类目）

### 2.2 数据范围

**类目覆盖（7个）**
1. 🤖 AI 技术
2. 🚀 创业出海
3. 💰 投资理财
4. 💼 商业财富
5. 🎨 设计产品
6. ✍️ 内容创作
7. 📈 营销增长

**KOL 数量：待确认** ⚠️
- 方案 A：35 个（每类目 5 个，最小验证）
- 方案 B：150-180 个（全量，调研的所有去重后 KOL）

**推文数据：** 每个 KOL 最近 50-100 条推文

---

## 三、技术架构

### 3.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | Next.js 16 + React 19 | 基于现有 shipany-template-two |
| UI 组件 | Tailwind CSS + shadcn/ui | 模板已集成 |
| 数据库 | Supabase (PostgreSQL) | 免费 tier 500MB |
| 部署 | Vercel | 免费部署，自动 HTTPS + CDN |
| 语言 | TypeScript | 类型安全 |

### 3.2 数据模型

```typescript
// 类目
interface Category {
  id: string;
  name: string;          // "AI 技术"
  slug: string;          // "ai-tech"
  description: string;
  icon: string;
  kolCount: number;
  tweetCount: number;
}

// KOL
interface KOL {
  id: string;
  twitterId: string;     // Twitter ID
  username: string;      // @dotey
  displayName: string;   // 宝玉
  bio: string;
  avatarUrl: string;
  followers: number;
  categories: string[];  // 可属于多个类目
  tags: string[];        // ["Prompt", "翻译", "AI工具"]
  profileUrl: string;    // Twitter 主页链接
}

// 推文
interface Tweet {
  id: string;
  tweetId: string;
  kolId: string;
  content: string;
  mediaUrls: string[];
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  tweetTime: Date;
  tweetUrl: string;      // 链接到 Twitter 原文
}
```

### 3.3 路由结构

```
/                          首页
├─ /category/[slug]        类目详情页
│  └─ /category/ai-tech    示例
├─ /kol/[username]         KOL 详情页
│  └─ /kol/dotey           示例
├─ /search                 搜索页面
└─ /about                  关于页面
```

---

## 四、数据策略

### 4.1 初始数据采集（待确认）⚠️

**方式：** 手动抓取
**工具：** X MCP 工具 或 twikit
**时间投入：**
- 35 个 KOL：2-3 小时
- 150-180 个 KOL：6-10 小时

**执行人：** 待确认
**执行时间：** 待确认

### 4.2 数据更新策略

**MVP 阶段：** 静态数据，不更新
**Phase 2（有用户后）：** 实施自动化日更
- 智能调度器（活跃度分级）
- 增量更新（since_id 节省 95% 配额）
- 成本：~$2/月

---

## 五、UI/UX 设计

### 5.1 设计原则

- **中文优先**：界面全中文，针对国内用户
- **桌面端优先**：移动端暂不适配
- **简洁明了**：信息密度适中，易于浏览
- **快速访问**：直达大佬推文，减少点击层级

### 5.2 页面设计（已确认）

详见上文第三、四部分的页面设计细节。

### 5.3 本地化细节

- 时间格式：2026年2月15日 18:32
- 数字格式：85,234 粉丝
- KOL 名称：中文昵称优先，副标题显示 @username
- 微信分享优化：配置分享卡片

---

## 六、开发计划

### 6.1 时间线（2周）

**Week 1：核心功能**
- Day 1-2：数据库设计 + Supabase 配置 + 数据导入
- Day 3-4：首页 + 类目详情页
- Day 5-7：KOL 详情页 + 推文时间线

**Week 2：优化上线**
- Day 8-9：搜索功能
- Day 10-11：UI 优化 + 微信分享
- Day 12-13：性能优化 + SEO
- Day 14：部署上线 Vercel

### 6.2 里程碑

- ✅ Day 7：核心功能可演示
- ✅ Day 14：MVP 正式上线

---

## 七、待确认事项 ⚠️

### 7.1 数据范围决策（重要）

**问题：** MVP 使用多少个 KOL？
- [ ] 方案 A：35 个（每类目 5 个）
- [ ] 方案 B：150-180 个（调研的全部去重 KOL）

**影响：**
- 数据采集工作量：2-3 小时 vs 6-10 小时
- 产品价值感知：精简 vs 丰富

**建议：** 方案 B（150-180 个），理由：
1. 数据已经调研完毕，增量工作不大
2. 更能体现产品价值（"电子阅览室"应该内容丰富）
3. 避免后续频繁补充数据

### 7.2 初始数据采集（重要）

**问题：** 谁来执行初始数据采集？
- [ ] 你自己手动抓取
- [ ] 我帮你写脚本自动抓取
- [ ] 我帮你抓取（需要你提供 Twitter 账号）

**建议：** 我帮你写一个数据采集脚本，你运行一次导入数据库

### 7.3 产品品牌（次要）

**问题：** 产品正式名称和域名？
- 当前名称：「X 大佬电子阅览室」（有点长）
- 备选名称：「大佬阅览室」「X 知识库」「推特大佬」
- 域名：待确认（如 x-kol.com, twitter-kol.cn）

### 7.4 内容审核（次要）

**问题：** 如何处理敏感内容？
- [ ] 不做过滤（展示原始推文）
- [ ] 基础敏感词过滤
- [ ] 人工审核精选推文

**建议：** MVP 阶段不做过滤，Phase 2 根据反馈决定

### 7.5 成功指标（次要）

**问题：** 如何判断 MVP 成功？
- [ ] 上线后 7 天内获得 X 个用户
- [ ] 用户平均停留时间 > X 分钟
- [ ] 用户反馈：X% 愿意长期使用

**建议：** 先定性观察，收集用户反馈，不设定量化指标

---

## 八、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Twitter API 限流 | 数据抓取失败 | 使用多个方案备份（MCP + twikit + TwitterAPI.io） |
| 国内访问 Vercel 慢 | 用户体验差 | MVP 先验证，Phase 2 考虑迁移国内服务器 |
| 用户对静态数据不满意 | 留存率低 | 快速迭代 Phase 2 自动更新 |
| 数据版权问题 | 法律风险 | 仅展示公开内容 + 链接到原推 + 标注来源 |

---

## 九、下一步行动

### 9.1 决策清单（需要你确认）

- [ ] **数据范围**：35 个 KOL 还是 150-180 个？
- [ ] **数据采集**：谁来执行？什么时候执行？
- [ ] **产品名称**：确定最终产品名称和域名？

### 9.2 开发启动条件

✅ 完成以上 3 个决策后，即可开始开发

### 9.3 预期交付物

- [ ] 完整的 Web 应用（部署在 Vercel）
- [ ] 数据库结构 + 初始数据
- [ ] 源代码（推送到 GitHub）
- [ ] 部署文档 + 使用说明

---

## 十、附录

### 10.1 参考资料

- [KOL 筛选标准调研](/research/kol_selection_criteria.md)
- [内容抓取技术方案](/research/twitter_scraping_technical_solution.md)
- [各类目 KOL 调研报告](/research/)
- [MVP KOL 数量统计](/research/mvp_kol_statistics.md)
- [综合调研摘要](/research/00_comprehensive_research_summary.md)

### 10.2 联系方式

- GitHub: /Users/liyadong/Documents/GitHub/把 X 上的大佬们变成你的 Agent
- 项目路径: /Users/liyadong/Documents/GitHub/x-twitter-agent
