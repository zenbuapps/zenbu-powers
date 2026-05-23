# Common Profile Quick-fill — Overview & Client API

Source:
- `https://developers.line.biz/en/docs/line-mini-app/quick-fill/overview/`
- `https://developers.line.biz/en/docs/line-mini-app/quick-fill/design-regulations/`
- `https://developers.line.biz/en/reference/line-mini-app/#quick-fill` (API reference)

## Table of contents

- What Quick-fill is
- Steps for using Quick-fill (apply + develop)
- Integrating Quick-fill with the LIFF plugin (CDN / npm)
- Quick-fill operating environment
- Console scopes
- `scopes` parameters & return values
- Dummy data (caseId 1–10)
- Format options
- Design regulations & Auto-fill button rules
- **API: `liff.$commonProfile.get()`**
- **API: `liff.$commonProfile.getDummy()`**
- **API: `liff.$commonProfile.fill()`**

> **Verified MINI Apps only.** To use Common Profile Quick-fill, the LINE MINI
> App must be verified **and** you must apply to use Quick-fill.

---

## What Quick-fill is

Quick-fill automatically fills in profile information when the user taps the
**Auto-fill** button in a LINE MINI App. The Common Profile information a user
set in the Account Center can be reused in the LINE MINI App (e.g. address,
phone number with one tap — no manual entry for reservations / online orders).

**Quick-fill currently supports Japanese only** — the Quick-fill screen is shown
in Japanese regardless of the LINE app's language setting. Quick-fill works only
when the user is using LINE for iOS or LINE for Android.

The Common Profile for the Account Center is created by combining the LINE
profile and the Yahoo! JAPAN profile. If the user does not use the Account
Center, the LINE profile information is filled in automatically.

## Steps for using Quick-fill

**Step 1. Prepare a verified MINI App.** Quick-fill is verified-MINI-App-only.

**Step 2. Apply for and develop Quick-fill:**

- **2-1. Apply and obtain approval** — fill out the usage application form (Excel,
  Japanese only) and submit it via the
  [application form](https://form-business.yahoo.co.jp/claris/enqueteForm?inquiry_type=miniapp-quick-fill).
  A single form supports multiple LINE MINI Apps for the same provider.
  Notification by email.
- **2-2. Specify the Quick-fill scope in the Console** — once approved, in the
  **Scope** section of the **Web app settings** tab, check the scope(s) you want.
  To specify the scope for a verified MINI App, you must first click **Search
  enable** on the **Review request** tab.
- **2-3. Integrate Quick-fill** into your LINE MINI App.
- **2-4. Request review** of the LINE MINI App via the **Review request** tab;
  after passing, apply the changes to the published app.

> If you enable both Quick-fill and Channel consent simplification, users won't
> be able to disable the Common Profile toggle on the verification screen (to be
> fixed in the future).

## Integrating Quick-fill with the LIFF plugin

Quick-fill uses the LIFF SDK + the
[LIFF plugin](https://developers.line.biz/en/docs/liff/liff-plugin/) mechanism.
Pass the Quick-fill LIFF plugin to `liff.use()`:

```javascript
liff.use(new LiffCommonProfilePlugin());
await liff.init({ liffId: "xxx" });

const { data, error } = await liff.$commonProfile.get();
liff.$commonProfile.fill(data);
```

The `$commonProfile` property is added to the `liff` object, exposing the
Quick-fill client API: `liff.$commonProfile.get()`, `getDummy()`, `fill()`.

### Specify a CDN path

Loading the package with a `script` tag adds the `liffCommonProfile` property to
`window`; pass an instance of `liffCommonProfile.LiffCommonProfilePlugin` to
`liff.use()`:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
    <script src="https://static.line-scdn.net/5/liff-common-profile/edge/production/1.0.0/index.umd.cjs"></script>
    <title>LIFF App</title>
  </head>
  <body>

    <script type="module" src="/index.js"></script>
  </body>
</html>
```

```js
liff.use(new liffCommonProfile.LiffCommonProfilePlugin());

const { data, error } = await liff.$commonProfile.get();
liff.$commonProfile.fill(data);
```

### Use the npm package

Import `LiffCommonProfilePlugin` from `@line/liff-common-profile-plugin`:

```sh
$ npm install @line/liff-common-profile-plugin
```

```js
import liff from "@line/liff";
import { LiffCommonProfilePlugin } from "@line/liff-common-profile-plugin";
liff.use(new LiffCommonProfilePlugin());

const { data, error } = await liff.$commonProfile.get();
liff.$commonProfile.fill(data);
```

## Quick-fill operating environment

- **LIFF SDK version**: v2.19.0 or later (the LIFF plugin is used).
- **Node.js version**: 18.15.0 or later when installing the LIFF SDK via npm
  (Node.js is not required when using a CDN path).
- A LIFF app works only if the URL exactly matches the endpoint URL or is at a
  lower level than it.

## Console scopes

Selectable Quick-fill scopes in the LINE Developers Console:

| Scope | Description |
|---|---|
| `commonprofile.name` | Permission to obtain the name registered by the user. |
| `commonprofile.email` | Permission to obtain the email address registered by the user. |
| `commonprofile.address` | Permission to obtain the address registered by the user. |
| `commonprofile.gender` | Permission to obtain the gender registered by the user. |
| `commonprofile.birthday` | Permission to obtain the birthday registered by the user. |
| `commonprofile.phone` | Permission to obtain the phone number registered by the user. |

Users cannot select individual scopes on the channel consent screen — they
allow or disallow these scopes in bulk as "Management Information (Common
Profile) in the Account Center".

## `scopes` parameters & return values

Values that can be passed in the `scopes` array of `liff.$commonProfile.get()`
and `liff.$commonProfile.getDummy()`, and the return value for each:

| # | `scopes` | Description | Data type | Max chars (half-width) | Max chars (Hiragana/kanji) | Return value notes |
|---|---|---|---|---|---|---|
| 1 | `family-name` | Family name | string | 100 | 50 | |
| 2 | `given-name` | Given name | string | 100 | 50 | |
| 3 | `family-name-kana` | Phonetic family name | string | 100 | 50 | |
| 4 | `given-name-kana` | Phonetic given name | string | 100 | 50 | |
| 5 | `sex-enum` | Gender | number | 1 (fixed) | N/A | `0` Male, `1` Female, `2` Other, `3` No answer |
| 6 | `bday-day` | Day of birth | number | 2 | N/A | |
| 7 | `bday-month` | Month of birth | number | 2 | N/A | |
| 8 | `bday-year` | Year of birth | number | 4 | N/A | |
| 9 | `tel` | Phone number | string | 200 | N/A | |
| 10 | `email` | Email address | string | 200 | N/A | |
| 11 | `postal-code` | Postal code | string | 47 | N/A | |
| 12 | `address-level1` | Address 1 | string | 53 | 53 | |
| 13 | `address-level2` | Address 2 | string | 53 | 53 | |
| 14 | `address-level3` | Address 3 | string | 100 | 69 | |
| 15 | `address-level4` | Address 4 | string | 100 | 69 | |

## Dummy data (caseId 1–10)

`liff.$commonProfile.getDummy()` returns one of 10 dummy `CommonProfile`
datasets, selected by `caseId` (1–10). The datasets deliberately include edge
cases — empty values, kana-only, half-width-kana, emoji, very long strings,
non-Japanese phone numbers, postal codes with non-numeric characters — for
testing format options and validation.

| `caseId` | family-name | given-name | sex-enum | tel | email | postal-code | Notable edge case |
|---|---|---|---|---|---|---|---|
| 1 | 見本田 | 見本夫 | 0 | 09001234567 | dummy_39@yahoo.co.jp | 1020094 | Full valid Japanese profile |
| 2 | (empty) | (empty) | 1 | 09001234567 | dummy_39@yahoo.co.jp | N5X 1N7 | Empty names; non-numeric postal code |
| 3 | 見本田 | (empty) | 2 | 09001234567 | (very long email) | 102-0094 | Hyphenated postal code; overlong email |
| 4 | (empty) | 見本夫 | 3 | 0901234567 | dummy_39@yahoo.co.jp | (very long postal code) | Overlong postal code |
| 5 | Daimta | Damio | 0 | 09001234567 | (empty) | 1020094 | Roman-letter names; empty email |
| 6 | 1234 | 4321 | 1 | 090-1234-5678 | dummy_39@yahoo.co.jp | (empty) | Numeric names; hyphenated phone |
| 7 | ﾀﾞﾐｰﾀ | ﾀﾞﾐｵ | 2 | (very long phone, 200+ chars) | dummy_39@yahoo.co.jp | 1020094 | Half-width kana; overlong phone |
| 8 | ダミ！？ | ダミ夫@ | 3 | 09001234567 | dummy_39@yahoo.co.jp | 1020094 | Symbols in names; emoji in addresses |
| 9 | 🐶🐶🐶 | ダミ💚 | 0 | (empty) | dummy_39@yahoo.co.jp | 102-0094 | Emoji names; overlong addresses |
| 10 | (overlong) | (overlong) | 1 | 09001234567 | dummy_39@yahoo.co.jp | N5X 1N7 | Overlong names; non-numeric postal code |

Each dataset also includes `family-name-kana`, `given-name-kana`, `bday-day`,
`bday-month`, `bday-year`, `address-level1`–`4`. For the exact byte-for-byte
values of every cell, see the
[Dummy data table](https://developers.line.biz/en/docs/line-mini-app/quick-fill/overview/#get-dummy-common-profile)
in the official docs.

## Format options

When getting Common Profile information, you can specify format options per
scope. All default to `true`; specify `false` to disable.

| Property | Default | Description | Specifiable scope |
|---|---|---|---|
| `excludeEmojis` | `true` | Whether to remove emojis from the string. | `given-name`, `family-name` |
| `excludeNonJp` | `true` | Whether to exclude phone numbers with 12+ digits. If `true`, an empty string + error info are returned for a 12+-digit phone. | `tel` |
| `digitsOnly` | `true` | Whether to exclude postal codes with non-numeric characters. If `true`, an empty string + error info are returned. | `postal-code` |

## Design regulations & Auto-fill button rules

### User experience

When the user taps the **Auto-fill** button, a modal appears to confirm the
user's profile; after confirming, the user taps **Auto-fill** and the form is
filled. The modal is displayed by calling `liff.$commonProfile.get()` — you do
**not** build the modal yourself.

### Recommended screen transitions

- Display a modal immediately after moving to the member registration screen
  (place an Auto-fill button so the user can reopen the modal).
- Display a modal when the user selects an input form.
- Display a modal after the user taps the Auto-fill button.
- Display a modal at the destination after the user agrees on the channel
  consent screen (transition directly to the registration screen, then display
  the modal; place an Auto-fill button).

### Prohibited screen transitions

Violations may cause Quick-fill permission to be revoked:

- Displaying a modal on a screen that has no form to auto-fill.
- Getting items that don't exist in the form (e.g. getting phonetic info when
  the form has no phonetic field).
- Moving to the confirmation screen without auto-filling the form.

### Auto-fill button

There are **4 types (A, B, C, D)**, 13 buttons total. Use a button as-is —
without modifying, editing, animating, or adding effects.

- Align the button with the left or center of the form input field.
- Place it where the user can see the form to be filled.
- Leave a 10px margin above/below/left/right.
- Prohibited: zoom in/out, transform (skew/rotate/italicize), decoration
  (shadow/border/3D), overlapping elements, custom buttons, adding text below
  the button, hiding the button.
- Use the button image by referencing the URL directly — do not download and
  use the image (it may change without notice).

| Type | Variants | Size | ALT attribute |
|---|---|---|---|
| A | 1 (basic) + 2–4 (color variations) | 264×73 px | `ユーザー情報を自動入力。LINEやYahoo! JAPANに登録した情報を利用できます` |
| B | 1 (basic) + 2–4 (color variations) | 264×73 px | `ユーザー情報を自動入力。LINEやYahoo! JAPANに登録した情報を利用できます` |
| C | 1 (basic only) | 264×73 px | `ユーザー情報を自動入力。LINEやYahoo! JAPANに登録した情報を利用できます` |
| D | 1 (basic) + 2–4 (color variations) | 288×66 px | `LINEで自動入力しますか？氏名、電話番号、メールアドレス、住所など。自動入力` |

Button image URLs (display at the specified size — the images are 2× the
specified size):

```
# Type A
https://account-center-fe.line-scdn.net/images/quick_fill_button_AC_black.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_AC_white.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_AC_gray.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_AC_blue.png
# Type B
https://account-center-fe.line-scdn.net/images/quick_fill_button_simple_black.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_simple_white.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_simple_gray.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_simple_blue.png
# Type C
https://account-center-fe.line-scdn.net/images/quick_fill_button_LY_white.png
# Type D
https://account-center-fe.line-scdn.net/images/quick_fill_button_LINE_white.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_LINE_black.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_LINE_gray.png
https://account-center-fe.line-scdn.net/images/quick_fill_button_LINE_blue.png
```

---

# API: `liff.$commonProfile.get()`

Gets the information in the Common Profile that the user set in the Account
Center. Executing it shows a modal to confirm the user's profile; after
confirming, the user can tap **Auto-fill** and the profile information is
entered automatically.

### Syntax

```javascript
liff.$commonProfile.get(scopes, options);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `scopes` | Yes | Array of strings | The scope of the Common Profile to obtain (see the `scopes` table above). |
| `options` | No | Object | Options for getting Common Profile information. |
| `options.formatOptions` | No | Object | Format options. Specify a `formatOptions` object per scope. The key is the scope in **camelCase** (e.g. scope `given-name` → key `givenName`). |

`formatOptions` object properties: `excludeEmojis` (scopes `givenName`,
`familyName`), `excludeNonJp` (scope `tel`), `digitsOnly` (scope `postalCode`) —
all Boolean, default `true`.

### Return value

A `Promise` of type `{ data: Partial<CommonProfile>, error: Partial<CommonProfileError> }`.
On resolve, `data` holds the user's Common Profile info and `error` holds error
info.

`data` property values become `undefined` or `null`:

- **`undefined`** — the item is not in `scopes`, **or** the item is in `scopes`
  but the user did not authorize that item.
- **`null`** — the user has not set a value for the item, **or** an error
  occurred retrieving the item.

### Example

```javascript
const { data, error } = await liff.$commonProfile.get(
  ["family-name", "given-name", "email", "tel", "postal-code"],
  {
    formatOptions: {
      givenName: {
        excludeEmojis: false,
      },
      tel: {
        excludeNonJp: false,
      },
      postalCode: {
        digitsOnly: false,
      },
    },
  },
);
console.log(data);
console.log(error);
```

Example `Partial<CommonProfile>`:

```javascript
{
  "family-name": "Yamada",
  "given-name": "Taro",
  "email": "sample@example.com",
  "tel": "09001234567",
  "postal-code": "1020094"
}
```

Example `Partial<CommonProfileError>`:

```javascript
{
  "tel": ["Phone number has 12 or more digits"],
  "postal-code": ["Postal code contains non-numeric characters"]
}
```

### Error response

When the `Promise` is rejected, a [`LiffError`](https://developers.line.biz/en/reference/liff/#liff-errors)
is passed.

Calling the API without installing the plugin correctly:

```javascript
new Error(
  "LiffCommonProfilePlugin isn't installed properly. Did you call liff.use(new LiffCommonProfilePlugin()) before using it?"
);
```

Calling the API in a browser other than the LIFF browser:

```javascript
new Error("liff.$commonProfile API is available only in LIFF browser.");
```

---

# API: `liff.$commonProfile.getDummy()`

Gets dummy data for the Common Profile. There are 10 dummy datasets; select one
with `caseId`. Executing it shows a modal to confirm the dummy profile; tapping
**Auto-fill** gets the dummy data.

### Syntax

```javascript
liff.$commonProfile.getDummy(scopes, options, caseId);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `scopes` | Yes | Array of strings | The scope of the Common Profile to obtain. |
| `options` | No | Object | Options for getting Common Profile information. |
| `options.formatOptions` | No | Object | Format options per scope (key in camelCase). |
| `caseId` | Yes | number | The ID of the dummy data to get. Datasets with IDs `1`–`10` are available. |

### Return value

A `Promise` of type `{ data: Partial<CommonProfile>, error: Partial<CommonProfileError> }`.
On resolve, `data` holds the dummy Common Profile data and `error` holds error
info.

`data` property values become `undefined` or `null`:

- **`undefined`** — the item is not in `scopes`.
- **`null`** — the dummy data has no value for the item.

### Example

```javascript
const { data, error } = await liff.$commonProfile.getDummy(
  ["family-name", "given-name", "email", "tel", "postal-code"],
  {
    formatOptions: {
      givenName: {
        excludeEmojis: false,
      },
      tel: {
        excludeNonJp: false,
      },
      postalCode: {
        digitsOnly: false,
      },
    },
  },
  1,
);
console.log(data);
console.log(error);
```

Example `Partial<CommonProfile>`:

```javascript
{
  "family-name": "見本田",
  "given-name": "見本夫",
  "family-name-kana": "ダミータ",
  "given-name-kana": "ダミーオ",
  "sex-enum": 0,
  "bday-day": 12,
  "bday-month": 3,
  "bday-year": 1998,
  "tel": "09001234567",
  "email": "dummy_39@yahoo.co.jp",
  "postal-code": "1020094",
  "address-level1": "東京都",
  "address-level2": "千代田区",
  "address-level3": "紀尾井町1-2",
  "address-level4": "東京ガーデンテラス紀尾井町"
}
```

### Error response

Same as `liff.$commonProfile.get()` — a `LiffError` on rejection, with the same
"plugin not installed" and "not in LIFF browser" error messages.

---

# API: `liff.$commonProfile.fill()`

Automatically fills the form with the obtained Common Profile information. The
`data-liff-autocomplete` attribute links each profile item to a form field.

> The value of `data-liff-autocomplete` must match the scope of the obtained
> profile information (`family-name`, `tel`, `bday-year`, etc.). To fill a form
> after processing data into a different format (e.g. combining `bday-year` /
> `bday-month` / `bday-day` into `20110623`), use `document.getElementById().value`
> or `document.querySelector().value` instead — or pass a processed object to
> `fill()`.

### Syntax

```javascript
liff.$commonProfile.fill(profile);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `profile` | Yes | `Partial<CommonProfile>` | The profile information to auto-fill into the form. |

### Return value

None.

### Example — filling values as obtained

```javascript
// HTML
<input type="text" data-liff-autocomplete="family-name" />
<input type="tel" data-liff-autocomplete="tel" />
<select data-liff-autocomplete="sex-enum">
  <option value="0">男性</option>
  <option value="1">女性</option>
  <option value="2">回答なし</option>
  <option value="3">その他</option>
</select>

// JavaScript
const { data, error } = await liff.$commonProfile.get([
  "family-name",
  "tel",
  "sex-enum",
]);

liff.$commonProfile.fill(data);
```

### Example — filling processed values

```javascript
// HTML
<input type="text" data-liff-autocomplete="bday-year" />
<input type="text" data-liff-autocomplete="bday-month" />
<input type="text" data-liff-autocomplete="bday-day" />

// JavaScript
const { data, error } = await liff.$commonProfile.get([
  "bday-year",
  "bday-month",
  "bday-day",
]);

const year = data["bday-year"];
const month = data["bday-month"];
const day = data["bday-day"];

// If the month or day is one digit, pad with 0s to
const formattedMonth = month.toString().padStart(2, '0');
const formattedDay = day.toString().padStart(2, '0');

// Automatically fills the value after processing
liff.$commonProfile.fill({
  "bday-year": year,
  "bday-month": formattedMonth,
  "bday-day": formattedDay,
});
```
