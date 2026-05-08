# NestJS v11 — Interceptors（攔截器）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「實作 logging、回應轉換、快取、逾時」時載入。

## NestInterceptor 介面

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`${Date.now() - now}ms`))
    );
  }
}
```

## 常用 RxJS Operator 模式

```typescript
// 回應轉換
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T }> {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map(data => ({ data })));
  }
}

// 錯誤轉換
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError(err => throwError(() => new BadGatewayException()))
    );
  }
}

// 快取覆寫
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    if (isCached) return of(cachedData);
    return next.handle();
  }
}

// 逾時
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => err instanceof TimeoutError
        ? throwError(() => new RequestTimeoutException())
        : throwError(() => err))
    );
  }
}
```

## 綁定

```typescript
@UseInterceptors(LoggingInterceptor) // Method / Controller
app.useGlobalInterceptors(new LoggingInterceptor()); // Global
// Global with DI
{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
```
