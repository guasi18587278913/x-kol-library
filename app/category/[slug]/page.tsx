import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getAllCategories, getCategoryBySlug, getKOLsByCategory, getKOLCount } from "@/lib/queries"
import { KOLList } from "./KOLList"
import { ChevronRight } from "lucide-react"

const PAGE_SIZE = 12

interface CategoryPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)
  if (!category) return {}

  const title = `${category.icon} ${category.name}`
  const description = `浏览 ${category.name} 领域的 ${category.kol_count} 位顶级 KOL 及精选推文。${category.description || ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/category/${category.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)
  if (!category) notFound()

  const [kols, total] = await Promise.all([
    getKOLsByCategory(params.slug, PAGE_SIZE, 0),
    getKOLCount(params.slug),
  ])

  return (
    <main>
      {/* Category Header */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label="面包屑导航">
            <Link href="/" className="hover:text-primary transition-colors">
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-4xl" aria-hidden="true">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                共 <span className="font-medium text-foreground">{total}</span> 位 KOL
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KOL Grid */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <KOLList
          initialKOLs={kols}
          categorySlug={params.slug}
          categoryName={category.name}
          total={total}
          limit={PAGE_SIZE}
        />
      </div>
    </main>
  )
}
