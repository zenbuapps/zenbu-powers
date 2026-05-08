# NestJS v11 — Configuration（@nestjs/config）

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「ConfigModule、ConfigService、registerAs、validation」時載入。

## 安裝

```bash
npm i @nestjs/config
```

## 基本使用

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,                    // 全域使用
      envFilePath: ['.env.local', '.env'], // 多檔案（第一個優先）
      ignoreEnvFile: false,              // 只用環境變數時設 true
      cache: true,                       // 快取 env
      expandVariables: true,             // 支援 ${VAR} 展開
      load: [configuration],             // 自訂設定檔
      validate: validateFn,              // 自訂驗證
      validationSchema: Joi.object({/**/}), // Joi 驗證
    }),
  ],
})
export class AppModule {}
```

## 自訂設定檔

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
  },
});
```

## 使用 ConfigService

```typescript
@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  method() {
    this.config.get<string>('DATABASE_USER');
    this.config.get<string>('database.host');                 // 點記法
    this.config.get<string>('database.host', 'localhost');    // 預設值
    this.config.get<DatabaseConfig>('database');              // 結構化
  }
}
```

## 類型推導

```typescript
interface EnvVars {
  PORT: number;
  TIMEOUT: string;
}

// 第二個泛型 `true` 保證 get 不會返回 undefined
constructor(private config: ConfigService<EnvVars, true>) {
  const port = this.config.get('PORT', { infer: true });  // type: number
}
```

## registerAs（namespaced config）

```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT ?? 5432),
}));

// 載入
ConfigModule.forRoot({ load: [databaseConfig] });

// 注入具名設定
import { ConfigType } from '@nestjs/config';

constructor(
  @Inject(databaseConfig.KEY) private dbConfig: ConfigType<typeof databaseConfig>,
) {}
```

## 作為 Provider 給其他 Module

```typescript
TypeOrmModule.forRootAsync(databaseConfig.asProvider());
```

## 自訂 class-validator 驗證

```typescript
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, validateSync } from 'class-validator';

class EnvVars {
  @IsEnum(['development', 'production', 'test']) NODE_ENV: string;
  @IsNumber() PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) throw new Error(errors.toString());
  return validated;
}

ConfigModule.forRoot({ validate });
```
