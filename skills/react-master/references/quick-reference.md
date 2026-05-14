# 場景速查與處置策略

## 常見場景速查

| 場景            | 推薦方案                                      |
| --------------- | --------------------------------------------- |
| 表格 CRUD       | Refine.dev `useTable` + Ant Design `Table`    |
| 表單 CRUD       | Refine.dev `useForm` + Ant Design `Form`      |
| 自訂 API 查詢   | Refine.dev `useCustom` 或 `useCustomMutation` |
| 批次刪除        | Refine.dev `useDeleteMany` + 確認對話框       |
| 全域狀態        | Jotai atom                                    |
| 元件樹狀態      | React Context                                 |
| 路由（WP 外掛） | react-router-dom + `HashRouter`               |
| 樣式            | Tailwind CSS 優先，Ant Design 組件搭配        |
| 效能優化        | `memo` + `useCallback` + `useMemo`            |
| 大量資料搜尋    | `useTransition` + `useDeferredValue`          |

---

## 遇到違背原則的專案時的處置

### 步驟 1：評估當前任務性質

判斷當前的任務/Issue 是否屬於 **[優化]**、**[重構]**、**[改良]** 類型。

### 步驟 2A：是 [優化] / [重構] / [改良] 任務

- 檢查元件樹依賴關係，確認影響範圍
- 使用 IDE 的重新命名功能安全重構
- 逐步遷移：先建立新元件/Hook，再替換舊引用，最後移除舊代碼
- 確保重構後所有引用都正確更新

### 步驟 2B：不是 [優化] / [重構] / [改良] 任務

- 維持**最小變更原則**
- 只做當前任務所需的修改
- 避免大規模重構導致更多問題
- 在 PR 中標註發現的技術債，建議後續 Issue 處理

---

## 交付流程

### 完成後的動作：交付給主窗口

Quality Gate（`tsc --noEmit` + `eslint` + `prettier --check` + 測試）全部通過後，回報主窗口，附變更摘要與測試結果。

**驗收（opt-in，v3.15.0 起）**：Stop hook 已退場——agent 不自動派 evaluator 或 reviewer。用戶完成一輪後可顯式喚醒 `@zenbu-powers:acceptance-evaluator` 做對齊驗收。

**Opt-in 深度審查**：若用戶要求進一步 code review，再由用戶顯式喚醒：

```
@zenbu-powers:react-reviewer   ← React 程式品質深度審查（opt-in）
```

### 用戶顯式發起 review-fix 迴圈時的處理流程

僅當用戶顯式喚醒 `@zenbu-powers:react-reviewer` 並要求進入「reviewer ↔ master」修復迴圈時：

1. **逐一檢視**：仔細閱讀 reviewer 列出的所有嚴重問題和重要問題
2. **逐一修復**：按照 reviewer 的建議修改代碼，不可忽略任何阻擋合併的問題
3. **補充測試**：若 reviewer 指出缺少測試覆蓋的場景，補寫對應測試
4. **重新執行測試**：修改完成後，重新執行所有測試確認通過
5. **再次提交審查**：測試通過後，由用戶決定是否再次喚醒 reviewer

> 此 opt-in 迴圈最多進行 **3 輪**，若超過 3 輪仍未通過，應停止並請求人類介入。
