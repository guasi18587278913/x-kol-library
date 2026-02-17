"use client"

import { useState } from "react"
import { TweetCard } from "@/components/TweetCard"
import { LoadMoreButton } from "@/components/LoadMoreButton"
import type { Tweet } from "@/lib/types"

interface LatestTweetsProps {
  initialTweets: Tweet[]
  kolMap: Record<string, { display_name: string; avatar_url: string }>
}

export function LatestTweets({ initialTweets, kolMap }: LatestTweetsProps) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTweets.length >= 20)

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tweets?limit=20&offset=${tweets.length}`)
      const json = await res.json()
      const newTweets = json.data?.tweets || []
      if (newTweets.length < 20) setHasMore(false)
      setTweets((prev) => [...prev, ...newTweets])
    } finally {
      setLoading(false)
    }
  }

  if (tweets.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tweets.map((tweet) => {
          const kol = kolMap[tweet.kol_username]
          return (
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
                name: kol?.display_name || tweet.kol_username,
                username: tweet.kol_username,
                avatar: kol?.avatar_url || "",
              }}
            />
          )
        })}
      </div>
      {hasMore && <LoadMoreButton onClick={loadMore} loading={loading} />}
    </>
  )
}
