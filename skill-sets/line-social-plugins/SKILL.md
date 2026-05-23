---
name: line-social-plugins
description: >-
  LINE Social Plugins official reference at API-reference depth. Covers the
  three website widgets — the Share button, the Add friend button, and the
  Like button — that embed LINE sharing and engagement into any webpage. Use
  this skill whenever the task involves adding LINE Social Plugins to a site:
  generating or embedding the line-it-button placeholder div, loading the
  LINE Social Plugins SDK (loader.min.js from www.line-website.com), wiring up
  the LineIt.loadButton() initializer, building a LINE "Share with" / "LINE it!"
  button, an Add friend button for a LINE Official Account, or a Like button,
  configuring the data-type / data-color / data-size / data-count / data-home /
  data-lineId / data-lang / data-url / data-env / data-ver attributes, using a
  custom Share icon with the social-plugins.line.me/lineit/share URL, querying
  the server-side share-count API at api.line.me/social-plugin/metrics, or
  following the LINE Social Plugins design guide and usage guidelines. Trigger
  on mentions of: LINE Social Plugins, LINE Share button, LINE it button,
  LINE share widget, Add friend button, LINE Like button, line-it-button,
  loader.min.js, LineIt.loadButton, social-plugins.line.me, share-a / share-b /
  share-c, like_friend, data-lineId, LINE Official Account add friend button,
  share counter, social-plugin/metrics, or developers.line.biz/en/docs/line-social-plugins.
---

# LINE Social Plugins Reference

API-reference-level coverage of LINE Social Plugins, extracted from the official
documentation section at `https://developers.line.biz/en/docs/line-social-plugins/`.

LINE Social Plugins are **website-only HTML/JavaScript widgets** (no API keys,
no server) that connect a webpage to LINE so visitors can share, follow, or like
your content. This skill splits the official 7-page section into topic-scoped
reference files. **Read the reference file that matches the task — do not guess
`data-*` attribute names, attribute values, the SDK script URL, or API shapes.**

## When this skill applies

Any work that embeds LINE into a website: adding a **Share button**, an **Add
friend button** for a LINE Official Account, or a **Like button**; generating or
hand-writing the `<div class="line-it-button" ...>` placeholder; loading the
LINE Social Plugins SDK; using a **custom Share icon** with a direct share URL;
or calling the **share-count API**. This is the LINE *website* product — for
sharing inside an iOS/Android native app, use the LINE URL scheme instead (not
covered here).

## The product in one screen

- Three plug-ins: **Share**, **Add friend**, **Like**. Add friend and Like need
  a **LINE Official Account ID** (e.g. `@lineteamjp`); Share needs nothing.
- Every button is a hidden placeholder element configured by `data-*`
  attributes: `<div class="line-it-button" data-... style="display: none;"></div>`.
- One SDK loader script renders all buttons on `DOMContentLoaded`:
  `https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js`
  (loaded `async defer`). Include it **once per page**.
- Current widget version: `data-ver="3"`. Environment: `data-env="PROD"`.
- For buttons created after load, call `LineIt.loadButton()`.
- The **Like button** may misbehave in Safari (Apple ITP) and only works when
  its `data-url` domain matches the host page.
- You must agree to the **Usage Guidelines** before use; installing a button is
  treated as agreement.

## Reference file map

| File | Contents |
|---|---|
| `references/overview-and-concepts.md` | What LINE Social Plugins is, the three plug-in types and their prerequisites, the Share-button "how it works" flow, the SDK loader, native-app guidance, and the full 7-page documentation map. |
| `references/share-button.md` | Share button — the interactive builder inputs, button-type → `data-type`/`data-color` mapping, generated `line-it-button` markup, full `data-*` attribute reference, installation rules, custom-icon share URLs (`social-plugins.line.me/lineit/share`), `LineIt.loadButton()`, and the server-side share-count API (`api.line.me/social-plugin/metrics`) with parameters, samples, and status codes. |
| `references/add-friend-and-like-buttons.md` | Add friend button (`data-type="friend"`, `data-lineId`, `data-count`, `data-home`) and Like button (`data-type="like"` / `like_friend"`, `data-url` domain rule, Safari/ITP caveat) — builder inputs, button-type mappings, generated markup, and full `data-*` attribute references. |
| `references/design-guide.md` | Design guide for **custom** Share icons — official sample images (6 languages, 2× Retina sizing), color and text rules, recommended per-language button text, and the guideline constraints on icon usage. |
| `references/guidelines-and-release-notes.md` | The LINE Social Plugin Usage Guidelines (definitions, terms of use / prohibited sites & content, data collection, liability, governing law, inquiry email, revision history) and the full release-notes timeline (2012–2021, with newer updates in the News section). |

## Quick index

### Embed markup (all buttons)

```html
<!-- placeholder: configured entirely by data-* attributes -->
<div class="line-it-button" data-... style="display: none;"></div>
<!-- SDK loader: include ONCE per page -->
<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>
```

### `data-*` attributes by button type

```
Share button   data-type = share-a (wide) | share-b (square) | share-c (round)
               data-color = default | grey
               data-size  = small | large
               data-count = true | false        (share counter)
               data-url   = page to share
Add friend     data-type  = friend
               data-lineId = @your_oa_id
               data-count = true                (show friend count; omit to hide)
               data-home  = true                (show Home icon; omit to hide)
Like button    data-type  = like | like_friend  (like_friend also needs OA id)
               data-url   = page URL — domain MUST match the host page
Common to all  data-lang  = en | ja | ko | zh_TW | th | id
               data-env   = PROD
               data-ver   = 3   (Share button; current widget version)
```

### Custom Share icon (no SDK div)

```
Share URL only:      https://social-plugins.line.me/lineit/share?url={URL-encoded url}
Share URL + text:    https://social-plugins.line.me/lineit/share?url={url}&text={text}
Re-init after load:  <script type="text/javascript">LineIt.loadButton();</script>
```

### Share-count API (custom icons, server-side only)

```
GET https://api.line.me/social-plugin/metrics?url={url}
→ 200 { "share": "4173" }   |   400 bad request   |   500 server error
```

## Working rules

- Add the generated placeholder at the **exact DOM location** where the button
  should appear — the SDK renders it on `DOMContentLoaded`.
- Load the `loader.min.js` `<script>` **only once per page**; when adding
  several buttons, include the script only for the last one.
- The **share counter** (`data-count="true"` on a Share button) is only
  available with the **official LINE icons**, not with custom-icon links.
- The share-count API **must be called from the server side**, never the
  browser.
- The **Like button** requires its `data-url` domain to match the page it is
  embedded on, and may not work in Safari due to Apple's ITP policy.
- The "Like and share" button type no longer exists; existing ones were
  auto-converted to plain Like buttons.
- Custom Share icons must follow the design guide (use Dedicated Icons or the
  specified text wordings; never alter the icons).
