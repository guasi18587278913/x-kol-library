/**
 * 批量翻译推文脚本
 *
 * - 中文推文（language = 'zh'）：直接将 content 复制到 content_zh
 * - 英文推文（language = 'en'）：调用 Claude API 翻译成中文
 *
 * 运行方法：
 *   DATABASE_URL=xxx ANTHROPIC_API_KEY=xxx npx tsx scripts/translate-tweets.ts
 *
 * 可选参数：
 *   --dry-run     只打印，不修改数据库
 */

import { Client } from "pg";
import Anthropic from "@anthropic-ai/sdk";

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 5;
const DELAY_MS = 300;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface TweetRow {
  id: string;
  content: string;
  language: string;
  kol_username: string;
}

async function translateEnBatch(
  client: Anthropic,
  tweets: TweetRow[]
): Promise<string[]> {
  const numbered = tweets.map((t, i) => `[${i + 1}] ${t.content}`).join("\n\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `你是一名专业的推文翻译员。请将以下推文翻译成简体中文。

要求：
- 保持原文语气和风格
- 专业术语保留英文（如 AI、LLM、API、GPT 等）
- 每条翻译单独一行，格式为 [序号] 翻译内容
- 只输出翻译，不要解释

原文：
${numbered}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const results: string[] = [];
  for (let i = 1; i <= tweets.length; i++) {
    const regex = new RegExp(`\\[${i}\\]\\s*([\\s\\S]*?)(?=\\[${i + 1}\\]|$)`);
    const match = text.match(regex);
    results.push(match ? match[1].trim() : "");
  }
  return results;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ 缺少环境变量: DATABASE_URL");
    process.exit(1);
  }

  if (DRY_RUN) console.log("🔍 DRY RUN 模式：只打印，不修改数据库\n");

  const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();
  console.log("✅ 数据库连接成功");

  // 查询所有 content_zh 为空的推文
  const { rows } = await db.query<TweetRow>(
    `SELECT id, content, language, kol_username FROM tweets
     WHERE (content_zh IS NULL OR content_zh = '')
     ORDER BY tweet_time DESC`
  );

  if (rows.length === 0) {
    console.log("✅ 所有推文已有翻译，无需处理");
    await db.end();
    return;
  }

  const zhTweets = rows.filter((r) => r.language === "zh");
  const enTweets = rows.filter((r) => r.language === "en" || r.language === null);

  console.log(`\n📋 待处理推文：${rows.length} 条`);
  console.log(`   中文推文（直接复制）：${zhTweets.length} 条`);
  console.log(`   英文推文（需翻译）：${enTweets.length} 条\n`);

  // ── 处理中文推文：直接复制 ──────────────────
  if (zhTweets.length > 0) {
    console.log("📝 处理中文推文...");
    if (!DRY_RUN) {
      await db.query(
        `UPDATE tweets SET content_zh = content, translated_at = NOW()
         WHERE (content_zh IS NULL OR content_zh = '') AND language = 'zh'`
      );
    }
    console.log(`  ✅ ${zhTweets.length} 条中文推文已同步\n`);
  }

  // ── 处理英文推文：调用 Claude 翻译 ──────────
  if (enTweets.length > 0) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("❌ 英文推文需要翻译，但缺少 ANTHROPIC_API_KEY");
      await db.end();
      process.exit(1);
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let success = 0;
    let fail = 0;

    console.log("🌐 翻译英文推文...");
    for (let i = 0; i < enTweets.length; i += BATCH_SIZE) {
      const batch = enTweets.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(enTweets.length / BATCH_SIZE);

      process.stdout.write(
        `  [${batchNum}/${totalBatches}] @${batch[0].kol_username} 等 ${batch.length} 条...`
      );

      if (DRY_RUN) {
        console.log(" 跳过（dry-run）");
        continue;
      }

      try {
        const translations = await translateEnBatch(anthropic, batch);
        for (let j = 0; j < batch.length; j++) {
          const zh = translations[j];
          if (!zh) { fail++; continue; }
          await db.query(
            `UPDATE tweets SET content_zh = $1, translated_at = NOW() WHERE id = $2`,
            [zh, batch[j].id]
          );
          success++;
        }
        console.log(" ✅");
      } catch (err) {
        console.log(` ❌ ${(err as Error).message}`);
        fail += batch.length;
      }

      if (i + BATCH_SIZE < enTweets.length) await sleep(DELAY_MS);
    }

    console.log(`\n英文翻译完成：成功 ${success} | 失败 ${fail}`);
  }

  await db.end();
  console.log(`\n${"─".repeat(50)}`);
  console.log("全部完成！");
}

main().catch((err) => {
  console.error("脚本出错:", err);
  process.exit(1);
});
