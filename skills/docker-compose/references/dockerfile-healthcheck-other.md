# Docker — HEALTHCHECK 與其他指令

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「HEALTHCHECK、VOLUME、USER、WORKDIR、STOPSIGNAL、SHELL、ONBUILD、EXPOSE、LABEL」時載入。

## HEALTHCHECK

```dockerfile
HEALTHCHECK [--interval=30s] [--timeout=30s] [--start-period=0s] [--start-interval=5s] [--retries=3] \
  CMD <command>

# 範例
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 關閉繼承自 base image 的 healthcheck
HEALTHCHECK NONE
```

Exit code：`0` = healthy, `1` = unhealthy, `2` = reserved。

## VOLUME

```dockerfile
VOLUME ["/data", "/var/log"]
VOLUME /data
```

- 宣告 mount point
- 無法指定 host path（那是 `docker run -v` 的事）
- 建立後任何該路徑的內容在新 layer 會被丟棄（舊 builder）/ 保留（BuildKit）

## USER

```dockerfile
RUN addgroup -S app && adduser -S -G app app
USER app

# 或 UID
USER 1000:1000
```

## WORKDIR

```dockerfile
WORKDIR /app
WORKDIR subdir    # 相對 → /app/subdir
WORKDIR $DIR      # 支援變數
```

## STOPSIGNAL

```dockerfile
STOPSIGNAL SIGTERM
STOPSIGNAL 15
```

## SHELL

```dockerfile
SHELL ["/bin/bash", "-ec"]
SHELL ["powershell", "-Command"]
```

## ONBUILD

```dockerfile
ONBUILD COPY . /app
ONBUILD RUN npm install
# 僅當此 image 作為其他 Dockerfile 的 FROM 時才觸發
```

## EXPOSE

```dockerfile
EXPOSE 80
EXPOSE 80/tcp 443/tcp
EXPOSE 53/udp
```

**只是文件化**，不實際 publish（需 `docker run -p`）。

## LABEL

```dockerfile
LABEL maintainer="team@example.com"
LABEL org.opencontainers.image.source="https://github.com/user/repo" \
      org.opencontainers.image.version="1.0.0"
```

## Parser Directives

置於 Dockerfile 最頂端（空行之前）：

```dockerfile
# syntax=docker/dockerfile:1
# escape=\
# check=skip=JSONArgsRecommended
```

### `# syntax`（推薦）

```dockerfile
# syntax=docker/dockerfile:1         # 最新穩定
# syntax=docker/dockerfile:1-labs    # 實驗功能
```

啟用最新 BuildKit 前端特性（如 heredoc、`RUN --mount`、`--parents`）。

### `# escape`

```dockerfile
# escape=`     # Windows PowerShell 用反引號當 escape
```

### `# check`

```dockerfile
# check=skip=<CheckName1,CheckName2|all>
# check=error=true
```

控制 `docker build --check` 的 linter。

## .dockerignore

```
# 忽略
node_modules
.git
.vscode
*.log
dist
coverage

# 例外
!dist/index.html
```

放在 build context 根目錄，邏輯類似 `.gitignore`。減少 context 大小、避免複製 secret。
