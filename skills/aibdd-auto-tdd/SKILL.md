---
name: aibdd-auto-tdd
description: >
  AIBDD TDD 流程統一決策中心——8 個 stage（control-flow / red / green / refactor /
  code-quality / step-template / schema-analysis / starter / test-skeleton）×
  3 語言（C# / PHP / TypeScript）的合一入口。
  從用戶 prompt 或上游 aibdd-auto-{control-flow,red,green,refactor} 委派觸發，
  依語言推斷與 stage 路由載入對應 references/{stage}/{language}.md。
  當用戶說「紅燈」「綠燈」「control-flow」「跑 BDD 自動化」「重構」「TDD 批次」
  「BDD pipeline」「test skeleton」「step template」「schema 分析」「骨架建立」等
  觸發詞時啟用。
---

# AIBDD Auto TDD 統一決策中心

> **本 skill 是 stage × language 的雙軸路由樞紐**。從觸發訊號決定 stage 與 language，再載入對應 reference。
>
> **可 user-invocable 也可被上游委派**：使用者可直接以「跑紅燈」「批次執行」等指令觸發；上游 `aibdd-auto-control-flow` / `aibdd-auto-red` / `aibdd-auto-green` / `aibdd-auto-refactor` 也會以 `aibdd-auto-tdd (stage=…, lang=…)` 形式委派。

---

## Trigger 辨識

### 使用者直接呼叫

下列觸發詞之一出現於 prompt 即啟用（依需求推斷 stage）：

| 觸發詞 | 推斷 stage |
|---|---|
| 「紅燈」「red」「跑紅燈」「實作測試」 | red |
| 「綠燈」「green」「跑通測試」「讓測試過」 | green |
| 「重構」「refactor」「清理程式碼」 | refactor |
| 「control-flow」「批次執行」「跑 BDD 自動化」「TDD 批次」「pipeline」 | control-flow |
| 「step template」「step 骨架」「step 模板」 | step-template |
| 「schema 分析」「schema-analysis」「schema 對齊」 | schema-analysis |
| 「starter」「骨架建立」「scaffolding」「初始化專案」 | starter |
| 「test skeleton」「test 骨架」「PHPUnit 骨架」 | test-skeleton |
| 「code quality」「品質規範」「code-quality」 | code-quality |

### 上游委派

以下 skill 會於 description 或執行流程中委派至本 skill：

- `aibdd-auto-control-flow` → `aibdd-auto-tdd (stage=control-flow, lang=…)`
- `aibdd-auto-red` → `aibdd-auto-tdd (stage=red, lang=…)`
- `aibdd-auto-green` → `aibdd-auto-tdd (stage=green, lang=…)`
- `aibdd-auto-refactor` → `aibdd-auto-tdd (stage=refactor, lang=…)`

委派 prompt 慣例：`aibdd-auto-tdd (stage=<stage>, lang=<csharp|php|typescript>, feature=<optional path>)`。

---

## Stage 流程圖

8 個 stage 的依賴關係（DAG），詳細圖見 `references/pipeline-overview.md`：

```
                    ┌───────────────┐
                    │   starter     │  (csharp / typescript only)
                    └──────┬────────┘
                           │
                    ┌──────▼────────┐
                    │ control-flow  │  (掃描 .feature → 派發迴圈)
                    └──────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼─────┐    ┌───────▼──────┐    ┌─────▼──────────┐
│schema-      │    │step-template │    │ test-skeleton  │
│analysis     │    │              │    │ (php only)     │
└───────┬─────┘    └───────┬──────┘    └─────┬──────────┘
        │                  │                  │
        └──────────────────▼──────────────────┘
                           │
                    ┌──────▼────────┐
                    │     red       │  (測試先失敗)
                    └──────┬────────┘
                           │
                    ┌──────▼────────┐
                    │    green      │  (最小增量讓測試過)
                    └──────┬────────┘
                           │
                    ┌──────▼────────┐
                    │   refactor    │ ◄── code-quality（refactor 載入規範）
                    └───────────────┘
```

### 三語言 stage 矩陣

| Stage | csharp | php | typescript |
|---|:---:|:---:|:---:|
| control-flow | OK | OK | OK |
| red | OK | OK | OK |
| green | OK | OK | OK |
| refactor | OK | OK | OK |
| code-quality | OK | OK | OK |
| step-template | OK | **N/A** | OK |
| schema-analysis | OK | **N/A** | OK |
| starter | OK | **N/A** | OK |
| test-skeleton | **N/A** | OK | **N/A** |

合計 27 格 = 22 實 + 5 N/A stub。

---

## 語言推斷

讀取專案根目錄訊號決定 language：

| 訊號 | 推斷 lang |
|---|---|
| `*.csproj` / `appsettings.json` / `Program.cs` 存在 | csharp |
| `composer.json` 含 `wordpress` 或 `wp-env` 設定檔 | php |
| `package.json` 含 `react` / `vitest` / `@testing-library/react` | typescript |

### 推不出時詢問

無明確訊號或多個訊號並存時，以 AskUserQuestion 詢問：

```
偵測到多個技術棧訊號（或未偵測到）。請選擇本次 TDD 工作的目標語言：
A. C# (.NET 8 / EF Core / SpecFlow)
B. PHP (WordPress / PHPUnit)
C. TypeScript (React / Vitest / MSW)
```

不要憑直覺猜；缺訊號時必問。

---

## Stage 路由表

決定 (stage, lang) 後，Read 對應 reference：

| Stage | csharp | php | typescript |
|---|---|---|---|
| control-flow | `references/control-flow/csharp.md` | `references/control-flow/php.md` | `references/control-flow/typescript.md` |
| red | `references/red/csharp.md` | `references/red/php.md` | `references/red/typescript.md` |
| green | `references/green/csharp.md` | `references/green/php.md` | `references/green/typescript.md` |
| refactor | `references/refactor/csharp.md` | `references/refactor/php.md` | `references/refactor/typescript.md` |
| code-quality | `references/code-quality/csharp.md` | `references/code-quality/php.md` | `references/code-quality/typescript.md` |
| step-template | `references/step-template/csharp.md` | `references/step-template/php.md` (**N/A stub**) | `references/step-template/typescript.md` |
| schema-analysis | `references/schema-analysis/csharp.md` | `references/schema-analysis/php.md` (**N/A stub**) | `references/schema-analysis/typescript.md` |
| starter | `references/starter/csharp.md` | `references/starter/php.md` (**N/A stub**) | `references/starter/typescript.md` |
| test-skeleton | `references/test-skeleton/csharp.md` (**N/A stub**) | `references/test-skeleton/php.md` | `references/test-skeleton/typescript.md` (**N/A stub**) |

> **N/A stub** 不代表「請略過」——而是代表「此語言走另一路徑」。每份 stub 內含「替代路徑」指引，務必 Read 後依指引轉向。

---

## 共用規則（跨語言適用）

audit 觀察三語言 80%+ 雷同的規則抽至此處，各 reference 不再重複。

### CR1：紅燈/綠燈/重構三相循環

- **Red**：測試先寫且**必須失敗**（環境正常但 Value Difference）；若失敗訊息為「環境問題」（連不上 DB / 找不到專案），不算合格紅燈，必須先修環境。
- **Green**：以**最小增量**讓單一測試通過，不過度設計、不預期未來需求。
- **Refactor**：在綠燈保護下兩階段——Phase A 先清理測試碼、Phase B 再清理生產碼；每一小步都跑測試確認不破壞。

### CR2：中文狀態映射

Gherkin 中文業務術語（「進行中」「已完成」「已付款」等）一律映射為 enum 值；映射表共用，見 `aibdd-handlers/SKILL.md` §中文狀態對應表。前端 UI 顯示中文是例外（不反映射），其他場景禁止憑空猜測。

### CR3：嚴格順序（strict ordering）

control-flow 派發迴圈時，每個 .feature 嚴格依「schema-analysis → step-template → red → green → refactor」順序展開（PHP 變體改為「test-skeleton → red → green → refactor」），不得跳階。每階段未通過完成條件不得進入下一階段。

### CR4：Lazy loading

- 主 SKILL.md（本檔）只載入決策骨架，**不**內嵌任何語言特化程式碼。
- 決定 (stage, lang) 後才 Read 對應 reference。
- reference 內若需 handler 程式碼，再進一步路由至 `aibdd-handlers (handler=…, lang=…)`，不在本 skill 重抄。

### CR5：Handler 路由保留

`aibdd-handlers` 是獨立 skill（refactor-2 產出），各 reference 中見到 `aibdd-handlers (handler=…, lang=…)` 引用時**保持**該路由不變，不要把 handler 內容合進本 skill。

---

## 載入語言特化 reference 的標準流程

1. **辨識 trigger** → 推斷 stage（用戶 prompt 或上游 prompt 含 `stage=…`）。
2. **推斷 lang**（讀取訊號或詢問用戶）。
3. **查 Stage 路由表** → 取得 reference 路徑。
4. **若該格為 N/A stub**：Read stub → 依「替代路徑」轉向（通常指向 step-template 或下一 stage）。
5. **若為實 reference**：Read → 依該 reference 的「完成條件」執行。
6. **跨 stage cross-link**：reference 內若需引用其他 stage，使用 `§stage X 章節 (lang=Y)` 錨點或重新呼叫 `aibdd-auto-tdd (stage=X, lang=Y)`。

---

## 與 aibdd-handlers 的關係

- `aibdd-handlers` 處理「step 句型 → handler 類型 → 程式碼樣板」（refactor-2 已合併完成）。
- `aibdd-auto-tdd`（本 skill）處理「stage × language → 流程 reference」（refactor-3 進行中）。
- 兩者**正交**：red / step-template / refactor 等 reference 內仍會引用 `aibdd-handlers (handler=…, lang=…)`，這些引用**保持不變**。

---

## 完成條件 / Hand-off

- 收到觸發 → 完成 (stage, lang) 雙軸路由 → Read 並執行對應 reference 的完成條件 → 回報結果。
- 路由失敗（缺訊號且用戶未回覆）→ 暫停並等待 AskUserQuestion 答覆。
- 跨 stage 串接：每完成一階段，自動展開下一階段 TODO（control-flow 變體會做這件事）。

---

## Hand-off / Next Agent

- 本 skill 為 **refactor-3 Stage B 交付物**之一，路徑 `skills/aibdd-auto-tdd/SKILL.md`。
- 同步交付：
  - `references/pipeline-overview.md`（流程總圖）
  - 22 個實作 reference（由 3 個語言 reference agent 並行產出）
  - 5 個 N/A stub references（本 agent 同步產出）
- 本階段**未刪除**舊 22 個 `aibdd.auto.{lang}.(it.)?{stage}` skill，**未修改**任何下游引用（`aibdd-auto-control-flow` / `aibdd-auto-red` / `agents/test-creator.agent.md` / `README.md`）。
- **交還 orchestrator**：等待 3 個語言 reference agent 完成各自的 22 個 reference，再進 Stage C（依 `docs/refactor-3-audit.md` 表 2.2 的 10 處跨 skill 引用更新）。
- Stage D 再處理舊 22 個 SKILL.md 的 stub 化或刪除。
