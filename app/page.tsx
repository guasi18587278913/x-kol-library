import Link from "next/link"
import { getAllCategories, getFeaturedTweets, getLatestTweets, getTotalKOLCount, getTotalTweetCount, getKOLMap } from "@/lib/queries"
import { CategoryCard } from "@/components/CategoryCard"
import { TweetCard } from "@/components/TweetCard"
import { LatestTweets } from "@/components/LatestTweets"
import { categoryVariants } from "@/lib/category-utils"
import { Users, FileText, Layers } from "lucide-react"

export default async function HomePage() {
  const [categories, featuredTweets, latestTweets, kolCount, tweetCount] = await Promise.all([
    getAllCategories(),
    getFeaturedTweets(6),
    getLatestTweets(20, 0),
    getTotalKOLCount(),
    getTotalTweetCount(),
  ])

  // Get KOL info for all tweets
  const allTweets = [...featuredTweets, ...latestTweets]
  const uniqueUsernames = [...new Set(allTweets.map((t) => t.kol_username))]
  const kolMap = await getKOLMap(uniqueUsernames)

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

      <div className="container mx-auto px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Tweets */}
        {featuredTweets.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 rounded-full bg-accent" />
              <h2 className="text-xl font-bold">精选推文</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {featuredTweets.map((tweet) => {
                const kol = kolMap[tweet.kol_username]
                return (
                  <TweetCard
                    key={tweet.id}
                    id={tweet.id}
                    content={tweet.content}
                    contentZh={tweet.content_zh}
                    createdAt={tweet.tweet_time}
                    tweetUrl={tweet.tweet_url}
                    featured
                    stats={{
                      likes: tweet.likes,
                      retweets: tweet.retweets,
                      replies: tweet.replies,
                    }}
                    author={{
                      name: kol?.display_name || tweet.kol_username,
                      username: tweet.kol_username,
                      avatar: kol?.avatar_url || "",
                    }}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Browse Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-primary" />
              <h2 className="text-xl font-bold">浏览类目</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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

        {/* Latest Tweets Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h2 className="text-xl font-bold">最新推文</h2>
          </div>
          <LatestTweets initialTweets={latestTweets} kolMap={kolMap} />
        </section>
      </div>
    </main>
  )
}
