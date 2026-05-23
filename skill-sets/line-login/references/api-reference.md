# LINE Login API Reference (v2.1 + v2.0)

Source:
- `https://developers.line.biz/en/reference/line-login/` (v2.1 — Active)
- `https://developers.line.biz/en/reference/line-login-v2/` (v2.0 — Deprecated)

Endpoint-level reference for the LINE Login API. All endpoints are on host
`api.line.me`. The browser-facing authorization endpoint
(`access.line.me/oauth2/v2.1/authorize`) is documented in `web-login-flow.md`.

## Table of contents

- Common specifications (rate limits, status codes, response headers)
- **v2.1 — OAuth**: Issue access token, Verify access token validity, Refresh
  access token, Revoke access token, Deauthorize app, Verify ID token, Get
  user information (userinfo)
- **v2.1 — Profile**: Get user profile
- **v2.1 — Friendship**: Get friendship status
- **v2.0 (deprecated)**: Issue / Verify / Refresh / Revoke access token, Get
  user profile

---

# Common specifications (v2.1 and v2.0)

## Rate limits

If you send a large number of requests within a short period and it is
determined to affect the LINE Platform, requests may be temporarily
restricted. **Rate limit thresholds are not disclosed.** Do not send large
numbers of requests for any purpose, including load testing.

## Status codes

Follows the HTTP status code specification (RFC 7231 §6) unless stated.

| Status code | Description |
|---|---|
| 200 OK | The request succeeded. |
| 400 Bad Request | Problem with the request. Check request parameters and JSON format. |
| 401 Unauthorized | Check that the authorization header is correct. |
| 403 Forbidden | Not authorized to use the API. Confirm your account/plan is authorized. |
| 413 Payload Too Large | Request exceeds the 2 MB max. Make it smaller and retry. |
| 429 Too Many Requests | Requests temporarily restricted because the rate limit was exceeded. |
| 500 Internal Server Error | Temporary error on the API server. |

## Response headers

| Response header | Description |
|---|---|
| `x-line-request-id` | Request ID. Issued for each request. (v2.1) |

---

# LINE Login v2.1 — OAuth

## Issue access token

`POST https://api.line.me/oauth2/v2.1/token`

Issues access tokens. An access token attests that an app has permission to
access user data on the LINE Platform.

**Request headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/x-www-form-urlencoded` (required) |

**Request body**

| Param | Type | Required | Description |
|---|---|---|---|
| `grant_type` | String | Required | `authorization_code` |
| `code` | String | Required | Authorization code received from the LINE Platform. |
| `redirect_uri` | String | Required | Same value as `redirect_uri` in the authorization request. |
| `client_id` | String | Required | Channel ID (LINE Developers Console). |
| `client_secret` | String | Required | Channel secret (LINE Developers Console). |
| `code_verifier` | String | Optional | A random 43–128 char string of single-byte alphanumerics and symbols (e.g. `wJKN8qz5t8SSI9lMFhBB6qwNkQBkuPZoCxzRhwLRUo1`). If the channel implements PKCE, include it to verify the `code_verifier` before the access token is returned. See `pkce-and-security.md`. |

```sh
curl -v -X POST https://api.line.me/oauth2/v2.1/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=authorization_code' \
-d 'code=1234567890abcde' \
--data-urlencode 'redirect_uri=https://example.com/auth?key=value' \
-d 'client_id=1234567890' \
-d 'client_secret=1234567890abcdefghij1234567890ab' \
-d 'code_verifier=wJKN8qz5t8SSI9lMFhBB6qwNkQBkuPZoCxzRhwLRUo1'
```

**Response** — `200` with JSON:

| Property | Type | Description |
|---|---|---|
| `access_token` | String | Access token. Valid for 30 days. |
| `expires_in` | Number | Seconds until the access token expires. |
| `id_token` | String | A JWT with information about the user. Returned only if the `openid` scope was requested. |
| `refresh_token` | String | Refresh token. Valid 90 days after the access token is issued. |
| `scope` | String | Permissions granted to the access token. `email` is not returned here even if granted. |
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

> JSON object structure in responses/ID tokens may change as features evolve
> (added/reordered properties, whitespace/line-break changes, varying data
> size). Design the backend to tolerate differently-structured payloads.

## Verify access token validity

`GET https://api.line.me/oauth2/v2.1/verify`

Verifies whether an access token is valid.

**Query parameters**

| Param | Required | Description |
|---|---|---|
| `access_token` | Required | The access token. |

```sh
curl -v -X GET \
'https://api.line.me/oauth2/v2.1/verify?access_token=eyJhbGciOiJIUzI1NiJ9.UnQ_o-GP0VtnwDjbK0C8E_NvK...'
```

**Response** — `200` with JSON:

| Property | Type | Description |
|---|---|---|
| `scope` | String | Permissions granted to the access token. |
| `client_id` | String | Channel ID the access token was issued for. |
| `expires_in` | Number | Seconds until the access token expires. |

```json
{ "scope": "profile", "client_id": "1440057261", "expires_in": 2591659 }
```

**Error response** — `400 Bad Request` if the access token has expired:

```json
{ "error": "invalid_request", "error_description": "access token expired" }
```

> After a successful verify, confirm `client_id` equals your channel ID and
> `expires_in` is positive before trusting the token.

## Refresh access token

`POST https://api.line.me/oauth2/v2.1/token`

Gets a new access token using a refresh token. Cannot refresh a Messaging API
channel access token.

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**

| Param | Type | Required | Description |
|---|---|---|---|
| `grant_type` | String | Required | `refresh_token` |
| `refresh_token` | String | Required | The refresh token for the access token to reissue. Valid up to 90 days after the access token was issued. If expired, the user must log in again. |
| `client_id` | String | Required | Channel ID. |
| `client_secret` | String | See description | Channel secret. **Required** for channels whose **App types** is only **Web app**. **Ignored** if **App types** is **Mobile app** (only) or **Mobile app + Web app**. |

```sh
curl -v -X POST https://api.line.me/oauth2/v2.1/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=refresh_token&refresh_token={your_refresh_token}&client_id={your_channel_id}&client_secret={your_channel_secret}'
```

**Response**

| Property | Type | Description |
|---|---|---|
| `access_token` | String | New access token. Valid for 30 days. |
| `token_type` | String | `Bearer` |
| `refresh_token` | String | The refresh token you supplied. Refreshing does **not** extend the refresh token's validity period. |
| `expires_in` | Number | Seconds remaining until the access token expires. |
| `scope` | String | Permissions obtained through the access token. |

```json
{
  "token_type": "Bearer",
  "scope": "profile",
  "access_token": "bNl4YEFPI/hjFWhTqexp4MuEw...",
  "expires_in": 2591977,
  "refresh_token": "8iFFRdyxNVNLWYeteMMJ"
}
```

**Error response** — `400 Bad Request` if the refresh token expired:

```json
{ "error": "invalid_grant", "error_description": "invalid refresh token" }
```

## Revoke access token

`POST https://api.line.me/oauth2/v2.1/revoke`

Invalidates a user's access token. Cannot invalidate a Messaging API channel
access token.

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**

| Param | Type | Required | Description |
|---|---|---|---|
| `access_token` | String | Required | The access token. |
| `client_id` | String | Required | Channel ID. |
| `client_secret` | String | See description | Channel secret. **Required** for **Web app**-only channels. **Ignored** for channels whose App types is **Mobile app** (only) or **Mobile app + Web app**. |

```sh
curl -v -X POST https://api.line.me/oauth2/v2.1/revoke \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "client_id={channel id}&client_secret={channel secret}&access_token={access token}"
```

**Response** — `200` with an empty body.

## Deauthorize your app to which the user has granted permissions

`POST https://api.line.me/user/v1/deauthorize`

Deauthorizes your app on behalf of the user, revoking permissions previously
granted. Required when a user unregisters from your app (see the LINE Login
development guidelines in `pkce-and-security.md`). Also works for LIFF apps and
LINE MINI Apps.

**Request headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer {channel access token}` (required) |
| `Content-Type` | `application/json` |

The channel access token may be a channel access token v2.1 (user-specified
expiration) or a stateless channel access token. (Channel access tokens are a
Messaging API / LINE Platform basics concept — issued from the same channel.)

**Request body**

| Param | Type | Required | Description |
|---|---|---|---|
| `userAccessToken` | String | Required | Access token of the target user. |

```sh
curl -v -X POST https://api.line.me/user/v1/deauthorize \
-H 'Authorization: Bearer {channel access token}' \
-H 'Content-Type: application/json' \
-d '{
    "userAccessToken": "{user access token}"
}'
```

**Response** — `204` with an empty body.

**Error response**

| Code | Description |
|---|---|
| `400` | Invalid access token for the target user — the user already deauthorized your app, or you already deauthorized your app for this user via the API. |

```json
// 400 Bad Request — access token for the target user is invalid
{ "message": "invalid token" }
```

## Verify ID token

`POST https://api.line.me/oauth2/v2.1/verify`

ID tokens are JWTs with user information. An attacker can spoof an ID token —
use this call to verify a received ID token is authentic, then use it to get
the user's profile information and email.

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**

| Param | Type | Required | Description |
|---|---|---|---|
| `id_token` | String | Required | The ID token. |
| `client_id` | String | Required | Expected channel ID (unique channel identifier from the Console). |
| `nonce` | String | Optional | Expected `nonce` value (the value from the authorization request). Omit if `nonce` was not specified in the authorization request. |
| `user_id` | String | Optional | Expected user ID (from Get user profile). |

```sh
curl -v -X POST 'https://api.line.me/oauth2/v2.1/verify' \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'id_token=eyJraWQiOiIxNmUwNGQ0ZTU2NzgzYTc5MmRjYjQ2ODRkOD...' \
--data-urlencode 'client_id=1234567890'
```

**Response** — the ID token payload (claim definitions in `id-tokens-and-jwt.md`):

`iss`, `sub`, `aud`, `exp`, `iat`, `auth_time`, `nonce`, `amr`, `name`,
`picture`, `email`.

```json
{
  "iss": "https://access.line.me",
  "sub": "U1234567890abcdef1234567890abcdef",
  "aud": "1234567890",
  "exp": 1504169092,
  "iat": 1504263657,
  "nonce": "0987654asdf",
  "amr": ["pwd"],
  "name": "Taro Line",
  "picture": "https://sample_line.me/aBcdefg123456",
  "email": "taro.line@example.com"
}
```

**Error response** — a JSON object when verification fails:

| `error_description` | Cause |
|---|---|
| `Invalid IdToken.` | The ID token is malformed or the signature is invalid. |
| `Invalid IdToken Issuer.` | The ID token was generated on a site other than `https://access.line.me`. |
| `IdToken expired.` | The ID token has expired. |
| `Invalid IdToken Audience.` | The ID token's Audience differs from the request's `client_id`. |
| `Invalid IdToken Nonce.` | The ID token's Nonce differs from the request's `nonce`. |
| `Invalid IdToken Subject Identifier.` | The ID token's SubjectIdentifier differs from the request's `user_id`. |

```json
{ "error": "invalid_request", "error_description": "Invalid IdToken." }
```

## Get user information (userinfo)

`GET https://api.line.me/oauth2/v2.1/userinfo`
`POST https://api.line.me/oauth2/v2.1/userinfo`

Gets a user's ID, display name, and profile image. Requires an access token
with the **`openid`** scope. (Compare with Get user profile, which needs the
`profile` scope and also returns the status message.) Returns only the main
profile information — not the user's subprofile.

**Request headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer {access token}` (required) |

```sh
curl -v -X GET https://api.line.me/oauth2/v2.1/userinfo \
-H 'Authorization: Bearer {access token}'
```

**Response**

| Property | Type | Description |
|---|---|---|
| `sub` | String | User ID. |
| `name` | String | User's display name. Not included if the `profile` scope was not requested. |
| `picture` | String | User's profile image URL. Not included if the `profile` scope was not requested. |

```json
{
  "sub": "U1234567890abcdef1234567890abcdef",
  "name": "Taro Line",
  "picture": "https://profile.line-scdn.net/0h8pWWElvzZ19qLk3ywQYYCFZraTIdAGEXEhx9ak56MDxDHiUIVEEsPBspMG1EGSEPAk4uP01t0m5G"
}
```

---

# LINE Login v2.1 — Profile

## Get user profile

`GET https://api.line.me/v2/profile`

Gets a user's ID, display name, profile image, and status message. Requires an
access token with the **`profile`** scope. (Compare with Get user information
(userinfo), which needs `openid`.) Returns only the main profile information —
not the user's subprofile.

**Request headers**: `Authorization: Bearer {access token}` (required).

```sh
curl -v -X GET https://api.line.me/v2/profile \
-H 'Authorization: Bearer {access token}'
```

**Response**

| Property | Type | Description |
|---|---|---|
| `userId` | String | User ID. |
| `displayName` | String | User's display name. |
| `pictureUrl` | String | HTTPS profile image URL. Only included if the user has set a profile image. Append `/large` (200×200) or `/small` (51×51) for a thumbnail, e.g. `https://profile.line-scdn.net/abcdefghijklmn/large`. |
| `statusMessage` | String | User's status message. Not included if the user has no status message. |

```json
{
  "userId": "U4af4980629...",
  "displayName": "Brown",
  "pictureUrl": "https://profile.line-scdn.net/abcdefghijklmn",
  "statusMessage": "Hello, LINE!"
}
```

---

# LINE Login v2.1 — Friendship status

## Get friendship status

`GET https://api.line.me/friendship/v1/status`

Gets the friendship status between a user and the LINE Official Account linked
to your LINE Login channel. Requires an access token with the **`profile`**
scope. See `users-and-friendship.md` for the add-friend option.

**Request headers**: `Authorization: Bearer {access token}` (required).

```sh
curl -v -X GET https://api.line.me/friendship/v1/status \
-H 'Authorization: Bearer {access token}'
```

**Response**

| Property | Type | Description |
|---|---|---|
| `friendFlag` | Boolean | `true` if the user has added the linked LINE Official Account as a friend and has not blocked it; otherwise `false`. |

```json
{ "friendFlag": true }
```

---

# LINE Login v2.0 API reference (DEPRECATED)

> **LINE Login v2.0 is deprecated** with the end-of-life date to be determined.
> Use v2.1 for all new work. v2.0 has no OpenID Connect, no ID token, and no
> `email` scope. Endpoints are under `/v2/oauth/`.

## v2.0 — Issue access token

`POST https://api.line.me/v2/oauth/accessToken`

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**

| Param | Type | Required | Description |
|---|---|---|---|
| `grant_type` | String | Required | `authorization_code` |
| `code` | String | Required | Authorization code received from the LINE Platform. |
| `redirect_uri` | String | Required | Callback URL. |
| `client_id` | String | Required | Channel ID. |
| `client_secret` | String | Required | Channel secret. |

```sh
curl -v -X POST https://api.line.me/v2/oauth/accessToken \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=authorization_code' \
-d 'code=b5fd32eacc791df' \
-d 'redirect_uri=https%3A%2F%2Fexample.com%2Fauth' \
-d 'client_id=12345' \
-d 'client_secret=d6524edacc8742aeedf98f'
```

**Response** — `200` with JSON:

| Property | Type | Description |
|---|---|---|
| `access_token` | String | Access token. Valid for 30 days. |
| `expires_in` | Number | Seconds until the access token expires. |
| `refresh_token` | String | Refresh token. Valid for up to **10 days after the access token expires**. |
| `scope` | String | `P` = permission to access the user's profile information. |
| `token_type` | String | `Bearer` |

```json
{
    "access_token": "bNl4YEFPI/hjFWhTqexp4MuEw5YPs7qhr6dJDXKwNPuLka...",
    "expires_in": 2591977,
    "refresh_token": "8iFFRdyxNVNLWYeteMMJ",
    "scope": "P",
    "token_type": "Bearer"
}
```

## v2.0 — Verify access token validity

`POST https://api.line.me/v2/oauth/verify`

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**: `access_token` (String) — the access token.

```sh
curl -v -X POST https://api.line.me/v2/oauth/verify \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'access_token=bNl4YEFPI/hjFWhTqexp4MuEw5YPs7qhr6dJDXKwNPuLka...'
```

**Response** — `200` with JSON: `scope` (`P`), `client_id` (channel ID the
token was issued for), `expires_in` (seconds until expiry).

```json
{ "scope":"P", "client_id":"1350031035", "expires_in":2591965 }
```

**Error response** — `400 Bad Request` if expired:

```json
{ "error": "invalid_request", "error_description": "access_token invalid" }
```

## v2.0 — Refresh access token

`POST https://api.line.me/v2/oauth/accessToken`

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**

| Param | Type | Description |
|---|---|---|
| `grant_type` | String | `refresh_token` |
| `refresh_token` | String | The refresh token. Valid up to 10 days after the access token expires. If expired, the user must log in again. |
| `client_id` | String | Channel ID. |
| `client_secret` | String | Channel secret. |

```sh
curl -v -X POST https://api.line.me/v2/oauth/accessToken \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=refresh_token' \
--data-urlencode 'client_id={channel ID}' \
--data-urlencode 'client_secret={channel secret}' \
--data-urlencode 'refresh_token={refresh token}'
```

**Response** — `token_type` (`Bearer`), `scope` (`P`), `access_token`,
`expires_in`, `refresh_token`.

```json
{
   "token_type":"Bearer",
   "scope":"P",
   "access_token":"bNl4YEFPI/hjFWhTqexp4MuEw...",
   "expires_in":2591977,
   "refresh_token":"8iFFRdyxNVNLWYeteMMJ"
}
```

**Error response** — `400 Bad Request` if the refresh token expired:

```json
{ "error": "invalid_grant", "error_description": "invalid refresh_token" }
```

## v2.0 — Revoke access token

`POST https://api.line.me/v2/oauth/revoke`

Invalidates a user's access token. **Takes a `refresh_token`** (not the access
token, unlike v2.1's revoke).

**Request headers**: `Content-Type: application/x-www-form-urlencoded` (required).

**Request body**: `refresh_token` (String) — the refresh token of the access
token to invalidate.

```sh
curl -v -X POST https://api.line.me/v2/oauth/revoke \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'refresh_token={refresh token}'
```

**Response** — `200` with an empty body.

## v2.0 — Get user profile

`GET https://api.line.me/v2/profile`

Same endpoint and response shape as v2.1's Get user profile (`userId`,
`displayName`, `pictureUrl`, `statusMessage`). Both v2.0 and v2.1 share this
endpoint.

**Request headers**: `Authorization: Bearer {access token}` (required).

```sh
curl -v -X GET https://api.line.me/v2/profile \
-H 'Authorization: Bearer {access token}'
```

```json
{
  "userId":"U4af4980629...",
  "displayName":"Brown",
  "pictureUrl":"https://profile.line-scdn.net/abcdefghijklmn",
  "statusMessage":"Hello, LINE!"
}
```
