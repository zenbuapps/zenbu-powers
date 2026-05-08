# BullMQ v5 — Rate Limiting / Retrying / Errors

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「limiter、worker.rateLimit、Worker.RateLimitError、attempts、backoff（exp/fixed/jitter/custom）、UnrecoverableError、DelayedError、WaitingChildrenError」時載入。

## Rate Limiting

### 靜態限流（Worker 選項）

```typescript
const worker = new Worker('myqueue', processor, {
  connection,
  limiter: {
    max: 10,                       // 每 duration 內最多 10 個 job
    duration: 1000,                // 1 秒
  },
});
```

此限制為 queue 層級（所有 worker 加總）。

### 動態限流（runtime 決定）

```typescript
const worker = new Worker(
  'myqueue',
  async (job) => {
    const [limited, retryAfter] = await callExternalAPI();
    if (limited) {
      await worker.rateLimit(retryAfter);       // 告訴 BullMQ 暫停 retryAfter ms
      throw Worker.RateLimitError();            // 標記為非失敗（會被重新排入 waiting）
    }
    return { ok: true };
  },
  { connection, limiter: { max: 1, duration: 500 } },
);
```

`Worker.RateLimitError` 是一個 sentinel error，告訴 BullMQ 這不是真的失敗。

### 全域限流（所有 queue instances）

```typescript
const queue = new Queue('myqueue', {
  connection,
  // 全域限流（v5+）
});
```

## Retrying 與 Backoff

### 基本設定

```typescript
await queue.add('work', data, {
  attempts: 5,                     // 重試 5 次（共 5 次嘗試）
  backoff: {
    type: 'exponential',           // 2^(n-1) * delay
    delay: 1000,
  },
});
```

### Fixed Backoff

```typescript
{ attempts: 3, backoff: { type: 'fixed', delay: 2000 } }
```

### 加入 Jitter（隨機化）

```typescript
{
  attempts: 8,
  backoff: { type: 'exponential', delay: 3000, jitter: 0.5 },  // ±50%
}
```

Jitter 打散重試尖峰，避免 thundering herd。

### 自訂 Backoff Strategy

```typescript
const worker = new Worker('q', processor, {
  connection,
  settings: {
    backoffStrategy: (attemptsMade, type, err, job) => {
      if (type === 'my-strategy') return attemptsMade * 1000;
      throw new Error('unknown');
    },
  },
});

await queue.add('work', {}, {
  attempts: 3,
  backoff: { type: 'my-strategy' },
});
```

## UnrecoverableError 與停止重試

### 不重試立即失敗

```typescript
import { UnrecoverableError } from 'bullmq';

const worker = new Worker('q', async (job) => {
  if (job.data.invalid) {
    throw new UnrecoverableError('bad input');    // 跳過所有重試
  }
}, { connection });
```

### DelayedError（延遲重試）

```typescript
import { DelayedError } from 'bullmq';

const worker = new Worker('q', async (job, token) => {
  await job.moveToDelayed(Date.now() + 60000, token);
  throw new DelayedError();   // 告訴 BullMQ job 已被手動 delay
});
```

### WaitingChildrenError（等待子任務）

```typescript
import { WaitingChildrenError } from 'bullmq';

const worker = new Worker('parent', async (job, token) => {
  // 加入子任務...
  await job.moveToWaitingChildren(token);
  throw new WaitingChildrenError();
});
```
