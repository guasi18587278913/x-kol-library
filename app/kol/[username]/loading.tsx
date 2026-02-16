export default function KOLLoading() {
  return (
    <main className="container mx-auto py-12 space-y-10">
      <div className="h-5 w-48 skeleton rounded" />

      <section className="flex items-start gap-6">
        <div className="h-20 w-20 skeleton rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-9 w-64 skeleton rounded" />
          <div className="h-5 w-32 skeleton rounded" />
          <div className="h-12 w-full max-w-3xl skeleton rounded" />
          <div className="flex gap-4">
            <div className="h-5 w-24 skeleton rounded" />
            <div className="h-5 w-32 skeleton rounded" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="h-8 w-40 skeleton rounded" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-lg" />
          ))}
        </div>
      </section>
    </main>
  )
}
