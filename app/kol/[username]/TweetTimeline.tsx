"use client"

import { useState } from "react"
import { TweetCard } from "@/components/TweetCard"
import { LoadMoreButton } from "@/components/LoadMoreButton"
import type { Tweet } from "@/lib/types"

interface TweetTimelineProps {
  initialTweets: Tweet[]
  username: string
  authorName: string
  authorAvatar: string
  total: number
  limit: number
}

export function TweetTimeline({
  initialTweets,
  username,
  authorName,
  authorAvatar,
  total,
  limit,
}: TweetTimelineProps) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets)
  const [loading, setLoading] = useState(false)
  const hasMore = tweets.length < total

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/kols/${username}/tweets?limit=${limit}&offset=${tweets.length}`
      )
      const json = await res.json()
      if (json.data?.tweets) {
        setTweets((prev) => [...prev, ...json.data.tweets])
      }
    } finally {
      setLoading(false)
    }
  }

  if (tweets.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        暂无推文数据
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            id={tweet.id}
            content={tweet.content}
            contentZh={tweet.content_zh}
            createdAt={tweet.tweet_time}
            tweetUrl={tweet.tweet_url}
            mediaUrls={tweet.media_urls}
            stats={{
              likes: tweet.likes,
              retweets: tweet.retweets,
              replies: tweet.replies,
            }}
            author={{
              name: authorName,
              username: username,
              avatar: authorAvatar,
            }}
          />
        ))}
      </div>

      {hasMore && (
        <LoadMoreButton onClick={loadMore} loading={loading} />
      )}
    </>
  )
}
