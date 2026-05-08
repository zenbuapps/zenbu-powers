# TypeORM v0.3 — 關聯（Relations）

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「@OneToOne / @ManyToOne / @OneToMany / @ManyToMany、@JoinColumn、@JoinTable、@RelationId」時載入。

## @OneToOne

```typescript
// 擁有端（有 FK）
@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;

  @OneToOne(() => Profile, (p) => p.user, { cascade: true, eager: true })
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'id' })
  profile: Profile;
}

// 反向端
@Entity()
export class Profile {
  @PrimaryGeneratedColumn() id: number;

  @OneToOne(() => User, (u) => u.profile)
  user: User;
}
```

## @ManyToOne / @OneToMany（一對多）

FK 一律在 many 端：

```typescript
@Entity()
export class Photo {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => User, (u) => u.photos, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
    nullable: false,
  })
  user: User;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;

  @OneToMany(() => Photo, (p) => p.user, { cascade: ['insert'] })
  photos: Photo[];
}
```

## @ManyToMany + @JoinTable

```typescript
@Entity()
export class Question {
  @PrimaryGeneratedColumn() id: number;

  @ManyToMany(() => Category, (c) => c.questions, { cascade: true })
  @JoinTable({
    name: 'question_categories',
    joinColumn: { name: 'question_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn() id: number;

  @ManyToMany(() => Question, (q) => q.categories)
  questions: Question[];
}
```

## Relation Options

```typescript
{
  cascade: true | ['insert', 'update', 'remove', 'soft-remove', 'recover'],
  eager: false,                  // find 時自動 join
  lazy: false,                   // 用 Promise 包，存取時才載入
  nullable: true,
  onDelete: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'DEFAULT',
  onUpdate: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'DEFAULT',
  orphanedRowAction: 'nullify' | 'delete' | 'soft-delete' | 'disable',
  deferrable: 'INITIALLY DEFERRED' | 'INITIALLY IMMEDIATE',   // Postgres
  createForeignKeyConstraints: true,
  persistence: true,             // false 可讓該關聯在 save 時被忽略
  primary: false,
  foreignKeyConstraintName: 'FK_xxx',
}
```

## @JoinColumn 進階

```typescript
// 自訂 FK 欄名
@ManyToOne(() => Category)
@JoinColumn({ name: 'cat_id' })
category: Category;

// 複合 FK
@ManyToOne(() => Category)
@JoinColumn([
  { name: 'category_id', referencedColumnName: 'id' },
  { name: 'locale_id', referencedColumnName: 'locale_id' },
])
category: Category;
```

## @RelationId（只取 FK 不 join）

```typescript
@Entity()
export class Post {
  @ManyToOne(() => Author)
  author: Author;

  @RelationId((post: Post) => post.author)
  authorId: number;
}
```
