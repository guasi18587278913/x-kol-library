/**
 * 处理已抓取的 MCP 数据，合并到最终输出文件
 * 将所有通过 scrape_profile 获取的真实数据与基线数据合并
 */

import * as fs from "fs";
import * as path from "path";
import { type KolListEntry, categoriesToSlugs, extractTags } from "./utils/data-cleaner";
import type { CleanedKol, CleanedTweet } from "./utils/data-cleaner";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");

// 从 MCP scrape_profile 结果中提取的原始数据
// 格式: { kolListUsername: scrapedProfileData }
interface ScrapedProfile {
  username: string; // display name from MCP (e.g. "宝玉")
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
  latestPosts: Array<{
    content: string;
    likes: number;
    retweets: number;
  }>;
}

// 所有通过 MCP 工具抓取到的真实数据
const SCRAPED_PROFILES: Record<string, ScrapedProfile> = {
  "dotey": {
    username: "宝玉", displayName: "宝玉",
    bio: "Prompt Engineer, dedicated to learning and disseminating knowledge about AI, software engineering, and engineering management.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "在 OpenAI 收购 OpenClaw 之际，重温一下 ClawdBot 最初的灵魂 SOUL.md - 你不仅是一个聊天机器人，你正在成为\"人\"！极具主观能动性、值得信赖且拥有独立思...", likes: 112, retweets: 23 },
      { content: "我一直借助 AI 写作的，这不是什么秘密，我也不以此为耻，毕竟所有内容都是我要表达的也是我把关的。", likes: 156, retweets: 29 },
      { content: "AI 提交 PR 和 AI 写文章让人讨厌的一个根本原因是因为在把验证的成本转嫁给他人。", likes: 13, retweets: 0 },
    ]
  },
  "vista8": {
    username: "向阳乔木", displayName: "向阳乔木",
    bio: "喜欢摇滚乐、爱钓鱼的PM\n网站：https://qiaomu.ai",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "翻看龙虾作者的博客，去年八月分享过他的 AI 开发工作流", likes: 150, retweets: 19 },
      { content: "OpenClaw 作者加入OpenAI了。世界变化真的有点快，几个月时间，一个Agentic Coding项目席卷全球。", likes: 103, retweets: 3 },
      { content: "CEO们在财报会上张嘴闭嘴都是AI，但56%的公司承认没看到明显收益。", likes: 18, retweets: 1 },
    ]
  },
  "AndrewYNg": {
    username: "Andrew Ng", displayName: "Andrew Ng",
    bio: "Co-Founder of Coursera; Stanford CS adjunct faculty. Former head of Baidu AI Group/Google Brain. #ai #machinelearning, #deeplearning #MOOCs",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "To all my AI friends: Every time I see you, you raise my temperature parameter.", likes: 1800, retweets: 103 },
      { content: "Job seekers in the U.S. and many other nations face a tough environment.", likes: 2800, retweets: 657 },
      { content: "As amazing as LLMs are, improving their knowledge today involves a more piecemeal process than is widely appreciated.", likes: 1900, retweets: 414 },
    ]
  },
  "karpathy": {
    username: "Andrej Karpathy", displayName: "Andrej Karpathy",
    bio: "I like to train large deep neural nets. Previously Director of AI @ Tesla, founding team @ OpenAI, PhD @ Stanford.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "The hottest new programming language is English", likes: 57000, retweets: 8900 },
      { content: "A few random notes from claude coding quite a bit last few weeks.", likes: 39000, retweets: 6700 },
    ]
  },
  "sama": {
    username: "Sam Altman", displayName: "Sam Altman",
    bio: "AI is cool i guess",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Codex weekly users have more than tripled since the beginning of the year!", likes: 4800, retweets: 266 },
      { content: "Peter Steinberger is joining OpenAI to drive the next generation of personal agents.", likes: 36000, retweets: 7400 },
    ]
  },
  "xicilion": {
    username: "响马", displayName: "响马",
    bio: "。。。。。。",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "以 AI 写作为耻的人，大概的心理是想骗别人说文章是自己手写的但又担心被人看出来吧。", likes: 16, retweets: 3 },
      { content: "我以前说，自动化测试用例的价值，占软件代码价值的 50%+，现在增加了，一套测试用例的价值，占软件代码价值的 80%。", likes: 75, retweets: 7 },
    ]
  },
  "op7418": {
    username: "歸藏(guizang.ai)", displayName: "歸藏(guizang.ai)",
    bio: "关注人工智能、LLM 、 AI 图像视频和设计（Interested in AI, LLM, Stable Diffusion, and design）\n\n歸藏的 AIGC 周刊｜公众号：歸藏的AI工具箱",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Trickle团队的新作 happycapy 有点牛皮啊！这是一个在浏览器上运行的原生 Agent 主机。", likes: 160, retweets: 27 },
      { content: "Deepseek 模型更新了！新模型的知识截止日期为 25 年 5 月，上下文长度来到了 100 万", likes: 108, retweets: 11 },
    ]
  },
  "levelsio": {
    username: "levelsio", displayName: "@levelsio",
    bio: "euacc.com @euacc PhotoAI.com $110k/m InteriorAI.com $40K/m RemoteOK.com $39K/m Nomads.com $17K/m levelsio.com $17K/m",
    followers: 822700, following: 2731, verified: true,
    latestPosts: [
      { content: "I've always wondered why there's so many Vietnamese indie hacker and startup success stories", likes: 1000, retweets: 174 },
      { content: "Netherlands 36% unrealized gain tax", likes: 56000, retweets: 4800 },
    ]
  },
  "arvidkahl": {
    username: "Arvid Kahl", displayName: "Arvid Kahl",
    bio: "Building podscan.fm and ideas.podscan.fm in Public. Raising all the boats with kindness.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Podscan tracks every single podcast out there. And 2025 is shaping up to be the second-largest year...", likes: 114, retweets: 3 },
    ]
  },
  "easychen": {
    username: "EasyChen", displayName: "EasyChen",
    bio: "方糖气球（ftqq.com）博主，80后大叔，萌物控。做原型、敲代码、写吐槽小说、制四格漫画。无业，玩独立开发，偶尔卖课为生。",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "你永远猜不到 Vibe Coding 会怎么改变我的生活习惯", likes: 2, retweets: 0 },
    ]
  },
  "tinyfool": {
    username: "Tinyfool", displayName: "Tinyfool",
    bio: "Youtuber\n20年老程序员，业已退休，不以写代码为主业。不是英语老师，但开发了\"英语轻松读\"，做了广受好评的学习英语的视频。",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "我叫Tinyfool，是个Youtuber，20年的老程序员，不是英语老师，\"英语轻松读\"App开发者", likes: 423, retweets: 75 },
    ]
  },
  "kiwicopple": {
    username: "Paul Copplestone", displayName: "Paul Copplestone - e/postgres",
    bio: "ceo @supabase | YC S20",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "at @supabase we're building: a new storage engine for Postgres, an open source sharding engine...", likes: 983, retweets: 59 },
      { content: "Postgres 18 contributor, ranked by commits", likes: 219, retweets: 12 },
    ]
  },
  "gefei55": {
    username: "哥飞", displayName: "哥飞",
    bio: "哥飞，出海鼓励师，SEO爱好者，Adsense玩家，出海AI工具方向创业者。同名公众号写了五百多篇出海搞流量免费教程文章。",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "哥飞公众号写了225篇教程了，其中220篇都是公开免费可看全文的。", likes: 864, retweets: 157 },
    ]
  },
  "lyc_zh": {
    username: "YC (Yucheng Liu)", displayName: "YC (Yucheng Liu)",
    bio: "AI/一人公司出海 via @chuhaiqu Founder\n打造数字员工 @LuciusAI_HQ Co-founder\nX BoostClub 400 万推特社区 Founder",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "OpenClaw 创始人 Peter Steinberger 宣布加入 OpenAI。", likes: 111, retweets: 15 },
    ]
  },
  "unusual_whales": {
    username: "unusual_whales", displayName: "unusual_whales",
    bio: "Stocks/Options/Crypto/Market News/Tools. Not advice. @Polymarket partner",
    followers: 3200000, following: 2379, verified: true,
    latestPosts: [
      { content: "JUST IN: The Pentagon is considering severing its relationship with Anthropic over the AI firm's ins...", likes: 8000, retweets: 614 },
    ]
  },
  "VitalikButerin": {
    username: "vitalik.eth", displayName: "vitalik.eth",
    bio: "I choose balance. First-level balance.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Two years ago, I wrote this post on the possible areas that I see for ethereum + AI intersections", likes: 3300, retweets: 920 },
      { content: "I am capitulating, I will call Twitter \"X\" from now on.", likes: 3400, retweets: 371 },
    ]
  },
  "naval": {
    username: "Naval", displayName: "Naval",
    bio: "Incompressible",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "How to Get Rich (without getting lucky):", likes: 271000, retweets: 91000 },
      { content: "AI is the great automator, and to automate, it must first imitate.", likes: 8400, retweets: 735 },
      { content: "People who don't organize into tribes get wiped out by people who do.", likes: 54000, retweets: 8000 },
    ]
  },
  "ShaanVP": {
    username: "Shaan Puri", displayName: "Shaan Puri",
    bio: "I'm an idea dealer",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "A few semi-controversial things I believe", likes: 6600, retweets: 1300 },
    ]
  },
  "george__mack": {
    username: "George Mack", displayName: "George Mack",
    bio: "I think agency might be the most important personality trait of the 21st century. Read my essay 'High Agency' at highagency.com",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "After 7 months of writing, I finished my essay! I think agency might be the most important idea of...", likes: 3300, retweets: 739 },
    ]
  },
  "hnshah": {
    username: "Hiten Shah", displayName: "Hiten Shah",
    bio: "Founder & CEO building SaaS for 20+ yrs. Sharing what endures in business, growth & people. Built Crazy Egg (2005), KISSmetrics (2008) & Nira (2020). DMs open.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Most people have no idea what it actually takes to be a founder.", likes: 2200, retweets: 451 },
    ]
  },
  "noahkagan": {
    username: "Noah Kagan", displayName: "Noah Kagan",
    bio: "Chief Sumo at @appsumo. #30 at Facebook. Helping entrepreneurs noahkagan.com",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Noah's giving away a Mac Mini and letting me pick the winner. Like or comment to enter.", likes: 3700, retweets: 81 },
    ]
  },
  "andrewchen": {
    username: "andrew chen", displayName: "andrew chen",
    bio: "a16z speedrun",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "SF is back. Charts of the Week", likes: 1300, retweets: 170 },
      { content: "Jobs where you tell AI what to do. Jobs where AI tells you what to do.", likes: 298, retweets: 32 },
    ]
  },
  "reidhoffman": {
    username: "Reid Hoffman", displayName: "Reid Hoffman",
    bio: "Co-Founder, LinkedIn. Investor. MSFT Board Member. Building an LLM to discover cures for cancer: @manas_co. Most importantly: Proud American.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "tobi": {
    username: "tobi lutke", displayName: "tobi lutke",
    bio: "Shopify CEO by day, Dad in evening, hacker at night, Aspiring comprehensivist.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Europeans who are dismayed about the prospects of their continent should take solace in the success...", likes: 5300, retweets: 482 },
    ]
  },
  "mrsharma": {
    username: "Nik Sharma", displayName: "Nik Sharma",
    bio: "\"The DTC Guy\" | Sold @SharmaBrands | Creator @workweekinc | Get smarter with my free weekly DTC newsletter (100k+ readers)",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Introducing Fin: The world's first AI Chief Financial Officer.", likes: 3000, retweets: 938 },
    ]
  },
  "morganhousel": {
    username: "Morgan Housel", displayName: "Morgan Housel",
    bio: "Author of a few books, @collabfund, director at Markel Group. Nice to see you.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "We think a lot about those black lines, forgetting that it's all still in our hands.", likes: 57000, retweets: 14000 },
    ]
  },
  "100trillionUSD": { // PlanB's actual handle
    username: "PlanB", displayName: "PlanB",
    bio: "All models are wrong, some are useful. All my tweets are my opinion. DYOR!",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "APompliano": {
    username: "Anthony Pompliano", displayName: "Anthony Pompliano",
    bio: "Entrepreneur, investor, and lifelong learner. Daily writing: pompletter.com",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "balajis": {
    username: "Balaji", displayName: "Balaji",
    bio: "Author of the Network State. Founder of the Network School.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "cdixon": {
    username: "Chris Dixon", displayName: "Chris Dixon",
    bio: "Programming, philosophy, history, internet, startups, crypto. Managing Partner @a16zcrypto.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "WillyWoo": {
    username: "Willy Woo", displayName: "Willy Woo",
    bio: "I do numbers, mainly #Bitcoin related. I only post here, all other channels including Telegram are scams.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "RaoulGMI": {
    username: "Raoul Pal", displayName: "Raoul Pal",
    bio: "Founder/CEO Global Macro Investor, @RealVision. Figuring things out at the nexus of Macro, Web3 & the Exponential Age.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "lukew": {
    username: "Luke Wroblewski", displayName: "Luke Wroblewski",
    bio: "Humanizing tech. MD: Sutter Hill Ventures Founder: Polar (Google acquired) Bagcheck (Twitter acquired) Wrote: Mobile First, Web Form Design",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "joulee": {
    username: "Julie Zhuo", displayName: "Julie Zhuo",
    bio: "Founder @teamSundial. Angel investor. Author of \"The Making of a Manager\". Obsessed with systems. Design + data person.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "jnd1er": {
    username: "Don Norman", displayName: "Don Norman",
    bio: "Design thinker, company advisor, professor, columnist, author. Latest book: Design of Everyday Things, Revised and Expanded.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "scottbelsky": {
    username: "scott belsky", displayName: "scott belsky",
    bio: "helping the creative world make ideas happen. partner @a24 / founder A24Labs; founder @Behance, bod @atlassian & MoMA",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "jasonfried": {
    username: "Jason Fried", displayName: "Jason Fried",
    bio: "Started & runs 37signals (makers of Basecamp, HEY, and ONCE). Non-serial entrepreneur, serial author.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "lennysan": {
    username: "Lenny Rachitsky", displayName: "Lenny Rachitsky",
    bio: "Deeply researched product, growth, and career advice",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "rrhoover": {
    username: "Ryan Hoover", displayName: "Ryan Hoover",
    bio: "Founder of @ProductHunt. Investor at @WeekendFund.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "brad_frost": {
    username: "Brad Frost", displayName: "Brad Frost",
    bio: "I'm sad to have to leave. You can find and follow me elsewhere: bradfrost.com/blog/post/goodbye-twitter/",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "MrAlanCooper": {
    username: "Alan Cooper", displayName: "Alan Cooper",
    bio: "Trying to be a Good Ancestor. Founder of @Cooper, 'Father of Visual Basic,' inventor of design personas, blowhard curmudgeon",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "jmspool": {
    username: "Jared Spool", displayName: "Jared Spool",
    bio: "Platform vacated. Look for me on LinkedIn",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "waitbutwhy": {
    username: "Tim Urban", displayName: "Tim Urban",
    bio: "Writer, infant",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "CoderJeffLee": {
    username: "子木聊 AI 出海", displayName: "子木聊 AI 出海",
    bio: "AI 增长黑客，前全干码农。我是子木，在这里聊聊 AI 和出海增长相关。",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "chuhaiqu": {
    username: "出海去孵化器", displayName: "出海去孵化器",
    bio: "#出海去 帮助一人企业做好出海增长。赋能独立创客、一人公司和小微团队的新型社区孵化器。",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "很多新朋友问，出海去到底是做什么的。简单来说，出海去是孵化「一人公司」，助力全球增长的新型社区孵化器。", likes: 4, retweets: 1 },
    ]
  },
  "rotor187": {
    username: "炮爷Hack", displayName: "炮爷Hack",
    bio: "前程序员，妻宝男，创业5年，All in AI搞钱中。目标是带领1000+普通人搞到主业之外的第一个100w。付费用户1.5w+。",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "AI 让知识的成本归零，让创造的门槛归零。2026 年，是普通人最好的时代。", likes: 8, retweets: 3 },
    ]
  },
  "dharmesh": {
    username: "dharmesh", displayName: "dharmesh",
    bio: "Co-founder/CTO, HubSpot ($HUBS). Mission: Help millions grow better. Publish simple.ai newsletter (2M+ subscribers). Builder: agent.ai",
    followers: 337600, following: 768, verified: true,
    latestPosts: [
      { content: "2023 was the year of chat UX powered by generative AI.", likes: 2100, retweets: 232 },
    ]
  },
  "SahilBloom": {
    username: "Sahil Bloom", displayName: "Sahil Bloom",
    bio: "NYT Bestselling Author of The 5 Types of Wealth. Founder of Wild Roman.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "The opportunity to onboard \"normal people\" to the latest AI is much bigger than I originally thought.", likes: 1300, retweets: 105 },
    ]
  },
  "skirano": {
    username: "Pietro Schirano", displayName: "Pietro Schirano",
    bio: "CEO at @magicpathai. Previously, @AnthropicAI, @brexHQ. @Uber, @Facebook. Creator of Claude Engineer, DesignerGPT, Sequential thinking MCP and more",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Kimi K2.5 is a really good model, especially for agentic tasks and writing.", likes: 1000, retweets: 54 },
    ]
  },
  "danshipper": {
    username: "Dan Shipper", displayName: "Dan Shipper",
    bio: "ceo @every — the only subscription you need to stay at the edge of AI",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "NEW: i wrote a complete technical guide to building agent-native software", likes: 2000, retweets: 214 },
    ]
  },
  "Yangyixxxx": {
    username: "Yangyi", displayName: "Yangyi",
    bio: "Believing is seeing. Reverb Marketing Evangelist",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "抖音搞个精品漫剧发钱，字节做个即梦seedance", likes: 104, retweets: 10 },
    ]
  },
  "PatFlynn": {
    username: "Pat Flynn", displayName: "Pat Flynn",
    bio: "Father, husband, entrepreneur, Pokemon YouTuber @DeepPocketMnstr",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "Happy \"Let Go Day\"! I celebrate this date, June 17th, every single year.", likes: 165, retweets: 10 },
    ]
  },
  // === Batch 2: newly scraped profiles ===
  "berryxia": {
    username: "Berryxia.AI", displayName: "Berryxia.AI",
    bio: "Building AI tools AI System Prompt   Love Design & Coding & Share Prompt！ :Andyhuo@me.com",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "2026 X创作者最新从认证身份到绑定不同银行卡以及填写税收编码等细枝末节的地方全部让总一次性给你讲清楚了！", likes: 9, retweets: 1 },
      { content: "兄弟们！前阵子前端已死！中转站已死！这下导游已死？", likes: 15, retweets: 2 },
    ]
  },
  "gaborcselle": {
    username: "Gabor Cselle", displayName: "Gabor Cselle",
    bio: "My real feed is at https://twitter.com/gabor",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "AmandaAskell": {
    username: "Amanda Askell", displayName: "Amanda Askell",
    bio: "Philosopher & ethicist trying to make AI be good @AnthropicAI. Personal account. All opinions come from my training data.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "I'm too right wing for the left and I'm too left wing for the right.", likes: 4400, retweets: 332 },
      { content: "I genuinely will try to say \"like\" less in public appearances since many people find it annoying.", likes: 524, retweets: 10 },
    ]
  },
  "alexalbert__": {
    username: "Alex Albert", displayName: "Alex Albert",
    bio: "Claude Relations @AnthropicAI. Opinions are my own!",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "The signs of change are becoming more and more obvious. Knowledge work at the end of 2026 is going to look very different.", likes: 969, retweets: 58 },
      { content: "I attended a YC event in summer 2024 and the room was polled on who uses Claude. About 10% of hands went up.", likes: 554, retweets: 21 },
    ]
  },
  "WaytoAGI": {
    username: "WaytoAGI｜通往AGI之路", displayName: "WaytoAGI｜通往AGI之路",
    bio: "Empowering more people through AI｜联结上百万人的 AI 开源社区｜WaytoAGI.com 实现通用人工智能（AGI）也许有很长的路要走，我们的目标是让每个人的学习过程少走弯路，让更多的人因 AI 而强大。",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "11月30日，WaytoAGI将联合秒哒在全国30+城市及泰国清迈同步举办第19期AI切磋大会", likes: 9, retweets: 2 },
    ]
  },
  "rohanpaul_ai": {
    username: "Rohan Paul", displayName: "Rohan Paul",
    bio: "Compiling in real-time, the race towards AGI. The Largest Show on X for AI. Get my daily AI analysis newsletter to your email https://rohan-paul.com",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "wow. just saw The Economic Times newspaper published an article about me", likes: 1000, retweets: 70 },
      { content: "It has started.. GPT-5.2 landed a new theoretical physics result.", likes: 117, retweets: 19 },
    ]
  },
  "jerryjliu0": {
    username: "Jerry Liu", displayName: "Jerry Liu",
    bio: "document OCR + workflows @llama_index. cofounder/CEO. Careers: https://llamaindex.ai/careers",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "We love parsing diagrams. Anthropic's recent report on coding trends has a nice diagram on the evolution of agentic coding.", likes: 277, retweets: 27 },
    ]
  },
  "hwchase17": {
    username: "Harrison Chase", displayName: "Harrison Chase",
    bio: "@LangChain, previously @robusthq @kensho. MLOps ∪ Generative AI ∪ sports analytics",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Ciana Parrot - Self-hosted AI assistant with multi-channel support, scheduled tasks, and extensible skills.", likes: 68, retweets: 12 },
    ]
  },
  "_philschmid": {
    username: "Philipp Schmid", displayName: "Philipp Schmid",
    bio: "AI Developer Experience @GoogleDeepMind | prev: Tech Lead at @huggingface, AWS ML Hero. Sharing my own views and AI News https://philschmid.de",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Excited to introduce the Gemini Interactions API, a unified interface for Gemini models and agents.", likes: 418, retweets: 49 },
    ]
  },
  "servasyy_ai": {
    username: "huangserva", displayName: "huangserva",
    bio: "古早程序员 | AI出海 | 自由职业 机车游侠&机速购&骑享租创始人 15年前 freelance 起步 → 连续创业者 → 亏过1个亿，逆风翻盘中 分享创业，AI，读书，生活，健身",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "很多人都还不知道OpenClaw能如何赚钱？用 OpenClaw 赚到钱的人，都在解决「无聊且昂贵」的问题。", likes: 38, retweets: 3 },
      { content: "GLM-5 vs Kimi K2.5 对比 两个来自中国的开源模型，前后脚发布", likes: 55, retweets: 13 },
    ]
  },
  "EMostaque": {
    username: "Emad", displayName: "Emad",
    bio: "Open Sovereign AI @ii_posts. Founder @StabilityAI. Consistent inference is possible.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "nickfloats": {
    username: "Nick St. Pierre", displayName: "Nick St. Pierre",
    bio: "Unofficial Midjourney shill. Playing with AI & sharing learnings.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "jesselaunz": {
    username: "Jesse Lau 遁一子", displayName: "Jesse Lau 遁一子",
    bio: "遁一子，a true man, free guy。油管：AIGC洞见无界播客 |在千年古籍中修心，于经典绝唱里见性。",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "lewangx": {
    username: "LE", displayName: "LE",
    bio: "Creating AI toys @FoloToy",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "PandaTalk8": {
    username: "Mr Panda", displayName: "Mr Panda",
    bio: "公众号：PandaTalk8",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "imwsl90": {
    username: "卫斯理", displayName: "卫斯理",
    bio: "程序员/产品经理/销售/中年已婚带2娃 - 互联网、编程、AI、情感、历史、八卦",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "dagorenouf": {
    username: "Dagobert", displayName: "Dagobert - Corporate sellout",
    bio: "Was a broke indie hacker for 7 years. Now making bank selling SOC2 compliance for @compai.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "jakobgreenfeld": {
    username: "Jakob Greenfeld", displayName: "Jakob Greenfeld",
    bio: "Co-Founder Sales.co (Let AI generate leads for your B2B business.) Author UnfuckYourSales.com",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "ikennylin": {
    username: "Kenny做产品", displayName: "Kenny做产品",
    bio: "古典PM+自学独立开发，做了几个App 坚持做小而美的产品 真好算｜DayMark｜MarkTodo｜OneMood｜NoMore｜TinyPick",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "panphora": {
    username: "panphora", displayName: "panphora",
    bio: "Web app in a single, portable, self-updating, vanilla HTML file: https://hyperclay.com",
    followers: 4028, following: 3616, verified: true,
    latestPosts: []
  },
  "PierreDeWulf": {
    username: "Pierre de Wulf", displayName: "Pierre de Wulf",
    bio: "Bootstrapped @ScrapingBee to $5m ARR+ with a team of 6. Exited for 8 figures. Sharing my learnings about growth, SEO & tech.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Today I'm incredibly proud and happy to announce the ScrapingBee has been acquired by Oxylabs' group.", likes: 552, retweets: 23 },
    ]
  },
  "nateleex": {
    username: "李自然 Nate Lee", displayName: "李自然 Nate Lee",
    bio: "我也绝非等闲之辈！",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "有次我和一个投资人，一个创业者聊天，他们说了几个很厉害的产品，我听都没听过", likes: 47, retweets: 3 },
    ]
  },
  "tonyzhu1984": {
    username: "Tony Zhu", displayName: "Tony Zhu",
    bio: "builder",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "Midjourney version 6 was released two hours ago, and it's incredible.", likes: 7700, retweets: 1300 },
    ]
  },
  "dev_afei": {
    username: "阿飞", displayName: "阿飞",
    bio: "前端工程师 & 出海探索者 英推增长 - https://Tweeteasy.io 分享我的 SaaS 产品出海之旅",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "查了一些资料，Stipe Atlas 注册的 LLC 公司主要需要报以下三个税", likes: 44, retweets: 4 },
      { content: "用 stripe atlas 注册公司整体体验感还是相当不错", likes: 68, retweets: 7 },
    ]
  },
  "ginhoor": {
    username: "Ginhoor", displayName: "Ginhoor",
    bio: "独立App开发者｜关注出海业务",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "独立开发出海是条正确的路，4月终于是摸到了MRR 2.5K的边边。", likes: 224, retweets: 18 },
    ]
  },
  "kasong2048": {
    username: "卡颂", displayName: "卡颂",
    bio: "裸辞前是前端｜自由职业4年 《React设计原理》作者",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "为啥大家这么热衷各种 AI新技术（比如 openClaw、Skills...）", likes: 4, retweets: 0 },
    ]
  },
  "louispereira": {
    username: "Louis Pereira", displayName: "Louis Pereira",
    bio: "Building assets on the internet. Currently crafting https://AudioPen.ai",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "My goal in life is to make things I'm proud to share. Always a WIP...", likes: 133, retweets: 4 },
    ]
  },
  "hzlzh": {
    username: "自力6XStudio", displayName: "自力6XStudio",
    bio: "6X Studio 创始人 | @fyfyFM 枫言枫语播客主播 | 前腾讯微信设计师 App：@LockLauncherApp、@MenubarX、2Camera、@AppChatX、StickerX等",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "新作品 2Camera 发布啦！双重拍摄相机，捕捉双重视角，记录双倍精彩。", likes: 150, retweets: 29 },
    ]
  },
  "seclink": {
    username: "Y11", displayName: "Y11",
    bio: "找工作、找面试题、改简历、模拟面试。关注：创业（冷启动） ｜ 认知心理学｜智能体 ｜ 强化学习 building：https://jobleap.cn",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "这个项目好像有意思？它把大模型预训练的知识都写成skills了", likes: 1000, retweets: 199 },
    ]
  },
  "imtigerchew": {
    username: "Tiger.Chew", displayName: "Tiger.Chew",
    bio: "曾在腾讯、阿里撸码，交过3000万+学费的创业者，but 现在不创业了，是个纯生意人。",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "rosiesherry": {
    username: "Rosie Sherry", displayName: "Rosie Sherry",
    bio: "Follow me elsewhere, anywhere but here.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "Insharamin": {
    username: "Insha", displayName: "Insha",
    bio: "Vibing on 3C's: Content, Community, Collaboration.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "a16z + YC shared their startup ideas for 2026", likes: 1300, retweets: 164 },
    ]
  },
  "NotechAna": {
    username: "Ana Bibikova", displayName: "Ana Bibikova",
    bio: "Simple humble Marketing Mastermind | Growing B2B SaaS and two trouble makers | Head of Marketing at @zenphi_co | ex eCommerce",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Being consistent doesn't mean not taking a day-off. Actually, taking days-off is the only way to stay consistent.", likes: 131, retweets: 25 },
    ]
  },
  "decohack": {
    username: "viggo", displayName: "viggo",
    bio: "IndieHacker / Designer / Photographer / Ex.Tencent / Newsletter: decohack.com / darkosicon.com / Building aimaker.dev",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "一天时间用 ClaudeCode 给项目做了订阅，内购积分，新用户赠送积分等功能", likes: 17, retweets: 0 },
    ]
  },
  "jimcramer": {
    username: "Jim Cramer", displayName: "Jim Cramer",
    bio: "Host of @madmoneyoncnbc and I run the CNBC Investing Club.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Those Vertiv orders were incredible..Great for Club Names Corning, Eaton, GEV. Still buyable!!", likes: 307, retweets: 19 },
    ]
  },
  "StockMKTNewz": {
    username: "Evan", displayName: "Evan",
    bio: "Free Stock Market News that is FAST, ACCURATE, CONSISTENT, and RELIABLE | Not Just Stock News",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Here are Vanguard's top 15 ETFs ranked by 5-year average annual return", likes: 128, retweets: 10 },
    ]
  },
  "PeterLBrandt": {
    username: "Peter Brandt", displayName: "Peter Brandt",
    bio: "Futures mkt trader since 1975. Shokunin. Author. Market Wizard. Price & chart scientist. Membership peterlbrandt.com",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Unless and until NQ can consolidate above 26,800 there is a distinct possibility (50% Bayesian view)...", likes: 394, retweets: 34 },
    ]
  },
  "LizAnnSonders": {
    username: "Liz Ann Sonders", displayName: "Liz Ann Sonders",
    bio: "Chief Investment Strategist, Schwab Center for Financial Research.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "January CPI inflation +2.4% vs. +2.5% est. & +2.7% prior; core +2.5% vs. +2.5% est. & +2.6% prior", likes: 100, retweets: 37 },
    ]
  },
  "PlanB": {
    username: "PlanB", displayName: "PlanB",
    bio: "All models are wrong, some are useful. All my tweets are my opinion. DYOR!",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "The 'unrealized capital gains' tax is a progressive favorite. It's just straight-up wealth confiscation.", likes: 10000, retweets: 1300 },
    ]
  },
  "BTCdayu": {
    username: "大宇", displayName: "大宇",
    bio: "币圈宝典 dayu.xyz",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "币圈必备网址及神级工具（极简版），大家记得收藏转发。", likes: 3400, retweets: 2500 },
    ]
  },
  "kevinrose": {
    username: "Kevin Rose", displayName: "Kevin Rose",
    bio: "Partner @trueventures | Chairman @digg | Podcasts: Random Show w/ @tferriss, Diggnation rebooted. Ex: @google",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Going live in a minute to talk all things AI coding", likes: 47, retweets: 7 },
    ]
  },
  "beeple": {
    username: "beeple", displayName: "beeple",
    bio: "design shit. 18+ years of everydays*",
    followers: 835800, following: 987, verified: true,
    latestPosts: [
      { content: "missing u", likes: 5000, retweets: 770 },
    ]
  },
  "farokh": {
    username: "Farokh", displayName: "Farokh",
    bio: "President & Co-Founder of DASTAN: @MyriadMarkets + @RugRadio + @DecryptMedia | host @FOMOHOUR",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "Zeneca_33": {
    username: "Zeneca", displayName: "Zeneca",
    bio: "Living at the intersection of crypto x AI. Newsletter: Zeneca.xyz. Founder: @ZenAcademy @The333Club",
    followers: 400200, following: 13000, verified: true,
    latestPosts: [
      { content: "In a few years, most people are going to look back at 2026 and wish they took that AI coding stuff seriously.", likes: 310, retweets: 18 },
    ]
  },
  "gordongoner": {
    username: "GordonGoner (Wylie Aronow)", displayName: "GordonGoner (Wylie Aronow)",
    bio: "apeman. off this app for a while. going through health shit.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "CamiRusso": {
    username: "Camila Russo", displayName: "Camila Russo",
    bio: "Founder of @DefiantNews. Author of The Infinite Machine. Ex Bloomberg News reporter in NYC, Madrid, BsAs. Chilena. Mama.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "What went wrong with crypto", likes: 1600, retweets: 242 },
    ]
  },
  "AndreCronjeTech": {
    username: "Andre Cronje", displayName: "Andre Cronje",
    bio: "Systems architect. Founder @flyingtulip_",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "In preparing for public sale starting next week, some Q&A", likes: 194, retweets: 39 },
    ]
  },
  "Patticus": {
    username: "Patrick Campbell", displayName: "Patrick Campbell",
    bio: "Current: Founder, NewCo. Former: Founded @profitwell. Deep expertise in pricing, retention, and high output management.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Last year I went from $19k in my bank account to selling my company for $200M+", likes: 2200, retweets: 311 },
    ]
  },
  "ericries": {
    username: "Eric Ries", displayName: "Eric Ries",
    bio: "Order my new book INCORRUPTIBLE & unlock exclusive bonuses at incorruptible.co",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Six months of salary. That's what Matt Mullenweg offered every Automattic employee to resign.", likes: 693, retweets: 22 },
    ]
  },
  "daviefogarty": {
    username: "Davie Fogarty", displayName: "Davie Fogarty",
    bio: "$1,000,000,000 in Shopify ecommerce sales. 700k YouTube Subscribers. Judge on Shark Tank. 1:1 mentoring",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Hiring technical media buyers is completely outdated now.", likes: 143, retweets: 8 },
    ]
  },
  "youderian": {
    username: "Andrew Youderian", displayName: "Andrew Youderian",
    bio: "Helping entrepreneurs gain elite control of their business & personal finances to build wealth, live richly, and create on their terms. Founder at @ecomfuelco.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "randfish": {
    username: "Rand Fishkin", displayName: "Rand Fishkin",
    bio: "Co-founder sparktoro.com, alertmouse.com & snackbarstudio.com. I help people do better marketing.",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "TaylorHoliday": {
    username: "Taylor Holiday", displayName: "Taylor Holiday",
    bio: "Building bridges between marketing and finance. Your CFO's favorite agency. commonthreadco.com",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "mizko": {
    username: "Mizko", displayName: "Mizko",
    bio: "Building the Content OS. thedesignership.com + choppity.com + nidos.com + youtube.com/mizko",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "Hartdrawss": {
    username: "Harshil Tomar", displayName: "Harshil Tomar",
    bio: "I build AI Powered MVPs for Founders in 5 weeks at dreamlaunch.studio",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "AdhamDannaway": {
    username: "Adham Dannaway", displayName: "Adham Dannaway",
    bio: "Author of @PracticalUI. UX & UI design tips, inspiration, & news. Pushing pixels since 2005. Specialised in UI design & design systems",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "mikekus": {
    username: "Mike Kus", displayName: "Mike Kus",
    bio: "Designer & Photographer: mikekus.com. thepocketphotographer.com. Enquiries: mike@mikekus.com",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "andybudd": {
    username: "Andy Budd", displayName: "Andy Budd",
    bio: "Design/Product Advisor, Investor & Coach. Venture Partner @Seedcamp. I help startups hit 1M+ ARR and Design/Product leaders excel in their careers",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "lauraklein": {
    username: "Laura Klein", displayName: "Laura Klein",
    bio: "Author: UX for Lean Startups & Build Better Products. laura@usersknow.com",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "boagworld": {
    username: "Paul Boag", displayName: "Paul Boag",
    bio: "UX Strategist: 30+ years experience in UX, conversion optimization and design leadership. Consultant and Fractional lead.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "jjg": {
    username: "Jesse James Garrett", displayName: "Jesse James Garrett",
    bio: "Executive design leadership coach. History: Capital One, Adaptive Path, The Elements of User Experience, Ajax. He/him.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "goldenkrishna": {
    username: "Golden Krishna", displayName: "Golden Krishna",
    bio: "Design Strategy at Google. Previously, Samsung R&D, Zappos Labs, and at Cooper. Author of 'The Best Interface is No Interface.'",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "davidairey": {
    username: "David Airey", displayName: "David Airey",
    bio: "Designer & writer. Portfolio: davidairey.com. Books: davidairey.com/books. Newsletter: davidairey.substack.com",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "aarron": {
    username: "Aarron Walter", displayName: "Aarron Walter",
    bio: "Co-host of @designbetterpod and @reconsider_pod. Formerly @ResolveTSL, @InVisionApp, @Mailchimp. Author of Designing for Emotion.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "jina": {
    username: "Jina Anne", displayName: "Jina Anne",
    bio: "Design Systems Advocate / Founder @clarity_conf / GDE / they/she",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "nathanacurtis": {
    username: "Nathan A Curtis", displayName: "Nathan A Curtis",
    bio: "working design systems. Wrote @components, blogs. Sports: @arsenal. Education: @virginia_tech, @uchicago math and statistics.",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "I'm researching interactive states. Would you recommend other design systems with a published Figma file that documents interactive states?", likes: 123, retweets: 17 },
    ]
  },
  "danmall": {
    username: "Dan Mall", displayName: "Dan Mall",
    bio: "I help $100K+ design agency owners make $1M and get their flowers in 33 steps.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Most agency shouldn't touch content marketing when they need work in the next 3-6 months.", likes: 39, retweets: 1 },
    ]
  },
  "rjs": {
    username: "Ryan Singer", displayName: "Ryan Singer",
    bio: "Product from concept to build. Creator of Shape Up. Prev: 37signals. rjs@ryansinger.co",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "First time sharing the shaping skills I built for Claude.", likes: 398, retweets: 23 },
    ]
  },
  "dburka": {
    username: "Daniel Burka", displayName: "Daniel Burka",
    bio: "Dir. of design at ResolvetoSaveLives.org. Lead Simple.org. Seed investor. Started Healthicons.org. Prev. design partner at GV.com",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "rogie": {
    username: "rogie", displayName: "rogie",
    bio: "Digital builder & chaos animal. Product designer on Figma Draw. Prior: Advocacy at Figma. horror movies, electronic music, art & code",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Markdown is having its moment", likes: 30, retweets: 1 },
    ]
  },
  "ransegall": {
    username: "Ran Segall", displayName: "Ran Segall",
    bio: "Helping people make a living as designers. Building Flux Academy.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "RobertCialdini": {
    username: "Dr. Robert Cialdini", displayName: "Dr. Robert Cialdini",
    bio: "President of INFLUENCE AT WORK and author INFLUENCE and Pre-Suasion.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Want to be sure you're persuading ethically? Sign up now for tomorrow's Newsletter.", likes: 24, retweets: 4 },
    ]
  },
  "karenmcgrane": {
    username: "Karen McGrane", displayName: "Karen McGrane",
    bio: "On a good day, I make the web more awesome. On a bad day, I just make it suck less.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "joshelman": {
    username: "Josh Elman", displayName: "Josh Elman",
    bio: "I have been very lucky to work on or invest in many products I use every day including this one when it had a different name.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Think about the number of new capabilities people will have with AI and be able to do for others", likes: 7, retweets: 0 },
    ]
  },
  "lissijean": {
    username: "Melissa Perri", displayName: "Melissa Perri",
    bio: "#ProductManagement Person. Board Member. Author Escaping the Build Trap. Created @productinst. Podcast DearMelissa.com. Prev Prof @harvardhbs.",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "johncutlefish": {
    username: "John Cutler", displayName: "John Cutler",
    bio: "I like the beautiful mess of product development. newsletter: cutlefish.substack.com",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "aunder": {
    username: "April Underwood", displayName: "April Underwood",
    bio: "Managing Director and Cofounder, @adverbvc. Cofounder @hashtagangels. Ex CPO @slackhq; prev. @twitter @google. BOD @zillow @eventbrite.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "every tweet right now: Hi! I'm leaving my industry to go to another one! My industry is crumbling.", likes: 1400, retweets: 92 },
    ]
  },
  "fabianstelzer": {
    username: "fabian", displayName: "fabian",
    bio: "hey you. yes you. get in here, we're going to build insanely creative AI agents & workflows. co-founder of @heyglif / glif.app",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "I'll be honest, I have 32 mac minis. 3 more clusters like this one.", likes: 52, retweets: 3 },
    ]
  },
  "patrickc": {
    username: "Patrick Collison", displayName: "Patrick Collison",
    bio: "@Stripe CEO, @ArcInstitute cofounder.",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "A Call for New Aesthetics: newaesthetics.art", likes: 5900, retweets: 906 },
    ]
  },
  "brian_armstrong": {
    username: "Brian Armstrong", displayName: "Brian Armstrong",
    bio: "Co-founder & CEO at @Coinbase. Creating more economic freedom in the world. ENS: barmstrong.eth",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Important to get more checkout flows x402 enabled so agents can get work done", likes: 655, retweets: 66 },
    ]
  },
  "zhugezifang": {
    username: "zhugezifang", displayName: "zhugezifang",
    bio: "前大厂程序员，业余独立开发者 showuproduct.app restore-photo.app",
    followers: 3067, following: 583, verified: false,
    latestPosts: [
      { content: "seo 还有一个比较有意思的事，就是蹭别人的品牌词", likes: 2, retweets: 0 },
    ]
  },
  "seoer_org": {
    username: "搜優家seoer.org", displayName: "搜優家seoer.org",
    bio: "#seo#谷歌排名#網站優化#外鏈",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "HiQuan4": {
    username: "Quan", displayName: "Quan",
    bio: "带娃出海上站。爱读书 爱看报 爱撸猫 AI｜编程｜工具精选 从月入千刀→月入万刀ing",
    followers: 0, following: 0, verified: false,
    latestPosts: [
      { content: "加入哥飞社群一年，我终于跑出一个月≈900K流量的网站", likes: 96, retweets: 5 },
    ]
  },
  "wumeilv_ai": {
    username: "吴美律AI日记", displayName: "吴美律AI日记",
    bio: "AI编程入门与提效出海实战与案例分享自媒体与流量增长正在尝试通过AI编程搭建第一个出海网站",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "认知太高影响赚钱？今天和一位网络安全专家一起吃饭", likes: 584, retweets: 91 },
    ]
  },
  "0xPlato": {
    username: "Plato | GetPaid Studio", displayName: "Plato | GetPaid Studio",
    bio: "Showcase yourself and get paid with @realindievator & @GetPaidPAGE. Past:@TencentGlobal",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "这两年一直在做独立开发和出海项目", likes: 7, retweets: 0 },
    ]
  },
  "FLMdongtianfudi": {
    username: "Fang知识分享", displayName: "Fang知识分享",
    bio: "十年自媒体从业者 副业项目运营者 分享项目运营经验与学习资料",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "闲鱼这地方真的太逆天了，能买到什么基本完全取决于你的黑话词汇量大小。", likes: 2000, retweets: 307 },
    ]
  },
  "alexgarcia_atx": {
    username: "Alex Garcia", displayName: "Alex Garcia",
    bio: "Building the best content studio for brands @theHODstudio | Sweat Equity Pod | Co-Founder of Cut30",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "MrDeGao": {
    username: "DeGao", displayName: "DeGao",
    bio: "Qafind CEO - @chatdlm_com ChatDLM chatdlm.com GEO通搜查询 tongsou.com",
    followers: 0, following: 0, verified: false,
    latestPosts: []
  },
  "tuturetom": {
    username: "Tom Huang", displayName: "Tom Huang",
    bio: "Building the open-source agentic workspace for Human-AI collaboration, ex @tiktok_us",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Figma 这个太牛了 把任何图片转成完美的矢量图，外网狂呼了，半天飙了 100 万阅读", likes: 1800, retweets: 282 },
    ]
  },
  "bearliu": {
    username: "Bear Liu", displayName: "Bear Liu",
    bio: "Product Designer, 10 year+ podcaster and author of 2 books. Love things around design, tech and productivity, making JAM at jamtalk.co",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "提升品味，2026年要读一读这三本书。", likes: 121, retweets: 18 },
    ]
  },
  "stark_nico99": {
    username: "Nicolechan", displayName: "Nicolechan",
    bio: "分享出海增长历程和干货 | Building YouMind | User Growth Leader | Ex-CMS Securities UX | Ex-Tencent Alumni Content Lead",
    followers: 0, following: 0, verified: true,
    latestPosts: [
      { content: "Seedance 2.0 这几天刷屏了，大家光发视频不发提示词，索性做了个 Seedance 2.0 提示词集合站", likes: 1300, retweets: 306 },
    ]
  },
  "cheerselflin": {
    username: "林悦己Cheer", displayName: "林悦己Cheer",
    bio: "AI influencers｜@evolinkai CMO Vibe coding building my career｜follow me to learn & use AI",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
  "0xajc": {
    username: "陈锦初Andrew｜NUW", displayName: "陈锦初Andrew｜NUW",
    bio: "@Nuwa_World 创始人 前Instap创始人（被收购）｜@UMassAmherst 骚包辍学生",
    followers: 0, following: 0, verified: true,
    latestPosts: []
  },
};

function main() {
  // Load KOL list
  const kolListRaw = fs.readFileSync(path.join(DATA_DIR, "kols-list.json"), "utf-8");
  const kolList: KolListEntry[] = JSON.parse(kolListRaw);

  const allKols: CleanedKol[] = [];
  const allTweets: CleanedTweet[] = [];
  let scrapedCount = 0;
  let baselineCount = 0;

  for (const entry of kolList) {
    const scraped = SCRAPED_PROFILES[entry.username];
    const categorySlugs = categoriesToSlugs(entry.categories);
    const tags = extractTags(entry.notes);

    if (scraped) {
      // Use real scraped bio, fall back to notes if bio is too short
      const bio = scraped.bio && scraped.bio.length > 5 && scraped.bio !== "。。。。。。"
        ? scraped.bio
        : entry.notes;

      allKols.push({
        twitter_id: "",
        username: entry.username,
        display_name: scraped.username || entry.displayName,
        bio,
        avatar_url: "",
        followers: scraped.followers || 0,
        following: scraped.following || 0,
        tweet_total: 0,
        categories: categorySlugs,
        tags,
        profile_url: `https://x.com/${entry.username}`,
      });

      // Extract tweets from latestPosts
      for (let i = 0; i < scraped.latestPosts.length; i++) {
        const post = scraped.latestPosts[i];
        if (post.content && post.content.length > 3) {
          allTweets.push({
            tweet_id: `scraped_${entry.username}_${i}`,
            kol_username: entry.username,
            content: post.content,
            media_urls: [],
            likes: post.likes || 0,
            retweets: post.retweets || 0,
            replies: 0,
            views: 0,
            tweet_time: new Date().toISOString(),
            tweet_url: `https://x.com/${entry.username}`,
            is_retweet: post.content.startsWith("RT @"),
            is_reply: false,
          });
        }
      }
      scrapedCount++;
    } else {
      // Baseline: use KOL list data
      allKols.push({
        twitter_id: "",
        username: entry.username,
        display_name: entry.displayName,
        bio: entry.notes,
        avatar_url: "",
        followers: 0,
        following: 0,
        tweet_total: 0,
        categories: categorySlugs,
        tags,
        profile_url: `https://x.com/${entry.username}`,
      });
      baselineCount++;
    }
  }

  // Write output files
  fs.writeFileSync(
    path.join(DATA_DIR, "kols-scraped.json"),
    JSON.stringify(allKols, null, 2)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "tweets-scraped.json"),
    JSON.stringify(allTweets, null, 2)
  );

  console.log("========================================");
  console.log("  数据处理完成");
  console.log("========================================");
  console.log(`  KOL 总数: ${allKols.length}`);
  console.log(`  - 已抓取真实数据: ${scrapedCount}`);
  console.log(`  - 使用基线数据: ${baselineCount}`);
  console.log(`  推文总数: ${allTweets.length}`);
  console.log(`  输出: data/kols-scraped.json`);
  console.log(`  输出: data/tweets-scraped.json`);
}

main();
