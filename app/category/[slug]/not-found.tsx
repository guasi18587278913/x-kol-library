import Link from "next/link"

export default function CategoryNotFound() {
  return (
    <main className="container mx-auto py-12">
      <div className="text-center space-y-6 py-24">
        <h2 className="text-3xl font-bold">类目未找到</h2>
        <p className="text-muted-foreground">
          该类目不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </main>
  )
}
