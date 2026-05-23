# Overview, Built-in Features & the LINE Developers Console

Source:
- `https://developers.line.biz/en/docs/line-mini-app/` (landing)
- `https://developers.line.biz/en/docs/line-mini-app/quickstart/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/introduction/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/console-guide/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/specifications/` (supported-versions cross-ref; specs detail in `develop.md`)
- `https://developers.line.biz/en/docs/line-mini-app/discover/builtin-features/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/custom-features/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/ui-components/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/native-mini/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/develop-overview/` (channel creation)
- `https://developers.line.biz/en/docs/line-mini-app/develop/configure-console/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/web-to-mini-app/`

## Table of contents

- What a LINE MINI App is
- Unverified vs verified MINI Apps
- UI components (header / body)
- Built-in features (action button, dropdown menu, multi-tab view, channel consent simplification)
- Custom features matrix
- Ways users access a LINE MINI App
- Creating a LINE MINI App channel
- The three internal channels
- LINE Developers Console guide (LIFF ID, endpoint URL, token, settings reflection)
- Console-setting → user-facing-screen mapping
- LINE MINI App vs native apps
- Migrating a web app to a LINE MINI App

---

## What a LINE MINI App is

A LINE MINI App is a web application that runs on LINE; users use services
without installing a separate native app. "LINE MINI App" is the official name.
It is a web view, so most HTML5 specs are usable.

A LINE MINI App is a [LIFF](https://developers.line.biz/en/docs/liff/overview/)
app — "developing a LINE MINI App" means "using LIFF with the additional
requirements and restrictions described in the LINE MINI App docs". The minimum
LIFF SDK version is **v2.1**; all LIFF v2.1.x APIs are usable.

Two API types are available beyond LIFF: the **LIFF API** (called from the LINE
MINI App / client) and the **Service Message API** (called from your server).
In-app purchase adds a third (client + server). The Channel consent
simplification feature needs LIFF SDK v2.13.x+; Quick-fill needs v2.19.0+; IAP
needs v2.26.0+.

LY Corporation provides **LINE MINI App Playground** (`https://miniapp.line.me/lineminiapp_playground`)
to try features. LIFF and LINE MINI App will be integrated into a single brand
in the future — LY recommends creating any new LIFF app as a LINE MINI App.

### Features available on LIFF apps but NOT on LINE MINI Apps

| Item | Description |
|---|---|
| Hiding the action button (Module mode) | The action button cannot be hidden; **Module mode** cannot be set for LIFF apps added to a LINE MINI App channel. |
| Adding multiple LIFF apps to one channel | A LINE MINI App channel holds one web app per internal channel; you cannot add multiple. |

## Unverified vs verified MINI Apps

| | Unverified MINI App | Verified MINI App |
|---|---|---|
| State | Default after channel creation; not yet passed verification review | Passed LY Corporation's verification review |
| Badge | None | Verified badge in the header / consent screens |
| Service messages | Test only (Developing/Review internal channels) | Available |
| Custom Path | No | Yes |
| Home-screen shortcut | Test only | Yes |
| Common Profile Quick-fill | Test only | Yes (also requires applying) |
| Channel consent simplification | Test only | Yes |
| Inducing OA friend-add | Yes | Yes |
| Custom action button | Yes | Yes |
| Payment systems | Yes | Yes |
| Place ads | Yes | Yes |

Anyone can create an unverified MINI App. To become verified, submit for review
(see `submit-service-and-demos.md`). For Taiwan or Thailand, only LINE MINI App
channels under a **certified provider** can apply for the verification review.

## UI components

A LINE MINI App page is **(A) Header** + **(B) Body**.

### Header (LINE-generated, platform-native, not customizable)

| # | Component | Description |
|---|---|---|
| 1 | Service Name | The page's `<title>` element. Font not settable. |
| – | Subtext | Unverified: the page's domain. Verified: LINE MINI App name + verified badge. |
| 2 | Action button | Tapping shows features depending on LINE version (see below). |
| 3 | Minimize / Close button | Verified MINI App on LINE for iOS 14.15.1–26.6.x or Android 15.0.0–26.6.x shows the **minimize** button; otherwise the **close** button. Unverified MINI Apps always show close. |
| 4 | Return button | Goes to the previous page. |
| 5 | Loading bar | Shows load status of the current page. |

Header subtext per internal channel: Developing and Review **always** show the
page domain; Published shows the domain for unverified MINI Apps, or the LINE
MINI App name + verified badge for verified MINI Apps.

### Body

WebView. Use HTML5 + LIFF.

## Built-in features

### Action button

Displayed by default on every page's header. Tapping it shows different
features by LINE app version:

| LINE app version | Available feature |
|---|---|
| 26.7.0 or later | Dropdown menu |
| 15.12.0 or later, earlier than 26.7.0 | Multi-tab view |
| Earlier than 15.12.0 | Options |

The action button cannot be hidden. You can implement a **custom action
button** anywhere in the body (see `custom-action-button-and-flex.md`).

### Dropdown menu (LINE 26.7.0+)

| Item | Description |
|---|---|
| **All tabs** | Displays the multi-tab view. |
| **Refresh** | Refreshes the current page. |
| **Minimize browser** | Minimizes the LIFF browser. Verified MINI Apps only. |
| **Share** | Shares the LIFF URL / permanent link of the current page as a LINE message. If the page doesn't start with the endpoint URL, the LINE MINI App's LIFF URL is shared instead. The share message: URL = permanent link of the current page; Title = LIFF app name (Web app settings tab); Description = auto-set text; Image = Channel icon. |
| **Add to Home** | Shows the Add Shortcut screen for the current page. Errors if the page doesn't start with the endpoint URL. Verified MINI Apps, LINE 14.3.0+. |
| **Favorites** | Adds the LINE MINI App to favorites. Requires: verified MINI App, user in Japan, LINE 15.18.0+. Favorited apps show in the MINI tab. |
| **Permission settings** | Opens the Permission Settings screen (camera/microphone permissions of the current LINE MINI App). LINE 14.6.0+. Permission changes may need a page reload to take effect. |
| **About the service** | Displays the Provider page. Verified MINI Apps only. |
| **Report** | Opens the LINE inquiry form in an external browser. Requires: Region = Japan, LINE 15.6.0+. |

On LINE versions below the supported versions, the action button always opens
the LINE MINI App's top page regardless of the page being shared.

### Multi-tab view

Shows recently used services — LINE MINI Apps and LIFF apps opened by the user,
most-recent first, up to **50** items. The user can reopen them from the
history.

### Channel consent simplification

Detailed in `develop.md`. In brief: a feature that lets users consent once on a
simplification screen; afterward the channel consent screen is skipped for
other LINE MINI Apps when accessed for the first time.

## Custom features matrix

| Feature | Unverified | Verified | Where documented |
|---|---|---|---|
| Service messages | ❌ | ✅ | `service-messages.md` |
| Custom Path | ❌ | ✅ | `develop.md` |
| Add shortcut to home screen | ❌ | ✅ | `develop.md` |
| Common Profile Quick-fill | ❌ | ✅ | `quick-fill.md` |
| Inducing users to add your OA as a friend | ✅ | ✅ | `submit-service-and-demos.md` |
| Custom action button | ✅ | ✅ | `custom-action-button-and-flex.md` |
| Using payment systems | ✅ | ✅ | `develop.md` |
| Place ads | ✅ | ✅ | `submit-service-and-demos.md` |

## Ways users access a LINE MINI App

- **From outside LINE** — via a [permanent link](https://developers.line.biz/en/docs/line-mini-app/develop/permanent-links/) posted on web pages, emails, text messages, or QR codes; or from a home-screen shortcut.
- **LINE Official Account** — a link in a rich message or rich menu.
- **Home tab** — `Services` on the Home tab shows up to 8 recently used LINE MINI Apps (verified MINI Apps only; the older "pin to Home tab" feature was discontinued).
- **Searching on LINE** — verified MINI Apps only.
- **LINE Message** — sharing via the built-in action button or a custom action button.

## Creating a LINE MINI App channel

A [channel](https://developers.line.biz/en/docs/line-developers-console/overview/#channel)
connects your app to the LINE Platform; create one LINE MINI App channel per
LINE MINI App.

1. Open the [LINE Developers Console](https://developers.line.biz/console/), select a provider.
2. **Channels** > **Create a new channel** > **LINE MINI App**.
3. Fill in the channel information (table below).
4. Read and confirm the warrant-and-represent statement, check the box.
5. Click **Create**.
6. Read "Regarding Consent to Usage of the Information" and click **Accept**.

The channel is then created and usable as an **unverified MINI App**.

### Channel creation fields

| Field | Required | Notes |
|---|---|---|
| Channel type | ✅ | Select **LINE MINI App**. |
| Provider | ✅ | The channel's provider. Shown on the consent screen. |
| Region to provide the service | ✅ | One of **Japan / Thailand / Taiwan**. One channel per region — create a separate channel for each. |
| Channel icon | ❌ | Channel icon. See icon specs in `submit-service-and-demos.md`. Shown on consent screen, action-button share, multi-tab view, service-message footer, Home tab/search, Add Shortcut screen. |
| Channel name | ✅ | Cannot contain "LINE" or similar. Shown in the same places as the icon. |
| Channel description | ✅ | If the developing company and service-providing company differ, the description must say so. Shown on the consent screen. |
| Email address | ✅ | For important channel updates. |
| Privacy policy URL | ✅* | The app's privacy policy. Shown on the consent screen. *Only certified providers must enter it at creation time; others edit it afterward. |
| Terms of use URL | ❌ | Shown on the consent screen. |
| LINE Developers Agreement | ✅ | Read and agree. |
| LINE MINI App Platform Agreement | ✅ | Read and agree. |
| LINE MINI App Policy | ✅ | Read and agree. |
| Service company's country or region | ✅ | Warrant that it matches the region to provide the service. Shown on the consent screen. |
| LY Corporation Privacy Policy | conditional | Required only if Region = Thailand. |

If you cannot create a channel, link the Business ID you log in with to your
LINE account.

### Precautions for channel/provider linkage

- Once created, a channel **cannot be moved to another provider**.
- A LINE user gets a **different user ID per provider** — user IDs cannot
  identify the same user across providers.
- Choose the provider carefully (managing channels of unrelated services or
  companies under one provider can cause future problems).

## The three internal channels

From the **Channels** tab, a LINE MINI App appears as a single channel, but
internally it is **three** channels ("internal channels"):

| Internal channel | Usage | Channel status | Who sees details | Who can access the app |
|---|---|---|---|---|
| **Developing** | Development & testing | Always "Developing" | Admins who accepted permissions | Testers who accepted permissions |
| **Review** | LY Corporation's review | Always "Developing" | Admins + LY reviewers | LY reviewers only |
| **Published** | Published to users | Always "Publishing" | Admins (via the **Published Data** button) | End users |

You **cannot change** the status of internal channels. Add a user as a tester
by enrolling them as a tester of the LINE MINI App channel via Managing roles.

## LINE Developers Console guide

### Confirm LIFF ID and set endpoint URL

Each internal channel has **one** LINE MINI App (LIFF app). Confirm the unique
**LIFF ID** and set the **Endpoint URL** for each internal channel, then deploy
the LIFF app to each endpoint URL.

- Before requesting review, deploy the Review LIFF app to the Review endpoint URL.
- When publishing, deploy the Published LIFF app to the Published endpoint URL.
- You may set a basic-auth URL in the Endpoint URL for Developing or Review.

Key facts about LIFF ID:

- **Each internal channel has a different LIFF ID.** Pass the matching LIFF ID
  to `liff.init()` for the channel you are running. A mismatch between the
  channel's LIFF ID and the `liff.init()` LIFF ID prevents launch.
- LIFF ID is part of the LIFF URL (`https://miniapp.line.me/{liffId}`). To share
  a custom message from a particular internal channel's app, send that
  channel's URL.
- A single internal channel cannot have multiple LIFF apps / LIFF IDs.

From the **Web app settings** tab of a LINE MINI App channel you **cannot**:
add LIFF apps other than the default; change per-LIFF-app scope / add-friend
option; configure Module mode.

### Issuing a channel access token

Use a **stateless channel access token** for the LINE MINI App channel. Issue a
channel access token **for each internal channel**. Channel ID and Channel
secret are on the **Channel basic settings** tab.

- Do **not** use the Developing channel's token to send service messages from
  the Review or Published LINE MINI Apps.
- LINE MINI App channels **cannot** use long-lived channel access tokens or
  v2.1 (user-specified expiration) tokens. Use a **stateless** token
  (recommended — unlimited issuance, no lifecycle management) or a **short-lived**
  token (30 days).

### Channel description

The **Channel description** (Basic settings tab) is used both to help users
understand the service and to inform LY Corporation's review. Provide a
specific service description.

| | Channel name | Channel description |
|---|---|---|
| Bad | LINE FRIENDS STORE | LINE FRIENDS STORE is a store for LINE character goods. |
| Good | LINE FRIENDS STORE | This is a mobile ordering service at the LINE FRIENDS STORE. You can order and pay in advance and receive your merchandise at the store. |

### When settings on the LINE Developers Console are reflected

When you create a channel, the settings are copied to the three internal
channels.

- **Unverified MINI App**: changing a setting reflects the Developing channel's
  contents into the Published channel. But the **Service message template** tab
  and **Channel consent simplification** (Web app settings) are not reflected
  until the verification review passes.
- **Verified MINI App**: changing channel name, LIFF-app scope, add-friend
  option, etc. changes **only** the Developing channel — Review and Published
  are not affected (so you can develop freely).

For verified MINI Apps, the reflection timing is:

| Internal channel | When settings are reflected |
|---|---|
| Developing | Reflected when configured in the Console. |
| Review | Copied from Developing when review begins. |
| Published | Copied from Developing when published. |

### About configuring the company/owner's country or region

When creating the channel you must agree to "I represent and warrant that the
region to provide the LINE MINI App and service company's country or region are
the same." This is shown to the user on the consent screen. You **cannot edit**
the country/region for an existing channel — to change it, write the request
and target value in **Reference materials for the review** when applying for
review.

## Console-setting → user-facing-screen mapping

Settings registered in the Console that are displayed to users:

| Setting (tab) | Where it appears to users |
|---|---|
| **Provider name** (Settings tab) | Verification screen, Channel consent screen |
| **Channel icon** (Basic settings) | Action button share, multi-tab view, verification screen, channel consent screen, service-message footer, Add Shortcut screen |
| **Channel name** (Basic settings) | Same places as the icon. Copied to **LIFF app name** (Web app settings). Enter in English; for other languages use Localization. |
| **Channel description** (Basic settings) | Verification screen, channel consent screen. Enter in English; for other languages use Localization. |
| **Privacy policy URL** (Basic settings) | Channel consent screen |
| **Localization (multi-language support)** (Basic settings) | Channel consent screen (name + description shown in the user's LINE language) |
| **Endpoint URL** (Web app settings) | Add Shortcut screen |

Channel name and description are shown in English unless Localization is enabled
for the user's LINE language. If the LINE MINI App is verified, a verified badge
appears next to the name on the channel consent screen; if the provider is not a
certified provider, a note "LY Corporation hasn't verified this service
provider." is shown.

The action button share, multi-tab view, verification screen, channel consent
screen, service-message footer, and Add Shortcut screen each pull the LINE MINI
App name + icon (and the verification/consent screens additionally the provider
name + description).

If you outsourced development and the service company ≠ development company, the
**Channel description** must state: the service company name, the development
company name, and the company/companies to whom user data is provided.

## LINE MINI App vs native apps

LINE MINI Apps run in the LIFF browser inside the LINE app. Compared to native
apps:

| Factor | Native app | LINE MINI App |
|---|---|---|
| Barrier to use | High — must download via an app store | Low — launches directly, no download |
| Notification delivery | Push notifications, often disabled by users → lower delivery | Sent via LINE Official Account → higher delivery (LINE used daily) |
| Retention | Hard to re-engage if notifications off | Easy to add the service's OA as a friend, send repeat-usage messages |
| Camera / microphone | Full device access | Via WebRTC; advanced functionality may be limited |
| GPS | Continuous + background location | Location only while running; no background → running-tracker apps must be native |
| Bluetooth | Full BLE / IoT integration | Not available — IoT scenarios need native |
| Home-screen icon | Auto on install | Can add a shortcut (verified MINI Apps); near-equivalent without a download |
| Development cost | Separate iOS + Android builds | One web codebase; lower cost; faster updates |
| Updates | Re-release for changes | Changes that don't touch Console settings need no re-review |

Non-LINE users / users where deep links fail see a landing page guiding them to
open the LINE MINI App in a browser, so the service works without the LINE app.

## Migrating a web app to a LINE MINI App

Steps to implement an operating web app as a LINE MINI App:

1. **Create a LINE MINI App channel.**
2. **Load the LIFF SDK** — from a CDN or via npm. CDN:
   ```html
   <script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
   ```
3. **Initialize the LIFF app** — `liff.init()` with the LIFF ID of the channel:
   ```javascript
   liff
     .init({
       liffId: "123456-abcdefg", // Specify LIFF ID
     })
     .then(() => {
       // Use the LIFF API
     })
     .catch((err) => {
       // When an error occurs during initialization
       console.log(err.code, err.message);
     });
   ```
4. **Implement features** — LIFF API, service messages, HTML5 specs. To get a
   user ID, get an ID token with `liff.getIDToken()` and verify it server-side
   via the [Verify ID token](https://developers.line.biz/en/reference/line-login/#verify-id-token)
   endpoint:
   ```javascript
   const idToken = liff.getIDToken();
   ```
5. **Configure the LINE MINI App channel** — set the web app URL as the Endpoint
   URL.
6. **Request a review** of your LINE MINI App (optional — you can also publish as
   an unverified MINI App without a review).

Requirements: web-app dev knowledge (HTML/CSS/JS), a web server, and a Business
ID for the LINE Developers Console.

LIFF apps created under a **LINE Login channel** cannot be migrated to a LINE
MINI App channel. If you might want a verified MINI App later, create an
unverified MINI App from the start.
