# Flex Message

Source: `https://developers.line.biz/en/reference/messaging-api/`

Flex Messages have a customizable layout based on CSS Flexible Box (Flexbox).

## Structure

```
Flex Message (type: "flex")
└── contents: Container
    ├── Bubble  — one message bubble (header, hero, body, footer blocks)
    └── Carousel — multiple bubbles
        Components: box, button, image, video, icon, text, span, separator, filler(deprecated)
```

## Table of contents

- Flex Message object
- Containers: bubble, carousel + block styles
- Components: box, button, image, video, icon, text, span, separator
- Operating environment / version notes

---

# Flex Message object

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `flex` |
| `altText` | Yes | String | Alternative text. ≤1500 chars. Unicode emoji allowed. |
| `contents` | Yes | Object | A bubble or carousel container |

```json
{ "type": "flex", "altText": "This is a Flex Message",
  "contents": { "type": "bubble", "body": { "type": "box", "layout": "vertical",
    "contents": [ { "type": "text", "text": "hello, world" } ] } } }
```

## Operating environment / version notes

- `maxWidth`/`maxHeight` of box, `lineSpacing` of text, video component: iOS/Android 11.22.0+, PC 7.7.0+.
- Bubble `size` values `deca`/`hecto`, `scaling` of button/text/icon: iOS/Android 13.6.0+, PC 7.17.0+
  (older LINE renders `deca`/`hecto` as `kilo`).

---

# Containers

## Bubble

A container with a single message bubble; can hold header, hero, body, footer blocks.
Max JSON size: 30 KB.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `bubble` |
| `size` | No | String | `nano`, `micro`, `deca`, `hecto`, `kilo`, `mega` (default), `giga` |
| `direction` | No | String | `ltr` (default) / `rtl` — text directionality and horizontal box placement |
| `header` | No | Object | Header block — a box component |
| `hero` | No | Object | Hero block — a box, image, or video component |
| `body` | No | Object | Body block — a box component |
| `footer` | No | Object | Footer block — a box component |
| `styles` | No | Object | Bubble style (per-block styling) |
| `action` | No | Object | Action when the bubble is tapped |

**Bubble style** — `header` / `hero` / `body` / `footer`, each a **block style**:

| Block style property | Type | Description |
|---|---|---|
| `backgroundColor` | String | Block background color (hex) |
| `separator` | Boolean | `true` to place a separator above the block. Default `false`. Can't be above the first block. |
| `separatorColor` | String | Separator color (hex) |

## Carousel

Multiple bubbles browsed by scrolling sideways. Max JSON size: 50 KB.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `carousel` |
| `contents` | Yes | Array | Bubbles, max 12. All bubbles must have the same `size` (width). |

---

# Components

## Box

A horizontal/vertical/baseline layout container that holds other components (including boxes).

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `box` |
| `layout` | Yes | String | `horizontal`, `vertical`, or `baseline` |
| `contents` | Yes | Array | Child components (may be empty). `horizontal`/`vertical`: box, button, image, text, separator, filler. `baseline`: icon, text, filler. |
| `backgroundColor` | No | String | Hex `#RRGGBB` or `#RRGGBBAA`. Default `#00000000` |
| `borderColor` | No | String | Border color (hex) |
| `borderWidth` | No | String | px, or `none`/`light`/`normal`/`medium`/`semi-bold`/`bold` |
| `cornerRadius` | No | String | px, or `none` (default)/`xs`/`sm`/`md`/`lg`/`xl`/`xxl` |
| `width` | No | String | px or % of parent width |
| `maxWidth` | No | String | px or % of parent width |
| `height` | No | String | px or % of parent height |
| `maxHeight` | No | String | px or % of parent height |
| `flex` | No | Number | Width/height ratio within parent box |
| `spacing` | No | String | Min space between children. `none` (default)/`xs`/`sm`/`md`/`lg`/`xl`/`xxl` |
| `margin` | No | String | Space before this component. `none`/`xs`/`sm`/`md`/`lg`/`xl`/`xxl` or px |
| `paddingAll` / `paddingTop` / `paddingBottom` / `paddingStart` / `paddingEnd` | No | String | Padding. px, %, or `none`/`xs`/`sm`/`md`/`lg`/`xl`/`xxl` |
| `position` | No | String | `relative` (default) / `absolute` |
| `offsetTop` / `offsetBottom` / `offsetStart` / `offsetEnd` | No | String | Offset |
| `action` | No | Object | Action when the box is tapped |
| `justifyContent` | No | String | Main-axis alignment: `flex-start`/`center`/`flex-end`/`space-between`/`space-around`/`space-evenly` |
| `alignItems` | No | String | Cross-axis alignment: `flex-start`/`center`/`flex-end` |
| `background.type` | No | String | `linearGradient` |
| `background.angle` | No | String | Gradient angle, e.g. `90deg` (required for linearGradient) |
| `background.startColor` / `background.endColor` | No | String | Gradient endpoints (hex; required for linearGradient) |
| `background.centerColor` | No | String | Middle gradient color (hex) |
| `background.centerPosition` | No | String | Position of the middle stop, `0%`–`100%` (default `50%`) |

## Button

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `button` |
| `action` | Yes | Object | Action when tapped |
| `flex` | No | Number | Width/height ratio (horizontal box default 1, vertical box default 0) |
| `margin` | No | String | Space before this component |
| `position` | No | String | `relative` (default) / `absolute` |
| `offsetTop` / `offsetBottom` / `offsetStart` / `offsetEnd` | No | String | Offset |
| `height` | No | String | `sm` / `md` (default) |
| `style` | No | String | `primary` (dark) / `secondary` (light) / `link` (default) |
| `color` | No | String | Text color when `link`; background color when `primary`/`secondary` (hex) |
| `gravity` | No | String | Vertical alignment: `top` / `center` / `bottom` |
| `adjustMode` | No | String | `shrink-to-fit` — shrink font to fit width |
| `scaling` | No | Boolean | Auto-scale font with LINE's font-size setting. Default `false`. |

## Image

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `image` |
| `url` | Yes | String | HTTPS JPEG/PNG, ≤1024×1024 px, ≤10 MB (≤300 KB if `animated`), ≤2000 chars |
| `flex` | No | Number | Ratio within parent box |
| `margin` | No | String | Space before this component |
| `position` | No | String | `relative` (default) / `absolute` |
| `offsetTop` / `offsetBottom` / `offsetStart` / `offsetEnd` | No | String | Offset |
| `align` | No | String | Horizontal alignment: `start` / `center` (default) / `end` |
| `gravity` | No | String | Vertical alignment: `top` / `center` / `bottom` |
| `size` | No | String | `xxs`,`xs`,`sm`,`md` (default),`lg`,`xl`,`xxl`,`3xl`,`4xl`,`5xl`,`full`, px, or % |
| `aspectRatio` | No | String | `{width}:{height}`, e.g. `1.91:1`. Default `1:1`. Each value ≤100000, ratio ≤3 |
| `aspectMode` | No | String | `cover` / `fit` (default) |
| `backgroundColor` | No | String | Background color (hex) |
| `action` | No | Object | Action when tapped |
| `animated` | No | Boolean | `true` to play an APNG. Default `false`. |

## Video

(iOS/Android 11.22.0+, PC 7.7.0+; specify `altContent` for older versions.) Used in the
hero block of a bubble; the bubble's body must contain at least one box.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `video` |
| `url` | Yes | String | Video URL. HTTPS, mp4, ≤200 MB |
| `previewUrl` | Yes | String | Preview image URL. HTTPS, JPEG/PNG |
| `altContent` | Yes | Object | Image/box shown on LINE versions that don't support video |
| `aspectRatio` | No | String | `{width}:{height}`, e.g. `20:13`. Default `1:1` |
| `action` | No | Object | Action when tapped |

## Icon

Decorates a `baseline`-layout box's text. Renders only inside a baseline box.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `icon` |
| `url` | Yes | String | HTTPS JPEG/PNG, ≤1024×1024 px, ≤1 MB (≤300 KB if `animated`), ≤2000 chars |
| `size` | No | String | `xxs`..`5xl`, `full`, px (default `md`) |
| `aspectRatio` | No | String | `{width}:{height}`. Default `1:1` |
| `margin` | No | String | Space before this component |
| `position` | No | String | `relative` (default) / `absolute` |
| `offsetTop` / `offsetBottom` / `offsetStart` / `offsetEnd` | No | String | Offset |
| `scaling` | No | Boolean | Auto-scale with LINE font setting. Default `false` |
| `animated` | No | Boolean | `true` to play an APNG. Default `false` |

## Text

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `text` |
| `text` | Conditional | String | Text. Required unless `contents` is set. `\n` for line breaks. |
| `contents` | Conditional | Array | Array of span components. If set, `text` is ignored. |
| `adjustMode` | No | String | `shrink-to-fit` |
| `flex` | No | Number | Ratio within parent box |
| `margin` | No | String | Space before this component |
| `position` | No | String | `relative` (default) / `absolute` |
| `offsetTop` / `offsetBottom` / `offsetStart` / `offsetEnd` | No | String | Offset |
| `size` | No | String | `xxs`..`5xl`, px (default `md`) |
| `align` | No | String | `start` (default) / `center` / `end` |
| `gravity` | No | String | `top` / `center` / `bottom` |
| `wrap` | No | Boolean | `true` to wrap. Default `false` |
| `lineSpacing` | No | String | Line spacing in a wrapped text, px |
| `maxLines` | No | Number | Max lines. `0` = no limit |
| `weight` | No | String | `regular` (default) / `bold` |
| `color` | No | String | Text color (hex) |
| `style` | No | String | `normal` (default) / `italic` |
| `decoration` | No | String | `none` (default) / `underline` / `line-through` |
| `action` | No | Object | Action when tapped |
| `scaling` | No | Boolean | Auto-scale with LINE font setting. Default `false` |

## Span

A child of a `text` component (in its `contents` array) that styles part of the text.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `span` |
| `text` | Yes | String | Text |
| `color` | No | String | Text color (hex) |
| `size` | No | String | `xxs`..`5xl`, px (default `md`) |
| `weight` | No | String | `regular` (default) / `bold` |
| `style` | No | String | `normal` (default) / `italic` |
| `decoration` | No | String | `none` (default) / `underline` / `line-through` |

## Separator

A line dividing components in a box.

| Property | Required | Type | Description |
|---|---|---|---|
| `type` | Yes | String | `separator` |
| `margin` | No | String | Space before this component |
| `color` | No | String | Separator color (hex) |
