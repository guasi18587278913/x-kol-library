"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

export interface KOLCardProps {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followersCount: number
  tweetCount: number
  category: {
    name: string
    slug: string
    variant: "ai" | "startup" | "invest" | "business" | "design" | "content" | "marketing"
  }
  slug: string
  className?: string
}

/**
 * KOL 卡片组件
 *
 * 显示 KOL 的头像、名称、简介、粉丝数和类目标签
 */
export function KOLCard({
  id,
  name,
  username,
  avatar,
  bio,
  followersCount,
  tweetCount,
  category,
  slug,
  className,
}: KOLCardProps) {
  // 格式化粉丝数（K/M）
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  // 获取名称首字母作为头像占位符
  const getInitials = (name: string): string => {
    const chars = name.trim().split(/\s+/)
    if (chars.length >= 2) {
      return `${chars[0][0]}${chars[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <Link href={`/kol/${slug}`} className="block">
      <Card
        className={cn(
          "group cursor-pointer card-hover transition-all duration-200",
          "hover:shadow-card-hover hover:-translate-y-1",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {/* 头像 */}
            <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-accent transition-all">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-sm font-medium bg-muted">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-accent transition-colors">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 简介 */}
          <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
            {bio}
          </p>

          {/* 统计数据 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{formatFollowers(followersCount)}</span>
            </div>
            <div>
              <span className="font-medium">{tweetCount}</span>
              <span className="ml-1">推文</span>
            </div>
          </div>

          {/* 类目标签 */}
          <div className="pt-1">
            <Badge variant={category.variant} className="text-xs">
              {category.name}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
