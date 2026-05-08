# NestJS v11 — Testing（@nestjs/testing）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「Test.createTestingModule、覆寫 provider/guard、E2E、request-scoped 測試」時載入。

## 安裝

```bash
npm i --save-dev @nestjs/testing
```

## 基本 Unit Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();

    controller = module.get(CatsController);
    service = module.get(CatsService);
  });

  it('returns cats', () => {
    jest.spyOn(service, 'findAll').mockReturnValue(['a']);
    expect(controller.findAll()).toEqual(['a']);
  });
});
```

## TestingModule 方法

| 方法 | 用途 |
|------|------|
| `compile()` | 編譯模組、解析依賴 |
| `get(token)` | 取得 singleton 實例 |
| `resolve(token, contextId?)` | 取得 request/transient 實例（async） |
| `createNestApplication()` | 建立完整 INestApplication |

## 覆寫 Provider / Guard / Filter / Interceptor / Pipe

```typescript
const module = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(CatsService).useValue(mockService)
  .overrideProvider(OtherService).useClass(MockOtherService)
  .overrideProvider(ThirdService).useFactory({ factory: () => ({}) })
  .overrideGuard(JwtAuthGuard).useClass(MockAuthGuard)
  .overrideInterceptor(LoggingInterceptor).useClass(MockInterceptor)
  .overrideFilter(HttpExceptionFilter).useClass(MockFilter)
  .overridePipe(ValidationPipe).useClass(MockPipe)
  .overrideModule(CatsModule).useModule(MockCatsModule)
  .compile();
```

## Auto-mocking（useMocker）

```typescript
.useMocker((token) => {
  if (token === CatsService) return { findAll: jest.fn().mockResolvedValue([]) };
  // 可用 jest-mock 或 @golevelup/ts-jest 自動產生 mock
})
```

## E2E Test（supertest）

```typescript
import * as request from 'supertest';

describe('Cats (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('/GET cats', () =>
    request(app.getHttpServer()).get('/cats').expect(200));

  afterAll(() => app.close());
});
```

## 測試 Request-scoped Provider

```typescript
import { ContextIdFactory } from '@nestjs/core';

const contextId = ContextIdFactory.create();
jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

const service = await module.resolve(CatsService, contextId);
```
