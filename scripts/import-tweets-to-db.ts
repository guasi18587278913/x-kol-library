/**
 * 推文导入脚本 - 将 tweets-api.json 中的 560 条推文导入生产数据库
 *
 * 使用方式：npx tsx scripts/import-tweets-to-db.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "pg";

// 加载 .env.local
config({ path: resolve(__dirname, "..", ".env.local") });

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

const BATCH_SIZE = 50;

async function main() {
  const root = resolve(__dirname, "..");

  // 1. 读取数据
  const tweets: Tweet[] = JSON.parse(
    readFileSync(resolve(root, "data/tweets-api.json"), "utf-8")
  );
  console.log(`读取 ${tweets.length} 条推文`);

  // 2. 连接数据库
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("数据库连接成功");

  // 3. 记录导入前的数量
  const beforeResult = await client.query("SELECT COUNT(*) as count FROM tweets");
  const beforeCount = parseInt(beforeResult.rows[0].count, 10);
  console.log(`导入前数据库中有 ${beforeCount} 条推文\n`);

  // 4. 批量导入
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < tweets.length; i += BATCH_SIZE) {
    const batch = tweets.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(tweets.length / BATCH_SIZE);

    for (const t of batch) {
      try {
        // 中文推文：content_zh = content
        const contentZh =
          t.language === "zh" ? t.content : (t.content_zh || "");

        const result = await client.query(
          `INSERT INTO tweets (
            tweet_id, kol_username, content, content_zh, language,
            translated_at, media_urls, likes, retweets, replies,
            views, tweet_time, tweet_url, is_retweet, is_reply
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (tweet_id) DO NOTHING`,
          [
            t.tweet_id,
            t.kol_username,
            t.content?.trim() || "",
            contentZh?.trim() || "",
            t.language || "en",
            t.translated_at || null,
            JSON.stringify(t.media_urls || []),
            t.likes || 0,
            t.retweets || 0,
            t.replies || 0,
            t.views || 0,
            t.tweet_time,
            t.tweet_url || "",
            t.is_retweet || false,
            t.is_reply || false,
          ]
        );

        if (result.rowCount && result.rowCount > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (err: unknown) {
        errors++;
        const msg = err instanceof Error ? err.message : String(err);
        if (errors <= 5) {
          console.error(`  错误 [${t.tweet_id}]: ${msg}`);
        }
      }
    }

    console.log(
      `  批次 ${batchNum}/${totalBatches} 完成 (已处理 ${Math.min(i + BATCH_SIZE, tweets.length)}/${tweets.length})`
    );
  }

  // 5. 查询导入后的数量
  const afterResult = await client.query("SELECT COUNT(*) as count FROM tweets");
  const afterCount = parseInt(afterResult.rows[0].count, 10);

  // 6. 打印报告
  console.log("\n========================================");
  console.log("       推文导入报告");
  console.log("========================================");
  console.log(`数据文件推文数：${tweets.length}`);
  console.log(`新增插入：${inserted} 条`);
  console.log(`重复跳过：${skipped} 条`);
  console.log(`错误：${errors} 条`);
  console.log(`导入前数据库推文数：${beforeCount}`);
  console.log(`导入后数据库推文数：${afterCount}`);
  console.log(`净增加：${afterCount - beforeCount} 条`);
  console.log("========================================");

  await client.end();
}

main().catch((err) => {
  console.error("脚本执行失败：", err);
  process.exit(1);
});
