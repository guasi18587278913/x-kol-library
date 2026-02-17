export default function CategoryLoading() {
  return (
    <main>
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-10">
          <div className="h-4 w-32 skeleton rounded mb-6" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 skeleton rounded" />
            <div className="space-y-2">
              <div className="h-8 w-48 skeleton rounded" />
              <div className="h-4 w-64 skeleton rounded" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
