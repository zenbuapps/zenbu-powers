---
name: line-login-sdks
description: >-
  LINE Login SDKs official reference at API-reference depth. Covers the native
  mobile/game SDKs that integrate LINE Login (LINE's OAuth 2.0 / OpenID Connect
  social login) into apps: the LINE SDK v5 for iOS Swift, the LINE SDK v5 for
  Android, the LINE SDK for Unity, and the LINE SDK for Flutter plugin. Use this
  skill whenever the task touches client-side LINE Login on a native app:
  installing the SDK (CocoaPods `LineSDKSwift`, Carthage, Maven Central
  `com.linecorp.linesdk:linesdk`, Unity `.unitypackage`, pub.dev
  `flutter_line_sdk`), configuring channel ID / bundle ID / package name / URL
  schemes, calling LINE Login, getting an access token / ID token, getting the
  user profile, logging users out, refreshing or verifying access tokens,
  enabling the add friend option (bot prompt) and checking friendship status,
  handling SDK errors, using universal links on iOS, or using the SDK from
  Objective-C. Also includes the full per-platform SDK class/method API
  reference — every class, interface, enum, property, method signature, and
  parameter for the iOS Swift, Android, Unity, and Flutter SDKs. Trigger on
  mentions of: LINE Login SDK, LINE SDK for iOS / Swift, LINE SDK for Android,
  LINE SDK for Unity, LINE SDK for Flutter, `LoginManager`,
  `LoginManager.shared`, `LoginManager.Parameters`, `LoginButton`,
  `LoginButtonDelegate`, `LoginProcess`, `LoginResult`, `LoginManagerOptions`,
  `LoginPermission`, `LineSDKError`, `AccessTokenStore`, `AccessToken`,
  `AccessTokenVerifyResult`, `API.getProfile`, `API.getBotFriendshipStatus`,
  `API.Auth`, `UserProfile`, `JWT`, `LineLoginApi`, `LineApiClient`,
  `LineApiClientBuilder`, `LineApiResponse`, `LineApiResponseCode`,
  `LineApiError`, `LineLoginResult`, `LineCredential`, `LineProfile`,
  `LineIdToken`, `LineAccessToken`, `LineFriendshipStatus`, `Scope`,
  `LoginDelegate`, `LoginListener`, `LineAuthenticationParams`,
  `LineAuthenticationParams.Builder`, `BotPrompt`, `getLoginIntent`,
  `getLoginResultFromIntent`, `onActivityResult`, `LineSDK.Instance`, `LineAPI`,
  `StoredAccessToken`, `BotFriendshipStatus`, `LoginOption`, `flutter_line_sdk`,
  `LineSDK.login`, `LineSDK.instance`, `line3rdp.` URL scheme, `lineauth2`, bot
  prompt, `botPromptStyle`, friendship status, `friendshipStatusChanged`,
  `IDTokenNonce`, app-to-app login, `line-sdk-ios-swift`, `line-sdk-android`,
  `line-sdk-unity`. Note: this skill covers the client/native SDK side; the
  server-side LINE Login v2.1 web API (token exchange endpoints, ID token
  verification endpoint) is a separate reference.
---

# LINE Login SDKs Reference

API-reference-level coverage of the **native LINE Login SDKs**, extracted from
the official docs section at `https://developers.line.biz/en/docs/line-login-sdks/`.

These SDKs wrap LINE Login (LINE's OAuth 2.0 + OpenID Connect implementation)
for native iOS, Android, Unity, and Flutter apps. They handle the app-to-app /
browser login flow, store the access token, and expose typed APIs for profile
and token management. **Read the reference file that matches the target
platform — do not guess class names, method signatures, or scope strings; they
differ per platform.**

## When this skill applies

Any client-side work that integrates LINE Login into a native app via an
official SDK: installation, channel linking, performing login, reading the
login result, getting the access token / ID token / user profile, logging out,
refreshing/verifying tokens, the add friend option, error handling, iOS
universal links, or Objective-C interop.

This skill is the **client side**. The server side — exchanging codes for
tokens, the `/oauth2/v2.1/*` endpoints, the ID token verification endpoint —
belongs to the separate LINE Login v2.1 web API reference. The SDKs deliberately
push token verification and user-data retrieval to your server (see the
"user impersonation" warnings); the SDK hands you an access token / raw ID
token string to send to your backend.

## Four SDKs — pick the right one

| SDK | Latest major | Language | Min OS / runtime | Package |
|---|---|---|---|---|
| LINE SDK for iOS Swift | v5 | Swift (Objective-C via wrapper) | iOS 13.0+, Xcode 14.1+ | CocoaPods `LineSDKSwift ~> 5.0`, Carthage `line/line-sdk-ios-swift` |
| LINE SDK for Android | v5 | Java / Kotlin | `minSdkVersion` 24 (Android 7.0)+ | Maven Central `com.linecorp.linesdk:linesdk` |
| LINE SDK for Unity | v1 | C# | Unity 2020.3.15+; wraps iOS/Android SDKs | GitHub `.unitypackage` |
| LINE SDK for Flutter | — | Dart | wraps iOS/Android SDKs | pub.dev `flutter_line_sdk` |

Unity and Flutter are **wrappers** over the iOS Swift and Android SDKs — they
run only on iOS/Android devices, never in Unity Editor play mode or a desktop
Flutter target. All four require a LINE Login channel created in the
[LINE Developers Console](https://developers.line.biz/console/).

## Reference file map

The skill has two layers: **guide files** (task-oriented integration steps,
crawled from the docs section) and **API-reference files** (the complete
class/method reference, crawled from each SDK's generated API docs). For "how do
I do X" read the guide file; for an exact signature / property / enum case read
the API-reference file.

| File | Contents |
|---|---|
| `references/ios-sdk-swift.md` | **Guide** — LINE SDK v5 for iOS Swift: overview, starter app, installation (CocoaPods/Carthage), channel linking, `Info.plist` config, universal links, `LoginManager.setup`/`login`, `LoginButton`, handling the login result, add friend option, managing users (profile, ID token, logout), managing access tokens, error handling, Objective-C interop, v4→v5 migration |
| `references/android-sdk.md` | **Guide** — LINE SDK v5 for Android: overview, sample app, installation (Maven Central / Gradle), manifest config, channel linking & package signatures, built-in & custom `LoginButton`, `LineLoginApi.getLoginIntent`, `onActivityResult` handling, `LineApiClient` interface, add friend option, managing users, managing access tokens, error handling (response codes) |
| `references/unity-sdk.md` | **Guide** — LINE SDK for Unity: overview, project setup, importing the `.unitypackage`, LineSDK prefab & channel ID, player settings, `LineSDK.Instance.Login`, result handling with `Result.Match`, `LineAPI` (profile, logout, token get/verify/refresh) |
| `references/flutter-and-resources.md` | **Guide** — LINE SDK for Flutter plugin overview + repos, and release-notes history for the iOS / Android / Unity SDKs |
| `references/api-reference-ios.md` | **API reference** — every `LineSDK` (iOS Swift) symbol: `LoginManager` (+ `Parameters`, `BotPrompt`, `WebPageLanguage`), `LoginButton` (+ `ButtonSize`), `LoginButtonDelegate`, `LoginProcess`, `AccessTokenStore`, `API` (+ `API.Auth`), structs (`LoginResult`, `UserProfile`, `AccessToken`, `AccessTokenVerifyResult`, `LoginPermission`, `JWT`/`JWT.Payload`, `GetBotFriendshipStatusRequest`, …), `LineSDKError` + all 4 reason enums with error codes, the utility enums, and `Notification.Name` |
| `references/api-reference-android.md` | **API reference** — all 22 Android classes/interfaces/enums across `com.linecorp.linesdk{,.api,.auth,.widget}`: `LineLoginApi`, `LineLoginResult`, `LineAuthenticationParams` (+ `Builder`, `BotPrompt`, `WebAuthenticationMethod`), `LineApiClient`, `LineApiClientBuilder`, `LoginButton`, `LineProfile`, `LineCredential`, `LineAccessToken`, `LineIdToken`, `LineFriendshipStatus`, `LineApiResponse`, `LineApiResponseCode`, `LineApiError` (+ `ErrorCode`), `Scope`, `LoginDelegate` (+ `Factory`), `LoginListener` |
| `references/api-reference-unity-flutter.md` | **API reference** — Unity `Line.LineSDK` (11 classes: `LineSDK`, `LineAPI`, `LoginResult`, `UserProfile`, `AccessToken`, `StoredAccessToken`, `AccessTokenVerifyResult`, `BotFriendshipStatus`, `LoginOption`, `Error`, `Unit`) and the Flutter `flutter_line_sdk` library (8 classes: `LineSDK`, `LoginResult`, `UserProfile`, `AccessToken`, `StoredAccessToken`, `AccessTokenVerifyResult`, `BotFriendshipStatus`, `LoginOption`) with every property and method |

## Quick SDK index

The core flow is identical across SDKs: configure channel ID → trigger login
with a set of scopes → receive a result that carries an access token (and a
profile / ID token if those scopes were granted). Token verification and
user-data trust must happen on your server, not from the client.

The lists below are an index of the key types — for full signatures, every
property, every enum case, and parameter tables, open the matching
`api-reference-*.md` file.

### Scopes (login permissions)

| Purpose | iOS Swift | Android | Unity / Flutter (string) |
|---|---|---|---|
| Basic profile | `.profile` | `Scope.PROFILE` | `"profile"` |
| OpenID Connect (ID token) | `.openID` | `Scope.OPENID_CONNECT` | `"openid"` |
| Email (needs console approval) | `.email` | `Scope.OC_EMAIL` | `"email"` |

### iOS SDK for Swift — key types

```
LoginManager.shared.setup(channelID:universalLinkURL:)   Configure SDK (call first, in didFinishLaunching)
LoginManager.shared.application(_:open:)                  Forward the login callback URL (AppDelegate/SceneDelegate)
LoginManager.shared.login(permissions:in:parameters:completion:)   Start login → Result<LoginResult, LineSDKError>
LoginManager.shared.logout(completion:)                   Invalidate the access token
LoginManager.shared.isAuthorized                          Current login state
LoginManager.Parameters                                   .botPromptStyle (.normal/.aggressive), .IDTokenNonce
LoginButton                                               UIButton subclass; .permissions, .presentingViewController, .delegate
LoginButtonDelegate                                       loginButton(_:didSucceedLogin:) / didFailLogin: / loginButtonDidStartLogin(_:)
LoginResult                                               .accessToken, .permissions, .userProfile, .friendshipStatusChanged
UserProfile                                               .userID, .displayName, .pictureURL, .statusMessage
AccessToken                                               .value, .expiresAt, .IDToken, .IDTokenRaw
AccessTokenStore.shared.current                           The stored AccessToken (or nil)
API.getProfile { }                                        Get UserProfile
API.getBotFriendshipStatus { }                            → .friendFlag
API.Auth.refreshAccessToken { }                           Manual token refresh
API.Auth.verifyAccessToken { }                            → AccessTokenVerifyResult (.channelID, .permissions, .expiresIn)
LineSDKError                                              enum: .requestFailed / .responseFailed / .authorizeFailed / .generalError
```

### Android SDK — key types

```
LineLoginApi.getLoginIntent(context, channelId, LineAuthenticationParams)            App-to-app login intent
LineLoginApi.getLoginIntentWithoutLineAppAuth(context, channelId, params)            Browser-only login intent
LineLoginApi.getLoginResultFromIntent(data)                                          Parse onActivityResult data → LineLoginResult
LineAuthenticationParams.Builder().scopes(...).nonce(...).botPrompt(...).build()      Login parameters
LineLoginResult                                                                       .getResponseCode(), .getLineProfile(), .getLineCredential(), .getLineIdToken(), .getFriendshipStatusChanged(), .getErrorData()
LineApiClientBuilder(context, channelId).build()  →  LineApiClient                    SDK API client
LineApiClient.getProfile() / getCurrentAccessToken() / refreshAccessToken()           Return LineApiResponse<T>
LineApiClient.verifyToken() / logout() / getFriendshipStatus()
LineApiResponse                                                                       .isSuccess(), .getResponseCode(), .getResponseData(), .getErrorData()
LoginButton (com.linecorp.linesdk.widget)                                             .setChannelId(), .setAuthenticationParams(), .setLoginDelegate(), .addLoginListener()
LoginDelegate.Factory.create()                                                        Delegate wiring for LoginButton
LineCredential / LineAccessToken / LineProfile / LineIdToken                          Result value types
```

### Unity SDK — key types

```
LineSDK.Instance.Login(string[] scopes, callback)        Start login → Result<LoginResult>
LineSDK.Instance.Login(scopes, LoginOption, callback)    Login with options (BotPrompt, IDTokenNonce, OnlyWebLogin)
LineSDK.Instance.Logout(callback)                        Log out
LineSDK.Instance.SetupSDK()                              Init native side (only if channelID set programmatically)
LineSDK.Instance.CurrentAccessToken                      StoredAccessToken or null (.Value)
LineAPI.GetProfile(callback)                             → UserProfile (.UserId, .DisplayName, .StatusMessage, .PictureUrl)
LineAPI.GetBotFriendshipStatus(callback)                 → BotFriendshipStatus (.IsFriend)
LineAPI.VerifyAccessToken(callback)                      → AccessTokenVerifyResult (.ChannelId, .ExpiresIn, .Scope)
LineAPI.RefreshAccessToken(callback)                     Manual token refresh → AccessToken
LineAPI.RevokeAccessToken(callback)                      Revoke the current access token
result.Match(valueFn, errorFn)                           Handle success/failure; Error has .Code and .Message
```

### Flutter SDK — key types

```
LineSDK.instance.setup(channelId, {universalLink})       Configure SDK → Future<void>
LineSDK.instance.login({scopes, option})                 Start login → Future<LoginResult>
LineSDK.instance.logout()                                Revoke tokens → Future<void>
LineSDK.instance.getProfile()                            → Future<UserProfile>
LineSDK.instance.getBotFriendshipStatus()                → Future<BotFriendshipStatus> (.isFriend)
LineSDK.instance.verifyAccessToken()                     → Future<AccessTokenVerifyResult>
LineSDK.instance.refreshToken()                          → Future<AccessToken>
LineSDK.instance.currentAccessToken                      → Future<StoredAccessToken?>
LoginResult                                              .accessToken, .userProfile, .scopes, .idTokenNonce, .isFriendshipStatusChanged
LoginOption(onlyWebLogin, botPrompt, {requestCode})      .idTokenNonce settable
```

## Working rules

- **Call setup first.** iOS: `LoginManager.shared.setup(...)` must run before any
  other SDK call (in `didFinishLaunching`). Android: build a `LineApiClient`
  before calling its methods. Unity: the LineSDK prefab must be in the scene.
- **Login is async and returns a Result.** Switch on success/failure; never
  assume success. iOS uses `Result<LoginResult, LineSDKError>`; Android uses
  `LineLoginResult.getResponseCode()`; Unity uses `Result.Match`.
- **Never trust client-supplied identity.** Don't send a user ID / profile from
  app to backend as proof of identity — a malicious client can forge it. Send
  the **access token** (server verifies it) or the **raw ID token string**
  (server verifies it against the ID token verification endpoint with the
  matching `nonce`). The SDKs surface `accessToken.value` / `IDTokenRaw` /
  `getTokenString()` / raw ID token exactly for this.
- **Tokens auto-refresh — let them.** API-type calls auto-refresh an expired
  access token; manual refresh is discouraged. A long-expired token fails to
  refresh and forces a fresh login. On iOS, only `API.*` methods auto-refresh —
  `API.Auth.*` do not.
- **Android: never call SDK methods on the main thread.** They do network I/O
  and throw `NetworkOnMainThreadException`; wrap in `AsyncTask`/background.
  Also avoid `singleInstance` launch mode on the login activity (breaks
  `onActivityResult`), and don't use resource IDs prefixed `linesdk_`.
- **iOS: the `lineauth2` scheme launches LINE; `line3rdp.<bundle id>` returns to
  your app.** Put `line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)` in `CFBundleURLSchemes`
  and `lineauth2` in `LSApplicationQueriesSchemes` — never the reverse.
- **Universal links (iOS) are optional but recommended** for security; pass the
  link to `LoginManager.setup(channelID:universalLinkURL:)` and it must match the
  console setting.
- **The user ID is unique per provider**, not globally. The same LINE user has
  different user IDs under different providers — don't cross-reference it.
- **v4 access tokens don't work with v5.** Upgrading the iOS/Android SDK to v5
  forces every user to log in again.
- **ID tokens are issued only at login.** To refresh an ID token, log in again;
  profile data can instead be re-fetched with `getProfile`.
