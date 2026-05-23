# Setup, Overview & Resources

Source:
- `https://developers.line.biz/en/docs/line-login/overview/`
- `https://developers.line.biz/en/docs/line-login/getting-started/`
- `https://developers.line.biz/en/docs/line-login/login-button/`
- `https://developers.line.biz/en/docs/line-login/using-line-url-scheme/`
- `https://developers.line.biz/en/docs/line-login/integrate-line-login-v2/`

## Table of contents

- LINE Login overview (what it is, auth methods, versions)
- Two-factor authentication
- Getting started — creating & configuring a LINE Login channel
- LINE Login button design guidelines
- Using LINE features with the LINE URL scheme
- Integrating LINE Login v2.0 with a web app (deprecated)

---

# LINE Login overview

**LINE Login** is a free social-login service that lets users sign in with
their LINE accounts. Integrating it into a website or app lets users register
and log in easily — registration auto-fills the LINE-registered profile
information, and login needs no per-site email/password.

LINE Login works with native iOS / Android apps, web apps (websites), and
Unity games.

## Integration paths

- **Web apps** — see `web-login-flow.md`. Based on OAuth 2.0 + OpenID Connect.
  Users already logged in to LINE on their device can auto-login to the web
  app.
- **Native apps** — use a LINE SDK; LINE handles user authentication. SDKs:
  LINE SDK for iOS Swift, LINE SDK for Android, LINE SDK for Unity, LINE SDK
  for Flutter. (These SDKs are documented in the separate `line-login-sdks`
  documentation section.)

## Authentication methods (web app)

| Method | Description |
|---|---|
| Auto login | Log in with no user operation; no LINE Login screen / confirmation screen. |
| Log in with email address | Enter email address and password on the LINE Login screen. |
| Log in with QR code | Scan a QR code on the LINE Login screen with the LINE app's QR reader. |
| Single Sign On (SSO) login | Click the login button on a "Continue as" confirmation screen. |

Details and screen conditions are in `web-login-flow.md`.

## Identifying users

Once a user logs in and your app has an access token, the app can get the
profile information the user registered with LINE: **user ID, display name,
profile image URL, status message**. See `users-and-friendship.md`.

## LINE Login versions

LINE Login supports **OpenID Connect Discovery 1.0**. OpenID provider config:
`https://access.line.me/.well-known/openid-configuration`.

| Version | Status | Description |
|---|---|---|
| **LINE Login v2.1** | Active | Handles login via the OAuth 2.0 authorization code flow; supports OpenID Connect and ID tokens. Released 2017-09-28. |
| LINE Login v2.0 | Deprecated | Released 2017-01-24; deprecated, end-of-life TBD. Use v2.1. There will be a grace period between the end-of-life announcement and the actual end-of-life. |
| LINE Login v1 | End-of-life | All features discontinued 2018-06-30, no longer available. |

---

# Two-factor authentication

A user with the **Admin** role can configure a channel to **require two-factor
authentication** when a user logs in. Two-factor authentication reduces the
risk of unauthorized logins (e.g. list-based attacks). LINE recommends
requiring it (note it may restrict users — e.g. requiring a smartphone with
the LINE app).

**What it is:** authenticating a user with two of: knowledge known only to the
user (a password), the user's property (an IC card, a smartphone), biometric
information (fingerprint, face). LINE Login does this via LINE-account password
authentication plus entering a verification code (shown on screen) into the
smartphone's LINE screen.

If the user logs in for the first time, or the device/browser changes, they
are prompted for the verification code after entering the password. Unless the
user switches accounts or deletes browser cookies, they remain trusted for
**365 days** without re-entering a verification code. If already logged in with
the same browser, two-factor authentication is skipped.

Two-factor authentication is available with **LINE Login v2.1**.

## "Require two-factor authentication" setting (LINE Developers Console)

Can be set when creating a new channel and when editing an existing channel:

| Channel type | When creating | When editing |
|---|---|---|
| LINE Login | ✅ | ✅ |
| Blockchain Service | ✅ | ✅ |
| Messaging API | — (cannot create on the Console) | ✅ (only if a previously created channel holds LIFF) |
| LINE MINI App | ❌ | ❌ |

- **When creating** — toggle the **Require two-factor authentication** switch.
  Default is "on".
- **When editing** — only members with the **Admin** role can edit it (the
  field is not shown to Member-role users). The setting lives on the **LINE
  Login** tab for LINE Login and Blockchain Service channels, and on the
  **LIFF** tab for Messaging API channels.

## Priority vs the device-level Two-factor Authentication Switch

The LINE app's **Two-factor Authentication Switch** (Home → Settings →
Accounts → Two-factor authentication) provides two-factor auth for services
using LINE Login v2.1 when turned on. **The channel setting overrides the
device setting** — enabling "Require two-factor authentication" on a channel
forces two-factor auth even if the device switch is off:

| | Device setting OFF | Device setting ON |
|---|---|---|
| Channel setting OFF | Disabled | Enabled |
| Channel setting ON | Enabled | Enabled |

## Behavior by authentication method

Even with "Require two-factor authentication" on, the user may not be prompted
for a verification code depending on the method used:

| Authentication method | Two-factor authentication |
|---|---|
| Log in with email address | Required |
| Log in with QR code | Required |
| Auto login | Not required |
| Single Sign On (SSO) login | Not required |

---

# Getting started — creating a LINE Login channel

To integrate LINE Login you first create a **LINE Login channel**. A channel is
the conduit through which your app connects to the LINE Platform. Create one
LINE Login channel per app, in the
[LINE Developers Console](https://developers.line.biz/console/).

## Prerequisites

- **LINE account** — needed to test.
- **Provider** — the person/organization providing the app. Create it in the
  LINE Developers Console. A LINE user has a **different user ID for each
  provider**.
- **LINE Login channel** — created within the provider. If you have never
  logged in to the LINE Developers Console, you are first asked to register as
  a developer.

(The getting-started guide also uses a Heroku account + Heroku CLI to deploy
the `line-login-starter` sample app; Heroku's free plan was discontinued
2022-11-27.)

## Step 1 — create the channel

In the LINE Developers Console: log in → select a provider → select **LINE
Login** from the **Channels** tab → fill in the channel fields:

| Item | Required? | Description |
|---|---|---|
| **Channel type** | ✅ | Select LINE Login. |
| **Provider** | ✅ | The channel's provider. |
| **Region to provide the service** | ✅ | Japan / Thailand / Taiwan / Indonesia. For multiple regions, create one channel per region. |
| **Company or owner's country or region** | ✅ | Country/region of the company or owner managing the channel. |
| **Channel icon** | ❌ | The channel's icon. |
| **Channel name** | ✅ | The channel's name. Cannot contain "LINE" or similar strings. |
| **Channel description** | ✅ | The channel's description. |
| **App types** | ✅ | The type of app you integrate LINE Login with: **Web app** and/or **Mobile app**. For the web-app starter, select **Web app**. |
| **Email address** | ✅ | Email address to receive important channel updates. |
| **Privacy policy URL** | See description | Required if your provider is a certified provider. |
| **Terms of use URL** | ❌ | URL of the app's terms of use. |
| **LINE Developers Agreement** | ✅ | Read and agree. |
| **LY Corporation Privacy Policy** | See description | Required only if you selected Thailand as the region. |

### Precautions for channel & provider linkage

- Once a channel is created you **cannot move it to another provider**.
- When linking a LINE Login channel with a Messaging API channel, create both
  in the **same provider**.
- A LINE user gets a **different user ID per provider**; user IDs cannot
  identify the same user across channels under different providers.

## Channel settings — Basic settings tab

Key fields on the **Basic settings** tab:

| Item | Description |
|---|---|
| **Channel ID** | Unique identifier for the channel. Used as `client_id`. |
| **Region to provide the service** | Set only at channel creation. |
| **Channel secret** | A unique secret key granting an app access to the channel. Used as `client_secret`; also the `HS256` ID-token verification key. |
| **Assertion Signing Key** | The UUIDs of your assertion signing key pair. |
| **App types** | The type(s) of app you integrate LINE Login with. |
| **Permissions** | The type of user data this channel can access. |
| **Linked LINE Official Account** | The LINE Official Account linked to this channel (must be from the same provider). |
| **Localization** | Add languages for multi-language channel support. |
| **Email address permission** | Apply for permission to request a user's email using OpenID Connect. |

## Step 3 — channel settings & callback URL

To use a LINE Login channel for web apps, set **App Type** and **Callback URL**
correctly: on the **LINE Login** tab, enter the **Callback URL** (see
`web-login-flow.md` for callback URL rules).

## Channel status — Developing vs Published

LINE Login channels are created with **"Developing"** status — only users with
the **Admin** or **Tester** role can use the channel. To allow other users,
change the status to **"Published"** (click the "Developing" status at the top
of the channel page). **Once changed to "Published" you cannot change it back
to "Developing".**

### Testing with a "Developing" channel

A developer account given a test role on the channel must be linked to a LINE
account. Developer accounts are linked to a Business ID one-to-one; linking the
Business ID to a LINE account is optional. When testing LINE Login, log in
using the LINE account linked to your developer account — you **cannot** log
in using the email address/password registered for your Business ID.

---

# LINE Login button design guidelines

Add a LINE Login button to let users log in with LINE Login. The button is
made of: the LINE icon, the LINE icon speech bubble, and the button text.

Before using the button, read and agree to the "Usage Guidelines for the LINE
Login Button"; downloading the LINE Login button template implies agreement.
The official template ZIP includes image sets in many resolutions for web /
iOS / Android, plus a PSD for customized text in different languages.

## Size

The button can be scaled per device as long as the LINE icon's aspect ratio
does not change and the LINE icon stays clearly visible.

## Color

Only these colors may be used:

| Item | Color |
|---|---|
| Base color | `#06C755` |
| Hover | `#06C755` + `#000000` (opacity 10%) |
| Press | `#06C755` + `#000000` (opacity 30%) |
| Disabled | `#FFFFFF` |
| Font/logo color (other than disabled) | `#FFFFFF` |
| Font/logo color (only disabled) | `#1E1E1E` (opacity 20%) |
| Vertical line color (other than disabled) | `#000000` (opacity 8%) |
| Vertical line color (only disabled) | `#E5E5E5` (opacity 60%) |
| Border color (only disabled) | `#E5E5E5` (opacity 60%) |

For opacity colors, mind the layer order — e.g. for the vertical line on a
hover button, place hover (`#000000` opacity 30%) on top of the base layer
(`#06C755`), then the vertical line (`#000000` opacity 8%) and text/logo
(`#FFFFFF`) above it.

## Text

Recommended text: **"Log in with LINE"**. Custom text must have no line breaks
and must clearly indicate the button logs into the app with LINE. The LINE
icon may be used alone with no button text.

Recommended phrases per language:

| Language | Long | Short |
|---|---|---|
| en | Log in with LINE | Log in |
| ja | LINEでログイン | ログイン |
| ko | LINE으로 로그인 | 로그인 |
| de | Mit LINE anmelden | Anmelden |
| es | Iniciar sesión con LINE | Iniciar sesión |
| fr | Connexion avec LINE | Se connecter |
| id | Masuk dengan LINE | Masuk |
| it | Login con LINE | Login |
| ms | Log masuk dengan LINE | Log Masuk |
| pt-BR | Login com o LINE | Login |
| pt-PT | Iniciar sessão com o LINE | Iniciar sessão |
| ru | Войти в LINE | Войти |
| th | ล็อกอินด้วย LINE | ล็อกอิน |
| tr | LINE ile oturum açın | Oturum Aç |
| ar | تسجيل دخول باستخدام LINE | تسجيل دخول |
| vi | Đăng nhập với LINE | Đăng nhập |
| zh-CN | 用LINE帐号登录 | 登录 |
| zh-TW | 與LINE連動 | 連動 |

## Font, padding, isolation zone

- **Font** — must be readable; recommended sizes are in the PSD files.
- **Padding** — left/right padding of the button text must be ≥ the width of
  the LINE icon speech bubble (call this X). Recommended top/bottom padding is
  X/2.
- **Isolation zone** — the space around the button that must contain no
  elements; its width must be ≥ the left padding of the LINE icon speech
  bubble. Avoid placing text/graphics near it.

## Common mistakes to avoid

- Using a non-designated color.
- Using an outdated LINE icon.
- Using a different or modified icon instead of the LINE icon.

---

# Using LINE features with the LINE URL scheme

You can open Sticker Shop, a LIFF app, the camera, etc. with the **LINE URL
scheme**. It works for LINE Official Accounts too, and can be used in the
`uri` action of [rich menus](https://developers.line.biz/en/docs/messaging-api/using-rich-menus/).

## Supported LINE URL schemes

| URL scheme prefix | Description |
|---|---|
| `https://line.me/R/` | Using LINE app features. |
| `https://liff.line.me/` | Opening a LIFF app. |
| `https://miniapp.line.me/` | Opening a LINE MINI App. |

> **`line://` is deprecated** to prevent takeover attacks; no obsolescence date
> is set. LY Corporation provides no URL scheme to launch native apps other
> than LINE.

## When a LINE URL scheme is clicked

With LINE installed, LINE launches showing the specified content. Without LINE:

| Scheme | Without LINE installed |
|---|---|
| `https://line.me/R/` | A web browser launches and prompts the user to download LINE. |
| `line://` (deprecated) | Nothing happens, or the user is redirected to an error page. |

## Supported platforms

LINE for iOS and LINE for Android. **Not supported in LINE for PC (macOS,
Windows).**

## Available LINE URL schemes (selected)

**Camera & camera roll** (only from LINE chats incl. OpenChat):
- `https://line.me/R/nv/camera/` — opens the camera.
- `https://line.me/R/nv/cameraRoll/single` — camera roll, pick one image.
- `https://line.me/R/nv/cameraRoll/multi` — camera roll, pick multiple images.

**Location** (only in one-on-one chats with a LINE Official Account):
- `https://line.me/R/nv/location/` — opens the location screen.

**Sharing a LINE Official Account** (`{Percent-encoded LINE ID}` percent-encoded
in UTF-8, e.g. `@linedevelopers` → `%40linedevelopers`):
- `https://line.me/R/ti/p/{Percent-encoded LINE ID}` — opens the LINE Official
  Account's profile page (or a one-on-one chat if already a friend).
- `https://line.me/R/nv/recommendOA/{Percent-encoded LINE ID}` — opens the
  "Share with" screen.

**LINE VOOM & business profile** (`{LINE ID without @}` — exclude the `@`):
- `https://line.me/R/home/public/main?id={LINE ID without @}` — opens LINE VOOM.
- `https://line.me/R/home/public/profile?id={LINE ID without @}` — opens the
  business profile.
- `https://line.me/R/home/public/post?id={LINE ID without @}&postId={postId}` —
  opens a LINE VOOM post.

**Chat with a LINE Official Account:**
- `https://line.me/R/oaMessage/{Percent-encoded LINE ID}` — opens a chat.
- `https://line.me/R/oaMessage/{Percent-encoded LINE ID}/?{text_message}` —
  opens a chat and pre-fills the message input (`{text_message}` percent-encoded).

**Sending text messages:**
- `https://line.me/R/share?text={text_message}` — opens the "Share with"
  screen (`{text_message}` percent-encoded in UTF-8).

**Profile information:**
- `https://line.me/R/nv/profile` — opens the user's "My profile".
- `https://line.me/R/nv/profileSetId` — opens the user's "LINE ID" screen.

**Common LINE screens:** `https://line.me/R/nv/chat` (Chats tab),
`/nv/commerce` (Shopping), `/nv/wallet` (Wallet), `/nv/addFriends` (Add
friends), `/nv/officialAccounts` (LINE Official Accounts), `/nv/timeline` (LINE
VOOM Following).

**LINE settings:** `https://line.me/R/nv/settings` (Settings),
`/nv/settings/account` (Account), `/nv/connectedApps` (Account → Authorized
apps), `/nv/connectedDevices` (Connected devices), `/nv/settings/privacy`
(Privacy), `/nv/settings/sticker` (Stickers), `/nv/stickerShop/mySticker` (My
Stickers), `/nv/settings/themeSettingsMenu` (iOS) / `/nv/settings/theme`
(Android) (Themes), `/nv/themeSettings` (My Themes),
`/nv/notificationServiceDetail` (Notification → Authorized apps),
`/nv/settings/chatSettings` (Chats), `/nv/suggestSettings` (Display
suggestions), `/nv/settings/callSettings` (Calls),
`/nv/settings/addressBookSync` (Friends), `/nv/settings/timelineSettings` (LINE
VOOM).

**Sticker Shop:** `https://line.me/R/shop/sticker/detail/{package_id}`,
`/shop/category/{category_id}`, `/shop/sticker/author/{author_id}`,
`/nv/stickerShop` (HOME tab), `/shop/sticker/hot` (RANK), `/shop/sticker/new`
(NEW), `/shop/sticker/event` (FREE), `/shop/sticker/category` (CATEGORIES).

**Theme Shop:** `https://line.me/R/shop/theme/detail?id={product_id}`.

**LIFF app:**
- `https://liff.line.me/{liffId}` — opens the LIFF app (a "LIFF URL").
- `https://liff.line.me/{liffId}/path_A/path_B/?key1=value1&key2=value2` —
  opens the LIFF app passing extra path/query info.
- The LIFF v1 formats `https://line.me/R/app/{liffId}` and
  `line://app/{liffId}` are **deprecated**.

**Open a URL in an external browser** (query parameters; not supported on LIFF
apps):
- `https://example.com/?openExternalBrowser=1` — opens in an external browser.
- `https://example.com/?openInAppBrowser=0` — opens in a Chrome custom tab
  (LINE for Android only).

---

# Integrating LINE Login v2.0 with a web app (DEPRECATED)

> **LINE Login v2.0 is deprecated**, end-of-life TBD. Use v2.1 (see
> `web-login-flow.md`). v2.0 has **no OpenID Connect**, no ID token, and you
> **cannot get the email address** of a user.

## v2.0 login flow

Based on the OAuth 2.0 authorization code flow (no OpenID Connect).

## v2.0 authorization request

The v2.0 authorization endpoint is **`access.line.me/dialog/oauth/weblogin`**
(different from v2.1's `oauth2/v2.1/authorize`):

```
https://access.line.me/dialog/oauth/weblogin?response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fauth&state=123abc
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `response_type` | String | Required | `code` |
| `client_id` | String | Required | LINE Login channel ID. |
| `redirect_uri` | String | Required | Callback URL registered on the Console. |
| `state` | String | Required | A unique anti-CSRF string; generate a random value per login session. Cannot be URL-encoded. |

You can set more than one callback URL per channel. The consent screen is
shown by the LINE Platform.

## v2.0 authorization response

| Parameter | Type | Description |
|---|---|---|
| `code` | String | Authorization code. Valid 10 minutes, single-use. |
| `state` | String | The anti-CSRF string — verify it matches the value in the authorization URL. |

```
https://example.com/callback?code=b5fd32eacc791df&state=123abc
```

## v2.0 error response

If the user declines, the redirect carries:

| Parameter | Type | Description |
|---|---|---|
| `error_description` | String | `The+user+has+denied+the+approval` (does not appear in the iOS/Android in-app browser). |
| `errorMessage` | String | `DISALLOWED` |
| `errorCode` | Number | `417` |
| `state` | String | The `state` from the authorization URL. |
| `error` | String | `access_denied` |

```
https://example.com/callback?error_description=The+user+has+denied+the+approval&errorMessage=DISALLOWED&errorCode=417&state=123abc&error=access_denied
```

## v2.0 getting an access token

Verify the returned `state` matches, then:

```sh
curl -v -X POST https://api.line.me/v2/oauth/accessToken \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=authorization_code' \
-d 'code=b5fd32eacc791df' \
-d 'redirect_uri=https%3A%2F%2Fexample.com%2Fauth' \
-d 'client_id=12345' \
-d 'client_secret=d6524edacc8742aeedf98f'
```

```json
{
  "access_token": "bNl4YEFPI/hjFWhTqexp4MuEw5YPs7qhr6dJDXKwNPuLka...",
  "expires_in": 2591977,
  "refresh_token": "8iFFRdyxNVNLWYeteMMJ",
  "scope": "P",
  "token_type": "Bearer"
}
```

Full v2.0 endpoint detail is in `api-reference.md` ("LINE Login v2.0 API
reference"). v2.0 token management is in `access-tokens.md`; v2.0 user
management is in `users-and-friendship.md`.
