/**
 * Run database migration: adds translation fields to tweets table.
 * Usage: DATABASE_URL=your_url npx tsx scripts/run-migration.ts
 */

import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is required.");
    console.error("Usage: DATABASE_URL=your_url npx tsx scripts/run-migration.ts");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    // Execute each statement
    const statements = [
      `ALTER TABLE tweets ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'zh'`,
      `ALTER TABLE tweets ADD COLUMN IF NOT EXISTS content_zh TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE tweets ADD COLUMN IF NOT EXISTS translated_at TIMESTAMPTZ`,
      `CREATE INDEX IF NOT EXISTS idx_tweets_language ON tweets(language)`,
    ];

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        console.log(`OK: ${stmt.slice(0, 60)}...`);
      } catch (err: unknown) {
        const error = err as { message?: string };
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
          console.log(`SKIP (already exists): ${stmt.slice(0, 60)}...`);
        } else {
          throw err;
        }
      }
    }

    // Verify columns exist
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'tweets'
        AND column_name IN ('language', 'content_zh', 'translated_at')
      ORDER BY column_name
    `);

    console.log("\nMigration complete! Verified columns:");
    for (const row of result.rows) {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    }
  } finally {
    await client.end();
  }
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
