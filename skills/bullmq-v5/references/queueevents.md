# BullMQ v5 — QueueEvents（事件監聽）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「跨 process 監聽事件、QueueEvents listener、waitUntilCompleted」時載入。

**為什麼需要**：Worker 只能監聽自己 process 內發生的事件；若要從另一個 process / 服務監聽，要用 `QueueEvents`（底層基於 Redis Streams）。

```typescript
import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents('myqueue', { connection });

queueEvents.on('waiting', ({ jobId }) => {});
queueEvents.on('active', ({ jobId, prev }) => {});
queueEvents.on('delayed', ({ jobId, delay }) => {});
queueEvents.on('progress', ({ jobId, data }) => {});
queueEvents.on('completed', ({ jobId, returnvalue, prev }) => {});
queueEvents.on('failed', ({ jobId, failedReason, prev }) => {});
queueEvents.on('removed', ({ jobId, prev }) => {});
queueEvents.on('stalled', ({ jobId }) => {});
queueEvents.on('duplicated', ({ jobId }) => {});
queueEvents.on('retries-exhausted', ({ jobId, attemptsMade }) => {});
queueEvents.on('cleaned', ({ count }) => {});
queueEvents.on('drained', () => {});
queueEvents.on('paused', () => {});
queueEvents.on('resumed', () => {});
queueEvents.on('added', ({ jobId, name }) => {});

// 等待某 job 完成
await queueEvents.waitUntilCompleted(jobId, ttl?);

// 關閉
await queueEvents.close();
```
