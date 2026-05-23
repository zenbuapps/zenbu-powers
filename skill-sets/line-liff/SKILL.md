---
name: line-liff
description: >-
  LINE Front-end Framework (LIFF) official reference at API-reference depth.
  Covers the full `liff` JavaScript SDK method reference, the LIFF Server API,
  LIFF plugins, the pluggable SDK, the LIFF CLI / Create LIFF App tooling, and
  every step of building, registering, and opening a LIFF app. Use this skill
  whenever the task touches a LIFF app / LINE in-app web app: initializing the
  SDK, logging users in, reading the LINE user profile, sending messages on the
  user's behalf, scanning 2D / QR codes, sharing via the share target picker,
  or debugging a LIFF browser issue. Trigger on mentions of: LIFF, LINE Front-end
  Framework, LIFF app, liff.line.me, miniapp.line.me, @line/liff, @line/liff-cli,
  @line/create-liff-app, liff-inspector, liff-mock, the liff CDN sdk.js,
  liff.init, liff.ready, liff.id, liff.login, liff.logout, liff.getProfile,
  liff.getAccessToken, liff.getIDToken, liff.getDecodedIDToken, liff.getContext,
  liff.getOS, liff.getAppLanguage, liff.getVersion, liff.getLineVersion,
  liff.isInClient, liff.isLoggedIn, liff.isApiAvailable, liff.getFriendship,
  liff.requestFriendship, liff.openWindow, liff.closeWindow, liff.sendMessages,
  liff.shareTargetPicker, liff.scanCode, liff.scanCodeV2,
  liff.permanentLink.createUrlBy, liff.permanentLink.createUrl,
  liff.permission.query, liff.permission.getGrantedAll, liff.permission.requestAll,
  liff.use, liff.i18n.setLang, liff.createShortcutOnHomeScreen, LiffError,
  the LIFF browser, LIFF-to-LIFF transition, LIFF URL, permanent link, the
  liff.state / liff.referrer query parameters, the chat_message.write scope,
  the LIFF Server API (POST/PUT/GET/DELETE /liff/v1/apps), or adding a LIFF app
  in the LINE Developers Console. Also use it for LINE MINI App work, since the
  MINI App runs on LIFF and uses the same `liff` SDK.
---

# LINE Front-end Framework (LIFF) Reference

API-reference-level coverage of the LINE Front-end Framework (LIFF), extracted
from the official LIFF documentation at `https://developers.line.biz/en/docs/liff/`
and the two LIFF API reference pages (`/en/reference/liff/` for the client SDK,
`/en/reference/liff-server/` for the Server API).

The content is split into topic-scoped reference files. **Read the reference
file that matches the task — do not guess method names, argument shapes, scope
names, or return-value fields.**

## When this skill applies

Any work on a LIFF app — a web app (HTML + JavaScript) that runs inside the LINE
app's LIFF browser or in an external browser, and talks to the LINE Platform
through the `liff` SDK. This includes:

- Integrating and initializing the SDK (`liff.init()`), CDN vs npm.
- Logging users in/out, reading the profile / ID token / access token.
- Sending messages on the user's behalf, the share target picker.
- 2D code / QR scanning, opening URLs, closing the LIFF app, permanent links.
- Registering a LIFF app (LINE Developers Console **or** the Server API).
- Building LIFF apps with the LIFF CLI / Create LIFF App.
- Writing LIFF plugins or using the pluggable SDK to shrink the bundle.

LINE MINI Apps also run on LIFF and use the same `liff` SDK, so this skill
applies to MINI App development too (MINI-App-specific features are noted where
they appear, e.g. `liff.permission.requestAll()`, `liff.createShortcutOnHomeScreen()`).

## Two SDKs, two version lines

| SDK | Package / path | Version line | Reference file |
|---|---|---|---|
| **LIFF client SDK** (`liff` object) | `@line/liff` (npm) or `https://static.line-scdn.net/liff/edge/2/sdk.js` (CDN) | LIFF **v2** (latest v2.29.0) | `references/liff-api-reference.md` |
| **LIFF Server API** (REST) | `https://api.line.me/liff/v1/apps` | API **v1** (independent of the SDK version) | `references/server-api.md` |

LIFF v1 reached end-of-life on October 1, 2021 — all v1 CDN paths are dead. Only
v2 is supported. The Server API stays at `v1` even though the SDK is at `v2`.

## Core mental model

1. A LIFF app is a normal web app. You add it to a **LINE Login channel** (or a
   LINE MINI App channel) in the LINE Developers Console, which issues a
   **LIFF ID** (`1234567890-AbcdEfgh`) and a **LIFF URL** (`https://liff.line.me/{liffId}`).
2. The web app embeds the LIFF SDK and calls `liff.init({ liffId })`. Every page
   load must call `liff.init()` — even same-app navigations.
3. In the **LIFF browser** (opened via the LIFF URL inside LINE), `liff.init()`
   logs the user in automatically. In an **external browser**, you must call
   `liff.login()` yourself (or pass `withLoginOnExternalBrowser: true`).
4. After init, the SDK holds the user's **access token** and **ID token**; most
   profile / messaging methods work.

## Reference file map

| File | Contents |
|---|---|
| `references/getting-started.md` | LIFF overview (LIFF browser, view sizes, action button, multi-tab view), creating a provider + channel, trying the LIFF starter app, the development workflow |
| `references/developing-liff-apps.md` | Building a LIFF app: SDK integration (CDN edge/fixed paths, npm), `liff.init()` and the four init rules, calling every LIFF API, OGP tags, close behavior, dev guidelines, LIFF browser vs external/in-app browser differences |
| `references/liff-api-reference.md` | The full `liff` client SDK reference: `LiffError`, SDK properties, and every method — initialization, environment, authentication, profile, window, message, camera, permanent link, plugin, i18n, others |
| `references/server-api.md` | The LIFF Server API (`POST`/`PUT`/`GET`/`DELETE` `/liff/v1/apps`): add/update/get-all/delete LIFF apps, request/response schemas, error codes |
| `references/opening-and-versioning.md` | Opening a LIFF app: LIFF URL, primary/secondary redirect URLs, the `liff.state`/`liff.referrer` query params, LIFF-to-LIFF transition, minimizing the LIFF browser, the LIFF versioning policy & life cycle |
| `references/tooling-and-plugins.md` | LIFF CLI (`liff-cli`), Create LIFF App, LIFF plugin authoring (the `install()` method, hooks), the pluggable SDK and the module list, LIFF Inspector & LIFF Mock |

## Quick index — `liff` client SDK methods

All async methods return a `Promise`; on rejection a `LiffError` (`{code, message, cause?}`)
is passed. Methods marked **pre-init** work before `liff.init()` resolves.

```
SDK properties
  liff.id                          LIFF ID string (null until init)
  liff.ready                       Promise that resolves on first init

Initialization
  liff.init(config, ok?, err?)     Initialize. config.liffId required;
                                   config.withLoginOnExternalBrowser optional

Getting environment
  liff.getOS()                     "ios" | "android" | "web"           pre-init
  liff.getAppLanguage()            LINE app language (RFC 5646)        pre-init  [v2.24.0+]
  liff.getLanguage()               navigator.language     DEPRECATED   pre-init
  liff.getVersion()                LIFF SDK version string             pre-init
  liff.getLineVersion()            LINE version string | null          pre-init
  liff.getContext()                {type, userId, viewType, scope, availability, ...}
  liff.isInClient()                true in LIFF browser                pre-init
  liff.isLoggedIn()                true if logged in
  liff.isApiAvailable(apiName)     true if feature usable here

Authentication
  liff.login(loginConfig?)         Log in (external / in-app browser only)
  liff.logout()                    Log out
  liff.getAccessToken()            access token string (valid 12 h)
  liff.getIDToken()                raw ID token (JWT) — needs openid scope
  liff.getDecodedIDToken()         decoded ID token payload — needs openid scope
  liff.permission.getGrantedAll()  → Promise<string[]> of granted scopes
  liff.permission.query(scope)     → Promise<{state}> granted|prompt|unavailable
  liff.permission.requestAll()     show verification screen (LINE MINI App only)

Profile
  liff.getProfile()                → {userId, displayName, pictureUrl?, statusMessage?}
  liff.getFriendship()             → {friendFlag} — needs profile scope
  liff.requestFriendship()         prompt user to add the LINE Official Account  [v2.28.0+]

Window
  liff.openWindow({url, external?})   open URL in in-app / external browser
  liff.closeWindow()               close the LIFF app                  pre-init [v2.4.0+]

Message  (LIFF browser only; chat_message.write scope)
  liff.sendMessages(messages)      send up to 5 messages to the current chat
  liff.shareTargetPicker(messages, options?)  pick targets and share; max 5 msgs

Camera  (turn on "Scan QR" in the console)
  liff.scanCodeV2()                → {value} from a 2D code reader
  liff.scanCode()                  → {value}              DEPRECATED, undefined on iOS

Permanent link
  liff.permanentLink.createUrlBy(url)        → Promise<string>
  liff.permanentLink.createUrl()             → string      may be deprecated
  liff.permanentLink.setExtraQueryParam(s)   add query params  may be deprecated

Plugin / i18n / others
  liff.use(module, option?)        activate a pluggable-SDK module or LIFF plugin  pre-init
  liff.i18n.setLang(language)      set LIFF SDK text language          pre-init
  liff.createShortcutOnHomeScreen({url})  add a home-screen shortcut (verified MINI App)  [v2.23.0+]
```

## Quick index — LIFF Server API

The Server API operates LIFF apps on a LINE Login channel. Auth is
`Authorization: Bearer {channel access token}` (short-lived or stateless token
of the **LINE Login channel**).

```
POST   https://api.line.me/liff/v1/apps            Add a LIFF app   → {liffId}
PUT    https://api.line.me/liff/v1/apps/{liffId}   Update LIFF app settings (partial)
GET    https://api.line.me/liff/v1/apps            Get all LIFF apps on the channel
DELETE https://api.line.me/liff/v1/apps/{liffId}   Delete a LIFF app
```

## Working rules

- **Always call `liff.init()` on every page load** (even SPA navigations). Other
  SDK methods are not guaranteed to work before init resolves, except the
  pre-init methods listed above.
- Run `liff.init()` **only at the endpoint URL or below it** — not at a higher
  path. v2.27.2+ logs a console warning when this rule is broken.
- Do **URL changes after** the `liff.init()` Promise resolves, never before.
- The primary redirect URL carries `access_token=xxx` — never send it to
  analytics. v2.11.0+ strips credentials from the URL once `liff.init()` resolves.
- `liff.getProfile()` / `liff.getDecodedIDToken()` give profile data for
  **display only** — never POST that to your server. Send the **ID token**
  (`liff.getIDToken()`) or **access token** (`liff.getAccessToken()`) instead and
  verify it server-side.
- `liff.sendMessages()` / `liff.shareTargetPicker()` work **only in the LIFF
  browser** and need the `chat_message.write` scope; they fail with `403` otherwise.
- The access token is valid 12 hours but may be revoked when the LIFF app closes.
- A channel can hold at most **30 LIFF apps**.
- The LIFF URL `https://liff.line.me/{liffId}` opens the LIFF browser inside LINE
  (universal links / app links). The **endpoint URL** opens LINE's in-app browser,
  where LIFF-specific features (messaging, share, scan, view size) are unavailable.
