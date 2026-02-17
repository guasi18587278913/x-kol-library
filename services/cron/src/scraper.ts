/**
 * Tweet scraper for the cron job.
 *
 * Since the X MCP tools require a browser session (they are browser-automation
 * based, not API-based), the cron service uses an HTTP API approach:
 *
 * 1. For Railway/Render deployment: Uses the scrape-kols.ts agent script
 *    to pre-generate data files, which this service then imports.
 *
 * 2. For future X API integration: This module provides the interface
 *    for direct API-based scraping when X API keys are available.
 *
 * Current implementation reads from the data files produced by the
 * agent-driven scraping workflow.
 */

import * as fs from "fs";
import * as path from "path";
import { detectLanguage } from "./translator";

// ─── Types ────────────────────────────────────────

export interface ScrapedKol {
  twitter_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  followers: number;
  following: number;
  tweet_total: number;
  categories: string[];
  tags: string[];
  profile_url: string;
}

export interface ScrapedTweet {
  tweet_id: string;
  kol_username: string;
  content: string;
  content_zh: string;
  language: string;
  translated_at: string | null;
  media_urls: string[];
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  tweet_time: string;
  tweet_url: string;
  is_retweet: boolean;
  is_reply: boolean;
}

// ─── Data Loading ─────────────────────────────────

/**
 * Load scraped KOL data from the data directory.
 */
export function loadScrapedKols(dataDir: string): ScrapedKol[] {
  const filePath = path.join(dataDir, "kols-scraped.json");
  if (!fs.existsSync(filePath)) {
    console.warn(`  [WARN] KOL data file not found: ${filePath}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * Load scraped tweet data from the data directory.
 */
export function loadScrapedTweets(dataDir: string): ScrapedTweet[] {
  const filePath = path.join(dataDir, "tweets-scraped.json");
  if (!fs.existsSync(filePath)) {
    console.warn(`  [WARN] Tweet data file not found: ${filePath}`);
    return [];
  }
  const tweets: ScrapedTweet[] = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );

  // Ensure language field is set
  for (const tweet of tweets) {
    if (!tweet.language) {
      tweet.language = detectLanguage(tweet.content);
    }
  }

  return tweets;
}

// ─── Database Import ──────────────────────────────

const CATEGORIES = [
  { name: "AI 技术", slug: "ai-tech", description: "人工智能、大语言模型、Prompt 工程、AI Agent、AI 绘画等前沿技术领域的顶级 KOL", icon: "\u{1F916}", sort_order: 1 },
  { name: "创业出海", slug: "startup-global", description: "独立开发者、出海创业、SaaS 产品、跨境电商等全球化创业领域的先行者", icon: "\u{1F680}", sort_order: 2 },
  { name: "投资理财", slug: "investment-finance", description: "加密货币、风险投资、个人理财、宏观经济分析等投资领域的思想领袖", icon: "\u{1F4B0}", sort_order: 3 },
  { name: "商业财富", slug: "business-wealth", description: "商业战略、企业管理、创业心法、财富积累等商业智慧的分享者", icon: "\u{1F4BC}", sort_order: 4 },
  { name: "设计产品", slug: "design-product", description: "产品设计、用户体验、设计系统、产品管理等领域的资深从业者", icon: "\u{1F3A8}", sort_order: 5 },
  { name: "内容创作", slug: "content-creation", description: "写作技巧、Newsletter 运营、个人品牌、知识付费等内容创作领域的标杆人物", icon: "\u270D\uFE0F", sort_order: 6 },
  { name: "营销增长", slug: "marketing-growth", description: "SEO、社交媒体营销、增长黑客、品牌建设等营销增长领域的实战专家", icon: "\u{1F4C8}", sort_order: 7 },
];

/**
 * Import scraped data into the database.
 * Uses UPSERT to handle both initial import and incremental updates.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryFn = (sql: string, params?: unknown[]) => Promise<any[]>;

export async function importToDatabase(
  kols: ScrapedKol[],
  tweets: ScrapedTweet[],
  queryFn: QueryFn
): Promise<{
  categories: number;
  kols: number;
  tweets: number;
  errors: string[];
}> {
  const stats = { categories: 0, kols: 0, tweets: 0, errors: [] as string[] };

  // Import categories
  for (const cat of CATEGORIES) {
    try {
      await queryFn(
        `INSERT INTO categories (name, slug, description, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           icon = EXCLUDED.icon,
           sort_order = EXCLUDED.sort_order`,
        [cat.name, cat.slug, cat.description, cat.icon, cat.sort_order]
      );
      stats.categories++;
    } catch (err) {
      stats.errors.push(`Category ${cat.slug}: ${err}`);
    }
  }

  // Import KOLs
  for (const kol of kols) {
    try {
      await queryFn(
        `INSERT INTO kols (twitter_id, username, display_name, bio, avatar_url,
                           followers, following, tweet_total, categories, tags, profile_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11)
         ON CONFLICT (username) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           bio = EXCLUDED.bio,
           avatar_url = CASE WHEN EXCLUDED.avatar_url != '' THEN EXCLUDED.avatar_url ELSE kols.avatar_url END,
           followers = GREATEST(EXCLUDED.followers, kols.followers),
           following = EXCLUDED.following,
           tweet_total = EXCLUDED.tweet_total,
           categories = EXCLUDED.categories,
           tags = EXCLUDED.tags,
           profile_url = EXCLUDED.profile_url`,
        [
          kol.twitter_id,
          kol.username,
          kol.display_name,
          kol.bio,
          kol.avatar_url,
          kol.followers,
          kol.following,
          kol.tweet_total,
          JSON.stringify(kol.categories),
          JSON.stringify(kol.tags),
          kol.profile_url,
        ]
      );
      stats.kols++;
    } catch (err) {
      stats.errors.push(`KOL ${kol.username}: ${err}`);
    }
  }

  // Import tweets
  for (const tweet of tweets) {
    try {
      await queryFn(
        `INSERT INTO tweets (tweet_id, kol_username, content, content_zh, language,
                             translated_at, media_urls, likes, retweets, replies,
                             views, tweet_time, tweet_url, is_retweet, is_reply)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (tweet_id) DO UPDATE SET
           content = EXCLUDED.content,
           content_zh = CASE WHEN EXCLUDED.content_zh != '' THEN EXCLUDED.content_zh ELSE tweets.content_zh END,
           language = EXCLUDED.language,
           translated_at = CASE WHEN EXCLUDED.translated_at IS NOT NULL THEN EXCLUDED.translated_at ELSE tweets.translated_at END,
           likes = EXCLUDED.likes,
           retweets = EXCLUDED.retweets,
           replies = EXCLUDED.replies,
           views = EXCLUDED.views`,
        [
          tweet.tweet_id,
          tweet.kol_username,
          tweet.content,
          tweet.content_zh || "",
          tweet.language || "zh",
          tweet.translated_at || null,
          JSON.stringify(tweet.media_urls || []),
          tweet.likes || 0,
          tweet.retweets || 0,
          tweet.replies || 0,
          tweet.views || 0,
          tweet.tweet_time,
          tweet.tweet_url || "",
          tweet.is_retweet || false,
          tweet.is_reply || false,
        ]
      );
      stats.tweets++;
    } catch (err) {
      stats.errors.push(`Tweet ${tweet.tweet_id}: ${err}`);
    }
  }

  // Refresh category counts
  try {
    await queryFn("SELECT refresh_category_counts()");
  } catch {
    // Non-critical - the function might not exist yet
  }

  return stats;
}
