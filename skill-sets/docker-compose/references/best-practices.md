# Docker / Compose — 最佳實踐

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「Dockerfile / Compose 最佳實踐 checklist、production-ready 設定」時載入。

## Dockerfile

1. **用 `# syntax=docker/dockerfile:1`** 啟用 BuildKit 特性。
2. **Multi-stage 分離 build 與 runtime**；final stage 只要必要檔案。
3. **Layer 順序穩定先放，常變放後面**：`COPY package*.json`（穩定依賴）→ `RUN npm ci` → `COPY . .`。
4. **合併 `RUN` 並清快取**：
   ```dockerfile
   RUN apt-get update && apt-get install -y --no-install-recommends curl \
       && rm -rf /var/lib/apt/lists/*
   ```
5. **用 exec form** 確保 signal 傳遞。
6. **用非 root user**：`USER node`。
7. **`--mount=type=cache`** 加速 pkg manager。
8. **`.dockerignore`** 排除 `node_modules`、`.git`、`dist`。
9. **Pin base image tag**：`node:22.11-alpine3.20` 而非 `node:latest`；生產建議用 digest `@sha256:...`。
10. **寫 HEALTHCHECK**。
11. **用 `--init` 或 `tini`** 處理 zombie process + signal。
12. **不要放 secret 在 ENV/ARG**，用 `--secret`、`--mount=type=secret` 或 Compose `secrets`。

## Docker Compose

1. **別用 `version:`** —— Compose Spec 不需要。
2. **明確 `depends_on` + `condition: service_healthy`**，避免啟動競態。
3. **為每個服務寫 healthcheck**（包括 PG、Redis）：
   ```yaml
   healthcheck:
     test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
     interval: 5s
     timeout: 3s
     retries: 5
   ```
4. **Volumes 用 named volume** 比 bind mount 更穩定（除非開發期要 live reload）。
5. **把 dev / prod 分檔**：`compose.yaml`（共同）+ `compose.override.yaml`（dev，自動載入）+ `compose.prod.yaml`（`-f` 指定）。
6. **`profiles`** 管理選用服務（debug、seed、mail 等）。
7. **`env_file`** 分層：`.env.common` + `.env.${ENV}`。
8. **`restart: unless-stopped`** 對長期執行的 service。
9. **`stop_grace_period`** 給 app 時間 graceful shutdown。
10. **Compose Watch** 取代 `docker compose up --build` + nodemon 的複雜流程。

## 常見陷阱

| 症狀 | 原因 | 解法 |
|------|------|------|
| `SIGTERM` 沒作用，容器要 10 秒才停 | ENTRYPOINT shell form 吃掉 signal | 改 exec form 或用 `tini` / `--init` |
| `.env` 變數未載入 | 檔名或位置錯 | 必須在 compose 檔同目錄；或 `env_file` 指定 |
| build 卡在 `COPY . .` | `.dockerignore` 未排除 `node_modules` | 加入 `.dockerignore` |
| 多次 build 卻沒用快取 | `apt-get update` 與 install 分兩行 | 合併到同 `RUN` |
| ARG 在 FROM 之後無法使用 | ARG 作用域限 stage 內 | 在該 stage 內再宣告 `ARG` |
| Compose 裡 `command` 被 shell split | 用 string form | 改 exec（YAML list）form |
| Network 無法互通 | services 不在同一 network | 明確加 `networks` |
| Volume 權限問題 | named volume 首次由 root 建立 | `user:` + 預先 `chown`、或使用 bind mount |
| Healthcheck 一直失敗 | `curl`/`wget` 沒裝在 image 裡 | alpine 需 `apk add curl`，或用 `CMD-SHELL` + `wget -q --spider` / `node -e` |
