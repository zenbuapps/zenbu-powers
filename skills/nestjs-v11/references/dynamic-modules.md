# NestJS v11 — Dynamic Modules

> 本檔屬 `skills/nestjs-v11/` 的子 reference，由主 SKILL.md 在「register/forRoot/forFeature、ConfigurableModuleBuilder、async 三種寫法」時載入。

## 方法命名慣例

| 方法 | 用途 |
|------|------|
| `register()` | 每次呼叫建立獨立設定 |
| `forRoot()` | 全域一次性設定 |
| `forFeature()` | 基於 forRoot 設定的功能擴充 |

各自有 async 版本：`registerAsync()`、`forRootAsync()`、`forFeatureAsync()`

## 基本 Dynamic Module

```typescript
@Module({})
export class ConfigModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        { provide: 'CONFIG_OPTIONS', useValue: options },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}

// 使用
@Module({
  imports: [ConfigModule.register({ folder: './config' })],
})
export class AppModule {}

@Injectable()
export class ConfigService {
  constructor(@Inject('CONFIG_OPTIONS') private options: Record<string, any>) {}
}
```

## ConfigurableModuleBuilder

```typescript
// config.module-definition.ts
import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>()
    .setClassMethodName('forRoot')      // 改名（預設是 register）
    .setFactoryMethodName('createConfigOptions') // 改 useClass 期望的方法
    .setExtras(
      { isGlobal: true },
      (definition, extras) => ({ ...definition, global: extras.isGlobal })
    )
    .build();

// config.module.ts
@Module({ providers: [ConfigService], exports: [ConfigService] })
export class ConfigModule extends ConfigurableModuleClass {}
```

## 三種 async 寫法

```typescript
// useFactory
ConfigModule.registerAsync({
  useFactory: () => ({ folder: './config' }),
  inject: [SomeDependency],
});

// useClass
ConfigModule.registerAsync({
  useClass: ConfigOptionsFactory,  // 需實作 create() 方法
});

// useExisting
ConfigModule.registerAsync({
  useExisting: ExistingConfigFactory,
});
```
