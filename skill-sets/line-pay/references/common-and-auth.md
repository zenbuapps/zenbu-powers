# Common Specifications & Authentication

Source:
- `https://developers-pay.line.me/online-api-v4`
- `https://developers-pay.line.me/offline-api-v4`
- `https://developers-pay.line.me/online/prerequisites`
- `https://developers-pay.line.me/offline/prerequisites`
- `https://developers-pay.line.me/sandbox`
- `https://developers-pay.line.me/join-as-merchant`
- `https://developers-pay.line.me/glossary`

## Table of contents

- Endpoint format and hosts
- Authentication — HMAC signing (Online v3/v4, Offline v4)
- Authentication — channel secret header (Offline v2/v2.4)
- Request headers / Response headers
- Response body envelope (returnCode / returnMessage / info)
- Transaction ID and the `handleBigInteger()` gotcha
- Sandbox setup and credentials
- Joining as a merchant
- Glossary of LINE Pay terms

---

# Endpoint format and hosts

Every LINE Pay API endpoint follows this format:

```
https://{host}/{apiPath}?{queryString}
```

- `host` — the hostname of the API server:
  - Sandbox server (for testing): `sandbox-api-pay.line.me`
  - Production server (for actual service): `api-pay.line.me`
- `apiPath` — the specific path of the API being called. **This includes the
  API version** (`/v4/...`, `/v3/...`, `/v2.4/...`, `/v2/...`).
- `queryString` — a set of `key=value` query parameters joined by `&`.

All API requests are sent over HTTPS. Parameters can be passed via path,
query, or a JSON-formatted request body. Every API response returns HTTP
`200 OK` with a response header and a JSON response body.

---

# Authentication — HMAC signing (Online API v3/v4, Offline API v4)

To call the **Online API v4, Online API v3, or Offline API v4**, you must
specify credentials in the HTTP request header. After joining as a merchant
(or creating a sandbox account), you obtain a **channel ID** and **channel
secret key** from the merchant center.

These three headers carry the credentials:

| Header | Value |
|---|---|
| `X-LINE-ChannelId` | Channel ID |
| `X-LINE-Authorization-Nonce` | A temporary token — a randomly generated UUID (v1 or v4) or a timestamp |
| `X-LINE-Authorization` | Base64-encoded MAC (message authentication code), generated with HMAC-SHA256 |

The MAC is generated with the **HMAC method** using the channel secret key as
the HMAC key and a per-method **target message**:

| HTTP Method | MAC-generation message |
|---|---|
| `GET` | Channel secret key + API path (`apiPath`) + query string (`queryString`) + temporary token (`nonce`) |
| `POST` | Channel secret key + API path (`apiPath`) + request body + temporary token (`nonce`) |

> Note: Unintended whitespace in the request body, or a different key order
> after serializing the JSON, changes the MAC and causes `returnCode 1106`
> ("There is an error in the request header information.").

The following code adds the credentials to the HTTP request header for an
Online API (or Offline API v4) call. It is the canonical `requestLINEPayAPI()`
helper that every guide code example reuses:

```
const crypto = require("crypto");

function signKey(clientKey, msg) {
  const encoder = new TextEncoder();
  return crypto
    .createHmac("sha256", encoder.encode(clientKey))
    .update(encoder.encode(msg))
    .digest("base64");
}

async function requestLINEPayAPI({
  method,
  baseUrl = "https://sandbox-api-pay.line.me",
  apiPath,
  queryString = "",
  data = null,
  signal = null,
}) {
  const nonce = crypto.randomUUID();
  let signature = "";

  // Generate MAC for each method
  if (method === "GET") {
    signature = signKey(
      YOUR_CHANNEL_SECRET,
      YOUR_CHANNEL_SECRET + apiPath + queryString + nonce
    );
  } else if (method === "POST") {
    signature = signKey(
      YOUR_CHANNEL_SECRET,
      YOUR_CHANNEL_SECRET + apiPath + JSON.stringify(data) + nonce
    );
  }
  const headers = {
    "X-LINE-ChannelId": YOUR_CHANNEL_ID,
    "X-LINE-Authorization": signature,
    "X-LINE-Authorization-Nonce": nonce,
  };

  const response = await fetch(
    `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
    {
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : null,
      signal: signal,
    }
  );

  const processedResponse = handleBigInteger(await response.text());

  return processedResponse;
}
```

`handleBigInteger()` is required when dealing with `transactionId` values — see
the Transaction ID section below.

---

# Authentication — channel secret header (Offline API v2 / v2.4)

The **Offline API v2 and Offline API v2.4** use a simpler, unsigned scheme.
Two preparations are needed:

### Set the allowlist of servers

To use Offline API v2 or v2.4, you must enable the merchant server to access
the LINE Pay API. The merchant center has a **Manage Payment Server IP** menu
under `Developer Tools`. Register the merchant server's IP address and IP mask
there. (Sandbox merchants testing in sandbox do **not** need the allowlist.)
Offline API v4 **removed** the server allowlist requirement.

### Handle API credentials

Send the channel ID and channel secret key directly in headers — no signature:

| Header | Value |
|---|---|
| `X-LINE-ChannelId` | Channel ID |
| `X-LINE-ChannelSecret` | Channel secret key |
| `X-LINE-MerchantDeviceProfileId` | (Optional) Device profile ID |
| `X-LINE-MerchantDeviceType` | (Optional) Device type |

The canonical v2/v2.4 helper:

```
const crypto = require("crypto");

async function requestLINEPayAPIv2({
  method,
  baseUrl = "https://sandbox-api-pay.line.me",
  apiPath,
  queryString = "",
  data = null,
  signal = null,
}) {
  const headers = {
    "X-LINE-ChannelId": YOUR_CHANNEL_ID,
    "X-LINE-ChannelSecret": YOUR_CHANNEL_SECRET,
    "X-LINE-MerchantDeviceProfileId": YOUR_DEVICE_PROFILE_ID,
    "X-LINE-MerchantDeviceType": YOUR_DEVICE_TYPE,
  };

  const response = await fetch(
    `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
    {
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : null,
      signal: signal,
    }
  );

  const processedResponse = handleBigInteger(await response.text());

  return processedResponse;
}
```

> Migrating from Offline API v2 to v4 requires changing the authentication
> method (from `X-LINE-ChannelSecret` header to HMAC signing). To apply only
> the EPI-related changes without changing auth, use Offline API v2.4 instead.

---

# Request headers (Online API v3/v4, Offline API v4)

API requests commonly require these headers:

| Header name (key) | Data type | Description | Required |
|---|---|---|---|
| `Content-Type` | String | Set to `application/json`. | Required |
| `X-LINE-Authorization` | String | Credentials generated by the HMAC SHA256 algorithm | Required |
| `X-LINE-Authorization-Nonce` | String | A randomly generated UUID (version 1 or 4), or a timestamp if requested | Required |
| `X-LINE-ChannelId` | String | Channel ID | Required |
| `X-LINE-MerchantDeviceProfileId` | String | Device profile ID. Enables device-specific statistics in LINE Pay reports. Typically the serial number of the merchant's terminal. Include together with `X-LINE-MerchantDeviceType`. | Optional |
| `X-LINE-MerchantDeviceType` | String | Device type, as defined by the merchant for identification. Use together with `X-LINE-MerchantDeviceProfileId`. | Optional |

# Response headers

| Header name (key) | Data type | Description | Included |
|---|---|---|---|
| `Content-Type` | String | `application/json` | Always |

---

# Response body envelope

Every response body is a JSON object with these top-level fields:

| Field name | Data type | Description | Included |
|---|---|---|---|
| `info` | Object | API request result data. Included **only when the API call is successful**. | Conditional |
| `returnCode` | String | Result code (see `references/result-codes.md`) | Always |
| `returnMessage` | String | Message corresponding to `returnCode`. A hyphen (`-`) is returned when no specific message applies. | Always |

### Success response

If processed successfully, `returnCode` is `"0000"`. Result data, if any, is
in the `info` field.

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
    ]
  }
}
```

### Error response

On error the server returns a `returnCode` describing the cause; `info` is
**not** returned. (Some legacy error payloads use `resultCode` / `statusMessage`
field names instead.)

```json
{
  "resultCode": 1104,
  "statusMessage": "Merchant not found."
}
```

---

# Transaction ID and the `handleBigInteger()` gotcha

A **transaction** is any action the LINE Pay server performs during payment —
payment request, confirmation, capture, refund are all transactions. The
**transaction ID** is a 19-digit integer that identifies the action; the LINE
Pay server returns it when an action is processed, and you use it to retrieve
or act on that transaction.

Process the transaction ID as a **64-bit long integer**. If a system cannot do
that, convert the ID to a **string**. A system processing it as a 53-bit
integer may corrupt `2023010112345678910` into `2023010112345678800`.

In JavaScript, values above the maximum safe integer (`2^53 − 1`) lose
precision. Handle LINE Pay responses as **plain text** and convert any run of
16+ consecutive digits to a string **before** `JSON.parse`:

```
function handleBigInteger(text) {
  const largeNumberRegex = /:\s*(\d{16,})\b/g;
  const processedText = text.replace(largeNumberRegex, ': "$1"');
  const data = JSON.parse(processedText);
  return data;
}

async function requestLINEPayAPI({
  method = "GET",
  baseUrl = "https://sandbox-api-pay.line.me",
  apiPath,
  queryString = "",
  data = {},
}) {
  // ...
  const response = await fetch(
    `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
    {
      // ...
    }
  );
  const processedResponse = handleBigInteger(await response.text());
  return processedResponse;
}
```

---

# Sandbox setup and credentials

The **sandbox** is a LINE Pay server for testing the LINE Pay API before going
live or before adding features to a running service.

1. **Create a sandbox account** — use "Apply for a sandbox account". Each email
   address can create only **one** Online payment sandbox account or **one**
   Offline payment sandbox account. If you have already officially joined as a
   merchant, you can use the sandbox **without** a separate application — use
   the production channel ID / channel secret.
2. **Obtain credentials** — in the merchant center, go to
   `Developer Tools > Manage Link Key`, click `View`, then enter the email
   verification code. The channel ID and channel secret key are then shown.
3. **Test the sandbox API** — call the sandbox endpoints (host
   `sandbox-api-pay.line.me`) with the obtained credentials.

Sandbox limitations: the application-environment payment URL
(`info.paymentUrl.app`) cannot be tested in the sandbox — use the web URL
(`info.paymentUrl.web`). The iPASS Money barcode cannot be tested in the
sandbox. Non-HTTPS product image URLs may not display in the sandbox.

---

# Joining as a merchant

To use LINE Pay you must first join as a **LINE Pay merchant**. After joining,
you obtain the channel ID and channel secret key from the merchant center, and
can then call the LINE Pay API. The join process varies by country and merchant
type — visit the LINE Pay homepage for your country to apply.

> Merchants who offer LINE Pay only via a fixed LINE Pay payment code cannot
> use the LINE Pay API and cannot see a channel ID / channel secret in the
> merchant center. They must submit a separate merchant application (different
> screening criteria) to use the Online API.

---

# Glossary of LINE Pay terms

| Term | Meaning |
|---|---|
| **Capture** | The LINE Pay server settling and finalizing a payment. After capture the status becomes "payment completed". Confirmation usually triggers an automatic capture, but the two can be separated. |
| **Channel** | A LINE platform construct that a service must create to use LINE platform functions. |
| **iPASS** | A LINE Pay payment method — a Taiwanese transport-card / e-wallet provider. |
| **LINE Pay** | A digital wallet usable by LINE users in online or offline stores. |
| **LINE Pay API** | The web API for LINE Pay online and offline payment operations. |
| **LINE Pay authentication** | The customer navigating to the payment URL, authenticating in the LINE app or web, and entering their payment password. Completion leads to the payment confirmation step. |
| **LINE Pay balance** | A LINE Pay payment method — the amount remaining in a LINE Pay account (LINE Pay Money). |
| **LINE Pay merchant** | A store/business offering LINE Pay as a payment option. Split into online and offline merchants. A merchant testing via sandbox is a "sandbox merchant". |
| **LINE Pay server** | The LINE Pay-side server communicating with the merchant server. |
| **LINE POINTS** | A LINE Pay payment method — points managed by LINE services. |
| **Merchant center** | The management system for merchants to view LINE Pay info and configure payment/settlement settings. |
| **Merchant server** | The merchant-side server that integrates LINE Pay APIs to provide LINE Pay to customers. |
| **Merchant terminal** | A device that scans a customer's My Code at an offline merchant and sends the code to the merchant server. |
| **My Code** | A QR code or barcode generated from the LINE Pay menu of the LINE app. In offline payment, the merchant terminal scans it. Passed to the API as `oneTimeKey`. |
| **Offline API** | The web API for LINE Pay offline payment. |
| **Online API** | The web API for LINE Pay online payment. |
| **Order ID** | The identifier the merchant generates to manage a customer's order. Passed as `orderId`. |
| **Payment confirmation** | The action of deducting money from the user's account / lowering their credit-card available amount. Requested by the merchant after LINE Pay authentication; proceeds to Capture. |
| **Pre-approved payment** | A feature letting the merchant server call the pre-approved payment API at any time, without further LINE Pay authentication or confirmation, once the customer first confirms. Common for subscription services. |
| **Refund** | Returning a settled (captured) amount. Unlike void, a fee may apply because the payment was settled. |
| **Sandbox** | The LINE Pay server for testing the LINE Pay API. |
| **Transaction** | Any action the LINE Pay server performs during payment (request, confirmation, capture, refund). |
| **Void** | Voiding a confirmed payment. Only payments not yet captured can be voided. |
| **TSP** | Third-party Service Provider — the provider of existing (legacy) payment methods. The default `paymentProvider`. |
| **EPI** | Electronic Payment Institutions — Taiwanese institutions licensed under the Act Governing Electronic Payment Institutions. A possible `paymentProvider` value. |
