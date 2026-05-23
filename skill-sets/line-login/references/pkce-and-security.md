# PKCE, Security Checklist & Development Guidelines

Source:
- `https://developers.line.biz/en/docs/line-login/integrate-pkce/`
- `https://developers.line.biz/en/docs/line-login/security-checklist/`
- `https://developers.line.biz/en/docs/line-login/development-guidelines/`
- `https://developers.line.biz/en/docs/line-login/how-to-handle-auto-login-failure/`

## Table of contents

- PKCE for LINE Login (the 4 steps, `code_verifier`, `code_challenge`)
- LINE Login security checklist
- LINE Login development guidelines (prohibited / required / recommended)
- Handling auto login failure (`disable_auto_login`)

---

# PKCE for LINE Login

**PKCE (Proof Key for Code Exchange)** is the OAuth 2.0 extension defined in
**RFC 7636**, intended to combat authorization-code interception attacks.

Without PKCE, the OAuth 2.0 flow is vulnerable: if a malicious app obtains the
callback URI containing the authorization code, it can steal the user's access
token. With PKCE, even if a malicious app steals the redirection data, it is
checked against a unique `code_challenge`, preventing access-token theft.
LINE recommends implementing PKCE.

Additional benefit: accessing a PKCE-enabled LINE Login web app from the
Yahoo! JAPAN app enables auto login (skipping email/password login).

## The 4 steps

Implement PKCE on top of the normal
[web login flow](web-login-flow.md):

1. Generate `code_verifier`.
2. Generate `code_challenge` from the `code_verifier` of step 1.
3. Redirect the user to the authorization URL with `code_challenge` and
   `code_challenge_method` (from step 2) added as query parameters.
4. Add the `code_verifier` of step 1 to the "Issue access token" request body
   and execute it.

PKCE adds three parameters to the LINE Login "Authorization URL" and "Issue
access token" endpoints: `code_verifier`, `code_challenge`,
`code_challenge_method`.

## Step 1 — Generate `code_verifier`

A unique `code_verifier` is generated on the web app when the user starts a
LINE Login. Spec per RFC 7636.

| Parameter | Spec | Example |
|---|---|---|
| `code_verifier` | **Available characters**: a random string of half-width alphanumerics (`a`-`z`, `A`-`Z`, `0`-`9`) and the symbols `-._~`. **Length**: 43–128 characters. | `wJKN8qz5t8SSI9lMFhBB6qwNkQBkuPZoCxzRhwLRUo1` |

Sample (Node.js):

```js
// randomAlphaNumericString() is supposed to be a function that generates and returns a random string consisting of
// available characters (half-width alphanumeric characters and symbols) for the integer specified in the argument (43 to 128).
const code_verifier = randomAlphaNumericString(43);
```

## Step 2 — Generate `code_challenge`

Hash the `code_verifier` with **SHA256**, then encode it in **Base64URL**
format.

| Parameter | Spec | Example |
|---|---|---|
| `code_challenge` | The `code_verifier` hashed with SHA256 and encoded in Base64URL format. | `BSCQwo_m8Wf0fpjmwkIKmPAJ1A7tiuRSNDnXzODS7QI` |

**Base64URL conversion** (RFC 4648 §5) — convert a normal Base64 string so it
is URL-safe:

- Remove padding (`=`)
- Replace `+` with `-`
- Replace `/` with `_`

| Base64 example | After deletion & replacement for `code_challenge` |
|---|---|
| `BSCQwo_m8Wf0fpjmwk+KmPAJ1A/tiuRSNDnXzODS7==` | `BSCQwo_m8Wf0fpjmwk-KmPAJ1A_tiuRSNDnXzODS7` |

Sample (Node.js):

```js
// This sample code uses the Node.js "crypto" module.
// See: https://nodejs.org/api/crypto.html#crypto_crypto
const crypto = require("crypto");

// Encode BASE64 format into BASE64URL format.
function base64UrlEncode(str) {
    return str
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Hash code_verifier with SHA256 and encode it into BASE64URL format to generate code_challenge.
const code_challenge = base64UrlEncode(crypto
    .createHash('sha256')
    .update(code_verifier)
    .digest('base64'));
```

## Step 3 — Add `code_challenge` and `code_challenge_method` to the authorization URL

Include both in the query parameters of the normal LINE Login authorization
URL.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `code_challenge` | String | Optional | The `code_challenge` generated in step 2. Default `null`; if omitted, the request does not support PKCE. |
| `code_challenge_method` | String | Optional | `S256` (= the hash function SHA256). RFC 7636 §4.2 also defines `plain`, but **LINE Login only supports `S256`** for security reasons. |

```sh
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fauth%3Fkey%3Dvalue&state=12345abcde&scope=profile%20openid&nonce=09876xyz
&code_challenge={The value of code_challenge calculated in step 2}&code_challenge_method=S256
```

## Step 4 — Issue an access token with `code_verifier`

Add `code_verifier` to the request body of the
[Issue access token](api-reference.md#issue-access-token) endpoint.

**Request body parameter** — `code_verifier` (String, optional): the
`code_verifier` generated in step 1 (e.g.
`wJKN8qz5t8SSI9lMFhBB6qwNkQBkuPZoCxzRhwLRUo1`).

```sh
curl -v -X POST https://api.line.me/oauth2/v2.1/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=authorization_code' \
-d 'code=1234567890abcde' \
--data-urlencode 'redirect_uri=https://example.com/auth?key=value' \
-d 'client_id=1234567890' \
-d 'client_secret=1234567890abcdefghij1234567890ab' \
-d 'code_verifier={The code_verifier generated in step 1}'
```

---

# LINE Login security checklist

Validate your application against this checklist before publishing. The
checklist is excerpts of points needing special attention — conforming to it
does **not** guarantee security; build a safe system with a full understanding
of the risks.

> **"Callback URL"** = the **Callback URL** on the **LINE Login** tab of the
> LINE Login channel in the LINE Developers Console.

### Checklist — query parameters passed to the authorization URL

| Check | Reference |
|---|---|
| Is the URL scheme specified in `redirect_uri` HTTPS (unless there is a specific reason not to)? | RFC 6749 §3.1.2.1 |
| Do you understand that a valid `redirect_uri` is one of: a URL that exactly matches the registered **Callback URL**, or the registered **Callback URL** with optional query parameters added? | RFC 6749 §3.1.2; "Authenticating users and making authorization requests" |
| If a query parameter received by the registered **Callback URL** takes an arbitrary URL and redirects, have you verified there is no Open Redirector vulnerability? | RFC 6749 §10.15 |
| Is the `state` value randomly generated, unique, cryptographically secure, and unpredictable (e.g. SecureRandom), so a third party cannot predict it? | RFC 6749 §10.12 |
| Is the `state` value stored where a third party cannot access it (server session info; cookies protected by the same-origin policy)? | RFC 6749 §10.12 |
| Is a **different** `state` value used each time a login is attempted, even for the same user? | RFC 6749 §10.12 |

### Checklist — query parameters returned to the callback URL

| Check | Reference |
|---|---|
| Do you confirm that the returned `state` matches the `state` specified in the authorization URL? | RFC 6749 §10.12; "Receiving the authorization response or error response with a web app" |

### Checklist — issuing the access token

| Check | Reference |
|---|---|
| Do you understand that the channel secret specified in `client_secret` is confidential information that a third party must not know? | OpenID Connect 1.0 §16.19 |

### Checklist — using ID tokens and access tokens

| Check | Reference |
|---|---|
| Have you verified ID tokens and access tokens? | "Verify access token validity"; "Verify ID token" |
| After successfully verifying the access token, have you checked that `client_id` equals the channel ID of the LINE Login channel linked to the native app, and that `expires_in` is a positive value? | "Using access tokens to register new users" |

### Checklist — sending ID/access tokens to the backend server

| Check | Reference |
|---|---|
| Did you send the **raw** ID tokens or access tokens from the client to the backend server (instead of user IDs or other info)? After calling the verify APIs, the backend can retrieve the user ID and other info. | "Using access tokens to register new users" |
| Have you verified the ID tokens and access tokens sent from the client to the backend server? | "Using access tokens to register new users" |

---

# LINE Login development guidelines

The basic rules of LINE Login development are based on the
[Terms and Policies](https://developers.line.biz/en/terms-and-policies/).

## Prohibited — mass requests to the LINE Platform

Do **not** send a large number of authorization requests or LINE Login API
requests to the LINE Platform for load-testing purposes. For load testing, use
a test environment that does not generate large numbers of requests to the
LINE Platform. Exceeding the rate limit returns `429 Too Many Requests`.

## Required — deauthorize your app when a user unregisters

When a user unregisters from your app, or terminates the link between your app
and the LINE app, you **must**:

1. Deauthorize the permissions the user granted, using the
   [Deauthorize your app](api-reference.md#deauthorize-your-app-to-which-the-user-has-granted-permissions)
   endpoint (`POST /user/v1/deauthorize`) on behalf of the user.
2. State, near the relevant function or in the terms the user agrees to at
   registration/authorization, what happens on unregistration — e.g. "If you
   unsubscribe from the service, LY Corporation will be notified that you have
   unsubscribed and the link between the service and the LINE app will be
   terminated."

When a user logs in and authorizes the app on the consent screen, the app
appears under **Settings → Account → Authorized apps** in the LINE app.
Deauthorize the app so permissions do not remain after the user unregisters.

## Recommended — saving logs

Save logs of authorization requests and LINE Login API requests for a period
so you can investigate problems. **LINE does not provide these logs** — the
developer must save them.

**Authorization request log:**

| Time the authorization request was made | Parameter of the authorization request |
|---|---|
| Mon, 16 Jul 2021 10:20:10 GMT | `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=xxxxxxxxxx...` |

**Authorization code / error response log:**

| Time the response was received | Request method | Log of authorization code or error response |
|---|---|---|
| Mon, 16 Jul 2021 10:20:20 GMT | GET | `/callback?code=Zfl2WjsWcn2XBBWApcty&state=n5B9b9FR2BWjloDzEskZMmGysITRTYpjLkM6oD5qfmA` |

**LINE Login API request log:**

| Request ID (`x-line-request-id`) | Time the API request was made | Request method | API endpoint | Status code |
|---|---|---|---|---|
| 8d48c8577e739b9c | Mon, 16 Jul 2021 10:20:22 GMT | POST | `https://api.line.me/oauth2/v2.1/token` | 200 |

Optionally also store, for investigation: the LINE Login API request body, and
the response body returned by the LINE Platform.

---

# Handling auto login failure

For web apps with LINE Login, [auto login](web-login-flow.md) may fail when
private browsing is enabled, or due to undocumented OS behavior. Two failure
cases:

## Case 1 — auto login on the LINE app fails

When auto login on the LINE app fails (e.g. private browsing), the user is
**still redirected to the callback URL with `code` and `state`** — but the
`code` is an **invalid value** (you cannot issue an access token with it) and
the `state` **does not match** the value associated with the login session.

### Detecting the failure

Detect auto login failure via the **`state` parameter**: when login fails on
the LINE app, the `state` given to the callback URL will not match the `state`
set in the authorization URL. Design the web app to account for auto login
failure when there is a `state` mismatch.

> A `state` mismatch may also be caused by a third-party attack such as CSRF
> (RFC 6749 §10.12). It is **impossible to tell** whether a `state` mismatch is
> due to auto login failure or an attack. Handle the case of an unintentional
> auto login failure when a `state` mismatch occurs.

### When auto login fails — recommended responses

In environments where auto login fails, prompting the user to retry with an
authorization URL that still has auto login enabled causes repeated failures.
Once auto login fails, prompt the user to retry with auto login **disabled**
using `disable_auto_login=true`. Two recommended responses:

**A. Display an error message and prompt re-login.** Show a login-failure
message and prompt the user to retry. Since this is shown after auto login
failed, disable auto login when prompting — set `disable_auto_login=true` in
the authorization URL:

```
https://access.line.me/oauth2/v2.1/authorize?disable_auto_login=true&response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fauth%3Fkey%3Dvalue&state=12345abcde&scope=profile%20openid&nonce=09876xyz
```

Recommended: include a link to the LINE Help Center page "I can't
automatically log in to a website with LINE"
(`https://help.line.me/line/ios/sp?lang=en&contentId=20020693`).

**B. Redirect directly to an authorization URL without auto login.** Redirect
the failed user directly to the authorization URL with auto login disabled
(`disable_auto_login=true`), so the login screen is shown without the user
being aware auto login failed. You can optionally show a redirect message
first.

## Case 2 — Universal Links / App Links don't work and the LINE app won't launch

LINE uses **Universal Links** (iOS) and **App Links** (Android) to perform auto
login on external browsers. Universal Links / App Links may not work in
external browsers or some in-app browsers — the LINE app won't launch and the
**email-address login** screen appears instead. This depends on undocumented
OS behavior, which the LINE Platform may not be able to avoid.

### Notes on making Universal Links work on iOS

Universal Links may not work when:

- The user is redirected to the authorization URL by **JavaScript**.
- The user types the URL and goes directly to the authorization URL.

Workaround: have the user tap a button to go to the authorization URL and
start the login process.
