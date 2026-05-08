# AIBDD Auto TDD — 流程總圖（Pipeline Overview）

> 本檔詳述 8 stage × 3 lang 的依賴關係、缺位矩陣、跨 stage 引用邏輯。
> 載入順序：上游 / 使用者觸發 → `aibdd-auto-tdd/SKILL.md` → 本檔 → 各 stage × lang reference。

---

## 1. 完整 DAG（依賴圖）

```mermaid
flowchart TD
    Starter[starter<br/>csharp / typescript]
    CF[control-flow<br/>3 langs]
    SA[schema-analysis<br/>csharp / typescript]
    ST[step-template<br/>csharp / typescript]
    TS[test-skeleton<br/>php]
    Red[red<br/>3 langs]
    Green[green<br/>3 langs]
    Refactor[refactor<br/>3 langs]
    CQ[code-quality<br/>3 langs]

    Starter -->|專案首次建立| CF
    CF -->|每個 .feature 派發| SA
    CF -->|每個 .feature 派發| ST
    CF -->|每個 .feature 派發 (php)| TS
    SA -->|環境就緒| Red
    ST -->|骨架就緒| Red
    TS -->|骨架就緒 (php)| Red
    Red -->|測試失敗確立| Green
    Green -->|測試通過| Refactor
    CQ -.載入規範.-> Refactor
```

### 關鍵說明

- **starter**：一次性，專案初始化時執行（PHP 由 wp-env 處理，無此 stage）。
- **control-flow**：批次迴圈中樞；掃描 `specs/features/*.feature` 後為每個 feature 展開 phase TODO。
- **schema-analysis + step-template / test-skeleton**：紅燈前置（兩條平行支線）。
  - csharp / typescript：schema-analysis（檢查 EF Core / Zod / API client schema 是否與 `api.yml` + `erm.dbml` 對齊）+ step-template（生 SpecFlow / Cucumber step 骨架）。
  - php：test-skeleton（直接生 PHPUnit 測試類別骨架）。
- **red → green → refactor**：核心 TDD 三相，所有語言必經。
- **code-quality**：refactor 階段的「規範字典」，非獨立執行的 stage，由 refactor reference 載入。

---

## 2. 缺位矩陣（5 個 N/A 與原因）

| Stage | 缺位語言 | 原因（從 audit 表 1 / 額外觀察 1 抽取） |
|---|---|---|
| **schema-analysis** | php | PHP IT 在 WordPress 既有結構上跑，schema 由 WP API 動態決定，無 schema 推導需求；ERM 已由 plugin 內既有 model 體現。 |
| **starter** | php | wp-env 初始化由前置流程處理（`@wordpress/env` 提供 docker-compose 環境），無需獨立 scaffolding。 |
| **step-template** | php | PHPUnit 測試框架直接在 test-skeleton 階段生成完整 step assertion；無「step → handler」中介層。 |
| **test-skeleton** | csharp | SpecFlow 從 `.feature` 自動對映 step（`[Given/When/Then(@regex)]` 屬性），不需先生骨架；step-template 已涵蓋。 |
| **test-skeleton** | typescript | Cucumber + Vitest 同理；step-template 直接產出 `defineFeature` / `test.each` 結構，無獨立 skeleton 階段。 |

### 替代路徑速查（N/A stub 內會詳述）

- php × schema-analysis → 直接進 test-skeleton。
- php × starter → 由 wp-env 前置流程處理；本 skill 不涉入。
- php × step-template → 改用 test-skeleton（PHP 變體合併兩 stage 為一）。
- csharp × test-skeleton → 改用 step-template。
- typescript × test-skeleton → 改用 step-template。

---

## 3. 跨 stage 引用邏輯

> 從 `docs/refactor-3-audit.md` 表 3 的「出度 / 入度」分析提煉。

### 3.1 高密度節點（hub）

| Stage | 引用其他 stage | 被其他 stage 引用 | 處理建議 |
|---|---|---|---|
| **control-flow** | starter, schema-analysis, step-template, test-skeleton, red, green, refactor | starter (csharp), red (3 langs), green (php), refactor (php) | hub 角色；reference 內以 `§stage X 章節 (lang=Y)` 錨點互相引用 |
| **red** | control-flow（description）, schema-analysis, step-template, test-skeleton, starter | control-flow (3 langs), test-skeleton (php), green (php), starter (csharp) | 三步驟流程（schema → template → red）需跨 stage 串接 |
| **refactor** | code-quality（重複載入） | control-flow (3 langs), green (php), code-quality (csharp / php) | 與 code-quality 為「載入規範」關係；reference 中以 `§code-quality (lang=Y) §章節` 錨點引用 |

### 3.2 葉節點（無出度或低出度）

| Stage | 出度 | 處理建議 |
|---|---|---|
| **starter** | 僅引用 control-flow（後續流程） | 葉節點；reference 簡短 |
| **schema-analysis** | 0 | 葉節點；被 red 引用 |
| **step-template** | 0 | 葉節點；被 red 引用 |
| **test-skeleton** | 引用 control-flow + red | 上下游指引型 |
| **green** | 出度幾乎為零 | 葉節點；可獨立 |
| **code-quality** | 引用 refactor（「供 refactor 載入」） | 反向引用；不應重複載入 |

### 3.3 跨 stage 引用的合併後重寫規則

合併前（22 個獨立 SKILL.md）：

```
請執行 /zenbu-powers:aibdd.auto.csharp.it.schema-analysis
```

合併後（references 內部）：

```
請參考 §schema-analysis (lang=csharp) 章節
（路徑：references/schema-analysis/csharp.md）
```

或在主流程中重新觸發路由：

```
aibdd-auto-tdd (stage=schema-analysis, lang=csharp, feature=…)
```

兩者擇一：reference 內部交叉引用優先用「§錨點」；若需從另一 stage 主動跳轉至本 stage，則用主 skill 路由形式。

---

## 4. 三語言流程差異速查

### 4.1 csharp / typescript（標準 5+1 phase）

```
starter（一次性）
  ↓
control-flow → schema-analysis → step-template → red → green → refactor
                                                              ↑
                                                       code-quality（載入）
```

### 4.2 php（4+1 phase，無 starter / schema-analysis / step-template）

```
（wp-env 前置）
  ↓
control-flow → test-skeleton → red → green → refactor
                                              ↑
                                       code-quality（載入）
```

---

## 5. 共用 prose 抽出統計（合併後分布）

依 audit「共用 prose 可抽出比例」估算：

| Stage | 主 SKILL.md 共用 | references 各語言獨有 |
|---|---:|---:|
| code-quality | ~25% | ~75% |
| control-flow | ~70% | ~30% |
| green | ~15% | ~85% |
| red | ~60% | ~40% |
| refactor | ~80% | ~20% |
| schema-analysis | ~5% | ~95% |
| starter | ~30% | ~70% |
| step-template | ~40% | ~60% |
| test-skeleton | n/a (php only) | 100% |

> 主 SKILL.md（本 skill 主檔）已抽出 CR1-CR5 共用規則；reference 不重抄。

---

## 6. 與 aibdd-handlers 的銜接

`aibdd-handlers` 處理「step 句型 → handler 類型 → 樣板」；`aibdd-auto-tdd` 處理「stage × lang → 流程」。兩者於以下交點銜接：

- **step-template / test-skeleton 階段**：reference 內展開 step 骨架時，引用 `aibdd-handlers (handler=…, lang=…)` 取得 handler 樣板。
- **red 階段**：reference 內實作測試方法時，引用 `aibdd-handlers (handler=…, lang=…)` 載入完整程式碼。
- **refactor 階段**：reference 內清理 `[Handler: xxx]` 註解前，引用 `aibdd-handlers/SKILL.md` 確認分類正確。

這些跨 skill 引用**不**搬入本 skill；refactor-2 已正確切分職責。

---

## 7. 觸發決策樹（雙軸路由）

```
收到 prompt
  │
  ├─ 含 stage=… lang=… 明示參數？
  │   ├─ 是 → 直接路由
  │   └─ 否 ↓
  │
  ├─ 推斷 stage（從觸發詞 / 上游 description）
  │   └─ 不確定 → AskUserQuestion 列出 8 stage 讓用戶挑
  │
  ├─ 推斷 lang（讀檔訊號）
  │   ├─ 唯一訊號 → 用該 lang
  │   ├─ 多訊號並存 → AskUserQuestion 三選一
  │   └─ 無訊號 → AskUserQuestion 三選一
  │
  ├─ 查 Stage 路由表
  │   ├─ 實 reference → Read 並執行
  │   └─ N/A stub → Read stub → 依「替代路徑」轉向
  │
  └─ 完成條件達成 → 回報；若上游期待串接，自動展開下一 stage TODO
```

---

## 8. 邊緣情況

### 8.1 用戶 prompt 不含明示 stage（純口語）

例：「幫我跑一下這個 feature 的測試」→ 推斷 stage=control-flow，lang 看訊號。

### 8.2 一個 prompt 涉及多 stage

例：「先跑紅燈再跑綠燈再重構」→ 路由為 control-flow（control-flow 本身會展開 red → green → refactor）。

### 8.3 Stage 與語言衝突

例：用戶說「跑 PHP 的 schema-analysis」→ 該格為 N/A，Read stub 後依替代路徑轉向 test-skeleton；同時告知用戶該 stage 在 PHP 不適用的原因。

### 8.4 跨 stage 串接失敗

紅燈未達成「合格失敗」（環境問題）→ 不進綠燈；先回到 schema-analysis 或 starter 修環境。具體判斷在各 reference 的「完成條件」段落。
