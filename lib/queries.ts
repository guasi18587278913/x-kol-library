import { query, queryOne } from "./db";
import type { Category, KOL, Tweet } from "./types";

// ========================================
// Categories
// ========================================

export async function getAllCategories(): Promise<Category[]> {
  return query<Category>(
    "SELECT * FROM categories ORDER BY sort_order ASC"
  );
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return queryOne<Category>(
    "SELECT * FROM categories WHERE slug = $1",
    [slug]
  );
}

// ========================================
// KOLs
// ========================================

export async function getKOLsByCategory(
  categorySlug: string,
  limit = 50,
  offset = 0
): Promise<KOL[]> {
  return query<KOL>(
    `SELECT * FROM kols
     WHERE categories @> $1::jsonb
     ORDER BY followers DESC
     LIMIT $2 OFFSET $3`,
    [JSON.stringify([categorySlug]), limit, offset]
  );
}

export async function getKOLByUsername(username: string): Promise<KOL | null> {
  return queryOne<KOL>(
    "SELECT * FROM kols WHERE username = $1",
    [username]
  );
}

export async function getKOLCount(categorySlug: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM kols WHERE categories @> $1::jsonb",
    [JSON.stringify([categorySlug])]
  );
  return Number(row?.count ?? 0);
}

// ========================================
// Tweets
// ========================================

export async function getTweetsByKOL(
  kolUsername: string,
  limit = 50,
  offset = 0
): Promise<Tweet[]> {
  return query<Tweet>(
    `SELECT * FROM tweets
     WHERE kol_username = $1
     ORDER BY tweet_time DESC
     LIMIT $2 OFFSET $3`,
    [kolUsername, limit, offset]
  );
}

export async function getTweetCount(kolUsername: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM tweets WHERE kol_username = $1",
    [kolUsername]
  );
  return Number(row?.count ?? 0);
}

export async function getFeaturedTweets(limit = 6): Promise<Tweet[]> {
  return query<Tweet>(
    `SELECT * FROM tweets
     WHERE tweet_time >= NOW() - INTERVAL '7 days'
       AND is_retweet = FALSE
     ORDER BY (likes + retweets) DESC
     LIMIT $1`,
    [limit]
  );
}

export async function getLatestTweets(
  limit = 20,
  offset = 0
): Promise<Tweet[]> {
  return query<Tweet>(
    `SELECT * FROM tweets
     WHERE is_retweet = FALSE
     ORDER BY tweet_time DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
}

export async function getTotalTweetCount(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM tweets"
  );
  return Number(row?.count ?? 0);
}

export async function getTotalKOLCount(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM kols"
  );
  return Number(row?.count ?? 0);
}

export async function getUntranslatedTweets(limit = 100): Promise<Tweet[]> {
  return query<Tweet>(
    `SELECT * FROM tweets
     WHERE language = 'en'
       AND (content_zh = '' OR content_zh IS NULL)
     ORDER BY tweet_time DESC
     LIMIT $1`,
    [limit]
  );
}

export async function getKOLMap(usernames: string[]): Promise<Record<string, { display_name: string; avatar_url: string }>> {
  if (usernames.length === 0) return {};
  const placeholders = usernames.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await query<KOL>(
    `SELECT username, display_name, avatar_url FROM kols WHERE username IN (${placeholders})`,
    usernames
  );
  const map: Record<string, { display_name: string; avatar_url: string }> = {};
  for (const row of rows) {
    map[row.username] = { display_name: row.display_name, avatar_url: row.avatar_url };
  }
  return map;
}

// ========================================
// KOLs for Category (simple)
// ========================================

export async function getKOLsForCategory(slug: string): Promise<KOL[]> {
  return query<KOL>(
    `SELECT * FROM kols
     WHERE categories @> $1::jsonb
     ORDER BY followers DESC`,
    [JSON.stringify([slug])]
  );
}

// ========================================
// Search
// ========================================

export async function searchKOLs(
  keyword: string,
  limit = 20
): Promise<KOL[]> {
  const pattern = `%${keyword}%`;
  return query<KOL>(
    `SELECT * FROM kols
     WHERE display_name ILIKE $1
        OR username ILIKE $1
        OR bio ILIKE $1
     ORDER BY followers DESC
     LIMIT $2`,
    [pattern, limit]
  );
}

export async function searchTweets(
  keyword: string,
  limit = 20
): Promise<Tweet[]> {
  const pattern = `%${keyword}%`;
  return query<Tweet>(
    `SELECT * FROM tweets
     WHERE content ILIKE $1
        OR content_zh ILIKE $1
     ORDER BY likes DESC
     LIMIT $2`,
    [pattern, limit]
  );
}
