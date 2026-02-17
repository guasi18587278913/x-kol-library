import Link from "next/link"
import Image from "next/image"
import { getAllCategories, getKOLsByCategory, getTotalKOLCount, getTotalTweetCount } from "@/lib/queries"
import { Users, FileText, Layers, ChevronRight } from "lucide-react"

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

function getInitials(name: string): string {
  const chars = name.trim().split(/\s+/)
  if (chars.length >= 2) return `${chars[0][0]}${chars[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default async function HomePage() {
  const [categories, kolCount, tweetCount] = await Promise.all([
    getAllCategories(),
    getTotalKOLCount(),
    getTotalTweetCount(),
  ])

  // Fetch KOLs for each category in parallel
  const categoryKOLs = await Promise.all(
    categories.map((cat) => getKOLsByCategory(cat.slug, 10, 0))
  )

  return (
    <main>
      {/* Hero Section */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              推特大佬电子阅览室
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              精选推特各领域顶级 KOL 的完整推文，中英双语阅读，无需翻墙即可追踪行业最前沿的观点与洞察。
            </p>
            {/* Stats */}
            <div className="mt-8 flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{kolCount}+</p>
                  <p className="text-xs text-muted-foreground">位 KOL</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{tweetCount.toLocaleString()}+</p>
                  <p className="text-xs text-muted-foreground">条推文</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">大类目</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category KOL Showcase */}
      <div className="container mx-auto px-6 lg:px-8 py-12 space-y-12">
        {categories.map((category, catIdx) => {
          const kols = categoryKOLs[catIdx]
          if (!kols || kols.length === 0) return null

          return (
            <section key={category.id}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{category.icon}</span>
                  <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
                  <span className="text-xs text-muted-foreground ml-1">
                    {category.kol_count} 位 KOL
                  </span>
                </div>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                >
                  查看全部
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* KOL cards horizontal scroll */}
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {kols.map((kol) => (
                  <Link
                    key={kol.id}
                    href={`/kol/${kol.username}`}
                    className="shrink-0 block group"
                  >
                    <div className="bg-card rounded-xl border border-border p-4 w-[200px] transition-all duration-200 hover:shadow-card hover:border-primary/15 hover:-translate-y-0.5">
                      {/* Avatar */}
                      <div className="flex justify-center mb-3">
                        {kol.avatar_url ? (
                          <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden ring-1 ring-border group-hover:ring-primary/30 transition-all">
                            <Image
                              src={kol.avatar_url}
                              alt={kol.display_name}
                              width={60}
                              height={60}
                              className="object-cover rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="w-[60px] h-[60px] rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-border text-primary font-semibold text-lg">
                            {getInitials(kol.display_name)}
                          </div>
                        )}
                      </div>
                      {/* Name */}
                      <h3 className="font-semibold text-sm text-center truncate group-hover:text-primary transition-colors">
                        {kol.display_name}
                      </h3>
                      <p className="text-xs text-muted-foreground text-center truncate mt-0.5">
                        @{kol.username}
                      </p>
                      {/* Followers */}
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                        <Users className="h-3 w-3" />
                        <span className="font-medium text-foreground">{formatFollowers(kol.followers)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Divider between categories (except last) */}
              {catIdx < categories.length - 1 && (
                <div className="border-b border-border/60 mt-8" />
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
