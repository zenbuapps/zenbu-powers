# Users, Groups, Account Link, Audience, Insights, Coupons, Membership

Source: `https://developers.line.biz/en/reference/messaging-api/`

## Table of contents

- Users (profile, follower IDs)
- LINE Official Account (bot) info
- Group chats & multi-person chats
- Account link
- Managing Audience
- Insights
- Coupons
- Membership

All endpoints require `Authorization: Bearer {token}`. Rate limit 2,000/s unless noted.

---

# Users

You can't retrieve your own user ID via API — find it in the LINE Developers Console
(channel Basic settings). Source IDs come from webhook events; never use the human LINE ID.

## Get profile

`GET https://api.line.me/v2/bot/profile/{userId}`

Gets the profile of a friend, or of a non-friend who messaged the account (not blocked).
Only the main profile (no subprofile).

Path param: `userId`. Response 200:

| Property | Type | Description |
|---|---|---|
| `displayName` | String | User's display name |
| `userId` | String | User ID |
| `language` | String | (Not always) BCP 47 language tag, e.g. `en` |
| `pictureUrl` | String | (Not always) "https" profile image URL |
| `statusMessage` | String | (Not always) User's status message |

Errors: `400` (invalid user ID), `404` (no profile — nonexistent / no consent / not friend / blocked).

## Get follower IDs

`GET https://api.line.me/v2/bot/followers/ids?limit={n}&start={token}`

Gets user IDs of friends. **Verified/premium accounts only.** Repeat with `start` =
previous `next` until `next` is gone.

Query params: `limit` (Number, default 300, max 1000), `start` (continuation token, optional).

Response 200: `userIds` (Array of strings), `next` (String — continuation token, not always;
expires in 24h). Deleted/blocked/non-consenting users are excluded.
Errors: `400` (invalid token), `403` (not verified/premium).

---

# LINE Official Account (bot)

## Get bot info

`GET https://api.line.me/v2/bot/info`

Response 200:

| Property | Type | Description |
|---|---|---|
| `userId` | String | User ID of the bot |
| `basicId` | String | Basic ID of the bot |
| `premiumId` | String | (Not always) Premium ID |
| `displayName` | String | Display name |
| `pictureUrl` | String | (Not always) "https" profile image URL |
| `chatMode` | String | `chat` (chat On) / `bot` (chat Off) |
| `markAsReadMode` | String | `auto` (chat Off) / `manual` (chat On) |

---

# Group chats

Info about group chats and members the account is in.

## Get group chat summary

`GET https://api.line.me/v2/bot/group/{groupId}/summary`

Response 200: `groupId` (String), `groupName` (String), `pictureUrl` (String, not always).
Errors: `400` (invalid group ID), `404` (nonexistent group / account not a member).

## Get number of users in a group chat

`GET https://api.line.me/v2/bot/group/{groupId}/members/count`

Response 200: `count` (Number — excludes the bot). Errors: `400`, `404`.

## Get group chat member user IDs

`GET https://api.line.me/v2/bot/group/{groupId}/members/ids?start={token}`

**Verified/premium accounts only.** Query param: `start` (continuation token, optional).
Response 200: `memberIds` (Array of strings, max 100; only LINE iOS/Android users),
`next` (String, not always; expires in 24h). Errors: `400`, `403`.

## Get group chat member profile

`GET https://api.line.me/v2/bot/group/{groupId}/member/{userId}`

Response 200: `displayName`, `userId`, `pictureUrl` (not always). Errors: `400`, `404`.

## Leave group chat

`POST https://api.line.me/v2/bot/group/{groupId}/leave`

Response 200: `{}`. Errors: `400`, `404`.

---

# Multi-person chats (rooms)

## Get number of users in a multi-person chat

`GET https://api.line.me/v2/bot/room/{roomId}/members/count`

Response 200: `count` (Number — excludes the bot). Errors: `400`, `404`.

## Get multi-person chat member user IDs

`GET https://api.line.me/v2/bot/room/{roomId}/members/ids?start={token}`

**Verified/premium accounts only.** Response 200: `memberIds` (Array of strings, max 100),
`next` (String, not always). Errors: `400`, `403`.

## Get multi-person chat member profile

`GET https://api.line.me/v2/bot/room/{roomId}/member/{userId}`

Response 200: `displayName`, `userId`, `pictureUrl` (not always). Errors: `400`, `404`.

## Leave multi-person chat

`POST https://api.line.me/v2/bot/room/{roomId}/leave`

Response 200: `{}`. Errors: `400`, `404`.

---

# Account link

Links a provider's service account with a LINE user account.

## Issue link token

`POST https://api.line.me/v2/bot/user/{userId}/linkToken`

Path param: `userId`. Response 200: `linkToken` (String — valid 10 minutes, single-use).
After linking, the user triggers an `accountLink` webhook event.

---

# Managing Audience

Audiences (audience groups) are recipient lists for narrowcast messages. Audience-related
errors return `details[].errorCode` / `details[].message`.

## Create audience for uploading user IDs (by JSON)

`POST https://api.line.me/v2/bot/audienceGroup/upload` — Rate limit 60/min

Headers: `Authorization`, `Content-Type: application/json`. Body: `description` (String —
audience name, ≤120 chars), `isIfaAudience` (Boolean — `true` to upload IFAs instead of
user IDs), `audiences` (Array of `{ id }`, optional — up to 10,000 per request),
`uploadDescription` (String, optional — job name).
Response 202: `audienceGroupId` (Number), `type` (`UPLOAD`), `description`, `created` (Number).

## Create audience for uploading user IDs (by file)

`POST https://api-data.line.me/v2/bot/audienceGroup/upload/byFile` — Rate limit 60/min

`multipart/form-data` upload of a `.txt` file (one ID per line, ≤1.5 million IDs).
Form fields: `description`, `isIfaAudience`, `uploadDescription`, `file`.
Response 202: `audienceGroupId`, `type`, `description`, `created`.

## Add user IDs to an audience (by JSON)

`PUT https://api.line.me/v2/bot/audienceGroup/upload` — Rate limit 60/min

Body: `audienceGroupId` (Number), `audiences` (Array of `{ id }`, up to 10,000),
`uploadDescription` (String, optional). Response 202: `{}`.

## Add user IDs to an audience (by file)

`PUT https://api-data.line.me/v2/bot/audienceGroup/upload/byFile` — Rate limit 60/min

`multipart/form-data`: `audienceGroupId`, `uploadDescription`, `file`. Response 202: `{}`.

## Create message click audience

`POST https://api.line.me/v2/bot/audienceGroup/click` — Rate limit 60/min

Body: `description`, `requestId` (String — request ID of a sent broadcast/narrowcast),
`clickUrl` (String, optional — a specific URL clicked). Response 202: `audienceGroupId`,
`type` (`CLICK`), `description`, `created`, `requestId`, `clickUrl`.

## Create message impression audience

`POST https://api.line.me/v2/bot/audienceGroup/imp` — Rate limit 60/min

Body: `description`, `requestId` (String — request ID of a sent broadcast/narrowcast).
Response 202: `audienceGroupId`, `type` (`IMP`), `description`, `created`, `requestId`.

## Rename an audience

`PUT https://api.line.me/v2/bot/audienceGroup/{audienceGroupId}/updateDescription` — Rate limit 60/min

Body: `description` (String — new name). Response 200: `{}`.

## Delete audience

`DELETE https://api.line.me/v2/bot/audienceGroup/{audienceGroupId}` — Rate limit 60/min

Response 200: `{}`.

## Get audience data

`GET https://api.line.me/v2/bot/audienceGroup/{audienceGroupId}` — Rate limit 60/min

Response 200: `audienceGroup` (object with `audienceGroupId`, `type`, `description`,
`status` — `IN_PROGRESS`/`READY`/`FAILED`/`EXPIRED`, `audienceCount`, `created`,
`permission`, `isIfaAudience`, etc.), `jobs` (Array — each `{ audienceGroupJobId,
audienceGroupId, description, type, jobStatus (QUEUED/WORKING/FINISHED/FAILED), created,
... }`).

## Get data for multiple audiences

`GET https://api.line.me/v2/bot/audienceGroup/list?page={n}&size={n}` — Rate limit 60/min

Query params: `page` (required, ≥1), `size` (max 40), `description`, `status`,
`includesExternalPublicGroups`, `createRoute`. Response 200: `audienceGroups` (Array),
`hasNextPage` (Boolean), `totalCount`, `page`, `size`, `readWriteAudienceGroupTotalCount`.

## Get shared audience data in Business Manager

`GET https://api.line.me/v2/bot/audienceGroup/shared/{audienceGroupId}` — Rate limit 60/min

Response 200: shared audience group object.

## Get a list of shared audiences in Business Manager

`GET https://api.line.me/v2/bot/audienceGroup/shared/list?page={n}&size={n}` — Rate limit 60/min

Response 200: `audienceGroups` (Array), `hasNextPage`, `totalCount`, `page`, `size`.

---

# Insights

## Get number of message deliveries

`GET https://api.line.me/v2/bot/insight/message/delivery?date=yyyyMMdd` — Rate limit 60/hour

Response 200: `status` (`ready`/`unready`/`out_of_service`), and (when `ready`)
`broadcast`, `targeting`, `autoResponse`, `welcomeResponse`, `chat`, `apiBroadcast`,
`apiPush`, `apiMulticast`, `apiNarrowcast`, `apiReply` (Numbers).

## Get number of followers

`GET https://api.line.me/v2/bot/insight/followers?date=yyyyMMdd` — Rate limit 60/hour

Response 200: `status`, `followers`, `targetedReaches`, `blocks` (Numbers, when `ready`).

## Get friend demographics

`GET https://api.line.me/v2/bot/insight/demographic` — Rate limit 60/hour

Response 200: `available` (Boolean), and (when available) `genders`, `ages`, `areas`,
`appTypes`, `subscriptionPeriods` (each an Array of breakdown objects with a `percentage`).

## Get user interaction statistics

`GET https://api.line.me/v2/bot/insight/message/event?requestId={id}` — Rate limit 60/hour

`requestId` of a broadcast/narrowcast. Response 200: `overview`, `messages` (Array),
`clicks` (Array) — delivered/unique impression/click counts.

## Get statistics per unit

`GET https://api.line.me/v2/bot/insight/message/event/aggregation?customAggregationUnit={name}&from=yyyyMMdd&to=yyyyMMdd`
— Rate limit 60/hour

Stats for messages sent with a `customAggregationUnits` name. Response 200: `overview`,
`messages` (Array), `clicks` (Array).

## Get the number of unit name types assigned during this month

`GET https://api.line.me/v2/bot/message/aggregation/info`

Response 200: `numOfCustomAggregationUnits` (Number).

## Get a list of unit names assigned during this month

`GET https://api.line.me/v2/bot/message/aggregation/list?limit={n}&start={token}`

Response 200: `customAggregationUnits` (Array of strings), `next` (String, not always).

---

# Coupons

Rate limit 200/s.

## Create a coupon

`POST https://api.line.me/v2/bot/coupon`

Headers: `Authorization`, `Content-Type: application/json`. Body includes coupon details
(title, reward, validity period, usage condition, image, etc.).
Response 200: `couponId` (String — use it in a coupon message or to discontinue).

## Discontinue a coupon

`PUT https://api.line.me/v2/bot/coupon/{couponId}/close`

Path param: `couponId`. Response 200: `{}`.

## Get a list of coupons

`GET https://api.line.me/v2/bot/coupon?status={status}&start={token}&limit={n}`

Query params: `status` (optional, e.g. `RUNNING`/`CLOSED`), `start` (continuation token),
`limit` (Number). Response 200: `items` (Array of coupon objects), `next` (String, not always).

## Get details of a coupon

`GET https://api.line.me/v2/bot/coupon/{couponId}`

Response 200: the coupon object (id, title, status, reward, validity, etc.).

---

# Membership

Info about LINE Official Account memberships. Rate limit 200/s.

## Get a user's membership subscription status

`GET https://api.line.me/v2/bot/membership/subscription/{userId}`

Response 200: `subscriptions` (Array). Each item:

| Property | Type | Description |
|---|---|---|
| `membership.membershipId` | Number | Plan ID |
| `membership.title` | String | Plan name |
| `membership.description` | String | Plan description |
| `membership.benefits` | Array of strings | Perks, max 5 |
| `membership.price` | Number | Monthly fee (e.g. `500.00`) |
| `membership.currency` | String | `JPY` / `TWD` / `THB` |
| `user.membershipNo` | Number | The user's member number |
| `user.joinedTime` | Number | UNIX time the user subscribed (seconds) |
| `user.nextBillingDate` | String | Next payment date `yyyy-MM-dd` (UTC+9) |
| `user.totalSubscriptionMonths` | Number | Months subscribed |

Errors: `400` (invalid user ID), `404` (not subscribed / nonexistent user).

## Get a list of users who have joined the membership

`GET https://api.line.me/v2/bot/membership/{membershipId}/users/ids?limit={n}&start={token}`

Query params: `limit` (Number, default 300, max 1000), `start` (continuation token).
Response 200: `userIds` (Array of strings), `next` (String, not always; expires in 24h).
Deleted/blocked/non-friend/non-consenting users are excluded.
Errors: `400`, `404` (membership ID not found).

## Get membership plans being offered

`GET https://api.line.me/v2/bot/membership/list`

Response 200: `memberships` (Array, max 5). Each item: `membershipId`, `title`,
`description`, `benefits` (Array, max 5), `price`, `currency` (`JPY`/`TWD`/`THB`),
`memberCount` (Number), `memberLimit` (Number or `null`), `isInAppPurchase` (Boolean —
`true` in-app purchase, `false` browser payment), `isPublished` (Boolean — `true` public,
`false` private). Plans under review / terminated are excluded.
Error: `404` (no plans offered).
