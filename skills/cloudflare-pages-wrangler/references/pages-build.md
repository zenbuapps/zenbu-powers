# Cloudflare Pages — 建置設定

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「Build command/Output dir、CF_PAGES_* 環境變數、常見框架預設」時載入。

Dashboard（或 `wrangler.jsonc`）上的設定：

| 項目 | 說明 | 範例 |
|------|------|------|
| Build command | 建置指令 | `npm run build` |
| Build output directory | 靜態產物目錄 | `dist` / `build` / `.output/public` |
| Root directory | 專案根（monorepo 子目錄） | `apps/web` |

## Cloudflare 自動注入的環境變數（build 期）

| 變數 | 值 |
|------|-----|
| `CI` | `true` |
| `CF_PAGES` | `1` |
| `CF_PAGES_COMMIT_SHA` | Git commit hash |
| `CF_PAGES_BRANCH` | 當前分支名 |
| `CF_PAGES_URL` | 當次部署的 URL |

範例用途：

```js
// next.config.js
const isPreview = process.env.CF_PAGES_BRANCH !== 'main';
module.exports = {
  env: { IS_PREVIEW: isPreview },
};
```

## 常見框架預設

| 框架 | Build command | Output dir |
|------|---------------|-----------|
| Astro | `npm run build` | `dist` |
| Next.js (static) | `npm run build` | `out` |
| Next.js (next-on-pages) | `npx @cloudflare/next-on-pages@1` | `.vercel/output/static` |
| Vite (Vue/React) | `npm run build` | `dist` |
| SvelteKit | `npm run build` | `.svelte-kit/cloudflare` |
| Nuxt 3 | `npm run build` | `.output/public` |
| Remix | `npm run build` | `public` |
