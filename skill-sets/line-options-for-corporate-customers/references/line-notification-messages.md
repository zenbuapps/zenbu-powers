# LINE Notification Messages

Source:
- `https://developers.line.biz/en/docs/partner-docs/line-notification-messages/overview/`
- `https://developers.line.biz/en/docs/partner-docs/line-notification-messages/template/`
- `https://developers.line.biz/en/docs/partner-docs/line-notification-messages/technical-specs/`
- `https://developers.line.biz/en/docs/partner-docs/line-notification-messages/message-sending-complete-webhook-event/`
- `https://developers.line.biz/en/docs/partner-docs/line-notification-messages/flow-when-receiving-message/`
- `https://developers.line.biz/en/reference/line-notification-messages/` (API reference)

## Table of contents

- Overview & the two variants (template vs. flexible)
- Conditions for sending
- Phone number hashing
- LINE notification messages (template): templates, items, buttons
- API reference: Send (template), Get count (template)
- API reference: Send (flexible), Get count (flexible)
- Webhook: delivery completion event
- User flows when receiving
- Behavior, gotchas, billing

Requires corporate-customer application. Available only on LINE Official Accounts
created in **Japan, Thailand, and Taiwan**.

---

# Overview

LINE notification messages let you send messages to users by **specifying their
phone number**, even if you don't know their user IDs, and even if the user
hasn't added the LINE Official Account as a friend.

There are **two types**, with different API endpoints:

| Type | Description | Send endpoint | Review |
|---|---|---|---|
| **LINE notification messages (template)** | Create messages by combining premade templates + items + buttons. | `POST /v2/bot/message/pnp/templated/push` | No UX review needed (templates are pre-approved) |
| **LINE notification messages (flexible)** | Free-form messages using Flex Message etc. | `POST /bot/pnp/push` | **Requires prior UX review** — only reviewed messages can be sent |

> The previous "LINE notification messages" feature was **renamed "LINE
> notification messages (flexible)"** when "LINE notification messages (template)"
> was added (2025/06/02).

The purpose of use is **limited to content deemed useful and appropriate for
users**. It **can't be sent for commercial or advertising purposes**. Follow the
LINE notification messages UX guidelines (template and flexible have separate
guidelines; only available in Japanese).

## Difference in appearance from other messages

LINE notification messages are displayed with **"Important notification"** to the
right of the LINE Official Account icon (LINE version 15.9.0+ for iOS, Android,
iPad). The text varies by the receiving LINE app's language setting:

| LINE app language | Text displayed |
|---|---|
| Japanese | `重要なお知らせ` |
| Thai | `การแจ้งเตือนสำคัญ` |
| Chinese (Simplified/Traditional) | `重要通知` |
| Other | `Important notification` |

---

# Conditions for sending LINE notification messages

A message is sent to the user only if **all** of these are met:

- The phone number specified as the destination matches the phone number
  registered in the user's LINE account.
- The phone number registered in the user's LINE account is valid (the user
  authenticated it by SMS within a certain period).
- The user agreed to receive LINE notification messages.
- The user hasn't blocked your LINE Official Account.
- The phone number is issued in Japan, Thailand, or Taiwan and can be used for
  phone-number authentication in the LINE app.
- The user agreed to LINE's Privacy Policy (revised March 2022 or later).

**SMS verification cadence**: in addition to agreeing to receive, the user must
authenticate their phone number by SMS **once every 180 days**. SMS
authentication is **not** needed within 180 days of creating a new LINE account,
or within 180 days of changing the registered phone number.

**Settings are comprehensive across all LINE Official Accounts**: once a user
agrees to receive LINE notification messages (or completes SMS authentication),
that consent/authentication applies to messages from **all** LINE Official
Accounts. The user need not consent again per account.

---

# Phone number hashing

For the `to` field of the LINE notification messages API, specify a phone number
**normalized to E.164 format** (e.g. `+818000001234`, no hyphens) and **hashed
with SHA256** (lowercase hex digest).

Example in Python 3:

```python
import hashlib

phone_number = "+818000001234"
hashed_phone_number = hashlib.sha256(phone_number.encode()).hexdigest()
print(hashed_phone_number)

# d41e0ad70dddfeb68f149ad6fc61574b9c5780ab7bcb2fba5517771ffbb2409c
```

LY Corporation uses the hashed phone number only for matching the send target and
destroys it immediately after matching.

---

# LINE notification messages (template)

After selecting a **template**, build a message by combining **items** and
**buttons**, creating JSON with text/URL for each, then call the **Send LINE
notification message (template)** endpoint.

The available templates, items, and buttons differ for Japan, Thailand, and
Taiwan, and are **automatically determined by the sending LINE Official
Account**. The message header and footer cannot be changed.

- **Templates** — selected via the template `Key`; render the template `Title`
  and `Description` at the top of the message.
- **Items** — include multiple items via item `Key`; you set any string as the
  item's value.
- **Buttons** — include multiple buttons via button `Key`; you set any URL as the
  button's transition destination.

> The actual catalogue of valid template / item / button `Key` values per country
> is published as a rendered table on
> `https://developers.line.biz/en/docs/partner-docs/line-notification-messages/template/`
> (the "Templates", "Items", "Buttons" sections). The `Key`s you specify must
> come from that catalogue for your account's country.

Example JSON for a template message:

```json
{
  "to": "{hashed_phone_number}",
  "templateKey": "shipment_completed_ja",
  "body": {
    "emphasizedItem": {
      "itemKey": "date_002_ja",
      "content": "Saturday, August 10, 2024"
    },
    "items": [
      {
        "itemKey": "time_range_001_ja",
        "content": "A.M."
      },
      {
        "itemKey": "number_001_ja",
        "content": "1234567"
      },
      {
        "itemKey": "price_001_ja",
        "content": "120 USD"
      },
      {
        "itemKey": "name_010_ja",
        "content": "Frozen Soup Set"
      }
    ],
    "buttons": [
      {
        "buttonKey": "check_delivery_status_ja",
        "url": "https://example.com/CheckDeliveryStatus/"
      },
      {
        "buttonKey": "contact_ja",
        "url": "https://example.com/ContactUs/"
      }
    ]
  }
}
```

---

# API reference

## Common specifications

- **Status codes**: see the Messaging API reference "Status codes".
- **Response headers**: `x-line-request-id` — Request ID, issued per request.
- **Retry keys are NOT supported.** The LINE notification messages API does not
  allow API request retries using retry keys (`X-Line-Retry-Key`).

## Send a LINE notification message (template)

API for sending a LINE notification message (template) by specifying the user's
phone number.

**HTTP request**

```
POST https://api.line.me/v2/bot/message/pnp/templated/push
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X POST https://api.line.me/v2/bot/message/pnp/templated/push \
-H 'Authorization: Bearer {channel_access_token}' \
-H 'Content-Type:application/json' \
-H 'X-Line-Delivery-Tag:15034552939884E28681A7D668CEA94C147C716C0EC9DFE8B80B44EF3B57F6BD0602366BC3menu01' \
-d '{
    "to": "c9fb9ae95bff879cbcdfc9edf6716640bc40841f3b7352140daa1431af4c319e",
    "templateKey": "shipment_completed_ja",
    "body": {
        "emphasizedItem": {
            "itemKey": "date_002_ja",
            "content": "Saturday, August 10, 2024"
        },
        "items": [
            {
                "itemKey": "time_range_001_ja",
                "content": "A.M."
            },
            {
                "itemKey": "number_001_ja",
                "content": "1234567"
            },
            {
                "itemKey": "price_001_ja",
                "content": "120 USD"
            },
            {
                "itemKey": "name_010_ja",
                "content": "Frozen Soup Set"
            }
        ],
        "buttons": [
            {
                "buttonKey": "check_delivery_status_ja",
                "url": "https://example.com/CheckDeliveryStatus/"
            },
            {
                "buttonKey": "contact_ja",
                "url": "https://example.com/ContactUs/"
            }
        ]
    }
}'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` |
| `X-Line-Delivery-Tag` | No | String returned in the `delivery.data` property of the delivery completion event via webhook. Min 16 / max 100 characters. Example: `15034552939884E28681A7D668CEA94C147C716C0EC9DFE8B80B44EF3B57F6BD0602366BC3menu01` |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | String | Yes | Message destination. A phone number normalized to E.164 and hashed with SHA256. Can't be a group/multi-person chat. Can't specify multiple phone numbers. |
| `templateKey` | String | Yes | The `Key` of the template to send. |
| `body` | Object | No | Body of the template. Three sub-objects. The same item can't be specified more than once in one message. |
| `body.emphasizedItem` | Object | No | The item to emphasize. Max objects: 1. |
| `body.items` | Array of objects | No | The array of items. Min 0, max 15. |
| `body.buttons` | Array of objects | No | The array of buttons. Min 0, max 2. |

**Items** object (`body.emphasizedItem` and each element of `body.items`):

| Field | Type | Required | Description |
|---|---|---|---|
| `itemKey` | String | Yes | The `Key` of the item to include. |
| `content` | String | Yes | String displayed as the item value. Max characters: 15 for `body.emphasizedItem`, 300 for `body.items`. |

**Buttons** object (each element of `body.buttons`):

| Field | Type | Required | Description |
|---|---|---|---|
| `buttonKey` | String | Yes | The `Key` of the button to include. |
| `url` | String | Yes | URL opened when the user presses the button. Max characters: 1000. |

**Response**: status code `202` and an empty JSON object `{}`.

**Error response**

| Code | Description |
|---|---|
| `400` | Problem with the request: invalid destination; invalid message object; or your LINE Official Account can't use the specified template. |
| `403` | Not authorized to use this endpoint. |
| `422` | Failed to send: no LINE user is associated with the phone number; the phone number wasn't issued in a service target country; the user refused LINE notification messages; or the user hasn't agreed to LINE's Privacy Policy (March 2022 or later). |

```json
// If you specify a template that doesn't exist or that you aren't authorized to use (400 Bad Request)
{
  "message": "Invalid templateKey: reserve_004",
  "details": [
    {
      "message": "The specified template doesn't exist, or you don't have the permission",
      "property": "templateKey"
    }
  ]
}

// If you specify a non-existent item (400 Bad Request)
{
  "message": "The request body has 1 invalid key(s).",
  "details": [
    {
      "message": "The specified item key does not exist: datetime_000",
      "property": "body.items[0].itemKey"
    }
  ]
}

// If you specify the duplicate items (400 Bad Request)
{
  "message": "The request body has 1 error(s)",
  "details": [
    {
      "message": "Duplicate itemKey in items or between emphasizedItem and items are not allowed: date_002_ja",
      "property": "body.emphasizedItem.itemKey"
    }
  ]
}

// If you specify an invalid message destination (400 Bad Request)
{
  "message": "The request body has 1 error(s)",
  "details": [
    {
      "message": "The value must be a valid SHA-256 digest.",
      "property": "to"
    }
  ]
}

// If you don't have permission to send LINE notification messages (template) (403 Forbidden)
{
  "message": "Access to this API is not available for your account"
}

// If sending a LINE notification message fails (422 Unprocessable Entity)
{
  "message": "Failed to send messages"
}
```

## Get number of sent LINE notification messages (template)

Gets the number of template messages sent using the Send (template) endpoint.

**HTTP request**

```
GET https://api.line.me/v2/bot/message/delivery/pnp/templated
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X GET 'https://api.line.me/v2/bot/message/delivery/pnp/templated?date=20240916' \
-H 'Authorization: Bearer {channel_access_token}'
```

**Request header**: `Authorization: Bearer {channel access token}`.

**Query parameter**

| Param | Required | Description |
|---|---|---|
| `date` | Yes | Date the message was sent. Format `yyyyMMdd` (e.g. `20240916`). Time zone UTC+9. |

**Response**: status code `200` and:

| Field | Type | Description |
|---|---|---|
| `status` | String | Aggregation status. `ready` (count is available), `unready` (total not yet complete — retry after a short time; usually completes within the next day), `out_of_service` (date is before the aggregation system start date 03/31/2018). |
| `success` | Number | Number of messages sent on the date. Included only when `status` is `ready`. |

```json
{
  "status": "ready",
  "success": 3
}
```

**Error response**

| Code | Description |
|---|---|
| `400` | Problem with the request: invalid date, or date not specified. |

```json
// If you specify an invalid date (400 Bad Request)
{
  "message": "The value for the 'date' parameter is invalid"
}
```

## Send a LINE notification message (flexible)

API for sending a LINE notification message (flexible) by specifying the user's
phone number.

> The name "LINE notification messages" was changed to "LINE notification
> messages (flexible)" — see the notice from 2025/06/02. LINE notification
> messages (flexible) require **prior UX review**; only reviewed messages can be
> sent. Messages containing images, videos, or audio aren't permitted.

**HTTP request**

```
POST https://api.line.me/bot/pnp/push
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X POST https://api.line.me/bot/pnp/push \
-H 'Authorization: Bearer {channel_access_token}' \
-H 'Content-Type:application/json' \
-d '{
    "to": "{hashed_phone_number}",
    "messages":[
        {
            "type":"text",
            "text":"Hello, world1"
        },
        {
            "type":"text",
            "text":"Hello, world2"
        }
    ]
}'

#Example request (with X-Line-Delivery-Tag)
curl -v -X POST https://api.line.me/bot/pnp/push \
-H 'Authorization: Bearer {channel_access_token}' \
-H 'Content-Type:application/json' \
-H 'X-Line-Delivery-Tag:{delivery_tag}' \
-d '{
    "to": "{hashed_phone_number}",
    "messages":[
        {
            "type":"text",
            "text":"Hello, world1"
        },
        {
            "type":"text",
            "text":"Hello, world2"
        }
    ]
}'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` |
| `X-Line-Delivery-Tag` | No | String returned in the `delivery.data` property of the delivery completion event via webhook. Min 16 / max 100 characters. |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | String | Yes | Message destination. A phone number normalized to E.164 and hashed with SHA256. Can't be a group/multi-person chat. Can't specify multiple phone numbers. |
| `messages` | Array of message objects | Yes | Message to be sent. **Max 5.** Uses standard Messaging API message objects (subject to "Message types that can be sent in LINE notification messages" — no image/video/audio). |

**Response**: status code `200` and an empty JSON object `{}`.

**Error response**

| Code | Description |
|---|---|
| `400` | Problem with the request: invalid destination, or invalid message object. |
| `422` | Failed to send: no LINE user is associated with the phone number; the phone number wasn't issued in a service target country; the user refused LINE notification messages; or the user hasn't agreed to LINE's Privacy Policy (March 2022 or later). |

```json
// If you specify an invalid message destination (400 Bad Request)
{
  "message": "The request body has 1 error(s)",
  "details": [
    {
      "message": "The value must be a valid SHA-256 digest.",
      "property": "to"
    }
  ]
}

// When sending a LINE notification message fails (422 Unprocessable Entity)
{
  "message": "Failed to send messages"
}
```

## Get number of sent LINE notification messages (flexible)

Gets the number of flexible messages sent using the Send (flexible) endpoint.

**HTTP request**

```
GET https://api.line.me/v2/bot/message/delivery/pnp
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X GET 'https://api.line.me/v2/bot/message/delivery/pnp?date=20211231' \
-H 'Authorization: Bearer {channel_access_token}'
```

**Request header**: `Authorization: Bearer {channel access token}`.

**Query parameter**

| Param | Required | Description |
|---|---|---|
| `date` | Yes | Date the message was sent. Format `yyyyMMdd` (e.g. `20211231`). Time zone UTC+9. |

**Response**: status code `200` and the same `status` / `success` shape as the
template variant above.

```json
{
  "status": "ready",
  "success": 3
}
```

**Error response**

| Code | Description |
|---|---|
| `400` | Problem with the request: invalid date, or date not specified. |

```json
// If you specify an invalid date (400 Bad Request)
{
  "message": "The value for the 'date' parameter is invalid"
}
```

---

# Webhook delivery completion event

When a LINE notification messages API request is made and delivery of the message
to the user **completes**, a dedicated webhook event (the **delivery completion
event**) is sent from the LINE Platform to the bot server's webhook URL.

## Event specification

| Property | Type | Description |
|---|---|---|
| `type` | String | `delivery` |
| `mode` | Object | See Messaging API "Common properties". |
| `timestamp` | Number | See Messaging API "Common properties". |
| `webhookEventId` | String | See Messaging API "Common properties". |
| `deliveryContext` | Object | See Messaging API "Common properties". |
| `delivery` | Object | Delivery object containing a hashed phone number string or the string specified by `X-Line-Delivery-Tag`. |
| `delivery.data` | String | A hashed phone number string, or the string specified by `X-Line-Delivery-Tag` if that header was set on the send request. |

If `X-Line-Delivery-Tag` was specified on the send request, that string is
returned in `delivery.data`; otherwise `delivery.data` is the hashed phone
number. Use the tag to determine which message was delivered.

```json
// Example webhook delivery completion event (without X-Line-Delivery-Tag header specified)
{
  "destination": "Uc7472b39e21dab71c2347e02714630d6",
  "events": [
    {
      "type": "delivery",
      "delivery": {
        "data": "68df277462529930889fab80ecffdc0883906320591df93c25efc08300410fc2"
      },
      "webhookEventId": "01G17DAF0QJ7A3ERC5EJ9MAMH8",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1650590038721,
      "mode": "active"
    }
  ]
}

// Example webhook delivery completion event (with X-Line-Delivery-Tag header specified)
{
  "destination": "Uc7472b39e21dab71c2347e02714630d6",
  "events": [
    {
      "type": "delivery",
      "delivery": {
        "data": "15034552939884E28681A7D668CEA94C147C716C0EC9DFE8B80B44EF3B57F6BD0602366BC3menu01"
      },
      "webhookEventId": "01G17EJCGAVV66J5WNA7ZCTF6H",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1650591346705,
      "mode": "active"
    }
  ]
}
```

> **The `source` property was REMOVED** from the delivery completion event as of
> 2025/01/28 (announced 2024/08/09). Older code expecting `delivery` events to
> carry `source.userId` no longer works.

## What the event does and doesn't mean

The delivery completion event indicates that **the LINE notification message was
delivered to the user and can now be viewed**. It does **not** indicate:

- A successful LINE notification messages API request.
- The user received the "Set up to get LINE notification messages" message.
- Consent to get LINE notification messages.
- The user received a message asking for SMS authentication.
- The user performed SMS authentication.
- The user opened (read) the LINE notification message.

## Signature verification

Verify the delivery completion event's `x-line-signature` using the **channel
secret** (the same Messaging API signature validation). For channels using LINE
Chat Plus, use the Switcher Secret.

## When you don't receive a delivery completion event

Even after a `200`/`202` response, if no delivery completion event arrives within
24 hours, the message wasn't delivered, because either:

- **The user blocked the LINE Official Account** — blocked-user requests still
  return `200`/`202`, but the message and the "LINE notification message
  received" message are not sent.
- **The user didn't give required consent or authentication** — reception
  settings not set, or SMS authentication required but not performed.

---

# User flows when receiving a LINE notification message

The "LINE" system account sends a **"LINE notification message received"**
message each time a LINE notification message is sent. This is always sent; the
sender can't prevent it or reduce its frequency. If the user has blocked the LINE
Official Account, neither the notification message nor the "received" message is
sent. Messages sent while blocked are **not delivered even after unblocking**.

There are four reception flows plus a phone-number-change flow:

| Scenario | Flow |
|---|---|
| Already consented, no SMS auth needed | "LINE" sends the "received" message; the requested message is delivered at the same time. |
| Reception setting "not set", no SMS auth needed | User gets "received" + "Set up to receive" messages → taps "Set" → consent screen → on consent, "received" message + the requested message are delivered. |
| Reception setting "not set", SMS auth needed | User gets "received" + "Set up to receive" → taps "Set" → consent screen → SMS confirmation dialog → SMS PIN entry → on success, "received" message + requested message delivered. |
| Already consented, SMS auth needed | User gets "received" + "phone number authentication" messages → taps "Set" → phone auth screen → "Send SMS" → SMS PIN entry → on success, "received" message + requested message delivered. |
| Changing the registered phone number | During SMS auth, tap **Change** → **Next** → enter new phone number → SMS PIN entry → "Your phone number has been changed" message. (Can also change via Settings → Profile → Phone number.) |

> **Changing the phone number during SMS auth**: if the user taps **Change** in
> the SMS dialog and changes the phone number registered to the LINE account,
> LINE notification messages sent to the **old** phone number won't be delivered.

## States of reception settings

| State | Description |
|---|---|
| Agree (on) | Consented to receive. Messages will be sent. |
| Reject (off) | Refused. Messages won't be sent. |
| Not set | Neither consented nor refused. Receiving a message triggers a consent request. New accounts created in LINE app version 8.0.0 or earlier start "not set". Once changed away from "not set", it can't return to "not set". |

Users can change this any time: **Settings → Privacy → Provide usage data → LINE
notification messages**.

## Messages sent when the user hasn't consented

| State | Behavior |
|---|---|
| Reject (off) | The requested message won't be sent; it is deleted. |
| Not set | If the user agrees within **24 hours** of receiving the "Set up to get LINE notification messages" message, the message is sent. Otherwise the requested message is not sent and is deleted. |

---

# Behavior, gotchas, billing

- **Blocked-user requests return success.** A request to a user who blocked the
  LINE Official Account returns `200` or `202`, but the message isn't sent and no
  delivery completion event is sent.
- **Success but not delivered.** A `200`/`202` to a non-blocking user, yet the
  message isn't delivered, can mean: reception setting was changed to "reject"
  when the consent message was received; reception setting was left unconfigured;
  or SMS authentication was required but not performed.
- **Friend add/block events.** A user who isn't a friend can choose whether to
  add the LINE Official Account as a friend. Adding → a **follow event**.
  Blocking → an **unfollow event**. With LINE notification messages, unfollow
  events may arrive from users who never produced a follow event.
- **Rich menu for non-friends.** A user who received a LINE notification message
  can open a 1-on-1 chat and use the rich menu without adding the account as a
  friend. The **default rich menu** (set via LINE Official Account Manager or
  Messaging API) is shown; a **per-user rich menu** set via Messaging API for a
  non-friend user is **not** shown. Non-friend users can also send messages, so
  you may receive **postback** or **message** events from non-friends.
- **Billing.** Only messages **actually sent to the user** are billed for LINE
  notification messages usage fees. Use the Get-count endpoints to check the
  number actually sent. The count endpoints count only messages actually sent.
