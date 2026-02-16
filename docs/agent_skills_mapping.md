# Agent Team + Skills 完整映射

> 充分利用所有可用 Skills 的开发计划
> 创建日期：2026-02-16

---

## 可用 Skills 清单（本项目相关）

从你的 Skills 目录中，以下是本项目可以使用的：

### 开发类 Skills
1. ✅ **frontend-design** - 前端设计
2. ✅ **web-design-guidelines** - Web 设计规范
3. ✅ **shadcn-ui** - shadcn/ui 组件生成
4. ✅ **vercel-react-best-practices** - React/Next.js 最佳实践
5. ✅ **code-review** - 代码审查
6. ✅ **seo-audit** - SEO 审计

### 辅助类 Skills
7. ✅ **brainstorming** - 头脑风暴（已使用）

---

## Agent 1: database-architect 🗄️

**角色**：数据库架构师
**模型**：opus

**核心任务**
- Docker PostgreSQL 配置
- 数据库 Schema 设计
- 索引优化
- 数据导入脚本

**使用的 Skills**
| Skill | 使用场景 | 何时调用 |
|-------|---------|---------|
| **code-review** | 审查 schema.sql 设计是否合理 | 完成 schema 设计后 |
| **vercel-react-best-practices** | 了解 Next.js 数据库连接最佳实践 | 开始设计数据库连接层时 |

**Skill 调用示例**
```
1. 设计完 schema.sql 后:
   /skill code-review - 审查数据库设计

2. 设计数据库连接层时:
   /skill vercel-react-best-practices - 了解 Next.js + PostgreSQL 最佳实践
```

**交付物**
- `docker-compose.yml`
- `database/schema.sql` ✅ code-review
- `lib/db.ts` ✅ vercel-react-best-practices
- `scripts/import-data.ts`

---

## Agent 2: data-collector 🤖

**角色**：数据采集工程师
**模型**：opus

**核心任务**
- 提取 150-180 个 KOL 清单
- 使用 X MCP 工具抓取数据
- 数据清洗和格式化

**使用的 Skills**
| Skill | 使用场景 | 何时调用 |
|-------|---------|---------|
| **code-review** | 审查抓取脚本代码质量 | 完成抓取脚本后 |

**Skill 调用示例**
```
1. 完成 scraper.ts 后:
   /skill code-review - 审查抓取脚本
```

**交付物**
- `data/kols.json`
- `data/tweets.json`
- `scripts/scraper.ts` ✅ code-review

---

## Agent 3: backend-developer 💻

**角色**：后端开发工程师
**模型**：opus

**核心任务**
- Next.js API Routes 开发
- 5 个核心 API 接口
- 数据缓存优化

**使用的 Skills**
| Skill | 使用场景 | 何时调用 |
|-------|---------|---------|
| **vercel-react-best-practices** | 学习 Next.js API Routes 最佳实践 | 开始开发 API 前 |
| **code-review** | 审查 API 代码质量、性能、安全性 | 完成每个 API 后 |
| **seo-audit** | 确保 API 返回的数据有利于 SEO | API 开发完成后 |

**Skill 调用示例**
```
1. 开始开发前:
   /skill vercel-react-best-practices - 学习 Next.js 15 API Routes 最佳实践

2. 完成 categories API 后:
   /skill code-review app/api/categories/route.ts

3. 完成所有 API 后:
   /skill seo-audit - 检查 API 响应是否有利于 SEO
```

**交付物**
- `app/api/categories/route.ts` ✅ code-review
- `app/api/categories/[slug]/route.ts` ✅ code-review
- `app/api/kols/[username]/route.ts` ✅ code-review
- `app/api/kols/[username]/tweets/route.ts` ✅ code-review
- `app/api/search/route.ts` ✅ code-review
- 所有 API ✅ seo-audit

---

## Agent 4: frontend-developer 🎨

**角色**：前端开发工程师
**模型**：opus

**核心任务**
- 4 个核心页面开发
- 可复用组件开发
- 性能优化

**使用的 Skills（最多！）**
| Skill | 使用场景 | 何时调用 |
|-------|---------|---------|
| **vercel-react-best-practices** | 学习 Next.js 15 最佳实践 | 开始开发前 |
| **frontend-design** | 获取前端设计建议和模式 | 开始设计组件前 |
| **shadcn-ui** | 生成和配置 shadcn/ui 组件 | 需要添加组件时 |
| **web-design-guidelines** | 遵循 Web 设计规范 | 设计页面布局时 |
| **code-review** | 审查组件代码质量 | 完成每个组件后 |
| **seo-audit** | 优化页面 SEO（meta tags, 语义化 HTML） | 完成页面后 |

**Skill 调用示例**
```
1. 开始开发前:
   /skill vercel-react-best-practices - 学习 Next.js 15 最佳实践
   /skill frontend-design - 获取前端设计建议

2. 添加 shadcn/ui 组件时:
   /skill shadcn-ui - 添加 Card、Avatar、Badge 等组件

3. 设计页面布局时:
   /skill web-design-guidelines - 遵循设计规范

4. 完成 CategoryCard 组件后:
   /skill code-review components/CategoryCard.tsx

5. 完成首页后:
   /skill seo-audit app/page.tsx - 优化 SEO
```

**交付物**
- `app/page.tsx` ✅ seo-audit
- `app/category/[slug]/page.tsx` ✅ seo-audit
- `app/kol/[username]/page.tsx` ✅ seo-audit
- `app/search/page.tsx` ✅ seo-audit
- `components/CategoryCard.tsx` ✅ code-review
- `components/KOLCard.tsx` ✅ code-review
- `components/TweetCard.tsx` ✅ code-review
- `components/SearchBar.tsx` ✅ code-review

---

## Agent 5: ui-designer 🎨

**角色**：UI/UX 设计师
**模型**：sonnet

**核心任务**
- UI 设计规范
- 配色方案
- shadcn/ui 主题配置
- 组件样式设计

**使用的 Skills**
| Skill | 使用场景 | 何时调用 |
|-------|---------|---------|
| **web-design-guidelines** | 学习 Web 设计最佳实践 | 开始设计前 |
| **frontend-design** | 获取前端设计建议 | 设计组件样式时 |
| **shadcn-ui** | 配置 shadcn/ui 主题 | 设置组件库时 |

**Skill 调用示例**
```
1. 开始设计前:
   /skill web-design-guidelines - 学习设计规范
   /skill frontend-design - 获取设计建议

2. 配置 shadcn/ui 时:
   /skill shadcn-ui - 配置主题和组件

3. 设计组件样式时:
   /skill frontend-design - 获取样式建议
```

**交付物**
- `docs/design-system.md` ✅ web-design-guidelines
- `app/globals.css` ✅ frontend-design
- `tailwind.config.ts` ✅ shadcn-ui
- `components.json` ✅ shadcn-ui

---

## Agent 6: qa-engineer 🧪

**角色**：测试工程师
**模型**：sonnet

**核心任务**
- 功能测试
- 性能测试
- SEO 验证
- 兼容性测试

**使用的 Skills**
| Skill | 使用场景 | 何时调用 |
|-------|---------|---------|
| **seo-audit** | 全面审计整个网站的 SEO | 网站开发完成后 |
| **code-review** | 审查测试代码（如果写测试脚本） | 完成测试脚本后 |

**Skill 调用示例**
```
1. 网站开发完成后:
   /skill seo-audit - 全站 SEO 审计

2. 完成测试脚本后:
   /skill code-review tests/ - 审查测试代码
```

**交付物**
- `docs/test-cases.md`
- `docs/test-report.md`
- `docs/seo-audit-report.md` ✅ seo-audit

---

## Skills 使用时机总览

### 📅 开发前期（Day 1-2）
```
database-architect:
  └─ /skill vercel-react-best-practices (学习数据库连接)

ui-designer:
  ├─ /skill web-design-guidelines (学习设计规范)
  ├─ /skill frontend-design (获取设计建议)
  └─ /skill shadcn-ui (配置主题)

backend-developer:
  └─ /skill vercel-react-best-practices (学习 API 最佳实践)

frontend-developer:
  ├─ /skill vercel-react-best-practices (学习 Next.js 15)
  ├─ /skill frontend-design (获取设计建议)
  └─ /skill web-design-guidelines (学习设计规范)
```

### 🔨 开发中期（Day 3-8）
```
database-architect:
  └─ /skill code-review (审查 schema.sql)

data-collector:
  └─ /skill code-review (审查抓取脚本)

backend-developer:
  ├─ /skill code-review (每完成一个 API)
  └─ /skill seo-audit (API 开发完成后)

frontend-developer:
  ├─ /skill shadcn-ui (添加组件时)
  ├─ /skill code-review (每完成一个组件)
  └─ /skill seo-audit (每完成一个页面)
```

### ✅ 测试阶段（Day 9-10）
```
qa-engineer:
  └─ /skill seo-audit (全站审计)

所有 Agents:
  └─ /skill code-review (最终代码审查)
```

---

## Skills 调用频率统计

| Skill | 使用次数 | 主要使用者 |
|-------|---------|-----------|
| **code-review** | 15+ 次 | 所有开发 Agents |
| **seo-audit** | 6+ 次 | backend, frontend, qa |
| **vercel-react-best-practices** | 3 次 | database, backend, frontend |
| **frontend-design** | 4 次 | ui-designer, frontend |
| **web-design-guidelines** | 3 次 | ui-designer, frontend |
| **shadcn-ui** | 3 次 | ui-designer, frontend |

---

## 详细调用清单

### database-architect 调用清单
```
□ Day 1: /skill vercel-react-best-practices
□ Day 2: /skill code-review database/schema.sql
□ Day 2: /skill code-review lib/db.ts
```

### data-collector 调用清单
```
□ Day 4: /skill code-review scripts/scraper.ts
```

### backend-developer 调用清单
```
□ Day 3: /skill vercel-react-best-practices
□ Day 3: /skill code-review app/api/categories/route.ts
□ Day 4: /skill code-review app/api/categories/[slug]/route.ts
□ Day 4: /skill code-review app/api/kols/[username]/route.ts
□ Day 4: /skill code-review app/api/kols/[username]/tweets/route.ts
□ Day 5: /skill code-review app/api/search/route.ts
□ Day 5: /skill seo-audit (所有 API)
```

### frontend-developer 调用清单
```
□ Day 6: /skill vercel-react-best-practices
□ Day 6: /skill frontend-design
□ Day 6: /skill web-design-guidelines
□ Day 6: /skill shadcn-ui (添加所需组件)
□ Day 6: /skill code-review components/CategoryCard.tsx
□ Day 7: /skill code-review components/KOLCard.tsx
□ Day 7: /skill code-review components/TweetCard.tsx
□ Day 7: /skill code-review components/SearchBar.tsx
□ Day 7: /skill seo-audit app/page.tsx
□ Day 8: /skill seo-audit app/category/[slug]/page.tsx
□ Day 8: /skill seo-audit app/kol/[username]/page.tsx
□ Day 8: /skill seo-audit app/search/page.tsx
```

### ui-designer 调用清单
```
□ Day 1: /skill web-design-guidelines
□ Day 1: /skill frontend-design
□ Day 1: /skill shadcn-ui (配置主题)
□ Day 2: /skill frontend-design (设计组件样式)
```

### qa-engineer 调用清单
```
□ Day 9: /skill seo-audit (全站审计)
□ Day 10: /skill code-review (如有测试脚本)
```

---

## 预期 Skills 调用总次数

**总计：40+ 次 Skills 调用**

这将显著提升代码质量、设计一致性和 SEO 性能！

---

## 下一步

确认这个 Skills 使用策略后，我将：
1. ✅ 创建 6 个 Agents
2. ✅ 为每个 Agent 配置 Skills 调用清单
3. ✅ 在任务描述中明确标注何时调用哪个 Skill
4. ✅ 启动开发

**准备好了吗？** 🚀
