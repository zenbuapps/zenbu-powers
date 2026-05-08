# Cloudflare — 從 Pages 遷移到 Workers Static Assets

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「規劃從 Pages 遷移到 Workers Static Assets」時載入。

Cloudflare 的未來方向是把 Pages 的能力合併到 Workers（搭配 Static Assets）。Workers Static Assets 有：
- 更快的部署（無 build pipeline 限制）
- 完整 Workers 所有 binding + Smart Placement
- `assets` 設定取代 `pages_build_output_dir`

## 遷移重點

1. `wrangler.jsonc` 改用 `"main"` + `"assets.directory"` 取代 `"pages_build_output_dir"`
2. Functions 的 file-based routing **不再支援**，必須改寫 `export default { fetch }`
3. `_redirects` / `_headers` 需改為 `assets.html_handling` 或在 Worker 內處理
4. `_middleware.ts` 沒有對應，改用 Worker 中間層邏輯
5. 部署指令從 `wrangler pages deploy` 改為 `wrangler deploy`

詳見：https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
