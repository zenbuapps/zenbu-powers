---
name: wordpress-standards
description: >
  WordPress Plugin/Theme 規範與審查 checklist 統一參考——涵蓋 coding standards
  （PHP/WP 編碼規範）、review checklist（PR 程式碼審查視角）、security checklist
  （OWASP + WP 特有漏洞，攻擊者視角）三大維度。
  依角色載入對應 reference：
    - wordpress-master / 開發場景 → references/coding-standards.md（含 hooks / WC / REST API / 進階）
    - wordpress-reviewer → references/review-checklist.md + review-output-template.md
    - security-reviewer → references/security-checklist.md
  ⚠️ **不要全載**——依角色僅 Read 對應檔案。
---

# WordPress Standards 統一參考

> **本 skill 為三視角統一入口**：開發者規範、PR 審查 checklist、資安審查 checklist。三者共用同一套底層 WordPress / PHP 規則但**檢查角度不同**——請依角色僅載入對應 reference，避免一次全載。

---

## 角色 → reference 對照表

| 角色 / 場景 | 必載 reference | 選載 reference |
|---|---|---|
| **wordpress-master** / 開發 / 寫 plugin theme | `references/coding-standards.md` | `coding-hooks.md`、`coding-woocommerce.md`、`coding-rest-api.md`、`coding-advanced.md`（依需求） |
| **wordpress-reviewer** / PR 程式碼審查 | `references/review-checklist.md`、`references/review-output-template.md` | `coding-standards.md`（規範對照） |
| **security-reviewer** / 攻擊者視角資安審查 | `references/security-checklist.md`、`references/review-output-template.md`（看 security 視角章節） | — |

> ⚠️ **關鍵紀律**：本 SKILL.md 主檔僅做路由；**不要把所有 reference 都 Read 進來**。依角色只載入該欄列出的檔案即可。

---

## References 索引

### 開發規範（coding-*）

- `references/coding-standards.md` — 主規範：strict_types、命名規範、PHPDoc、DTO、enum、安全性（SQL/XSS/CSRF/能力/sanitize）、快速審查對照表
- `references/coding-hooks.md` — Hook 系統：擴展點、命名慣例
- `references/coding-woocommerce.md` — HPOS 相容、區塊結帳、訂單操作
- `references/coding-rest-api.md` — 路由註冊、回應格式
- `references/coding-advanced.md` — 繼承類、多語系、Log 記錄

### 審查 checklist（review-*）

- `references/review-checklist.md` — PR 審查視角的完整 checklist（嚴重性等級、強制執行測試、安全性、Hook、效能、HPOS、PHP 8.1+ 最佳實踐、特殊情境對照表）
- `references/review-output-template.md` — 審查報告輸出模板（**含 wordpress-reviewer / security-reviewer 兩種視角章節**）

### 資安 checklist（security-*）

- `references/security-checklist.md` — 攻擊者視角完整資安審查（OWASP Top 10、WordPress 特有漏洞、依賴套件、敏感資訊、競爭條件、LLM 信任邊界）

---

## Hand-off / Next Agent

- 本 skill 為 **Phase 3 群組 A 交付物**，路徑 `skills/wordpress-standards/`。
- 同步交付：8 份 references（coding-standards / coding-hooks / coding-woocommerce / coding-rest-api / coding-advanced / review-checklist / review-output-template / security-checklist）。
- 本階段**未修改**任何下游引用：`agents/wordpress-master.md`、`agents/wordpress-reviewer.md`、`agents/security-reviewer.md`、README、其他引用 `/wordpress-coding-standards`、`/wordpress-review-criteria`、`/security-review-criteria` 的位置一律保留原樣。
- 已 stub 化 3 個舊 SKILL.md（`wordpress-coding-standards` / `wordpress-review-criteria` / `security-review-criteria`），含 `deprecated: true` frontmatter，舊 references/ 目錄保留原內容供過渡期參考。
- **交還 orchestrator**：請於最後集中 phase 將下游引用切換到 `zenbu-powers:wordpress-standards`（依角色帶上對應 reference 路徑）。
