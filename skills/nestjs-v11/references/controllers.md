# NestJS v11 — Controllers（路由）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「設計 HTTP 端點 / 路由 / 參數綁定 / 子網域」時載入。

## 基本範例

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string { return 'all cats'; }

  @Get(':id')
  findOne(@Param('id') id: string): string { return `cat #${id}`; }

  @Post()
  create(@Body() dto: CreateCatDto) { return dto; }
}
```

## HTTP 方法裝飾器

| 裝飾器 | 用途 |
|--------|------|
| `@Get(path?)` | GET |
| `@Post(path?)` | POST |
| `@Put(path?)` | PUT |
| `@Delete(path?)` | DELETE |
| `@Patch(path?)` | PATCH |
| `@Options(path?)` | OPTIONS |
| `@Head(path?)` | HEAD |
| `@All(path?)` | 匹配所有 HTTP 方法 |

`path` 支援：
- 靜態路徑：`'users'`
- 路徑參數：`':id'`、`'users/:id/posts/:postId'`
- 萬用：`'abcd/*splat'`（NestJS 11 起使用 splat 參數名）

## 參數裝飾器

| 裝飾器 | 等價於 | 範例 |
|--------|--------|------|
| `@Req()` | `req` | `findAll(@Req() req: Request)` |
| `@Res()` | `res` | `create(@Res() res: Response)` |
| `@Body(key?)` | `req.body[key]` | `create(@Body() dto: CreateDto)` |
| `@Query(key?)` | `req.query[key]` | `find(@Query('page') page: number)` |
| `@Param(key?)` | `req.params[key]` | `get(@Param('id') id: string)` |
| `@Headers(name?)` | `req.headers[name]` | `get(@Headers('x-token') t: string)` |
| `@Session()` | `req.session` | - |
| `@Ip()` | `req.ip` | - |
| `@HostParam(key?)` | 子網域參數 | - |
| `@UploadedFile(name?)` | 單檔上傳 | 需 Multer |
| `@UploadedFiles(name?)` | 多檔上傳 | 需 Multer |

## 回應控制

```typescript
@Post()
@HttpCode(204)                                  // 覆寫預設 status code
@Header('Cache-Control', 'no-store')            // 設定 response header
create() { return 'added'; }

@Get()
@Redirect('https://nestjs.com', 301)            // 永久轉址
redirect() {}

// 動態 redirect
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') v: string) {
  if (v === '5') return { url: 'https://docs.nestjs.com/v5/' };
}
```

## 子網域路由

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get() index() { return 'admin'; }
}

@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get() get(@HostParam('account') account: string) { return account; }
}
```

## Library-specific 回應（Express/Fastify）

```typescript
// 完全自己控制（Nest 不介入）
@Post()
create(@Res() res: Response) { res.status(201).json({}); }

// Passthrough 模式（Nest 仍處理 return value）
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(200);
  return [];
}
```

**注意**：`@Res()` 會停用 Nest 的標準回應機制，除非用 `passthrough: true`。

## Async / Observable 處理器

```typescript
@Get() async findAll(): Promise<any[]> { return []; }
@Get() findAll(): Observable<any[]> { return of([]); }
```
