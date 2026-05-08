# starter — Stage Flow（語言無關核心）

> 本檔由 `references/starter/{lang}.md` Read 引入。涵蓋 starter stage 在三語言間共用的觸發、互動、Template 命名慣例、安全規則與執行流程。語言特化內容（依賴清單、技術棧、template 對照表、驗證命令）寫在各 `{lang}.md`。

---

## 觸發詞描述

主 SKILL.md 的「Trigger 辨識」表已收錄；以下任一觸發詞均派發至本 stage：

- 「starter」「scaffold」「scaffolding」
- 「初始化專案」「骨架建立」
- 「建立後端骨架」「建立前端骨架」
- 「跑骨架腳本」「generate skeleton」

語言訊號由主 SKILL.md「語言推斷」段落決定。

---

## 互動流程（共用）

### Step 0：詢問專案目錄

使用 **AskUserQuestion** 詢問：

> 專案要建立在哪個目錄？（絕對路徑；通常為 solution / repo 根目錄）

取得 `PROJECT_DIR` 後繼續。

### Step 1：詢問專案名稱

使用 **AskUserQuestion** 詢問：

> 專案名稱？（C#：PascalCase；Node.js：用於 package.json `name` 與 Docker container 命名）

取得 `PROJECT_NAME` 後繼續。

> Note：TypeScript 前端 starter 不一定需要 PROJECT_NAME（沿用既有 `package.json`）；遵循 `references/starter/typescript.md` §前端 章節判斷。

---

## Template 命名慣例（共用）

`templates/{lang}/` 中的檔案名以 `__` 表示目錄分隔符；產生器將檔名 `__` 還原為 `/`：

- `app__main.py` → `app/main.py`
- `tests__features__environment.py` → `tests/features/environment.py`
- `app____init__.py` → `app/__init__.py`（四底線 = 目錄 + Python 內建 `__init__`，產生器會保留 `__init__` 不再拆解）
- `src__ProjectName__Program.cs` → `src/${ProjectName}/Program.cs`（佔位符由腳本或 AI 寫檔時替換）

`.tmpl` 後綴若存在會被腳本去除。

---

## 安全規則（共用）

1. **不覆蓋已存在檔案**：若目標路徑已有檔案，腳本回報 `SKIP (exists)`，不寫入。
2. **不建立 feature-specific 程式碼**：starter 只負責骨架（app factory、middleware、test runner、support 檔），不建立 endpoints、models、step definitions、services 等業務邏輯——這些由後續 stage（schema-analysis / step-template / red / green）填入。
3. **不執行套件安裝**：`npm install` / `dotnet restore` / `npm run db:migrate` 由使用者自行決定何時執行（避免污染未確認的環境）。
4. **不覆蓋 Features/**：若用 symlink 指向 `specs/features/`，腳本檢查到既有 symlink 應保留。

---

## 執行流程（共用骨架）

| Step | 動作 |
|------|------|
| 0 | 詢問 `PROJECT_DIR` |
| 1 | 詢問 `PROJECT_NAME`（語言相關時） |
| 2 | 執行語言對應的產生流程：<br>- **C#**：依 `references/starter/csharp.md` 對照表逐檔寫入並替換 `${ProjectName}`<br>- **Node.js**：執行 `scripts/generate-skeleton.py --variant nodejs-it`（讀 `arguments.yml`）<br>- **TypeScript 前端**：依 `references/starter/typescript.md` §前端 對照表逐檔寫入 |
| 3 | 安裝依賴（依語言：`dotnet restore` / `npm install`）——若 starter 流程要求由使用者執行，僅引導指令 |
| 4 | 移動 / 連結規格目錄（`specs/features/`、analysis artifacts）至專案內測試目錄；更新 `arguments.yml` 路徑變數（適用於 Node.js IT 變體）|
| 5 | 驗證 Gate（dry-run 測試框架、編譯檢查；見各 `{lang}.md` §驗證命令） |

---

## 完成條件（共用）

- [ ] 所有 template 對照表中的檔案已寫入目標路徑
- [ ] 專案中無 `${...}` placeholder 殘留（`${PROJECT_NAME}` / `${NODE_APP_DIR}` 等都已替換）
- [ ] 語言對應的驗證 Gate 通過（C# `dotnet build` / Node.js `cucumber-js --dry-run` / TS `vitest run --passWithNoTests` + `tsc --noEmit`）
- [ ] 安全規則皆未違反（無覆蓋、無 feature-specific 檔）
- [ ] 完成後正確引導下一步（discovery / control-flow / test-skeleton）

---

## 共通失敗模式

| 失敗模式 | 偵測方式 | 處置 |
|----------|----------|------|
| Placeholder 殘留 | 寫檔後 grep 專案中的 `${...}` 字串 | 立刻修正後再驗證；不要讓使用者跑 build 才發現 |
| 路徑分隔符未還原 | `__` 出現在輸出檔名 | 檢查 `template_name_to_path` 邏輯與 `__init__` 保護 |
| 覆蓋既有檔案 | 寫檔時未檢查 `exists()` | 嚴格遵守「SKIP (exists)」規則 |
| 規格目錄被誤刪 | Step 4 移動後找不到 `.feature` | 用 `git status` 確認移動而非刪除；必要時 `git restore` |
| 驗證 Gate 跳過 | 直接結束未跑 dry-run | starter 必須自己跑驗證命令，不要把驗證丟給下一 stage |

---

## 與其他 stage 的關係

```
starter (本 stage)
    ↓
schema-analysis（C# / TS） / test-skeleton（PHP）
    ↓
step-template
    ↓
red → green → refactor
```

starter 完成後通常直接交給 `aibdd-discovery` 開始需求探索；若已有 specs，則交給 `aibdd-auto-tdd（stage=control-flow）` 啟動批次 BDD 迴圈。
