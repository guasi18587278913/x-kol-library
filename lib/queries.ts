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
     ORDER BY likes DESC
     LIMIT $2`,
    [pattern, limit]
  );
}
