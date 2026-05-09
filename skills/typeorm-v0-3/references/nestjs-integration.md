# TypeORM v0.3 — NestJS 整合（@nestjs/typeorm）

> 本檔屬 `skills/typeorm-v0.3/` 的子 reference，由主 SKILL.md 在「TypeOrmModule.forRoot/forRootAsync/forFeature、@InjectRepository、custom repository」時載入。

## 安裝

```bash
npm i @nestjs/typeorm typeorm pg
```

## 基本設定

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'secret',
      database: 'mydb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
```

## async 設定（結合 @nestjs/config）

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: +config.get('DB_PORT'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migration/*{.ts,.js}'],
    migrationsRun: true,
    synchronize: false,
  }),
});
```

## Feature Module（註冊 Repository）

```typescript
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectEntityManager() private manager: EntityManager,
    @InjectDataSource() private ds: DataSource,
  ) {}
}
```

## 自訂 Repository（v0.3 寫法）

v0.3 棄用 `@EntityRepository`，改用 `extends Repository<T>`：

```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(ds: DataSource) {
    super(User, ds.createEntityManager());
  }

  async findByEmail(email: string) {
    return this.findOneBy({ email });
  }
}

// 註冊
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
```

## 多個 DataSource

```typescript
TypeOrmModule.forRoot({ name: 'default', /* ... */ })
TypeOrmModule.forRoot({ name: 'secondary', /* ... */ })

TypeOrmModule.forFeature([User], 'secondary');

@InjectRepository(User, 'secondary') private repo: Repository<User>;
@InjectDataSource('secondary') private ds: DataSource;
```
