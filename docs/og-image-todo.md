# Open Graph 图片待办事项

## 需要创建的 OG 图片

为了完善社交媒体分享效果，需要创建以下 Open Graph 图片：

### 1. 主图片 (`public/og-image.png`)

**尺寸**：1200x630px

**设计要求**：
- 包含产品名称："推特大佬电子阅览室"
- 突出核心价值：164 位顶级 KOL，7 大领域
- 品牌配色：使用 7 个类目颜色
- 清晰易读的字体

**内容建议**：
```
推特大佬电子阅览室
━━━━━━━━━━━━━━━━━━

🤖 AI 技术  🚀 创业出海  💰 投资理财
💼 商业财富  🎨 设计产品  ✍️ 内容创作  📈 营销增长

164 位顶级 KOL | 精选推文 | 一站式浏览
```

### 2. 创建方法

#### 方法 A：使用 Figma/Sketch 设计
1. 创建 1200x630px 画布
2. 参考 `docs/design-system.md` 中的配色方案
3. 导出为 PNG 格式
4. 放置在 `public/og-image.png`

#### 方法 B：使用 Next.js 动态生成 (推荐)
使用 `@vercel/og` 或 `next/og` 在服务端动态生成 OG 图片。

示例代码：
```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1>推特大佬电子阅览室</h1>
        <p>164 位顶级 KOL | 7 大领域</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

### 3. 部署前临时方案

如果暂时无法创建 OG 图片，可以：
1. 使用纯色背景 + 文字的简单图片
2. 或者先注释掉 `layout.tsx` 中的 `images` 字段
3. 部署后再补充

## 当前状态

- ✅ OG 标签已添加到所有页面
- ⏸️ OG 图片待创建（`public/og-image.png`）
- 📝 建议：使用 `@vercel/og` 动态生成

## 优先级

**P1 - 中优先级**
- 可以先部署，后续补充 OG 图片
- 即使没有图片，OG 标签仍然有效（会显示文字预览）
