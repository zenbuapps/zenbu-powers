# BullMQ v5 — FlowProducer（工作流）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「parent-child flow、巢狀、getChildrenValues、failParentOnFailure、batch flow」時載入。

## 基本 Parent-Child

```typescript
import { FlowProducer } from 'bullmq';

const flow = new FlowProducer({ connection });

const tree = await flow.add({
  name: 'renovate',
  queueName: 'renovate',
  data: { house: 'main' },
  children: [
    { name: 'paint', queueName: 'steps', data: { place: 'ceiling' } },
    { name: 'paint', queueName: 'steps', data: { place: 'walls' } },
    { name: 'fix',   queueName: 'steps', data: { place: 'floor' } },
  ],
  opts: {
    attempts: 3,
  },
});

// tree.job 是 parent, tree.children 是子 jobs
```

**Parent 等所有 children 完成後才會 `active`**。

## 多層巢狀

```typescript
await flow.add({
  name: 'deploy',
  queueName: 'pipeline',
  children: [
    {
      name: 'build',
      queueName: 'pipeline',
      children: [
        { name: 'lint', queueName: 'pipeline' },
        { name: 'test', queueName: 'pipeline' },
      ],
    },
    { name: 'package', queueName: 'pipeline' },
  ],
});
```

## 在 processor 中存取子結果

```typescript
const worker = new Worker('renovate', async (job) => {
  const childValues = await job.getChildrenValues();
  // { 'jobKey1': {...}, 'jobKey2': {...} }
});
```

## 手動加入依賴

```typescript
await parentJob.moveToWaitingChildren(token);

// Child 失敗時 parent 行為
const flow = await flowProducer.add({
  name: 'parent',
  queueName: 'q',
  opts: { failParentOnFailure: true },  // 任一子失敗 → parent 失敗
  children: [{
    name: 'child',
    queueName: 'q',
    opts: { ignoreDependencyOnFailure: true }, // 或此子失敗 parent 仍跑
  }],
});
```

## 取得 Flow Tree

```typescript
const tree = await flow.getFlow({ id: jobId, queueName: 'q', depth: 3 });
```

## 批次 Flow

```typescript
await flow.addBulk([{ name: 'f1', queueName: 'q' }, { name: 'f2', queueName: 'q' }]);
```

## 關閉

```typescript
await flow.close();
```
