# Payment Provider — Unifi Apps SDK

Source:
- `https://docs.unifi.me/unifi-apps-sdk/payment-provider`
- `https://docs.unifi.me/unifi-apps-sdk/payment-provider/policy/payment`
- `https://docs.unifi.me/unifi-apps-sdk/payment-provider/policy/refund`
- `https://docs.unifi.me/unifi-apps-sdk/payment-provider/policy/chargeback`
- `https://docs.unifi.me/unifi-apps-sdk/payment-provider/policy/cancellation`
- `https://docs.unifi.me/unifi-apps-sdk/payment-provider/settlement` (+ children)

## Table of contents

- Payment flow (the 6-step sequence)
- Payment API (Payment Server REST endpoints)
- PaymentProvider SDK methods (`startPayment`, `openPaymentHistory`)
- Payment webhooks (lock, unlock, status change)
- Payment status enum
- Payment policy (methods, currencies, minimum charges, UX rules)
- Refund / cancellation / chargeback policy
- Settlement (fiat & crypto)

---

## Payment flow

Payment uses a Unifi App Client + Unifi App Server + Unifi Payment Server. There
are 6 steps; payment status is confirmed either by **polling** (await the
`startPayment` promise) or by **webhook** (server callback).

### 1. Trigger `createPayment` from the Unifi App Server

When a user requests a purchase, the client sends item info to your server, which
calls the `createPayment` API on the Unifi Payment Server. It responds with a
payment ID: `{ id: <payment_id> }`.

`pgType` is `CRYPTO`, `STRIPE`, or `LINE_IAP`.

Request where `pgType` is `CRYPTO` or `STRIPE`:

```
curl --location 'https://payment.dappportal.io/api/payment-v1/payment/create' \
--header 'X-Client-Id: {your_client_id}' \
--header 'X-Client-Secret: {your_client_secret}' \
--header 'Content-Type: application/json' \
--data '{
    "buyerDappPortalAddress": "{user_wallet_address}", // user_wallet_address should be achieved through walletProvider.
    "pgType": "{pg_type}",
    "currencyCode": "{currency_code}",
    "price": "{price}",
    "paymentStatusChangeCallbackUrl": "{url_to_get_confirm_callback}",
    "lockUrl": "{url_to_get_item_lock_callback}",
    "unlockUrl": "{url_to_get_item_unlock_callback}",
    "items": [
        {
            "itemIdentifier": "{your_item_identifier}",
            "name": "{your_item_name}",
            "imageUrl": "{your_item_image_url}",
            "price": "{price}",
            "currencyCode": "{currencyCode}"
        }
    ],
    "testMode": {true | false}
}'
```

Request where `pgType` is `LINE_IAP` (`currencyCode`/`price` optional, `lineIapProductId` required):

```
curl --location 'https://payment.dappportal.io/api/payment-v1/payment/create' \
--header 'X-Client-Id: {your_client_id}' \
--header 'X-Client-Secret: {your_client_secret}' \
--header 'Content-Type: application/json' \
--data '{
    "buyerDappPortalAddress": "{user_wallet_address}", // user_wallet_address should be achieved through walletProvider.
    "pgType": "{pg_type}",
    "currencyCode": null, // optional where LINE IAP
    "price": null, // optional where LINE IAP
    "lineIapProductId": "{productId}", // required where LINE IAP
    "paymentStatusChangeCallbackUrl": "{url_to_get_confirm_callback}",
    "lockUrl": "{url_to_get_item_lock_callback}",
    "unlockUrl": "{url_to_get_item_unlock_callback}",
    "items": [
        {
            "itemIdentifier": "{your_item_identifier}",
            "name": "{your_item_name}",
            "imageUrl": "{your_item_image_url}",
            "price": null, // optional where LINE IAP
            "currencyCode": null // optional where LINE IAP
        }
    ],
    "testMode": {true | false}
}'
```

Response: `{ "id": {payment_id} }`.

### 2. Get PaymentProvider from the SDK

```js
const paymentProvider = sdk.getPaymentProvider()
```

### 3. Start the payment via PaymentProvider

Pass the `paymentId` from step 1:

```js
await paymentProvider.startPayment(paymentId)
```

### 4. Check payment status and finalize

Two ways:

- **Client-side**: await the promise returned by `startPayment`. When it resolves,
  the payment status is `CONFIRMED`.
- **Server-side (webhook)**: the Unifi Payment Server POSTs to your
  `paymentStatusChangeCallbackUrl` whenever the status changes. Body:
  ```
  {
    "paymentId": "{payment_id}",
    "status": "CONFIRMED"
  }
  ```

If the received status is `CONFIRMED`, your server should **finalize** the payment:

```
curl --location --request
POST 'https://payment.dappportal.io/api/payment-v1/payment/finalize' \
--header 'Content-Type: application/json' \
--data '{
    "id": "{payment_id}"
}'
```

### 5. If payment is canceled by the system

If your webhook endpoint does not return `200 OK`, the event is retried up to 4
times at exponential intervals: 1, 2, 4, 8 seconds. After all retries fail, if a
`lockUrl` was specified, the Unifi Payment Server POSTs an **unlock** request:

```
{
    "paymentId": "{payment_id}",
    "itemIdentifiers": ["{your_item_identifier}"]
}
```

This releases reserved resources (NFT items, inventory).

### 6. Open the payment history page

```js
await paymentProvider.openPaymentHistory()
```

The promise resolves once the payment history page opens successfully.

---

## Payment API (Unifi Payment Server REST)

Base URL: `https://payment.dappportal.io`. All endpoints under `/api/payment-v1/`.

### 1. Create payment

`POST /api/payment-v1/payment/create`

Headers (required): `X-Client-Id` (client id from support), `X-Client-Secret`
(client secret from support).

Request body schema:

```
{
    buyerDappPortalAddress*: String,
    pgType*: String(Enum: [STRIPE,CRYPTO,LINE_IAP]),
    currencyCode: String(Enum: [USD,KRW,JPY,TWD,THB,KAIA,USDT]),
    price: String,
    lineIapProductId: String,
    paymentStatusChangeCallbackUrl*: String,
    lockUrl: String,
    unlockUrl: String,
    items*: [Item {
           itemIdentifier: String,
           name: String,
           imageUrl: String,
           price: String,
           currencyCode: String(Enum: [USD,KRW,JPY,TWD,THB,KAIA,USDT]),
        }],
    testMode*: Boolean,
}
```

Field rules:

| Field | Required | Rules |
|---|---|---|
| `buyerDappPortalAddress` | Yes | User wallet address, obtained via `walletProvider`. Max length 42. |
| `pgType` | Yes | `STRIPE`, `CRYPTO`, or `LINE_IAP`. |
| `currencyCode` | No (required unless `LINE_IAP`) | `USD`, `KRW`, `JPY`, `TWD`, `THB`, `KAIA`, `USDT`. Must equal the items' `currencyCode`. Optional when `pgType` is `LINE_IAP`. |
| `price` | No (required unless `LINE_IAP`) | See price-unit table below. Must equal the sum of each item's `price`. Optional when `LINE_IAP`. |
| `lineIapProductId` | required where `LINE_IAP` | The LINE IAP `productId`. Only Mini App channels approved by LY may use LINE IAP. |
| `paymentStatusChangeCallbackUrl` | Yes | Webhook URL for status changes. Max length 512. **Use port 443** — webhooks cannot be received on other ports. |
| `lockUrl` | No | Item-lock webhook URL. Max length 512. Enter `null` if unused. |
| `unlockUrl` | No | Item-unlock webhook URL. Max length 512. Enter `null` if unused. |
| `items` | Yes | **Only single-item purchase is supported in the current version.** |
| `testMode` | Yes | `true`/`false`. Affects payment mode (see table below). |

Item fields: `itemIdentifier` (max 256), `name` (max 256), `imageUrl` (max 512),
`price`, `currencyCode` (`USD,KRW,JPY,TWD,THB,KAIA,USDT`; optional where `LINE_IAP`).

**Price-unit rules** (`price` is a string in the smallest unit):

| pgType | Currency | Unit rule |
|---|---|---|
| STRIPE | USD | Minimum unit (cents): `$1` → `100`. `10,000 USD` → `1000000` (×100). |
| STRIPE | THB, TWD | Minimum unit ×100: `10,000 THB` → `1000000`; `10,000 TWD` → `1000000`. |
| STRIPE | KRW, JPY | Minimum unit equals the price unit: `10,000 KRW` → `10000`; `10,000 JPY` → `10000`. |
| CRYPTO | KAIA | Price as KAIA unit: `1 KAIA = 1.0`. Up to **4 decimal places**. |
| CRYPTO | USDT | `1 USDT = 1.0`. Up to **2 decimal places**. |
| LINE_IAP | — | Not needed (set via `lineIapProductId`). |

**`testMode` behavior:**

| testMode | STRIPE | CRYPTO | LINE_IAP |
|---|---|---|---|
| `false` | real mode | Kaia (mainnet) | real mode |
| `true` | test mode | Kairos (testnet) | not supported |

`testMode: true` requires the SDK init `chainId` to be `1001`; `testMode: false`
requires `chainId` `8217`. A mismatch causes a payment error (v1.4.6+ enforces this;
log messages: `The payment is set to test mode, but DappPortalSDK is initialized
with mainnet (8217).` / `... non-test mode, but ... initialized with testnet
(1001).`).

Responses:

- `200`: `{ "payment_id": "{payment_id}" }` — schema `{ payment_id*: String }`.
- `400`: `{ "code": 1001, "detail": "Invalid argument", "cause": null }`.
- `401`: `{ "code": 1007, "detail": "Invalid X-Client-Id or X-Client-Secret", "cause": null }`.
- `403`: `{ "code": 1007, "detail": "Access denied due to country restrictions.", "cause": null }`.
- `500`: `{ "code": 500, "detail": "Internal server error", "cause": null }`.

Error schema: `{ code*: number, detail*: String, cause: String }`.

### 2. Get payment information

`GET /api/payment-v1/payment/info?id={payment_id}`

Headers: `X-Client-Id`, `X-Client-Secret` (required). Query: `id` (required) —
payment id.

```
curl --location 'https://payment.dappportal.io/api/payment-v1/payment/info?id={payment_id}' \
--header 'X-Client-Id: {your_client_id}' \
--header 'X-Client-Secret: {your_client_secret}'
```

Response `200` schema:

```
{
    id*: String,
    buyerDappPortalAddress*: String(maxLength: 42),
    pgType*: String(Enum: [STRIPE,CRYPTO,LINE_IAP]),
    status*: String(Enum: [CREATED,STARTED,REGISTERED_ON_PG,CAPTURED,CONFIRMED,CONFIRM_FAILED,FINALIZED,CANCELED])
    currencyCode*: String(Enum: [USD,KRW,JPY,TWD,THB,KAIA,USDT]) | null,
    price*: String | null,
    decimal: Integer,
    cryptoGasFee: String,
    capturedAt: Long,
    txHash: String,
    lineIapProductId: String,
    usdExchangeRate: String,
    usdExchangePrice: String,
    items*: [Item {
           itemIdentifier: String(maxLength: 256),
           name: String(maxLength: 256),
           imageUrl: String(maxLength: 512),
           price: String,
           currencyCode: String(Enum: [USD,KRW,JPY,TWD,THB,KAIA,UDST]),
        }]
    testMode*: Boolean,
    refund: {
           type*: String(Enum:[CHARGEBACK, REFUND]),
           amount*: String,
           chargebackStatus: String(Enum:[NEEDS_RESPONSE, UNDER_REVIEW, WON, LOSE]),
    }
}
```

Field notes:

- `currencyCode` / `price`: may be `null` for LINE IAP when status is `CREATED` or `CANCELED`.
- `decimal`: number of decimal places for the currency — `18` for KAIA, `6` for
  USDT, `0` for KRW (Stripe). Interpret together with `price`.
- `cryptoGasFee`: blockchain gas fee for crypto payments.
- `capturedAt`: payment-approval timestamp in **ms since Unix epoch**. Stripe: time
  Stripe authorized the payment. Crypto: block-creation time of the block
  containing the tx. IAP: time the in-app purchase was approved.
- `txHash`: transaction hash (crypto payments only).
- `usdExchangeRate` / `usdExchangePrice`: FX rate / USD price at completion. Only
  returned when `pgType` is `STRIPE` and status is `CONFIRMED` or `FINALIZED`.
- `refund`: present for refunds/chargebacks. `refund.type` = `CHARGEBACK` or
  `REFUND`. `refund.amount` follows the price policy. `refund.chargebackStatus`:
  `NEEDS_RESPONSE` (chargeback occurred, pre-contest), `UNDER_REVIEW` (dispute filed,
  under Stripe review), `WON` (dispute accepted), `LOST` (dispute not accepted).

The `info` endpoint can return statuses `REFUNDED` and `CHARGEBACK` in addition to
the create/finalize lifecycle (these are queryable only via this endpoint).

Error responses: `404` `{ "code": 1002, "detail": "Not found payment" }`; `401`
`{ "code": 1007, ... }`; `403` `{ "code": 4030, "detail": "Access denied due to
country restrictions." }`; `500` `{ "code": 500, ... }`.

### 3. Get payment status

`GET /api/payment-v1/payment/status?id={payment_id}`

Query: `id` (required). **No client headers needed.**

```
curl --location 'https://payment.dappportal.io/api/payment-v1/payment/status?id={payment_id}'
```

Response `200`: `{ "status": "{status}" }` — schema
`{ status*: String (Enum:[CREATED, STARTED, REGISTERED_ON_PG, CAPTURED, CONFIRMED_FAILED, FINALIZED, CANCELED]) }`
(plus `REFUNDED`, `CHARGEBACK`).

Errors: `403` `{ "code": 4030, ... country restrictions ... }`; `404` `{ "code":
1002, "detail": "Not found payment" }`; `500`.

### 4. Finalize payment

`POST /api/payment-v1/payment/finalize`

Makes the payment ready for settlement. **You cannot get settlement for a STRIPE
transaction if you did not call finalize.** Calling finalize is also recommended
for CRYPTO.

```
curl --location 'https://payment.dappportal.io/api/payment-v1/payment/finalize
--header 'Content-Type: application/json' \
  --data '{
    "id": "{payment_id}"
  }
```

Request body: `{ id*: String }`. Response `200`: empty/no body.

Errors: `403` `{ "code": 1004, "detail": "Invalid payment status." }` (current
status cannot complete finalization); `403` `{ "code": 4030, ... country
restrictions ... }`; `404` `{ "code": 1002, "detail": "Not found payment" }`; `500`.

For CRYPTO, if finalize is not called, the transaction is **auto-finalized 5
minutes after reaching `CONFIRMED`** (v1.2.1+ behavior).

---

## PaymentProvider SDK methods

### sdk.getPaymentProvider()

```js
const paymentProvider = sdk.getPaymentProvider();
```

Parameters: none. Returns: `PaymentProvider`.

### paymentProvider.startPayment()

Displays a transaction window and begins the payment process.

Parameters: `payment_id` (string, required). Returns: `Promise<unknown>` — resolves
when the payment reaches `CONFIRMED`.

Error codes:

| Code | Meaning |
|---|---|
| `-31001` | STRIPE payment canceled. `{ code: -31001, message: 'Payment is canceled by user or timeout' }` |
| `-31002` | `{ code: -31002, message: 'Payment is failed' }` |
| `-31003` | `{ code: -31003, message: 'Can not process LINE_IAP payment' }`. Triggered if: IAP permission not granted; browser is not a LIFF browser; user is not in Japan; or user has not agreed to the IAP terms. |
| `-32001` | CRYPTO payment canceled. `{ code: -32001, message: 'User denied transaction send.' }` |

All Payment API processes run as **non-cancellable jobs** (v1.4.5+) for stable
execution.

### paymentProvider.openPaymentHistory()

Opens a payment history window. A signature from the user is required to complete
the operation.

Parameters: none. Returns: `Promise<void>`.

The review guidelines require a payment-history UI — implement `openPaymentHistory()`
on the in-app store page or a frequently visited screen. (Bug in this method fixed
in v1.3.5/v1.3.6.)

---

## Payment webhooks

Each webhook's callback URL should be set differently. If `lockUrl` / `unlockUrl`
are not needed, enter `null`.

### 1. Lock event (`lockUrl`)

`lockUrl` is a server endpoint called to temporarily lock/reserve the item being
purchased — typically for limited-quantity items or NFTs, to prevent overselling.

- If `lockUrl` is included in the create-payment request, a **POST** request for
  the lock webhook is made.
- When `startPayment` is called, the webhook fires just before the user's payment
  flow starts, if the payment can proceed normally.
- If the lock request does not receive a `200` response, the payment is immediately
  canceled and marked failed automatically.

Body:

```
{
    "paymentId": "{payment_id}",
    "itemIdentifiers": [
        {
            "{your_item_identifier}"
        }
    ]
}
```

### 2. Unlock event (`unlockUrl`)

`unlockUrl` is called when a payment fails, is canceled, or times out, to release
the previously locked item.

- If `unlockUrl` is included, a **POST** is sent when a payment-failure event fires.
- If the payment succeeds (`status === CONFIRMED`), `unlockUrl` is **not** called;
  the item is finalized via a separate process (finalize API or internal logic).
- If the unlock request does not get a `200`, it is retried up to **5 times** at
  intervals of 1, 2, 4, 8 seconds. To avoid the item staying locked, implement a
  background job to retry unlocking.

Body: same shape as the lock event.

### 3. Payment status change event (`paymentStatusChangeCallbackUrl`)

A webhook is sent to `paymentStatusChangeCallbackUrl` whenever the payment status
changes, **except** when the status is `CREATED`.

- If the received status is `CONFIRMED`, you can call the finalize payment API.
- If the request does not get a `200`, up to **5 retries** at 1, 2, 4, 8 seconds.
  Even if `200` is never received, payment cancellation does NOT proceed.

Body:

```
{
    "paymentId": "{payment_id}"
    "status": "STARTED|REGISTERED_ON_PG|CAPTURED_CONFIRMED_CONFIRM_FAILED|FINALIZED|CANCELED|REFUNDED|CHARGEBACK"
    "cryptoPaymentInfo": { // added when "status" is CONFIRMED
        "paymentTxHash": "0x.."
        }
}
```

`cryptoPaymentInfo.paymentTxHash` is added when status is `CONFIRMED` (v1.4.0+).

The webhook callback URL must be **publicly accessible** (or whitelist the Unifi
server IPs) and must return `200 OK`.

---

## Payment status enum

| Status | Meaning |
|---|---|
| `CREATED` | Hosted the create-payment API but not yet `startPayment` of the SDK. |
| `STARTED` | Hosted `startPayment`, awaiting payment approval from the user (STRIPE/CRYPTO). |
| `REGISTERED_ON_PG` | (CRYPTO only) Transaction approved, awaiting enough block confirmations to prevent chain re-org — at least 10 block confirmations from the user's request for KAIA. |
| `CAPTURED` | (CRYPTO only) Checking transaction validity after 10 blocks confirmed from the user's transaction request. |
| `CONFIRMED` | Payment approval completed, awaiting payment finalization from the Mini Dapp. |
| `CONFIRM_FAILED` | (CRYPTO only) Failed to verify transaction validity after 10 blocks confirmed. |
| `FINALIZED` | Payment complete with approval + finalization. For CRYPTO, transactions auto-finalize 5 minutes after reaching `CONFIRMED` if finalize is not called. |
| `CANCELED` | Payment cancelled per the cancellation policy. |
| `REFUNDED` | Payment refunded. (Queryable only via the get-payment-information API.) |
| `CHARGEBACK` | User claimed a chargeback directly. (Queryable only via get-payment-information.) |

A webhook is sent at each stage, including when a `CHARGEBACK` occurs.

---

## Payment policy

### Supported payment methods by version

| Version | Payment | Region |
|---|---|---|
| LINE MINI App | IAP payments | Japan only |
| LINE Login LIFF | Crypto & Stripe (Fiat) payments | Global |
| Web | Crypto & Stripe (Fiat) payments | Global |

Unifi Apps must provide **both fiat and crypto** payment options on the product
purchase screen, each as a separate button (for LINE Login LIFF / Web).

- **Fiat via IAP** — in-app billing through the LINE App platform (LINE MINI App).
- **Fiat via Stripe** — global payment processing by Stripe. Supported methods:
  Credit/Debit cards (VISA, Mastercard, AMEX, JCB, etc.), Apple Pay, Google Pay,
  Naver Pay (KRW only), Kakao Pay (KRW only). Methods adjust by device OS
  (iOS/Android) and selected currency (USD / local), and may change per Stripe
  policy.
- **Crypto** — supported cryptocurrencies: **KAIA** and **USDT**.

### Supported currencies & minimum charge limits

Columns: currency type, code, then minimum-payment-related thresholds. Last column
is the minimum charge amount.

| Type | Currency | (col) | Max | Min charge |
|---|---|---|---|---|
| Fiat | USD | 2 | 999,999 | 0.50 |
| Fiat | KRW | 0 | 999,999 | 750 |
| Fiat | JPY | 0 | 999,999 | 80 |
| Fiat | TWD (NTD) | 2 | 999,999 | 17 |
| Fiat | THB | 2 | 999,999 | 18 |
| Crypto | KAIA | 4 | 999,999 | 0.01 |
| Crypto | USDT | 2 | 999,999 | 0.01 |

Minimum payment per the FAQ: USD minimum **$0.5**, KAIA minimum **0.01 KAIA**.
USD must be the **default pricing currency**; JPY/TWD/THB/KRW are optional local
currencies per region.

### Price display & request rules

- All product prices must be displayed in **both** a fiat currency **and** a
  cryptocurrency (KAIA or USDT) — provides a stable purchasing experience and
  prevents confusion from crypto volatility.
- Developer input: Fiat via Stripe → a fixed USD-based amount. Crypto → a fixed
  amount in KAIA or USDT.
- **Currency conversion between USD and KAIA/USDT must be implemented by the Unifi
  App** — the SDK does not provide exchange rates. Use external services such as
  CoinMarketCap (CMC) or the Kaiascan Open API for real-time rates.

### User notification requirements

Provide clear, real-time payment-status feedback:

| Event | Notification |
|---|---|
| Fiat/Crypto payment successful and item delivered | Successful purchase |
| Payment failed | Purchase failed |
| User clicked "Back" or exited the Fiat/Crypto payment screen | Purchase canceled |
| User clicked Decline Signature on the Crypto payment screen | Purchase canceled |
| User's crypto balance insufficient | Insufficient balance |
| Other errors | Please try again later |

UI flow to show: **Payment in progress → Payment completed → Item delivered**.

### Payment history

Unifi Apps must provide a UI for users to check payment history (use
`openPaymentHistory()`).

---

## Refund policy

Unifi Apps should establish and communicate a clear, fair **non-refund policy**.

- **Global non-refund policy**: refunds, exchanges, returns, and cancellations are
  **not allowed** for digital products such as game items. All user inquiries and
  disputes between the Unifi App and users must be handled directly by the Unifi
  App operator. LINE NEXT does not intervene, mediate, or support refund disputes.
- **Fiat & Crypto payments**: refunds not permitted. Digital products are
  considered consumed once delivered. Price volatility is not a valid reason for a
  refund. The Unifi App must manage all user disputes independently.

### Mandatory UX requirements

Clearly inform users of the non-refund policy **before payment**. Minimum required
(directly below the Purchase/Payment button):

- "You agree that the product(s) is/are non-refundable."
- "If paid via LINE IAP, you agree to providing encrypted ID info to LY Corporation."

Recommended implementation: a **checkbox** the user must check to acknowledge the
non-refund policy; the purchase button stays **disabled until the checkbox is
checked**; a "View Details" link with the full refund policy and data-usage
details. If you implement View Details, include this data-provision info:

| Field | Value |
|---|---|
| Receiving Party | LY Corporation |
| Purpose for Provision | Processing product payments |
| Personal Information provided | Encrypted Identification Information |
| Retention Period | Until the purpose of provision is achieved |
| Country of Incorporation | Japan |
| Company URL | `https://www.lycorp.co.jp/` |
| Company Privacy Policy | `https://www.lycorp.co.jp/en/company/privacypolicy/` |

---

## Cancellation policy

Maximum time before a payment can be cancelled, by `pgType`:

**STRIPE:**

- Case 1 — create API hosted but SDK `startPayment` not executed: max cancellation
  time **2100sec + 180sec**. Response if payment is executed after cancellation:
  error when hosting SDK's `startPayment`.
- Case 2 — `startPayment` executed but user did not approve on the STRIPE page:
  max **400sec + 180sec**. Response after cancellation: cannot execute payment
  (expiration).

**CRYPTO:**

- Case 1 — create API hosted but SDK `startPayment` not executed: max
  **2100sec + 180sec**. Response after cancellation: error when hosting `startPayment`.
- Case 2 — `startPayment` executed but user did not approve the transaction: max
  **100sec + 180sec**. Response after cancellation: transaction fails with the gas
  fee paid if approved.
- Case 3 — `startPayment` executed and user approved the transaction past the max
  cancellation time: max **100sec + 180sec**. Response after cancellation:
  transaction fails with gas paid.

---

## Chargeback policy

A chargeback is when a customer or their bank cancels a transaction after a payment
dispute. Unifi monitors all transactions; a fee applies when a chargeback occurs.

- A **base fee of $15** is charged for every chargeback, regardless of whether you
  enter the dispute resolution process. The fee is automatically deducted from your
  settlement payment.
- If you proceed with a dispute, additional fees may apply depending on the outcome.

Fee structure by case:

| Case | Chargeback fee | Dispute fee | Win refund | Total fee | Notes |
|---|---|---|---|---|---|
| Case 1: No Dispute | $15 | - | - | **$15** | No dispute resolution requested |
| Case 2: Dispute → Win | $15 | $30 | $15 | **$30** | Final settlement = Transaction amount − refund-related fee − total fee |
| Case 3: Dispute → Lost | $15 | $30 | - | **$45** | Higher cost if dispute is lost |

Dispute resolution: when a chargeback occurs, a notification is sent within Unifi.
To proceed with dispute resolution, email `dl_dapp_chargeback@linecorp.com`. If you
win, part of the fees is refunded; if you lose, the total fee is $45.

---

## Settlement

> Contents subject to change based on policy revisions.

Cash flow components: **Product Price** (sales amount); **Platform Fee / Service
Fee** (fee LINE NEXT receives for the platform); **Royalty Fee / Contents Fee**
(royalty the Unifi App receives for NFT C2C transactions); **Payment Solution Fee**
(fee the payment processor collects).

### Unifi Apps in-app items

| Payment | Payout | Settlement |
|---|---|---|
| Fiat (B2C) | Product Price − Platform Fee − Payment Solution Fee − all other costs | USDT on Kaia, **monthly** (N+1 for transactions in N). |
| Crypto (B2C) | Product Price − Platform Fee | Crypto, **real-time** settlement. |

**Fiat settlement procedure**: payment processor deducts fees and confirms the
amount, pays LINE NEXT (N+1 W1~W2) → LINE NEXT deducts platform fees and converts
to USDT (N+1 W3) → Unifi App sees the final amount in the settlement report and
**claims directly** to get paid (N+1 W4). Settlement currency: **USDT** (USD-pegged
stablecoin on Kaia). Claimable address = address on the onboarding contracts (same
as the crypto settlement address). The Unifi App can withdraw freely once the
withdrawal period begins.

**Crypto settlement procedure**: the smart contract automatically calculates fees
from the Product Price and pays the balance to the seller. LINE NEXT provides a
quarterly settlement report (N+3).

### NFTs

- Crypto Payment (B2C): Payout = Product Price − Platform Fee (discounted rates
  during promo periods).
- Crypto Payment (C2C): Payout = Royalty fee — a rate the Unifi App sets directly,
  **0–10% of the Product Price**.
- Crypto settlement for NFTs is instant, same as in-app items.

### LINE MINI IAP

Payout = Product Price − Payment Solution Fee (**30%**) − all other costs. LINE IAP
payment and settlement policies are governed by LY Corporation's policies.

### Claiming USDT for a STRIPE transaction

Settlement of Stripe revenue (from the end-of-July 2025 settlement onward) is
claimed by the Unifi App calling a Claim API:

1. Retrieve transaction-creation info for the claim from Unifi.
2. Sign the transaction with the address currently receiving Kaia-based settlements.
3. Broadcast the signed transaction — via the Fee Payer Server if fee delegation is
   enabled, or directly to a Kaia node otherwise.

**Claim info API**: `GET https://api.dappportal.io/api/b2b-v1/dapp-settlements/{client_id}/signed-receivable`.

Authentication headers (Unifi HMAC auth):

| Header | Description |
|---|---|
| `client_id` (path param) | Client identifier string (36 bytes) from support |
| `X-Auth-Client-Id` | Client identifier string (36 bytes) from support |
| `X-Auth-Timestamp` | Current time in Unix epoch format |
| `X-Auth-Salt` | Randomly generated UUID string (36 bytes) |
| `X-Auth-Signature` | HMAC-based signature proving request authenticity |

Signature: `base64encode(hmac("{clientId}|GET|/api/b2b-v1/dapp-settlements/{clientId}/signed-receivable|{timestamp}|{salt}"))`.

Response:

```
{
  "receivable": {
    "claimer_id": "",
    "sequence_begin": "",
    "sequence_end": "",
    "vault_address": "",
    "recipient_address": "",
    "token_address": "",
    "amount": "",
    "deadline": ""
  },
  "signature": "",
  "transaction": {
    "to": "",   // contract address to call
    "data": "", // smart contract data
    "value": "" // native token amount, e.g. "0x0"
  }
}
```

Sample — retrieve the transaction (HMAC + load):

```js
function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let b of bytes) {
        binary += String.fromCharCode(b);
    }
    return btoa(binary);
}

async function calcHmac(clientSecret, clientId, method, path, timestamp, salt) {
    const msg = `${clientId}|${method.toUpperCase()}|${path}|${timestamp}|${salt}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(clientSecret),
        {name: 'HMAC', hash: {name: 'SHA-256'}},
        false,
        ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
    return toBase64(sig);
}

async function load(domain, clientId, clientSecret) {
    const request = {
        method: 'GET',
        path: `/api/b2b-v1/dapp-settlements/${clientId}/signed-receivable`,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        salt: crypto.randomUUID()
    };

    // prepare the hmac
    const signature = await calcHmac(
        clientSecret,
        clientId,
        request.method,
        request.path,
        request.timestamp,
        request.salt,
    );

    // load the transaction
    const response = await fetch(
        `${domain}${request.path}`, {
            method: request.method,
            headers: {
                'X-Auth-Client-Id': clientId,
                'X-Auth-Timestamp': request.timestamp,
                'X-Auth-Salt': request.salt,
                'X-Auth-Signature': signature,
            },
        });
    return await response.json();
}
```

Sample — sign and broadcast (Kaia Wallet web extension; direct broadcast and
fee-delegated broadcast). Add `type: 49` when creating the transaction to use fee
delegation; fee payer server domain `https://fee-delegation.kaia.io`, path
`/api/signAsFeePayer`, `POST` `application/json` `{ userSignedTx: {rawSignedTx} }`:

```js
async function connect() {
    const provider = window.klaytn;
    await provider.request({
        method: 'klay_requestAccounts',
        params: [],
    });
}

#In case of broadcasting signed tx directly
async function claim(transaction) {
    // sign the transaction
    const provider = window.klaytn;
    const gasPrice = await provider.send('klay_gasPrice', []);
    const sufficientGas = '0x40000';
    const tx = {
        from: provider.selectedAddress,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
        gasPrice: gasPrice.result,
        gas: sufficientGas,
    };
    return await provider.send('klay_sendTransaction', [tx]);
}

#In case of broadcasting signed tx wih fee delegation server
async function claimFeeDelegated(domain, transaction) {
    // sign the transaction
    const provider = window.klaytn;
    const gasPrice = await provider.send('klay_gasPrice', []);
    const sufficientGas = '0x40000';
    const tx = {
        type: 49,
        from: provider.selectedAddress,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
        gasPrice: gasPrice.result,
        gas: sufficientGas,
    };
    const signedTx = await provider.send('klay_signTransaction', [tx]);

    // send the signed transaction to the fee delegation server
    const response = await fetch(`${domain}/api/signAsFeePayer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userSignedTx: {raw: signedTx.result.rawTransaction},
        }),
    });
    return await response.json();
}
```

The example code is illustrative only — review and adapt it for your production
environment.
