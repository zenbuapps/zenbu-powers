# Opening a LIFF App, LIFF-to-LIFF, Minimizing & Versioning

Source:
- `https://developers.line.biz/en/docs/liff/opening-liff-app/`
- `https://developers.line.biz/en/docs/liff/minimizing-liff-browser/`
- `https://developers.line.biz/en/docs/liff/versioning-policy/`
- `https://developers.line.biz/en/docs/liff/release-notes/`

## Table of contents

- Opening a LIFF app: LIFF URL, primary/secondary redirect URLs
- LIFF-to-LIFF transition
- Minimizing the LIFF browser
- Versioning policy & SDK life cycle
- Release notes summary

---

# Opening a LIFF app

A LIFF app opens in a **LIFF browser** or an **external browser**.

## User actions when opening the LIFF app

1. The user accesses the **LIFF URL** (issued when adding the LIFF app to a
   channel). E.g. send the LIFF URL to a LINE chat and tap it.
2. If authorization is required, a **channel consent screen** appears; the user
   grants the required permissions.
3. The LIFF app opens.

## Which environment the LIFF app opens in

LIFF URLs are compatible with **universal links** (iOS) and **app links**
(Android), so opening a LIFF URL from outside LINE opens the LIFF browser inside
LINE. But depending on the OS, universal/app links may not fire even in Safari
or Chrome, and the LIFF browser may not open. Opening a LIFF URL inside a native
app other than LINE depends on that app's WebView specs. **The environment in
which a LIFF app opens is not guaranteed.**

## Behaviors from accessing the LIFF URL to opening the LIFF app

Two redirect destinations must be set up so the LIFF app opens correctly:

| Redirect to | Description |
|---|---|
| **Primary redirect URL** | The first URL the LIFF server redirects the user to. Run `liff.init()` when the user reaches this URL |
| **Secondary redirect URL** | When `liff.init()` runs, the user is redirected here; then the LIFF app page is displayed |

## Create a LIFF URL

The LIFF URL points to the LY Corporation LIFF server, issued by adding the LIFF
app to a channel. Example: `https://liff.line.me/1234567890-AbcdEfgh`.

**Supported LIFF URL formats:**
- `https://liff.line.me/{liffId}`
- `https://miniapp.line.me/{liffId}` (LINE MINI Apps only)

**Deprecated (LIFF v1) formats:** `https://line.me/R/app/{liffId}` and
`line://app/{liffId}`.

## Create a primary redirect URL

The primary redirect URL is always the **Endpoint URL** set in the LINE
Developers Console.

All additional information specified in the LIFF URL (e.g.
`path_A/?key1=value1#URL-fragment`) is included in the **`liff.state`** query
parameter:

```
https://example.com/2020campaign/?key=value&liff.state=urlencoded(path_A/?key1=value1#URL-fragment)
```

If the LIFF URL has no additional information, `liff.state` is omitted.

## Create a secondary redirect URL

The secondary redirect URL depends on the URL the user accesses; the paths and
query parameters specified in the **Endpoint URL** are included.

| URL the user accesses | Secondary redirect URL |
|---|---|
| LIFF URL `https://liff.line.me/{liffId}` | The Endpoint URL, e.g. `https://example.com/2020campaign/?key=value` |
| LIFF URL with additional info `https://liff.line.me/{liffId}/path_A/?key1=value1#URL-fragment` | Combination of: the Endpoint URL domain (`https://example.com`); the Endpoint URL path + query (`/2020campaign/?key=value`); the LIFF URL additional info (`/path_A/?key1=value1#URL-fragment`) → `https://example.com/2020campaign/path_A/?key=value&key1=value1#URL-fragment` |

---

# Opening a LIFF app from another LIFF app (LIFF-to-LIFF transition)

When a LIFF app is open in the LIFF browser, clicking a link to another LIFF app
displays it **without closing the LIFF browser**. The back button returns to the
original LIFF app.

## Conditions for a LIFF-to-LIFF transition

All required:
- LIFF SDK **v2.4.1 or later**.
- The **original** LIFF app screen is set to `Full`.
- The destination LIFF app is correctly initialized by `liff.init()`.

## Behavior based on screen size

- Original LIFF app `Tall` / `Compact` → the browser closes first, then the
  destination opens, regardless of the destination's size.
- Original LIFF app `Full` → the destination displays in `Full`, regardless of
  the destination's size specification.
- Original `Full` + destination `Tall` / `Compact` → the **action button is not
  displayed** in the destination LIFF app.

## The `chat_message.write` scope after a transition

| Transition destination URL | Example | `chat_message.write` after transition |
|---|---|---|
| LIFF URL | `https://liff.line.me/{liffId}` | **Enabled** |
| LIFF URL with additional info | `https://liff.line.me/{liffId}/path_A/?key1=value1#URL-fragment` | **Enabled** |
| Endpoint URL | `https://example.com` | **Disabled** |

When enabled, `liff.sendMessages()` is available in the destination LIFF app.

## Get URL from before a LIFF-to-LIFF transition

When a LIFF app opens during a LIFF-to-LIFF transition, the **`liff.referrer`**
query parameter is added to the post-transition URL. Its value is the
percent-encoded URL of the `Referer` request header received by the LIFF server
during the transition.

| | LIFF app URL before transition | URL of the link | LIFF app URL after transition (after `liff.init()`) |
|---|---|---|---|
| **Given** | `https://first.example.com/` | `https://liff.line.me/{LIFF ID}` (LIFF URL) | `https://second.example.com/?liff.referrer=https%3A%2F%2Ffirst.example.com%2F` |
| **Not given** | `https://first.example.com/` | `https://second.example.com/` (Endpoint URL) | `https://second.example.com/` |

`liff.referrer` is **not** added in LINE versions 12.13.0 to 13.19.x (a bug,
later fixed). If the endpoint URL is opened directly, `liff.referrer` is not given.

## Message displayed when another LIFF app is opened

When you open a LIFF app with a **different LIFF ID** than the first one, a
message "Switched to the {LIFF app name} app." may appear. Whether it appears is
unrelated to the success of the LIFF-to-LIFF transition.

---

# Minimizing the LIFF browser

LIFF browser minimization lets the user suspend the LIFF browser to do something
else (e.g. send a message in the chat room), then maximize it to resume. The
minimized LIFF browser is displayed as an icon.

## Conditions of use — all required

- LINE for iOS **12.18.0+** or LINE for Android **15.0.0+**.
- **Settings > Apps > LINE > Display over other apps** is on (LINE for Android only).
- `Full` is the screen size.
- The `chat_message.write` scope is **off** for the LIFF app.
- The LIFF browser isn't overlapping another modal.

After a LIFF-to-LIFF transition, the **post-transition** LIFF app must meet these
conditions — if the destination specifies `Tall` / `Compact`, it won't qualify.

## Minimizing

Three ways: tapping **Minimize browser** from the action button's dropdown menu;
tapping an in-app alert; swiping the LIFF browser down. (In LINE earlier than
26.7.0, **Minimize browser** is in the multi-tab view, not a dropdown.)

## Maximizing / moving / closing

- **Maximize:** tap the minimized LIFF browser.
- **Move:** drag the minimized LIFF browser.
- **Close (LINE earlier than 15.20.0):** swipe it off the screen (iOS only), or
  drag it to the close icon at the bottom.
- **Close (LINE 15.20.0+):** tap the close button at the top-right corner.

## Priority of the LIFF browser icon

1. **Channel icon** — the LINE Login channel's icon.
2. **Favicon** — the LIFF app's favicon.
3. **Common icon** — a link icon.

---

# Versioning policy

## LIFF MAJOR version status

| LIFF version (release date) | Status (period) | Availability |
|---|---|---|
| **LIFF v1** (June 6, 2018) | End-of-life (October 1, 2021) | ❌ All CDN paths disabled; LIFF apps can't open |
| **LIFF v2** (October 16, 2019) | Active (~ release of LIFF v3) | ✅ The current version; new features added frequently |
| **LIFF v3** (TBD) | — | — |

## Versioning policy (SemVer)

Since LIFF v2.2.0, the version follows **Semantic Versioning**: `MAJOR.MINOR.PATCH`.

| Version part | Increments when |
|---|---|
| MAJOR | Backwards-incompatible changes to the public API |
| MINOR | New, backwards-compatible functionality |
| PATCH | Backwards-compatible bug fixes |

## LIFF SDK (sdk.js) update policy — CDN paths

Since LIFF v2.1.13, two CDN path types:

| CDN path | Description |
|---|---|
| **CDN edge path** | Contains only the MAJOR version — always the latest. e.g. `https://static.line-scdn.net/liff/edge/2/sdk.js` |
| **CDN fixed path** | Contains up to the PATCH version — stays fixed. e.g. `https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js` |

```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"></script>
```

A **backwards-compatibility CDN path** is also provided —
`https://static.line-scdn.net/liff/edge/2.1/sdk.js` — same version as the CDN
edge path. It may be discontinued regardless of the life-cycle schedule;
migrating to the CDN edge path is recommended.

## LIFF SDK life cycle

Defined per MAJOR version. A new MAJOR release starts "Active"; when the next
MAJOR ships, the current one moves Active → Maintaining → Deprecated → End-of-life.

| Status | Availability | Support period |
|---|---|---|
| Active | ✅ Current version; features added/improved | From this MAJOR's release to the next MAJOR's release |
| Maintaining | ✅ Bug fixes and security improvements only | 12 months after the Active period |
| Deprecated | ✅ No longer updated | 6 months after the Maintaining period |
| End-of-life | ❌ All CDN paths invalid without notice; the LIFF app is unusable | — |

### Life cycle schedule

| LIFF version | Active | Maintenance | Deprecation | End-of-life |
|---|---|---|---|---|
| LIFF v1 (June 6, 2018) | ~ Oct 15, 2019 | ~ Apr 1, 2021 | ~ Sep 30, 2021 | Oct 1, 2021 |
| LIFF v2 (October 16, 2019) | ~ release of LIFF v3 | ~ TBD | ~ TBD | TBD |
| LIFF v3 (TBD) | — | — | — | — |

Updating the LIFF SDK can discontinue the SDK integrated in a LIFF app — a LIFF
app using a discontinued SDK can't open. Check the release notes regularly.

---

# Release notes (summary)

LIFF follows SemVer from v2.2.0. The **current version is LIFF v2.29.0**
(May 13, 2026). Use the CDN edge path (`.../liff/edge/2/sdk.js`) for the latest;
use a CDN fixed path (`.../liff/edge/versions/2.29.0/sdk.js`) to pin a version.

**Updating:** with the CDN edge path you update automatically. With npm, run
`npm install @line/liff@2.29.0` or `yarn add @line/liff@2.29.0`.

Recent notable changes:

| Version | Date | Change |
|---|---|---|
| v2.29.0 | 2026-05-13 | Internal behavior changes only; no feature change |
| v2.28.0 | 2026-03-24 | Added `liff.requestFriendship()` — prompts the user to add the LINE Official Account as a friend |
| v2.27.3 | 2025-11-17 | Internal behavior changes only |
| v2.27.2 | 2025-09-08 | A console warning now appears if `liff.init()` runs on a URL not starting with the endpoint URL |
| v2.27.1 / v2.27.0 | 2025 | Internal / minor changes |
| v2.24.0 | 2024-07-23 | Added `liff.getAppLanguage()`; `liff.getLanguage()` deprecated |
| v2.23.0 | — | Added `liff.createShortcutOnHomeScreen()` |
| v2.22.0 | — | Added the pluggable SDK (npm only) |
| v2.19.0 | — | Added LIFF plugin support |
| v2.16.1 | 2021-10-26 | Fixed a webpack v5 build error (v2.16.0 and earlier still affected) |
| v2.11.0 | — | Credential info excluded from URLs when `liff.init()` resolves |
| v2.4.0 | — | `liff.closeWindow()` usable before `liff.init()` finishes |
