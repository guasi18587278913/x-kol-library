/**
 * 数据清洗工具
 * 将 X MCP 抓取的原始数据转换为数据库 schema 格式
 */

// 类目名称到 slug 的映射
const CATEGORY_SLUG_MAP: Record<string, string> = {
  "AI技术": "ai-tech",
  "创业出海": "startup-global",
  "投资理财": "investment-finance",
  "商业财富": "business-wealth",
  "设计产品": "design-product",
  "内容创作": "content-creation",
  "营销增长": "marketing-growth",
};

// KOL 清单中的条目格式
export interface KolListEntry {
  username: string;
  displayName: string;
  categories: string[];
  priority: string;
  notes: string;
}

// 清洗后的 KOL 数据（对齐数据库 schema）
export interface CleanedKol {
  twitter_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  followers: number;
  following: number;
  tweet_total: number;
  categories: string[]; // slug 数组
  tags: string[];
  profile_url: string;
}

// 清洗后的推文数据
export interface CleanedTweet {
  tweet_id: string;
  kol_username: string;
  content: string;
  media_urls: string[];
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  tweet_time: string;
  tweet_url: string;
  is_retweet: boolean;
  is_reply: boolean;
}

/**
 * 将类目中文名数组转换为 slug 数组
 */
export function categoriesToSlugs(categories: string[]): string[] {
  return categories
    .map((cat) => CATEGORY_SLUG_MAP[cat])
    .filter((slug): slug is string => slug !== undefined);
}

/**
 * 从 notes 字段提取标签
 * 取逗号/斜线分隔的前几个关键词作为标签
 */
export function extractTags(notes: string): string[] {
  const parts = notes.split(/[，,、/]/);
  const tags = parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length <= 20)
    .slice(0, 5);

  // 如果没有可用标签但 notes 不为空，截取前 20 字符作为标签
  if (tags.length === 0 && notes.trim().length > 0) {
    return [notes.trim().slice(0, 20)];
  }

  return tags;
}

/**
 * 安全解析数字，返回 0 如果无法解析
 */
export function safeParseInt(value: unknown): number {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string") {
    const cleaned = value.replace(/[,\s]/g, "");
    // 处理 "1.2K", "3.5M" 等缩写
    const match = cleaned.match(/^([\d.]+)([KkMmBb]?)$/);
    if (match) {
      const num = parseFloat(match[1]);
      const suffix = match[2].toUpperCase();
      if (suffix === "K") return Math.floor(num * 1000);
      if (suffix === "M") return Math.floor(num * 1000000);
      if (suffix === "B") return Math.floor(num * 1000000000);
      return Math.floor(num);
    }
  }
  return 0;
}

/**
 * 清洗 scrape_profile 返回的原始 KOL 数据
 */
export function cleanProfileData(
  raw: Record<string, unknown>,
  kolEntry: KolListEntry
): CleanedKol {
  const username = kolEntry.username;
  const bio = typeof raw.bio === "string" ? raw.bio.trim() : "";
  const avatarUrl =
    typeof raw.avatar === "string" || typeof raw.profileImageUrl === "string"
      ? String(raw.avatar || raw.profileImageUrl || "")
      : "";

  return {
    twitter_id: String(raw.id || raw.userId || raw.twitter_id || ""),
    username,
    display_name:
      typeof raw.name === "string" ? raw.name : kolEntry.displayName,
    bio,
    avatar_url: avatarUrl,
    followers: safeParseInt(raw.followers || raw.followersCount),
    following: safeParseInt(raw.following || raw.followingCount),
    tweet_total: safeParseInt(raw.tweets || raw.tweetsCount || raw.statusesCount),
    categories: categoriesToSlugs(kolEntry.categories),
    tags: extractTags(kolEntry.notes),
    profile_url: `https://x.com/${username}`,
  };
}

/**
 * 从推文 URL 中提取推文 ID
 */
function extractTweetId(url: string): string {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : "";
}

/**
 * 清洗 scrape_timeline 返回的单条推文数据
 */
export function cleanTweetData(
  raw: Record<string, unknown>,
  kolUsername: string
): CleanedTweet | null {
  const tweetUrl = String(raw.url || raw.tweetUrl || raw.link || "");
  const tweetId =
    String(raw.id || raw.tweetId || "") || extractTweetId(tweetUrl);

  if (!tweetId) return null;

  const content = String(raw.text || raw.content || raw.fullText || "").trim();
  if (!content) return null;

  // 解析媒体 URL
  let mediaUrls: string[] = [];
  if (Array.isArray(raw.media)) {
    mediaUrls = raw.media
      .map((m: unknown) => {
        if (typeof m === "string") return m;
        if (typeof m === "object" && m !== null && "url" in m)
          return String((m as Record<string, unknown>).url);
        return "";
      })
      .filter((u: string) => u.length > 0);
  }

  // 判断是否是转推
  const isRetweet =
    raw.isRetweet === true ||
    content.startsWith("RT @") ||
    (typeof raw.retweetedStatus === "object" && raw.retweetedStatus !== null);

  // 判断是否是回复
  const isReply =
    raw.isReply === true ||
    (typeof raw.inReplyToStatusId === "string" &&
      raw.inReplyToStatusId.length > 0);

  // 解析时间
  let tweetTime = String(raw.time || raw.timestamp || raw.createdAt || "");
  if (!tweetTime) {
    tweetTime = new Date().toISOString();
  }

  return {
    tweet_id: tweetId,
    kol_username: kolUsername,
    content,
    media_urls: mediaUrls,
    likes: safeParseInt(raw.likes || raw.likeCount || raw.favoriteCount),
    retweets: safeParseInt(raw.retweets || raw.retweetCount),
    replies: safeParseInt(raw.replies || raw.replyCount),
    views: safeParseInt(raw.views || raw.viewCount || raw.impressions),
    tweet_time: tweetTime,
    tweet_url: tweetUrl || `https://x.com/${kolUsername}/status/${tweetId}`,
    is_retweet: isRetweet,
    is_reply: isReply,
  };
}

/**
 * 清洗多条推文数据
 */
export function cleanTweetsData(
  rawPosts: unknown[],
  kolUsername: string
): CleanedTweet[] {
  return rawPosts
    .map((post) => cleanTweetData(post as Record<string, unknown>, kolUsername))
    .filter((tweet): tweet is CleanedTweet => tweet !== null);
}
