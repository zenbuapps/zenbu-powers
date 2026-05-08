# NestJS v11 — Custom Providers & Provider Scopes

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「useValue/useClass/useFactory、Scope.REQUEST、durable provider」時載入。

## Custom Providers

### useValue

```typescript
const mockCatsService = { /* ... */ };

@Module({
  providers: [
    { provide: CatsService, useValue: mockCatsService },
  ],
})
export class AppModule {}
```

### 非 class token（string / symbol）

```typescript
@Module({
  providers: [{ provide: 'CONNECTION', useValue: connection }],
})
export class AppModule {}

@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

### useClass（動態決定實作）

```typescript
const configProvider = {
  provide: ConfigService,
  useClass: process.env.NODE_ENV === 'development'
    ? DevelopmentConfigService
    : ProductionConfigService,
};
```

### useFactory（可注入依賴 / 可 async）

```typescript
const connectionProvider = {
  provide: 'CONNECTION',
  useFactory: (opts: OptionsProvider, optional?: string) => {
    return new DatabaseConnection(opts.get());
  },
  inject: [
    OptionsProvider,
    { token: 'SOME_OPTIONAL', optional: true },
  ],
};

// Async factory
const asyncConnection = {
  provide: 'ASYNC_CONN',
  useFactory: async () => {
    const conn = await createConnection();
    return conn;
  },
};
```

### useExisting（alias）

```typescript
const loggerAlias = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};
```

### 匯出

```typescript
@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],  // 透過 token 匯出
})
export class AppModule {}
```

## Provider Scopes

### 三種 Scope

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })     // 單例（預設）
@Injectable({ scope: Scope.REQUEST })     // 每個請求新實例
@Injectable({ scope: Scope.TRANSIENT })   // 每個注入者新實例
export class CatsService {}
```

**REQUEST scope 會向上傳播**：依賴 request-scoped 服務的控制器也會變 request-scoped。TRANSIENT 不會傳播。

### 存取 Request

```typescript
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

### Inquirer（TRANSIENT 專屬）

```typescript
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class HelloService {
  constructor(@Inject(INQUIRER) private parent: object) {}
  name() { return this.parent?.constructor?.name; }
}
```

### Durable Providers（多租戶）

```typescript
import { HostComponentInfo, ContextId, ContextIdFactory, ContextIdStrategy } from '@nestjs/core';

export class TenantStrategy implements ContextIdStrategy {
  attach(contextId: ContextId, request: Request) {
    const tenantId = request.headers['x-tenant-id'] as string;
    // ...共用 sub-tree
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? sharedContextId : contextId;
  }
}

// main.ts
ContextIdFactory.apply(new TenantStrategy());

// Mark as durable
@Injectable({ scope: Scope.REQUEST, durable: true })
export class TenantService {}
```
