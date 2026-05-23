---
name: line-message-api
description: >-
  LINE Messaging API official reference at API-reference depth. Covers every
  endpoint, request/response schema, message object, webhook event, and rich
  menu / Flex Message structure. Use this skill whenever the task touches the
  LINE bot platform: building or debugging a LINE bot / LINE Official Account,
  handling LINE webhooks, sending reply / push / multicast / narrowcast /
  broadcast messages, issuing or verifying channel access tokens, validating
  the x-line-signature, building text / sticker / image / video / audio /
  location / imagemap / template / Flex / coupon messages, quick replies,
  rich menus and rich menu aliases, audiences, insights, coupons, profile /
  group / multi-person chat lookups, account link tokens, or membership
  features. Trigger on mentions of: LINE Messaging API, developers.line.biz,
  api.line.me, api-data.line.me, @line/bot-sdk, line-bot-sdk, replyToken,
  channel access token, channel secret, x-line-signature, LIFF bot, Flex
  Message, rich menu, narrowcast, postback event, webhook event object.
---

# LINE Messaging API Reference

API-reference-level coverage of the LINE Messaging API, extracted from the
official reference at `https://developers.line.biz/en/reference/messaging-api/`.

The entire official reference is a single long page; this skill splits it into
topic-scoped reference files. **Read the reference file that matches the task —
do not guess endpoint paths, parameter names, or JSON shapes.**

## When this skill applies

Any work on a LINE bot / LINE Official Account: receiving webhooks, sending
messages, managing rich menus, audiences, coupons, insights, tokens, or looking
up user / group / membership data. Works for raw HTTP calls (`curl`, `fetch`,
`axios`, `requests`) and for SDKs such as `@line/bot-sdk` (the SDK mirrors these
endpoints and object shapes 1:1).

## Two domain names — pick the right one

| Domain | Used by |
|---|---|
| `api-data.line.me` | Get content, Get content preview, Verify transcoding, Create/update audience by file, Upload/Download rich menu image |
| `api.line.me` | Every other endpoint |

OAuth token endpoints use `api.line.me` with paths under `/oauth2/...` or `/v2/oauth/...`.

## Auth in one line

Most endpoints require `Authorization: Bearer {channel access token}`. Webhook
requests carry `x-line-signature` (HMAC-SHA256 of the raw request body keyed by
the channel secret, Base64-encoded) — always validate it. See `references/common-and-auth.md`.

## Reference file map

| File | Contents |
|---|---|
| `references/common-and-auth.md` | Common specs (domains, rate limits, status codes, response headers, error responses/messages, URL encoding) + Channel access token endpoints (v2.1, stateless, short/long-lived: issue / verify / revoke / get kids) |
| `references/webhooks-and-events.md` | Webhook request/response, signature validation, webhook settings endpoints (set/get/test endpoint), and all webhook event objects (message, unsend, follow, unfollow, join, leave, memberJoined, memberLeft, postback, videoPlayComplete, beacon, accountLink, membership) + source objects |
| `references/messaging-endpoints.md` | Send reply / push / multicast / narrowcast / broadcast, mark-as-read, loading animation, quota & sent-count endpoints, validate-message endpoints, narrowcast recipient/demographic/limit objects, narrowcast status, retrying an API request, Get content endpoints |
| `references/message-objects.md` | All message objects: text, textV2 (mention/emoji), sticker, image, video, audio, location, coupon, imagemap, template (buttons/confirm/carousel/image_carousel), quick reply, sender customization |
| `references/flex-message.md` | Flex Message containers (bubble, carousel) and all components (box, button, image, video, icon, text, span, separator) with properties |
| `references/action-objects.md` | Action objects: postback, message, uri, datetimepicker, camera, cameraRoll, location, richmenuswitch, clipboard + label specs |
| `references/rich-menu.md` | Rich menu structure (rich menu object, size, area, bounds), all rich menu endpoints, per-user rich menu endpoints, rich menu alias endpoints |
| `references/users-groups-and-misc.md` | Get profile, follower IDs, bot info, group chat & multi-person chat endpoints, account link, membership, audience management, insights, coupon endpoints |

## Quick endpoint index

Reply/push/etc. message bodies all take `messages` (array of message objects, max 5).

```
POST   /v2/bot/message/reply              Send reply message       (replyToken + messages)
POST   /v2/bot/message/push               Send push message        (to + messages)
POST   /v2/bot/message/multicast          Send multicast           (to[] ≤500 + messages)
POST   /v2/bot/message/narrowcast         Send narrowcast          (messages + recipient/filter/limit) → 202
POST   /v2/bot/message/broadcast          Send broadcast           (messages)
GET    /v2/bot/message/progress/narrowcast            Narrowcast status (?requestId=)
POST   /v2/bot/chat/markAsRead            Mark messages as read
POST   /v2/bot/chat/loading/start         Display loading animation
GET    /v2/bot/message/quota              Monthly target limit
GET    /v2/bot/message/quota/consumption  Messages sent this month
GET    /v2/bot/message/delivery/{reply|push|multicast|broadcast}   Sent counts (?date=yyyyMMdd)
POST   /v2/bot/message/validate/{reply|push|multicast|narrowcast|broadcast}   Validate message objects

GET    /v2/bot/message/{messageId}/content                  Get content (api-data)
GET    /v2/bot/message/{messageId}/content/transcoding      Verify video/audio prep (api-data)
GET    /v2/bot/message/{messageId}/content/preview          Get preview image (api-data)

PUT    /v2/bot/channel/webhook/endpoint   Set webhook URL
GET    /v2/bot/channel/webhook/endpoint   Get webhook info
POST   /v2/bot/channel/webhook/test       Test webhook endpoint

POST   /oauth2/v2.1/token                 Issue channel access token v2.1 (JWT)
GET    /oauth2/v2.1/verify                Verify token v2.1 (?access_token=)
GET    /oauth2/v2.1/tokens/kid            Get all valid token key IDs
POST   /oauth2/v2.1/revoke                Revoke token v2.1
POST   /oauth2/v3/token                   Issue stateless token (15 min)
POST   /v2/oauth/accessToken              Issue short-lived token (30 days)
POST   /v2/oauth/verify                   Verify short/long-lived token
POST   /v2/oauth/revoke                   Revoke short/long-lived token

GET    /v2/bot/profile/{userId}           Get profile
GET    /v2/bot/followers/ids              Get follower IDs (?limit=&start=)
GET    /v2/bot/info                       Get bot info
POST   /v2/bot/user/{userId}/linkToken    Issue account link token

GET    /v2/bot/group/{groupId}/summary               Group summary
GET    /v2/bot/group/{groupId}/members/count         Group member count
GET    /v2/bot/group/{groupId}/members/ids           Group member IDs
GET    /v2/bot/group/{groupId}/member/{userId}       Group member profile
POST   /v2/bot/group/{groupId}/leave                 Leave group
GET    /v2/bot/room/{roomId}/members/count           Room member count
GET    /v2/bot/room/{roomId}/members/ids             Room member IDs
GET    /v2/bot/room/{roomId}/member/{userId}         Room member profile
POST   /v2/bot/room/{roomId}/leave                   Leave room

POST   /v2/bot/richmenu                              Create rich menu
POST   /v2/bot/richmenu/validate                     Validate rich menu object
POST   /v2/bot/richmenu/{richMenuId}/content         Upload rich menu image (api-data)
GET    /v2/bot/richmenu/{richMenuId}/content         Download rich menu image (api-data)
GET    /v2/bot/richmenu/list                         List rich menus
GET    /v2/bot/richmenu/{richMenuId}                 Get rich menu
DELETE /v2/bot/richmenu/{richMenuId}                 Delete rich menu
POST   /v2/bot/user/all/richmenu/{richMenuId}        Set default rich menu
GET    /v2/bot/user/all/richmenu                     Get default rich menu ID
DELETE /v2/bot/user/all/richmenu                     Clear default rich menu
POST   /v2/bot/user/{userId}/richmenu/{richMenuId}   Link rich menu to user
POST   /v2/bot/richmenu/bulk/link                    Link rich menu to users
GET    /v2/bot/user/{userId}/richmenu                Get user's rich menu ID
DELETE /v2/bot/user/{userId}/richmenu                Unlink rich menu from user
POST   /v2/bot/richmenu/bulk/unlink                  Unlink rich menu from users
POST   /v2/bot/richmenu/batch                        Batch control rich menus
GET    /v2/bot/richmenu/progress/batch               Batch control progress
POST   /v2/bot/richmenu/validate/batch               Validate batch control request
POST   /v2/bot/richmenu/alias                        Create rich menu alias
DELETE /v2/bot/richmenu/alias/{richMenuAliasId}      Delete rich menu alias
POST   /v2/bot/richmenu/alias/{richMenuAliasId}      Update rich menu alias
GET    /v2/bot/richmenu/alias/{richMenuAliasId}      Get rich menu alias
GET    /v2/bot/richmenu/alias/list                   List rich menu aliases

POST   /v2/bot/audienceGroup/upload                  Create audience (by JSON)
POST   /v2/bot/audienceGroup/upload/byFile           Create audience (by file, api-data)
PUT    /v2/bot/audienceGroup/upload                  Add user IDs (by JSON)
PUT    /v2/bot/audienceGroup/upload/byFile           Add user IDs (by file, api-data)
POST   /v2/bot/audienceGroup/click                   Create click audience
POST   /v2/bot/audienceGroup/imp                     Create impression audience
PUT    /v2/bot/audienceGroup/{audienceGroupId}/updateDescription   Rename audience
DELETE /v2/bot/audienceGroup/{audienceGroupId}       Delete audience
GET    /v2/bot/audienceGroup/{audienceGroupId}       Get audience data
GET    /v2/bot/audienceGroup/list                    Get multiple audiences
GET    /v2/bot/audienceGroup/shared/{audienceGroupId}   Get shared audience
GET    /v2/bot/audienceGroup/shared/list             List shared audiences

GET    /v2/bot/insight/message/delivery              Delivery insight (?date=yyyyMMdd)
GET    /v2/bot/insight/followers                     Followers insight (?date=yyyyMMdd)
GET    /v2/bot/insight/demographic                   Friend demographics
GET    /v2/bot/insight/message/event                 Per-message events (?requestId=)
GET    /v2/bot/insight/message/event/aggregation     Per-unit statistics
GET    /v2/bot/message/aggregation/info              Unit name type count this month
GET    /v2/bot/message/aggregation/list              Unit names assigned this month

POST   /v2/bot/coupon                                Create coupon
PUT    /v2/bot/coupon/{couponId}/close               Discontinue coupon
GET    /v2/bot/coupon                                List coupons
GET    /v2/bot/coupon/{couponId}                     Get coupon

GET    /v2/bot/membership/subscription/{userId}      User's membership subscription status
GET    /v2/bot/membership/{membershipId}/users/ids   Membership user IDs
GET    /v2/bot/membership/list                       Membership plans being offered
```

## Working rules

- The reply token expires fast (use within ~1 minute, hard limit 20 minutes once),
  is single-use, and is absent when `mode` is `standby`. Use push if you have no token.
- `messages` arrays cap at 5. Text caps at 5000 chars. Audience `to[]` caps at 500.
- Narrowcast returns `202` (async) — confirm delivery via the progress endpoint.
- Idempotency: pass `X-Line-Retry-Key` (a UUID) on push/multicast/narrowcast/broadcast;
  a duplicate retry key yields `409` with `x-line-accepted-request-id`.
- Always validate `x-line-signature` on incoming webhooks before processing events.
- Source IDs (`userId`, `groupId`, `roomId`) come from webhook events; never use the
  human-facing LINE ID. `userId` matches `U[0-9a-f]{32}`.
