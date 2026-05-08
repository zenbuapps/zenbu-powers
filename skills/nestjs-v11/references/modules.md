# NestJS v11 — Modules（模組系統）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「設計模組架構、Global Module、循環依賴」時載入。

## @Module 裝飾器

```typescript
@Module({
  imports:     [],  // 要匯入的其他 Module
  controllers: [],  // 本模組內的 Controllers
  providers:   [],  // 本模組內的 Providers
  exports:     [],  // 匯出給其他 Module 使用的 Provider 子集
})
export class CatsModule {}
```

## 基本 Feature Module

```typescript
// cats/cats.module.ts
@Module({
  controllers: [CatsController],
  providers:   [CatsService],
  exports:     [CatsService],
})
export class CatsModule {}

// app.module.ts
@Module({ imports: [CatsModule] })
export class AppModule {}
```

## Global Module

```typescript
import { Global, Module } from '@nestjs/common';

@Global()
@Module({ providers: [CatsService], exports: [CatsService] })
export class CatsModule {}
```

**注意**：`@Global()` 僅應在 root/core module 使用一次；過度使用降低可讀性。

## 模組重匯出

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],  // 透過本模組取得 CommonModule
})
export class CoreModule {}
```

## 循環依賴（forwardRef）

```typescript
@Module({ imports: [forwardRef(() => CatsModule)] })
export class CommonModule {}

@Injectable()
export class CatsService {
  constructor(@Inject(forwardRef(() => CommonService)) private s: CommonService) {}
}
```
