# Docker Compose — Profiles / Include / Environment Variable Interpolation

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「profiles 條件式啟動、include、變數展開語法、變數來源優先序、多檔案 merge」時載入。

## Profiles（條件式啟動）

```yaml
services:
  app:
    image: myapp
  debug-ui:
    image: phpmyadmin
    profiles: ["debug"]
  mail:
    image: mailhog
    profiles: ["debug", "dev"]
```

```bash
docker compose up                       # 只起 app
docker compose --profile debug up       # app + debug-ui + mail
docker compose --profile debug --profile dev up
```

## Include

```yaml
include:
  - path: common.compose.yaml
  - path: ./compose/database.yaml
    env_file: ./compose/database.env
  - path: ./compose/cache.yaml
    project_directory: ./cache
```

## Compose 檔內變數展開

```yaml
services:
  web:
    image: ${REGISTRY:-docker.io}/nginx:${VERSION:-latest}
    environment:
      API_URL: ${API_URL}
      BACKEND_HOST: ${HOST:?HOST required}     # 未設就報錯
      DEBUG: "${DEBUG-0}"                       # 未設用 0
```

| 語法 | 意義 |
|------|------|
| `${VAR}` | 必須存在（若未設則空字串） |
| `${VAR:-default}` | 未設或空時用 default |
| `${VAR-default}` | 未設時用 default（空字串則保留） |
| `${VAR:?err}` | 未設或空則錯誤（err 為訊息） |
| `${VAR?err}` | 未設則錯誤 |
| `${VAR:+alt}` | 已設且非空則用 alt |
| `${VAR+alt}` | 已設則用 alt |

## 變數來源（優先序由高到低）

1. 命令列 `-e` / `--env` 傳入
2. Shell 環境變數
3. `.env` 檔（Compose 專案根目錄）
4. `environment` 區塊內定義

`.env` 範例：

```
NODE_ENV=production
DB_PASSWORD=secret
COMPOSE_PROJECT_NAME=myapp
```

## 多檔案 merge

```bash
docker compose -f compose.yaml -f compose.prod.yaml up
```

後者覆蓋前者同 key。
