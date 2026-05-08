---
name: tanstack-query
description: >
  TanStack Query (React Query) 完整 API 參考。**版本路由先**：開工前 Read package.json
  判斷 @tanstack/react-query pin 的 major 版本——pin ^4.x 載入 references/v4/SKILL.md；
  pin ^5.x 載入 references/v5/SKILL.md。
  ⚠️ 共用 hook 名稱（useQuery / useMutation 等）v4/v5 都有但 API 與預設值不同，
  不可單憑 hook 名觸發，必須先確認版本。
  v4 與 v5 重大差異：cacheTime → gcTime、callbacks (onSuccess/onError) 從 useQuery
  移除、keepPreviousData → placeholderData。
---

# TanStack Query (React Query)

> **本 skill 是版本無關的入口**。從 package.json 判斷專案使用的 TanStack Query 主版本，再載入對應 reference。

---

## 版本路由（必讀）

1. **Read package.json**（cwd 最近的優先；monorepo 多 package.json 時，先試 cwd 最近的，再試 git root）。
2. 比對 `dependencies` / `devDependencies` 中 `@tanstack/react-query` pin 的 major 版本：
   - **`^4.x`**（或 `~4.x` / `4.x.x`）→ Read `references/v4/SKILL.md`
   - **`^5.x`**（或 `~5.x` / `5.x.x`）→ Read `references/v5/SKILL.md`
3. **輔助訊號**（pin 不明時參考）：
   - import 路徑為 `react-query`（無 `@tanstack/` 前綴）→ 屬 v3，不在本 skill 範圍，請另尋資源或升版到 v4。
   - 程式碼出現 `cacheTime` / `keepPreviousData: true` / `useQuery` 上有 `onSuccess` callback → v4
   - 程式碼出現 `gcTime` / `useSuspenseQuery` / `HydrationBoundary` / `placeholderData: keepPreviousData` / `initialPageParam` → v5
   - `status: "loading"` → v4；`status: "pending"` 或 `isPending` → v5
4. **找不到 / 同時存在兩版本** → 詢問用戶，不要猜。

---

## 共用設計理念（version-agnostic）

以下概念跨 v4 / v5 共用，不依賴特定版本：

- **Server-state vs client-state**：TanStack Query 管的是「來自遠端、非同步、會 stale」的伺服器狀態，不是表單 / UI 等本地狀態。
- **Query Key 是快取主鍵**：必須是陣列（`['todos']`、`['todo', id]`）。物件 key 順序不影響 hash；但陣列順序敏感。
- **staleTime vs cacheTime/gcTime**：`staleTime` 控制何時重新抓取（fresh 期間不打 API）；`cacheTime`(v4) / `gcTime`(v5) 控制無觀察者時保留多久才 GC。
- **Query Status × Fetch Status**：Status 描述資料狀態（loading/pending、success、error）；fetchStatus 描述網路狀態（fetching、paused、idle）。兩者正交。
- **Mutation 不入 cache**：`useMutation` 結果只暫存於 mutation observer；要更新快取必須在 `onSuccess` 用 `queryClient.invalidateQueries` 或 `setQueryData`。
- **Query Key 前綴匹配**：invalidate `['todos']` 會連帶失效 `['todos', 1]`、`['todos', { status: 'done' }]`。
- **Optimistic Update 三步曲**：`onMutate` 拍快照並寫入暫態 → `onError` 還原 → `onSettled` 強制 invalidate 校正。

---

## 重大版本差異（觸發路由的關鍵 anchor）

| 維度 | v4 | v5 |
|---|---|---|
| GC 設定名 | `cacheTime` | `gcTime` |
| 載入狀態 | `isLoading`（無 cached data 時） | `isPending`（更精確，等同 `status === 'pending'`）；`isLoading` 改為 `isPending && isFetching` |
| 「保留前一頁資料」 | `keepPreviousData: true` | `placeholderData: keepPreviousData`（identity function） |
| useQuery callbacks | `onSuccess` / `onError` / `onSettled` 仍可用（但已 deprecated） | 完全移除；副作用改寫到 `useMutation` 或全域 `QueryCache({ onError })` |
| status 值 | `'loading'` / `'success'` / `'error'` | `'pending'` / `'success'` / `'error'` |
| useInfiniteQuery | `pageParam` 預設 undefined | `initialPageParam` **必填** |
| Hydration component | `<Hydrate>` | `<HydrationBoundary>` |
| Suspense API | `suspense: true` 選項（experimental） | `useSuspenseQuery` 專屬 hook（穩定） |
| Error throw | `useErrorBoundary` | `throwOnError` |
| 函式型 queryKey | 支援 | 已移除，必須靜態陣列 |
| `notifyOnChangeProps: 'tracked'` | 仍可指定 | 預設行為，選項已移除 |
| 共用 query options | 手動定義 | `queryOptions()` helper（型別連動） |
| 條件查詢 | `enabled: false` | 同；另推 `skipToken` 解型別問題 |
| Node baseline | 14+ | 18+；React 18+；TS 4.7+ |

詳細 API 與 v4 ↔ v5 完整對照：見 `references/v4/SKILL.md` 與 `references/v5/SKILL.md`，及各自子目錄的 `api-reference.md` / `examples.md` / `best-practices.md` / `migration-*.md`。

---

## Hand-off / Next Agent

- 本 skill 為 **Phase 2 第 3 對 hub 合併交付物**之一，路徑 `skills/tanstack-query/`。
- 同步交付：`references/v4/SKILL.md` + `{api-reference,best-practices,examples,migration-notes}.md`、`references/v5/SKILL.md` + `{api-reference,best-practices,examples,migration-v4-to-v5}.md`。
- 本階段**未修改**任何下游引用（README.md、`react-master.agent.md`、`react-reviewer.agent.md`、其他 agent / skill 對 `tanstack-query-v4` / `tanstack-query-v5` 的引用）。
- 舊 `skills/tanstack-query-v4/` 與 `skills/tanstack-query-v5/` 已 stub 化（`deprecated: true`），原 `references/` 目錄保留原樣供舊引用回退。
- **交還 orchestrator**：等所有 5 對 hub 合併完成後一起進 Stage C（下游引用切換 `tanstack-query-v4|v5` → `tanstack-query`）。
