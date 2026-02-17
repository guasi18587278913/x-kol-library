/**
 * Cron Job Service - Main Entry Point
 *
 * This service runs daily to:
 * 1. Import scraped KOL and tweet data into the database
 * 2. Translate untranslated English tweets
 * 3. Log results and errors
 *
 * Deployment: Railway or Render (free tier)
 *
 * Environment variables:
 *   DATABASE_URL        - PostgreSQL connection string (required)
 *   ANTHROPIC_API_KEY   - Claude API key for translation (required)
 *   CRON_SCHEDULE       - Cron expression (default: "0 2 * * *")
 *   DATA_DIR            - Path to data directory (default: ../../data)
 */

import * as path from "path";
import { query, closePool } from "./db";
import { loadScrapedKols, loadScrapedTweets, importToDatabase } from "./scraper";
import { translateUntranslatedTweets } from "./translator";
import { config } from "./config";

// ─── Logging ──────────────────────────────────────

function log(msg: string): void {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function logError(msg: string): void {
  console.error(`[${new Date().toISOString()}] ERROR: ${msg}`);
}

// ─── Main Job ─────────────────────────────────────

async function runJob(): Promise<void> {
  const startTime = Date.now();
  log("========================================");
  log("  Daily Cron Job - Starting");
  log("========================================");

  const dataDir =
    process.env.DATA_DIR || path.resolve(__dirname, "..", "..", "..", "data");
  log(`Data directory: ${dataDir}`);

  // Step 1: Load scraped data
  log("\n--- Step 1: Loading scraped data ---");
  const kols = loadScrapedKols(dataDir);
  const tweets = loadScrapedTweets(dataDir);
  log(`  Loaded ${kols.length} KOLs, ${tweets.length} tweets`);

  if (kols.length === 0) {
    logError("No KOL data found. Skipping import.");
    return;
  }

  // Step 2: Import to database
  log("\n--- Step 2: Importing to database ---");
  try {
    const importStats = await importToDatabase(kols, tweets, query);
    log(`  Categories: ${importStats.categories}`);
    log(`  KOLs:       ${importStats.kols}`);
    log(`  Tweets:     ${importStats.tweets}`);
    if (importStats.errors.length > 0) {
      logError(`  ${importStats.errors.length} import errors`);
      for (const err of importStats.errors.slice(0, 10)) {
        logError(`    ${err}`);
      }
    }
  } catch (err) {
    logError(`Import failed: ${err}`);
    return;
  }

  // Step 3: Translate untranslated tweets
  if (config.anthropicApiKey) {
    log("\n--- Step 3: Translating English tweets ---");
    try {
      const translationStats = await translateUntranslatedTweets(
        query,
        config.translateBatchSize
      );
      log(`  Translated: ${translationStats.translated}`);
      log(`  Errors:     ${translationStats.errors}`);
      log(`  Skipped:    ${translationStats.skipped}`);
      log(`  Tokens:     ${translationStats.totalTokens}`);
    } catch (err) {
      logError(`Translation failed: ${err}`);
    }
  } else {
    log("\n--- Step 3: Skipping translation (no API key) ---");
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log("\n========================================");
  log(`  Job completed in ${elapsed}s`);
  log("========================================");
}

// ─── Scheduling ───────────────────────────────────

/**
 * Simple cron scheduler using setTimeout.
 * Avoids adding node-cron as a dependency for Railway/Render.
 */
function parseCronToMs(cron: string): number {
  // For simple daily scheduling, just run once and let Railway/Render handle re-runs.
  // Default: 24 hours
  const parts = cron.split(" ");
  if (parts.length === 5 && parts[0] !== "*" && parts[1] !== "*") {
    // Has specific hour and minute
    return 24 * 60 * 60 * 1000; // 24 hours
  }
  return 24 * 60 * 60 * 1000;
}

async function main(): Promise<void> {
  const mode = process.argv[2] || "once";

  if (mode === "once") {
    // Run once and exit (for Railway/Render cron triggers)
    try {
      await runJob();
    } finally {
      await closePool();
    }
  } else if (mode === "loop") {
    // Run in a loop (for long-running service mode)
    const intervalMs = parseCronToMs(config.cronSchedule);
    log(`Running in loop mode. Interval: ${intervalMs / 1000 / 60} minutes`);

    while (true) {
      try {
        await runJob();
      } catch (err) {
        logError(`Job failed: ${err}`);
      }

      log(`Next run in ${intervalMs / 1000 / 60} minutes...`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  } else {
    console.log("Usage: tsx src/index.ts [once|loop]");
    console.log("  once  - Run the job once and exit (default)");
    console.log("  loop  - Run the job in a loop");
    process.exit(1);
  }
}

main().catch((err) => {
  logError(`Fatal error: ${err}`);
  process.exit(1);
});
