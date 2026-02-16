/**
 * KOL 数据抓取脚本
 *
 * 使用 X MCP 工具批量抓取 KOL 个人资料和推文
 * 输出 JSON 文件供后续导入数据库
 *
 * 用法：npx tsx scripts/scraper.ts [--batch-size=20] [--delay=5000] [--resume]
 *
 * 该脚本设计为由 Claude Code Agent 通过 MCP 工具调用执行，
 * 也可以作为独立脚本运行（需手动调用 MCP 工具并传入数据）。
 *
 * 实际工作流程：
 * 1. Agent 读取 data/kols-list.json
 * 2. 分批调用 mcp__x-mcp__scrape_profile 获取 KOL 资料
 * 3. 分批调用 mcp__x-mcp__scrape_timeline 获取推文（非 scrape_timeline，而是用户主页抓取）
 * 4. 清洗数据并保存到 data/kols-scraped.json 和 data/tweets-scraped.json
 */

import * as fs from "fs";
import * as path from "path";
import {
  type KolListEntry,
  type CleanedKol,
  type CleanedTweet,
  cleanProfileData,
  cleanTweetsData,
  categoriesToSlugs,
  extractTags,
} from "./utils/data-cleaner";

// ============================================
// 配置
// ============================================

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const KOL_LIST_PATH = path.join(DATA_DIR, "kols-list.json");
const SCRAPED_KOLS_PATH = path.join(DATA_DIR, "kols-scraped.json");
const SCRAPED_TWEETS_PATH = path.join(DATA_DIR, "tweets-scraped.json");
const SCRAPE_PROGRESS_PATH = path.join(DATA_DIR, "scrape-progress.json");

const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_DELAY_MS = 5000; // 批次间延迟（毫秒）
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 10000;
const MAX_POSTS_PER_KOL = 10;

// ============================================
// 类型定义
// ============================================

interface ScrapeProgress {
  completedUsernames: string[];
  failedUsernames: string[];
  lastBatchIndex: number;
  startedAt: string;
  updatedAt: string;
}

interface ScrapeResult {
  kols: CleanedKol[];
  tweets: CleanedTweet[];
  errors: Array<{ username: string; error: string }>;
}

// ============================================
// 工具函数
// ============================================

function loadKolList(): KolListEntry[] {
  const raw = fs.readFileSync(KOL_LIST_PATH, "utf-8");
  return JSON.parse(raw) as KolListEntry[];
}

function loadProgress(): ScrapeProgress | null {
  if (!fs.existsSync(SCRAPE_PROGRESS_PATH)) return null;
  const raw = fs.readFileSync(SCRAPE_PROGRESS_PATH, "utf-8");
  return JSON.parse(raw) as ScrapeProgress;
}

function saveProgress(progress: ScrapeProgress): void {
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(SCRAPE_PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function loadExistingData<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

function appendAndSave<T>(filePath: string, existing: T[], newItems: T[]): T[] {
  const combined = [...existing, ...newItems];
  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2));
  return combined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 将数组分成指定大小的批次
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ============================================
// MCP 工具模拟层
// ============================================

/**
 * 抓取单个 KOL 的 Profile
 *
 * 当由 Agent 驱动时，这个函数会被替换为实际的 MCP 调用。
 * 独立运行时，从已有的抓取结果文件中读取。
 */
async function scrapeProfile(
  username: string
): Promise<Record<string, unknown> | null> {
  // 此函数作为模板 - 实际抓取由 Agent 通过 MCP 工具完成
  // Agent 调用: mcp__x-mcp__scrape_profile({ username })
  console.log(`  [PROFILE] 抓取 @${username} ...`);

  // 当独立运行时，返回 null 表示需要 Agent 介入
  return null;
}

/**
 * 抓取单个 KOL 的最近推文
 *
 * 注意：scrape_timeline 抓取的是当前登录用户的时间线，
 * 要获取特定用户的推文，需要使用 scrape_profile 并指定 maxPosts
 */
async function scrapePosts(
  username: string,
  maxPosts: number = MAX_POSTS_PER_KOL
): Promise<unknown[] | null> {
  // Agent 调用: mcp__x-mcp__scrape_profile({ username, maxPosts })
  console.log(`  [TWEETS] 抓取 @${username} 最近 ${maxPosts} 条推文 ...`);
  return null;
}

// ============================================
// 核心抓取逻辑
// ============================================

/**
 * 处理单个 KOL 的抓取（Profile + 推文）
 */
async function scrapeOneKol(
  kolEntry: KolListEntry,
  retries: number = 0
): Promise<{
  kol: CleanedKol | null;
  tweets: CleanedTweet[];
  error: string | null;
}> {
  try {
    // 1. 抓取 Profile
    const profileData = await scrapeProfile(kolEntry.username);

    let kol: CleanedKol;
    if (profileData) {
      kol = cleanProfileData(profileData, kolEntry);
    } else {
      // 如果 Profile 抓取失败，使用 KOL 清单中的基本信息
      kol = {
        twitter_id: "",
        username: kolEntry.username,
        display_name: kolEntry.displayName,
        bio: kolEntry.notes,
        avatar_url: "",
        followers: 0,
        following: 0,
        tweet_total: 0,
        categories: categoriesToSlugs(kolEntry.categories),
        tags: extractTags(kolEntry.notes),
        profile_url: `https://x.com/${kolEntry.username}`,
      };
    }

    // 2. 抓取推文
    const rawPosts = await scrapePosts(kolEntry.username);
    const tweets = rawPosts
      ? cleanTweetsData(rawPosts, kolEntry.username)
      : [];

    return { kol, tweets, error: null };
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : String(err);

    if (retries < MAX_RETRIES) {
      console.log(
        `  [RETRY] @${kolEntry.username} 失败，${RETRY_DELAY_MS / 1000}秒后重试 (${retries + 1}/${MAX_RETRIES})...`
      );
      await sleep(RETRY_DELAY_MS);
      return scrapeOneKol(kolEntry, retries + 1);
    }

    console.error(`  [ERROR] @${kolEntry.username}: ${errorMsg}`);
    return { kol: null, tweets: [], error: errorMsg };
  }
}

/**
 * 批量抓取一组 KOL
 */
async function scrapeBatch(
  batch: KolListEntry[],
  batchIndex: number,
  totalBatches: number
): Promise<{
  kols: CleanedKol[];
  tweets: CleanedTweet[];
  errors: Array<{ username: string; error: string }>;
}> {
  console.log(
    `\n========== 批次 ${batchIndex + 1}/${totalBatches} (${batch.length} 个 KOL) ==========`
  );

  const kols: CleanedKol[] = [];
  const tweets: CleanedTweet[] = [];
  const errors: Array<{ username: string; error: string }> = [];

  for (const kolEntry of batch) {
    const result = await scrapeOneKol(kolEntry);

    if (result.kol) {
      kols.push(result.kol);
    }
    if (result.tweets.length > 0) {
      tweets.push(...result.tweets);
    }
    if (result.error) {
      errors.push({ username: kolEntry.username, error: result.error });
    }
  }

  console.log(
    `  批次完成: ${kols.length} 个 KOL, ${tweets.length} 条推文, ${errors.length} 个错误`
  );

  return { kols, tweets, errors };
}

// ============================================
// Agent 驱动模式的公开 API
// ============================================

/**
 * 用 Agent 抓取的原始数据处理单个 KOL
 * Agent 先调用 MCP 工具获取数据，然后调用此函数清洗
 */
export function processProfileResult(
  rawProfile: Record<string, unknown>,
  kolEntry: KolListEntry
): CleanedKol {
  return cleanProfileData(rawProfile, kolEntry);
}

/**
 * 用 Agent 抓取的原始推文数据处理
 */
export function processPostsResult(
  rawPosts: unknown[],
  kolUsername: string
): CleanedTweet[] {
  return cleanTweetsData(rawPosts, kolUsername);
}

/**
 * 从 KOL 清单生成基础 KOL 数据（不需要抓取）
 * 用于初始化数据或 MCP 工具不可用时的降级方案
 */
export function generateBaselineData(): ScrapeResult {
  const kolList = loadKolList();
  const kols: CleanedKol[] = [];
  const errors: Array<{ username: string; error: string }> = [];

  for (const entry of kolList) {
    try {
      kols.push({
        twitter_id: "",
        username: entry.username,
        display_name: entry.displayName,
        bio: entry.notes,
        avatar_url: "",
        followers: 0,
        following: 0,
        tweet_total: 0,
        categories: categoriesToSlugs(entry.categories),
        tags: extractTags(entry.notes),
        profile_url: `https://x.com/${entry.username}`,
      });
    } catch (err) {
      errors.push({
        username: entry.username,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { kols, tweets: [], errors };
}

// ============================================
// 主流程
// ============================================

async function main(): Promise<void> {
  console.log("========================================");
  console.log("  推特大佬电子阅览室 - KOL 数据抓取");
  console.log("========================================\n");

  // 解析命令行参数
  const args = process.argv.slice(2);
  const batchSize =
    parseInt(args.find((a) => a.startsWith("--batch-size="))?.split("=")[1] || "") ||
    DEFAULT_BATCH_SIZE;
  const delayMs =
    parseInt(args.find((a) => a.startsWith("--delay="))?.split("=")[1] || "") ||
    DEFAULT_DELAY_MS;
  const shouldResume = args.includes("--resume");
  const baselineOnly = args.includes("--baseline");

  // 确保数据目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 加载 KOL 清单
  const kolList = loadKolList();
  console.log(`加载 KOL 清单: ${kolList.length} 个\n`);

  // 基线模式：只生成基础数据，不抓取
  if (baselineOnly) {
    console.log("[ 基线模式 ] 生成基础 KOL 数据（无需网络抓取）...\n");
    const result = generateBaselineData();
    fs.writeFileSync(SCRAPED_KOLS_PATH, JSON.stringify(result.kols, null, 2));
    fs.writeFileSync(SCRAPED_TWEETS_PATH, JSON.stringify(result.tweets, null, 2));
    console.log(`\n完成！已生成 ${result.kols.length} 个 KOL 基线数据`);
    console.log(`  KOL 数据: ${SCRAPED_KOLS_PATH}`);
    console.log(`  推文数据: ${SCRAPED_TWEETS_PATH}`);
    if (result.errors.length > 0) {
      console.log(`  错误: ${result.errors.length} 个`);
    }
    return;
  }

  // 恢复模式：从上次中断处继续
  let startIndex = 0;
  let existingKols = loadExistingData<CleanedKol>(SCRAPED_KOLS_PATH);
  let existingTweets = loadExistingData<CleanedTweet>(SCRAPED_TWEETS_PATH);

  if (shouldResume) {
    const progress = loadProgress();
    if (progress) {
      const completedSet = new Set(progress.completedUsernames);
      startIndex = progress.lastBatchIndex;
      console.log(
        `[ 恢复模式 ] 已完成 ${completedSet.size} 个, 从批次 ${startIndex + 1} 继续\n`
      );
    }
  }

  // 过滤已完成的 KOL
  const completedUsernames = new Set(existingKols.map((k) => k.username));
  const pendingKols = kolList.filter(
    (k) => !completedUsernames.has(k.username)
  );

  if (pendingKols.length === 0) {
    console.log("所有 KOL 已抓取完成，无需重复操作。");
    return;
  }

  console.log(`待抓取: ${pendingKols.length} 个 KOL`);
  console.log(`批次大小: ${batchSize}, 批次间延迟: ${delayMs}ms\n`);

  // 分批处理
  const batches = chunk(pendingKols, batchSize);
  const allErrors: Array<{ username: string; error: string }> = [];
  const progress: ScrapeProgress = loadProgress() || {
    completedUsernames: [...completedUsernames],
    failedUsernames: [],
    lastBatchIndex: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  for (let i = 0; i < batches.length; i++) {
    const batchResult = await scrapeBatch(batches[i], i, batches.length);

    // 增量保存
    existingKols = appendAndSave(
      SCRAPED_KOLS_PATH,
      existingKols,
      batchResult.kols
    );
    existingTweets = appendAndSave(
      SCRAPED_TWEETS_PATH,
      existingTweets,
      batchResult.tweets
    );
    allErrors.push(...batchResult.errors);

    // 更新进度
    progress.completedUsernames.push(
      ...batchResult.kols.map((k) => k.username)
    );
    progress.failedUsernames.push(
      ...batchResult.errors.map((e) => e.username)
    );
    progress.lastBatchIndex = i;
    saveProgress(progress);

    // 批次间延迟（最后一批不需要）
    if (i < batches.length - 1) {
      console.log(`  等待 ${delayMs / 1000} 秒避免限流...`);
      await sleep(delayMs);
    }
  }

  // 输出汇总
  console.log("\n========================================");
  console.log("  抓取完成 - 汇总");
  console.log("========================================");
  console.log(`  KOL 总数: ${existingKols.length}`);
  console.log(`  推文总数: ${existingTweets.length}`);
  console.log(`  错误数量: ${allErrors.length}`);
  console.log(`\n  KOL 数据: ${SCRAPED_KOLS_PATH}`);
  console.log(`  推文数据: ${SCRAPED_TWEETS_PATH}`);
  console.log(`  进度文件: ${SCRAPE_PROGRESS_PATH}`);

  if (allErrors.length > 0) {
    console.log(`\n  失败列表:`);
    for (const err of allErrors) {
      console.log(`    @${err.username}: ${err.error}`);
    }
  }
}

// 直接运行入口
if (require.main === module) {
  main().catch(console.error);
}

// 导出供 Agent 和测试使用
export {
  loadKolList,
  loadProgress,
  saveProgress,
  generateBaselineData as generateBaseline,
  scrapeOneKol,
  scrapeBatch,
  chunk,
  sleep,
  SCRAPED_KOLS_PATH,
  SCRAPED_TWEETS_PATH,
  SCRAPE_PROGRESS_PATH,
  MAX_POSTS_PER_KOL,
};
export type { ScrapeProgress, ScrapeResult };
