# Convention 對照表

## 共用參數（所有技術堆疊都包含）

| 參數 | 預設值 |
|------|--------|
| SPECS_ROOT_DIR | specs |
| CLARIFY_DIR | ${SPECS_ROOT_DIR}/clarify |
| MAX_QUESTIONS_PER_ROUND | 10 |
| ACTIVITIES_DIR | ${SPECS_ROOT_DIR}/activities |
| FEATURE_SPECS_DIR | ${SPECS_ROOT_DIR}/features |
| API_SPECS_DIR | ${SPECS_ROOT_DIR} |
| ENTITY_SPECS_DIR | ${SPECS_ROOT_DIR} |

## TypeScript E2E

| 參數 | 預設值 |
|------|--------|
| TS_APP_DIR | src |
| TS_ENTITIES_DIR | ${TS_APP_DIR}/entities |
| TS_MODULES_DIR | ${TS_APP_DIR}/modules |
| TS_MIGRATIONS_DIR | ${TS_APP_DIR}/migrations |
| TS_DATASOURCE_FILE | ${TS_APP_DIR}/data-source.ts |
| TS_TEST_FEATURES_DIR | features |
| TS_STEPS_DIR | ${TS_TEST_FEATURES_DIR}/steps |
| TS_SUPPORT_DIR | ${TS_TEST_FEATURES_DIR}/support |

## Node.js IT

| 參數 | 預設值 |
|------|--------|
| NODE_APP_DIR | src |
| NODE_MODELS_DIR | ${NODE_APP_DIR}/db |
| NODE_REPOSITORIES_DIR | ${NODE_APP_DIR}/repositories |
| NODE_SERVICES_DIR | ${NODE_APP_DIR}/services |
| NODE_ROUTES_DIR | ${NODE_APP_DIR}/routes |
| NODE_MIDDLEWARE_DIR | ${NODE_APP_DIR}/middleware |
| NODE_SCHEMAS_DIR | ${NODE_APP_DIR}/schemas |
| NODE_MAIN_FILE | ${NODE_APP_DIR}/app.ts |
| NODE_DB_SCHEMA | ${NODE_APP_DIR}/db/schema.ts |
| NODE_DRIZZLE_MIGRATIONS | ${NODE_APP_DIR}/db/migrations |
| NODE_ERRORS_FILE | ${NODE_APP_DIR}/errors.ts |
| NODE_TEST_FEATURES_DIR | features |
| NODE_STEPS_DIR | ${NODE_TEST_FEATURES_DIR}/steps |
| NODE_SUPPORT_DIR | ${NODE_TEST_FEATURES_DIR}/support |
| NODE_WORLD_FILE | ${NODE_SUPPORT_DIR}/world.ts |
| NODE_HOOKS_FILE | ${NODE_SUPPORT_DIR}/hooks.ts |

## Frontend Only

| 參數 | 預設值 |
|------|--------|
| SRC_DIR | src |
| API_SPEC_FILE | ${API_SPECS_DIR}/api.yml |
| ENTITY_SPEC_FILE | ${ENTITY_SPECS_DIR}/erm.dbml |
| TYPES_DIR | ${SRC_DIR}/lib/types |
| API_CLIENT_DIR | ${SRC_DIR}/lib/api |
| MSW_DIR | ${SRC_DIR}/mocks |
| HANDLERS_DIR | ${MSW_DIR}/handlers |
| FRONTEND_FEATURES_DIR | features |
| PAGE_OBJECTS_DIR | page-objects |
| STEPS_DIR | steps |

## arguments.yml 範例（Node.js IT）

```yaml
# ── 共用 ──────────────────────────────────────────────

# 所有規格產出物的根目錄
SPECS_ROOT_DIR: specs

# 澄清紀錄目錄（所有 prompt 共用，見 shared/clarify-loop.md）
CLARIFY_DIR: ${SPECS_ROOT_DIR}/clarify

# 每回合最多提問數（Sub-question 不計入）
MAX_QUESTIONS_PER_ROUND: 10

# ── discovery 用 ────────────────────────────────────

# Activity 檔案的存放目錄
ACTIVITIES_DIR: ${SPECS_ROOT_DIR}/activities

# Feature 檔案的存放目錄
FEATURE_SPECS_DIR: ${SPECS_ROOT_DIR}/features

# api.yml 的存放目錄
API_SPECS_DIR: ${SPECS_ROOT_DIR}

# erm.dbml 的存放目錄
ENTITY_SPECS_DIR: ${SPECS_ROOT_DIR}

# ── Node.js automation ─────────────────────────────

# Node.js 應用程式根目錄
NODE_APP_DIR: src

# Drizzle ORM Schema（DB Models）
NODE_MODELS_DIR: ${NODE_APP_DIR}/db

# Repository 層
NODE_REPOSITORIES_DIR: ${NODE_APP_DIR}/repositories

# Service 層
NODE_SERVICES_DIR: ${NODE_APP_DIR}/services

# Express Routes
NODE_ROUTES_DIR: ${NODE_APP_DIR}/routes

# Middleware
NODE_MIDDLEWARE_DIR: ${NODE_APP_DIR}/middleware

# Zod Schemas
NODE_SCHEMAS_DIR: ${NODE_APP_DIR}/schemas

# Express 主程式
NODE_MAIN_FILE: ${NODE_APP_DIR}/app.ts

# Drizzle DB Schema 定義
NODE_DB_SCHEMA: ${NODE_APP_DIR}/db/schema.ts

# Drizzle 遷移目錄
NODE_DRIZZLE_MIGRATIONS: ${NODE_APP_DIR}/db/migrations

# 共用錯誤定義
NODE_ERRORS_FILE: ${NODE_APP_DIR}/errors.ts

# Cucumber.js 測試 Feature 檔案目錄
NODE_TEST_FEATURES_DIR: features

# Step Definitions 目錄
NODE_STEPS_DIR: ${NODE_TEST_FEATURES_DIR}/steps

# Cucumber.js Support 目錄
NODE_SUPPORT_DIR: ${NODE_TEST_FEATURES_DIR}/support

# Custom World 定義
NODE_WORLD_FILE: ${NODE_SUPPORT_DIR}/world.ts

# Hooks（Before/After）
NODE_HOOKS_FILE: ${NODE_SUPPORT_DIR}/hooks.ts
```

## Starter Skill 對照表

### 後端 Starter

| 技術堆疊 + 測試策略 | Starter Skill |
|---------------------|---------------|
| TypeScript + E2E Test | （尚未建立） |
| Node.js + Integration Test | `/zenbu-powers:aibdd-auto-tdd（stage=starter, variant=nodejs-it）` |

### 前端 Starter

| Starter Skill |
|---------------|
| `/zenbu-powers:aibdd-auto-frontend-apifirst-msw-starter` |

前端 starter 永遠顯示，不受 Q1 技術堆疊選擇影響。
specformula Phase 03（Frontend Engineering）需要前端骨架已就位。
