"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { CategoryVariant } from "@/lib/category-utils"

export interface CategoryCardProps {
  id: string
  name: string
  icon: string
  kolCount: number
  slug: string
  variant?: CategoryVariant
  className?: string
}

export function CategoryCard({
  id,
  name,
  icon,
  kolCount,
  slug,
  variant = "ai",
  className,
}: CategoryCardProps) {
  return (
    <Link href={`/category/${slug}`} className="block group">
      <div
        className={cn(
          "bg-card rounded-xl border border-border p-5 transition-all duration-200",
          "hover:shadow-card hover:border-primary/15 hover:-translate-y-0.5",
          className
        )}
      >
        <div className="text-3xl mb-3" aria-hidden="true">
          {icon}
        </div>
        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {kolCount} 位 KOL
        </p>
      </div>
    </Link>
  )
}
