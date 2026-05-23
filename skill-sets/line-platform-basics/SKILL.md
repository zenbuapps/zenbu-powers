---
name: line-platform-basics
description: >-
  LINE Platform basics — the foundational concepts every LINE bot / LINE Login
  / LIFF / LINE MINI App developer must know, extracted from the official
  "LINE Platform basics" docs section. Use this skill whenever the task touches
  the groundwork of the LINE Platform: understanding what a channel is
  (Messaging API channel, LINE Login channel, LINE MINI App channel), what a
  channel access token is and which of the four token types to use (channel
  access token v2.1 / user-specified expiration, stateless channel access
  token, short-lived channel access token, long-lived channel access token),
  their validity periods, per-channel issuance limits, JWT-based token
  generation, token reuse vs. reissuance, revoking compromised tokens, and the
  per-team token operation model. Also covers how to obtain user profile
  information across LINE products and which fields each path returns: the
  Messaging API Get profile endpoint, LINE Login Get user information
  (userinfo) and Get user profile endpoints, the LINE Login ID token payload,
  LIFF liff.getProfile() and liff.getDecodedIDToken(), and LINE MINI App
  Common Profile Quick-fill — including LINE Profile+, Common Profile,
  subprofile, displayName / userId / pictureUrl / statusMessage / language /
  email / gender / birthdate / address / phone_number, and the email-permission
  and corporate LINE Profile+ application requirements. Also covers LINE API
  Status — checking LINE Platform availability and outage status, the
  api.line-status.info site, its ATOM/RSS outage feeds, "All Systems
  Operational", and which services (Messaging API, Webhook, LIFF, LINE Login,
  LINE Developers site/Console) are monitored. Trigger on mentions of: LINE
  Platform basics, developers.line.biz/docs/basics, channel access token,
  channel access token v2.1, stateless token, short-lived token, long-lived
  channel access token, LINE Developers Console Messaging API tab, token
  expiration / revoke / reissue, get LINE user profile, LINE Profile+, Common
  Profile, Quick-fill, liff.getProfile, ID token payload, LINE API Status,
  api.line-status.info, LINE outage / availability status.
---

# LINE Platform Basics

Conceptual / foundational coverage of the **LINE Platform basics** docs
section (`https://developers.line.biz/en/docs/basics/`). This section explains
the groundwork shared by every LINE product (Messaging API, LINE Login, LIFF,
LINE MINI App): **channels and channel access tokens**, **how to obtain user
profile information**, and **LINE API Status** for platform availability.

This is the *basics* section — concepts, token-type trade-offs, field-coverage
matrices, and best-practice checklists. For the actual HTTP endpoints that
issue / verify / revoke tokens or fetch a profile, see the sibling skill
`line-message-api` and the LINE Login / LIFF references.

## When this skill applies

Use this skill when the task is about **understanding or deciding**, not just
calling an endpoint:

- Choosing which **channel access token type** to use, and reasoning about
  validity periods, issuance limits, revocation, and rotation.
- Understanding what a **channel** is and which products use channels.
- Deciding **which API / SDK call** returns a given piece of **user profile
  information**, and what extra **permission or contract** that field needs.
- Diagnosing a LINE API failure by checking **LINE API Status**, or wiring up
  outage monitoring via its ATOM/RSS feed.

Works regardless of language or SDK — these are platform-level concepts that
hold for raw HTTP, `@line/bot-sdk`, the LINE Login SDKs, and LIFF.

## Reference file map

The basics section is exactly **three pages**; each maps to one reference file.
**Read the file that matches the task — do not guess token limits, profile
field names, or which services LINE API Status covers.**

| File | Source page | Contents |
|---|---|---|
| `references/channel-access-token.md` | `/docs/basics/channel-access-token/` | What a channel is, why tokens exist, the four token types (v2.1 / stateless / short-lived / long-lived) with the validity-period & issuance-limit comparison table and per-type detail, the per-team operation model, and the reuse / revoke-compromised checklist |
| `references/user-profile.md` | `/docs/basics/user-profile/` | Profile vs. Common Profile vs. LINE Profile+, the seven methods for obtaining profile information, the full field-coverage matrix (which method returns userId / displayName / pictureUrl / statusMessage / language / email / name / gender / birthdate / address / phone, and under which JSON key), and the email-permission / LINE Profile+ / Quick-fill application requirements |
| `references/line-api-status.md` | `/docs/basics/line-api-status/` | The LINE API Status site, ATOM/RSS outage feeds, the stable vs. outage status displays, the exact list of monitored services, and how to access it from the LINE Developers site |

## Quick index — channel access tokens

Four token types; the issue count is tracked **per type**, and expired tokens
don't count toward the limit.

```
Type                          Validity        Issues/channel   Revocable?   Notes
Channel access token v2.1     ≤ 30 days        30               yes          User-set expiry; JWT-generated; over-issuance DENIED
Stateless                     15 minutes       limitless        NO           Issue per request; cannot be revoked
Short-lived                   30 days          30               yes          Over-issuance REVOKES the oldest token
Long-lived                    indefinite       1                yes          Messaging API channel only; issued in Console
```

Reuse rule: v2.1 and short-lived tokens **must be reused** within their
validity period — do not reissue per request, or issuance may be throttled.
Stateless tokens are the exception (designed to be issued each use). Long-lived
reissue invalidates the old token but can extend it by **up to 24 hours** for a
rotation overlap. Keep **at most two live tokens per development team** for
zero-downtime rotation.

## Quick index — getting user profile information

Seven methods across four products; basic identity is free, sensitive fields
are gated.

```
M1  Messaging API  — Get profile endpoint                 userId, displayName, pictureUrl, statusMessage, language
M2  LINE Login     — Get user information (userinfo)       sub(=userId), name, picture
M3  LINE Login     — Get user profile endpoint             userId, displayName, pictureUrl, statusMessage
M4  LINE Login     — ID token payload                      sub, name, picture, email*, name/gender/birthdate/address/phone†
M5  LIFF           — liff.getProfile()                     userId, displayName, pictureUrl, statusMessage
M6  LIFF           — liff.getDecodedIDToken() payload       same as M4
M7  LINE MINI App  — Common Profile Quick-fill              email, given-name/family-name, sex-enum, bday-*, address-*, tel ‡
```

- `language` is **only** available via M1 (Messaging API Get profile).
- `*` email (M4/M6) requires an **email-access permission request**.
- `†` name/gender/birthday/address/phone (M4/M6) require a **LINE Profile+**
  corporate contract.
- `‡` M7 requires applying for the **Quick-fill** feature; its keys use
  autofill-style hyphenated names.
- You can only get the **main profile** — not the user's **subprofile**.

## Quick index — LINE API Status

`https://api.line-status.info/` reports LINE Platform availability in English.

```
Stable:   "All Systems Operational"
Outage:   per-service outage display, also shown as a pop-up on developers.line.biz
Feeds:    ATOM + RSS via "SUBSCRIBE TO UPDATES" (use for automated monitoring)
Covers:   Messaging API (API, Webhook); LINE Developers (site, Console); LIFF; LINE Login
Excludes: the LINE app itself and any other service
Access:   "More" menu in the header, or the footer, of the LINE Developers site
```

## Working rules

- When picking a token type, lead with **validity period** and **revocability**:
  use v2.1 for controlled-lifetime JWT-secured tokens; stateless for
  irrevocable 15-minute throwaways; short-lived for ~monthly auto-rotated
  tokens; long-lived only for a Messaging API channel managed in the Console.
- Never reissue a v2.1 or short-lived token per request — reuse it. Excessive
  issuance can get the channel's token issuance temporarily restricted.
- If a token may be compromised, **revoke it** — except stateless tokens, which
  cannot be revoked and instead rely on the 15-minute expiry.
- To return a profile field, pick the method from the matrix in
  `references/user-profile.md`: identity fields are available broadly, but
  email needs an email-permission request and legal name / gender / birthday /
  address / phone need a LINE Profile+ corporate contract.
- When a LINE API call fails unexpectedly, check **LINE API Status** before
  assuming the bug is local; subscribe to its ATOM/RSS feed for monitoring.
