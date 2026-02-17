export default function KOLLoading() {
  return (
    <main>
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-10">
          <div className="h-4 w-48 skeleton rounded mb-6" />
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 skeleton rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-56 skeleton rounded" />
              <div className="h-4 w-32 skeleton rounded" />
              <div className="h-12 w-full max-w-3xl skeleton rounded" />
              <div className="flex gap-4">
                <div className="h-5 w-20 skeleton rounded" />
                <div className="h-5 w-28 skeleton rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="h-8 w-36 skeleton rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
