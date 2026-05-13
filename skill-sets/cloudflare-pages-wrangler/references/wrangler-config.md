# Cloudflare — wrangler 設定檔

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「wrangler.jsonc/toml、必填欄位、頂層欄位、Pages 專用、bindings、route 類型、environments」時載入。

## 格式

支援三種格式，**Cloudflare 建議 `wrangler.jsonc`**（支援註解、較新功能先行支援）：

- `wrangler.jsonc` / `wrangler.json`（v3.91+）
- `wrangler.toml`

## 必填欄位

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-worker",                   // 英數 + dash，最多 255（workers.dev 最多 63）
  "main": "src/index.ts",                // Worker entry（assets-only 可省）
  "compatibility_date": "2026-04-01"     // yyyy-mm-dd
}
```

## 頂層常用欄位（Inheritable）

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "abc123",                // 或 CLOUDFLARE_ACCOUNT_ID env
  "workers_dev": false,                   // 關閉 *.workers.dev subdomain
  "preview_urls": true,
  "route": {                              // 單一 route
    "pattern": "api.example.com/*",
    "zone_name": "example.com"
  },
  "routes": [                             // 或多個
    { "pattern": "shop.example.com", "custom_domain": true },
    { "pattern": "api.example.com/*", "zone_id": "abc" }
  ],
  "tsconfig": "./tsconfig.json",
  "triggers": {
    "crons": ["0 * * * *"]                // 每小時
  },
  "minify": true,
  "keep_names": false,
  "no_bundle": false,
  "rules": [                              // 自訂 module import rules
    { "type": "Text", "globs": ["**/*.md"], "fallthrough": true }
  ],
  "build": {
    "command": "npm run build",
    "cwd": "worker",
    "watch_dir": "worker"
  },
  "dev": {
    "ip": "0.0.0.0",
    "port": 8787,
    "inspector_port": 9229,
    "local_protocol": "http",
    "upstream_protocol": "https",
    "enable_containers": true,
    "container_engine": "/var/run/docker.sock"
  },
  "limits": {
    "cpu_ms": 50,                         // max: 300000 (5min)
    "subrequests": 150
  },
  "observability": {
    "enabled": true,
    "head_sampling_rate": 0.1             // 0~1
  },
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
    "html_handling": "force-trailing-slash",   // auto-trailing-slash | drop-trailing-slash | none
    "not_found_handling": "404-page",           // none | single-page-application | 404-page
    "run_worker_first": ["/api/*", "!/api/docs/*"]
  },
  "placement": { "mode": "smart" },
  "logpush": true,
  "tail_consumers": [{ "service": "log-aggregator" }],
  "send_metrics": true,
  "keep_vars": false,                     // deploy 時保留 dashboard 設定的變數
  "migrations": [                         // Durable Objects
    { "tag": "v1", "new_classes": ["Counter"] }
  ]
}
```

## Pages 專案專用

```jsonc
{
  "name": "my-pages-site",
  "compatibility_date": "2026-04-01",
  "pages_build_output_dir": "./dist",     // Pages 專屬
  "vars": { "API_URL": "https://api.example.com" },
  "kv_namespaces": [
    { "binding": "SESSIONS", "id": "abc123" }
  ]
}
```

## Bindings（不繼承，每個 env 需重複宣告）

```jsonc
{
  "vars": {
    "NODE_ENV": "production"
  },
  "kv_namespaces": [
    { "binding": "CACHE", "id": "abc", "preview_id": "def" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "my-media", "preview_bucket_name": "my-media-dev" }
  ],
  "d1_databases": [
    { "binding": "DB", "database_name": "prod-db", "database_id": "uuid", "migrations_dir": "migrations" }
  ],
  "queues": {
    "producers": [{ "binding": "MY_QUEUE", "queue": "my-queue" }],
    "consumers": [{
      "queue": "my-queue",
      "max_batch_size": 10,
      "max_batch_timeout": 30,
      "max_retries": 3,
      "dead_letter_queue": "dlq"
    }]
  },
  "durable_objects": {
    "bindings": [
      { "name": "COUNTER", "class_name": "Counter", "script_name": "other-worker" }
    ]
  },
  "services": [
    { "binding": "BACKEND", "service": "backend-worker", "environment": "production" }
  ],
  "hyperdrive": [{ "binding": "HYPERDRIVE", "id": "abc" }],
  "vectorize": [{ "binding": "VEC", "index_name": "my-index" }],
  "ai": { "binding": "AI" },
  "browser": { "binding": "BROWSER" },
  "mtls_certificates": [{ "binding": "CERT", "certificate_id": "abc" }],
  "analytics_engine_datasets": [{ "binding": "EVENTS", "dataset": "events" }],
  "images": { "binding": "IMAGES" }
}
```

## Route 類型

```jsonc
// Custom Domain（不用設 zone_id）
"routes": [{ "pattern": "shop.example.com", "custom_domain": true }]

// Zone ID route
"routes": [{ "pattern": "sub.example.com/*", "zone_id": "abc" }]

// Zone name route
"routes": [{ "pattern": "sub.example.com/*", "zone_name": "example.com" }]

// Simple（workers.dev 開啟時）
"route": "example.com/*"
```

## Environments（命名環境）

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-04-01",
  "route": "example.com/*",
  "kv_namespaces": [{ "binding": "CACHE", "id": "prod-kv" }],

  "env": {
    "staging": {
      "name": "my-worker-staging",
      "route": "staging.example.com/*",
      "kv_namespaces": [{ "binding": "CACHE", "id": "staging-kv" }]
    },
    "preview": {
      "name": "my-worker-preview",
      "workers_dev": true,
      "kv_namespaces": [{ "binding": "CACHE", "id": "preview-kv" }]
    }
  }
}
```

部署：`wrangler deploy --env staging`。

**注意**：bindings 不繼承，每個 `env` 都要重新宣告。
