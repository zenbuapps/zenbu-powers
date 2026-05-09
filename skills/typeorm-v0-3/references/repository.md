# TypeORM v0.3 — Repository API

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「CRUD、save/insert/update、softDelete、count/sum/exists」時載入。

## 取得 Repository

```typescript
const repo = dataSource.getRepository(User);
const repo = manager.getRepository(User);
// NestJS
constructor(@InjectRepository(User) private repo: Repository<User>) {}
```

## CRUD

```typescript
// Create（非持久化）
const user = repo.create({ firstName: 'John', lastName: 'Doe' });

// Save（insert or update）
await repo.save(user);
await repo.save([user1, user2]);

// Insert（純 insert，不 load relations）
await repo.insert({ firstName: 'Jane' });

// Update
await repo.update(id, { firstName: 'Jane' });
await repo.update({ active: false }, { deleted: true });

// Upsert
await repo.upsert(
  [{ id: 1, name: 'a' }, { id: 2, name: 'b' }],
  ['id']  // conflict paths
);

// Delete
await repo.delete(id);
await repo.delete({ active: false });
await repo.remove(entity);    // 等同 delete 但走 entity flow（觸發 listener）

// Soft delete / restore
await repo.softDelete(id);
await repo.restore(id);
await repo.softRemove(entity);
await repo.recover(entity);

// Count / exists
await repo.count({ where: { active: true } });
await repo.countBy({ active: true });
await repo.exists({ where: { id: 1 } });
await repo.existsBy({ id: 1 });

// 聚合
await repo.sum('price', { active: true });
await repo.average('price', { active: true });
await repo.minimum('price', { active: true });
await repo.maximum('price', { active: true });

// 增減
await repo.increment({ id: 1 }, 'viewCount', 1);
await repo.decrement({ id: 1 }, 'stock', 5);
```

## Find

```typescript
await repo.find({ where: { active: true } });
await repo.findBy({ active: true });
await repo.findOne({ where: { id: 1 }, relations: { profile: true } });
await repo.findOneBy({ id: 1 });
await repo.findOneOrFail({ where: { id: 1 } });    // throw 找不到
await repo.findOneByOrFail({ id: 1 });
const [rows, count] = await repo.findAndCount({ where: {}, skip: 0, take: 10 });
await repo.findAndCountBy({ active: true });
```

## Preload / Merge

```typescript
// preload：找到則從 DB 載入合併，找不到回 undefined
const user = await repo.preload({ id: 1, firstName: 'Jane' });

// merge：把多個物件合併到同個 entity instance
repo.merge(user, update1, update2);
```

## 原生 SQL

```typescript
await repo.query('SELECT * FROM users WHERE id = $1', [1]);
```

## QueryBuilder

```typescript
repo.createQueryBuilder('u').where('u.active = :active', { active: true });
```
