# Web Login Flow (OAuth 2.0 + OpenID Connect)

Source:
- `https://developers.line.biz/en/docs/line-login/integrate-line-login/`
- `https://developers.line.biz/en/docs/line-login/overview/` (authentication methods)

LINE Login v2.1 for web apps is based on the **OAuth 2.0 authorization code
grant flow** and the **OpenID Connect** protocol. The LINE Platform handles
all user authentication and authorization — the web app never receives the
user's credentials and never implements the auth UI itself.

For native apps, use a LINE SDK instead of this web flow.

## Table of contents

- Login flow overview
- Channel configuration (callback URL, email permission)
- Authorization request — every `authorize` query parameter
- Scopes
- User authentication methods (auto login / email / QR / SSO)
- User authorization (the consent screen)
- Authorization response (`code`, `state`, ...)
- Error response & error codes
- Exchanging the authorization code for an access token

---

## Login flow overview

```
User clicks "Log in with LINE"
   │
   ▼
Redirect browser → GET https://access.line.me/oauth2/v2.1/authorize?...
   │
   ▼
LINE Platform authenticates the user and shows the consent screen
   │
   ▼
Redirect browser → {callback URL}?code={authorization code}&state={state}
   │  (verify state matches the value you generated)
   ▼
POST https://api.line.me/oauth2/v2.1/token   grant_type=authorization_code
   │
   ▼
Response: access_token, refresh_token, id_token, expires_in, scope, token_type
```

The web app must implement every part of this flow relevant to it.

---

## Channel configuration

Before the flow works you must configure the LINE Login channel in the
[LINE Developers Console](https://developers.line.biz/console/). See
`setup-and-resources.md` for channel creation.

### Setting a callback URL

After the user authenticates and authorizes the app, the authorization code
and `state` are sent to the **callback URL**. Set the callback URL on the
**LINE Login** tab of the channel settings. You can register **multiple
callback URLs** per channel (one per line).

A `redirect_uri` value passed in the authorization request is valid only if it
is either:

- a URL that **exactly matches** a registered callback URL, or
- a registered callback URL **with optional query parameters added**.

### Requesting permission to access the user's email address

LINE Login v2.1 can return the user's email address, but only after you apply
for permission:

1. On the channel's **Basic settings** tab, under **OpenID Connect**, click
   **Apply**.
2. Agree to the terms and upload a screenshot of the screen that explains you
   are collecting the email address and what it is used for.
3. Once accepted, "Applied" appears under **Email address permission**.

Only after approval can you use the `email` scope.

---

## Authorization request

When the user clicks the LINE Login button, redirect them to the authorization
URL with the required query parameters:

```
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fauth%3Fkey%3Dvalue&state=12345abcde&scope=profile%20openid&nonce=09876xyz
```

You can also link directly to an authorization URL without showing a LINE
Login button. The behavior of LINE Login authorization requests inside the
LIFF browser is **not guaranteed** — when opening a LIFF app from an external
browser, use `liff.login()` instead.

### Query parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `response_type` | String | Required | `code` |
| `client_id` | String | Required | LINE Login channel ID (from the LINE Developers Console). |
| `redirect_uri` | String | Required | URL-encoded string of a callback URL registered on the Console. You can append any query parameter. |
| `state` | String | Required | A unique alphanumeric string to prevent CSRF. **Generate a random value per login session.** Cannot be URL-encoded. |
| `scope` | String | Required | Permissions requested from the user. See Scopes below. |
| `nonce` | String | Optional | A string to prevent replay attacks. Returned in the `nonce` claim of the ID token. |
| `prompt` | String | Optional | Controls whether the authentication/authorization screen is shown. One of: `consent` (force the consent screen even if all permissions are already granted); `none` (skip the SSO authentication screen if auto login is enabled and the user is logged in & consented); `login` (force an authentication screen even if logged in or an SSO session exists — note: setting `login` disables auto login; the method used is reflected in the `amr` claim of the ID token). |
| `max_age` | Number | Optional | Allowable elapsed seconds since the user was last authenticated. Per `max_age` in OpenID Connect Core 1.0 "Authentication Request". |
| `ui_locales` | String | Optional | Display language(s) for the LINE Login screens. One or more RFC 5646 (BCP 47) language tags, space-separated, in order of preference. Per `ui_locales` in OIDC Core 1.0. |
| `bot_prompt` | String | Optional | Shows an option to add a LINE Official Account as a friend during login. `normal` or `aggressive`. See `users-and-friendship.md`. |
| `initial_amr_display` | String | Optional | If `lineqr`, "Log in with QR code" is displayed by default instead of "Log in with email address". |
| `switch_amr` | Boolean | Optional | If `false`, hides the buttons for changing the login method ("Log in with email" / "QR code login"). Default `true`. |
| `disable_auto_login` | Boolean | Optional | If `true`, auto login is disabled. Default `false`. When `true`, SSO login is shown if SSO is available, otherwise email-address login. |
| `disable_ios_auto_login` | Boolean | Optional | If `true`, auto login is disabled on iOS. Default `false`. Prefer the newer `disable_auto_login`. |
| `code_challenge` | String | Optional | PKCE: the `code_verifier` hashed with SHA256 and Base64URL-encoded. Default `null` (no PKCE). See `pkce-and-security.md`. |
| `code_challenge_method` | String | Optional | PKCE: `S256` (= SHA256). LINE Login only supports `S256`. |
| `response_mode` | String | Optional | How authorization response parameters are returned. Default `query`. Values below. |

### `response_mode` values

| Value | Behavior |
|---|---|
| `query` | Response parameters returned as query parameters on the callback URL. (OAuth 2.0 Multiple Response Type Encoding Practices §2.1.) |
| `form_post` | Response parameters returned in the body of an HTTP POST request. (OAuth 2.0 Form Post Response Mode.) |
| `query.jwt` | Response parameters placed in a JWT and returned as a query parameter on the callback URL. (Same as `jwt`.) JARM §4.3. |
| `form_post.jwt` | Response parameters placed in a JWT and returned in the body of an HTTP POST request. JARM §4.3. |
| `jwt` | Response parameters placed in a JWT and returned as a query parameter on the callback URL. (Same as `query.jwt`.) JARM §4.3. |

`*.jwt` / `jwt` correspond to "Financial-grade API: JWT Secured Authorization
Response Mode for OAuth 2.0 (JARM)".

---

## Scopes

Specify in the `scope` parameter. Separate multiple scopes with a URL-encoded
whitespace character (`%20`).

| Scope | Profile info (profile API) | ID token (incl. user ID) | Display name in ID token | Profile image URL in ID token | Email address in ID token |
|---|---|---|---|---|---|
| `profile` | ✓ | - | - | - | - |
| `profile%20openid` | ✓ | ✓ | ✓ | ✓ | - |
| `profile%20openid%20email` | ✓ | ✓ | ✓ | ✓ | ✓ (see note) |
| `openid` | - | ✓ | - | - | - |
| `openid%20email` | - | ✓ | - | - | ✓ (see note) |

**Note:** Before you can specify the `email` scope you must submit an
application requesting access to users' email addresses (see Channel
configuration above).

- To obtain LINE Profile+ data (name, gender, birthday, phone number, address),
  a separate application process is required (LINE Profile+, corporate option).
- An access token with the `profile` scope is required to determine whether a
  user has added a LINE Official Account as a friend.

---

## User authentication methods

Authentication is handled entirely by the LINE Platform. After being
redirected to an authorization URL, the user logs in with one of:

| Method | Description |
|---|---|
| Auto login | Logs in without any user operation; no LINE Login screen or confirmation screen. |
| Log in with email address | Enter email address and password on the LINE Login screen. |
| Log in with QR code | Scan a QR code shown on the LINE Login screen with the LINE app's QR reader. |
| Single Sign On (SSO) login | Click the login button on a "Continue as" confirmation screen. |

Precedence: where auto login is available it takes precedence. When auto login
is not available, SSO login is shown if SSO is available, otherwise email
login. To force SSO over auto login, set `disable_auto_login=true`.

You can determine which method the user used by inspecting the `amr` claim of
the ID token (see `id-tokens-and-jwt.md`).

### Auto login

The user is automatically logged in (LINE app launches automatically, no user
operation) when they open an authorization URL while logged in to LINE's
smartphone app, from one of:

- LINE's in-app browser
- An external browser used for LINE Login

Notes:
- Auto login does **not** work on LINE for PC.
- Auto login uses Universal Links (iOS) / App Links (Android) on external
  browsers; it **may fail** in private browsing or due to undocumented OS
  behavior. See `pkce-and-security.md` for handling failure.
- Accessing a PKCE-enabled LINE Login web app from the Yahoo! JAPAN app
  enables auto login.

### Log in with email address / QR code

Used when accessing the authorization URL in an external browser for the first
time without being logged in to the LINE smartphone app.

### Single Sign On (SSO) login

The user logs in just by clicking the login button. SSO is available when the
user visits an authorization URL in an external browser they previously used
to log in to LINE. SSO uses a cookie saved under `access.line.me`; while the
cookie is valid the SSO screen is shown for login in the same browser.

---

## User authorization (consent screen)

Authorization is handled by the LINE Platform. The developer specifies the
desired data in the `scope` parameter and the user is asked to authorize it.

A user may proceed **without granting some or all** requested permissions —
design the app to account for missing permissions.

When the consent screen is **not** shown:
- If the requested scopes are only `profile` and/or `openid` and the user has
  already granted all of them.
- If the scopes include `email`, the consent screen is not shown for a certain
  period unless the user's email address changes.

---

## Receiving the authorization response

After authentication and authorization the user is redirected to the callback
URL. How the parameters arrive depends on `response_mode` (see above).

### Authorization response parameters

| Parameter | Type | Description |
|---|---|---|
| `code` | String | Authorization code used to get an access token. Valid for **10 minutes**. Single-use. |
| `state` | String | The unique anti-CSRF string. **Verify it matches the `state` you put in the authorization URL.** |
| `friendship_status_changed` | Boolean | `true` if the friendship status between the user and the LINE Official Account linked to the channel changed during login; otherwise `false`. Only returned if you specified `bot_prompt` and the add-friend option was shown. |
| `liffClientId` | String | LINE Login channel ID. Returned only when login is performed via `liff.login()` in a LIFF app. Do not change it. |
| `liffRedirectUri` | String | URL shown in the LIFF app after login (the `redirectUri` of `liff.login()`). Returned only via `liff.login()`. Do not change it. |

Example redirect with `response_mode=query`:

```
https://example.com/callback?code=abcd1234&state=0987poi&friendship_status_changed=true
```

Example redirect with `response_mode=query.jwt` or `jwt` (parameters inside a JWT):

```
https://example.com/callback?response=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Receiving an error response

If the user declines, or the request fails (except when `client_id` or
`redirect_uri` are invalid), the user is redirected to the callback URL with:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `error` | String | Required | Error code (see below). |
| `error_description` | String | Optional | A description of the error. |
| `state` | String | Optional | The `state` from the authorization URL — use it to identify which process was denied. |

Example:

```
https://example.com/callback?error=ACCESS_DENIED&error_description=The+resource+owner+denied+the+request.&state=0987poi
```

### Error codes

| Error code | Description |
|---|---|
| `INVALID_REQUEST` | Problem with the request. Check the authorization URL query parameters. |
| `ACCESS_DENIED` | The user canceled on the consent screen and declined to grant permissions. |
| `UNSUPPORTED_RESPONSE_TYPE` | Problem with `response_type`. LINE Login only supports `code`. |
| `INVALID_SCOPE` | Problem with `scope`. `profile` or `openid` is required; if `email` is specified, `openid` must also be specified. |
| `SERVER_ERROR` | An unexpected error on the LINE Login server. |
| `LOGIN_REQUIRED` | `prompt=none` was set but auto login could not work or the user was not logged in. |
| `INTERACTION_REQUIRED` | `prompt=none` was set but auto login could not work on the user's device. |

---

## Getting an access token with a web app

Exchange the authorization code for an access token **only after** verifying
that the returned `state` matches the `state` you generated.

`POST https://api.line.me/oauth2/v2.1/token`

```sh
curl -v -X POST https://api.line.me/oauth2/v2.1/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=authorization_code' \
-d 'code=1234567890abcde' \
--data-urlencode 'redirect_uri=https://example.com/auth?key=value' \
-d 'client_id=1234567890' \
-d 'client_secret=1234567890abcdefghij1234567890ab'
```

### Response

| Property | Type | Description |
|---|---|---|
| `access_token` | String | Access token. Valid for 30 days. |
| `expires_in` | Number | Seconds until the access token expires. |
| `id_token` | String | A JWT with information about the user. Returned **only if `openid` is in the scope**. See `id-tokens-and-jwt.md`. |
| `refresh_token` | String | Token used to get a new access token. Valid up to 90 days after the access token is issued. |
| `scope` | String | Permissions granted by the user. The `email` scope is **not** returned in `scope` even if granted. |
| `token_type` | String | `Bearer` |

```json
{
  "access_token": "bNl4YEFPI/hjFWhTqexp4MuEw5YPs...",
  "expires_in": 2592000,
  "id_token": "eyJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "Aa1FdeggRhTnPNNpxr8p",
  "scope": "profile",
  "token_type": "Bearer"
}
```

> **Backend tolerance:** New/changed LINE Login features may change the payload
> JSON structure — added properties, reordered properties, added/removed
> whitespace. Design the backend to tolerate unexpected structures.

Full endpoint detail (request body fields including the PKCE `code_verifier`)
is in `api-reference.md`. ID token handling is in `id-tokens-and-jwt.md`.
After obtaining a token you can fetch the friendship status, manage access
tokens, and manage users (see `users-and-friendship.md` and
`access-tokens.md`).
