"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Command } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  debounceMs?: number
  showShortcut?: boolean
  className?: string
}

/**
 * 搜索框组件
 *
 * 支持实时搜索（防抖）和快捷键（Ctrl/Cmd + K）
 */
export function SearchBar({
  placeholder = "搜索 KOL 或推文内容...",
  onSearch,
  debounceMs = 300,
  showShortcut = true,
  className,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const debounceTimerRef = React.useRef<NodeJS.Timeout>()

  // 处理搜索
  const handleSearch = React.useCallback(
    (searchQuery: string) => {
      if (onSearch) {
        onSearch(searchQuery)
      } else {
        // 默认行为：导航到搜索页面
        if (searchQuery.trim()) {
          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
      }
    },
    [onSearch, router]
  )

  // 防抖处理
  const debouncedSearch = React.useCallback(
    (searchQuery: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSearch(searchQuery)
      }, debounceMs)
    },
    [handleSearch, debounceMs]
  )

  // 输入变化处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    debouncedSearch(newQuery)
  }

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    handleSearch(query)
  }

  // 快捷键处理 (Ctrl/Cmd + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // ESC 清空搜索
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("")
        inputRef.current?.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-2xl", className)}
    >
      {/* 搜索图标 */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search className="h-5 w-5" />
      </div>

      {/* 输入框 */}
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "h-12 pl-10 pr-20 text-base",
          "focus-visible:ring-accent",
          isFocused && "shadow-md"
        )}
        aria-label="搜索"
      />

      {/* 快捷键提示 */}
      {showShortcut && !isFocused && !query && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground pointer-events-none">
          <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">
            <Command className="h-3 w-3 inline" />
          </kbd>
          <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">
            K
          </kbd>
        </div>
      )}

      {/* 清空按钮 */}
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("")
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="清空搜索"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </button>
      )}
    </form>
  )
}
