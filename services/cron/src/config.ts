/**
 * Cron service configuration.
 * All values can be overridden via environment variables.
 */

export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // Anthropic API
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
  translationMaxTokens: 2000,

  // Scraping
  scrapeDelayMs: parseInt(process.env.SCRAPE_DELAY_MS || "3000"),
  maxPostsPerKol: parseInt(process.env.MAX_POSTS_PER_KOL || "10"),
  scrapeBatchSize: parseInt(process.env.SCRAPE_BATCH_SIZE || "5"),

  // Translation
  translateDelayMs: parseInt(process.env.TRANSLATE_DELAY_MS || "200"),
  translateBatchSize: parseInt(process.env.TRANSLATE_BATCH_SIZE || "50"),

  // Scheduling
  cronSchedule: process.env.CRON_SCHEDULE || "0 2 * * *", // 2:00 AM daily
};
