# ID Tokens (JWT) — Structure & Verification

Source: `https://developers.line.biz/en/docs/line-login/verify-id-token/`

The LINE Platform issues **ID tokens** compliant with **OpenID Connect**,
letting you securely obtain a user's profile information (user ID, display
name, profile picture, email address) from the LINE Platform.

With LINE Profile+ permission you can also obtain LINE Profile+ data (name,
gender, birthday, phone number, address) — a separate corporate option.

## Table of contents

- Getting an ID token
- ID token anatomy (header, payload, signature)
- Header claims
- Payload claims
- Signature & verification keys
- Verifying an ID token (two ways)
- OpenID provider configuration / JWK set

---

## Getting an ID token

You get an `id_token` alongside the access token when you
[exchange the authorization code for a token](web-login-flow.md) — **only if
the `openid` scope was requested**. In a LIFF app you can also call
`liff.getIDToken()`.

---

## ID token anatomy

An ID token is a **JSON Web Token (JWT)** consisting of three parts separated
by `.`:

```
{base64url(header)}.{base64url(payload)}.{base64url(signature)}
```

Each part is base64url-encoded. See RFC 7519 (JWT).

**Always validate the ID token using its signature.** Unless the ID token is
obtained directly from the LINE Platform (i.e. it came via a client), validate
it **on the server**.

You can validate by writing verification code yourself, or by calling the
[Verify ID token endpoint](api-reference.md#verify-id-token).

---

## Header claims

| Property | Type | Description |
|---|---|---|
| `alg` | String | ID token signature algorithm. For **native apps / LINE SDK / LIFF apps**, `ES256` (ECDSA using P-256 and SHA-256). For **web login**, `HS256` (HMAC using SHA-256). |
| `typ` | String | Payload format. `JWT`. |
| `kid` | String | Public key ID. Included **only when `alg` is `ES256`**. See the JWK spec (RFC 7517 §4.5). |

Example decoded header — `HS256` (web login):

```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```

Example decoded header — `ES256` (native / SDK / LIFF):

```json
{
  "typ": "JWT",
  "alg": "ES256",
  "kid": "a2a459aec5b65fa..."
}
```

---

## Payload claims

The user's information is in the payload. Only the **main profile
information** is available — not the user's subprofile.

| Property | Type | Description |
|---|---|---|
| `iss` | String | `https://access.line.me` — the URL where the ID token is generated. |
| `sub` | String | User ID for which the ID token is generated. |
| `aud` | String | Channel ID. |
| `exp` | Number | Expiration time of the ID token, UNIX time in seconds. |
| `iat` | Number | Time the ID token was generated, UNIX time in seconds. |
| `auth_time` | Number | Time the user was authenticated, UNIX time in seconds. **Not included** if `max_age` was not specified in the authorization request. |
| `nonce` | String | The `nonce` value specified in the authorization URL. **Not included** if `nonce` was not specified in the authorization request. |
| `amr` | Array of strings | List of authentication methods used by the user. **Not included** under certain conditions. One or more of: `pwd` (log in with email and password), `lineautologin` (LINE automatic login, including through the LINE SDK), `lineqr` (log in with QR code), `linesso` (log in with single sign-on), `mfa` (log in with two-factor authentication). |
| `name` | String | User's display name. **Not included** if the `profile` scope was not requested. |
| `picture` | String | User's profile image URL. **Not included** if the `profile` scope was not requested. |
| `email` | String | User's email address. **Not included** if the `email` scope was not requested. |

Example decoded payload:

```json
{
  "iss": "https://access.line.me",
  "sub": "U1234567890abcdef1234567890abcdef ",
  "aud": "1234567890",
  "exp": 1504169092,
  "iat": 1504263657,
  "nonce": "0987654asdf",
  "amr": ["pwd"],
  "name": "Taro Line",
  "picture": "https://sample_line.me/aBcdefg123456"
}
```

---

## Signature & verification keys

The signature is a hashed value of `base64url(header).base64url(payload)`,
preventing tampering. The hashing algorithm is given by the header's `alg`.
The key needed to validate the ID token differs per algorithm:

| Algorithm | Key for verification |
|---|---|
| `ES256` (ECDSA using P-256 and SHA-256) | The element in the JWK set at `https://api.line.me/oauth2/v2.1/certs` whose `kid` matches the `kid` in the header. |
| `HS256` (HMAC using SHA-256) | The **channel secret**. |

So: a **web-login** ID token (`HS256`) is verified with the channel secret; a
**native-app / LINE SDK / LIFF** ID token (`ES256`) is verified with the
matching public key from the JWK set.

For the full verification procedure, see "ID Token Validation" in OpenID
Connect Core 1.0.

---

## Verifying an ID token

### Option A — Verify ID token endpoint (recommended for server use)

`POST https://api.line.me/oauth2/v2.1/verify` validates the ID token and
returns the corresponding user's profile information and email address. You
just send the ID token, the LINE Login channel ID, and optionally the expected
`nonce` / `user_id`.

```sh
curl -v -X POST 'https://api.line.me/oauth2/v2.1/verify' \
 -d 'id_token=eyJraWQiOiIxNmUwNGQ0ZTU2NzgzYTc5MmRjYjQ2ODRkOD...' \
 -d 'client_id=1234567890'
```

Successful response (the verified payload):

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

Full request/response fields and the error table (`Invalid IdToken.`,
`Invalid IdToken Issuer.`, `IdToken expired.`, `Invalid IdToken Audience.`,
`Invalid IdToken Nonce.`, `Invalid IdToken Subject Identifier.`) are in
`api-reference.md` under "Verify ID token".

### Option B — verify the JWT yourself

Write verification code that:

1. Splits the JWT and base64url-decodes the header and payload.
2. Picks the verification key per the header `alg` (channel secret for
   `HS256`; JWK from `/oauth2/v2.1/certs` matching `kid` for `ES256`).
3. Recomputes and checks the signature.
4. Validates the claims per OIDC Core 1.0: `iss` is `https://access.line.me`,
   `aud` equals your channel ID, `exp` is in the future, and (if you sent
   them) `nonce` and the user ID match.

---

## OpenID provider configuration / JWK set

LINE Login supports **OpenID Connect Discovery 1.0**.

| Resource | URL |
|---|---|
| OpenID provider configuration document | `https://access.line.me/.well-known/openid-configuration` |
| JWK set (public keys for `ES256` verification) | `https://api.line.me/oauth2/v2.1/certs` |
