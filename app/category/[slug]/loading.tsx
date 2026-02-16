export default function CategoryLoading() {
  return (
    <main className="container mx-auto py-12 space-y-10">
      <div className="h-5 w-32 skeleton rounded" />

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 skeleton rounded" />
          <div className="h-10 w-48 skeleton rounded" />
        </div>
        <div className="h-6 w-96 skeleton rounded" />
        <div className="h-4 w-24 skeleton rounded" />
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-56 skeleton rounded-lg" />
        ))}
      </div>
    </main>
  )
}
