# BullMQ v5 — Job（任務）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「Job 屬性、updateProgress/log/updateData、isCompleted/Failed、moveToXxx、Flow getChildrenValues」時載入。

## 屬性

```typescript
interface Job<D = any, R = any, N = string> {
  id: string;
  name: N;
  data: D;
  opts: JobsOptions;
  progress: number | object;
  returnvalue: R;
  stacktrace: string[];
  attemptsMade: number;
  attemptsStarted: number;
  timestamp: number;             // 建立時間
  processedOn?: number;          // 開始處理時間
  finishedOn?: number;           // 完成時間
  delay: number;
  priority: number;
  parent?: { id, queueKey };
  token?: string;
  failedReason?: string;
}
```

## 方法（runtime 可用）

```typescript
// 進度
await job.updateProgress(50);
await job.updateProgress({ percent: 50, step: 'upload' });

// 日誌（可在 UI 查看）
await job.log('Started');
const logs = await job.getLogs(start?, end?, asc?);

// 更新 data
await job.updateData({ ...job.data, newField: 'x' });

// 查狀態
const state = await job.getState();  // 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'waiting-children' | 'paused' | 'unknown'

// Predicates（從 Redis 查）
await job.isCompleted();
await job.isFailed();
await job.isActive();
await job.isDelayed();
await job.isWaiting();
await job.isWaitingChildren();

// 管理
await job.remove();
await job.retry('failed' | 'completed');
await job.promote();              // 延遲 job 提前執行
await job.discard();               // 把 job 標為不可重試

// 手動移動（通常 processor return 即可，但 manual fetch 模式會用）
await job.moveToCompleted(returnValue, token, fetchNext?);
await job.moveToFailed(error, token, fetchNext?);
await job.moveToDelayed(timestamp, token);
await job.moveToWaitingChildren(token, opts);   // 等待子任務

// 鎖
await job.extendLock(token, duration);

// 取結果（等待完成）
await job.waitUntilFinished(queueEvents, ttl?);  // 需要 QueueEvents 實例

// Flow 相關
await job.getChildrenValues();        // 所有子 job 回傳值
const deps = await job.getDependencies({ processed: { cursor, count }, unprocessed: { cursor, count } });
const counts = await job.getDependenciesCount();  // { processed, unprocessed, failed, ignored }
```

## 從 Queue 取回

```typescript
const job = await queue.getJob('jobId');
```
