# Refine v5 — Notification / Live / Audit Log / i18n Provider Reference

> 套件：`@refinedev/core`
> 來源：https://refine.dev/core/docs/ — notification / realtime / audit-logs / i18n

## 目錄

- [Notification Provider](#notification-provider)
- [Live Provider（Realtime）](#live-providerrealtime)
- [Audit Log Provider](#audit-log-provider)
- [i18n Provider](#i18n-provider)

---

## Notification Provider

`notificationProvider` 是含 `open` / `close` 方法的物件，Refine 用來顯示/隱藏通知。非必填 — 不提供時用 default provider（app 無通知功能）。

```ts
interface NotificationProvider {
  open: (params: OpenNotificationParams) => void;
  close: (key: string) => void;
}
interface OpenNotificationParams {
  key?: string;
  message: string;
  type: "success" | "error" | "progress";
  description?: string;
  cancelMutation?: () => void;     // undoable 通知的取消回呼
  undoableTimeout?: number;        // undoable 通知倒數秒數
}
```

掛載與內建 provider：

```tsx
import { Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/antd"; // 內建 Ant Design 通知

<Refine notificationProvider={useNotificationProvider} />
```

內建：`@refinedev/antd`、`@refinedev/mui`、`@refinedev/mantine`、`@refinedev/chakra-ui` 皆匯出 `useNotificationProvider`。

### useNotification

從任何元件開啟/關閉通知。

```tsx
import { useNotification } from "@refinedev/core";

const { open, close } = useNotification();

open?.({ type: "success", message: "Success", description: "..." });
open?.({ type: "error", message: "Error", description: "..." });

// undoable 通知
open?.({
  type: "progress",
  message: "Progress",
  key: "my-key",
  undoableTimeout: 5,
  cancelMutation: () => { /* 按 undo 時執行 */ },
});

close?.("my-key"); // 用 key 關閉（open 時必須傳 key）
```

---

## Live Provider（Realtime）

啟用 server 與 client 之間的即時更新。

```ts
const liveProvider = {
  subscribe: ({ channel, params: { ids }, types, callback, meta }) => any,
  unsubscribe: (subscription) => void,
  publish?: ({ channel, type, payload, date, meta }) => void,
};
```

內建整合：Ably、Supabase、Appwrite、Hasura。

### Live Mode

啟用方式（`liveMode`）：

```tsx
// 全域：<Refine> 的 options
<Refine liveProvider={liveProvider} options={{ liveMode: "auto" }} onLiveEvent={(event) => {}} />

// 個別 hook（優先於全域設定）
useList({ resource: "posts", liveMode: "auto" });
```

- `auto`：相關 resource 的 query 在新 event 發佈時自動 invalidate + refetch。
- `manual`：不 invalidate query，改呼叫 `onLiveEvent` 回呼。
- `off`：完全停用即時模式。

```tsx
const { result } = useList({
  resource: "products",
  liveMode: "manual",
  onLiveEvent: (event) => {
    console.log(event); // { channel: "resources/posts", type: "created", payload: { ids: ["1"] }, date: Date }
  },
});
```

### 整合 hook

以下 hook 掛載時自動訂閱 resource channel：

- `useList` 衍生：`useTable`、`useSelect`（core）；`useTable`、`useEditableTable`、`useSelect`、`useSimpleList`、`useCheckboxGroup`、`useRadioGroup`（antd）；`useTable`（react-table）。
- `useOne` 衍生：`useShow`、`useForm`（core）；`useForm`、`useModalForm`、`useDrawerForm`、`useStepsForm`（antd）。
- `useMany` 衍生：`useSelect`。

mutation hook（`useCreate`/`useUpdate`/`useDelete` 等）成功時自動 publish event。

### useSubscription

訂閱 Realtime channel。

```tsx
import { useSubscription } from "@refinedev/core";

useSubscription({
  channel: "channel-name",                       // ﹡
  onLiveEvent: (event) => {},                     // ﹡
  types: ["created", "updated", "deleted"],       // 預設 ["*"]
  enabled: true,                                  // 預設 true
  params: { ids: [1, 2] },
  dataProviderName: "default",
});
```

### usePublish

發佈自訂 event。

```tsx
import { usePublish } from "@refinedev/core";

const publish = usePublish();
publish({
  channel: "custom-channel-name",
  type: "custom-event-name",
  payload: { ids: [1, 2, 3], "custom-property": "value" },
  date: new Date(),
});
```

> ⚠️ 在 client 端發佈 event 不建議；最佳實踐是從 server 端發佈。

---

## Audit Log Provider

追蹤資料變更與變更者。data hook 的 mutation 自動送 event 到 `auditLogProvider`。

```ts
const auditLogProvider = {
  create: (params: {
    resource: string;
    action: string;            // "create" | "update" | "delete" 等
    data?: any;
    author?: { name?: string; [key: string]: any };
    previousData?: any;
    meta?: Record<string, any>;
  }) => void;
  get: (params: {
    resource: string;
    action?: string;
    meta?: Record<string, any>;
    author?: Record<string, any>;
  }) => Promise<any>;
  update: (params: { id: BaseKey; name: string }) => Promise<any>;
};

<Refine auditLogProvider={auditLogProvider} />
```

- `create`：成功 mutation 或 `useLog().log()` 時觸發。create mutation 若 response 有 `id`，會加進 `meta`。authProvider 有 `getIdentity` 時 `author` 物件會帶入。
- `get`：取得 event 列表（`useLogList`）。
- `update`：更新 event（`useLog().rename`）。

> ⚠️ 安全考量：建議在 API 端建立 audit log（client 端資料可被竄改）。

### useLog

```tsx
import { useLog } from "@refinedev/core";
const { log, rename } = useLog();
log.mutate({ resource: "posts", action: "create", data: {...}, meta: { id: 1 } });
rename.mutate({ id: 1, name: "新事件名稱" });
```

### useLogList

```tsx
import { useLogList } from "@refinedev/core";
const { data } = useLogList({ resource: "posts", meta: { id: 1 } });
```

resource config 用 `meta.audit` 控制要記錄哪些 action：`{ name: "posts", meta: { audit: ["create", "update", "delete"] } }`。

---

## i18n Provider

讓 app 可在地化。Refine 與任何 i18n 框架相容（react-i18next 等）。

```ts
import { I18nProvider } from "@refinedev/core";

const i18nProvider: I18nProvider = {
  translate: (key: string, options?: any, defaultMessage?: string) => string,
  changeLocale: (lang: string, options?: any) => Promise<any>,
  getLocale: () => string,
};

<Refine i18nProvider={i18nProvider} />
```

`translate` 有兩種 overload：
- `translate(key, options?, defaultMessage?)`
- `translate(key, defaultMessage?)`

搭配 react-i18next：

```ts
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
const i18nProvider: I18nProvider = {
  translate: (key, options, defaultMessage) => t(key, defaultMessage, options),
  changeLocale: (lang) => i18n.changeLanguage(lang),
  getLocale: () => i18n.language,
};
```

### useTranslation

```tsx
import { useTranslation } from "@refinedev/core";

const { translate, changeLocale, getLocale } = useTranslation();
const currentLocale = getLocale();

<h1>{translate("posts.fields.title", "Title")}</h1>
<button onClick={() => changeLocale("en")} disabled={currentLocale === "en"}>EN</button>
<button onClick={() => changeLocale("de")} disabled={currentLocale === "de"}>DE</button>
```

也可用個別 hook：`useTranslate`（只取 translate）、`useSetLocale`（只取 changeLocale）、`useGetLocale`。Refine 所有元件支援 i18n — 建立自己的 translation file 即可覆寫 Refine 預設文字。
