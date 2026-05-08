# Domain-Specific Starter Questions

Use these as first-question templates **after** project context exploration and project-type detection. The goal is to land the very first clarifying question on the highest-leverage axis for that domain — not a generic "tell me more about your idea".

Always ask **one question at a time** and prefer multiple-choice formulations when feasible.

---

## WordPress Plugin

**Primary axis — user persona / capability:**
- 「這個外掛主要服務哪種使用者角色？(administrator / shop_manager / subscriber / 自訂角色)」
- 「需要哪一張 capability check？(`manage_options` / `edit_products` / `edit_posts` / 自訂 cap)」

**Follow-up axes (one per turn):**
- 資料儲存：Options API / CPT + meta / 自訂資料表 / Transients
- Hook 策略：filter 介入既有流程 vs action 觸發新流程 vs 提供 public API
- 多站台：single site only / Multisite-aware / Network activated
- 解除安裝：activation hook 建表？deactivation 留資料？uninstall.php 清乾淨？

### Hook-based vs Class-based extension（trade-off 範例）

| 維度 | Hook-based (procedural) | Class-based (OO + container) |
|---|---|---|
| 學習曲線 | 低，符合 WP 社群慣例 | 高，需要理解 DI / namespace |
| 可測試性 | 中，需 mock global hooks | 高，可注入依賴 |
| 與其他 plugin 衝突風險 | 高（hook priority 競爭） | 低（封裝在自家 namespace） |
| 適用情境 | 單一功能擴充、< 500 LOC | 中大型 plugin、有多 entity |

---

## Gutenberg Block

**Primary axis — static vs dynamic:**
- 「這是靜態區塊 (儲存 HTML 在 post_content) 還是動態區塊 (render.php / render_callback)？或你還沒決定？」

判斷依據：

| 場景 | 建議 |
|---|---|
| 內容固定、不依賴外部資料 | static block |
| 依賴登入狀態、即時資料、產品庫存 | dynamic block |
| 需要 SEO 友善的 HTML 留在 DB | static block |
| 之後可能換版型、樣式 | dynamic block（避免 deprecation 地獄） |

**Follow-up axes:**
- `viewScript` vs `viewScriptModule`（前端互動需求）
- `supports` 開哪些（color / spacing / typography / align）
- 是否需要 InnerBlocks / template lock
- block pattern vs block variation vs 全新 block 註冊

---

## WooCommerce 擴充

**Primary axis — HPOS 相容性：**
- 「這個功能會碰到 Order data 嗎？如果會，需要 HPOS (High-Performance Order Storage) 相容嗎？」

如果碰 Order：

| 操作 | Legacy CPT 寫法 | HPOS 安全寫法 |
|---|---|---|
| 取得訂單 | `get_post($order_id)` | `wc_get_order($order_id)` |
| 查詢訂單 | `WP_Query` post_type=shop_order | `wc_get_orders([...])` |
| 訂單 meta | `get_post_meta($order_id, ...)` | `$order->get_meta(...)` / CRUD |

**Follow-up axes:**
- Product type：simple / variable / subscription / custom
- 結帳流程介入點：`woocommerce_checkout_process` / `woocommerce_order_status_changed` / blocks-based checkout 的 `StoreApi`
- 報表整合：是否註冊到 `WooCommerce > Analytics`

---

## React App (Refine / Ant Design Pro)

**Primary axis — 頁面型態 + 資料來源：**
- 「這個頁面是 CRUD 型還是自訂 dashboard？資料來源是 REST 還是 GraphQL？」

| 頁面型態 | 推薦組合 |
|---|---|
| 資源 CRUD | Refine `useTable` + `<EditButton>` / `<DeleteButton>` |
| 自訂 dashboard | TanStack Query + 自組 layout |
| 表單為主 | React Hook Form + Zod + Refine `useForm` |
| 大量資料瀏覽 | virtualized table + server-side pagination |

**Follow-up axes:**
- 狀態：local state / TanStack Query cache / Jotai atom / URL query string
- 路由：React Router v7 / Next.js App Router / Refine 內建 routing
- i18n：next-intl / i18next / 不需要

---

## Integration / E2E Testing

**Primary axis — 情境清單：**
- 「這個功能的 happy path 與 edge case 你心中有哪些？先列 3 個最重要的情境。」

引導使用者列出後，依下表分流：

| 情境特徵 | 測試類型 |
|---|---|
| 跨頁面、需要瀏覽器渲染 | Playwright E2E |
| 單一 plugin / API 行為驗證 | WP Integration Test (PHPUnit + WP_UnitTestCase) |
| 純函式 / Service 邏輯 | Unit Test |
| 業務規則驗證（Given/When/Then） | BDD Feature File（接 `/aibdd-discovery`） |

---

## Node.js Backend (NestJS / Express)

**Primary axis — 架構分層：**
- 「這個 service 是 stateless API、background worker，還是兩者都有？」

**Follow-up axes:**
- ORM：TypeORM / Drizzle / Prisma / 純 SQL
- 訊息佇列：BullMQ / 直接 cron / 外部 SQS
- 認證：Better Auth / Passport / 自管 JWT
- 部署：Cloudflare Workers / Pages / 傳統 Node server

---

## GraphQL / API 設計

**Primary axis — schema-first 還是 code-first：**
- 「這個 API 你想先設計 schema (`.graphql` / OpenAPI) 還是先寫 resolver / handler？」

**Follow-up axes:**
- 認證／授權層放哪：middleware / directive / resolver guard
- N+1：DataLoader / explicit join / Drizzle relations
- 錯誤格式：union types / errors as data / HTTP status only

---

## 跨領域共用提示

- 若 user 的描述橫跨 3+ 個獨立子系統（例：「做一個 WooCommerce plugin 含 booking、subscription、gift card、analytics」），**先做 scope assessment**，協助拆成 sub-projects，再對每個子專案各跑一次 brainstorming。
- 若 user 已有 `specs/` 目錄前例，先讀過再問——避免重複澄清已寫過的決策。
