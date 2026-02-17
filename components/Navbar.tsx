import Link from "next/link"
import { SearchBar } from "@/components/SearchBar"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <span className="font-bold text-lg hidden sm:block">推特阅览室</span>
        </Link>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchBar
            placeholder="搜索 KOL 或推文..."
            showShortcut={true}
            className="w-full"
          />
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/search"
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="搜索"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  )
}
