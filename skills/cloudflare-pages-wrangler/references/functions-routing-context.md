# Cloudflare Pages — Functions 檔案路由 / Context

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「functions/ 目錄路由、onRequestGet/Post、動態參數、context.env/params/waitUntil/next」時載入。

## 檔案路由

把 `functions/` 目錄放在專案根，結構即對應 URL：

| 檔案 | 路由 |
|------|------|
| `functions/index.ts` | `/` |
| `functions/about.ts` | `/about` |
| `functions/api/users.ts` | `/api/users` |
| `functions/api/users/[id].ts` | `/api/users/:id` |
| `functions/api/[[path]].ts` | `/api/*`（catch-all） |
| `functions/_middleware.ts` | 套用到同目錄與子目錄的所有請求 |

## 動態參數

```typescript
// functions/users/[user].ts
export const onRequest: PagesFunction = (context) => {
  const { user } = context.params;           // string（單段）
  return new Response(`User: ${user}`);
};

// functions/users/[[path]].ts
export const onRequest: PagesFunction = (context) => {
  const path = context.params.path;          // string[]（多段）
  return new Response(`Path: ${path.join('/')}`);
};
```

## HTTP 方法專屬 handler

```typescript
// functions/api/users.ts
export const onRequestGet: PagesFunction = async (ctx) => {
  return Response.json({ users: [] });
};

export const onRequestPost: PagesFunction = async (ctx) => {
  const body = await ctx.request.json();
  return Response.json({ created: body });
};

export const onRequestDelete: PagesFunction = async (ctx) => {
  return new Response(null, { status: 204 });
};

// 其他：onRequestPut / onRequestPatch / onRequestHead / onRequestOptions
```

## Fallback onRequest

```typescript
// 未匹配方法時的 fallback
export const onRequest: PagesFunction = async (ctx) => {
  return new Response('Method Not Allowed', { status: 405 });
};
```

## Context 物件

`context` 是每個 handler 的第一個參數，包含：

```typescript
interface EventContext<Env, P extends string, Data> {
  request: Request;            // 標準 Fetch API Request
  functionPath: string;         // 路由路徑（/api/users）
  waitUntil: (p: Promise<any>) => void;   // 非阻塞背景工作
  passThroughOnException: () => void;      // 例外時 fallback 到 asset
  next: (input?, init?) => Promise<Response>;  // 傳遞到下個 handler / asset
  env: Env & { ASSETS: Fetcher };          // 所有 bindings
  params: Params<P>;            // 路由參數
  data: Data;                   // middleware 之間傳遞資料
}

type PagesFunction<Env = unknown, P extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> =
  (context: EventContext<Env, P, Data>) => Response | Promise<Response>;
```

## 使用範例

```typescript
interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  API_KEY: string;              // 來自 vars / secrets
  ASSETS: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env, waitUntil } = ctx;

  const cached = await env.CACHE.get('key');
  if (cached) return new Response(cached);

  const result = await env.DB.prepare('SELECT * FROM users').all();
  const body = JSON.stringify(result.results);

  // 背景寫入快取，不阻塞 response
  waitUntil(env.CACHE.put('key', body, { expirationTtl: 60 }));

  return new Response(body, { headers: { 'content-type': 'application/json' } });
};
```
