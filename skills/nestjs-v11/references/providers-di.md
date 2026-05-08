# NestJS v11 — Providers 與 Dependency Injection

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「定義 Service、注入相依、選擇性依賴」時載入。

## @Injectable

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];
  findAll(): Cat[] { return this.cats; }
}
```

## Constructor Injection（預設）

```typescript
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}
}
```

## Property Injection（透過 @Inject）

```typescript
@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS') private readonly httpClient: T;
}
```

## @Optional 與可選依賴

```typescript
@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient?: T) {}
}
```
