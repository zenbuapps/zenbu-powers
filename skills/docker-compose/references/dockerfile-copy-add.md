# Docker — COPY vs ADD

> 本檔屬 `skills/docker-compose/` 的子 reference，由主 SKILL.md 在「COPY 選項（--from/--chmod/--chown/--link/--parents/--exclude）、ADD URL/Git/tar」時載入。

## 選擇準則

- **預設用 COPY**，只在需要以下時才用 ADD：
  - 從 URL 下載（且真的需要）
  - 自動解壓 tar
  - 從 Git 拉取

## COPY 選項

```dockerfile
COPY [--from=<stage|image|context>] [--chmod=<perms>] [--chown=<user:group>] [--link] [--parents] [--exclude=<path>] <src>... <dest>
```

```dockerfile
# 基本
COPY package.json package-lock.json ./
COPY ./src /app/src

# 從其他 stage
COPY --from=builder /app/dist ./dist

# 從第三方 image
COPY --from=nginx:latest /etc/nginx/nginx.conf /etc/nginx/nginx.conf

# 權限
COPY --chmod=755 entrypoint.sh /usr/local/bin/
COPY --chown=node:node . /app

# 保留目錄結構
COPY --parents ./src/a.txt ./src/b.txt /dest/
# 保留目錄：/dest/src/a.txt, /dest/src/b.txt

# 排除
COPY --exclude=*.md --exclude=*.test.ts . /app

# --link（獨立 layer，變更前面 layer 不會使此 COPY 失效，加速重建）
COPY --link /static /var/www
```

## ADD 選項

```dockerfile
ADD [--checksum=<hash>] [--chmod=<perms>] [--chown=<user:group>] [--keep-git-dir=<bool>] [--link] [--unpack=<bool>] [--exclude=<path>] <src>... <dest>
```

```dockerfile
# URL（搭配 checksum）
ADD --checksum=sha256:beefdead... https://example.com/bin.tar.gz /opt/

# Git
ADD --keep-git-dir=true https://github.com/user/repo.git /app
ADD git@github.com:user/repo.git#branch:subdir /app

# Tar 自動解壓（本地）
ADD app.tar.gz /app/
```
