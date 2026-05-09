# TypeORM v0.3 — Entity / Column / Primary / Generated / Dates

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「定義 Entity、@Column、PrimaryColumn、CreateDateColumn」時載入。

## Entity 定義

### 基本 Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isActive: boolean;
}
```

### @Entity 選項

```typescript
@Entity({
  name: 'users',              // 自訂表名（預設小駝峰 class 名）
  schema: 'public',           // schema
  synchronize: true,          // 是否讓這個 entity 參與 synchronize
  orderBy: { id: 'ASC' },     // 預設排序
  database: 'otherdb',        // 使用其他 DB
  engine: 'MyISAM',           // MySQL-only
  withoutRowid: false,        // SQLite-only
})
```

## @Column 選項總表

```typescript
@Column({
  type: 'varchar',            // ColumnType（見下表）
  name: 'user_name',          // 自訂欄位名
  length: 150,                // VARCHAR length
  nullable: false,            // 預設 false
  default: 'anonymous',       // DEFAULT 值
  unique: false,              // UNIQUE 約束
  primary: false,             // 是否為 primary
  select: true,               // 查詢時是否預設包含（密碼欄可設 false）
  update: true,               // save 時會更新
  insert: true,               // insert 時會寫入
  onUpdate: 'CURRENT_TIMESTAMP', // MySQL ON UPDATE
  comment: 'User display name',
  precision: 10,              // 數字精度
  scale: 2,                   // 小數位數
  unsigned: false,            // MySQL
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  enum: UserRole,             // enum
  enumName: 'user_role_enum', // Postgres 的 enum 型別名
  array: false,               // Postgres/CockroachDB 陣列
  transformer: {
    to: (value) => JSON.stringify(value),
    from: (value) => JSON.parse(value),
  },
  asExpression: 'age + 1',    // Generated column
  generatedType: 'VIRTUAL',   // 'VIRTUAL' | 'STORED'
  hstoreType: 'object',       // 'object' | 'string'
  utc: false,                 // 日期以 UTC 存
  primaryKeyConstraintName: 'PK_users_id',
  foreignKeyConstraintName: 'FK_users_role_id',
})
```

### 常用 Column Types

**共通**：`int`、`bigint`、`smallint`、`decimal`、`numeric`、`float`、`double`、`real`、
`boolean`、`varchar`、`char`、`text`、`date`、`time`、`datetime`、`timestamp`、
`json`、`jsonb`、`uuid`、`enum`、`blob`、`bytea`

**Postgres 特有**：`tsvector`、`tstzrange`、`daterange`、`cidr`、`inet`、`macaddr`、
`money`、`interval`、`hstore`、`point`、`polygon`、`line`、`geometry`、`geography`、
陣列型別（例：`int[]` 用 `{ type: 'int', array: true }`）

**Vector（pgvector）**：

```typescript
@Column('vector', { length: 1536 })
embedding: number[] | Buffer;

@Column('halfvec', { length: 4 })
halfvec_embedding: number[] | Buffer;
```

### Enum Column

```typescript
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  GHOST = 'ghost',
}

@Column({ type: 'enum', enum: UserRole, default: UserRole.GHOST })
role: UserRole;

// 或用字串陣列
@Column({ type: 'enum', enum: ['admin', 'editor', 'ghost'], default: 'ghost' })
role: string;
```

### Simple Array / Simple JSON（跨 DB 用）

```typescript
@Column('simple-array')
tags: string[];     // 存成 'tag1,tag2,tag3'（值內不可有逗號）

@Column('simple-json')
profile: { name: string };  // JSON.stringify / JSON.parse

@Column('simple-enum', { enum: UserRole })
role: UserRole;     // SQLite 上用 text 模擬 enum
```

## Primary Columns 與 Generated

```typescript
// 手動主鍵
@PrimaryColumn()
id: string;

// 組合主鍵
@PrimaryColumn()
firstName: string;
@PrimaryColumn()
lastName: string;

// 自動遞增
@PrimaryGeneratedColumn()
id: number;

// UUID
@PrimaryGeneratedColumn('uuid')
id: string;

// Postgres 10+ IDENTITY 欄
@PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
id: number;

// CockroachDB rowid
@PrimaryGeneratedColumn('rowid')
id: string;

// MongoDB 專用
@ObjectIdColumn()
id: ObjectId;
```

### @Generated 用於非 PK

```typescript
@Column()
@Generated('uuid')
uuid: string;

@Column()
@Generated('increment')
num: number;

// 計算欄
@Column({ type: 'int', asExpression: 'price * quantity', generatedType: 'STORED' })
total: number;
```

## 特殊日期 Column

```typescript
@CreateDateColumn()
createdAt: Date;        // 自動於 insert 填入

@UpdateDateColumn()
updatedAt: Date;        // 自動於 save / upsert 更新

@DeleteDateColumn()
deletedAt: Date | null; // softDelete 時填入，預設查詢排除此行

@VersionColumn()
version: number;        // 每次 save 自動 +1，用於 optimistic lock
```
