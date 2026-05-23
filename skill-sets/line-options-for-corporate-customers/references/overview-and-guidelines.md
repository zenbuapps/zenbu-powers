# Overview, Development Guidelines & API Policy

Source:
- `https://developers.line.biz/en/docs/partner-docs/overview/`
- `https://developers.line.biz/en/docs/partner-docs/development-guidelines/`
- `https://developers.line.biz/en/docs/partner-docs/api-policy-handbook/`
- `https://developers.line.biz/en/docs/partner-docs/notice/`
- `https://developers.line.biz/en/reference/partner-docs/` (Common specifications)

## Table of contents

- Overview of the optional functions
- Common API specifications for the section
- Development guidelines: webhook reception, sending API requests, channel access tokens, LINE Login, LIFF, stickers/emojis
- LINE API Policy Handbook
- Notice / changelog (deprecations and breaking changes)

---

# Overview

This section ("Options for corporate customers", a.k.a. partner-docs) documents
**optional functions** for corporate users on the LINE Platform. **Only corporate
users who have submitted the required applications can use them.** To use these
functions with your LINE Official Account, contact your LINE sales representative
or LINE Sales partners (`https://www.lycbiz.com/jp/partner/sales/`).

The optional functions:

| Function | What it does | Skill reference file |
|---|---|---|
| Error notification | If the bot server returns an error when the LINE Platform sends webhook events, a channel administrator is notified by email. | `corporate-features.md` |
| Provider page | A list of all the services a Provider offers on the LINE Platform. | `corporate-features.md` |
| Mission Sticker API | Mission stickers provided to a user upon completion of certain objectives. | `corporate-features.md` |
| LINE notification messages | Send messages to users by specifying their phone number, even without knowing their user IDs. | `line-notification-messages.md` |
| LINE Profile+ | Obtain user data (name, gender, birthdate, phone, address) registered in LINE Profile+ via LINE Login / LIFF / LINE MINI App. | `corporate-features.md` |
| LINE Beacon | Conditions for receiving LINE Beacon. | `corporate-features.md` |
| Module | Extensions provided by the LINE Marketplace — a module channel adds advanced Messaging API features to a LINE Official Account that hasn't opened a Messaging API channel. | `module.md` |
| Mark as read API (old) | Display "Read" on all messages sent from a specific user. (Old API; new implementations should use the Messaging API's "Mark messages as read".) | `corporate-features.md` |

This section is split on the LINE Developers site into the documentation pages
and two **API reference** pages — the "Options for corporate customers API
reference" (`/en/reference/partner-docs/`, covering Mission Sticker API, Mark as
read API, and Module) and the "LINE notification messages API reference"
(`/en/reference/line-notification-messages/`).

---

# Common API specifications for this section

These apply to the "Options for corporate customers" APIs (Mission Sticker API,
Mark as read API, Module) and the LINE notification messages APIs.

## Status codes

See the Messaging API reference "Status codes" — the same status-code semantics
apply.

## Response headers

| Response header | Description |
|---|---|
| `x-line-request-id` | Request ID. An ID is issued for each request. |

## Error responses

Errors follow the Messaging API "Error responses" format — a JSON body with a
`message` property, and optionally a `details` array (`details[].message`,
`details[].property`). Error messages are not guaranteed and may change without
notice; handle errors by the received HTTP status code.

---

# Development guidelines for corporate customers

Follow these guidelines when developing on the LINE Platform.

## About LINE bot

A LINE bot uses the Messaging API to send and receive information. The bot is a
component of a LINE Official Account; the LINE Official Account and channels are
related (Messaging API channel, etc.).

### LINE bot development procedure

1. Create a LINE Official Account (bot) and Messaging API channel — from LINE
   Official Account Manager or LINE AGP.
2. Prepare: an environment (server that calls the Messaging API) supporting
   **TLS 1.2 or later**; an environment (bot server for webhook events) supporting
   **TLS 1.2 or later**. These need not be separate environments.
3. Prepare and implement the bot server to receive webhook events.
4. In the LINE Developers Console: **Messaging API → Webhook settings**, set the
   bot server URL in **Webhook URL**, and enable **Use Webhook**.
5. Add the LINE Official Account as a friend and check the bot server receives
   webhook events.

### Items to check before releasing a LINE bot

- Members needing console access have channel permissions and LINE Official
  Account Manager permissions.
- The correct **Webhook URL** is set and the bot server processes webhook events
  properly.
- The implementation accounts for the precautions on sending API requests.
- Comply with the LINE BOT security guidelines and checklist (only available in
  Japanese), or an equal-or-better environment.

## Notes on receiving webhook events on bot servers

### Secure communication

- Receiving webhook events requires **HTTPS supporting TLS 1.2 or later**, with an
  SSL certificate from a public certification authority (a purchased certificate,
  or a free one such as Let's Encrypt).
- Build an environment that complies with the LINE bot security guidelines and
  checklist.

### Verify received webhook events

The `x-line-signature` request header carries a signature. Compute the digest of
the received request body with the defined algorithm and verify it matches
`x-line-signature`. The **channel secret** is the signature calculation key —
handle it carefully. See the Messaging API reference "Signature validation" for
code samples.

> **The LINE Platform's IP address isn't disclosed.** For security, use signature
> validation, not IP-address access control.

### Handle mass / intensive webhook delivery

A LINE Official Account may receive a large, unexpected volume of webhook events.
If a webhook request exceeds the bot server's processing capacity, messages to
users may be delayed or undelivered. Access is likely to concentrate, e.g.,
immediately after enabling "Show in search results", running a Sponsored sticker
campaign, sending a broadcast message, or being featured in media — especially
12:00 noon and 17:00–24:00.

> - LY Corporation does **not** provide a load-test environment; don't load-test
>   in a way that includes the LINE Platform.
> - For a LINE Official Account with over one million friends, sending a
>   highly-responsive campaign message all at once may affect the whole LINE
>   Platform's performance — send in stages instead.

### Webhook ON/OFF and auto-reply settings

You can toggle **Use webhook** in the LINE Developers Console or in LINE Official
Account Manager — the settings are synchronized.

Valid combinations of **Webhooks** and the LINE Official Account Manager
**Response mode** / **Greeting message** settings:

| **Webhooks** | **Response mode** & **Greeting message** | Allowed |
|---|---|---|
| Enabled | Enabled | Yes |
| Enabled | Disabled | Yes |
| Disabled | Enabled | Yes |
| Disabled | Disabled | **No** |

Disabling both is not allowed — it would prevent the LINE Official Account from
sending messages to users. (The Greeting message is auto-sent when a LINE Official
Account is added, and also when it is unblocked.)

### Processing flow when receiving a webhook request

Respond with HTTP status code `200` **within 2 seconds**. Process events
**asynchronously** so webhook handling doesn't delay subsequent processing;
maintain event context if processing asynchronously.

For Messaging API channels under a **certified provider**: if a `2xx` status isn't
returned within 2 seconds, a `request_timeout` error notification is sent to the
channel administrator. (The error notification feature is only for Messaging API
channels under a certified provider.)

### Other precautions

- **One webhook can contain multiple webhook event objects** — and not always for
  one user (e.g. a Message event from person A and a Follow event from person B in
  the same webhook). Handle this correctly.
- **Webhook event objects may gain new properties** when Messaging API features
  change — implement so receiving an unknown property doesn't break the bot.
- **You can't restrict users from sending chats** (and the corresponding webhook
  events) to your LINE Official Account — handle unexpected chats.

## Notes on sending API requests

### Channel access tokens

Messaging API requests use a channel access token. There are four types with
different validity periods and issuance methods.

> Long-lived channel access tokens (issuable from the console with a very long
> validity) are **not recommended** for security reasons. Prefer short-lived
> (30-day), user-specified-expiration (v2.1), or stateless tokens.

Short-lived, user-specified-expiration, and stateless tokens expire and cannot be
extended/renewed once issued. Build a process to reissue tokens regularly,
accounting for the remaining validity. After issuing a new short-lived /
user-specified-expiration token, revoke the old unused one.

**Max channel access token issuance limits:**

| Type | Max issuance limit | Behavior when exceeded | When the token becomes invalid |
|---|---|---|---|
| Short-lived channel access token | 30 | Existing short-lived tokens are invalidated in issuance order | Validity expired; max limit exceeded; revoke API executed |
| Long-lived channel access token | 1 | Existing long-lived token is disabled | Max limit exceeded; revoke API executed |
| Access token with a user-specified expiration (v2.1) | 30 | API error; can't issue additional tokens | Validity expired; revoke API executed |
| Stateless channel access token | limitless | — | Validity expired |

### Message delivery requests

A successful send returns an empty JSON object with HTTP `200` (`202` for the
narrowcast API only). A failed send returns a JSON error body. Save logs of the
requested API and received response for a period.

### Retry message delivery requests

Even without a LINE Platform failure, an API request may not complete, or a
response may not be received, due to the bot server's network. Repeating the same
request would deliver the message twice if the first was accepted. To retry
safely, implement a retry key (`X-Line-Retry-Key`). See the Messaging API doc
"Retry failed API requests". (Note: LINE notification messages do **not** support
retry keys.)

### Request limits

- **Text message limit**: max **5000 characters** for text messages and text
  messages (v2).
- **Request size limit**: max **2 MB**.
- **Request rate limits**: the Messaging API applies per-endpoint rate limits.
  Sending mass requests for behavioral testing is prohibited, on production or
  test accounts; don't include the LINE Platform in load tests.

### Use HTTPS (TLS 1.2 or later)

Communication between the Messaging-API-calling system and the LINE API server
must use HTTPS (TLS 1.2 or later). When sending an Image message or a Flex Message
with an Image component, the file-hosting server must also support HTTPS (TLS 1.2
or later).

### Dealing with high-volume access to content

Messages may generate large access volumes to URLs/images in them. Use load
balancing (CDN, load balancer) or send messages in stages so the content server
doesn't go down.

## Notes on using LINE Login

LINE Login implements a login function using the user's LINE account information.
Web login is based on the OAuth 2.0 authorization code grant flow and OpenID
Connect.

- **Callback URLs** (`redirect_uri`): set in **LINE Login** channel settings. Up
  to **400 URLs**. A URL may include query parameters. The `redirect_uri` at
  authorization-request time is a URL-encoded form of a registered callback URL,
  and may add any query parameter.
- **Issue an access token** using the authorization code. The `redirect_uri` at
  token issuance must equal the one at the authorization request. **An
  authorization code can be used only once**, whether or not token issuance
  succeeds.
- **Verify the ID token**: an ID token is in the token-endpoint payload when
  `openid` is in the scope. Verify it to get the user's profile information.
- **`state` verification**: the `state` parameter at authorization request
  prevents CSRF. Randomly generate it per session and validate it when receiving
  the authorization/error response.
- **Add friend option**: LINE Login can add your LINE Official Account as a friend
  at login. Linked accounts are limited to those related to the LINE Login
  channel — don't link an unrelated company's account. Settings changes are
  reflected immediately. If the LINE Login channel is under a certified provider,
  the **Add Friend (Unblock)** option is checked by default.
- **ID linking**: linking LINE Login user info with your member info enables more
  personalized messaging. LY Corporation does **not** provide a way to link this
  data — design it yourself with anti-spoofing security, and provide an unlink
  flow. Selecting **Unlink** in the LINE app withdraws "Channel consent" but does
  **not** release your data association — you must unlink separately.

## LINE Front-end Framework (LIFF)

LIFF is a web app platform from LY Corporation; a web app running on it is a LIFF
app. A LIFF app can get LINE user IDs and other information from the LINE
Platform, and use them to provide user-info-based functions or send messages on
behalf of the user.

## Other features

- **Destination browser**: open a URL with special query parameters to force it
  into an external browser (see "Opening a URL in an external browser" in the LINE
  Login docs).
- **URL schemes**: LINE provides URL schemes usable in chat rooms with LINE
  Official Accounts.
- **Channel permissions**: a LINE Login / LINE MINI App channel is "Developing"
  right after creation. To log in / access the LIFF app on a "Developing" channel,
  use a LINE account with admin or tester privileges on the channel.
- **Stickers and emojis**:
  - Stickers are exchanged via package IDs and sticker IDs. The mechanism to get
    a sent sticker's image from its sticker ID is **not disclosed** — provided
    only to LINE Technology Partners building a chat tool, or when LY Corporation
    deems it appropriate.
  - LINE emojis can be sent in a text message or text message (v2). When a user
    sends a LINE emoji, it's stored as an array in the `emojis` object of the text
    object of the message event. **Sent LINE emoji may not be in the `emojis`
    property**: default LINE emojis from LINE for Android are not included;
    Unicode-defined emojis and older LINE emoji versions may not be retrieved
    correctly.

---

# LINE API Policy Handbook

The LINE API Policy Handbook is a handbook for corporate customers, related to the
LINE Official Account Terms of Use and the LINE Official Account API Terms of Use
(only available in Japanese), intended to help you understand and properly use the
LINE API. Its content is subject to change as new features are added.

- LINE API Policy Handbook (PDF, only available in Japanese):
  `https://vos.line-scdn.net/line-developers/docs/media/partner-docs/LINE_API_Policy_Handbook.pdf`

---

# Notice / changelog

Deprecations, breaking changes, and notable updates for the "Options for corporate
customers" section (most recent first). See also the LINE Developers News.

| Date | Notice |
|---|---|
| 2026/05/18 | New applications for the **Mark as read API (old)** stop being accepted at the end of October 2026. Accounts already using it can continue. Considering deprecation — migrate to the Messaging API's "Mark messages as read" endpoint. |
| 2026/02/19 | Changes to some **error responses** in the Mission Sticker API ("Provide mission stickers to the users" endpoint), to prevent inference of user attribute information. |
| 2025/06/30 | The subject and body of **error-notification** emails changed. |
| 2025/06/18 | LINE notification messages are now displayed as **"Important notification"**. |
| 2025/06/18 | The Mission Sticker API endpoint **"Send mission stickers (v3)" was renamed "Provide mission stickers to the users"** — functionality unchanged. |
| 2025/06/02 | **LINE notification messages (template)** released; the previous "LINE notification messages" renamed **"LINE notification messages (flexible)"**. |
| 2025/01/28 | The **`source` property was removed** from the LINE notification messages Webhook delivery completion event (announced 2024/08/09). |
| 2024/10/18 | Quick-fill docs added (Quick-fill is now documented under the LINE MINI App section, not partner-docs). |
| 2024/08/09 | Pre-announcement: the `source` property of the LINE notification messages Webhook delivery completion event will be removed on 2025/01/28. |
| 2024/05/07 | Module maintenance notice. |
| 2024/04/26 | Error notification: a notification email is now sent when webhook redelivery is stopped (previously only when an error was detected). |
| 2023/11/01 | **The audience match API was discontinued** as of 2023/10/31 (announced 2023/07/18). |
| 2023/08/31 | **Stateless channel access token released** — valid 15 minutes, no issuance limit. |
| 2023/07/18 | Pre-announcement: the feature for sending messages using phone number (audience match API) discontinued 2023/10/31. Discontinued endpoints: "Send a message using phone number", "Get result of message delivery using phone number". |
| 2023/05/31 | The **"Send mission stickers (v2)" endpoint was discontinued** as of 2023/05/31 (announced 2023/02/02) — use v3 ("Provide mission stickers to the users"). |
| 2023/04/11 | Module maintenance notice. |
| 2023/02/20 | The "Mark-as-Read API" was renamed **"Mark as read API"** — features unchanged. |
| 2023/02/02 | Pre-announcement: "Send mission stickers (v2)" endpoint discontinued 2023/05/31. |
| 2022/12/20 | The **Module reference** moved from PDF to documentation on the LINE Developers site. |
| 2022/09/28 | "Feature for getting statistics per aggregation unit" integrated into the Messaging API. |
| 2022/08/23 | **LINE API Policy Handbook released.** |
| 2022/06/28 | The **LINE notification messages documentation released** (technical specs, API reference). |
| 2022/03/24 | The **Module documentation released.** |
| 2022/01/05 | Sending messages using IFA discontinued (audience match API). |
| 2021/12/06 | The LINE Bot Development Guidelines moved from PDF to documentation on the LINE Developers site; renamed **"Development guidelines for corporate customers"**. |
| 2021/12/01 | Pre-announcement: sending messages using IFA (Identifier for Advertisers; audience match API) discontinued 2021/12/31. Discontinued endpoints: "Send a message using mobile advertising ID", "Get message delivery result using mobile advertising ID". |
| 2021/07/09 | Correction to "Get statistics per aggregation unit": max character limit for `customAggregationUnits` is **30** (not 100). |
| 2021/04/28 | The subject of the error-notification email changed (updated 2021/05/25). |
| 2021/03/10 | Released the feature for getting statistics per aggregation unit. |
| 2020/03/17 | Icon/Nickname Switch integrated into the Messaging API. |

> **Removed / discontinued APIs** — do not use:
> - **Audience match API** — the entire API was discontinued 2023/10/31. This
>   included "Send a message using phone number" and "Get result of message
>   delivery using phone number", and earlier the IFA-based "Send a message using
>   mobile advertising ID" endpoints (discontinued 2021/12/31).
> - **Send mission stickers (v2)** — discontinued 2023/05/31. Use "Provide mission
>   stickers to the users" (`POST /shop/v3/mission`).
