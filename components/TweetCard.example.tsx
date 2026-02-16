/**
 * TweetCard 组件使用示例
 *
 * 这个文件展示了如何使用 TweetCard 组件
 */

import { TweetCard } from "./TweetCard"

// 示例 1: 纯文本推文
export function TextTweetExample() {
  return (
    <TweetCard
      id="1"
      content="AI is going to change the world. The question is not if, but how fast. We're at the beginning of the most transformational technology shift in history."
      createdAt="2024-02-10T08:30:00Z"
      tweetUrl="https://twitter.com/sama/status/1234567890"
      stats={{
        likes: 15234,
        retweets: 3456,
        replies: 892,
      }}
      author={{
        name: "Sam Altman",
        username: "sama",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      }}
    />
  )
}

// 示例 2: 带单张图片的推文
export function SingleImageTweetExample() {
  return (
    <TweetCard
      id="2"
      content="Excited to share our latest product update! 🚀"
      createdAt="2024-02-15T14:20:00Z"
      tweetUrl="https://twitter.com/figma/status/1234567891"
      media={[
        {
          type: "photo",
          url: "https://pbs.twimg.com/media/example1.jpg",
          altText: "Product screenshot",
        },
      ]}
      stats={{
        likes: 8234,
        retweets: 1456,
        replies: 432,
      }}
      author={{
        name: "Figma",
        username: "figma",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/figma.jpg",
      }}
    />
  )
}

// 示例 3: 带多张图片的推文
export function MultipleImagesTweetExample() {
  return (
    <TweetCard
      id="3"
      content="Here's a thread on the most important lessons I've learned about building startups 🧵👇"
      createdAt="2024-02-14T10:15:00Z"
      tweetUrl="https://twitter.com/paulg/status/1234567892"
      media={[
        {
          type: "photo",
          url: "https://pbs.twimg.com/media/example1.jpg",
          altText: "Lesson 1",
        },
        {
          type: "photo",
          url: "https://pbs.twimg.com/media/example2.jpg",
          altText: "Lesson 2",
        },
        {
          type: "photo",
          url: "https://pbs.twimg.com/media/example3.jpg",
          altText: "Lesson 3",
        },
        {
          type: "photo",
          url: "https://pbs.twimg.com/media/example4.jpg",
          altText: "Lesson 4",
        },
      ]}
      stats={{
        likes: 45678,
        retweets: 12345,
        replies: 3456,
      }}
      author={{
        name: "Paul Graham",
        username: "paulg",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/paulg.jpg",
      }}
    />
  )
}

// 示例 4: 带视频的推文
export function VideoTweetExample() {
  return (
    <TweetCard
      id="4"
      content="Watch this amazing demo of our new AI assistant! 🎥"
      createdAt="2024-02-13T16:45:00Z"
      tweetUrl="https://twitter.com/openai/status/1234567893"
      media={[
        {
          type: "video",
          url: "https://video.twimg.com/ext_tw_video/example.mp4",
          thumbnailUrl: "https://pbs.twimg.com/ext_tw_video_thumb/example.jpg",
          altText: "AI demo video",
        },
      ]}
      stats={{
        likes: 98765,
        retweets: 23456,
        replies: 5678,
      }}
      author={{
        name: "OpenAI",
        username: "openai",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/openai.jpg",
      }}
    />
  )
}

// 示例 5: 推文列表（KOL 详情页）
export function TweetListExample() {
  const tweets = [
    {
      id: "1",
      content: "The future of work is not about AI replacing humans, it's about humans with AI replacing humans without AI.",
      createdAt: "2024-02-15T08:30:00Z",
      tweetUrl: "https://twitter.com/sama/status/1",
      stats: { likes: 15234, retweets: 3456, replies: 892 },
      author: {
        name: "Sam Altman",
        username: "sama",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      },
    },
    {
      id: "2",
      content: "Just shipped a major update to GPT-4. Performance improvements across the board. Thread below 🧵",
      createdAt: "2024-02-14T14:20:00Z",
      tweetUrl: "https://twitter.com/sama/status/2",
      media: [
        {
          type: "photo" as const,
          url: "https://pbs.twimg.com/media/example1.jpg",
          altText: "Update screenshot",
        },
      ],
      stats: { likes: 28456, retweets: 6789, replies: 1234 },
      author: {
        name: "Sam Altman",
        username: "sama",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} {...tweet} />
      ))}
    </div>
  )
}

// 示例 6: 从 API 数据动态渲染
export function DynamicTweetExample() {
  // 模拟从 API 获取的数据
  const apiData = [
    {
      id: "1",
      content: "AI is the future!",
      created_at: "2024-02-15T08:30:00Z",
      tweet_url: "https://twitter.com/sama/status/1234567890",
      media_urls: [
        {
          type: "photo",
          url: "https://pbs.twimg.com/media/example1.jpg",
        },
      ],
      like_count: 15234,
      retweet_count: 3456,
      reply_count: 892,
      author_name: "Sam Altman",
      author_username: "sama",
      author_avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
    },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {apiData.map((tweet) => (
        <TweetCard
          key={tweet.id}
          id={tweet.id}
          content={tweet.content}
          createdAt={tweet.created_at}
          tweetUrl={tweet.tweet_url}
          media={tweet.media_urls}
          stats={{
            likes: tweet.like_count,
            retweets: tweet.retweet_count,
            replies: tweet.reply_count,
          }}
          author={{
            name: tweet.author_name,
            username: tweet.author_username,
            avatar: tweet.author_avatar,
          }}
        />
      ))}
    </div>
  )
}

// 示例 7: 首页最新推文
export function LatestTweetsExample() {
  const latestTweets = [
    {
      id: "1",
      content: "The rate of progress in AI has been extraordinary. What took months a year ago now takes days.",
      createdAt: "2024-02-16T09:00:00Z",
      tweetUrl: "https://twitter.com/sama/status/1",
      stats: { likes: 25678, retweets: 5432, replies: 1234 },
      author: {
        name: "Sam Altman",
        username: "sama",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/sama.jpg",
      },
    },
    {
      id: "2",
      content: "Build something people want. That's the only thing that matters.",
      createdAt: "2024-02-16T08:30:00Z",
      tweetUrl: "https://twitter.com/paulg/status/2",
      stats: { likes: 18234, retweets: 4321, replies: 876 },
      author: {
        name: "Paul Graham",
        username: "paulg",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/paulg.jpg",
      },
    },
    {
      id: "3",
      content: "Design is not just what it looks like. Design is how it works.",
      createdAt: "2024-02-16T07:45:00Z",
      tweetUrl: "https://twitter.com/figma/status/3",
      media: [
        {
          type: "photo" as const,
          url: "https://pbs.twimg.com/media/example.jpg",
          altText: "Design example",
        },
      ],
      stats: { likes: 12345, retweets: 2345, replies: 567 },
      author: {
        name: "Figma",
        username: "figma",
        avatar: "https://pbs.twimg.com/profile_images/1234567890/figma.jpg",
      },
    },
  ]

  return (
    <section className="container mx-auto px-8 py-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">最新推文</h2>
          <p className="text-muted-foreground">
            实时更新，发现最有价值的观点
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {latestTweets.map((tweet, index) => (
            <TweetCard
              key={tweet.id}
              {...tweet}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
