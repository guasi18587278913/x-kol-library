/**
 * 批量翻译英文推文脚本
 *
 * 只处理 language='en' 且 content_zh 为空的推文，按 likes 降序翻译。
 *
 * 运行方法：
 *   npx tsx scripts/translate-en-tweets.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Client } from "pg";

const BATCH_SIZE = 5;
const DELAY_MS = 300;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface TweetRow {
  id: string;
  tweet_id: string;
  content: string;
}

async function translateBatch(
  apiKey: string,
  tweets: TweetRow[]
): Promise<string[]> {
  const numbered = tweets.map((t, i) => `[${i + 1}] ${t.content}`).join("\n\n");

  const resp = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: "你是专业的中英翻译，将以下推文翻译成自然流畅的中文，保留原文的语气和风格。每条翻译用对应编号标注，格式：[1] 译文",
        },
        { role: "user", content: numbered },
      ],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`DeepSeek API error ${resp.status}: ${err}`);
  }

  const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
  const text = data.choices[0]?.message?.content || "";

  const results: string[] = [];
  for (let i = 1; i <= tweets.length; i++) {
    const regex = new RegExp(`\\[${i}\\]\\s*([\\s\\S]*?)(?=\\[${i + 1}\\]|$)`);
    const match = text.match(regex);
    results.push(match ? match[1].trim() : "");
  }
  return results;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!dbUrl) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Missing DEEPSEEK_API_KEY");
    process.exit(1);
  }

  const db = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();
  console.log("Database connected");

  const { rows } = await db.query<TweetRow>(
    `SELECT id, tweet_id, content FROM tweets
     WHERE language = 'en' AND (content_zh IS NULL OR content_zh = '')
     ORDER BY likes DESC`
  );

  if (rows.length === 0) {
    console.log("No English tweets need translation");
    await db.end();
    return;
  }

  console.log(`Found ${rows.length} English tweets to translate`);

  let success = 0;
  let fail = 0;
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3;
  const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const translations = await translateBatch(apiKey, batch);
      consecutiveErrors = 0;

      for (let j = 0; j < batch.length; j++) {
        const zh = translations[j];
        if (!zh) {
          fail++;
          continue;
        }
        try {
          await db.query(
            `UPDATE tweets SET content_zh = $1, translated_at = NOW() WHERE id = $2`,
            [zh, batch[j].id]
          );
          success++;
        } catch (err) {
          console.error(`  Failed to update id=${batch[j].id}: ${(err as Error).message}`);
          fail++;
        }
      }
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`  Batch ${batchNum} error: ${msg}`);
      fail += batch.length;
      consecutiveErrors++;

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error(`\nAborting: ${MAX_CONSECUTIVE_ERRORS} consecutive batch failures. Last error: ${msg}`);
        break;
      }
    }

    // Progress every 50 tweets or at batch boundaries
    const processed = Math.min(i + BATCH_SIZE, rows.length);
    if (processed % 50 < BATCH_SIZE || batchNum === totalBatches) {
      console.log(
        `Progress: ${processed}/${rows.length} | success: ${success} | fail: ${fail} | batch ${batchNum}/${totalBatches}`
      );
    }

    if (i + BATCH_SIZE < rows.length) await sleep(DELAY_MS);
  }

  console.log(`\nDone. success: ${success}, fail: ${fail}`);

  // Verify
  const { rows: remaining } = await db.query(
    `SELECT COUNT(*) as cnt FROM tweets WHERE language = 'en' AND (content_zh IS NULL OR content_zh = '')`
  );
  console.log(`Remaining untranslated English tweets: ${remaining[0].cnt}`);

  await db.end();
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
