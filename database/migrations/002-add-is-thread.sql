-- Migration 002: 添加 is_thread 字段，标记连推（Thread）内容
-- 运行方式：npx tsx scripts/run-migration.ts 002

ALTER TABLE tweets
  ADD COLUMN IF NOT EXISTS is_thread BOOLEAN NOT NULL DEFAULT FALSE;

-- 为 Thread 筛选建立索引
CREATE INDEX IF NOT EXISTS idx_tweets_is_thread ON tweets(is_thread)
  WHERE is_thread = TRUE;
