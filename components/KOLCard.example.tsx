/**
 * KOLCard 组件使用示例
 *
 * 这个文件展示了如何使用 KOLCard 组件
 */

import { KOLCard } from "./KOLCard"

// 示例 1: 单个 KOL 卡片
export function SingleKOLExample() {
  return (
    <KOLCard
      id="1"
      name="Sam Altman"
      username="sama"
      avatar="https://pbs.twimg.com/profile_images/1234567890/sama.jpg"
      bio="CEO of OpenAI. Previously president of Y Combinator. Interested in technology, startups, and the future."
      followersCount={2500000}
      tweetCount={15234}
      category={{
        name: "AI 技术",
        slug: "ai-tech",
        variant: "ai",
      }}
      slug="sama"
    />
  )
}

// 示例 2: KOL 网格布局
export function KOLGridExample() {
  const kols = [
    {
      id: "1",
      name: "Sam Altman",
      username: "sama",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      bio: "CEO of OpenAI. Previously president of Y Combinator.",
      followersCount: 2500000,
      tweetCount: 15234,
      category: { name: "AI 技术", slug: "ai-tech", variant: "ai" as const },
      slug: "sama",
    },
    {
      id: "2",
      name: "Naval Ravikant",
      username: "naval",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/naval.jpg",
      bio: "Angel investor, founder of AngelList. Creator of AngelList and Epinions.",
      followersCount: 1800000,
      tweetCount: 8932,
      category: { name: "创业出海", slug: "startup", variant: "startup" as const },
      slug: "naval",
    },
    {
      id: "3",
      name: "Paul Graham",
      username: "paulg",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/paulg.jpg",
      bio: "Programmer, writer, and investor. Co-founder of Y Combinator.",
      followersCount: 1500000,
      tweetCount: 12456,
      category: { name: "创业出海", slug: "startup", variant: "startup" as const },
      slug: "paulg",
    },
    {
      id: "4",
      name: "Balaji Srinivasan",
      username: "balajis",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/balajis.jpg",
      bio: "Investor, entrepreneur, and author. Former CTO of Coinbase.",
      followersCount: 950000,
      tweetCount: 24567,
      category: { name: "投资理财", slug: "invest", variant: "invest" as const },
      slug: "balajis",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {kols.map((kol) => (
        <KOLCard key={kol.id} {...kol} />
      ))}
    </div>
  )
}

// 示例 3: 从 API 数据动态渲染
export function DynamicKOLExample() {
  // 模拟从 API 获取的数据
  const apiData = [
    {
      id: "1",
      name: "Sam Altman",
      username: "sama",
      avatar_url: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      bio: "CEO of OpenAI",
      followers_count: 2500000,
      tweet_count: 15234,
      category_name: "AI 技术",
      category_slug: "ai-tech",
      slug: "sama",
    },
  ]

  const categoryVariants: Record<string, any> = {
    "ai-tech": "ai",
    "startup": "startup",
    "invest": "invest",
    "business": "business",
    "design": "design",
    "content": "content",
    "marketing": "marketing",
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {apiData.map((kol) => (
        <KOLCard
          key={kol.id}
          id={kol.id}
          name={kol.name}
          username={kol.username}
          avatar={kol.avatar_url}
          bio={kol.bio}
          followersCount={kol.followers_count}
          tweetCount={kol.tweet_count}
          category={{
            name: kol.category_name,
            slug: kol.category_slug,
            variant: categoryVariants[kol.category_slug] || "ai",
          }}
          slug={kol.slug}
        />
      ))}
    </div>
  )
}

// 示例 4: 类目详情页 KOL 列表
export function CategoryKOLListExample() {
  const kols = [
    {
      id: "1",
      name: "Sam Altman",
      username: "sama",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      bio: "CEO of OpenAI. Previously president of Y Combinator. Interested in technology, startups, and the future.",
      followersCount: 2500000,
      tweetCount: 15234,
      category: { name: "AI 技术", slug: "ai-tech", variant: "ai" as const },
      slug: "sama",
    },
    {
      id: "2",
      name: "Andrej Karpathy",
      username: "karpathy",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/karpathy.jpg",
      bio: "Director of AI at Tesla. Previously research scientist at OpenAI. Deep learning researcher.",
      followersCount: 520000,
      tweetCount: 8234,
      category: { name: "AI 技术", slug: "ai-tech", variant: "ai" as const },
      slug: "karpathy",
    },
  ]

  return (
    <section className="container mx-auto px-8 py-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">AI 技术 KOL</h2>
          <p className="text-muted-foreground">
            发现 {kols.length} 位 AI 领域的优质 KOL
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {kols.map((kol) => (
            <KOLCard key={kol.id} {...kol} className="animate-fade-in" />
          ))}
        </div>
      </div>
    </section>
  )
}

// 示例 5: 首页推荐 KOL
export function FeaturedKOLsExample() {
  const featuredKOLs = [
    {
      id: "1",
      name: "Sam Altman",
      username: "sama",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      bio: "CEO of OpenAI",
      followersCount: 2500000,
      tweetCount: 15234,
      category: { name: "AI 技术", slug: "ai-tech", variant: "ai" as const },
      slug: "sama",
    },
    {
      id: "2",
      name: "Naval Ravikant",
      username: "naval",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/naval.jpg",
      bio: "Angel investor, founder of AngelList",
      followersCount: 1800000,
      tweetCount: 8932,
      category: { name: "创业出海", slug: "startup", variant: "startup" as const },
      slug: "naval",
    },
    {
      id: "3",
      name: "Figma",
      username: "figma",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/figma.jpg",
      bio: "Design, prototype, and gather feedback all in one place",
      followersCount: 450000,
      tweetCount: 5234,
      category: { name: "设计产品", slug: "design", variant: "design" as const },
      slug: "figma",
    },
    {
      id: "4",
      name: "Gary Vaynerchuk",
      username: "garyvee",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/garyvee.jpg",
      bio: "CEO of VaynerMedia. Host of #AskGaryVee & The GaryVee Audio Experience",
      followersCount: 3200000,
      tweetCount: 134567,
      category: { name: "营销增长", slug: "marketing", variant: "marketing" as const },
      slug: "garyvee",
    },
    {
      id: "5",
      name: "Tim Ferriss",
      username: "tferriss",
      avatar: "https://pbs.twimg.com/profile_images/1234567890/tferriss.jpg",
      bio: "Author of 5 NYT/WSJ bestsellers. Host of The Tim Ferriss Show podcast",
      followersCount: 1900000,
      tweetCount: 12345,
      category: { name: "内容创作", slug: "content", variant: "content" as const },
      slug: "tferriss",
    },
  ]

  return (
    <section className="container mx-auto px-8 py-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">推荐 KOL</h2>
          <p className="text-muted-foreground">
            精选各领域顶尖 KOL，获取最有价值的观点
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {featuredKOLs.map((kol, index) => (
            <KOLCard
              key={kol.id}
              {...kol}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
