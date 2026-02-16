/**
 * SearchBar 组件使用示例
 *
 * 这个文件展示了如何使用 SearchBar 组件
 */

import { SearchBar } from "./SearchBar"

// 示例 1: 基础搜索框
export function BasicSearchExample() {
  return <SearchBar />
}

// 示例 2: 自定义占位符
export function CustomPlaceholderExample() {
  return <SearchBar placeholder="搜索感兴趣的内容..." />
}

// 示例 3: 自定义搜索处理
export function CustomSearchHandlerExample() {
  const handleSearch = (query: string) => {
    console.log("搜索:", query)
    // 自定义搜索逻辑
    // 例如：调用 API，更新状态等
  }

  return <SearchBar onSearch={handleSearch} />
}

// 示例 4: 调整防抖时间
export function CustomDebounceExample() {
  return (
    <SearchBar
      debounceMs={500}
      placeholder="输入后 500ms 触发搜索..."
    />
  )
}

// 示例 5: 隐藏快捷键提示
export function NoShortcutExample() {
  return <SearchBar showShortcut={false} />
}

// 示例 6: 首页搜索（Hero Section）
export function HeroSearchExample() {
  return (
    <section className="container mx-auto px-8 py-16 text-center">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">推特大佬电子阅览室</h1>
          <p className="text-lg text-muted-foreground">
            精选 150+ 位推特大佬，7 大类目，实时更新精彩观点
          </p>
        </div>

        <SearchBar className="mx-auto" />

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>快捷键：</span>
          <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">
            ⌘ K
          </kbd>
          <span>或</span>
          <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">
            Ctrl K
          </kbd>
        </div>
      </div>
    </section>
  )
}

// 示例 7: 页面头部搜索
export function HeaderSearchExample() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="text-xl font-bold whitespace-nowrap">
          推特阅览室
        </a>

        {/* 搜索框 */}
        <SearchBar className="max-w-md" showShortcut={false} />

        {/* 导航 */}
        <nav className="flex items-center gap-4">
          <a
            href="/categories"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            类目
          </a>
          <a
            href="/kols"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            KOL
          </a>
        </nav>
      </div>
    </header>
  )
}

// 示例 8: 搜索页面
export function SearchPageExample() {
  const handleSearch = (query: string) => {
    console.log("执行搜索:", query)
    // 调用搜索 API
    // 更新搜索结果状态
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="space-y-8">
        {/* 搜索框区域 */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">搜索</h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* 搜索结果 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">找到 42 个结果</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">排序：</span>
              <select className="px-3 py-1 border border-border rounded-md text-sm">
                <option>相关度</option>
                <option>最新</option>
                <option>最热</option>
              </select>
            </div>
          </div>

          {/* 搜索结果列表 */}
          <div className="grid gap-4">
            {/* 结果卡片 */}
          </div>
        </div>
      </div>
    </div>
  )
}

// 示例 9: 带搜索建议的搜索框（未来扩展）
export function SearchWithSuggestionsExample() {
  const [suggestions, setSuggestions] = React.useState<string[]>([])

  const handleSearch = (query: string) => {
    // 模拟搜索建议
    if (query.length >= 2) {
      setSuggestions([
        "Sam Altman",
        "AI 技术",
        "创业出海",
      ])
    } else {
      setSuggestions([])
    }
  }

  return (
    <div className="relative">
      <SearchBar onSearch={handleSearch} debounceMs={200} />

      {/* 搜索建议下拉框 */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
              onClick={() => {
                console.log("选择建议:", suggestion)
                setSuggestions([])
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 辅助函数（示例 9 需要）
import * as React from "react"
