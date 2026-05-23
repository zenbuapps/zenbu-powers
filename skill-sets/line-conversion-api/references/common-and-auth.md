# Common Specifications & Authentication

Source: `https://conversion-api-docs.linebiz.com/en/`
(LINE Developers pointer page: `https://developers.line.biz/en/docs/line-conversion-api/`)

## Table of contents

- Base URL & host
- Authentication (`X-Line-TagAccessToken`, `X-Line-ChannelID`)
- Path parameter (`line_tag_id`)
- Content type
- HTTP status codes
- Request limits (event count, body size, encoding)
- Change log

---

# Base URL & host

The OpenAPI spec declares a single server:

```
https://conversion-api.tr.line.me
```

The one and only endpoint is therefore:

```
POST https://conversion-api.tr.line.me/v1/{line_tag_id}/events
```

`operationId`: `postback`. OpenAPI version of the spec: `3.0.1`. API title /
version: **LINE Conversion API v1 (1.0.0)**.

There is no separate token endpoint, no `api-data` host, no OAuth host — the
Conversion API surface is this single host and single path.

---

# Authentication

The Conversion API uses an **API-key header**, not OAuth and not a Bearer
token. The OpenAPI `securityScheme` is:

| Property | Value |
|---|---|
| Scheme name | `X-Line-TagAccessToken` |
| `type` | `apiKey` |
| `in` | `header` |
| `name` | `X-Line-TagAccessToken` |

## `X-Line-TagAccessToken` — required

| Field | Detail |
|---|---|
| Location | HTTP request header |
| Required | Yes |
| Type | `string` |
| Value | The access token for Conversion API, **issued in LINE Business Manager** |
| Binding | The token must be associated with the LINE Tag ID passed as the `line_tag_id` path parameter. A mismatch / invalid token returns `401`. |

There is no `Bearer ` prefix — the raw token is the header value. The token is
provisioned in the LINE Business Manager UI; there is no programmatic
issue / verify / revoke endpoint in this API.

## `X-Line-ChannelID` — conditionally required

| Field | Detail |
|---|---|
| Location | HTTP request header |
| Required | No — **required only when matching users via `user.line_uid`** |
| Type | `string`, pattern `^[0-9]+$` |
| Value | The channel ID of the channel that **issued** the LINE User ID supplied in `user.line_uid` |

If you send `user.line_uid` for user matching, you must also send
`X-Line-ChannelID` identifying the channel (Channel Provider) that issued that
User ID. Omit this header if you are not matching by `line_uid`.

For background on channels and LINE User IDs, see the LINE Developers site:
`https://developers.line.biz/en/docs/line-developers-console/overview/#channel`
and the User ID glossary entry `https://developers.line.biz/en/glossary/#user-id`.

---

# Path parameter — `line_tag_id`

| Field | Detail |
|---|---|
| Location | URL path (`/v1/{line_tag_id}/events`) |
| Required | Yes |
| Type | `string` |
| Meaning | The LINE Tag ID to use for conversion measurement with Conversion API |

The `X-Line-TagAccessToken` must belong to this same `line_tag_id`.

---

# Content type

Request body content type is `application/json`. The request body is
**required**.

---

# HTTP status codes

The endpoint returns one of exactly four status codes. There is **no response
body** documented for any of them — the status code itself carries the result.

| Code | Meaning (verbatim from the reference) |
|---|---|
| **202** | Returned if the event was successfully received. It indicates that **all** sent events were successfully received. |
| **400** | Returned if an invalid parameter is detected. If multiple events are included and even one invalid event is detected, request validation completes at that point and `400` is returned. **All requests are discarded even if they contain valid events.** A `400` is also returned when the HTTP header contains `Transfer-Encoding: chunked`, which is treated as an invalid request. |
| **401** | Returned if an access token is invalid. Issue a valid access token in Business Manager in advance and specify it in the request header. |
| **500** | Returned if a server error occurs inside Conversion API, an unexpected request is sent by Conversion API, or an internal component failure occurs. **There is a possibility that some of the events may have already been accepted.** |

## Practical consequences

- **`202` is not "measured".** It only confirms receipt. An accepted event can
  still silently fail conversion measurement later (user match failure, missing
  user consent) — see `references/development-guidelines.md` ("User match").
- **`400` is all-or-nothing.** One bad event poisons the whole batch and every
  event in that request is discarded. Validate every event client-side
  (against the schemas / regex patterns) before sending. Validation also
  short-circuits — a `400` does not list every bad event, only stops at the
  first one detected.
- **`500` is not safely idempotent on its own.** Some events in the batch may
  already be accepted. If you retry the whole batch after a `500`, rely on
  `deduplication_key` so re-sent events are deduplicated rather than
  double-counted.
- A network error or `5xx` is exactly the "client must retry" case the
  guidelines call out — and the reason `deduplication_key` is mandatory.

---

# Request limits

| Limit | Value |
|---|---|
| Max events per request | **100,000** events (the request body is a JSON array of `ConversionApiRequest`; this is its max length) |
| Max request body size | **300 MB** |
| Transfer encoding | `Transfer-Encoding: chunked` is **forbidden** — it yields `400`. Send a fixed `Content-Length` instead. |

The reference does not document a per-channel rate limit beyond the size /
count caps above.

---

# Change log

Verbatim from the reference's Change Log section:

| Date | Change |
|---|---|
| 2024-10-17 | Added description regarding the behavior when the string `undefined` is sent for `deduplication_key` and `external_id`. |
| 2024-09-12 | Added "Notes on Sending deduplicationKey via LINE Tag". |

---

# Terms of use

Use of the Conversion API is governed by the **Conversion API terms of use**:
`https://terms2.line.me/conversion_api_terms_of_use?lang=en`. When using the
server-side tag template, the Conversion API privacy policy and terms of use
also apply.
