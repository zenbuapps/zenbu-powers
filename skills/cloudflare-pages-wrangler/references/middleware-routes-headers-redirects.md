# Cloudflare Pages — _middleware / _routes.json / _headers / _redirects / _worker.js

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「中間層、靜態資源 header、URL redirect、進階 _worker.js 模式」時載入。

## _middleware.ts（Pages Functions）

```typescript
// functions/_middleware.ts
const authMiddleware: PagesFunction = async (ctx) => {
  const token = ctx.request.headers.get('Authorization');
  if (!token) return new Response('Unauthorized', { status: 401 });

  // 驗證 token...
  ctx.data.user = { id: '123' };             // 傳遞給下一個 handler

  return ctx.next();                          // 呼叫下個 middleware 或 route handler
};

const logMiddleware: PagesFunction = async (ctx) => {
  const start = Date.now();
  const res = await ctx.next();
  console.log(`${ctx.request.method} ${ctx.request.url} ${Date.now() - start}ms`);
  return res;
};

// 多個 middleware
export const onRequest = [logMiddleware, authMiddleware];
```

## _routes.json（控制哪些路徑走 Function）

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/images/*", "/static/*"]
}
```

放在 `build output directory` 根目錄。限制：include 至少 1 條，總規則 ≤ 100，單條 ≤ 100 字元。

## public/_headers

```
# 應用到所有路徑
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

# 特定路徑
/api/*
  Access-Control-Allow-Origin: *
  Cache-Control: no-store

/static/*
  Cache-Control: public, max-age=31536000, immutable
```

## public/_redirects

```
# 基本 redirect（301）
/old-path    /new-path
/blog/*      /posts/:splat      301

# status code
/removed     /                  410
/moved       /new-location      302

# Placeholder
/users/:id   /profile/:id

# 強制（忽略存在的檔案）
/about!      /team.html         200
```

## 進階模式 _worker.js

關閉檔案路由，自己寫完整 Worker：

```typescript
// public/_worker.js 或 src/_worker.ts → build → output/_worker.js
interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API 路徑
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, ctx);
    }

    // 其他 fallback 到靜態資源
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
```

放在 `build output` 目錄即啟用。此模式下 `functions/` 目錄會被忽略。
