# Implementation Guides & Flows

Source:
- `https://developers-pay.line.me/online` and `/online/implement-basic-payment`,
  `/online/implement-capture-separated-payment`,
  `/online/implement-preapproved-payment`,
  `/online/implement-payment-without-confirmUrl`,
  `/online/retrieve-payment-info`, `/online/handle-refund`
- `https://developers-pay.line.me/offline` and `/offline/implement-payment`,
  `/offline/implement-capture-separated-payment`,
  `/offline/retrieve-payment-details`, `/offline/handle-refund`,
  `/offline/handle-point-payment-separately`
- `https://developers-pay.line.me/api-change-log`, `/faq`

End-to-end flows with verbatim code. Every code example reuses the
`requestLINEPayAPI()` helper defined in `references/common-and-auth.md`
(`targetAPIServer` is the base URL — sandbox or production). For the per-endpoint
schemas see `references/online-api.md` and `references/offline-api.md`.

## Table of contents

- Online payment — the 4-step process
- Online: implement basic payment
- Online: implement capture-separated payment
- Online: implement pre-approved (recurring) payment
- Online: implement payment without a redirection URL
- Online: retrieve payment details
- Online: process refund
- Offline payment — the 3-step process
- Offline: implement My-Code payment
- Offline: implement capture-separated payment
- Offline: retrieve payment details
- Offline: process refund
- Offline: process LINE POINTS payment separately
- API change log (recent)

---

# Online payment — the 4-step process

LINE Pay online payment involves three parties: the **customer** (a LINE user),
the **merchant server**, and the **LINE Pay server**. The merchant server uses
the Online API to talk to the LINE Pay server.

| Order | Step | Description |
|---|---|---|
| 1 | Payment request | When the customer decides to buy, the merchant server requests payment from the LINE Pay server with the payment information. |
| 2 | LINE Pay authentication | The LINE Pay server displays the LINE Pay screen on the customer's device; the customer authenticates. |
| 3 | Payment confirmation | After authentication, the merchant server verifies the result and requests payment confirmation. The confirmed payment can go through capture or void. |
| 4 | Capture | The merchant server requests a capture; the payment is settled when capture completes. Capture is usually automatic on confirmation. After capture, the payment can only be refunded, not voided. |

---

# Online: implement basic payment

In the **basic** online payment method, capture is processed automatically
after payment confirmation. Implement these operations on the merchant server.

### Step 1 — Payment request

After collecting the order/product information from the customer, call the
payment request API. Example — pay for two pens at 50 TWD each:

```
try {
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/request",
    data: {
      amount: 100,
      currency: "TWD",
      orderId: "EXAMPLE_ORDER_20230422_1000001",
      packages: [
        {
          id: "1",
          amount: 100,
          products: [
            {
              id: "PEN-B-001",
              name: "Pen Brown",
              imageUrl: "https://store.example.com/images/pen_brown.jpg",
              quantity: 2,
              price: 50,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: "https://store.example.com/order/payment/authorize",
        cancelUrl: "https://store.example.com/order/payment/cancel",
      },
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

Successful response:

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

If `returnCode` is not `"0000"`, see `references/result-codes.md`.

### Step 2 — LINE Pay authentication

Redirect the customer to the payment screen URL (`info.paymentUrl`) that matches
their device — `info.paymentUrl.web` for a browser/pop-up,
`info.paymentUrl.app` for an Android app-to-app deep link. The customer
authenticates in the LINE app or on a pop-up page, and can cancel at any time.
After authentication the customer is redirected to one of the redirection pages
(`confirmUrl` on success, `cancelUrl` on cancellation — see
`references/redirection-pages.md`).

### Step 3 — Payment confirmation

Once the customer is on the confirmation page, the merchant server requests
payment confirmation. Without capture separation, the capture is processed
automatically on confirmation and the payment is settled immediately.

```
try {
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/${requestTransactionId}/confirm`,
    data: {
      amount: 100,
      currency: "TWD",
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

Successful response:

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "orderId": "EXAMPLE_ORDER_20230422_1000001",
    "transactionId": 2023042201206549310,
    "payInfo": [
      { "method": "BALANCE", "amount": 100 }
    ]
  }
}
```

After this response, show the customer a payment-completed page. If the payment
was automatically captured, you cannot void it — only refund.

---

# Online: implement capture-separated payment

Separate payment confirmation and capture when you may need to delay settlement
or the amount may change.

> In **Taiwan**, automatic capture is the basic method; capture-separated
> payments require a prior request to LINE Pay.

### Request payment with capture separated

Set `options.payment.capture` to `false` in the payment request:

```
try {
  // Request payments to be separated into payment confirmation and capture
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/request",
    data: {
      amount: 1000,
      currency: "TWD",
      // ...
      options: {
        payment: {
          capture: false,
        },
      },
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

### Confirm, then capture

After confirming, capture using the transaction ID from the **confirmation**
response (`confirmationResponse.info.transactionId`):

```
try {
  // Payment confirmation request
  let confirmationResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/${requestTransactionId}/confirm`,
    data: {
      amount: 1000,
      currency: "TWD",
    },
  });

  console.log("Confirmation response: ", confirmationResponse);

  let captureResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/authorizations/${confirmationResponse.info.transactionId}/capture`,
    data: {
      amount: 800,
      currency: "TWD",
    },
  });

  console.log("Capture response: ", captureResponse);
} catch (error) {
  console.log(error);
}
```

> When confirmation and capture are separated, the confirmation response
> includes `info.authorizationExpireDate`. If the payment is not captured before
> that time, the confirmed payment is **automatically voided**. You can also
> void it manually.
>
> You cannot capture more than the requested amount. Capturing less is a
> **partial capture** — the uncaptured remainder is partially canceled. After
> capture you cannot void; you can only refund.

Successful capture response:

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "transactionId": 2023042201206549440,
    "orderId": "EXAMPLE_ORDER_20230422_1000002",
    "payInfo": [
      { "method": "BALANCE", "amount": 20 }
    ]
  }
}
```

### Void instead of capture

If you decide not to capture, void the confirmed payment with the confirmation
response's transaction ID:

```
try {
  // ...
  // Void request
  let voidResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/authorizations/${confirmationResponse.info.transactionId}/void`,
  });

  console.log("Response: ", voidResponse);
} catch (error) {
  console.log(error);
}
```

```json
{ "returnCode": "0000", "returnMessage": "Success" }
```

---

# Online: implement pre-approved (recurring) payment

Pre-approved payment lets the merchant server call the pre-approved payment API
whenever needed — processing payments without further authentication or
confirmation — once the first payment is confirmed. Common for subscriptions.

> In **Taiwan**, prior application is required to use pre-approved payment.

### Step 1 — Issue a pre-approved payment key

Call the payment request API with `options.payment.payType` set to
`"PREAPPROVED"`:

```
try {
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/request",
    data: {
      amount: 1000,
      currency: "TWD",
      // ...
      options: {
        payment: {
          payType: "PREAPPROVED",
        },
      },
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

After the customer confirms the payment, the confirmation response carries the
pre-approved payment key in `info.regKey`:

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "payInfo": [
      { "method": "BALANCE", "amount": 100 }
    ],
    "regKey": "RK2AE3519XTFXHM",
    "transactionId": 2023050301300251010,
    "orderId": "ORD_dfrlW5t0g8vDyf5lgsuvJTFTH"
  }
}
```

Obtain the key from the confirmation response:

```
try {
  let confirmationResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/${requestTransactionId}/confirm`,
    data: {
      amount: 1000,
      currency: "TWD",
    },
  });

  console.log("Confirmation response: ", confirmationResponse);

  // Pre-approved payment key
  let regKey = confirmationResponse.info.regKey;

  // Do something
} catch (error) {
  console.log(error);
}
```

### Step 2 — Request a pre-approved payment

Optionally check the key's validity first; if the check's result code is
`0000`, the key is usable:

```
try {
  let regKeyStatusCheckResponse = await requestLINEPayAPI({
    method: "GET",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/preapprovedPay/${regKey}/check`,
  });

  console.log("Confirmation response: ", confirmationResponse);

  switch (regKeyStatusCheckResponse.resultCode) {
    case 0000:
      console.log("Valid key");
      // Pre-approved payment request processing
      break;

    // ...

    default:
      console.log("Invalid key or error occurred");
      // Do something
  }
} catch (error) {
  console.log(error);
}
```

To also authenticate via a minimum-amount payment, set the query parameter
`creditCardAuth=true` (requires LINE Pay approval; **TW only**):

```
https://sandbox-api-pay.line.me/v4/payments/preapprovedPay/${regKey}/check?creditCardAuth=true
```

Then request the pre-approved payment with the key:

```
try {
  let preapprovedPaymentResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/preapprovedPay/${regKey}/payment`,
    data: {
      productName: "OTT Premium",
      amount: 999,
      currency: "TWD",
      orderId: "EXAMPLE_PREAPPROVED_ORDER_20230422_1000003",
    },
  });

  console.log("Pre-approved payment response: ", preapprovedPaymentResponse);
} catch (error) {
  console.log(error);
}
```

Unlike basic payment, this omits LINE Pay authentication and confirmation:

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "transactionId": 2018123112345678910,
    "transactionDate": "2018-12-31T09:00:31Z"
  }
}
```

> If result code `1141`, or `1282`–`1287`, or `1290`–`1295` is returned after a
> pre-approved payment request, the `regKey` is discarded — issue a new key.

Pre-approved payments support capture separation too — set `capture` to `false`
in the pre-approved payment request:

```
try {
  let preapprovedPaymentResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/preapprovedPay/${regKey}/payment`,
    data: {
      // ...
      capture: false,
    },
  });

  console.log("Pre-approved payment response: ", preapprovedPaymentResponse);
} catch (error) {
  console.log(error);
}
```

With capture separated, the response includes `info.authorizationExpireDate`;
capture with the transaction ID before it expires:

```json
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "transactionId": 2018123112345678910,
    "transactionDate": "2018-12-31T09:00:31Z",
    "authorizationExpireDate": "2019-01-31T09:00:31Z"
  }
}
```

### Step 3 — Discard the pre-approved payment key

When the customer stops using pre-approved payment, discard the key:

```
try {
  let discardRegKeyResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/preapprovedPay/${regKey}/expire`,
  });

  console.log("Discarding key response: ", discardRegKeyResponse);
} catch (error) {
  console.log(error);
}
```

---

# Online: implement payment without a redirection URL

You can configure LINE Pay to make no calls to the merchant server after LINE
Pay authentication. Set `options.redirectUrls.confirmUrlType` to `"NONE"`:

```
try {
  // Payment request without redirection URL
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/request",
    data: {
      amount: 1000,
      currency: "TWD",
      // ...
      redirectUrls: {
        // ...
        confirmUrlType: "NONE",
      },
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

The customer is then not redirected to a confirmation page. The merchant server
must poll **Check payment request status** (interval ~1 second recommended)
using the `transactionId` from the payment request response:

```
let intervalId = null;

const getPayRequestStatus = async function (requestTransactionId) {
  try {
    if (!requestTransactionId) throw new Error("Transaction ID is required!");
    let response = await requestLINEPayAPI({
      method: "GET",
      baseUrl: targetAPIServer,
      apiPath: `/v4/payments/requests/${requestTransactionId}/check`,
    });

    switch (response.returnCode) {
      case "0000":
        console.log("In progress");
        break;
      case "0110":
        console.log("Finished");
        // Do something
      case "0121":
        console.log("Cancelled");
        // Do something

      // ...

      default:
        clearInterval(intervalId);
    }
  } catch (error) {
    console.log(error);
  }
};

intervalId = setInterval(getPayRequestStatus("2023042201206549310"), 1000);
```

Interpret the status from `returnCode`: `0000` = authentication not yet
completed; `0110` = authentication done, request confirmation; `0121` =
canceled or timed out. Once you see `0110`, call **Confirm payment**.

---

# Online: retrieve payment details

Look up payments by order ID and/or transaction ID — up to **100** per call:

```
const getPaymentInfo = async function ({ orderIds = [], transactionIds = [] }) {
  if (orderIds.length === 0 && transactionIds.length === 0) {
    throw new Error(
      "At least one of order ID or transaction ID must be input."
    );
  } else {
    const orderIdsQuery = new URLSearchParams(
      orderIds.map((value) => ["orderId", value])
    );
    const transactionIdsQuery = new URLSearchParams(
      transactionIds.map((value) => ["transactionId", value])
    );

    let response = await requestLINEPayAPI({
      method: "GET",
      baseUrl: targetAPIServer,
      apiPath: `/v4/payments`,
      queryString: `${orderIdsQuery.toString()}&${transactionIdsQuery.toString()}`,
    });

    return response;
  }
};

// ...

try {
  let response = getPaymentInfo({
    orderIds: ["20230601ORD45678910", "20230601ORD45678911"],
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

If the payment has a refund history, the response's `info[].refundList` carries
the refund records. Retrieving a payment by a `refundTransactionId` returns the
refund details, with `info[].originalTransactionId` pointing back to the
original payment.

---

# Online: process refund

After a payment is captured (automatically or capture-separated) it cannot be
voided — only refunded. Full refund using the transaction ID:

```
try {
  let refundResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/${transactionId}/refund`,
  });

  console.log("Refund response: ", refundResponse);
} catch (error) {
  console.log(error);
}
```

Partial refund — pass `refundAmount` in the body:

```
const refund = async function (transactionId, amount = 0) {
  if (!transactionId) throw new Error("Transaction ID is required!");
  if (amount < 0) throw new Error("Amount cannot be negative number");

  const refundBody = amount > 0 ? { refundAmount: amount } : null;

  let refundResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/${transactionId}/refund`,
    data: refundBody,
  });

  return refundResponse;
};

// ...

try {
  let response = refund("2018082512345678910", 500);

  console.log(response);
} catch (error) {
  console.log(error);
}
```

Successful refund response:

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

# Offline payment — the 3-step process

LINE Pay offline payment is made at a store terminal that scans a code. This
document covers the flow where the **customer presents their My Code** and the
merchant terminal scans it. (When the customer scans a merchant-displayed code,
LINE Pay handles everything and the merchant implements nothing.)

| Order | Step | Description |
|---|---|---|
| 1 | Scan My Code | The customer generates a My Code in the LINE app; the merchant terminal scans it. |
| 2 | Payment request and confirmation | The merchant server requests payment with the My Code (`oneTimeKey`) and order info; the process proceeds to confirmation. The confirmed payment can be captured or voided. |
| 3 | Capture | The merchant requests a capture; the payment is settled when capture completes. Capture is usually automatic on confirmation. After capture, the payment can only be refunded. |

---

# Offline: implement My-Code payment

### Step 1 — Scan My Code

The customer's My Code is displayed as a barcode or QR code. For testing,
generate a sandbox My Code:

```
// For Taiwan Merchant:
https://sandbox-web-pay.line.me/web/sandbox/payment/oneTimeKey?countryCode=TW

// For Thailand Merchant:
https://sandbox-web-pay.line.me/web/sandbox/payment/oneTimeKey
```

Query parameters for the sandbox My-Code generator:

| Name | Description |
|---|---|
| `countryCode` | Country code; sets the currency. `TW` (Taiwan dollar) or `TH` (Thai baht). Default `TH`. |
| `paymentMethod` | Payment method. `card` (credit card), `balance` (LINE Pay balance), or `ipass` (LINE Pay account payment, Taiwan only). Default `balance`. |

(The merchant must implement the terminal's barcode-scanning and the
terminal↔server communication itself — not covered here.)

### Step 2 — Request and confirm payment

The merchant server requests payment with the scanned My Code (`oneTimeKey`)
and the order information:

```
try {
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/oneTimeKeys/pay",
    data: {
      amount: 100,
      currency: "TWD",
      orderId: "EXAMPLE_ORDER_20230422_1000002",
      productName: "Pen Brown",
      oneTimeKey: "123456789012",
      extras: {
        branchName: "First branch",
        branchId: "branch1",
      },
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

Successful response (`balance` is the customer's remaining LINE Pay balance):

```json
{
  "returnCode": "0000",
  "returnMessage": "success",
  "info": {
    "transactionId": 2019010112345678910,
    "orderId": "test_order_1",
    "transactionDate": "2023-05-16T18:01:00Z",
    "payInfo": [
      { "method": "BALANCE", "amount": 100 }
    ],
    "balance": 9900
  }
}
```

The payment request is finalized with payment confirmation; without capture
separation, the capture is automatic and the payment settles on confirmation.

If a read timeout occurs (the docs suggest ~20 s), poll **Check payment
status** with the order ID:

```
let intervalId = null;

// Check payment request status
const getPayRequestStatus = async function (orderId) {
  try {
    if (!orderId) throw new Error("Order ID is required!");

    let response = await requestLINEPayAPI({
      method: "GET",
      baseUrl: targetAPIServer,
      apiPath: `/v4/payments/orders/${orderId}/check`,
    });

    console.log("Response: ", response);

    switch (response.info.status) {
      case "AUTH_READY":
        console.log("In progress");
        break;
      case "COMPLETE":
        console.log("Finished");
        // Do something
      case "CANCEL":
        console.log("Cancelled");
        // Do something
      case "FAIL":
        console.log("Failed");
        // Do something
        // ...
      default:
        clearInterval(intervalId);
    }
  } catch (error) {
    console.log(error);
  }
};

// Payment request
try {
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/oneTimeKeys/pay",
    data: {
      orderId: "test_order_1",
      // ...
    },
    // Set read timeout
    signal: AbortSignal.timeout(20000),
  });

  console.log("Response: ", response);
} catch (error) {
  if (err.name === "TimeoutError") {
    // Check payment request status every one second
    intervalId = setInterval(getPayRequestStatus("test_order_1"), 1000);
  } else {
    // Handle other exceptions
  }
}
```

The status check returns `info.status`: `AUTH_READY` (waiting), `COMPLETE`,
`CANCEL`, `FAIL`.

---

# Offline: implement capture-separated payment

> In **Taiwan**, capture-separated payments require a prior request to LINE Pay.

### Request payment with capture separated

Set `capture` to `false` in the offline payment request:

```
try {
  let response = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/oneTimeKeys/pay",
    data: {
      amount: 100,
      currency: "TWD",
      orderId: "EXAMPLE_ORDER_20230422_1000001",
      // ...
      capture: false,
    },
  });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

### Retrieve confirmation details

To decide whether to capture or void, check the confirmation status with
**Retrieve confirmation information** (by order ID or transaction ID):

```
const getConfirmedPaymenrtInfo = async function ({
  orderId = "",
  transactionId = "",
}) {
  let queryString = "";

  if (orderId === "" && transactionId === "") {
    throw new Error(
      "At least one of order ID or transaction ID must be input."
    );
  } else if (orderId !== "") {
    queryString = `orderId=${orderId}`;
  } else {
    queryString = `transactionId=${transactionId}`;
  }

  let response = await requestLINEPayAPI({
    method: "GET",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/authorizations?${queryString}`,
  });

  return response;
};

// ...

try {
  response = await getConfirmedPaymenrtInfo({ orderId: "test_order_1" });

  console.log(response);
} catch (error) {
  console.error(error);
}
```

Response — the payment status is `info.payStatus` (`AUTHORIZATION`, `CAPTURE`,
`EXPIRED_AUTHORIZATION`, `VOIDED_AUTHORIZATION`):

```json
{
  "returnCode": "0000",
  "returnMessage": "success",
  "info": [
    {
      "transactionId": 2019049910005498410,
      "orderId": "20190408003",
      "payStatus": "VOIDED_AUTHORIZATION",
      "transactionDate": "2019-04-08T07:02:38Z",
      "transactionType": "PAYMENT",
      "productName": "test product",
      "currency": "THB",
      "authorizationExpireDate": "2019-04-13T07:02:38Z",
      "payInfo": [
        { "method": "BALANCE", "amount": 100 }
      ]
    }
  ]
}
```

### Capture

Capture the confirmed payment with the order ID from the payment request:

```
try {
  // Payment request
  let requestResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: "/v4/payments/oneTimeKeys/pay",
    data: {
      amount: 100,
      currency: "TWD",
      // ...
      capture: false,
    },
  });

  console.log("Request response: ", requestResponse);

  // ...

  // Capture request
  let captureResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/orders/${requestResponse.info.orderId}/capture`,
    data: {
      amount: 100,
      currency: "TWD",
    },
  });

  console.log("Capture response: ", captureResponse);
} catch (error) {
  console.log(error);
}
```

> If confirmation and capture are separated, the LINE Pay server includes
> `info.authorizationExpireDate`. If not captured before then, the confirmed
> payment is automatically voided.

```json
{
  "returnCode": "0000",
  "returnMessage": "success",
  "info": {
    "transactionId": 2019010112345678910,
    "orderId": "test_order_1",
    "transactionDate": "2019-01-01T01:01:00Z",
    "payInfo": [
      { "method": "BALANCE", "amount": 100 }
    ]
  }
}
```

### Void

Void the confirmed payment with the order ID from the payment request:

```
try {
  // Void request
  let voidResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/orders/${requestResponseBody.info.orderId}/void`,
  });

  console.log("Response: ", voidResponse);
} catch (error) {
  console.log(error);
}
```

```json
{ "returnCode": "0000", "returnMessage": "OK" }
```

---

# Offline: retrieve payment details

Look up confirmed/captured payments by order ID or transaction ID:

```
const getPaymentInfo = async function ({ orderId = "", transactionId = "" }) {
  let queryString = "";

  if (orderId === "" && transactionId === "") {
    throw new Error(
      "At least one of order ID or transaction ID must be input."
    );
  } else if (orderId !== "") {
    queryString = `orderId=${orderId}`;
  } else {
    queryString = `transactionId=${transactionId}`;
  }

  let response = await requestLINEPayAPI({
    method: "GET",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments?${queryString}`,
    queryString: queryString,
  });

  return response;
};

// ...

try {
  let response = getPaymentInfo({ orderId: "test_order_1" });

  console.log("Response: ", response);
} catch (error) {
  console.log(error);
}
```

A payment with a refund history includes `info[].refundList` in the response.

---

# Offline: process refund

After capture, an offline payment can only be refunded. Full refund using the
order ID:

```
try {
  let refundResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/orders/${orderId}/refund`,
  });

  console.log("Refund response: ", refundResponse);
} catch (error) {
  console.log(error);
}
```

Partial refund — pass `refundAmount`:

```
const refund = async function (orderId, amount = 0) {
  if (amount < 0) throw new Error("Amount cannot be negative number");

  const refundBody = amount > 0 ? { refundAmount: amount } : null;

  let refundResponse = await requestLINEPayAPI({
    method: "POST",
    baseUrl: targetAPIServer,
    apiPath: `/v4/payments/orders/${orderId}/refund`,
    data: refundBody,
  });

  return refundResponse;
};

// ...

try {
  let response = refund("test_order_1", 500);

  console.log(response);
} catch (error) {
  console.log(error);
}
```

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

# Offline: process LINE POINTS payment separately

By default the Offline API reports LINE POINTS usage as part of the LINE Pay
balance. To separate it, configure the merchant center: under
`Manage Basic Info > Other information`, set "Providing the user's POINT usage
information in the Payment API's response" to **Use**.

Then payment information that was categorized as `"BALANCE"` becomes `"POINT"`:

```
// Before changing the setting - Paid in full with LINE POINTS. No distinction.
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "orderId": "order_210124213",
    "transactionId": 20140101123123123,
    "payInfo": [
      { "method": "BALANCE", "amount": 15 }
    ]
  }
}

// After changing the setting - LINE POINTS payment method is distinguished
{
  "returnCode": "0000",
  "returnMessage": "OK",
  "info": {
    "orderId": "order_210124213",
    "transactionId": 20140101123123123,
    "payInfo": [
      { "method": "POINT", "amount": 15 }
    ]
  }
}
```

---

# API change log (recent)

Source: `https://developers-pay.line.me/api-change-log`.

### November 2025 — EPI support

In Taiwan, institutions licensed under the Act Governing Electronic Payment
Institutions are called **EPI** (Electronic Payment Institutions). To support
them, **Online API v4**, **Offline API v4**, and **Offline API v2.4** were added
alongside the existing Online API v3 and Offline API v2.

- The new APIs add a `paymentProvider` field so merchants learn which company
  type handled settlement: `"TSP"` (Third-party Service Provider — existing
  methods) or `"EPI"`. If you don't need this, you can keep using the legacy
  APIs.
- **Online API v4 changes**: added the `paymentProvider` field on Confirm
  payment, Capture, Retrieve payment details, and Request pre-approved payment;
  added the `options.regPayRequest` request object on Request payment.
- **Offline API v4 changes**: applied the new HMAC authentication method in HTTP
  request headers (same as Online API v3/v4); **removed** the server allowlist
  (IP allowlist) requirement; changed the request parameters for Request payment
  (`POST /v4/payments/oneTimeKeys/pay`); added `paymentProvider` on Request
  payment, Check payment status, Retrieve confirmation information, Capture, and
  Retrieve payment details.
- **Offline API v2.4 changes**: same `paymentProvider` additions as v4, but
  keeps the v2 `X-LINE-ChannelSecret` authentication — use v2.4 to apply only
  the EPI changes without switching the auth method.
- EPI-type transactions can be tested in the sandbox via the My-Code generator
  with `preset` values, e.g. `?countryCode=TW&paymentMethod=card&preset=18`
  (EPI Credit Card) or `?countryCode=TW&paymentMethod=balance&preset=3` (EPI
  Balance). EPI transactions are not valid for online payment, so the Online API
  `paymentProvider` always returns `"TSP"`.

### May 2025 — LINE Pay Japan termination

Due to the termination of the LINE Pay Japan service:
- The Deposit API (Japan-exclusive) is no longer available.
- Explanations of some Japan-specific fields in the Online and Offline APIs are
  no longer provided.

### Selected FAQ guidance

- **`info.payInfo[].method`** values: `"BALANCE"` (LINE Pay balance),
  `"CREDIT_CARD"` (credit/debit card), `"POINT"` (LINE POINTS).
- **`returnCode 1106` on the Online API** — the `X-LINE-Authorization` MAC is
  wrong. The MAC message differs by method: GET = `channelSecret + apiPath +
  queryString + nonce`; POST = `channelSecret + apiPath + requestBody + nonce`.
  Unintended whitespace in the body or a different JSON key order after
  serialization changes the MAC.
- **`returnCode 1106` on Offline API v2 / v2.4** — a missing request header, or
  the merchant server is not on the payment-server IP allowlist.
- **`returnCode 1133` on the Offline API** — in the sandbox you cannot use a My
  Code from the LINE app; use the sandbox My-Code generator URL. The iPASS Money
  barcode cannot be tested in the sandbox.
- In the sandbox, `info.paymentUrl.app` cannot be tested — use
  `info.paymentUrl.web`. Non-HTTPS product image URLs may not display in the
  sandbox (they work in production regardless of protocol).
- The customer must log in with their personal LINE account on the purchase
  page, including in the sandbox.
