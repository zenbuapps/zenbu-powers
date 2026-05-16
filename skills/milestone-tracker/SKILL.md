---
name: milestone-tracker
description: >
  專案級任務追蹤管理：以資料夾狀態機（todo/doing/done）+ 卡片 + ROADMAP + STATUS dashboard
  維持商業視角的 milestone 管理。AI 開工前自動查 active milestone，新需求自動歸檔成卡片，
  完成任務自動更新 STATUS——讓人類 5 秒看懂大計畫，AI 不再問「我該做什麼」。
  與 zenbu-powers:aibdd-carry-on-engineering-plan 互補：本 skill 管 business / project-level
  （Week 1-12、KPI、商業目標），carry-on 管 feature-level engineering plan（7-phase AIBDD）。
  一個 milestone 卡片可掛多個 carry-on plan_dir。
  當使用者說「milestone」「roadmap」「任務追蹤」「進度更新」「下一個任務」「now what」
  「目前進度」「現在做到哪」「初始化 milestone」「create milestone」「complete milestone」
  「milestone status」「update roadmap」時觸發。
---

# Milestone Tracker

專案級任務追蹤管理，以**資料夾狀態機**為單一真相，**ROADMAP/STATUS markdown** 為人類視圖。

## 與其他 skill 的職責邊界

| Skill | 層級 | 管什麼 |
|-------|------|--------|
| **`zenbu-powers:milestone-tracker`**（本 skill） | business / project-level | Week 1-12、KPI、商業目標、跨多 feature 的進度 dashboard |
| `zenbu-powers:aibdd-carry-on-engineering-plan` | feature-level engineering plan | 7-phase AIBDD 規格化 + 紅綠重構 |
| `zenbu-powers:plan` | single-feature implementation plan | 一個 feature 內的步驟 / 風險 / 資料流 |

**串接關係**：一個 milestone 卡片可掛 ≥ 1 個 carry-on `plan_dir`；planner 完成 plan 後寫進 milestone `engineering_plans` 欄位。

## References 導覽

| 檔案 | 何時載入 | 內容 |
|------|---------|------|
| `references/card-template.md` | `create` / `start` action | milestone 卡片 frontmatter + 內文模板 |
| `references/roadmap-template.md` | `init` action | ROADMAP.md 一頁式大計畫模板 |
| `references/status-template.md` | `init` / `update-status` action | STATUS.md 三段式 dashboard 模板 |
| `references/integration.md` | 與 planner / tdd-coordinator / doc-manager 串接時 | 整合協議與動作觸發時機 |
| `references/hook-injection.md` | 改 hook 或 debug 注入問題時 | user-prompt-submit hook 的 milestone status 注入區塊規範 |

## 專案內資料結構（操作對象）

```
{repo}/specs/milestones/
├── ROADMAP.md           # 大計畫一頁總覽（業務目標 + Week 1-12 + KPI；人類視角）
├── STATUS.md            # 每週快照：現在做到哪 / 還剩什麼 / 下一步 48h
├── milestones.yml       # machine-readable index（AI 查任務入口、單一真相）
├── todo/                # M0X-{slug}.md 待開
│   ├── M02-billing-stripe.md
│   └── M03-customer-acquisition.md
├── doing/               # 進行中
│   └── M01-ingestion-hardening.md
└── done/                # 已完成
    └── M00-day0-bootstrap.md
```

**狀態由卡片所在資料夾決定。** 不依卡片 frontmatter 的 `status:` 欄位判斷（frontmatter 是顯示用，folder 是真相）。

## 動作清單

| Action | 觸發詞範例 | 行為 |
|--------|-----------|------|
| `init` | 「初始化 milestone」「setup roadmap」「建 milestone 系統」 | 建空 `specs/milestones/` + 從模板產 ROADMAP.md + STATUS.md + milestones.yml |
| `next` | 「下一個任務」「now what」「現在該做什麼」 | 掃 todo/、檢查 dependency、回傳第一個可動 milestone |
| `create <slug>` | 「新增 milestone X」「加一個 M0X」 | 寫卡片進 todo/，更新 milestones.yml + ROADMAP.md |
| `start <slug>` | 「開始 M0X」「進入 M0X」 | mv todo/→doing/，建 TodoWrite，更新 STATUS.md |
| `complete <slug>` | 「完成 M0X」「M0X 過關」「LGTM M0X」 | mv doing/→done/，簽名，更新 STATUS.md + ROADMAP.md |
| `update-status` | 「更新進度」「重算 STATUS」 | 掃資料夾 + 卡片 checkbox，重算 STATUS.md |
| `report` | 「目前進度」「現在做到哪」「milestone status」 | 印三段式快照（active / pending / next 48h），不寫檔 |
| `link-plan <slug> <plan-dir>` | planner / carry-on 完成後串接 | 把 plan_dir 寫進卡片 engineering_plans 欄位 |

## 啟動流程（被觸發後做什麼）

1. **判斷 cwd**：必須在專案 root（有 `.git` 或 `package.json` / `pyproject.toml` / `composer.json`）。
2. **檢查 `specs/milestones/` 是否存在**：
   - 不存在 → 若用戶意圖是 `init`，跑 init 流程；否則告知「尚未初始化，請先說『初始化 milestone』」
   - 存在 → 依用戶意圖路由到對應 action
3. **執行 action**：依下方各 action 規範執行，**全部使用絕對路徑**操作檔案
4. **回報**：簡短報結果 + 必要時更新 TodoWrite

## Action 規範

### `init`

1. 建立目錄：`specs/milestones/{todo,doing,done}/`
2. 從 `references/roadmap-template.md` 產 `ROADMAP.md`（占位符以 cwd 專案資訊填）
3. 從 `references/status-template.md` 產 `STATUS.md`（初始為空）
4. 產 `milestones.yml`（空 list）
5. 詢問用戶要不要立即 `create` 第一個 milestone

**禁止**：在已有 `specs/milestones/` 的專案重跑 init 覆蓋掉檔案。發現存在 → 中止 + 告知。

### `next`

1. Read `milestones.yml`（拿 dependency graph）
2. List `specs/milestones/todo/`
3. 篩選 dependency 全在 `done/` 中的卡片
4. 排除 `doing/` 中的（其他 AI 占用）
5. 依 ROADMAP.md 線性順序挑第一個
6. 回報：「下一個可動：M0X-{slug}（依賴：…，預計工時：…）」
7. **不自動 `start`**——等用戶確認或 reflex 自動觸發

### `create <slug>`

1. 從 `references/card-template.md` 拷貝模板
2. 互動或從上下文填 frontmatter（id / title / depends_on / window / kpi）
3. 寫入 `specs/milestones/todo/{id}-{slug}.md`
4. append 到 `milestones.yml`
5. update `ROADMAP.md` 對應段落

### `start <slug>`

1. 找卡片在 `todo/{id}-{slug}.md`（不存在 → 中止）
2. `mv todo/→doing/`
3. update frontmatter `status: doing`、`started_at: YYYY-MM-DD`
4. 建 TodoWrite（只建當前 milestone 的 slice 為 task）
5. update `STATUS.md` Active 段
6. 回報：「M0X 已啟動，當前 slice：…」

### `complete <slug>`

1. 找卡片在 `doing/{id}-{slug}.md`（不存在 → 中止）
2. 檢查卡片內所有 KPI checkbox 是否打勾——未打勾**警告但不阻擋**（業務判斷給用戶）
3. 在卡片 Signoff 段填簽名 `YYYY-MM-DD HH:mm`
4. `mv doing/→done/`
5. update frontmatter `status: done`、`completed_at: YYYY-MM-DD`
6. update `STATUS.md`、`ROADMAP.md`、`milestones.yml`
7. 自動 `next` 報下一個

### `update-status`

1. 掃三個資料夾盤點
2. Read 每張卡片 frontmatter + slice checkbox 進度
3. 重寫 `STATUS.md`（依 `references/status-template.md` 結構）
4. **不動 ROADMAP.md** 與 milestones.yml（那是設計時改的，不是執行時）

### `report`

純讀，不寫檔。三段式輸出：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Milestone Report — {project_name} — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. 現在做到哪
Active: M01-ingestion-hardening (Week 3/4)
進度: 4/6 slices done
Blocker: S05 NSW endpoint 待人工驗證

## 2. 還有哪些未做
- [ ] M01 收尾（剩 ~1 週）
- [ ] M02 billing-stripe（Week 7-8）
- [ ] M03 customer-acquisition（Week 9-12）

## 3. 下一步 48h
1. S05 NSW endpoint 候選 URL 撈出來
2. ATM poller Sentry alert noise 調整
3. 起 M02 草稿

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### `link-plan <slug> <plan-dir>`

1. 找卡片在 `todo/` 或 `doing/`
2. 將 `<plan-dir>` 絕對路徑 append 到 frontmatter `engineering_plans:` list
3. 在卡片內文「Engineering Plans」段加項目連結

## 規則（不可違反）

1. **絕對路徑**：所有檔案操作用絕對路徑，報告中展示也用絕對路徑
2. **資料夾是狀態真相**：frontmatter `status:` 只是顯示用，真相看資料夾
3. **不搶 `doing/`**：看到 `doing/` 中有卡片，視為其他 AI / 另一 session 在處理，跳過
4. **簽名格式固定**：`YYYY-MM-DD HH:mm`（無姓名）
5. **不腦補 milestone**：用戶沒指定就用 `create` 互動填，缺資訊標 `[待確認]`
6. **不污染 non-milestone 專案**：cwd 沒 `specs/milestones/` 且用戶意圖不是 init → 不做事
7. **與 carry-on 不重疊**：本 skill 不執行 engineering plan，只標 link；執行交 `zenbu-powers:aibdd-carry-on-engineering-plan`
8. **TodoWrite 只建當前 milestone**：不批次建未來 milestone 的 task

## Hook 注入（讓 AI 自動知道任務）

詳見 `references/hook-injection.md`。摘要：

`hooks/user-prompt-submit` 偵測 cwd 內有 `specs/milestones/STATUS.md` 時，自動將 `head -40` 內容注入為 `<MILESTONE_STATUS>` 區塊，AI 每輪都看到當前進度，不靠用戶提醒。

控制：
- 環境變數 `ZENBU_MILESTONE_TRACKER_DISABLED=1` 可關閉
- 與 reflex / aibdd-mode 共用 override keyword（直接 / 自己來 / 跳過 skill 等命中時整段跳過）

## 與 reflex-dictionary 的關係

reflex-dictionary.txt 第 10 條規定 AI 行為：

> **Milestone 自查**：cwd 內 `specs/milestones/` 存在 → 開工前自動 `milestone-tracker next` 找下一個任務，禁問 user「該做什麼」。新需求進來 → 自動 `milestone-tracker create` 寫進 todo/，禁口頭收下不歸檔。完成任務 → 自動 `milestone-tracker complete`，禁 user 提醒才更新。

本 skill 是該條規則的執行工具。

## 範例：TenderBeat 場景

```
# 用戶說「現在做到哪」
→ 觸發 report action
→ 輸出三段式快照（讀 STATUS.md + 列 doing/ + 從卡片算 next 48h）

# 用戶說「我想加一個 milestone 做 email digest」
→ 觸發 create action
→ 互動填 frontmatter：M04 / email-digest / depends_on=[M02] / window=Week 9-10 / kpi
→ 寫 specs/milestones/todo/M04-email-digest.md
→ 更新 milestones.yml + ROADMAP.md

# 用戶說「M01 收尾了」
→ 觸發 complete M01-ingestion-hardening
→ 檢查 KPI checkbox
→ 簽名 + mv done/ + 更新 STATUS / ROADMAP
→ 自動 next 報「下一個可動：M02-billing-stripe」

# 用戶說「跑 BDD」（含 BDD 觸發詞）
→ AIBDD mode 注入啟動 → 派 clarifier
→ clarifier 走 7-phase 規格化
→ specformula 產 aibdd plan_dir
→ 主窗口自動 milestone-tracker link-plan M02-billing-stripe /path/to/aibdd-plan
→ 進入 aibdd-carry-on 執行
```
