import { Suspense } from "react"
import type { Metadata } from "next"
import { SearchContent } from "./SearchContent"

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 164 位顶级 KOL 及精选推文。支持按类目筛选，快速找到你感兴趣的内容。",
  openGraph: {
    title: "搜索 - 推特大佬电子阅览室",
    description: "搜索 164 位顶级 KOL 及精选推文。支持按类目筛选，快速找到你感兴趣的内容。",
    url: "/search",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "搜索 - 推特大佬电子阅览室",
    description: "搜索 164 位顶级 KOL 及精选推文",
  },
}

function SearchFallback() {
  return (
    <>
      <section className="space-y-6">
        <div className="h-9 w-24 skeleton rounded" />
        <div className="h-12 w-full max-w-2xl skeleton rounded-lg" />
      </section>
    </>
  )
}

export default function SearchPage() {
  return (
    <main className="container mx-auto py-12 space-y-10">
      <Suspense fallback={<SearchFallback />}>
        <SearchContent />
      </Suspense>
    </main>
  )
}
