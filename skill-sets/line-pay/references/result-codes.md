# Result Codes

Source:
- `https://developers-pay.line.me/online-api-v4` (Result code section)
- `https://developers-pay.line.me/offline-api-v4` (Result code section)

Every LINE Pay API response is HTTP `200 OK`. The body's `returnCode` (string)
and `returnMessage` (string) carry the actual result. `returnCode` `"0000"` is
success; any other code is an error and the `info` field is then absent. If a
code has no specific message, a hyphen (`-`) is delivered as `returnMessage`.

> Some legacy error payloads use `resultCode` (number) and `statusMessage`
> instead of `returnCode` / `returnMessage` — handle both shapes.

## Table of contents

- Online API result codes
- Offline API result codes
- Retry / auto-cancel / key-expiry behavior summary

---

# Online API result codes

| Result code | Description |
|---|---|
| `0000` | Returned when the request is successful. **If this is the result of a payment request status check**, it indicates the customer has not yet completed LINE Pay authentication. |
| `0110` | The customer has completed LINE Pay authentication; you can proceed with payment confirmation. (Payment request status check.) |
| `0121` | The customer canceled the payment, or the LINE Pay authentication waiting time expired. (Payment request status check.) |
| `0122` | Payment failed. (Payment request status check.) |
| `0123` | Payment completed. (Payment request status check.) |
| `1101` | The customer isn't a LINE Pay user. |
| `1102` | The customer is currently unable to make transactions with LINE Pay. |
| `1104` | The merchant isn't registered on the merchant center. Check that the correct credentials are entered. |
| `1105` | LINE Pay is currently unavailable for the merchant. |
| `1106` | There is an error in the request header information. (Commonly a bad `X-LINE-Authorization` MAC.) |
| `1110` | The credit card cannot be used. |
| `1124` | There is an error in the amount information. |
| `1141` | There is a problem with the account status. For an EPI transaction, the merchant may not have enabled the EPI payment method; for a pre-approved transaction, the user may have discarded the pre-approved payment key (obtain a new one). |
| `1142` | The balance is insufficient. |
| `1145` | Payment is in progress. |
| `1150` | There are no transaction details. |
| `1152` | There is a duplicate transaction. |
| `1153` | The payment request amount and the capture amount differ. |
| `1154` | The selected payment method for pre-approved payment isn't available. |
| `1155` | This is an invalid transaction ID. |
| `1159` | There is no payment request information. |
| `1163` | Refund isn't available (refund period has expired). |
| `1164` | Exceeded the refundable amount. |
| `1165` | The transaction has already been refunded. |
| `1169` | LINE Pay requires payment method selection and password authentication. |
| `1170` | The balance in the member's account has changed. |
| `1172` | Transaction details with the same order ID already exist. |
| `1177` | Exceeded the maximum number of transactions that can be retrieved (100). |
| `1178` | The currency isn't supported by the merchant. |
| `1179` | Cannot be processed at the moment. |
| `1180` | Payment time expired. |
| `1183` | Payment amount must exceed the minimum amount set. |
| `1184` | Payment amount must not exceed the maximum amount set. |
| `1190` | There is no pre-approved payment key. |
| `1193` | Pre-approved payment key has expired. |
| `1194` | Pre-approved payment isn't available for this merchant. |
| `1198` | API request is duplicated. |
| `1199` | Internal error occurred during the request. |
| `1280` | Temporary error occurred during credit card payment. |
| `1281` | Error occurred during credit card payment. |
| `1282` | Error occurred during credit card authorization. |
| `1283` | Payment was denied due to suspected fraudulent use. |
| `1284` | Credit card payment is temporarily suspended. |
| `1285` | Credit card payment information is missing. |
| `1286` | Credit card payment information is incorrect. |
| `1287` | Credit card expiration date has passed. |
| `1288` | Insufficient balance in the credit card account. |
| `1289` | Exceeded the credit card limit. |
| `1290` | Exceeded the per-transaction limit for credit card payments. |
| `1291` | This card is reported stolen. |
| `1292` | Card usage is suspended. |
| `1293` | CVN input error occurred. |
| `1294` | This card is on the blacklist. |
| `1295` | The credit card number is incorrect. |
| `1296` | This amount cannot be processed. |
| `1298` | Card use was declined. |
| `190X` | Temporary error occurred. Please try again later. |
| `2024` | Exceeded the merchant's per-transaction, daily, or monthly limit for receiving payments. |
| `2101` | Parameter error occurred. |
| `2102` | JSON data format error occurred. |
| `9000` | Internal error occurred. |

---

# Offline API result codes

| Result code | Description |
|---|---|
| `0000` | The request is successful. |
| `1101` | The customer isn't a LINE Pay user. |
| `1102` | The customer is currently unable to make transactions with LINE Pay. |
| `1104` | The merchant isn't registered on the merchant center. Check that the correct credentials are entered. |
| `1105` | LINE Pay is currently unavailable for the merchant. |
| `1106` | There is an error in the request header information. |
| `1110` | The credit card cannot be used. |
| `1124` | There is an error in the amount information. |
| `1133` | This is an invalid My Code (`oneTimeKey`). |
| `1141` | There is a problem with the account status. For an EPI transaction, the merchant may not have enabled the EPI payment method. |
| `1142` | The balance is insufficient. |
| `1145` | Payment is in progress. |
| `1150` | There are no transaction details. |
| `1152` | There is a duplicate transaction. |
| `1153` | The payment request amount and the capture amount differ. |
| `1155` | This is an invalid transaction ID. |
| `1159` | There is no payment request information. |
| `1163` | Refund isn't available (refund period has expired). |
| `1164` | Exceeded the refundable amount. |
| `1165` | The transaction has already been refunded. |
| `1169` | LINE Pay requires payment method selection and password authentication. |
| `1170` | The balance in the member's account has changed. |
| `1172` | Transaction details with the same order ID already exist. |
| `1177` | Exceeded the maximum number of transactions that can be retrieved (100). |
| `1178` | The currency isn't supported by the merchant. |
| `1179` | Cannot be processed at the moment. |
| `1183` | Payment amount must exceed the minimum amount set. |
| `1184` | Payment amount must not exceed the maximum amount set. |
| `1198` | API request is duplicated. |
| `1199` | Internal error occurred during the request. |
| `1280` | Temporary error occurred during credit card payment. |
| `1281` | Error occurred during credit card payment. |
| `1282` | Error occurred during credit card authorization. |
| `1283` | Payment was denied due to suspected fraudulent use. |
| `1284` | Credit card payment is temporarily suspended. |
| `1285` | Credit card payment information is missing. |
| `1286` | Credit card payment information is incorrect. |
| `1287` | Credit card expiration date has passed. |
| `1288` | Insufficient balance in the credit card account. |
| `1289` | Exceeded the credit card limit. |
| `1290` | Exceeded the per-transaction limit for credit card payments. |
| `1291` | This card is reported stolen. |
| `1292` | Card usage is suspended. |
| `1293` | CVN input error occurred. |
| `1294` | This card is on the blacklist. |
| `1295` | The credit card number is incorrect. |
| `1296` | This amount cannot be processed. |
| `1298` | Card use was declined. |
| `190X` | Temporary error occurred. Please try again later. |
| `1999` | (On retry) The request information differs from the previous request. |
| `2020` | Failed to reserve the limit for the payment amount during the pre-authorization stage of the EPI payment process. |
| `2021` | Exceeded the restricted-user (Punished ID / PID user) payment limit during an EPI payment. |
| `2022` | Exceeded the user's payment limit during an EPI payment. |
| `2023` | Exceeded an individual user's per-transaction, daily, or monthly limit allowed at a specific merchant. |
| `2024` | Exceeded the merchant's per-transaction, daily, or monthly limit for receiving payments. |
| `2042` | Failed to refund for an EPI payment, due to the merchant's insufficient refund reserve. |
| `2101` | Parameter error occurred. |
| `2102` | JSON data format error occurred. |
| `2103` | Unauthorized parameter has been entered. |
| `2104` | This is an invalid request. Check the result message. |
| `9000` | Internal error occurred. |

(`1115` may be returned by the Offline v4 Refund endpoint when attempting a
partial refund on a transaction involving coupons or fees — process it as a
full refund instead.)

---

# Retry / auto-cancel / key-expiry behavior summary

| Behavior | Codes | Applies to |
|---|---|---|
| **Retry allowed** — you may retry the API call | `1900`, `1902`, `1999` (and the generic `190X` family) | Online Void, Online Refund (retry); `1999` on Offline retry means request mismatch |
| **Payment auto-canceled** — the payment is automatically canceled when this code is returned | `1199`, `1280`–`1298` | Online Capture, Offline Capture |
| **Pre-approved key expired/discarded** — the `regKey` is no longer usable; issue a new one | `1141`, `1282`–`1287`, `1290`–`1295` | Online Request pre-approved payment, Online Discard pre-approved payment key |
| **Header / signature error** — typically a wrong `X-LINE-Authorization` MAC (unintended whitespace or differing JSON key order) | `1106` | All HMAC-signed endpoints |
| **Duplicate** — same order ID or duplicated API request | `1152`, `1172`, `1198` | All payment-creating endpoints |
| **Refund limits** | `1163` (period expired), `1164` (over refundable amount), `1165` (already refunded) | Refund endpoints |
