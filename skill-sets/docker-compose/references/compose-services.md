# Docker Compose — Services 完整屬性

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「services 下的 image/build/command/environment/ports/depends_on/healthcheck/volumes/deploy/develop.watch/restart/extends」時載入。

## image / build

```yaml
services:
  api:
    image: node:22-alpine             # 直接拉取
  backend:
    build: ./backend                   # 等同 context
  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile.prod
      args:
        NODE_VERSION: "22"
        BUILD_DATE: "2026-04-20"
      target: runtime                  # multi-stage 目標 stage
      secrets:
        - npm_token
      cache_from:
        - type=registry,ref=myregistry/cache:latest
      cache_to:
        - type=local,dest=/tmp/buildcache
      platforms:
        - linux/amd64
        - linux/arm64
      network: host
      shm_size: '2gb'
      labels:
        com.example.description: "Build label"
      tags:
        - myregistry/worker:1.0.0
      pull: true
```

## command / entrypoint

```yaml
command: node dist/main.js
command: ["node", "dist/main.js"]
command: []                           # 清空（使用 image 的 CMD）

entrypoint: /docker-entrypoint.sh
entrypoint:
  - /usr/bin/tini
  - --
  - node
  - dist/main.js
```

## environment / env_file

```yaml
environment:
  NODE_ENV: production
  DB_HOST: db
  CACHE_TTL: "3600"                   # 建議加引號

environment:
  - NODE_ENV=production
  - DB_PASSWORD                        # 從 shell 繼承

env_file: .env

env_file:
  - ./.env.common
  - ./.env.local

env_file:
  - path: ./.env.production
    required: true
    format: raw                       # 不做變數展開
    encoding: utf-8
```

## ports / expose

```yaml
# 短語法
ports:
  - "3000"
  - "8000:8000"
  - "127.0.0.1:5432:5432"
  - "6060:6060/udp"
  - "9000-9002:9000-9002"

# 長語法
ports:
  - name: web
    target: 80
    published: "8080"
    host_ip: 127.0.0.1
    protocol: tcp
    app_protocol: http
    mode: host                        # host=每台機器暴露一次; ingress=Swarm 負載平衡

expose:
  - "3000"                             # 僅對同一網路內的服務可見
  - "8080-8085/tcp"
```

## depends_on

```yaml
# 短語法（僅等 started）
depends_on:
  - db
  - redis

# 長語法（推薦）
depends_on:
  db:
    condition: service_healthy         # 等 healthcheck 通過
    restart: true                      # db 重啟時自動重啟本服務
  redis:
    condition: service_started         # 預設
    required: false                    # 缺 redis 也啟動
  migrate:
    condition: service_completed_successfully   # 等 exit 0
```

## healthcheck

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  # test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
  # test: "curl -f http://localhost/ || exit 1"          # 等同 CMD-SHELL
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s                     # 啟動期寬限（不計入 retries）
  start_interval: 5s                    # 啟動期內的檢查頻率
  # disable: true                       # 停用

# test 格式：
# ["CMD", cmd, arg...]     → exec form
# ["CMD-SHELL", cmd]        → shell form
# ["NONE"]                  → 停用繼承自 image 的 healthcheck
```

## volumes

```yaml
# 短語法
volumes:
  - db-data:/var/lib/postgresql/data    # 命名 volume
  - ./config:/etc/app/config:ro          # bind mount + 唯讀
  - /var/run/docker.sock:/var/run/docker.sock

# 長語法
volumes:
  - type: volume
    source: db-data
    target: /var/lib/postgresql/data
    volume:
      nocopy: true
      subpath: sub/dir
  - type: bind
    source: /host/path
    target: /container/path
    read_only: true
    bind:
      propagation: shared
      create_host_path: true
      selinux: z
  - type: tmpfs
    target: /app/cache
    tmpfs:
      size: 100000000
      mode: 0755
  - type: image
    source: myimage:tag
    target: /vendor
    image:
      subpath: /data
```

## deploy

```yaml
deploy:
  mode: replicated                     # replicated | global
  replicas: 3
  restart_policy:
    condition: on-failure               # none | on-failure | any
    delay: 5s
    max_attempts: 3
    window: 120s
  update_config:
    parallelism: 1
    delay: 10s
    order: start-first                  # stop-first | start-first
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
      pids: 100
    reservations:
      cpus: '0.25'
      memory: 256M
  labels:
    com.example.foo: bar
  placement:
    constraints:
      - node.role == manager
```

在 `docker compose up` 下，`deploy.resources` 以 `mem_limit`/`cpus` 形式生效；`mode`、`replicas`、`restart_policy`、`placement` 等主要用於 Swarm。

## develop.watch（Compose Watch）

```yaml
develop:
  watch:
    - path: ./src
      action: sync                      # sync | rebuild | sync+restart
      target: /app/src                   # sync 時 container 內目標
    - path: ./package.json
      action: rebuild
    - path: ./public
      action: sync+restart
      target: /app/public
      ignore:
        - "*.log"
```

搭配 `docker compose watch` 啟用。

## restart

```yaml
restart: "no"                           # 預設，不重啟
restart: always                         # 一律重啟
restart: on-failure                     # 失敗才重啟
restart: on-failure:3                   # 失敗最多重啟 3 次
restart: unless-stopped                 # 除非手動停止
```

## 其他常用

```yaml
container_name: my-api                  # 固定名（不可 scale）
hostname: api.local
domainname: example.com
user: "1000:1000"
working_dir: /app
init: true                              # 加入 tini 作 PID 1

labels:
  com.example.service: api
  com.example.team: platform

pid: "host"                             # 共用 host PID namespace
# pid: "service:other-service"

networks:
  - backend
  - frontend
# 或長語法
networks:
  backend:
    aliases: [api, my-api]
    ipv4_address: 172.28.0.5
    ipv6_address: 2001:db8::5
    priority: 1000
    interface_name: eth0

extra_hosts:
  - "host.docker.internal=host-gateway"
  - "somehost=192.168.1.10"

dns:
  - 8.8.8.8
  - 1.1.1.1

dns_search:
  - example.com

tmpfs:
  - /run
  - /tmp

ulimits:
  nofile:
    soft: 20000
    hard: 40000

cap_add: [NET_ADMIN, SYS_TIME]
cap_drop: [ALL]
privileged: false
read_only: true
security_opt:
  - no-new-privileges:true
  - seccomp:default.json

sysctls:
  net.core.somaxconn: "1024"

mem_limit: 512m
cpus: '0.5'
cpu_shares: 512
shm_size: '1gb'
stop_grace_period: 30s
stop_signal: SIGINT

logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

profiles:
  - debug                               # 僅在 --profile debug 時啟動

pull_policy: always                     # always | never | missing | build | daily | weekly | every_12h

platform: linux/amd64

runtime: nvidia                          # GPU

devices:
  - "/dev/ttyUSB0:/dev/ttyUSB0"
  - "/dev/nvidia0"

configs:
  - source: nginx-conf
    target: /etc/nginx/nginx.conf
    uid: "0"
    gid: "0"
    mode: 0440

secrets:
  - source: db-password
    target: /run/secrets/db-password
    uid: "1000"
    gid: "1000"
    mode: 0400
```

## extends（多檔案共享）

```yaml
# common.yaml
services:
  webapp:
    image: myapp
    environment:
      DEBUG: "0"

# docker-compose.yml
services:
  web:
    extends:
      file: common.yaml
      service: webapp
    environment:
      DEBUG: "1"                        # 覆蓋
```
