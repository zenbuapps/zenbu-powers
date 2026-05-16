# Integration — 與其他 agent / skill 的串接

milestone-tracker 是**資料層 + 視圖層**，不執行 engineering work。執行交給其他 agent / skill，本 skill 負責「掛接」與「狀態回報」。

## 整合矩陣

| 對象 | 整合動作 | 觸發時機 | 誰執行 |
|------|---------|---------|--------|
| `@zenbu-powers:planner` | planner 完成 plan 後 → `link-plan <slug> <plan-dir>` | planner agent 流程末 | planner agent |
| `@zenbu-powers:tdd-coordinator` | 完成 task 後 → 更新對應卡片 slice checkbox + `update-status` | tdd-coordinator 第 7 節「收尾藍圖」 | 主窗口 |
| `zenbu-powers:aibdd-carry-on-engineering-plan` | LGTM Phase 後 → 若 plan 屬某 milestone → update milestone slice + `update-status` | carry-on Feedback Loop (C) LGTM 後 | carry-on skill |
| `@zenbu-powers:clarifier` | discovery 完成後 → 若觸發 milestone-relevant 變動 → 提示 user `create milestone` | clarifier 流程末 | clarifier agent |
| `@zenbu-powers:doc-manager` | Incremental 場景 → 將 STATUS.md 摘要塞進 CLAUDE.md「Current Sprint」段 | doc-manager Incremental 流程 | doc-updater agent |
| `hooks/user-prompt-submit` | 每輪 prompt 注入 STATUS.md head -40 為 `<MILESTONE_STATUS>` 區塊 | 每次 user prompt | hook script |
| `hooks/reflex-dictionary.txt` | 第 10 條規定 AI 自查 milestone 行為 | 每輪 reflex 注入 | 主窗口讀後遵守 |

## 整合 1：planner → milestone-tracker

### 觸發

planner agent 完成 `./specs/` 規格 + 實作計劃後（agent 流程末，交接 tdd-coordinator 前）。

### 動作

planner 在「## 交接執行」段加：

```
若 cwd 內 specs/milestones/ 存在：
1. 判斷此 plan 屬於哪個 milestone（從 plan 的目標反推；或詢問用戶）
2. 呼叫 milestone-tracker link-plan <slug> <plan_dir 絕對路徑>
3. 在交接給 tdd-coordinator 的訊息中註明：「已掛接到 milestone {id}-{slug}」
```

### 實作位置

`agents/planner.agent.md` 的「交接執行」段。

## 整合 2：tdd-coordinator → milestone-tracker

### 觸發

tdd-coordinator 第 7 節「收尾藍圖」，主窗口完成最後 Green Gate 後。

### 動作

主窗口在 spawn `@zenbu-powers:doc-updater` 之前：

```
若 cwd 內 specs/milestones/ 存在 + tdd 任務有對應 milestone：
1. Read milestone 卡片，找到對應 slice checkbox
2. Edit 卡片，將該 slice 改為 [x]
3. 呼叫 milestone-tracker update-status
4. 若所有 slice 都 done → 提示 user 可 milestone-tracker complete <slug>
```

### 實作位置

`agents/tdd-coordinator.agent.md` 第 7 節「收尾藍圖」追加一項：

```
0. 若 cwd 內 specs/milestones/ 存在：主窗口更新對應 milestone slice + update-status
1. 主窗口跑最終 Green Gate 確認測試全綠
2. 主窗口 spawn @zenbu-powers:doc-updater 同步專案文件
...
```

## 整合 3：aibdd-carry-on → milestone-tracker

### 觸發

carry-on Feedback Loop (C) LGTM 後（簽核 Phase 卡片完成、移卡到 done/）。

### 動作

carry-on skill 在「LGTM 後一氣呵成」步驟末加：

```
若 cwd 內 specs/milestones/ 存在 + 此 plan_dir 已被某 milestone link：
1. 找到該 milestone 卡片（grep plan_dir）
2. 若該 milestone Slices 段對應條目存在 → 標 [x]
3. milestone-tracker update-status
```

### 實作位置

`skills/aibdd-carry-on-engineering-plan/SKILL.md`「## 使用者選擇 (C) — LGTM」段，或 `references/feedback-loop.md` 對應位置。

**非必要修改**——若 carry-on 流程不動，可由 reflex 第 10 條保證主窗口自查時更新。

## 整合 4：clarifier → milestone-tracker

### 觸發

clarifier discovery 完成後，發現需求是「新 feature / 新業務領域」（不是 bugfix / 微調）。

### 動作

clarifier 在 Hand-off 段加：

```
若 cwd 內 specs/milestones/ 存在 + 本次 discovery 屬「新 feature / 新業務領域」：
提示用戶：「此 discovery 是否要建立對應 milestone？建議：milestone-tracker create <suggested-slug>」
```

不強制——用戶可拒絕（單純技術探索可能不對應 milestone）。

### 實作位置

`agents/clarifier.agent.md` Hand-off 段（若該 agent 有的話）。

## 整合 5：doc-manager → milestone-tracker

### 觸發

doc-manager Incremental 場景（`specs/` 存在）。

### 動作

`@zenbu-powers:doc-updater` 同步 CLAUDE.md 時：

```
若 cwd 內 specs/milestones/STATUS.md 存在：
1. Read STATUS.md head -20（Section 1 + Section 3）
2. 將摘要塞進 CLAUDE.md「Current Sprint」段（若無則新增）
3. 註明「Auto-synced from specs/milestones/STATUS.md @ YYYY-MM-DD」
```

### 實作位置

`agents/doc-manager.agent.md`「### Incremental 場景」段，或 `agents/doc-updater.agent.md` 的同步邏輯。

## 整合 6：Hook 注入

詳見 `hook-injection.md`。

## 整合 7：reflex-dictionary 第 10 條

詳見主 SKILL.md「## 與 reflex-dictionary 的關係」段。

`hooks/reflex-dictionary.txt` 追加第 10 條：

```
10. **Milestone 自查**：cwd 內 `specs/milestones/` 存在 → 開工前自動 `milestone-tracker next` 找下一個任務，禁問 user「該做什麼」。新需求進來 → 自動 `milestone-tracker create` 寫進 todo/，禁口頭收下不歸檔。完成任務 → 自動 `milestone-tracker complete`，禁 user 提醒才更新。
```

## 整合的紀律

1. **不污染 non-milestone 專案**：所有整合都加 `cwd 內 specs/milestones/ 存在` 守門條件
2. **整合失敗不卡主流程**：milestone-tracker 動作失敗不應阻擋 planner / tdd / carry-on
3. **不腦補 milestone 對應關係**：若 plan 屬哪個 milestone 不明，明確問用戶或標 `[待確認]`
4. **絕對路徑通行**：所有 cross-skill 互動傳遞 plan_dir / milestone path 都用絕對路徑
5. **state 真相在資料夾**：cross-skill 更新時不靠 cache / metadata，重掃資料夾
