# Vercel 部署完整操作指南

> 📌 适用于：推特大佬电子阅览室（x-kol-library）
>
> 📅 更新时间：2026-02-16
>
> ⏱️ 预计耗时：20-30 分钟

---

## 🎯 部署目标

- ✅ 将代码部署到 Vercel（免费托管）
- ✅ 创建 Vercel Postgres 数据库
- ✅ 导入 164 个 KOL + 108 条推文数据
- ✅ 配置环境变量
- ✅ 获得可访问的线上地址

---

## 📋 前提条件

- ✅ 代码已推送到 GitHub：https://github.com/guasi18587278913/x-kol-library
- ✅ 有 GitHub 账号（用于登录 Vercel）
- ✅ 本地有数据库文件和导入脚本

---

## 🚀 第一部分：导入项目到 Vercel（5 分钟）

### 步骤 1：登录 Vercel

1. 打开浏览器，访问：**https://vercel.com**

2. 点击右上角 **"Sign Up"**（如果已有账号点 "Log In"）

3. 选择 **"Continue with GitHub"**（使用 GitHub 账号登录）

4. 授权 Vercel 访问你的 GitHub 仓库（点击 "Authorize Vercel"）

**✅ 验证**：登录成功后，你会看到 Vercel Dashboard

---

### 步骤 2：导入 GitHub 仓库

1. 在 Vercel Dashboard，点击右上角 **"Add New..."** → **"Project"**

   或直接访问：**https://vercel.com/new**

2. 在 "Import Git Repository" 页面：
   - 找到 **"guasi18587278913/x-kol-library"** 仓库
   - 如果没看到，点击 "Adjust GitHub App Permissions" 添加仓库权限
   - 点击仓库右侧的 **"Import"** 按钮

**✅ 验证**：进入项目配置页面，显示 "Configure Project"

---

### 步骤 3：配置项目（暂不部署）

在 "Configure Project" 页面：

1. **Project Name**（项目名称）：
   - 保持默认：`x-kol-library`
   - 或自定义：`twitter-kol-library`（会影响默认域名）

2. **Framework Preset**（框架预设）：
   - 应该自动检测到：**Next.js** ✅
   - 如果没有，手动选择 "Next.js"

3. **Root Directory**（根目录）：
   - 保持默认：`./`

4. **Build and Output Settings**（构建设置）：
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `npm install`（默认）
   - 保持默认即可，不用修改

5. **Environment Variables**（环境变量）：
   - **先不要添加！** 我们会在创建数据库后自动添加

**⚠️ 重要**：配置完成后，**先不要点击 "Deploy" 按钮！**

我们需要先创建数据库。

---

## 💾 第二部分：创建 Vercel Postgres 数据库（10 分钟）

### 步骤 4：创建数据库

1. **打开 Storage 页面**：
   - 点击 Vercel 顶部导航栏的 **"Storage"**
   - 或直接访问：**https://vercel.com/dashboard/stores**

2. **创建新数据库**：
   - 点击 **"Create Database"** 按钮
   - 在弹出的选项中，选择 **"Postgres"**（蓝色图标）

3. **配置数据库**：
   - **Database Name**（数据库名称）：输入 `xkol-production`
   - **Region**（区域）：选择以下之一
     - 🇺🇸 **US West (San Francisco)** - 推荐，速度快，稳定
     - 🇸🇬 **Southeast Asia (Singapore)** - 亚洲用户访问更快
     - 避免选择 US East（国内访问较慢）
   - **Pricing Plan**：选择 **Hobby（免费）** ✅
     - 免费额度：256 MB 存储，足够使用

4. **点击 "Create"**

5. **等待创建**（约 10-20 秒）：
   - 页面会显示 "Creating your Postgres database..."
   - 完成后自动跳转到数据库详情页

**✅ 验证**：看到数据库详情页，显示 "xkol-production" 和连接信息

---

### 步骤 5：连接数据库到项目

1. **在数据库详情页**，点击顶部的 **"Connect Project"** 按钮

2. **选择项目**：
   - 找到 `x-kol-library`（或你自定义的项目名）
   - 勾选该项目
   - 点击 **"Connect"**

3. **等待连接**（约 5 秒）：
   - Vercel 会自动将数据库环境变量添加到项目

**✅ 验证**：
- 看到提示 "Environment variables added to x-kol-library"
- 或在项目设置中看到 `POSTGRES_URL` 等环境变量

---

### 步骤 6：获取数据库连接字符串

1. **在数据库详情页**，点击 **".env.local"** 标签（在 "Quickstart" 旁边）

2. **复制环境变量**：
   - 找到 `POSTGRES_URL="postgres://default:..."`
   - **完整复制** 整个连接字符串（从 `postgres://` 开始到末尾）
   - 格式类似：
     ```
     postgres://default:ABC123xyz@ep-example-123456.us-west-2.postgres.vercel-storage.com:5432/verceldb
     ```

3. **保存到安全的地方**（记事本或密码管理器）

**✅ 验证**：复制的字符串以 `postgres://` 开头

---

## 📥 第三部分：导入数据到数据库（10 分钟）

### 步骤 7：使用 Vercel SQL Editor 导入 Schema

**方法 A：使用 Vercel Web 界面（推荐，最简单）**

1. **在数据库详情页**，点击 **"Query"** 标签

2. **打开本地文件 `database/schema.sql`**：
   - 使用文本编辑器（VS Code、Sublime、记事本等）打开
   - 全选并复制所有内容（约 100 行）

3. **粘贴到 Vercel Query 编辑器**：
   - 在 Query 编辑器中粘贴刚复制的 SQL
   - 点击右上角 **"Run Query"** 按钮

4. **等待执行**（约 5 秒）：
   - 成功后会显示 "Query executed successfully"
   - 或显示创建的表数量

**✅ 验证**：
- 点击 **"Data"** 标签
- 看到 3 个表：`categories`、`kols`、`tweets`

---

**方法 B：使用命令行（如果你熟悉终端）**

```bash
# 在项目根目录运行
psql "你复制的POSTGRES_URL" < database/schema.sql
```

---

### 步骤 8：导入 KOL 和推文数据

**在本地终端运行**（项目根目录）：

```bash
# 1. 设置环境变量（替换成你的连接字符串）
export DATABASE_URL="postgres://default:ABC123xyz@ep-example-123456.us-west-2.postgres.vercel-storage.com:5432/verceldb"

# 2. 运行导入脚本
npx tsx scripts/import-data.ts
```

**等待导入**（约 30-60 秒）：
- 会显示导入进度
- 成功后显示：
  ```
  ✅ 导入完成！

  类目：7 个
  KOL： 164 个
  推文：108 条
  ```

**✅ 验证导入成功**：

1. 返回 Vercel 数据库页面，点击 **"Data"** 标签

2. 点击 **"categories"** 表，点击 **"Rows"**：
   - 应该看到 7 行数据（AI技术、创业出海等）

3. 点击 **"kols"** 表，点击 **"Rows"**：
   - 应该看到 164 行数据

4. 点击 **"tweets"** 表，点击 **"Rows"**：
   - 应该看到 108 行数据

---

## 🌐 第四部分：部署项目到 Vercel（5 分钟）

### 步骤 9：添加额外环境变量

1. **回到项目页面**：
   - 访问：https://vercel.com/dashboard
   - 点击 `x-kol-library` 项目

2. **进入设置**：
   - 点击顶部 **"Settings"** 标签
   - 左侧菜单点击 **"Environment Variables"**

3. **添加环境变量**：

   **变量 1**：
   - **Key**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://x-kol-library.vercel.app`（使用你的实际域名）
   - **Environments**: 勾选 **Production**, **Preview**, **Development**
   - 点击 **"Save"**

**✅ 验证**：看到 2 个环境变量组：
- `POSTGRES_*`（数据库相关，5-6 个变量）
- `NEXT_PUBLIC_BASE_URL`（1 个变量）

---

### 步骤 10：部署项目

1. **返回项目首页**：
   - 点击顶部 **"Deployments"** 标签
   - 或点击左上角项目名称

2. **触发部署**：

   **方法 A：在 Vercel Dashboard 部署**
   - 点击右上角 **"Deploy"** 按钮（如果有）
   - 或点击 Git 集成中的 **"Redeploy"**

   **方法 B：推送代码触发自动部署**
   - Vercel 会自动监听 GitHub 仓库
   - 任何推送到 `main` 分支的代码都会自动部署
   - 如果刚才没有自动部署，可以：
     ```bash
     # 在项目根目录运行
     git commit --allow-empty -m "trigger deployment"
     git push origin main
     ```

3. **等待部署**（约 2-3 分钟）：
   - 页面会显示 "Building..." 状态
   - 可以点击部署详情查看日志
   - 进度：
     - ⏳ Queued（排队）
     - ⏳ Building（构建中）
     - ⏳ Deploying（部署中）
     - ✅ Ready（完成）

**✅ 验证部署成功**：
- 状态显示 **"Ready"** ✅
- 看到绿色的 ✓ 图标
- 显示域名：`https://x-kol-library.vercel.app`

---

### 步骤 11：访问你的网站 🎉

1. **点击部署成功的域名**：
   - 如：`https://x-kol-library.vercel.app`
   - 或点击 **"Visit"** 按钮

2. **测试核心功能**：

   **✅ 首页**：
   - 看到 "推特大佬电子阅览室" 标题
   - 看到 7 个类目卡片（AI技术、创业出海等）
   - 搜索框可用

   **✅ 类目页**：
   - 点击任意类目（如 "AI 技术"）
   - 看到 KOL 列表
   - 点击 "加载更多" 按钮可用

   **✅ KOL 详情页**：
   - 点击任意 KOL（如 "宝玉"）
   - 看到 KOL 头像、简介、粉丝数
   - 看到推文列表
   - 点击推文可跳转到 Twitter

   **✅ 搜索功能**：
   - 在搜索框输入关键词（如 "AI"）
   - 看到搜索结果

3. **验证 SEO 配置**：
   - 访问：`https://你的域名.vercel.app/robots.txt`
   - 应该看到 robots.txt 内容
   - 访问：`https://你的域名.vercel.app/sitemap.xml`
   - 应该看到 sitemap XML 内容

**🎉 恭喜！你的网站已成功上线！**

---

## 📊 第五部分：部署后优化（可选）

### 配置自定义域名（可选）

如果你有自己的域名（如 `twitter-kol.com`）：

1. **在项目设置中**：
   - Settings → Domains
   - 点击 **"Add"**
   - 输入你的域名
   - 按照提示配置 DNS

2. **在域名注册商添加记录**：
   - 添加 CNAME 记录指向 `cname.vercel-dns.com`

---

### 提交到 Google Search Console

1. **验证网站所有权**：
   - 访问：https://search.google.com/search-console
   - 添加属性：`https://你的域名.vercel.app`
   - 选择 "HTML 标签" 验证方式

2. **提交 Sitemap**：
   - 进入 Sitemaps
   - 提交：`https://你的域名.vercel.app/sitemap.xml`

3. **请求索引**：
   - 使用 URL Inspection 工具
   - 输入首页 URL
   - 点击 "Request Indexing"

---

### 启用 Vercel Analytics（可选）

1. **在项目页面**：
   - 点击 **"Analytics"** 标签
   - 点击 **"Enable Analytics"**

2. **查看访问数据**：
   - 实时访问量
   - 页面性能
   - 地理分布

---

## ⚠️ 常见问题

### 问题 1：部署失败 - Build Error

**症状**：部署状态显示 "Failed"，错误信息包含 "Build Error"

**解决方法**：
1. 点击失败的部署，查看详细日志
2. 常见原因：
   - TypeScript 类型错误：修复后重新推送
   - 缺少依赖：检查 `package.json`
   - 环境变量未配置：检查 Settings → Environment Variables

---

### 问题 2：页面显示 500 错误

**症状**：网站可以访问，但显示 "500 Internal Server Error"

**解决方法**：
1. 检查数据库连接：
   - Settings → Environment Variables
   - 确认 `POSTGRES_URL` 存在且正确

2. 查看日志：
   - Deployments → 点击最新部署 → Runtime Logs
   - 查看具体错误信息

---

### 问题 3：数据库连接超时

**症状**：页面加载很慢，或显示数据库连接错误

**解决方法**：
1. 检查 Vercel Postgres 状态：
   - Storage → xkol-production
   - 确认状态为 "Active"

2. 检查区域设置：
   - 数据库和项目应在同一区域
   - 推荐都使用 US West

---

### 问题 4：Sitemap 返回 404

**症状**：访问 `/sitemap.xml` 返回 404

**解决方法**：
1. 确认文件存在：
   - 检查仓库中是否有 `app/sitemap.ts`

2. 重新部署：
   - 推送一个空提交触发重新部署
   ```bash
   git commit --allow-empty -m "rebuild"
   git push origin main
   ```

---

## ✅ 部署完成检查清单

复制此清单，逐项确认：

- [ ] Vercel 项目已创建
- [ ] GitHub 仓库已连接
- [ ] Vercel Postgres 数据库已创建
- [ ] 数据库已连接到项目
- [ ] Schema 已导入（3 个表：categories, kols, tweets）
- [ ] 数据已导入（7 类目 + 164 KOL + 108 推文）
- [ ] 环境变量已配置（POSTGRES_URL, NEXT_PUBLIC_BASE_URL）
- [ ] 项目已部署成功（状态：Ready ✅）
- [ ] 网站可访问（https://x-kol-library.vercel.app）
- [ ] 首页显示 7 个类目 ✅
- [ ] 类目页显示 KOL 列表 ✅
- [ ] KOL 详情页显示推文 ✅
- [ ] 搜索功能正常 ✅
- [ ] robots.txt 可访问 ✅
- [ ] sitemap.xml 可访问 ✅

---

## 📚 相关链接

- **项目地址**：https://github.com/guasi18587278913/x-kol-library
- **Vercel Dashboard**：https://vercel.com/dashboard
- **Vercel 文档**：https://vercel.com/docs
- **Next.js 文档**：https://nextjs.org/docs
- **问题反馈**：在 GitHub 仓库创建 Issue

---

## 🎉 恭喜完成部署！

你的推特大佬电子阅览室已经成功上线！

**下一步建议**：
1. 分享给朋友测试
2. 提交到 Google Search Console
3. 监控访问数据（Vercel Analytics）
4. 后续可以添加更多 KOL 数据
5. 创建 OG 分享图片（`public/og-image.png`）

有任何问题，随时查看这份文档！🚀
