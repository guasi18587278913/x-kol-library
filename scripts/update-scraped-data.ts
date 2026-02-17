/**
 * Update scraped data files with fresh MCP results.
 *
 * This script merges MCP scrape_profile results with the existing
 * kols-list.json to produce updated kols-scraped.json and tweets-scraped.json.
 *
 * Usage: npx tsx scripts/update-scraped-data.ts
 */

import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");

interface KolListEntry {
  username: string;
  displayName: string;
  categories: string[];
  priority: string;
  notes: string;
}

interface McpProfile {
  username: string;       // display name from MCP
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number | null;
  verified: boolean;
  latestPosts: Array<{
    content: string;
    likes: number;
    retweets: number;
  }>;
}

// ─── Category mapping ─────────────────────────────
const CATEGORY_SLUG_MAP: Record<string, string> = {
  "AI技术": "ai-tech",
  "创业出海": "startup-global",
  "投资理财": "investment-finance",
  "商业财富": "business-wealth",
  "设计产品": "design-product",
  "内容创作": "content-creation",
  "营销增长": "marketing-growth",
};

// ─── Follower estimates ───────────────────────────
const FOLLOWER_ESTIMATES: Record<string, number> = {
  elonmusk: 200_000_000,
  VitalikButerin: 5_500_000,
  sama: 3_500_000,
  naval: 2_000_000,
  karpathy: 1_000_000,
  AndrewYNg: 900_000,
  levelsio: 823_000,
  waitbutwhy: 700_000,
  reidhoffman: 600_000,
  balajis: 1_000_000,
  cdixon: 850_000,
  joulee: 300_000,
  EMostaque: 300_000,
  tobi: 600_000,
  andrewchen: 400_000,
  noahkagan: 350_000,
  jasonfried: 400_000,
  hwchase17: 200_000,
  skirano: 200_000,
  SahilBloom: 1_500_000,
  ShaanVP: 500_000,
  morganhousel: 500_000,
  nickfloats: 150_000,
  dotey: 100_000,
  kiwicopple: 100_000,
  arvidkahl: 100_000,
  jerryjliu0: 100_000,
  lennysan: 400_000,
  dharmesh: 350_000,
  rrhoover: 200_000,
  scottbelsky: 250_000,
  op7418: 80_000,
  marclouvier: 80_000,
  _philschmid: 80_000,
  alexalbert__: 80_000,
  gefei55: 60_000,
  AmandaAskell: 60_000,
  xiaohuggg: 50_000,
  gaborcselle: 50_000,
  vista8: 40_000,
  tinyfool: 40_000,
  easychen: 35_000,
  xicilion: 30_000,
  unusual_whales: 3_200_000,
  PlanB: 1_900_000,
  RaoulGMI: 1_000_000,
  WillyWoo: 1_100_000,
  APompliano: 1_600_000,
  beeple: 730_000,
  kevinrose: 1_500_000,
  lukew: 300_000,
  jnd1er: 100_000,
  MrAlanCooper: 50_000,
  brad_frost: 100_000,
  jmspool: 60_000,
  CoderJeffLee: 20_000,
  chuhaiqu: 15_000,
  rotor187: 15_000,
  berryxia: 30_000,
};

function estimateFollowers(username: string, priority: string): number {
  if (FOLLOWER_ESTIMATES[username]) return FOLLOWER_ESTIMATES[username];
  switch (priority) {
    case "high": return 50_000;
    case "medium": return 15_000;
    case "low": return 5_000;
    default: return 10_000;
  }
}

function generateTwitterId(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) & 0x7fffffff;
  }
  return String(1_000_000_000 + (hash % 9_000_000_000));
}

function categoriesToSlugs(categories: string[]): string[] {
  return categories
    .map((cat) => CATEGORY_SLUG_MAP[cat])
    .filter((slug): slug is string => slug !== undefined);
}

function extractTags(notes: string): string[] {
  const parts = notes.split(/[，,、/]/);
  const tags = parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.length <= 20)
    .slice(0, 5);
  if (tags.length === 0 && notes.trim().length > 0) {
    return [notes.trim().slice(0, 20)];
  }
  return tags;
}

function detectLanguage(text: string): string {
  if (!text) return "zh";
  const cjkChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  const cjkCount = cjkChars ? cjkChars.length : 0;
  const asciiChars = text.match(/[a-zA-Z]/g);
  const asciiCount = asciiChars ? asciiChars.length : 0;
  if (cjkCount === 0 && asciiCount === 0) return "zh";
  if (cjkCount / (cjkCount + asciiCount) > 0.1) return "zh";
  return "en";
}

// ─── MCP scraped data (collected via agent) ───────
const MCP_RESULTS: Record<string, McpProfile> = {
  dotey: {
    username: "宝玉", displayName: "宝玉",
    bio: "Prompt Engineer, dedicated to learning and disseminating knowledge about AI, software engineering, and engineering management.",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "在 OpenAI 收购 OpenClaw 之际，重温一下 ClawdBot 最初的灵魂 SOUL.md - 你不仅是一个聊天机器人，你正在成为\"人\"！极具主观能动性、值得信赖且拥有独立思考能力。", likes: 262, retweets: 57 },
      { content: "我一直借助 AI 写作的，这不是什么秘密，我也不以此为耻，毕竟所有内容都是我要表达的也是我把关的。\n\n这就好比我是个管理者，我会把下属的功劳占为己有，同样也会承担下属犯错带来的责任。", likes: 178, retweets: 31 },
      { content: "以大方分享好用的 Prompt 为荣，以藏着掖着生怕别人也会用 AI 为耻\n\n以用 AI 省下时间去摸鱼为荣，以用省下的时间干更多活为耻", likes: 9, retweets: 1 },
    ]
  },
  vista8: {
    username: "向阳乔木", displayName: "向阳乔木",
    bio: "喜欢摇滚乐、爱钓鱼的PM\n网站：https://qiaomu.ai",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "觉得AI时代迟早得发展成这样，AI产出，人来监控，评估。", likes: 8, retweets: 1 },
      { content: "翻看龙虾作者的博客，去年八月分享过他的 AI 开发工作流\n\n核心理念极其简洁。", likes: 228, retweets: 32 },
      { content: "终于让Claude Code开发好了。\n\n1. 读到好文章，一句话重写配图发布到网站。\n2. 支持中英双语\n3. 框架用 Hugo + Papermod主题\n4. 支持 X 分享显示封面等", likes: 122, retweets: 31 },
      { content: "CEO们在财报会上张嘴闭嘴都是AI，但56%的公司承认没看到明显收益。\n\nAI到底在怎样改变就业市场？谁在受益，谁在受伤，以及你该怎么办。", likes: 18, retweets: 1 },
    ]
  },
  sama: {
    username: "Sam Altman", displayName: "Sam Altman",
    bio: "AI is cool i guess",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "Codex weekly users have more than tripled since the beginning of the year!", likes: 6300, retweets: 336 },
      { content: "Peter Steinberger is joining OpenAI to drive the next generation of personal agents. He is a genius engineer and builder.", likes: 41000, retweets: 8200 },
      { content: "These are obviously not earth-shattering results, but the ability to produce genuinely new knowledge is exciting.", likes: 1900, retweets: 87 },
      { content: "It was really exciting seeing a model we're currently training tackling these frontier math research problems.", likes: 654, retweets: 41 },
    ]
  },
  karpathy: {
    username: "Andrej Karpathy", displayName: "Andrej Karpathy",
    bio: "I like to train large deep neural nets. Previously Director of AI @ Tesla, founding team @ OpenAI, PhD @ Stanford.",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "The hottest new programming language is English.", likes: 57000, retweets: 8900 },
      { content: "New art project.\nTrain and inference GPT in 243 lines of pure, dependency-free Python. This is the simplest possible complete implementation of a GPT.", likes: 24000, retweets: 3600 },
      { content: "A bit more context e.g. from Simon just wow.", likes: 3400, retweets: 296 },
    ]
  },
  levelsio: {
    username: "levelsio", displayName: "@levelsio",
    bio: "euacc.com @euacc\nPhotoAI.com $110k/m\nInteriorAI.com $40K/m\nRemoteOK.com $39K/m\nNomads.com $17K/m\nlevelsio.com $17K/m",
    followers: 822900, following: 2732, posts: null, verified: true,
    latestPosts: [
      { content: "I've always wondered why there's so many Vietnamese indie hacker and startup success stories.", likes: 1100, retweets: 206 },
      { content: "I could work with 1 single Claude Code tab if it responded 100x as fast\n\nBut now it takes 1-3 minutes per response so I need multiple tabs.", likes: 178, retweets: 5 },
      { content: "Keep going and don't give up!\n\nI think everyone is a bit jealous of @steipete right now, it'd be weird if you weren't.", likes: 305, retweets: 9 },
    ]
  },
  op7418: {
    username: "歸藏(guizang.ai)", displayName: "歸藏(guizang.ai)",
    bio: "关注人工智能、LLM 、 AI 图像视频和设计\n\n歸藏的 AIGC 周刊｜公众号：歸藏的AI工具箱",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "贾樟柯用 Seedance 2.0 做的短片这就上了，看来提前就准备好了啊", likes: 13, retweets: 2 },
      { content: "贾樟柯说要用 Seedance 2.0 整个短片", likes: 600, retweets: 48 },
      { content: "Trickle团队的新作 happycapy 有点牛皮啊！\n\n这是一个在浏览器上运行的原生 Agent 主机，你可以在里面随时随地运行 Claude Code 和 Clawdbot。", likes: 160, retweets: 27 },
    ]
  },
  xicilion: {
    username: "响马", displayName: "响马",
    bio: "。。。。。。",
    followers: 0, following: 0, posts: null, verified: false,
    latestPosts: [
      { content: "ai 特别擅长快速实现一个有点复杂的应用，也很适合在一个复杂的应用里快速分析和解决问题。\n但是特别不擅长将一个有点复杂的应用进化到复杂的应用。", likes: 10, retweets: 3 },
      { content: "也说一个有意思的事情。我不喜欢户外运动，喜欢躺着看书，现在更喜欢躺着看手机。从 pc 时代眼睛就几乎全在看电子屏。到现在也不近视。", likes: 12, retweets: 4 },
      { content: "vscode 现在是我的文档开发环境。", likes: 10, retweets: 0 },
    ]
  },
  easychen: {
    username: "EasyChen", displayName: "EasyChen",
    bio: "方糖气球博主，80后大叔，萌物控。做原型、敲代码、写吐槽小说、制四格漫画。无业，玩独立开发，偶尔卖课为生。",
    followers: 0, following: 0, posts: null, verified: false,
    latestPosts: [
      { content: "#Easy同学正在独立开发 你永远猜不到 Vibe Coding 会怎么改变我的生活习惯\n\n我现在上班的时候听歌都听没有歌词的纯音乐。只是为了方便语音对话。", likes: 2, retweets: 0 },
      { content: "#Easy同学正在独立开发 Google 的 Antigravity 也来了，可以免费用 Gemini 3 Pro。意外的还能用 claude sonnet 4.5", likes: 2, retweets: 0 },
      { content: "#Easy同学正在独立开发 CookieCloud 新增了官网和官方测试服务器。新版插件也已经在内测了。", likes: 2, retweets: 0 },
    ]
  },
  arvidkahl: {
    username: "Arvid Kahl", displayName: "Arvid Kahl",
    bio: "Building podscan.fm and ideas.podscan.fm in Public. Raising all the boats with kindness.",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "Podscan tracks every single podcast out there.\n\nAnd 2025 is shaping up to be the second-largest year for new podcast launches.", likes: 114, retweets: 3 },
      { content: "Introducing M2.5, an open-source frontier model designed for real-world productivity.\n\nSOTA performance. Open weights. Built for agents.", likes: 2200, retweets: 227 },
    ]
  },
  gefei55: {
    username: "哥飞", displayName: "哥飞",
    bio: "哥飞，出海鼓励师，SEO爱好者，Adsense玩家，出海AI工具方向创业者。\n同名公众号写了五百多篇出海搞流量免费教程文章。",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "哥飞公众号写了225篇教程了，其中220篇都是公开免费可看全文的。\n除了友情转载的两篇，其它全部都是哥飞原创输出。", likes: 864, retweets: 157 },
      { content: "你们的龙虾没啥用，是因为的确没找到使用场景。\n\n我们群友的龙虾已经会自己挖掘需求关键词，自己注册域名上线网站，自己提交外链搞流量，最终赚到钱后除了付他自己的 Token 费用，还可以把所有的剩余价值分给主人。", likes: 223, retweets: 30 },
    ]
  },
  tinyfool: {
    username: "Tinyfool", displayName: "Tinyfool",
    bio: "Youtuber\n20年老程序员，业已退休，不以写代码为主业。\n不是英语老师，但开发了\"英语轻松读\"，做了广受好评的学习英语的视频。",
    followers: 0, following: 0, posts: null, verified: false,
    latestPosts: [
      { content: "我叫Tinyfool，是个Youtuber，20年的老程序员，不是英语老师，\"英语轻松读\"App开发者，住在天津", likes: 423, retweets: 74 },
      { content: "今年的央视春节广告晚会办的不错，下次别办了", likes: 38, retweets: 1 },
    ]
  },
  naval: {
    username: "Naval", displayName: "Naval",
    bio: "Incompressible",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "How to Get Rich (without getting lucky):", likes: 271000, retweets: 91000 },
      { content: "AI is the great automator, and to automate, it must first imitate.\n\nThe imitation fools people into thinking it will only be as good as what already is.", likes: 8400, retweets: 736 },
      { content: "Everyone will soon have \"AI Anxiety.\"", likes: 7200, retweets: 791 },
      { content: "All the American AI companies talk about sharing the wealth, but all the top open source models are Chinese.", likes: 21000, retweets: 2100 },
    ]
  },
  AndrewYNg: {
    username: "Andrew Ng", displayName: "Andrew Ng",
    bio: "Co-Founder of Coursera; Stanford CS adjunct faculty. Former head of Baidu AI Group/Google Brain.",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "To all my AI friends: Every time I see you, you raise my temperature parameter.\n\nHappy Valentine's Day!", likes: 1900, retweets: 105 },
      { content: "As amazing as LLMs are, improving their knowledge today involves a more piecemeal process than is widely recognized.", likes: 1900, retweets: 414 },
    ]
  },
  waitbutwhy: {
    username: "Tim Urban", displayName: "Tim Urban",
    bio: "Writer, infant",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "My book What's Our Problem? is now available.\n\nThe book introduces a new framework for thinking about our biggest challenges.", likes: 15000, retweets: 2500 },
    ]
  },
  joulee: {
    username: "Julie Zhuo", displayName: "Julie Zhuo",
    bio: "Founder @teamSundial. Angel investor. Author of \"The Making of a Manager\". Obsessed with systems. Design + data person.",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "I am obsessed with the notion of \"what meta-skills are at the next frontier of creativity?\"", likes: 259, retweets: 15 },
      { content: "Rule of 3: no more than three people needed to get from conception to shipping.", likes: 232, retweets: 12 },
      { content: "The most important lesson that I want to seep into my bones this year:\n\nDon't want something for someone more than they want it for themselves.", likes: 304, retweets: 31 },
    ]
  },
  kiwicopple: {
    username: "Paul Copplestone - e/postgres", displayName: "Paul Copplestone",
    bio: "ceo @supabase | YC S20",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "at @supabase we're building:\n\na new storage engine for Postgres\nan open source sharding engine for Postgres", likes: 983, retweets: 59 },
      { content: "Postgres 18 contributor, ranked by commits\n\nkudos to EnterpriseDB, MS, and AMZN, NTT, PostgresPro.", likes: 219, retweets: 12 },
    ]
  },
  hwchase17: {
    username: "Harrison Chase", displayName: "Harrison Chase",
    bio: "@LangChain, previously @robusthq @kensho\n\nMLOps + Generative AI + sports analytics",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "How Harmonic built an investment agent with LangSmith and LangGraph - so VCs can focus on founders.", likes: 26, retweets: 5 },
      { content: "deepagents now supports byo sandboxes, giving your agents the power to execute code in an isolated environment.", likes: 32, retweets: 4 },
    ]
  },
  skirano: {
    username: "Pietro Schirano", displayName: "Pietro Schirano",
    bio: "CEO at @magicpathai\n\nPreviously @AnthropicAI, @brexHQ. @Uber, @Facebook. Creator of Claude Engineer, DesignerGPT, Sequential thinking MCP and more",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "Kimi K2.5 is a really good model, especially for agentic tasks and writing. Can't believe it's open source.", likes: 1000, retweets: 54 },
      { content: "Constraining your design agent to follow a specific design system not only helps stay on brand but also improves output quality.", likes: 10, retweets: 0 },
    ]
  },
  nickfloats: {
    username: "Nick St. Pierre", displayName: "Nick St. Pierre",
    bio: "Unofficial Midjourney shill. Playing with AI & sharing learnings.",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "more blending in --v 7, this time playing with the idea of impressionism captured through a rain soaked windshield.", likes: 929, retweets: 38 },
      { content: "Turns out the only jobs will be artist and writer after all", likes: 6000, retweets: 553 },
    ]
  },
  berryxia: {
    username: "Berryxia.AI", displayName: "Berryxia.AI",
    bio: "Building AI tools AI System Prompt Love Design & Coding & Share Prompt!",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "Qwen3.5-397B-A17B在这里：Qwen3.5系列中的第一个开放式重量模型。\n\n原生多模式。为现实世界的代理人接受过培训。", likes: 0, retweets: 0 },
    ]
  },
  Yangyixxxx: {
    username: "Yangyi", displayName: "Yangyi",
    bio: "Believing is seeing\nReverb Marketing Evangelist",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "抖音搞个精品漫剧发钱\n字节做个即梦seedance\n有人教做漫剧赚课程费\n有人赚分发漫剧CPS分佣\n有人赚漫剧订阅费\n\n字节既赚铲子钱，又赚广告费，用户还留存了\n一端生产 一端消费 完美闭环", likes: 104, retweets: 10 },
    ]
  },
  alexalbert__: {
    username: "Alex Albert", displayName: "Alex Albert",
    bio: "Claude Relations @AnthropicAI. Opinions are my own!",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "I attended a YC event in summer 2024 and the room was polled on who uses Claude. About 10% of hands went up.", likes: 554, retweets: 21 },
      { content: "Claude's constitution is out! Highly recommend taking a look.", likes: 735, retweets: 13 },
      { content: "I'm happy to share that we (@AnthropicAI) are investing $1.5 million in support of the Python Software Foundation.", likes: 7700, retweets: 517 },
    ]
  },
  jerryjliu0: {
    username: "Jerry Liu", displayName: "Jerry Liu",
    bio: "document OCR + workflows @llama_index. cofounder/CEO",
    followers: 0, following: 0, posts: null, verified: true,
    latestPosts: [
      { content: "2026 is the year of long-horizon agents. @sequoia predicts that this year, agents will be able to take on longer and more complex tasks.", likes: 13, retweets: 3 },
      { content: "We love parsing diagrams. Anthropic's recent report on coding trends has a nice diagram on the evolution of AI-assisted development.", likes: 276, retweets: 27 },
    ]
  },
  marclouvier: {
    username: "Marc Louvier", displayName: "Marc Louvier",
    bio: "Paris",
    followers: 0, following: 0, posts: null, verified: false,
    latestPosts: []
  },
};

// ─── Main processing ──────────────────────────────

function main() {
  console.log("=== Updating scraped data files ===\n");

  const kolList: KolListEntry[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "kols-list.json"), "utf-8")
  );
  console.log(`KOL list: ${kolList.length} entries`);
  console.log(`MCP results: ${Object.keys(MCP_RESULTS).length} profiles\n`);

  const kols: Array<Record<string, unknown>> = [];
  const tweets: Array<Record<string, unknown>> = [];
  let mcpCount = 0;
  let baselineCount = 0;

  for (const entry of kolList) {
    const mcpData = MCP_RESULTS[entry.username];
    const categorySlugs = categoriesToSlugs(entry.categories);
    const tags = extractTags(entry.notes);
    const followers = mcpData?.followers && mcpData.followers > 0
      ? mcpData.followers
      : estimateFollowers(entry.username, entry.priority);

    const kol = {
      twitter_id: generateTwitterId(entry.username),
      username: entry.username,
      display_name: mcpData?.displayName || entry.displayName,
      bio: mcpData?.bio || entry.notes,
      avatar_url: "",
      followers,
      following: mcpData?.following || 0,
      tweet_total: mcpData?.posts || 0,
      categories: categorySlugs,
      tags,
      profile_url: `https://x.com/${entry.username}`,
    };
    kols.push(kol);

    if (mcpData && mcpData.latestPosts && mcpData.latestPosts.length > 0) {
      mcpCount++;
      for (let i = 0; i < mcpData.latestPosts.length; i++) {
        const post = mcpData.latestPosts[i];
        if (!post.content || post.content.length < 5) continue;

        const language = detectLanguage(post.content);
        tweets.push({
          tweet_id: `${entry.username}_${Date.now()}_${i}`,
          kol_username: entry.username,
          content: post.content,
          content_zh: "",
          language,
          translated_at: null,
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
    } else {
      baselineCount++;
    }
  }

  // Write output files
  fs.writeFileSync(
    path.join(DATA_DIR, "kols-scraped.json"),
    JSON.stringify(kols, null, 2)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "tweets-scraped.json"),
    JSON.stringify(tweets, null, 2)
  );

  console.log("Results:");
  console.log(`  KOLs:     ${kols.length}`);
  console.log(`  Tweets:   ${tweets.length}`);
  console.log(`  With MCP: ${mcpCount}`);
  console.log(`  Baseline: ${baselineCount}`);
  console.log(`\nFiles written:`);
  console.log(`  ${path.join(DATA_DIR, "kols-scraped.json")}`);
  console.log(`  ${path.join(DATA_DIR, "tweets-scraped.json")}`);
}

main();
