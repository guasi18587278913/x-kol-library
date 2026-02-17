export default function SearchLoading() {
  return (
    <main>
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-8 py-8 space-y-4">
          <div className="h-8 w-20 skeleton rounded" />
          <div className="h-12 w-full max-w-2xl skeleton rounded-lg" />
        </div>
      </section>
    </main>
  )
}
