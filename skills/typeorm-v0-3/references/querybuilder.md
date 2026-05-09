# TypeORM v0.3 — QueryBuilder

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「createQueryBuilder、JOIN、子查詢、Brackets、Locking、CTE」時載入。

## 建立

```typescript
const qb = repo.createQueryBuilder('u');
const qb = ds.createQueryBuilder().select('u').from(User, 'u');
const qb = ds.manager.createQueryBuilder(User, 'u');
```

## SELECT 與 JOIN

```typescript
qb.select('u')
  .addSelect('SUM(u.count)', 'total')
  .distinct(true)
  .distinctOn(['u.id'])                  // Postgres

  // JOIN + SELECT
  .leftJoinAndSelect('u.photos', 'p')
  .innerJoinAndSelect('u.profile', 'pr')
  .leftJoinAndSelect('u.photos', 'p', 'p.isRemoved = :removed', { removed: false })

  // JOIN 不 SELECT
  .leftJoin('u.photos', 'p')

  // JOIN + 映射為非關聯屬性
  .leftJoinAndMapOne('u.profilePhoto', 'u.photos', 'pp', 'pp.forProfile = TRUE')
  .leftJoinAndMapMany('u.comments', Comment, 'c', 'c.userId = u.id')

  // JOIN 非關聯 entity
  .leftJoinAndSelect(Photo, 'ph', 'ph.userId = u.id');
```

## WHERE / HAVING

```typescript
qb.where('u.age >= :min', { min: 18 })
  .andWhere('u.active = :active', { active: true })
  .orWhere('u.role = :role', { role: 'admin' });

// IN
qb.where('u.id IN (:...ids)', { ids: [1, 2, 3] });

// Brackets
import { Brackets, NotBrackets } from 'typeorm';
qb.where(new Brackets((b) => {
  b.where('u.first = :f', { f: 'a' }).orWhere('u.last = :l', { l: 'b' });
}));

// HAVING
qb.groupBy('u.id').having('COUNT(u.id) > :n', { n: 5 });
```

## ORDER / GROUP / LIMIT

```typescript
qb.orderBy('u.id', 'DESC')
  .addOrderBy('u.name', 'ASC')
  .orderBy({ 'u.name': 'ASC', 'u.id': 'DESC' })
  .groupBy('u.id').addGroupBy('u.name')
  .limit(10).offset(20)         // SQL 層的 LIMIT/OFFSET
  .take(10).skip(20);            // ORM 層（處理 join 的正確性，較推薦）
```

## 結果方法

```typescript
await qb.getOne();              // T | null
await qb.getOneOrFail();
await qb.getMany();             // T[]
await qb.getCount();
await qb.getManyAndCount();     // [T[], number]
await qb.getRawOne();
await qb.getRawMany();
await qb.getRawAndEntities();   // { entities, raw }
qb.stream();                    // Readable stream

qb.getSql();                    // SQL 字串
qb.getQuery();
qb.getQueryAndParameters();     // [sql, params]
qb.printSql();                  // console log
```

## INSERT / UPDATE / DELETE QueryBuilder

```typescript
await ds.createQueryBuilder()
  .insert().into(User).values([{ name: 'a' }, { name: 'b' }])
  .returning(['id']).execute();

await ds.createQueryBuilder()
  .update(User).set({ age: () => '"age" + 1' })
  .where('id = :id', { id: 1 }).execute();

await ds.createQueryBuilder()
  .delete().from(User).where('active = false').execute();

await ds.createQueryBuilder()
  .softDelete().from(User).where('id = :id', { id: 1 }).execute();

// Upsert
await ds.createQueryBuilder()
  .insert().into(User).values([{ id: 1, name: 'a' }])
  .orUpdate(['name'], ['id']).execute();
```

## 子查詢

```typescript
qb.where('post.title IN ' + qb.subQuery()
  .select('u.name').from(User, 'u').getQuery());

qb.where((q) => {
  const sub = q.subQuery().select('u.name').from(User, 'u').getQuery();
  return 'post.title IN ' + sub;
});

// FROM subquery
ds.createQueryBuilder()
  .select('res.name').from((sub) => sub.select('u.name').from(User, 'u'), 'res');
```

## Locking

```typescript
qb.setLock('pessimistic_read');
qb.setLock('pessimistic_write');
qb.setLock('optimistic', existingUser.version);    // 需 @VersionColumn
qb.setLock('pessimistic_write', undefined, ['post']);  // 指定表
qb.setOnLocked('nowait');
qb.setOnLocked('skip_locked');
```

## CTE（Postgres）

```typescript
qb.addCommonTableExpression(`SELECT id FROM posts WHERE published = true`, 'pub_posts')
  .select().from('pub_posts', 'pp');
```
