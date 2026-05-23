# Action Objects

Source: `https://developers.line.biz/en/reference/messaging-api/`

Actions for a bot to take when a user taps a button or image. Used in templates, quick
replies, rich menus, Flex Message components, and imagemaps.

## Label specifications

The `label` requirement and max length depend on where the action is set:

| Object | Label required? | Max chars |
|---|---|---|
| Template messages — image carousel | Optional | 12 |
| Template messages — other than image carousel | Required | 20 |
| Rich menu | Optional (spoken via accessibility) | 20 |
| Quick reply button | Required | 20 |
| Flex Message — button | Required | 40 |
| Flex Message — other than button | Optional (not displayed) | 40 |

---

## Postback action

`type` = `postback`. Tapping returns a [postback event](webhooks-and-events.md) via webhook
with the `data` string.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `postback` |
| `label` | See label spec | String | Action label |
| `data` | Yes | String | String returned in `postback.data`. Max 300 chars. |
| `displayText` | No | String | Text shown on the chat screen as the user's message. Max 300 chars. Can't be used with `text`. |
| `text` | No | String | **[Deprecated]** Text shown as the user's message. Max 300 chars. Don't use with quick reply buttons. Can't be used with `displayText`. |
| `inputOption` | No | String | `closeRichMenu` / `openRichMenu` / `openKeyboard` / `openVoice`. LINE iOS/Android 12.6.0+ |
| `fillInText` | No | String | Pre-filled input text when `inputOption` is `openKeyboard`. `\n` allowed. Max 300 chars. LINE 12.6.0+ |

```json
{ "type": "postback", "label": "Buy", "data": "action=buy&itemid=111",
  "displayText": "Buy", "inputOption": "openKeyboard",
  "fillInText": "---\nName: \nPhone: \nBirthday: \n---" }
```

## Message action

`type` = `message`. Tapping sends the `text` string as a message from the user.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `message` |
| `label` | See label spec | String | Action label |
| `text` | Yes | String | Text sent when performed. Max 300 chars. |

## URI action

`type` = `uri`. Tapping opens the URI in LINE's in-app browser.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `uri` |
| `label` | See label spec | String | Action label |
| `uri` | Yes | String | URI to open. Max 1000 chars. Schemes: `http`, `https`, `line`, `tel`. |
| `altUri.desktop` | No | String | URI opened on LINE for macOS/Windows. Max 1000 chars. Overrides `uri` on desktop. Not for quick reply. |

```json
{ "type": "uri", "label": "View details", "uri": "http://example.com/page/222",
  "altUri": { "desktop": "http://example.com/pc/page/222" } }
```

`tel:` example: `"uri": "tel:09001234567"`.

## Datetime picker action

`type` = `datetimepicker`. Tapping opens a date/time picker; selection returns a postback
event. No time zone support.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `datetimepicker` |
| `label` | See label spec | String | Action label |
| `data` | Yes | String | String returned in `postback.data`. Max 300 chars. |
| `mode` | Yes | String | `date` / `time` / `datetime` |
| `initial` | No | String | Initial value |
| `max` | No | String | Largest selectable value (must be > `min`) |
| `min` | No | String | Smallest selectable value (must be < `max`) |

Formats (RFC3339): `date` → `full-date` (`2017-06-18`, range 1900-01-01 to 2100-12-31);
`time` → `time-hour:time-minute` (`06:15`, 00:00–23:59);
`datetime` → `full-date`T`time-hour:time-minute` (also lowercase `t`; `2017-06-18T06:15`).

```json
{ "type": "datetimepicker", "label": "Select date", "data": "storeId=12345",
  "mode": "datetime", "initial": "2017-12-25t00:00", "max": "2018-01-24t23:59", "min": "2017-12-25t00:00" }
```

## Camera action

`type` = `camera`. **Quick reply buttons only.** Opens the LINE camera.
`label` required, max 20 chars.

```json
{ "type": "camera", "label": "Camera" }
```

## Camera roll action

`type` = `cameraRoll`. **Quick reply buttons only.** Opens the LINE camera roll.
`label` required, max 20 chars.

## Location action

`type` = `location`. **Quick reply buttons only.** Opens the LINE location screen.
`label` required, max 20 chars.

## Rich menu switch action

`type` = `richmenuswitch`. **Rich menus only** (not Flex / quick reply). Tapping switches
rich menus and returns a postback event with the selected rich menu alias ID.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `richmenuswitch` |
| `label` | No | String | Action label. Max 20 chars. Read by accessibility. |
| `richMenuAliasId` | Yes | String | Rich menu alias ID to switch to |
| `data` | Yes | String | String returned in `postback.data`. Max 300 chars. |

```json
{ "type": "richmenuswitch", "richMenuAliasId": "richmenu-alias-b", "data": "richmenu-changed-to-b" }
```

## Clipboard action

`type` = `clipboard`. Tapping copies `clipboardText` to the device clipboard.
LINE iOS/Android 14.0.0+.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `clipboard` |
| `label` | See label spec | String | Action label |
| `clipboardText` | Yes | String | Text copied to the clipboard. Max 1000 chars. |
