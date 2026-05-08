# Cloudflare — GitHub Actions 整合

> 本檔屬 `skills/cloudflare-pages-wrangler/` 的子 reference，由主 SKILL.md 在「cloudflare/wrangler-action@v3、PR Preview workflow、action 輸入/輸出」時載入。

## 用 `cloudflare/wrangler-action@v3`

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run build

      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          # Pages 部署
          command: pages deploy ./dist --project-name=my-site --branch=${{ github.head_ref || github.ref_name }}
          # 或 Workers 部署：
          # command: deploy --env production
```

## 關鍵 action 輸入

| 輸入 | 說明 |
|------|------|
| `apiToken` | 必填（或用 `CLOUDFLARE_API_TOKEN` secret） |
| `accountId` | 帳號 ID |
| `workingDirectory` | 執行目錄（monorepo 子專案） |
| `wranglerVersion` | 指定 wrangler 版本 |
| `command` | wrangler 子命令（如 `deploy`、`pages deploy`） |
| `secrets` | 寫入 secret（多行 KEY=value） |
| `preCommands` | 部署前執行 |
| `postCommands` | 部署後執行 |

## 拆 PR Preview 的典型 workflow

```yaml
- name: Deploy
  id: deploy
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy ./dist --project-name=my-site --branch=${{ github.head_ref || github.ref_name }}

- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: thollander/actions-comment-pull-request@v2
  with:
    message: |
      Preview URL: ${{ steps.deploy.outputs.deployment-url }}
```

action outputs：`deployment-url`、`pages-deployment-alias-url`、`command-output`、`command-stderr`。
