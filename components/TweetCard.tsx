"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
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
  contentZh?: string
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
  featured?: boolean
  className?: string
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDate(dateString: string): string {
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

function getInitials(name: string): string {
  const chars = name.trim().split(/\s+/)
  if (chars.length >= 2) return `${chars[0][0]}${chars[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function TweetCard({
  id,
  content,
  contentZh,
  createdAt,
  tweetUrl,
  media = [],
  stats,
  author,
  featured = false,
  className,
}: TweetCardProps) {
  const displayContent = contentZh || content

  return (
    <article
      className={cn(
        "bg-card rounded-xl border border-border p-5 transition-all duration-200",
        "hover:shadow-card hover:border-primary/15",
        featured && "ring-1 ring-accent/30 border-accent/20",
        className
      )}
    >
      {/* Featured badge */}
      {featured && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-accent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>精选推文</span>
        </div>
      )}

      {/* Author header */}
      <div className="flex items-start gap-3">
        <Link href={`/kol/${author.username}`} className="shrink-0">
          <Avatar className="h-10 w-10 ring-1 ring-border hover:ring-primary/40 transition-all">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-xs font-medium bg-primary/5 text-primary">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/kol/${author.username}`}
              className="font-semibold text-sm hover:text-primary transition-colors truncate"
            >
              {author.name}
            </Link>
            <span className="text-xs text-muted-foreground truncate">
              @{author.username}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Calendar className="h-3 w-3" />
            <time dateTime={createdAt}>{formatDate(createdAt)}</time>
          </div>
        </div>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-primary transition-colors p-1"
          aria-label="在 Twitter 上查看"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Tweet content */}
      <div className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
        {displayContent}
      </div>

      {/* Show original if translated */}
      {contentZh && content !== contentZh && (
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
            查看原文
          </summary>
          <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border-l-2 border-border pl-3">
            {content}
          </div>
        </details>
      )}

      {/* Media */}
      {media.length > 0 && (
        <div
          className={cn(
            "grid gap-1.5 rounded-xl overflow-hidden mt-3",
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
                "relative bg-muted rounded-lg overflow-hidden",
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
                  className="object-cover"
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
                      <div className="w-0 h-0 border-l-8 border-l-foreground border-y-6 border-y-transparent ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground mt-4 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-default">
          <Heart className="h-3.5 w-3.5" />
          <span>{formatNumber(stats.likes)}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-default">
          <Repeat2 className="h-3.5 w-3.5" />
          <span>{formatNumber(stats.retweets)}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{formatNumber(stats.replies)}</span>
        </div>
      </div>
    </article>
  )
}
