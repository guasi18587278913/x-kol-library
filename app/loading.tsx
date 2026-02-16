export default function HomeLoading() {
  return (
    <main className="container mx-auto py-12 space-y-16">
      {/* Hero skeleton */}
      <section className="text-center space-y-6 py-12">
        <div className="h-12 w-96 skeleton rounded-lg mx-auto" />
        <div className="h-6 w-80 skeleton rounded mx-auto" />
        <div className="h-12 w-full max-w-2xl skeleton rounded-lg mx-auto" />
      </section>

      {/* Categories grid skeleton */}
      <section className="space-y-8">
        <div className="h-9 w-40 skeleton rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-40 skeleton rounded-lg" />
          ))}
        </div>
      </section>
    </main>
  )
}
