/**
 * KOL Data Scraping Script (MCP-powered)
 *
 * This script is designed to be run by the Claude Code Agent, which has
 * access to the X MCP tools. It reads the KOL list, calls the MCP
 * scrape_profile tool for each KOL, and writes enriched data files.
 *
 * Usage (run via Claude Code Agent):
 *   npx tsx scripts/scrape-kols.ts
 *
 * The script can also be imported and used programmatically by the
 * cron job service.
 */

import * as fs from "fs";
import * as path from "path";
import {
  type KolListEntry,
  type CleanedKol,
  type CleanedTweet,
  categoriesToSlugs,
  extractTags,
  detectLanguage,
  safeParseInt,
} from "./utils/data-cleaner";

// ============================================
// Paths
// ============================================

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const KOL_LIST_PATH = path.join(DATA_DIR, "kols-list.json");
const OUTPUT_KOLS_PATH = path.join(DATA_DIR, "kols-scraped.json");
const OUTPUT_TWEETS_PATH = path.join(DATA_DIR, "tweets-scraped.json");
const SCRAPE_LOG_PATH = path.join(DATA_DIR, "scrape-log.json");

// ============================================
// Known follower estimates (MCP returns 0)
// ============================================

const FOLLOWER_ESTIMATES: Record<string, number> = {
  elonmusk: 200_000_000,
  sama: 3_500_000,
  naval: 2_000_000,
  karpathy: 1_000_000,
  AndrewYNg: 900_000,
  waitbutwhy: 700_000,
  levelsio: 500_000,
  joulee: 300_000,
  EMostaque: 300_000,
  hwchase17: 200_000,
  skirano: 200_000,
  nickfloats: 150_000,
  dotey: 100_000,
  kiwicopple: 100_000,
  arvidkahl: 100_000,
  jerryjliu0: 100_000,
  op7418: 80_000,
  marclouvier: 80_000,
  _philschmid: 80_000,
  alexalbert__: 80_000,
  gefei55: 60_000,
  AmandaAskell: 60_000,
  xiaohuggg: 50_000,
  gaborcselle: 50_000,
  vista8: 40_000,
  tinyfool: 40_000,
  easychen: 35_000,
  xicilion: 30_000,
};

function estimateFollowers(username: string, priority: string): number {
  if (FOLLOWER_ESTIMATES[username]) return FOLLOWER_ESTIMATES[username];
  switch (priority) {
    case "high":
      return 50_000;
    case "medium":
      return 15_000;
    case "low":
      return 5_000;
    default:
      return 10_000;
  }
}

function generateTwitterId(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) & 0x7fffffff;
  }
  return String(1_000_000_000 + (hash % 9_000_000_000));
}

// ============================================
// Types for MCP scrape_profile response
// ============================================

interface McpProfileResponse {
  username: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number | null;
  verified: boolean;
  latestPosts: McpPost[];
}

interface McpPost {
  content: string;
  likes: number;
  retweets: number;
}

// ============================================
// Core processing functions
// ============================================

/**
 * Process an MCP scrape_profile response into cleaned KOL + tweet data.
 * This is the main function used by both the agent workflow and the cron job.
 */
export function processMcpProfile(
  mcpData: McpProfileResponse,
  entry: KolListEntry
): { kol: CleanedKol; tweets: CleanedTweet[] } {
  const followers =
    mcpData.followers > 0
      ? mcpData.followers
      : estimateFollowers(entry.username, entry.priority);

  const kol: CleanedKol = {
    twitter_id: generateTwitterId(entry.username),
    username: entry.username,
    display_name: mcpData.displayName || entry.displayName,
    bio: mcpData.bio || entry.notes,
    avatar_url: "", // MCP tool doesn't return avatar URLs
    followers,
    following: mcpData.following || 0,
    tweet_total: mcpData.posts || 0,
    categories: categoriesToSlugs(entry.categories),
    tags: extractTags(entry.notes),
    profile_url: `https://x.com/${entry.username}`,
  };

  const tweets: CleanedTweet[] = [];
  if (mcpData.latestPosts) {
    for (let i = 0; i < mcpData.latestPosts.length; i++) {
      const post = mcpData.latestPosts[i];
      if (!post.content || post.content.length < 3) continue;

      const language = detectLanguage(post.content);
      tweets.push({
        tweet_id: `${entry.username}_${Date.now()}_${i}`,
        kol_username: entry.username,
        content: post.content,
        content_zh: "",
        language,
        translated_at: null,
        media_urls: [],
        likes: safeParseInt(post.likes),
        retweets: safeParseInt(post.retweets),
        replies: 0,
        views: 0,
        tweet_time: new Date().toISOString(),
        tweet_url: `https://x.com/${entry.username}`,
        is_retweet: post.content.startsWith("RT @"),
        is_reply: false,
      });
    }
  }

  return { kol, tweets };
}

/**
 * Create baseline KOL data from the KOL list (no scraping needed).
 * Used as fallback when MCP tools are unavailable.
 */
export function createBaselineKol(entry: KolListEntry): CleanedKol {
  return {
    twitter_id: generateTwitterId(entry.username),
    username: entry.username,
    display_name: entry.displayName,
    bio: entry.notes,
    avatar_url: "",
    followers: estimateFollowers(entry.username, entry.priority),
    following: 0,
    tweet_total: 0,
    categories: categoriesToSlugs(entry.categories),
    tags: extractTags(entry.notes),
    profile_url: `https://x.com/${entry.username}`,
  };
}

// ============================================
// File I/O helpers
// ============================================

export function loadKolList(): KolListEntry[] {
  return JSON.parse(fs.readFileSync(KOL_LIST_PATH, "utf-8"));
}

export function loadExistingKols(): CleanedKol[] {
  if (!fs.existsSync(OUTPUT_KOLS_PATH)) return [];
  return JSON.parse(fs.readFileSync(OUTPUT_KOLS_PATH, "utf-8"));
}

export function loadExistingTweets(): CleanedTweet[] {
  if (!fs.existsSync(OUTPUT_TWEETS_PATH)) return [];
  return JSON.parse(fs.readFileSync(OUTPUT_TWEETS_PATH, "utf-8"));
}

export function saveKols(kols: CleanedKol[]): void {
  fs.writeFileSync(OUTPUT_KOLS_PATH, JSON.stringify(kols, null, 2));
}

export function saveTweets(tweets: CleanedTweet[]): void {
  fs.writeFileSync(OUTPUT_TWEETS_PATH, JSON.stringify(tweets, null, 2));
}

export function saveScrapeLog(log: ScrapeLog): void {
  fs.writeFileSync(SCRAPE_LOG_PATH, JSON.stringify(log, null, 2));
}

// ============================================
// Scrape log type
// ============================================

export interface ScrapeLog {
  startedAt: string;
  completedAt: string;
  totalKols: number;
  scrapedKols: number;
  totalTweets: number;
  errors: Array<{ username: string; error: string }>;
}

// ============================================
// Main batch processing (for agent-driven workflow)
// ============================================

/**
 * Process a batch of MCP results and merge with existing data.
 * Called by the agent after scraping profiles via MCP tools.
 */
export function mergeScrapeResults(
  results: Array<{ kol: CleanedKol; tweets: CleanedTweet[] }>,
  existingKols: CleanedKol[],
  existingTweets: CleanedTweet[]
): { kols: CleanedKol[]; tweets: CleanedTweet[] } {
  const kolMap = new Map<string, CleanedKol>();

  // Load existing KOLs
  for (const kol of existingKols) {
    kolMap.set(kol.username, kol);
  }

  // Merge new results (overwrite existing)
  for (const result of results) {
    kolMap.set(result.kol.username, result.kol);
  }

  // Deduplicate tweets by content hash
  const tweetMap = new Map<string, CleanedTweet>();
  for (const tweet of existingTweets) {
    tweetMap.set(tweet.tweet_id, tweet);
  }
  for (const result of results) {
    for (const tweet of result.tweets) {
      // Use content-based dedup since tweet_ids are generated
      const contentKey = `${tweet.kol_username}:${tweet.content.slice(0, 100)}`;
      tweetMap.set(contentKey, tweet);
    }
  }

  return {
    kols: Array.from(kolMap.values()),
    tweets: Array.from(tweetMap.values()),
  };
}

// Export paths for external use
export {
  OUTPUT_KOLS_PATH,
  OUTPUT_TWEETS_PATH,
  SCRAPE_LOG_PATH,
  KOL_LIST_PATH,
};
