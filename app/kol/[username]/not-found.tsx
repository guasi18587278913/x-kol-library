import Link from "next/link"

export default function KOLNotFound() {
  return (
    <main className="container mx-auto px-6 lg:px-8">
      <div className="text-center space-y-4 py-24">
        <h2 className="text-2xl font-bold">KOL 未找到</h2>
        <p className="text-muted-foreground">该 KOL 不存在或尚未收录。</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </main>
  )
}
