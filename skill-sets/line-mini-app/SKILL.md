---
name: line-mini-app
description: >-
  LINE MINI App official documentation at API-reference depth. Covers the
  complete LINE MINI App platform: building a web app that runs inside the LINE
  app as a LIFF app, the LINE MINI App channel and its three internal channels
  (Developing / Review / Published), the verification review that turns an
  unverified MINI App into a verified MINI App, and every LINE MINI App API.
  Use this skill whenever the task touches LINE MINI App: creating a LINE MINI
  App channel, configuring it in the LINE Developers Console, the built-in
  action button / dropdown menu / multi-tab view, implementing a custom action
  button with Flex Message share messages and the share target picker, sending
  service messages, Channel consent simplification and the authorization flow,
  Common Profile Quick-fill, in-app purchase (IAP), Custom Path, permanent
  links, adding a shortcut to the home screen, opening a LINE MINI App in an
  external browser, handling payments (LINE Pay / IAP), the verified-badge
  review and submission flow, or placing ads. Covers every LINE MINI App API
  endpoint and method: the Service Message API (issue a service notification
  token at message/v3/notifier/token, send a service message at
  message/v3/notifier/send), the Common Profile Quick-fill LIFF plugin
  (liff.$commonProfile.get / getDummy / fill, LiffCommonProfilePlugin,
  @line/liff-common-profile-plugin), and in-app purchase (liff.iap.
  getPlatformProducts / requestConsentAgreement / createPayment, the Reserve
  purchase endpoint iap/v1/product/reserve, the Get webhook event history
  endpoint iap/v1/webhook/events, the purchaseComplete and refundComplete
  webhook events). Trigger on mentions of: LINE MINI App, miniapp.line.me, LIFF
  ID, LIFF URL, liff.line.me, developers.line.biz/docs/line-mini-app,
  developers.line.biz/reference/line-mini-app, service notification token,
  notificationToken, service message template, channel consent simplification,
  Quick-fill, $commonProfile, liff.iap, productId, orderId, in-app purchase,
  verified MINI App, unverified MINI App, LINE Developers Console MINI App
  channel, custom action button, permanent link of a LINE MINI App,
  createShortcutOnHomeScreen, LY Corporation verification review.
---

# LINE MINI App Reference

API-reference-level coverage of the LINE MINI App platform, extracted from the
official documentation at `https://developers.line.biz/en/docs/line-mini-app/`
and the API reference at `https://developers.line.biz/en/reference/line-mini-app/`.

A **LINE MINI App** is a web application that runs inside the LINE app. It is a
[LIFF](https://developers.line.biz/en/docs/liff/overview/) app added to a
**LINE MINI App channel**, with LINE-MINI-App-specific requirements, restrictions,
and APIs layered on top. Most of the front-end runtime is the plain LIFF SDK —
this skill covers only the parts that are *specific to LINE MINI App*. For the
generic LIFF API (`liff.init()`, `liff.getProfile()`, `liff.sendMessages()`,
`liff.getAccessToken()`, etc.) consult LIFF documentation.

The docs are split here into topic-scoped reference files. **Read the reference
file that matches the task — do not guess endpoint paths, method signatures,
scope names, or JSON shapes.**

## When this skill applies

Any work on a LINE MINI App: creating and configuring the channel, developing
the LIFF app under LINE MINI App rules, the built-in action button, sharing
pages with custom Flex Message share messages, sending service messages,
Channel consent simplification, Common Profile Quick-fill, in-app purchase,
Custom Path, permanent links, home-screen shortcuts, external-browser support,
payments, the verification review, ads. Works for raw HTTP calls (`curl`,
`fetch`, `axios`, `requests`) for the server-side APIs and for the LIFF SDK +
LIFF plugins on the client side.

## Core mental model

| Concept | What it means |
|---|---|
| LINE MINI App = LIFF app | Built with the LIFF SDK (min v2.1). LINE MINI App adds requirements/restrictions and three extra APIs (Service Message, Quick-fill, IAP). |
| LINE MINI App channel | One channel per LINE MINI App, created in the LINE Developers Console. Internally it is **three** channels: Developing, Review, Published — each with its own LIFF ID and Endpoint URL. |
| Unverified vs verified | New channels are unverified MINI Apps. Passing LY Corporation's verification review makes them verified MINI Apps and unlocks features (service messages, Custom Path, Quick-fill, home-screen shortcut, channel consent simplification, verified badge). |
| LIFF URL | `https://miniapp.line.me/{liffId}` (since 2023-12-13; old `https://liff.line.me/{liffId}` still opens). Each internal channel has a distinct LIFF ID. |
| Permanent link | `LIFF URL + (page URL − Endpoint URL)` — used to share/deep-link a specific LINE MINI App page. |
| Channel access token | LINE MINI App channels can use **only** stateless tokens or short-lived tokens — never long-lived or v2.1. Stateless is recommended. |

## Reference file map

| File | Contents |
|---|---|
| `references/overview-and-console.md` | What a LINE MINI App is, built-in features (action button / dropdown menu / multi-tab view), custom features, UI components (header / body), the three internal channels, LINE Developers Console guide, creating a LINE MINI App channel, channel-setting → user-facing-screen mapping, LINE MINI App vs native apps, quickstart, web-app-to-MINI-App migration |
| `references/develop.md` | Develop overview, specifications & supported environment, development guidelines (mass-request ban, log saving, deauthorization), Channel consent simplification & the authorization flow, Custom Path, permanent links, add shortcut to home screen, opening in an external browser, handling payments (LINE Pay / IAP), performance guidelines, basic authentication |
| `references/custom-action-button-and-flex.md` | Implementing a custom action button, the share target picker, the standard-type and image-list-type custom share message Flex Message structures with full component property tables, and the two complete example JSON files |
| `references/service-messages.md` | Service messages concept, flow, templates, character limits — plus the **Service Message API** reference: Issue a service notification token, Send a service message (request headers/body, response, errors, examples) |
| `references/quick-fill.md` | Common Profile Quick-fill overview, the LIFF plugin (`LiffCommonProfilePlugin`, `@line/liff-common-profile-plugin`), scopes & return values, dummy data, design regulations & Auto-fill button rules — plus the **client API** reference: `liff.$commonProfile.get()` / `getDummy()` / `fill()` |
| `references/in-app-purchase.md` | In-app purchase overview, conditions, IAP development guidelines, applying & setting up IAP, the full implementation flow and test payments — plus the **IAP API** reference: client methods (`liff.iap.getPlatformProducts/requestConsentAgreement/createPayment`), server endpoints (Reserve purchase, Get webhook event history), webhook events (purchaseComplete, refundComplete), the product ID list |
| `references/submit-service-and-demos.md` | Submitting a LINE MINI App for verification review, the review process and status flow, re-review after updating a verified MINI App, running your service, conditions for service messages, ads, using a LINE Official Account, design specs (icon, safe area, loading icon), demo apps and technical case studies |

## Quick API index

LINE MINI App has **three** distinct API surfaces. The generic LIFF API is separate.

```
SERVICE MESSAGE API (server-side; verified MINI Apps only)
POST  https://api.line.me/message/v3/notifier/token              Issue a service notification token
POST  https://api.line.me/message/v3/notifier/send?target=service Send a service message

COMMON PROFILE QUICK-FILL (client-side LIFF plugin; verified MINI Apps only)
liff.$commonProfile.get(scopes, options)        Get the user's Common Profile (shows confirm modal)
liff.$commonProfile.getDummy(scopes, options, caseId)  Get dummy Common Profile data (caseId 1-10)
liff.$commonProfile.fill(profile)               Auto-fill a <form> via data-liff-autocomplete attrs

IN-APP PURCHASE — client (LIFF SDK; verified MINI Apps, Japan only)
liff.iap.getPlatformProducts({ productIds })    Get localized price/currency/name for product IDs
liff.iap.requestConsentAgreement()              Request consent to the LINE IAP Terms of Use
liff.iap.createPayment({ productId, orderId })  Launch the App Store / Google Play payment sheet

IN-APP PURCHASE — server (verified MINI Apps, Japan only)
POST  https://api.line.me/iap/v1/product/reserve   Reserve a purchase → returns orderId
GET   https://api.line.me/iap/v1/webhook/events    Get webhook event history (cursor pagination)

IN-APP PURCHASE — webhook events delivered to your server
purchaseComplete   Payment settled by LY Corporation — grant the item
refundComplete     A purchase was refunded
```

## Working rules

- **A LINE MINI App channel is three channels.** Always issue a separate channel
  access token, set a separate Endpoint URL, and pass the matching LIFF ID to
  `liff.init()` for each of Developing / Review / Published. Mixing them is the
  most common failure.
- **Verified-only features.** Service messages, Custom Path, Quick-fill,
  home-screen shortcut (`liff.createShortcutOnHomeScreen()`), and Channel
  consent simplification require a verified MINI App. Unverified MINI Apps can
  only test these on the internal channels for Developing and Review.
- **Token types.** LINE MINI App channels cannot use long-lived or v2.1 channel
  access tokens — use stateless (recommended, unlimited issuance, 15 min) or
  short-lived (30 days) tokens.
- **Service notification token.** Issued from a LIFF access token; one per LIFF
  access token; valid 1 year; lets you send up to 5 service messages for one
  user action. Every send returns a *renewed* token in the response — save it
  for the next message in the sequence.
- **Service messages are confirmation/response only.** No ads, promotions,
  coupons, or event notices — violating this gets the API suspended.
- **IAP: grant items only on the `purchaseComplete` webhook.** A successful
  Reserve purchase does *not* guarantee payment. Dedupe by `orderId` (webhooks
  may arrive multiple times) and verify the `x-line-signature` (HMAC-SHA256 of
  the raw body keyed by the channel secret).
- **External browser.** Since Oct 2025 LINE MINI Apps also run in external
  browsers. `liff.init()` does not auto-login there — use
  `withLoginOnExternalBrowser: true` or call `liff.login()` explicitly.
  `liff.sendMessages()`, `liff.openWindow()`, `liff.closeWindow()`, and
  `liff.iap.*` do not work in an external browser.
- **Custom share messages must be a single Flex `bubble`** (never a carousel)
  and must follow the exact component structure in the guidelines.
- Save logs of Service Message API requests yourself — LY Corporation does not
  provide them.
