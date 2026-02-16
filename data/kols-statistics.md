# KOL 清单统计报告

> 生成日期：2026-02-16
> 数据来源：7 份类目调研报告

---

## 总览

| 指标 | 数值 |
|------|------|
| **去重后 KOL 总数** | 164 |
| **覆盖类目数** | 7 |
| **跨类目 KOL 数** | 11 |
| **High 优先级** | 42 |
| **Medium 优先级** | 99 |
| **Low 优先级** | 23 |

---

## 各类目 KOL 数量（含跨类目重复计数）

| 类目 | KOL 数量 | 占比 |
|------|----------|------|
| 设计产品 | 42 | 25.6% |
| AI技术 | 31 | 18.9% |
| 创业出海 | 29 | 17.7% |
| 投资理财 | 25 | 15.2% |
| 营销增长 | 23 | 14.0% |
| 商业财富 | 18 | 11.0% |
| 内容创作 | 13 | 7.9% |
| **合计（含重复）** | **181** | - |

> 注：因 11 个 KOL 跨多个类目，各类目求和 (181) > 去重总数 (164)

---

## 跨类目 KOL（11 个）

| 用户名 | 昵称 | 覆盖类目 |
|--------|------|----------|
| @ShaanVP | Shaan Puri | 投资理财、商业财富、内容创作、营销增长 |
| @Yangyixxxx | Yangyi | AI技术、商业财富、设计产品、内容创作 |
| @morganhousel | Morgan Housel | 投资理财、商业财富、内容创作 |
| @hnshah | Hiten Shah | 商业财富、设计产品、营销增长 |
| @levelsio | Pieter Levels | AI技术、创业出海 |
| @naval | Naval Ravikant | 商业财富、内容创作 |
| @mrsharma | Nik Sharma | 商业财富、营销增长 |
| @mizko | Mizko | 设计产品、内容创作 |
| @joulee | Julie Zhuo | 设计产品、内容创作 |
| @lennysan | Lenny Rachitsky | 设计产品、内容创作 |
| @danshipper | Dan Shipper | 内容创作、营销增长 |

---

## 优先级分布

| 优先级 | 数量 | 占比 |
|--------|------|------|
| High | 42 | 25.6% |
| Medium | 99 | 60.4% |
| Low | 23 | 14.0% |

---

## 各类目 High 优先级 KOL

### AI技术 (10 个 High)
@dotey, @vista8, @AndrewYNg, @karpathy, @xiaohuggg, @sama, @xicilion, @op7418, @levelsio, @skirano

### 创业出海 (7 个 High)
@levelsio, @marclouvier, @arvidkahl, @easychen, @tinyfool, @kiwicopple, @gefei55, @lyc_zh

### 投资理财 (8 个 High)
@unusual_whales, @PlanB, @RaoulGMI, @WillyWoo, @APompliano, @balajis, @cdixon, @VitalikButerin, @morganhousel, @ShaanVP

### 商业财富 (8 个 High)
@naval, @ShaanVP, @george__mack, @hnshah, @noahkagan, @andrewchen, @reidhoffman, @tobi, @mrsharma, @morganhousel

### 设计产品 (8 个 High)
@lukew, @joulee, @jnd1er, @MrAlanCooper, @scottbelsky, @brad_frost, @jmspool, @jasonfried, @rrhoover, @lennysan

### 内容创作 (4 个 High)
@ShaanVP, @waitbutwhy, @naval, @morganhousel, @joulee, @lennysan

### 营销增长 (5 个 High)
@CoderJeffLee, @chuhaiqu, @rotor187, @dharmesh, @SahilBloom, @ShaanVP, @hnshah, @mrsharma

---

## 数据来源文件

| # | 文件 | 类目 | 提取 KOL 数（原始） |
|---|------|------|-------------------|
| 1 | research/ai_tech_kols.md | AI技术 | ~42 |
| 2 | research/startup_global_kols.md | 创业出海 | ~41 |
| 3 | research/investment_finance_kols.md | 投资理财 | ~36 |
| 4 | research/business_wealth_kols.md | 商业财富 | ~24 |
| 5 | research/design_product_kols.md | 设计产品 | ~45 |
| 6 | research/content_creation_kols.md | 内容创作 | ~12 |
| 7 | research/marketing_growth_kols.md | 营销增长 | ~23 |

---

## 去重说明

- **原始提取总数**: ~223 条记录（含重复、含品牌账号）
- **去除品牌/产品官方账号**: 移除 7 个（StabilityAI, Midjourney, Runway, Qdrant, Weaviate, HuggingFace, SaaStr）
- **去除低活跃/不明身份账号**: 移除 28 个
- **跨类目去重**: 11 个 KOL 出现在多个类目，合并为单条记录并保留所有类目信息
- **最终去重后**: 164 个独立 KOL

---

## 输出文件

- `data/kols-list.json` - 完整的 164 个 KOL 清单（JSON 格式）
- `data/kols-statistics.md` - 本统计报告
