# Common Specifications & Channel Access Token

Source: `https://developers.line.biz/en/reference/messaging-api/`

## Table of contents

- Common specifications: domain name, rate limits, status codes, response headers, error responses
- Channel access token endpoints (v2.1 / stateless / short-lived)

---

# Common specifications

## Domain name

| Domain | Endpoints |
|---|---|
| `api-data.line.me` | Get content, Create audience by file, Add user IDs by file, Upload rich menu image, Download rich menu image |
| `api.line.me` | All other endpoints |

Same URL with a different HTTP method counts as a different endpoint for rate limiting.

## Rate limits

Per-channel, per-endpoint. Exceeding the limit returns `429 Too Many Requests`.

| Endpoints | Rate limit |
|---|---|
| Send narrowcast, Send broadcast, Get number of message deliveries, Get number of followers, Get friend demographics, Get user interaction statistics, Get statistics per unit, Test webhook endpoint | 60 / hour |
| Create / add audience (JSON & file), Create click/imp audience, Rename/Delete/Get audience, Get multiple audiences, Get shared audience(s) | 60 / minute |
| Set / Get webhook endpoint URL | 1,000 / minute |
| Create rich menu, Delete rich menu, Delete rich menu alias, Get rich menu batch progress | 100 / hour |
| Replace or unlink rich menus in batches | 3 / hour |
| Send multicast, Get/Get-list membership, Coupon create/discontinue/list/get | 200 / second |
| Display a loading animation | 100 / second |
| Issue short-lived channel access token | 370 / second |
| All other endpoints | 2,000 / second |

**Concurrent operations limit**: Create/add audience (JSON & file) endpoints — max 10 concurrent
operations per `audienceGroupId`. Jobs with `jobStatus` of `QUEUED` or `WORKING` count.

## Status codes

| Code | Meaning |
|---|---|
| 200 OK | Success |
| 400 Bad Request | Problem with the request |
| 401 Unauthorized | Missing/invalid channel access token |
| 403 Forbidden | Account/plan not authorized for the resource |
| 404 Not Found | Resource missing, e.g. user ID doesn't exist, not consented, not a friend, blocked |
| 409 Conflict | Same retry key already accepted |
| 410 Gone | Resource no longer available (e.g. content of an unsent message) |
| 413 Payload Too Large | Request exceeds 2 MB |
| 415 Unsupported Media Type | Uploaded media type unsupported |
| 429 Too Many Requests | Rate limit / concurrency limit / monthly message quota exceeded |
| 500 Internal Server Error | Server error |

## Response headers

| Header | Meaning |
|---|---|
| `X-Line-Request-Id` | Request ID, issued per request |
| `X-Line-Accepted-Request-Id` | (Not always) If a request with the same retry key was already accepted, the `x-line-request-id` of that accepted request |

## Error responses

Error body JSON:

| Property | Type | Description |
|---|---|---|
| `message` | String | Information about the error |
| `details` | Array | (Not always) Array of error detail objects; omitted if empty |
| `details[].message` | String | (Not always) Detail of the error |
| `details[].property` | String | (Not always) JSON field name / query parameter where the error occurred |

```json
{
  "message": "The request body has 2 error(s)",
  "details": [
    { "message": "May not be empty", "property": "messages[0].text" },
    { "message": "Must be one of the following values: [text, image, video, audio, location, sticker, template, imagemap]", "property": "messages[1].type" }
  ]
}
```

### Common error messages (`message` property)

| Message | Cause |
|---|---|
| The request body has X error(s) | JSON validation errors; see `details` |
| Invalid reply token | Reply token expired or already used |
| The property, XXX, in the request body is invalid (line: X, column: X) | Invalid property |
| The request body could not be parsed as JSON (line: X, column: X) | Malformed JSON |
| The content type, XXX, is not supported | Unsupported content type |
| Authentication failed due to the following reason: XXX | Auth failed |
| Access to this API is not available for your account | No permission for this API |
| Failed to send messages | Send failure (e.g. nonexistent user ID) |
| You have reached your monthly limit. | Free / additional message quota exceeded |
| The API rate limit has been exceeded. Try again later. | Rate limit exceeded |
| Not found | Profile info unavailable (no consent / not friend / blocked) |

## URL encoding in request body properties

Domain, path, query, and fragment in URL properties must be percent-encoded using UTF-8.
Example: `https` + `example.com` + `/path` + `q=Good morning` + `Good afternoon` →
`https://example.com/path?q=Good%20morning#Good%20afternoon`

---

# Channel access token

There are 4 token types. For Messaging API channels you can issue a long-lived token,
a short-lived token, a channel access token v2.1 (user-specified expiry), or a stateless token.

## Issue channel access token v2.1

`POST https://api.line.me/oauth2/v2.1/token`

Issues a token with a desired validity period using JWT assertion. Up to **30 tokens
per channel** (expired tokens don't count). Reaching the max blocks new issuance.

Request headers: `Content-Type: application/x-www-form-urlencoded`

Request body (form-urlencoded):

| Param | Required | Value |
|---|---|---|
| `grant_type` | Yes | `client_credentials` |
| `client_assertion_type` | Yes | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` |
| `client_assertion` | Yes | JWT assertion, signed with the assertion signing key's private key, must expire within 30 min of generation |

```sh
curl -v -X POST https://api.line.me/oauth2/v2.1/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer' \
--data-urlencode 'client_assertion={JWT}'
```

Response 200:

| Property | Type | Description |
|---|---|---|
| `access_token` | String | Channel access token |
| `expires_in` | Number | Seconds until expiration |
| `token_type` | String | `Bearer` |
| `key_id` | String | Unique key ID identifying the token |

```json
{ "access_token": "eyJhbGciOiJIUz.....", "token_type": "Bearer", "expires_in": 2592000, "key_id": "sDTOzw5wIfxxxxPEzcmeQA" }
```

Errors: `400` (JWT verification failed / expired / max tokens reached); `404` (signature key not registered in channel).

## Verify channel access token v2.1

`GET https://api.line.me/oauth2/v2.1/verify`

Query parameter: `access_token` (token v2.1).

```sh
curl -v -X GET https://api.line.me/oauth2/v2.1/verify \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'access_token=eyJhbGciOiJIUzI1NiJ9...' -G
```

Response 200: `client_id` (channel ID), `expires_in` (seconds until expiry), `scope` (not always).
Error: `400` (token malformed / expired / nonexistent).

## Get all valid channel access token key IDs v2.1

`GET https://api.line.me/oauth2/v2.1/tokens/kid`

Query parameters: `client_assertion_type` (`urn:ietf:params:oauth:client-assertion-type:jwt-bearer`),
`client_assertion` (JWT). Response 200: `kids` (array of strings).
Errors: `400` (JWT failed/expired); `404` (signature key not registered).

## Revoke channel access token v2.1

`POST https://api.line.me/oauth2/v2.1/revoke`

Request body: `client_id` (channel ID), `client_secret` (channel secret), `access_token`.
Response 200 with empty body — no error for an invalid token. Error: `400` (malformed token).

## Issue stateless channel access token

`POST https://api.line.me/oauth2/v3/token`

Valid for **15 minutes**. No issuance limit. **Cannot be revoked.**

Request headers: `Content-Type: application/x-www-form-urlencoded`

Two ways — same response shape either way:

**From channel ID + secret**: `grant_type=client_credentials`, `client_id`, `client_secret`.

**From JWT assertion**: `grant_type=client_credentials`,
`client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer`, `client_assertion`.

```sh
curl -v -X POST https://api.line.me/oauth2/v3/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id={channel ID}' \
--data-urlencode 'client_secret={channel secret}'
```

Response 200: `token_type` (`Bearer`), `access_token`, `expires_in` (e.g. `900`).
Errors: `400` (invalid ID/secret, JWT failed/expired); `404` (signature key not registered).

## Issue short-lived channel access token

`POST https://api.line.me/v2/oauth/accessToken`

Valid for **30 days**. Up to **30 tokens per channel**; exceeding the max revokes the
oldest. Rate limit: 370 req/s. Tokens cannot be refreshed.

Request headers: `Content-Type: application/x-www-form-urlencoded`
Request body: `grant_type=client_credentials`, `client_id` (channel ID), `client_secret` (channel secret).

Response 200: `access_token`, `expires_in` (seconds), `token_type` (`Bearer`).
Errors: `400` (invalid channel ID/secret, bad format); `429` (rate limit).

## Verify short-lived / long-lived channel access token

`POST https://api.line.me/v2/oauth/verify`

Request headers: `Content-Type: application/x-www-form-urlencoded`
Request body: `access_token` (short- or long-lived token).
Response 200: `client_id`, `expires_in`, `scope` (not always).
Error: `400` (invalid / malformed / expired token).

## Revoke short-lived / long-lived channel access token

`POST https://api.line.me/v2/oauth/revoke`

Request headers: `Content-Type: application/x-www-form-urlencoded`
Request body: `access_token`.
Response 200 with empty body — no error for an invalid token. Error: `400` (malformed token).
