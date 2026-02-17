"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchBar } from "@/components/SearchBar"
import { KOLCard } from "@/components/KOLCard"
import { TweetCard } from "@/components/TweetCard"
import { categoryVariants, categoryNames } from "@/lib/category-utils"
import type { KOL, Tweet } from "@/lib/types"

type SearchType = "all" | "kols" | "tweets"

const TYPE_LABELS: Record<SearchType, string> = {
  all: "全部",
  kols: "KOL",
  tweets: "推文",
}

export function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query = searchParams.get("q") || ""
  const type = (searchParams.get("type") as SearchType) || "all"

  const [kols, setKols] = useState<KOL[]>([])
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string, t: SearchType) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}&type=${t}&limit=20`
      )
      const json = await res.json()
      setKols(json.data?.kols || [])
      setTweets(json.data?.tweets || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query) {
      doSearch(query, type)
    }
  }, [query, type, doSearch])

  const handleSearch = (q: string) => {
    if (!q.trim()) return
    const params = new URLSearchParams()
    params.set("q", q.trim())
    if (type !== "all") params.set("type", type)
    router.push(`/search?${params.toString()}`)
  }

  const handleTypeChange = (newType: SearchType) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (newType !== "all") params.set("type", newType)
    router.push(`/search?${params.toString()}`)
  }

  const totalResults = kols.length + tweets.length
  const showKols = type === "all" || type === "kols"
  const showTweets = type === "all" || type === "tweets"

  return (
    <>
      {/* Search Header */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-4">搜索</h1>
          <SearchBar
            placeholder="搜索 KOL 或推文内容..."
            onSearch={handleSearch}
            showShortcut={false}
          />

          {/* Type Tabs */}
          {searched && (
            <div className="flex items-center gap-1 mt-6 border-b border-transparent -mb-px">
              {(Object.keys(TYPE_LABELS) as SearchType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    type === t
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {TYPE_LABELS[t]}
                  {type === t && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
              {!loading && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {totalResults} 个结果
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 skeleton rounded-xl" />
            ))}
          </div>
        ) : searched && totalResults === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-lg font-medium">未找到相关结果</p>
            <p className="text-sm text-muted-foreground">换个关键词试试？</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* KOL Results */}
            {showKols && kols.length > 0 && (
              <section>
                {type === "all" && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-primary" />
                    <h2 className="text-lg font-semibold">KOL ({kols.length})</h2>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {kols.map((kol) => {
                    const firstCategory = (kol.categories as string[])?.[0]
                    return (
                      <KOLCard
                        key={kol.id}
                        id={kol.id}
                        name={kol.display_name}
                        username={kol.username}
                        avatar={kol.avatar_url}
                        bio={kol.bio}
                        followersCount={kol.followers}
                        tweetCount={kol.tweet_total}
                        category={{
                          name: categoryNames[firstCategory] || firstCategory || "",
                          slug: firstCategory || "",
                          variant: categoryVariants[firstCategory] || "ai",
                        }}
                        slug={kol.username}
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {/* Tweet Results */}
            {showTweets && tweets.length > 0 && (
              <section>
                {type === "all" && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-primary" />
                    <h2 className="text-lg font-semibold">推文 ({tweets.length})</h2>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {tweets.map((tweet) => (
                    <TweetCard
                      key={tweet.id}
                      id={tweet.id}
                      content={tweet.content}
                      contentZh={tweet.content_zh}
                      createdAt={tweet.tweet_time}
                      tweetUrl={tweet.tweet_url}
                      stats={{
                        likes: tweet.likes,
                        retweets: tweet.retweets,
                        replies: tweet.replies,
                      }}
                      author={{
                        name: tweet.kol_username,
                        username: tweet.kol_username,
                        avatar: "",
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}
