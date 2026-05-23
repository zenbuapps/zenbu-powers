# Online API (v4, v3)

Source:
- `https://developers-pay.line.me/online-api-v4` and its 11 endpoint pages
- `https://developers-pay.line.me/online-api-v3` (legacy)

The LINE Pay Online API processes **online payments** (web / app shops). Host:
`api-pay.line.me` (production) or `sandbox-api-pay.line.me` (sandbox). Auth: HMAC
signing — see `references/common-and-auth.md`. All endpoints below are **v4**;
the v3 differences are noted at the end.

> To enable online payments you must integrate the API **and** implement
> redirection pages (`confirmUrl` / `cancelUrl`) — see
> `references/redirection-pages.md`.

In every parameter table below: indentation = object nesting; the last column
is the Required (request) / Included (response) flag — `REQUIRED` means the
field is mandatory inside its parent object, `-` means optional/conditional.

## Table of contents

1. Request payment — `POST /v4/payments/request`
2. Check payment request status — `GET /v4/payments/requests/{transactionId}/check`
3. Confirm payment — `POST /v4/payments/{transactionId}/confirm`
4. Capture — `POST /v4/payments/authorizations/{transactionId}/capture`
5. Void — `POST /v4/payments/authorizations/{transactionId}/void`
6. Retrieve payment details — `GET /v4/payments`
7. Refund — `POST /v4/payments/{transactionId}/refund`
8. Check pre-approved payment key status — `GET /v4/payments/preapprovedPay/{regKey}/check`
9. Request pre-approved payment — `POST /v4/payments/preapprovedPay/{regKey}/payment`
10. Discard pre-approved payment key — `POST /v4/payments/preapprovedPay/{regKey}/expire`
11. Online API v3 differences

---

## 1. Request payment

`POST /v4/payments/request`

Uses the entered payment information to request payment to the LINE Pay server.
On success the customer is redirected to the LINE Pay authentication screen. A
`transactionId` is returned, used for confirm / void / capture / refund. Set the
read timeout to **at least 10 seconds**.

**Path / Query**: None.

### Request body

| Name | Type | Length | Description | Required |
|---|---|---|---|---|
| `amount` | number | | Payment amount. | REQUIRED |
| `currency` | string | 3 | Payment currency code (ISO 4217): `"USD"`, `"TWD"`, `"THB"`. | REQUIRED |
| `options` | object | | Payment request settings. | REQUIRED |
| &nbsp;&nbsp;`options.display` | object | | Screen-related information for payment requests. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.display.checkConfirmUrlBrowser` | boolean | | On redirecting to `redirectUrls.confirmUrl` after confirming, whether to return to the original browser. Default `false`. `true`: if not on the original browser window, show a message to redirect back. `false`: redirect without checking the browser. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.display.locale` | string | | Language code of the pending payment page (BCP-47). Default `"en"`. Supported: `"en"`, `"ja"`, `"ko"`, `"th"`, `"zh_TW"`, `"zh_CN"`. | - |
| &nbsp;&nbsp;`options.events[]` | object array | | Promotion event information; enter when the transaction meets promotion conditions set up with LINE Pay. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.events[].code` | string | 30 | Promotion event code — identifies which promotion to apply. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.events[].productQuantity` | number | | Quantity for a fixed-amount rebate promotion (multiplied by a fixed amount). If set, `options.events[].totalAmount` must be `null`. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.events[].totalAmount` | number | | Amount for a fixed-rate rebate promotion. If set, `options.events[].productQuantity` must be `null`. | - |
| &nbsp;&nbsp;`options.extra` | object | | Additional information on merchants. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.extra.branchId` | string | 32 | ID of the merchant branch requesting payment. Truncated to max length if exceeded. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.extra.branchName` | string | 200 | Name of the merchant branch. Alphanumeric and special characters only. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.extra.promotionRestriction` | object | | Promotion restriction info — price for products where promotions cannot apply due to law/regulation. **TW only**. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`options.extra.promotionRestriction.rewardLimit` | number | | Price when promotion can't be applied. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`options.extra.promotionRestriction.useLimit` | number | | Price not allowed for discount or points redemption. | - |
| &nbsp;&nbsp;`options.payment` | object | | Payment settings. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.payment.capture` | boolean | | Whether to capture automatically. Default `true`. `true`: confirm + capture together. `false`: separate them. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.payment.payType` | string | | Payment type. `"NORMAL"`: normal payment. `"PREAPPROVED"`: pre-approved payment. | - |
| &nbsp;&nbsp;`options.regPayRequest` | object | | Pre-approved payment settings. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.perTransactionLimit` | number | | Max amount per transaction for non-recurring pre-approved payments. Applies when `regPayPeriodType` is `"NON_RECURRING"`. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.productPrice` | number | | Pre-approved payment amount. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.recurringDay` | number | | Day-of-month (1–31) the recurring payment runs; applies when `recurringPeriod` is `"MONTH"` or `"YEAR"`. Must be `null` otherwise; must be valid for the specified `recurringMonth`. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.recurringDayOfWeek` | string | | Day of week the recurring payment runs; applies when `recurringPeriod` is `"WEEK"`. Values: `"SUN"`, `"MON"`, `"TUE"`, `"WED"`, `"THU"`, `"FRI"`, `"SAT"`. Must be `null` otherwise. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.recurringMonth` | number | | Month (1–12) the recurring payment runs; applies when `recurringPeriod` is `"YEAR"`. Must be `null` otherwise. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.recurringPeriod` | string | | Recurring interval when `regPayPeriodType` is `"RECURRING"`. Values: `"WEEK"`, `"MONTH"`, `"YEAR"`. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`options.regPayRequest.regPayPeriodType` | string | | Pre-approved payment type. `"RECURRING"`: recurring. `"NON_RECURRING"`: non-recurring (general pre-approved). | - |
| `orderId` | string | 100 | Order ID generated by the merchant to manage orders. | REQUIRED |
| `packages[]` | object array | | Product package information classified by delivery/store unit. | REQUIRED |
| &nbsp;&nbsp;`packages[].amount` | number | | Total purchase amount of the package = sum of (`products[].price` × `products[].quantity`). | REQUIRED |
| &nbsp;&nbsp;`packages[].id` | string | 50 | Product package ID. | REQUIRED |
| &nbsp;&nbsp;`packages[].name` | string | 100 | Name of the package or the merchant handling the shipment. | - |
| &nbsp;&nbsp;`packages[].products[]` | object array | | Information on purchased products in the package. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`packages[].products[].id` | string | 50 | Product ID. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`packages[].products[].imageUrl` | string | 500 | Product image URL. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`packages[].products[].name` | string | 4000 | Product name. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`packages[].products[].originalPrice` | number | | Original product price. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`packages[].products[].price` | number | | Product price. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`packages[].products[].quantity` | number | | Purchased quantity. | REQUIRED |
| `redirectUrls` | object | | Redirection URL info for post-processing of the payment request. | REQUIRED |
| &nbsp;&nbsp;`redirectUrls.appPackageName` | string | 4000 | Package name of the app to return to. On Android app-to-app switching, enter the exact package name to prevent phishing. | - |
| &nbsp;&nbsp;`redirectUrls.cancelUrl` | string | 500 | Redirection URL called when the customer cancels the payment on the LINE Pay screen. | REQUIRED |
| &nbsp;&nbsp;`redirectUrls.confirmUrl` | string | 500 | Redirection URL called after the customer completes LINE Pay authentication. | REQUIRED |
| &nbsp;&nbsp;`redirectUrls.confirmUrlType` | string | | Method used to call the redirection URL after authentication. Default `"CLIENT"`. `"CLIENT"`: redirect from the LINE app / pop-up. `"NONE"`: no redirection URL provided. `"SERVER"`: the LINE Pay server directly calls the redirection URL. | - |

### Response body

| Name | Type | Description | Included |
|---|---|---|---|
| `info` | Object | Result information. | - |
| &nbsp;&nbsp;`info.paymentAccessToken` | String | Code value used when entering a code instead of a scanner in the LINE Pay app. | - |
| &nbsp;&nbsp;`info.paymentUrl` | Object | Redirection URL for the payment screen. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.paymentUrl.app` | String | Deep-link URL — for Android to redirect from the merchant app to the LINE Pay app. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.paymentUrl.web` | String | Redirection URL for web — leads to the LINE Pay pending payment screen. If shown as a pop-up, set the window to 700 px × 546 px. | - |
| &nbsp;&nbsp;`info.transactionId` | Number | Payment transaction ID (may need string handling — see Transaction ID). | - |
| `returnCode` | String | Result code. `"0000"` on success; others are error codes. | REQUIRED |
| `returnMessage` | String | Result message. | REQUIRED |

### Request example (normal payment request)

```
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     -d '{
          "amount": 100,
          "currency": "TWD",
          "orderId": "MKSI_S_20180904_1000001",
          "packages": [
            {
              "id": "1",
              "amount": 100,
              "products": [
                {
                  "id": "PEN-B-001",
                  "name": "Pen Brown",
                  "imageUrl": "https://pay-store.example.com/images/pen_brown.jpg",
                  "quantity": 2,
                  "price": 50
                }
              ]
            }
          ],
          "redirectUrls": {
            "confirmUrl": "https://pay-store.example.com/order/payment/authorize",
            "cancelUrl": "https://pay-store.example.com/order/payment/cancel"
          }
        }'
     https://sandbox-api-pay.line.me/v4/payments/request
```

Body for **separated capture** — add `options.payment.capture: false`:

```json
{
  "amount": 100,
  "currency": "TWD",
  "orderId": "MKSI_S_20180904_1000001",
  "options": { "payment": { "capture": false } },
  "packages": [
    { "id": "1", "amount": 100, "products": [
      { "id": "PEN-B-001", "name": "Pen Brown", "imageUrl": "https://pay-store.example.com/images/pen_brown.jpg", "quantity": 2, "price": 50 }
    ] }
  ],
  "redirectUrls": {
    "confirmUrl": "https://pay-store.example.com/order/payment/authorize",
    "cancelUrl": "https://pay-store.example.com/order/payment/cancel"
  }
}
```

Body for **pre-approved payment** — add `options.payment.payType: "PREAPPROVED"`:

```json
{
  "amount": 1000,
  "currency": "TWD",
  "orderId": "MKSI_P_20181231_1000001",
  "options": { "payment": { "payType": "PREAPPROVED" } },
  "packages": [
    { "id": "1", "amount": 0, "products": [
      { "id": "1", "name": "Prime MemberShip", "imageUrl": "https://pay-store.example.com/images/pen_brown.jpg", "quantity": 1, "price": 0 }
    ] }
  ],
  "redirectUrls": {
    "confirmUrl": "https://pay-store.example.com/order/payment/authorize",
    "cancelUrl": "https://pay-store.example.com/order/payment/cancel"
  }
}
```

Body for **not providing a redirection URL** — set `redirectUrls.confirmUrlType: "NONE"`:

```json
{
  "amount": 1000,
  "currency": "TWD",
  "orderId": "MKSI_P_20181231_1000001",
  "redirectUrls": { "confirmUrlType": "NONE" },
  "packages": [
    { "id": "1", "amount": 0, "products": [
      { "id": "1", "name": "Prime MemberShip", "imageUrl": "https://pay-store.example.com/images/pen_brown.jpg", "quantity": 1, "price": 0 }
    ] }
  ]
}
```

### Response example

```json
{
  "returnCode": "0000",
  "returnMessage": "Success.",
  "info": {
    "paymentUrl": {
      "web": "https://sandbox-web-pay.line.me/web/payment/wait?transactionReserveId=REpEWEttQ0F2RmFnaFFzVndIdjl6Z0lqbGpPemZjOHpNWTFZTmdibUlRNlEzOG50N2VSRmdGU2IxcnVjMHZ1NQ",
      "app": "line://pay/payment/REpEWEttQ0F2RmFnaFFzVndIdjl6Z0lqbGpPemZjOHpNWTFZTmdibUlRNlEzOG50N2VSRmdGU2IxcnVjMHZ1NQ"
    },
    "transactionId": 2023042201206549310,
    "paymentAccessToken": "056579816895"
  }
}
```

---

## 2. Check payment request status

`GET /v4/payments/requests/{transactionId}/check`

Checks the status of a requested payment. Mainly used when implementing payment
**without a redirection URL** — poll this API (interval **≥ 1 second**
recommended) to learn whether the customer completed LINE Pay authentication.
Set the read timeout to **at least 20 seconds**.

**Path**: `transactionId` (REQUIRED) — payment transaction ID.
**Query / Body**: None.

### Response body

| Name | Type | Length | Description | Included |
|---|---|---|---|---|
| `returnCode` | String | 4 | Result code. `0000`: customer has not yet completed LINE Pay authentication. `0110`: authentication done — proceed with confirmation. `0121`: customer canceled or authentication timed out. `0122`: payment failed. `0123`: payment completed. Other codes are errors. | REQUIRED |
| `returnMessage` | String | | Result message. | REQUIRED |

### Request example

```
curl -X GET \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     https://sandbox-api-pay.line.me/v4/payments/requests/2018110112345678910/check
```

### Response example

```json
{ "returnCode": "0000", "returnMessage": "success" }
```

---

## 3. Confirm payment

`POST /v4/payments/{transactionId}/confirm`

Requests payment confirmation after the customer has completed LINE Pay
authentication. If confirmation and capture are separated, this call alone does
not complete the payment — you must capture or void afterward. If the payment
request was for a pre-approved key, call this to receive the `regKey`. Set the
read timeout to **at least 40 seconds**.

**Path**: `transactionId` (REQUIRED).
**Query**: None.

### Request body

| Name | Type | Length | Description | Required |
|---|---|---|---|---|
| `amount` | number | | Payment amount. | REQUIRED |
| `currency` | string | 3 | Payment currency code (ISO 4217): `"USD"`, `"TWD"`, `"THB"`. | REQUIRED |

### Response body

| Name | Type | Description | Included |
|---|---|---|---|
| `info` | Object | Result information. | - |
| &nbsp;&nbsp;`info.authorizationExpireDate` | String | Payment confirmation expiration date-time (ISO 8601). Returned when confirmation and capture are separated — capture before this expires. | - |
| &nbsp;&nbsp;`info.merchantReference` | Object | Membership info. For an affiliated transaction, E-invoicing or affiliate card info. **TW only**; requires contacting LINE Pay. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.merchantReference.affiliateCards[]` | Object array | E-invoice or affiliate card information. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...affiliateCards[].cardId` | String | E-invoice code or affiliate card ID. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...affiliateCards[].cardType` | String | Affiliate type. `"MOBILE_CARRIER"` → `cardId` holds the E-invoice code; otherwise a merchant-defined affiliate card type. | REQUIRED |
| &nbsp;&nbsp;`info.orderId` | String | Order ID entered when calling the payment request API. | - |
| &nbsp;&nbsp;`info.packages[]` | Object array | Purchased product package information. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.packages[].amount` | Number | Total purchase amount of the package. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.packages[].id` | String | Product package ID. | REQUIRED |
| &nbsp;&nbsp;`info.payInfo[]` | Object | Payment information. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].amount` | Number | Payment amount. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].creditCardBrand` | String | Credit card brand: `"VISA"`, `"MASTER"`, `"AMEX"`, `"DINERS"`, `"JCB"`. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].creditCardNickname` | String | Nickname of the credit card; empty string if none set. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].maskedCreditCardNumber` | String | Masked credit card number (e.g. `"**** **** **** 1234"`). **TW only**, by separate application. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].method` | String | Payment method. `"BALANCE"`: LINE Pay balance. `"CREDIT_CARD"`: credit/debit card. `"POINT"`: LINE POINTS. | - |
| &nbsp;&nbsp;`info.paymentProvider` | String | Settlement provider type. Default `"TSP"`. `TSP`: settled by a Third-party Service Provider. `EPI`: settled by an Electronic Payment Institution. `null` ⇒ TSP. | REQUIRED |
| &nbsp;&nbsp;`info.regKey` | String | Pre-approved payment key. | - |
| &nbsp;&nbsp;`info.transactionId` | Number | Payment transaction ID. | REQUIRED |
| `returnCode` | String | Result code. `"0000"` on success. | REQUIRED |
| `returnMessage` | String | Result message. | REQUIRED |

### Request example

```
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     -d '{
          "amount": 1000,
          "currency": "TWD"
        }' \
      https://sandbox-api-pay.line.me/v4/payments/2018082512345678910/confirm
```

### Response example

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "orderId": "MKSI_M_20180904_1000001",
    "transactionId": 2018082512345678910,
    "payInfo": [
      { "method": "CREDIT_CARD", "amount": 900 },
      { "method": "POINT", "amount": 100 }
    ],
    "paymentProvider": "TSP"
  }
}
```

---

## 4. Capture

`POST /v4/payments/authorizations/{transactionId}/capture`

Captures the payment. When confirmation and capture are separated and the
payment was confirmed, the merchant must call this to execute the capture and
complete the payment. Set the read timeout to **at least 60 seconds**.

> The captured amount may differ from the requested payment amount. You may
> capture an amount equal to or **less** than the requested amount (a partial
> capture; the uncaptured remainder is partially canceled). You may not capture
> **more**. After capture the payment cannot be voided — only refunded.

**Path**: `transactionId` (REQUIRED).
**Query**: None.

### Request body

| Name | Type | Description | Required |
|---|---|---|---|
| `amount` | number | Payment amount. | REQUIRED |
| `currency` | string | Payment currency code (ISO 4217): `"USD"`, `"TWD"`, `"THB"`. | REQUIRED |

### Response body

| Name | Type | Description | Included |
|---|---|---|---|
| `info` | Object | Result information. | - |
| &nbsp;&nbsp;`info.orderId` | String | Order ID entered in the payment request. | - |
| &nbsp;&nbsp;`info.payInfo[]` | Object | Payment information. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].amount` | Number | Payment amount. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info.payInfo[].method` | String | `"BALANCE"` / `"CREDIT_CARD"` / `"POINT"`. | - |
| &nbsp;&nbsp;`info.paymentProvider` | String | `"TSP"` / `"EPI"`; `null` ⇒ TSP. | REQUIRED |
| &nbsp;&nbsp;`info.transactionId` | Number | Payment transaction ID. | REQUIRED |
| `returnCode` | String | Result code. `0000` on success. If `1199` or `1280`–`1298` is returned, the payment is automatically canceled. | REQUIRED |
| `returnMessage` | String | Result message. | REQUIRED |

### Request example

```
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     -d '{
           "amount": 1000,
           "currency": "TWD"
         }' \
     https://sandbox-api-pay.line.me/v4/payments/authorizations/2018082512345678910/capture
```

### Response example

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "transactionId": 20140101123123123,
    "orderId": "order_210124213",
    "payInfo": [
      { "method": "CREDIT_CARD", "amount": 10 },
      { "method": "POINT", "amount": 10 }
    ],
    "paymentProvider": "TSP"
  }
}
```

---

## 5. Void

`POST /v4/payments/authorizations/{transactionId}/void`

Voids a payment confirmation. When confirmation and capture are separated, call
this to void the confirmed payment. **Once a payment has been captured it can no
longer be voided and must be refunded instead.** Set the read timeout to **at
least 20 seconds**.

**Path**: `transactionId` (REQUIRED).
**Query / Body**: None.

### Response body

| Name | Type | Length | Description | Included |
|---|---|---|---|---|
| `returnCode` | String | 4 | Result code. `0000` on success. If `1900`, `1902`, or `1999` is returned, you may retry the API call. | REQUIRED |
| `returnMessage` | String | | Result message. | REQUIRED |

### Request example

```
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     https://sandbox-api-pay.line.me/v4/payments/authorizations/2018082512345678910/void
```

### Response example

```json
{ "returnCode": "0000", "returnMessage": "OK" }
```

---

## 6. Retrieve payment details

`GET /v4/payments`

Retrieves payment details for confirmed or captured payments. Use query
parameters to look up by transaction ID or order ID. Set the read timeout to
**at least 20 seconds**.

**Path / Body**: None.

### Query parameters

| Name | Description | Required |
|---|---|---|
| `orderId[]` | One or more order IDs. You must supply either `transactionId` or this. | - |
| `transactionId[]` | One or more payment transaction IDs. | - |

### Response body

`info[]` is an **array** of payment objects.

| Name | Type | Description | Included |
|---|---|---|---|
| `info[]` | Object array | Result information. | - |
| &nbsp;&nbsp;`info[].authorizationExpireDate` | String | Authentication expiration date-time (ISO 8601). | - |
| &nbsp;&nbsp;`info[].currency` | String | Payment currency code (ISO 4217): `"USD"` / `"TWD"` / `"THB"`. | - |
| &nbsp;&nbsp;`info[].merchantName` | String | Merchant name. | - |
| &nbsp;&nbsp;`info[].orderId` | String | Order ID entered in the payment request. | - |
| &nbsp;&nbsp;`info[].originalTransactionId` | Number | Original payment transaction ID — returned when retrieving a payment that has a refund history. | - |
| &nbsp;&nbsp;`info[].packages[]` | Object array | Product package info classified by delivery/store unit. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].packages[].amount` | Number | Total purchase amount of the package. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].packages[].id` | String | Product package ID. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].packages[].name` | String | Package / shipment-merchant name. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].packages[].products[]` | Object array | Products in the package. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...products[].id` | String | Product ID. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...products[].imageUrl` | String | Product image URL. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...products[].name` | String | Product name. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...products[].originalPrice` | Number | Original product price. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...products[].price` | Number | Product price. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`...products[].quantity` | Number | Purchased quantity. | REQUIRED |
| &nbsp;&nbsp;`info[].payInfo[]` | Object | Payment details — returned when there is a refund history. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].payInfo[].amount` | Number | Payment amount. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].payInfo[].method` | String | `"BALANCE"` / `"CREDIT_CARD"` / `"POINT"`. | - |
| &nbsp;&nbsp;`info[].paymentProvider` | String | `"TSP"` / `"EPI"`; `null` ⇒ TSP. | REQUIRED |
| &nbsp;&nbsp;`info[].payStatus` | String | Payment status. `"AUTHORIZATION"`: confirmed. `"CAPTURE"`: captured. `"EXPIRED_AUTHORIZATION"`: confirmation expired (capture not done in time). `"VOIDED_AUTHORIZATION"`: confirmation voided. | REQUIRED |
| &nbsp;&nbsp;`info[].productName` | String | Product name. | - |
| &nbsp;&nbsp;`info[].refundList[]` | Object array | Refund info — returned when there is a refund history. | - |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].refundList[].refundAmount` | Number | Refund amount. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].refundList[].refundTransactionDate` | String | Refund date-time (ISO 8601). | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].refundList[].refundTransactionId` | Number | Refund payment transaction ID. | REQUIRED |
| &nbsp;&nbsp;&nbsp;&nbsp;`info[].refundList[].transactionType` | String | `"PARTIAL_REFUND"` / `"PAYMENT_REFUND"` (full). | REQUIRED |
| &nbsp;&nbsp;`info[].transactionDate` | String | Transaction date-time (ISO 8601). | - |
| &nbsp;&nbsp;`info[].transactionId` | Number | Payment transaction ID. | - |
| &nbsp;&nbsp;`info[].transactionType` | String | `"PAYMENT"` / `"PAYMENT_REFUND"` (full refund) / `"PARTIAL_REFUND"`. | - |
| `returnCode` | String | Result code. `"0000"` on success. | REQUIRED |
| `returnMessage` | String | Result message. | REQUIRED |

### Request example

```
curl -X GET \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     https://sandbox-api-pay.line.me/v4/payments?transactionId=20140101123123123&orderId=1002045572
```

You can repeat the same query parameter to look up multiple IDs; max **100**
payments per call (exceeding it yields `returnCode 1177`).

### Response example

```json
{
  "returnCode": "0000",
  "returnMessage": "success",
  "info": [
    {
      "transactionId": 2019060112345678910,
      "transactionDate": "2019-06-01T09:00:00Z",
      "transactionType": "PAYMENT",
      "payInfo": [
        { "method": "CREDIT_CARD", "amount": 100 },
        { "method": "POINT", "amount": 10 }
      ],
      "productName": "test production",
      "currency": "TWD",
      "paymentProvider": "TSP",
      "orderId": "20190601ORD45678910",
      "refundList": [
        { "refundTransactionId": 2019060112345678911, "transactionType": "PARTIAL_REFUND", "refundAmount": -1, "refundTransactionDate": "2019-06-06T09:00:00Z" }
      ],
      "packages": [
        { "id": "1", "amount": 85 },
        { "id": "3", "amount": 5 }
      ]
    }
  ]
}
```

---

## 7. Refund

`POST /v4/payments/{transactionId}/refund`

Refunds a payment that has been settled. Set the read timeout to **at least 20
seconds**.

**Path**: `transactionId` (REQUIRED).
**Query**: None.

### Request body

| Name | Type | Description | Required |
|---|---|---|---|
| `refundAmount` | number | Refund amount. Any amount for a partial refund. **Omit the field to refund the full payment amount.** | - |

### Response body

| Name | Type | Length | Description | Included |
|---|---|---|---|---|
| `info` | Object | | Result information. | - |
| &nbsp;&nbsp;`info.refundTransactionDate` | String | 30 | Refund date-time (ISO 8601). | REQUIRED |
| &nbsp;&nbsp;`info.refundTransactionId` | Number | | Refund payment transaction ID. | REQUIRED |
| `returnCode` | String | 4 | Result code. `0000` on success. If `1900`, `1902`, or `1999` is returned, you may retry. | REQUIRED |
| `returnMessage` | String | | Result message. | REQUIRED |

### Request example

```
curl -X POST -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID"\
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID"\
     -d '{ "refundAmount": 1000 }'
     https://sandbox-api-pay.line.me/v4/payments/2018082512345678910/refund
```

### Response example

```json
{
  "returnCode": "0000",
  "returnMessage": "success",
  "info": {
    "refundTransactionId": 2018082512345678911,
    "refundTransactionDate": "2018-08-25T09:15:01Z"
  }
}
```

---

## 8. Check pre-approved payment key status

`GET /v4/payments/preapprovedPay/{regKey}/check`

Checks the status of an issued pre-approved payment key (`regKey`). Set the read
timeout to **at least 20 seconds**.

**Path**: `regKey` (REQUIRED) — the registered pre-approved payment key.
**Body**: None.

### Query parameters

| Name | Description | Required |
|---|---|---|
| `creditCardAuth` | Whether to run a minimum-amount payment for authentication when checking. `true`: check by running both LINE Pay verification **and** a credit-card minimum-amount payment authentication — **requires LINE Pay team approval**. `false`: check with LINE Pay verification only. | - |

### Response body

| Name | Type | Description | Included |
|---|---|---|---|
| `returnCode` | String | Result code. `"0000"` on success. | REQUIRED |
| `returnMessage` | String | Result message. | REQUIRED |

### Request example

```
curl -X GET \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     https://sandbox-api-pay.line.me/v4/payments/preapprovedPay/RK123asd213/check
```

### Response example

```json
{ "returnCode": "0000", "returnMessage": "OK" }
```

---

## 9. Request pre-approved payment

`POST /v4/payments/preapprovedPay/{regKey}/payment`

Requests a pre-approved payment using an issued `regKey` — no LINE Pay
authentication or confirmation step is needed. Set the read timeout to **at
least 20 seconds**.

**Path**: `regKey` (REQUIRED) — the issued pre-approved payment key.
**Query**: None.

### Request body

| Name | Type | Length | Description | Required |
|---|---|---|---|---|
| `amount` | number | | Payment amount. | REQUIRED |
| `capture` | boolean | | Whether to capture automatically. Default `true`. `true`: pre-approved payment + capture together. `false`: separate them. | - |
| `currency` | string | 3 | Payment currency code (ISO 4217): `"USD"`, `"TWD"`, `"THB"`. | - |
| `orderId` | string | 100 | Order ID generated by the merchant. | REQUIRED |
| `productName` | string | 4000 | Product name. | - |

### Response body

| Name | Type | Length | Description | Included |
|---|---|---|---|---|
| `info` | Object | | Result information. | - |
| &nbsp;&nbsp;`info.authorizationExpireDate` | String | 30 | Authentication expiration date-time (ISO 8601). Included when confirmation and capture are separated. | - |
| &nbsp;&nbsp;`info.orderId` | String | 100 | Order ID entered when requesting pre-approved payment. | - |
| &nbsp;&nbsp;`info.paymentProvider` | String | | `"TSP"` / `"EPI"`; `null` ⇒ TSP. | REQUIRED |
| &nbsp;&nbsp;`info.transactionDate` | String | 30 | Transaction date-time (ISO 8601). | - |
| &nbsp;&nbsp;`info.transactionId` | Number | | Payment transaction ID. | REQUIRED |
| `returnCode` | String | 4 | Result code. `0000` on success. **If `1141`, `1282`–`1287`, or `1290`–`1295` is returned, the pre-approved payment key has expired** — issue a new one. | REQUIRED |
| `returnMessage` | String | | Result message. | REQUIRED |

### Request example

```
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorize-Nonce: 6120489b-53f3-4c51-9d6f-b80be93e509a"\
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     -d '{
          "productName": "Brown pen",
          "amount": 1000,
          "currency": "TWD",
          "orderId": "Ord2018123100000001"
        }' \
     https://sandbox-api-pay.line.me/v4/payments/preapprovedPay/RK123asd213/payment
```

### Response example

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "transactionId": 2018123112345678910,
    "transactionDate": "2018-12-31T09:00:31Z",
    "paymentProvider": "TSP"
  }
}
```

---

## 10. Discard pre-approved payment key

`POST /v4/payments/preapprovedPay/{regKey}/expire`

Discards an issued pre-approved payment key. Set the read timeout to **at least
20 seconds**.

**Path**: `regKey` (REQUIRED).
**Query / Body**: None.

### Response body

| Name | Type | Length | Description | Included |
|---|---|---|---|---|
| `returnCode` | String | 4 | Result code. `0000` on success. If `1141`, `1282`–`1287`, or `1290`–`1295` is returned, the key has already expired. | REQUIRED |
| `returnMessage` | String | | Result message. | REQUIRED |

### Request example

```
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-LINE-ChannelId: YOUR_CHANNEL_ID" \
     -H "X-LINE-Authorization-Nonce: GENERATED_NONCE" \
     -H "X-LINE-Authorization: PROCESSED_SIGNATURE" \
     -H "X-LINE-MerchantDeviceProfileId: YOUR_DEVICE_PROFILE_ID" \
     https://sandbox-api-pay.line.me/v4/payments/preapprovedPay/RK123asd213/expire
```

### Response example

```json
{ "returnCode": "0000", "returnMessage": "OK" }
```

---

## 11. Online API v3 differences

Online API **v3** (`https://developers-pay.line.me/online-api-v3`) has the same
11 endpoints, the same HMAC authentication, the same request/response envelope,
the same result-code set, and the same redirection-pages behavior as v4. All 13
v3 pages were crawled; the exact differences from v4 are:

- **Path prefix is `/v3/`** instead of `/v4/` on every endpoint —
  `POST /v3/payments/request`,
  `GET /v3/payments/requests/{transactionId}/check`,
  `POST /v3/payments/{transactionId}/confirm`,
  `POST /v3/payments/authorizations/{transactionId}/capture`,
  `POST /v3/payments/authorizations/{transactionId}/void`,
  `GET /v3/payments`, `POST /v3/payments/{transactionId}/refund`,
  `GET /v3/payments/preapprovedPay/{regKey}/check`,
  `POST /v3/payments/preapprovedPay/{regKey}/payment`,
  `POST /v3/payments/preapprovedPay/{regKey}/expire`.

- **`paymentProvider` is absent everywhere in v3.** v4 added the
  `info.paymentProvider` (`"TSP"` / `"EPI"`) field to Confirm payment, Capture,
  Retrieve payment details, and Request pre-approved payment. No v3 response
  carries it.

- **No `options.regPayRequest` request object.** v4 added the structured
  pre-approved payment settings (`regPayPeriodType`, `recurringPeriod`,
  `recurringDay`, `recurringDayOfWeek`, `recurringMonth`, `productPrice`,
  `perTransactionLimit`). In v3, configure pre-approved payments via
  `options.payment.payType: "PREAPPROVED"` only.

- **v3 Request payment has an `options.familyService` object that v4 lacks** —
  LINE Family service settings:
  - `options.familyService.addFriends[]` (object array) — settings for adding
    friends.
  - `options.familyService.addFriends[].idList[]` (string array) — list of
    friend IDs (e.g. IDs for your official account).
  - `options.familyService.addFriends[].type` (string) — service type for the
    added-friend list; only the official account (`"lineAt"`) type is currently
    supported.

- **v3 has a customer-fee model that v4 does not.** v3 Request payment has a
  `packages[].userFee` field (number — customer-paid fee in addition to the
  payment amount). The v3 `amount` is "the sum of the purchase amounts
  (`packages[].amount`) and fees (`packages[].userFee`) of the entire product
  package", and `packages[].amount` itself adds `packages[].userFee` to the
  product subtotal. v3 Confirm payment returns `info.packages[].userFeeAmount`
  and v3 Retrieve payment details returns `info[].packages[].userFee` /
  `info[].packages[].userFeeAmount`. v4 dropped the user-fee fields.

- **v3 `options.events[]` is documented `TW only`**; in v4 the promotion
  `options.events[]` object is not version-flagged that way.

- v3's `options.display.locale` lists `"en"`, `"ko"`, `"th"`, `"zh_TW"`,
  `"zh_CN"` (v4 also adds `"ja"`).

- v3 `payInfo[].method` describes `"BALANCE"` simply as "LINE Pay balance";
  v4 phrases it "LINE Pay balance (LINE Pay Money)". Same value, same meaning.

Otherwise every v3 endpoint's path/query parameters, request body, response
body, examples, read timeouts, and result-code semantics match the v4 endpoint
documented above. Both v3 and v4 are current and supported; new integrations
should use v4. v4 was introduced to expose `paymentProvider` (TSP / EPI) so
merchants know which institution settled a transaction.
