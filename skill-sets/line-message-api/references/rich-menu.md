# Rich Menu

Source: `https://developers.line.biz/en/reference/messaging-api/`

A customizable menu displayed on the LINE Official Account's chat screen. To display a
rich menu you must: create the rich menu, upload its image, and set it as default or
link it to users.

## Table of contents

- Rich menu structure (rich menu object, response object, size, area, bounds)
- Rich menu endpoints (create, validate, image upload/download, list, get, delete)
- Default rich menu endpoints
- Per-user rich menu endpoints (link/unlink, bulk, batch)
- Rich menu alias endpoints

**Display priority** (highest → lowest): per-user rich menu (Messaging API) → default rich
menu (Messaging API) → default rich menu (LINE Official Account Manager).

All endpoints require `Authorization: Bearer {token}`.

---

# Rich menu structure

## Rich menu object (request — used to create)

| Property | Required | Type | Description |
|---|---|---|---|
| `size` | Yes | Object | `size` object (width/height) |
| `selected` | Yes | Boolean | `true` to display the rich menu by default (chat bar shown open) |
| `name` | Yes | String | Rich menu name (internal, ≤300 chars, not shown to users) |
| `chatBarText` | Yes | String | Text on the chat bar, ≤14 chars |
| `areas` | Yes | Array | Area objects defining tappable areas, max 20 |

## Rich menu response object (returned by Get/List)

Same as the rich menu object plus `richMenuId` (String).

## `size` object

`width` (Number — 800–2500), `height` (Number — ≥250). Aspect ratio (width/height) must be ≥1.45.

## Area object

`bounds` (a `bounds` object), `action` (an [action object](action-objects.md)).

## `bounds` object

`x`, `y` (top-left position relative to the image's left edge, ≥0), `width`, `height` (tappable area size).

```json
{ "size": { "width": 2500, "height": 1686 }, "selected": false,
  "name": "Nice rich menu", "chatBarText": "Tap to open",
  "areas": [
    { "bounds": { "x": 0, "y": 0, "width": 2500, "height": 1686 },
      "action": { "type": "postback", "data": "action=buy&itemid=123" } }
  ] }
```

---

# Rich menu endpoints

## Create rich menu

`POST https://api.line.me/v2/bot/richmenu` — Rate limit 100/hour

Headers: `Authorization`, `Content-Type: application/json`. Body: a rich menu object.
Up to 1,000 rich menus per account. Response 200: `richMenuId` (String).
Error: `400` (invalid object / max reached).

## Validate rich menu object

`POST https://api.line.me/v2/bot/richmenu/validate` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: application/json`. Body: a rich menu object.
Response 200: `{}` if valid. Error: `400` (invalid object).

## Upload rich menu image

`POST https://api-data.line.me/v2/bot/richmenu/{richMenuId}/content` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: image/jpeg` or `image/png`.
**Image requirements**: JPEG/PNG, width 800–2500 px, height ≥250 px, aspect ratio ≥1.45, ≤1 MB.
An image can't be replaced — create a new rich menu to change it.

```sh
curl -v -X POST https://api-data.line.me/v2/bot/richmenu/{richMenuId}/content \
-H "Authorization: Bearer {token}" -H "Content-Type: image/jpeg" -T image.jpg
```

Response 200: `{}`. Errors: `400` (bad image / already set), `404`, `415`.

## Download rich menu image

`GET https://api-data.line.me/v2/bot/richmenu/{richMenuId}/content` — Rate limit 2,000/s

Header: `Authorization`. Response 200: image binary. Error: `404`.

## Get rich menu list

`GET https://api.line.me/v2/bot/richmenu/list` — Rate limit 2,000/s

Response 200: `richmenus` (Array of rich menu response objects). Rich menus created with
LINE Official Account Manager are not returned.

## Get rich menu

`GET https://api.line.me/v2/bot/richmenu/{richMenuId}` — Rate limit 2,000/s

Response 200: a rich menu response object. Error: `404`.

## Delete rich menu

`DELETE https://api.line.me/v2/bot/richmenu/{richMenuId}` — Rate limit 100/hour

Response 200: `{}`. Error: `404`.

---

# Default rich menu

## Set default rich menu

`POST https://api.line.me/v2/bot/user/all/richmenu/{richMenuId}` — Rate limit 2,000/s

Sets the default rich menu shown to all users. Replaces any existing default.
Response 200: `{}`. Errors: `400` (no image set), `404`.

## Get default rich menu ID

`GET https://api.line.me/v2/bot/user/all/richmenu` — Rate limit 2,000/s

Response 200: `richMenuId` (String). Errors: `403` (default set by another channel), `404` (not set).

## Clear default rich menu

`DELETE https://api.line.me/v2/bot/user/all/richmenu` — Rate limit 2,000/s

Response 200: `{}`.

---

# Per-user rich menu

## Link rich menu to user

`POST https://api.line.me/v2/bot/user/{userId}/richmenu/{richMenuId}` — Rate limit 2,000/s

Links a rich menu to one user (replaces any existing per-user rich menu). The user must be
a friend; non-friend/blocked/deleted users return `200` but aren't linked.
Response 200: `{}`. Errors: `400` (invalid user ID / no image set), `404`.

## Link rich menu to multiple users

`POST https://api.line.me/v2/bot/richmenu/bulk/link` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: application/json`.
Body: `richMenuId` (String), `userIds` (Array of strings, max 500).
Processed asynchronously — returns `202` + `{}`. Verify via Get rich menu ID of user.
Errors: `400` (invalid user/rich menu ID, no image), `404`.

## Get rich menu ID of user

`GET https://api.line.me/v2/bot/user/{userId}/richmenu` — Rate limit 2,000/s

Response 200: `richMenuId` (String). Errors: `400` (invalid user ID), `404` (user not
linked / nonexistent / not a friend).

## Unlink rich menu from user

`DELETE https://api.line.me/v2/bot/user/{userId}/richmenu` — Rate limit 2,000/s

Removes the per-user rich menu. Response 200: `{}`. Error: `400` (invalid user ID).

## Unlink rich menus from multiple users

`POST https://api.line.me/v2/bot/richmenu/bulk/unlink` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: application/json`.
Body: `userIds` (Array of strings, max 500). Processed asynchronously — returns `202` + `{}`.

## Replace or unlink the linked rich menus in batches

`POST https://api.line.me/v2/bot/richmenu/batch` — Rate limit 3/hour

Bulk replace/unlink/link rich menus by operation. Headers: `Authorization`,
`Content-Type: application/json`.

Body: `operations` (Array — each `{ type, from, to }` where `type` is `link` / `unlink` /
`unlinkAll`), `resumeRequestKey` (String, optional — for safe retries).

Operation types:
- `link`: link rich menu `to` to users currently on rich menu `from`.
- `unlink`: unlink rich menu `from` (set users to no per-user rich menu).
- `unlinkAll`: unlink rich menus from all users.

Processed asynchronously — returns `202` + `{}`. Track with the progress endpoint.

## Get the status of rich menu batch control

`GET https://api.line.me/v2/bot/richmenu/progress/batch?requestId={id}` — Rate limit 100/hour

Response 200: `phase` (`ongoing` / `succeeded` / `failed`), `acceptedTime`, `completedTime`.

## Validate a request of rich menu batch control

`POST https://api.line.me/v2/bot/richmenu/validate/batch` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: application/json`. Body: same `operations` as the
batch endpoint. Response 200: `{}` if valid. Error: `400`.

---

# Rich menu alias

A rich menu alias is a named pointer to a rich menu ID — used by the `richmenuswitch`
action to switch rich menus (e.g. tabs). See [action-objects.md](action-objects.md).

## Create rich menu alias

`POST https://api.line.me/v2/bot/richmenu/alias` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: application/json`.
Body: `richMenuAliasId` (String — the alias ID you choose), `richMenuId` (String — the
target rich menu, which must have an image set). Response 200: `{}`.

## Delete rich menu alias

`DELETE https://api.line.me/v2/bot/richmenu/alias/{richMenuAliasId}` — Rate limit 100/hour

Response 200: `{}`.

## Update rich menu alias

`POST https://api.line.me/v2/bot/richmenu/alias/{richMenuAliasId}` — Rate limit 2,000/s

Headers: `Authorization`, `Content-Type: application/json`.
Body: `richMenuId` (String — new target rich menu). Response 200: `{}`.

## Get rich menu alias information

`GET https://api.line.me/v2/bot/richmenu/alias/{richMenuAliasId}` — Rate limit 2,000/s

Response 200: `richMenuAliasId` (String), `richMenuId` (String).

## Get list of rich menu alias

`GET https://api.line.me/v2/bot/richmenu/alias/list` — Rate limit 2,000/s

Response 200: `aliases` (Array of `{ richMenuAliasId, richMenuId }`).
