# Cloudflare — Pages Functions Bindings 使用

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「KV/R2/D1/Durable Objects/Queues/Service/AI/Vectorize/Hyperdrive 在 Function 內使用」時載入。

各 binding 在 `context.env` 下取用：

```typescript
// KV
await env.CACHE.get('key');
await env.CACHE.put('key', 'value', { expirationTtl: 60 });
await env.CACHE.delete('key');
await env.CACHE.list({ prefix: 'user:' });

// R2
const object = await env.MEDIA.get('path/to/file.jpg');
await env.MEDIA.put('path/to/file.jpg', request.body);
await env.MEDIA.delete('path/to/file.jpg');

// D1（SQLite）
const stmt = env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId);
const { results } = await stmt.all();
const row = await stmt.first();
await env.DB.batch([stmt1, stmt2]);

// Durable Objects
const id = env.COUNTER.idFromName('global');
const stub = env.COUNTER.get(id);
const res = await stub.fetch('https://do/increment');

// Queues（producer）
await env.MY_QUEUE.send({ task: 'process' });
await env.MY_QUEUE.sendBatch([{ body: {...} }, { body: {...} }]);

// Service binding（呼叫其他 Worker）
const res = await env.BACKEND.fetch(request);

// AI
const result = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
  prompt: 'Hello',
});

// Vectorize
const matches = await env.VEC.query(vector, { topK: 5 });

// Hyperdrive（Postgres connection pooling）
import { Client } from 'pg';
const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
await client.connect();
```

## vars vs secrets

- **`vars`**（在 `wrangler.jsonc`）：明碼，適合非敏感設定。
- **`secrets`**：加密，只能透過 `wrangler secret put` 或 Dashboard 設定，不放在 code 或 config。
