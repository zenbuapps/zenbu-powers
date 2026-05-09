# TypeORM v0.3 — Transactions

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「ds.transaction、QueryRunner、isolation level」時載入。

## DataSource.transaction（推薦）

```typescript
await ds.transaction(async (manager) => {
  await manager.save(user);
  await manager.save(photo);
});

// 指定 isolation level
await ds.transaction('SERIALIZABLE', async (manager) => { /* ... */ });
// 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE'
```

**關鍵**：transaction 內的 DB 操作**必須**使用 callback 提供的 `manager`，不可用外層的 `ds.manager` 或其他 repository，否則不會在同一交易內。

## 從 manager

```typescript
await ds.manager.transaction(async (txManager) => {
  await txManager.save(user);
});
```

## QueryRunner（手動控制）

```typescript
const qr = ds.createQueryRunner();
await qr.connect();
await qr.startTransaction();
try {
  await qr.manager.save(user);
  await qr.commitTransaction();
} catch (err) {
  await qr.rollbackTransaction();
  throw err;
} finally {
  await qr.release();
}
```

## DataSource 全域 isolation level

```typescript
new DataSource({ type: 'postgres', isolationLevel: 'SERIALIZABLE' });
```
