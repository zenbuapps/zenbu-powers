# TypeORM v0.3 — Find Options

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「FindManyOptions、FindOptionsWhere、Like/In/Between/Raw 操作符」時載入。

## FindManyOptions

```typescript
interface FindManyOptions<T> {
  select?: FindOptionsSelect<T>;        // 欄位選擇
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];  // 陣列 = OR
  relations?: FindOptionsRelations<T>;  // 關聯載入
  relationLoadStrategy?: 'join' | 'query';  // 預設 join
  loadEagerRelations?: boolean;         // 預設 true
  loadRelationIds?: boolean | { relations?: string[]; disableMixedMap?: boolean };
  order?: FindOptionsOrder<T>;
  skip?: number;                        // offset
  take?: number;                        // limit
  cache?: boolean | number | { id: any; milliseconds: number };
  lock?: { mode: 'optimistic'; version: number } | { mode: LockMode };
  withDeleted?: boolean;                // 包含 soft-deleted
  transaction?: boolean;
  comment?: string;
}

type LockMode = 'pessimistic_read' | 'pessimistic_write' | 'dirty_read'
  | 'pessimistic_partial_write' | 'pessimistic_write_or_fail' | 'for_no_key_update'
  | 'for_key_share';
```

## FindOptionsWhere 範例

```typescript
// 欄位比對
await repo.find({ where: { firstName: 'John', age: 30 } });

// 多條件 OR（陣列）
await repo.find({
  where: [{ firstName: 'John' }, { lastName: 'Doe' }],
});

// 關聯內條件
await repo.find({
  where: { profile: { gender: 'male' } },
  relations: { profile: true },
});

// 巢狀 relation
await repo.find({
  relations: { photos: { album: true } },
});
```

## 操作符

```typescript
import { Not, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual,
  Equal, Like, ILike, Between, In, Any, IsNull,
  ArrayContains, ArrayContainedBy, ArrayOverlap, Raw,
  And, Or } from 'typeorm';

await repo.find({ where: { age: Not(30) } });
await repo.find({ where: { age: LessThan(18) } });
await repo.find({ where: { age: MoreThanOrEqual(18) } });
await repo.find({ where: { firstName: Like('%john%') } });
await repo.find({ where: { firstName: ILike('%JOHN%') } });  // Postgres
await repo.find({ where: { age: Between(18, 60) } });
await repo.find({ where: { id: In([1, 2, 3]) } });
await repo.find({ where: { name: IsNull() } });

// Postgres 陣列
await repo.find({ where: { tags: ArrayContains(['a', 'b']) } });
await repo.find({ where: { tags: ArrayOverlap(['x']) } });

// Raw（參數化）
await repo.find({ where: { createdAt: Raw((alias) => `${alias} > NOW() - INTERVAL '1 day'`) } });
await repo.find({
  where: { createdAt: Raw((alias) => `${alias} > :date`, { date: '2025-01-01' }) },
});

// 組合
await repo.find({ where: { age: And(MoreThan(18), LessThan(60)) } });
await repo.find({ where: { status: Or(Equal('a'), Equal('b')) } });
```
