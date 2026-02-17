export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  kol_count: number;
  tweet_count: number;
  created_at: string;
  updated_at: string;
}

export interface KOL {
  id: string;
  twitter_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  followers: number;
  following: number;
  tweet_total: number;
  categories: string[];
  tags: string[];
  profile_url: string;
  created_at: string;
  updated_at: string;
}

export interface Tweet {
  id: string;
  tweet_id: string;
  kol_username: string;
  content: string;
  content_zh: string;
  language: string;
  translated_at: string | null;
  media_urls: string[];
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  tweet_time: string;
  tweet_url: string;
  is_retweet: boolean;
  is_reply: boolean;
  created_at: string;
}
