# STATUS.md 模板

STATUS.md 是**每週快照 dashboard**——人類 30 秒掃完知道「現在做啥 / 還剩啥 / 下一步」。

設計原則：
- **三段固定**（現在做到哪 / 還有哪些未做 / 下一步 48h）
- **每週至少更新 1 次**（建議每週五）
- **AI 每完成一個 task / slice 也要重算**（`update-status` action）
- **頁首注入給 AI**：hook 取 `head -40` 餵給每輪 prompt

## 完整模板

```markdown
# {Project Name} Status

> **最後更新**: {YYYY-MM-DD HH:mm}
> **整體目標**: {一句話，例：90 天內取得 1 個付費客戶}
> **整體 KPI**: 0 / 1 付費客戶

## 1. 現在做到哪（Active）

**Active milestone**: M01-ingestion-hardening (Week 3/4)

| Slice | 狀態 |
|-------|------|
| S01 ingestion-probe Python POC | ✅ done |
| S02 austender-poller TS 正式版 | ✅ done |
| S03 nsw-etender-poller TS 正式版 | ✅ done |
| S04 AusTender ATM RSS + scrape | ✅ done |
| S05 NSW endpoint 正式 URL 確認 | 🔄 doing — **blocker：缺人工驗證** |
| S06 7 day cron 觀察 + Slack alert | ⏳ pending |

**This week 焦點**：cron 7 day 觀察期 Day 4 / 7，期待 0 中斷。

**Blockers**：
- S05 NSW endpoint：官方 OCDS feed URL 不公開，需手動 F12 撈
- ANTHROPIC_API_KEY 月初續費忘了，AI summary 仍 placeholder

## 2. 還有哪些未做（Pending）

按時序：

- [ ] M01 收尾 — 剩 ~1 週（NSW endpoint + 7 day cron 觀察）
- [ ] M02 Billing — Week 7-8（Stripe checkout + reverse charge flow + ToS 上線）
- [ ] M03 Customer Acquisition — Week 9-10（cold outreach × 50 封 → 5 個 trial）
- [ ] M03 收尾 — Week 11-12（1 個付費客戶）

## 3. 下一步 48h

1. **撈 NSW 正式 OCDS endpoint** — 開 Chrome DevTools 看 `tenders.nsw.gov.au` Network tab，找 XHR 含 `releases` 的 URL
2. **ATM poller Sentry alert noise 調整** — 連續 3 個相同 error 才 fire，目前每筆都觸發
3. **起 M02 草稿** — 從 `pivot-1b-executable-plan.md` §5 Week 7-8 抽 Stripe scope 進新卡片

## 4. KPI / Burn 監控

| 指標 | 現值 | 目標 | 趨勢 |
|------|-----|------|------|
| 付費客戶 | 0 | ≥ 1 by Week 12 | — |
| Trial 用戶 | 0 | ≥ 5 by Week 10 | — |
| 月 AUD spend | $42 | ≤ $100 | → |
| Ingestion success 24h | ✅ 138 筆 | ≥ 100 | → |
| PII filter tests | 26/26 ✅ | 26/26 | → |
| Sentry critical 24h | 0 | 0 | → |

## 5. 最近 2 週重大事件

- 2026-05-14: ATM poller 上 prod
- 2026-05-13: AusTender CloudFront 加 UA 過濾，補上 User-Agent header
- 2026-05-10: PII filter 補 ATM scrape 新欄位（contact email），測試 +3

## 6. 風險與決策待定

- 🟡 NSW endpoint 若 3 天內無法確認 → 切備援 `andrewlorien/eTender-open-contracting-API`，但延後 M01 收尾 ~3 天
- 🟢 ATM cron 7 day 若全綠 → M01 提前 1 週收，可提早起 M02
- ⚪ Stripe Atlas 公司還沒成立 — Week 6 前必須完成，否則 M02 卡住

---

**Auto-injected by hook**: 開頭 40 行注入給每輪 prompt，AI 自動知道 active milestone 與 next 48h。
```

## 各段更新規則

### Section 1: 現在做到哪

| 來源 | 內容 |
|------|------|
| `specs/milestones/doing/` | 列出所有 doing 卡片 |
| 每張 doing 卡片的 Slices 段 | 抽 checkbox 狀態 |
| 每張 doing 卡片的 Risks / Notes 最新一條 | 抽 Blockers |

每次 `update-status` 重算這段。

### Section 2: 還有哪些未做

| 來源 | 內容 |
|------|------|
| `specs/milestones/todo/` | 列出所有 todo 卡片 |
| 每張卡片 frontmatter `window:` | 排時序 |
| ROADMAP.md 線性順序 | 對齊 |

按時序由近至遠，每張 milestone 一行（不展開 slice）。

### Section 3: 下一步 48h

| 來源 | 內容 |
|------|------|
| Active milestone 下一個未 done slice | 1-3 條 |
| 用戶在卡片 Notes 段標 `NEXT:` | 抓出來 |

**不超過 3 條**——太多就不是「下一步 48h」。

### Section 4: KPI / Burn 監控

| 來源 | 內容 |
|------|------|
| 用戶手動更新 / 整合 metrics endpoint | 各 metric 現值 |
| ROADMAP.md「整體 KPI」段 | 目標 |

趨勢：↑ ↓ → 用戶手動標。

### Section 5: 最近 2 週重大事件

| 來源 | 內容 |
|------|------|
| 各卡片 Notes / Log 段最新 5 條 | 抽出來 |
| `git log --since="2 weeks ago" --oneline` | 補關鍵 commit |

### Section 6: 風險與決策待定

| 來源 | 內容 |
|------|------|
| 各 doing / todo 卡片 Risks 段 | 篩 active risks |
| 標籤 🔴 critical / 🟡 warn / 🟢 ok / ⚪ TBD | |

## STATUS.md 不該放的東西

- ❌ 完整 milestone 描述（在卡片內）
- ❌ 技術設計細節（在 specs/engineering-plans/）
- ❌ 歷史紀錄超過 2 週（在 git log 或卡片 Notes）
- ❌ 已完成 milestone 詳情（看 ROADMAP.md 摘要 + done/ 卡片）

## Hook 注入的 head -40

`hooks/user-prompt-submit` 取 STATUS.md 前 40 行注入給 AI——剛好覆蓋：

- 頁首（最後更新時間 + 整體目標 + KPI）
- Section 1（現在做到哪 + Slice 表 + Blockers）
- Section 2 開頭（Pending 列表）

token 量 ≤ 500，足夠 AI 知道「我現在該做啥」。

詳見 `hook-injection.md`。
