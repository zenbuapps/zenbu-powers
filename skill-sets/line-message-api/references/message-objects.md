# Message Objects

Source: `https://developers.line.biz/en/reference/messaging-api/`

JSON objects placed in the `messages` array of any send endpoint. Validate them with the
`/v2/bot/message/validate/{type}` endpoints.

## Table of contents

- Common properties: quick reply, sender customization
- text, textV2 (mention/emoji), sticker, image, video, audio, location, coupon
- imagemap (+ imagemap action objects)
- template messages: buttons, confirm, carousel, image_carousel

For [Flex Message](flex-message.md) and [action objects](action-objects.md) see those files.

---

# Common properties (all message objects)

## Quick reply

`quickReply` (Object, optional). If multiple messages are sent, only the last message's
`quickReply` is shown. Versions of LINE without quick reply support show only the message.

`quickReply.items` — array of quick reply button objects, **max 13**.

Quick reply button object:

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `action` |
| `imageUrl` | No | String | Icon URL at the start of the button. HTTPS, PNG, 1:1, ≤1 MB, ≤2000 chars. |
| `action` | Yes | Object | Action object: postback, message, uri, datetimepicker, camera, cameraRoll, location, clipboard |

```json
"quickReply": {
  "items": [
    { "type": "action", "action": { "type": "cameraRoll", "label": "Send photo" } },
    { "type": "action", "action": { "type": "camera", "label": "Open camera" } }
  ]
}
```

## Customize icon and display name

| Property | Type | Description |
|---|---|---|
| `sender.name` | String | Display name. Some words like `LINE` disallowed. Max 20 chars. |
| `sender.iconUrl` | String | Icon image URL. HTTPS, PNG, 1:1, ≤1 MB, ≤2000 chars. |

```json
{ "type": "text", "text": "Hello, I am Cony!!", "sender": { "name": "Cony", "iconUrl": "https://line.me/conyprof" } }
```

---

# Text message

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `text` |
| `text` | Yes | String | Message text. Max 5000 chars. Supports LINE emojis (use `$` placeholder) and Unicode emojis. |
| `emojis` | No | Array | LINE emoji objects, max 20 |
| `emojis.index` | No | Number | Index of the `$` placeholder in `text` (0-based). Must match `$` position or `400`. |
| `emojis.productId` | No | String | LINE emoji set product ID |
| `emojis.emojiId` | No | String | LINE emoji ID |
| `quoteToken` | No | String | Quote token of the message to quote |

Character/index counts use UTF-16 code units (surrogate pairs count as multiple).

```json
{ "type": "text", "text": "$ LINE emoji $",
  "emojis": [
    { "index": 0, "productId": "5ac1bfd5040ab15980c9b435", "emojiId": "001" },
    { "index": 13, "productId": "5ac1bfd5040ab15980c9b435", "emojiId": "002" }
  ] }
```

# Text message (v2)

Substitutes strings enclosed in `{` `}` with mentions or emojis. Escape literal braces as `{{` `}}`.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `textV2` |
| `text` | Yes | String | Message text with `{key}` placeholders. Max 5000 chars. |
| `substitution` | No | Object | Maps `{key}` → mention/emoji object. Keys: `[0-9a-zA-Z_]`, ≤20 chars. Max 100 objects. |
| `quoteToken` | No | String | Quote token |

**Mention object** (value in `substitution`): `type`=`mention`, `mentionee` — either a
**user object** (`type`=`user`, `userId` — not a bot's) or an **all-mention object**
(`type`=`all`). Mentions only work in reply/push to groups/rooms where the bot and all
mentioned users are members. Max 20 mentions/message.

**Emoji object** (value in `substitution`): `type`=`emoji`, `productId`, `emojiId`. Max 20/message.

```json
{ "type": "textV2",
  "text": "Welcome, {user1}! {laugh}\n{everyone} There is a newcomer!",
  "substitution": {
    "user1": { "type": "mention", "mentionee": { "type": "user", "userId": "U49585cd0d5..." } },
    "laugh": { "type": "emoji", "productId": "5a8555cfe6256cc92ea23c2a", "emojiId": "002" },
    "everyone": { "type": "mention", "mentionee": { "type": "all" } }
  } }
```

# Sticker message

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `sticker` |
| `packageId` | Yes | String | Sticker set package ID |
| `stickerId` | Yes | String | Sticker ID |
| `quoteToken` | No | String | Quote token |

```json
{ "type": "sticker", "packageId": "446", "stickerId": "1988" }
```

# Image message

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `image` |
| `originalContentUrl` | Yes | String | Image URL. HTTPS, JPEG/PNG, ≤10 MB, ≤2000 chars. |
| `previewImageUrl` | Yes | String | Preview image URL. HTTPS, JPEG/PNG, ≤1 MB, ≤2000 chars. |

# Video message

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `video` |
| `originalContentUrl` | Yes | String | Video URL. HTTPS, mp4, ≤200 MB, ≤2000 chars. |
| `previewImageUrl` | Yes | String | Preview image URL. HTTPS, JPEG/PNG, ≤1 MB, ≤2000 chars. |
| `trackingId` | No | String | ID for the video viewing complete event. ≤100 chars, `[a-zA-Z0-9]` + `-.=,+*()%$&;:@{}!?<>[]`. No groups/rooms. |

Original and preview should have the same aspect ratio.

# Audio message

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `audio` |
| `originalContentUrl` | Yes | String | Audio URL. HTTPS, mp3/m4a, ≤200 MB, ≤2000 chars. |
| `duration` | Yes | Number | Audio length in milliseconds |

# Location message

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `location` |
| `title` | Yes | String | Title, max 100 chars |
| `address` | Yes | String | Address, max 100 chars |
| `latitude` | Yes | Decimal | Latitude |
| `longitude` | Yes | Decimal | Longitude |

# Coupon message

Sends a coupon by ID. The coupon must be created first via `POST /v2/bot/coupon`.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `coupon` |
| `couponId` | Yes | String | Coupon ID (from Create coupon response or Get coupons list) |
| `deliveryTag` | No | String | Coupon display path name. ≤30 chars, `[a-zA-Z0-9_]`. Default path shown as `Unknown`. |

```json
{ "type": "coupon", "couponId": "01JYNW8JMQVFBNWF1APF8Z3FS7", "deliveryTag": "2025_winter_campaign" }
```

# Imagemap message

An image with multiple tappable areas; can also play a video.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `imagemap` |
| `baseUrl` | Yes | String | Image base URL. HTTPS, ≤2000 chars. See image config below. |
| `altText` | Yes | String | Alternative text, ≤1500 chars, Unicode emoji allowed |
| `baseSize.width` | Yes | Number | Width of the base image — set to `1040` |
| `baseSize.height` | Yes | Number | Height corresponding to width 1040 |
| `video.originalContentUrl` | *1 | String | Video URL. HTTPS, mp4, ≤200 MB. |
| `video.previewImageUrl` | *1 | String | Preview URL. HTTPS, JPEG/PNG, ≤1 MB. |
| `video.area.x/y/width/height` | *1 | Number | Video area position/size relative to the imagemap |
| `video.externalLink.linkUri` | *2 | String | URL opened when the post-video label is tapped. ≤1000 chars. Schemes: http,https,line,tel. |
| `video.externalLink.label` | *2 | String | Label shown after the video, ≤30 chars |
| `actions` | Yes | Array | Imagemap action objects, max 50 |

*1 required to play a video; *2 required to show a label after the video.

**Image config**: JPEG/PNG, width 240/300/460/700/1040 px, ≤10 MB. The image must be
accessible at `baseUrl/{width}` (e.g. `https://example.com/images/cats/700`). Do **not**
include the file extension in the URL.

## Imagemap action objects

When tapped: `uri` redirects, `message` sends a message, `clipboard` copies text.
All share an `area` (imagemap area object).

**Imagemap URI action**: `type`=`uri`, `label` (optional, ≤100 chars), `linkUri`
(required, ≤1000 chars, schemes http/https/line/tel), `area`.

**Imagemap message action**: `type`=`message`, `label` (optional, ≤100 chars), `text`
(required, ≤400 chars), `area`.

**Imagemap clipboard action** (LINE 14.0.0+): `type`=`clipboard`, `label` (optional,
≤100 chars), `clipboardText` (required, ≤1000 chars), `area`.

**Imagemap area object**: `x`, `y` (top-left position, ≥0), `width`, `height`. Set relative
to `baseSize`.

```json
{ "type": "imagemap", "baseUrl": "https://example.com/bot/images/rm001",
  "altText": "This is an imagemap", "baseSize": { "width": 1040, "height": 1040 },
  "actions": [
    { "type": "uri", "linkUri": "https://example.com/", "area": { "x": 0, "y": 0, "width": 520, "height": 1040 } },
    { "type": "message", "text": "Hello", "area": { "x": 520, "y": 0, "width": 520, "height": 1040 } }
  ] }
```

# Template messages

Predefined customizable layouts. For free layouts use Flex Message.

Common properties (all template messages):

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `template` |
| `altText` | Yes | String | Alternative text, ≤1500 chars, Unicode emoji allowed |
| `template` | Yes | Object | A buttons / confirm / carousel / image_carousel object |

## Buttons template

`type`=`buttons`. Image, title, text, and up to 4 action buttons.

| Property | Required | Type | Description |
|---|---|---|---|
| `thumbnailImageUrl` | No | String | HTTPS, JPEG/PNG, ≤1024 px wide, ≤10 MB |
| `imageAspectRatio` | No | String | `rectangle` (1.51:1, default) / `square` (1:1) |
| `imageSize` | No | String | `cover` (default) / `contain` |
| `imageBackgroundColor` | No | String | RGB hex. Default `#FFFFFF` |
| `title` | No | String | Max 40 chars |
| `text` | Yes | String | Max 160 (no image/title) or 60 (with image/title) chars |
| `defaultAction` | No | Object | Action when image/title/text tapped |
| `actions` | Yes | Array | Action objects, max 4 |

## Confirm template

`type`=`confirm`. `text` (required, ≤240 chars), `actions` (required — exactly 2 action objects).

```json
{ "type": "template", "altText": "this is a confirm template",
  "template": { "type": "confirm", "text": "Are you sure?",
    "actions": [ { "type": "message", "label": "Yes", "text": "yes" },
                 { "type": "message", "label": "No", "text": "no" } ] } }
```

## Carousel template

`type`=`carousel`. `columns` (required — array of column objects, max 10),
`imageAspectRatio` (`rectangle`/`square`, applies to all columns), `imageSize` (`cover`/`contain`).

**Column object**: `thumbnailImageUrl` (optional, HTTPS JPEG/PNG 1.51:1 ≤1024px ≤10 MB),
`imageBackgroundColor` (optional, RGB hex, default `#FFFFFF`), `title` (optional, ≤40 chars),
`text` (required, ≤120 no image/title or ≤60 with), `defaultAction` (optional action object),
`actions` (required, max 3 action objects). Keep action count and image/title usage
consistent across all columns.

## Image carousel template

`type`=`image_carousel`. `columns` (required — array of column objects, max 10).

**Column object**: `imageUrl` (required, HTTPS JPEG/PNG 1:1 ≤1024px ≤10 MB),
`action` (required action object).
