# Cross-Domain Reusable Design Patterns

Common architectural patterns that recur across WordPress / React / Node domains, plus the questions to ask when each pattern is on the table.

This file is loaded **after** the orchestrator has narrowed to a recommended direction and is composing the design document — use it as a checklist of patterns to consider explicitly naming in the design.

---

## 1. Extension Point vs Closed Implementation

**問題**：這個功能未來是否會被第三方／其他模組擴充？

| 選擇 | 適用 | WP 對應 | React 對應 | Node 對應 |
|---|---|---|---|---|
| Closed | 純內部行為、不公開 | private function | private hook | unexported function |
| Extension Point | 預期被擴充 | `apply_filters` / `do_action` | render prop / Slot 元件 | event emitter / strategy interface |

**設計時要點名**：
- 提供哪些 hook / slot / interface？
- 文件化參數契約（型別 + 不變條件）
- 版本相容承諾（破壞性變更怎麼處理）

---

## 2. Synchronous vs Asynchronous Processing

**問題**：使用者點下按鈕後，能等多久？

| 條件 | 模式 | 實作 |
|---|---|---|
| < 200ms | Synchronous | 直接 return |
| 200ms – 3s | Synchronous + 顯示 loading | 同上 + UI feedback |
| 3s – 30s | Async with progress polling | WP cron / BullMQ + polling endpoint |
| > 30s 或 不可預期 | Background job + notification | BullMQ + email / webhook / Action Scheduler |

**設計時要點名**：
- timeout 策略（哪一層 timeout？）
- 失敗後的 retry 策略（次數、backoff）
- 結果如何回到 user（polling / push notification / email）
- idempotency 設計（重試不會造成副作用）

---

## 3. Configuration Storage Hierarchy

**問題**：這份設定要被誰讀、被誰改？

| 設定類型 | 推薦儲存 | 例 |
|---|---|---|
| 全站不變 | constant in `wp-config.php` / env var | API endpoint URL |
| 管理員可改、低頻 | Options API / `.env` | 寄信寄件人 |
| 管理員可改、高頻讀取 | Options + object cache / Redis | feature flags |
| 內容相關 | Post meta / Term meta | per-product 設定 |
| 大量結構化資料 | CPT / 自訂表 / DB table | log entries |

**設計時要點名**：
- 設定 UI 在哪（Settings API / Refine 表單 / 環境變數）
- 預設值策略（hardcode vs migration script）
- 設定變更觸發什麼（cache flush / hook fire）

---

## 4. Validation Layers

**問題**：同一份資料會經過幾道驗證？驗證失敗怎麼回？

典型 3 層：

```
[ Client UI 驗證 ]   ← 快速回饋，不可信
        ↓
[ API / Controller 驗證 ]   ← 可信邊界，必驗
        ↓
[ Domain / Service 驗證 ]   ← 業務不變條件
        ↓
[ DB constraints ]   ← 最後防線
```

**設計時要點名**：
- 哪一層用什麼工具（Zod / WP `sanitize_*` / `wp_kses` / class-validator）
- 錯誤訊息回到哪一層（i18n？欄位級 vs 表單級？）
- WP 特有：sanitize 與 escape 分清楚——sanitize 在輸入端、escape 在輸出端

---

## 5. State Boundary

**問題**：哪些狀態必須伺服器持有？哪些可以放 client？

| 狀態類型 | 位置 |
|---|---|
| 認證身份 | server session / signed JWT |
| 表單草稿 | client (localStorage) until submit |
| UI 偏好（dark mode、欄位排序） | client (localStorage / cookie) |
| 業務資料 | server, fetch via TanStack Query |
| 實時協作 | server canonical + client optimistic |

**設計時要點名**：
- 樂觀更新（optimistic update）需不需要？rollback 策略？
- 跨 tab 同步要不要？（BroadcastChannel / WebSocket）
- 重整頁面後狀態還在嗎？

---

## 6. Authorization Topology

**問題**：「誰可以做什麼」這個決定在哪裡作？

| 層級 | 機制 | 適用 |
|---|---|---|
| 路由層 | Middleware / `@UseGuards` | 整條路由限制 |
| Controller | capability check 第一行 | API endpoint 層 |
| Service / Domain | policy object | 跨多 controller 的業務規則 |
| 資料列 | row-level scope (e.g. `author = current_user`) | 多租戶 |

**WP 特有**：
- `current_user_can( $cap, $object_id )`，object_id 不能省（meta cap）
- `nonce` 是 CSRF 防護，**不是**授權檢查——兩者都要
- REST endpoint 必須有 `permission_callback`

**設計時要點名**：
- 用哪些 capability（含自訂 cap 是否需要 `add_cap` migration）
- 多站台 / multisite 是否影響授權判定

---

## 7. Migration / Backward Compatibility

**問題**：升級時，舊資料怎麼處理？

| 場景 | 策略 |
|---|---|
| 新增欄位 | 預設值 + lazy migrate on read |
| 欄位重命名 | dual-write / dual-read 過渡期 |
| 結構大幅變動 | versioned migration script + flag |
| 移除功能 | deprecation notice 1–2 個版本後再移除 |

**設計時要點名**：
- DB schema 變更需要 migration 嗎？回滾策略？
- 既有 hook / API 有沒有 deprecation 計畫？
- 設定值格式變更——舊格式怎麼讀？

---

## 8. Observability Hooks

**問題**：壞掉時怎麼知道？

最低限度：

- 錯誤 log（含 context：user id、request id、time）
- 關鍵業務事件（成功與失敗都記）
- 效能指標（slow query、N+1、外部 API timeout）

**設計時要點名**：
- log 寫到哪（`error_log` / Stackdriver / Sentry）
- 哪些事件要 alert（rate-limited，避免噪音）
- 開發環境是否有 query log（`SAVEQUERIES`、Drizzle log、Prisma log）

---

## 9. Failure Mode Inventory

不要等實作才想——設計階段就列出：

| 失敗類型 | 例子 | 回應 |
|---|---|---|
| 網路斷線 | 外部 API timeout | retry / fallback / 顯示 stale |
| 權限不足 | user 沒有 cap | 4xx + 友善訊息 |
| 資料不存在 | 404 | 區分「不存在」與「無權看到」 |
| 重複提交 | double-click | idempotency key |
| 競爭條件 | 兩個 admin 同時改 | optimistic locking / last-write-wins 明示 |
| 不合法狀態 | 跳過 step 2 直接 step 3 | state machine 強制 |

每一條都該有設計層的回應，不能留給實作即興發揮。

---

## 10. Test Seam

**問題**：這個設計有沒有讓「測試」這件事變難？

設計時自問：
- 有沒有 hard-coded 時間 / 隨機數 / 外部呼叫？→ 抽介面
- 有沒有 global state？→ 至少能在測試 setup/teardown 重置
- 業務邏輯混在 framework code 裡？→ 把純邏輯抽到 service / domain
- WP 特有：用 `WP_UnitTestCase` 的 factory 還是 mock global？選擇要明示

**好的設計交付給測試階段時應該已經回答**：
- 哪些東西要 mock，哪些用真實依賴
- E2E 涵蓋哪些 happy path
- IT 涵蓋哪些 invariant
- UT 涵蓋哪些純函式

---

## How to use this file

寫 `design.md` 的時候，逐條過：

1. 這個 pattern 在我這份設計裡**是否相關**？
2. 如果相關，**我選哪一邊**？理由？
3. 如果不相關，**明示「N/A」**，避免之後被質疑「沒考慮到」。

把這 10 條當作 design doc 的隱形檢查清單，不一定每條都寫進文件，但**每條都要在腦中跑過**。
