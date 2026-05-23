# Access Tokens — Lifecycle & Secure Login Process

Source:
- `https://developers.line.biz/en/docs/line-login/managing-access-tokens/`
- `https://developers.line.biz/en/docs/line-login/managing-access-tokens-v2/`
- `https://developers.line.biz/en/docs/line-login/secure-login-process/`

An **access token** verifies that an app has been granted permission to access
a user's data on the LINE Platform (user ID, display name, profile image,
status message). Every LINE Login API call requires an access token (or a
refresh token, for refreshing) returned by an earlier response.

## Table of contents

- Getting the user's access token
- Access token & refresh token validity (v2.1 and v2.0)
- Refreshing an access token
- Verifying an access token
- Secure login process between a native app and your server
  - Register new users with access tokens
  - Register new users with OpenID (ID token + nonce)

---

## Getting the user's access token

An access token is returned by the LINE Platform once user authentication is
complete; at that point the app has permission to access user data. How you
obtain it depends on the integration:

- **Web app** — exchange the authorization code (see `web-login-flow.md`).
- **iOS / Android / Unity** — use the corresponding LINE SDK.
- **LINE SDK for Flutter** — see the Flutter SDK docs.
- **LIFF app** — the LIFF SDK provides the access token.

---

## Access token & refresh token validity

### LINE Login v2.1

| Token | Validity |
|---|---|
| Access token | **30 days** from issuance. Any response carrying an access token also includes `expires_in` — the seconds remaining until expiry. |
| Refresh token | Valid for up to **90 days after the corresponding access token was issued**. If it expires, you must prompt the user to log in again. |

A refresh token is returned alongside the access token once authentication
completes.

### LINE Login v2.0 (deprecated)

| Token | Validity |
|---|---|
| Access token | **30 days** from issuance. `expires_in` carries the seconds remaining. |
| Refresh token | Valid for up to **90 days after the access token was issued**. (The v2.0 API reference also states the refresh token is "valid for up to 10 days after the access token expires" for the issued token.) If it expires, the user must log in again. |

---

## Refreshing an access token

When an access token expires, use the refresh token to get a new one. Refresh
does **not** extend the refresh token's own validity period.

- **v2.1**: `POST https://api.line.me/oauth2/v2.1/token` with
  `grant_type=refresh_token`.
- **v2.0**: `POST https://api.line.me/v2/oauth/accessToken` with
  `grant_type=refresh_token`.

Full request/response detail is in `api-reference.md` ("Refresh access token").

---

## Verifying an access token

Verify any access token you receive from an app or external server **before
using it on your own servers**.

- **v2.1**: `GET https://api.line.me/oauth2/v2.1/verify?access_token=...`
- **v2.0**: `POST https://api.line.me/v2/oauth/verify`

After a successful verification, the response contains `client_id` (the
channel ID) and `expires_in`. **Before using the access token, confirm:**

| Property | Required criterion |
|---|---|
| `client_id` | Same as the channel ID of the LINE Login channel linked to your app. |
| `expires_in` | A positive value. |

See `api-reference.md` for endpoint details.

---

## Secure login process between a native app and your server

When implementing LINE Login in a **native app via the LINE SDK**, design user
registration and login carefully. These are design guides, not templates —
build a safe system with a full understanding of the risks.

### Information that's safe vs unsafe to send to your server

Information vulnerable to spoofing — **do not have the client send these
directly to your server**:

- ❌ User profile details
- ❌ Channel IDs

Instead, the client should send tokens; the server uses them to get reliable
information directly from the LINE Platform:

- ✅ Access tokens
- ✅ ID tokens

### Register new users with access tokens

If the client sends profile information directly to your server, you are
vulnerable to attacks. Instead:

1. The client app sends the **access token** to the server.
2. The server **verifies the access token** —
   `GET /oauth2/v2.1/verify`.
3. After a successful verify, the server confirms:
   - `client_id` equals the channel ID of the LINE Login channel linked to the
     native app.
   - `expires_in` is a positive value.
4. The server retrieves the user profile directly from the LINE Platform —
   `GET /v2/profile`.

### Register new users with OpenID (ID token)

If the app supports **OpenID Connect**, it is not necessary to verify an
access token. Instead:

1. The client app sends the **ID token** to the server.
2. The server validates the ID token via the LINE Platform endpoint —
   `POST /oauth2/v2.1/verify` — to obtain user profile information.

**nonce (number used once):** a randomly generated number that makes each
login attempt uniquely identifiable. Using `nonce` correctly helps prevent
replay attacks. Pass `nonce` in the authorization request, and verify it when
validating the ID token.

For platform-specific server-side handling of the ID token and nonce, see the
LINE SDK for iOS Swift / Android "Using ID token on your server" pages.

See also `id-tokens-and-jwt.md` for ID token structure and the security
checklist in `pkce-and-security.md`.
