# LIFF Tooling, Plugins & the Pluggable SDK

Source:
- `https://developers.line.biz/en/docs/liff/liff-cli/`
- `https://developers.line.biz/en/docs/liff/cli-tool-create-liff-app/`
- `https://developers.line.biz/en/docs/liff/liff-plugin/`
- `https://developers.line.biz/en/docs/liff/pluggable-sdk/`

## Table of contents

- LIFF CLI (`@line/liff-cli`)
- Create LIFF App (`@line/create-liff-app`)
- LIFF plugin — authoring, the `install()` method, hooks
- The pluggable SDK and the module list
- Official plugins: LIFF Inspector, LIFF Mock

---

# LIFF CLI

`@line/liff-cli` — a CLI to develop LIFF apps more smoothly. GitHub:
`github.com/line/liff-cli`. The LIFF CLI lets you: create/update/list/delete
LIFF apps; create a LIFF app development environment; debug with the LIFF
Inspector; launch a local development server over HTTPS. (LIFF Mock will be
added in a future update.)

Runs on Node.js. Tested versions: LIFF CLI 0.4.1, LIFF SDK 2.24.0, Node.js
22.2.0, npm 10.7.0.

## Install

```bash
$ npm install -g @line/liff-cli
```

## Manage channels — `channel`

Channels must be created in the LINE Developers Console beforehand.

**Add a channel** (`add`) — adds a channel for the CLI to manage; prompts for
the channel secret:

```bash
$ liff-cli channel add 1234567890
? Channel Secret?: ********************************
Channel 1234567890 is now added.
```

A channel must be added with `add` before passing its channel ID to other commands.

**Set the default channel** (`use`) — used when a channel ID is omitted:

```bash
$ liff-cli channel use 1234567890
Channel 1234567890 is now selected.
```

## Manage LIFF apps — `app`

### Create a LIFF app — `app create`

```bash
$ liff-cli app create \
   --channel-id 1234567890 \
   --name "Brown Coffee" \
   --endpoint-url https://example.com \
   --view-type full
Successfully created LIFF app: 1234567890-AbcdEfgh
```

| Option | Required | Description |
|---|---|---|
| `-c`, `--channel-id` | | Channel ID. If omitted, the default channel is used |
| `-n`, `--name` | ✅ | LIFF app name. Can't include "LINE" or similar / inappropriate strings |
| `-e`, `--endpoint-url` | ✅ | Endpoint URL of the LIFF web app. Scheme must be **https**; URL fragments not allowed |
| `-v`, `--view-type` | ✅ | View size — `full` / `tall` / `compact` |

### Update a LIFF app — `app update`

```bash
$ liff-cli app update \
   --liff-id 1234567890-AbcdEfgh \
   --channel-id 1234567890 \
   --name "Brown Cafe"
Successfully updated LIFF app: 1234567890-AbcdEfgh
```

| Option | Required | Description |
|---|---|---|
| `--liff-id` | ✅ | LIFF ID to update |
| `--channel-id` | | Channel ID. If omitted, the default channel is used |
| `--name` | | LIFF app name |
| `--endpoint-url` | | Endpoint URL. Scheme must be **https** |
| `--view-type` | | View size — `full` / `tall` / `compact` |

### List LIFF apps — `app list`

```bash
$ liff-cli app list --channel-id 1234567890
LIFF apps:
1234567890-AbcdEfgh: Brown Coffee
1234567890-IjklMnop: Brown Cafe
```

`--channel-id` optional; defaults to the default channel.

### Delete a LIFF app — `app delete`

```bash
$ liff-cli app delete \
   --liff-id 1234567890-AbcdEfgh \
   --channel-id 1234567890
Successfully deleted LIFF app: 1234567890-AbcdEfgh
```

| Option | Required | Description |
|---|---|---|
| `--liff-id` | ✅ | LIFF ID to delete |
| `--channel-id` | | Channel ID. If omitted, the default channel is used |

## Create a LIFF app template — `scaffold`

Creates a LIFF app template using Create LIFF App, passing the project name:

```bash
$ liff-cli scaffold my-app --liff-id 1234567890-AbcdEfgh
```

`-l`, `--liff-id` (optional) — the LIFF ID of a LIFF app.

## Create a LIFF app development environment — `init`

`init` runs three steps in order: **add a channel** → **create a LIFF app** →
**create a LIFF app template** (scaffold).

```bash
$ liff-cli init \
   --channel-id 1234567890 \
   --name "Brown Coffee" \
   --view-type full \
   --endpoint-url https://example.com
```

| Option | Required | Description |
|---|---|---|
| `-c`, `--channel-id` | ✅ *1 | Channel ID to create a LIFF app for |
| `-n`, `--name` | ✅ *2 | LIFF app name |
| `-v`, `--view-type` | ✅ *2 | View size — `full` / `tall` / `compact` |
| `-e`, `--endpoint-url` | | Endpoint URL. Scheme must be **https** |

*1 Required via option or prompt unless a default channel is set. *2 Required via
option or prompt. Omitted options are asked interactively.

## Launch a local development server with HTTPS — `serve`

`serve` launches a local proxy server with HTTPS and rewrites the LIFF app's
endpoint URL to the proxy server's URL — making it easy to run a local dev server
over HTTPS.

```bash
# specify the local dev server by URL
$ liff-cli serve --liff-id 1234567890-AbcdEfgh --url http://localhost:3000/

# or by host and port
$ liff-cli serve --liff-id 1234567890-AbcdEfgh --host localhost --port 3000
```

> **Don't run `serve` for a published LIFF app** — it rewrites the endpoint URL
> to the local proxy, so users can't access the app.

### Debug with the LIFF Inspector — `--inspect`

`--inspect` launches the LIFF Inspector Server over HTTPS. Install the LIFF
Inspector Plugin in your LIFF app to debug it.

```bash
$ liff-cli serve --liff-id 1234567890-AbcdEfgh --url http://localhost:3000/ --inspect
```

Accessing the LIFF URL prints a `devtools://devtools/...` URL in the terminal;
opening it in Google Chrome lets you debug the LIFF app.

### Expose your local dev server — `--proxy-type`

LIFF CLI supports **ngrok** as a proxy:

```bash
$ NGROK_AUTHTOKEN={token} liff-cli serve \
   --liff-id 1234567890-AbcdEfgh --url http://localhost:3000/ --proxy-type ngrok
```

`ngrok-v1` is **deprecated** (ngrok v1 is no longer maintained).

### Operating conditions of `serve`

Create a valid certificate (`localhost.pem`) and private key
(`localhost-key.pem`) for localhost, and run `serve` where they live (e.g. the
project root). Use `mkcert`:

```bash
$ brew install mkcert        # macOS (Homebrew)
$ choco install mkcert       # Windows (Chocolatey)
$ mkcert -install            # create a local CA
$ mkcert localhost           # creates localhost.pem and localhost-key.pem
```

### `serve` options

| Option | Required | Description |
|---|---|---|
| `-l`, `--liff-id` | ✅ | LIFF ID on the local dev server. Only a LIFF app on the default channel |
| `-u`, `--url` | ✅ *1 | URL of the local dev server |
| `--host` | ✅ *2 | Host of the local dev server |
| `--port` | ✅ *2 | Port of the local dev server |
| `-i`, `--inspect` | | Launch the LIFF Inspector |
| `--proxy-type` | | `local-proxy` (default) / `ngrok` / `ngrok-v1` (deprecated) |
| `--ngrok-command` | | Command to run ngrok v1. Default `ngrok` |
| `--local-proxy-port` | | Port the local proxy listens on. Default `9000` |
| `--local-proxy-inspector-port` | | Port the local proxy for the LIFF Inspector Server listens on. Default `9223` |

*1 Required if specifying the dev server by URL. *2 Required if specifying it by
host + port.

---

# Create LIFF App

`@line/create-liff-app` — a CLI that scaffolds a LIFF dev environment with a
single command (like Create React App / Create Next App). GitHub:
`github.com/line/create-liff-app`.

**Languages:** JavaScript, TypeScript.
**Frameworks:** Next.js, Nuxt, React, Vue.js, Svelte (and vanilla).

Runs on Node.js. Tested versions: Create LIFF App 1.1.0, Node.js 18.17.1, Yarn 1.22.19.

A **LIFF ID** is required to run it (get one by creating a channel + adding a
LIFF app). You may enter a temporary endpoint URL (e.g. `https://example.com/`)
when adding the LIFF app and change it later.

## Run it

```bash
$ npx @line/create-liff-app
```

Interactive prompts: project name (default `my-app`); template
(`vanilla` / `react` / `vue` / `svelte` / `nextjs` / `nuxtjs`); language
(JavaScript / TypeScript); LIFF ID (optional — editable later in the generated
`.env`); package manager (yarn / npm).

## Options

Items given as options are skipped in the prompts.

```bash
$ npx @line/create-liff-app -t nextjs --ts
```

| Short | Long | Argument | Behavior |
|---|---|---|---|
| `-v` | `--version` | | Display the version number |
| `-t` | `--template` | `<template>` | Template — `vanilla`, `react`, `vue`, `svelte`, `nextjs`, `nuxtjs` |
| `-l` | `--liffid` | `<liff id>` | Specify the LIFF ID |
| `--js` | `--javascript` | | Generate JavaScript source |
| `--ts` | `--typescript` | | Generate TypeScript source |
| `--npm` | `--use-npm` | | Use npm |
| `--yarn` | `--use-yarn` | | Use Yarn |
| `-h` | `--help` | | Display help |

## Start the LIFF app on localhost

```bash
$ cd my-app
$ yarn dev
```

Visiting the printed URL (e.g. `http://localhost:3000`) shows `LIFF init succeeded.`
If the LIFF ID isn't set, it shows `LIFF init failed.` — write the LIFF ID to
`.env` in the generated directory and restart.

---

# LIFF plugin

A **LIFF plugin** extends the LIFF SDK — you can add your own APIs to the SDK or
change LIFF API behavior. A LIFF plugin is an **object or a class** with a
specific property and method. Available in **LIFF v2.19.0 or later**.

## Using a LIFF plugin

Pass the plugin to `liff.use()` to activate it. When activated, the `liff` object
is extended; a property is added with a `$` prefix to the plugin's `name` value,
so the plugin's API is accessible as `liff.${name}.{method}()`.

**If the plugin is a class** — pass an instance:

```js
class GreetPlugin {
  constructor() {
    this.name = "greet";
  }
  install() {
    return { hello: this.hello };
  }
  hello() {
    console.log("Hello, World!");
  }
}

liff.use(new GreetPlugin());
liff.$greet.hello(); // Hello, World!

liff.init({ liffId: "123456-abcedfg" }).then(() => { /* ... */ });
```

**If the plugin is an object:**

```js
const hello = () => { console.log("Hello, World!"); };

const greetPlugin = {
  name: "greet",
  install() {
    return { hello };
  },
};

liff.use(greetPlugin);
liff.$greet.hello(); // Hello, World!
```

## Creating a LIFF plugin

A LIFF plugin is an object/class with the `name` property and the `install()`
method.

### `name` property

A string — the plugin's name. It becomes the `liff` object property name
(`liff.${name}`).

### `install()` method

The `install()` method:

1. **Describes the plugin's initialization process** — `install()` runs when
   `liff.use()` activates the plugin.
2. **Defines the plugin's API** — the return value of `install()`. Return an
   object for multiple APIs, or return a single function for one API:

```js
class GreetPlugin {
  constructor() {
    this.name = "greet";
  }
  install() {
    return this.hello; // single-API form
  }
  hello() {
    console.log("Hello, World!");
  }
}

liff.use(new GreetPlugin());
liff.$greet(); // Hello, World!
```

### Arguments of `install()`

`install(context, option)`:

| Argument | Description |
|---|---|
| `context` | An object with `liff` (the `liff` object) and `hooks` (methods to register a callback on a hook) |
| `option` | The value passed as the 2nd argument of `liff.use()`. `undefined` if `liff.use()` had no 2nd argument |

## Hooks

A **hook** lets pre-registered callbacks run at a specific time during a LIFF
API's processing (similar to JavaScript event handling).

### Hooks for the LIFF API

The LIFF API currently provides hooks only for `liff.init()`:

| LIFF API | Hook | Hook type | Fires |
|---|---|---|---|
| `liff.init()` | `before` hook | async hook | Immediately after calling `liff.init()` (before init) |
| `liff.init()` | `after` hook | async hook | Immediately before calling `successCallback` (after init) |

### Hook types

- **Sync hook** — processes callbacks synchronously, in registration order;
  return values are ignored.
- **Async hook** — processes callbacks asynchronously, in parallel via
  `Promise.all()`; callbacks must return a `Promise`.

### Registering a callback on a hook

Use `context.hooks` from `install()`. The `before` / `after` hooks of
`liff.init()` are async hooks, so callbacks must return a `Promise`:

```js
class GreetPlugin {
  constructor() {
    this.name = "greet";
  }
  install(context) {
    context.hooks.init.before(this.initBefore);
    context.hooks.init.after(this.initAfter);
    return { hello: this.hello, goodbye: this.goodbye };
  }
  hello() { console.log("Hello, World!"); }
  goodbye() { console.log("Goodbye, World!"); }
  initBefore() {
    console.log("before hook is called");
    return Promise.resolve();
  }
  initAfter() {
    console.log("after hook is called");
    return Promise.resolve();
  }
}

liff.use(new GreetPlugin());
liff.init({ liffId: "123456-abcedfg" }).then(() => { /* ... */ });
```

### Creating a hook

Create a hook as an instance of `SyncHook` or `AsyncHook`, imported from
`@liff/hooks`. Fire a created hook with its `call()` method.

```js
import { SyncHook, AsyncHook } from "@liff/hooks";

class GreetPlugin {
  constructor() {
    this.name = "greet";
    this.hooks = {
      helloBefore: new SyncHook(),
      helloAfter: new AsyncHook(),
    };
  }
  install(context) {
    return { hello: this.hello.bind(this), goodbye: this.goodbye };
  }
  hello() {
    this.hooks.helloBefore.call();
    console.log("Hello, World!");
    this.hooks.helloAfter.call();
  }
  goodbye() { console.log("Goodbye, World!"); }
}
```

Other plugins can register callbacks on the created hooks via
`context.hooks.${name}`:

```js
class OtherPlugin {
  constructor() {
    this.name = "other";
  }
  install(context) {
    context.hooks.$greet.helloBefore(this.greetBefore);
    context.hooks.$greet.helloAfter(this.greetAfter);
  }
  greetBefore() { console.log("helloBefore hook is called"); }
  greetAfter() {
    console.log("helloAfter hook is called");
    return Promise.resolve();
  }
}

liff.use(new GreetPlugin());
liff.use(new OtherPlugin());
liff.$greet.hello();
// helloBefore hook is called
// Hello, World!
// helloAfter hook is called
```

#### `call()` method

`call()` fires a hook. Any number of arguments passed to `call()` are received
by the registered callbacks:

```js
hello() {
  this.hooks.helloBefore.call("foo");
  console.log("Hello, World!");
  this.hooks.helloAfter.call("foo", 0);
}
// ...
greetBefore(foo) { console.log(foo); }       // foo
greetAfter(foo, bar) {                       // foo 0
  console.log(foo, bar);
  return Promise.resolve();
}
```

## Official LIFF plugins

| Plugin | Purpose | Links |
|---|---|---|
| **LIFF Inspector** | Debug a LIFF app with Chrome DevTools on a different PC than the device running the app | `github.com/line/liff-inspector`, `@line/liff-inspector` |
| **LIFF Mock** | Make testing easy — adds a mock mode; the LIFF API returns mock data independent of the LIFF server, for unit / load testing | `github.com/line/liff-mock`, `@line/liff-mock` |

---

# Pluggable SDK

The **pluggable SDK** lets you choose which LIFF APIs to include in the LIFF SDK.
Including only the APIs your app uses reduces the SDK file size by up to ~34%,
improving display speed.

**Use conditions:** the **npm** version of LIFF **v2.22.0 or later** only — not
available in the CDN version.

## How to use

### 1. Import the `liff` object

```js
import liff from "@line/liff/core";
```

This core `liff` object includes **only**: `liff.id`, `liff.ready`,
`liff.init()`, `liff.getVersion()`, `liff.use()`.

To use other LIFF APIs, import the corresponding modules:

```js
import liff from "@line/liff/core";
import GetOS from "@line/liff/get-os";
import GetAppLanguage from "@line/liff/get-app-language";
```

### 2. Activate the LIFF APIs

Modules are classes — pass **instances** to `liff.use()`:

```js
import liff from "@line/liff/core";
import GetOS from "@line/liff/get-os";
import GetAppLanguage from "@line/liff/get-app-language";

liff.use(new GetOS());
liff.use(new GetAppLanguage());

liff.init({ liffId: "123456-abcedfg" });

liff.getOS();          // Available
liff.getAppLanguage(); // Available
liff.login();          // Not available — module not activated
```

## Important point — `liff.use()` before `liff.init()`

Due to technical limitations, run `liff.use()` **before** `liff.init()`. Running
`liff.use()` after `liff.init()` is not guaranteed to work.

```js
// Correct
import liff from "@line/liff/core";
import GetOS from "@line/liff/get-os";
liff.use(new GetOS());        // before init
liff.init({ liffId: "123456-abcedfg" });
```

## LIFF API → module list

| LIFF API | Module |
|---|---|
| `liff.getOS()` | `@line/liff/get-os` |
| `liff.getAppLanguage()` | `@line/liff/get-app-language` |
| `liff.getLanguage()` (deprecated) | `@line/liff/get-language` |
| `liff.getLineVersion()` | `@line/liff/get-line-version` |
| `liff.getContext()` | `@line/liff/get-context` |
| `liff.isInClient()` | `@line/liff/is-in-client` |
| `liff.isLoggedIn()` | `@line/liff/is-logged-in` |
| `liff.isApiAvailable()` | `@line/liff/is-api-available` |
| `liff.login()` | `@line/liff/login` |
| `liff.logout()` | `@line/liff/logout` |
| `liff.getAccessToken()` | `@line/liff/get-access-token` |
| `liff.getIDToken()` | `@line/liff/get-id-token` |
| `liff.getDecodedIDToken()` | `@line/liff/get-decoded-id-token` |
| `liff.permission.getGrantedAll()` / `liff.permission.query()` / `liff.permission.requestAll()` | `@line/liff/permission` |
| `liff.getProfile()` | `@line/liff/get-profile` |
| `liff.getFriendship()` | `@line/liff/get-friendship` |
| `liff.openWindow()` | `@line/liff/open-window` |
| `liff.closeWindow()` | `@line/liff/close-window` |
| `liff.sendMessages()` | `@line/liff/send-messages` |
| `liff.shareTargetPicker()` | `@line/liff/share-target-picker` |
| `liff.scanCodeV2()` | `@line/liff/scan-code-v2` |
| `liff.scanCode()` (deprecated) | `@line/liff/scan-code` |
| `liff.permanentLink.createUrlBy()` / `liff.permanentLink.createUrl()` / `liff.permanentLink.setExtraQueryParam()` | `@line/liff/permanent-link` |
| `liff.i18n.setLang()` | `@line/liff/i18n` |
| `liff.createShortcutOnHomeScreen()` | `@line/liff/create-shortcut-on-home-screen` |
