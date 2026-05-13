# Docker — CMD vs ENTRYPOINT

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「CMD/ENTRYPOINT 三種形式、組合行為、shell vs exec form、tini」時載入。

## 三種形式

```dockerfile
# 1. ENTRYPOINT exec form + CMD default args（最推薦）
ENTRYPOINT ["node"]
CMD ["dist/main.js"]
# docker run my-image --inspect     → node --inspect dist/main.js
# docker run my-image script.js     → node script.js

# 2. 只有 CMD
CMD ["node", "dist/main.js"]
# docker run my-image               → node dist/main.js
# docker run my-image bash           → bash（完全覆蓋）

# 3. 只有 ENTRYPOINT
ENTRYPOINT ["node", "dist/main.js"]
# CLI 參數都被 append
```

## 組合行為表

| 情境 | 無 ENTRYPOINT | `ENTRYPOINT exec_e p1` (shell) | `ENTRYPOINT ["exec_e", "p1"]` (exec) |
|------|---------------|-------------------------------|------------------------------------|
| 無 CMD | error | `/bin/sh -c exec_e p1` | `exec_e p1` |
| `CMD ["exec_c", "p1_c"]` | `exec_c p1_c` | `/bin/sh -c exec_e p1` | `exec_e p1 exec_c p1_c` |
| `CMD exec_c p1_c` (shell) | `/bin/sh -c exec_c p1_c` | `/bin/sh -c exec_e p1` | `exec_e p1 /bin/sh -c exec_c p1_c` |

**Exec form 優勢**：
- 無 shell fork，signal 直接傳給進程（重要！）
- 無 shell 字串展開（可預期）
- **Shell form 會把你的進程變成 `/bin/sh -c` 的子進程，收不到 SIGTERM**

**要用 signal-safe 的 `tini`**：`docker run --init` 或 Dockerfile 裡 `ENTRYPOINT ["/tini", "--", ...]`。
