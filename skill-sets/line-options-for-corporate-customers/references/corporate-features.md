# Corporate Features: Error notification, Provider page, Mission Sticker, LINE Profile+, LINE Beacon, Mark as read

Source:
- `https://developers.line.biz/en/docs/partner-docs/error-notification/`
- `https://developers.line.biz/en/docs/partner-docs/provider-page/`
- `https://developers.line.biz/en/docs/partner-docs/mission-stickers/`
- `https://developers.line.biz/en/docs/partner-docs/line-profile-plus/`
- `https://developers.line.biz/en/docs/partner-docs/line-beacon/`
- `https://developers.line.biz/en/docs/partner-docs/mark-as-read/`
- `https://developers.line.biz/en/reference/partner-docs/` (Mission Sticker API + Mark as read API sections)

## Table of contents

- Error notification (email when bot server fails to receive a webhook)
- Provider page (list of services a provider offers)
- Mission Sticker API (grant sticker download permission) — including API reference
- LINE Profile+ (get user-registered profile data via ID token)
- LINE Beacon (reception conditions)
- Mark as read API (old) — including API reference

All features in this file require corporate-customer application. Only corporate
users who have submitted the required applications can use them. Contact a LINE
sales representative or LINE Sales partners (`https://www.lycbiz.com/jp/partner/sales/`).

---

# Error notification

If the bot server doesn't respond, or returns a response other than `2xx`, to a
webhook event request from the LINE Platform, the channel administrator receives
a notification email. This option is the "error notification" function.

The error notification feature is **only available for Messaging API channels
that are under a certified provider**.

## Notification email

### Email recipients

- Email address registered on the **Basic settings** page of the target channel.
- Registered email address of a user with the **Admin** role for the target channel.

### Email types

1. **When the LINE Platform detected an error** — sent when the LINE Platform
   detects an error occurred.
   - Subject: `Messaging API: Your bot server returned no response or an error - <Channel name>`
   - Main text: notice that the bot server did not respond or returned an error.
2. **When the LINE Platform stopped webhook redelivery** — only if Webhook
   redelivery is enabled in the Messaging API channel settings. The LINE Platform
   redelivers webhooks the bot server failed to receive; if the bot server still
   doesn't respond after a period, the Platform stops redelivering and sends:
   - Subject: `Messaging API: Webhook redelivery stopped - <Channel name>`
   - Main text: notice that redelivery was stopped due to no response.

### Email content

| Item | Description |
|---|---|
| Channel ID | Target channel ID |
| Channel name | Target channel name |
| Reason for error | Overview of reason for error (see Messaging API doc "Check the reason for errors") |
| Detail for error | Details on reason for error (see Messaging API doc "Check the detail for errors") |
| Error count | Number of times the error occurred |
| Time detected | Time when the error occurred |

The contents of the email and error messages are subject to change without notice.

## Resolving a notification

Example: reason `error_status_code`, detail `500` → the bot server responded to
the webhook request with HTTP status code `500`. Investigate the bot server's
webhook-event processing log. **LY Corporation doesn't provide individual
investigation of errors** — the developer managing the channel/bot server must
address the root cause.

## "Webhook errors" tab in the LINE Developers Console

Error info from the notification email can also be checked on the **Webhook
errors** tab of the Messaging API channel in the LINE Developers Console. This
tab is displayed only for channels where **Error statistics aggregation** is
enabled on the **Messaging API** tab.

---

# Provider page

A provider page is a list of the various services a Provider offers on the LINE
Platform — LINE Official Account (Messaging API), LINE MINI App, LINE Login.
Provider page URL format: `https://provider.line.me/{ProviderID}`.

## Settings

- Only **certified providers** can configure and publish provider pages.
- Configured from the **Provider page** tab in the LINE Developers Console
  (displayed only if authorized to use the provider page function).
- Register a privacy policy URL and add services. **Up to 100 services** per
  provider page. If the privacy policy URL is not registered, registered
  services are not displayed.
- Only **verified or premium** LINE Official Accounts can be added.
- Drag and drop services to set display order. The service category order (LINE
  Official Account → LINE MINI App → LINE Login) cannot be changed; only the
  order within each category.

## Sharing the provider page URL with users

- **LINE Official Account**: share the link in the rich menu or in the first
  message after being added as a friend.
- **LINE MINI App**: users tap the action button → an **About the service** item
  shows the provider page.
- **LINE Login**: share the link on pages with a LINE Login button.

## Common use of user IDs

The LINE user data policy generally prohibits a provider offering multiple
services from linking/sharing LINE user data across individual services.
**Exception**: after publishing the provider page, if the Terms and conditions
of use are met, a provider may link LINE user data and use it in common.

### Terms and conditions of use

- The provider must give users a link to the provider page and inform users that
  each service is provided by the same provider.
- For Messaging API channels: the contracted company and provider of the LINE
  Official Account must be the same, and the relationship between the two
  companies must not be misleading to users.

Non-compliance may lead LY Corporation to recommend corrective action or ban the
use of LINE user data.

---

# Mission Sticker API

Mission stickers are provided to users upon completion of certain objectives.
Used as an incentive, they encourage users to "link ID information," "register as
a member," or "answer a questionnaire."

When a user can't download a mission sticker set even though the API call
succeeded, check:
- The sticker set info (release date, channel ID, country) is accurate.
- The user's country matches the sticker set's country.
- The target user hasn't already downloaded the mission sticker.

## Provide mission stickers to the users

Grants permission for users who have completed a certain objective to download
your mission sticker.

**HTTP request**

```
POST https://api.line.me/shop/v3/mission
```

(Endpoint was previously named "Send mission stickers (v3)"; renamed
2025/06/18 — functionality unchanged.)

**Example request**

```sh
curl -X POST https://api.line.me/shop/v3/mission \
-H "Content-Type: application/json" \
-H "Authorization: Bearer {channel access token}" \
-d '{
    "to": "U4af4980629...",
    "productType": "STICKER",
    "productId": "0000",
    "sendPresentMessage": false
}'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | String | Yes | User ID of a user to grant download permission |
| `productType` | String | Yes | `STICKER` |
| `productId` | String | Yes | Package ID for a set of stickers |
| `sendPresentMessage` | Boolean | Yes | `false` |

**Response**: status code `200` and an empty response body.

**Error response**: an HTTP status code corresponding to the error plus JSON:

| Property | Type | Description |
|---|---|---|
| `message` | String | Message containing error information |

```json
// If you specify an invalid user ID (400 Bad Request)
{
  "message": "invalid request"
}
```

### Mission Sticker API error messages

| Code | Message | Description |
|---|---|---|
| `400` | invalid request | The destination user ID specified for `to` is invalid. |
| `400` | illegal argument | The sticker set specified for `productId` isn't set as a mission sticker. |
| `400` | not in sales period | The sticker set specified for `productId` is out of validity period. |
| `400` | sticker set not available for channel | The channel doesn't have permission to use the sticker set specified for `productId`. |
| `400` | not available | Unable to grant the sticker because: the sticker set isn't available for purchase in the user's country/region; the user's device doesn't support it; or the user's LINE app version doesn't support it. |
| `403` | not allowed to use the API | The channel isn't granted the required permission for the mission sticker API. |
| `404` | not found | The sticker set specified for `productId` doesn't exist. |
| `500` | internal error | An internal server error occurred. Wait and retry. |
| `502` | upstream error | An internal network error occurred. Wait and retry. |

> Error responses for the Mission Sticker API were modified (2026/02/19) to
> prevent inference of user attribute information.

---

# LINE Profile+

LINE Profile+ is a service for managing the profile information of LINE users.
The data users register with LINE Profile+ differs from usual profile information
and can only be obtained by corporate users who have undergone the application
process. **Available only to corporate users in Japan.** For LINE MINI Apps, this
feature is only available for verified MINI Apps.

LINE Profile+ data is delivered inside an **ID token**. There is no dedicated
REST endpoint — you obtain it by adding scopes and decoding/verifying the ID
token via LIFF, LINE MINI App, or LINE Login.

## Get LINE Profile+ data — three steps

| Step | Via LIFF App / LINE MINI App | Via LINE Login |
|---|---|---|
| 1. Specify scopes | Specify scopes on LINE Developers Console | Specify scopes for authorization URL |
| 2. Get ID token payload | `liff.getDecodedIDToken()` | Verify the ID token obtained when issuing the access token |
| 3. Get LINE Profile+ info | Read it from the ID token payload | Read it from the ID token payload |

In all cases, **specify `openid`** alongside the Profile+ scopes — an ID token is
required and `openid` requests permission to get it. LINE Profile+ is **not
compatible with LINE Login v2.0 or earlier**.

### Via LIFF App or LINE MINI App

1. **Specify scopes**: on the LINE Developers Console, in the **Scope** section
   under the **Web app settings** tab (LINE MINI App channel) or **LIFF** tab
   (LINE Login channel), check the scope(s) to use.
2. **Get ID token payload**: call `liff.getDecodedIDToken()`:

   ```javascript
   liff.init(() => {
     const idToken = liff.getDecodedIDToken();
     console.log(idToken); // print decoded idToken object
   });
   ```

3. **Get LINE Profile+ info** from the ID token payload.

### Via LINE Login

Integrate LINE Login v2.1 into a web app and use an ID token.

1. **Specify scopes** in the authorization URL `scope` parameter:

   ```
   https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fauth%3Fkey%3Dvalue&state=123abc&scope=openid%20profile%20real_name%20gender%20birthdate%20phone%20address&bot_prompt=normal&nonce=0987654asd
   ```

2. **Issue an access token** (the response includes the ID token):

   ```sh
   curl -v -X POST https://api.line.me/oauth2/v2.1/token \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   -d 'grant_type=authorization_code' \
   -d 'code=b5fd32eacc791df' \
   --data-urlencode 'redirect_uri=https://example.com/auth?key=value' \
   -d 'client_id=12345' \
   -d 'client_secret=d6524edacc8742aeedf98f'
   ```

   The ID token is Base64-encoded. Decode it to JSON by calling **Verify ID
   token**:

   ```sh
   curl -v -X POST 'https://api.line.me/oauth2/v2.1/verify' \
    -d 'id_token=eyJraWQiOiIxNmUwNGQ0ZTU2NzgzYTc5MmRjYjQ2ODRkOD...' \
    -d 'client_id=1234567890'
   ```

3. **Get LINE Profile+ info** from the ID token payload.

## LINE Profile+ scopes

You must apply for each scope in advance.

| Scope | Grants authority to obtain |
|---|---|
| `real_name` | The "name" registered by the user |
| `gender` | The "gender" registered by the user |
| `birthdate` | The "birthdate" registered by the user |
| `phone` | The "phone number" registered by the user |
| `address` | The "address" registered by the user |

## LINE Profile+ information in the ID token

When using LINE Profile+, the following properties are added to the ID token
payload (each requires the listed scope's authorization).

| Property | Type | Description | Scope required |
|---|---|---|---|
| `given_name` | String | First name | `real_name` |
| `given_name_pronunciation` | String | Kana of first name | `real_name` |
| `middle_name` | String | Middle name | `real_name` |
| `family_name` | String | Last name | `real_name` |
| `family_name_pronunciation` | String | Kana of last name (katakana) | `real_name` |
| `gender` | String | `male`, `female`, or a value entered by the user | `gender` |
| `birthdate` | String | Birthdate; RFC 3339 format | `birthdate` |
| `phone_number` | String | Phone number; E.164 format | `phone` |
| `address` | Object | Address object (see below) | `address` |

### Address object

A user can register up to 10 addresses to LINE Profile+. The ID token contains
only one — the most recently updated or used address.

| Field | Type | Description |
|---|---|---|
| `postal_code` | String | Postal code; single-byte numbers, no hyphens. Optional — may be blank. |
| `region` | String | State or province |
| `locality` | String | City |
| `street_address` | String | "Street" and "Other", separated by a line break (`/n`). Optional — may be blank. |
| `country` | String | Country name; ISO 3166-1 alpha-2 |

### Payload example

```json
{
  "iss": "https://access.line.me",
  "sub": "U272cada9c6f4c0c933b0713bc2f90f68",
  "aud": "1234567890",
  "exp": 1513142487,
  "iat": 1513138887,
  "name": "LINE taro",
  "picture": "https://profile.line-scdn.net/0h8pWWElvzZ19qLk3ywQYYCFZraTIdAGEXEhx9ak56MDxDHiUIVEEsPBspMG1EGSEPAk4uP01t0m5G",
  "given_name": "LINE",
  "middle_name": "L",
  "family_name": "Taro",
  "gender": "male",
  "birthdate": "1990-01-01",
  "phone_number": "+81901111....",
  "address": {
    "postal_code": "1028282",
    "region": "Tokyo",
    "locality": "Kioicho, Chiyoda-ku",
    "street_address": "1-3",
    "country": "JP"
  }
}
```

---

# LINE Beacon

LINE Beacon lets a LINE Official Account detect proximity. This page documents
the **conditions for receiving** LINE Beacon. (The beacon webhook event itself is
part of the Messaging API.)

## User settings required to receive LINE Beacon

- The OS version meets LINE's requirements.
- The smartphone's Bluetooth setting is on.
- The user has agreed to use LINE Beacon: **Settings → Privacy → Provide usage
  data → LINE Beacon**.

## Reception conditions

"Foreground" = LINE is running and in use. "Background" = LINE is running but not
in use. Behavior when LINE isn't running is undefined (not "background").

### iOS

| LINE app status | Reception conditions |
|---|---|
| Foreground | User settings meet the conditions. |
| Background | All of: user settings meet the conditions; **Location Services** is ON (Settings → Privacy & Security → Location Services); LINE app's **ALLOW LOCATION ACCESS** is set to "Always" (Settings → LINE → Location); LINE app's **Precise location** is ON. |

### Android

| LINE app status | Reception conditions |
|---|---|
| Foreground | All of: user settings meet the conditions; **Use location** is ON (Settings → Location → Use location); LINE app's **Location permission** = "Allow only while using the app"; LINE app's **Use precise location** is ON; LINE app's **Nearby devices permission** = "Allow". |
| Background | Background receiving isn't available on Android. |

## Beacon banner display conditions

These conditions also apply to test accounts.

**If your LINE Official Account is searchable:**

| LINE Official Account friendship | Agreed to LINE Beacon Terms of Use | Beacon banner |
|---|---|---|
| Friend added | Agreed | Hidden |
| Friend added | Not agreed | Hidden |
| Friend not added | Agreed | Display |
| Friend not added | Not agreed | Hidden |

**If your LINE Official Account isn't searchable:** beacon banners won't be
displayed regardless of friendship or agreement.

---

# Mark as read API (old)

By using the Mark as read API (old), "Read" can be displayed in all messages sent
from a specific user.

> **DEPRECATED / superseded.** The Mark as read API (old) remains available, but
> for new implementations use the Messaging API's **Mark messages as read**
> endpoint (`POST /v2/bot/message/markAsRead` with `chat.userId`) — it requires no
> application and works with the chat feature.
>
> New applications for the Mark as read API (old) **stop being accepted at the
> end of October 2026**. LINE Official Accounts already using it can continue.
> LY Corporation is considering deprecating it.

## Behavior notes

- **Automatic read setting is disabled.** A LINE Official Account normally
  displays "Read" automatically when receiving a message. Using the Mark as read
  API (old) disables this. So on an account using this API, "Read" won't appear
  on user messages unless a Mark as read API (old) request is sent.
  Recommendation: send a Mark as read API (old) request whenever a new message is
  received from a user.
- **Incompatible with the chat function.** The chat function (LINE Official
  Account Manager / app) and the Mark as read API (old) can't be used together.
  Starting to use the Mark as read API (old) disables the chat function.
- **Retry on failure.** On a `5xx` error or timeout, retry the request. If a new
  message arrives from the user before the retry succeeds, "Read" will be shown
  on all messages including the new one.

## Mark messages from users as read

**HTTP request**

```
POST https://api.line.me/v2/bot/message/markAsRead
```

**Rate limit**: 2,000 requests per second.

**Example request**

```sh
curl -v -X POST https://api.line.me/v2/bot/message/markAsRead \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {channel_access_token}' \
-d '{
    "chat": {
        "userId": "Uxxxxxxxxxxxxxxxxxx"
    }
}'
```

**Request headers**

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `chat.userId` | String | Yes | The target user ID |

**Response**: status code `200` and an empty JSON object `{}`.

**Error response**:

| Code | Description |
|---|---|
| `400` | An invalid user ID is specified. |

```json
// If you specify an invalid user ID (400 Bad Request)
{
  "message": "The property, 'chat.chatId', in the request body is invalid (line: -, column: -)"
}
```
