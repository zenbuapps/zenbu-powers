# BullMQ v5 — Connection（Redis 連線）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「設定 Redis 連線、IORedis 共用、prefix、URL」時載入。

## 基本

```typescript
import { Queue } from 'bullmq';

const queue = new Queue('myqueue', {
  connection: { host: 'localhost', port: 6379 },
});
```

## 共用 IORedis 實例（推薦）

```typescript
import IORedis from 'ioredis';
import { Queue, Worker } from 'bullmq';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  password: 'secret',
  maxRetriesPerRequest: null,   // Worker 必須設 null
});

const queue = new Queue('myqueue', { connection });
const worker = new Worker('myqueue', processor, { connection });
```

**重要**：
- **Worker 的 connection 必須 `maxRetriesPerRequest: null`**，否則 blocking command 會失敗。
- Queue（生產者）可保留預設值（20）或設為低值以快速失敗。
- **不可使用 ioredis 的 `keyPrefix`**，BullMQ 有自己的 prefix 機制（建構子 `prefix` 選項）。
- Redis 必須 `maxmemory-policy=noeviction`，避免 key 被自動淘汰。

## 使用 URL

```typescript
const connection = new IORedis('rediss://user:pass@host:6380/0', {
  maxRetriesPerRequest: null,
});
```

## 自訂 Prefix（Multi-tenant / 隔離）

```typescript
new Queue('myqueue', {
  connection,
  prefix: 'bull',                // 預設 'bull'，可改 'bull:tenant1'
});
```
