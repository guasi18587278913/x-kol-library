import { getAllCategories } from "@/lib/queries"
import { CategoryCard, categoryVariants } from "@/components/CategoryCard"
import { SearchBar } from "@/components/SearchBar"

export default async function HomePage() {
  const categories = await getAllCategories()

  return (
    <main className="container mx-auto py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 animate-fade-in">
        <h1 className="text-5xl font-bold tracking-tight">
          推特大佬电子阅览室
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          精选 {categories.reduce((sum, c) => sum + c.kol_count, 0)}+ 位推特大佬，{categories.length} 大类目，一站式浏览顶级 KOL 的精彩观点
        </p>
        <div className="flex justify-center">
          <SearchBar placeholder="搜索 KOL 或推文内容..." />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold">浏览类目</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              icon={category.icon}
              kolCount={category.kol_count}
              slug={category.slug}
              variant={categoryVariants[category.slug]}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
