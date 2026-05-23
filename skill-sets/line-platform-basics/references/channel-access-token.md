# Channel Access Token — Concepts, Types & Operation

Source: `https://developers.line.biz/en/docs/basics/channel-access-token/`

This is the conceptual / "basics" page for channel access tokens. It explains
**what** a token is, **why** it exists, the **four token types** and their
trade-offs, an **operational model**, and a **checklist** of best practices.
For the actual HTTP endpoints that issue / verify / revoke tokens, see the
Messaging API reference (and the `line-message-api` sibling skill).

## Table of contents

- What a channel is
- Why channel access tokens exist
- Types of channel access tokens (comparison table + per-type detail)
- Example of channel access token operation
- Checklist: reuse within validity period; revoke compromised tokens

---

## Definition

The **channel access token** is an opaque string used to verify that the
application attempting to use the **channel** has permission to use the
channel. With a channel access token, you can use features offered by the
**LINE Platform**, such as the Messaging API.

## What is a channel

A **channel** is a communication path used to access the features provided by
the LINE Platform. Example channels:

- Messaging API channel
- LINE Login channel
- LINE MINI App channel

The channel access token is used, for example, when an application uses the
Messaging API channel to verify that the user is authorized to use the channel.

## Why use channel access tokens

In many systems, the common way to verify a user is authorized is an ID +
password, entered each time the application uses the channel. Because a channel
is used many times while providing a service, having a channel user enter their
ID and password every time is impractical — so a **channel access token is used
instead**. Channel access tokens let channel users use the channel without
re-entering an ID and password.

> **Note — Revoke any channel access tokens suspected of being compromised.**
> A channel access token verifies that an application is authorized to use a
> channel. If the token is compromised, the channel could be used by an
> unintended third party. If you suspect compromise, revoke the token.

---

## Types of channel access tokens

There are **four** types. They differ in **validity period** and **number that
can be issued per channel**.

| Type | Validity period | Number of issues per channel |
|---|---|---|
| Channel access token with a user-specified expiration | Up to 30 days | 30 |
| Stateless channel access token | 15 minutes | Limitless |
| Short-lived channel access token | 30 days | 30 |
| Long-lived channel access token | Indefinite | 1 |

Key counting rule: the issue count is tracked **per token type**. You can issue
30 short-lived tokens even if you have already issued 30 user-specified-expiry
tokens. An **expired** channel access token is **not counted** as issued.

The token types you can use **vary by product and feature**. For example,
**long-lived channel access tokens are only available for Messaging API
channels**. Check each product's documentation for which token types it supports.

> **Tip — Can be used repeatedly within the validity period.** The same channel
> access token can be used multiple times within its validity period (see the
> Checklist section below).

### Channel access token with a user-specified expiration (Channel access token v2.1)

- Developers can set the validity period — **up to 30 days**.
- Security is enhanced by using a **JSON Web Token (JWT)** for token generation.
- **Up to 30** channel access tokens v2.1 can be issued per channel. An attempt
  to exceed the limit results in the issuance request being **denied** (does
  not silently revoke the oldest — that is the short-lived token behavior).
- Issuing reference: "Issue channel access tokens v2.1" →
  `https://developers.line.biz/en/docs/messaging-api/generate-json-web-token/`
  (Messaging API documentation).

### Stateless channel access token

- Valid for **15 minutes** only.
- **No limit** on the number that can be issued.
- Once issued, a stateless channel access token **cannot be revoked**.
- Designed to be **issued each time a channel is used** (unlike v2.1 /
  short-lived tokens, which should be reused).
- Issuing reference: "Issue stateless channel access token" →
  `https://developers.line.biz/en/reference/messaging-api/#issue-stateless-channel-access-token`

### Short-lived channel access token

- Valid for **30 days**.
- **Up to 30** can be issued per channel. If you issue more than the limit, the
  **oldest channel access token is revoked** (silently — contrast with v2.1,
  where excess issuance is denied).
- Issuing reference: "Issue short-lived channel access token" →
  `https://developers.line.biz/en/reference/messaging-api/#issue-shortlived-channel-access-token`

### Long-lived channel access token

- **Does not expire** ("Indefinite" validity).
- Can **only be issued through the Messaging API channel**.
- Issued at any time from the **Messaging API** tab in the Messaging API
  channel of the **LINE Developers Console** (`https://developers.line.biz/console/`).
- Can be **revoked at any time**.
- Limit: **1** per channel.
- **Reissuing a long-lived token invalidates the currently active long-lived
  token.** When reissuing, you can **extend the validity of the currently
  active long-lived token by up to 24 hours**, giving a brief overlap window.

---

## Example of channel access token operation

Channel access tokens are intended to be issued **per development team or group
of users**. For example, Development Team A and Development Team B are issued
**different** channel access tokens. Benefit: if Team A's token is suspected
compromised, or Team A needs to reissue for its own reasons, **Team B is not
affected**.

For continuous service, a **maximum of two channel access tokens** can be
issued per development team / user group — so one token can keep working while
the other is being rotated.

---

## Checklist

When using channel access tokens, note the following two practices.

### Can be used repeatedly within the validity period

- The same channel access token can be used multiple times within its validity
  period.
- For **channel access tokens v2.1** and **short-lived channel access tokens**,
  **do not reissue a token every time you use a channel** — reuse the existing
  valid token instead.
- If a large number of tokens are issued in a short period and it is determined
  this affects LINE Platform operation, **issuance may be temporarily
  restricted**.
- **Stateless channel access tokens** are the exception — they are *designed*
  to be issued each time a channel is used.
- Using an **expired** token fails: channel authorization cannot be verified.
  Recommended: set up a system to **automatically issue a new token before the
  current one expires**.

### Revoke any channel access tokens suspected of being compromised

- A channel access token verifies channel privileges. If compromised, an
  unintended third party could use the channel.
- Concrete risk example: the Messaging API "Broadcast message" feature sends the
  same message to **all** users who are friends with the LINE Official Account.
  A compromised token lets a third party broadcast malicious messages to all
  friends.
- If you suspect a **revocable** token has been compromised, **revoke it**.
  (Stateless tokens cannot be revoked — instead they expire after 15 minutes.)
- Revoke references:
  - "Revoke channel access token v2.1" →
    `https://developers.line.biz/en/reference/messaging-api/#revoke-channel-access-token-v2-1`
  - "Revoke short-lived or long-lived channel access token" →
    `https://developers.line.biz/en/reference/messaging-api/#revoke-longlived-or-shortlived-channel-access-token`

---

## Quick decision guide

| You need... | Use this token type |
|---|---|
| A token whose lifetime you control, JWT-secured, rotated regularly | Channel access token v2.1 (user-specified expiration) |
| A throwaway token issued per request, never revoked | Stateless channel access token |
| A token valid ~1 month, auto-rotated by issuance | Short-lived channel access token |
| A never-expiring token for a Messaging API channel, managed in console | Long-lived channel access token |

Cross-type rules to remember:
- Issue limits are per type; expired tokens don't count.
- v2.1 over-issuance → request **denied**; short-lived over-issuance → **oldest revoked**.
- Long-lived is **Messaging-API-channel-only** and limited to **1**; reissue extends the old one by ≤ 24 h.
- Stateless tokens are **irrevocable** — security relies on the 15-minute expiry.
- Issue separate tokens per team; keep at most two live per team for zero-downtime rotation.
