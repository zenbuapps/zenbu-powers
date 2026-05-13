---
name: docker-compose
description: >
  Docker 與 Docker Compose 完整技術參考（Dockerfile + Compose Specification）。
  當任務涉及以下情況時，必須使用此 skill：
  撰寫或修改 Dockerfile、.dockerignore、docker-compose.yml、docker-compose.yaml、compose.yml、compose.yaml；
  使用指令 docker build、docker run、docker exec、docker compose up/down/build/logs/exec/ps/pull/push/config；
  Dockerfile 指令 FROM、RUN、CMD、LABEL、EXPOSE、ENV、ADD、COPY、ENTRYPOINT、VOLUME、USER、WORKDIR、ARG、
  ONBUILD、STOPSIGNAL、HEALTHCHECK、SHELL、COPY --from、RUN --mount、RUN --network；
  Compose 屬性 services、networks、volumes、configs、secrets、include、profiles、
  image、build、ports、depends_on、healthcheck、environment、env_file、restart、deploy、develop、
  volumes_from、cap_add、extra_hosts、external、driver、driver_opts；
  BuildKit、multi-stage builds、buildx、`# syntax=docker/dockerfile:1`、parser directives；
  Compose profiles、Compose include、watch mode、docker compose watch；
  container healthcheck、restart policy、network driver (bridge/overlay/host/none)、volume types (volume/bind/tmpfs)。
  此 skill 對應 Compose Specification（取代舊的 version 2/3 Compose 格式）與現代 Dockerfile v1 syntax。
---

# Docker & Docker Compose

> **文件來源**：https://docs.docker.com/reference/dockerfile/ 與 https://docs.docker.com/reference/compose-file/
> **適用版本**：Dockerfile `# syntax=docker/dockerfile:1` / Docker Compose Specification（取代 v2/v3 格式）
> **前提**：Docker Engine 20.10+（推薦 24+），Compose v2（`docker compose` 而非 `docker-compose`）

---

## References 索引（按需載入，**不要全載**）

依當前任務需要哪段，才 Read 對應 reference。每份檔案完整保留範例與選項表。

### Dockerfile 主題

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| FROM / Multi-stage | `references/dockerfile-from-multistage.md` | 設計 base image、multi-stage、跨平台 |
| RUN / BuildKit Mount | `references/dockerfile-run-mounts.md` | heredoc、--mount=type=cache/bind/secret/ssh、--network |
| CMD vs ENTRYPOINT | `references/dockerfile-cmd-entrypoint.md` | 三種形式、組合行為、shell vs exec form、tini |
| COPY vs ADD | `references/dockerfile-copy-add.md` | --from/--chmod/--chown/--link/--parents/--exclude、ADD URL/Git |
| ENV / ARG | `references/dockerfile-env-arg.md` | build-time vs runtime、變數展開、proxy ARGs |
| HEALTHCHECK / 其他 / .dockerignore / Parser Directives | `references/dockerfile-healthcheck-other.md` | HEALTHCHECK、VOLUME、USER、WORKDIR、STOPSIGNAL、SHELL、ONBUILD、EXPOSE、LABEL、`# syntax`、`.dockerignore` |

### Compose 主題

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| Services 完整屬性 | `references/compose-services.md` | image/build/command/environment/ports/depends_on/healthcheck/volumes/deploy/develop.watch/restart/extends |
| Networks / Volumes / Configs / Secrets | `references/compose-networks-volumes-configs-secrets.md` | 頂層宣告、external、ipam、driver_opts |
| Profiles / Include / 變數展開 | `references/compose-profiles-include-vars.md` | profiles 條件式、include、`${VAR}` 語法、變數來源優先序 |

### CLI / 最佳實踐

| 主題 | Reference 檔 | 何時載入 |
|------|--------------|----------|
| 常用 CLI 命令 | `references/cli-commands.md` | docker build/run/exec、docker compose up/down/logs、buildx 多平台 |
| 最佳實踐 + 常見陷阱 | `references/best-practices.md` | Dockerfile 12 條 / Compose 10 條最佳實踐、症狀對照表 |

---

## Dockerfile 指令速查

| 指令 | 用途 |
|------|------|
| `FROM` | 起始基底映像 |
| `RUN` | 建構期執行命令，產生新 layer |
| `CMD` | 預設執行命令（runtime） |
| `LABEL` | 中繼資料 key=value |
| `EXPOSE` | 文件化對外 port（不實際發布） |
| `ENV` | 設定環境變數（image + runtime） |
| `ADD` | 複製（支援 URL、Git、auto-extract tar） |
| `COPY` | 複製（建議預設使用） |
| `ENTRYPOINT` | 預設執行檔（不易被 CLI 覆寫） |
| `VOLUME` | 宣告 mount 點 |
| `USER` | 切換執行使用者 |
| `WORKDIR` | 切換工作目錄 |
| `ARG` | 建構期變數（`docker build --build-arg`） |
| `ONBUILD` | 作為基底映像時才觸發的指令 |
| `STOPSIGNAL` | 停止訊號（預設 SIGTERM） |
| `HEALTHCHECK` | 健康檢查 |
| `SHELL` | 變更 shell 形式指令的 shell |

---

## Compose 頂層結構（速查）

```yaml
name: my-app            # 專案名（可被 COMPOSE_PROJECT_NAME 環境變數覆蓋）

services:
  web:
    image: nginx
  api:
    build: ./api

networks:
  default:
    driver: bridge

volumes:
  db-data:

configs:
  nginx-conf:
    file: ./nginx.conf

secrets:
  db-password:
    file: ./secrets/db-password.txt

include:
  - path: common.compose.yaml
    env_file: .env.common

x-common: &common       # YAML anchor（可被 services 引用）
  restart: unless-stopped
```

> **注意**：`version: "3.x"` 屬性已廢棄，現代 Compose 不需要。

詳細屬性見 `references/compose-services.md`、`references/compose-networks-volumes-configs-secrets.md`。
