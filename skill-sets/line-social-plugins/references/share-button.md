# Share Button

Source: `https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-line-share-buttons/`

The Share button lets website visitors share your webpage link in LINE chats or
save it to Keep Memo. There are **two ways** to add it:

1. **Official LINE icons** — generate a button with LY Corporation's default
   designs (a placeholder `<div>` + the SDK loader script).
2. **Custom icons** — use your own icon image and link directly to the LINE
   share URL.

For iOS/Android native apps, do not use this — use the LINE URL scheme's
"Share with" screen (`/en/docs/line-login/using-line-url-scheme/`).

---

## Method 1 — Official LINE icons

The interactive builder on the doc page produces a snippet from 5 inputs:

| # | Input | Choices | Maps to attribute |
|---|---|---|---|
| 1 | **Language** | English, 日本語, 한국어, 中文, ภาษาไทย, Bahasa Indonesia | `data-lang` (`en`, `ja`, `ko`, `zh_TW`, `th`, `id`) |
| 2 | **URL** | The webpage URL to add the button to. This is also the page that gets shared. | `data-url` |
| 3 | **Button type** | 6 designs (see table below) | `data-type` + `data-color` |
| 4 | **Size** | Small / Large | `data-size` (`small` / `large`) |
| 5 | **Share counter** | On / Off — show the number of shares next to the button | `data-count` (`true` / `false`) |

### Button type → attribute mapping

| Design | `data-type` | `data-color` |
|---|---|---|
| Square, default color | `share-b` | `default` |
| Square, grey | `share-b` | `grey` |
| Round, default color | `share-c` | `default` |
| Round, grey | `share-c` | `grey` |
| Wide, default color | `share-a` | `default` |
| Wide, grey | `share-a` | `grey` |

### Generated code

The builder outputs a placeholder `<div>` plus the SDK loader `<script>`:

```html
<div class="line-it-button" data-lang="en" data-type="share-a" data-env="PROD" data-url="https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-line-share-buttons/" data-color="default" data-size="small" data-count="true" data-ver="3" style="display: none;"></div>
<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>
```

The same snippet with the **Wide / grey** design, **Large** size, counter
**Off**:

```html
<div class="line-it-button" data-lang="en" data-type="share-a" data-env="PROD" data-url="https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-line-share-buttons/" data-color="grey" data-size="large" data-count="false" data-ver="3" style="display: none;"></div>
<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>
```

### `data-*` attribute reference (Share button)

| Attribute | Value | Notes |
|---|---|---|
| `class="line-it-button"` | fixed | The SDK finds elements by this class. |
| `data-lang` | `en` / `ja` / `ko` / `zh_TW` / `th` / `id` | UI language of the button. |
| `data-type` | `share-a` (wide) / `share-b` (square) / `share-c` (round) | Button shape family. |
| `data-color` | `default` / `grey` | Color variant of the chosen shape. |
| `data-size` | `small` / `large` | Button size. |
| `data-count` | `true` / `false` | Whether to show the share counter. |
| `data-url` | a URL | Page to share. Also the page the button "belongs to". |
| `data-env` | `PROD` | Environment. |
| `data-ver` | `3` | Widget version (current). |
| `style="display: none;"` | fixed | The placeholder is hidden; the SDK reveals the rendered button. |

### Installation rules

- Add the generated code to the **DOM at the exact location** where you want the
  button displayed. The code runs on the page's `DOMContentLoaded` event.
- If you paste the snippet **more than once** to add multiple buttons on a
  single page, include the `<script>` tag **only for the last button** — load
  the SDK loader once per page.
- The share counter (`data-count="true"`) is only available with the **official
  icons** (Method 1), not with custom icons created via the link.

---

## Method 2 — Custom icons

To use your own icon image, link it to the LINE share URL instead of using the
SDK placeholder `<div>`. (You must read and agree to the Usage Guidelines
first.) See `design-guide.md` for icon design rules and sample images.

### Share URLs

Share a URL only:

```
https://social-plugins.line.me/lineit/share?url=
```

Share a URL **and** text together:

```
https://social-plugins.line.me/lineit/share?url=your_url&text=your_text
```

### Worked example

For `url = https://line.me/en` and `text = text`, URL-encode the values:

```
https://social-plugins.line.me/lineit/share?url=https%3A%2F%2Fline.me%2Fen&text=text
```

### `LineIt.loadButton()`

Once the DOM tree is constructed and your page content is produced, call
`LineIt.loadButton()` to enable (render) the Share button:

```html
<script type="text/javascript">LineIt.loadButton();</script>
```

Use this when you build buttons after initial page load, or to (re)initialize
buttons that the SDK did not pick up automatically on `DOMContentLoaded`.

---

## Share count API (custom icons)

When you use a custom icon and still want to display a share count, query the
share-count API. **It must be called from the server side**, not the browser.

### HTTP request

```
GET https://api.line.me/social-plugin/metrics?url=https://line.me/en
```

### Request parameters

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `url` | String | Required | The URL to get the share count for. Example: `https://line.me/en` |

### Sample request

```sh
curl -X GET 'https://api.line.me/social-plugin/metrics?url=https://line.me/en'
```

### Sample response

```json
{
    "share": "4173"
}
```

`share` is the share count, returned as a string.

### Status codes

| Code | Meaning | Description |
|---|---|---|
| `200` | OK | The request succeeded. |
| `400` | Bad request | The request contains invalid parameters or values. |
| `500` | Internal Server Error | An internal server error occurred. |

---

## More help

FAQ for the Share button: `https://developers.line.biz/en/faq/tags/sp-share/`
