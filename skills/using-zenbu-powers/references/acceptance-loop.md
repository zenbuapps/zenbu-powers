---
name: acceptance-loop
description: Acceptance evaluation 完整規格——evaluator 為 opt-in。本 reference 描述 opt-in dispatch 規格、Reviewer ↔ Master 修復迴圈、驗收責任邊界、evaluator 判定條件、與 reviewer agents 的職責邊界。
---

# Acceptance Evaluation 完整規格

驗收為 **opt-in 一次性驗收** 模式：用戶在完成一輪完整開發後顯式喚醒 `@zenbu-powers:acceptance-evaluator`，或 orchestrator 在窄門例外條件下主動派一次。

## Dispatch 規格（顯式喚醒時必傳）

派 `@zenbu-powers:acceptance-evaluator` 時，prompt 必須含：

1. 用戶原始任務需求摘要（避免 evaluator 失焦）
2. 可驗收的具體標準（testable criteria）—— 從用戶任務萃取；未提供時 evaluator 會自行推導並標明來源
3. 待評估的 agent 產出與產物路徑
4. 上游 sub-agent 的回報摘要（如有）

**缺任一項時，重新組織 prompt 後再 dispatch，不要傳空值。**

## Dispatch 觸發條件

- **用戶顯式喚醒**（主要路徑）：用戶在完整一輪開發後輸入 `@zenbu-powers:acceptance-evaluator 驗收本輪交付`
- **窄門例外**（orchestrator 可主動派）：
  1. 用戶 prompt 含「驗收 / 評估 / final check / 跑驗收」等明確關鍵詞
  2. 多 agent 整合 conflict 想做 sanity check
  3. 任務跨多個 sub-agent + 高風險 / 不可逆領域（auth / payment / external-api / 資料遷移）

## Reviewer ↔ Master 修復迴圈（仍適用）

若用戶顯式喚醒 `*-reviewer` 並要求進入「reviewer ↔ master」修復迴圈，主窗口扛中繼：

reviewer FAIL → 主窗口讀報告 → 依不達標項目重派 `*-master`（傳遞 reviewer 的具體缺陷清單）→ 修正後再 spawn reviewer 複審。

**最多 3 輪。** 第 3 輪仍 FAIL 時主動升級用戶，格式：

> 已迭代 3 輪未達標。問題：[TOP 缺陷]。建議方向：A. {方案}、B. {方案}、C. {方案}，請使用者裁決。

## 驗收責任邊界（Who Verifies What）

驗收觸發為 opt-in，責任分工：

- **預設流程**：orchestrator 完成 sub-agent dispatch + 整合後做**輕量自評**（覆蓋度、邏輯正確、邊界完整、明顯 off-topic），自評過後交付用戶
- **正式驗收**：用戶決定何時喚醒 `@zenbu-powers:acceptance-evaluator`；evaluator 跑零假設驗收前置鐵律（反向訊號掃描、覆蓋度、邊界完整性、off-topic 偵測）後回報 PASS / FAIL + 缺陷清單
- **FAIL 處理**：用戶決定是否要 orchestrator 派 master 修；若進入修復迴圈，最多 3 輪

**禁止行為**（即使 evaluator 未跑，orchestrator 仍不可以把品質把關責任丟給用戶）：

- ❌ 「成果交給你，麻煩看一下對不對」
- ❌ 「你幫我驗證一下這樣有沒有符合需求」
- ❌ 「不確定有沒有 cover 完整，你檢查看看」
- ❌ 「方案 A/B/C 你想用哪個」（除屬「用戶獨有資訊」窄門外）

orchestrator 在「交付給用戶」時應該清楚陳述「已做的範圍 / 已驗證的點 / 剩餘風險」，而不是要用戶代為驗收。

## Evaluator 判定條件（被喚醒時）

`@zenbu-powers:acceptance-evaluator` 在意圖對齊評估時，**以下情況一律判 FAIL**：

- Sub-agent 報告中將技術選擇丟給用戶（「方案 A/B/C 請選」）→ 任務未完成
- Sub-agent 未做出明確決策、未說明 trade-off → 自主決策授權違反
- Orchestrator 在 evaluator dispatch 之前已將選擇題轉發給用戶 → 流程違反

evaluator 偵測到此類情況時，FAIL 報告中標明「**自主決策違反**」。用戶可決定是否要 orchestrator 重派 agent 並在 prompt 中強制要求自選一個方案。

## 與 reviewer 的職責邊界

`@zenbu-powers:acceptance-evaluator` 與 `*-reviewer` agents **正交不重疊**：

- **acceptance-evaluator** 審：用戶意圖對齊、需求覆蓋度、邊界完整性、off-topic 偵測、基本可用門檻
- **`*-reviewer`** 審：code 品質、最佳實踐、安全、效能

evaluator 在意圖對齊評估中若發現 reviewer 該抓但漏掉的品質問題，會在「Out-of-Scope 觀察」標示，用戶可酌情補派 reviewer 二審該局部，不影響本輪 PASS / FAIL 判定。

WEB / 桌面 / CLI / 純文件等不同專案類型的驗收手法分流，由 evaluator 依 `zenbu-powers:acceptance-evaluation` skill 自動處理。
