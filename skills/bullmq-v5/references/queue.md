# BullMQ v5 — Queue（佇列）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「new Queue、queue.add、JobsOptions、addBulk、查詢/管理」時載入。

## 建構子

```typescript
import { Queue, QueueOptions } from 'bullmq';

const queue = new Queue<DataType, ReturnType, NameType>('myqueue', {
  connection,
  prefix: 'bull',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
  streams: {
    events: { maxLen: 10000 },
  },
  telemetry: { /* OpenTelemetry */ },
});
```

## 新增 Job

```typescript
// 基本
const job = await queue.add('paint', { color: 'red' });

// 帶 options
const job = await queue.add(
  'paint',
  { color: 'blue' },
  {
    jobId: 'custom-id',           // 自訂 id，可達成 deduplication
    delay: 5000,                  // 延遲 5 秒
    priority: 10,                 // 數字越小越優先（1 最高）
    attempts: 3,                  // 失敗重試次數
    backoff: { type: 'exponential', delay: 1000 },
    lifo: false,                  // LIFO 模式
    removeOnComplete: true,       // 或 { count: 1000, age: 3600 }
    removeOnFail: false,
    deduplication: { id: 'dedup-key', ttl: 60000 },
    debounce: { id: 'debounce-key', ttl: 5000 },
    sizeLimit: 1024,              // 單一 job data bytes 上限
    rateLimiterKey: 'user-123',   // 自訂限流 key
  },
);
```

## JobsOptions 全表

| 選項 | 型別 | 說明 |
|------|------|------|
| `jobId` | `string` | 自訂 id；衝突則忽略新 job |
| `delay` | `number` | 延遲毫秒 |
| `priority` | `number` | 1-2^21（越小越優先） |
| `attempts` | `number` | 失敗重試次數 |
| `backoff` | `{ type, delay, jitter? }` | `'fixed' \| 'exponential' \| 'custom'` |
| `lifo` | `boolean` | LIFO 模式（後進先出） |
| `removeOnComplete` | `boolean \| number \| { count, age }` | 完成後自動移除 |
| `removeOnFail` | `boolean \| number \| { count, age }` | 失敗後自動移除 |
| `deduplication` | `{ id, ttl?, extend?, replace? }` | 去重（TTL 期間同 id 只保留一個） |
| `debounce` | `{ id, ttl }` | Debounce（TTL 內重複 add 只觸發最後一個） |
| `sizeLimit` | `number` | Data bytes 上限 |
| `rateLimiterKey` | `string` | 自訂限流 bucket key |
| `parent` | `{ id, queue }` | 建立與 parent job 的關聯（Flow） |
| `failParentOnFailure` | `boolean` | 子失敗時 parent 也標記失敗 |
| `continueParentOnFailure` | `boolean` | 子失敗時仍推進 parent |
| `ignoreDependencyOnFailure` | `boolean` | 子失敗時 parent 忽略此依賴 |
| `repeat` | `RepeatOptions` | **已棄用**，改用 `upsertJobScheduler` |

## 批次新增

```typescript
await queue.addBulk([
  { name: 'paint', data: { color: 'red' } },
  { name: 'paint', data: { color: 'blue' }, opts: { delay: 1000 } },
]);
```

## 查詢 / 管理

```typescript
// 依狀態取 jobs
const jobs = await queue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed'], 0, -1, true);

// 各狀態計數
const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed', 'paused');

// 單一 job
const job = await queue.getJob('jobId');

// Pause / Resume（全域）
await queue.pause();     // worker 不再接新 job
await queue.resume();
const paused = await queue.isPaused();

// 清除
await queue.drain(delayed?: boolean);        // 移除所有 waiting + delayed（不動 active）
await queue.clean(grace, limit, type);       // type: 'completed' | 'failed' | 'wait' | 'active' | 'delayed' | 'paused' | 'prioritized'
await queue.obliterate({ force: true });     // 刪除整個 queue 包含 active jobs

// 關閉
await queue.close();
```

## Queue 事件（本地）

```typescript
queue.on('error', (err) => {});
queue.on('waiting', (job) => {});
queue.on('paused', () => {});
queue.on('resumed', () => {});
```
