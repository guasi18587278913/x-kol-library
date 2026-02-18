import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load env
config({ path: path.resolve(__dirname, "../.env.local") });

const BEARER_TOKEN = process.env.X_BEARER_TOKEN;
if (!BEARER_TOKEN) {
  console.error("X_BEARER_TOKEN not found in .env.local");
  process.exit(1);
}

// Paths
const DATA_DIR = path.resolve(__dirname, "../data");
const KOL_LIST_PATH = path.join(DATA_DIR, "kols-list.json");
const EXISTING_TWEETS_PATH = path.join(DATA_DIR, "tweets-api.json");
const OUTPUT_PATH = path.join(DATA_DIR, "tweets-search.json");
const PROGRESS_PATH = path.join(DATA_DIR, ".fetch-search-progress.json");

// Types
interface KOL {
  username: string;
  displayName: string;
  categories: string[];
  priority: string;
  notes: string;
}

interface Tweet {
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

interface ProgressState {
  completedUsernames: string[];
  tweets: Tweet[];
}

// Helper: sleep
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: detect language (simple heuristic)
function detectLanguage(text: string): string {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g);
  if (chineseChars && chineseChars.length > text.length * 0.1) {
    return "zh";
  }
  return "en";
}

// Helper: clean tweet text (remove t.co links)
function cleanText(text: string): string {
  return text.replace(/https?:\/\/t\.co\/\w+/g, "").trim();
}

// Helper: fetch with retry
async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, { headers });

    if (res.status === 429) {
      // Rate limited - check reset header
      const resetHeader = res.headers.get("x-rate-limit-reset");
      let waitMs = 60_000; // default 60s
      if (resetHeader) {
        const resetTime = parseInt(resetHeader) * 1000;
        waitMs = Math.max(resetTime - Date.now() + 1000, 5000);
      }
      console.log(
        `  Rate limited. Waiting ${Math.round(waitMs / 1000)}s...`
      );
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      if (attempt < maxRetries - 1) {
        console.log(
          `  HTTP ${res.status}, retrying in 5s... (${body.slice(0, 200)})`
        );
        await sleep(5000);
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 500)}`);
    }

    return res.json();
  }
  throw new Error("Max retries exceeded");
}

// Fetch tweets for a single KOL using search/recent
async function fetchKOLTweets(
  username: string,
  existingIds: Set<string>
): Promise<Tweet[]> {
  const query = `from:${username} -is:retweet -is:reply`;
  const params = new URLSearchParams({
    query,
    max_results: "100",
    "tweet.fields": "created_at,public_metrics,entities,attachments",
    "media.fields": "url,preview_image_url,type",
    expansions: "attachments.media_keys",
  });

  const url = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`;

  const data = await fetchWithRetry(url, {
    Authorization: `Bearer ${BEARER_TOKEN}`,
  });

  if (!data.data || data.data.length === 0) {
    return [];
  }

  // Build media map from includes
  const mediaMap = new Map<string, string[]>();
  if (data.includes?.media) {
    for (const m of data.includes.media) {
      // We'll map by media_key
      const mediaUrl = m.url || m.preview_image_url || "";
      if (mediaUrl) {
        // Store individually, we'll look up per tweet below
      }
    }
  }

  // Build a proper media lookup: media_key -> url
  const mediaKeyToUrl = new Map<string, string>();
  if (data.includes?.media) {
    for (const m of data.includes.media) {
      const mediaUrl = m.url || m.preview_image_url || "";
      if (mediaUrl) {
        mediaKeyToUrl.set(m.media_key, mediaUrl);
      }
    }
  }

  const tweets: Tweet[] = [];

  for (const t of data.data) {
    const tweetId = t.id;

    // Skip duplicates
    if (existingIds.has(tweetId)) continue;

    const metrics = t.public_metrics || {};
    const likes = metrics.like_count || 0;
    const retweets = metrics.retweet_count || 0;
    const rawText = t.text || "";

    // Local filter: likes >= 30 OR retweets >= 10, AND text length >= 100
    const cleanedText = cleanText(rawText);
    if (cleanedText.length < 100) continue;
    if (likes < 30 && retweets < 10) continue;

    // Get media URLs
    const mediaUrls: string[] = [];
    if (t.attachments?.media_keys) {
      for (const key of t.attachments.media_keys) {
        const mUrl = mediaKeyToUrl.get(key);
        if (mUrl) mediaUrls.push(mUrl);
      }
    }

    tweets.push({
      tweet_id: tweetId,
      kol_username: username,
      content: cleanedText,
      content_zh: "",
      language: detectLanguage(cleanedText),
      translated_at: null,
      media_urls: mediaUrls,
      likes,
      retweets,
      replies: metrics.reply_count || 0,
      views: metrics.impression_count || 0,
      tweet_time: t.created_at || "",
      tweet_url: `https://x.com/${username}/status/${tweetId}`,
      is_retweet: false,
      is_reply: false,
    });
  }

  return tweets;
}

// Main
async function main() {
  // Load KOL list
  const kols: KOL[] = JSON.parse(fs.readFileSync(KOL_LIST_PATH, "utf-8"));
  console.log(`Loaded ${kols.length} KOLs`);

  // Load existing tweet IDs for dedup
  let existingIds = new Set<string>();
  if (fs.existsSync(EXISTING_TWEETS_PATH)) {
    const existing: Tweet[] = JSON.parse(
      fs.readFileSync(EXISTING_TWEETS_PATH, "utf-8")
    );
    for (const t of existing) {
      existingIds.add(t.tweet_id);
    }
    console.log(`Loaded ${existingIds.size} existing tweet IDs for dedup`);
  }

  // Load progress (resume support)
  let progress: ProgressState = { completedUsernames: [], tweets: [] };
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
      console.log(
        `Resuming: ${progress.completedUsernames.length} KOLs already done, ${progress.tweets.length} tweets collected`
      );
      // Also add progress tweet IDs to dedup set
      for (const t of progress.tweets) {
        existingIds.add(t.tweet_id);
      }
    } catch {
      console.log("Invalid progress file, starting fresh");
      progress = { completedUsernames: [], tweets: [] };
    }
  }

  const completedSet = new Set(progress.completedUsernames);
  const allTweets = progress.tweets;
  let kolsWithResults: string[] = [];
  let kolsWithoutResults: string[] = [];

  for (let i = 0; i < kols.length; i++) {
    const kol = kols[i];
    if (completedSet.has(kol.username)) {
      // Check if they had results from progress
      if (allTweets.some((t) => t.kol_username === kol.username)) {
        kolsWithResults.push(kol.username);
      } else {
        kolsWithoutResults.push(kol.username);
      }
      continue;
    }

    console.log(
      `[${i + 1}/${kols.length}] Fetching @${kol.username} (${kol.displayName})...`
    );

    try {
      const tweets = await fetchKOLTweets(kol.username, existingIds);
      if (tweets.length > 0) {
        allTweets.push(...tweets);
        kolsWithResults.push(kol.username);
        console.log(`  => ${tweets.length} quality tweets`);
        // Add new IDs to dedup set
        for (const t of tweets) {
          existingIds.add(t.tweet_id);
        }
      } else {
        kolsWithoutResults.push(kol.username);
        console.log(`  => 0 quality tweets`);
      }
    } catch (err: any) {
      console.error(`  ERROR for @${kol.username}: ${err.message}`);
      kolsWithoutResults.push(kol.username);
    }

    // Mark as completed
    completedSet.add(kol.username);
    progress.completedUsernames = Array.from(completedSet);
    progress.tweets = allTweets;

    // Save progress every 5 KOLs
    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
      console.log(`  [Progress saved: ${allTweets.length} tweets]`);
    }

    // Sleep between requests
    await sleep(1000);
  }

  // Save final results
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTweets, null, 2));
  console.log(`\n========== RESULTS ==========`);
  console.log(`Total tweets: ${allTweets.length}`);
  console.log(`KOLs with results (${kolsWithResults.length}): ${kolsWithResults.join(", ")}`);
  console.log(`KOLs without results (${kolsWithoutResults.length}): ${kolsWithoutResults.join(", ")}`);
  console.log(`Saved to: ${OUTPUT_PATH}`);

  // Clean up progress file
  if (fs.existsSync(PROGRESS_PATH)) {
    fs.unlinkSync(PROGRESS_PATH);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
