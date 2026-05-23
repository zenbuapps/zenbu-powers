# Add Friend Button & Like Button

Sources:
- `https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-add-friend-buttons/`
- `https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-like-buttons/`

Both buttons require a **LINE Official Account** and use its account ID (e.g.
`@lineteamjp`). Like the Share button, each is a placeholder
`<div class="line-it-button" ...>` rendered by the SDK loader script.

---

# Add Friend button

When a visitor clicks the Add friend button, your **LINE Official Account** is
added as a friend on their LINE account. You **must have a LINE Official
Account** to use this button.

## Builder inputs

| # | Input | Choices | Maps to attribute |
|---|---|---|---|
| 1 | **Language** | English, 日本語, 한국어, 中文, ภาษาไทย, Bahasa Indonesia | `data-lang` (`en`, `ja`, `ko`, `zh_TW`, `th`, `id`) |
| 2 | **Official account ID** | Your LINE Official Account ID, e.g. `@lineteamjp` | `data-lineId` |
| 3 | **Button type** | See table below | `data-count` + `data-home` |

### Button type → attribute mapping

The "Home" icon, when shown, takes the visitor to your Official Account profile.

| Button type | `data-count` | `data-home` |
|---|---|---|
| Display number of friends **and** Home button link | `true` | `true` |
| Display number of friends (only) | `true` | (omitted) |
| Only display the "Add friend" button | (omitted) | (omitted) |

## Generated code

For "Display number of friends and Home button link":

```html
<div class="line-it-button" data-lang="en" data-type="friend" data-env="PROD" data-count="true" data-home="true" data-lineId="@lineteamjp" style="display: none;"></div>
<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>
```

## `data-*` attribute reference (Add friend button)

| Attribute | Value | Notes |
|---|---|---|
| `class="line-it-button"` | fixed | The SDK finds elements by this class. |
| `data-type` | `friend` | Identifies an Add friend button. |
| `data-lang` | `en` / `ja` / `ko` / `zh_TW` / `th` / `id` | Button UI language. |
| `data-lineId` | `@xxxxxxx` | Your LINE Official Account ID. |
| `data-count` | `true` | Show the number of friends. Omit to hide it. |
| `data-home` | `true` | Show the Home icon linking to your Official Account profile. Omit to hide it. |
| `data-env` | `PROD` | Environment. |
| `style="display: none;"` | fixed | Placeholder hidden until the SDK renders the button. |

## Installation rule

Insert the generated code at the **exact location** in the DOM where you want
the button displayed. As with the Share button, load the SDK `<script>` only
once per page (include it only for the last button if you add several).

FAQ: see the LINE Developers FAQ section.

---

# Like button

The Like button lets visitors "like" your content. It can be used **alongside
the Add friend button**. You need a **LINE Official Account ID** to use it.

> **Note — Safari / ITP:** The Like button may not operate properly in **Safari**
> because of Apple's Intelligent Tracking Prevention (ITP) policy.

> **Domain rule:** The Like button **only functions if the URL's domain matches
> the actual page it is added to.** A button configured with one domain will not
> work when embedded on a different domain.

## Builder inputs

| # | Input | Choices | Maps to attribute |
|---|---|---|---|
| 1 | **Language** | English, 日本語, 한국어, 中文, ภาษาไทย, Bahasa Indonesia | `data-lang` (`en`, `ja`, `ko`, `zh_TW`, `th`, `id`) |
| 2 | **URL** | The webpage URL to add the button to. Its domain must match the host page. | `data-url` |
| 3 | **Button type** | `Like` / `Like and add as friend` | `data-type` (`like` / `like_friend`) — for `like_friend`, also enter your LINE Official Account ID |

### Button types

- **Like** — a standalone Like button (`data-type="like"`).
- **Like and add as friend** — shows the Like button together with the Add
  friend button (`data-type="like_friend"`). For visitors who have **already
  added** you as a friend, the Add friend button is replaced with the **Home
  icon**. Requires entering your LINE Official Account ID.

## Generated code

Standalone Like button:

```html
<div class="line-it-button" data-lang="en" data-type="like" data-env="PROD" data-url="https://developers.line.biz/en/docs/line-social-plugins/install-guide/using-like-buttons/" style="display: none;"></div>
<script src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js" async="async" defer="defer"></script>
```

For the "Like and add as friend" type, the placeholder uses
`data-type="like_friend"` and additionally carries your LINE Official Account
ID; the rest of the structure (loader `<script>`, `data-lang`, `data-env`,
`data-url`, hidden `style`) is the same.

## `data-*` attribute reference (Like button)

| Attribute | Value | Notes |
|---|---|---|
| `class="line-it-button"` | fixed | The SDK finds elements by this class. |
| `data-type` | `like` / `like_friend` | `like` = standalone; `like_friend` = Like + Add friend. |
| `data-lang` | `en` / `ja` / `ko` / `zh_TW` / `th` / `id` | Button UI language. |
| `data-url` | a URL | Page the Like applies to. **Domain must match the host page.** |
| `data-env` | `PROD` | Environment. |
| `style="display: none;"` | fixed | Placeholder hidden until the SDK renders the button. |

## Removed feature

The **"Like and share"** button option was removed (March 17, 2021). Existing
"Like and share" buttons were automatically converted to plain Like buttons.
See `guidelines-and-release-notes.md`.

---

## Shared rules for all three buttons

- Every button is a hidden placeholder `<div class="line-it-button" ...>` plus
  one SDK loader script:
  `https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js`
  (`async defer`).
- The SDK scans for `.line-it-button` placeholders on `DOMContentLoaded` and
  renders live buttons in place.
- Load the SDK loader `<script>` only **once per page**.
- For buttons created after initial load, call `LineIt.loadButton()` (see
  `share-button.md`).
