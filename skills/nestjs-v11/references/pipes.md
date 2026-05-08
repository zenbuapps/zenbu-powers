# NestJS v11 — Pipes（驗證/轉換）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「驗證 DTO、ValidationPipe、自訂 Pipe」時載入。

## 內建 Pipes

所有從 `@nestjs/common` 匯出：

| Pipe | 用途 |
|------|------|
| `ValidationPipe` | 驗證 DTO（搭配 class-validator） |
| `ParseIntPipe` | string → number，失敗 400 |
| `ParseFloatPipe` | string → float |
| `ParseBoolPipe` | string → boolean |
| `ParseArrayPipe` | string → array |
| `ParseUUIDPipe` | 驗證 UUID 格式 |
| `ParseEnumPipe` | 驗證 enum 值 |
| `ParseDatePipe` | 驗證 date 格式 |
| `ParseFilePipe` | 驗證上傳檔案 |
| `DefaultValuePipe(value)` | 提供預設值 |

## 綁定範例

```typescript
// Parameter-scope
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}

// 帶選項的 parameter-scope
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number
) {}

// Multiple pipes
@Get()
findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) active: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {}

// UUID
@Get(':uuid')
findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {}

// Method-scope
@Post()
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(@Body() dto: CreateCatDto) {}

// Global（main.ts）
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

// Global（Module，可注入依賴）
@Module({
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule {}
```

## ValidationPipe 選項

```typescript
new ValidationPipe({
  whitelist: true,              // 移除未在 DTO 聲明的屬性
  forbidNonWhitelisted: true,   // 若有非白名單屬性則拋錯
  transform: true,              // 轉型 plain object → DTO class
  disableErrorMessages: false,  // 正式環境可關閉
  exceptionFactory: (errors) => new BadRequestException(errors),
  validationError: { target: false, value: false },
});
```

需配合 `class-validator` 與 `class-transformer`：

```typescript
import { IsString, IsInt, MinLength } from 'class-validator';

export class CreateCatDto {
  @IsString() @MinLength(2)
  name: string;

  @IsInt()
  age: number;
}
```

## PipeTransform 介面

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) throw new BadRequestException('Validation failed');
    return val;
  }
}

// ArgumentMetadata 定義：
interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```
