-- ========================================
-- 推特大佬电子阅览室 - 数据库 Schema
-- PostgreSQL 16
-- ========================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- 用于模糊搜索

-- ========================================
-- 1. 类目表 (categories)
-- ========================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50)  NOT NULL,               -- 类目中文名，如 "AI 技术"
    slug        VARCHAR(50)  NOT NULL UNIQUE,         -- URL 路径，如 "ai-tech"
    description TEXT         NOT NULL DEFAULT '',     -- 类目简介
    icon        VARCHAR(10)  NOT NULL DEFAULT '',     -- Emoji 图标，如 "🤖"
    sort_order  SMALLINT     NOT NULL DEFAULT 0,      -- 排序权重
    kol_count   INT          NOT NULL DEFAULT 0,      -- KOL 数量（冗余，定期更新）
    tweet_count INT          NOT NULL DEFAULT 0,      -- 推文数量（冗余，定期更新）
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ========================================
-- 2. KOL 信息表 (kols)
-- ========================================
CREATE TABLE kols (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_id   VARCHAR(30)  NOT NULL UNIQUE,        -- Twitter 数字 ID
    username     VARCHAR(50)  NOT NULL UNIQUE,         -- @用户名（不含@）
    display_name VARCHAR(100) NOT NULL,                -- 显示名称，如 "宝玉"
    bio          TEXT         NOT NULL DEFAULT '',     -- 个人简介
    avatar_url   TEXT         NOT NULL DEFAULT '',     -- 头像 URL
    followers    INT          NOT NULL DEFAULT 0,      -- 粉丝数
    following    INT          NOT NULL DEFAULT 0,      -- 关注数
    tweet_total  INT          NOT NULL DEFAULT 0,      -- 总推文数（Twitter 原始数据）
    categories   JSONB        NOT NULL DEFAULT '[]',   -- 所属类目 slug 数组，如 ["ai-tech","startup"]
    tags         JSONB        NOT NULL DEFAULT '[]',   -- 标签数组，如 ["Prompt","翻译","AI工具"]
    profile_url  TEXT         NOT NULL DEFAULT '',     -- Twitter 主页链接
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ========================================
-- 3. 推文表 (tweets)
-- ========================================
CREATE TABLE tweets (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tweet_id     VARCHAR(30)  NOT NULL UNIQUE,         -- Twitter 推文 ID
    kol_username VARCHAR(50)  NOT NULL,                -- 关联 KOL 用户名
    content      TEXT         NOT NULL DEFAULT '',     -- 推文正文
    content_zh   TEXT         NOT NULL DEFAULT '',     -- 中文翻译（英文推文才有）
    language     VARCHAR(10)  NOT NULL DEFAULT 'zh',   -- 原文语言 ('zh' 或 'en')
    translated_at TIMESTAMPTZ,                         -- 翻译时间
    media_urls   JSONB        NOT NULL DEFAULT '[]',   -- 媒体 URL 数组
    likes        INT          NOT NULL DEFAULT 0,      -- 点赞数
    retweets     INT          NOT NULL DEFAULT 0,      -- 转推数
    replies      INT          NOT NULL DEFAULT 0,      -- 回复数
    views        INT          NOT NULL DEFAULT 0,      -- 浏览数
    tweet_time   TIMESTAMPTZ  NOT NULL,                -- 推文发布时间
    tweet_url    TEXT         NOT NULL DEFAULT '',     -- 推文原始链接
    is_retweet   BOOLEAN      NOT NULL DEFAULT FALSE,  -- 是否为转推
    is_reply     BOOLEAN      NOT NULL DEFAULT FALSE,  -- 是否为回复
    is_thread    BOOLEAN      NOT NULL DEFAULT FALSE,  -- 是否为连推（Thread），内容为多段拼接
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tweets_kol
        FOREIGN KEY (kol_username) REFERENCES kols(username)
        ON DELETE CASCADE
);

-- ========================================
-- 索引设计
-- ========================================

-- categories 索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- kols 索引
CREATE INDEX idx_kols_username ON kols(username);
CREATE INDEX idx_kols_categories ON kols USING GIN(categories);
CREATE INDEX idx_kols_tags ON kols USING GIN(tags);
CREATE INDEX idx_kols_followers ON kols(followers DESC);
-- 模糊搜索索引：支持 KOL 名称搜索
CREATE INDEX idx_kols_display_name_trgm ON kols USING GIN(display_name gin_trgm_ops);
CREATE INDEX idx_kols_username_trgm ON kols USING GIN(username gin_trgm_ops);

-- tweets 索引
CREATE INDEX idx_tweets_kol_username ON tweets(kol_username);
CREATE INDEX idx_tweets_tweet_time ON tweets(tweet_time DESC);
CREATE INDEX idx_tweets_kol_time ON tweets(kol_username, tweet_time DESC);
CREATE INDEX idx_tweets_likes ON tweets(likes DESC);
-- 全文搜索索引：支持推文内容搜索
CREATE INDEX idx_tweets_content_trgm ON tweets USING GIN(content gin_trgm_ops);
CREATE INDEX idx_tweets_content_zh_trgm ON tweets USING GIN(content_zh gin_trgm_ops);
CREATE INDEX idx_tweets_language ON tweets(language);

-- ========================================
-- 触发器：自动更新 updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_kols_updated_at
    BEFORE UPDATE ON kols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 辅助函数：刷新类目统计
-- ========================================
CREATE OR REPLACE FUNCTION refresh_category_counts()
RETURNS VOID AS $$
BEGIN
    UPDATE categories c
    SET
        kol_count = (
            SELECT COUNT(*)
            FROM kols k
            WHERE k.categories @> jsonb_build_array(c.slug)
        ),
        tweet_count = (
            SELECT COUNT(*)
            FROM tweets t
            JOIN kols k ON t.kol_username = k.username
            WHERE k.categories @> jsonb_build_array(c.slug)
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
