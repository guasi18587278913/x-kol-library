import type { Metadata } from "next"
import { Navbar } from "@/components/Navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "推特大佬电子阅览室",
    template: "%s | 推特大佬电子阅览室",
  },
  description: "按领域分类，一站式浏览 Twitter 顶级 KOL 的历史推文。涵盖 AI 技术、创业出海、投资理财、商业财富、设计产品、内容创作、营销增长 7 大领域，164 位顶级 KOL。",
  keywords: ["Twitter", "X", "KOL", "大佬", "推文", "AI", "创业", "投资", "商业", "设计", "内容创作", "营销"],
  authors: [{ name: "推特大佬电子阅览室" }],
  creator: "推特大佬电子阅览室",
  publisher: "推特大佬电子阅览室",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://x-kol.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    title: "推特大佬电子阅览室",
    description: "按领域分类，一站式浏览 Twitter 顶级 KOL 的历史推文。涵盖 AI 技术、创业出海、投资理财、商业财富、设计产品、内容创作、营销增长 7 大领域，164 位顶级 KOL。",
    siteName: "推特大佬电子阅览室",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "推特大佬电子阅览室 - 一站式浏览 Twitter 顶级 KOL",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "推特大佬电子阅览室",
    description: "按领域分类，一站式浏览 Twitter 顶级 KOL 的历史推文。涵盖 AI 技术、创业出海、投资理财、商业财富、设计产品、内容创作、营销增长 7 大领域。",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
