"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, FileText } from "lucide-react"
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

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

function getInitials(name: string): string {
  const chars = name.trim().split(/\s+/)
  if (chars.length >= 2) return `${chars[0][0]}${chars[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

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
  return (
    <Link href={`/kol/${slug}`} className="block group">
      <div
        className={cn(
          "bg-card rounded-xl border border-border p-5 transition-all duration-200",
          "hover:shadow-card hover:border-primary/15 hover:-translate-y-0.5",
          className
        )}
      >
        {/* Header: Avatar + Name */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-1 ring-border group-hover:ring-primary/30 transition-all">
            {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
            <AvatarFallback className="text-sm font-medium bg-primary/5 text-primary">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Stats + Category */}
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{formatFollowers(followersCount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{tweetCount}</span>
            </span>
          </div>
          <Badge variant={category.variant} className="text-[10px] px-2 py-0.5">
            {category.name}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
