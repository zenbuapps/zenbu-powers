# Messaging Endpoints

Source: `https://developers.line.biz/en/reference/messaging-api/`

## Table of contents

- Send: reply, push, multicast, narrowcast, broadcast
- Narrowcast recipient / demographic filter / limit objects + status
- Mark as read, loading animation
- Quota & sent-count endpoints
- Validate message objects endpoints
- Retrying an API request
- Getting content endpoints

All send endpoints take a `messages` array of [message objects](message-objects.md) (max 5).
All send endpoints require `Content-Type: application/json` and `Authorization: Bearer {token}`.

---

## Send reply message

`POST https://api.line.me/v2/bot/message/reply` — Rate limit 2,000/s

Replies in response to an event using the `replyToken` from the webhook event.

**Reply token rules**: single-use; must be used within ~1 minute of receiving the webhook
(hard limit 20 minutes once); reply tokens in redelivered webhooks work for 1 minute too,
unless the original token was already used or 20 minutes passed. Don't rely on the limit —
use the token ASAP.

Request body:

| Property | Required | Type | Description |
|---|---|---|---|
| `replyToken` | Yes | String | Reply token received via webhook |
| `messages` | Yes | Array | Message objects, max 5 |
| `notificationDisabled` | No | Boolean | `true` = no push notification. Default `false` |

```sh
curl -v -X POST https://api.line.me/v2/bot/message/reply \
-H 'Content-Type: application/json' -H 'Authorization: Bearer {token}' \
-d '{"replyToken":"nHuyWiB7yP5Zw52FIkcQobQuGDXCTA","messages":[{"type":"text","text":"Hello, user"}]}'
```

Response 200: `sentMessages` (Array, max 5) of `{ id (Number), quoteToken (String, not always) }`.
Error: `400` (invalid reply token / invalid message object) — messages not sent.

## Send push message

`POST https://api.line.me/v2/bot/message/push` — Rate limit 2,000/s

Sends a message to a user / group / multi-person chat at any time.

**Conditions**: recipient must be a friend, or a group/room the account joined, or a user
who messaged the account within 7 days in 1:1 chat. Sending to deleted/blocked/non-friend
users returns `200` but they won't receive it.

Request headers also accept `X-Line-Retry-Key` (optional UUID for idempotency).

Request body:

| Property | Required | Type | Description |
|---|---|---|---|
| `to` | Yes | String | Target `userId` / `groupId` / `roomId` from a webhook event |
| `messages` | Yes | Array | Message objects, max 5 |
| `notificationDisabled` | No | Boolean | Default `false` |
| `customAggregationUnits` | No | Array of strings | Aggregation unit name. Max 1 unit; ≤30 chars; `[a-zA-Z0-9_]`. Case-sensitive. ≤1,000 distinct unit names/month. |

Response 200: `sentMessages` of `{ id, quoteToken }`.
Errors: `400` (bad user/group ID, invalid message), `409` (same retry key already accepted),
`429` (rate limit / many messages to same user / monthly quota exceeded).

## Send multicast message

`POST https://api.line.me/v2/bot/message/multicast` — Rate limit 200/s

Efficiently sends the same message to multiple user IDs. **No groups/rooms.** For a single
recipient prefer push (lower latency).

Request headers also accept `X-Line-Retry-Key`.

Request body:

| Property | Required | Type | Description |
|---|---|---|---|
| `to` | Yes | Array of strings | User IDs (`userId` from webhook events). Max 500. |
| `messages` | Yes | Array | Message objects, max 5 |
| `notificationDisabled` | No | Boolean | Default `false` |
| `customAggregationUnits` | No | Array of strings | Same rules as push |

Response 200: `{}` (empty). Errors: `400`, `409`, `429`. Messages not sent to anyone if an error returns.

## Send narrowcast message

`POST https://api.line.me/v2/bot/message/narrowcast` — Rate limit 60/hour

Sends a message to multiple users selected by attributes (age, gender, OS, region,
friendship duration) and/or audiences. **No groups/rooms.** Sent asynchronously — returns `202`.

**Restrictions**: to use attribute filters, "target reach" must be ≥100 (else `403`); the
final recipient count must be ≥50 (else `202` but delivery fails); each audience must have
≥50 recipients. Narrowcast reserves messages for the whole target reach regardless of actual
recipients — may temporarily exhaust the monthly quota.

Request headers also accept `X-Line-Retry-Key`.

Request body:

| Property | Required | Type | Description |
|---|---|---|---|
| `messages` | Yes | Array | Message objects, max 5 |
| `recipient` | No | Object | Recipient object. Up to 10 audience + redelivery objects combined. Omitted = all friends. |
| `filter.demographic` | No | Object | Demographic filter object. Omitted = everyone (incl. "unknown" attributes). |
| `limit` | No | Object | Limit object |
| `notificationDisabled` | No | Boolean | Default `false` |

### Recipient objects

**Audience object**: `type` = `audience`, `audienceGroupId` (Number).
**Redelivery object**: `type` = `redelivery`, `requestId` (String — request ID of a
previously sent narrowcast; must be ≤14 days old and `phase`=`succeeded`).
**Logical operator object**: `type` = `operator` with exactly one of `and` / `or` (arrays
of recipient objects) / `not` (recipient object). No empty arrays.

```json
{ "type": "operator", "and": [
  { "type": "audience", "audienceGroupId": 5614991017776 },
  { "type": "operator", "not": { "type": "redelivery", "requestId": "5b59509c-c57b-11e9-aa8c-2a2ae2dbcce4" } }
]}
```

### Demographic filter objects

Attribute data is ~3 days old. Logical `operator` objects (`and`/`or`/`not`, up to 10 per request) combine filters.

| Filter type | Properties |
|---|---|
| `gender` | `oneOf`: array of `male` / `female` |
| `age` | `gte` / `lt` (specify at least one): `age_15`,`age_20`,`age_25`,`age_30`,`age_35`,`age_40`,`age_45`,`age_50`,`age_55`,`age_60`,`age_65`,`age_70` |
| `appType` | `oneOf`: array of `ios` / `android` |
| `area` | `oneOf`: array of region codes — `jp_01`..`jp_47` (Japan prefectures), `tw_01`..`tw_22` (Taiwan cities/counties), `th_01`..`th_08` (Thailand regions) |
| `subscriptionPeriod` | `gte` / `lt` (specify at least one): `day_7`,`day_30`,`day_90`,`day_180`,`day_365` |

### Limit object

| Property | Type | Description |
|---|---|---|
| `max` | Number | Max narrowcast messages to send; recipients chosen at random |
| `upToRemainingQuota` | Boolean | If `true`, sends within remaining monthly quota. Default `false` |
| `forbidPartialDelivery` | Boolean | If `true`, cancels delivery instead of partial delivery when recipients exceed max. Requires `upToRemainingQuota: true`. |

Response: `202` + `{}`. Errors: `400` (invalid request ID/audience/message/param combo),
`403` (not enough recipients), `409`, `429`.

## Get narrowcast message status

`GET https://api.line.me/v2/bot/message/progress/narrowcast?requestId={id}` — Rate limit 2,000/s

`requestId` from the narrowcast response headers. Status available for 14 days after `acceptedTime`.

Response 200:

| Property | Type | Description |
|---|---|---|
| `phase` | String | `waiting`, `sending`, `succeeded`, `failed` |
| `successCount` | Number | (Not always) Recipients who received the message |
| `failureCount` | Number | (Not always) Failed recipients |
| `targetCount` | Number | (Not always) Intended recipients |
| `failedDescription` | String | (Not always) Reason — only when `phase`=`failed` |
| `errorCode` | Number | (Not always) `1` internal error; `2` not enough recipients; `3` retry conflict; `4` audience <50; `5` delivery canceled (forbidPartialDelivery) |
| `acceptedTime` | String | ISO 8601 UTC accepted time |
| `completedTime` | String | (Not always) ISO 8601 UTC completion — when `succeeded`/`failed` |

Errors: `400` (invalid request ID), `404` (expired / not a narrowcast request ID).

## Send broadcast message

`POST https://api.line.me/v2/bot/message/broadcast` — Rate limit 60/hour

Sends a message to all friends at any time. Request headers also accept `X-Line-Retry-Key`.
Request body: `messages` (Array, max 5), `notificationDisabled` (Boolean, optional).
Response 200: `{}`. Errors: `400`, `409`, `429`.

---

## Mark messages as read

`POST https://api.line.me/v2/bot/chat/markAsRead` — Rate limit 2,000/s

Marks all messages sent before the specified message as read.
Body: `markAsReadToken` (String, required — from the `markAsReadToken` property of a
message webhook event). Response 200: `{}`. Error: `400` (invalid read token).

## Display a loading animation

`POST https://api.line.me/v2/bot/chat/loading/start` — Rate limit 100/s

Displays a loading animation in a 1:1 chat (LINE iOS/Android 13.16.0+). Disappears after
the specified seconds or when a new message arrives.

Body: `chatId` (String, required — user ID; no groups/rooms), `loadingSeconds` (Number,
optional — one of 5,10,...,60; default 20).
Response: `202` + `{}` (returns `202` even if not displayed). Error: `400` (invalid seconds /
user ID / group or room specified).

## Get the target limit for sending messages this month

`GET https://api.line.me/v2/bot/message/quota` — Rate limit 2,000/s

Response 200: `type` (`none` / `limited`), `value` (Number — target limit, not always).

## Get number of messages sent this month

`GET https://api.line.me/v2/bot/message/quota/consumption` — Rate limit 2,000/s

Response 200: `totalUsage` (Number — messages sent in the current month).

## Get number of sent messages (by type)

`GET https://api.line.me/v2/bot/message/delivery/{type}?date=yyyyMMdd` — Rate limit 2,000/s

`{type}` = `reply` / `push` / `multicast` / `broadcast`. `date` query parameter (required,
`yyyyMMdd`, JST). Response 200: `status` (`ready` / `unready` / `out_of_service`),
`success` (Number — messages sent on that date; only when `status` is `ready`).

---

## Validate message objects

`POST https://api.line.me/v2/bot/message/validate/{type}`

`{type}` = `reply` / `push` / `multicast` / `narrowcast` / `broadcast`.
Validates the `messages` array as a request body without sending. Rate limit 2,000/s.

Headers: `Authorization`, `Content-Type: application/json`.
Body: `messages` (Array of message objects, required).
Response 200: `{}` if valid. Error: `400` (invalid message object).

```sh
curl -v -X POST https://api.line.me/v2/bot/message/validate/push \
-H 'Authorization: Bearer {token}' -H 'Content-Type: application/json' \
-d '{"messages":[{"type":"text","text":"Hello, world"}]}'
```

---

## Retrying an API request

To safely retry push / multicast / narrowcast / broadcast, send the **same**
`X-Line-Retry-Key` (a UUID you generate). If a request with that retry key was already
accepted, the API returns `409 Conflict` with the `X-Line-Accepted-Request-Id` header set
to the `x-line-request-id` of the originally accepted request — so the message isn't
sent twice. A retry key is valid for 24 hours.

Response when already accepted: `409` with body
`{ "message": "A request with the same retry key has been accepted" }`.

---

# Getting content

Retrieves content (image/video/audio/file) a user sent, via the message ID from the
webhook. Only available when the webhook's `contentProvider.type` is `line`. There is no
API to re-retrieve text.

## Get content

`GET https://api-data.line.me/v2/bot/message/{messageId}/content`

Header: `Authorization: Bearer {token}`. Path param: `messageId`.
Response 200: content in binary; file format in the `Content-Type` response header.
For large video/audio, status `202` means binary not yet ready (poll the transcoding endpoint).
Content is deleted after an unspecified period. Errors: `404`, `410` (message unsent).

```sh
curl -v -X GET https://api-data.line.me/v2/bot/message/{messageId}/content \
-H 'Authorization: Bearer {token}' -o content.bin
```

## Verify the preparation status of a video or audio for getting

`GET https://api-data.line.me/v2/bot/message/{messageId}/content/transcoding`

Path param: `messageId` (of a video/audio message).
Response 200: `status` (`processing` / `succeeded` / `failed`).
Errors: `400` (not video/audio), `404`, `410`.

## Get a preview image of the image or video

`GET https://api-data.line.me/v2/bot/message/{messageId}/content/preview`

Path param: `messageId` (of an image/video message). Response 200: preview image binary
(smaller than the original). Errors: `400` (not image/video), `404`, `410`.
