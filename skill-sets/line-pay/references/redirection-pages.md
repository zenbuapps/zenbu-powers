# Merchant Redirection Pages (Online API)

Source: `https://developers-pay.line.me/online-api-v4/merchant/redirection-pages`
(also published under `/online-api-v3/merchant/redirection-pages` — identical
behavior).

When using the LINE Pay **Online API** to process payments, the merchant must
host two redirection pages and supply their URLs in the
`redirectUrls.confirmUrl` / `redirectUrls.cancelUrl` fields of the payment
request body. After the customer finishes (or cancels) LINE Pay authentication,
the LINE Pay server sends the customer's browser to one of these pages.

> Requirement: All redirection pages must use a trusted certificate and the
> HTTPS protocol (recommended), with support for **TLS 1.2 or higher**.

> If you set `redirectUrls.confirmUrlType` to `"SERVER"` in the payment request,
> the LINE Pay server itself calls `confirmUrl` — you must add LINE Pay's IP
> ranges to your access allowlist for each environment:
> - **Sandbox server (for tests)**: `147.92.159.209`, `147.92.159.21`,
>   `147.92.159.68`, `147.92.216.167`
> - **Production server (for actual service)**: `211.249.40.1`–`211.249.40.30`,
>   `147.92.220.5`–`147.92.220.8`

## Table of contents

- Payment confirmation page (`confirmUrl`)
- Payment cancellation page (`cancelUrl`)
- Implementing payment without a redirection URL

---

# Payment confirmation page (`confirmUrl`)

The **payment confirmation page** is where customers are redirected after
completing LINE Pay authentication, to proceed with the payment process.
Specify its URL in `redirectUrls.confirmUrl` of the payment request body. Once
the customer lands on this page (or acts on it — e.g. clicks an "approve" /
"confirm" button), you can call **Confirm payment** to proceed.

When the LINE Pay server calls this page, it appends these query parameters:

| Parameter | Description | Included |
|---|---|---|
| `orderId` | The order ID (`orderId`) entered when requesting payment. | Always |
| `transactionId` | The payment transaction ID (`info.transactionId`) returned in the payment request response. May need string handling depending on the platform. | Always |

> Do **not** manually include these parameters in the `confirmUrl` — LINE Pay
> appends them automatically. Since `orderId` is merchant-managed, if it is
> already embedded in the URL, LINE Pay appends only the remaining parameters.

Example of the URL the LINE Pay server requests:

```
http://yourdomain.com/path/for/confirm?orderId=2018xxx1232132&trasactionId=201810281234567890
```

> In some cases you can implement payments **without** specifying a redirection
> URL. The LINE Pay server then sends no HTTP requests to the merchant server
> even after the customer completes LINE Pay authentication.

---

# Payment cancellation page (`cancelUrl`)

The **payment cancellation page** is where customers are redirected when they
**cancel** a payment during the LINE Pay authentication process. Specify its URL
in `redirectUrls.cancelUrl` of the payment request body. Use this page to inform
the customer the payment was canceled, or to return them to the page before the
payment request.

When the LINE Pay server calls this page, it may append these query parameters:

| Parameter | Description | Included |
|---|---|---|
| `orderId` | The order ID (`orderId`) entered when requesting payment. | Conditional |
| `transactionId` | The payment transaction ID (`info.transactionId`) returned in the payment request response. May need string handling depending on the platform. | Conditional |

> Do **not** manually include these parameters in the `cancelUrl` — LINE Pay
> appends them automatically. Since `orderId` is merchant-managed, if it is
> already embedded in the URL, LINE Pay appends only the remaining parameters.

Example of the URL the LINE Pay server requests:

```
http://yourdomain.com/path/for/cancel?orderId=2018xxx1232132&trasactionId=201810281234567890
```

---

# Implementing payment without a redirection URL

You can configure LINE Pay to make **no** calls to the merchant server after
LINE Pay authentication, by not providing redirection URL information. Set
`options.redirectUrls.confirmUrlType` to `"NONE"` in the payment request body.

In that mode the customer is **not** redirected to a confirmation page after
authentication, and the merchant server must instead poll the LINE Pay server
to learn whether it can request payment confirmation — call **Check payment
request status** (`GET /v4/payments/requests/{transactionId}/check`) at intervals
of at least one second.

For the full flow and code, see `references/guides-and-flows.md` ("Implement
payment without a redirection URL"). The `confirmUrlType` values:

- `"CLIENT"` (default) — redirect the page from the LINE app or pop-up where the
  customer completed LINE Pay authentication.
- `"NONE"` — do not provide redirection URL information.
- `"SERVER"` — the LINE Pay server directly calls the redirection URL instead
  of redirecting the page (requires the IP allowlist above).
