/**
 * 用 X API v2 抓取高质量推文
 *
 * 用法：
 *   X_BEARER_TOKEN=xxx npx tsx scripts/fetch-tweets-api.ts
 *   X_BEARER_TOKEN=xxx npx tsx scripts/fetch-tweets-api.ts --priority=high
 *   X_BEARER_TOKEN=xxx npx tsx scripts/fetch-tweets-api.ts --username=dotey
 *   X_BEARER_TOKEN=xxx npx tsx scripts/fetch-tweets-api.ts --dry-run
 *
 * 质量筛选标准：
 *   - 正文长度 >= 150 字符（过滤碎碎念）
 *   - 点赞 >= 30 OR 转发 >= 10（过滤低价值内容）
 *   - 不是转推、不是回复别人
 *   - 最近 12 个月内
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// 加载环境变量（.env.local 优先）
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ============================================
// 配置
// ============================================

const BEARER_TOKEN = process.env.X_BEARER_TOKEN;
if (!BEARER_TOKEN) {
  console.error("❌ 缺少 X_BEARER_TOKEN 环境变量");
  process.exit(1);
}

const BASE_URL = "https://api.twitter.com/2";
const DATA_DIR = path.resolve(__dirname, "../data");
const KOL_LIST_PATH = path.join(DATA_DIR, "kols-list.json");
const OUTPUT_PATH = path.join(DATA_DIR, "tweets-api.json");
const PROGRESS_PATH = path.join(DATA_DIR, "api-fetch-progress.json");

// 质量筛选阈值
const QUALITY = {
  MIN_TEXT_LENGTH: 150,    // 最短正文长度（字符数）
  MIN_LIKES: 30,           // 最低点赞数
  MIN_RETWEETS: 10,        // 最低转推数（OR 关系）
  LOOKBACK_DAYS: 365,      // 抓取最近多少天的推文
  MAX_PER_KOL: 30,         // 每个 KOL 最多抓取多少条候选
};

// API 速率限制保护
const RATE_LIMIT = {
  DELAY_BETWEEN_USERS_MS: 3000,   // 每个用户之间等待（毫秒）
  DELAY_ON_ERROR_MS: 60000,       // 遇到限流时等待（毫秒）
};

// ============================================
// 类型定义
// ============================================

interface KolListEntry {
  username: string;
  displayName: string;
  categories: string[];
  priority: string;
  notes: string;
}

interface ApiTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  referenced_tweets?: Array<{ type: string; id: string }>;
  attachments?: { media_keys?: string[] };
  entities?: {
    urls?: Array<{ url: string; expanded_url: string; display_url: string }>;
    media?: Array<{ media_key: string; type: string; url?: string }>;
  };
}

interface ApiMedia {
  media_key: string;
  type: string;
  url?: string;
  preview_image_url?: string;
}

interface OutputTweet {
  tweet_id: string;
  kol_username: string;
  content: string;
  content_zh: string;
  language: string;
  translated_at: null;
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

interface FetchProgress {
  completed: string[];
  failed: string[];
  startedAt: string;
  updatedAt: string;
}

// ============================================
// API 调用
// ============================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGet(url: string): Promise<any> {
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${decodeURIComponent(BEARER_TOKEN!)}`,
      "Content-Type": "application/json",
    },
  });

  if (resp.status === 429) {
    const resetTime = resp.headers.get("x-rate-limit-reset");
    const waitMs = resetTime
      ? Math.max(0, parseInt(resetTime) * 1000 - Date.now()) + 5000
      : RATE_LIMIT.DELAY_ON_ERROR_MS;
    console.log(`  ⏳ 触发速率限制，等待 ${Math.round(waitMs / 1000)} 秒...`);
    await sleep(waitMs);
    return apiGet(url); // 重试
  }

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }

  return resp.json();
}

async function getUserId(username: string): Promise<{ id: string; name: string } | null> {
  try {
    const data = await apiGet(`${BASE_URL}/users/by/username/${username}?user.fields=public_metrics`);
    return data.data ? { id: data.data.id, name: data.data.name } : null;
  } catch (err) {
    console.log(`  ⚠️  获取用户 ID 失败: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function fetchUserTweets(userId: string): Promise<{ tweets: ApiTweet[]; media: ApiMedia[] }> {
  const startTime = new Date(Date.now() - QUALITY.LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    max_results: QUALITY.MAX_PER_KOL.toString(),
    "tweet.fields": "created_at,public_metrics,referenced_tweets,attachments,entities",
    "media.fields": "url,preview_image_url,type",
    expansions: "attachments.media_keys",
    exclude: "retweets,replies",
    start_time: startTime,
  });

  try {
    const data = await apiGet(`${BASE_URL}/users/${userId}/tweets?${params}`);
    const tweets: ApiTweet[] = data.data || [];
    const media: ApiMedia[] = data.includes?.media || [];
    return { tweets, media };
  } catch (err) {
    console.log(`  ⚠️  获取推文失败: ${err instanceof Error ? err.message : err}`);
    return { tweets: [], media: [] };
  }
}

// ============================================
// 质量筛选
// ============================================

function detectLanguage(text: string): string {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = text.replace(/\s+/g, "").length;
  return chineseChars / totalChars > 0.2 ? "zh" : "en";
}

function cleanTweetText(text: string): string {
  // 移除 t.co 短链接（结尾的媒体链接）
  return text.replace(/https:\/\/t\.co\/\w+/g, "").trim();
}

function isQualityTweet(tweet: ApiTweet): boolean {
  const text = cleanTweetText(tweet.text);
  const m = tweet.public_metrics;

  // 长度过滤
  if (text.length < QUALITY.MIN_TEXT_LENGTH) return false;

  // 互动量过滤（点赞 OR 转推达标）
  if (m.like_count < QUALITY.MIN_LIKES && m.retweet_count < QUALITY.MIN_RETWEETS) return false;

  // 不是转推
  if (tweet.referenced_tweets?.some((r) => r.type === "retweeted")) return false;

  return true;
}

function convertTweet(tweet: ApiTweet, username: string, mediaMap: Map<string, string>): OutputTweet {
  const cleanText = cleanTweetText(tweet.text);
  const mediaUrls: string[] = [];

  if (tweet.attachments?.media_keys) {
    for (const key of tweet.attachments.media_keys) {
      const url = mediaMap.get(key);
      if (url) mediaUrls.push(url);
    }
  }

  return {
    tweet_id: tweet.id,
    kol_username: username,
    content: cleanText,
    content_zh: "",
    language: detectLanguage(cleanText),
    translated_at: null,
    media_urls: mediaUrls,
    likes: tweet.public_metrics.like_count,
    retweets: tweet.public_metrics.retweet_count,
    replies: tweet.public_metrics.reply_count,
    views: tweet.public_metrics.impression_count || 0,
    tweet_time: tweet.created_at,
    tweet_url: `https://x.com/${username}/status/${tweet.id}`,
    is_retweet: false,
    is_reply: false,
  };
}

// ============================================
// 主流程
// ============================================

async function main() {
  console.log("================================================");
  console.log("  推特大佬电子阅览室 - X API 高质量推文抓取");
  console.log("================================================\n");

  const args = process.argv.slice(2);
  const priorityFilter = args.find((a) => a.startsWith("--priority="))?.split("=")[1];
  const usernameFilter = args.find((a) => a.startsWith("--username="))?.split("=")[1];
  const dryRun = args.includes("--dry-run");

  if (dryRun) console.log("[ DRY RUN 模式 - 不保存文件 ]\n");

  // 加载 KOL 列表
  const kolList: KolListEntry[] = JSON.parse(fs.readFileSync(KOL_LIST_PATH, "utf-8"));

  // 过滤
  let targets = kolList;
  if (usernameFilter) {
    targets = kolList.filter((k) => k.username.toLowerCase() === usernameFilter.toLowerCase());
  } else if (priorityFilter) {
    targets = kolList.filter((k) => k.priority === priorityFilter);
  }

  console.log(`目标 KOL: ${targets.length} 个${priorityFilter ? ` (${priorityFilter} 优先级)` : ""}${usernameFilter ? ` (@${usernameFilter})` : ""}`);
  console.log(`质量阈值: 长度 ≥ ${QUALITY.MIN_TEXT_LENGTH} 字符, 点赞 ≥ ${QUALITY.MIN_LIKES} OR 转推 ≥ ${QUALITY.MIN_RETWEETS}`);
  console.log(`抓取范围: 最近 ${QUALITY.LOOKBACK_DAYS} 天, 每人最多 ${QUALITY.MAX_PER_KOL} 条候选\n`);

  // 加载进度
  let progress: FetchProgress = { completed: [], failed: [], startedAt: new Date().toISOString(), updatedAt: "" };
  if (fs.existsSync(PROGRESS_PATH)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
    console.log(`恢复进度: 已完成 ${progress.completed.length} 个, 跳过失败 ${progress.failed.length} 个\n`);
  }

  // 加载已有结果
  let allTweets: OutputTweet[] = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    allTweets = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    console.log(`已有推文: ${allTweets.length} 条\n`);
  }

  const completedSet = new Set(progress.completed);
  const pending = targets.filter((k) => !completedSet.has(k.username));

  if (pending.length === 0) {
    console.log("✅ 所有目标 KOL 已处理完毕");
    return;
  }

  console.log(`待处理: ${pending.length} 个 KOL\n`);

  let totalFetched = 0;
  let totalKept = 0;

  for (let i = 0; i < pending.length; i++) {
    const kol = pending[i];
    console.log(`[${i + 1}/${pending.length}] @${kol.username} (${kol.priority})`);

    // 1. 获取用户 ID
    const user = await getUserId(kol.username);
    if (!user) {
      console.log(`  ❌ 找不到用户，跳过`);
      progress.failed.push(kol.username);
      continue;
    }

    // 2. 获取推文
    const { tweets, media } = await fetchUserTweets(user.id);
    totalFetched += tweets.length;

    // 3. 构建 media URL 映射
    const mediaMap = new Map<string, string>();
    for (const m of media) {
      const url = m.url || m.preview_image_url;
      if (url) mediaMap.set(m.media_key, url);
    }

    // 4. 质量筛选
    const quality = tweets.filter(isQualityTweet);
    totalKept += quality.length;

    console.log(`  获取: ${tweets.length} 条 → 通过质量筛选: ${quality.length} 条`);
    if (quality.length > 0) {
      const topLikes = Math.max(...quality.map((t) => t.public_metrics.like_count));
      console.log(`  最高点赞: ${topLikes}`);
    }

    // 5. 转换格式
    const converted = quality.map((t) => convertTweet(t, kol.username, mediaMap));

    // 6. 去重合并（按 tweet_id）
    const existingIds = new Set(allTweets.map((t) => t.tweet_id));
    const newTweets = converted.filter((t) => !existingIds.has(t.tweet_id));
    allTweets.push(...newTweets);

    // 7. 保存进度
    progress.completed.push(kol.username);
    progress.updatedAt = new Date().toISOString();

    if (!dryRun) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTweets, null, 2));
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    }

    // 8. 速率限制等待
    if (i < pending.length - 1) {
      await sleep(RATE_LIMIT.DELAY_BETWEEN_USERS_MS);
    }
  }

  // 汇总
  console.log("\n================================================");
  console.log("  抓取完成 - 汇总");
  console.log("================================================");
  console.log(`  处理 KOL: ${pending.length} 个`);
  console.log(`  候选推文: ${totalFetched} 条`);
  console.log(`  通过筛选: ${totalKept} 条`);
  console.log(`  累计保存: ${allTweets.length} 条`);
  console.log(`  输出文件: ${OUTPUT_PATH}`);

  // 按 KOL 统计
  const byKol: Record<string, number> = {};
  allTweets.forEach((t) => { byKol[t.kol_username] = (byKol[t.kol_username] || 0) + 1; });
  const sorted = Object.entries(byKol).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log("\n  推文最多的 KOL:");
  sorted.forEach(([u, c]) => console.log(`    @${u}: ${c} 条`));
}

main().catch((err) => {
  console.error("❌ 脚本出错:", err);
  process.exit(1);
});
