# NestJS v11 — Custom Decorators

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「createParamDecorator、applyDecorators、組合 decorator」時載入。

## createParamDecorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// 使用
@Get()
findOne(@User() user: UserEntity) {}
@Get()
findOne(@User('firstName') name: string) {}
```

## applyDecorators（組合多個 decorator）

```typescript
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

// 使用
@Auth('admin')
@Get('secure')
secure() {}
```

## 搭配 Pipe

```typescript
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {}
```

`validateCustomDecorators: true` 是讓 ValidationPipe 處理自訂 param decorator 的關鍵選項。
