# Cloudflare — Wrangler CLI 完整指令

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「Pages CLI、Workers CLI、認證、deploy、dev、secret、versions、types、KV/R2/D1 storage 子命令、環境變數」時載入。

## Wrangler CLI：Pages 命令

### 安裝

```bash
npm install -g wrangler
# 或專案內
npm install --save-dev wrangler
npx wrangler --version
```

### Pages 專案管理

```bash
# 建立專案（互動式，會問 name 與 production branch）
npx wrangler pages project create <PROJECT_NAME>
npx wrangler pages project create my-site --production-branch=main

# 列出所有專案
npx wrangler pages project list

# 刪除
npx wrangler pages project delete <PROJECT_NAME>
```

### Direct Upload 部署

```bash
# 部署到 production
npx wrangler pages deploy <BUILD_OUTPUT_DIR> \
  --project-name=my-site \
  --branch=main \
  --commit-hash=$(git rev-parse HEAD) \
  --commit-message="$(git log -1 --pretty=%B)" \
  --commit-dirty=false \
  --compatibility-date=2026-04-01 \
  --compatibility-flags=nodejs_compat

# 部署到預覽環境
npx wrangler pages deploy ./dist --project-name=my-site --branch=feature-xyz
```

常用 flag：

| Flag | 說明 |
|------|------|
| `--project-name` | 專案名（cache 過就可省） |
| `--branch` | 分支名（production-branch 會推到正式） |
| `--commit-hash` | 關聯 commit |
| `--commit-message` | 關聯 commit msg |
| `--commit-dirty` | 本地 working tree 非乾淨時 |
| `--compatibility-date` | 覆寫 wrangler.jsonc |
| `--compatibility-flags` | 覆寫 wrangler.jsonc |

### 本地開發

```bash
# 本地啟動（含 Functions + 靜態檔）
npx wrangler pages dev <BUILD_OUTPUT_DIR>

# 搭配 framework dev server（proxy 模式）
npx wrangler pages dev -- npm run dev        # 啟動自己的 dev server
npx wrangler pages dev --proxy 3000 -- npm run dev

# 指定 port / local bindings
npx wrangler pages dev ./dist --port=8788 \
  --kv=MY_KV --r2=MY_BUCKET --d1=DB \
  --service=BACKEND=backend-worker \
  --local
```

### Deployment / 日誌

```bash
npx wrangler pages deployment list --project-name=my-site

npx wrangler pages deployment tail --project-name=my-site
npx wrangler pages deployment tail <DEPLOYMENT_ID>

# 下載 wrangler 設定
npx wrangler pages download config <PROJECT_NAME>
```

### Functions 本地建置（少用，`pages dev` 自動處理）

```bash
npx wrangler pages functions build
npx wrangler pages functions optimize-routes
```

## Wrangler CLI：Workers 命令

### 認證

```bash
npx wrangler login                      # 瀏覽器 OAuth
npx wrangler logout
npx wrangler whoami
```

環境變數替代：`CLOUDFLARE_API_TOKEN` 與 `CLOUDFLARE_ACCOUNT_ID`（CI/CD 常用）。

### 部署

```bash
npx wrangler deploy                     # 預設
npx wrangler deploy src/index.ts        # 指定 entry
npx wrangler deploy --env staging
npx wrangler deploy --name my-worker --compatibility-date=2026-04-01
npx wrangler deploy --dry-run --outdir=./dist   # 只編譯不部署
npx wrangler deploy --minify
```

常用 flag：

| Flag | 說明 |
|------|------|
| `--name` | 覆寫 worker 名稱 |
| `--env` | 使用特定 env |
| `--outdir` | 輸出 build 產物 |
| `--compatibility-date` | 覆寫 |
| `--compatibility-flags` | 覆寫 |
| `--var KEY:VALUE` | 覆寫 var |
| `--define KEY:VALUE` | 編譯時替換（如 `esbuild define`） |
| `--triggers / --schedule` | cron 設定 |
| `--routes / --route` | 覆寫 route |
| `--domain` | 加 custom domain |
| `--keep-vars` | deploy 時不覆寫 dashboard 的變數 |
| `--minify` | 壓縮 |
| `--dry-run` | 不真的部署 |
| `--tag`, `--message` | 版本標籤與訊息 |

### 本地開發

```bash
npx wrangler dev                        # 本地預覽 (localhost:8787)
npx wrangler dev --remote               # 使用實際 Cloudflare 網路執行
npx wrangler dev --test-scheduled       # 開啟 /__scheduled 路徑測試 cron
npx wrangler dev --ip=0.0.0.0 --port=8888 --local-protocol=http
npx wrangler dev --var API_KEY:xxx --define VERSION:'"1.0"'
npx wrangler dev --https-key-path=./key.pem --https-cert-path=./cert.pem
```

### Secrets

```bash
# 放入 / 更新（會 prompt 輸入）
npx wrangler secret put MY_SECRET
echo "value" | npx wrangler secret put MY_SECRET

# 特定 env
npx wrangler secret put MY_SECRET --env staging

# 刪除
npx wrangler secret delete MY_SECRET

# 列出
npx wrangler secret list

# 批次（從 JSON stdin）
cat secrets.json | npx wrangler secret bulk
# secrets.json: { "KEY1": "VAL1", "KEY2": "VAL2" }

# Pages 專案
npx wrangler pages secret put MY_SECRET --project-name=my-site
npx wrangler pages secret list --project-name=my-site
```

### Versions & Deployments（v3.40+）

```bash
# 上傳新版本（不立即部署）
npx wrangler versions upload --tag v1.2.3 --message "new feature"

# 將特定 version 100% 推到 traffic
npx wrangler versions deploy <VERSION_ID>@100% --yes

# 漸進部署
npx wrangler versions deploy <OLD>@90% <NEW>@10% --yes

# 列出 10 個最新 version
npx wrangler versions list
npx wrangler versions view <VERSION_ID>

# Rollback
npx wrangler rollback <VERSION_ID> --message "rollback to stable"
npx wrangler rollback                   # 預設 rollback 至上一版

# 看 deployments
npx wrangler deployments list
npx wrangler deployments status
```

### 生成型別

```bash
# 由 wrangler.jsonc 生成 Env 型別 + runtime types
npx wrangler types
npx wrangler types --env=staging
npx wrangler types --env-interface=MyEnv ./worker-configuration.d.ts

# CI 檢查
npx wrangler types --check         # exit 0 若最新
```

### 其他

```bash
npx wrangler init my-worker              # 建立新專案（會改呼叫 create-cloudflare）
npx wrangler delete                       # 刪除 Worker
npx wrangler tail                         # 即時 log
npx wrangler tail --format=pretty --status=error
npx wrangler docs                         # 開文件
npx wrangler check startup                # CPU profile 冷啟動

# Storage（KV / R2 / D1 等都有 sub-command，例子）
npx wrangler kv:namespace create MY_KV
npx wrangler kv:namespace list
npx wrangler kv:key put --binding=MY_KV "key" "value"
npx wrangler kv:key get --binding=MY_KV "key"

npx wrangler r2 bucket create my-bucket
npx wrangler r2 object put my-bucket/key --file=./file.txt

npx wrangler d1 create my-db
npx wrangler d1 execute my-db --file=./schema.sql
npx wrangler d1 execute my-db --command "SELECT * FROM users"
npx wrangler d1 migrations apply my-db
```

### 環境變數影響 Wrangler 行為

| 變數 | 用途 |
|------|------|
| `CLOUDFLARE_API_TOKEN` | CI 認證（取代 OAuth） |
| `CLOUDFLARE_ACCOUNT_ID` | 帳號 ID |
| `WRANGLER_LOG` | 除錯 log level |
| `CLOUDFLARE_ENV` | 設定 env（等於 `--env`） |
