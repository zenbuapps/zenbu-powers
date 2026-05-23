# LIFF Server API

Source: `https://developers.line.biz/en/reference/liff-server/`

The LIFF Server API is a REST API to operate the LIFF apps on a **LINE Login
channel** — add, update, list, and delete LIFF apps programmatically (the same
operations the LINE Developers Console **LIFF** tab provides).

> The Server API version differs from the LIFF SDK version: the SDK is at `v2`,
> but the Server API is at **`v1`** (`/liff/v1/...`).

## Table of contents

- Preparing a channel access token
- Add a LIFF app to a channel — `POST /liff/v1/apps`
- Update LIFF app settings — `PUT /liff/v1/apps/{liffId}`
- Get all LIFF apps — `GET /liff/v1/apps`
- Delete a LIFF app — `DELETE /liff/v1/apps/{liffId}`

---

# Preparing a channel access token

Because the Server API operates LIFF apps on a **LINE Login channel**, it needs
a **channel access token for that LINE Login channel**. Use a **short-lived
channel access token** or a **stateless channel access token**.

All requests carry: `Authorization: Bearer {channel access token}`.

---

# Add the LIFF app to a channel

`POST https://api.line.me/liff/v1/apps`

Adds a LIFF app to a channel. You can add **up to 30 LIFF apps per channel**.

> LY Corporation recommends creating new LIFF apps as **LINE MINI Apps**.

## Request headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {channel access token}` |
| `Content-Type` | Yes | `application/json` |

## Request body

| Property | Required | Type | Description |
|---|---|---|---|
| `view.type` | Yes | String | View size — `compact` / `tall` / `full` |
| `view.url` | Yes | String | Endpoint URL of the LIFF web app (e.g. `https://example.com`). Scheme must be **https**; URL fragments not allowed |
| `view.moduleMode` | No | Boolean | `true` to use module mode (hides the header action button) |
| `description` | No | String | LIFF app name. Can't include "LINE" or similar / inappropriate strings |
| `features.qrCode` | No | Boolean | `true` to use the 2D code reader. Default `false` |
| `permanentLinkPattern` | No | String | How additional info in LIFF URLs is handled. Specify `concat` |
| `scope` | No | Array of strings | Scopes for some LIFF SDK methods — `openid` / `email` / `profile` / `chat_message.write`. Default `["profile", "chat_message.write"]` |
| `botPrompt` | No | String | Add friend option — `normal` / `aggressive` / `none`. Default `none` |

`botPrompt` values: `normal` shows the option to add the LINE Official Account
as a friend on the channel consent screen; `aggressive` shows a separate screen
with that option after the consent screen; `none` doesn't show it.

```sh
curl -X POST https://api.line.me/liff/v1/apps \
-H "Authorization: Bearer {channel access token}" \
-H "Content-Type: application/json" \
-d '{
    "view": {
        "type": "full",
        "url": "https://example.com/myservice"
    },
    "description": "Service Example",
    "features": {
        "qrCode": true
    },
    "permanentLinkPattern": "concat",
    "scope": ["profile", "chat_message.write"],
    "botPrompt": "none"
}'
```

## Response

Status code `200` and a JSON object:

| Property | Type | Description |
|---|---|---|
| `liffId` | String | LIFF app ID |

```json
{ "liffId": "{liffId}" }
```

## Error response

| Status code | Description |
|---|---|
| 400 | The request contains an invalid value, or the channel's LIFF app limit (30) is reached |
| 401 | Authentication failed |

---

# Update LIFF app settings

`PUT https://api.line.me/liff/v1/apps/{liffId}`

**Partially** updates LIFF app settings — only the properties present in the
request body are updated.

## Request headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {channel access token}` |
| `Content-Type` | Yes | `application/json` |

## Path parameters

| Parameter | Required | Description |
|---|---|---|
| `liffId` | Yes | ID of the LIFF app to update |

## Request body

All properties are **optional**; only those specified are updated.

| Property | Type | Description |
|---|---|---|
| `view.type` | String | View size — `compact` / `tall` / `full` |
| `view.url` | String | Endpoint URL. Scheme must be **https**; URL fragments not allowed |
| `view.moduleMode` | Boolean | `true` to use module mode |
| `description` | String | LIFF app name. Can't include "LINE" or similar / inappropriate strings |
| `features.qrCode` | Boolean | `true` to use the 2D code reader |
| `permanentLinkPattern` | String | Specify `concat` |
| `scope` | Array of strings | `openid` / `email` / `profile` / `chat_message.write` |
| `botPrompt` | String | `normal` / `aggressive` / `none` |

```sh
curl -X PUT https://api.line.me/liff/v1/apps/{liffId} \
-H "Authorization: Bearer {channel access token}" \
-H "Content-Type: application/json" \
-d '{
    "view": {
        "url": "https://new.example.com"
    }
}'
```

## Response

Status code `200`.

## Error response

| Status code | Description |
|---|---|
| 400 | The request contains an invalid value |
| 401 | Authentication failed |
| 404 | The specified LIFF app doesn't exist, or it was added to another channel |

---

# Get all LIFF apps

`GET https://api.line.me/liff/v1/apps`

Gets information on all LIFF apps added to the channel.

## Request headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {channel access token}` |

```sh
curl -X GET https://api.line.me/liff/v1/apps \
-H "Authorization: Bearer {channel access token}"
```

## Response

Status code `200` and a JSON object:

| Property | Type | Description |
|---|---|---|
| `apps` | Array of objects | Array of LIFF app objects |
| `apps[].liffId` | String | LIFF app ID |
| `apps[].view.type` | String | View size — `compact` / `tall` / `full` |
| `apps[].view.url` | String | Endpoint URL |
| `apps[].view.moduleMode` | Boolean | `true` if module mode is used |
| `apps[].description` | String | LIFF app name |
| `apps[].features.ble` | Boolean | `true` if the app supports Bluetooth Low Energy for LINE Things |
| `apps[].features.qrCode` | Boolean | `true` if the 2D code reader can be launched |
| `apps[].permanentLinkPattern` | String | `concat` |
| `apps[].scope` | Array of strings | Scopes — `openid` / `email` / `profile` / `chat_message.write` |
| `apps[].botPrompt` | String | Add friend option — `normal` / `aggressive` / `none` |

```json
{
  "apps": [
    {
      "liffId": "{liffId}",
      "view": {
        "type": "full",
        "url": "https://example.com/myservice"
      },
      "description": "Happy New York",
      "permanentLinkPattern": "concat"
    },
    {
      "liffId": "{liffId}",
      "view": {
        "type": "tall",
        "url": "https://example.com/myservice2"
      },
      "features": {
        "ble": true,
        "qrCode": true
      },
      "permanentLinkPattern": "concat",
      "scope": ["profile", "chat_message.write"],
      "botPrompt": "none"
    }
  ]
}
```

## Error response

| Status code | Description |
|---|---|
| 401 | Authentication failed |
| 404 | There is no LIFF app on the channel |

---

# Delete LIFF app from a channel

`DELETE https://api.line.me/liff/v1/apps/{liffId}`

Deletes a LIFF app from a channel.

## Request headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {channel access token}` |

## Path parameters

| Parameter | Required | Description |
|---|---|---|
| `liffId` | Yes | ID of the LIFF app to delete |

```sh
curl -X DELETE https://api.line.me/liff/v1/apps/{liffId} \
-H "Authorization: Bearer {channel access token}"
```

## Response

Status code `200`.

## Error response

| Status code | Description |
|---|---|
| 401 | Authentication failed |
| 404 | The specified LIFF app doesn't exist, or it was added to another channel |
