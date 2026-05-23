# Developing a LIFF App

Source:
- `https://developers.line.biz/en/docs/liff/developing-liff-apps/`
- `https://developers.line.biz/en/docs/liff/registering-liff-apps/`
- `https://developers.line.biz/en/docs/liff/using-user-profile/`
- `https://developers.line.biz/en/docs/liff/development-guidelines/`
- `https://developers.line.biz/en/docs/liff/differences-between-liff-browser-and-external-browser/`
- `https://developers.line.biz/en/docs/liff/differences-between-liff-browser-and-line-in-app-browser/`

## Table of contents

- Setting the app title
- Integrating the LIFF SDK (CDN paths, npm)
- Initializing the LIFF app and the 4 init rules
- Calling the LIFF API (overview of each method, see `liff-api-reference.md` for full signatures)
- Using user data in LIFF apps and servers
- OGP tags, external sites, close behavior
- Adding a LIFF app to your channel (LINE Developers Console)
- Development guidelines
- LIFF browser vs external browser vs LINE's in-app browser

---

# Setting the title of the LIFF app

The LIFF app title appears in the LIFF app header. Set it via the `<title>`
element of the HTML.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The title</title>
```

# Integrating the LIFF SDK with the LIFF app

Embed the LIFF SDK either by **CDN path** or the **npm package**.

## Specify the CDN path

Set the LIFF SDK URL in the `src` of a `<script>` element. Two CDN path types:

| CDN path | Description |
|---|---|
| **CDN edge path** | Contains only the MAJOR version. Always up to date with the latest LIFF features; update the URL only on a new MAJOR release. e.g. `https://static.line-scdn.net/liff/edge/2/sdk.js` |
| **CDN fixed path** | Contains up to the PATCH version. Stays on the specified version; you decide when to update. e.g. `https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js` |

```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"></script>
```

The LIFF SDK is written in UTF-8 — if the HTML uses a different encoding, also
set `charset="utf-8"` on the `<script>`.

## Use the npm package

```bash
$ npm install --save @line/liff
# or
$ yarn add @line/liff
```

```js
import liff from "@line/liff";

liff.init({
  liffId: "1234567890-AbcdEfgh", // Use own liffId
});
```

TypeScript type definitions ship inside `@line/liff`. npm page:
`https://www.npmjs.com/package/@line/liff`.

- **Don't declare or modify `window.liff`** — the global LIFF instance. Doing so
  can break the LINE app.
- The npm version of LIFF **v2.16.0 or earlier** causes a build error with
  webpack v5 (webpack v5 removed Node.js polyfills). Use a newer LIFF version.
- The **pluggable SDK** (npm-only, v2.22.0+) reduces the SDK file size — see
  `tooling-and-plugins.md`.

# Initializing the LIFF app

`liff.init()` initializes the LIFF app and enables the other SDK methods. **LIFF
apps must be initialized each time a page is opened** — even on same-app
navigations.

```javascript
liff
  .init({
    liffId: "1234567890-AbcdEfgh", // Use own liffId
  })
  .then(() => {
    // start to use LIFF's api
  })
  .catch((err) => {
    console.log(err);
  });
```

`liff.ready` is a `Promise` that resolves the first time `liff.init()` runs.

**Auto-login in external browsers:** pass `withLoginOnExternalBrowser: true` so
`liff.login()` runs automatically when the app initializes in an external browser.

```js
liff
  .init({
    liffId: "1234567890-AbcdEfgh",
    withLoginOnExternalBrowser: true,
  })
  .then(() => { /* ... */ });
```

## Query parameters added by the SDK

When you access a LIFF URL or do a LIFF-to-LIFF transition, the SDK may add:

- `liff.state` — additional information specified in the LIFF URL.
- `liff.referrer` — the URL before a LIFF-to-LIFF transition.
- `lineAppVersion` — may be included when opened in LINE for Android.

**Don't modify these query params** until `liff.init()` resolves; design the app
so SDK-added query params aren't altered.

## The four important init rules

### 1. Execute `liff.init()` at the endpoint URL or at a lower level

`liff.init()` only works on URLs equal to the endpoint URL or below it. With
endpoint URL `https://example.com/path1/`:

| URL to execute `liff.init()` | Guaranteed |
|---|---|
| `https://example.com/` | ❌ |
| `https://example.com/path1/` | ✅ |
| `https://example.com/path1/language/` | ✅ |
| `https://example.com/path2/` | ❌ |

LIFF **v2.27.2+** logs a console warning when init runs on a non-guaranteed URL:

```
liff.init() was called with a current URL that is not related to the endpoint URL.
https://example.com/path1/ is not under https://example.com/path1/path2/
```

If you see this, change the endpoint URL to `https://example.com/` or a path
that the init URL falls under.

### 2. Execute `liff.init()` once for the primary redirect URL and once for the secondary

If the endpoint URL has a query parameter or path, run `liff.init()` once for
the **primary redirect URL** and once for the **secondary redirect URL** (see
`opening-and-versioning.md` → "Behaviors from accessing the LIFF URL").

### 3. Process URL changes after `liff.init()` completes

Run URL-changing operations **after** the `liff.init()` `Promise` resolves.

```javascript
liff
  .init({ liffId: "1234567890-AbcdEfgh" })
  .then(() => {
    window.location.replace(location.href + "/entry/");
  });
```

These operations before the `Promise` resolves can break the LIFF app:
- Changing the URL via `Document.location` / `Window.location`.
- `history.pushState()` / `history.replaceState()`.
- Server-side `301` / `302` redirects.

### 4. Use caution with the primary redirect URL

The `access_token=xxx` added to the primary redirect URL is confidential. Don't
send the primary redirect URL to logging tools (e.g. Google Analytics). In LIFF
**v2.11.0+** credentials are stripped from the URL once `liff.init()` resolves —
send page views in the `then()`:

```javascript
liff
  .init({ liffId: "1234567890-AbcdEfgh" })
  .then(() => {
    ga("send", "pageview");
  });
```

## Using LINE Login in an external browser

To use LINE Login in an external browser, call `liff.init()` **twice**:

1. Call `liff.init()` after loading the SDK.
2. Call `liff.login()`. After the auth page + authorization screen, the user is
   redirected to the LIFF app (`redirectUri`). Call `liff.init()` again.

If an error occurs in `liff.init()`, or the user cancels authorization,
`errorCallback` runs. Authorization requests **within** the LIFF browser are not
guaranteed — always use `liff.login()`, not raw LINE Login authorization
requests, when opening from an external / in-app browser.

# Calling the LIFF API

After SDK integration + initialization you can call the LIFF API. Each call is
summarized below; for full signatures, arguments, return values, see
`liff-api-reference.md`.

```javascript
// Environment
console.log(liff.getAppLanguage());
console.log(liff.getVersion());
console.log(liff.isInClient());
console.log(liff.isLoggedIn());
console.log(liff.getOS());
console.log(liff.getLineVersion());
```

```javascript
// Login / logout (external or in-app browser only)
if (!liff.isLoggedIn()) { liff.login(); }
if (liff.isLoggedIn()) { liff.logout(); window.location.reload(); }
```

```javascript
// Open a URL in an external browser
liff.openWindow({ url: "https://line.me", external: true });
```

```javascript
// 2D code reader
liff.scanCodeV2()
  .then((result) => { /* result = { value: 'Hello LIFF app!' } */ })
  .catch((err) => { console.log(err); });
```

```javascript
// Screen type the LIFF app was launched from
const context = liff.getContext();
console.log(context);
```

```javascript
// Send messages to the current chat room (max 5)
liff
  .sendMessages([{ type: "text", text: "Hello, World!" }])
  .then(() => console.log("message sent"))
  .catch((err) => console.log("error", err));
```

```javascript
// Share target picker — confirm availability first
if (liff.isApiAvailable("shareTargetPicker")) {
  liff.shareTargetPicker([{ type: "text", text: "Hello, World!" }]);
}
```

```javascript
// Close the LIFF app
if (!liff.isInClient()) {
  window.alert("This button is unavailable in an external browser.");
} else {
  liff.closeWindow();
}
```

```javascript
// Friendship status with the linked LINE Official Account
liff.getFriendship().then((data) => {
  if (data.friendFlag) { /* ... */ }
});
```

```javascript
// Prompt the user to add the LINE Official Account as a friend
try { await liff.requestFriendship(); } catch (error) { console.log(error); }
```

```javascript
// Permanent link of any page in the LIFF app
liff.permanentLink
  .createUrlBy("https://example.com/path1?q1=v1")
  .then((permanentLink) => console.log(permanentLink));
```

## Enabling the share target picker

To use the share target picker, the developer must consent to "Agreement
Regarding Use of Information" **per channel**:

1. In the LINE Developers Console, select the LINE Login channel.
2. On the **LIFF** tab, click **shareTargetPicker**.
3. Read the agreement, check **I have read and agree...**, click **Enable**.

# Using user data in LIFF apps and servers

When a user launches the LIFF app in a LIFF browser, or in an external browser
after logging in via `liff.init()`, the LIFF app can get the user's profile
(user ID, display name, profile image, email). Mishandling this data exposes the
app to spoofing attacks.

## Use user data on the server

Send the **ID token** or **access token** from the LIFF app to the server; the
server verifies the token with the LINE Platform and safely retrieves the profile.

- **ID token:** send `liff.getIDToken()` output; server verifies it via
  `POST /oauth2/v2.1/verify` (LINE Login API).
- **Access token:** send `liff.getAccessToken()` output; server verifies it via
  `GET /oauth2/v2.1/verify` (checks channel ID + validity), then gets the profile
  via `GET /v2/profile`. The access token is revoked when the LIFF app closes,
  even if not yet expired.

The LIFF SDK verifies ID tokens and access tokens obtained from the LINE
Platform — you can trust `liff.getIDToken()` and `liff.getAccessToken()`.

## Use user data in the LIFF app

Use the profile from `liff.getDecodedIDToken()` or `liff.getProfile()` for
**display only**.

**Never send** the user profile details from `liff.getDecodedIDToken()` or
`liff.getProfile()` to your server — send the ID token / access token instead.

# Setting the OGP tags

Set OGP tags per page so a custom title / description / thumbnail appears when
sharing the LIFF app URL (`https://liff.line.me/{liffId}`) in a LINE chat room.

```html
<html lang="ja" prefix="og: http://ogp.me/ns#">
<meta property="og:title" content="The title">
<meta property="og:type" content="`website`, `blog`, or `article`">
<meta property="og:description" content="A one to two sentence description">
<meta property="og:url" content="The URL">
<meta property="og:site_name" content="The name that represents the overall site">
<meta property="og:image" content="An image URL">
```

When sharing the URL in the deprecated `line://app/{liffId}` format, the OGP tag
is ignored.

# Opening an external site that isn't a LIFF app

When a LIFF app (in the LIFF browser) opens an external non-LIFF site in the
**same window**, a "This is an external page" popup appears. It doesn't appear if
the site opens in a different window. Transitioning above the endpoint URL (e.g.
to `https://example.com/` when the endpoint is `https://example.com/path`) is not
guaranteed to behave correctly.

# Behavior when closing the LIFF app

When a LIFF app opened in the LIFF browser is closed by the user or via
`liff.closeWindow()`, behavior depends on the LINE version:

**LINE 15.12.0 or later** — depends on whether the app meets the "recently used
services" conditions (see `getting-started.md` → Multi-tab view):

| Condition | Effect |
|---|---|
| Conditions met | Restartable within 12 hours; access token, history, scroll position retained |
| Conditions not met | The LIFF app exits; the access token expires when closed |

**LINE earlier than 15.12.0** — the LIFF app exits when closed; the access token
expires.

---

# Adding a LIFF app to your channel

Adding a LIFF app to a **LINE Login** channel in the LINE Developers Console lets
it run in LINE or in an external browser. You can add **up to 30 LIFF apps per
channel**.

**Steps:** Console → select the LINE Login channel → **LIFF** tab → **Add** →
fill the fields → **Add**.

## Basic information

| Item | Description |
|---|---|
| **LIFF app name** | Name of the LIFF app. Can't include "LINE" or similar / inappropriate strings. Shown in the LIFF-to-LIFF "Switched to" message and the multi-tab view |
| **Size** | View size: `Compact`, `Tall`, or `Full` |
| **Endpoint URL** | URL of the LIFF web app (e.g. `https://example.com`). Used when launched via the LIFF URL. Scheme **must be https**; URL fragments (`#...`) not allowed. Shown (domain only) in the LIFF browser header |
| **Scopes** | Scopes required by some SDK methods (see below). Shown on the permission consent screen |
| **Add friend option** | `On (normal)` / `On (aggressive)` / `Off` — controls whether the consent screen offers adding the linked LINE Official Account as a friend. LINE Login channels only |

### Scopes

| Scope | Required to use |
|---|---|
| `openid` | `liff.getIDToken()`, `liff.getDecodedIDToken()` |
| `email` | Getting the user's email via `liff.getIDToken()` / `liff.getDecodedIDToken()`. Shown only if you applied for OpenID Connect email permission |
| `profile` | `liff.getProfile()`, `liff.getFriendship()` |
| `chat_message.write` | `liff.sendMessages()`. May be under **View all** depending on account type. May be disabled after a LIFF-to-LIFF transition |

## Options

| Item | Description |
|---|---|
| **Scan QR** | Enable to use `liff.scanCodeV2()` in LIFF apps on this channel |
| **Module mode** | Enable to use the LIFF app in module mode — hides the header action button. Shown only when view size is `Full` |

## Generated values

| Item | Description |
|---|---|
| **LIFF ID** | LIFF app ID, e.g. `1234567890-AbcdEfgh` |
| **LIFF URL** | URL to access the LIFF app, e.g. `https://liff.line.me/1234567890-AbcdEfgh`. Users hitting the LIFF URL are redirected through the LY Corporation LIFF server to the developer's endpoint URL |

## Order on the LIFF tab

LIFF apps added on/after May 23, 2023 are shown newest-first; apps added before
that date appear in no particular order. You can also **edit** and **delete**
LIFF apps from the **LIFF** tab.

---

# LIFF app development guidelines

- **Securely handle user data.** See "Using user data" above. LIFF endpoint URLs
  and the URL fragment of LIFF URLs contain sensitive data (access tokens, user
  IDs) — guard against leakage.
- **Initialization cautions** — see the four init rules above.
- **Development rules:**
  - To build a LIFF app as an SPA, use the **History API**. LIFF has limited
    compatibility with fragment-based routing.
  - APIs using device/OS functions (location, camera, microphone) must be
    triggered by a **user action**.
  - Don't track users with cookies / localStorage / sessionStorage, or link LINE
    user data with external session info, without the user's consent.
  - During the test phase, limit access privileges to the LIFF app.
  - The URL scheme of the LIFF app and any content opened in it **must be https**.
    If `http`, the content displays in LINE's in-app browser and does not function
    as a LIFF app.
  - You may use cookies / localStorage / sessionStorage, but OS changes may
    restrict them in the future.
- **No mass requests.** Don't access the LIFF scheme or hit the LIFF API in bulk
  for load testing — prepare a test environment that doesn't flood the LINE
  Platform. Exceeding the rate limit returns `429 Too Many Requests`.
- **Deauthorize on unregister.** When a user unregisters from your app, call the
  LINE Login "Deauthorize" endpoint on the user's behalf, and document (near the
  function or in the terms) that unsubscribing notifies LY Corporation and ends
  the link.

LIFF uses the LINE Login system — also follow the LINE Login development
guidelines.

---

# LIFF browser vs external browser vs LINE's in-app browser

## LIFF browser vs external browser — unsupported web technologies

The LIFF browser doesn't support some web technologies that external browsers do:

| Web technology | Description |
|---|---|
| `theme-color` meta tag | Specifying the UI color |
| `download` attribute | Using a hyperlink to download a resource |
| Add to home screen (A2HS) | Adding a web app to the device home screen. In LINE MINI App, use **Add to Home** or `liff.createShortcutOnHomeScreen()` instead |
| Service Workers | Offline support, background sync, push notifications |

Support for other technologies follows `WKWebView` / `Android WebView`.

## LIFF browser vs LINE's in-app browser

Opening a LIFF app inside LINE uses one of two browsers:

- **LIFF browser** — dedicated to LIFF apps. Opens when you tap the **LIFF URL**
  in a LINE chat room, or tap a LIFF URL in an external browser.
- **LINE's in-app browser** — opens when you tap the **endpoint URL** in a LINE
  chat room. In LIFF, the in-app browser is treated as a type of external
  browser — `liff.getContext()` returns `type: "external"` there.

**Identify the browser:** by UI (the LIFF browser has the action button, no
footer, no minimize button; the in-app browser has a footer and a minimize
button, no action button) or via `liff.isInClient()` (`true` = LIFF browser).

**Feature differences:**

| Feature | LIFF browser | LINE's in-app browser |
|---|---|---|
| Specifying the view size | ✅ | ❌ |
| Action button | ✅ | ❌ |
| Multi-tab view | ✅ | ❌ |
| 2D code reader | ✅ | ❌ |
| Sending messages to the chat room | ✅ | ❌ |
| Share target picker | ✅ | ❌ |
| Popup when navigating to a non-LIFF external site | ✅ | ❌ |
| LIFF-to-LIFF transition | ✅ | ❌ |
