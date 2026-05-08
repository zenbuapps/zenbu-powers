# Docker — ENV / ARG

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「ARG (build-time)、ENV (runtime)、變數展開語法、proxy ARGs」時載入。

## ARG（build-time）

```dockerfile
ARG NODE_VERSION=22
ARG API_URL

# Usage
FROM node:${NODE_VERSION}-alpine
RUN echo "build API: ${API_URL}"

# docker build --build-arg API_URL=https://api.example.com .
```

- `ARG` 不會進入最終 image
- 作用域：在 stage 內（宣告 `FROM` 之後才可用）
- **Predefined proxy ARGs**：`HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY` 等自動可用。

## ENV（runtime）

```dockerfile
ENV NODE_ENV=production
ENV DB_HOST="localhost" DB_PORT=5432
ENV LOG_LEVEL=info \
    CACHE_TTL=3600
```

- 會進入最終 image，容器啟動時也會有
- `ENV` 覆寫 `ARG`（若同名）
- **不可用來存放 secret**（會出現在 `docker inspect`）

## 變數展開（bash-like）

```dockerfile
${var:-default}    # 若 var 未設或空，用 default
${var-default}     # 若 var 未設，用 default
${var:+alt}        # 若 var 已設且非空，用 alt
${var+alt}         # 若 var 已設，用 alt
```

支援於：`ADD`、`COPY`、`ENV`、`EXPOSE`、`FROM`、`LABEL`、`STOPSIGNAL`、`USER`、`VOLUME`、`WORKDIR`、`ONBUILD`。
