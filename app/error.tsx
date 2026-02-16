"use client"

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="container mx-auto py-12">
      <div className="text-center space-y-6 py-24">
        <h2 className="text-3xl font-bold">出了点问题</h2>
        <p className="text-muted-foreground">
          {error.message || "加载页面时发生错误，请稍后重试。"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
    </main>
  )
}
