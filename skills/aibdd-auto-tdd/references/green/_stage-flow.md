# green — Stage Flow（語言無關核心）

> 本檔抽出 green stage 的**語言無關核心流程**。語言特化內容（測試命令、框架 API、檔案結構、實作目標）見 `csharp.md` / `php.md` / `typescript.md`。
>
> **載入時機**：上游觸發 stage=green 後，先讀本檔建立循環骨架，再讀對應 lang 的 reference 取得語言參數。

---

## 觸發辨識

下列訊號之一出現即啟用 green stage：

| 訊號類型 | 範例 |
|---|---|
| 用戶 prompt | 「綠燈」「green」「跑通測試」「讓測試過」「make tests pass」 |
| 上游 stage | `aibdd-auto-tdd（stage=control-flow）` 的 Green phase |
| 主 SKILL 觸發 | 用戶說「實作後端」「實作前端」並上文已有失敗測試 |

---

## 核心定義

> **Green = 以最小增量讓既有失敗測試通過**。
> 前置條件：Red 階段已產出**正常失敗**的測試（環境正常、Value Difference）。
> 不過度設計、不預期未來需求、不順便重構（重構是下一階段的事）。

---

## 核心循環

```
while 測試未全部通過:
    1. 執行測試（命令見 lang reference）→ 讀取第一個失敗
    2. 分析失敗原因（HTTP code / assertion / element-not-found / waitFor timeout）
    3. 寫最小增量程式碼修復該失敗
    4. 重新執行測試
    5. 若新失敗出現 → 回到 2
    6. 若全部通過 → 結束
```

---

## 失敗模式對照表（跨語言共用骨架）

| 失敗類別 | 共通訊號 | 修復方向 |
|---|---|---|
| 端點不存在 | HTTP 404 / route not found | 建立 Controller/Route + 註冊路由 |
| 內部錯誤 | HTTP 500 / unhandled exception | 檢查 Service/Repository 實作 |
| 驗證失敗 | HTTP 400 / validation error | 補齊 Schema/DTO 驗證 |
| 未授權 | HTTP 401 / unauthorized | 補齊 Auth middleware/guard |
| Assertion 不符 | expected X but got Y | 修正 Service/View 邏輯 |
| 元素找不到（前端） | Unable to find element | 加入對應 JSX 元素 |
| 文字不符（前端） | toHaveTextContent 不符 | 修正 data binding |
| API 未觸發（前端） | waitFor timeout / requestRef null | 補事件 handler + API call |
| Mock 未匹配（前端） | MSW unhandled request | 修正 API client URL 或 MSW pattern |

> 語言特化的更細表格見 `{lang}.md`。

---

## 最小增量原則（R 規則）

> **R = Right Size**：每次只修剛好足以讓「**當前正在處理的失敗**」變綠的最少程式碼。

具體紀律：

1. **每次只修一個失敗。** 看到第一個失敗就停止讀後續訊息，先修這一個。
2. **不預先實作**其他測試還沒要求的功能（即使「順便」很方便）。
3. **不做順便的重構**。重構是 Refactor 階段的事。
4. **如果發現要動的程式碼遠超測試範圍**，停下來檢查 Red 是否合格（測試是否真的指向你修的位置）。

### 反例 vs 正例

```
反例（過度實作）：
  測試要求：能更新進度
  實作：更新進度 + 通知 + 歷史紀錄 + 成就系統 + 分享功能 ❌

正例（剛好夠）：
  測試要求：能更新進度
  實作：能更新進度 ✓
```

---

## Docker 環境檢查（IT only，UT 可略）

整合測試（與真實 DB / 容器互動）執行前確認：

```bash
docker ps     # 確認 Docker Desktop 在運行
docker info   # 確認 Docker Daemon 正常響應
```

| 錯誤訊息 | 原因 | 解法 |
|---|---|---|
| `Could not find a working container runtime strategy` | Docker Desktop 未啟動 | 啟動 Docker Desktop |
| `Error response from daemon: pull access denied` | 無法下載 image | 檢查網路連線；手動 `docker pull` |
| `ECONNREFUSED 127.0.0.1:5432` | Testcontainers 初始化失敗 | 確認 Docker Desktop 已啟動，重新執行 |

> 純前端 Vitest + jsdom 不需 Docker（見 `typescript.md` 前端段落）。

---

## 迭代策略

### 開發循環（快速迭代）

```
1. 執行特定測試（單一 .feature / 單一 test file）
2. 看錯誤訊息 → 對照失敗模式表
3. 寫最少的程式碼修正這個錯誤
4. 再次執行特定測試
5. 還有錯誤？回到 2
6. 特定測試通過？進入完成驗證
```

### 完成驗證（回歸測試）

```
7. 執行所有已完成紅燈的測試（命令見 lang reference）
8. 全部通過？綠燈完成，hand-off Refactor
9. 有失敗？回到 2，修復破壞的測試
```

---

## 完成條件

- [ ] 測試命令全數通過（零失敗）
- [ ] 未引入任何測試未要求的功能
- [ ] 無框架層級警告（如 React 的 `act(...)` warning、MSW unhandled request）
- [ ] 型別檢查通過（命令見 lang reference）
- [ ] 沒有破壞既有功能（總回歸測試綠燈）

---

## 異常處理

| 異常情境 | 處置 |
|---|---|
| 修正一個失敗後，更多測試開始失敗 | 檢查是否實作影響到其他 feature；回退最近改動，採更小步 |
| 同一失敗訊息修了多次仍沒進展 | 暫停猜測，回去確認 Red 階段測試是否真的合格 |
| 失敗訊息指向「環境問題」（DB 連不上、找不到專案） | 不算合格綠燈循環，先修環境再回來 |
| 中文業務術語對應不確定 | 查 `aibdd-handlers/SKILL.md` §中文狀態對應表（CR2）；不要憑空猜 |
| 不確定該寫哪個 handler | 委派 `aibdd-handlers (handler=…, lang=…)`，不要在綠燈裡重抄 handler 程式碼（CR5） |

---

## Hand-off

- 綠燈完成 → 標 TodoWrite completed → 進入 Refactor stage（同 skill `references/refactor/{lang}.md`）。
- 上游若是 control-flow，回報 phase 完成；control-flow 自動推進下一個 pending。
