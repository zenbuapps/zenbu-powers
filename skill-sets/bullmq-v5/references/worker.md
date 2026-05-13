# BullMQ v5 — Worker（處理器）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「new Worker、processor 簽名、autorun、concurrency、sandbox、Worker 事件」時載入。

## 建構子

```typescript
import { Worker, Job } from 'bullmq';

const worker = new Worker<DataType, ReturnType, NameType>(
  'myqueue',
  async (job: Job, token?: string) => {
    await job.updateProgress(50);
    await job.log('starting');
    // ...work
    return { result: 'ok' };
  },
  {
    connection: { host: 'localhost', port: 6379, maxRetriesPerRequest: null },
    concurrency: 5,                // 並行 job 數
    autorun: true,                 // 自動啟動（否則需 worker.run()）
    limiter: {                     // 限流
      max: 100,
      duration: 1000,              // 每秒 100 個
    },
    metrics: { maxDataPoints: 24 * 60 },
    prefix: 'bull',
    name: 'my-worker',             // 監控顯示名
    lockDuration: 30000,           // 鎖定秒數
    stalledInterval: 30000,
    maxStalledCount: 1,
    drainDelay: 5,
    skipVersionCheck: false,
    useWorkerThreads: false,       // 用 worker_threads 隔離 processor
    settings: {                    // backoff 策略等
      backoffStrategy: (attemptsMade, type, err, job) => attemptsMade * 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
);
```

## Processor Function 簽名

```typescript
type Processor<D = any, R = any, N extends string = string> =
  (job: Job<D, R, N>, token?: string) => Promise<R>;
```

`token` 是 worker 目前處理該 job 的 lock token，需要呼叫 `job.moveToXXX(token)` 等手動 API 時會用到。

## 執行流程

```typescript
// autorun: false 時手動啟動
await worker.run();

// 暫停（不接新 job）
await worker.pause(doNotWaitActive?: boolean);

// 恢復
await worker.resume();

// 關閉
await worker.close(force?: boolean);

// 檢查
worker.isRunning();
worker.isPaused();
```

## Worker 事件

```typescript
worker.on('ready', () => {});
worker.on('active', (job, prev) => {});
worker.on('progress', (job, progress) => {});
worker.on('completed', (job, returnvalue) => {});
worker.on('failed', (job, error, prev) => {});
worker.on('error', (err) => {});     // 必須註冊，否則 unhandled
worker.on('stalled', (jobId, prev) => {});
worker.on('drained', () => {});      // 佇列暫時清空
worker.on('closed', () => {});
worker.on('closing', () => {});
```

## Sandbox Processor（獨立 process）

```typescript
// processor.ts
module.exports = async (job) => { /* ... */ return 'ok'; };

// main.ts
import path from 'path';
const worker = new Worker('myqueue', path.join(__dirname, 'processor.js'));
```

用於：
- 避免 CPU-bound 處理卡住 event loop
- 防止 memory leak 汙染主 process
- 每個 job 一個乾淨的 process
