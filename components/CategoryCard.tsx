"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <Link href={`/category/${slug}`} className="block">
      <Card
        className={cn(
          "group cursor-pointer card-hover transition-all duration-200",
          "hover:shadow-card-hover hover:-translate-y-1",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-4xl" aria-hidden="true">
              {icon}
            </div>
            <Badge variant={variant} className="text-xs">
              {kolCount} 位
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <CardTitle className="text-xl mb-2 group-hover:text-accent transition-colors">
            {name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            发现 {kolCount} 位优质 KOL
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
