"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Repeat2, MessageCircle, ExternalLink } from "lucide-react"

interface TweetModalProps {
  tweet: {
    id: string
    content: string
    content_zh: string
    tweet_url: string
    tweet_time: string
    likes: number
    retweets: number
    replies: number
    media_urls: string[]
  }
  author: {
    name: string
    username: string
    avatar: string
  }
  open: boolean
  onClose: () => void
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(name: string): string {
  const chars = name.trim().split(/\s+/)
  if (chars.length >= 2) return `${chars[0][0]}${chars[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function TweetModal({ tweet, author, open, onClose }: TweetModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-6">
        <DialogTitle className="sr-only">推文详情</DialogTitle>
        {/* Author header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-border">
            {author.avatar ? (
              <AvatarImage src={author.avatar} alt={author.name} />
            ) : null}
            <AvatarFallback className="text-xs font-medium bg-primary/5 text-primary">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{author.name}</p>
            <p className="text-xs text-muted-foreground">@{author.username}</p>
          </div>
          <time className="text-xs text-muted-foreground shrink-0">
            {formatDate(tweet.tweet_time)}
          </time>
        </div>

        {/* Original content */}
        <div className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
          {tweet.content}
        </div>

        {/* Translation */}
        {tweet.content_zh && tweet.content_zh !== tweet.content && (
          <div className="mt-4">
            <div className="border-t border-border/60 pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                中文翻译
              </p>
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
                {tweet.content_zh}
              </div>
            </div>
          </div>
        )}

        {/* Media */}
        {tweet.media_urls && tweet.media_urls.length > 0 && (
          <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
            {tweet.media_urls.map((url, i) => (
              <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={url}
                  alt={`Media ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats + Link */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-red-400" />
              {formatNumber(tweet.likes)}
            </span>
            <span className="flex items-center gap-1.5">
              <Repeat2 className="h-3.5 w-3.5 text-green-500" />
              {formatNumber(tweet.retweets)}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              {formatNumber(tweet.replies)}
            </span>
          </div>
          <a
            href={tweet.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            在 X 查看原文
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
