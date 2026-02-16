"use client"

import { useState } from "react"
import { KOLCard } from "@/components/KOLCard"
import { LoadMoreButton } from "@/components/LoadMoreButton"
import type { KOL } from "@/lib/types"

const SLUG_TO_VARIANT: Record<string, "ai" | "startup" | "invest" | "business" | "design" | "content" | "marketing"> = {
  "ai-tech": "ai",
  startup: "startup",
  invest: "invest",
  business: "business",
  design: "design",
  content: "content",
  marketing: "marketing",
}

const SLUG_TO_NAME: Record<string, string> = {
  "ai-tech": "AI 技术",
  startup: "创业出海",
  invest: "投资理财",
  business: "商业财富",
  design: "设计产品",
  content: "内容创作",
  marketing: "营销增长",
}

interface KOLListProps {
  initialKOLs: KOL[]
  categorySlug: string
  categoryName: string
  total: number
  limit: number
}

export function KOLList({ initialKOLs, categorySlug, categoryName, total, limit }: KOLListProps) {
  const [kols, setKols] = useState<KOL[]>(initialKOLs)
  const [loading, setLoading] = useState(false)
  const hasMore = kols.length < total

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/categories/${categorySlug}?limit=${limit}&offset=${kols.length}`
      )
      const json = await res.json()
      if (json.data?.kols) {
        setKols((prev) => [...prev, ...json.data.kols])
      }
    } finally {
      setLoading(false)
    }
  }

  const variant = SLUG_TO_VARIANT[categorySlug]

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {kols.map((kol) => (
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
              name: categoryName,
              slug: categorySlug,
              variant: variant || "ai",
            }}
            slug={kol.username}
          />
        ))}
      </div>

      {hasMore && (
        <LoadMoreButton onClick={loadMore} loading={loading} />
      )}
    </>
  )
}
