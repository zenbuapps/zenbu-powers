# Custom Action Button & Custom Share Message Flex Message

Source:
- `https://developers.line.biz/en/docs/line-mini-app/develop/share-messages/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/share-messages-standard/`

## Table of contents

- Built-in vs custom action button
- Using the share target picker
- Custom share message format (sections A–F)
- Standard type — component property tables + JSON
- Image list type — component property tables + JSON
- Complete example JSON files (standard / image list)

---

## Built-in vs custom action button

LINE MINI Apps have a **built-in action button** in the **(A) header** for
sharing the current page. Because LINE implements it and it shows by default,
its behavior and the share message content **cannot be customized**.

If you implement a **custom action button** in the **(B) body**, you can
customize the share message content before sharing.

> The LIFF URL for LINE MINI App changed on 2023-12-13 to
> `https://miniapp.line.me/{liffId}`. Old `https://liff.line.me/{liffId}` URLs
> still open the LINE MINI App, so existing QR codes keep working.

If you cannot meet the design requirements because of the nature of your
service, contact `mini_request@linecorp.com`.

## Using the share target picker

Implement a custom action button in the body that opens the **share target
picker** (the screen to select a group or friend). When the user selects a
recipient, they can send the developer-created share message (e.g. a
[Flex Message](https://developers.line.biz/en/docs/messaging-api/using-flex-messages/)).
See [Sending messages to a user's friend](https://developers.line.biz/en/docs/liff/developing-liff-apps/#share-target-picker)
in the LIFF docs for the share target picker.

## Custom share message format

Use a **Bubble** container of a Flex Message — **not** a Carousel. There are two
types: **standard type** and **image list type**, both divided into sections
A–F:

| Label | Section | Required | Description |
|---|---|---|---|
| A | Image | Optional | Small enough that the whole message fits on screen without scrolling. |
| B | Title | Required | Summarize the message content. |
| C | Subtitle | * | Message subtitle. |
| D | Detail | * | List of items, each with a label + description. Max items: standard type **10**, image list type **5**. |
| E | Button | Required | Up to **3** buttons. At least one must display a detail page of the shared content. |
| F | Footer | Required | LINE MINI App icon + name + the `>` image `https://vos.line-scdn.net/service-notifier/footer_go_btn.png` (don't change it). Set a URI action on the `>` image to open the LINE MINI App top page (`https://miniapp.line.me/{your-liffId}`). |

\* You must include **either** C (subtitle) **or** D (detail); you may use both.

For both types: actions can be set **only** on the specified components of
buttons (E) and footer (F); do not change any properties not described.

---

## Standard type

### Standard type — Image (A)

Put the image in the **hero block**.

| Label | Type | Properties |
|---|---|---|
| A — Image | Hero block > Image | `"url": "{URL}"`; `"size": "full"`; `"aspectRatio": "{width}:{height}"` (set `{height}` ≤ `{width} * 2`); `"aspectMode": "cover"` |

```json
{
    "type": "bubble",
    "hero": { // Hero block
        // Image (A)
        "type": "image",
        "url": "https://example.com/hero-image.png",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover"
    },
    "body": {. . .}
}
```

### Standard type — Body

The **body block** holds the title (B), subtitle (C), details (D), buttons (E).

| Type | Properties |
|---|---|
| Body block > Box | `"layout": "vertical"`; `"spacing": "md"` |

```json
{
    "type": "bubble",
    "hero": { ... },
    "body": { // Body block
        // Box
        "type": "box",
        "layout": "vertical",
        "contents": [ ... ],
        "spacing": "md"
    }
}
```

### Standard type — Title (B)

| Label | Type | Properties |
|---|---|---|
| B — Title | Box | `"layout": "vertical"`; `"spacing": "none"` |
| B — Title | Text | `"text": "{Title}"` (max 2 lines); `"size": "lg"`; `"color": "#000000"`; `"weight": "bold"`; `"wrap": true` |

```json
{
    "type": "bubble",
    "hero": { ... },
    "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
            {   // Title (B) - Box
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {   // Text
                        "type": "text",
                        "text": "Main title",
                        "size": "lg",
                        "color": "#000000",
                        "weight": "bold",
                        "wrap": true
                    }
                ],
                "spacing": "none"
            }
        ],
        "spacing": "md"
    }
}
```

### Standard type — Sub-title (C)

| Label | Type | Properties |
|---|---|---|
| C — Sub-title | Box | `"layout": "vertical"`; `"spacing": "none"` |
| C — Sub-title | Text | `"text": "{Sub-title}"` (max 2 lines); `"size": "sm"`; `"color": "#999999"`; `"wrap": true` |

### Standard type — Details (D)

| Label | Type | Properties |
|---|---|---|
| D — Details | Box | `"layout": "vertical"`; `"spacing": "sm"`; `"margin": "lg"`; `"flex": 1` |
| D — Details item | Box | One set of D-1 + D-2. `"layout": "horizontal"`; `"spacing": "sm"`; `"flex": 1` |
| D-1 — label | Text | `"text": "{Label}"` (max 1 line); `"size": "sm"`; `"color": "#555555"`; `"wrap": false`; `"flex": 20` |
| D-2 — description | Text | `"text": "{Description}"` (max 1 line); `"size": "sm"`; `"color": "#111111"`; `"wrap": false`; `"flex": 55` |

### Standard type — Button (E)

| Label | Type | Properties |
|---|---|---|
| E — Button | Box | One set of E-1 + E-2. `"layout": "vertical"`; `"spacing": "xs"`; `"margin": "lg"` |
| E-1 — Button (link style only) | Button | `"style": "link"`; `"height": "sm"`; `"color": "{Text Color}"`; `"action": {...}` — URI action opening the LINE MINI App page (non-top pages need a [permanent link](https://developers.line.biz/en/docs/line-mini-app/develop/permanent-links/)). |
| E-2 — Button (primary style) | Button | `"style": "primary"` for the top button, `"style": "link"` for others — **never** `"secondary"`. `"height": "md"`; `"color": "{Text or Background Color}"`; `"action": {...}` — URI action opening the LINE MINI App page (non-top pages need a permanent link). |

When using primary style:

```json
{
    "type": "bubble",
    "hero": { ... }
    },
    "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
            {   // Title (B) - Box
                ...
            },
            {   // Sub-title (C) - Box
                ...
            },
            {   // Details (D) - Box
                ...
            },
            {   // Button (E) - Box
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {   // Button (primary)
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "View details",
                            "uri": "https://miniapp.line.me/123456-abcedfg"
                        },
                        "style": "primary",
                        "height": "md",
                        "color": "#17c950"
                    },
                    {   // Button (link)
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "label": "Share",
                            "uri": "https://miniapp.line.me/123456-abcedfg/share"
                        },
                        "style": "link",
                        "height": "md",
                        "color": "#469fd6"
                    }
                ],
                "spacing": "xs",
                "margin": "lg"
            }
        ],
        "spacing": "md"
    }
}
```

### Standard type — Footer (F)

Put the footer in the **footer block**.

| Label | Element | Properties |
|---|---|---|
| – | Footer block > Box | `"layout": "vertical"` |
| – | Separator | `"color": "#f0f0f0"` |
| F — Footer | Box | One set of F-1..F-3. `"layout": "horizontal"`; `"flex": 1`; `"spacing": "md"`; `"margin": "md"` |
| F-1 — LINE MINI App icon | Image | `"url": "{Image URL}"`; `"flex": 1`; `"gravity": "center"` |
| F-2 — LINE MINI App name | Text | `"text": "{LINE MINI App Name}"` (max 1 line); `"flex": 19`; `"size": "xs"`; `"color": "#999999"`; `"weight": "bold"`; `"gravity": "center"`; `"wrap": false` |
| F-3 — `>` image | Image | `"url": "https://vos.line-scdn.net/service-notifier/footer_go_btn.png"`; `"flex": 1`; `"gravity": "center"`; `"size": "xxs"`; `"action": {...}` — URI action opening the LINE MINI App top page (`https://miniapp.line.me/{your-liffId}`) |

```json
{
    "type": "bubble",
    "hero": { ... },
    "body": { ... },
    "footer": { // Footer block
        // Box
        "type": "box",
        "layout": "vertical",
        "contents": [
            {   // Separator
                "type": "separator",
                "color": "#f0f0f0"
            },
            {   // Footer (F) - Box
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {   // LINE MINI App icon (F-1)
                        "type": "image",
                        "url": "https://example.com/line-mini-app-icon.png",
                        "flex": 1,
                        "gravity": "center"
                    },
                    {   // LINE MINI App name (F-2)
                        "type": "text",
                        "text": "Service name",
                        "flex": 19,
                        "size": "xs",
                        "color": "#999999",
                        "weight": "bold",
                        "gravity": "center",
                        "wrap": false
                    },
                    {   // > (F-3)
                        "type": "image",
                        "url": "https://vos.line-scdn.net/service-notifier/footer_go_btn.png",
                        "flex": 1,
                        "gravity": "center",
                        "size": "xxs",
                        "action": {
                            "type": "uri",
                            "label": "action",
                            "uri": "https://miniapp.line.me/123456-abcedfg"
                        }
                    }
                ],
                "flex": 1,
                "spacing": "md",
                "margin": "md"
            }
        ]
    }
}
```

---

## Image list type

### Image list type — Image (A)

Put the image in the **hero block**. Same properties as standard type:
`"size": "full"`, `"aspectRatio": "{width}:{height}"` (`{height}` ≤ `{width}*2`),
`"aspectMode": "cover"`.

### Image list type — Body

Body block > Box: `"layout": "vertical"`; `"spacing": "md"`.

### Image list type — Title (B)

Same as standard type: Box (`"layout": "vertical"`, `"spacing": "none"`) +
Text (`"text"` max 2 lines, `"size": "lg"`, `"color": "#000000"`,
`"weight": "bold"`, `"wrap": true`).

### Image list type — Sub-title (C)

Same as standard type: Box (`"layout": "vertical"`, `"spacing": "none"`) +
Text (`"text"` max 2 lines, `"size": "sm"`, `"color": "#999999"`,
`"wrap": true`).

### Image list type — Details (D)

| Label | Type | Properties |
|---|---|---|
| D — Details | Box | `"layout": "vertical"`; `"spacing": "xl"`; `"margin": "lg"` |
| – — Details item | Box | One set of D-1..D-4. `"layout": "horizontal"`; `"flex": 1` |
| D-1 — Image | Image | `"url": "{Image URL}"`; `"flex": 3`; `"size": "sm"`; `"aspectRatio": "1:1"`; `"aspectMode": "cover"` |
| – — Text area | Box | Holds D-2..D-4. `"layout": "vertical"`; `"flex": 8`; `"spacing": "xs"`; `"margin": "md"` |
| D-2 — General text | Text | `"text": "{General Text}"`; `"size": "md"`; `"color": "#111111"` |
| D-3 — Text to emphasize | Text | `"text": "{Text to emphasize}"`; `"size": "md"`; `"color": "#111111"` |
| D-4 — Image+text | Box | `"layout": "horizontal"`; `"flex": 1`. Image of D-4: `"flex": 8`, `"url": "{Image URL}"`, `"gravity": "center"`, `"size": "xxs"`, `"aspectRatio": "1:1"`. Text of D-4: `"flex": 85`, `"margin": "xs"`, `"text": "{Text}"`, `"size": "sm"`, `"color": "{Color}"`, `"gravity": "center"`. |

### Image list type — Button (E)

| Label | Type | Properties |
|---|---|---|
| E — Button | Box | One set of E-1 + E-2. `"layout": "vertical"`; `"spacing": "xs"` |
| E-1 — Button (link only) | Button | `"style": "link"`; `"height": "sm"`; `"color": "{Text Color}"`; `"action": {...}` URI action opening the LINE MINI App page (non-top pages need a permanent link). |
| E-2 — Button (primary style) | Button | `"style": "primary"` for the top button, `"style": "link"` for others — **never** `"secondary"`. `"height": "md"`; `"color": "{Text or Background Color}"`; `"action": {...}` URI action opening the LINE MINI App page (non-top pages need a permanent link). |

### Image list type — Footer (F)

Identical to the standard type footer: Footer block > Box (`"layout":
"vertical"`) + Separator (`"color": "#f0f0f0"`) + Footer box (F-1 icon, F-2
name, F-3 `>` image with URI action to the top page).

---

## Complete example JSON — standard type

```json
{
  "type": "bubble",
  "hero": {
    "type": "image",
    "url": "https://example.com/hero-image.png", // Specify the appropriate image URL
    "size": "full",
    "aspectRatio": "20:13",
    "aspectMode": "cover"
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Main title",
            "size": "lg",
            "color": "#000000",
            "weight": "bold",
            "wrap": true
          }
        ],
        "spacing": "none"
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Sub-title",
            "size": "sm",
            "color": "#999999",
            "wrap": true
          }
        ],
        "spacing": "none"
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "Label 1",
                "size": "sm",
                "color": "#555555",
                "wrap": false,
                "flex": 20
              },
              {
                "type": "text",
                "text": "Description 1",
                "size": "sm",
                "color": "#111111",
                "wrap": false,
                "flex": 55
              }
            ],
            "flex": 1,
            "spacing": "sm"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "Label 2",
                "size": "sm",
                "color": "#555555",
                "wrap": false,
                "flex": 20
              },
              {
                "type": "text",
                "text": "Description 2",
                "size": "sm",
                "color": "#111111",
                "wrap": false,
                "flex": 55
              }
            ],
            "flex": 1,
            "spacing": "sm"
          }
        ],
        "spacing": "sm",
        "margin": "lg",
        "flex": 1
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "View details",
              "uri": "https://miniapp.line.me/123456-abcedfg" // Specify the LINE MINI App page.
            },
            "style": "primary",
            "height": "md",
            "color": "#17c950"
          },
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Share",
              "uri": "https://miniapp.line.me/123456-abcedfg/share" // Specify the LINE MINI App page.
            },
            "style": "link",
            "height": "md",
            "color": "#469fd6"
          }
        ],
        "spacing": "xs",
        "margin": "lg"
      }
    ],
    "spacing": "md"
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "separator",
        "color": "#f0f0f0"
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "image",
            "url": "https://example.com/line-mini-app-icon.png", // Specify the LINE MINI App icon.
            "flex": 1,
            "gravity": "center"
          },
          {
            "type": "text",
            "text": "Service name",
            "flex": 19,
            "size": "xs",
            "color": "#999999",
            "weight": "bold",
            "gravity": "center",
            "wrap": false
          },
          {
            "type": "image",
            "url": "https://vos.line-scdn.net/service-notifier/footer_go_btn.png",
            "flex": 1,
            "gravity": "center",
            "size": "xxs",
            "action": {
              "type": "uri",
              "label": "action",
              "uri": "https://miniapp.line.me/123456-abcedfg" // Specify the top page of the LINE MINI App.
            }
          }
        ],
        "flex": 1,
        "spacing": "md",
        "margin": "md"
      }
    ]
  }
}
```

## Complete example JSON — image list type

```json
{
  "type": "bubble",
  "hero": {
    "type": "image",
    "url": "https://example.com/hero-image.png", // Specify the appropriate image URL
    "size": "full",
    "aspectRatio": "20:13",
    "aspectMode": "cover"
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Main title",
            "size": "lg",
            "color": "#000000",
            "weight": "bold",
            "wrap": true
          }
        ],
        "spacing": "none"
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Sub-title",
            "size": "sm",
            "color": "#999999",
            "wrap": true
          }
        ],
        "spacing": "none"
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "image",
                "url": "https://example.com/hero-image.png", // Specify an appropriate image URL
                "flex": 3,
                "size": "sm",
                "aspectRatio": "1:1",
                "aspectMode": "cover"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "General text",
                    "size": "md",
                    "color": "#111111"
                  },
                  {
                    "type": "text",
                    "text": "Text to emphasize",
                    "size": "md",
                    "color": "#111111"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "image",
                        "url": "https://example.com/hero-image.png", // Specify an appropriate image URL
                        "flex": 8,
                        "gravity": "center",
                        "size": "xxs",
                        "aspectRatio": "1:1"
                      },
                      {
                        "type": "text",
                        "text": "Text 3",
                        "flex": 85,
                        "gravity": "center",
                        "size": "sm",
                        "color": "#17c950",
                        "margin": "xs"
                      }
                    ],
                    "flex": 1
                  }
                ],
                "flex": 8,
                "spacing": "xs",
                "margin": "md"
              }
            ],
            "flex": 1
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "image",
                "url": "https://example.com/hero-image.png", // Specify an appropriate image URL
                "flex": 3,
                "size": "sm",
                "aspectRatio": "1:1",
                "aspectMode": "cover"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "General text",
                    "size": "md",
                    "color": "#111111"
                  },
                  {
                    "type": "text",
                    "text": "Text to emphasize",
                    "size": "md",
                    "color": "#111111"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "image",
                        "url": "https://example.com/hero-image.png", // Specify an appropriate image URL
                        "flex": 8,
                        "gravity": "center",
                        "size": "xxs",
                        "aspectRatio": "1:1"
                      },
                      {
                        "type": "text",
                        "text": "Text",
                        "flex": 85,
                        "gravity": "center",
                        "size": "sm",
                        "color": "#17c950",
                        "margin": "xs"
                      }
                    ],
                    "flex": 1
                  }
                ],
                "flex": 8,
                "spacing": "xs",
                "margin": "md"
              }
            ],
            "flex": 1
          }
        ],
        "spacing": "xl",
        "margin": "lg"
      },
      {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "View details",
              "uri": "https://miniapp.line.me/123456-abcedfg" // Specify the LINE MINI App page.
            },
            "style": "primary",
            "height": "md",
            "color": "#17c950"
          },
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Share",
              "uri": "https://miniapp.line.me/123456-abcedfg/share" // Specify the LINE MINI App page.
            },
            "style": "link",
            "height": "md",
            "color": "#469fd6"
          }
        ],
        "spacing": "xs"
      }
    ],
    "spacing": "md"
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "separator",
        "color": "#f0f0f0"
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "image",
            "url": "https://example.com/line-mini-app-icon.png", // Specify the LINE MINI App icon.
            "flex": 1,
            "gravity": "center"
          },
          {
            "type": "text",
            "text": "Service name",
            "flex": 19,
            "size": "xs",
            "color": "#999999",
            "weight": "bold",
            "gravity": "center",
            "wrap": false
          },
          {
            "type": "image",
            "url": "https://vos.line-scdn.net/service-notifier/footer_go_btn.png",
            "flex": 1,
            "gravity": "center",
            "size": "xxs",
            "action": {
              "type": "uri",
              "label": "action",
              "uri": "https://miniapp.line.me/123456-abcedfg" // Specify the top page of the LINE MINI App.
            }
          }
        ],
        "flex": 1,
        "spacing": "md",
        "margin": "md"
      }
    ]
  }
}
```
