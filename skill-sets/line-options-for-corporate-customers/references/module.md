# Module (Module Channel)

Source:
- `https://developers.line.biz/en/docs/partner-docs/module/`
- `https://developers.line.biz/en/docs/partner-docs/module-technical-attach-channel/`
- `https://developers.line.biz/en/docs/partner-docs/module-technical-console/`
- `https://developers.line.biz/en/docs/partner-docs/module-technical-chat-control/`
- `https://developers.line.biz/en/docs/partner-docs/module-technical-using-messaging-api/`
- `https://developers.line.biz/en/reference/partner-docs/` (Module section of the API reference)

## Table of contents

- What a module is
- Chat initiative (Chat Control), Default Active
- Attaching a module channel — OAuth 2.0 flow
- Scopes (the full scope → endpoint table)
- API reference: token, detach, acquire/release control, list bots
- Module channel-specific webhook events
- Using the Messaging API from a module channel
- Configure module channel settings (console)

Requires corporate-customer application. Currently the module is only available
for release as a **paid extension on the LINE Marketplace** (`https://line-marketplace.com/`,
only available in Japanese). For inquiries: `https://line-marketplace.com/jp/inquiry`.

---

# What a module is

A **module** adds Messaging API functions to a LINE Official Account by linking
(**attaching**) a special channel — a **module channel** — to it. Even if the
LINE Official Account hasn't created a Messaging API channel, it can call the
Messaging API from a module channel to send messages and set rich menus.

**Module channel vs. Messaging API channel:**
- A LINE Official Account can normally have only one Messaging API channel.
- A **module channel can be linked to multiple LINE Official Accounts.**

The server that receives webhooks and the server that calls the Messaging API are
prepared by the company developing the module channel, and need not be the same.

**Webhooks are always on for module channels.** Even if webhook use is disabled in
the LINE Official Account's response settings (so the Messaging API channel
receives nothing), webhook events are **still sent to the module channel**.

## What LY Corporation provides vs. what you build

LY Corporation provides:

| Function | Description |
|---|---|
| Linking mechanism | OAuth 2.0 authorization mechanism + REST API to link module channels to LINE Official Accounts. |
| Detach API | REST API to unlink the LINE Official Account from the module channel. |
| Chat initiative control API | REST API to control chat initiative (Chat Control) — for cases where initiative changes due to unexpected events. |
| Messaging API access from a module channel | A special module-specific request header lets you call the Messaging API from a module channel. |
| Module channel-specific webhook events | Attached / Detached / Activated / Deactivated / botSuspended / botResumed. |
| Get-LINE-OA-info API | REST API to get info about a LINE Official Account linked to a module channel. |

The customer must build everything else: the OAuth 2.0 authorization-request
system, the Messaging API integration and chatbot logic, the management
screen/operation console, the payment/usage-fee management, and user support.
LY Corporation does **not** provide support to end users of LINE Marketplace
extensions.

> Calling the Messaging API from a module channel to send messages may incur the
> normal **Messaging API fee** for the LINE Official Account operator.

## Constraints when used on the LINE Marketplace

- **Don't use the Messaging API from the Messaging API channel** for accounts
  linked to a module channel — depending on implementation, the module's extended
  functions may behave unexpectedly (e.g. a rich menu set via the Messaging API
  channel overrides the module's rich menu; webhook events from Messaging-API-
  channel actions reach the module and aren't handled correctly).
- **Only one module channel** (extension) can be linked to one LINE Official
  Account at a time, on the LINE Marketplace.
- The Messaging API types available depend on the granted scope (see Scopes).
- A module channel has one webhook endpoint URL. When attached, webhook events for
  the LINE Official Account's chat room are also sent to that URL.

> If a linked LINE Official Account also uses a Messaging API channel with webhook
> enabled, events are sent to **both** the module channel and the Messaging API
> channel endpoint. The event sent to the Messaging API channel will have
> `mode` = `standby` and **no reply token** (so no reply message).

---

# Chat initiative (Chat Control)

To prevent multiple module channels from replying to / processing the same end-
user action simultaneously, module channels use the concept of **initiative
(Chat Control)**.

| Initiative | Description |
|---|---|
| **Active Channel** | The channel with initiative. Can send reply messages, push messages, etc. Only one Active Channel per LINE Official Account. By default the **Primary Channel** (the standard Messaging API channel) is the Active Channel. |
| **Standby Channel** | A channel without initiative. Should refrain from sending messages. All channels other than the Active Channel are Standby Channels. |

Initiative is managed **per user, per chat room, or per group** — not collectively
per module channel.

## Default Active

Module channels offered on the LINE Marketplace are given the **"Default Active"**
feature (exclusive to LINE Marketplace module channels):

- **Auto active**: a module channel with Default Active **automatically becomes
  the Active Channel** when attached — no need to call the Acquire Control API. (A
  normal module channel becomes a Standby Channel on attach and must call Acquire
  Control to become Active.)
- **Exclusive control**: only **one** module channel with Default Active can be
  attached to a LINE Official Account at a time.

> Because LINE Marketplace module channels are Default Active, **chat initiative
> control is not normally needed.** The Acquire/Release Control APIs exist only to
> handle cases where initiative changes due to unexpected events.

---

# Attaching a module channel — OAuth 2.0 flow

To use the module channel feature you need authorization from the LINE Official
Account admin, following the OAuth 2.0 authorization mechanism. Only one module
channel with the "Default Active" feature can be attached to a single LINE
Official Account.

The four steps (the first and last screens are built by the module channel
developer):

1. Request authorization from the LINE Official Account admin.
2. The linkage screen (LINE Official Account Manager).
3. Receive the authorization code or error response.
4. Attach by operation of the module channel provider (the token API).

## 1. Request authorization from the LINE Official Account admin

Have the LINE Official Account admin access the authorization URL
`https://manager.line.biz/module/auth/v1/authorize` with query parameters. This
begins the attach process. Typically you put a link to this URL on a "start
linking" page and ask the admin to click it.

**Example URL for authentication and authorization**

```text
https://manager.line.biz/module/auth/v1/authorize?response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=message%3Asend%20message%3Areceive&state={CSRF token}&region=JP&basic_search_id={LINE Official Account basic ID}&brand_type=premium
```

**Query parameters**

| Field | Type | Required | Description |
|---|---|---|---|
| `response_type` | String | Yes | `code` |
| `redirect_uri` | String | Yes | Redirect URL where the module channel developer receives the authorization code. Must match a redirect URL previously registered for the module channel in the LINE Developers Console. **URL-encode it** — if you don't, the 2nd+ query parameters are treated as parameters of the authentication URL and aren't passed to the redirect destination. |
| `client_id` | String | Yes | The channel ID of the module channel. |
| `scope` | String | Yes | Permissions (scope) to request. Multiple scopes are separated by a URL-encoded space (`%20`). See Scopes. |
| `state` | String | Yes | Unique alphanumeric anti-CSRF string, randomly generated per session by the module channel developer's system. URL-encoded strings can't be used. |
| `region` | String | No | Region of the LINE Official Account. `JP` or `TW`. |
| `basic_search_id` | String | No | LINE Official Account basic ID. Specify to allow attaching only to specific LINE Official Accounts. |
| `brand_type` | String | No | Limits the LINE Official Account types that can attach: `premium` (Premium), `verified` (Verified), `unverified` (Unverified). Multiple types joined with `%20` (e.g. `brand_type=premium%20verified`). |
| `code_challenge` | String | No | For PKCE (Proof Key for Code Exchange), per RFC 7636 — countermeasure against authorization code interception. |
| `code_challenge_method` | String | No | `S256`. For PKCE, per RFC 7636. |

## 2. The linkage screen

When the admin accesses the authorization URL, the LINE Official Account Manager
linkage screen is shown. It reflects what you applied for when creating the module
channel (check the settings in the LINE Developers Console).

## 3. Receive the authorization code or error response

When the admin completes authentication and authorization, query parameters are
passed to the `redirect_uri`.

**On success — query parameters**

| Field | Type | Description |
|---|---|---|
| `code` | String | Authorization code required to attach. Has a validity period; usable only once. |
| `state` | String | Anti-CSRF string. Must match the `state` you sent in the authorization URL. |

**On failure — query parameters**

| Field | Type | Description |
|---|---|---|
| `error` | String | Error code. |
| `error_description` | String | Error details. |
| `state` | String | Anti-CSRF string. Must match the `state` you sent. |

## 4. Attach by operation of the module channel provider

Once you have the authorization code and confirmed `state`, attach the module
channel by calling the token API (see API reference below).

---

# Scopes

Specify scopes with the `scope` parameter of the authorization URL. Multiple
scopes joined with a URL-encoded space (`%20`). The scope determines which
Messaging API endpoints the module channel may call.

| Scope (URL-encoded) | APIs available for the module channel |
|---|---|
| Specification not required (default) | Issue link token (`/v2/bot/user/{userId}/linkToken`) |
| `message%3Asend` (`message:send`) | Send reply / push / multicast / broadcast / narrowcast message and related APIs; Managing Audience (`/v2/bot/audienceGroup/***`); Get the target limit for additional messages (`/v2/bot/message/quota`); Get number of messages sent this month (`/v2/bot/message/quota/consumption`); Display a loading animation (`/v2/bot/chat/loading/start`) |
| `message%3Areceive` (`message:receive`) | Get webhook events for Messaging API and Module Channel; Chat control (Chat Control) |
| `account%3Amanage` (`account:manage`) | Set default rich menu (`/v2/bot/user/all/richmenu/{richMenuId}`); Get number of message deliveries (`/v2/bot/insight/message/delivery`); Get number of followers (`/v2/bot/insight/followers`); Get friend demographics (`/v2/bot/insight/demographic`); Get user interaction statistics (`/v2/bot/insight/message/event`); Get statistics per unit (`/v2/bot/insight/message/event/aggregation`) |
| `message%3Amark_as_read` (`message:mark_as_read`) | Mark messages from users as read (`/v2/bot/message/markAsRead`) |
| `message%3Atemplated_pnp` (`message:templated_pnp`) | Send a LINE notification message (template) (`/v2/bot/message/pnp/templated/push`); Get number of sent LINE notification messages (template) (`/v2/bot/message/delivery/pnp/templated`); Receive Webhook delivery completion events |
| `profile%3Aread` (`profile:read`) | Get profile (`/v2/bot/profile/{userId}`); Get group chat summary (`/v2/bot/group/{groupId}/summary`); Get group chat member profile; Get multi-person chat member profile; Get number of users in a group chat; Get number of users in a multi-person chat |
| `coupon%3Amanage` (`coupon:manage`) | Create a coupon (`/v2/bot/coupon`); Discontinue a coupon (`/v2/bot/coupon/{couponId}/close`); Get a list of coupons; Get details of a coupon; Send Coupon messages |
| `crm%3Amanage` (`crm:manage`) | Only for module channels using the Chat Plugin function — otherwise don't specify. Required when using Chat Plugin. (Chat Plugin is currently only available to select corporate users.) |

---

# API reference — Module

## Common specifications

- **Status codes**: see the Messaging API reference "Status codes".
- **Response headers**: `x-line-request-id` — Request ID, issued per request.

## Attach by operation of the module channel provider (token API)

Attaches the module channel to the LINE Official Account. You must first request
authorization from the LINE Official Account admin and obtain an authorization
code. Specify the module channel's channel ID and channel secret using either the
`Authorization` header **or** the request body (`client_id` / `client_secret`).

**HTTP request**

```
POST https://manager.line.biz/module/auth/v1/token
```

**Example request**

```sh
curl -v -X POST https://manager.line.biz/module/auth/v1/token \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=authorization_code' \
-d 'code=1234567890abcde' \
--data-urlencode 'redirect_uri=https://example.com/auth?key=value' \
-d 'code_verifier=ayjtZgTunh96nHCvgLEiXzqVQOOC0SwMRs39bh1l5dx' \
-d 'client_id=1234567890' \
-d 'client_secret=1234567890abcdefghij1234567890ab' \
-d 'region=JP' \
-d 'basic_search_id=@linedevelopers' \
-d 'scope=message%3Asend%20message%3Areceive' \
-d 'brand_type=premium'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/x-www-form-urlencoded` |
| `Authorization` | No | `Basic {base64({Channel ID}:{Channel Secret})}` — Base64 of "Module Channel ID" + `:` + "Module Channel Secret". An alternative to `client_id`/`client_secret` in the body. |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `grant_type` | String | Yes | `authorization_code` |
| `code` | String | Yes | Authorization code received from the LINE Platform. |
| `redirect_uri` | String | Yes | The `redirect_uri` specified in the authentication/authorization URL. |
| `code_verifier` | String | No | For PKCE (RFC 7636) — countermeasure against authorization code interception. |
| `client_id` | String | No | Channel ID of the module channel (alternative to the `Authorization` header). |
| `client_secret` | String | No | Channel secret of the module channel (alternative to the `Authorization` header). |
| `region` | String | No | Same value as `region` in the authentication/authorization URL, if specified there. |
| `basic_search_id` | String | No | Same value as `basic_search_id` in the URL, if specified there. |
| `scope` | String | No | Same value as `scope` in the URL, if specified there. |
| `brand_type` | String | No | Same value as `brand_type` in the URL, if specified there. |

**Response**: status code `200` and:

| Field | Type | Description |
|---|---|---|
| `bot_id` | String | User ID of the bot on the LINE Official Account. Used when calling the Messaging API or the Acquire Control API. **Not** the "Your user ID" shown on the Basic Settings tab of the Messaging API channel. |
| `scope` | String | Permissions (scope) granted by the LINE Official Account admin. |

```json
{
  "bot_id": "U45c5c51f0050ef0f0ee7261d57fd3c56",
  "scopes": [
    "message:send",
    "message:receive"
  ]
}
```

**Error response**: `400 Bad Request`, `403 Forbidden`.

## Unlink (detach) the module channel — Detach API

The module channel admin calls the Detach API to detach the module channel from a
LINE Official Account.

**HTTP request**

```
POST https://api.line.me/v2/bot/channel/detach
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X POST https://api.line.me/v2/bot/channel/detach \
-H 'Content-Type:application/json' \
-H 'Authorization: Bearer {channel access token}' \
-d '{"botId":"U45c5c51f0050ef0f0ee7261d57fd3c56"}'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` — the channel access token of your **module channel**. |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `botId` | String | Yes | User ID of the LINE Official Account bot attached to the module channel. Get it from the Attach token API response or the Attached event. |

**Response**: status code `200`.

**Error response**

| Code | Description |
|---|---|
| `400` | Couldn't detach: invalid bot user ID; non-existent bot; module channel not attached; or a channel access token for a non-module channel. |

```json
// If you specify an invalid user ID of the LINE Official Account bot (400 Bad Request)
{
  "message": "user/group/room Id is not available."
}

// If the module channel isn't linked (attached) (400 Bad Request)
{
  "message": "Specified channel is not detachable"
}
```

> **Detach has a time lag.** After detaching there's a delay before the settings
> take effect — don't send requests after detaching. The module channel is **not**
> detached when the LINE Official Account is deleted in LINE Official Account
> Manager; it auto-detaches three months after the delete operation once all data
> (including analysis data) is deleted.

## Acquire Control API

If a Standby Channel wants to take initiative (Chat Control), it calls the Acquire
Control API. The previous Active Channel automatically switches to a Standby
Channel.

> Not necessary in the currently provided (Default Active) module structure —
> implementing this API is optional, used only when initiative switches due to
> unexpected problems.

**HTTP request**

```
POST https://api.line.me/v2/bot/chat/{chatId}/control/acquire
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X POST https://api.line.me/v2/bot/chat/{chatId}/control/acquire \
-H 'Content-Type:application/json' \
-H 'Authorization: Bearer {channel access token}' \
-H 'Header specifying the bot user ID:xxxxxx' \
-d '{"expired":true,"ttl":3600}'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` — the module channel's channel access token. |
| (header specifying the bot's user ID) | Yes | User ID of the LINE Official Account bot attached to the module channel. Get it from the Attach token API response or the Attached event. The header's parameter name is disclosed only to LINE Marketplace participants. |

**Path parameter**

| Param | Description |
|---|---|
| `chatId` | The `userId`, `roomId`, or `groupId`. |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `expired` | Boolean | No | `true`: after `ttl` passes, initiative returns to the Primary Channel (default). `false`: no time limit; initiative doesn't change over time. |
| `ttl` | Number | No | Time (seconds) for initiative to return to the Primary Channel (how long the module channel stays Active). Max one year (`3600 * 24 * 365`). Default `3600` (1 hour). Ignored if `expired` is `false`. |

**Response**: status code `200`.

**Error response**

| Code | Description |
|---|---|
| `400` | Invalid ID in `chatId`. |
| `404` | Couldn't take initiative: a user who hasn't added the module's LINE Official Account as a friend; a group the account isn't in; a multi-person chat the account isn't in. |
| `423` | Another channel acquired initiative within a certain period (a few seconds). |

```json
// If you specfy an invalid ID is specified in the chatId parameter (400 Bad Request)
{
  "message": "The value for the 'chatId' parameter is invalid"
}
```

## Release Control API

To return the initiative of an Active Channel to the Primary Channel, call the
Release Control API.

> Not necessary in the currently provided (Default Active) module structure —
> implementing this API is optional.

**HTTP request**

```
POST https://api.line.me/v2/bot/chat/{chatId}/control/release
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X POST https://api.line.me/v2/bot/chat/{chatId}/control/release \
-H 'Content-Type:application/json' \
-H 'Authorization: Bearer {channel access token}' \
-H 'Header specifying the bot user ID:xxxxxx'
```

**Request headers**: same as Acquire Control API (`Content-Type`, `Authorization`
with the module channel token, and the bot-user-ID header).

**Path parameter**: `chatId` — the `userId`, `roomId`, or `groupId`.

**Response**: status code `200`.

**Error response**

| Code | Description |
|---|---|
| `400` | Invalid ID in `chatId`. |

```json
// If you specfy an invalid ID is specified in the chatId parameter (400 Bad Request)
{
  "message": "The value for the 'chatId' parameter is invalid"
}
```

## Get a list of bots to which the module is attached

Gets a list of basic information about the bots of multiple LINE Official Accounts
that have attached the module channel.

**HTTP request**

```
GET https://api.line.me/v2/bot/list?limit={limit}&start={continuationToken}
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X GET "https://api.line.me/v2/bot/list?limit={limit}&start={continuationToken}" \
-H 'Authorization: Bearer {channel access token}'
```

**Request headers**: `Authorization: Bearer {channel access token}` — the module
channel's channel access token.

**Query parameters**

| Param | Required | Description |
|---|---|---|
| `limit` | No | Max number of bots to get. Default `100`, max `100`. |
| `start` | No | Continuation token from the `next` property of a previous response. Include it to get the remaining array. |

**Response**: status code `200` and:

| Field | Type | Description |
|---|---|---|
| `bots` | Array | Array of Bot list Item objects. |
| `bots[].userId` | String | Bot's user ID. |
| `bots[].basicId` | String | Bot's basic ID. |
| `bots[].premiumId` | String | Bot's premium ID. Omitted if not set. |
| `bots[].displayName` | String | Bot's display name. |
| `bots[].pictureUrl` | String | Profile image URL (`https://...`). Omitted if the bot has no profile image. |
| `next` | String | Continuation token for the next array. Returned only if more results exist. Expires in 24 hours (86,400 seconds). |

```json
{
  "bots": [
    {
      "userId": "Uf2dd6e8b081d2ff9c05c98a8a8b269c9",
      "basicId": "@628...",
      "displayName": "Test01",
      "pictureUrl": "https://profile.line-scdn.net/0hyxytJNAlJldEDQzlatVZAHhIKDoz..."
    },
    {
      "userId": "Ua831d37bfe8232808202b85127663f70",
      "basicId": "@076lu...",
      "displayName": "Test02",
      "pictureUrl": "https://profile.line-scdn.net/0hohnizdyzMEdTECbnVo9PEG9VPiok..."
    },
    {
      "userId": "Ub77ea431fba86f7c159a0c0f5be43d9f",
      "basicId": "@290n...",
      "displayName": "Test03"
    },
    {
      "userId": "Ub8ec80a14e879e9c6833fb4cee0e632b",
      "basicId": "@793j...",
      "displayName": "Test04"
    }
  ]
}
```

**Error response**

| Code | Description |
|---|---|
| `400` | An invalid continuation token is specified. |

```json
// If you specify an invalid continuation token, such as expired (400 Bad Request)
{
  "message": "Invalid start param"
}
```

> To get info about a single LINE Official Account bot, use the Messaging API's
> **Get bot info** endpoint (`GET /v2/bot/info`) with the module channel token and
> the bot-user-ID header.

---

# Module channel-specific webhook events

These events are sent to the module channel's webhook URL server. For all of
them, `timestamp` etc. follow the Messaging API "Common properties", except `mode`
is fixed to `active`.

## Attached event

The module channel was attached to the LINE Official Account.

| Field | Type | Description |
|---|---|---|
| `type` | String | `module` |
| `module.type` | String | `attached` |
| `module.botId` | String | User ID of the bot on the attached LINE Official Account. |
| `module.scopes` | Array of strings | Scopes permitted by the LINE Official Account admin. |

```json
{
  "destination": "U53387d54817...",
  "events": [
    {
      "type": "module",
      "module": {
        "type": "attached",
        "botId": "U53387d54817...",
        "scopes": [
          "message:send",
          "message:receive"
        ]
      },
      "webhookEventId": "01G3GCEEXNWREGSSFVTPYH8465",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1653038594997,
      "mode": "active"
    }
  ]
}
```

## Detached event

The module channel was detached from the LINE Official Account.

| Field | Type | Description |
|---|---|---|
| `type` | String | `module` |
| `module.type` | String | `detached` |
| `module.botId` | String | Detached LINE Official Account bot user ID. |
| `module.reason` | String | Reason for detaching. `bot_deleted`: all information, including analysis data for the LINE Official Account, has been completely deleted. |

```json
{
  "destination": "U5fac33f633e72c192759f09afc41fa28",
  "events": [
    {
      "type": "module",
      "module": {
        "type": "detached",
        "botId": "U5fac33f633e72c192759f09afc41fa28"
      },
      "webhookEventId": "01G4CPSV08QGNT1DWFC4DSWDNP",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1653988977672,
      "mode": "active"
    }
  ]
}
```

## Activated event

The module channel was switched to Active Channel by calling the Acquire Control
API. **Not** sent if the Acquire Control validity period expires and initiative
switches automatically.

| Field | Type | Description |
|---|---|---|
| `type` | String | `activated` |
| `chatControl.expireAt` | Number | The time limit for maintaining "active". |

```json
{
  "destination": "U5fac33f633e72c192759f09afc41fa28",
  "events": [
    {
      "type": "activated",
      "chatControl": {
        "expireAt": 1653994422933
      },
      "webhookEventId": "01G4CRJ54J7TT4WN190KKHBXXT",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1653990823058,
      "source": {
        "type": "user",
        "userId": "LUb577ef3cbe..."
      },
      "mode": "active"
    }
  ]
}
```

## Deactivated event

The module channel was switched to Standby Channel by calling the Acquire Control
API or Release Control API. **Not** sent if the Acquire Control validity period
expires and initiative switches automatically.

| Field | Type | Description |
|---|---|---|
| `type` | String | `deactivated` |

```json
{
  "destination": "U5fac33f633e72c192759f09afc41fa28",
  "events": [
    {
      "type": "deactivated",
      "webhookEventId": "01G4CRJ51100K1D1791KC9J4G4",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1653990822945,
      "source": {
        "type": "user",
        "userId": "LUb577ef3cbe..."
      },
      "mode": "active"
    }
  ]
}
```

## botSuspend event

The LINE Official Account was suspended (Suspend). Recommendation on receipt:
display a message like "This admin screen can't be used because the LINE Official
Account is unavailable" and stop using the admin screen; keep all information,
since the account may resume (a botResume event). The botSuspend event is **not**
sent to the Primary Channel. Receiving a Detached event after a botSuspend event
means the account stopped using the module channel and cancelled the contract.

| Field | Type | Description |
|---|---|---|
| `type` | String | `botSuspended` |

```json
{
  "destination": "U53387d548170020e6cedef5f41d1e01d",
  "events": [
    {
      "type": "botSuspended",
      "webhookEventId": "01G4CRJ54J7TT4WN190KKHBXXT",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1616390574119,
      "mode": "active"
    }
  ]
}
```

## botResumed event

The LINE Official Account returned from the suspended state. Recommendation on
receipt: hide the "admin page unavailable" message and resume using the admin
page. The botResumed event is **not** sent to the Primary Channel.

| Field | Type | Description |
|---|---|---|
| `type` | String | `botResumed` |

```json
{
  "destination": "U5fac33f633e72c192759f09afc41fa28",
  "events": [
    {
      "type": "botResumed",
      "webhookEventId": "01G4CS8T91R1V1JCE0G43DQND8",
      "deliveryContext": {
        "isRedelivery": false
      },
      "timestamp": 1653991565601,
      "mode": "active"
    }
  ]
}
```

## Detecting an initiative change

Initiative may change automatically without calling the Release Control API.
Detect it via:

| Event(s) | When |
|---|---|
| Activated event / Deactivated event | An attached module channel called the Acquire/Release Control API and initiative switched. |
| Follow event / Unfollow event | An end user blocked the LINE Official Account and added it as a friend again. Doing so **resets initiative to the default state**; a Default Active module channel automatically becomes the Active Channel again. |

---

# Using the Messaging API from a module channel

A module channel can use the Messaging API to send messages and switch rich
menus, like a Messaging API channel.

## User ID in a module channel

In a module channel provided by LINE Marketplace, the per-user identifier is a
**68-character string starting with `L`**. It differs between LINE Official
Accounts even for the same user.

```text
LUb577ef3cbe786a8da85ff8e902a03fc6-U5fac33f633e72c192759f09afc41fa28
```

## Channel access token of a module channel

Once a module channel is the Active Channel, call the Messaging API / Module
Channel API using the module channel's channel access token. Allowed token types:

- Short-lived channel access token.
- Channel access token with a user-specified expiration (channel access token v2.1).
- Stateless channel access token.

> **Long-lived channel access tokens can't be used** for module channels.

Issue tokens with the info on the **Basic settings** tab of the module channel in
the LINE Developers Console.

## Calling a Messaging API endpoint

You must have the scope defined for the endpoint (granted at attach time — see
Scopes). When calling, specify the module channel's token in `Authorization`
**and**, because a module channel may attach to multiple LINE Official Accounts,
the bot-user-ID header.

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {channel access token}` — the module channel's token. |
| (header specifying the bot's user ID) | Yes | User ID of the LINE Official Account bot attached to the module channel. Get it from the Attach token API response or the Attached event. The header's parameter name is disclosed only to LINE Marketplace participants. |

Example — sending a push message from a module channel:

```sh
curl -v -X POST https://api.line.me/v2/bot/message/push \
-H 'Content-Type:application/json' \
-H 'Authorization: Bearer {channel access token}' \
-H 'Header specifying the bot user ID: xxxxxxxxxxxxxxxxxxxxxxxx'　\      // NEED THIS HEADER
-d '{
    "to": "LUb577ef3cbe...",
    "messages":[
        {
            "type":"text",
            "text":"Hello, world1"
        }
    ]
}'
```

**Rate limits**: applied per `module channel × LINE Official Account bot × API
function (endpoint)`. Even if the module channel is attached to multiple LINE
Official Account bots, the rate limit applies separately to each combination. See
the Messaging API reference "Rate limits".

**Statistics**: you can get per-aggregation-unit statistics of how users interact
with push and multicast messages. Module channel statistics are aggregated per
`LINE Official Account bot × unit name`. See the Messaging API doc "Get statistics
of sent messages".

## Receiving a webhook

When a webhook event arrives at the module channel's webhook URL server, check
the `mode` and `destination` properties.

If the module channel webhook URL server isn't receiving events, check: the
module channel is attached to a LINE Official Account; and at authorization time,
`message%3Areceive` (`message:receive`) was specified in the `scope` query
parameter.

### `mode` property

Webhook events (messages from users, friend adds, etc.) are sent to **all**
channels connected to the LINE Official Account (Primary Channel + attached Module
Channels) simultaneously. Before processing an event, check whether the channel
has initiative.

| `mode` value | Meaning |
|---|---|
| `active` | The channel that received the event is active. It may send reply / push messages. |
| `standby` | The channel that received the event is waiting. It should not send messages. Events to a waiting channel **don't include the `replyToken` property** — no reply message is possible. |

Of the channels attached to a LINE Official Account, only one has `mode` =
`active`; all others have `mode` = `standby`.

```sh
#Example of a webhook sent to Active Channel
{
    "replyToken": "0f3779fba3b349968c5d07db31eab56f", // NOTICE THIS PROPERTY
    "type": "message",
    "mode": "active", // NOTICE THIS PROPERTY
    "timestamp": 1462629479859,
    "source": {
        "type": "user",
        "userId": "LUb577ef3cbe..."
    },
    "message": {
        "id": "325708",
        "type": "text",
        "text": "Hello, world"
    }
}

#Example of a webhook event sent to the Standby Channel
{
    // replyToken PROPERTY DOES NOT EXIST
    "type": "message",
    "mode": "standby", // NOTICE THIS PROPERTY
    "timestamp": 1462629479859,
    "source": {
        "type": "user",
        "userId": "U4af4980629..."
    },
    "message": {
        "id": "325708",
        "type": "text",
        "text": "Hello, world!"
    }
}
```

### `destination` property

A module channel may be attached to multiple LINE Official Accounts. Use
`destination` to determine which LINE Official Account the webhook came from.

| Field | Type | Description |
|---|---|---|
| `destination` | String | User ID of the bot of the LINE Official Account that sent the webhook event. Matches `U[0-9a-f]{32}`. |

```sh
{
  "destination": "U53387d54817...",  // CHECK THIS PROPERTY
  "events": [...]
}
```

## Getting LINE Official Account information from a module channel

- **Get LINE Official Account (bot) information** — use the Messaging API's "Get
  bot info" endpoint, with the module channel token in `Authorization` and the
  bot-user-ID header (both optional on this endpoint).
- **Get a list of bots to which the module is attached** — see the "Get a list of
  bots" API reference above.

## Notes

- After detaching a module channel there's a time lag before settings take
  effect — don't send requests after detaching.
- You can add a scope to a target account even for accounts already attached.

---

# Configure module channel settings (LINE Developers Console)

A module channel has a dedicated **module** tab in the LINE Developers Console.

## module tab

A setting section dedicated to the module channel.

## Webhook settings

- **Webhook URL** — one webhook URL per module channel.
- **Using webhook** — whether the module channel receives webhook events.
- **Resend webhook** — whether the LINE Platform resends a webhook event when the
  module channel's webhook URL fails to receive it.
- **Error stats** — whether to show webhook-event reception-failure stats on the
  **Webhook errors** tab.

## Redirect settings

- **Redirect URL** — the value of the `redirect_uri` parameter used to request
  authorization from the LINE Official Account admin. The scheme must be `https`.
  You can specify multiple redirect URLs for a single channel.
