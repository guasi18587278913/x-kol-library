/**
 * CategoryCard 组件使用示例
 *
 * 这个文件展示了如何使用 CategoryCard 组件
 */

import { CategoryCard, categoryVariants, categoryIcons, categoryNames } from "./CategoryCard"

// 示例 1: 单个类目卡片
export function SingleCategoryExample() {
  return (
    <CategoryCard
      id="1"
      name="AI 技术"
      icon="🤖"
      kolCount={25}
      slug="ai-tech"
      variant="ai"
    />
  )
}

// 示例 2: 类目网格布局
export function CategoryGridExample() {
  const categories = [
    { id: "1", name: "AI 技术", icon: "🤖", kolCount: 25, slug: "ai-tech", variant: "ai" as const },
    { id: "2", name: "创业出海", icon: "🚀", kolCount: 30, slug: "startup", variant: "startup" as const },
    { id: "3", name: "投资理财", icon: "💰", kolCount: 20, slug: "invest", variant: "invest" as const },
    { id: "4", name: "商业财富", icon: "💼", kolCount: 28, slug: "business", variant: "business" as const },
    { id: "5", name: "设计产品", icon: "🎨", kolCount: 22, slug: "design", variant: "design" as const },
    { id: "6", name: "内容创作", icon: "✍️", kolCount: 26, slug: "content", variant: "content" as const },
    { id: "7", name: "营销增长", icon: "📈", kolCount: 24, slug: "marketing", variant: "marketing" as const },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  )
}

// 示例 3: 从 API 数据动态渲染
export function DynamicCategoryExample() {
  // 模拟从 API 获取的数据
  const apiData = [
    { id: "1", name: "AI 技术", slug: "ai-tech", kol_count: 25 },
    { id: "2", name: "创业出海", slug: "startup", kol_count: 30 },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apiData.map((category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          icon={categoryIcons[category.slug] || "📁"}
          kolCount={category.kol_count}
          slug={category.slug}
          variant={categoryVariants[category.slug] || "ai"}
        />
      ))}
    </div>
  )
}

// 示例 4: 响应式布局（首页使用）
export function HomePageCategoriesExample() {
  const categories = [
    { id: "1", name: "AI 技术", icon: "🤖", kolCount: 25, slug: "ai-tech", variant: "ai" as const },
    { id: "2", name: "创业出海", icon: "🚀", kolCount: 30, slug: "startup", variant: "startup" as const },
    { id: "3", name: "投资理财", icon: "💰", kolCount: 20, slug: "invest", variant: "invest" as const },
    { id: "4", name: "商业财富", icon: "💼", kolCount: 28, slug: "business", variant: "business" as const },
    { id: "5", name: "设计产品", icon: "🎨", kolCount: 22, slug: "design", variant: "design" as const },
    { id: "6", name: "内容创作", icon: "✍️", kolCount: 26, slug: "content", variant: "content" as const },
    { id: "7", name: "营销增长", icon: "📈", kolCount: 24, slug: "marketing", variant: "marketing" as const },
  ]

  return (
    <section className="container mx-auto px-8 py-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">浏览类目</h2>
          <p className="text-muted-foreground">
            7 大类目，超过 150 位优质推特 KOL
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              className="animate-fade-in"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
