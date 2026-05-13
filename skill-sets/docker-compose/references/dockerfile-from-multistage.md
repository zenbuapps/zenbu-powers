# Docker — FROM 與 Multi-stage Build

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「FROM、multi-stage、--platform、automatic platform ARGs」時載入。

```dockerfile
# syntax=docker/dockerfile:1
FROM [--platform=<platform>] <image>[:<tag>|@<digest>] [AS <name>]
```

## 範例

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## 技巧

- 只有 `ARG` 可以出現在 `FROM` 之前，用於參數化 base image：

  ```dockerfile
  ARG NODE_VERSION=22
  FROM node:${NODE_VERSION}-alpine
  ```

- `--platform` 支援跨平台：`--platform=$BUILDPLATFORM` 或 `--platform=linux/amd64`。

- Multi-stage 可 `COPY --from=<stage_name>`、`COPY --from=<image>` 或 `COPY --from=<build_context_name>`。

- 只構建特定 stage：`docker build --target builder .`

- **Automatic platform ARGs**（BuildKit 自動提供，需先宣告才可用）：
  - `TARGETPLATFORM`、`TARGETOS`、`TARGETARCH`、`TARGETVARIANT`
  - `BUILDPLATFORM`、`BUILDOS`、`BUILDARCH`、`BUILDVARIANT`
