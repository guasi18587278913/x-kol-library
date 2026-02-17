import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getKOLByUsername, getTweetsByKOL, getTweetCount } from "@/lib/queries"
import { categoryVariants, categoryNames } from "@/lib/category-utils"
import { TweetTimeline } from "./TweetTimeline"
import { Users, ExternalLink, ChevronRight, FileText } from "lucide-react"

const PAGE_SIZE = 20

interface KOLPageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: KOLPageProps): Promise<Metadata> {
  const kol = await getKOLByUsername(params.username)
  if (!kol) return {}

  const title = `${kol.display_name} (@${kol.username})`
  const description = kol.bio || `${kol.display_name} 的推文合集`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/kol/${kol.username}`,
      type: 'profile',
      images: kol.avatar_url ? [{ url: kol.avatar_url, width: 400, height: 400, alt: kol.display_name }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: kol.avatar_url ? [kol.avatar_url] : undefined,
    },
  }
}

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

export default async function KOLPage({ params }: KOLPageProps) {
  const kol = await getKOLByUsername(params.username)
  if (!kol) notFound()

  const [tweets, total] = await Promise.all([
    getTweetsByKOL(params.username, PAGE_SIZE, 0),
    getTweetCount(params.username),
  ])

  const categorySlugs = (kol.categories as string[]) || []

  return (
    <main>
      {/* KOL Profile Header */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label="面包屑导航">
            <Link href="/" className="hover:text-primary transition-colors">
              首页
            </Link>
            {categorySlugs[0] && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                  href={`/category/${categorySlugs[0]}`}
                  className="hover:text-primary transition-colors"
                >
                  {categoryNames[categorySlugs[0]] || categorySlugs[0]}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate">{kol.display_name}</span>
          </nav>

          {/* Profile */}
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16 lg:h-20 lg:w-20 ring-2 ring-primary/20">
              <AvatarImage src={kol.avatar_url} alt={kol.display_name} />
              <AvatarFallback className="text-lg font-medium bg-primary/5 text-primary">
                {getInitials(kol.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold truncate">{kol.display_name}</h1>
                {kol.profile_url && (
                  <a
                    href={kol.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="在 Twitter 上查看"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5">@{kol.username}</p>

              {kol.bio && (
                <p className="text-sm leading-relaxed mt-3 max-w-3xl">{kol.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-5 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-foreground">{formatFollowers(kol.followers)}</span>
                  <span>粉丝</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-foreground">{total}</span>
                  <span>条已收录</span>
                </div>
              </div>

              {/* Category Tags */}
              {categorySlugs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {categorySlugs.map((slug) => (
                    <Link key={slug} href={`/category/${slug}`}>
                      <Badge variant={categoryVariants[slug] || "secondary"}>
                        {categoryNames[slug] || slug}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tweet Timeline */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 rounded-full bg-primary" />
          <h2 className="text-xl font-bold">推文时间线</h2>
        </div>
        <TweetTimeline
          initialTweets={tweets}
          username={kol.username}
          authorName={kol.display_name}
          authorAvatar={kol.avatar_url}
          total={total}
          limit={PAGE_SIZE}
        />
      </div>
    </main>
  )
}
