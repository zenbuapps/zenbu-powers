# TypeORM v0.3 — Migrations

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「migration:create/generate/run、MigrationInterface、QueryRunner schema 操作」時載入。

## 建立 Migration

```bash
# 空白
npx typeorm migration:create src/migration/CreateUsersTable

# 基於 entity diff 自動生成
npx typeorm migration:generate -d src/data-source.ts src/migration/Init

# 執行
npx typeorm migration:run -d src/data-source.ts

# 回滾一步
npx typeorm migration:revert -d src/data-source.ts

# 顯示已執行狀態
npx typeorm migration:show -d src/data-source.ts
```

## MigrationInterface

```typescript
import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUsers1700000000000 implements MigrationInterface {
  public async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'email', type: 'varchar', length: '255', isUnique: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }));

    await qr.createIndex('users', new TableIndex({
      name: 'IDX_users_email',
      columnNames: ['email'],
    }));

    await qr.createForeignKey('photos', new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('users');
  }
}
```

## QueryRunner 常用方法

```typescript
// 表
qr.createTable(table, ifNotExist?)
qr.dropTable(tableOrName, ifExist?, dropForeignKeys?, dropIndices?)
qr.renameTable(oldName, newName)

// 欄位
qr.addColumn(table, column)
qr.dropColumn(table, columnName)
qr.renameColumn(table, oldName, newName)
qr.changeColumn(table, oldColumn, newColumn)

// Index / Unique / Check
qr.createIndex(table, index)
qr.dropIndex(table, name)
qr.createUniqueConstraint(table, constraint)
qr.createCheckConstraint(table, constraint)

// FK
qr.createForeignKey(table, fk)
qr.dropForeignKey(table, fk)

// Schema
qr.createSchema(schema, ifNotExist?)
qr.dropSchema(schemaPath, ifExist?, cascade?)

// Enum
qr.createEnum(table, column, values)

// 原生
qr.query(sql, params?)

// 交易
qr.startTransaction(level?)
qr.commitTransaction()
qr.rollbackTransaction()
```
