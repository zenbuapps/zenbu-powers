# Docker — RUN 與 BuildKit Mount

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「RUN heredoc、--mount=type=cache/bind/secret/ssh/tmpfs、--network、--security」時載入。

## 基本語法

```dockerfile
# Shell form（呼叫 /bin/sh -c）
RUN apt-get update && apt-get install -y curl

# Exec form（不走 shell）
RUN ["apt-get", "install", "-y", "curl"]
```

## Heredoc（BuildKit）

```dockerfile
RUN <<EOF
apt-get update
apt-get install -y curl
rm -rf /var/lib/apt/lists/*
EOF
```

## `--mount=type=cache`（持久化快取）

```dockerfile
# Node
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Go
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o /app ./cmd

# apt（需 sharing=locked）
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y curl
```

`cache` 選項：`id`, `target|dst`, `ro|readonly`, `sharing`（`shared|private|locked`）, `from`, `source`, `mode`, `uid`, `gid`。

## `--mount=type=bind`（來自 build context / 其他 stage）

```dockerfile
RUN --mount=type=bind,source=.,target=/src \
    cp /src/config.json /etc/app/

RUN --mount=type=bind,from=build,source=/out,target=/in \
    cp /in/app /usr/local/bin/
```

## `--mount=type=secret`（密鑰不進入映像）

```dockerfile
RUN --mount=type=secret,id=npm_token,target=/root/.npmrc \
    npm install

# 對應 build：
# docker build --secret id=npm_token,src=./npm_token.txt .
```

選項：`id`, `target|dst`, `env`, `required`, `mode`, `uid`, `gid`。

## `--mount=type=ssh`

```dockerfile
RUN --mount=type=ssh \
    git clone git@github.com:private/repo.git

# docker build --ssh default=$SSH_AUTH_SOCK .
```

## `--mount=type=tmpfs`

```dockerfile
RUN --mount=type=tmpfs,target=/tmp,size=1g \
    some_command
```

## `--network`

```dockerfile
RUN --network=default    # 預設，有網路
RUN --network=none       # 斷網
RUN --network=host       # host 網路（需 entitlement）
```

## `--security`（需 entitlement）

```dockerfile
RUN --security=insecure  # 特殊權限
```
