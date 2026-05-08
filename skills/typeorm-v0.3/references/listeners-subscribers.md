# TypeORM v0.3 — Listeners & Subscribers

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「@BeforeInsert / @AfterUpdate、EntitySubscriberInterface、query/transaction hooks」時載入。

## Entity Listener

```typescript
@Entity()
export class Post {
  @BeforeInsert() setCreatedAt() { this.createdAt = new Date(); }
  @AfterInsert() logInsert() { console.log('Inserted', this.id); }
  @BeforeUpdate() setUpdatedAt() { this.updatedAt = new Date(); }
  @AfterUpdate() logUpdate() {}
  @BeforeRemove() beforeRemove() {}
  @AfterRemove() afterRemove() {}
  @BeforeSoftRemove() beforeSoft() {}
  @AfterSoftRemove() afterSoft() {}
  @BeforeRecover() beforeRecover() {}
  @AfterRecover() afterRecover() {}
  @AfterLoad() afterLoad() {}
}
```

**限制**：Listener **不可做資料庫操作**，只能改自身資料。要做 DB 操作請用 Subscriber。

## Entity Subscriber

```typescript
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() { return Post; }  // 省略則監聽所有 entity

  beforeInsert(event: InsertEvent<Post>) {
    event.entity.slug = slugify(event.entity.title);
  }
  afterInsert(event: InsertEvent<Post>) {}
  beforeUpdate(event: UpdateEvent<Post>) {
    // 可存取 event.manager / event.queryRunner / event.connection
  }
  afterUpdate(event: UpdateEvent<Post>) {}
  beforeRemove(event: RemoveEvent<Post>) {}
  afterRemove(event: RemoveEvent<Post>) {}
  beforeSoftRemove(event: SoftRemoveEvent<Post>) {}
  afterSoftRemove(event: SoftRemoveEvent<Post>) {}
  beforeRecover(event: RecoverEvent<Post>) {}
  afterRecover(event: RecoverEvent<Post>) {}

  // Query hooks
  beforeQuery(event: QueryEvent) {}
  afterQuery(event: QueryEvent) {}

  // Transaction hooks
  beforeTransactionStart(event) {}
  afterTransactionStart(event) {}
  beforeTransactionCommit(event) {}
  afterTransactionCommit(event) {}
  beforeTransactionRollback(event) {}
  afterTransactionRollback(event) {}
}
```

註冊：`DataSource.subscribers = [PostSubscriber]`。
