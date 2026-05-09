# TypeORM v0.3 — DataSource 與設定

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「建立 DataSource、連線設定、PG-specific options、生命週期」時載入。

## DataSource 建立

```typescript
import { DataSource } from 'typeorm';
import { User } from './entity/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'secret',
  database: 'mydb',
  schema: 'public',
  synchronize: false,              // 正式環境必須 false，使用 migration
  logging: ['error', 'warn'],      // 或 true / false / 'all'
  logger: 'advanced-console',      // 'simple-console' | 'file' | 'debug'
  entities: [User],                // 或 ['src/entity/*.ts']
  migrations: ['src/migration/*.ts'],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
  maxQueryExecutionTime: 1000,     // 慢查詢門檻 ms
  extra: {                         // 傳給 underlying driver (pg)
    max: 20,                       // pool max
    connectionTimeoutMillis: 3000,
  },
  ssl: { rejectUnauthorized: false },
  cache: { duration: 30000 },      // 全域 query cache
});

await AppDataSource.initialize();
```

## 常用 DataSource 選項

| 選項 | 說明 |
|------|------|
| `type` | `'postgres' \| 'mysql' \| 'mariadb' \| 'sqlite' \| 'mssql' \| 'oracle' \| 'mongodb' \| 'cockroachdb'` |
| `entities` | Entity 陣列或 glob 模式 |
| `migrations` | Migration 陣列或 glob 模式 |
| `migrationsRun` | 啟動時自動執行 migration |
| `migrationsTableName` | 預設 `typeorm_migrations` |
| `migrationsTransactionMode` | `'all'（預設）`、`'each'`、`'none'` |
| `synchronize` | 自動建表（**正式環境禁用**） |
| `dropSchema` | 啟動時清空 schema |
| `logging` | `boolean \| 'all' \| LoggerOptions[]`，例：`['query', 'error', 'warn', 'info', 'migration']` |
| `maxQueryExecutionTime` | 超過時間的查詢會被 log |
| `entityPrefix` | 所有表加前綴 |
| `cache` | `boolean \| { type, duration, options }`，支援 redis/ioredis |
| `extra` | 傳給 driver 的額外選項 |

## PostgreSQL-specific

```typescript
{
  type: 'postgres',
  schema: 'public',
  ssl: true | { rejectUnauthorized, ca, cert, key },
  applicationName: 'my-app',
  connectTimeoutMS: 10000,
  replication: {
    master: { host, port, username, password, database },
    slaves: [{ host, port, username, password, database }],
  },
  installExtensions: true,       // 自動 CREATE EXTENSION
  logNotifications: true,
  poolErrorHandler: (err) => {},
}
```

## 生命週期

```typescript
const ds = new DataSource({ /* ... */ });
await ds.initialize();       // 建立連線池
ds.isInitialized;            // true
await ds.destroy();          // 關閉所有連線

const repo = ds.getRepository(User);
const treeRepo = ds.getTreeRepository(Category);
const manager = ds.manager;
const qb = ds.createQueryBuilder();

await ds.transaction(async (manager) => { /* ... */ });
await ds.query('SELECT NOW()');
await ds.synchronize();       // 危險，僅開發
await ds.dropDatabase();      // 危險
```
