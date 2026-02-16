import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getAllCategories, getCategoryBySlug, getKOLsByCategory, getKOLCount } from "@/lib/queries"
import { KOLList } from "./KOLList"

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
    <main className="container mx-auto py-12 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="面包屑导航">
        <Link href="/" className="hover:text-foreground transition-colors">
          首页
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category Header */}
      <section className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">{category.icon}</span>
          <h1 className="text-4xl font-bold">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          共 {total} 位 KOL
        </p>
      </section>

      {/* KOL List with Load More */}
      <section>
        <KOLList
          initialKOLs={kols}
          categorySlug={params.slug}
          categoryName={category.name}
          total={total}
          limit={PAGE_SIZE}
        />
      </section>
    </main>
  )
}
