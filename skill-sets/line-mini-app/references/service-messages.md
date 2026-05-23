# Service Messages — Concept & Service Message API

Source:
- `https://developers.line.biz/en/docs/line-mini-app/develop/service-messages/`
- `https://developers.line.biz/en/reference/line-mini-app/#service-messages` (API reference)

## Table of contents

- What service messages are
- Where service messages are displayed
- Service message templates & the Console
- Template elements & character limits
- Flow of sending a service message
- **API: Issue a service notification token**
- **API: Send a service message**

> **Verified MINI Apps only.** Service messages can only be used by verified
> MINI Apps. Unverified MINI Apps can test the feature on the internal channel
> for Developing, but cannot use it on the internal channel for Published.

---

## What service messages are

Service messages let a LINE MINI App notify a user with information the user
should know, as a confirmation of or response to a particular user action. For
example, after a restaurant/accommodation reservation, you can send up to 5
service messages for that single reservation action (reservation completion,
day-before reminder, etc.).

> **Conditions.** Service messages may be sent only as a confirmation or
> response to a user action on the LINE MINI App. Advertisements and event
> notifications are prohibited — including discounts, shopping rewards, new
> products, coupons, or promotions. See "Conditions for service messages" in
> `submit-service-and-demos.md`.

## Where service messages are displayed

Service messages are shown in a chat room determined per region, regardless of
the type of LINE MINI App:

| Japan | Thailand | Taiwan |
|---|---|---|
| LINEミニアプリ お知らせ | LINE MINI App Notice | LINE MINI App 通知 |

## Service message templates & the Console

You send service messages using provided **templates**. Templates are organized
by category (store reservations, queue management, delivery notifications, …)
and available in **six languages**: Japanese, English, Traditional Chinese,
Thai, Indonesian, Korean. View and configure them in the
[LINE Developers Console](https://developers.line.biz/console/).

You can configure up to **20 service message templates** per LINE MINI App
channel.

### Adding a template to the channel

1. In the Console, select the LINE MINI App channel, click the **Service
   message template** tab.
2. Click **Add**.
3. Configure:

   | Item | Description |
   |---|---|
   | Select template | Pick a template to use with the Service Message API. |
   | Template detail | Details of the selected template. When calling the Send-service-message API, use the string shown in **Template name for API use** (`{template name}_{BCP 47 language tag}`) as `templateName`. |
   | Preview | A preview of the test message. |
   | Send test message | Enter the JSON object specifying template variable-value pairs. **Copy** copies the JSON; **Reset** discards edits; **Send** sends a test message to the LINE account logged into the Console. |
   | Use Case | Enter the exact use case for the template. |

4. Click **Add** → returns to the template list. The review status shows in
   **Published status**.

   | Published status | Description |
   |---|---|
   | DEVELOPING | Review not yet requested. Only usable to send service messages by developers with Admin or Tester roles, from a channel ready for publication. |
   | PUBLISHING | Passed review. Used to send service messages from the production channel to LINE MINI App users. |

Template review states:

- **While the channel is in development**: you can add a new template, see the
  list, view details, edit the `use case`, delete a template, and send a test
  message in the simulator.
- **While review is in progress**: you can see the list, send a test message,
  and view details — but you **cannot** add a new template, edit a `use case`,
  or delete a template. The review does not affect existing templates.
- **Once the channel is published**: you can use the official template (same
  conditions as the development stage).

> Using a template in a manner that deviates from the entered **Use Case** may
> result in being prevented from using it.

A template added to the channel must **pass review by LY Corporation** to be
used with the Send-service-message API.

### Previewing service messages

On the "Add service message template" screen you can preview messages and send
test messages by selecting a template and editing the JSON. Test messages go to
the LINE account associated with the logged-in developer.

## Template elements & character limits

A service message consists of **(A) Title**, **(B) Detail**, **(C) Button**,
**(D) Footer**:

| Label | Section | Description |
|---|---|---|
| A | Title | Title (A-1) + Subtitle (A-2). |
| B | Detail | Two layouts depending on template type: **detailed** — one key required, max keys depend on the template; **simple** — up to one key. |
| C | Button | Number of buttons differs per template; only buttons with a configured URL are displayed. Use a [Permanent link](https://developers.line.biz/en/docs/line-mini-app/develop/permanent-links/) of your LINE MINI App page as the URL. First button is required (first link); second+ are optional and predefined by the template. |
| D | Footer | Shows the **Channel icon** and **Channel name** from the Basic settings tab. Tapping it opens the LINE MINI App top page. |

> Footer before the LINE MINI App is "Reflected": if the status is "Not yet
> reviewed" or "Reviewing", the LINE icon + text "Service Message" is shown
> instead of the configured footer.

### Maximum number of characters per element (Detail section)

| Item | Recommended | Soft limit | Hard limit |
|---|---|---|---|
| **detailed** | 10 | 36 | 50 |
| **simple** | 32 | 100 | 150 |

How text is displayed by length:

| Length | Display |
|---|---|
| ≤ recommended | All text displayed |
| > recommended, ≤ soft limit | Overflowing characters may be replaced by `...` |
| > soft limit, ≤ hard limit | Overflowing characters are replaced by `...` |
| > hard limit | Cannot send service message — error |

Characters are counted in [grapheme cluster](https://unicode.org/reports/tr29/)
units, not UTF-16 code units.

## Flow of sending a service message

1. In the Console, add a service message template to the LINE MINI App channel.
2. Issue a service notification token and send a service message based on a
   user action.
3. Use the new service notification token from step 2 to send a subsequent
   service message (e.g. a reminder).

### Token relationship

To send a service message you need a **channel access token** and a **service
notification token**. The service notification token is issued from a
**channel access token** + a **LIFF access token** (the access token obtained
by `liff.getAccessToken()`).

> Use of stateless channel access tokens is recommended. LINE MINI App channels
> cannot use long-lived or v2.1 channel access tokens — use a stateless token
> (recommended) or a short-lived token.

### Sending for the first time

1. On a notifying user action, call `liff.getAccessToken()` in the LINE MINI App
   to get the LIFF access token.
2. Send the LIFF access token to your server.
3. Obtain a channel access token.
4. Issue a service notification token (using the channel access token from
   step 3 + the LIFF access token from step 1). If the user closes the LINE
   MINI App, the LIFF access token is revoked even if still valid.

   ```java
   final OkHttpClient notifierApiClient = new OkHttpClient().newBuilder().build();
   final MediaType mediaType = MediaType.parse("application/json");
   final RequestBody notificationTokenRequestBody = RequestBody.create(mediaType, "{'liffAccessToken': 'eyJhbGciOiJIUzI1NiJ9…​'");
   final Request notificationTokenRequest = new Request.Builder()
     .url(BASE_URL + "/notifier/token")
     .method("POST", notificationTokenRequestBody)
     .addHeader("Content-Type", "application/json")
     .addHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9...")
     .build();
   final NotificationTokenResponse response = notifierApiClient.newCall(request).execute();
   String notificationToken = notificationTokenResponse.getNotificationToken();
   int tokenRemainingCount = notificationTokenResponse.getRemainingCount();
   ```

5. Send the service message using the service notification token from step 4.
   After sending, save the `notificationToken` from the response. If the
   template has variables, specify the key-value pairs in `params`; a missing
   required template variable returns an error.

   Example `params`:

   ```json
   {
     ...
     "params": {
       // params sample to be updated
       "variable-name": "value",
       "button_uri_1": "detailView?userId=1234&purchaseID=5678"
     }
     ...
   }
   ```

   ```java
   final RequestBody notificationRequestBody = RequestBody.create(mediaType,"{
     'templateName': 'reservation_confirmation_en',
     'notificationToken': '34c11a03-b726-49e3-8ce0-949387a9…​',
     'params': {
       'template-field-name': 'field-value',
       'template-field-name': 'field-value',
     }}");
   final Request notificationRequest = new Request.Builder()
     .url(BASE_URL + "/notifier/send?target=service")
     .method("POST", notificationRequestBody)
     .addHeader("Content-Type", "application/json")
     .addHeader("Authorization", "Bearer W1TeHCgfH2Liwa...")
     .build();
   final NotificationResponse notificationResponse = notifierApiClient.newCall(request).execute();
   notificationToken = notificationResponse.getNotificationToken();
   tokenRemainingCount = notificationResponse.getRemainingCount();
   ```

A service notification token expires 1 year (31,536,000 s) after being issued;
during that period up to 5 service messages can be sent for a single user
action.

### Sending subsequent service messages

For subsequent messages for the **same user action**, use the
`notificationToken` from the response of the last send. Save the renewed token
each time. **Do not** issue a new service notification token by reusing the
channel access token + LIFF access token used for the first message.

```java
...
JsonObject subsequentMessage = Json.createObjectBuilder()
  .add("notificationToken", notificationToken)
  .add("templateName", templateName)
  .add("params", templateData)
  .build();
...

if (tokenRemainingCount < 0)
{
  notificationRequestBody = RequestBody.create(mediaType, subsequentMessage.toString());
  notificationRequest = new Request.Builder()
        .url(BASE_URL + "/notifier/send?target=service")
        .method("POST", notificationRequestBody)
        .addHeader("Content-Type", mediaType.toString())
        .addHeader("Authorization", "Bearer W1TeHCgfH2Liwa...")
        .build();
  notificationResponse =
        notifierApiClient.newCall(notificationRequest).execute();
  notificationToken = notificationResponse.getNotificationToken();
  tokenRemainingCount = notificationResponse.getRemainingCount();
}
```

### Save the service notification token from the response

After sending, keep the updated `notificationToken` from the response — it is
used for subsequent service messages for the same user action. You can send as
many service messages for that action as `remainingCount` allows, until the
token expires. Each user action is identified by the `sessionId` in the
response.

---

# API: Issue a service notification token

Issues a service notification token, used to send a service message to the
associated user.

Service notification token features:

- Expires 1 year (31,536,000 s) after being issued. While valid, up to 5
  service messages can be sent.
- Every use renews the token value (unless it expired or has no remaining
  count). For successive messages, keep the renewed token.

> **Don't issue more than one service notification token with a single access
> token.** Issuing multiple service notification tokens by reusing one LIFF
> access token (from `liff.getAccessToken()`) is not allowed — only one service
> notification token per LIFF access token.

> Each service notification token is associated with **one** user; you cannot
> use it to send to other users.

### HTTP request

`POST https://api.line.me/message/v3/notifier/token`

### Request headers

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` |

> Long-lived channel access tokens and v2.1 (user-specified expiration) tokens
> **cannot** be used for LINE MINI App channels. Use a stateless channel access
> token (recommended — unlimited issuance, no lifecycle management) or a
> short-lived channel access token.

### Request body

| Property | Required | Type | Description |
|---|---|---|---|
| `liffAccessToken` | Yes | String | User access token obtained by `liff.getAccessToken()` (LIFF access token). |

### Example request

```sh
curl -X POST https://api.line.me/message/v3/notifier/token \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer W1TeHCgfH2Liwa...' \
-d '{
    "liffAccessToken": "eyJhbGciOiJIUzI1NiJ9..."
}'
```

### Response

Status `200` with a JSON object:

| Property | Type | Description |
|---|---|---|
| `notificationToken` | String | Service notification token. |
| `expiresIn` | Number | Seconds remaining before the token expires. A token expires 1 year (31,536,000 s) after being issued. |
| `remainingCount` | Number | Number of times you can send a service message with this token. |
| `sessionId` | String | The session ID. |

```json
{
  "notificationToken": "34c11a03-b726-49e3-8ce0-949387a9..",
  "expiresIn": 31536000,
  "remainingCount": 5,
  "sessionId": "xD06...."
}
```

### Error response

| Status code | Description |
|---|---|
| 400 Bad request | A problem with the request body, **or** the LIFF access token in `liffAccessToken` was used multiple times in a short span to request token issuance. |
| 401 Unauthorized | A valid channel access token and/or a valid LIFF access token was not specified. (When the user closes the LIFF app, the LIFF access token is revoked even if not expired.) |
| 403 Forbidden | This channel is not authorized to issue service messages. |
| 500 Internal Server Error | Error on the internal server. |

```json
{
  "message": "[liffAccessToken] must not be blank"
}
```

---

# API: Send a service message

Sends a service message to the user specified in the service notification
token. Once sent, the token's value is renewed unless it expired or has no
remaining count — keep the renewed token for successive messages.

### HTTP request

`POST https://api.line.me/message/v3/notifier/send`

### Request headers

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | `Bearer {channel access token}` |

(Same stateless-token recommendation as above.)

### Query parameters

| Parameter | Required | Value |
|---|---|---|
| `target` | Yes | `service` |

### Request body

| Property | Required | Type | Description |
|---|---|---|---|
| `templateName` | Yes | String | The name of the added template used for the service message. Check it in the Console. Use with a BCP 47 language tag suffix. Format: `{template name}_{BCP 47 language tag}`. Max characters: 30. |
| `params` | Yes | object | JSON object of template variable-value pairs. If the template has no variable, specify an empty object (`{ }`). If a variable is a required element, specify its pair. |
| `notificationToken` | Yes | String | Service notification token. |

> Supported `templateName` languages / language tags: Japanese `ja`, English
> `en`, Chinese (Traditional) `zh-TW`, Thai `th`, Indonesian `id`, Korean `ko`.

### Example request

```sh
curl -X POST https://api.line.me/message/v3/notifier/send?target=service \
-H 'Authorization: Bearer W1TeHCgfH2Liwa...' \
-H 'Content-Type: application/json' \
-d '{
    "templateName": "thankyou_msg_en",
    "params": {
        "date": "2020-04-23",
        "username": "Brown & Cony"
    },
    "notificationToken": "34c11a03-b726-49e3-8ce0-949387a9.."
}'
```

### Response

Status `200` with a JSON object:

| Property | Type | Description |
|---|---|---|
| `notificationToken` | String | A renewed service notification token. Use it for successive service messages. |
| `expiresIn` | Number | Seconds remaining until the renewed token expires. |
| `remainingCount` | Number | Number of times you can send successive service messages with the renewed token. |
| `sessionId` | String | The session ID. |

> If `expiresIn` and `remainingCount` are both `0`, the service message was
> sent but the token could not be renewed.

```json
// Request was successful,
// renewed service notification
// token issued
{
  "notificationToken": "c9884874-bf6a-4241-8999-2767241c...",
  "expiresIn": 31535906,
  "remainingCount": 3,
  "sessionId": "xD06...."
}

// Request was successful,
// the service message
// was sent, but the LINE Platform
// cannot renew the token
{
  "expiresIn": 0,
  "remainingCount": 0
}
```

### Error response

| Status code | Description |
|---|---|
| 400 Bad request | A problem with the request body, **or** the target recipient of the service message doesn't exist. |
| 401 Unauthorized | A valid channel access token and/or a valid service notification token was not specified. |
| 403 Forbidden | This channel is not authorized to send service messages, **or** the specified template cannot be found. |

```json
{
  "message": "Invalid notifier token"
}
```
