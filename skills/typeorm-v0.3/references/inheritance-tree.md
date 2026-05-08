# TypeORM v0.3 — Entity Inheritance / Tree / Embedded

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「Abstract 繼承、Single Table Inheritance、Tree Entity、Embedded」時載入。

## Abstract 繼承（共用欄位）

```typescript
export abstract class Content {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
}

@Entity()
export class Photo extends Content {
  @Column() size: string;
}

@Entity()
export class Post extends Content {
  @Column() viewCount: number;
}
```

## Single Table Inheritance

```typescript
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Content { @PrimaryGeneratedColumn() id: number; }

@ChildEntity()
export class Photo extends Content { @Column() size: string; }
```

## Tree Entities

```typescript
// Adjacency list（最簡單）
@Entity()
export class Category {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;

  @ManyToOne(() => Category, (c) => c.children)
  parent: Category;

  @OneToMany(() => Category, (c) => c.parent)
  children: Category[];
}

// Closure-table
@Entity()
@Tree('closure-table')
export class Category {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;

  @TreeChildren() children: Category[];
  @TreeParent() parent: Category;
  @TreeLevelColumn() level: number;
}

// Materialized-path / Nested-set 類似

// 使用
const treeRepo = ds.getTreeRepository(Category);
await treeRepo.findTrees();
await treeRepo.findDescendantsTree(cat);
await treeRepo.findAncestorsTree(cat);
await treeRepo.countDescendants(cat);
```

## Embedded Entity

```typescript
export class Name {
  @Column() first: string;
  @Column() last: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column(() => Name) name: Name;   // 產生 nameFirst、nameLast 欄位
}
```
