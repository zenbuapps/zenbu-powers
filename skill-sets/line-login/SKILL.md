---
name: line-login
description: >-
  LINE Login official reference at API-reference depth. Covers the entire LINE
  Login documentation section: the OAuth 2.0 authorization code grant flow,
  OpenID Connect (OIDC) integration, the web login flow, every authorization
  URL query parameter, every scope, every API endpoint, ID token (JWT)
  structure and verification, access/refresh token lifecycle, the add friend
  option, PKCE, security hardening, and both LINE Login v2.1 and the deprecated
  v2.0. Use this skill whenever the task touches social login with LINE
  accounts: integrating LINE Login into a web app or website, building the
  authorization request to access.line.me/oauth2/v2.1/authorize, handling the
  authorization code / state callback, exchanging the code for an access token
  at api.line.me/oauth2/v2.1/token, requesting the profile / openid / email
  scopes, verifying an access token, refreshing or revoking tokens, getting a
  user profile, decoding or verifying an ID token (iss / sub / aud / nonce /
  amr / exp), the userinfo endpoint, the friendship status endpoint,
  deauthorizing an app, implementing PKCE (code_verifier / code_challenge /
  code_challenge_method=S256), the bot_prompt add-friend option, auto login /
  SSO login / QR code login / email login authentication methods, two-factor
  authentication, handling auto login failure with disable_auto_login, the
  response_mode / JARM JWT-secured response, the LINE Login button design
  guidelines, the LINE URL scheme, and the LINE Login security checklist.
  Trigger on mentions of: LINE Login, LINE social login, "Log in with LINE",
  developers.line.biz/docs/line-login, access.line.me, api.line.me/oauth2/v2.1,
  oauth2/v2.1/authorize, oauth2/v2.1/token, oauth2/v2.1/verify,
  oauth2/v2.1/userinfo, oauth2/v2.1/revoke, friendship/v1/status,
  user/v1/deauthorize, /v2/profile, LINE Login channel, channel ID, channel
  secret, callback URL, authorization code, access token, refresh token, ID
  token, id_token, code_verifier, code_challenge, PKCE, bot_prompt, add friend
  option, friendship_status_changed, LINE OpenID provider, openid-configuration,
  amr, nonce, state parameter, LINE auto login, LINE SSO login, LINE SDK login.
---

# LINE Login Reference

API-reference-level coverage of **LINE Login**, extracted from the official
documentation section at `https://developers.line.biz/en/docs/line-login/`
plus the LINE Login v2.1 / v2.0 API references at
`https://developers.line.biz/en/reference/line-login/` and
`/en/reference/line-login-v2/`.

LINE Login is a free social-login service built on the **OAuth 2.0
authorization code grant flow** + **OpenID Connect**. This skill splits the
documentation into topic-scoped reference files. **Read the reference file
that matches the task — do not guess endpoint paths, query parameter names,
scope strings, or JWT claim names.**

## When this skill applies

Any work that lets users sign in with their LINE account: integrating LINE
Login into a web app, constructing the authorization URL, handling the
callback (`code` + `state`), exchanging the code for an access token,
requesting scopes, verifying/refreshing/revoking tokens, decoding ID tokens,
fetching the user profile, the add-friend option, PKCE, security review, or
maintaining a legacy v2.0 integration. Works for raw HTTP calls (`curl`,
`fetch`, `axios`, `requests`) and is the server-side counterpart of the LINE
SDKs for iOS / Android / Unity (the SDKs perform native-app login but call
these same OAuth/profile endpoints).

## Two host names — pick the right one

| Host | Used for |
|---|---|
| `access.line.me` | The authorization endpoint (`/oauth2/v2.1/authorize`), the OpenID provider config (`/.well-known/openid-configuration`), the `iss` value of ID tokens. v2.0 uses `access.line.me/dialog/oauth/weblogin`. |
| `api.line.me` | Every API endpoint: token issue/verify/refresh/revoke, userinfo, `/v2/profile`, friendship status, deauthorize, the JWK set (`/oauth2/v2.1/certs`). |

## Version selector — v2.1 vs v2.0

| Version | Status | Use it for |
|---|---|---|
| **LINE Login v2.1** | Active | All new integrations. OAuth 2.0 + OpenID Connect, ID tokens, `email` scope, PKCE, two-factor auth. Endpoints under `/oauth2/v2.1/`. |
| LINE Login v2.0 | **Deprecated** (end-of-life TBD) | Legacy maintenance only. OAuth 2.0 without OpenID Connect; no ID token, no `email`. Endpoints under `/v2/oauth/`. Migrate to v2.1. |
| LINE Login v1 | End-of-life (2018-06-30) | Discontinued; not covered. |

Do not mix v2.1 and v2.0 endpoints/parameters. A v2.1 integration must use
`/oauth2/v2.1/token`; a v2.0 integration uses `/v2/oauth/accessToken`.

## Reference file map

| File | Contents |
|---|---|
| `references/web-login-flow.md` | The web login flow (OAuth 2.0 code grant + OIDC). Authorization request, every `authorize` query parameter, the scope table, authentication methods (auto login / email / QR / SSO), `response_mode`/JARM, the authorization response (`code`/`state`/`friendship_status_changed`/`liff*`), error responses + error codes, and exchanging the code for an access token. |
| `references/api-reference.md` | LINE Login v2.1 API reference at endpoint depth: common specs, status codes, all OAuth endpoints (issue / verify / refresh / revoke token, deauthorize, verify ID token, userinfo), Profile, Friendship status. Plus the full deprecated v2.0 API reference. |
| `references/id-tokens-and-jwt.md` | ID token (JWT) deep dive: header (`alg`/`typ`/`kid`), payload claims (`iss`/`sub`/`aud`/`exp`/`iat`/`auth_time`/`nonce`/`amr`/`name`/`picture`/`email`), signature & verification keys (`ES256` vs `HS256`), the Verify ID token endpoint, OIDC discovery / JWK set. |
| `references/access-tokens.md` | Access & refresh token lifecycle and validity periods, refreshing, revoking, verifying. The secure login process between a native app and your server (send tokens, never profile data; post-verification `client_id`/`expires_in` checks). |
| `references/users-and-friendship.md` | Getting user profiles (`/v2/profile`), logging users out, the add-friend option (`bot_prompt`, linking a LINE Official Account, `friendship_status_changed`, friendship status API), and managing authorized apps / revoked consent. |
| `references/pkce-and-security.md` | PKCE for LINE Login (generate `code_verifier`/`code_challenge`, S256, the 4 steps), the LINE Login security checklist, the LINE Login development guidelines, and handling auto login failure (`disable_auto_login`). |
| `references/setup-and-resources.md` | Getting started: creating and configuring a LINE Login channel (channel settings, callback URL, email-address permission application), the LINE Login overview (auth methods, two-factor authentication, versions), the LINE Login button design guidelines, the LINE URL scheme, and the v2.0 web-app integration guide. |

## Quick endpoint & flow index

The web login flow in order:

```
1. User clicks "Log in with LINE"
2. Redirect to  GET https://access.line.me/oauth2/v2.1/authorize
                ?response_type=code&client_id=&redirect_uri=&state=&scope=&nonce=
3. User authenticates + consents on the LINE Platform
4. Redirect back to callback URL with ?code=&state=   (verify state!)
5. Exchange:    POST https://api.line.me/oauth2/v2.1/token   (grant_type=authorization_code)
                → access_token, refresh_token, id_token, expires_in, scope, token_type
6. Use the access token / verify the id_token
```

```
POST   https://api.line.me/oauth2/v2.1/token       Issue access token (authorization_code) / Refresh (refresh_token)
GET    https://api.line.me/oauth2/v2.1/verify      Verify access token validity (?access_token=)
POST   https://api.line.me/oauth2/v2.1/verify      Verify ID token (id_token + client_id [+ nonce] [+ user_id])
POST   https://api.line.me/oauth2/v2.1/revoke      Revoke access token (access_token + client_id + client_secret)
GET    https://api.line.me/oauth2/v2.1/userinfo    Get user information (sub/name/picture)  — scope: openid
POST   https://api.line.me/oauth2/v2.1/userinfo    Get user information (same)
GET    https://api.line.me/v2/profile              Get user profile (userId/displayName/pictureUrl/statusMessage) — scope: profile
GET    https://api.line.me/friendship/v1/status    Get friendship status (friendFlag) — scope: profile
POST   https://api.line.me/user/v1/deauthorize     Deauthorize your app for a user → 204

GET    https://access.line.me/oauth2/v2.1/authorize    Authorization endpoint (browser redirect)
GET    https://api.line.me/oauth2/v2.1/certs           JWK set for ES256 ID-token verification
GET    https://access.line.me/.well-known/openid-configuration   OpenID provider config

# Deprecated LINE Login v2.0
GET    https://access.line.me/dialog/oauth/weblogin    v2.0 authorization endpoint
POST   https://api.line.me/v2/oauth/accessToken        v2.0 issue / refresh access token
POST   https://api.line.me/v2/oauth/verify             v2.0 verify access token
POST   https://api.line.me/v2/oauth/revoke             v2.0 revoke (takes refresh_token)
```

## Working rules

- **Always generate a fresh, cryptographically-random `state` per login session**
  and verify it on the callback. A `state` mismatch means either CSRF or an
  auto-login failure — handle both.
- The authorization `code` is **single-use** and valid for **10 minutes**.
- `access_token` is valid **30 days**; `refresh_token` is valid **90 days from
  when the access token was issued** (v2.1). v2.0 refresh tokens are valid only
  **10 days after the access token expires**.
- Scopes: `profile` → profile API; `openid` → ID token + userinfo; `email` →
  email in the ID token (requires a separate application in the Console).
  Separate multiple scopes with a URL-encoded space (`%20`).
- An ID token from **web login is signed `HS256`** (verify with the channel
  secret); from a **LINE SDK / LIFF it is `ES256`** (verify with the JWK at
  `/oauth2/v2.1/certs`). Always verify before trusting the token.
- Never trust profile data sent from a client. Send the **raw access/ID token**
  to your server and have the server verify it and fetch the profile itself.
- After verifying an access token, confirm `client_id` equals your channel ID
  and `expires_in` is positive.
- `userId` is per-provider and immutable; do not identify users by display
  name, picture, or status message.
- When a user unregisters from your app, you **must** call
  `POST /user/v1/deauthorize` (development-guidelines requirement).
- v2.1 token endpoints ignore `client_secret` for channels whose App type
  includes **Mobile app**; it is required for **Web app**-only channels.
