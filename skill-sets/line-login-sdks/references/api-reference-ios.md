# LINE SDK v5 for iOS Swift — API Reference

Source: `https://developers.line.biz/en/reference/ios-sdk-swift/` (the `LineSDK`
module reference — Classes, Enumerations, Structures, Protocols, Extensions).

This is the class/method reference. For task-oriented integration steps see
`ios-sdk-swift.md`. Module name: `import LineSDK`.

## Table of contents

- LoginManager (class) + Parameters, BotPrompt, WebPageLanguage
- LoginButton (class) + ButtonSize
- LoginButtonDelegate (protocol)
- LoginProcess (class)
- AccessTokenStore (class)
- API (enum) + API.Auth (enum)
- Structures: LoginResult, UserProfile, AccessToken, AccessTokenVerifyResult, LoginPermission, LoginManagerOptions, JWT + JWT.Payload, GetBotFriendshipStatusRequest + Response, GetVerifyTokenRequest, APIError, Constant, LineSDKNotificationKey
- LineSDKError (enum) + RequestErrorReason / ResponseErrorReason / AuthorizeErrorReason / GeneralErrorReason
- AuthorizationStatus, CallbackQueue, ContentType, HTTPMethod, AuthenticateMethod (enums)
- Notification.Name extension
- Other reference symbols (networking / crypto internals)

---

## `LoginManager` (class)

`public class LoginManager` — Represents a login manager. Set up the LINE SDK
configuration, log in and log out the user with the LINE authorization flow, and
check the authorization status.

| Member | Declaration | Notes |
|---|---|---|
| `shared` | `public static let shared: LoginManager` | The shared instance. Always use this instance to interact with the login process. |
| `currentProcess` | `public private(set) var currentProcess: LoginProcess? { get }` | The current login process. Non-`nil` means an ongoing process; `nil` otherwise. |
| `isSetupFinished` | `public var isSetupFinished: Bool { get }` | Whether the `LoginManager` is ready to use. |
| `isAuthorized` | `public var isAuthorized: Bool { get }` | Whether the user was authorized and an access token exists locally. **Does not** check expiry — use `API.Auth.verifyAccessToken`. |
| `isAuthorizing` | `public var isAuthorizing: Bool { get }` | Whether the authorizing process is currently ongoing. |

**`setup(channelID:universalLinkURL:)`**

```swift
public func setup(channelID: String, universalLinkURL: URL?)
```

Sets up the current `LoginManager` instance. Call **before** any other SDK
method or property, and **only once**. Strongly recommended to specify a valid
universal link URL — LINE will then bring up your app with the universal link
first, improving security. If `universalLinkURL` is `nil`, only a custom URL
scheme is used.
- `channelID` — The channel ID for your app.
- `universalLinkURL` — The universal link used to navigate back to your app from LINE.

**`login(permissions:in:parameters:completionHandler:)`**

```swift
@discardableResult
public func login(
    permissions: Set<LoginPermission> = [.profile],
    in viewController: UIViewController? = nil,
    parameters: LoginManager.Parameters = .init(),
    completionHandler completion: @escaping (Result<LoginResult, LineSDKError>) -> Void
) -> LoginProcess?
```

Logs in to the LINE Platform. Only one process can run at a time. If
`permissions` contains `.profile`, the user profile is retrieved and placed in
`LoginResult.userProfile`. An access token + refresh token are issued on
authorization and stored automatically in the keychain. Tokens auto-refresh on
any API call; manual refresh via `API.Auth.refreshAccessToken`.
- `permissions` — Permissions requested. Default `[.profile]`.
- `viewController` — Presents the login VC. If `nil`, the topmost VC is used.
- `parameters` — See `LoginManager.Parameters`.
- `completion` — Invoked when login finishes.

**`logout(completionHandler:)`**

```swift
public func logout(completionHandler completion: @escaping (Result<(), LineSDKError>) -> Void)
```

Logs out the current user by revoking the refresh token and all its access tokens.

**`application(_:open:options:)`**

```swift
public func application(
    _ app: UIApplication,
    open url: URL?,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool
```

Asks this `LoginManager` to handle a URL callback from LINE or the web login
flow. Same method signature as `UIApplicationDelegate` methods — pass all
arguments through unmodified.

**Deprecated members of `LoginManager`:**
- `preferredWebPageLanguage: WebPageLanguage?` — deprecated; set the preferred
  language in `LoginManager.Parameters` and use the `parameters:` login overload.
- `login(permissions:in:options:completionHandler:)` — deprecated; convert
  `options` to a `LoginManager.Parameters` and use the `parameters:` overload.

### `LoginManager.Parameters` (struct)

`public struct Parameters` — Parameters used during login.

| Member | Declaration | Notes |
|---|---|---|
| `onlyWebLogin` | `public var onlyWebLogin: Bool` | Forces the web authentication flow instead of LINE app-to-app. |
| `botPromptStyle` | `public var botPromptStyle: BotPrompt?` | Style for showing the "Add LINE Official Account as friend" prompt on the consent screen. |
| `preferredWebPageLanguage` | `public var preferredWebPageLanguage: WebPageLanguage?` | Preferred language for the web authorization flow. Does not affect LINE-app authorization. |
| `IDTokenNonce` | `public var IDTokenNonce: String?` | Nonce for ID token verification (used with `.openID` permission, to prevent replay attacks). If unset, the SDK generates a random value. The SDK always verifies the nonce locally. |
| `allowRecreatingLoginProcess` | (property) | Whether another login process can be created while the original is valid. If `true`, a new login action ends an existing one with `GeneralErrorReason.processDiscarded`. If `false`, the new action is ignored. Default `true` on macCatalyst, `false` otherwise. |
| `init()` | `public init()` | Creates a default `LoginManager.Parameters` value. |

### `LoginManager.BotPrompt` (enum)

`public enum BotPrompt : String`

- `case normal` — Includes an option to add a LINE Official Account as friend on the consent screen.
- `case aggressive` — Opens a new screen to add a LINE Official Account as a friend after the user agrees to the permissions on the consent screen.

### `LoginManager.WebPageLanguage` (struct)

`public struct WebPageLanguage` — the language used in the web page.

- `public init(rawValue: String)` — `rawValue` is the language code.
- Static values (each `public static let ...: LoginManager.WebPageLanguage`):
  `arabic`, `german`, `english`, `spanish`, `french`, `indonesian`, `italian`,
  `japanese`, `korean`, `malay`, `portugueseBrazilian`, `portugueseEuropean`,
  `russian`, `thai`, `turkish`, `vietnamese`, `chineseSimplified`,
  `chineseTraditional`.

---

## `LoginButton` (class)

`public class LoginButton` — a `UIButton` subclass following the LINE Login
button design guidelines.

| Member | Declaration | Notes |
|---|---|---|
| `delegate` | `public weak var delegate: LoginButtonDelegate?` | Implements `LoginButtonDelegate` to handle login states. |
| `presentingViewController` | `public weak var presentingViewController: UIViewController?` | The VC presenting the login VC. If `nil`, the topmost VC is used. |
| `permissions` | `public var permissions: Set<LoginPermission>` | The permission set. Default `[.profile]`. |
| `parameters` | `public var parameters: LoginManager.Parameters` | Parameters used during login. |
| `buttonSize` | `public var buttonSize: ButtonSize { get set }` | Button size. Default `normal`. |
| `buttonText` | `public var buttonText: String? { get set }` | The button text. Default localized "Log in with LINE". Changing it resizes the button. |
| `init()` | `public init()` | Creates a predefined LINE Login button. |
| `init(coder:)` | `public required init?(coder aDecoder: NSCoder)` | |
| `intrinsicContentSize` | `override open var intrinsicContentSize: CGSize { get }` | Supports automatic layout. |
| `login()` | `@objc open func login()` | Executes the login action when the user taps the button. |
| `options` *(deprecated)* | `public var options: LoginManagerOptions` | Deprecated. Convert into a `LoginManager.Parameters` and use `parameters`. |

### `LoginButton.ButtonSize` (enum)

`public enum ButtonSize` — `case small`, `case normal`.

## `LoginButtonDelegate` (protocol)

| Method | Declaration |
|---|---|
| `loginButtonDidStartLogin(_:)` | `func loginButtonDidStartLogin(_ button: LoginButton)` — login action started; show an indicator. |
| `loginButton(_:didSucceedLogin:)` | `func loginButton(_ button: LoginButton, didSucceedLogin loginResult: LoginResult)` — login succeeded. |
| `loginButton(_:didFailLogin:)` | `func loginButton(_ button: LoginButton, didFailLogin error: LineSDKError)` — login failed (strongly typed error). |
| `loginButton(_:didFailLogin:)` *(deprecated)* | `func loginButton(_ button: LoginButton, didFailLogin error: Error)` — deprecated; use the `LineSDKError` variant. |

## `LoginProcess` (class)

`public class LoginProcess` — `stop()`: `public func stop()` — stops the login
process; the process fails with a `.forceStopped` error.

---

## `AccessTokenStore` (class)

`public class AccessTokenStore`

| Member | Declaration | Notes |
|---|---|---|
| `shared` | `public static var shared: AccessTokenStore { get }` | The shared instance. Access only after SDK setup, or the app traps. |
| `current` | `public private(set) var current: AccessToken? { get }` | The `AccessToken` currently in use (or `nil`). |

---

## `API` (enum)

`public enum API` — top-level API namespace. **`API.*` methods auto-refresh the
access token**; `API.Auth.*` methods do not.

**`getProfile(callbackQueue:completionHandler:)`**

```swift
public static func getProfile(
    callbackQueue queue: CallbackQueue = .currentMainOrAsync,
    completionHandler completion: @escaping (Result<UserProfile, LineSDKError>) -> Void
)
```

Gets the user's profile. Requires the `.profile` permission.

**`getBotFriendshipStatus(callbackQueue:completionHandler:)`**

```swift
public static func getBotFriendshipStatus(
    callbackQueue queue: CallbackQueue = .currentMainOrAsync,
    completionHandler completion: @escaping (Result<GetBotFriendshipStatusRequest.Response, LineSDKError>) -> Void
)
```

Gets the friendship status of the user and the LINE Official Account linked to
your channel. Requires the `.profile` permission.

> `API` also exposes deprecated `refreshAccessToken` / `revokeAccessToken` /
> `revokeRefreshToken` / `verifyAccessToken` static methods — all deprecated in
> favor of the `API.Auth` equivalents (because auth APIs should not refresh
> tokens automatically as a side effect).

### `API.Auth` (enum)

`public enum Auth` — authentication-related APIs. Unlike other public APIs,
these **do not refresh the access token automatically** — don't use them as a
means of refreshing tokens.

**`refreshAccessToken(callbackQueue:completionHandler:)`**

```swift
public static func refreshAccessToken(
    callbackQueue queue: CallbackQueue = .currentMainOrAsync,
    completionHandler completion: @escaping (Result<AccessToken, LineSDKError>) -> Void)
```

Refreshes the access token with the refresh token. On success the refreshed
token is stored in the keychain and a `.LineSDKAccessTokenDidUpdate` notification
is sent. Normally unnecessary — any API call auto-refreshes.

**`revokeAccessToken(_:callbackQueue:completionHandler:)`**

```swift
public static func revokeAccessToken(
    _ token: String? = nil,
    callbackQueue queue: CallbackQueue = .currentMainOrAsync,
    completionHandler completion: @escaping (Result<(), LineSDKError>) -> Void)
```

Revokes the access token (default: the current one). The revoked token is
removed from the keychain. A `nil`/invalid token still yields `.success`. Sends
`LineSDKAccessTokenDidRemove`.

**`revokeRefreshToken(_:callbackQueue:completionHandler:)`**

```swift
public static func revokeRefreshToken(
    _ refreshToken: String? = nil,
    callbackQueue queue: CallbackQueue = .currentMainOrAsync,
    completionHandler completion: @escaping (Result<(), LineSDKError>) -> Void)
```

Revokes the refresh token and all its corresponding access tokens. Do **not**
pass an access token here. After revocation the user must authorize again.

**`verifyAccessToken(_:callbackQueue:completionHandler:)`**

```swift
public static func verifyAccessToken(
    _ token: String? = nil,
    callbackQueue queue: CallbackQueue = .currentMainOrAsync,
    completionHandler completion: @escaping (Result<AccessTokenVerifyResult, LineSDKError>) -> Void)
```

Verifies the access token (default: the current one). **Does not** refresh on
invalid/expired; instead returns the server response as an error.

---

## Structures

### `LoginResult`

| Property | Declaration | Notes |
|---|---|---|
| `accessToken` | `public let accessToken: AccessToken` | The access token obtained by login. |
| `permissions` | `public let permissions: Set<LoginPermission>` | Permissions bound to the token by authorization. |
| `userProfile` | `public let userProfile: UserProfile?` | Present only when `.profile` is set in the request. |
| `friendshipStatusChanged` | `public let friendshipStatusChanged: Bool?` | Whether friendship with the LINE Official Account changed. Non-`nil` only if `.botPromptNormal`/`.botPromptAggressive` were specified. |
| `IDTokenNonce` | `public let IDTokenNonce: String?` | Nonce value for ID token verification against the LINE server. `nil` if `.openID` was not requested. |

### `UserProfile`

| Property | Declaration |
|---|---|
| `userID` | `public let userID: String` — user ID of the current authorized user. |
| `displayName` | `public let displayName: String` |
| `pictureURL` | `public let pictureURL: URL?` — `nil` if no profile image. |
| `pictureURLLarge` | `public var pictureURLLarge: URL? { get }` |
| `pictureURLSmall` | `public var pictureURLSmall: URL? { get }` |
| `statusMessage` | `public let statusMessage: String?` |

### `AccessToken`

| Property | Declaration | Notes |
|---|---|---|
| `value` | `public let value: String` | The access token value. |
| `createdAt` | `public let createdAt: Date` | Creation time (device system time). |
| `IDToken` | `public let IDToken: JWT?` | Present only if obtained with `.openID`. |
| `IDTokenRaw` | `public let IDTokenRaw: String?` | Raw ID token string; present only with `.openID`. |
| `permissions` | `public let permissions: [LoginPermission]` | Permissions of the token. |
| `expiresAt` | `public var expiresAt: Date { get }` | Calculated from `createdAt` + validity; may not be exact. |

### `AccessTokenVerifyResult`

- `channelID: String` — channel ID bound to the token.
- `permissions: [LoginPermission]` — valid permissions of the token.
- `expiresIn: TimeInterval` — time until the token expires.

### `LoginPermission`

`public struct LoginPermission` — composed of a plain raw string.

- `rawValue: String`; `init(rawValue: String)` — for permissions not defined in the framework.
- `public static let openID` — get an ID token in the login response.
- `public static let profile` — get the user's profile (user ID, display name, profile image URL).
- `public static let oneTimeShare` — select friends or groups and share content.
- `public static let openChatTermStatus` — check Open Chat use-term agreement status.
- `public static let openChatRoomCreateAndJoin` — create or join an Open Chat room.
- `public static let openChatInfo` — check subscription info of an Open Chat room.
- `public static let email` — get the user's email from the ID token. Requires `.openID` granted simultaneously; the channel must have the email permission configured in the LINE Developers console.

### `LoginManagerOptions` *(deprecated container)*

`public struct LoginManagerOptions` — `rawValue: Int`; `init(rawValue: Int)`.

- `onlyWebLogin` — deprecated, use `LoginManager.Parameters.onlyWebLogin`.
- `botPromptNormal` — deprecated, use `LoginManager.Parameters.botPromptStyle`.
- `botPromptAggressive` — deprecated, use `LoginManager.Parameters.botPromptStyle`. If `botPromptNormal` and `botPromptAggressive` are both set, `aggressive` wins.

### `JWT` and `JWT.Payload`

`public struct JWT` — `payload: Payload` (the payload section).

`public struct JWT.Payload` — exposed claim getters; use the subscript for
unexposed values.

```swift
public subscript<T>(key: String, type: T.Type) -> T? { get }
```

| Property | Declaration | Notes |
|---|---|---|
| `issuer` | `public var issuer: String? { get }` | Always `https://access.line.me` for LINE-Platform ID tokens. |
| `subject` | `public var subject: String? { get }` | The user ID of the authorized user. |
| `audience` | `public var audience: String? { get }` | The channel ID of your app. |
| `expiration` | `public var expiration: Date? { get }` | Expiration time of the ID token. |
| `issueAt` | `public var issueAt: Date? { get }` | Issued time of the ID token. |
| `amr` | `public var amr: [String]? { get }` | Authentication methods references. |
| `name` | `public var name: String? { get }` | User display name. Absent if `.profile` not requested. |
| `pictureURL` | `public var pictureURL: URL? { get }` | Profile image URL. Absent if `.profile` not requested. |
| `email` | `public var email: String? { get }` | Email address. Absent if `.email` not requested. |

### `GetBotFriendshipStatusRequest` + `Response`

`public struct GetBotFriendshipStatusRequest` — `Response`:
`public struct Response : Codable` with `friendFlag: Bool` — `true` if the LINE
Official Account is a friend of the user and not blocked; `false` otherwise.

### `GetVerifyTokenRequest`

`public struct GetVerifyTokenRequest` — `accessToken: String`;
`public init(accessToken: String)`.

### `APIError`

`public struct APIError` — `error: String` (error state from the LINE Platform),
`detail: String?` (error detail).

### `Constant`

`public struct Constant` — `public static let SDKVersion: String` (current LINE
SDK version).

### `LineSDKNotificationKey`

`public struct LineSDKNotificationKey` — `userInfo` dictionary keys:
- `public static let oldAccessToken: String`
- `public static let newAccessToken: String`

---

## `LineSDKError` (enum)

`public enum LineSDKError` — conforms to `Swift.Error`, `CustomNSError`,
`LocalizedError`. Every error reported by the SDK is a `LineSDKError`.

**Cases:**
- `case requestFailed(reason: RequestErrorReason)` — error constructing a request.
- `case responseFailed(reason: ResponseErrorReason)` — error handling a response.
- `case authorizeFailed(reason: AuthorizeErrorReason)` — error authorizing a user.
- `case generalError(reason: GeneralErrorReason)` — error in another SDK process.
- `case untypedError(error: Error)` — an error not defined in the SDK.

**Classification properties:** `isRequestError`, `isResponseError`,
`isAuthorizeError`, `isGeneralError` — all `Bool { get }`.

**Convenience properties / methods:**
- `isUserCancelled: Bool` — authorization error with reason `.userCancelled`.
- `isBadRequest: Bool` — a bad-request error.
- `isRefreshTokenError: Bool` — refresh-token error (token auto-refresh failed because the refresh token also expired/invalid). Have the user log in again.
- `isPermissionError: Bool` — insufficient permissions to access an endpoint.
- `isTokenError: Bool` — access token expired or malformed.
- `isResponseError(statusCode: Int) -> Bool` — whether the status code matches.
- `isURLSessionTimeOut: Bool` — timeout from the underlying URL session.
- `isURLSessionErrorCode(sessionErrorCode code: Int) -> Bool` — URL session error with a specified code.
- `errorDescription: String? { get }` — human-readable cause.
- `errorCode: Int { get }` — NSError compatibility.

### `LineSDKError.RequestErrorReason` (enum)

| Case | Code | Meaning |
|---|---|---|
| `missingURL` | 1001 | The URL object is missing while encoding a request. |
| `lackOfAccessToken` | 1002 | The request requires an access token but it is unavailable. |
| `jsonEncodingFailed(Error)` | 1003 | A JSON body is required but the data cannot be encoded to valid JSON. |
| `invalidParameter([ParameterItem])` | 1004 | The request cannot be created — a parameter doesn't match the precondition. |

### `LineSDKError.ResponseErrorReason` (enum)

Has a nested `public struct APIErrorDetail` (associated value of
`invalidHTTPStatusAPIError` — holds the HTTP status code and server error
messages).

| Case | Code | Meaning |
|---|---|---|
| `URLSessionError(Error)` | 2001 | Error in the underlying `URLSession`. |
| `nonHTTPURLResponse` | 2002 | The response is not a valid `HTTPURLResponse`. |
| `dataParsingFailed(Any.Type, Data, Error?)` | 2003 | Received data cannot be parsed to the target type. Associated values: destination type, original data, underlying error. |
| `invalidHTTPStatusAPIError(detail: APIErrorDetail)` | 2004 | Invalid HTTP status code; `APIErrorDetail` carries the details. |

### `LineSDKError.AuthorizeErrorReason` (enum)

| Case | Code | Meaning |
|---|---|---|
| `exhaustedLoginFlow` | 3001 | No other login method left. |
| `malformedHierarchy` | 3002 | View/VC hierarchy is malformed; can't show the login VC. |
| `userCancelled` | 3003 | The user cancelled or interrupted the login process. |
| `forceStopped` | 3004 | The `stop` method was called during the login process. |
| `callbackURLSchemeNotMatching` | 3005 | The received URL doesn't match the defined URL scheme. |
| `invalidSourceApplication` | 3006 | Source application invalid. Not in use anymore from LINE SDK 5.2.4. |
| `malformedRedirectURL(url: URL, message: String?)` | 3007 | The received URL is invalid or lacks necessary info. |
| `invalidLineURLResultCode(String)` | 3008 | The received URL has an unknown result code. |
| `lineClientError(code: String, message: String?)` | 3009 | An error occurs in LINE during authorization. |
| `responseStateValueNotMatching(expected: String, got: String?)` | 3010 | `state` verification failed — URL response is not from the original request. |
| `webLoginError(error: String, description: String?)` | 3011 | An error occurs in the web login flow. |
| `keychainOperation(status: OSStatus)` | 3012 | Error accessing the keychain. |
| `invalidDataInKeychain` | 3013 | Keychain authorization info can't be converted to valid data. |
| `lackOfIDToken(raw: String?)` | 3014 | OpenID scope requested but no ID token found/parsed in the response. |
| `JWTPublicKeyNotFound(keyID: String?)` | 3015 | Public key not found for the given key ID. |
| `cryptoError(error: CryptoError)` | 3016 | A crypto error — malformed certificate/key or unsupported algorithm. |

### `LineSDKError.GeneralErrorReason` (enum)

| Case | Code | Meaning |
|---|---|---|
| `conversionError(string: String, encoding: String.Encoding)` | 4001 | Cannot convert string to valid data with encoding. |
| `parameterError(parameterName: String, description: String)` | 4002 | The method was invoked with an invalid parameter. |
| `notOriginalTask(token: UInt)` | 4003 | The image download task finished but is not the original task. |
| `processDiscarded(LoginProcess)` | 4004 | The process was discarded when a new login process was created (only when `allowRecreatingLoginProcess` is `true`). |

---

## Other enumerations

### `AuthorizationStatus` (enum)

- `case lackOfToken` — no valid token locally; the user hasn't logged in.
- `case lackOfPermissions(Set<LoginPermission>)` — valid token but missing the permissions needed to share a message; the associated set lists the lacking permissions.
- `case authorized` — token exists and has the necessary permissions.

### `CallbackQueue` (enum)

- `case asyncMain` — dispatch to `DispatchQueue.main` asynchronously.
- `case currentMainOrAsync` — dispatch to `.main` async if not already on `.main`; otherwise call immediately on the main queue.
- `case untouch` — do not change the call queue.
- `case dispatch(DispatchQueue)` — dispatch to a specified `DispatchQueue`.
- `case operation(OperationQueue)` — add to a specified `OperationQueue`.

### `ContentType` (enum)

`case none`, `case formUrlEncoded`, `case json`.

### `HTTPMethod` (enum)

`case get = "GET"`, `case post = "POST"`, `case put = "PUT"`, `case delete = "DELETE"`.

### `AuthenticateMethod` (enum)

`case none` (no authentication), `case token` (OAuth 2.0 Bearer token).

---

## `Notification.Name` extension

Two notification names (`public static let ...: Notification.Name`):

- `LineSDKAccessTokenDidUpdate` — sent when the current token is updated and
  stored in the keychain (the user authorized your app, a token was obtained).
  The posted `Notification`'s `object` is the new access token; `userInfo`
  carries the new token under `LineSDKNotificationKey.newAccessToken` and, if
  one existed, the old token under `LineSDKNotificationKey.oldAccessToken`.
- `LineSDKAccessTokenDidRemove` — sent when the SDK removes the current access
  token from the keychain (logout or token revocation). An expired token is
  *not* auto-removed (it gets refreshed on use). The `object` is the removed
  token.

---

## Other reference symbols (networking / crypto internals)

The `LineSDK` module reference also documents lower-level types that the LINE
Login client flow does not call directly — they support the SDK's request
pipeline, Open Chat creation, and JWT cryptography. They are listed here for
completeness; you rarely touch them when integrating LINE Login:

- **Networking pipeline:** `Session` (class), `SessionTask`, `JSONParsePipeline`
  (class), `ResponsePipeline` (enum), `ResponsePipelineRedirectorAction` (enum),
  `ResultUtil` (enum), and the protocols `Request`, `RequestAdapter`,
  `ResponsePipelineRedirector`, `ResponsePipelineTerminator`,
  `DefaultEnumCodable`; the structs `AnyRequestAdapter`, `HexColor`; the type
  alias `Parameters`. `GetUserProfileRequest` (struct) is the request type
  behind `API.getProfile`.
- **Open Chat:** `OpenChatCreatingController` (class) +
  `OpenChatCreatingControllerDelegate` (protocol) — UI flow for creating an Open
  Chat room (needs the `openChatRoomCreateAndJoin` permission).
- **Crypto:** `CryptoError` (enum) with nested reason enums
  `AlgorithmsErrorReason`, `JWTErrorReason`, `JWKErrorReason`,
  `GeneralErrorReason` — surfaced via `LineSDKError.AuthorizeErrorReason.cryptoError`
  when ID token signature verification fails.
