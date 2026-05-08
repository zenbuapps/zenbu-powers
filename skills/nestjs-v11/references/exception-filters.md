# NestJS v11 — Exception Filters

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「處理 HttpException、自訂錯誤格式、AllExceptionsFilter」時載入。

## 內建例外（全部繼承自 HttpException）

| 例外 | Status | 例外 | Status |
|------|--------|------|--------|
| `BadRequestException` | 400 | `UnauthorizedException` | 401 |
| `NotFoundException` | 404 | `ForbiddenException` | 403 |
| `NotAcceptableException` | 406 | `RequestTimeoutException` | 408 |
| `ConflictException` | 409 | `GoneException` | 410 |
| `PayloadTooLargeException` | 413 | `UnsupportedMediaTypeException` | 415 |
| `UnprocessableEntityException` | 422 | `InternalServerErrorException` | 500 |
| `NotImplementedException` | 501 | `BadGatewayException` | 502 |
| `ServiceUnavailableException` | 503 | `GatewayTimeoutException` | 504 |
| `HttpVersionNotSupportedException` | 505 | `ImATeapotException` | 418 |
| `MethodNotAllowedException` | 405 | `PreconditionFailedException` | 412 |

## HttpException 建構子

```typescript
throw new HttpException(response, status, options?);

// 字串回應
throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

// 物件回應
throw new HttpException(
  { status: HttpStatus.FORBIDDEN, error: 'custom msg' },
  HttpStatus.FORBIDDEN,
  { cause: originalError }
);

// 內建例外帶 cause
throw new BadRequestException('Bad input', {
  cause: new Error('db error'),
  description: 'Failed validation',
});
```

## ExceptionFilter

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## @Catch 決定處理的例外類型

```typescript
@Catch(HttpException)              // 單一
@Catch(HttpException, TypeError)   // 多種
@Catch()                            // 所有
```

## 綁定

```typescript
@UseFilters(HttpExceptionFilter)   // Method / Controller
app.useGlobalFilters(new HttpExceptionFilter()); // Global
// Global with DI
{ provide: APP_FILTER, useClass: HttpExceptionFilter }
```

## AllExceptionsFilter（繼承 BaseExceptionFilter）

```typescript
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);  // fallback 至 Nest 預設處理
  }
}

// main.ts 使用
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
```
