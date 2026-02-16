-- ========================================
-- 推特大佬电子阅览室 - 初始种子数据
-- ========================================

-- ========================================
-- 1. 插入 7 个类目
-- ========================================
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
    ('AI 技术',   'ai-tech',          '人工智能、大语言模型、Prompt 工程、AI Agent、AI 绘画等前沿技术领域的顶级 KOL',                    '🤖', 1),
    ('创业出海',  'startup-global',    '独立开发者、出海创业、SaaS 产品、跨境电商等全球化创业领域的先行者',                                '🚀', 2),
    ('投资理财',  'investment-finance', '加密货币、风险投资、个人理财、宏观经济分析等投资领域的思想领袖',                                    '💰', 3),
    ('商业财富',  'business-wealth',   '商业战略、企业管理、创业心法、财富积累等商业智慧的分享者',                                          '💼', 4),
    ('设计产品',  'design-product',    '产品设计、用户体验、设计系统、产品管理等领域的资深从业者',                                          '🎨', 5),
    ('内容创作',  'content-creation',  '写作技巧、Newsletter 运营、个人品牌、知识付费等内容创作领域的标杆人物',                              '✍️', 6),
    ('营销增长',  'marketing-growth',  'SEO、社交媒体营销、增长黑客、品牌建设等营销增长领域的实战专家',                                      '📈', 7);

-- ========================================
-- 2. 插入示例 KOL 数据（完整数据由 Data Collector 导入）
-- ========================================
INSERT INTO kols (twitter_id, username, display_name, bio, avatar_url, followers, categories, tags, profile_url) VALUES
    -- AI 技术
    ('1234567890', 'dotey',       '宝玉',         'Prompt Engineer，专注 LLM 精品课程翻译、Prompt 学习、AI 行业第一手资讯', '', 100000, '["ai-tech"]',                '["Prompt", "LLM", "翻译", "AI工具"]',           'https://x.com/dotey'),
    ('1234567891', 'op7418',      '歸藏',         '关注 AI、LLM、AI 图像视频和设计，AIGC 周刊主理人',                       '', 80000,  '["ai-tech", "design-product"]', '["LLM", "AI绘画", "AIGC", "设计"]',           'https://x.com/op7418'),
    ('1234567892', 'xiaohuggg',   '小互',         '每天更新大量 AI 新闻和工具资讯，ChatGPT 使用技巧分享专家',                 '', 50000,  '["ai-tech"]',                '["ChatGPT", "AI新闻", "AI工具"]',               'https://x.com/xiaohuggg'),
    ('1234567893', 'xicilion',    '响马',         '西祠胡同创始人，经常分享 LLM Agent 实战经验，干货很多',                    '', 30000,  '["ai-tech"]',                '["Agent", "LLM", "实战"]',                      'https://x.com/xicilion'),
    ('1234567894', 'vista8',      '向阳乔木',      '前字节员工，关注科技与社会，分享 Prompt 和 Vibe Coding 经验',             '', 40000,  '["ai-tech"]',                '["Prompt", "Vibe Coding", "Claude"]',           'https://x.com/vista8'),

    -- 创业出海
    ('1234567895', 'levelsio',    'Pieter Levels', 'Building #startups. NomadList, RemoteOK, PhotoAI. Making $XM/yr.',     '', 500000, '["startup-global"]',         '["独立开发", "SaaS", "数字游民"]',                'https://x.com/levelsio'),
    ('1234567896', 'gefei55',     '哥飞',         '出海赚美刀，专注 SEO + 出海实战',                                        '', 60000,  '["startup-global", "marketing-growth"]', '["出海", "SEO", "独立开发"]',          'https://x.com/gefei55'),

    -- 投资理财
    ('1234567897', 'naval',       'Naval',        'Angel investor. Founder AngelList.',                                    '', 2000000, '["investment-finance", "business-wealth"]', '["投资", "哲学", "创业"]',        'https://x.com/naval'),

    -- 设计产品
    ('1234567898', 'joulee',      'Julie Zhuo',   'Former VP of Product Design at Facebook. Author of The Making of a Manager.', '', 300000, '["design-product"]', '["产品设计", "管理", "Facebook"]',             'https://x.com/joulee'),

    -- 内容创作
    ('1234567899', 'waitbutwhy',  'Tim Urban',    'Writer at Wait But Why.',                                              '', 700000, '["content-creation"]',       '["写作", "深度文章", "思维"]',                    'https://x.com/waitbutwhy');

-- ========================================
-- 3. 插入示例推文数据
-- ========================================
INSERT INTO tweets (tweet_id, kol_username, content, likes, retweets, replies, views, tweet_time, tweet_url) VALUES
    ('1834125238939861437', 'dotey',     '解析李继刚的汉语新解 Prompt，深入探讨如何用伪代码与 Claude 完美结合...', 1200, 300, 80, 50000, '2024-09-12 10:00:00+08', 'https://x.com/dotey/status/1834125238939861437'),
    ('1792839908727623883', 'op7418',    'LLM 竞技场长难句测试分析，对比各大模型在复杂中文理解上的表现...', 800, 200, 50, 30000, '2024-05-21 14:30:00+08', 'https://x.com/op7418/status/1792839908727623883'),
    ('1733509609959379094', 'vista8',    '推荐中文 AI 圈优秀账号，整理了一份值得关注的 AI 创作者清单...', 600, 150, 40, 20000, '2023-12-09 20:00:00+08', 'https://x.com/vista8/status/1733509609959379094');

-- ========================================
-- 4. 刷新类目统计数据
-- ========================================
SELECT refresh_category_counts();
