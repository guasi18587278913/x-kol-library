"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat2, ExternalLink, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TweetMedia {
  type: "photo" | "video"
  url: string
  thumbnailUrl?: string
  altText?: string
}

export interface TweetCardProps {
  id: string
  content: string
  createdAt: string
  tweetUrl: string
  media?: TweetMedia[]
  stats: {
    likes: number
    retweets: number
    replies: number
  }
  author: {
    name: string
    username: string
    avatar: string
  }
  className?: string
}

/**
 * 推文卡片组件
 *
 * 显示推文内容、媒体、互动数据和时间
 */
export function TweetCard({
  id,
  content,
  createdAt,
  tweetUrl,
  media = [],
  stats,
  author,
  className,
}: TweetCardProps) {
  // 格式化数字（K/M）
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // 格式化时间
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes}分钟前`
      }
      return `${hours}小时前`
    } else if (days === 1) {
      return "昨天"
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
      })
    }
  }

  // 获取名称首字母
  const getInitials = (name: string): string => {
    const chars = name.trim().split(/\s+/)
    if (chars.length >= 2) {
      return `${chars[0][0]}${chars[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* 作者头像 */}
          <Link href={`/kol/${author.username}`}>
            <Avatar className="h-10 w-10 ring-2 ring-border hover:ring-accent transition-all">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="text-xs font-medium bg-muted">
                {getInitials(author.name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* 作者信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/kol/${author.username}`}
                className="font-semibold hover:text-accent transition-colors line-clamp-1"
              >
                {author.name}
              </Link>
              <span className="text-sm text-muted-foreground">
                @{author.username}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3" />
              <time dateTime={createdAt}>{formatDate(createdAt)}</time>
            </div>
          </div>

          {/* 外链图标 */}
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors"
            aria-label="在 Twitter 上查看"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 推文内容 */}
        <div className="text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* 媒体内容 */}
        {media.length > 0 && (
          <div
            className={cn(
              "grid gap-2 rounded-lg overflow-hidden",
              media.length === 1 && "grid-cols-1",
              media.length === 2 && "grid-cols-2",
              media.length === 3 && "grid-cols-2",
              media.length >= 4 && "grid-cols-2"
            )}
          >
            {media.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className={cn(
                  "relative bg-muted rounded-md overflow-hidden",
                  media.length === 1 && "aspect-video",
                  media.length === 3 && index === 0 && "row-span-2",
                  media.length > 1 && media.length !== 3 && "aspect-square"
                )}
              >
                {item.type === "photo" ? (
                  <Image
                    src={item.url}
                    alt={item.altText || "推文图片"}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {item.thumbnailUrl && (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.altText || "视频缩略图"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-8 border-l-black border-y-6 border-y-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 互动统计 */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 group/stat">
            <Heart className="h-4 w-4 group-hover/stat:text-red-500 transition-colors" />
            <span className="font-medium group-hover/stat:text-red-500 transition-colors">
              {formatNumber(stats.likes)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 group/stat">
            <Repeat2 className="h-4 w-4 group-hover/stat:text-green-500 transition-colors" />
            <span className="font-medium group-hover/stat:text-green-500 transition-colors">
              {formatNumber(stats.retweets)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 group/stat">
            <MessageCircle className="h-4 w-4 group-hover/stat:text-blue-500 transition-colors" />
            <span className="font-medium group-hover/stat:text-blue-500 transition-colors">
              {formatNumber(stats.replies)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 类型导出
export type { TweetCardProps, TweetMedia }
