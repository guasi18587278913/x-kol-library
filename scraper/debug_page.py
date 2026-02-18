#!/usr/bin/env python3
"""调试脚本：检查搜索页面内容"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

SESSION_DIR = Path(__file__).parent.parent / "data" / "browser-session"

async def main():
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            args=["--no-sandbox"],
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        url = "https://x.com/search?q=from%3Akarpathy+-is%3Aretweet&src=typed_query&f=live"
        print(f"导航到：{url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
        print(f"当前 URL：{page.url}")

        # 等待更长时间
        print("等待 8 秒让页面完全加载...")
        await page.wait_for_timeout(8_000)
        print(f"等待后 URL：{page.url}")

        # 截图
        screenshot_path = Path(__file__).parent / "debug_screenshot.png"
        await page.screenshot(path=str(screenshot_path))
        print(f"截图保存到：{screenshot_path}")

        # 查找推文元素
        articles = await page.query_selector_all('article[data-testid="tweet"]')
        print(f"\narticle[data-testid='tweet'] 数量：{len(articles)}")

        # 尝试其他选择器
        articles2 = await page.query_selector_all('article')
        print(f"article 数量（无属性过滤）：{len(articles2)}")

        cells = await page.query_selector_all('[data-testid="cellInnerDiv"]')
        print(f"cellInnerDiv 数量：{len(cells)}")

        # 打印页面 title
        title = await page.title()
        print(f"页面标题：{title}")

        # 看看有没有登录提示
        login_btn = await page.query_selector('[data-testid="loginButton"]')
        print(f"有登录按钮：{login_btn is not None}")

        # 打印前 500 字节 body 文本
        body_text = await page.evaluate("document.body.innerText.slice(0, 500)")
        print(f"\n页面文字（前 500 字符）：\n{body_text}")

        input("\n按 Enter 关闭浏览器...")
        await ctx.close()

asyncio.run(main())
