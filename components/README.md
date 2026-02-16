# 组件库文档

本目录包含了"推特大佬电子阅览室"项目的所有 UI 组件。

## 📦 组件列表

### 业务组件

1. **CategoryCard** - 类目卡片组件
2. **KOLCard** - KOL 卡片组件
3. **TweetCard** - 推文卡片组件
4. **SearchBar** - 搜索框组件

### 基础 UI 组件

位于 `ui/` 目录：

- **Card** - 卡片基础组件
- **Badge** - 徽章组件
- **Avatar** - 头像组件
- **Input** - 输入框组件

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📚 组件使用指南

### CategoryCard

显示类目信息的卡片，支持点击跳转。

```tsx
import { CategoryCard } from "@/components/CategoryCard"

<CategoryCard
  id="1"
  name="AI 技术"
  icon="🤖"
  kolCount={25}
  slug="ai-tech"
  variant="ai"
/>
```

**Props**:
- `id`: 类目 ID
- `name`: 类目名称
- `icon`: 类目图标（emoji）
- `kolCount`: KOL 数量
- `slug`: URL slug
- `variant`: 类目变体（ai | startup | invest | business | design | content | marketing）

### KOLCard

显示 KOL 信息的卡片，包含头像、简介、粉丝数等。

```tsx
import { KOLCard } from "@/components/KOLCard"

<KOLCard
  id="1"
  name="Sam Altman"
  username="sama"
  avatar="https://..."
  bio="CEO of OpenAI"
  followersCount={2500000}
  tweetCount={15234}
  category={{
    name: "AI 技术",
    slug: "ai-tech",
    variant: "ai"
  }}
  slug="sama"
/>
```

**Props**:
- `id`: KOL ID
- `name`: KOL 姓名
- `username`: Twitter 用户名
- `avatar`: 头像 URL
- `bio`: 简介
- `followersCount`: 粉丝数
- `tweetCount`: 推文数
- `category`: 类目信息
- `slug`: URL slug

### TweetCard

显示推文内容的卡片，支持多媒体展示。

```tsx
import { TweetCard } from "@/components/TweetCard"

<TweetCard
  id="1"
  content="AI is changing the world..."
  createdAt="2024-02-15T08:30:00Z"
  tweetUrl="https://twitter.com/sama/status/123"
  media={[
    { type: "photo", url: "...", altText: "..." }
  ]}
  stats={{
    likes: 15234,
    retweets: 3456,
    replies: 892
  }}
  author={{
    name: "Sam Altman",
    username: "sama",
    avatar: "https://..."
  }}
/>
```

**Props**:
- `id`: 推文 ID
- `content`: 推文内容
- `createdAt`: 发布时间（ISO 格式）
- `tweetUrl`: Twitter 原文链接
- `media`: 媒体数组（可选）
- `stats`: 互动统计
- `author`: 作者信息

### SearchBar

搜索框组件，支持实时搜索和快捷键。

```tsx
import { SearchBar } from "@/components/SearchBar"

<SearchBar
  placeholder="搜索 KOL 或推文内容..."
  onSearch={(query) => console.log(query)}
  debounceMs={300}
  showShortcut={true}
/>
```

**Props**:
- `placeholder`: 占位符文本（可选）
- `onSearch`: 搜索处理函数（可选）
- `debounceMs`: 防抖延迟（默认 300ms）
- `showShortcut`: 是否显示快捷键提示（默认 true）

**快捷键**:
- `Ctrl/Cmd + K`: 聚焦搜索框
- `ESC`: 清空并失焦

## 🎨 设计系统

所有组件遵循统一的设计系统，详见：
- [设计系统文档](../docs/design-system.md)
- [全局样式](../app/globals.css)
- [Tailwind 配置](../tailwind.config.ts)

### 类目配色

| 类目 | 变体 | 颜色 |
|------|------|------|
| 🤖 AI 技术 | `ai` | 紫色 |
| 🚀 创业出海 | `startup` | 蓝色 |
| 💰 投资理财 | `invest` | 金色 |
| 💼 商业财富 | `business` | 深蓝 |
| 🎨 设计产品 | `design` | 粉色 |
| ✍️ 内容创作 | `content` | 橙色 |
| 📈 营销增长 | `marketing` | 绿色 |

## 📖 示例代码

每个组件都有对应的示例文件：

- `CategoryCard.example.tsx` - 4 个示例
- `KOLCard.example.tsx` - 5 个示例
- `TweetCard.example.tsx` - 7 个示例
- `SearchBar.example.tsx` - 9 个示例

查看这些文件了解更多使用场景。

## 🔧 开发指南

### 添加新组件

1. 在 `components/` 创建组件文件
2. 在 `components/ui/` 创建基础 UI 组件
3. 创建对应的 `.example.tsx` 示例文件
4. 更新本 README

### 组件规范

- 使用 TypeScript
- 导出组件 Props 类型
- 使用 `cn()` 工具合并类名
- 支持 `className` prop
- 提供默认 props
- 使用 `forwardRef` (如需要)

### 样式规范

- 使用 Tailwind CSS 实用类
- 使用 CSS 变量（定义在 `globals.css`）
- 遵循 4px 间距系统
- 使用设计系统定义的颜色

## 🧪 测试

```bash
# 运行测试
npm run test

# 运行 Lint
npm run lint
```

## 📝 更新日志

### v1.0.0 (2026-02-16)

- ✅ CategoryCard 组件
- ✅ KOLCard 组件
- ✅ TweetCard 组件
- ✅ SearchBar 组件
- ✅ 基础 UI 组件（Card, Badge, Avatar, Input）
- ✅ 设计系统配置
- ✅ 示例文档

## 👥 贡献者

- **ui-designer** - UI/UX 设计与组件开发

## 📄 许可证

MIT
