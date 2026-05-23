---
name: line-conversion-api
description: >-
  LINE Conversion API official reference at API-reference depth. Covers the
  single Send Conversion Event endpoint, its authentication, every request /
  response field, all five JSON schema objects (ConversionApiRequest, web,
  event, user, custom), and the official LINE Conversion API development
  guidelines. Use this skill whenever the task touches server-to-server
  conversion / event tracking for LINE Ads: sending conversion events,
  PageView / Conversion / custom-conversion events, conversion measurement,
  ad delivery optimization, audience accumulation, or reporting for LINE Ads
  Platform (LAP); building or debugging a Conversion API client / integration;
  deduplicating events across LINE Tag and Conversion API; user matching with
  line_uid / click_id / phone / email / ifa / browser_id / external_id;
  hashing phone numbers or emails with SHA-256 for Conversion API; the
  X-Line-TagAccessToken / X-Line-ChannelID headers; the LINE Tag ID; the
  ldtag_cl click ID; the __lt__cid first-party cookie / browser ID; the LINE
  Tag _lt('init', ...) snippet with deduplicationKey / externalId / customerType;
  or setting up server-side tagging that bridges Google Tag Manager (GA4
  client, web container, server container) to the LINE Conversion API server
  tag template. Trigger on mentions of: LINE Conversion API, Conversion API,
  conversion-api-docs.linebiz.com, conversion-api.tr.line.me, POST
  /v1/{line_tag_id}/events, deduplication_key, event_name, event_type,
  source_type, event_timestamp, test_flag, line_tag_id, X-Line-TagAccessToken,
  X-Line-ChannelID, LINE Tag, LINE Ads conversion tracking, LINE business
  manager access token, server-side tag template, line-conversion-api-server-tag,
  CAPI for LINE.
---

# LINE Conversion API Reference

API-reference-level coverage of the **LINE Conversion API v1** (`1.0.0`),
extracted from the official reference at
`https://conversion-api-docs.linebiz.com/en/` (the LINE Developers page
`https://developers.line.biz/en/docs/line-conversion-api/` is only a pointer to
this external Redoc site).

The Conversion API is a **server-to-server** API: it lets advertisers send
conversion events (and PageView events) for LINE Ads directly from their own
backend, in addition to (or instead of) the browser-side LINE Tag. Sent events
feed **conversion measurement, audience accumulation, reporting, and ad
delivery optimization** on LINE.

The whole reference is a single Redoc page; this skill splits it into
topic-scoped reference files. **Read the reference file that matches the task —
do not guess the endpoint path, header names, field names, regex patterns,
limits, or JSON shapes.**

## When this skill applies

Any work that sends or processes LINE Ads conversion events server-side:
building a Conversion API client, formatting the `[{web, event, user, custom}]`
request body, choosing user-matching fields, hashing phone/email, generating
`deduplication_key`s, deduplicating across LINE Tag + Conversion API, handling
the `202 / 400 / 401 / 500` responses, or wiring Google Tag Manager server-side
tagging through the LINE Conversion API server tag template. Works for raw HTTP
calls (`curl`, `fetch`, `axios`, `requests`, any HTTP client) — there is no
official SDK; you POST JSON to one endpoint.

## The whole API in one line

There is exactly **one endpoint**:

```
POST https://conversion-api.tr.line.me/v1/{line_tag_id}/events
```

Base URL (server): `https://conversion-api.tr.line.me`. Authentication is an
API-key header, **not** OAuth / Bearer — see `references/common-and-auth.md`.

## Reference file map

| File | Contents |
|---|---|
| `references/common-and-auth.md` | Base URL & host, authentication (`X-Line-TagAccessToken` API key, `X-Line-ChannelID`), `line_tag_id` path param, all HTTP status codes (202/400/401/500) and their exact meanings, `Transfer-Encoding: chunked` gotcha, request-size & event-count limits, change log |
| `references/send-conversion-event.md` | The `POST /v1/{line_tag_id}/events` operation in full: path/header parameters, request body envelope, **all five schemas** (`ConversionApiRequest`, `WebObj`, `EventObj`, `UserObj`, `CustomObj`) with every field — type, regex `pattern`, `format`, min/max, enum, default, required — plus the full request sample and worked examples |
| `references/development-guidelines.md` | Official development guidelines & best practices: order to send events, timing & conversion expiration windows, **event deduplication** (the deduplicated unit, 30-day window, `undefined` handling, LINE Tag config), **user match** (matchable fields, the two acceptance conditions, internal user mapping, mapping keys & scope) |
| `references/server-side-tagging.md` | Server-side tag template configuration guidelines: importing the LINE Conversion API tag template (Community Gallery or `template.tpl`), web/server container setup with Google Tag Manager + GA4, the `x-line-*` additional fields → Conversion API field mapping, `user_data.*` common-event-data mapping, deduplication in GTM, interoperability with LINE Tag, notes/disclaimers |

## Quick endpoint index

```
POST /v1/{line_tag_id}/events     Send Conversion Event (operationId: postback)

  Host        conversion-api.tr.line.me
  Path param  line_tag_id                       required  the LINE Tag ID
  Headers     X-Line-TagAccessToken             required  Conversion API access token
              X-Line-ChannelID  ^[0-9]+$        optional  required only for user.line_uid matching
              Content-Type: application/json
  Body        JSON array of ConversionApiRequest objects
              ≤ 100,000 events per request; request body ≤ 300 MB

  Responses   202  all events received successfully (no body)
              400  invalid parameter in any event -> entire request discarded;
                   also returned for Transfer-Encoding: chunked
              401  invalid access token
              500  server error; some events may already have been accepted
```

## Request body shape at a glance

```jsonc
[
  {
    "web":    { /* WebObj   – optional, used when event.source_type = "web" */ },
    "event":  { /* EventObj – REQUIRED */ },
    "user":   { /* UserObj  – REQUIRED, must carry >=1 user-matching field   */ },
    "custom": { /* CustomObj – optional, standard-event data for optimization */ }
  }
  // ... up to 100,000 objects
]
```

`event` and `user` are required on every `ConversionApiRequest`; `web` and
`custom` are optional. See `references/send-conversion-event.md` for every
field.

## Working rules

- **One endpoint, batch-friendly.** Always POST a JSON **array**, even for a
  single event. Up to 100,000 events per request; request body ≤ 300 MB.
- **All-or-nothing validation.** If any one event in the array is invalid, the
  request stops at `400` and *every* event in it is discarded — valid ones
  included. Validate client-side before sending.
- **Never send `Transfer-Encoding: chunked`** — it is rejected as `400`. Send a
  fixed `Content-Length`.
- **Auth is an API key header**, `X-Line-TagAccessToken`, issued in LINE
  Business Manager and bound to a specific `line_tag_id`. Not OAuth, no Bearer
  prefix, no token endpoint.
- **`X-Line-ChannelID` is conditionally required**: include it (matching
  `^[0-9]+$`) only when you match users via `user.line_uid`; it identifies the
  channel that issued that LINE User ID.
- **`event.user` must contain at least one user-matching field** or the event
  cannot be attributed and is silently discarded (no Business Manager status
  update). Recommended fields: `line_uid`, `click_id`, `phone`.
- **Hash `phone` and `email` yourself** with SHA-256 (lowercase hex, 64 chars).
  Send `browser_id`, `click_id`, `ifa`, `line_uid` **un-hashed**. `external_id`
  should be hashed and must use the *same* format on LINE Tag and Conversion API.
- **`deduplication_key` is required** and must be unique per event
  (`^[0-9a-zA-Z\-_]{1,256}$`). Send the *same* key from LINE Tag and Conversion
  API for the same real event so the conversion is counted once. The literal
  string `undefined` is treated as "not sent" and excluded from deduplication.
- **`event_timestamp`** is UNIX time of when the event *occurred*; it must fall
  within 90 days before to 24 hours after arrival or the event errors.
  Conversion timing uses arrival time, not `event_timestamp` — but send an
  accurate value because it feeds optimization.
- **`202` means "received", not "measured".** Events still fail conversion
  measurement silently if user match fails or user consent is absent.
- Conversion windows: default conversions 30 days after ad click; custom
  conversions a 1–90 day window. Event deduplication window is 30 days.
