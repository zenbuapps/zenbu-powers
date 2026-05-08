# BullMQ v5 — NestJS 整合（@nestjs/bullmq）

> 本檔屬 `skills/bullmq-v5/` 的子 reference，由主 SKILL.md 在「BullModule.forRoot/forRootAsync/registerQueue/registerFlowProducer、@Processor、WorkerHost、@InjectQueue、@OnWorkerEvent、QueueEventsListener」時載入。

## 安裝

```bash
npm i @nestjs/bullmq bullmq ioredis
```

## 根模組

```typescript
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
      },
    }),
  ],
})
export class AppModule {}
```

## Async 設定

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: {
      host: config.get('REDIS_HOST'),
      port: +config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
      maxRetriesPerRequest: null,
    },
  }),
});
```

## 註冊 Queue

```typescript
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
      defaultJobOptions: { attempts: 3 },
    }),
    BullModule.registerQueue({ name: 'reports' }),
  ],
})
export class QueueModule {}
```

## 注入 Queue（Producer）

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendWelcome(userId: number) {
    await this.emailQueue.add('welcome', { userId });
  }
}
```

## Processor（Worker）

```typescript
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  async process(job: Job<{ userId: number }>, token?: string): Promise<void> {
    switch (job.name) {
      case 'welcome':
        await this.sendWelcome(job.data.userId);
        break;
      case 'reset-password':
        await this.sendReset(job.data);
        break;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`${job.id} done`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.error(`${job.id} failed`, error);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {}
}
```

**注意**：`@Processor` 所裝飾的類必須在該 Feature Module 的 `providers` 陣列中。

## FlowProducer

```typescript
// 註冊
BullModule.registerFlowProducer({ name: 'deploy-flow' });

// 注入
@Injectable()
export class DeployService {
  constructor(
    @InjectFlowProducer('deploy-flow') private flow: FlowProducer,
  ) {}

  async run() {
    await this.flow.add({ name: 'deploy', queueName: 'pipeline', children: [] });
  }
}
```

## QueueEvents Listener（跨 process 事件）

```typescript
import { QueueEventsListener, QueueEventsHost, OnQueueEvent } from '@nestjs/bullmq';

@QueueEventsListener('email')
export class EmailQueueEvents extends QueueEventsHost {
  @OnQueueEvent('completed')
  onCompleted({ jobId, returnvalue }: { jobId: string; returnvalue: string }) {}

  @OnQueueEvent('failed')
  onFailed({ jobId, failedReason }: { jobId: string; failedReason: string }) {}
}
```
