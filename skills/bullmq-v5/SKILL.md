---
name: bullmq-v5
description: >
  BullMQ v5 完整技術參考，對應 bullmq ^5.x。
  當程式碼出現任何以下情況時，必須使用此 skill：
  import from 'bullmq'、import from '@nestjs/bullmq'、import IORedis from 'ioredis'（與 BullMQ 搭配）；
  new Queue、new Worker、new QueueEvents、new FlowProducer、new Job；
  queue.add、queue.addBulk、queue.upsertJobScheduler、queue.removeJobScheduler、
  queue.getJob、queue.getJobs、queue.getJobCounts、queue.pause、queue.resume、queue.clean、queue.obliterate、
  worker.run、worker.close、worker.pause、worker.resume、worker.rateLimit；
  job.updateProgress、job.log、job.updateData、job.getState、job.remove、job.retry、
  job.isCompleted、job.isFailed、job.isActive、job.isDelayed、job.isWaiting；
  JobsOptions、QueueOptions、WorkerOptions、ConnectionOptions、FlowJob、Processor；
  Worker.RateLimitError、UnrecoverableError、DelayedError、WaitingChildrenError；
  BullModule.forRoot、BullModule.registerQueue、BullModule.registerFlowProducer、
  @Processor、@WorkerHost、@InjectQueue、@InjectFlowProducer、@OnWorkerEvent、@OnQueueEvent。
  注意：v5 已棄用舊 Repeatable Jobs API，新的是 Job Schedulers（upsertJobScheduler）。
  v5 不再需要 QueueScheduler。v5 需要 Redis 6.2.0+ 或相容替代品（Dragonfly、Valkey）。
---

# BullMQ v5

> **版本對應**：bullmq ^5.x / @nestjs/bullmq ^10.x / ioredis ^5.x
> **文件來源**：https://docs.bullmq.io/
> **前提**：Redis 6.2.0+（或 Valkey / Dragonfly）、Node.js 18+

BullMQ 是基於 Redis 的分散式任務佇列，適合背景作業、排程任務、工作流（Flow）等。

---

## 核心觀念速查

| 角色 | 職責 | Class |
|------|------|-------|
| Queue | 生產者端，把 job 放入 Redis | `Queue` |
| Worker | 消費者端，從 Redis 取 job 執行 | `Worker` |
| Job | 個別任務，有資料、狀態、options | `Job` |
| QueueEvents | 監聽全域 queue 事件（跨 process） | `QueueEvents` |
| FlowProducer | 建立 parent-child 工作流 | `FlowProducer` |
| Job Scheduler | 產生重複（cron / every）任務的工廠 | `upsertJobScheduler` |

Job 狀態轉移：
`waiting → active → completed`
`waiting → active → failed` (或 → `delayed` 後重試)
`paused` 可暫停 queue
`waiting-children` parent job 等待子任務完成

---

## References 索引（按需載入，**不要全載**）

依當前任務需要哪段，才 Read 對應 reference。每份檔案完整保留範例與選項表。

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| Connection（Redis 連線） | `references/connection.md` | IORedis 共用、maxRetriesPerRequest、prefix、URL |
| Queue（佇列） | `references/queue.md` | new Queue、queue.add、JobsOptions 全表、addBulk、查詢/管理 |
| Worker（處理器） | `references/worker.md` | new Worker、processor 簽名、autorun、concurrency、sandbox、events |
| Job（任務） | `references/job.md` | Job 屬性、updateProgress/log、isCompleted/Failed、moveToXxx、Flow getChildrenValues |
| QueueEvents | `references/queueevents.md` | 跨 process 監聽事件、waitUntilCompleted |
| Job Schedulers（重複任務） | `references/job-schedulers.md` | upsertJobScheduler、cron pattern、tz、自訂 RRULE strategy |
| FlowProducer（工作流） | `references/flowproducer.md` | parent-child、巢狀、getChildrenValues、failParentOnFailure、batch flow |
| Rate Limiting / Retry / Errors | `references/rate-limiting-retry-errors.md` | limiter、worker.rateLimit、attempts/backoff（exp/fixed/jitter/custom）、UnrecoverableError、DelayedError、WaitingChildrenError |
| NestJS 整合 | `references/nestjs-integration.md` | BullModule.forRoot/registerQueue、@Processor、WorkerHost、@InjectQueue、QueueEventsListener |

---

## 生產環境建議

1. **`maxmemory-policy=noeviction`**：Redis 必須這樣設，否則 key 可能被淘汰。
2. **`maxRetriesPerRequest: null`** on Worker connection：blocking command 需要。
3. **分開 Queue 與 Worker 的 Redis client**：避免 Worker 的長連接阻塞 producer。
4. **Graceful shutdown**：收到 SIGTERM 時 `await worker.close()`，讓 active job 跑完。
5. **`removeOnComplete / removeOnFail`**：永遠設定，否則 Redis 會累積無限 completed/failed job metadata。
6. **`lockDuration`**：若 job 可能跑超過 30 秒，要調大，並在長任務裡 `job.extendLock(token, ms)`。
7. **Idempotency**：使用 `jobId` + business key 防止重複執行；worker 要假設可能被重試。
8. **Monitor**：接 `error` 事件、監聽 `stalled` / `failed` 事件；用 Bull Board / Arena / Prometheus。
9. **Sandbox processor**：CPU-bound 任務用獨立 process 隔離。
10. **`concurrency` 選擇**：I/O-bound 可設高（100+），CPU-bound 通常 = CPU 核心數。

---

## 常見陷阱

| 症狀 | 原因 | 解法 |
|------|------|------|
| `maxRetriesPerRequest` 警告 / connection 失敗 | Worker 連線未設 `null` | `new IORedis({ maxRetriesPerRequest: null })` |
| Job 跑到一半被 stalled | `lockDuration` 太短 | 調大或週期 `job.extendLock` |
| 重複執行同一 job | 未設 `jobId` 或業務層未 idempotent | 用業務唯一 id 當 jobId |
| Queue 無限增大 | 沒設 `removeOnComplete/Fail` | 加上 `{ age, count }` |
| 定期任務錯過 | 用舊 Repeatable Jobs API | 改用 `upsertJobScheduler` |
| Worker 無法關閉 | active job 卡住 | `worker.close(true)` 強制；設定 grace period |
| Flow parent 永遠 waiting-children | 子任務 `failParentOnFailure` 或 missing | 檢查 parent options 與 child 狀態 |
| ioredis `keyPrefix` 衝突 | 使用了 ioredis 的 prefix | 改用 BullMQ `prefix` 選項 |
