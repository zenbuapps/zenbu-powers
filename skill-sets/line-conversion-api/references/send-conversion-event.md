# Send Conversion Event — Endpoint & Schemas

Source: `https://conversion-api-docs.linebiz.com/en/#tag/LINE-Conversion-API-v1/operation/postback`

## Table of contents

- The operation: `POST /v1/{line_tag_id}/events`
- Parameters (path / header)
- Request body envelope (`ConversionApiRequest` array)
- Schema: `ConversionApiRequest`
- Schema: `WebObj` (the `web` object)
- Schema: `EventObj` (the `event` object)
- Schema: `UserObj` (the `user` object)
- Schema: `CustomObj` (the `custom` object)
- Responses
- Full request sample
- Worked examples

---

# The operation

```
POST https://conversion-api.tr.line.me/v1/{line_tag_id}/events
```

- **Summary**: Send Conversion Event
- **`operationId`**: `postback`
- **Tag**: `LINE Conversion API v1`
- **Security**: `X-Line-TagAccessToken` (API-key header — see `references/common-and-auth.md`)

> Conversion API allows you to send additional information about conversion
> events in addition to the information normally sent by LINE Tag. The sent
> events are used for conversion measurement, audience accumulation, reporting,
> and delivery optimization on LINE.

---

# Parameters

## Path parameters

| Name | Required | Type | Description |
|---|---|---|---|
| `line_tag_id` | Yes | `string` | Specify the LINE Tag ID you want to use for conversion measurement with Conversion API. |

## Header parameters

| Name | Required | Type / pattern | Description |
|---|---|---|---|
| `X-Line-TagAccessToken` | Yes | `string` | Specify the access token for Conversion API issued by Business Manager. The access token must be associated with the LINE Tag ID specified by the `line_tag_id` parameter. |
| `X-Line-ChannelID` | No | `string`, `^[0-9]+$` | Specify the channel ID. Use the channel ID of the channel that issued the LINE User ID specified by `user.line_uid`. **Required for user matching using LINE User IDs.** |

`Content-Type: application/json` is also required.

---

# Request body envelope

The request body is **required** and is a JSON **array**:

> You can send multiple conversion events at the same time. The maximum number
> of events that can be acceptable at the same time is **100,000**. The size of
> the request body should not be more than **300 MB**.

```
Body schema:  array
  items:      ConversionApiRequest
```

Always send an array — even a single event is `[ { ... } ]`.

---

# Schema: `ConversionApiRequest`

> An object that represents the events that Conversion API can receive.

- **Type**: `object`
- **Required**: `event`, `user`

| Property | Required | Type | Description |
|---|---|---|---|
| `web` | No | `WebObj` (object) | Information representing an occurred event when `event.source_type` is `web`. |
| `event` | **Yes** | `EventObj` (object) | Information representing an occurred event. |
| `user` | **Yes** | `UserObj` (object) | Information representing the user who raised the event. |
| `custom` | No | `CustomObj` (object) | Information for the standard event; used in optimization and reporting. |

---

# Schema: `WebObj` — the `web` object

> An object that contains a set of information to represent an occurred event
> if `source_type` is specified to `web`.

- **Type**: `object`
- **Required**: none (the whole `web` object is optional)

| Property | Type | Constraints | Description |
|---|---|---|---|
| `url` | `string` | `pattern: ^http(s)?://.+`, `minLength: 0`, `maxLength: 2048` | The URL of the browser when the event occurred. |
| `referrer` | `string` | `minLength: 0`, `maxLength: 2048` | The referrer URL of the browser when the event occurred. |
| `title` | `string` | `minLength: 0`, `maxLength: 1024` | The browser title of the web page when the event occurred. |
| `user_agent` | `string` | — | The user agent of the browser when the event occurred. |
| `ip_address` | `string` | `format`: IPv4 dotted-decimal notation / IPv6 RFC 4291 | The IP address of the end user who raised the event. You can specify either IPv4 or IPv6. Specify IPv4 in dotted-decimal notation and IPv6 in RFC 4291 format. |

---

# Schema: `EventObj` — the `event` object

> An object that contains a set of information to represent an occurred event.

- **Type**: `object`
- **Required**: `event_timestamp`, `event_type`, `source_type`, `deduplication_key`

| Property | Required | Type | Constraints | Description |
|---|---|---|---|---|
| `deduplication_key` | **Yes** | `string` | `pattern: ^[0-9a-zA-Z\-_]{1,256}$` | A unique key for each event. Used to deduplicate conversions sent via Conversion API and LINE Tag. The same event may be sent multiple times (Conversion API / your-system problems, or multi-route sending). Send the same `deduplication_key` from the LINE Tag and Conversion API routes to deduplicate. **Exception**: if you send the literal string `undefined`, it is treated as if not sent. |
| `event_type` | **Yes** | `string` | `enum: ["page_view", "conversion"]` | The event type. `page_view`: a page view event — corresponds to the base code in LINE Tag; **conversion measurement is not performed**. `conversion`: a conversion, or custom conversion, event. |
| `source_type` | **Yes** | `string` | `enum: ["web"]` | The source type where the event occurred. Specify `web` for events measured on the web. **Currently only `web` is supported.** |
| `event_timestamp` | **Yes** | `integer` | `format: int64`, `minimum: 0` | The time the event **actually occurred**, in UNIX time — *not* the time it was sent to Conversion API. Valid only within the range **90 days before to 24 hours after** the time the event reaches Conversion API; values outside this range (too old, or in the future) produce an error. Conversion timing uses the *arrival* time, not `event_timestamp`. `event_timestamp` is **not** used for conversion measurement itself, but **is** used as an optimization parameter — supply an accurate value. |
| `event_name` | No | `string` | `pattern: ^[A-Za-z0-9_\-]{1,20}$` | The conversion event name; specify it when `event_type` is `conversion`. Set `"Conversion"` to measure the **default** conversion. Set a custom event name you defined to measure **custom** conversions. |
| `test_flag` | No | `boolean` | `default: false` | Indicates whether the event is a test transmission. When `true`: (1) conversion measurement and audience accumulation are **not** performed; (2) fields in the `user` object are masked and automatically deleted after a period — **no matching with LINE users is performed after masking**; (3) you can verify the data in Business Manager, but the events are **not** included in the status. |

## `event_type` / `event_name` interplay

- `event_type = "page_view"` → a base-code-equivalent page view; **not** a
  conversion; `event_name` is not meaningful here.
- `event_type = "conversion"` → set `event_name`:
  - `event_name = "Conversion"` → counted as the **default** conversion.
  - any other (`^[A-Za-z0-9_\-]{1,20}$`) value → counted as a **custom**
    conversion / custom event.

---

# Schema: `UserObj` — the `user` object

> An object that contains a set of information to represent the user who raised
> the event.

- **Type**: `object`
- **Required**: none declared — **but** the `user` object must in practice
  carry **at least one field usable for user matching**, or the event cannot be
  attributed and is discarded (see `references/development-guidelines.md`).

| Property | Type | Constraints | Hashing | Description |
|---|---|---|---|---|
| `line_uid` | `string` | `pattern: ^U[0-9a-f]{32}$` | **Do not hash** | The LINE User ID identifying the user who raised the event. Only a LINE User ID issued via the channel specified in the `X-Line-ChannelID` request header can be used. (LINE User ID glossary: `https://developers.line.biz/en/glossary/#user-id`.) |
| `click_id` | `string` | `pattern: ^[a-zA-Z0-9\-_]+$` | **Do not hash** | An ID uniquely identifying a click a user made via LINE Ads. Conversions are attributed to the ad identified by `click_id`. It is the value of the landing-page URL path parameter `ldtag_cl` when a LINE Ad is clicked — e.g. in `https://example.com/foo?ldtag_cl=xxx`, send `xxx` as `click_id`. |
| `phone` | `string` | `pattern: ^[0-9a-f]{64}$` | **Hash with SHA-256** | The hashed phone number of the user. Only SHA-256-hashed phone numbers are accepted. Hash the number in the format following the country code `+81` (e.g. hash `+818012345678`). |
| `email` | `string` | `pattern: ^[0-9a-f]{64}$` | **Hash with SHA-256** | The hashed email address of the user. Only SHA-256-hashed email addresses are accepted. |
| `ifa` | `string` | `pattern: ^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$` | **Do not hash** | The IDFA / AAID value of the user (advertising identifier, UUID form). |
| `browser_id` | `string` | `pattern: ^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$` | **Do not hash** | An ID uniquely identifying the browser of the user. It is a unique ID issued as a cookie by the LINE Tag installed on your website. To enable measurement with a browser ID you must first enable first-party-cookie measurement. The browser ID issued by LINE Tag is the value of the first-party cookie keyed by `__lt__cid`. |
| `external_id` | `string` | `pattern: ^[0-9a-zA-Z\-_]{1,512}$` | **Recommended: hash** | A string that uniquely identifies a user on **your** system. Recommended to hash before sending. Recommended to keep a surrogate-key ↔ identifier mapping and send only the surrogate key (meaningful only on your system) rather than a directly personally identifiable identifier. Conversion measurement with `external_id` works across LINE Tag and Conversion API only if sent in the **same format** (if one is hashed, the other must be hashed too). The value is hashed once, retained and collated internally; the original data is not retained as-is. **Exception**: if you send the literal string `undefined`, it is treated as if not sent. |

## Fields usable for user matching

The fields available for user matching are: `line_uid` *(recommended)*,
`click_id` *(recommended)*, `phone` *(recommended)*, `email`, `ifa`,
`browser_id`, `external_id`.

`browser_id` and `external_id` are usable for matching **only if user mapping
data has already been created** for them. See
`references/development-guidelines.md` ("User match") for the full rules,
including the two acceptance conditions and how internal mapping works.

## Hashing rules summary

| Field | Send as |
|---|---|
| `phone` | SHA-256 hash, 64 lowercase hex chars; hash the `+81…`-prefixed number |
| `email` | SHA-256 hash, 64 lowercase hex chars |
| `external_id` | Recommended hashed; **must** match the LINE Tag format |
| `line_uid`, `click_id`, `ifa`, `browser_id` | **Unhashed**, as-is |

---

# Schema: `CustomObj` — the `custom` object

> An object that contains a set of information for the standard event. It will
> be used in optimization and reporting.

- **Type**: `object`
- **Required**: none (the whole `custom` object is optional)

| Property | Type | Constraints | Description |
|---|---|---|---|
| `value` | `number` | `format: double`, `minimum: 0`, `maximum: 2147483647` | **Mandatory when sending a `Purchase` event.** Besides a value representing the price of the purchased item, you can also send other values representing customer value. Use the same scale in this field for good optimization. A `currency` field must be specified if this value means an item price. |
| `currency` | `string` | `pattern: ^[A-Z]{3}$`, `format: ISO-4217`, example `JPY` | The ISO-4217 currency code; specify it if the `value` field means the price of the purchased item. |
| `quantity` | `integer` | `format: int32`, `minimum: 0`, `maximum: 2147483647` | The number of items associated with the event. E.g. the number of items purchased for a `Purchase` event. |
| `item_ids` | `array` of `string` | `minItems: 0`, `maxItems: 100` | Item information associated with the event. |
| `keywords` | `array` of `string` | `minItems: 0`, `maxItems: 10` | Keyword information associated with the event. |
| `category` | `string` | `minLength: 0`, `maxLength: 300` | Category information associated with the event. |

> When sending a `Purchase` event, `custom.value` is mandatory, and
> `custom.currency` must accompany it if `value` is an item price.

---

# Responses

| Code | Body | Meaning |
|---|---|---|
| `202` | none | All sent events were successfully received. |
| `400` | none | An invalid parameter was detected. With multiple events, validation stops at the first invalid event and `400` is returned — **the whole request (valid events included) is discarded**. Also returned for `Transfer-Encoding: chunked`. |
| `401` | none | The access token is invalid. |
| `500` | none | A server error occurred inside Conversion API. **Some events may already have been accepted.** |

See `references/common-and-auth.md` for the full status-code discussion and
retry implications.

---

# Full request sample

The complete request body shape, with every field of every object (as rendered
by the official Redoc reference):

```json
[
  {
    "web": {
      "referrer": "string",
      "ip_address": "string",
      "title": "string",
      "user_agent": "string",
      "url": "string"
    },
    "event": {
      "deduplication_key": "string",
      "event_type": "page_view",
      "event_name": "string",
      "source_type": "web",
      "event_timestamp": 0,
      "test_flag": false
    },
    "user": {
      "browser_id": "string",
      "click_id": "string",
      "phone": "string",
      "ifa": "string",
      "external_id": "string",
      "line_uid": "string",
      "email": "string"
    },
    "custom": {
      "quantity": 2147483647,
      "keywords": [
        "string"
      ],
      "item_ids": [
        "string"
      ],
      "currency": "JPY",
      "category": "string",
      "value": 2147483647
    }
  }
]
```

---

# Worked examples

These examples are constructed from the documented schema; field values are
illustrative but the structure, types, and constraints are exact.

## Default conversion (`event_name: "Conversion"`)

```sh
curl -v -X POST \
  'https://conversion-api.tr.line.me/v1/{line_tag_id}/events' \
  -H 'Content-Type: application/json' \
  -H 'X-Line-TagAccessToken: {access token from LINE Business Manager}' \
  -d '[
    {
      "web": {
        "url": "https://example.com/thanks",
        "referrer": "https://example.com/cart",
        "title": "Thank you for your order",
        "user_agent": "Mozilla/5.0 ...",
        "ip_address": "203.0.113.10"
      },
      "event": {
        "source_type": "web",
        "event_type": "conversion",
        "event_name": "Conversion",
        "deduplication_key": "order-2024-0001",
        "event_timestamp": 1716345600
      },
      "user": {
        "click_id": "abc123",
        "browser_id": "550e8400-e29b-41d4-a716-446655440000"
      }
    }
  ]'
```

## `Purchase` custom conversion with `custom.value` / `custom.currency`

`custom.value` is mandatory for a `Purchase` event; pair it with `currency`
when `value` represents an item price.

```json
[
  {
    "web": {
      "url": "https://example.com/order/complete"
    },
    "event": {
      "source_type": "web",
      "event_type": "conversion",
      "event_name": "Purchase",
      "deduplication_key": "purchase-9f8e7d6c",
      "event_timestamp": 1716345600
    },
    "user": {
      "phone": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      "email": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
    },
    "custom": {
      "value": 4980,
      "currency": "JPY",
      "quantity": 2,
      "item_ids": ["SKU-001", "SKU-042"],
      "keywords": ["spring-sale"],
      "category": "apparel"
    }
  }
]
```

## PageView event (`event_type: "page_view"`)

A page view is the base-code equivalent — no conversion is measured, and
`event_name` is not meaningful.

```json
[
  {
    "web": {
      "url": "https://example.com/products/42",
      "title": "Product 42"
    },
    "event": {
      "source_type": "web",
      "event_type": "page_view",
      "deduplication_key": "pv-2024-05-22-0007",
      "event_timestamp": 1716345600
    },
    "user": {
      "browser_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
]
```

## Matching by LINE User ID (`X-Line-ChannelID` required)

When `user.line_uid` is used, `X-Line-ChannelID` must identify the channel that
issued that User ID.

```sh
curl -v -X POST \
  'https://conversion-api.tr.line.me/v1/{line_tag_id}/events' \
  -H 'Content-Type: application/json' \
  -H 'X-Line-TagAccessToken: {access token}' \
  -H 'X-Line-ChannelID: 1234567890' \
  -d '[
    {
      "event": {
        "source_type": "web",
        "event_type": "conversion",
        "event_name": "Conversion",
        "deduplication_key": "conv-uid-0001",
        "event_timestamp": 1716345600
      },
      "user": {
        "line_uid": "U4af4980629000000000000000000000a"
      }
    }
  ]'
```

## Batch of multiple events

Up to 100,000 `ConversionApiRequest` objects per request; if any one is
invalid, the whole batch is rejected with `400`.

```json
[
  {
    "event": { "source_type": "web", "event_type": "page_view",  "deduplication_key": "evt-1", "event_timestamp": 1716345600 },
    "user":  { "browser_id": "550e8400-e29b-41d4-a716-446655440000" }
  },
  {
    "event": { "source_type": "web", "event_type": "conversion", "event_name": "Conversion", "deduplication_key": "evt-2", "event_timestamp": 1716345605 },
    "user":  { "click_id": "abc123" }
  }
]
```

## Test transmission (`test_flag: true`)

With `test_flag: true` no conversion measurement / audience accumulation
happens, `user` fields are masked then deleted, and the events do not appear in
the Business Manager status (only in the verifiable data).

```json
[
  {
    "event": {
      "source_type": "web",
      "event_type": "conversion",
      "event_name": "Conversion",
      "deduplication_key": "test-run-0001",
      "event_timestamp": 1716345600,
      "test_flag": true
    },
    "user": {
      "click_id": "abc123"
    }
  }
]
```
