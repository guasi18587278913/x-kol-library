"use client"

import { cn } from "@/lib/utils"

interface LoadMoreButtonProps {
  onClick: () => void
  loading: boolean
  className?: string
}

export function LoadMoreButton({ onClick, loading, className }: LoadMoreButtonProps) {
  return (
    <div className={cn("flex justify-center pt-8", className)}>
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3 text-sm font-medium hover:bg-secondary hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "加载中..." : "加载更多"}
      </button>
    </div>
  )
}
