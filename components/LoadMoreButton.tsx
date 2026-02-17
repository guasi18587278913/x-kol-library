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
        className="inline-flex items-center justify-center rounded-lg bg-primary/5 border border-primary/20 text-primary px-8 py-2.5 text-sm font-medium hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "加载中..." : "加载更多"}
      </button>
    </div>
  )
}
