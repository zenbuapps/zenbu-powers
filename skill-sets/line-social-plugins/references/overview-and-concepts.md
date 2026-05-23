# LINE Social Plugins — Overview & Concepts

Source: `https://developers.line.biz/en/docs/line-social-plugins/general/overview/`

LINE Social Plugins provides drop-in HTML/JavaScript widgets that connect any
webpage to LINE so visitors can share, react to, or follow your content. It is a
website-only product (no API keys for the buttons themselves, no server). It is
operated by **LY Corporation**.

## The three plug-in types

| Plug-in | What it does | Prerequisite |
|---|---|---|
| **Share button** | Visitors share your webpage link in LINE chats or save it to Keep Memo. | None |
| **Add friend button** | Visitors add your **LINE Official Account** as a friend. | A LINE Official Account (you need its ID, e.g. `@lineteamjp`) |
| **Like button** | Visitors "like" your content; lets you measure content performance. Can be combined with the Add friend button. | A LINE Official Account ID |

> **Safari / ITP caveat:** The **Like button** may not work properly in Safari
> because of Apple's Intelligent Tracking Prevention (ITP) policy. Plan around
> this if your audience is Safari-heavy.

## How it works (Share button flow)

1. A visitor opens your webpage, which embeds LINE Social Plugin button markup.
2-3. Each button's code is **dynamically loaded** into the page by the **LINE
   Social Plugins SDK** (the `loader.min.js` script) and rendered in place.
4. When the visitor clicks the **Share** button, they are taken to the LINE
   Social Plugins page and must log in to LINE.
5. After logging in, they share the webpage with their LINE friends.

The render step is triggered by the page's `DOMContentLoaded` event — the SDK
scans the DOM for button placeholder elements and replaces them with live
buttons. See `share-button.md` for the exact markup and the SDK script tag.

## Native apps

LINE Social Plugins is for **websites**. To add a share affordance to **iOS or
Android native apps**, do not use these plugins — use the LINE app's
**"Share with"** screen via the LINE URL scheme instead. Reference:
`https://developers.line.biz/en/docs/line-login/using-line-url-scheme/`.

## Documentation map (this doc section)

The official `line-social-plugins` documentation section has exactly 7 pages:

| Page | URL |
|---|---|
| LINE Social Plugins overview | `/en/docs/line-social-plugins/general/overview/` |
| Usage Guidelines for the LINE Social Plugin | `/en/docs/line-social-plugins/general/guidelines/` |
| Using Share buttons | `/en/docs/line-social-plugins/install-guide/using-line-share-buttons/` |
| Using Add friend buttons | `/en/docs/line-social-plugins/install-guide/using-add-friend-buttons/` |
| Using Like buttons | `/en/docs/line-social-plugins/install-guide/using-like-buttons/` |
| Release notes | `/en/docs/line-social-plugins/resources/release-notes/` |
| Design guide | `/en/docs/line-social-plugins/resources/design-guide/` |

## Key facts to remember

- The SDK loader script is always:
  `https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js`
  (loaded `async defer`).
- Every button is a placeholder `<div class="line-it-button" ...>` element
  configured entirely by `data-*` attributes. The current widget version is
  `data-ver="3"`.
- You must read and agree to the **Usage Guidelines** before using any plugin.
  Installing a button on a site is treated as agreement (see
  `guidelines-and-release-notes.md`).
- Buttons are created with an interactive builder on each install-guide page:
  pick a language, fill in a URL / Official Account ID, choose a design, then
  copy the generated code.
