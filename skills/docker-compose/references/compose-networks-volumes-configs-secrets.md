# Docker Compose — Networks / Volumes / Configs / Secrets

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「定義頂層 networks/volumes/configs/secrets、external、ipam、driver_opts」時載入。

## Networks 頂層

```yaml
networks:
  backend:
    driver: bridge                      # bridge | host | overlay | none | custom
    driver_opts:
      com.docker.network.bridge.host_binding_ipv4: "127.0.0.1"
    attachable: true                    # 允許 standalone container 加入 (overlay)
    enable_ipv4: true
    enable_ipv6: true
    internal: false                     # 無外部網路連線
    labels:
      com.example.network: backend
    ipam:
      driver: default
      config:
        - subnet: 172.28.0.0/16
          ip_range: 172.28.5.0/24
          gateway: 172.28.5.254
          aux_addresses:
            host1: 172.28.1.5
    name: my-backend-net                # 不加 project 前綴

  existing-net:
    external: true                      # 已存在的外部網路
    name: my-existing-net
```

## Volumes 頂層

```yaml
volumes:
  db-data:                              # 空（使用預設 driver）
  logs:
    driver: local
    driver_opts:
      type: nfs
      o: "addr=10.0.0.1,nolock,soft,rw"
      device: ":/exports/logs"
    labels:
      com.example.vol: data
    name: my-db-data
  existing-vol:
    external: true
    name: actual-volume-name
```

## Configs / Secrets 頂層

```yaml
configs:
  nginx-conf:
    file: ./config/nginx.conf
  # 或
  redis-conf:
    content: |
      maxmemory 256mb
      maxmemory-policy allkeys-lru
  # 或外部
  external-conf:
    external: true
    name: real_config_name

secrets:
  db-password:
    file: ./secrets/db-password.txt
  api-key:
    environment: API_KEY                # 從環境變數取值
  external-secret:
    external: true
```
