# BullMQ v5 — Job Schedulers（重複任務）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「upsertJobScheduler、cron pattern、tz、自訂 RRULE strategy」時載入。

**v5.16+ 取代舊的 Repeatable Jobs**：更簡潔、支援更新、更可靠。

## 建立 / 更新 Scheduler

```typescript
// 每 1 秒觸發
await queue.upsertJobScheduler('my-scheduler-id', {
  every: 1000,
});

// cron（秒支援，6 欄位）
await queue.upsertJobScheduler(
  'daily-report',
  { pattern: '0 15 3 * * *' },     // 每日 03:15:00
  {
    name: 'report',
    data: { type: 'daily' },
    opts: {
      attempts: 5,
      backoff: 3,
      removeOnFail: 1000,
    },
  },
);

// cron 帶時區
await queue.upsertJobScheduler(
  'weekly',
  {
    pattern: '0 0 * * MON',
    tz: 'Asia/Taipei',
    utc: false,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    limit: 100,                    // 最多 100 次
    immediately: true,             // 立即執行一次再按排程
  },
  { name: 'weekly-report', data: {} },
);
```

## 管理

```typescript
// 列出所有 scheduler
const schedulers = await queue.getJobSchedulers();

// 取單一
const sch = await queue.getJobScheduler('my-scheduler-id');

// 計數
const count = await queue.getJobSchedulersCount();

// 刪除
await queue.removeJobScheduler('my-scheduler-id');
```

## 自訂 Repeat Strategy（例：RRULE）

```typescript
import { rrulestr } from 'rrule';

const queue = new Queue('myqueue', {
  connection,
  settings: {
    repeatStrategy: (millis: number, opts: any) => {
      const rrule = rrulestr(opts.pattern);
      return rrule.after(new Date(millis), false)?.getTime();
    },
  },
});

await queue.upsertJobScheduler('rrule-id', {
  pattern: 'RRULE:FREQ=DAILY;INTERVAL=1',
});
```

## 舊 Repeatable Jobs（不建議）

```typescript
// 僅作為 migration 參考
await queue.add('repeat', {}, { repeat: { pattern: '0 * * * *' } });
await queue.getRepeatableJobs();
await queue.removeRepeatableByKey(key);
```

新專案應改用 `upsertJobScheduler`。
