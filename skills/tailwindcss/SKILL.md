---
name: tailwindcss
description: >
  Tailwind CSS 完整 API 參考。**版本路由先**：開工前 Read package.json
  判斷 tailwindcss pin 的 major 版本——pin ^3.x 載入 references/v3/SKILL.md；
  pin ^4.x 載入 references/v4/SKILL.md。
  涵蓋 v3 的 tailwind.config.js / @tailwind base|components|utilities 指令、
  v4 的 @import "tailwindcss" / @theme / @custom-variant / @utility / @source CSS-first
  設定、design tokens、container queries、3D transforms、@apply / arbitrary values、
  CSS 變數曝露為 utility 等所有 API。
  ⚠️ utility classes（bg-*、text-*、flex、grid、hover: 等）v3/v4 共用語法，
  不可單憑 class 名稱觸發本 skill，必須先確認版本。v3 與 v4 架構不相容，
  snippets 無法跨版互通。
---

# Tailwind CSS

> **本 skill 是版本無關的入口**。從 package.json 判斷專案使用的 Tailwind 主版本，再載入對應 reference。

---

## 版本路由（必讀）

1. **Read package.json**（cwd 最近的優先；monorepo 多 package.json 時，先試 cwd 最近的，再試 git root）。
2. 比對 `dependencies` / `devDependencies` 中 `tailwindcss` pin 的 major 版本：
   - **`^3.x`**（或 `~3.x` / `3.x.x`）→ Read `references/v3/SKILL.md`
   - **`^4.x`**（或 `~4.x` / `4.x.x`）→ Read `references/v4/SKILL.md`
3. **輔助訊號**（pin 不明時參考）：
   - 存在 `tailwind.config.js` / `tailwind.config.ts` → 多半 v3
   - 存在 `@tailwindcss/vite` 或 `@tailwindcss/postcss` 依賴 → v4
   - CSS 入口為 `@tailwind base; @tailwind components; @tailwind utilities;` → v3
   - CSS 入口為 `@import "tailwindcss";` → v4
4. **找不到 / 同時存在兩版本** → 詢問用戶，不要猜。

---

## 共用設計理念（version-agnostic）

以下概念跨 v3 / v4 共用，不依賴特定版本：

- **Utility-first**：以 `bg-*`、`text-*`、`flex`、`grid`、`hover:` 等原子 class 組合 UI，避免自訂 CSS。
- **JIT（Just-in-Time）**：class 按需編譯，arbitrary values（`top-[117px]`、`bg-[#bada55]`）零成本。
- **Tree-shaking by content scan**：只把實際出現在 source 檔案中的 class 編入產出（v3 用 `content` glob，v4 自動偵測 + `@source`）。
- **Variants stacking**：`hover:`、`focus:`、`md:`、`dark:` 等變體可堆疊（v3 右到左；v4 左到右——詳見對應 reference）。
- **Mobile-first responsive**：`sm:`、`md:`、`lg:`、`xl:`、`2xl:` 一律「此寬度及以上」。
- **CSS 變數整合**：兩版本都能把 CSS custom properties 暴露為 utility（v3 透過 `theme.extend.colors`；v4 透過 `@theme`）。

---

## 重大版本差異（觸發路由的關鍵 anchor）

| 維度 | v3 | v4 |
|---|---|---|
| 設定來源 | `tailwind.config.js`（JS-first） | `@theme { ... }` in CSS（CSS-first） |
| CSS 入口 | `@tailwind base/components/utilities;` | `@import "tailwindcss";` |
| Vite 整合 | 透過 PostCSS | `@tailwindcss/vite` plugin（推薦） |
| CSS var 在 arbitrary value | `bg-[--color-brand]` | `bg-(--color-brand)` |
| Custom utility | `@layer utilities { .foo { } }` | `@utility foo { ... }` |
| `border` 預設色 | `gray-200` | `currentColor` |
| `shadow` 命名 | `shadow-sm` / `shadow` | 整體縮小一級 |
| Node baseline | 14+ | 20+ |

詳細 API 與 v3 ↔ v4 完整對照：見 `references/v3/SKILL.md` 與 `references/v4/SKILL.md`。

---

## Hand-off / Next Agent

- 本 skill 為 **Phase 2 第 1 對 hub 合併交付物**之一，路徑 `skills/tailwindcss/`。
- 同步交付：`references/v3/SKILL.md`、`references/v3/v3-to-v4-migration.md`、`references/v4/SKILL.md`、`references/v4/{breaking-changes,directives-and-theme,utilities-examples,variants}.md`。
- 本階段**未修改**任何下游引用（README.md、`react-master.agent.md`、`react-reviewer.agent.md` 等）。
- 舊 `skills/tailwindcss-v3/` 與 `skills/tailwindcss-v4/` 已 stub 化（`deprecated: true`），references/ 目錄保留原樣。
- **交還 orchestrator**：等所有 5 對 hub 合併完成後一起進 Stage C（下游引用切換）。
