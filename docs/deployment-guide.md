# 推特大佬电子阅览室 - 部署指南

> 版本：1.0
> 更新时间：2026-02-16

---

## 📋 部署前检查清单

在部署前，请确认以下项目已完成：

- ✅ 数据库已配置（PostgreSQL）
- ✅ 数据已导入（164 KOL + 108 tweets）
- ✅ 所有页面已开发（首页、类目、KOL、搜索）
- ✅ API 端点已测试（5 个 API 全部通过）
- ✅ SEO 配置已完成（robots.txt, sitemap.xml, OG tags）
- ✅ 功能测试已通过（100% 通过率）

---

## 🚀 Vercel 部署步骤

### 步骤 1：准备 GitHub 仓库

1. **初始化 Git 仓库**（如果尚未初始化）：
   ```bash
   cd /Users/liyadong/Documents/GitHub/把\ X\ 上的大佬们变成你的\ Agent
   git init
   git add .
   git commit -m "feat: 推特大佬电子阅览室 MVP 完成

   - ✅ 数据库设计和配置
   - ✅ 5 个 API 端点
   - ✅ 4 个核心页面
   - ✅ SEO 优化（robots.txt, sitemap.xml, OG tags）
   - ✅ 164 KOL + 108 tweets

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
   ```

2. **创建 GitHub 仓库**：
   - 访问 https://github.com/new
   - 仓库名：`x-kol-library` 或 `twitter-kol-showcase`
   - 可见性：Public 或 Private
   - 不要初始化 README（本地已有）

3. **推送到 GitHub**：
   ```bash
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

---

### 步骤 2：配置生产数据库

#### 选项 A：使用 Vercel Postgres（推荐）

1. **登录 Vercel**：https://vercel.com

2. **创建 Postgres 数据库**：
   - 进入 Storage 页面
   - 点击 "Create Database"
   - 选择 "Postgres"
   - 数据库名：`xkol-production`
   - 选择区域：US West (推荐，延迟最低)

3. **获取数据库连接字符串**：
   - 复制 `POSTGRES_URL` 环境变量

4. **导入数据到生产数据库**：
   ```bash
   # 使用 psql 连接到 Vercel Postgres
   psql "<POSTGRES_URL>"

   # 执行 schema
   \i database/schema.sql

   # 退出
   \q

   # 导入数据
   npx tsx scripts/import-data.ts
   ```

#### 选项 B：使用 Supabase（免费）

1. **创建 Supabase 项目**：
   - 访问 https://supabase.com
   - 创建新项目：`xkol-production`
   - 区域：Southeast Asia (Singapore)

2. **执行 SQL**：
   - 打开 SQL Editor
   - 粘贴 `database/schema.sql` 内容
   - 点击 Run

3. **导入数据**：
   ```bash
   # 设置环境变量
   export DATABASE_URL="postgresql://postgres:<password>@<project-ref>.supabase.co:5432/postgres"

   # 导入数据
   npx tsx scripts/import-data.ts
   ```

4. **获取连接字符串**：
   - Settings → Database → Connection string
   - 选择 "URI" 格式

---

### 步骤 3：部署到 Vercel

#### 方法 A：通过 Vercel Dashboard（推荐）

1. **导入 GitHub 仓库**：
   - 访问 https://vercel.com/new
   - 选择你的 GitHub 仓库
   - 点击 "Import"

2. **配置环境变量**：
   - 点击 "Environment Variables"
   - 添加以下变量：
     ```
     DATABASE_URL=<你的数据库连接字符串>
     NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
     ```

3. **部署配置**：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **点击 "Deploy"**

#### 方法 B：通过 Vercel CLI

1. **安装 Vercel CLI**：
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **配置环境变量**：
   ```bash
   vercel env add DATABASE_URL production
   # 粘贴数据库连接字符串

   vercel env add NEXT_PUBLIC_BASE_URL production
   # 输入：https://your-domain.vercel.app
   ```

4. **部署**：
   ```bash
   vercel --prod
   ```

---

### 步骤 4：配置自定义域名（可选）

1. **购买域名**（推荐平台）：
   - Namecheap: https://www.namecheap.com
   - GoDaddy: https://www.godaddy.com
   - Cloudflare: https://www.cloudflare.com

2. **在 Vercel 添加域名**：
   - 进入项目 Settings → Domains
   - 输入域名：`your-domain.com`
   - 点击 "Add"

3. **配置 DNS**：
   - 在域名注册商添加 CNAME 记录：
     ```
     Type: CNAME
     Name: @ (或 www)
     Value: cname.vercel-dns.com
     ```

4. **等待 DNS 生效**（通常 5-30 分钟）

---

### 步骤 5：验证部署

1. **访问网站**：
   - Vercel 自动域名：`https://your-project.vercel.app`
   - 或自定义域名：`https://your-domain.com`

2. **检查核心功能**：
   - ✅ 首页显示 7 个类目
   - ✅ 点击类目进入 KOL 列表
   - ✅ 点击 KOL 查看推文
   - ✅ 搜索功能正常
   - ✅ 分页功能正常

3. **验证 SEO 配置**：
   - 访问 `https://your-domain.com/robots.txt`
   - 访问 `https://your-domain.com/sitemap.xml`
   - 使用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 测试 OG 标签

4. **性能检测**：
   - 使用 [PageSpeed Insights](https://pagespeed.web.dev/)
   - 使用 [GTmetrix](https://gtmetrix.com/)
   - 目标：Performance Score > 90

---

## 🔧 部署后配置

### 1. Google Search Console

1. **验证网站所有权**：
   - 访问 https://search.google.com/search-console
   - 添加属性：`https://your-domain.com`
   - 选择验证方法：HTML 标签（已在 layout.tsx 预留位置）

2. **提交 Sitemap**：
   - 进入 Sitemaps
   - 提交：`https://your-domain.com/sitemap.xml`

3. **请求索引**：
   - URL Inspection
   - 输入首页 URL
   - 点击 "Request Indexing"

### 2. 百度站长平台（可选）

1. **验证网站**：
   - 访问 https://ziyuan.baidu.com
   - 添加网站
   - 验证所有权

2. **提交 Sitemap**：
   - 链接提交 → Sitemap
   - 提交：`https://your-domain.com/sitemap.xml`

### 3. 分析工具集成（可选）

#### Google Analytics 4

1. **创建 GA4 属性**：
   - 访问 https://analytics.google.com
   - 创建新属性

2. **添加到网站**：
   ```typescript
   // app/layout.tsx
   import Script from 'next/script'

   // 在 <body> 标签后添加：
   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
     strategy="afterInteractive"
   />
   <Script id="google-analytics" strategy="afterInteractive">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
     `}
   </Script>
   ```

3. **设置环境变量**：
   ```bash
   vercel env add NEXT_PUBLIC_GA_ID production
   # 输入：G-XXXXXXXXXX
   ```

---

## 📊 监控与维护

### 性能监控

1. **Vercel Analytics**（免费）：
   - 自动启用
   - 查看：项目 → Analytics

2. **Vercel Speed Insights**（推荐）：
   ```bash
   npm install @vercel/speed-insights
   ```

   ```typescript
   // app/layout.tsx
   import { SpeedInsights } from "@vercel/speed-insights/next"

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     )
   }
   ```

### 错误监控

1. **Vercel Logs**：
   - 项目 → Logs
   - 查看实时日志和错误

2. **Sentry**（可选）：
   - 集成 Sentry 监控运行时错误
   - 访问 https://sentry.io

### 数据库备份

1. **Vercel Postgres**：
   - 自动每日备份
   - 保留 7 天

2. **手动备份**：
   ```bash
   # 导出数据
   pg_dump "<DATABASE_URL>" > backup_$(date +%Y%m%d).sql
   ```

---

## 🔄 更新部署

### 更新代码

1. **本地修改后推送**：
   ```bash
   git add .
   git commit -m "feat: 新功能"
   git push origin main
   ```

2. **Vercel 自动部署**：
   - 推送后自动触发部署
   - 查看部署状态：https://vercel.com/dashboard

### 更新数据

1. **增量更新**：
   ```bash
   # 本地更新数据
   npx tsx scripts/scraper.ts --incremental

   # 导入到生产数据库
   DATABASE_URL="<production-url>" npx tsx scripts/import-data.ts
   ```

2. **全量替换**：
   ```bash
   # 清空数据库
   psql "<DATABASE_URL>" -c "TRUNCATE tweets, kols CASCADE;"

   # 重新导入
   DATABASE_URL="<production-url>" npx tsx scripts/import-data.ts
   ```

---

## ⚠️ 常见问题

### 1. 部署失败：Build Error

**问题**：TypeScript 编译错误

**解决**：
```bash
# 本地运行 build 检查错误
npm run build

# 修复所有 TypeScript 错误后再推送
```

### 2. 数据库连接失败

**问题**：`ECONNREFUSED` 或 `timeout`

**解决**：
- 检查 `DATABASE_URL` 环境变量是否正确
- 确认数据库允许来自 Vercel 的连接
- Vercel Postgres：自动配置
- Supabase：检查 Connection Pooling 设置

### 3. 页面加载慢

**问题**：TTFB > 1s

**解决**：
- 检查数据库查询是否优化（使用索引）
- 启用 API Routes 的 ISR 缓存
- 使用 `next/image` 优化图片加载

### 4. Sitemap 404

**问题**：访问 `/sitemap.xml` 返回 404

**解决**：
- 确认 `app/sitemap.ts` 文件存在
- 重新部署项目
- 清除浏览器缓存

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase 文档](https://supabase.com/docs)

---

## ✅ 部署完成检查清单

- [ ] 代码已推送到 GitHub
- [ ] 数据库已配置并导入数据
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置（DATABASE_URL, NEXT_PUBLIC_BASE_URL）
- [ ] 部署成功，网站可访问
- [ ] robots.txt 可访问
- [ ] sitemap.xml 可访问
- [ ] Google Search Console 已验证
- [ ] Sitemap 已提交
- [ ] 性能测试通过（Score > 90）
- [ ] 功能测试通过（所有页面正常）

---

**恭喜！部署完成！** 🎉

现在你的推特大佬电子阅览室已经上线，全世界都可以访问了！
