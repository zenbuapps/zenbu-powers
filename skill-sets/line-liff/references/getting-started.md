# Getting Started with LIFF

Source:
- `https://developers.line.biz/en/docs/liff/overview/`
- `https://developers.line.biz/en/docs/liff/getting-started/`
- `https://developers.line.biz/en/docs/liff/trying-liff-app/`

## Table of contents

- What LIFF is, the LIFF browser, view sizes, the action button, multi-tab view
- Creating a provider and a channel
- Trying the LIFF starter app
- Development workflow

---

# LIFF overview

LINE Front-end Framework (LIFF) is a platform for web apps provided by LY
Corporation. The web apps running on this platform are called **LIFF apps**. A
LIFF app can get data from the LINE Platform (such as the LINE user ID) and use
it to provide features that utilize user data and send messages on the user's
behalf.

- **LIFF Playground** (`https://liff-playground.netlify.app/`) lets you try LIFF
  features on the web; source at `github.com/line/liff-playground`.
- LIFF apps are **not officially supported in OpenChat** — some functions (e.g.
  retrieving a user's profile) don't work there.

## Recommended operating environment

**In a LIFF browser:** latest iOS / Android / LINE. iOS uses `WKWebView`,
Android uses `Android WebView`; the LIFF browser's behavior follows those.

**In an external browser:** latest Microsoft Edge, Google Chrome, Firefox, Safari.

Which functions are usable depends on whether the app runs in a LIFF browser or
an external browser (e.g. `liff.scanCode()` can't be used in an external browser).

## LIFF browser

The **LIFF browser** is a browser specifically for LIFF apps. When a user opens a
LIFF URL inside LINE, the LIFF app opens in a LIFF browser. Because it runs
within LINE, the LIFF app can access user data without prompting for login, and
gets LINE-specific features (sharing, sending messages to friends).

**Specifications:** uses `WKWebView` (iOS) / `Android WebView` (Android). It
doesn't support some web technologies that external browsers do (see
`developing-liff-apps.md` → "LIFF browser vs external browser").

**Cache:** `WKWebView` / `Android WebView` may cache content per HTTP headers
such as `Cache-Control`. There is **no way to explicitly delete** LIFF browser
cache — control caching via HTTP headers.

## Size of the LIFF browser (view size)

The LIFF browser can be displayed in three sizes. Set the view size when adding
the LIFF app to your channel.

| View size | Notes |
|---|---|
| `Compact` | Small |
| `Tall` | Medium |
| `Full` | Full screen. Required for share target picker, 2D code reader, LIFF-to-LIFF transition, browser minimization, "recently used services" |

## Action button

A LIFF app with view size `Full` shows an **action button** in the header by
default. Enable **Module mode** in the console to hide it. Tapping the action
button shows different features by LINE version:

| LINE app version | Available feature |
|---|---|
| 26.7.0 or later | Dropdown menu |
| 15.12.0 or later, earlier than 26.7.0 | Multi-tab view |
| Earlier than 15.12.0 | Options |

### Dropdown menu (LINE 26.7.0+)

| Item | Description |
|---|---|
| **All tabs** | Displays the multi-tab view |
| **Refresh** | Reloads the current page |
| **Minimize browser** | Minimizes the LIFF browser |
| **Share** | Shares the permanent link of the current page via a LINE message |
| **Permission settings** | View-only camera/microphone permissions screen (LINE 14.6.0+) |

Permanent link sharing fails if the current page URL doesn't start with the
**Endpoint URL**.

## Multi-tab view

The Multi-tab view shows recently used services — LIFF apps the user opened, most
recent first, up to 50 items. When the user closes/opens a LIFF app, a screenshot
is stored as usage history; tapping it reopens the app.

**Resume vs reload when reopened from usage history:**

| Behavior | Conditions | Effect |
|---|---|---|
| Resume | Used within the last 12 hours AND among the 10 most recent items | Resumes from where the user left off; access token, history, scroll position retained |
| Reload | Conditions for resuming not met | Re-initialized at the last URL; access token, history, scroll position discarded |

**Conditions for appearing in "recently used services"** — all required:
- LINE app version 15.12.0 or later
- `Full` is the view size
- The LIFF app's module mode is off

LIFF apps are listed by **LIFF ID** in recently used services. `liff.sendMessages()`
**can't be used after a LIFF app is reloaded** from recently used services — it
throws an error. To use it again, reopen the app via its LIFF URL in a chat room.

## Tools to support LIFF app development

| Tool | What it does |
|---|---|
| LIFF starter app | A minimal template (vanilla JS / Next.js / Nuxt). Good for getting something working fast. `github.com/line/line-liff-v2-starter` |
| Create LIFF App | CLI that scaffolds a LIFF dev environment in one command. `@line/create-liff-app` |
| LIFF CLI | CLI to create/update/list/delete LIFF apps, scaffold, debug with LIFF Inspector, serve over HTTPS. `@line/liff-cli` |
| LIFF Playground | Try LIFF features online. `liff-playground.netlify.app` |

## Workflow

1. Create a channel to add your LIFF app to.
2. Try the LIFF starter app, **or** develop a LIFF app.
3. Add the LIFF app to your channel.
4. Open the LIFF app.

---

# Create a channel

To develop a LIFF app you must first create a **provider** and a **channel** in
the [LINE Developers Console](https://developers.line.biz/console/).

## Create a provider

A **provider** is an individual, company, or organization providing services
through the LINE Platform. From the Console home, click **Create a new provider**
(or **Create** in the **Providers** section if you already have one), enter a
**Provider name**, and click **Create**.

## Create a channel

A **channel** is a communication path between the LINE Platform and a provider's
services. LIFF apps can be added to two channel types:

| Channel type | When to use |
|---|---|
| **LINE Login** | To create a LIFF app, try the LIFF starter app, or use Create LIFF App |
| **LINE MINI App** | To create a LIFF app as a LINE MINI App |

LY Corporation recommends creating new LIFF apps as **LINE MINI Apps** — LIFF and
the LINE MINI App will be integrated into a single brand.

**You cannot add LIFF apps** to **Messaging API** or **Blockchain Service**
channels. (Previously possible, but new LIFF features are no longer available for
LIFF apps already on those channel types.)

**Channel App type:** when developing a LIFF app, select **Web app** in App types.
**Channel name** can't contain "LINE" or a similar string.

### Provider / channel linkage cautions

- Once created, a channel **cannot be moved to another provider**.
- When linking a LINE Login channel with a Messaging API channel, create both in
  the **same provider**.
- A LINE user gets a **different user ID per provider** — user IDs can't identify
  the same user across providers.

---

# Trying the LIFF starter app

The **LIFF starter app** (`github.com/line/line-liff-v2-starter`) is a template
with the minimum features required for LIFF app development. It provides
implementations in vanilla JavaScript, Next.js (`src/nextjs`), and Nuxt
(`src/nuxtjs`). The steps below use vanilla JavaScript.

## Environment (tested versions)

| Name | Version |
|---|---|
| Node.js | 16.13.1 |
| Yarn | 1.22.17 |
| Netlify CLI | 9.16.3 |

## Download and run the source code

```bash
$ git clone https://github.com/line/line-liff-v2-starter.git
$ cd line-liff-v2-starter/src/vanilla
$ yarn install
$ yarn dev
```

When `compiled successfully` appears, the app runs on the local server (e.g.
`http://localhost:3000` for vanilla JS). Stop with Ctrl+C / Command+C.

## Deploy to a server (Netlify)

A Netlify account is required (the free plan works).

```bash
$ npm install -g netlify-cli
$ netlify login                  # opens the Netlify login screen; click Authorize
$ yarn build                     # run in src/vanilla — builds via webpack into src/vanilla/dist
$ cd ../../                      # go to the repo root (line-liff-v2-starter)
$ netlify deploy                 # deploy in DRAFT state
# choose "Create & configure a new site", pick a team, enter a unique site name
$ netlify deploy --prod          # deploy to production
```

## Get and set a LIFF ID

A LIFF ID is required for the app to open as a LIFF app in the LIFF browser.
Read "Create a channel" and "Adding a LIFF app to your channel" to get the LIFF
ID. When adding the LIFF app, set **Endpoint URL** to the production `Website URL`
from the deploy step.

Set the LIFF ID as the server-side env var `LIFF_ID`:

```bash
$ netlify env:set LIFF_ID "Your LIFF ID"
$ netlify build
$ netlify deploy --prod          # Netlify applies env vars at deploy time
```

To set `LIFF_ID` on the local server: `LIFF_ID="Your LIFF ID" yarn dev`.

Once set, send the LIFF URL (shown in the channel's **LIFF** tab) to a LINE chat
room and tap it to open the LIFF app in the LIFF browser. If you open the LIFF
app without setting `LIFF_ID`, `liff.init()` fails but the app's appearance is
unchanged.
