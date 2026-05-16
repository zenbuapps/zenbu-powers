# Milestone 卡片模板

每張 milestone 卡片就是一份可獨立閱讀的「mini-spec」，命名 `{id}-{slug}.md`，例如 `M01-ingestion-hardening.md`。

## 完整模板

```markdown
---
id: M01
slug: ingestion-hardening
title: Ingestion Hardening — Week 1-4
status: todo                              # todo / doing / done（顯示用，真相看資料夾）
depends_on: []                            # [M00, ...]
window: 2026-05-01 → 2026-06-15
owner: solo                               # solo / team / external
kpi:
  - 連續 7 天 cron 0 中斷
  - 每日 ingest ≥ 100 筆
  - PII filter 單元測試 26/26 過
engineering_plans: []                     # carry-on plan_dir 絕對路徑列表
created_at: 2026-05-01
started_at: null                          # start action 填
completed_at: null                        # complete action 填
---

## 商業目的（Why）

連續 7 天 cron 無中斷 + 量級驗證——證明資料層可靠，才有資格上 billing。
若資料層失效，後續 M02 billing 即使 ship 也是空殼。

## Definition of Done

KPI 三條全綠 + Sentry 0 critical 24h + 過 PII 法律紅線 audit。

## Slices（複雜 milestone 才拆）

- [x] S01 ingestion-probe Python POC
- [x] S02 austender-poller TS 正式版
- [x] S03 nsw-etender-poller TS 正式版
- [x] S04 AusTender ATM RSS + scrape
- [ ] S05 NSW endpoint 正式 URL 確認  ← **stuck，缺人工驗證**
- [ ] S06 7 day cron 觀察 + Slack alert

## Decisions

- 2026-05-14: 採 RSS + cheerio 路線（不用 Playwright）— 見 `progress/day-05-15/AUDIT-austender-atm-rss-discovery.md`
- 2026-05-01: 凍結 ingestion-probe Python，正式碼走 `packages/ocds-parser`

## Risks

- NSW endpoint 若被改 → 切備援 `andrewlorien/eTender-open-contracting-API`
- AusTender CloudFront 加 anti-bot → 觸發 kill switch + Slack alert
- ATM HTML schema 變動 → cheerio selector 失敗，需快速 patch

## Engineering Plans（carry-on plan_dir 連結）

無（純運維 milestone，沒走 AIBDD 7-phase）

或：

- `/Users/user/DEV/TenderBeat/specs/engineering-plans/atm-poller-202605/` — AusTender ATM scrape 規格化 plan

## Notes / Log

- 2026-05-14: ATM poller 上 prod，第 1 天觀察 OK
- 2026-05-15: cron 0 中斷，撈 142 筆
- 2026-05-16: cron 0 中斷，撈 138 筆

## Signoff

- [ ] KPI 全綠驗證 — 簽名: _________
- [ ] 已驗收交付 — 簽名: _________
```

## frontmatter 欄位說明

| 欄位 | 必填 | 說明 |
|------|------|------|
| `id` | 必 | `M00` `M01` `M99` 兩位數，順序遞增不重用 |
| `slug` | 必 | kebab-case，與檔名 `{id}-{slug}.md` 一致 |
| `title` | 必 | 人類可讀標題 |
| `status` | 必 | `todo` / `doing` / `done`（顯示用） |
| `depends_on` | 必 | 依賴的 milestone id list，無依賴填 `[]` |
| `window` | 選 | 預計時程，格式 `YYYY-MM-DD → YYYY-MM-DD` |
| `owner` | 選 | `solo` / `team` / `external`（協作者標識） |
| `kpi` | 必 | 可驗收的 KPI list，至少 1 條 |
| `engineering_plans` | 選 | carry-on plan_dir 絕對路徑 list |
| `created_at` | 必 | `create` action 填 |
| `started_at` | 選 | `start` action 填 |
| `completed_at` | 選 | `complete` action 填 |

## 卡片內文必有段落

1. **商業目的（Why）** — 為什麼做這個 milestone，與大計畫的連結
2. **Definition of Done** — 何時算完成（不是 task 列表，是驗收標準）
3. **Slices**（可選） — 內部任務拆解，用 checkbox
4. **Decisions** — 重要決策的時間 + 理由 + 參考文件
5. **Risks** — 已知風險與 mitigation
6. **Engineering Plans** — 連結到 carry-on plan_dir（若有）
7. **Notes / Log** — 執行過程記錄
8. **Signoff** — 簽核 checkbox（complete 時填）

## 卡片大小準則

- 純運維 / 單一目的 milestone：50-100 行 OK
- 複雜跨多 feature milestone：100-250 行
- 超過 300 行 → 應該拆成多個 milestone 或抽 carry-on plan 出去

## 命名規範

- 檔名：`M{兩位數}-{kebab-case-slug}.md`，例 `M01-ingestion-hardening.md`
- id `M00` 保留給 bootstrap / Day 0 設置類
- 不重用 id（即使 milestone 廢棄也保留 id 不重發）
- 廢棄的 milestone：移到 `done/` 並在 Notes 標「ABANDONED: {reason}」
