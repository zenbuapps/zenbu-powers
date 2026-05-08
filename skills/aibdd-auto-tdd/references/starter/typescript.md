# starter — TypeScript / React IT

> 主 SKILL.md 已涵蓋：trigger 辨識、樣板 → 寫入 → 驗證骨架語意。本檔僅提供 React IT 特化內容（Vitest + @testing-library/react + MSW v2 stack）。

從 templates/typescript/ 建立 React Integration Test 基礎建設。

## 前置條件

- 前端專案已初始化（`package.json` 存在）——通常由 `/aibdd-auto-frontend-apifirst-msw-starter` 完成
- React 18+ 已安裝
- MSW v2 已安裝（來自 E2E 階段）
- TypeScript 5+ 已安裝

## 流程

### Step 1: 確認前置條件

Read `package.json`，驗證 `react`、`msw`、`typescript` 已存在於 `dependencies` 或 `devDependencies`。若缺任一項，中止並回報。

### Step 2: 安裝測試依賴

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @testing-library/dom jsdom
```

### Step 3: 產生模板檔案

讀取 `templates/typescript/` 目錄下所有檔案，將檔名中的 `__` 轉換為目錄分隔符 `/`，寫入專案目錄。

例如：

- `templates/typescript/src__test__setup.ts` → `src/test/setup.ts`
- `templates/typescript/src__test__mocks__server.ts` → `src/test/mocks/server.ts`

### Step 4: 更新 package.json scripts

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

### Step 5: 驗證 Gate

```bash
npx vitest run --passWithNoTests
npx tsc --noEmit
```

兩項皆須通過方可視為初始化成功。

## 模板檔案

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

## 完成條件

- [ ] 所有模板檔案已寫入目標路徑
- [ ] 無 `{{...}}` placeholder 殘留
- [ ] `npx vitest run --passWithNoTests` 通過
- [ ] `npx tsc --noEmit` 通過
- [ ] `package.json` scripts 已更新
