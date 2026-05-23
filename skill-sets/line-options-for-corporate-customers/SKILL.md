---
name: line-options-for-corporate-customers
description: >-
  LINE "Options for corporate customers" (partner-docs) official reference at
  API-reference depth. Covers every partner / corporate-only LINE Platform
  feature, endpoint, request/response schema, scope, and webhook event. Use this
  skill whenever the task touches LINE corporate / partner features: LINE
  notification messages (template or flexible) — sending messages by phone
  number with /v2/bot/message/pnp/templated/push or /bot/pnp/push, the delivery
  completion webhook event, phone-number SHA256 hashing, X-Line-Delivery-Tag;
  the Module / module channel system — attaching a module channel via the
  OAuth 2.0 flow, manager.line.biz/module/auth, Chat Control (Acquire/Release
  Control API, Active/Standby Channel, Default Active), the Detach API,
  module-specific webhook events (attached / detached / activated / deactivated
  / botSuspended / botResumed), calling the Messaging API from a module channel
  with the bot-user-ID header; the Mission Sticker API (/shop/v3/mission);
  LINE Profile+ (real_name / gender / birthdate / phone / address scopes in the
  ID token); the Mark as read API (old) (/v2/bot/message/markAsRead); error
  notification emails; the provider page; LINE Beacon reception conditions;
  module channel scopes (message:send, message:receive, account:manage,
  message:mark_as_read, message:templated_pnp, profile:read, coupon:manage,
  crm:manage); and the development guidelines / LINE API Policy Handbook for
  corporate customers. Trigger on mentions of: LINE partner-docs, options for
  corporate customers, LINE notification messages, pnp/push, mission sticker,
  module channel, Chat Control, Acquire Control, LINE Profile+, mark as read
  API, error notification, provider page, LINE Beacon, LINE Marketplace,
  Default Active, attach/detach module, developers.line.biz/docs/partner-docs,
  developers.line.biz/reference/partner-docs, reference/line-notification-messages.
---

# LINE Options for Corporate Customers Reference

API-reference-level coverage of the LINE "Options for corporate customers"
section (also called **partner-docs**), extracted from the official documentation
at `https://developers.line.biz/en/docs/partner-docs/` and the two API reference
pages `https://developers.line.biz/en/reference/partner-docs/` and
`https://developers.line.biz/en/reference/line-notification-messages/`.

These are **optional functions** layered on top of a normal LINE Official Account
/ Messaging API channel. **Read the reference file that matches the task — do not
guess endpoint paths, parameter names, scope strings, or JSON shapes.**

## When this skill applies

Any work on a LINE corporate / partner feature that a regular Messaging API
project cannot do on its own:

- Sending **LINE notification messages** to a user by phone number (template or
  flexible variant), handling the delivery completion webhook event.
- Building or integrating a **module channel** — attaching it to a LINE Official
  Account, OAuth 2.0 authorization, Chat Control, calling the Messaging API from a
  module channel, handling module-specific webhook events.
- Granting **mission stickers**, reading **LINE Profile+** data, using the **Mark
  as read API (old)**, configuring **error notification**, a **provider page**, or
  understanding **LINE Beacon** reception conditions.

Works for raw HTTP calls (`curl`, `fetch`, `axios`, `requests`). These endpoints
are partner-only and are **not** part of `@line/bot-sdk`'s standard surface — call
them directly. For the underlying Messaging API (message objects, common webhook
properties, rich menus, signature validation), use the separate `line-message-api`
skill.

## Hard prerequisite: a corporate-customer application

**Every feature in this section requires that the corporate user has submitted the
required application to LINE.** Without it, the endpoints return `403` ("Access to
this API is not available for your account"). Applications go through a LINE sales
representative or LINE Sales partners (`https://www.lycbiz.com/jp/partner/sales/`);
the Module feature goes through the LINE Marketplace
(`https://line-marketplace.com/jp/inquiry`). Some features have extra limits:
LINE notification messages work only on LINE Official Accounts created in **Japan,
Thailand, Taiwan**; **LINE Profile+** is for corporate users in **Japan** only.

## Domain names — pick the right one

| Domain | Used by |
|---|---|
| `api.line.me` | Mission Sticker API, Mark as read API, Detach API, Acquire/Release Control API, Get bot list, both LINE notification messages send + count endpoints |
| `manager.line.biz` | Module attach token API (`/module/auth/v1/token`), and the module authorization URL (`/module/auth/v1/authorize`) |

OAuth-style token endpoints for LINE Login (used by LINE Profile+) live on
`api.line.me` under `/oauth2/v2.1/...`.

## Reference file map

| File | Contents |
|---|---|
| `references/overview-and-guidelines.md` | Section overview; common API specs (status codes, `x-line-request-id`, error responses); development guidelines for corporate customers (webhook reception, sending API requests, channel access token issuance limits, LINE Login, LIFF, stickers/emojis); LINE API Policy Handbook; the full notice / changelog with deprecations and breaking changes |
| `references/line-notification-messages.md` | LINE notification messages: the two variants (template vs. flexible), conditions for sending, phone-number SHA256 hashing, templates/items/buttons; **API reference** — Send (template) `/v2/bot/message/pnp/templated/push`, Get count (template), Send (flexible) `/bot/pnp/push`, Get count (flexible); the Webhook delivery completion event; the five user reception flows; behavior/gotchas/billing |
| `references/module.md` | Module channel: concept, Chat Control (Active/Standby Channel, Default Active), the OAuth 2.0 attach flow + authorization URL parameters, the full **scope → endpoint** table; **API reference** — Attach token API, Detach API, Acquire/Release Control API, Get bot list; the six module-specific webhook events; using the Messaging API from a module channel (token types, the bot-user-ID header, `mode`/`destination` properties); module channel console settings |
| `references/corporate-features.md` | Error notification (email types & content); provider page (settings, URL, common-use-of-user-IDs terms); **Mission Sticker API** reference (`/shop/v3/mission` + error messages); **LINE Profile+** (scopes, ID-token payload, address object); **LINE Beacon** reception conditions (iOS/Android, banner display); **Mark as read API (old)** reference (`/v2/bot/message/markAsRead`) |

## Quick endpoint index

```
# LINE notification messages
POST  https://api.line.me/v2/bot/message/pnp/templated/push     Send LINE notification message (template)  → 202
GET   https://api.line.me/v2/bot/message/delivery/pnp/templated Get count of sent (template)   (?date=yyyyMMdd)
POST  https://api.line.me/bot/pnp/push                          Send LINE notification message (flexible)  → 200
GET   https://api.line.me/v2/bot/message/delivery/pnp           Get count of sent (flexible)   (?date=yyyyMMdd)
      Webhook event "delivery"  — delivery completion event (delivery.data = hashed phone / X-Line-Delivery-Tag)

# Mission Sticker API
POST  https://api.line.me/shop/v3/mission                       Provide mission stickers to the users  → 200

# Mark as read API (old)
POST  https://api.line.me/v2/bot/message/markAsRead             Mark messages from users as read  → 200

# Module
POST  https://manager.line.biz/module/auth/v1/token             Attach module channel (exchange auth code)  → 200
POST  https://api.line.me/v2/bot/channel/detach                 Detach module channel  → 200
POST  https://api.line.me/v2/bot/chat/{chatId}/control/acquire  Acquire Control (Chat Control)  → 200
POST  https://api.line.me/v2/bot/chat/{chatId}/control/release  Release Control (Chat Control)  → 200
GET   https://api.line.me/v2/bot/list                           Get list of bots the module is attached to  (?limit=&start=)
      Module authorization URL:  https://manager.line.biz/module/auth/v1/authorize?response_type=code&...
      Module webhook events: module(attached) / module(detached) / activated / deactivated / botSuspended / botResumed

# LINE Profile+  (no dedicated endpoint — data arrives inside the LINE Login / LIFF ID token)
      scopes: real_name, gender, birthdate, phone, address  (+ openid)
```

## Key facts and gotchas

- **403 = no application.** Almost every endpoint here returns `403` ("Access to
  this API is not available for your account") unless the corporate-customer
  application was completed for that feature.
- **LINE notification messages do NOT support retry keys.** `X-Line-Retry-Key` is
  unsupported on `pnp` endpoints. `X-Line-Delivery-Tag` is a different header — an
  optional 16–100-char tag echoed back in the delivery completion event's
  `delivery.data`.
- **`to` for `pnp` endpoints is a SHA256 hash** of an E.164 phone number
  (`+818000001234`, no hyphens), lowercase hex. Not a user ID.
- **Send (template) returns `202`; Send (flexible) returns `200`.** Both can
  return `200`/`202` even when the user has blocked the account or hasn't
  consented — success ≠ delivered. Real delivery is signalled by the **delivery
  completion event** webhook (no event within 24h ⇒ not delivered).
- **The `source` property was removed** from the LINE notification messages
  delivery completion event (as of 2025/01/28). Don't expect `source.userId` on a
  `delivery` event.
- **Module channels: webhooks go to every attached channel at once.** Check the
  `mode` property — only the `active` channel may reply; `standby` events have **no
  `replyToken`**. Check `destination` to know which LINE Official Account it came
  from.
- **Module channel user IDs are 68 chars starting with `L`** (e.g.
  `LUb577...-U5fac33...`), distinct from the 33-char `U[0-9a-f]{32}` Messaging API
  user ID, and different per LINE Official Account for the same person.
- **Calling the Messaging API from a module channel needs the bot-user-ID
  header** in addition to the module channel's `Authorization` token. The header's
  exact name is disclosed only to LINE Marketplace participants.
- **Long-lived channel access tokens can't be used by module channels.** Use
  short-lived, user-specified-expiration (v2.1), or stateless tokens.
- **Module scope determines available endpoints** — granted at attach time via the
  authorization URL `scope` parameter (URL-encode `:` as `%3A`, join multiple with
  `%20`). See the scope table in `references/module.md`.
- **Default Active** (LINE Marketplace module channels) means the module channel
  auto-becomes the Active Channel on attach — Acquire/Release Control APIs are then
  optional and only for unexpected initiative changes. Only one Default Active
  module channel per LINE Official Account.
- **Mark as read API (old) is superseded** — new applications stop at the end of
  October 2026; for new work use the Messaging API's "Mark messages as read"
  endpoint. Using the old API disables the account's automatic-read and chat
  functions.
- **Audience match API is fully removed** (discontinued 2023/10/31) — including
  sending messages by phone number / mobile advertising ID via that API. LINE
  notification messages is the current way to message by phone number.
- **LINE Profile+ has no REST endpoint** — request the `real_name` / `gender` /
  `birthdate` / `phone` / `address` scopes (each pre-applied) plus `openid`, then
  read the data from the verified ID token payload.
