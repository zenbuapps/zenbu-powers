---
name: typeorm-v0-3
description: >
  TypeORM v0.3 技術參考，對應 typeorm ^0.3.x，需 TypeScript 4.5+、Node.js 16+，
  experimentalDecorators 與 emitDecoratorMetadata 開啟。預設對 PostgreSQL 但 API DB-agnostic。
  當 import from 'typeorm' 或 '@nestjs/typeorm' 時必須使用此 skill。代表性 trigger：
  new DataSource、createQueryBuilder、@Entity、@Column、@PrimaryGeneratedColumn、
  @CreateDateColumn/@UpdateDateColumn/@DeleteDateColumn、@OneToMany/@ManyToOne/@ManyToMany、
  @JoinColumn/@JoinTable、Repository、EntityManager、SelectQueryBuilder、FindOptionsWhere、
  FindManyOptions、Not/LessThan/MoreThan/Between/In/IsNull/Like/ILike/Raw、Brackets、
  MigrationInterface、TypeOrmModule.forRoot/forFeature、@InjectRepository、@InjectDataSource。
  v0.3 對 v0.2 重要 breaking changes：DataSource 取代 Connection、Repository 不再是抽象類、
  QueryBuilder 改用命名參數、FindOptions API 強型別化。涵蓋 Entity、Relations、Repository API、
  Find Options、QueryBuilder、Transactions、Migrations、Listeners/Subscribers、NestJS 整合。
---

# TypeORM v0.3

> **版本對應**：typeorm ^0.3.x（PostgreSQL + pg driver）
> **文件來源**：https://typeorm.io/docs
> **前提**：TypeScript 4.5+ / Node.js 16+ / experimentalDecorators 與 emitDecoratorMetadata 開啟

---

## References 索引（按需載入，**不要全載**）

依當前任務需要哪段，才 Read 對應 reference。每份檔案完整保留範例與選項表。

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| DataSource 與設定 | `references/datasource.md` | 建立 DataSource、PG 選項、replication、生命週期 |
| Entity / Column / Primary / Dates | `references/entity-columns.md` | @Entity、@Column 全選項、Enum、PrimaryGenerated、CreateDateColumn |
| Inheritance / Tree / Embedded | `references/inheritance-tree.md` | Abstract、Single Table、@Tree、Embedded entity |
| Relations | `references/relations.md` | @OneToOne、@ManyToOne、@OneToMany、@ManyToMany、@JoinColumn/Table、@RelationId |
| Repository API | `references/repository.md` | save/insert/update/upsert/delete、softDelete、count/sum、find* |
| Find Options | `references/find-options.md` | FindManyOptions、FindOptionsWhere、Not/Like/In/Between/Raw 操作符 |
| QueryBuilder | `references/querybuilder.md` | createQueryBuilder、JOIN、Brackets、子查詢、Locking、CTE |
| Transactions | `references/transactions.md` | ds.transaction、QueryRunner、isolation level |
| Migrations | `references/migrations.md` | migration:create/generate/run、MigrationInterface、QueryRunner schema 操作 |
| Listeners & Subscribers | `references/listeners-subscribers.md` | @BeforeInsert/AfterUpdate、EntitySubscriberInterface、query/transaction hooks |
| NestJS 整合 | `references/nestjs-integration.md` | TypeOrmModule.forRoot/forRootAsync/forFeature、@InjectRepository、custom repository |

---

## 核心觀念速查

| 角色 | API |
|------|-----|
| 連線管理 | `DataSource` (取代 v0.2 的 Connection) |
| 表抽象 | `@Entity()` 裝飾的 class |
| 操作介面 | `Repository<T>`、`EntityManager` |
| 查詢建構 | `createQueryBuilder()` (命名參數) |
| 結構變更 | `MigrationInterface` + `QueryRunner` |
| 事件勾子 | Entity Listener (`@BeforeInsert` 等) / `EventSubscriber` |

v0.3 對 v0.2 主要 breaking changes：
- **DataSource 取代 Connection**：`new DataSource(...)` + `await ds.initialize()`
- **Repository 不再是抽象類**：`extends Repository<T>` 自訂可注入
- **QueryBuilder 強制命名參數**：`:id` + `{ id }`，禁用位置參數
- **FindOptions 強型別化**：`FindOptionsWhere<T>`、`FindOptionsRelations<T>`
- **`getManager()` / `getRepository()` 全域函式移除**：改用 `ds.manager` / `ds.getRepository()`
- **`findOne` 返回 null**（非 undefined）

---

## 常見陷阱

1. **`synchronize: true` 不可上 production**：會自動改 schema，導致資料遺失。
2. **Entity constructor 必須可無參數呼叫**：ORM 用 `new Entity()` 建立實例後再填資料。
3. **保留字或底線欄名需在 @Column 顯式設定 name**。
4. **`save` vs `insert`**：save 會先試 find 再決定，帶 relations 處理；insert 純 insert，不觸發 listener/subscriber 中的 update 事件。
5. **transaction 必須用回 callback manager**：用外層 repo/manager 會跑在新連線上，破壞交易。
6. **Lazy relation 用 Promise 包**：`photos: Promise<Photo[]>`，必須 `await user.photos`。
7. **WHERE IN 陣列用 `:...`**：`:ids` 會被當成單一值，`:...ids` 才會展開。
8. **findOne 返回 null**（v0.3 以後），舊版會返回 undefined。
9. **Postgres enum 需用 migration 維護**：改動 enum 值要手動 `ALTER TYPE ... ADD VALUE`。
10. **v0.3 移除 `getManager()` / `getRepository()` 全域函式**：改用 `ds.manager` / `ds.getRepository()`。
