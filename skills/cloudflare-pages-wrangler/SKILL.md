---
name: cloudflare-pages-wrangler
description: >
  Cloudflare Pages + Wrangler CLI 完整技術參考（v3+/v4）。
  當任務涉及以下情況時，必須使用此 skill：
  使用 wrangler CLI（pages deploy/dev、deploy、dev、tail、secret put/delete、types、versions、rollback）；
  撰寫或修改 wrangler.toml、wrangler.jsonc、wrangler.json；
  GitHub Actions 中 uses: cloudflare/wrangler-action@v3、uses: cloudflare/pages-action；
  Cloudflare Pages Functions（functions/ 目錄、onRequest、onRequestGet/Post/Put/Delete/Patch/Options、
  _middleware.ts、_worker.js、[param]、[[catchall]]、context.env、context.params、context.request、context.next、context.waitUntil）；
  _routes.json、_headers、_redirects、pages_build_output_dir；
  Pages bindings（KV/R2/D1/Durable Objects/Queues/Services/Hyperdrive/Vectorize/AI/Browser）；
  部署到 Cloudflare Workers（main、compatibility_date、compatibility_flags、routes）；
  Pages 建置設定（build command、build output directory、CF_PAGES_* 系統環境變數）；
  從 Cloudflare Pages 遷移到 Cloudflare Workers（Workers Static Assets）。
  工具：wrangler ^3.x/^4.x、cloudflare/wrangler-action@v3。
---

# Cloudflare Pages + Wrangler CLI

> **文件來源**：https://developers.cloudflare.com/pages、https://developers.cloudflare.com/workers/wrangler
> **適用版本**：Wrangler v3.x / v4.x
> **注意**：Cloudflare 正逐步將 Pages 遷移至 Workers（Workers Static Assets）。現有 Pages 專案仍完整支援，新專案可考慮直接用 Workers + Assets。

---

## References 索引（按需載入，**不要全載**）

依當前任務需要哪段，才 Read 對應 reference。每份檔案完整保留範例與選項表。

### 設定 / 結構

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| 專案檔案結構 | `references/project-structure.md` | 規劃 Pages / Workers Static Assets 目錄 |
| wrangler 設定檔 | `references/wrangler-config.md` | wrangler.jsonc/toml、頂層欄位、Pages 專用、bindings、route、environments |
| Pages 建置設定 | `references/pages-build.md` | Build command/Output dir、CF_PAGES_* 變數、常見框架預設 |

### Functions

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| Functions 路由 + Context | `references/functions-routing-context.md` | functions/ 目錄路由、onRequestGet/Post、動態參數、context.env/params/waitUntil/next |
| Bindings 使用 | `references/bindings.md` | KV/R2/D1/DO/Queues/Service/AI/Vectorize/Hyperdrive 在 Function 內 |
| _middleware / _routes / _headers / _redirects / _worker.js | `references/middleware-routes-headers-redirects.md` | 中間層、靜態資源 header、URL redirect、進階 _worker.js |

### CLI / CI / 環境

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| Wrangler CLI 完整指令 | `references/wrangler-cli.md` | Pages CLI、Workers CLI、認證、deploy、dev、secret、versions、types、KV/R2/D1 子命令 |
| GitHub Actions | `references/github-actions.md` | cloudflare/wrangler-action@v3、PR Preview workflow、action 輸入/輸出 |
| Environments / Secrets / 變數優先序 | `references/env-secrets-vars.md` | 變數優先序、.dev.vars、keep_vars |
| 從 Pages 遷移到 Workers Static Assets | `references/migration-pages-to-workers.md` | wrangler deploy + assets 取代 pages |

---

## 核心觀念速查

| 主題 | 重點 |
|------|------|
| 設定檔 | `wrangler.jsonc` 優先（支援註解 + 較新功能先行） |
| Pages 入口 | `pages_build_output_dir` 指向靜態產物目錄 |
| Workers 入口 | `main: src/index.ts` + `compatibility_date` |
| Functions 路由 | `functions/` 目錄結構即 URL，`[param]` / `[[catchall]]` |
| 中介層 | `functions/_middleware.ts` 套用同目錄 + 子目錄 |
| Bindings | 不繼承，每個 `env.<name>` 都要重新宣告 |
| Routes | Custom Domain（無需 zone_id）/ Zone ID / Zone name 三種 |

---

## 常見陷阱

| 症狀 | 原因 | 解法 |
|------|------|------|
| `wrangler deploy` 後 Dashboard 變數消失 | 預設會覆寫 | 加 `"keep_vars": true` 或在 `wrangler.jsonc` 也宣告 `vars` |
| Pages Functions 不執行 | `functions/` 目錄位置錯 | 放在 **專案根**（非 output dir） |
| `_headers` 沒生效 | 沒放在 build output dir | 放在 `dist/_headers` 而非 `public/_headers`（除非 framework copy 過去） |
| 部署的 Worker 無法讀到 binding | `env.<name>` 下未重新宣告 | bindings 不繼承 |
| `compatibility_date` 太舊 | nodejs_compat 或 new API 不可用 | 更新並加 flag |
| GitHub Actions 權限不足 | API token 權限不夠 | Token 需要 `Account - Cloudflare Pages:Edit` + `User - User Details:Read` |
| `pages dev` binding 空的 | 沒傳 `--kv` / 沒在 `wrangler.jsonc` | 用 flag 或 config 補上 |
| `D1` query 回 null | `.first()` vs `.all()` 用錯 | `.first()` 回單筆, `.all()` 回 `{ results: [] }` |
| `workers_dev: true` 意外暴露 | 沒關閉預設 *.workers.dev | 明確設 `"workers_dev": false` |
| Functions 跑到 timeout | 單次 CPU 超過 `limits.cpu_ms` | 拉長或分散到 Queue |
| Preview URL 沒自動產生 | `preview_urls: false` | 設回 true |
