/**
 * Translation service for the cron job.
 * Uses Claude API to translate English tweets to Chinese.
 */

import { config } from "./config";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `你是一个专业的推文翻译助手。将英文推文翻译成自然流畅的中文。

要求：
1. 保持原文的语气和风格（幽默、严肃、专业等）
2. 技术术语保留英文或使用公认的中文译名
3. @用户名、#标签、URL 保持原样不翻译
4. 简洁自然，避免翻译腔
5. 只返回翻译后的中文文本，不要添加解释或注释`;

interface TranslationResult {
  translated: string;
  success: boolean;
  error?: string;
  inputTokens: number;
  outputTokens: number;
}

export async function translateText(text: string): Promise<TranslationResult> {
  if (!config.anthropicApiKey) {
    return {
      translated: "",
      success: false,
      error: "ANTHROPIC_API_KEY not set",
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.anthropicModel,
        max_tokens: config.translationMaxTokens,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `请将以下英文推文翻译成中文：\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        translated: "",
        success: false,
        error: `API error ${response.status}: ${errorBody.slice(0, 200)}`,
        inputTokens: 0,
        outputTokens: 0,
      };
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };
    const translated = data.content?.[0]?.text?.trim() || "";

    return {
      translated,
      success: !!translated,
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0,
    };
  } catch (err) {
    return {
      translated: "",
      success: false,
      error: err instanceof Error ? err.message : String(err),
      inputTokens: 0,
      outputTokens: 0,
    };
  }
}

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryFn = (sql: string, params?: unknown[]) => Promise<any[]>;

/**
 * Translate all untranslated English tweets in the database.
 */
export async function translateUntranslatedTweets(
  queryFn: QueryFn,
  limit: number
): Promise<{
  translated: number;
  errors: number;
  skipped: number;
  totalTokens: number;
}> {
  const rows = await queryFn(
    `SELECT id, tweet_id, content FROM tweets
     WHERE language = 'en'
       AND (content_zh = '' OR content_zh IS NULL)
     ORDER BY tweet_time DESC
     LIMIT $1`,
    [limit]
  ) as Array<{ id: string; tweet_id: string; content: string }>;

  let translated = 0;
  let errors = 0;
  let skipped = 0;
  let totalTokens = 0;

  for (const row of rows) {
    if (row.content.length < 10) {
      skipped++;
      continue;
    }

    const result = await translateText(row.content);
    totalTokens += result.inputTokens + result.outputTokens;

    if (result.success) {
      await queryFn(
        `UPDATE tweets SET content_zh = $1, translated_at = NOW() WHERE id = $2`,
        [result.translated, row.id]
      );
      translated++;
    } else {
      console.error(`  [TRANSLATE ERROR] ${row.tweet_id}: ${result.error}`);
      errors++;
    }

    await sleep(config.translateDelayMs);
  }

  return { translated, errors, skipped, totalTokens };
}
