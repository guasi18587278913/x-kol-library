/**
 * 类目工具函数和常量
 *
 * 这个文件包含了所有与类目相关的常量和工具函数
 * 可以在服务器端和客户端组件中共同使用
 */

// 类目 variant 类型定义
export type CategoryVariant = "ai" | "startup" | "invest" | "business" | "design" | "content" | "marketing"

// 类目颜色映射
export const categoryVariants: Record<string, CategoryVariant> = {
  "ai-tech": "ai",
  "startup-global": "startup",
  "investment-finance": "invest",
  "business-wealth": "business",
  "design-product": "design",
  "content-creation": "content",
  "marketing-growth": "marketing",
}

// 类目图标映射
export const categoryIcons: Record<string, string> = {
  "ai-tech": "🤖",
  "startup-global": "🚀",
  "investment-finance": "💰",
  "business-wealth": "💼",
  "design-product": "🎨",
  "content-creation": "✍️",
  "marketing-growth": "📈",
}

// 类目名称映射
export const categoryNames: Record<string, string> = {
  "ai-tech": "AI 技术",
  "startup-global": "创业出海",
  "investment-finance": "投资理财",
  "business-wealth": "商业财富",
  "design-product": "设计产品",
  "content-creation": "内容创作",
  "marketing-growth": "营销增长",
}

/**
 * 根据 slug 获取类目的 variant
 */
export function getCategoryVariant(slug: string): CategoryVariant {
  return categoryVariants[slug] || "ai"
}

/**
 * 根据 slug 获取类目图标
 */
export function getCategoryIcon(slug: string): string {
  return categoryIcons[slug] || "📁"
}

/**
 * 根据 slug 获取类目名称
 */
export function getCategoryName(slug: string): string {
  return categoryNames[slug] || slug
}
