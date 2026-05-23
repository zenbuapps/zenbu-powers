# Authentication, Common Specifications & Errors

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- `https://ads.line.me/public-docs/data-general-partner`
- `https://ads.line.me/public-docs/reporting-general-partner`

(The authentication scheme is identical across all three partner-role docs.)

## Table of contents

- Overview (URI scheme, version)
- Authentication: JWS request signing, step by step
- Worked examples (with body / without body)
- Full Python sample
- Common specifications: rate limits, Request Quota
- Error response shape, HTTP status codes

---

# Overview

- **Document / spec version**: `3.12.0.1` (LADM v12.0.1 feature set).
- **Host**: `ads.line.me`
- **BasePath**: `/api`
- **Scheme**: HTTPS only.
- So a full endpoint URL is `https://ads.line.me/api` + the path (e.g. `https://ads.line.me/api/v3/adaccounts/A1/campaigns`).
- **Contact / support**: LINE Ads API Support — `ml-lads-api-support@lycorp.co.jp`. When inquiring, state the Group ID authorized for the API and which permission you use: `LINE Ads API` or `Conversion API`.

# Authentication

The LINE Ads Management API does **not** use OAuth access tokens. Every request
is authenticated with a per-request **JWS signature** (HMAC-SHA256) placed in the
`Authorization` header. There is no SDK — you build the signature yourself.

## Prerequisites

1. **Activate a Group for API access.** LINE sends an invitation email to the
   address on your application, inviting you to a Group that holds the API
   credentials.
2. **Get an Access key and Secret key** on the Group settings page of the Ad
   Manager UI. The Secret key is not visible after first access — regenerate it
   from the red-marked link on that page if needed.

## Signing a request — step by step

### 1. Construct the JOSE Header

The header is JSON with exactly these claims:

| key | description |
|---|---|
| `alg` | Cryptographic algorithm for signature. Only `"HS256"` can be specified. |
| `kid` | The **Access key** shown in the Ad Manager UI. |
| `typ` | Content type of the payload. Only `"text/plain"` can be specified. |

Sample header:

```json
{
  "alg": "HS256",
  "kid": "LINEADSAMPLE",
  "typ": "text/plain"
}
```

### 2. Construct the JWS Payload

The payload is `text/plain`: four values joined by line feed (`\n`).

| parameter | description |
|---|---|
| `Digest-SHA-256` | Hex string SHA-256 digest of the request body. **When there is no request body, or `Content-Type` is `multipart/form-data`, use `""` (empty string) as the input** instead of the body. |
| `Content-Type` | The content type of the request body, e.g. `application/json`, `multipart/form-data`. When `Content-Type` is `multipart/form-data`, **no `boundary` value is needed**. When there is no request body, this value is `""` (empty string). |
| `Date` | The date the request was generated, in `YYYYMMDD` format. This must match the value in the `Date` HTTP header. The `Date` header itself must be RFC 1123 format and within **±15 minutes** of the current time. |
| `CanonicalURI` | Normalized URI of the request — **includes the `/api` base path**, e.g. `/api/v3/adaccounts/A1/campaigns`. |

Sample payload — request body `{"name": "test group"}` as `application/json`,
calling `/api/v3/groups/G1/children` at 2021/12/22 00:00:00 GMT:

```
66d8e0f35d6568f4e58a63f0797c6a5c43838579f86ef14e1dd81fd75d19d3d5
application/json
20211222
/api/v3/groups/G1/children
```

### 3. Calculate the signature

Base64-encode the header and payload, join with a dot to make the signing input:

```
InputValue = Base64(Header).Base64(Payload)
```

Compute the HMAC-SHA-256 of `InputValue` with the **Secret key**, Base64-encoded:

```
Signature = Base64(HMAC-SHA-256(secretKey, InputValue))
```

Join the input and signature with a dot to make the final token:

```
InputValue.Signature
```

(So the final token has the JWS three-part shape `Base64(Header).Base64(Payload).Signature`.)

### 4. Set the HTTP request headers

| Header name | value |
|---|---|
| `Content-Type` | The content type of the request. Not needed if there is no request body. |
| `Date` | The timestamp the request was generated (RFC 1123, ±15 min of now). |
| `Authorization` | The calculated signature, with `Bearer` scheme: `Bearer <Calculated Signature>`. |

With request body:

```
Content-Type: application/json
Date: Wed, 22 Dec 2021 00:00:00 GMT
Authorization: Bearer <Calculated Signature>
```

Without request body:

```
Date: Wed, 22 Dec 2021 00:00:00 GMT
Authorization: Bearer <Calculated Signature>
```

## Authentication examples

### Example A — with request body

Inputs:

| parameter name | value |
|---|---|
| Access key | `LINEADSAMPLE` |
| Secret key | `LINEADSECRETKEYSAMPLE` |
| Request body | `{"name":"test","campaignObjective":"VISIT_MY_WEBSITE"}` |
| Content type | `application/json` |
| Date | `Wed, 22 Dec 2021 00:00:00 GMT` |
| CanonicalURI | `/api/v3/adaccounts/A1/campaigns` |

Header:

```
{"alg":"HS256","kid":"LINEADSAMPLE","typ":"text/plain"}
```

Payload (hex digest of the body, then content-type, date, URI):

```
49c87c1eb6e5588582c13b15212973f6a3ef644872d48fca3252f69043522b1a
application/json
20211222
/api/v3/adaccounts/A1/campaigns
```

Signature (line breaks for display only — the real token has no line breaks):

```
eyJhbGciOiJIUzI1NiIsImtpZCI6IkxJTkVBRFNBTVBMRSIsInR5cCI6InRleHQvcGxhaW4ifQ==
.
NDljODdjMWViNmU1NTg4NTgyYzEzYjE1MjEyOTczZjZhM2VmNjQ0ODcyZDQ4ZmNhMzI1MmY2OTA0MzUyMmIxYQphcHBsaWNhdGlvbi9qc29uCjIwMjExMjIyCi9hcGkvdjMvYWRhY2NvdW50cy9BMS9jYW1wYWlnbnM=
.
Krh1Xh-kWldS-MkOmNH6dmMdkWDTBVmnkDCZHlMRUoo=
```

Creating a campaign:

```sh
curl -X POST \
-H "Content-Type: application/json" \
-H "Date: Wed, 22 Dec 2021 00:00:00 GMT" \
-H "Authorization: Bearer {SIGNATURE}" \
-d '{"name":"test","campaignObjective":"VISIT_MY_WEBSITE"}' \
"https://ads.line.me/api/v3/adaccounts/A1/campaigns"
```

### Example B — without request body

Inputs:

| parameter name | value |
|---|---|
| Access key | `LINEADSAMPLE` |
| Secret key | `LINEADSECRETKEYSAMPLE` |
| Request body | (Empty string) |
| Content type | (Empty string) |
| Date | `Wed, 22 Dec 2021 00:00:00 GMT` |
| CanonicalURI | `/api/v3/adaccounts/A1/campaigns` |

Header:

```
{"alg":"HS256","kid":"LINEADSAMPLE","typ":"text/plain"}
```

Payload — note the **digest of the empty string** on line 1 and the **empty
line 2** for the absent Content-Type:

```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

20211222
/api/v3/adaccounts/A1/campaigns
```

Signature (line breaks for display only):

```
eyJhbGciOiJIUzI1NiIsImtpZCI6IkxJTkVBRFNBTVBMRSIsInR5cCI6InRleHQvcGxhaW4ifQ==
.
ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5MjQyN2FlNDFlNDY0OWI5MzRjYTQ5NTk5MWI3ODUyYjg1NQoKMjAyMTEyMjIKL2FwaS92My9hZGFjY291bnRzL0ExL2NhbXBhaWducw==
.
xHzIHHbWvIZUiek7Jy0fuyG6U0FQpobUyFXybcx9t4c=
```

Reading campaigns:

```sh
curl -X GET \
-H "Content-Type: application/json" \
-H "Date: Wed, 22 Dec 2021 00:00:00 GMT" \
-H "Authorization: Bearer {SIGNATURE}" \
"https://ads.line.me/api/v3/adaccounts/A1/campaigns?page=1&size=10"
```

## Sample code

Official Python sample — `create_child_group.py`. It uses `urlsafe_b64encode`
for all Base64 operations:

```python
import base64
import datetime
import hashlib
import hmac
import json
import urllib.request

def calc_sha256_digest(content: str) -> str:
    sha256 = hashlib.new('sha256')
    sha256.update(content.encode())
    return sha256.hexdigest()

def encode_with_base64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode()

if __name__ == '__main__':
    # Setting parameters for your request
    access_key = "<YOUR_ACCESS_KEY>"
    secret_key = "<YOUR_SECRET_KEY>"
    method = "POST"
    canonical_url = "/api/v3/groups/<YOUR_GROUP_ID>/children"
    url_parameters = ""
    request_body = {"name": "<YOUR_NEW_GROUP_NAME>"}
    has_request_body = request_body is not None

    endpoint = 'https://ads.line.me' + canonical_url + url_parameters
    request_body_json = json.dumps(request_body) if has_request_body else ""
    content_type = 'application/json' if has_request_body else ""

    jws_header = encode_with_base64(
        json.dumps({
            "alg": "HS256",
            "kid": access_key,
            "typ": "text/plain",
        }).encode()
    )

    hex_digest = calc_sha256_digest(request_body_json)
    payload_date = datetime.datetime.utcnow().strftime('%Y%m%d')
    payload = "%s\n%s\n%s\n%s" % (hex_digest, content_type, payload_date, canonical_url)
    jws_payload = encode_with_base64(payload.encode())

    signing_input = "%s.%s" % (jws_header, jws_payload)
    signature = hmac.new(
        secret_key.encode(),
        signing_input.encode(),
        hashlib.sha256
    ).digest()
    encoded_signature = encode_with_base64(signature)
    token = "%s.%s.%s" % (jws_header, jws_payload, encoded_signature)

    http_headers = {
        "Date": datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT'),
        "Authorization": "Bearer %s" % token
    }

    if has_request_body:
        http_headers["Content-Type"] = content_type
        req = urllib.request.Request(endpoint, data=request_body_json.encode(), headers=http_headers, method=method)
    else:
        req = urllib.request.Request(endpoint, headers=http_headers, method=method)

    with urllib.request.urlopen(req) as res:
        resp = res.read()
    print(resp.decode())
```

---

# Common specifications

## Rate Limits

The number of requests per API is limited, **per API user**.

| Partner role | Limit |
|---|---|
| Ad Tech (General) | 10 requests / sec |
| Data Provider (General) | 10 requests / sec |
| Reporting (General) | 2 requests / sec |

Exceeding the rate limit returns `429 Too Many Requests`.

## Request Quota

Independently of the rate limit, some APIs cap the number of **simultaneous**
calls a user can make. Such APIs return these headers:

| Header Name | Description |
|---|---|
| `X-Request-Quota-Limit` | The maximum Request Quota applied to a specific API. |
| `X-Request-Quota-Used` | Current number of quotas used. Calls up to the Limit succeed; calls beyond it receive a response with the value `EXCEED_LIMIT`. |

Per-API quota limits:

| API | Limit |
|---|---|
| Report Online — Read (`GET /v3/adaccounts/{adaccountId}/reports/online/{reportLevel}`) | At most 30 simultaneous requests / recommended about 20 concurrent threads for 3-second API calls |

# LADM v12.0.1 new features

| APIs | Description |
|---|---|
| Placement: PlacementCodes, Targeting, ReportBreakdown | Wallet placement has been changed to **Mini App Tab** (JP only). |

---

# Error responses & HTTP status codes

Most endpoints return errors as an `Errors` object — an array of `Error`:

`Errors`:

| Name | Description | Schema |
|---|---|---|
| `errors` | List of occurred errors. | `< Error > array` |

`Error`:

| Name | Description | Schema |
|---|---|---|
| `reason` | The reason of the error (a stable error-reason code string). | string |
| `property` | The property which caused the error. | string |

The full list of `reason` codes is in `references/status-and-errors.md`.

## Standard HTTP responses

Most endpoints share this response set:

| HTTP Code | Meaning |
|---|---|
| 200 | Successful operation. |
| 202 | Accepted — async job queued (CustomAudience create/upload/delete). |
| 400 | Problem with the request. Body: `< Errors > array`. |
| 401 | The token specified in the `Authorization` header is invalid. Body: `< Errors > array`. |
| 403 | Not authorized to use the API. Confirm your adaccount is authorized for the API. Body: `< Errors > array`. |
| 422 | Some field values are absent or invalid (ARS simulation). Body: `ArsSimulationResult`. |
| 429 | Exceeded the rate limit for API calls (or the Request Quota / concurrency limit). No content. |
| 500 | Error on the internal server. Body: `< Errors > array`. |

The **ProductSets / Products** endpoints use a different scheme — their `400` /
`403` / `404` / `500` carry no body and use named reasons
(`BAD_REQUEST`, `UNSUPPORTED_TYPE`, `INVALID_PRICE`, `NO_AUTHORITY`, `NO_DATA`,
`EXCEED_LIMIT`, `INTERNAL_SERVER_ERROR`) — see `references/products-and-dpa.md`.
