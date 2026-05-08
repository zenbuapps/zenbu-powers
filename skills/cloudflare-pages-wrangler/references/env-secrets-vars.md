# Cloudflare — Environments / Secrets / 變數優先序

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「變數優先序、.dev.vars、keep_vars 行為」時載入。

## 優先序（從高到低）

1. `wrangler deploy --var KEY:VAL`（CLI 覆寫）
2. `wrangler.jsonc` 的 `env.<name>` 下同名 binding
3. Secrets（`wrangler secret put`）
4. Dashboard 設定的 vars（除非 `keep_vars: false`，部署會被覆蓋）
5. `wrangler.jsonc` 頂層 `vars`

## 本地 dev 的變數

`.dev.vars` 檔（類 `.env`）會被 `wrangler dev` 自動載入：

```
# .dev.vars
API_KEY=dev-key
DATABASE_URL=postgres://localhost
```

加入 `.gitignore`。
