# Unifi Pay — PG Integration & Reusable Code Snippets

Source:
- `https://docs.unifi.me/unifi-pay` (+ `get-started`, `onboarding-process`, `payment`, `refund`, `settlement`)
- `https://docs.unifi.me/unifi-apps-review-guidelines/how-to-build-successful-unifi-apps` (close-confirmation code)

## Table of contents

- Unifi Pay overview (PG-facing product)
- Unifi Pay onboarding & HMAC authentication
- Unifi Pay payment API (create, status)
- Reusable code snippets (close confirmation dialog)

> **Scope note**: Unifi Pay is a **separate product track** aimed at payment
> gateway (PG) companies, not Unifi App developers. It lets a PG add a Unifi
> wallet-based stablecoin payment method into the PG's existing checkout flow,
> with no SDK integration (redirect-based). The Unifi Pay docs are written in
> Korean; this file summarizes them in English. The `refund` and `settlement`
> Unifi Pay pages are placeholders with no content as of crawl. App developers
> integrating the SDK should use `references/payment-provider.md` instead.

---

## Unifi Pay overview

Unifi Pay (유니파이 페이) is a service that lets a PG add a **Unifi wallet-based
stablecoin payment method** within its existing payment flow. The PG connects
payment creation, status lookup, and settlement via the Unifi Pay API with no
separate payment-infrastructure build.

Key features:

- **Stablecoin payment support** — Unifi wallet-based stablecoin payment; user
  authentication and payment via the Unifi Wallet.
- **Redirect-based payment UX** — PG → Unifi Pay → payment page; web-based payment
  flow with no SDK integration.
- **Payment flow management** — centrally manages the PG ↔ Unifi ↔ user payment
  flow and the payment/transaction lifecycle.
- **API-based payment processing** — payment creation, start, status lookup, and
  confirmation are all controllable via API.
- **Webhook-based status sync** — real-time delivery of payment complete / failure
  / refund states; stable server-to-server status sync.
- **HMAC-based security authentication** — all server APIs require an HMAC
  signature; timestamp-based replay-attack prevention.
- **ACL-based access control** — access control per API endpoint and method;
  abnormal calls are blocked.
- **Settlement support** — settlement data generated on payment completion; fee
  and net settlement amount provided.

**Payment lifecycle**: payment creation (PG → Unifi Pay) → user redirect → user
authentication and payment → payment complete → webhook received → settlement.

## Unifi Pay onboarding

### Business onboarding

LINE NEXT and the PG conduct prior coordination and a contract. LINE NEXT shares
the technical integration spec; the PG submits the info required for onboarding
(service info — domain, service name; server IP info; Webhook URL). LINE NEXT
configures the environment, issues credentials, and provides them to the PG.

### Technical onboarding

- **App registration & credential issuance** (LINE NEXT) — after NEXT Market
  registration: `AppId` issued, `Secret Key` issued.
- **HMAC authentication** (PG) — all server-to-server API requests require HMAC
  authentication.
- **IP / ACL registration** (LINE NEXT & PG) — register the API-call IP whitelist;
  configure endpoint- and method-based ACL.
- **Integration & verification** — verify create-payment API, redirect, payment
  completion, webhook receipt, and status lookup API.

### HMAC generation

```
BASE64( HMACSHA256(appSecret, {HTTP_METHOD}{URI}{X-AppId}{X-Timestamp}{REQUEST_BODY}) )
```

Combine the signature targets into a string and sign with SHA256 using the
pre-issued `appSecret`. Signature targets:

- `HTTP_METHOD` — the uppercase HTTP method (e.g. `GET`, `POST`, `PUT`).
- `URI` — the requested URI (e.g. `/api/v1/payment`).
- `HEADER` — includes:
  - `X-AppId` — the pre-issued `appId` (e.g. `X-AppId:payletter`).
  - `X-Timestamp` — request timestamp in **milliseconds** (e.g.
    `X-Timestamp:1773017787000`). A request differing from the current time by **5
    minutes or more is rejected**.
- `REQUEST_BODY` — the request body.

(The payment API variant uses `X-API-Key` in place of `X-AppId` in the signature
string.)

## Unifi Pay payment API

### Create payment request — `POST /api/v1/payment`

HMAC: `BASE64( HMACSHA256(appSecret, {HTTP_METHOD}{URI}{X-API-Key}{X-Timestamp}{REQUEST_BODY}) )`.

Request:

```
POST /api/v1/payment HTTP/1.1
X-Authorization-Hmac: YOUR_API_KEY
X-AppId: text
X-Timestamp: text
Content-Type: application/json
Accept: */*
Content-Length: 178

{
  "items": [
    {
      "name": "text",
      "price": 1
    }
  ],
  "orderId": "text",
  "storeId": "text",
  "requestId": "text",
  "returnUrl": "text",
  "callbackUrl": "text",
  "countryCode": "text",
  "orderCurrencyCode": "text"
}
```

Request fields:

| Field | Description |
|---|---|
| `items` | Payment product info (`name`, `price`). |
| `orderId` | The PG-side transaction ID. |
| `storeId` | The PG-provided merchant ID. |
| `requestId` | A unique identifier for the PG-side transaction request. |
| `returnUrl` | Page to return to after payment — `returnUrl?transactionId=<Unifi Pay-generated ID>`. |
| `callbackUrl` | Address the PG receives the result at when Unifi Pay sends results after payment. |
| `countryCode` | 3-letter country code (ISO Alpha-3). |
| `orderCurrencyCode` | Currency code (ISO 4217), fixed to `"USD"`. |

Response `200` — the server returns the requested resource:

```
{
  "startPageUrl": "text",
  "transactionId": "text"
}
```

`startPageUrl` — the URL the PG redirects the user to. `transactionId` — the
created transaction (Unifi Pay-generated transaction number).

### Check payment status — `GET /api/v1/payment/{transactionId}`

HMAC: same scheme as create payment.

Request:

```
GET /api/v1/payment/{transactionId} HTTP/1.1
X-Authorization-Hmac: YOUR_API_KEY
X-AppId: text
X-Timestamp: text
Accept: */*
```

Response `200`:

```
{
  "items": [
    {
      "name": "text",
      "price": 1
    }
  ],
  "status": "text",
  "orderId": "text",
  "storeId": "text",
  "payAmount": 1,
  "orderAmount": "text",
  "transactionId": "text",
  "discountAmount": 1,
  "payCurrencyCode": "text",
  "orderCurrencyCode": "text"
}
```

Response fields:

| Field | Description |
|---|---|
| `status` | Payment status: `CONFIRMED` or `FAILED`. |
| `orderId` | The PG-side transaction ID. |
| `storeId` | The PG-provided merchant ID. |
| `payAmount` | The amount actually paid. |
| `orderAmount` | The ordered amount. |
| `transactionId` | The Unifi Pay-generated transaction number. |
| `discountAmount` | The discounted amount. |
| `payCurrencyCode` / `orderCurrencyCode` | Currency code (ISO 4217), fixed to `"USD"`. |

---

## Reusable code snippets

### Close confirmation dialog

The review guidelines recommend showing a confirmation popup when the page is about
to be closed, so an accidental back-button press does not lose the user's progress.

**React** — insert into the landing page or layout component:

```js
useEffect(() => {
    const preventGoBack = () => {
        if(window.location.pathname === '/') {
            const isConfirmed = confirm('Are you sure you want to go back?');
            if (!isConfirmed) {
                history.pushState(null, '', window.location.pathname)
            }
        }
    };

    window.addEventListener('popstate', preventGoBack);

    // Remove listener when unmounted
    return () => {
        window.removeEventListener('popstate', preventGoBack);
    };
}, []);
```

**Vanilla JS** (`index.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Back Button Blocker</title>
</head>
<body>
  <h1>Home</h1>

  <script>
    if (window.location.pathname === '/') {
      history.pushState(null, '', window.location.pathname);
    }

    function preventGoBack(event) {
      if (window.location.pathname === '/') {
        const isConfirmed = confirm('Are you sure you want to go back?');
        if (!isConfirmed) {
          history.pushState(null, '', window.location.pathname);
        }
      }
    }

    window.addEventListener('popstate', preventGoBack);

    window.addEventListener('beforeunload', () => {
      window.removeEventListener('popstate', preventGoBack);
    });
  </script>
</body>
</html>
```
