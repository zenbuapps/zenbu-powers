# NestJS v11 — Guards（授權）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「實作授權、Role-based access、Auth Guard」時載入。

## 基本範例

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = ctx.switchToHttp().getRequest();
    return validateRequest(request);  // true=放行, false=403
  }
}
```

## 綁定

```typescript
// Method / Controller-scope
@UseGuards(AuthGuard)
@Controller('cats')
export class CatsController {}

// Global
app.useGlobalGuards(new AuthGuard());

// Global with DI（Module）
@Module({ providers: [{ provide: APP_GUARD, useClass: AuthGuard }] })
export class AppModule {}
```

## Metadata 驅動的 Role Guard

```typescript
// roles.decorator.ts
import { Reflector } from '@nestjs/core';
export const Roles = Reflector.createDecorator<string[]>();

// 使用
@Post()
@Roles(['admin'])
async create(@Body() dto: CreateCatDto) {}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, ctx.getHandler());
    if (!roles) return true;
    const request = ctx.switchToHttp().getRequest();
    return matchRoles(roles, request.user.roles);
  }
}
```

## 拒絕時的例外

Guard 回傳 `false` 時預設丟 `ForbiddenException`。可在 Guard 內自行丟 `UnauthorizedException` 等。
