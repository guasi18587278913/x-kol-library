#!/usr/bin/env python3
"""
X (Twitter) 推文爬虫
基于 Playwright，模拟浏览器抓取指定 KOL 的推文，支持 Thread 连推展开

使用方式：
  # 第一步：登录（只需要一次）
  python scraper/x_scraper.py login

  # 第二步：抓取
  python scraper/x_scraper.py scrape

  # 抓取单个 KOL（测试用）
  python scraper/x_scraper.py scrape --username karpathy

  # 查看数据库统计
  python scraper/x_scraper.py stats

依赖安装：
  pip install playwright
  playwright install chromium
"""

import argparse
import asyncio
import json
import re
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from playwright.async_api import Page, async_playwright

# ─── 路径配置 ────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
KOL_FILE = ROOT / "data" / "kol-from-queries.txt"
SQLITE_DB = ROOT / "data" / "x-scraped.db"
SESSION_DIR = ROOT / "data" / "browser-session"
OUTPUT_JSON = ROOT / "data" / "tweets-scraped.json"
PROGRESS_FILE = ROOT / "data" / "scrape-progress.json"

# ─── 抓取参数 ────────────────────────────────────────────────────────────────

MAX_TWEETS_PER_KOL = 50   # 每个 KOL 最多保存条数
MAX_SCROLLS = 40          # 最多滚动次数
SCROLL_DELAY = 2.5        # 滚动间隔（秒）
KOL_DELAY = 8.0           # KOL 间切换间隔（秒）
RATE_LIMIT_COOLDOWN = 45  # 连续超时后冷却时间（秒）
MIN_LIKES = 30            # 最低点赞数（质量门槛）
MIN_RETWEETS = 10         # 最低转发数（满足其一即可）
MIN_CHARS = 80            # 最短文字长度（过滤碎碎念）
MAX_THREAD_PARTS = 20     # Thread 最多拼接条数

# Thread 开头识别：含 🧵 、"1/5"、"(1)" 等标记
THREAD_START_RE = re.compile(
    r"🧵"              # thread emoji
    r"|(?<!\d)1\s*/\s*\d+"  # "1/5" or "1/ 5"
    r"|\(1\)\s*$"      # "(1)" at end
    r"|^\s*\(1\)",     # "(1)" at start
    re.IGNORECASE,
)

# ─── 工具函数 ─────────────────────────────────────────────────────────────────


def parse_count(text: str) -> int:
    """解析 '1.2K'、'45'、'1M' 等数字字符串"""
    if not text:
        return 0
    text = text.strip().replace(",", "")
    try:
        if text.upper().endswith("K"):
            return int(float(text[:-1]) * 1_000)
        elif text.upper().endswith("M"):
            return int(float(text[:-1]) * 1_000_000)
        else:
            return int(float(text))
    except (ValueError, TypeError):
        return 0


def detect_language(text: str) -> str:
    """简单语言检测：含中文字符返回 zh，否则返回 en"""
    cjk_count = sum(1 for c in text if "\u4e00" <= c <= "\u9fff")
    return "zh" if cjk_count > len(text) * 0.1 else "en"


def is_thread_start(content: str) -> bool:
    """检测推文是否是 Thread（连推）的开头"""
    return bool(THREAD_START_RE.search(content))


def load_usernames() -> list:
    """从 kol-from-queries.txt 读取用户名列表"""
    if not KOL_FILE.exists():
        print(f"❌ 找不到 KOL 文件：{KOL_FILE}")
        sys.exit(1)
    usernames = []
    for line in KOL_FILE.read_text(encoding="utf-8").strip().splitlines():
        line = line.strip()
        if line.startswith("from:"):
            usernames.append(line[5:].strip())
    return usernames


def load_progress() -> set:
    """读取已完成的用户名列表"""
    if PROGRESS_FILE.exists():
        data = json.loads(PROGRESS_FILE.read_text())
        return set(data.get("done", []))
    return set()


def save_progress(done: set):
    """保存进度"""
    PROGRESS_FILE.write_text(json.dumps({"done": list(done)}, ensure_ascii=False, indent=2))


# ─── 数据库 ───────────────────────────────────────────────────────────────────


def init_db() -> sqlite3.Connection:
    SQLITE_DB.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(SQLITE_DB)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tweets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    NOT NULL,
            tweet_id    TEXT    UNIQUE NOT NULL,
            content     TEXT    NOT NULL,
            likes       INTEGER DEFAULT 0,
            retweets    INTEGER DEFAULT 0,
            replies     INTEGER DEFAULT 0,
            lang        TEXT    DEFAULT 'en',
            tweet_time  TEXT,
            tweet_url   TEXT,
            is_thread   INTEGER DEFAULT 0,
            scraped_at  TEXT    DEFAULT (datetime('now')),
            exported    INTEGER DEFAULT 0
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_un ON tweets(username)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_tid ON tweets(tweet_id)")
    # 兼容旧数据库：添加 is_thread 列（如果不存在）
    try:
        conn.execute("ALTER TABLE tweets ADD COLUMN is_thread INTEGER DEFAULT 0")
    except Exception:
        pass
    conn.commit()
    return conn


def db_save_tweet(conn: sqlite3.Connection, t: dict) -> bool:
    """保存单条推文，返回是否为新插入"""
    try:
        cur = conn.execute(
            """INSERT OR IGNORE INTO tweets
               (username, tweet_id, content, likes, retweets, replies, lang, tweet_time, tweet_url, is_thread)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                t["username"], t["tweet_id"], t["content"],
                t["likes"], t["retweets"], t["replies"],
                t["lang"], t["tweet_time"], t["tweet_url"],
                t.get("is_thread", 0),
            ),
        )
        conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        print(f"    ⚠️  DB 写入失败 [{t.get('tweet_id')}]: {e}")
        return False


def db_update_thread_content(conn: sqlite3.Connection, tweet_id: str, content: str, lang: str):
    """用展开后的 Thread 内容更新数据库"""
    conn.execute(
        "UPDATE tweets SET content=?, lang=?, is_thread=1 WHERE tweet_id=?",
        (content, lang, tweet_id),
    )
    conn.commit()


def db_stats(conn: sqlite3.Connection):
    """打印数据库统计"""
    total = conn.execute("SELECT COUNT(*) FROM tweets").fetchone()[0]
    by_lang = conn.execute(
        "SELECT lang, COUNT(*) FROM tweets GROUP BY lang"
    ).fetchall()
    kols = conn.execute("SELECT COUNT(DISTINCT username) FROM tweets").fetchone()[0]
    unexported = conn.execute("SELECT COUNT(*) FROM tweets WHERE exported=0").fetchone()[0]
    threads = conn.execute("SELECT COUNT(*) FROM tweets WHERE is_thread=1").fetchone()[0]

    print(f"\n📊 数据库统计：")
    print(f"   总推文数：{total}（其中 Thread：{threads}）")
    print(f"   KOL 数：{kols}")
    print(f"   待导出：{unexported}")
    for lang, cnt in by_lang:
        print(f"   语言 [{lang}]：{cnt}")


# ─── Thread 抓取 ──────────────────────────────────────────────────────────────


async def fetch_thread_content(page: Page, tweet_url: str, username: str) -> Optional[str]:
    """
    进入推文详情页，拼接同作者所有连推段落，返回合并后的完整内容。
    若不是真正的 Thread（只有 1 条），返回 None。
    """
    try:
        await page.goto(tweet_url, wait_until="domcontentloaded", timeout=25_000)
        await page.wait_for_selector('article[data-testid="tweet"]', timeout=15_000)
        await page.wait_for_timeout(2_000)
    except Exception as e:
        print(f"        ⚠️  Thread 页面加载失败：{e}")
        return None

    parts = []
    seen_texts = set()

    articles = await page.query_selector_all('article[data-testid="tweet"]')
    for article in articles:
        # 检查作者是否匹配
        user_el = await article.query_selector('[data-testid="User-Name"]')
        if user_el:
            user_text = (await user_el.inner_text()).lower()
            if f"@{username.lower()}" not in user_text:
                break  # 遇到其他人的回复，停止
        else:
            break

        text_el = await article.query_selector('[data-testid="tweetText"]')
        if not text_el:
            continue
        content = (await text_el.inner_text()).strip()
        if content and content not in seen_texts:
            seen_texts.add(content)
            parts.append(content)

        if len(parts) >= MAX_THREAD_PARTS:
            break

    if len(parts) <= 1:
        return None  # 不是真正的连推

    return "\n\n".join(parts)


# ─── 页面抓取 ─────────────────────────────────────────────────────────────────


async def extract_tweets_from_page(page: Page, username: str) -> list:
    """从当前页面的所有 article 元素提取推文数据"""
    results = []
    articles = await page.query_selector_all('article[data-testid="tweet"]')

    for article in articles:
        try:
            # 推文正文
            text_el = await article.query_selector('[data-testid="tweetText"]')
            if not text_el:
                continue
            content = (await text_el.inner_text()).strip()
            if len(content) < MIN_CHARS:
                continue

            # 排除转推（有社交上下文标签的通常是转推/引用）
            social_ctx = await article.query_selector('[data-testid="socialContext"]')
            if social_ctx:
                ctx_text = (await social_ctx.inner_text()).lower()
                if "repost" in ctx_text or "retweeted" in ctx_text or "转发了" in ctx_text:
                    continue

            # 时间 & tweet_id
            time_el = await article.query_selector("time")
            tweet_time = None
            tweet_id = None
            tweet_url = ""
            if time_el:
                tweet_time = await time_el.get_attribute("datetime")
                # 从 time 的父 <a> 提取 URL
                link = await time_el.evaluate_handle(
                    "el => el.closest('a')"
                )
                if link:
                    href = await link.get_attribute("href")
                    if href and "/status/" in href:
                        tweet_id = href.split("/status/")[-1].split("?")[0].split("/")[0]
                        tweet_url = f"https://x.com{href}"

            if not tweet_id:
                continue

            # 检测是否是 Thread（搜索结果页会显示 "Show this thread" 链接）
            thread_hint = await article.query_selector(
                'a[data-testid="tweet-text-show-more-link"], '
                'div[role="link"]:has-text("Show this thread"), '
                'span:has-text("Show this thread")'
            )
            article_is_thread = thread_hint is not None or is_thread_start(content)

            # 点赞数
            likes = 0
            like_btn = await article.query_selector('[data-testid="like"]')
            if like_btn:
                aria = (await like_btn.get_attribute("aria-label")) or ""
                nums = re.findall(r"[\d,]+", aria.replace(",", ""))
                if nums:
                    likes = parse_count(nums[0])

            # 转发数
            retweets = 0
            rt_btn = await article.query_selector('[data-testid="retweet"]')
            if rt_btn:
                aria = (await rt_btn.get_attribute("aria-label")) or ""
                nums = re.findall(r"[\d,]+", aria.replace(",", ""))
                if nums:
                    retweets = parse_count(nums[0])

            # 回复数
            replies = 0
            reply_btn = await article.query_selector('[data-testid="reply"]')
            if reply_btn:
                aria = (await reply_btn.get_attribute("aria-label")) or ""
                nums = re.findall(r"[\d,]+", aria.replace(",", ""))
                if nums:
                    replies = parse_count(nums[0])

            results.append(
                {
                    "username": username,
                    "tweet_id": tweet_id,
                    "content": content,
                    "likes": likes,
                    "retweets": retweets,
                    "replies": replies,
                    "lang": detect_language(content),
                    "tweet_time": tweet_time,
                    "tweet_url": tweet_url,
                    "is_thread": 1 if article_is_thread else 0,
                }
            )

        except Exception:
            continue

    return results


async def scrape_one_kol(page: Page, username: str, conn: sqlite3.Connection) -> int:
    """抓取单个 KOL，返回新增推文数"""
    # 使用 -is:retweet 在搜索层排除转推，f=live 按时间排序
    query = f"from:{username} -is:retweet"
    encoded = query.replace(":", "%3A").replace(" ", "%20")
    url = f"https://x.com/search?q={encoded}&src=typed_query&f=live"

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    except Exception as e:
        print(f"    ⚠️  页面加载超时，跳过：{e}")
        return 0

    # 检查是否被跳转到登录页
    if "login" in page.url or "x.com/i/flow" in page.url:
        print("    ❌ 检测到登录页，session 可能已失效，请重新运行 login 模式")
        return 0

    # 等待推文加载，最多重试 3 次
    loaded = False
    for attempt in range(3):
        try:
            await page.wait_for_selector('article[data-testid="tweet"]', timeout=15_000)
            loaded = True
            break
        except Exception:
            retry_btn = await page.query_selector('button[data-testid="error-detail-retry"]')
            if not retry_btn:
                retry_btn = await page.query_selector('div[role="button"]:has-text("Retry")')
            if retry_btn:
                print(f"    🔄 检测到错误页，点击 Retry（第 {attempt+1} 次）...")
                await retry_btn.click()
                await page.wait_for_timeout(5_000)
            else:
                print(f"    🔄 重新加载页面（第 {attempt+1} 次）...")
                await page.reload(wait_until="domcontentloaded", timeout=20_000)
                await page.wait_for_timeout(5_000)

    if not loaded:
        no_result = await page.query_selector('[data-testid="empty_state_header_text"]')
        if no_result:
            print("    ℹ️  该用户搜索无结果")
        else:
            print("    ⚠️  加载失败，跳过")
        return 0

    await page.wait_for_timeout(2_000)

    seen_ids = set()
    saved = 0
    no_new_streak = 0
    thread_candidates = []  # 待展开的 Thread 推文

    for scroll_i in range(MAX_SCROLLS):
        tweets = await extract_tweets_from_page(page, username)

        new_this_scroll = 0
        for t in tweets:
            if t["tweet_id"] in seen_ids:
                continue
            seen_ids.add(t["tweet_id"])

            # 质量过滤
            passes = t["likes"] >= MIN_LIKES or t["retweets"] >= MIN_RETWEETS
            if not passes:
                continue

            if db_save_tweet(conn, t):
                saved += 1
                new_this_scroll += 1
                # 记录 Thread 开头，待展开
                if t.get("is_thread"):
                    thread_candidates.append(t)

        if scroll_i % 5 == 0 or new_this_scroll > 0:
            print(
                f"    滚动 {scroll_i+1:2d} | 本次新增 {new_this_scroll:2d} | "
                f"累计 {saved} 条 | 页面共 {len(tweets)} 条"
            )

        if saved >= MAX_TWEETS_PER_KOL:
            print(f"    ✅ 已达到上限 {MAX_TWEETS_PER_KOL} 条，停止滚动")
            break

        if new_this_scroll == 0:
            no_new_streak += 1
            if no_new_streak >= 3:
                print("    ℹ️  连续 3 次无新内容，结束")
                break
        else:
            no_new_streak = 0

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(int(SCROLL_DELAY * 1_000))

    # ── Thread 展开 ────────────────────────────────────────────────────────────
    if thread_candidates:
        print(f"\n    🧵 检测到 {len(thread_candidates)} 个 Thread，逐个展开完整内容...")
        for t in thread_candidates:
            print(f"       → {t['tweet_url']}")
            full_content = await fetch_thread_content(page, t["tweet_url"], username)
            if full_content and len(full_content) > len(t["content"]):
                db_update_thread_content(
                    conn, t["tweet_id"], full_content, detect_language(full_content)
                )
                print(
                    f"       ✅ 展开成功：{len(t['content'])} → {len(full_content)} 字符"
                    f"（{len(full_content.split(chr(10)+chr(10)))} 段）"
                )
            else:
                print(f"       ℹ️  非多段 Thread，跳过")
            await page.wait_for_timeout(3_000)

    return saved


# ─── 导出 JSON ────────────────────────────────────────────────────────────────


def export_to_json(conn: sqlite3.Connection) -> int:
    """将未导出的推文导出为 tweets-scraped.json（与 import-tweets-to-db.ts 兼容格式）"""
    rows = conn.execute(
        "SELECT username, tweet_id, content, likes, retweets, replies, lang, tweet_time, tweet_url, is_thread "
        "FROM tweets WHERE exported = 0"
    ).fetchall()

    if not rows:
        print("ℹ️  没有待导出的推文")
        return 0

    data = []
    for row in rows:
        username, tweet_id, content, likes, retweets, replies, lang, tweet_time, tweet_url, is_thread = row
        data.append(
            {
                "tweet_id": tweet_id,
                "kol_username": username,
                "content": content,
                "content_zh": content if lang == "zh" else "",
                "language": lang,
                "translated_at": None,
                "media_urls": [],
                "likes": likes,
                "retweets": retweets,
                "replies": replies,
                "views": 0,
                "tweet_time": tweet_time or "",
                "tweet_url": tweet_url or "",
                "is_retweet": False,
                "is_reply": False,
                "is_thread": bool(is_thread),
            }
        )

    OUTPUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    conn.execute("UPDATE tweets SET exported = 1 WHERE exported = 0")
    conn.commit()

    threads_count = sum(1 for d in data if d["is_thread"])
    print(f"✅ 已导出 {len(data)} 条推文（其中 Thread：{threads_count}）到 {OUTPUT_JSON}")
    return len(data)


# ─── 主流程 ───────────────────────────────────────────────────────────────────


async def cmd_login():
    """登录模式：打开浏览器，自动检测登录成功后保存 session"""
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    print("🔑 正在打开浏览器，请手动登录 X 账号...")
    print("   登录成功后会自动检测并保存 session，无需手动操作\n")

    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()
        await page.goto("https://x.com/login")

        print("⏳ 等待登录完成（最多 5 分钟）...")

        for _ in range(150):
            await asyncio.sleep(2)
            url = page.url
            if (
                "x.com/home" in url
                or ("x.com" in url and "login" not in url and "flow" not in url and "i/" not in url)
            ):
                print(f"✅ 检测到登录成功！当前页面：{url}")
                break
        else:
            print("⚠️  等待超时（5 分钟），session 可能未完全登录")

        await asyncio.sleep(2)
        await ctx.close()

    print("✅ Session 已保存！下次直接运行 scrape 模式即可。")


async def cmd_scrape(target_username: Optional[str] = None):
    """抓取模式"""
    usernames = load_usernames()
    if target_username:
        usernames = [target_username]
        print(f"🎯 单用户测试模式：@{target_username}")
    else:
        done = load_progress()
        remaining = [u for u in usernames if u not in done]
        print(f"📋 KOL 总数：{len(usernames)}，已完成：{len(done)}，待抓取：{len(remaining)}")
        usernames = remaining

    if not usernames:
        print("✅ 所有 KOL 已完成抓取！")
        return

    conn = init_db()
    done = load_progress()
    total_saved = 0

    SESSION_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        try:
            await page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30_000)
            await page.wait_for_timeout(2_000)
        except Exception as e:
            print(f"⚠️  打开主页失败：{e}，尝试重新创建页面...")
            page = await ctx.new_page()
            await page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30_000)
            await page.wait_for_timeout(2_000)
        if "login" in page.url or "x.com/i/flow" in page.url:
            print("❌ 未登录！请先运行：python scraper/x_scraper.py login")
            await ctx.close()
            conn.close()
            return

        print(f"\n🚀 开始抓取，共 {len(usernames)} 个 KOL\n")

        consecutive_timeouts = 0

        for i, username in enumerate(usernames):
            print(f"\n[{i+1}/{len(usernames)}] @{username}")

            try:
                saved = await scrape_one_kol(page, username, conn)
                total_saved += saved
                done.add(username)
                save_progress(done)
                print(f"  ✅ @{username} 完成，新增 {saved} 条 | 全局累计 {total_saved} 条")
                if saved == 0:
                    consecutive_timeouts += 1
                else:
                    consecutive_timeouts = 0
            except Exception as e:
                print(f"  ❌ @{username} 出错：{e}")
                consecutive_timeouts += 1

            if consecutive_timeouts >= 3:
                print(f"\n  ⏸️  连续 {consecutive_timeouts} 次无数据，冷却 {RATE_LIMIT_COOLDOWN}s 后继续...")
                await page.wait_for_timeout(RATE_LIMIT_COOLDOWN * 1_000)
                consecutive_timeouts = 0

            if i < len(usernames) - 1:
                await page.wait_for_timeout(int(KOL_DELAY * 1_000))

        await ctx.close()

    print(f"\n🎉 抓取完成！共新增 {total_saved} 条推文\n")
    db_stats(conn)

    print("\n📤 导出 JSON...")
    export_to_json(conn)
    conn.close()


def cmd_stats():
    """查看数据库统计"""
    conn = init_db()
    db_stats(conn)

    rows = conn.execute(
        "SELECT username, COUNT(*) as cnt FROM tweets GROUP BY username ORDER BY cnt DESC"
    ).fetchall()
    print(f"\n   各 KOL 推文数（Top 20）：")
    for username, cnt in rows[:20]:
        bar = "█" * min(cnt, 50)
        print(f"   {username:25s} {cnt:4d}  {bar}")

    conn.close()


def cmd_export():
    """手动导出 JSON"""
    conn = init_db()
    export_to_json(conn)
    conn.close()


# ─── 入口 ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="X 推文爬虫（支持 Thread 连推展开）")
    parser.add_argument(
        "mode",
        choices=["login", "scrape", "stats", "export"],
        help="运行模式",
    )
    parser.add_argument("--username", help="指定单个用户名（测试用）")
    args = parser.parse_args()

    if args.mode == "login":
        asyncio.run(cmd_login())
    elif args.mode == "scrape":
        asyncio.run(cmd_scrape(args.username))
    elif args.mode == "stats":
        cmd_stats()
    elif args.mode == "export":
        cmd_export()
