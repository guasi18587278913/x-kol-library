# Twitter/X 内容抓取技术方案

> 调研日期：2026-02-16

---

## 一、抓取方法对比

### 1.1 方案总览

| 维度 | 官方 X API | 第三方数据 API | 开源爬虫库 | MCP 工具（已集成） |
|------|-----------|---------------|-----------|-------------------|
| 代表工具 | X API v2 | TwitterAPI.io / SociaVault / Bright Data | twscrape / twikit | x-mcp（当前项目已有） |
| 数据质量 | 最高，官方保证 | 高，结构化数据 | 中等，依赖维护 | 高，基于浏览器自动化 |
| 稳定性 | 高 | 中高 | 低（X 每 2-4 周更新反爬策略） | 中（依赖浏览器环境） |
| 成本 | 高（$200-$5000+/月） | 中（按量付费） | 免费（人力维护成本） | 免费（需登录态） |
| 数据范围 | 受 tier 限制 | 较全面 | 公开数据 | 公开数据 |
| 是否需要审批 | 需申请开发者账号 | 无需 | 无需 | 无需 |
| 合规风险 | 低 | 中 | 高 | 中 |

### 1.2 各方案详细分析

#### 方案 A：官方 X API v2

**优点：**
- 数据最准确、最完整
- 官方支持，合规无忧
- 提供 since_id 等增量查询参数，天然支持增量更新
- 支持 Streaming API 实时推送

**缺点：**
- 价格昂贵：Basic $200/月（15K tweets），Pro $5000/月（1M tweets），Enterprise $42,000+/月
- 需要申请开发者账号，审批流程不透明
- 免费 tier 仅支持写操作（发推），不支持读取
- 速率限制严格

**适用场景：** 预算充足的商业项目，对数据合规性要求高的场景。

#### 方案 B：第三方数据 API

**代表服务商及定价：**

| 服务商 | 定价模式 | 参考价格 | 特点 |
|-------|---------|---------|------|
| TwitterAPI.io | 按量付费 | $0.15/1000 tweets | 覆盖 96% 的官方 API 功能，无需开发者账号 |
| SociaVault | 信用点系统 | ~$99/月（监控 3 个账号） | 信用点永不过期，灵活使用 |
| Bright Data | 按记录付费 | ~$0.0009/record | 全球代理网络，反检测能力强 |
| ScrapingDog | 按量付费 | 免费 1000 credits 试用 | 提供 Dashboard + Python SDK |
| Apify | 平台订阅 | 按 actor 运行次数计费 | 托管执行环境，无需自建服务器 |

**优点：**
- 性价比高，相比官方 API 节省 90%+ 费用
- 无需维护爬虫代码
- 大多提供结构化 JSON 输出
- 部分支持增量查询

**缺点：**
- 依赖第三方服务稳定性
- 数据时效性取决于服务商
- 可能存在合规灰色地带

**适用场景：** 中等预算，需要稳定数据源但不想自建爬虫的项目。

#### 方案 C：开源爬虫库

**主要工具：**

| 工具 | 语言 | 是否需要 API Key | GitHub Stars | 维护状态 |
|------|------|-----------------|-------------|---------|
| twscrape | Python | 需要账号登录 | 活跃 | 2025 年仍在更新 |
| twikit | Python | 不需要 | 活跃 | 2025 年仍在更新 |
| snscrape | Python | 不需要 | 已停止维护 | 不推荐 |
| twint | Python | 不需要 | 已停止维护 | 不推荐 |

**优点：**
- 完全免费
- 代码可控，灵活定制
- 支持搜索、用户时间线、关注列表等多种数据

**缺点：**
- X 平台每 2-4 周更新反爬策略，需频繁维护
- IP 封禁风险高，需要代理池
- 账号可能被封，需要多账号池
- 数据完整性无法保证

**适用场景：** 技术能力强、数据量要求不高、愿意投入维护精力的项目。

#### 方案 D：当前已有 MCP 工具（x-mcp）

**当前项目已集成的能力：**
- `scrape_profile` - 抓取用户资料
- `scrape_posts` - 抓取当前页帖子
- `scrape_timeline` - 抓取时间线
- `search_twitter` - 搜索推文
- `scrape_comments` - 抓取评论

**优点：**
- 已经集成，开箱即用
- 支持浏览器自动化，绕过部分反爬
- 可与 Claude AI 直接对接

**缺点：**
- 依赖浏览器环境运行
- 吞吐量受限于单浏览器实例
- 不适合大批量自动化抓取

**适用场景：** 原型验证、小规模数据采集、交互式使用。

### 1.3 推荐方案

**分阶段实施策略：**

| 阶段 | 方案 | 说明 |
|------|------|------|
| MVP 阶段 | MCP 工具（x-mcp）+ twikit | 零成本验证产品可行性 |
| 增长阶段 | TwitterAPI.io | 按量付费，成本可控，稳定性好 |
| 规模化阶段 | 官方 API Pro + TwitterAPI.io 混合 | 保证合规 + 控制成本 |

---

## 二、更新频率策略建议

### 2.1 数据分类与更新频率

| 数据类型 | 更新频率 | 策略 | 理由 |
|---------|---------|------|------|
| KOL 基本资料 | 每天 1 次 | 定时任务 | 资料变动频率低 |
| KOL 最新推文 | 每 2-4 小时 | 定时轮询 | 保持内容时效性 |
| 热门推文指标（点赞/转发） | 每 6 小时 | 增量更新 | 指标变化有衰减期 |
| KOL 关注/粉丝列表 | 每周 1 次 | 全量刷新 | 变动缓慢 |
| 推文评论 | 发布后 48h 内每 4h，之后每天 | 衰减策略 | 评论集中在发布初期 |

### 2.2 智能更新策略

```
┌─────────────────────────────────────────────┐
│              智能更新调度器                    │
├─────────────────────────────────────────────┤
│                                             │
│  1. 活跃度感知：                              │
│     - 高活跃 KOL（日均 5+ 推文）→ 每 1h 检查   │
│     - 中活跃 KOL（日均 1-5 推文）→ 每 4h 检查   │
│     - 低活跃 KOL（周均 <5 推文）→ 每 12h 检查   │
│                                             │
│  2. 时段感知：                               │
│     - 北京时间 22:00-08:00（美西白天）加密       │
│     - 北京时间 08:00-22:00 适当降频             │
│                                             │
│  3. 事件驱动：                               │
│     - 检测到热门推文 → 立即加密更新评论和指标     │
│     - 检测到新关注者暴增 → 触发资料更新          │
│                                             │
└─────────────────────────────────────────────┘
```

### 2.3 API 配额优化

- 使用 `since_id` 参数实现增量拉取，避免重复获取已有数据（可节省约 95% 配额）
- 按优先级排序抓取队列：高价值 KOL 优先
- 使用 ETag/Last-Modified 缓存机制减少无效请求
- 批量请求合并：单次请求获取多个用户的数据

---

## 三、数据存储方案

### 3.1 数据库选型对比

| 数据库 | 适合场景 | 优势 | 劣势 | 推荐度 |
|-------|---------|------|------|-------|
| **PostgreSQL + JSONB** | 结构化 + 半结构化混合 | SQL 查询强大，JSONB 支持灵活存储，生态丰富 | 水平扩展较复杂 | ★★★★★ |
| MongoDB | 纯文档存储 | Schema-less，天然 JSON，水平扩展好 | 复杂查询弱于 SQL，一致性设置复杂 | ★★★★☆ |
| SQLite | 轻量级/本地开发 | 零配置，单文件，适合原型 | 并发写入受限，不适合生产 | ★★★☆☆ |
| Supabase (PostgreSQL) | 全托管 + 实时 | 内置 Auth/Storage/Realtime，免费 tier 可用 | 定价随数据量增长 | ★★★★★ |

### 3.2 推荐方案：PostgreSQL（Supabase 托管）

**理由：**
1. 推文数据虽然是 JSON 格式，但结构相对固定（作者、内容、时间、指标），适合关系型建模
2. PostgreSQL 的 JSONB 可以存储推文的原始 JSON 作为备份
3. SQL 查询能力强大，支持复杂的 KOL 分析需求（聚合、排序、窗口函数）
4. Supabase 提供免费 tier（500MB 数据库），足够 MVP 阶段使用
5. 内置实时订阅功能，可用于推送更新通知

### 3.3 数据模型设计（建议）

```sql
-- KOL 基本信息表
CREATE TABLE kols (
    id            BIGSERIAL PRIMARY KEY,
    twitter_id    VARCHAR(64) UNIQUE NOT NULL,
    username      VARCHAR(64) NOT NULL,
    display_name  VARCHAR(256),
    bio           TEXT,
    followers     INTEGER DEFAULT 0,
    following     INTEGER DEFAULT 0,
    tweet_count   INTEGER DEFAULT 0,
    category      VARCHAR(64),          -- 分类：AI/创业/投资 等
    avatar_url    TEXT,
    raw_profile   JSONB,                -- 原始 JSON 备份
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 推文表
CREATE TABLE tweets (
    id            BIGSERIAL PRIMARY KEY,
    tweet_id      VARCHAR(64) UNIQUE NOT NULL,
    kol_id        BIGINT REFERENCES kols(id),
    content       TEXT NOT NULL,
    media_urls    TEXT[],
    likes         INTEGER DEFAULT 0,
    retweets      INTEGER DEFAULT 0,
    replies       INTEGER DEFAULT 0,
    views         INTEGER DEFAULT 0,
    language      VARCHAR(10),
    is_retweet    BOOLEAN DEFAULT FALSE,
    is_reply      BOOLEAN DEFAULT FALSE,
    tweet_time    TIMESTAMPTZ NOT NULL,
    raw_tweet     JSONB,                -- 原始 JSON 备份
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 推文指标历史（用于追踪增长趋势）
CREATE TABLE tweet_metrics (
    id            BIGSERIAL PRIMARY KEY,
    tweet_id      BIGINT REFERENCES tweets(id),
    likes         INTEGER,
    retweets      INTEGER,
    replies       INTEGER,
    views         INTEGER,
    recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 抓取任务状态表（用于增量更新管理）
CREATE TABLE scrape_state (
    id            SERIAL PRIMARY KEY,
    kol_id        BIGINT REFERENCES kols(id),
    task_type     VARCHAR(32),          -- 'tweets' / 'profile' / 'followers'
    last_tweet_id VARCHAR(64),          -- since_id 用于增量拉取
    last_run_at   TIMESTAMPTZ,
    next_run_at   TIMESTAMPTZ,
    status        VARCHAR(16) DEFAULT 'idle',
    error_count   INTEGER DEFAULT 0
);

-- 索引优化
CREATE INDEX idx_tweets_kol_time ON tweets(kol_id, tweet_time DESC);
CREATE INDEX idx_tweets_tweet_id ON tweets(tweet_id);
CREATE INDEX idx_kols_username ON kols(username);
CREATE INDEX idx_kols_category ON kols(category);
CREATE INDEX idx_scrape_next_run ON scrape_state(next_run_at) WHERE status = 'idle';
```

---

## 四、增量更新机制设计

### 4.1 核心原理

```
┌──────────────────────────────────────────────────────┐
│                  增量更新流程                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. 调度器触发 → 读取 scrape_state 表                  │
│  2. 获取 last_tweet_id (since_id)                     │
│  3. 调用 API: GET /tweets?since_id={last_tweet_id}    │
│  4. 仅返回 since_id 之后的新推文                       │
│  5. 写入 tweets 表（UPSERT 防重复）                    │
│  6. 更新 scrape_state.last_tweet_id 为最新 tweet_id   │
│  7. 根据活跃度计算下次运行时间                          │
│                                                      │
│  关键点：服务端过滤，节省 95% API 配额                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 4.2 UPSERT 策略

```sql
-- 推文写入使用 UPSERT，避免重复插入，同时更新指标
INSERT INTO tweets (tweet_id, kol_id, content, likes, retweets, replies, views, tweet_time, raw_tweet)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (tweet_id)
DO UPDATE SET
    likes = EXCLUDED.likes,
    retweets = EXCLUDED.retweets,
    replies = EXCLUDED.replies,
    views = EXCLUDED.views,
    updated_at = NOW();
```

### 4.3 调度器伪代码

```python
async def run_scrape_scheduler():
    while True:
        # 获取所有待执行的抓取任务
        tasks = await db.fetch("""
            SELECT s.*, k.username
            FROM scrape_state s
            JOIN kols k ON s.kol_id = k.id
            WHERE s.next_run_at <= NOW()
              AND s.status = 'idle'
            ORDER BY s.next_run_at ASC
            LIMIT 10
        """)

        for task in tasks:
            # 标记任务进行中
            await db.execute(
                "UPDATE scrape_state SET status='running' WHERE id=$1",
                task['id']
            )

            try:
                # 使用 since_id 增量拉取
                new_tweets = await fetch_tweets(
                    username=task['username'],
                    since_id=task['last_tweet_id']
                )

                # UPSERT 新推文
                for tweet in new_tweets:
                    await upsert_tweet(tweet)

                # 更新状态
                latest_id = new_tweets[0]['id'] if new_tweets else task['last_tweet_id']
                interval = calculate_next_interval(len(new_tweets))

                await db.execute("""
                    UPDATE scrape_state SET
                        last_tweet_id = $1,
                        last_run_at = NOW(),
                        next_run_at = NOW() + $2::interval,
                        status = 'idle',
                        error_count = 0
                    WHERE id = $3
                """, latest_id, interval, task['id'])

            except Exception as e:
                await db.execute("""
                    UPDATE scrape_state SET
                        status = 'idle',
                        error_count = error_count + 1,
                        next_run_at = NOW() + INTERVAL '30 minutes' * (error_count + 1)
                    WHERE id = $1
                """, task['id'])

        await asyncio.sleep(60)  # 每分钟检查一次

def calculate_next_interval(new_tweet_count: int) -> str:
    """根据新推文数量动态调整下次抓取间隔"""
    if new_tweet_count > 10:
        return '1 hour'      # 非常活跃
    elif new_tweet_count > 3:
        return '2 hours'     # 活跃
    elif new_tweet_count > 0:
        return '4 hours'     # 一般
    else:
        return '12 hours'    # 不活跃
```

### 4.4 错误恢复机制

| 场景 | 处理方式 |
|------|---------|
| API 限流 (429) | 指数退避重试，最长等待 30 分钟 |
| 账号被封 | 切换备用账号池，标记失效账号 |
| 网络超时 | 3 次重试后标记为失败，下次调度补偿 |
| 数据异常 | 记录原始响应到日志表，人工审查 |
| 连续失败 3 次 | 降低该 KOL 的抓取优先级，发送告警 |

---

## 五、成本估算

### 5.1 场景假设

- 监控 KOL 数量：100 人
- 每个 KOL 日均发推：3 条
- 每日新增推文：~300 条
- 每日更新指标的推文数：~1000 条（含历史热门推文）
- 需要抓取的总请求数：~2000 次/天

### 5.2 各方案月度成本估算

#### 方案一：纯官方 API

| 项目 | 费用 |
|------|------|
| X API Basic ($200/月，15K tweets) | $200/月 |
| 月请求量：2000 x 30 = 60,000 | 需升级到 Pro |
| X API Pro ($5000/月，1M tweets) | $5,000/月 |
| 服务器（1C2G 云主机） | ~$10/月 |
| **合计** | **~$5,010/月** |

#### 方案二：第三方 API（推荐）

| 项目 | 费用 |
|------|------|
| TwitterAPI.io（$0.15/1000 tweets） | 60K tweets x $0.15/1000 = $9/月 |
| 服务器（1C2G 云主机） | ~$10/月 |
| Supabase 免费 tier（500MB） | $0/月 |
| **合计** | **~$19/月** |

#### 方案三：开源爬虫 + MCP

| 项目 | 费用 |
|------|------|
| 爬虫软件成本 | $0 |
| 代理 IP 池（防封禁） | ~$20-50/月 |
| 多账号维护（5-10 个备用号） | $0（但有封号风险） |
| 服务器（2C4G 云主机，需运行浏览器） | ~$20/月 |
| Supabase 免费 tier | $0/月 |
| 人力维护（每月 ~4h 应对反爬更新） | 隐性成本 |
| **合计** | **~$40-70/月 + 人力** |

#### 方案四：混合方案（MVP 推荐）

| 项目 | 费用 |
|------|------|
| 高优先 KOL（20人）用 TwitterAPI.io | ~$3/月 |
| 其他 KOL 用 twikit/MCP 工具 | $0 |
| 服务器 | ~$10/月 |
| Supabase 免费 tier | $0/月 |
| **合计** | **~$13/月** |

### 5.3 成本优化建议

1. **善用 since_id**：增量拉取可节省 95% 的 API 配额
2. **本地缓存**：对已获取的推文做本地缓存，避免重复请求
3. **智能调度**：不活跃的 KOL 降低抓取频率
4. **分级策略**：核心 KOL 用付费 API 保障质量，长尾 KOL 用免费工具
5. **批量操作**：合并 API 请求，减少调用次数

---

## 六、综合推荐方案

### MVP 阶段（0-3 个月）

```
数据源：MCP (x-mcp) + twikit 开源库
存储：Supabase (PostgreSQL) 免费 tier
调度：简单 cron job / Node.js setInterval
预算：~$0-13/月
目标：验证 100 个 KOL 的数据采集可行性
```

### 增长阶段（3-12 个月）

```
数据源：TwitterAPI.io 为主 + MCP 为辅
存储：Supabase Pro ($25/月)
调度：自建调度器 + 优先级队列
预算：~$50-100/月
目标：稳定监控 200+ KOL，建立知识库
```

### 规模化阶段（12 个月+）

```
数据源：官方 API Basic + TwitterAPI.io 混合
存储：自建 PostgreSQL / Supabase Team
调度：分布式任务队列 (BullMQ / Celery)
预算：~$300-500/月
目标：500+ KOL，支撑多用户使用的 Agent 服务
```

---

## 参考资料

- [X API 官方定价](https://twitterapi.io/blog/twitter-api-pricing-2025)
- [TwitterAPI.io - 第三方替代方案](https://twitterapi.io/blog/twitter-api-alternatives-comprehensive-guide-2025)
- [Twikit - 免 API Key 的 Python 爬虫](https://github.com/d60/twikit)
- [twscrape - 带授权的 Twitter 爬虫](https://github.com/vladkens/twscrape)
- [Best Twitter Scrapers 2025 - Apify](https://blog.apify.com/best-twitter-x-scrapers/)
- [Twitter Scraping APIs 对比](https://medium.com/@darshankhandelwal12/4-best-x-twitter-scraping-apis-in-2025-tested-for-scalability-speed-pricing-e6f50866182f)
- [PostgreSQL vs MongoDB 2025](https://www.bytebase.com/blog/postgres-vs-mongodb/)
- [SociaVault - Twitter API 替代](https://sociavault.com/blog/twitter-api-alternative-2025)
- [Desearch.ai - 实时搜索 API](https://github.com/ruanyf/weekly/issues/8509)
