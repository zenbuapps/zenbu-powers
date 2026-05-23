# LINE SDK for Unity & Flutter — API Reference

Source:
- Unity: `https://developers.line.biz/en/reference/unity-sdk/` (Doxygen — LINE
  SDK for Unity 1.5.0, namespace `Line.LineSDK`).
- Flutter: `https://pub.dev/documentation/flutter_line_sdk/latest/flutter_line_sdk/`
  (dartdoc — `flutter_line_sdk` library).

This is the class/method reference. For task-oriented integration steps see
`unity-sdk.md` and `flutter-and-resources.md`. Both SDKs are wrappers over the
native iOS/Android SDKs.

## Table of contents

- Unity: LineSDK, LineAPI, LoginResult, UserProfile, AccessToken, StoredAccessToken, AccessTokenVerifyResult, BotFriendshipStatus, LoginOption, Error, Unit
- Flutter: LineSDK, LoginResult, UserProfile, AccessToken, StoredAccessToken, AccessTokenVerifyResult, BotFriendshipStatus, LoginOption

---

# LINE SDK for Unity — `Line.LineSDK` namespace

11 classes. All callback-based APIs deliver a `Result<T>` — handle it with
`result.Match(valueFn, errorFn)`.

## `LineSDK` (class)

`Line.LineSDK.LineSDK` — a login and token-related manager for LINE SDK Login
features. Don't create or attach this script to your own GameObject; instead
drag a `LineSDK` prefab into your scene and set up your channel ID there, then
use `LineSDK.Instance`.

| Member | Signature | Notes |
|---|---|---|
| `Instance` | `static LineSDK LineSDK.Instance { get }` | The shared instance. Always use this to interact with the login process. |
| `channelID` | `string LineSDK.channelID` | The channel ID for your app. |
| `CurrentAccessToken` | `StoredAccessToken LineSDK.CurrentAccessToken { get }` | The current access token in use (a `StoredAccessToken`). |

**`Login` (two overloads)**

```csharp
void Login(string[] scopes, Action<Result<LoginResult>> action)
```

Logs in to the LINE Platform with the specified scopes. If `scopes` is null or
empty, the `"profile"` scope is used. `action` is invoked when login finishes.

```csharp
void Login(string[] scopes, LoginOption option, Action<Result<LoginResult>> action)
```

Same, with a `LoginOption`.

**`Logout`**

```csharp
void Logout(Action<Result<Unit>> action)
```

Logs out the current user by revoking the access token.

**`SetupSDK`**

```csharp
void SetupSDK()
```

Initializes the native side of the SDK with the `channelID` from the prefab.
Only necessary when you cannot set `channelID` in the Unity Editor at compile
time. Invoke only once per app session. If `channelID` is already in the prefab,
`SetupSDK` is triggered automatically during `Awake`. To assign different
channel IDs programmatically, leave the prefab field empty, assign it in code,
then call this method. Throws an exception if `channelID` is null or empty when
called.

## `LineAPI` (class)

`Line.LineSDK.LineAPI` — a utility class for calling the LINE Platform APIs. All
methods are `static`.

| Method | Signature | Notes |
|---|---|---|
| `GetProfile` | `static void GetProfile(Action<Result<UserProfile>> action)` | Gets the user's profile. Requires the `"profile"` scope. |
| `GetBotFriendshipStatus` | `static void GetBotFriendshipStatus(Action<Result<BotFriendshipStatus>> action)` | Gets the friendship status of the user and the LINE Official Account linked to your channel. Requires the `"profile"` scope. |
| `VerifyAccessToken` | `static void VerifyAccessToken(Action<Result<AccessTokenVerifyResult>> action)` | Verifies the current access token. |
| `RefreshAccessToken` | `static void RefreshAccessToken(Action<Result<AccessToken>> action)` | Refreshes the current access token. |
| `RevokeAccessToken` | `static void RevokeAccessToken(Action<Result<Unit>> action)` | Revokes the current access token. After revocation the user must authorize your app again. |

## `LoginResult` (class)

`Line.LineSDK.LoginResult` — a result of a successful login. All members are
`get`-only properties.

| Property | Type | Notes |
|---|---|---|
| `AccessToken` | `AccessToken` | The access token obtained by login. |
| `Scopes` | `string[]` | The scopes bound to the `AccessToken` by authorization. |
| `UserProfile` | `UserProfile` | Present only when the `"profile"` scope is in the request. |
| `IsFriendshipStatusChanged` | `bool` | Whether friendship with the LINE Official Account changed during login. Non-`nil` only if `BotPrompt` was specified in the login option. |
| `IdTokenNonce` | `string` | Nonce value when requesting an ID token. Use it to verify the ID token against the LINE server. `nil` without `.openID`. |

## `UserProfile` (class)

`Line.LineSDK.UserProfile` — a user profile. All `get`-only.

| Property | Type | Notes |
|---|---|---|
| `UserId` | `string` | The user ID of the current authorized user. |
| `DisplayName` | `string` | The display name. |
| `PictureUrl` | `string` | Profile image URL. Empty/null if not set. |
| `PictureUrlLarge` | `string` | Large profile image URL. Empty/null if not set. |
| `PictureUrlSmall` | `string` | Small profile image URL. Empty/null if not set. |
| `StatusMessage` | `string` | Status message. Empty/null if not set. |

## `AccessToken` (class)

`Line.LineSDK.AccessToken` — an access token used to access the LINE Platform.
A valid access token is issued after the user grants permissions; it is bound to
scopes and expires after a period. By default the SDK stores tokens securely on
the device. Don't create one yourself — get the stored token (with fewer
properties) via `LineSDK.Instance.CurrentAccessToken`. All `get`-only.

| Property | Type | Notes |
|---|---|---|
| `Value` | `string` | The access token value. |
| `ExpiresIn` | `long` | Seconds until the access token expires. |
| `TokenType` | `string` | Authorization type in a request header. Fixed to `"Bearer"`. |
| `RefreshToken` | `string` | The refresh token bound to the access token. |
| `Scope` | `string` | Permissions granted by the user. |
| `IdTokenRaw` | `string` | Raw string of the ID token. Present only if obtained with `"openID"`. |

## `StoredAccessToken` (class)

`Line.LineSDK.StoredAccessToken` — the access token stored on the device. All
`get`-only.

| Property | Type | Notes |
|---|---|---|
| `Value` | `string` | The access token value. |
| `ExpiresIn` | `long` | Token expiration time in seconds at creation. Never updated — call `LineAPI.VerifyAccessToken` for the up-to-date value. |

## `AccessTokenVerifyResult` (class)

`Line.LineSDK.AccessTokenVerifyResult` — a response to the token verification
API. All `get`-only.

| Property | Type | Notes |
|---|---|---|
| `ChannelId` | `string` | The channel ID bound to the access token. |
| `ExpiresIn` | `long` | Seconds until the access token expires. |
| `Scope` | `string` | The access token's scope. |

## `BotFriendshipStatus` (class)

`Line.LineSDK.BotFriendshipStatus` — a response to a friendship-status request.

- `IsFriend` → `bool` (get) — `true` if the LINE Official Account is a friend of
  the user and not blocked; `false` if not a friend or blocked.

## `LoginOption` (class)

`Line.LineSDK.LoginOption` — options for logging in to the LINE Platform. All
`get/set` properties.

| Property | Type | Notes |
|---|---|---|
| `BotPrompt` | `string` | Strategy for the "add the LINE Official Account as friend" option. `"normal"`: include an option on the consent screen. `"aggressive"`: open a new screen after the user agrees to the permissions. |
| `IDTokenNonce` | `string` | Nonce for ID token verification (with `.openID`, to prevent replay attacks). If unset, the SDK generates a random value. The SDK always verifies the nonce locally. |
| `OnlyWebLogin` | `bool` | `true` to use the web authentication flow instead of LINE app-to-app. |

## `Error` (class)

`Line.LineSDK.Error` — an error that happens in the LINE SDK. All `get`-only.

- `Code` → `int` — error code showing the error type. **Differs per operating
  system** — see the iOS Swift `LineSDKError` and Android `LineApiResponseCode`
  references.
- `Message` → `string` — human-readable error description.

## `Unit` (class)

`Line.LineSDK.Unit` — an empty result value (a success signal without data).

- `Value` → `static Unit` (`= new Unit()`) — the only empty value of `Unit`.

---

# LINE SDK for Flutter — `flutter_line_sdk` library

8 classes (Dart). All async APIs return a `Future`.

## `LineSDK` (class)

`LineSDK` — a general manager class for LINE SDK login features. Don't create
your own instance; call `LineSDK.instance` to get a shared singleton.

| Member | Signature | Notes |
|---|---|---|
| `instance` | `static LineSDK instance` (`final`) | The shared singleton. |
| `channel` | `static const MethodChannel channel` | The method channel connected to the native side of the LINE SDK. |
| `currentAccessToken` | `Future<StoredAccessToken?> currentAccessToken` (no setter) | Gets the current access token in use. |

**Methods:**

```dart
Future<void> setup(String channelId, {String? universalLink})
```

Sets up the SDK with a `channelId` and optional `universalLink`.

```dart
Future<LoginResult> login({List<String> scopes = const ['profile'], LoginOption? option})
```

Logs the user into LINE with the specified `scopes` and `option`, by opening the
LINE client for an existing logged-in user, or a web view if the LINE client
isn't installed.

```dart
Future<void> logout()
```

Logs out the current user by revoking the related tokens.

```dart
Future<UserProfile> getProfile()
```

Gets the user's profile.

```dart
Future<BotFriendshipStatus> getBotFriendshipStatus()
```

Gets the friendship status between the user and the official account linked to
your LINE Login channel.

```dart
Future<AccessToken> refreshToken()
```

Refreshes the access token.

```dart
Future<AccessTokenVerifyResult> verifyAccessToken()
```

Checks whether the stored access token is valid against the LINE authentication
server.

## `LoginResult` (class)

`LoginResult` — the result of a successful login, containing basic user
information and an access token. Properties (no setter):

| Property | Type | Notes |
|---|---|---|
| `accessToken` | `AccessToken` | The `AccessToken` obtained during login. |
| `userProfile` | `UserProfile?` | The `UserProfile` obtained during login. |
| `scopes` | `List<String>` | The granted scopes. |
| `idTokenNonce` | `String?` | Nonce value when requesting an ID token. Use it to verify the ID token against the LINE server. `null` if `openid` is not requested. |
| `isFriendshipStatusChanged` | `bool?` | Whether friendship with the LINE Official Account changed during login. |
| `data` | `Map<String, dynamic>` | Raw data of the response as a `Map`. |

## `UserProfile` (class)

`UserProfile` — the user profile used in LineSDK. Properties (no setter):

| Property | Type | Notes |
|---|---|---|
| `userId` | `String` | The user ID of the current authorized user. |
| `displayName` | `String` | The display name. |
| `pictureUrl` | `String?` | Profile image URL. |
| `pictureUrlLarge` | `String?` | Large profile image URL. |
| `pictureUrlSmall` | `String?` | Small profile image URL. |
| `statusMessage` | `String?` | The status message. |
| `data` | `Map<String, dynamic>` | Raw data of the response as a `Map`. |

## `AccessToken` (class)

`AccessToken` — an access token used to access the LINE Platform. A valid token
is issued after the user grants permissions; it is bound to scopes and expires
after a period. By default the SDK stores tokens securely on the device. Don't
create one yourself — get the stored token via `LineSDK.currentAccessToken`.
Properties (no setter):

| Property | Type | Notes |
|---|---|---|
| `value` | `String` | The value of the access token. |
| `expiresIn` | `num` | Seconds until the token expires, counting from server issue. |
| `tokenType` | `String` | Authorization type in a request header. Fixed to `Bearer`. |
| `scopes` | `List<String>` | The valid scopes bound to this access token. |
| `idTokenRaw` | `String?` | Raw string of the ID token (Base64-URL-encoded JWT). Use the `idToken` getter to read field values. |
| `idToken` | `Map<String, dynamic>?` | `Map` representation of the received ID token (converts `idTokenRaw` if present). |
| `email` | `String?` | The user's email. Exists only when `idToken` is valid and the user set and agreed to share it. Requires both `openid` and `email` scopes. |
| `data` | `Map<String, dynamic>` | Raw data of the response as a `Map`. |

## `StoredAccessToken` (class)

`StoredAccessToken` — the access token stored on the user's device. Properties
(no setter):

| Property | Type | Notes |
|---|---|---|
| `value` | `String` | The access token, as a string. |
| `expiresIn` | `num` | Token expiration time in seconds at creation time. |
| `data` | `Map<String, dynamic>` | Raw data. |

## `AccessTokenVerifyResult` (class)

`AccessTokenVerifyResult` — response to `LineSDK.verifyAccessToken`. Properties
(no setter):

| Property | Type | Notes |
|---|---|---|
| `channelId` | `String` | The channel ID bound to the access token. |
| `expiresIn` | `num` | Seconds until the token expires, counting from when the server received the request. |
| `scopes` | `List<String>` | The valid scopes bound to this access token. |
| `data` | `Map<String, dynamic>` | Raw data of the response as a `Map`. |

## `BotFriendshipStatus` (class)

`BotFriendshipStatus` — response to `LineSDK.getBotFriendshipStatus`. Properties
(no setter):

- `isFriend` → `bool` — indicates the friendship status.
- `data` → `Map<String, dynamic>` — raw data of the response as a `Map`.

## `LoginOption` (class)

`LoginOption` — options related to the LINE login process.

**Constructor:**

```dart
LoginOption(bool onlyWebLogin, String botPrompt, {int requestCode = DEFAULT_ACTIVITY_RESULT_REQUEST_CODE})
```

**Properties (getter/setter pairs):**

| Property | Type | Notes |
|---|---|---|
| `onlyWebLogin` | `bool` | Enable to use the web authentication flow instead of LINE app-to-app. |
| `botPrompt` | `String` | Strategy for the "add the LINE Official Account as friend" option on the consent screen. |
| `idTokenNonce` | `String?` | Nonce for ID token verification (with `.openID`, to prevent replay attacks). If unset, the SDK generates a random value; the SDK always verifies the nonce locally. |
| `requestCode` | `int` | Request code that the LINE login activity (Android) will be called with. |

**Constant:** `DEFAULT_ACTIVITY_RESULT_REQUEST_CODE` → `const int` — default
request code that the LINE login activity (Android) will be called with.
