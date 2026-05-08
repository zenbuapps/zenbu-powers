# starter — TypeScript

> 共用觸發、互動、Template 命名慣例、安全規則、執行流程骨架見 `_stage-flow.md`。本檔僅提供 TypeScript 兩個變體的特化內容：
>
> - **前端**：React + Vitest + MSW v2（IT 測試基礎建設）
> - **後端**：Node.js + Express + Drizzle ORM + Cucumber.js + Testcontainers（IT 變體）

兩個變體互斥，依專案類型選擇。判斷訊號見主 SKILL.md「語言推斷」段落；若兩種訊號並存（monorepo），分別執行兩次 starter。

---

## 前端 (React + Vitest)

從 `templates/typescript/` 建立 React Integration Test 基礎建設。

### 前置條件

- 前端專案已初始化（`package.json` 存在）——通常由 `/aibdd-auto-frontend-apifirst-msw-starter` 完成
- React 18+ 已安裝
- MSW v2 已安裝（來自 E2E 階段）
- TypeScript 5+ 已安裝

### 流程

#### Step 1: 確認前置條件

Read `package.json`，驗證 `react`、`msw`、`typescript` 已存在於 `dependencies` 或 `devDependencies`。若缺任一項，中止並回報。

#### Step 2: 安裝測試依賴

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @testing-library/dom jsdom
```

#### Step 3: 產生模板檔案

讀取 `templates/typescript/` 目錄下所有檔案，將檔名中的 `__` 轉換為目錄分隔符 `/`，寫入專案目錄。

例如：

- `templates/typescript/src__test__setup.ts` → `src/test/setup.ts`
- `templates/typescript/src__test__mocks__server.ts` → `src/test/mocks/server.ts`

#### Step 4: 更新 package.json scripts

於 `package.json` 加入：

```json
{
  "scripts": {
    "test:it": "vitest run",
    "test:it:watch": "vitest",
    "test:it:coverage": "vitest run --coverage"
  }
}
```

#### Step 5: 驗證 Gate

```bash
npx vitest run --passWithNoTests
npx tsc --noEmit
```

兩項皆須通過方可視為初始化成功。

### 模板檔案

| 模板 | 產出路徑 | 說明 |
|------|---------|------|
| `vitest.config.ts` | `vitest.config.ts` | jsdom env、path aliases、setup file |
| `src__test__setup.ts` | `src/test/setup.ts` | jest-dom、MSW server lifecycle |
| `src__test__mocks__server.ts` | `src/test/mocks/server.ts` | `setupServer` from `msw/node` |
| `src__test__mocks__handlers.ts` | `src/test/mocks/handlers.ts` | 預設 handler array |
| `src__test__helpers__render.tsx` | `src/test/helpers/render.tsx` | `renderWithProviders` |
| `src__test__helpers__user-event.ts` | `src/test/helpers/user-event.ts` | 預設 `userEvent.setup` |
| `src__test__helpers__msw-utils.ts` | `src/test/helpers/msw-utils.ts` | MSW override utilities |
| `src__test__factories__index.ts` | `src/test/factories/index.ts` | Factory pattern 骨架 |

### 完成條件

- [ ] 所有模板檔案已寫入目標路徑
- [ ] 無 `{{...}}` placeholder 殘留
- [ ] `npx vitest run --passWithNoTests` 通過
- [ ] `npx tsc --noEmit` 通過
- [ ] `package.json` scripts 已更新

---

## 後端 (Node.js + Express)

技術棧：Express 4 + Drizzle ORM 0.38 + Cucumber.js 10 + Supertest 7 + Testcontainers (PostgreSQL)

由 `scripts/generate-skeleton.py` 一次性產出。腳本讀 `arguments.yml`、做 `${VAR}` 替換、寫入目標目錄。

### 變體路由

讀取 `arguments.yml`，從 key prefix 自動偵測技術棧：

- `NODE_` → `nodejs-it` 變體（對應 `templates/nodejs/` 目錄）

偵測不到 → 用 AskUserQuestion 詢問使用者技術棧。

### 執行腳本

```bash
uv run skills/aibdd-auto-tdd/scripts/generate-skeleton.py \
  --project-dir "${PROJECT_DIR}" \
  --project-name "${PROJECT_NAME}" \
  --variant nodejs-it \
  --arguments "${ARGUMENTS_YML_PATH}"
```

> 注意：`--variant nodejs-it` 由腳本內部映射到 `references/starter/templates/nodejs/` 目錄。

### 後續流程（沿用 `_stage-flow.md` Step 3-5）

#### Step 3：安裝依賴

```bash
cd ${PROJECT_DIR} && npm install
```

#### Step 4：移動規格目錄並更新路徑

1. 將 `${FEATURE_SPECS_DIR}/` **整個目錄**移動到 `${PROJECT_DIR}` 內的測試目錄（含 `.feature`、句型.md、系統抽象.md 等所有分析產物），保留子目錄結構。
2. 更新 `arguments.yml` 中的相關路徑變數，指向移動後的位置（以 `${PROJECT_DIR}` 為基礎）。
3. 告知使用者：規格目錄已移入後端專案目錄，arguments.yml 已更新。

#### Step 5：驗證 Gate

```bash
npm install
npx cucumber-js --dry-run
npx tsc --noEmit
```

無 feature 檔案時 cucumber-js 會顯示 0 scenarios，屬正常；TypeScript 編譯不應報型別錯誤。

### 目錄結構

```
${PROJECT_ROOT}/
├── ${NODE_APP_DIR}/                          # 應用程式主目錄（例：src/）
│   ├── app.ts                                # Express app factory
│   ├── server.ts                             # Server entry point
│   ├── errors.ts                             # 自訂 Error classes：BusinessError, NotFoundError
│   ├── db/
│   │   ├── schema.ts                         # Drizzle ORM pgTable 定義
│   │   ├── index.ts                          # DB connection factory
│   │   └── migrations/                       # drizzle-kit 生成的 SQL migration 檔
│   ├── middleware/
│   │   ├── jwt-auth.ts                       # JWT Bearer token 驗證
│   │   └── error-handler.ts                  # 全域錯誤處理
│   ├── routes/
│   │   └── index.ts                          # Route aggregator（空，待自動化填入）
│   ├── services/
│   │   └── index.ts                          # Service barrel（空）
│   ├── repositories/
│   │   └── index.ts                          # Repository barrel（空）
│   └── schemas/
│       └── index.ts                          # Zod schemas barrel（空）
├── ${NODE_TEST_FEATURES_DIR}/                # 測試目錄（例：features/）
│   ├── support/
│   │   ├── world.ts                          # Cucumber TestWorld class
│   │   ├── hooks.ts                          # Testcontainers 生命週期 + 狀態初始化
│   │   └── jwt-helper.ts                     # 測試用 JWT Token 產生器
│   └── steps/
│       └── common_then/
│           ├── success.ts                    # Then('操作成功')
│           ├── failure.ts                    # Then('操作失敗')
│           └── error-message.ts              # Then('錯誤訊息應為 {string}')
├── ${SPECS_ROOT_DIR}/                        # 規格檔案（例：specs/）
│   ├── activities/
│   ├── features/
│   └── clarify/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .cucumber.js
└── .env.example
```

### 依賴清單（npm）

`package.json` 的 dependencies：

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "drizzle-orm": "^0.38.0",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.13.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@cucumber/cucumber": "^10.9.0",
    "@testcontainers/postgresql": "^10.13.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/pg": "^8.11.10",
    "@types/supertest": "^6.0.2",
    "drizzle-kit": "^0.31.0",
    "supertest": "^7.0.0",
    "testcontainers": "^10.13.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

安裝指令：`npm install`

### 設定檔說明

#### `.cucumber.js`

指定 Cucumber.js 掃描 `${NODE_TEST_FEATURES_DIR}/**/*.feature`，require `support/` 和 `steps/` 下的 `.ts` 檔，透過 `requireModule: ['tsx']` 直接執行 TypeScript。

#### `tsconfig.json`

TypeScript 嚴格模式（`strict: true`），target ES2022，module CommonJS（為與 Cucumber.js + tsx 相容性最佳），include `${NODE_APP_DIR}` 和 `${NODE_TEST_FEATURES_DIR}`。

#### `drizzle.config.ts`

指定 schema 檔 `${NODE_DB_SCHEMA}`、輸出 migration 到 `${NODE_DRIZZLE_MIGRATIONS}`，PostgreSQL dialect。連線 URL 從環境變數 `DATABASE_URL` 讀取。

#### `package.json`

專案 metadata + scripts：

- `dev`：`tsx watch ${NODE_APP_DIR}/server.ts`（開發伺服器）
- `test`：`cucumber-js`（執行 BDD 測試）
- `test:dry-run`：`cucumber-js --dry-run`（檢查 step 綁定）
- `db:generate`：`drizzle-kit generate`（從 schema 生成 migration）
- `db:migrate`：`drizzle-kit migrate`（套用 migration）

#### `.env.example`

範本環境變數：`DATABASE_URL`、`JWT_SECRET`、`PORT`。

### 測試框架設定（Cucumber.js + Testcontainers）

#### `hooks.ts` 生命週期

| Hook | 行為 |
|------|------|
| `BeforeAll` | 啟動 PostgreSQL Testcontainer（postgres:16）→ 取得連線 URI → 建立 `pg.Pool` → `drizzle(pool)` → 執行 `migrate(db, { migrationsFolder })` |
| `Before` | 注入 `this.db`、`this.app = createApp(db)`、`this.jwtHelper` → 重置 `this.ids / memo / lastResponse / lastError / queryResult` |
| `After` | 查 `pg_tables` 取得所有 public tables（排除 drizzle 內部表）→ 對每張表執行 `TRUNCATE TABLE "xxx" CASCADE` |
| `AfterAll` | `pool.end()` → `container.stop()` |

#### TestWorld 物件結構

```typescript
class TestWorld extends World {
  lastResponse: supertest.Response | null;      // HTTP Response
  lastError: Error | null;                      // 最近一次錯誤
  queryResult: unknown;                         // 查詢結果
  ids: Record<string, string | number>;         // 名稱 → ID 映射
  memo: Record<string, unknown>;                // 通用暫存
  db: NodePgDatabase;                           // Drizzle ORM instance
  app: Express;                                 // Express app
  jwtHelper: JwtHelper;                         // JWT Token 產生器
}
```

### 資料庫設定

- **開發環境**：由使用者自行啟動 PostgreSQL（或用 docker-compose）
- **測試環境**：透過 `@testcontainers/postgresql` 自動管理（每次測試 session 啟動新容器）
- **Migration**：drizzle-kit。從 `${NODE_DB_SCHEMA}` 生成 SQL migration 到 `${NODE_DRIZZLE_MIGRATIONS}`
- **清理策略**：每個 Scenario 結束後 TRUNCATE CASCADE 所有 tables（保留 drizzle 內部表）

### arguments.yml 變數對照

| Placeholder | 來源 | 說明 | 範例 |
|-------------|------|------|------|
| `${PROJECT_NAME}` | 詢問使用者 | 專案顯示名稱 | `課程平台` |
| `${PROJECT_DESCRIPTION}` | 自動生成 | 專案描述 | `課程平台 — BDD Workshop Node.js IT` |
| `${PROJECT_SLUG}` | 從 PROJECT_NAME 推導 | URL-safe 識別碼 | `course-platform` |
| `${DB_NAME}` | 從 PROJECT_SLUG 推導 | PostgreSQL 資料庫名 | `course_platform_dev` |
| `${NODE_APP_DIR}` | arguments.yml | 應用程式目錄名 | `src` |
| `${NODE_TEST_FEATURES_DIR}` | arguments.yml | 測試 features 目錄 | `features` |
| `${NODE_STEPS_DIR}` | arguments.yml | Steps 目錄 | `features/steps` |
| `${NODE_SUPPORT_DIR}` | arguments.yml | Support 目錄 | `features/support` |
| `${NODE_DB_SCHEMA}` | arguments.yml | Drizzle schema 路徑 | `src/db/schema.ts` |
| `${NODE_DRIZZLE_MIGRATIONS}` | arguments.yml | Migration 輸出目錄 | `src/db/migrations` |
| `${SPECS_ROOT_DIR}` | arguments.yml | 規格檔案根目錄 | `specs` |

推導規則：

- `PROJECT_SLUG` = PROJECT_NAME 轉小寫、空格換連字號、移除特殊字元
- `DB_NAME` = PROJECT_SLUG 中連字號換底線、後綴 `_dev`

### 驗證步驟

完成骨架建立後，確認以下事項：

1. **檔案完整性**：所有 template 對照表中的檔案都已寫入目標路徑（22 個檔案）
2. **Placeholder 替換**：專案中不應殘留任何 `${...}` 字串
3. **目錄結構**：`${NODE_DRIZZLE_MIGRATIONS}/` 目錄已建立（空目錄）
4. **安裝測試**：`npm install` 能正常完成
5. **Cucumber.js 可執行**：`npx cucumber-js --dry-run` 不報錯（無 feature 檔案時會顯示 0 scenarios）
6. **TypeScript 編譯**：`npx tsc --noEmit` 不報型別錯誤

### Template 檔案對照表

範本根目錄：`references/starter/templates/nodejs/`（檔名 `__` = `/`）

| Template 檔名 | 輸出路徑 |
|---------------|----------|
| `package.json` | `package.json` |
| `tsconfig.json` | `tsconfig.json` |
| `drizzle.config.ts` | `drizzle.config.ts` |
| `.cucumber.js` | `.cucumber.js` |
| `.env.example` | `.env.example` |
| `src__app.ts` | `${NODE_APP_DIR}/app.ts` |
| `src__server.ts` | `${NODE_APP_DIR}/server.ts` |
| `src__errors.ts` | `${NODE_APP_DIR}/errors.ts` |
| `src__db__schema.ts` | `${NODE_APP_DIR}/db/schema.ts` |
| `src__db__index.ts` | `${NODE_APP_DIR}/db/index.ts` |
| `src__middleware__jwt-auth.ts` | `${NODE_APP_DIR}/middleware/jwt-auth.ts` |
| `src__middleware__error-handler.ts` | `${NODE_APP_DIR}/middleware/error-handler.ts` |
| `src__routes__index.ts` | `${NODE_APP_DIR}/routes/index.ts` |
| `src__services__index.ts` | `${NODE_APP_DIR}/services/index.ts` |
| `src__repositories__index.ts` | `${NODE_APP_DIR}/repositories/index.ts` |
| `src__schemas__index.ts` | `${NODE_APP_DIR}/schemas/index.ts` |
| `features__support__world.ts` | `${NODE_TEST_FEATURES_DIR}/support/world.ts` |
| `features__support__hooks.ts` | `${NODE_TEST_FEATURES_DIR}/support/hooks.ts` |
| `features__support__jwt-helper.ts` | `${NODE_TEST_FEATURES_DIR}/support/jwt-helper.ts` |
| `features__steps__common_then__success.ts` | `${NODE_TEST_FEATURES_DIR}/steps/common_then/success.ts` |
| `features__steps__common_then__failure.ts` | `${NODE_TEST_FEATURES_DIR}/steps/common_then/failure.ts` |
| `features__steps__common_then__error-message.ts` | `${NODE_TEST_FEATURES_DIR}/steps/common_then/error-message.ts` |

額外建立的空目錄（無 template）：

- `${NODE_DRIZZLE_MIGRATIONS}/`

### 完成條件

- [ ] 22 個 template 檔案都已寫入目標路徑
- [ ] 無 `${...}` placeholder 殘留
- [ ] `npm install` 成功
- [ ] `npx cucumber-js --dry-run` 通過（無 feature 時 0 scenarios 屬正常）
- [ ] `npx tsc --noEmit` 不報型別錯誤
- [ ] `${NODE_DRIZZLE_MIGRATIONS}/` 空目錄已建立
- [ ] 規格目錄已移入專案內，`arguments.yml` 路徑已更新

### 完成後引導

```
Walking skeleton 已建立完成。

下一步：
1. cd ${PROJECT_ROOT} && npm install
2. 設定 .env（複製 .env.example）
3. /zenbu-powers:aibdd-discovery — 開始需求探索
```
