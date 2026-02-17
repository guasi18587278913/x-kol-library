/**
 * Translation service using Claude API (Anthropic).
 *
 * Translates English tweets to Chinese, preserving the original tone
 * and style. Designed for social media content.
 */

import { query } from "./db";

// ─── Configuration ────────────────────────────────

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001"; // Cost-effective for translation
const MAX_TOKENS = 2000;

// Rate limiting
const BATCH_SIZE = 10;
const DELAY_BETWEEN_CALLS_MS = 200;

// ─── Types ────────────────────────────────────────

interface TranslationResult {
  original: string;
  translated: string;
  success: boolean;
  error?: string;
}

interface AnthropicMessage {
  role: string;
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

// ─── Core Translation ─────────────────────────────

const SYSTEM_PROMPT = `你是一个专业的推文翻译助手。将英文推文翻译成自然流畅的中文。

要求：
1. 保持原文的语气和风格（幽默、严肃、专业等）
2. 技术术语保留英文或使用公认的中文译名
3. @用户名、#标签、URL 保持原样不翻译
4. 简洁自然，避免翻译腔
5. 只返回翻译后的中文文本，不要添加解释或注释`;

/**
 * Translate a single text from English to Chinese using Claude API.
 */
export async function translateText(text: string): Promise<TranslationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      original: text,
      translated: "",
      success: false,
      error: "ANTHROPIC_API_KEY not set",
    };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `请将以下英文推文翻译成中文：\n\n${text}`,
          },
        ] as AnthropicMessage[],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        original: text,
        translated: "",
        success: false,
        error: `API error ${response.status}: ${errorBody.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as AnthropicResponse;
    const translated = data.content?.[0]?.text?.trim() || "";

    return {
      original: text,
      translated,
      success: true,
    };
  } catch (err) {
    return {
      original: text,
      translated: "",
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Language Detection ───────────────────────────

/**
 * Detect if text is primarily Chinese or English.
 */
export function detectLanguage(text: string): "zh" | "en" {
  if (!text) return "zh";
  const cjkChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  const cjkCount = cjkChars ? cjkChars.length : 0;
  const asciiChars = text.match(/[a-zA-Z]/g);
  const asciiCount = asciiChars ? asciiChars.length : 0;
  if (cjkCount === 0 && asciiCount === 0) return "zh";
  if (cjkCount / (cjkCount + asciiCount) > 0.1) return "zh";
  return "en";
}

// ─── Database Integration ─────────────────────────

/**
 * Translate untranslated English tweets in the database.
 * Returns the number of successfully translated tweets.
 */
export async function translateUntranslatedTweets(
  limit = 100
): Promise<{ translated: number; errors: number; skipped: number }> {
  const rows = await query<{
    id: string;
    tweet_id: string;
    content: string;
  }>(
    `SELECT id, tweet_id, content FROM tweets
     WHERE language = 'en'
       AND (content_zh = '' OR content_zh IS NULL)
     ORDER BY tweet_time DESC
     LIMIT $1`,
    [limit]
  );

  let translated = 0;
  let errors = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    for (const row of batch) {
      // Skip very short content
      if (row.content.length < 10) {
        skipped++;
        continue;
      }

      const result = await translateText(row.content);

      if (result.success && result.translated) {
        await query(
          `UPDATE tweets
           SET content_zh = $1, translated_at = NOW()
           WHERE id = $2`,
          [result.translated, row.id]
        );
        translated++;
      } else {
        console.error(
          `Translation failed for tweet ${row.tweet_id}: ${result.error}`
        );
        errors++;
      }

      // Rate limiting delay
      if (DELAY_BETWEEN_CALLS_MS > 0) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
      }
    }
  }

  return { translated, errors, skipped };
}

/**
 * Translate a batch of tweets (not in database) and return results.
 * Used by the cron job before inserting into the database.
 */
export async function translateTweetBatch(
  tweets: Array<{ content: string; language: string }>
): Promise<Array<{ content_zh: string; translated_at: string | null }>> {
  const results: Array<{
    content_zh: string;
    translated_at: string | null;
  }> = [];

  for (const tweet of tweets) {
    if (tweet.language !== "en" || tweet.content.length < 10) {
      results.push({ content_zh: "", translated_at: null });
      continue;
    }

    const result = await translateText(tweet.content);

    if (result.success) {
      results.push({
        content_zh: result.translated,
        translated_at: new Date().toISOString(),
      });
    } else {
      results.push({ content_zh: "", translated_at: null });
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
  }

  return results;
}
