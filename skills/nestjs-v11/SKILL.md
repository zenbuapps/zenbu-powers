---
name: nestjs-v11
description: >
  NestJS v11 技術參考，對應 @nestjs/core ^11.x、@nestjs/common ^11.x，需 Node.js 20+、
  TypeScript 5.x、RxJS 7.x。decorator 驅動的 Node.js 後端框架，採 Angular 風格 DI 與模組系統。
  當 import from '@nestjs/core'、'@nestjs/common'、'@nestjs/config'、'@nestjs/testing'、
  '@nestjs/typeorm'、'@nestjs/bullmq'、'@nestjs/platform-express' 或
  '@nestjs/platform-fastify' 時必須使用此 skill。代表性 trigger：@Module、@Controller、
  @Injectable、@Get/@Post/@Put/@Delete、@Body/@Query/@Param、@UseGuards/@UseInterceptors/
  @UsePipes/@UseFilters、NestFactory.create、CanActivate、PipeTransform、ExceptionFilter、
  ValidationPipe、HttpException、ConfigService、Test.createTestingModule、APP_GUARD/APP_PIPE/
  APP_INTERCEPTOR/APP_FILTER、forRoot/forRootAsync/forFeature、Reflector、ExecutionContext。
  涵蓋 Modules、Controllers、Providers、Pipes、Guards、Interceptors、Exception Filters、
  Middleware、Custom Decorators、Dynamic Modules、@nestjs/config、@nestjs/testing。
---

# NestJS v11 (@nestjs/core, @nestjs/common)

> **版本對應**：@nestjs/core ^11.x / @nestjs/common ^11.x / @nestjs/config ^3.x / @nestjs/testing ^11.x
> **文件來源**：https://docs.nestjs.com/ | 本 SKILL 對應 NestJS v11
> **最低需求**：Node.js 20+、TypeScript 5.x、RxJS 7.x

NestJS 是以 decorator 驅動、建構在 Express（或 Fastify）之上的 Node.js 後端框架，核心採用 Angular 風格的依賴注入與模組系統。

---

## 核心概念速查

| 概念 | 裝飾器 / API | 套件 |
|------|-------------|------|
| 模組 | `@Module({ imports, controllers, providers, exports })` | @nestjs/common |
| 控制器 | `@Controller(path?)` | @nestjs/common |
| 服務 | `@Injectable({ scope?, durable? })` | @nestjs/common |
| 路由 | `@Get/@Post/@Put/@Delete/@Patch/@Options/@Head/@All(path?)` | @nestjs/common |
| 參數 | `@Body/@Query/@Param/@Headers/@Session/@Ip/@HostParam` | @nestjs/common |
| 請求對象 | `@Req()` / `@Res()` / `@Next()` | @nestjs/common |
| HTTP 回應 | `@HttpCode/@Header/@Redirect/@Render` | @nestjs/common |
| 管線 | `@UsePipes(...)` | @nestjs/common |
| 守衛 | `@UseGuards(...)` | @nestjs/common |
| 攔截器 | `@UseInterceptors(...)` | @nestjs/common |
| 過濾器 | `@UseFilters(...)` | @nestjs/common |
| 全域註冊 | `APP_PIPE / APP_GUARD / APP_INTERCEPTOR / APP_FILTER` | @nestjs/core |

生命週期順序（請求進入到回應）：
`Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → ExceptionFilter`

---

## References 索引（按需載入，**不要全載**）

依當前任務需要哪段，才 Read 對應 reference。每份檔案完整保留範例與選項表。

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| Controllers（路由） | `references/controllers.md` | 設計 HTTP 端點、路由參數、回應控制、子網域 |
| Providers 與 DI | `references/providers-di.md` | 定義 Service、constructor injection、@Optional |
| Modules（模組系統） | `references/modules.md` | @Module、Global、forwardRef、module 重匯出 |
| Pipes（驗證/轉換） | `references/pipes.md` | ValidationPipe、ParseIntPipe、自訂 PipeTransform |
| Guards（授權） | `references/guards.md` | CanActivate、Roles、Reflector、APP_GUARD |
| Interceptors | `references/interceptors.md` | logging、回應轉換、快取、逾時、RxJS 模式 |
| Exception Filters | `references/exception-filters.md` | HttpException、@Catch、AllExceptionsFilter |
| Middleware | `references/middleware.md` | NestMiddleware、MiddlewareConsumer、global |
| Custom Providers / Scopes | `references/custom-providers-scopes.md` | useValue/useClass/useFactory、Scope.REQUEST、durable |
| Custom Decorators | `references/custom-decorators.md` | createParamDecorator、applyDecorators 組合 |
| Dynamic Modules | `references/dynamic-modules.md` | register/forRoot/forFeature、ConfigurableModuleBuilder |
| Configuration | `references/config.md` | @nestjs/config、ConfigService、registerAs、validation |
| Testing | `references/testing.md` | Test.createTestingModule、覆寫 provider、E2E |

---

## APP_ 常數 token（全域 Provider）

從 `@nestjs/core` 匯入，用於把 Guard / Pipe / Interceptor / Filter 註冊為可注入依賴的全域實例：

```typescript
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
```

**與 `app.useGlobalXxx()` 的差別**：APP_ token 版本可享 DI（能注入其他 Provider），`useGlobalXxx()` 則不能。

---

## Bootstrap 範例

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## 常見陷阱

1. **`@Res()` 搭配 return**：使用 `@Res()` 會停用 Nest 回應機制，必須呼叫 `res.send()`，除非加 `passthrough: true`。
2. **ValidationPipe 沒搭配 class-validator**：必須 `npm i class-validator class-transformer`。
3. **REQUEST scope 成本**：每請求新建實例，影響效能；考慮 durable provider。
4. **Global middleware 無 DI**：`app.use()` 註冊的全域 middleware 無法注入 provider。
5. **forwardRef**：循環依賴的兩端都要用 `forwardRef`，不然啟動時會報錯。
6. **Test 的 Guard 覆寫**：e2e 測試要記得用 `.overrideGuard()` 繞過認證。
