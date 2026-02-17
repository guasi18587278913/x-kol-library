-- ========================================
-- Migration 001: Add translation fields to tweets table
-- ========================================
-- Adds language detection and Chinese translation support
-- for the tweet reading platform.
--
-- Run with: psql $DATABASE_URL -f database/migrations/001-add-translation-fields.sql
-- ========================================

-- Add language column (default 'zh' since most existing data is Chinese)
ALTER TABLE tweets
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'zh';

-- Add Chinese translation column
ALTER TABLE tweets
  ADD COLUMN IF NOT EXISTS content_zh TEXT NOT NULL DEFAULT '';

-- Add translation timestamp
ALTER TABLE tweets
  ADD COLUMN IF NOT EXISTS translated_at TIMESTAMPTZ;

-- Add index on language for filtering
CREATE INDEX IF NOT EXISTS idx_tweets_language ON tweets(language);

-- Add trigram index on content_zh for Chinese translation search
CREATE INDEX IF NOT EXISTS idx_tweets_content_zh_trgm ON tweets USING GIN(content_zh gin_trgm_ops);

-- ========================================
-- Verify migration
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 completed successfully.';
  RAISE NOTICE 'Added columns: tweets.language, tweets.content_zh, tweets.translated_at';
END $$;
