# LIFF API Reference (client `liff` SDK)

Source: `https://developers.line.biz/en/reference/liff/`

The complete reference for the `liff` JavaScript SDK object (LIFF v2). Every
async method returns a `Promise`; on rejection a `LiffError` object is passed.

## Table of contents

- Common specifications: operating environment, `LiffError`
- SDK properties: `liff.id`, `liff.ready`
- Initialization: `liff.init()`
- Getting environment: `getOS`, `getAppLanguage`, `getLanguage`, `getVersion`, `getLineVersion`, `getContext`, `isInClient`, `isLoggedIn`, `isApiAvailable`
- Authentication: `login`, `logout`, `getAccessToken`, `getIDToken`, `getDecodedIDToken`, `permission.*`
- Profile: `getProfile`, `getFriendship`, `requestFriendship`
- Window: `openWindow`, `closeWindow`
- Message: `sendMessages`, `shareTargetPicker`
- Camera: `scanCodeV2`, `scanCode`
- Permanent link: `permanentLink.*`
- LIFF plugin: `use`
- Internationalization: `i18n.setLang`
- Others: `createShortcutOnHomeScreen`

---

# Common specifications

## Operating environment

Which functions are usable depends on whether the LIFF app runs in a LIFF
browser or an external browser (e.g. `liff.scanCode()` can't be used in an
external browser). LIFF apps are **not compatible with OpenChat** — e.g.
retrieving a user's profile through a LIFF app isn't possible in most cases.

## LIFF SDK errors

LIFF SDK errors are returned as `LiffError` objects. Identify errors by **both**
the error code and the error message — messages may change without notice.

```json
{
  "code": "INIT_FAILED",
  "message": "Failed to init LIFF SDK"
}
```

### `LiffError` object

| Property | Type | Description |
|---|---|---|
| `code` | String | Error code |
| `message` | String | Error message (not always included) |
| `cause` | Unknown | Error cause (not always included) |

### Error codes

| Error code | Description |
|---|---|
| `400` | Problem with the request. Check request parameters and JSON format |
| `401` | Check the authorization header |
| `403` | Not authorized to use the API. Confirm the account/plan is authorized |
| `429` | Make sure you're within the rate limit |
| `500` | Temporary error on the API server |
| `INIT_FAILED` | Failed to init LIFF SDK |
| `INVALID_ARGUMENT` | An invalid argument was specified |
| `UNAUTHORIZED` | The user didn't authorize; called a server API without an access token; or called the share target picker before logging in |
| `FORBIDDEN` | No required permission; or used a feature in an unsupported environment |
| `INVALID_CONFIG` | Invalid setting — `liffId` not specified in `liff.init()`, or the page running `liff.permanentLink.createUrl()` doesn't start with the Endpoint URL |
| `INVALID_ID_TOKEN` | Failed to verify the ID token |
| `EXCEPTION_IN_SUBWINDOW` | Problem with a subwindow (e.g. the target picker idle for more than 10 minutes) |
| `UNKNOWN` | Unknown error |

---

# LIFF SDK properties

## liff.id

Holds the LIFF app ID (`String`) passed to `liff.init()`. The value is `null`
until `liff.init()` runs.

```javascript
const liffId = "my-liff-id";
liff.init({ liffId });
// liff.id equals to liffId
```

## liff.ready

A property holding a `Promise` that resolves when `liff.init()` runs for the
first time after the LIFF app starts. **Can be used before the LIFF app is
initialized.**

```javascript
liff.ready.then(() => {
  // do something you want when liff.init finishes
});
```

If `liff.init()` fails, `liff.ready` is **not** rejected and does **not** return
a `LiffError`.

---

# Initialization

## liff.init()

Initializes a LIFF app. You can only call other LIFF SDK methods after `liff.init()`.
LIFF apps must be initialized **each time a page is opened** — even on same-app
navigations. The SDK obtains the user's access token and ID token from the LINE
Platform when `liff.init()` runs.

### Syntax

```javascript
liff.init(config, successCallback, errorCallback);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `config` | Yes | Object | LIFF app configurations |
| `config.liffId` | Yes | String | LIFF app ID. Obtained when adding the LIFF app to a channel. Retrievable via `liff.id` |
| `config.withLoginOnExternalBrowser` | No | Boolean | Whether to auto-run `liff.login()` when initializing in an external browser. Default `false` |
| `successCallback` | No | Function | Callback returning a data object on successful init |
| `errorCallback` | No | Function | Callback returning an error object on init failure |

`successCallback` runs at the same time the returned `Promise` resolves;
`errorCallback` runs at the same time the `Promise` rejects (no set order).

### Return value

A `Promise`. On rejection, a `LiffError` is passed.

```javascript
// Using a Promise object
liff
  .init({ liffId: "123456-abcedfg" })
  .then(() => { /* Start to use liff's api */ })
  .catch((err) => { console.log(err.code, err.message); });

// Using a callback
liff.init({ liffId: "123456-abcedfg" }, successCallback, errorCallback);
```

### Init rules (summary — full detail in `developing-liff-apps.md`)

1. Run `liff.init()` only at the endpoint URL or below it. v2.27.2+ warns in the
   console when this is violated.
2. Run `liff.init()` once for the primary redirect URL and once for the secondary.
3. Do URL changes only after the `Promise` resolves.
4. The primary redirect URL carries the access token — keep it out of analytics.

### Pre-init functions

Available **before** `liff.init()` resolves:
`liff.ready`, `liff.getOS()`, `liff.getAppLanguage()`, `liff.getLanguage()`
(deprecated), `liff.getVersion()`, `liff.getLineVersion()`, `liff.isInClient()`,
`liff.closeWindow()` (needs LIFF v2.4.0+), `liff.use()`, `liff.i18n.setLang()`.

---

# Getting environment

## liff.getOS()

Gets the environment the user runs the LIFF app in. **Pre-init.** No arguments.

Return value (string), based on the OS name in the user agent — independent of
browser type:

| Return value | Description |
|---|---|
| `ios` | iOS or iPadOS |
| `android` | Android |
| `web` | Other than the above |

## liff.getAppLanguage()

Gets the language setting of the LINE app running the LIFF app. **Pre-init.**
No arguments. Returns a string following RFC 5646.

**Conditions of use:** LIFF SDK v2.24.0 or later.
**Operating conditions:** runs in a LIFF browser AND LINE version 14.11.0 or
later. If unmet, behaves the same as `liff.getLanguage()`.

## liff.getLanguage()

**Deprecated** — use `liff.getAppLanguage()`. Gets the language setting of the
environment the LIFF app runs in. **Pre-init.** No arguments. Returns the string
in `navigator.language`.

## liff.getVersion()

Gets the LIFF SDK version. **Pre-init.** No arguments. Returns a string.

## liff.getLineVersion()

Gets the user's LINE version. **Pre-init.** No arguments. Returns a string in a
LIFF browser, or `null` in an external browser.

## liff.getContext()

Gets the screen type the LIFF app was launched from. No arguments. Returns a
data object.

> Company internal identifiers of chat rooms (one-on-one chat ID, group ID, room
> ID) are **no longer provided** to LIFF apps (since February 6, 2023). The
> `utouId` / `groupId` / `roomId` properties are discontinued.

```javascript
const context = liff.getContext();
console.log(context);
```

### Return value properties

| Property | Type | Description |
|---|---|---|
| `type` | String | Screen type: `utou` (1-on-1 chat), `group`, `room` (multi-person chat), `external` (external browser), `none` (e.g. Wallet tab) |
| `userId` | String | User ID. Included when `type` is `utou`, `room`, `group`, `none`, or `external` (may be `null` when `external`) |
| `liffId` | String | LIFF ID |
| `viewType` | String | LIFF app view size — `compact` / `tall` / `full`. Returned only if `type` isn't `external` |
| `endpointUrl` | String | Service endpoint URL |
| `accessTokenHash` | String | First half of the hashed SHA256 of the access token. Used to validate the access token |
| `availability` | Object | The `availability` object — feature availability in this environment |
| `scope` | Array of strings | Scopes the LIFF app has: `openid`, `email`, `profile`, `chat_message.write` |
| `menuColorSetting` | Object | LIFF browser header color setting |
| `miniAppId` | String | (Not always) String set by the LINE MINI App Custom Path feature |
| `miniDomainAllowed` | Boolean | Whether the LINE MINI App is available on the `miniapp.line.me` domain |
| `permanentLinkPattern` | String | How additional info in LIFF URLs is handled — `concat` |
| `utouId` / `groupId` / `roomId` | String | **Discontinued** |

`scope` (from `liff.getContext()`) lists the **LIFF app's** scopes;
`liff.permission.getGrantedAll()` lists scopes the **user has granted**.

### `availability` object

Each property holds an object describing whether a feature is available here.
Properties: `shareTargetPicker`, `multipleLiffTransition`, `subwindowOpen`,
`scanCode`, `scanCodeV2`, `getAdvertisingId`, `addToHomeScreen`,
`bluetoothLeFunction`, `skipChannelVerificationScreen`, `addToHomeV2`,
`addToHomeHideDomain`, `addToHomeLineScheme`.

To check feature availability, **prefer `liff.isApiAvailable()`** over reading
`availability` directly.

Common properties of each `availability` entry:

| Property | Type | Description |
|---|---|---|
| `permission` | Boolean | Whether the feature is available |
| `minVer` / `maxVer` | String | Min/max LINE version supporting the feature (not always) |
| `unsupportedFromVer` | String | LINE version where the feature is no longer supported (not always) |
| `minOsVer` / `maxOsVer` | String | Min/max OS version (not always) |
| `unsupportedFromOsVer` | String | OS version where the feature is no longer supported (not always) |

### `menuColorSetting` object

`adaptableColorSchemes` (array, always `light`), `lightModeColor` (object),
`darkModeColor` (object). Each color object: `iconColor`, `statusBarColor`
(always `white`), `titleTextColor`, `titleSubtextColor`, `titleButtonColor`,
`titleBackgroundColor`, `progressBarColor`, `progressBackgroundColor` —
hex `#RRGGBB`. (Changing the header color is not currently provided.)

### Example return value (LIFF browser)

```json
{
  "type": "utou",
  "utouId": "e2bff570-...",
  "userId": "U850014438e...",
  "liffId": "123456-abcedfg",
  "viewType": "full",
  "endpointUrl": "https://example.com/",
  "accessTokenHash": "EVWYWo1yYA...",
  "availability": {
    "shareTargetPicker": { "permission": true, "minVer": "10.3.0" },
    "multipleLiffTransition": { "permission": true, "minVer": "10.18.0" },
    "subwindowOpen": { "permission": true, "minVer": "11.7.0" },
    "scanCodeV2": { "permission": true, "minVer": "11.7.0", "minOsVer": "14.3.0" }
  },
  "scope": ["chat_message.write", "openid", "profile"],
  "miniDomainAllowed": false,
  "permanentLinkPattern": "concat"
}
```

## liff.isInClient()

Determines whether the LIFF app runs in a LIFF browser. **Pre-init.** No arguments.

- `true`: running in a LIFF browser.
- `false`: running in an external browser or LINE's in-app browser.

## liff.isLoggedIn()

Checks whether the user is logged in. No arguments. Returns `true` / `false`.

```javascript
if (liff.isLoggedIn()) {
  // can use APIs that require an access token, e.g. liff.getProfile()
}
```

## liff.isApiAvailable()

Checks whether the specified API/feature is available in the current environment
— verifies the LINE version supports it and the terms/conditions are accepted.

### Syntax

```javascript
liff.isApiAvailable(apiName);
```

### Arguments

`apiName` (String, required) — one of: `createShortcutOnHomeScreen`,
`scanCodeV2`, `scanCode`, `shareTargetPicker`, `iap` (LINE MINI App in-app
purchase), `multipleLiffTransition`, `skipChannelVerificationScreen`.

### Return value

`true` if available, else `false`. `false` is returned when, e.g.: the LINE
version doesn't support the API; the app launched in an external browser where
the API isn't available; required terms weren't accepted; the user isn't logged
in; or the access token is expired.

```javascript
if (liff.isApiAvailable('shareTargetPicker')) {
  liff.shareTargetPicker([{ type: "text", text: "Hello, World!" }])
    .then(() => console.log("ShareTargetPicker was launched"))
    .catch(() => console.log("Failed to launch ShareTargetPicker"));
}

if (liff.isApiAvailable('multipleLiffTransition')) {
  window.location.href = "https://line.me/{liffId}"; // URL for another LIFF app
}
```

---

# Authentication

## liff.login()

Performs the login process in **LINE's in-app browser or an external browser**.
You **can't** use `liff.login()` in a LIFF browser — it's run automatically by
`liff.init()` there. Authorization requests within the LIFF browser aren't
guaranteed; always use `liff.login()` (not raw LINE Login authorization
requests) when opening from an external / in-app browser.

### Syntax

```javascript
liff.login(loginConfig);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `loginConfig` | No | Object | Login configurations |
| `loginConfig.redirectUri` | No | String | URL to open after login. Default is the **Endpoint URL**. Must start with the Endpoint URL, or login fails with an error screen |

`redirectUri` must start with the Endpoint URL path. Query parameters and URL
fragments don't affect success. Example with Endpoint URL
`https://example.com/path1/path2?query1=value1`: `https://example.com/path1/path2`,
`.../path2/`, `.../path2/path3`, `.../path2?query2=value2` succeed;
`https://example.com/path1`, `https://example.com/`, `.../path2/path1` fail.

### Return value

None.

```javascript
if (!liff.isLoggedIn()) {
  liff.login({ redirectUri: "https://example.com/path" });
}
```

## liff.logout()

Logs out. No arguments. Returns nothing.

```javascript
if (liff.isLoggedIn()) {
  liff.logout();
}
```

## liff.getAccessToken()

Gets the current user's access token. No arguments. Returns the access token as
a string.

The access token is **valid for 12 hours**. It may be revoked when the LIFF app
closes, even if not expired.

- In a LIFF browser, the SDK gets the access token when `liff.init()` runs.
- In an external browser, the SDK gets it after `liff.login()` → user logs in →
  `liff.init()`.

```javascript
const accessToken = liff.getAccessToken();
if (accessToken) {
  fetch("https://api...", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
```

## liff.getIDToken()

Gets the current user's ID token — a JSON Web Token (JWT) containing user data.
No arguments. Returns the ID token.

Requires the `openid` scope to be selected and granted. Use the `email` scope to
include the email. The SDK gets the ID token at the same times as the access
token (see `liff.getAccessToken()`).

```javascript
liff
  .init({ liffId: "123456-abcedfg" })
  .then(() => {
    const idToken = liff.getIDToken();
    console.log(idToken);
  });
```

## liff.getDecodedIDToken()

Gets the decoded **payload** of the ID token — display name, profile image URL,
email, etc. No arguments. Returns the ID token payload.

Use this to display the user's name in the LIFF app. Only the **main** profile
is available (not the subprofile). **Don't send this data to your server** —
send the raw ID token from `liff.getIDToken()` instead. Requires the `openid`
scope.

```javascript
liff
  .init({ liffId: "123456-abcedfg" })
  .then(() => {
    const idToken = liff.getDecodedIDToken();
    console.log(idToken);
  });
```

```json
{
  "iss": "https://access.line.me",
  "sub": "U1234567890abcdef1234567890abcdef ",
  "aud": "1234567890",
  "exp": 1504169092,
  "iat": 1504263657,
  "amr": ["pwd"],
  "name": "Taro Line",
  "picture": "https://sample_line.me/aBcdefg123456"
}
```

## liff.permission.getGrantedAll()

Gets a list of scopes the user has agreed to grant. No arguments. On resolution,
an array of granted scopes is passed; on rejection, a `LiffError`.

Scopes obtainable: `profile`, `chat_message.write`, `openid`, `email`.

```javascript
liff.permission.getGrantedAll().then((scopes) => {
  // ["profile", "chat_message.write", "openid", "email"]
  console.log(scopes);
});
```

## liff.permission.query()

Verifies whether the user has granted a specified permission.

### Syntax

```javascript
liff.permission.query(permission);
```

### Arguments

`permission` (String, required) — one of `profile`, `chat_message.write`,
`openid`, `email`.

### Return value

A `Promise`. On resolution, an object `{ state }`:

| `state` value | Meaning |
|---|---|
| `granted` | User has consented to the authorization |
| `prompt` | User hasn't consented to authorization |
| `unavailable` | The channel doesn't have the specified scope |

```javascript
liff.permission.query("profile").then((permissionStatus) => {
  // permissionStatus = { state: 'granted' }
});
```

## liff.permission.requestAll()

Displays the "Verification screen" for permissions requested by **LINE MINI
Apps**. Only works on LINE MINI Apps; requires **Channel consent simplification**
turned on in the console. No arguments. Returns a `Promise`.

If the user has already consented to all permissions and you call this, the
`Promise` is rejected with a `LiffError` — first check with `liff.permission.query()`.

```javascript
liff.permission.query("profile").then((permissionStatus) => {
  if (permissionStatus.state === "prompt") {
    liff.permission.requestAll();
  }
});
```

---

# Profile

## liff.getProfile()

Gets the current user's profile information. No arguments. Returns a `Promise`.

Only the **main** profile is available (not the subprofile). **Don't send this
data to your server.** Requires the `profile` scope.

### Return value properties (on resolution)

| Property | Type | Description |
|---|---|---|
| `userId` | String | User ID |
| `displayName` | String | Display name |
| `pictureUrl` | String | Image URL. Not returned if the user hasn't set one |
| `statusMessage` | String | Status message. Not returned if the user hasn't set one |

```javascript
liff
  .getProfile()
  .then((profile) => {
    const name = profile.displayName;
  })
  .catch((err) => console.log("error", err));
```

```json
{
  "userId": "U4af4980629...",
  "displayName": "Brown",
  "pictureUrl": "https://profile.line-scdn.net/abcdefghijklmn",
  "statusMessage": "Hello, LINE!"
}
```

## liff.getFriendship()

Gets the friendship status between the user and a LINE Official Account. Only
works for a LINE Official Account linked to the **same LINE Login channel** the
LIFF app is added to. No arguments. Returns a `Promise`. Requires the `profile`
scope.

### Return value (on resolution)

| Property | Type | Description |
|---|---|---|
| `friendFlag` | Boolean | `true` if the user has added the LINE Official Account as a friend and hasn't blocked it; otherwise `false` |

```javascript
liff.getFriendship().then((data) => {
  if (data.friendFlag) { /* something you want to do */ }
});
```

```json
{ "friendFlag": true }
```

## liff.requestFriendship()

Displays a subwindow prompting the user to add the LINE Official Account as a
friend, or to unblock it. No arguments. Returns a `Promise`. (Added in LIFF
v2.28.0.)

- Not a friend → subwindow prompts to add as a friend.
- Blocked → subwindow prompts to unblock.
- Already a friend → subwindow shows then auto-closes.

The LINE Official Account is the one linked to your channel. Only available when
the LIFF browser screen size is `Full`.

**You can't tell from the return value** whether the user added/unblocked the
account — use `liff.getFriendship()` afterward. On rejection, a `LiffError` is
passed; if no **Linked LINE Official Account** is set, or the screen size isn't
`Full`, error code `FORBIDDEN` is returned.

```javascript
try {
  await liff.requestFriendship();
} catch (error) {
  console.log(error);
}
```

---

# Window

## liff.openWindow()

Opens the specified URL in LINE's in-app browser or an external browser. Use in
an external browser is not guaranteed.

### Syntax

```javascript
liff.openWindow(params);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `params` | Yes | Object | Parameter object |
| `params.url` | Yes | String | Full URL |
| `params.external` | No | Boolean | `true` = external browser, `false` = LINE's in-app browser. Default `false` |

### Behavioral differences by LINE version

For URLs supporting Universal Links / App Links:

| | `params.external = false` (default) | `params.external = true` |
|---|---|---|
| LINE earlier than 14.20.0 | iOS: opens in LINE's in-app browser; Android: transitions to the app | iOS: transitions to the app; Android: opens in the default browser |
| LINE 14.20.0+ or earlier than 15.20.0 | Transitions to the corresponding app | Transitions to the corresponding app |
| LINE 15.20.0+ | Opens the URL in LINE's in-app browser | Transitions to the corresponding app |

### Return value

None.

```javascript
liff.openWindow({
  url: "https://line.me",
  external: true,
});
```

## liff.closeWindow()

Closes the LIFF app. No arguments. Returns nothing. **Pre-init** (requires LIFF
SDK v2.4.0+ to call before init). Not guaranteed to work in an external browser.

Close behavior depends on the LINE version and the LIFF app settings (see
`developing-liff-apps.md` → "Behavior when closing the LIFF app").

```javascript
liff.closeWindow();
```

---

# Message

## liff.sendMessages()

Sends messages on behalf of the user to the chat room where the LIFF app is
opened.

**Conditions — all required:**
- Inside the **LIFF browser**, for a LIFF app launched from a one-on-one chat,
  group chat, or multi-person chat.
- The `chat_message.write` scope is enabled.
- The LIFF app hasn't been **reloaded** from the "recently used services" section.

If conditions aren't met, the method fails with `user doesn't grant required
permissions yet` and error code `403`. Failing cases include: accessing via the
Keep Memo feature; opening via a URL scheme through a website redirect; the
`chat_message.write` scope disabled after a LIFF-to-LIFF transition; the user
not granting `chat_message.write`. Use `liff.getContext()` to get the screen type.

### Syntax

```javascript
liff.sendMessages(messages);
```

### Arguments

`messages` (Array of objects, required) — Messaging API [message objects](https://developers.line.biz/en/reference/messaging-api/#message-objects),
**max 5**. Supported types:

- Text message (no `emojis` / `quoteToken`).
- Sticker message (no `quoteToken`).
- Image message.
- Video message (no `trackingId`).
- Audio message.
- Location message.
- Template message (only a URI action).
- Flex Message (only a URI action).

A template message or Flex Message sent via `liff.sendMessages()` does **not**
trigger a webhook; all other types do. Image/video/audio messages sent this way
yield webhook events with `contentProvider.type` of `external`.

### Return value

A `Promise`. Resolves (no value) on success; rejects with a `LiffError` on failure.

```javascript
liff
  .sendMessages([
    { type: "text", text: "Hello, World!" },
  ])
  .then(() => console.log("message sent"))
  .catch((err) => console.log("error", err));
```

## liff.shareTargetPicker()

Displays the target picker (a screen for selecting a group or friend) and sends
a developer-created message to the selected target. The message appears as if
sent by the user. Only friends (including LINE Official Accounts) and groups the
user is in are selectable — **OpenChats are not included**.

**Conditions — all required:** the user is logged in; the share target picker
is enabled in the LINE Developers Console (see `developing-liff-apps.md` →
"Enabling the share target picker").

### Syntax

```javascript
liff.shareTargetPicker(messages, options);
```

### Arguments

`messages` (Array of objects, required) — message objects, **max 5**. Supported:
Text (no `emojis`/`quoteToken`), Image, Video (no `trackingId`), Audio, Location,
Template (URI action only), Flex Message (URI action only).

| `options` property | Type | Description |
|---|---|---|
| `options` | Object | Share target picker options (optional) |
| `options.isMultiple` | Boolean | `true` = users can select multiple recipients; `false` = only one friend. Default `true` |

`isMultiple: false` doesn't guarantee a single recipient — a user can re-share or
call the picker repeatedly. To strictly enforce one send, add a restriction in
the LIFF app (e.g. a unique token on the URL, verified server-side).

### Return value

A `Promise`:

- Sent successfully → resolves with `{ status: "success" }`.
- User cancels/closes the picker before sending → resolves, **no object passed**.
- Problem before the picker is displayed → rejects with a `LiffError`.

> Don't use `alert()` in the resolve/reject callback — on some devices it breaks
> the LIFF app. To display the picker in an external browser, an SSO login
> session is required; with auto login no SSO session is issued, so the email
> login screen may appear instead.

```javascript
liff
  .shareTargetPicker(
    [{ type: "text", text: "Hello, World!" }],
    { isMultiple: true },
  )
  .then(function (res) {
    if (res) {
      console.log(`[${res.status}] Message sent!`);
    } else {
      console.log("TargetPicker was closed!");
    }
  })
  .catch(function (error) {
    console.log("something wrong happen");
  });
```

---

# Camera

## liff.scanCodeV2()

Launches the 2D code reader and gets a string. Turn on **Scan QR** in the LINE
Developers Console to enable it. No arguments. Returns a `Promise`.

### Operating environments

| OS | Version | LIFF browser | External browser |
|---|---|---|---|
| iOS | 11–14.2 | ❌ | ✅ *1 |
| iOS | 14.3 or later | ✅ *2 | ✅ *1 |
| Android | All versions | ✅ *2 | ✅ *1 |
| PC | All versions | ❌ | ✅ *1 |

*1 Only web browsers supporting the WebRTC API. *2 Only when the LIFF browser
screen size is `Full`.

`liff.scanCodeV2()` internally uses the external library `jsQR` — behavior follows
jsQR; libraries may change without notice.

### Return value

A `Promise`. On resolution, `{ value }` where `value` is the scanned string;
on rejection, a `LiffError`.

```javascript
liff
  .scanCodeV2()
  .then((result) => {
    // result = { value: "" }
  })
  .catch((error) => console.log("error", error));
```

## liff.scanCode()

**Deprecated** — use `liff.scanCodeV2()`. Starts a 2D code reader and gets the
string the user reads. Turn on **Scan QR** in the console. No arguments. Returns
a `Promise`.

### Operating environments

| OS | Version | LIFF browser | External browser |
|---|---|---|---|
| iOS | All versions | ❌ | ❌ |
| Android | All versions | ✅ | ❌ |
| PC | All versions | ❌ | ❌ |

`liff.scanCode` is `undefined` on LINE for iOS — check it exists before calling.
Can't be used in an external browser.

### Return value

A `Promise` resolving to `{ value }` where `value` is the scanned string.

```javascript
if (liff.scanCode) {
  liff.scanCode().then((result) => {
    // result = { value: "" }
  });
}
```

---

# Permanent link

A **permanent link** has the format
`https://liff.line.me/{liffId}/{path}?{query}#{URL fragment}`.

## liff.permanentLink.createUrlBy()

Gets the permanent link of **any page** in the LIFF app.

### Syntax

```javascript
liff.permanentLink.createUrlBy(url);
```

### Arguments

`url` (String, required) — URL to get the permanent link for; any query
parameter or URL fragment may be added.

### Return value

A `Promise` resolving to the permanent link string. If the URL doesn't begin
with the **Endpoint URL**, the `Promise` rejects with a `LiffError`.

```javascript
// endpoint URL https://example.com/path1?q1=v1, LIFF ID 1234567890-AbcdEfgh
liff.permanentLink
  .createUrlBy("https://example.com/path1?q1=v1")
  .then((permanentLink) => {
    // https://liff.line.me/1234567890-AbcdEfgh
    console.log(permanentLink);
  });

liff.permanentLink
  .createUrlBy("https://example.com/path1/path2?q1=v1&q2=v2")
  .then((permanentLink) => {
    // https://liff.line.me/1234567890-AbcdEfgh/path2?q=2=v2
    console.log(permanentLink);
  });

liff.permanentLink
  .createUrlBy("https://example.com/")
  .catch((error) => {
    // Error: currentPageUrl must start with endpoint URL of LIFF App.
    console.log(error);
  });
```

## liff.permanentLink.createUrl()

**May be deprecated in the next major version** — prefer
`liff.permanentLink.createUrlBy()`. Gets the permanent link for the **current
page**. No arguments. Returns the current page's permanent link as a string.
Throws a `LiffError` exception if the current page URL doesn't start with the
Endpoint URL.

```javascript
// current location /shopping?item_id=99#details, LIFF ID 1234567890-AbcdEfgh
const myLink = liff.permanentLink.createUrl();
// "https://liff.line.me/1234567890-AbcdEfgh/shopping?item_id=99#details"
```

## liff.permanentLink.setExtraQueryParam()

**May be deprecated in the next major version** — prefer
`liff.permanentLink.createUrlBy()`. Adds query parameters to the current page's
permanent link. Each call overwrites the previously added params.

### Syntax

```javascript
liff.permanentLink.setExtraQueryParam(extraString);
```

`extraString` (String, required) — query parameters to add. Returns nothing.
Call `setExtraQueryParam("")` to delete added params; added params are discarded
on navigation.

```javascript
// current location /food?menu=pizza, LIFF ID 1234567890-AbcdEfgh
liff.permanentLink.setExtraQueryParam("user_tracking_id=8888");
const myLink = liff.permanentLink.createUrl();
// "https://liff.line.me/1234567890-AbcdEfgh/food?menu=pizza&user_tracking_id=8888"
```

---

# LIFF plugin

## liff.use()

Activates and initializes a LIFF API in the **pluggable SDK** or a **LIFF
plugin**. **Pre-init** — and the pluggable SDK requires `liff.use()` to run
before `liff.init()`.

### Syntax

```javascript
liff.use(module, option);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `module` | Yes | Object | A pluggable-SDK LIFF API module, or a LIFF plugin. Instantiate class-based modules/plugins before passing |
| `option` | No | Any value | Value passed as the 2nd argument of the LIFF plugin's `install()` method. `undefined` if omitted |

### Return value

Returns the `liff` object.

```javascript
// Pluggable SDK
import liff from "@line/liff/core";
import GetOS from "@line/liff/get-os";

liff.use(new GetOS());
liff.init({ liffId: "123456-abcedfg" });
```

```javascript
// LIFF plugin
class greetPlugin {
  constructor() { this.name = "greet"; }
  install() { return { hello: this.hello }; }
  hello() { console.log("Hello, World!"); }
}
liff.use(new greetPlugin());
```

See `tooling-and-plugins.md` for the pluggable SDK and LIFF plugin authoring.

---

# Internationalization

## liff.i18n.setLang()

Specifies the language of the text displayed by the LIFF SDK. **Pre-init.**

### Syntax

```javascript
liff.i18n.setLang(language);
```

`language` (String, required) — a language tag per RFC 5646 (BCP 47). If there
is no translation for the tag, `en` is used as a fallback. Returns a `Promise`;
on rejection a `LiffError` is passed.

```javascript
liff.i18n.setLang("en");
```

---

# Others

## liff.createShortcutOnHomeScreen()

Displays a screen for adding a shortcut to your **LINE MINI App** to the home
screen of the user's device. (Added in LIFF v2.23.0.)

**This feature is only for verified MINI Apps.** Unverified MINI Apps can test
it on the internal channel for Developing, but not on the channel for Published.
Execute it in response to a user action (e.g. tap).

### Conditions of use — all required

- It's a LINE MINI App.
- LIFF SDK v2.23.0 or later.
- LINE app version 13.20.0 or later on the user's device.

### Operating conditions (iOS)

| Default browser | iOS version | Works |
|---|---|---|
| Safari | All versions | Yes |
| Chrome | 16.4 or later | Yes |
| Browsers other than Safari & Chrome | 16.4 or later | Not guaranteed |
| Browsers other than Safari | Earlier than 16.4 | No (error page) |

### Syntax

```javascript
liff.createShortcutOnHomeScreen(params);
```

### Arguments

| Argument | Required | Type | Description |
|---|---|---|---|
| `params` | Yes | Object | Parameter object |
| `params.url` | Yes | String | A LIFF URL, a permanent link, the LINE MINI App endpoint URL, or a URL beginning with the endpoint URL |

### Return value

A `Promise`. Resolves (no value) when the Add Shortcut screen is displayed; you
can't confirm whether the user actually added the shortcut. On rejection, a
`LiffError` is passed.

```javascript
// endpoint URL https://example.com/path1/path2, LIFF ID 1234567890-AbcdEfgh
liff
  .createShortcutOnHomeScreen({ url: "https://miniapp.line.me/1234567890-AbcdEfgh" })
  .then(() => { /* ... */ });

liff
  .createShortcutOnHomeScreen({ url: "https://liff.line.me/1234567890-AbcdEfgh/path3" })
  .then(() => { /* ... */ });

liff
  .createShortcutOnHomeScreen({ url: "https://example.com/path1/path2/path3" })
  .then(() => { /* ... */ });

liff
  .createShortcutOnHomeScreen({ url: "https://example.com/invalid-path" })
  .then(() => { /* ... */ })
  .catch((error) => {
    // invalid URL.
    console.log(error.message);
  });
```
