# NestJS v11 — Middleware

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「註冊 Middleware、MiddlewareConsumer、global middleware」時載入。

## Class-based Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

## 註冊（MiddlewareConsumer）

```typescript
@Module({ imports: [CatsModule] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'cats', method: RequestMethod.GET },
        'cats/{*splat}'
      )
      .forRoutes(CatsController);  // 或 'cats' / { path, method }
  }
}

// 多個 middleware 串連
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);

// With HTTP method
consumer.apply(LoggerMiddleware).forRoutes({
  path: 'cats',
  method: RequestMethod.GET,
});

// Wildcard（NestJS 11）
consumer.apply(LoggerMiddleware).forRoutes({
  path: 'abcd/*splat',
  method: RequestMethod.ALL,
});
```

## Functional Middleware

```typescript
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('Request');
  next();
}

consumer.apply(logger).forRoutes(CatsController);
```

## Global Middleware

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.use(logger);  // 但無法使用 DI
```
