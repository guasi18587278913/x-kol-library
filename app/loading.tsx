export default function HomeLoading() {
  return (
    <main>
      {/* Hero skeleton */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <div className="h-12 w-80 skeleton rounded-lg" />
            <div className="h-6 w-full max-w-2xl skeleton rounded" />
            <div className="flex gap-8 mt-8">
              <div className="h-10 w-24 skeleton rounded-lg" />
              <div className="h-10 w-24 skeleton rounded-lg" />
              <div className="h-10 w-24 skeleton rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Tweets skeleton */}
        <section>
          <div className="h-8 w-32 skeleton rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 skeleton rounded-xl" />
            ))}
          </div>
        </section>

        {/* Categories skeleton */}
        <section>
          <div className="h-8 w-32 skeleton rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-28 skeleton rounded-xl" />
            ))}
          </div>
        </section>

        {/* Latest Tweets skeleton */}
        <section>
          <div className="h-8 w-32 skeleton rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 skeleton rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
