# Cloudflare Pages — 專案檔案結構

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「Pages / Workers Static Assets 專案的目錄結構」時載入。

典型 Pages 專案（例如 Next.js / Astro / Vite）：

```
my-project/
├── wrangler.jsonc          # Pages/Workers 設定
├── functions/              # Pages Functions（可選）
│   ├── api/
│   │   ├── users.ts         # → /api/users
│   │   └── users/[id].ts    # → /api/users/:id
│   ├── [[catchall]].ts      # catch-all
│   └── _middleware.ts       # 全域 middleware
├── public/                  # 靜態資源（build output）
│   ├── _headers             # 自訂 response header
│   └── _redirects           # URL redirect
└── package.json
```

Workers（Workers Static Assets 寫法）：

```
my-worker/
├── wrangler.jsonc
├── src/
│   └── index.ts            # fetch handler
├── public/                  # 靜態資源（ASSETS binding）
└── package.json
```
