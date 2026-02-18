#!/usr/bin/env python3
"""诊断脚本：看 X 搜索页面实际返回什么"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

SESSION_DIR = Path(__file__).parent.parent / "data" / "browser-session"
OUT_DIR = Path(__file__).parent

async def main():
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            args=["--no-sandbox"],
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        tests = [
            # 测试1：带 -is:retweet
            ("https://x.com/search?q=from%3Ahanqing_me+-is%3Aretweet&src=typed_query&f=live", "test1_with_filter"),
            # 测试2：不带 filter
            ("https://x.com/search?q=from%3Ahanqing_me&src=typed_query&f=live", "test2_no_filter"),
            # 测试3：直接访问用户主页
            ("https://x.com/hanqing_me", "test3_profile"),
        ]

        for url, name in tests:
            print(f"\n测试：{name}")
            print(f"URL：{url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
            await page.wait_for_timeout(10_000)
            print(f"当前 URL：{page.url}")

            articles = await page.query_selector_all('article[data-testid="tweet"]')
            print(f"推文数量：{len(articles)}")

            # 截图
            sc = OUT_DIR / f"{name}.png"
            await page.screenshot(path=str(sc))
            print(f"截图：{sc}")

            # 页面文字
            body = await page.evaluate("document.body.innerText.slice(0, 300)")
            print(f"页面文字：{body[:200]}")

        await ctx.close()

asyncio.run(main())
