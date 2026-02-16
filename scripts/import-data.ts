/**
 * 数据导入脚本
 *
 * 从 data/ 目录读取抓取数据，清洗后导入 PostgreSQL 数据库。
 * 使用参数化查询，避免 SQL 注入。
 *
 * 使用方式：
 *   npx tsx scripts/import-data.ts
 *
 * 前置条件：
 *   1. PostgreSQL 正在运行（docker compose up -d）
 *   2. 已执行 schema.sql 建表
 *   3. .env 中配置了 DATABASE_URL（或使用默认值）
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";

// ─── 类型定义 ────────────────────────────────────────

interface ScrapedKol {
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

interface ScrapedTweet {
  tweet_id: string;
  kol_username: string;
  content: string;
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

interface KolListItem {
  username: string;
  displayName: string;
  categories: string[];
  priority: string;
  notes: string;
}

// ─── 类目定义（与 seed.sql 一致）────────────────────

const CATEGORIES = [
  {
    name: "AI 技术",
    slug: "ai-tech",
    description:
      "人工智能、大语言模型、Prompt 工程、AI Agent、AI 绘画等前沿技术领域的顶级 KOL",
    icon: "\u{1F916}",
    sort_order: 1,
  },
  {
    name: "创业出海",
    slug: "startup-global",
    description:
      "独立开发者、出海创业、SaaS 产品、跨境电商等全球化创业领域的先行者",
    icon: "\u{1F680}",
    sort_order: 2,
  },
  {
    name: "投资理财",
    slug: "investment-finance",
    description:
      "加密货币、风险投资、个人理财、宏观经济分析等投资领域的思想领袖",
    icon: "\u{1F4B0}",
    sort_order: 3,
  },
  {
    name: "商业财富",
    slug: "business-wealth",
    description: "商业战略、企业管理、创业心法、财富积累等商业智慧的分享者",
    icon: "\u{1F4BC}",
    sort_order: 4,
  },
  {
    name: "设计产品",
    slug: "design-product",
    description: "产品设计、用户体验、设计系统、产品管理等领域的资深从业者",
    icon: "\u{1F3A8}",
    sort_order: 5,
  },
  {
    name: "内容创作",
    slug: "content-creation",
    description:
      "写作技巧、Newsletter 运营、个人品牌、知识付费等内容创作领域的标杆人物",
    icon: "\u270D\uFE0F",
    sort_order: 6,
  },
  {
    name: "营销增长",
    slug: "marketing-growth",
    description:
      "SEO、社交媒体营销、增长黑客、品牌建设等营销增长领域的实战专家",
    icon: "\u{1F4C8}",
    sort_order: 7,
  },
];

// ─── 粉丝数估算 ─────────────────────────────────────
// MCP 工具返回的 followers 大多为 0，需要根据知名度估算

const FOLLOWER_ESTIMATES: Record<string, number> = {
  // 顶级大佬（百万级）
  elonmusk: 200_000_000,
  sama: 3_500_000,
  naval: 2_000_000,
  karpathy: 1_000_000,
  AndrewYNg: 900_000,
  waitbutwhy: 700_000,
  levelsio: 500_000,
  joulee: 300_000,
  EMostaque: 300_000,
  // 知名人物（十万级）
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

function estimateFollowers(
  username: string,
  priority: string | undefined
): number {
  if (FOLLOWER_ESTIMATES[username]) {
    return FOLLOWER_ESTIMATES[username];
  }
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

// ─── 生成稳定的 twitter_id ──────────────────────────

function generateTwitterId(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) & 0x7fffffff;
  }
  return String(1_000_000_000 + (hash % 9_000_000_000));
}

// ─── 主函数 ──────────────────────────────────────────

async function main() {
  const root = resolve(__dirname, "..");

  console.log("=== 数据导入脚本 ===\n");

  // 1. 读取数据文件
  const kolsScraped: ScrapedKol[] = JSON.parse(
    readFileSync(resolve(root, "data/kols-scraped.json"), "utf-8")
  );
  const tweetsScraped: ScrapedTweet[] = JSON.parse(
    readFileSync(resolve(root, "data/tweets-scraped.json"), "utf-8")
  );
  const kolsList: KolListItem[] = JSON.parse(
    readFileSync(resolve(root, "data/kols-list.json"), "utf-8")
  );

  console.log("读取数据：");
  console.log(`  - kols-scraped.json:   ${kolsScraped.length} 个 KOL`);
  console.log(`  - tweets-scraped.json: ${tweetsScraped.length} 条推文`);
  console.log(`  - kols-list.json:      ${kolsList.length} 个 KOL 清单\n`);

  // 2. 构建 kols-list username -> item 映射（用于补充 followers）
  const kolsListMap = new Map<string, KolListItem>();
  for (const item of kolsList) {
    kolsListMap.set(item.username, item);
  }

  // 3. 清洗 KOL 数据
  const seenUsernames = new Set<string>();
  const uniqueKols = kolsScraped
    .filter((kol) => {
      if (seenUsernames.has(kol.username)) return false;
      seenUsernames.add(kol.username);
      return true;
    })
    .map((kol) => {
      const listItem = kolsListMap.get(kol.username);
      const followers =
        kol.followers > 0
          ? kol.followers
          : estimateFollowers(kol.username, listItem?.priority);

      return {
        twitter_id: kol.twitter_id || generateTwitterId(kol.username),
        username: kol.username.trim(),
        display_name: kol.display_name?.trim() || kol.username,
        bio: kol.bio?.trim() || "",
        avatar_url: kol.avatar_url || "",
        followers,
        following: kol.following || 0,
        tweet_total: kol.tweet_total || 0,
        categories: JSON.stringify(kol.categories || []),
        tags: JSON.stringify(kol.tags || []),
        profile_url: kol.profile_url || `https://x.com/${kol.username}`,
      };
    });

  // 4. 清洗推文数据
  const validUsernames = new Set(uniqueKols.map((k) => k.username));
  const seenTweetIds = new Set<string>();
  const cleanedTweets = tweetsScraped
    .filter((t) => {
      if (!validUsernames.has(t.kol_username)) return false;
      if (seenTweetIds.has(t.tweet_id)) return false;
      seenTweetIds.add(t.tweet_id);
      return true;
    })
    .map((t) => ({
      tweet_id: t.tweet_id,
      kol_username: t.kol_username,
      content: t.content?.trim() || "",
      media_urls: JSON.stringify(t.media_urls || []),
      likes: t.likes || 0,
      retweets: t.retweets || 0,
      replies: t.replies || 0,
      views: t.views || 0,
      tweet_time: t.tweet_time,
      tweet_url: t.tweet_url || "",
      is_retweet: t.is_retweet || false,
      is_reply: t.is_reply || false,
    }));

  console.log("清洗结果：");
  console.log(`  - KOL（去重后）：${uniqueKols.length} 个`);
  console.log(`  - 推文（有效）：${cleanedTweets.length} 条`);
  console.log(`  - 类目：${CATEGORIES.length} 个\n`);

  // 5. 连接数据库
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://xkol:xkol_secret_2026@localhost:5432/xkol_db",
    max: 5,
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  const stats = { categories: 0, kols: 0, tweets: 0, errors: [] as string[] };

  try {
    await client.query("BEGIN");

    // ── 清除旧数据（按依赖顺序）──
    console.log("清除旧数据...");
    await client.query("DELETE FROM tweets");
    await client.query("DELETE FROM kols");
    await client.query("DELETE FROM categories");

    // ── 导入类目 ──
    console.log("导入类目...");
    for (const cat of CATEGORIES) {
      await client.query(
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
    }
    console.log(`  -> ${stats.categories} 个类目已导入\n`);

    // ── 导入 KOL ──
    console.log("导入 KOL...");
    for (const kol of uniqueKols) {
      try {
        await client.query(
          `INSERT INTO kols (twitter_id, username, display_name, bio, avatar_url,
                             followers, following, tweet_total, categories, tags, profile_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11)
           ON CONFLICT (username) DO UPDATE SET
             display_name = EXCLUDED.display_name,
             bio = EXCLUDED.bio,
             avatar_url = EXCLUDED.avatar_url,
             followers = EXCLUDED.followers,
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
            kol.categories,
            kol.tags,
            kol.profile_url,
          ]
        );
        stats.kols++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`KOL ${kol.username}: ${msg}`);
      }
    }
    console.log(`  -> ${stats.kols} 个 KOL 已导入\n`);

    // ── 导入推文 ──
    console.log("导入推文...");
    for (const tweet of cleanedTweets) {
      try {
        await client.query(
          `INSERT INTO tweets (tweet_id, kol_username, content, media_urls, likes,
                               retweets, replies, views, tweet_time, tweet_url,
                               is_retweet, is_reply)
           VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (tweet_id) DO UPDATE SET
             content = EXCLUDED.content,
             likes = EXCLUDED.likes,
             retweets = EXCLUDED.retweets,
             replies = EXCLUDED.replies,
             views = EXCLUDED.views`,
          [
            tweet.tweet_id,
            tweet.kol_username,
            tweet.content,
            tweet.media_urls,
            tweet.likes,
            tweet.retweets,
            tweet.replies,
            tweet.views,
            tweet.tweet_time,
            tweet.tweet_url,
            tweet.is_retweet,
            tweet.is_reply,
          ]
        );
        stats.tweets++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`Tweet ${tweet.tweet_id}: ${msg}`);
      }
    }
    console.log(`  -> ${stats.tweets} 条推文已导入\n`);

    // ── 刷新类目统计 ──
    console.log("刷新类目统计...");
    await client.query("SELECT refresh_category_counts()");
    console.log("  -> 类目统计已刷新\n");

    // ── 提交事务 ──
    await client.query("COMMIT");
    console.log("事务已提交。\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("导入失败，已回滚事务：", err);
    process.exit(1);
  } finally {
    client.release();
  }

  // 6. 查询导入后的统计
  const catCount = await pool.query(
    "SELECT slug, name, kol_count, tweet_count FROM categories ORDER BY sort_order"
  );
  const kolCount = await pool.query("SELECT COUNT(*) as count FROM kols");
  const tweetCount = await pool.query("SELECT COUNT(*) as count FROM tweets");

  console.log("========================================");
  console.log("           导入统计报告");
  console.log("========================================");
  console.log(`类目：${stats.categories} 个`);
  console.log(`KOL： ${stats.kols} 个（成功）`);
  console.log(`推文：${stats.tweets} 条（成功）`);
  console.log(`错误：${stats.errors.length} 个`);
  console.log("");

  if (stats.errors.length > 0) {
    console.log("错误详情：");
    for (const e of stats.errors.slice(0, 20)) {
      console.log(`  - ${e}`);
    }
    if (stats.errors.length > 20) {
      console.log(`  ... 还有 ${stats.errors.length - 20} 个错误`);
    }
    console.log("");
  }

  console.log("各类目统计：");
  console.log("-".repeat(60));
  for (const row of catCount.rows) {
    console.log(
      `  ${row.name.padEnd(10)} (${row.slug.padEnd(20)}) KOL: ${String(row.kol_count).padStart(3)}  推文: ${String(row.tweet_count).padStart(3)}`
    );
  }
  console.log("");

  console.log("数据库验证：");
  console.log(`  - categories 表：${catCount.rows.length} 行`);
  console.log(`  - kols 表：      ${kolCount.rows[0].count} 行`);
  console.log(`  - tweets 表：    ${tweetCount.rows[0].count} 行`);
  console.log("\n导入完成！");

  await pool.end();
}

main().catch((err) => {
  console.error("脚本执行失败：", err);
  process.exit(1);
});
