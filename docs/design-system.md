# 推特大佬电子阅览室 - UI 设计系统

## 设计理念

**编辑风格 × 数字阅读室**

采用高端杂志的排版美学，结合现代数字产品的交互体验。大量留白、清晰的信息层级、精致的细节处理，打造一个优雅的知识浏览空间。

### 核心原则

- **中文优先**：针对国内用户，全中文界面，优秀的中文排版
- **桌面优先**：移动端暂不适配，专注于桌面浏览体验
- **简洁明了**：信息密度适中，易于快速浏览
- **快速访问**：减少点击层级，直达大佬推文

---

## 配色方案

### 主题：雅致灰调

采用低饱和度的灰色系统，配合精心选择的强调色，营造专业、沉静的阅读氛围。

#### Light Mode (默认)

```css
--background: 0 0% 99%;           /* 极浅灰背景 #FCFCFC */
--foreground: 240 10% 10%;        /* 深灰文字 #18181B */

--card: 0 0% 100%;                /* 纯白卡片 #FFFFFF */
--card-foreground: 240 10% 10%;   /* 深灰文字 */

--primary: 240 6% 15%;            /* 主色：深灰 #232328 */
--primary-foreground: 0 0% 99%;   /* 主色文字：浅色 */

--secondary: 240 5% 96%;          /* 次要色：浅灰 #F4F4F5 */
--secondary-foreground: 240 6% 15%; /* 次要色文字：深色 */

--accent: 142 76% 36%;            /* 强调色：优雅的绿 #16A34A */
--accent-foreground: 0 0% 100%;   /* 强调色文字：白色 */

--muted: 240 5% 96%;              /* 弱化色：浅灰 */
--muted-foreground: 240 4% 46%;   /* 弱化文字：中灰 #71717A */

--destructive: 0 72% 51%;         /* 警告色：红 #DC2626 */
--destructive-foreground: 0 0% 100%; /* 警告文字：白 */

--border: 240 6% 90%;             /* 边框：淡灰 #E4E4E7 */
--input: 240 6% 90%;              /* 输入框边框 */
--ring: 142 76% 36%;              /* 焦点环：绿色 */

--radius: 0.5rem;                 /* 基础圆角：8px */
```

#### Dark Mode (可选)

```css
--background: 240 10% 4%;         /* 深灰背景 #0A0A0B */
--foreground: 0 0% 95%;           /* 浅灰文字 #F2F2F2 */

--card: 240 6% 8%;                /* 深灰卡片 #131316 */
--card-foreground: 0 0% 95%;      /* 浅灰文字 */

--primary: 0 0% 95%;              /* 主色：浅灰 */
--primary-foreground: 240 6% 10%; /* 主色文字：深色 */

--secondary: 240 6% 12%;          /* 次要色：中灰 */
--secondary-foreground: 0 0% 95%; /* 次要色文字：浅色 */

--accent: 142 76% 36%;            /* 强调色：绿色 (保持一致) */
--accent-foreground: 0 0% 100%;   /* 强调色文字：白色 */

--muted: 240 6% 12%;              /* 弱化色 */
--muted-foreground: 240 5% 64%;   /* 弱化文字 */

--destructive: 0 72% 51%;         /* 警告色：红 */
--destructive-foreground: 0 0% 100%; /* 警告文字：白 */

--border: 240 6% 15%;             /* 边框 */
--input: 240 6% 15%;              /* 输入框边框 */
--ring: 142 76% 36%;              /* 焦点环：绿色 */
```

### 类目图标配色

为了在统一的灰调中增加识别度，每个类目使用特定的强调色：

| 类目 | 图标 | 强调色 | HSL | 用途 |
|------|------|--------|-----|------|
| AI 技术 | 🤖 | 紫色 | `270 60% 60%` | 标签、hover 状态 |
| 创业出海 | 🚀 | 蓝色 | `217 91% 60%` | 标签、hover 状态 |
| 投资理财 | 💰 | 金色 | `45 93% 47%` | 标签、hover 状态 |
| 商业财富 | 💼 | 深蓝 | `210 100% 40%` | 标签、hover 状态 |
| 设计产品 | 🎨 | 粉色 | `330 81% 60%` | 标签、hover 状态 |
| 内容创作 | ✍️ | 橙色 | `25 95% 53%` | 标签、hover 状态 |
| 营销增长 | 📈 | 绿色 | `142 76% 36%` | 标签、hover 状态 |

---

## 字体系统

### 字体选择

**中文字体**：思源黑体 (Noto Sans SC)
- 优秀的中文排版
- 多种字重支持
- Google Fonts 免费使用

**英文/数字字体**：Inter
- 现代、清晰、易读
- 可变字体，灵活字重
- 与中文字体搭配和谐

### 字体配置

```css
/* 主字体栈 */
font-family:
  'Inter',
  'Noto Sans SC',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;

/* 等宽字体（代码） */
font-family-mono:
  'JetBrains Mono',
  'Fira Code',
  'Monaco',
  'Cascadia Code',
  monospace;
```

### 字号与行高

基于 4px 网格系统：

| 用途 | 字号 | 行高 | 字重 | Tailwind Class |
|------|------|------|------|----------------|
| H1 标题 | 48px (3rem) | 56px (3.5rem) | 700 | `text-5xl font-bold` |
| H2 标题 | 36px (2.25rem) | 44px (2.75rem) | 700 | `text-4xl font-bold` |
| H3 标题 | 28px (1.75rem) | 36px (2.25rem) | 600 | `text-3xl font-semibold` |
| H4 标题 | 20px (1.25rem) | 28px (1.75rem) | 600 | `text-xl font-semibold` |
| 正文大 | 18px (1.125rem) | 28px (1.75rem) | 400 | `text-lg` |
| 正文 | 16px (1rem) | 24px (1.5rem) | 400 | `text-base` |
| 正文小 | 14px (0.875rem) | 20px (1.25rem) | 400 | `text-sm` |
| 说明文字 | 12px (0.75rem) | 16px (1rem) | 400 | `text-xs` |

### 字重

- **Regular (400)**：正文
- **Medium (500)**：强调文本
- **Semibold (600)**：小标题
- **Bold (700)**：主标题

---

## 间距系统

基于 4px 基数的间距系统，确保视觉一致性：

| 名称 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| xs | 4px | `1` | 极小间距 |
| sm | 8px | `2` | 小间距 |
| md | 12px | `3` | 中小间距 |
| base | 16px | `4` | 基础间距 |
| lg | 20px | `5` | 中间距 |
| xl | 24px | `6` | 大间距 |
| 2xl | 32px | `8` | 更大间距 |
| 3xl | 40px | `10` | 组件间距 |
| 4xl | 48px | `12` | 区块间距 |
| 5xl | 64px | `16` | 大区块间距 |
| 6xl | 80px | `20` | 页面级间距 |

### 常用间距组合

- **卡片内边距**：`p-6` (24px)
- **区块间距**：`gap-8` (32px) 或 `gap-12` (48px)
- **页面内边距**：`px-8` (32px) 或 `px-12` (48px)
- **容器最大宽度**：1440px

---

## 组件样式规范

### 按钮 (Button)

#### 主按钮 (Primary)

```css
/* Default State */
background: var(--primary);
color: var(--primary-foreground);
padding: 12px 24px;
border-radius: 8px;
font-size: 16px;
font-weight: 500;
transition: all 150ms ease;

/* Hover */
background: var(--primary) / 90%;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

/* Active */
transform: translateY(0);
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

#### 次要按钮 (Secondary)

```css
background: var(--secondary);
color: var(--secondary-foreground);
border: 1px solid var(--border);
```

#### 轮廓按钮 (Outline)

```css
background: transparent;
color: var(--foreground);
border: 1px solid var(--border);

/* Hover */
background: var(--secondary);
border-color: var(--primary);
```

#### 尺寸变体

- **Small**: `h-9 px-3 text-sm` (36px 高)
- **Default**: `h-10 px-4 text-base` (40px 高)
- **Large**: `h-12 px-6 text-lg` (48px 高)

### 卡片 (Card)

#### 基础卡片

```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
transition: all 200ms ease;

/* Hover */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
transform: translateY(-2px);
border-color: var(--primary) / 20%;
```

#### KOL 卡片

```tsx
<Card className="group">
  <CardHeader>
    <Avatar /> {/* 48x48 圆形头像 */}
    <CardTitle /> {/* KOL 姓名，18px */}
    <CardDescription /> {/* KOL 简介，14px */}
  </CardHeader>
  <CardContent>
    <Badge /> {/* 类目标签 */}
    <Stats /> {/* 粉丝数、推文数 */}
  </CardContent>
</Card>
```

#### 推文卡片

```tsx
<Card className="hover:shadow-lg transition-all">
  <CardHeader className="flex-row gap-3">
    <Avatar size="sm" /> {/* 40x40 */}
    <div>
      <CardTitle size="sm" /> {/* KOL 名称 */}
      <CardDescription /> {/* 发布时间 */}
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-base leading-relaxed" /> {/* 推文内容 */}
    <TweetStats /> {/* 点赞、转发、回复数 */}
  </CardContent>
</Card>
```

### 输入框 (Input)

```css
height: 40px;
padding: 8px 12px;
font-size: 14px;
background: var(--background);
border: 1px solid var(--border);
border-radius: 8px;
transition: all 150ms ease;

/* Focus */
border-color: var(--ring);
box-shadow: 0 0 0 3px var(--ring) / 10%;
outline: none;

/* Error */
border-color: var(--destructive);
```

### 搜索框 (SearchBar)

```tsx
<div className="relative max-w-2xl">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <Input
    className="pl-10 h-12 text-base"
    placeholder="搜索 KOL 或推文内容..."
  />
</div>
```

### 徽章 (Badge)

```css
display: inline-flex;
align-items: center;
padding: 4px 12px;
font-size: 12px;
font-weight: 500;
border-radius: 6px;
background: var(--secondary);
color: var(--secondary-foreground);

/* Category Badge with Color */
background: var(--category-color) / 10%;
color: var(--category-color);
border: 1px solid var(--category-color) / 20%;
```

---

## 响应式断点

桌面优先设计，三个主要断点：

| 断点 | 最小宽度 | 目标设备 | 容器宽度 | Tailwind |
|------|----------|----------|----------|----------|
| Desktop Large | 1920px | 大屏显示器 | 1440px | `2xl:` |
| Desktop | 1440px | 标准显示器 | 1280px | `xl:` |
| Laptop | 1024px | 笔记本电脑 | 960px | `lg:` |

### 容器配置

```tsx
<div className="container mx-auto px-8 xl:px-12 2xl:px-16">
  {/* 内容自动居中，两侧留白 */}
</div>
```

### 响应式网格

```tsx
/* 类目网格 */
<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {categories.map(...)}
</div>

/* KOL 网格 */
<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
  {kols.map(...)}
</div>

/* 推文列表 */
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  {tweets.map(...)}
</div>
```

---

## 动效与交互

### 过渡时长

```css
--transition-fast: 150ms;    /* 快速反馈 */
--transition-base: 200ms;    /* 标准过渡 */
--transition-slow: 300ms;    /* 复杂动画 */
```

### 缓动函数

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);      /* 标准 */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* 进入 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* 退出 */
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 弹性 */
```

### 常用动效

#### 卡片 Hover

```css
transition: all 200ms ease-out;

&:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--primary) / 30%;
}
```

#### 按钮点击

```css
transition: all 150ms ease-in-out;

&:active {
  transform: scale(0.98);
}
```

#### 页面加载淡入

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 300ms ease-out;
}
```

#### 骨架屏加载

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 0%,
    var(--muted) / 50% 50%,
    var(--muted) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 图标系统

### 主图标库

使用 **Lucide React** 图标库：
- 一致的设计语言
- 轻量级 (每个图标约 1KB)
- Tree-shakeable
- 完整的 TypeScript 支持

```bash
npm install lucide-react
```

### 常用图标

| 用途 | 图标 | 组件名 |
|------|------|--------|
| 搜索 | 🔍 | `<Search />` |
| 用户 | 👤 | `<User />` |
| 设置 | ⚙️ | `<Settings />` |
| 外链 | 🔗 | `<ExternalLink />` |
| 心形/点赞 | ❤️ | `<Heart />` |
| 分享 | 📤 | `<Share2 />` |
| 书签 | 🔖 | `<Bookmark />` |
| 趋势 | 📈 | `<TrendingUp />` |
| 火焰 | 🔥 | `<Flame />` |
| 时钟 | 🕐 | `<Clock />` |

### 图标尺寸

```tsx
<Icon className="w-4 h-4" />   {/* 16px - Small */}
<Icon className="w-5 h-5" />   {/* 20px - Default */}
<Icon className="w-6 h-6" />   {/* 24px - Large */}
<Icon className="w-8 h-8" />   {/* 32px - XLarge */}
```

---

## 页面布局

### 通用页面结构

```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="sticky top-0 z-50 bg-card border-b border-border">
    <div className="container mx-auto px-8 h-16 flex items-center justify-between">
      <Logo />
      <Navigation />
      <SearchBar />
    </div>
  </header>

  {/* Main Content */}
  <main className="container mx-auto px-8 py-12">
    <PageContent />
  </main>

  {/* Footer */}
  <footer className="border-t border-border bg-muted/30">
    <div className="container mx-auto px-8 py-8">
      <FooterContent />
    </div>
  </footer>
</div>
```

### 首页布局

```tsx
<main className="container mx-auto px-8 py-12 space-y-16">
  {/* Hero Section */}
  <section className="text-center space-y-6 py-12">
    <h1 className="text-5xl font-bold">推特大佬电子阅览室</h1>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
      精选 150+ 位推特大佬，7 大类目，实时更新精彩观点
    </p>
    <SearchBar />
  </section>

  {/* Categories Grid */}
  <section className="space-y-6">
    <h2 className="text-3xl font-bold">浏览类目</h2>
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map(category => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  </section>

  {/* Featured KOLs */}
  <section className="space-y-6">
    <h2 className="text-3xl font-bold">推荐 KOL</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {featuredKOLs.map(kol => (
        <KOLCard key={kol.id} {...kol} />
      ))}
    </div>
  </section>

  {/* Latest Tweets */}
  <section className="space-y-6">
    <h2 className="text-3xl font-bold">最新推文</h2>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {latestTweets.map(tweet => (
        <TweetCard key={tweet.id} {...tweet} />
      ))}
    </div>
  </section>
</main>
```

---

## 无障碍 (Accessibility)

### ARIA 标签

```tsx
<button aria-label="搜索">
  <Search className="w-5 h-5" />
</button>

<nav aria-label="主导航">
  <ul>...</ul>
</nav>

<main aria-labelledby="page-title">
  <h1 id="page-title">...</h1>
</main>
```

### 键盘导航

- 所有交互元素支持 Tab 键导航
- 焦点状态清晰可见 (`focus-visible:ring-2`)
- 支持 Enter/Space 激活按钮
- Esc 关闭对话框/弹窗

### 颜色对比度

- 正文文字对比度 ≥ 4.5:1 (WCAG AA)
- 大号文字对比度 ≥ 3:1
- 交互元素对比度 ≥ 3:1

---

## 设计交付清单

- [x] 配色方案定义
- [x] 字体系统配置
- [x] 间距系统规范
- [x] 组件样式规范
- [x] 响应式断点
- [x] 动效与交互
- [x] 图标系统
- [x] 页面布局
- [x] 无障碍规范
- [ ] 全局样式配置文件 (globals.css)
- [ ] Tailwind 配置文件 (tailwind.config.ts)
- [ ] shadcn/ui 配置文件 (components.json)

---

## 下一步

1. 配置 Next.js 项目
2. 安装 Tailwind CSS 和 shadcn/ui
3. 创建全局样式文件
4. 配置字体加载
5. 创建基础组件库
6. 开发页面原型

---

*设计系统版本：v1.0*
*最后更新：2026-02-16*
*设计师：ui-designer*
