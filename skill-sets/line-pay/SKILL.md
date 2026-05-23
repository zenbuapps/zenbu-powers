---
name: line-pay
description: >-
  LINE Pay developer documentation, official API reference at API-reference
  depth. Covers the Online API (v4, v3) and Offline API (v4, v2.4, v2) — every
  endpoint, request/response schema, parameter table, result code, the HMAC
  request-signing algorithm, and the merchant redirection pages. Use this skill
  whenever the task touches LINE Pay: building or debugging a LINE Pay
  integration for an online shop or an offline POS terminal, requesting /
  confirming / capturing / voiding / refunding a payment, implementing
  pre-approved (recurring / subscription) payments, generating the
  X-LINE-Authorization HMAC-SHA256 signature, handling channel ID / channel
  secret credentials, processing a customer's My Code (oneTimeKey), checking a
  payment request status, retrieving payment details, or wiring up the
  confirmUrl / cancelUrl redirection pages. Trigger on mentions of: LINE Pay,
  developers-pay.line.me, api-pay.line.me, sandbox-api-pay.line.me, LINE Pay
  Online API, LINE Pay Offline API, /v4/payments/request, /v4/payments/confirm,
  /v4/payments/oneTimeKeys/pay, preapprovedPay, regKey, X-LINE-ChannelId,
  X-LINE-ChannelSecret, X-LINE-Authorization, X-LINE-Authorization-Nonce,
  transactionId, orderId, returnCode 0000, confirmUrl, My Code, oneTimeKey,
  capture-separated payment, pre-approved payment, LINE Pay merchant center,
  LINE Pay refund, LINE POINTS payment, EPI / TSP payment provider.
---

# LINE Pay Developer Reference

API-reference-level coverage of the LINE Pay developer documentation, extracted
from the official site at `https://developers-pay.line.me/`.

LINE Pay is a digital wallet. A **merchant** integrates LINE Pay so its
customers can pay with their LINE Pay balance, LINE POINTS, or a credit card.
Two integration families exist, each a separate REST API over HTTPS:

| Family | For | Current version | Legacy versions |
|---|---|---|---|
| **Online API** | Online services (web / app shops) | v4 | v3 |
| **Offline API** | Physical POS terminals scanning a customer's My Code | v4 | v2.4, v2 |

**Read the reference file that matches the task — do not guess endpoint paths,
parameter names, JSON shapes, or the signature algorithm.**

## When this skill applies

Any work on a LINE Pay integration: requesting a payment, redirecting the
customer to LINE Pay authentication, confirming / capturing / voiding /
refunding, implementing recurring (pre-approved) billing, scanning a My Code at
a terminal, signing requests, or handling `returnCode` results. Works for raw
HTTP calls (`curl`, `fetch`, `axios`, `requests`) — LINE Pay publishes no
official SDK; you call the REST endpoints directly.

## Host and version — pick the right one

All endpoints share one host pattern: `https://{host}/{apiPath}?{queryString}`.

| `host` | Use |
|---|---|
| `sandbox-api-pay.line.me` | Sandbox / testing server |
| `api-pay.line.me` | Production server |

`apiPath` carries the API version (`/v4/...`, `/v3/...`, `/v2.4/...`,
`/v2/...`). The v3/v4 and v2/v2.4 paths are otherwise parallel — picking the
wrong version prefix is the most common integration bug.

## Auth in two lines

**Online API v3/v4 and Offline API v4** use HMAC request signing: send
`X-LINE-ChannelId`, `X-LINE-Authorization-Nonce` (a UUID), and
`X-LINE-Authorization` (Base64 HMAC-SHA256 of `channelSecret + apiPath +
(queryString | body) + nonce`, keyed by the channel secret).

**Offline API v2 and v2.4** use a plain shared secret: send `X-LINE-ChannelId`
and `X-LINE-ChannelSecret` headers — no signature. See
`references/common-and-auth.md` for the exact algorithm and verbatim code.

## Reference file map

| File | Contents |
|---|---|
| `references/common-and-auth.md` | Host/version model, the HMAC `X-LINE-Authorization` signing algorithm (v3/v4) and the `X-LINE-ChannelSecret` scheme (v2/v2.4), all request/response headers, the response envelope (`returnCode`/`returnMessage`/`info`), the `transactionId` 64-bit / `handleBigInteger()` gotcha, sandbox setup, joining as a merchant |
| `references/online-api.md` | Online API **v4** — all 11 endpoints (request payment, check payment request status, confirm, capture, void, retrieve payment details, refund, pre-approved key check/request/discard) at full schema depth, plus the v3 differences |
| `references/offline-api.md` | Offline API **v4** — all 7 endpoints (request payment via oneTimeKey, check payment status, retrieve confirmation information, capture, void, retrieve payment details, refund) at full schema depth, plus the v2.4 and v2 differences |
| `references/result-codes.md` | Complete `returnCode` tables for the Online API and the Offline API, with the meaning, retry behavior, and pre-approved-key-discard behavior of every code |
| `references/redirection-pages.md` | The merchant-hosted payment confirmation page and payment cancellation page: when LINE Pay calls them, the query parameters appended, the `SERVER` confirmUrlType IP allowlist |
| `references/guides-and-flows.md` | End-to-end implementation flows with verbatim code: basic online payment, capture-separated payment, pre-approved payment, payment without redirection URL, offline My-Code payment, refunds, LINE POINTS separation |

## Quick endpoint index

Online API v4 — host `api-pay.line.me` / `sandbox-api-pay.line.me`:

```
POST /v4/payments/request                                  Request payment
GET  /v4/payments/requests/{transactionId}/check           Check payment request status
POST /v4/payments/{transactionId}/confirm                  Confirm payment (amount + currency)
POST /v4/payments/authorizations/{transactionId}/capture   Capture (amount + currency)
POST /v4/payments/authorizations/{transactionId}/void      Void a confirmed (uncaptured) payment
GET  /v4/payments                                          Retrieve payment details (?transactionId / ?orderId)
POST /v4/payments/{transactionId}/refund                   Refund (optional refundAmount)
GET  /v4/payments/preapprovedPay/{regKey}/check            Check pre-approved payment key status
POST /v4/payments/preapprovedPay/{regKey}/payment          Request pre-approved payment
POST /v4/payments/preapprovedPay/{regKey}/expire           Discard pre-approved payment key
```

Online API v3 — same 11 endpoints under the `/v3/` prefix. v3 has no
`options.regPayRequest` and no `paymentProvider`, but adds `options.familyService`
and a `packages[].userFee` customer-fee model — see `references/online-api.md`.

Offline API v4 — host `api-pay.line.me` / `sandbox-api-pay.line.me`:

```
POST /v4/payments/oneTimeKeys/pay                Request payment with the customer's My Code
GET  /v4/payments/orders/{orderId}/check         Check payment status
GET  /v4/payments/authorizations                 Retrieve confirmation information (?orderId / ?transactionId)
POST /v4/payments/orders/{orderId}/capture       Capture (amount + currency)
POST /v4/payments/orders/{orderId}/void          Void a confirmed (uncaptured) payment
GET  /v4/payments                                Retrieve payment details (?orderId / ?transactionId)
POST /v4/payments/orders/{orderId}/refund        Refund (optional refundAmount)
```

Offline API v2.4 and v2 — same 7 endpoints under `/v2.4/` and `/v2/` prefixes,
but with plain `X-LINE-ChannelSecret` auth and a **different (flat) Request
payment / Capture body** — flat `extras`, top-level `productName`, no
`packages[]`. v2 has no `paymentProvider`; v2 adds `info.balance` and
`extras.addFriends[]`. See `references/offline-api.md`.

## Working rules

- Every response is HTTP `200 OK`. Success vs failure is decided by the body's
  `returnCode`: `"0000"` means success (and on the Online API also has special
  meaning for status checks — see `references/result-codes.md`). Any other code
  is an error; the `info` field is then absent.
- `transactionId` is a 19-digit integer. JavaScript `Number` cannot hold it
  exactly (> 2^53−1). Parse responses as text and quote 16+ digit runs before
  `JSON.parse` — use the `handleBigInteger()` helper in `references/common-and-auth.md`.
- Once a payment is **captured** it can no longer be **voided** — only
  **refunded**. Void applies only to a confirmed-but-not-captured payment.
- Capture is automatic on confirmation unless you set `options.payment.capture`
  (Online) / `capture` (Offline pre-approved & oneTimeKey) to `false`. In
  **Taiwan**, capture-separated and pre-approved payments require prior approval
  from LINE Pay.
- The HMAC MAC message differs by HTTP method: GET uses the query string, POST
  uses the request body. Unintended whitespace or a different JSON key order
  changes the MAC and yields `returnCode 1106`.
- For payment without a redirection URL, set
  `options.redirectUrls.confirmUrlType` to `"NONE"` and poll
  `GET /v4/payments/requests/{transactionId}/check` (~1 s interval).
- Offline payment: the customer's My Code is the `oneTimeKey`. It is valid for
  5 minutes; in the sandbox, generate test codes at
  `https://sandbox-web-pay.line.me/web/sandbox/payment/oneTimeKey`.
- Read timeouts the docs recommend per endpoint: payment request 10 s, confirm
  40 s, offline request 40 s, capture 60 s (Online), most others 20 s.
- Supported currency codes (ISO 4217): `"USD"`, `"TWD"`, `"THB"`. LINE Pay
  Japan service has been terminated; Japan-only fields and the Deposit API are
  removed.
