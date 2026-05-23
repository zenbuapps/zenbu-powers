# In-App Purchase (IAP) — Overview, Implementation & API

Source:
- `https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/overview/`
- `https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/iap-guidelines/`
- `https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/request-iap-review/`
- `https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/iap-settings/`
- `https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/implement-in-app-purchase/`
- `https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/iap-product-id/`
- `https://developers.line.biz/en/reference/line-mini-app/#in-app-purchase` (API reference)

## Table of contents

- What IAP is
- Conditions & requirements
- System architecture & flow
- Applying for IAP & setting it up
- Implementation flow
- Test payments
- Production operation checklist
- IAP development guidelines
- **Client API: `liff.iap.getPlatformProducts()`**
- **Client API: `liff.iap.requestConsentAgreement()`**
- **Client API: `liff.iap.createPayment()`**
- **Server API: Reserve purchase**
- **Server API: Get webhook event history**
- **Webhook events: purchaseComplete / refundComplete**
- **Signature verification & error responses**
- Product IDs

> **Application required.** To use IAP you must apply through the LINE
> Developers Console and receive approval. IAP is an optional feature,
> **available only in Japan**.

---

## What IAP is

In-app purchase lets users buy digital content within a
[verified MINI App](https://developers.line.biz/en/docs/line-mini-app/discover/introduction/#verified-mini-app).
Currently **only consumable digital content** is available for purchase. Users
launch the LINE MINI App inside LINE; payment is processed via the App Store or
Google Play.

IAP features: uses App Store / Google Play payment; payment verification &
notification by the LINE Platform; client implemented with the LIFF SDK;
server-side integration via webhooks.

## Conditions & requirements

**Use conditions** — the LINE MINI App channel must have both **Region to
provide the service** and **Company or owner's country or region** set to
**Japan**.

**Requirements:**

- The LINE MINI App is a verified MINI App (unverified MINI Apps work only on
  the Developing and Review internal channels).
- LIFF SDK version is **2.26.0 or later**.
- The LINE MINI App is opened in the LIFF browser.
- The user has registered a **Japanese phone number** with their LINE account.
- The user's LINE version is **15.6.0 or later**.

**Items & prices**: items available via IAP are pre-defined on the LINE
Platform; prices are defined in Japanese yen. When displaying items, you **must**
display prices in the currency localized to the region of the user's app store
— get localized prices via `liff.iap.getPlatformProducts()` to minimize the gap
between your displayed price and the app store's price.

**Cancellations / refunds**: LY Corporation does not support cancellations of
completed IAP payments. For fraud or accidental payment, direct users to request
a refund directly from the app store per its refund policy.

## System architecture & flow

| Component | Role |
|---|---|
| LINE MINI App | Receives user actions and initiates the purchase transaction. |
| LINE MINI App server | Reserves purchases, receives webhooks, manages purchase results. |
| LINE Platform | Verifies store payments and sends webhook events. |
| App store | Performs actual payment transactions (iOS: App Store; Android: Google Play). |

Flow to start using IAP:

| Step | Details |
|---|---|
| Step 1: Apply to use IAP | Apply from the **In-app purchase** tab of the LINE MINI App channel. Enter all info accurately incl. the company name. Only verified LINE MINI Apps can offer IAP to users, but you can apply even with unverified MINI Apps. |
| Step 2: Set up IAP | Once the application is "Approved", register the webhook URL and testers in the **In-app purchase settings** tab. |
| Step 3: Integrate IAP into the Developing channel & perform test payments | Integrate IAP on the Developing channel and perform test payments. |
| Step 4: Apply for a verification review | Apply for review via the **Review request** tab. Turn on the **Release the in-app purchase feature** toggle. If you added IAP to an already-published verified MINI App, review is required again. |
| Step 5: Release the LINE MINI App with IAP | Once the verification review is approved, release. |

## Applying for IAP & setting it up

### Applying

- IAP review takes approximately **two weeks**; the completion date cannot be
  specified. A rejection adds a few more days for re-application/re-review.
- During the verification review you **cannot** apply for IAP; during the IAP
  review you **cannot** apply for the verification review.
- After IAP approval you must apply for the [verification review](https://developers.line.biz/en/docs/line-mini-app/submit/submission-guide/)
  (a separate review period).

Application flow:

1. **Enter required information** on the **In-app purchase** tab: Business
   information / LINE MINI App information; Information security; upload the LY
   Corporation business partner information application form.
2. **Apply** by clicking **Apply to use in-app purchase**. Until the review
   begins the status is "Applied for review" and you can **cancel** the
   application.
3. **Configure after approval** — once approved, the **Apply to use in-app
   purchase** tab and **In-app purchase settings** tab appear.

The IAP contract entity info must all match the "Service company information"
on the **Business information** tab: Company name; Name of the organization
performing the operations; (in the LY Corporation business partner form) Company
name and Payment account holder name.

To change application info: edit the **Apply to use in-app purchase** tab.
Changing it requires re-applying for IAP review (you cannot edit while
"Applied for review" or "Reviewing"). Changes to the **In-app purchase
settings** tab (webhook URL, testers) do **not** require re-review.

### Setting up IAP

After approval, in the **In-app purchase settings** tab:

**Register the webhook URL** — IAP uses webhooks to receive payment status
changes (completion, refund). You can set the same URL for both Developing and
Published. Register a **Webhook URL for developing** and a **Webhook URL for
published**; the URL must start with `https://`; click **Update**.

**Use the test payment feature** — when an account with a tester permission
performs a payment in a Developing channel, it is treated as a test payment.
Tester permissions for the test payment feature: up to **20 accounts** with the
Admin or Tester role; validity **30 days**.

Register testers: in **In-app purchase settings**, select an account from the
**Select a tester** dropdown (lists accounts already added in the **Roles**
tab), click **Enable**. Manage testers: **Extend** (resets expiry to 30 days
out), **Disable** (immediately blocks test payments). Expired permissions can
be re-enabled.

## Implementation flow

1. **Check if the environment supports IAP** — `liff.isApiAvailable("iap")`.

   ```javascript
   liff.isApiAvailable("iap");
   ```

   In an external browser, or on a LINE version that doesn't support IAP,
   disable the app or hide the purchase flow. Even when the env supports IAP,
   IAP cannot be used if user consent isn't obtained (step 3) or is later
   revoked.

2. **Get information about purchasable items** — `liff.iap.getPlatformProducts()`
   for localized prices/currencies/names. Items are pre-defined by LY
   Corporation in Japanese yen.

   ```javascript
   const productIds = ["iap_ln_002", "iap_ln_003"];
   await liff.iap.getPlatformProducts({ productIds });
   ```

3. **Obtain user consent** — `liff.iap.requestConsentAgreement()` for the
   [Terms of Use: LINE In-App Purchase System](https://terms.line.me/line_iap_tou_1?lang=en).

   ```javascript
   await liff.iap.requestConsentAgreement();
   ```

   Consent is once **per user**, not per LINE MINI App. If the user already
   consented in another LINE MINI App, re-consent isn't required. If the Terms
   are updated, re-consent may be required — always call this method when
   starting IAP. Users without consent cannot reserve or initiate a purchase.

4. **Reserve a purchase from your server** — use the [Reserve purchase](#server-api-reserve-purchase)
   endpoint, e.g. when the user taps the purchase button. Get the additional
   params: user access token from `liff.getAccessToken()`; `clientIp` = the
   user's IP from your server; `clientOs` = the value from `liff.getOS()`. A
   successful reservation does **not** complete the purchase. Record the
   returned `orderId` (also included in the purchaseComplete webhook) and the
   `x-line-request-id` response header in logs/storage.

5. **Start the purchase transaction at the store** — `liff.iap.createPayment()`.

   ```javascript
   await liff.iap.createPayment({
     productId,
     orderId,
   });
   ```

   When the transaction succeeds, the LINE Platform verifies the payment with
   the store, then notifies the webhook endpoint of the purchaseComplete event.
   If the purchase is canceled or fails, an exception is thrown — implement
   error handling:

   ```javascript
   try {
     await liff.iap.createPayment({
       productId,
       orderId,
     });
   } catch (e) {
     // e => { code: "CANCELED", message: "Transaction was canceled." }
     console.error({
       code: e.code,
       message: e.message,
     });
   }
   ```

6. **Receive the webhook and process purchase completion** — on the
   purchaseComplete webhook event, verify on your server and grant the item.
   The same event may be delivered multiple times (network/app errors, or the
   LINE Platform not confirming receipt). Dedupe by `orderId` and grant the item
   **only once** per purchase. Always determine purchase completion from the
   webhook event.

   **Verify the webhook signature** using `x-line-signature` (see below).

   **Response to the webhook**: the LINE Platform doesn't verify the response
   content (any payload is allowed), but on successful receipt the server **must
   return a 2xx** status code. Any other code (3xx/4xx/5xx) is treated as a
   failure and triggers redelivery, multiple times within 30 minutes.

   **Get webhook event history** via the [Get webhook event history](#server-api-get-webhook-event-history)
   endpoint to recover failed events.

## Test payments

After integrating IAP, test payments become available on the Developing
channel — verify purchasing items and checking purchase history without actual
billing.

Users performing test payments must have **both**: the Admin or Tester role for
the LINE MINI App channel, **and** tester permissions for the test payment
feature (set in **In-app purchase setup**).

Test procedure:

1. Register a tester in the LINE MINI App channel.
2. Share the Developing channel's LIFF URL (from the **Web app settings** tab)
   with the tester.
3. The tester launches the LINE MINI App from that LIFF URL and performs a
   payment.

## Production operation checklist

**User notification on successful payment**: when a payment completes, an
automatic message is sent from the LINE Official Account "LINEアプリ内課金お知らせ"
(LINE In-App Purchase Notification) by LY Corporation — no developer action
needed. Users cannot block this account or change its notification settings.

**How users check purchase history**: in the LINE app, **Settings** >
**In-app purchases**, or from messages from the "LINEアプリ内課金お知らせ" OA.
History for up to one year is shown. The "In-App Purchases" screen shows: (1)
the `shopProductName` from the purchase reservation; (2) LY Corporation's
service name + the service provider's service name; (3) app store info; (4)
payment time (when the LINE Platform confirmed the payment); (5) currency and
price at the time of payment.

## IAP development guidelines

Also follow the [LINE MINI App development guidelines](https://developers.line.biz/en/docs/line-mini-app/development-guidelines/).

**Prohibited:**

- **Don't restrict access by IP address.** On webhook-receiving servers, don't
  filter by the LINE Platform's IP — it's undisclosed and may change. Use
  signature verification instead.

**Required:**

- **Verify access token validity.** When making a purchase reservation, use the
  [Verify access token validity](https://developers.line.biz/en/reference/line-login/#verify-access-token)
  endpoint to verify the access token validity, channel ID, and expiry on your
  server.

**Recommended:**

- **Implement with non-breaking changes in mind.** IAP may add features without
  notice: new endpoints; optional request params/fields/headers; new response
  fields/headers; new enum values; new webhook event object properties; changed
  property order; whitespace/line-break differences. Your server must work with
  these.
- **Verify the webhook signature.** Compute an HMAC-SHA256 digest of the request
  body with the channel secret as the key, Base64-encode it, and compare to the
  `x-line-signature` header.

  ```java
  class WebhookProcessor {
      void verify(String httpRequestBody) { // Request body string
          String channelSecret = '...'; // Channel secret string
          SecretKeySpec key = new SecretKeySpec(channelSecret.getBytes(), "HmacSHA256");
          Mac mac = Mac.getInstance("HmacSHA256");
          mac.init(key);

          byte[] source = httpRequestBody.getBytes("UTF-8");
          String signature = Base64.encodeBase64String(mac.doFinal(source));
          // Compare x-line-signature request header string and the signature
      }
  }
  ```

- **Eliminate duplicates.** The same webhook event may arrive multiple times —
  use `orderId` so items aren't granted (or cancels processed) more than once.
- **Implement proper error handling.** A purchase reservation doesn't guarantee
  payment — on a network error, retry or prompt the user.
- **Don't send duplicate payment notifications.** On purchase completion (and on
  cancellation), a message is auto-sent from the "LINE In-App Purchase
  Notifications" OA. Don't send the same type of notification from another OA.

---

# Client API: `liff.iap.getPlatformProducts()`

Gets a list of items available for purchase via in-app purchase.

### Syntax

```javascript
liff.iap.getPlatformProducts({ productIds });
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `productIds` | Yes | Array of strings | Array of [product IDs](#product-ids) for items you want to retrieve. |

### Return value

A `Promise`. On resolve, an object keyed by product ID, each value with:

| Property | Type | Description |
|---|---|---|
| `currency` | String | Currency code in ISO 4217 format, localized to the region of the user's app store. |
| `price` | Number | Item price, localized to the region of the user's app store. |
| `productName` | String | Item name, localized to the region of the user's app store. |

### Example

```javascript
const productIds = ["iap_ln_002", "iap_ln_003"];
liff.iap
  .getPlatformProducts({ productIds })
  .then((products) => {
    console.log(products);
  })
  .catch((err) => {
    console.error(err);
  });
```

Example return value:

```json
{
  "iap_ln_002": {
    "currency": "JPY",
    "price": 100,
    "productName": "LINE Purchase 100"
  }
}
```

### Error response

On rejection, a [`LiffError`](https://developers.line.biz/en/reference/liff/#liff-error-object).

| Error message | Description |
|---|---|
| Need access_token for api call, Please login first | The user is not logged in. |
| In-App Purchase is not allowed in external browser | The method was executed in an external browser. |
| In-App Purchase is not allowed in this LIFF app | The LINE MINI App does not support in-app purchase. |

---

# Client API: `liff.iap.requestConsentAgreement()`

Requests user consent for the [Terms of Use: LINE In-App Purchase System](https://terms.line.me/line_iap_tou_1?lang=en).
If the user has not agreed or new consent is required, a consent screen is
displayed.

> Always check the latest consent status — if the Terms are updated, re-consent
> is required. Before starting IAP, call this method.

### Syntax

```javascript
await liff.iap.requestConsentAgreement();
```

### Arguments

None.

### Return value

A `Promise`. Resolves if the user agrees. Rejects with an error object if the
user doesn't agree, or the operation fails due to a network issue, a problem on
the user's device, or an internal LINE Platform error.

### Error response

On rejection, a [`LiffError`](https://developers.line.biz/en/reference/liff/#liff-error-object).

| Error message | Description |
|---|---|
| The user did not agree to the terms. | The user did not agree to the Terms of Use. |
| Need access_token for api call, Please login first | The user is not logged in. |
| In-App Purchase is not allowed in external browser | The method was executed in an external browser. |
| In-App Purchase is not allowed in this LIFF app | The LINE MINI App does not support in-app purchase. |

```json
{
  "code": "TERMS_AGREEMENT_ERROR",
  "message": "The user did not agree to the terms."
}
```

---

# Client API: `liff.iap.createPayment()`

Launches the app store payment confirmation screen (App Store, Google Play) and
starts the purchase transaction.

### Syntax

```javascript
liff.iap.createPayment({ productId, orderId });
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `productId` | Yes | String | Pre-defined [product ID](#product-ids). |
| `orderId` | Yes | String | Order ID obtained from the [Reserve purchase](#server-api-reserve-purchase) endpoint. |

### Return value

A `Promise<void>`. Resolves if the purchase completes successfully. Rejects with
an error object if the purchase is canceled, or the operation fails due to a
network issue, a problem on the user's device, or an internal LINE Platform
error.

### Error response

On rejection, a [`LiffError`](https://developers.line.biz/en/reference/liff/#liff-error-object).

| Error message | Description |
|---|---|
| Need access_token for api call, Please login first | The user is not logged in. |
| In-App Purchase is not allowed in external browser | The method was executed in an external browser. |
| In-App Purchase is not allowed in this LIFF app | The LINE MINI App does not support in-app purchase. |

---

# Server API: common — Response headers & error response

### Response headers

IAP responses include this HTTP header. Save it to logs for future inquiries to
LY Corporation:

| Response header | Description |
|---|---|
| `x-line-request-id` | Request ID, issued per request. |

### Error response

When the HTTP status code is 4xx or 5xx, the response body is JSON:

| Property | Required | Type | Description |
|---|---|---|---|
| `errorCode` | Yes | String | Error code. |
| `message` | Yes | String | Error message. |
| `details` | Not always | array | Error details. |
| `details[].message` | Not always | String | Detailed message. |
| `details[].property` | Not always | String | Location where the error occurred. |

4xx example:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": [
    {
      "message": "'clientOs' must be 'android' or 'ios'. Actually received: 'INVALID'",
      "property": "clientOs"
    }
  ]
}
```

5xx example:

```json
{
  "errorCode": "INTERNAL_SERVER_ERROR",
  "message": "An internal server error occurred."
}
```

---

# Server API: Reserve purchase

Reserves the purchase before starting the app store payment. The `orderId` in
the response is also included in the purchaseComplete event — save it (required
for inquiries). A successful reservation does **not** guarantee purchase
completion — grant items based on the purchaseComplete event.

### HTTP request

`POST https://api.line.me/iap/v1/product/reserve`

### Request headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {user access token}` — the current user's access token, obtained with `liff.getAccessToken()`. |
| `Content-Type` | Yes | `application/json` |

### Request body

| Property | Required | Type | Description |
|---|---|---|---|
| `clientIp` | Yes | String | The IP address of the user's device, obtained from the server. IPv4 or IPv6. |
| `clientOs` | Yes | String | The value from `liff.getOS()` — either `ios` or `android`. |
| `productId` | Yes | String | The [product ID](#product-ids) of the item to be purchased. |
| `shopProductName` | Yes | String | The item name displayed in the purchase history. No emojis or symbols. Max 20 characters (UTF-16). Set a value users can recognize. |

### Example request

```sh
curl -X POST https://api.line.me/iap/v1/product/reserve \
-H "Authorization: Bearer {UserAccessToken}" \
-H "Content-Type: application/json" \
-d '{
"clientIp": "192.168.1.1",
"clientOs": "android",
"productId": "iap_ln_002",
"shopProductName": "Premium Package"
}'
```

### Response

Status `200` with a JSON object:

| Property | Type | Description |
|---|---|---|
| `orderId` | String | Order ID. |

```json
{ "orderId": "T2025020710000002126002" }
```

### Error response

Format: see [common error response](#server-api-common--response-headers--error-response).
Errors beyond the general ones:

| Error code | Description |
|---|---|
| VALIDATION_ERROR | Request constraints not met (e.g. `clientOs` is not `ios`/`android`). |
| WEBHOOK_URL_IS_NOT_SET | The webhook URL to receive payment completion notifications is not set. |
| PRODUCT_ID_NOT_FOUND | The requested product ID does not exist. |
| BLOCKED_USER | This user was determined to be a fraudulent user by the LINE Platform — requests for this user can't be processed. |
| INTERNAL_SERVER_ERROR | A temporary issue on the LINE Platform — for retryable endpoints, retry with exponential backoff. |
| TERMS_AGREEMENT_ERROR | The user hasn't agreed to the latest Terms (see "Obtain user consent for in-app purchase"). |

---

# Server API: Get webhook event history

Gets the history of webhook events sent by the LINE Platform. Retrieves up to
100 events at a time using **cursor-based pagination**. Sort order: ascending by
the date/time the LINE Platform started sending the webhook event. Only events
sent in the **past 7 days** can be retrieved. Currently only purchaseComplete
events are available; refund events will be supported in the future.

### HTTP request

`GET https://api.line.me/iap/v1/webhook/events`

### Request headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer {channel access token}` |

### Query parameters

| Parameter | Required | Type | Description |
|---|---|---|---|
| `startEpochSeconds` | Yes | Number | Start date/time of the retrieval period (inclusive). UNIX time (seconds) within the past 7 days. |
| `endEpochSeconds` | Yes | Number | End date/time of the retrieval period (inclusive). UNIX time (seconds) within the past 7 days. |
| `cursor` | No | String | Cursor for the webhook event page. Don't specify in the first request; for later requests, pass the `nextCursor` from the previous response. |
| `pageSize` | Yes | Number | Number of webhook events per page. Min 1, max 100. |
| `status` | No | String | Status of events to retrieve: `SUCCESS` (successfully received) or `FAILED` (failed to be received). If not specified, all events are retrieved. |

> During pagination, do **not** change parameters other than `cursor`. To
> change other parameters, start from the first page again.

### Example request

```sh
curl "https://api.line.me/iap/v1/webhook/events?startEpochSeconds=1747330438&endEpochSeconds=1747708454&pageSize=10" \
  -H "Authorization: Bearer {ChannelAccessToken}"
```

### Response

Status `200` with a JSON object:

| Property | Type | Description |
|---|---|---|
| `events` | Array | List of webhook events. |
| `events[].transactionType` | String | Always returns `PRODUCT`. |
| `events[].event` | Object | The [webhook event object](#webhook-events). |
| `nextCursor` | String (not always) | Cursor for the next page. `null` if there is no next page. |

```json
{
  "events": [
    {
      "transactionType": "PRODUCT",
      "event": {
        "type": "purchaseComplete",
        "orderId": "T2025020710000002126002",
        "productId": "iap_ln_002",
        "userId": "U91FC5A...",
        "purchaseTimestamp": 1738672496,
        "channelId": "12345..."
      }
    }
  ],
  "nextCursor": "MTY3NjU0"
}
```

### Error responses

Format: see [common error response](#server-api-common--response-headers--error-response).
Errors beyond the general ones:

| Error code | Description |
|---|---|
| VALIDATION_ERROR | Request constraints not met (e.g. `status` is not `SUCCESS`/`FAILED`). |
| INTERNAL_SERVER_ERROR | A temporary issue on the LINE Platform — for retryable endpoints, retry with exponential backoff. |

---

# Webhook events

When your LINE MINI App server receives a webhook request, **verify the
signature** in the request header before processing the event. Compute an
HMAC-SHA256 digest of the raw request body keyed by the channel secret,
Base64-encode it, and compare to the `x-line-signature` header. See
[Verify webhook signature](https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/)
in the Messaging API docs.

## Purchase complete event

Occurs when a user purchases a reserved item at an app store and the payment is
settled by LY Corporation. The payload contains info about the purchased item.

### Webhook payload

| Property | Type | Description |
|---|---|---|
| `type` | String | `purchaseComplete`. |
| `orderId` | String | The ID of the order purchased by the user (included in the Reserve purchase response). |
| `productId` | String | The product ID of the item purchased. |
| `userId` | String | The user ID of the purchasing user. |
| `purchaseTimestamp` | number | The time the payment was completed on the LINE Platform. UNIX time (seconds). Not the time the user actually completed the payment. |
| `channelId` | String | The channel ID of the LINE MINI App channel. |

```json
{
  "type": "purchaseComplete",
  "orderId": "T2025020710000002126002",
  "productId": "iap_ln_002",
  "userId": "U91FC5A...",
  "purchaseTimestamp": 1738672496,
  "channelId": "12345..."
}
```

## Refund event

Occurs when a refund was issued for an item purchased by a user at an app store.

### Webhook payload

| Property | Type | Description |
|---|---|---|
| `type` | String | `refundComplete`. |
| `orderId` | String | The ID of the order refunded (included in the Reserve purchase response). |
| `productId` | String | The product ID of the refunded item. |
| `userId` | String | The user ID of the user who requested the refund. |
| `purchaseTimestamp` | number | The time the refunded item was purchased. UNIX time (seconds). Matches the `purchaseTimestamp` of the purchase complete event. Not when the user completed the refund. |
| `channelId` | String | The channel ID of the LINE MINI App channel. |

```json
{
  "type": "refundComplete",
  "orderId": "T2025020710000002126002",
  "productId": "iap_ln_002",
  "userId": "U91FC5A...",
  "purchaseTimestamp": 1738672496,
  "channelId": "12345..."
}
```

---

# Product IDs

Items available for purchase via IAP have pre-defined product IDs (`productId`)
with prices localized for Japan (JPY). Product IDs follow the pattern
`iap_ln_NNN`. The catalog spans **654 product IDs** covering price points from
**¥50 to ¥57,800**.

Price granularity:

| Price range | Granularity |
|---|---|
| ¥50 – ¥2,000 | every ¥10 (`iap_ln_001`–`iap_ln_209`, non-contiguous numbering) |
| ¥2,000 – ¥10,000 | mostly ¥100 increments with ¥80/¥90 alternations |
| ¥10,000 – ¥15,000 | every ¥100 |
| ¥15,000 – ¥50,000 | every ¥400 (with ¥980-ending points) |
| ¥50,000 – ¥57,800 | every ¥800 (with ¥980-ending points) |

Example product IDs: `iap_ln_001` = ¥50, `iap_ln_002` = ¥100, `iap_ln_003` =
¥150, `iap_ln_020` = ¥1,000, `iap_ln_030` = ¥2,000, `iap_ln_060` = ¥5,000,
`iap_ln_441` = ¥10,000, `iap_ln_654` = ¥57,800.

For the complete product-ID-to-price table, see
[List of product IDs](https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/iap-product-id/)
in the official docs. Which pre-defined items a LINE MINI App supports is decided
by the service provider's policy.
