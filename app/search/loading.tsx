export default function SearchLoading() {
  return (
    <main className="container mx-auto py-12 space-y-10">
      <section className="space-y-6">
        <div className="h-9 w-24 skeleton rounded" />
        <div className="h-12 w-full max-w-2xl skeleton rounded-lg" />
      </section>
    </main>
  )
}
