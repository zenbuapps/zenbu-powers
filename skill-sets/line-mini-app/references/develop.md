# Developing a LINE MINI App

Source:
- `https://developers.line.biz/en/docs/line-mini-app/develop/develop-overview/`
- `https://developers.line.biz/en/docs/line-mini-app/development-guidelines/`
- `https://developers.line.biz/en/docs/line-mini-app/discover/specifications/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/channel-consent-simplification/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/custom-path/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/permanent-links/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/add-to-home-screen/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/external-browser/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/payment/`
- `https://developers.line.biz/en/docs/line-mini-app/develop/performance-guidelines/`

## Table of contents

- Specifications & supported environment
- Development guidelines (mass requests, logs, deauthorization)
- Basic authentication for pre-release access
- Channel consent simplification & the authorization flow
- Custom Path
- Permanent links
- Add a shortcut to the home screen
- Opening a LINE MINI App in an external browser
- Handling payments (LINE Pay / IAP / other)
- Performance guidelines

---

## Specifications & supported environment

- **HTML5**: almost any HTML5 spec is usable (e.g. the Geolocation API for
  nearby-shop features; most Map APIs incl. Google Maps API). Supported media
  formats follow the HTML5 `img` and media element specs.
- **Supported platforms / OS / LINE versions**: based on LIFF's
  [Recommended operating environment](https://developers.line.biz/en/docs/liff/overview/#operating-environment).
  Supported versions can change without notice.
- **Supported LIFF versions**: minimum LIFF SDK is **v2.1**; all LIFF v2.1.x
  APIs are usable. (Feature minimums: Channel consent simplification v2.13.x+,
  Quick-fill v2.19.0+, IAP v2.26.0+.)
- **External browser**: when a non-LINE user, or a LINE user where deep links
  fail, opens a LINE MINI App in an external browser, a landing page guides
  them to open it in the LIFF browser; tapping **Open in web browser** shows
  the LIFF endpoint URL page.

### Recommendations for development

- Use the HTML5 Geolocation API for locating users.
- Use the user's LINE profile (via the LIFF API) to pre-fill forms.
- Optimize performance (see Performance guidelines below).

## Development guidelines

LINE MINI App uses LIFF, so also follow the
[LIFF app development guidelines](https://developers.line.biz/en/docs/liff/development-guidelines/).
Basic rules are based on [Terms and Policies](https://developers.line.biz/en/terms-and-policies/).

### Prohibiting mass requests to the LINE Platform

Do not over-access LINE MINI Apps via the LIFF scheme
(`https://miniapp.line.me/{liffId}`) or send a large number of requests to the
LIFF API or Service Message API for load testing. Prepare a test environment
that does not generate mass requests. Exceeding the rate limit returns
`429 Too Many Requests`.

### Saving logs

Save Service Message API request logs yourself (LY Corporation does not provide
them). Recommended fields, in addition to the `notificationToken` returned in
the response:

- Time the API request was made
- Request method
- API endpoint
- Status code returned by the LINE Platform

Log file format example:

| Time when API request was made | Request method | API endpoint | Status code |
|---|---|---|---|
| Mon, 16 Jul 2021 10:20:23 GMT | POST | `https://api.line.me/message/v3/notifier/send?target=service` | 200 |

Optionally also store the request body and the response body (other than the
`notificationToken`).

### Deauthorize your app when a user unregisters

When a user unregisters from your LINE MINI App or terminates the link between
your app and the LINE app:

1. Deauthorize the granted permissions on the user's behalf via the
   [Deauthorize your app](https://developers.line.biz/en/reference/line-login/#deauthorize)
   endpoint.
2. Document near the relevant feature, or in the terms the user agrees to, what
   happens on unregister/unlink — e.g. "If you unsubscribe from the service, LY
   Corporation will be notified and the link between the service and LINE app
   will be terminated."

An authorized app appears in **Settings** > **Account** > **Authorized apps** in
the LINE app — deauthorize it so permissions don't linger after unregister.

## Basic authentication for pre-release access

Basic authentication restricts access to a pre-publishing LINE MINI App.

- Available when **all** are true: status is "Not yet reviewed" or "Reviewing";
  the LINE MINI App is opened in the LIFF browser.
- In the **Web app settings** tab, set a URL with basic auth as the **Endpoint
  URL** for Developing or Review. Opening the LINE MINI App in the LIFF browser
  shows a username/password dialog.
- Not available for LIFF apps or LINE MINI Apps whose status is "Reflected".
  Digest authentication is not supported. Not available after a LIFF-to-LIFF
  transition.
- Developers must judge for themselves whether basic auth meets their security
  requirements — it is for simple access restriction and its security is not
  guaranteed.

## Channel consent simplification & the authorization flow

For a LIFF app to get user info or send messages, users must consent to the
relevant permissions on the channel consent screen on first access. The
**Channel consent simplification** feature lets users consent once on a
simplification screen; afterward the channel consent screen is skipped for
other LINE MINI Apps on first access.

Per LY Corporation's privacy policy, **only the `openid` scope** (getting the
[user ID](https://developers.line.biz/en/glossary/#user-id)) is skipped by
simplification. Permissions for user profile info or sending messages (the
`profile` and `chat_message.write` scopes) are **not** included — for those, a
verification screen is shown within each LINE MINI App when the permission is
needed.

For **new LINE MINI App channels in Japan**, Channel consent simplification is
**always enabled** (as of 2026-01-08).

> If your LINE MINI App calls the LINE Login API with an access token or ID
> token from the LIFF SDK, simplification can change behavior. E.g. if you call
> the [Verify ID token](https://developers.line.biz/en/reference/line-login/#verify-id-token)
> endpoint and use the profile to create a service account, the ID token payload
> won't include profile info (the `profile` scope consent is skipped). Before
> getting an access/ID token, display the verification screen using
> `liff.permission.query()` and `liff.permission.requestAll()`.

### Setup conditions

Channel consent simplification can be configured only if **all** are true:

- **Region to provide the service** is "Japan".
- Channel status is "Not yet reviewed".

For channels created **before 2026-01-08**, enable it via the toggle in the
**Channel consent simplification** section of the **Web app settings** tab.
Enabling it auto-enables `openid` in the Scope section. For channels created
**on/after 2026-01-08**, it is always enabled — no configuration needed.

### Operating conditions

For the feature to work, **all** must be true:

- The LINE MINI App is a verified MINI App (for unverified MINI Apps it works
  only on Developing and Review internal channels).
- LIFF SDK version is **v2.13.x or later**.
- The LINE MINI App is not opened via a LIFF-to-LIFF transition.

### Authorization flow (simplification enabled)

Two steps:

**1. Request `openid` on the simplification consent screen.** On first access,
the simplification consent screen asks whether to allow getting the user ID.
Tapping **Agree** shows a loading screen, then the app starts; the user is also
considered to consent to other LINE MINI Apps getting their user ID — so the
channel consent screen is skipped for them.

> Behavior when tapping **Not now**: simplification consent is skipped; the
> simplification screen stops appearing for 24 hours. While skipped, the
> per-app channel consent screen is shown for each LINE MINI App.

**2. Request other scopes on the verification screen.** When a method needing a
scope other than `openid` runs, the verification screen shows the requested
permissions.

| Scope | Method |
|---|---|
| `email` | `liff.getIDToken()`, `liff.getDecodedIDToken()` |
| `profile` | `liff.getProfile()`, `liff.getFriendship()` |
| `chat_message.write` | `liff.sendMessages()` |

Display the verification screen anytime with `liff.permission.query()` and
`liff.permission.requestAll()`:

```javascript
liff.permission.query("profile").then((permissionStatus) => {
  if (permissionStatus.state === "prompt") {
    liff.permission.requestAll();
  }
});
```

> The verification screen first appears when a non-`openid` scope is needed —
> not on first launch. If you call `liff.getProfile()` etc. immediately after
> launch, it looks as if the consent screen was not skipped. Execute
> non-`openid` requests only when actually needed.

### Authorization flow (simplification disabled)

On first access the **channel consent screen** lists the requested permissions;
tapping **Allow** starts the app.

### Behavior by whether the user consented to simplification

| LINE MINI App | User consented to simplification | User did not consent |
|---|---|---|
| Simplification **enabled** | Channel consent screen skipped | Channel consent screen shown |
| Simplification **disabled** | Channel consent screen shown | Channel consent screen shown |

### Channel consent simplification + add-friend option

You can prompt users to add your LINE Official Account via the
[add-friend option](https://developers.line.biz/en/docs/line-mini-app/service/line-mini-app-oa/#link-a-line-official-account-with-your-channel)
from the verification screen or channel consent screen. But if **only**
`openid` is in the Scope section, enabling simplification prevents the
verification and channel consent screens from appearing — so the add-friend
option cannot prompt. To use both together, specify scopes other than `openid`
so the verification screen is shown. You can also call `liff.requestFriendship()`
to show a subwindow at any time.

## Custom Path

Custom Path (**verified MINI Apps only**) is a unique string set in the LIFF URL
of the Published channel.

| Example URL with LIFF ID | Example with Custom Path |
|---|---|
| `https://miniapp.line.me/123456-abcdefg` | `https://miniapp.line.me/cony_coffee` |

The URL by LIFF ID still works after a Custom Path is set.

### How to apply

- **Japan**: apply via the [application form](https://form-business.yahoo.co.jp/claris/enqueteForm?inquiry_type=lmini-custompath).
  Notification by email; 1–2 weeks from application until the Custom Path URL is
  usable.
- **Taiwan / Thailand**: contact your sales representative.

### Notes

- The LIFF URL with the Custom Path is **not** shown in the LINE Developers
  Console.
- You can apply before the review, but the Custom Path is set only after the
  LINE MINI App passes review.
- In principle, once set a Custom Path **cannot be changed**.

### String rules for a Custom Path

- 4–29 characters.
- Only single-byte alphanumeric (`a-z`, `0-9`) and underscore (`_`).
- Underscore cannot be the last character.
- Cannot be numeric-only.
- No spaces.
- Must include a proper noun identifying the brand/service.
- Cannot match strings used by LY Corporation services.
- Cannot match strings already in use (including by others).
- Strings deemed inappropriate may be rejected.

## Permanent links

Users access LINE MINI Apps via LIFF URLs or **permanent links**. Use permanent
links (not LIFF URLs) for sharing a LINE MINI App page.

When you share a page from the header action button, LINE auto-generates a
permanent link. Otherwise, build it yourself:

```
LIFF URL + (LINE MINI App page URL − Endpoint URL) = Permanent Link
```

Example:

| Item | Value |
|---|---|
| LIFF URL | `https://miniapp.line.me/123456-abcedfg` |
| LINE MINI App page URL | `https://example.com/shop?search=shoes#item10` |
| Endpoint URL | `https://example.com` |

Resulting permanent link:

```
https://miniapp.line.me/123456-abcedfg/shop?search=shoes#item10
```

You can use a raw path, query parameters, and hash fragments. LIFF URL and
Endpoint URL are on the **Web app settings** tab.

### Domain by LINE app version

When sharing from the header action button, the permanent link domain depends
on the LINE app version:

| LINE app version | Generated URL |
|---|---|
| 13.20 or later | `https://miniapp.line.me/{liffId}` |
| Earlier than 13.20 | `https://liff.line.me/{liffId}` |

### If the user doesn't have LINE installed

A user with LINE is taken directly to the page. A user without LINE gets a web
browser encouraging them to open the LINE MINI App in LINE; they can also open
the LIFF endpoint URL page in a browser.

## Add a shortcut to the home screen

**Verified MINI Apps only** (unverified MINI Apps can test on Developing/Review).

The user adds a shortcut to your LINE MINI App to their device's home screen by
tapping **Add to Home** in the action-button dropdown menu, or by your calling
[`liff.createShortcutOnHomeScreen()`](https://developers.line.biz/en/reference/liff/#create-shortcut-on-home-screen).
Either shows the Add Shortcut screen; following its instructions adds the
shortcut. Good for frequently used services (membership cards, mobile ordering).

> On some Android devices, changing the LINE app icon from **Settings** > **App
> icon** can remove existing shortcuts.

### Operating conditions (iOS)

For **Add to Home** and `liff.createShortcutOnHomeScreen()` to work on iOS:

| Default browser | iOS version | Works? |
|---|---|---|
| Safari | All versions | Works |
| Chrome | 16.4 or later | Works |
| Other than Safari/Chrome | 16.4 or later | Not guaranteed |
| Other than Safari | Earlier than 16.4 | Does not work |

In a non-working environment, tapping **Add to Home** or calling the method
shows an error page.

## Opening a LINE MINI App in an external browser

As of October 2025 all LINE MINI App users can use the service in an external
browser. Make sure your LINE MINI App works when the endpoint URL is opened in
an [external browser](https://developers.line.biz/en/glossary/#external-browser).

### Explicitly handle LINE Login

In an external browser, `liff.init()` alone does **not** run LINE Login. If your
service needs LINE Login, run it explicitly:

**1. Auto-login at init** — set `withLoginOnExternalBrowser: true`:

```js
liff
  .init({
    liffId: "1234567890-AbcdEfgh", // Use own liffId
    withLoginOnExternalBrowser: true, // Enable automatic login process
  })
  .then(() => {
    // Start to use liff's api
  });
```

**2. Login when not logged in** — check `liff.isLoggedIn()`, then `liff.login()`:

```js
if (!liff.isLoggedIn()) {
  liff.login();
}
```

### Features that don't work in an external browser

These are not available / not guaranteed in an external browser — direct users
to open the LINE MINI App in the LINE app:

- `liff.sendMessages()`
- `liff.openWindow()`
- `liff.closeWindow()`
- `liff.scanCode()` (deprecated)
- `liff.iap.*` (in-app purchase)

Use `liff.getContext()` and `liff.isInClient()` to detect the environment and
adjust the display. Recommended: place a link to the LINE MINI App with text
"To use this feature, you must open the LINE MINI App in LINE app".

### Support for non-LINE users

LIFF API properties/methods usable **without LINE Login** in an external
browser: `liff.id`, `liff.ready`, `liff.init()`, `liff.getOS()`,
`liff.getAppLanguage()`, `liff.getLanguage()` (deprecated), `liff.getVersion()`,
`liff.getLineVersion()`, `liff.isInClient()`, `liff.isLoggedIn()`,
`liff.permanentLink.createUrlBy()`, `liff.use()`.

## Handling payments

Payment systems available on LINE MINI Apps vary by region:

| Payment method | Japan | Taiwan | Thailand |
|---|:-:|:-:|:-:|
| LINE Pay | ❌ | ✅ | ✅ |
| In-app purchase for the LINE MINI App | ✅ | ❌ | ❌ |
| Other methods | ✅ | ✅ | ✅ |

> The LINE Pay service in Japan was terminated on 2025-04-30. LINE Pay in Taiwan
> and Thailand remains available.

### LINE Pay

1. Get a **LINE Pay Merchant Account** (apply on the LINE Pay official website).
2. Integrate LINE Pay — see the [Online payment documentation](https://developers-pay.line.me/online)
   in LINE Pay Developers.
3. Flow: user starts a transaction → LINE Pay payment process launches → user
   confirms and authenticates in LINE Pay → order confirmation page is shown.
4. Test with the [LINE Pay sandbox](https://developers-pay.line.me/sandbox).

### In-app purchase

Lets users buy digital content within a LINE MINI App; payment via App Store /
Google Play. Currently **Japan only**. See `in-app-purchase.md`.

### Other payment methods

Implement as on ordinary web pages. You **must** design the flow so users are
redirected back to your LINE MINI App page after completing a transaction on an
external domain/app.

## Performance guidelines

Take LINE MINI App performance into account. Recommended measurement tools:
[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) and
[PageSpeed Insights](https://pagespeed.web.dev/).

| Tool | Recommended score |
|---|---|
| Lighthouse | Performance: 50 and above |

- Measure **without** executing LINE Login (LINE Login would have its own page
  measured instead).
- Measure in the **production** environment; the network environment affects
  the score.
