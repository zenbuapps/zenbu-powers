# Docker / Compose — 常用 CLI 命令

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「docker build/run/exec、docker compose up/down/logs/exec/run、buildx 多平台」時載入。

## Docker（單容器）

```bash
docker build -t myapp:1.0 .
docker build --build-arg NODE_VERSION=22 --target runtime -t myapp:prod .
docker build --secret id=npm,src=./npm_token.txt .
docker build --ssh default=$SSH_AUTH_SOCK .

docker run -d --name web -p 8080:80 --restart unless-stopped nginx
docker run --rm -it --env NODE_ENV=dev -v $(pwd):/app node:22 bash
docker run --init ...

docker exec -it web sh
docker logs -f --tail=100 web
docker inspect web
docker stats
docker ps -a
docker image prune -a
docker system prune --volumes
```

## Docker Compose（v2）

```bash
docker compose up -d                        # 背景啟動
docker compose up --build                   # 重新 build 再啟動
docker compose up --remove-orphans          # 清掉已從 compose 移除的服務
docker compose up -d web api                # 僅啟動指定服務

docker compose down                         # 停止並移除 container
docker compose down -v                      # 連同 volume 一起移除
docker compose down --rmi all               # 連同 image

docker compose build [SERVICE]
docker compose pull                          # 拉取所有 image
docker compose push

docker compose logs -f web                   # 追蹤 log
docker compose exec web sh                   # 進入運行中 container
docker compose run --rm web npm test         # 臨時 run

docker compose ps                            # 顯示狀態
docker compose top                           # 所有進程
docker compose config                        # 驗證 + 顯示展開後的 compose
docker compose config --services             # 列出服務名

docker compose watch                         # 啟用 develop.watch
docker compose restart web
docker compose stop / start / kill
docker compose pause / unpause
docker compose cp web:/app/log.txt ./
docker compose events
docker compose version
```

## buildx（多平台 / advanced builder）

```bash
docker buildx create --use --name multi
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:1.0 --push .
docker buildx build --cache-from type=gha --cache-to type=gha,mode=max .
docker buildx bake                          # 用 docker-bake.hcl
```
