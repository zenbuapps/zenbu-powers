# LINE SDK v5 for iOS Swift

Source:
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/overview/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/try-line-login/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/setting-up-project/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/universal-links-support/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/integrate-line-login/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/link-a-bot/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/managing-users/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/managing-access-tokens/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/error-handling/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/using-objc/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/migration-guide/`

## Table of contents

- Overview & features
- Trying the starter app
- Setting up your project (installation, channel linking, `Info.plist`)
- Using universal links
- Integrating LINE Login (setup, login, login button, handling the result)
- Enabling the add friend option
- Managing users (profile, ID token, logout)
- Managing access tokens (refresh, get, verify)
- Handling errors (`LineSDKError`)
- Using the SDK with Objective-C code
- Upgrading the SDK (v4 → v5)

---

# Overview

Developed in Swift, the LINE SDK for iOS Swift provides a modern way of
implementing the LINE Platform APIs.

**Features:**

- **User authentication** — users log in with their LINE accounts. If the user
  is already logged in to LINE on the device, they log in automatically without
  entering credentials.
- **Utilizing user data with OpenID support** — once authorized, you can get the
  user's LINE profile. The SDK supports the OpenID Connect 1.0 specification;
  you get ID tokens containing the user's LINE profile when you retrieve the
  access token.
- **API calls** — methods to get user profile information, log out users, and
  manage access tokens.
- **Open-source SDK** — repository: `https://github.com/line/line-sdk-ios-swift`.

**High-level steps:** (1) Create a channel (see Getting started with LINE
Login). (2) Use the SDK to add LINE Login support. (3) Use LINE Login —
client-side via Managing users; server-side via Managing access tokens + the
LINE Login v2.1 API reference.

---

# Trying the starter app

The LINE Login starter app for iOS demonstrates how LINE Login works.

**Prerequisites:** Xcode 14.1 or later.

### With the predefined sample channel

1. Clone the open-source repository:
   ```sh
   $ git clone https://github.com/line/line-sdk-ios-swift.git
   ```
2. Open the `LineSDK.xcworkspace` file.
3. Build the `LineSDKSample` project. The starter app launches in Simulator.

### With your own channel

After creating a channel (and a provider), make these changes in the project:

1. In the LINE Developers Console, configure your channel as described in
   "Linking your app to your channel".
2. Modify the app bundle ID to the ID configured in your channel.
3. In the `Config.xcconfig` file, change the `LINE_CHANNEL_ID` value to your
   channel ID.

**Running:** Run on an iOS device or Simulator. Tap **Log in with LINE** for
app-to-app login. If LINE is installed and you're logged in, login is
automatic; otherwise login happens in the device browser with credentials.

Features available to general users: log out the user, get the user profile,
verify the access token, get the friendship status between a linked LINE
Official Account and the user. Other features are limited-user only.

---

# Setting up your project

## Prerequisites

To build and use the LINE SDK for iOS Swift, you need:

- A provider and a LINE Login channel (create both in the LINE Developers Console).
- iOS 13.0 or later as the deployment target.
- Xcode 14.1 or later.

> **Tip — Support earlier than iOS 13.0 as the deploy target:** Use an earlier
> version of the LINE SDK for iOS Swift. See the GitHub Releases page.

You can use the SDK with Swift or Objective-C code. To use Objective-C, see
"Using the SDK with Objective-C" below.

## Installation

The LINE SDK for iOS Swift is **not compatible** with previous LINE SDK for iOS
Objective-C versions. If upgrading, see "Upgrading the SDK" first.

### CocoaPods

1. Add the pod to your target in your Podfile:
   ```ruby
   platform :ios, '13.0'
   use_frameworks!

   target '<Your App Target Name>' do
       pod 'LineSDKSwift', '~> 5.0'
   end
   ```
2. Run:
   ```bash
   $ pod install
   ```

### Carthage

Carthage is a decentralized dependency manager that builds your dependencies and
provides binary frameworks.

1. Install the Carthage tool via Homebrew:
   ```bash
   $ brew update
   $ brew install carthage
   ```
2. Specify the SDK's GitHub repository in your Cartfile:
   ```
   github "line/line-sdk-ios-swift" ~> 5.0
   ```
3. Build the SDK:
   ```
   $ carthage update line-sdk-ios-swift
   ```

**Linking the `LineSDK.framework` file:** Drag and drop the `LineSDK.framework`
file from `Carthage/Build/iOS` to the "Linked Frameworks and Libraries" section
on your app target's "General" settings tab.

**Copying the `LineSDK.framework` file during the build phase:**

1. On the app target's "Build Phases" tab, click **+** > **New Run Script
   Phase**. Create a run script with:
   ```
   /usr/local/bin/carthage copy-frameworks
   ```
2. Add the framework path under "Input Files":
   ```
   $(SRCROOT)/Carthage/Build/iOS/LineSDK.framework
   ```
3. Add the framework path under "Output Files":
   ```
   $(BUILT_PRODUCTS_DIR)/$(FRAMEWORKS_FOLDER_PATH)/LineSDK.framework
   ```

## Linking your app to your channel

In the LINE Developers Console, go to your LINE Login channel settings and
complete these fields on the **LINE Login** tab:

- **iOS bundle ID:** Bundle identifier of your app (from the "General" tab in
  Xcode project settings). Must be lowercase, e.g. `com.example.app`. You can
  specify multiple bundle identifiers, one per line.
- **iOS universal link:** Enter the universal link configured for your app. See
  "Using universal links".

## Configuring the `Info.plist` file

In Xcode, right-click your app's `Info.plist`, select **Open As** > **Source
Code**. Insert this snippet just before the last `</dict>` tag:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <!-- Specify URL scheme to use when returning from LINE to your app. -->
            <string>line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        </array>
    </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
    <!-- Specify URL scheme to use when launching LINE from your app. -->
    <string>lineauth2</string>
</array>
```

| Key | Description |
|---|---|
| `CFBundleURLSchemes` | Use `line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)` to define the URL scheme needed to open your app. LINE Login uses this scheme to open your app after the LINE Platform returns a login result. **Note:** the URL scheme `lineauth2` is already used to activate LINE — do not use it in `CFBundleURLSchemes`. |
| `LSApplicationQueriesSchemes` | Specify `lineauth2` to allow launching LINE from your app as part of the login process. |

---

# Using universal links

Apple's universal links feature securely communicates information between apps.
If you set up a universal link, LINE tries to open your app with the universal
link first; if invalid, LINE falls back to a URL based on your iOS bundle ID.

> **Note — Universal links are recommended:** Although optional, they make your
> app more secure.

Steps: (1) create an association between your app and your server; (2) set up a
universal link on the LINE Developers Console; (3) call `LoginManager.setup`
with the universal link; (4) handle the login result after your app is opened
by the universal link.

## 1. Create an association between your app and your server

See Apple's "Allowing Apps and Websites to Link to Your Content". Complete:

- Create an `apple-app-site-association` file containing JSON data about the
  URLs your app can handle, and put it on your HTTPS server.
- Add an Associated Domains entitlement to your app.

Assuming `https://yourdomain.com/line-auth/` as the universal link, include
`/line-auth/*` in the `paths` field. A valid Apple App Site Association file:

```json
{
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "YOUR_TEAM_ID.com.yourcompany.yourapp",
                "paths": [ "/line-auth/*" ]
            }
        ]
    }
}
```

Universal links can be tested **only on a real iOS device**. Ensure they work
before proceeding.

## 2. Set up a universal link on the LINE Developers Console

See "Linking your app to your channel". In this example, set it to
`https://yourdomain.com/line-auth/`.

## 3. Call the `LoginManager.setup` method with the universal link

Pass the universal link to the SDK so LINE Login can verify the link is set up
correctly on both the console and the app, preventing abuse:

```swift
let link = URL(string: "https://yourdomain.com/line-auth/")
LoginManager.shared.setup(channelID: "YOUR_CHANNEL_ID", universalLinkURL: link)
```

## 4. Handle the login result after your app is opened by the universal link

Pass the received URL to the `application(_:open:options:)` method of
`LoginManager`. Modify either your app delegate or scene delegate, depending on
whether the project supports multiple windows (introduced in iOS 13).

**Modify app delegate** (iOS 12 and earlier open URLs via `UIApplicationDelegate`):

```swift
func application(
    _ app: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool
{
    if LoginManager.shared.application(app, open: userActivity.webpageURL) {
        return true
    }
    // Your other code to handle universal links and/or user activities.
}
```

**Modify scene delegates** (iOS 13+ tries `UISceneDelegate`). If your app
supports multiple windows, add to any scene delegate class:

```swift
// SceneDelegate.swift
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    _ = LoginManager.shared.application(.shared, open: URLContexts.first?.url)
}
```

> **Note — If you're not supporting multiple windows:** iOS calls your
> `UIApplicationDelegate` object to open URLs. Modify your app delegate instead.

---

# Integrating LINE Login with your iOS app

## Setting up the LineSDK framework and your channel ID

To process login results, set up the SDK in `AppDelegate.swift`.

### 1. Import the LineSDK framework

```swift
// AppDelegate.swift
import LineSDK
```

Also import the SDK into any other files that use it.

### 2. Call the `LoginManager.setup` method

Call `LoginManager.setup` just after your app launches:

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Add this to your "didFinishLaunching" delegate method.
    LoginManager.shared.setup(channelID: "YOUR_CHANNEL_ID", universalLinkURL: nil)

    return true
}
```

> **Note:** Call the `setup` method **before** you access other properties or
> call other methods of the SDK.

**Using a universal link:** If you set up a universal link in the console, call
`setup` with the `universalLinkURL` parameter to secure the login process. See
"Using universal links".

### 3. Handle app opening

Pass the received URL to `application(_:open:options:)` of `LoginManager`.

**Modify app delegate** (iOS 12 and earlier):

```swift
// AppDelegate.swift
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return LoginManager.shared.application(app, open: url)
}
```

**Modify scene delegates** (iOS 13+). If your app supports multiple windows,
add to any scene delegate class:

```swift
// SceneDelegate.swift
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    _ = LoginManager.shared.application(.shared, open: URLContexts.first?.url)
}
```

> **Note — If you're not supporting multiple windows:** iOS calls your
> `UIApplicationDelegate` object to open URLs. Modify your app delegate instead.

## Performing a login process

Two ways to add a login button: use the SDK's built-in login button, or use
your own code.

### Use the LINE SDK's built-in login button

The `LoginButton` class is a subclass of `UIButton` and follows the LINE Login
button design guidelines.

```swift
// In your view controller
override func viewDidLoad() {
    super.viewDidLoad()

    // Create Login Button.
    let loginButton = LoginButton()
    loginButton.delegate = self

    // Configuration for permissions and presenting.
    loginButton.permissions = [.profile]
    loginButton.presentingViewController = self

    // Add button to view and layout it.
    view.addSubview(loginButton)
    loginButton.translatesAutoresizingMaskIntoConstraints = false
    loginButton.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
    loginButton.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
}
```

When tapped: if LINE is installed, the app retrieves the user's LINE credentials
from LINE; otherwise the user is redirected to the LINE Login dialog in their
browser.

Implement `LoginButtonDelegate` to receive the login state:

```swift
extension LoginViewController: LoginButtonDelegate {
    func loginButton(_ button: LoginButton, didSucceedLogin loginResult: LoginResult) {
        hideIndicator()
        print("Login Succeeded.")
    }

    func loginButton(_ button: LoginButton, didFailLogin error: LineSDKError) {
        hideIndicator()
        print("Error: \(error)")
    }

    func loginButtonDidStartLogin(_ button: LoginButton) {
        showIndicator()
        print("Login Started.")
    }
}
```

### Use your own code

Call `LoginManager.login` with appropriate parameters, typically in a view
controller:

```swift
// LoginViewController.swift

import LineSDK

class LoginViewController: UIViewController {
    override func viewDidLoad() {
        //...
    }

    func login() {
        LoginManager.shared.login(permissions: [.profile], in: self) {
            result in
            switch result {
            case .success(let loginResult):
                print(loginResult.accessToken.value)
                // Do other things you need with the login result
            case .failure(let error):
                print(error)
            }
        }
    }
}
```

The completion handler is called with the `result` argument after the user
completes login. On success, the LINE Platform returns a `LoginResult` object.
Use `LoginManager.shared.isAuthorized` to access the login state. On error, the
`result` is `.failure` with an associated `LineSDKError`.

## Handling the login result

### Token permissions

You can specify any permissions in `LoginManager.login`, but your channel may
not have them. In that case, the `permissions` property of `LoginResult`
differs from what you specified. Check authorized permissions:

```swift
case .success(let loginResult):
    let profileEnabled = loginResult.permissions.contains(.profile)
```

API calls without appropriate permissions fail.

### User profile

If you specify the profile permission, the login result contains a
`UserProfile` object:

```swift
LoginManager.shared.login(permissions: [.profile], in: self) {
    result in
    switch result {
    case .success(let loginResult):
        if let profile = loginResult.userProfile {
            print("User ID: \(profile.userID)")
            print("User Display Name: \(profile.displayName)")
            print("User Icon: \(String(describing: profile.pictureURL))")
        }
    case .failure(let error):
        print(error)
    }
}
```

The user ID is unique only to an individual provider. The same LINE user has a
different user ID for different providers — avoid using it across providers.

### Using user data on your server

> **Warning — User impersonation:** Do not trust user IDs, or other information
> in the `UserProfile` object, when sent by a client to your backend server. A
> malicious client can send an arbitrary user ID or malformed information to
> impersonate a user. Instead, the client should send the server an access
> token, and the server should use the token to retrieve user data.

Send the access token (stored in the app), then use it to securely exchange
data. The server validates the token against the LINE Platform, then retrieves
the user's details.

```swift
LoginManager.shared.login(permissions: [.profile], in: self) {
    result in
    switch result {
    case .success(let loginResult):
        let token = loginResult.accessToken.value
        // Send `token` to your server.
    case .failure(let error):
        print(error)
```

Server-side APIs to call: Verify access token validity; Get user profile
(LINE Login v2.1 API reference).

---

# Enabling the add friend option with the SDK

You can display an option to add the LINE Official Account as a friend when a
user logs in. This is the **add friend option**. See "Add a LINE Official
Account as a friend when logged in (add friend option)" in the LINE Login docs
for: linking a LINE Official Account with your channel, the bot prompt
parameter and its behavior, and the friendship status flag.

## Setting the bot prompt parameter in the login request

Set `.normal` or `.aggressive` as `botPromptStyle`:

```swift
// Includes an option to add a LINE Official Account as a friend in the consent screen.
var parameters = LoginManager.Parameters()
parameters.botPromptStyle = .normal
LoginManager.shared.login(permissions: [.profile], parameters: parameters) {
    // ...
}

// Opens a new screen to add the LINE Official Account as a friend after the user agrees to the permissions in the consent screen.
parameters.botPromptStyle = .aggressive
LoginManager.shared.login(permissions: [.profile], parameters: parameters) {
    // ...
}
```

See `LoginManager.Parameters` and `LoginManager.BotPrompt` in the LINE SDK for
iOS Swift reference.

## Checking the friendship status between the user and the LINE Official Account

Two methods: check the `friendshipStatusChanged` property in the login
response, or use LINE Login to get friendship status.

### Check the `friendshipStatusChanged` property in the login response

After successful login, `LoginResult.friendshipStatusChanged` is a boolean
indicating whether the friendship status changed. To get the flag:

- The bot prompt option must be specified in the login request.
- The consent screen with the add-friend option must be displayed to the user.

```swift
var parameters = LoginManager.Parameters()
parameters.botPromptStyle = .normal
LoginManager.shared.login(permissions: [.profile], parameters: parameters) {
    result in
    switch result {
    case .success(let value):
        print(value.friendshipStatusChanged)
    case .failure(let error):
        print(error)
    }
}
```

### Use LINE Login to get friendship status

Call `getBotFriendshipStatus` after the user has logged in and an access token
has been returned:

```swift
API.getBotFriendshipStatus { result in
    switch result {
    case .success(let value): print(value.friendFlag)
    case .failure(let error): print(error)
    }
}
```

---

# Managing users

Covers: getting user profiles, using ID tokens to verify user identities,
logging out users.

> **Tip — Creating a secure login process:** See "Creating a secure login
> process between your app and server".

## Getting user profiles

If the login request includes the `.profile` scope, you can get the user's LINE
profile (user ID, display name, profile media, status message). Call
`API.getProfile`:

```swift
API.getProfile { result in
    switch result {
    case .success(let profile):
        print("User ID: \(profile.userID)")
        print("User Display Name: \(profile.displayName)")
        print("User Status Message: \(profile.statusMessage)")
        print("User Icon: \(String(describing: profile.pictureURL))")
    case .failure(let error):
        print(error)
    }
}
```

`API.getProfile` gets the values at the time of login; users can change display
name, profile media, and status message anytime. To identify users, use the
`userID` property, which doesn't change.

## Using ID tokens to verify user identities

OpenID Connect 1.0 is an identity layer on top of OAuth 2.0. With it you can get
the user profile and email address from the LINE Platform via ID tokens.

### Applying for email permission

You can request permission to get the user's email address. Apply for the
permission in the LINE Developers Console. See "Applying for email permission".

### Login with the OpenID and email scopes

Once your channel has the email permission, log in with `.openID` and `.email`:

```swift
LoginManager.shared.login(permissions: [.openID, .email], in: self) {
    result in
    switch result {
    case .success(let loginResult):
        if let email = loginResult.accessToken.IDToken?.payload.email {
            print("User Email: \(email)")
        }
    case .failure(let error):
        print(error)
    }
}
```

An ID token is a signed JSON Web Token. The SDK validates it (signature and
validity period) to prevent malformed data.

### Using ID tokens on your server

> **Warning — User impersonation:** Do not trust user IDs or other information
> sent by a client to your backend server. A malicious client can send an
> arbitrary user ID or malformed information to impersonate a user. Instead, the
> client should send the raw ID token string to your server. After verifying the
> token against the ID token verification API, the server can retrieve the user
> ID or any other information.

**Sending raw ID token string:** When logging in with `.openID`, you can assign
a custom value to `IDTokenNonce`:

```swift
var parameters = LoginManager.Parameters()
parameters.IDTokenNonce = "<a randomly-generated string>"
LoginManager.shared.login(permissions: [.profile, .openID], parameters: parameters) {
    result in
    // ...
}
```

The SDK automatically assigns a value to `IDTokenNonce` if none is specified,
but it's recommended to randomly generate a nonce on your server and store it
there. You can later use the original nonce to verify the ID token. Using
`nonce` helps prevent replay attacks.

After a successful login with `.openID`, get the raw ID token string:

```swift
LoginManager.shared.login(permissions: [.profile, .openID], parameters: parameters) {
    result in
    switch result {
    case .success(let loginResult):
        if let idToken = loginResult.accessToken.IDTokenRaw {
            // Send `idToken` to your server.
        } else {
            // Something went wrong. You should fail the login.
        }

    case .failure(let error):
        print(error)
```

Send `idToken` to your server to be verified.

**Verify ID token on your server:** Your server sends both the token and the
corresponding `nonce` value to the LINE Platform's ID token verification
endpoint. If valid, the API returns a JSON object with ID token claims.
Server-side API: "Verify the ID token" (LINE Login v2.1 API reference).

### Treating user data carefully

Do not save sensitive user data in plain text or transfer it over non-secure
HTTP. Such data includes the access token, user ID, username, and any
information in the ID token. The SDK stores the user's access token; access it
after authorization:

```swift
if let token = AccessTokenStore.shared.current {
    print(token.value)
}
```

ID tokens are issued only at login. To update the ID token, the user must log in
again. If you set the `.profile` scope, you can call `API.getProfile` for the
profile.

## Logging out users

To invalidate the access token and log out the user, call `logout`. After
logout, the user must go through login again:

```swift
LoginManager.shared.logout { result in
    switch result {
    case .success:
        print("Logout from LINE")
    case .failure(let error):
        print(error)
    }
}
```

---

# Managing access tokens

Covers: refreshing access tokens, getting the current access token, verifying
access tokens.

> **Tip — Creating a secure login process:** See "Creating a secure login
> process between your app and server".

## Refreshing access tokens

The SDK stores the user's valid access token after successful authorization and
uses it for API requests. Get the expiration date:

```swift
if let token = AccessTokenStore.shared.current {
    print("Token expires at:\(token.expiresAt)")
}
```

When making an API request through the `API` type, the SDK automatically
refreshes any expired access token. However, the refresh operation fails if the
token has been expired for a long time — an error occurs and the user must log
in again.

**Only methods of the `API` type automatically refresh the access token.**
Methods of other types, such as `API.Auth`, do **not** trigger access token
auto-refresh.

Refreshing access tokens yourself is **not recommended** — it's easier and more
future-proof to let the SDK manage them. If necessary, manually refresh:

```swift
API.Auth.refreshAccessToken { result in
    switch result {
    case .success(let token):
        print("Token Refreshed: \(token)")
    case .failure(let error):
        print(error)
    }
}
```

## Getting the current access token

When building a client-server application, use access tokens to send user data
between your app and the server. If you obtain an access token in your app and
send it to a server, you can make LINE Login API calls from that server (see
the LINE Login v2.1 API reference).

To get the access token the SDK has saved, use the `current` property of the
shared `AccessTokenStore`:

```swift
if let token = AccessTokenStore.shared.current {
    print(token.value)
}
```

When sending access tokens to your server, encrypt the token and use SSL to send
the encrypted data. Also verify that the access token received by your server
matches the access token used to call LINE Login, and that the channel ID
matches the one for your channel.

## Verifying access tokens

Call `API.Auth.verifyAccessToken` to verify the current access token. It returns
an `AccessTokenVerifyResult` object. On success, the response includes
`channelID`, `permissions`, and `expiresIn`. Otherwise the token is invalid,
revoked, or expired, and an error is returned:

```swift
API.Auth.verifyAccessToken { result in
    switch result {
    case .success(let value):
        print(value.channelID)   // Bound channel ID of the token.
        print(value.permissions) // The permissions of this token.
        print(value.expiresIn)   // How long it is before the token expires.
    case .failure(let error):
        print(error)
    }
}
```

---

# Handling errors

## Overview

The SDK handles potential errors and provides appropriate information. All
methods return a `Result` enumeration. Get the associated error from the
`.failure` case:

```swift
API.getProfile { result in
    switch result {
    case .success(let profile):
        print(profile.displayName)
    case .failure(let error):
        print(error)
        // Handle the error
    }
}
```

The printed error describes the cause in a human-readable sentence.

## Error types and error reasons

Any error reported by the SDK is a `LineSDKError` instance — an enumeration
conforming to the `Swift.Error` protocol. Members represent a reason category.
There are four defined categories of error reasons:

- `.requestFailed(reason: RequestErrorReason)` — error while creating an API
  request (invalid parameters or lack of access token).
- `.responseFailed(reason: ResponseErrorReason)` — error after receiving the
  server response (incorrect response or networking errors).
- `.authorizeFailed(reason: AuthorizeErrorReason)` — error during the
  authorization process (user cancels, ID token verification fails).
- `.generalError(reason: GeneralErrorReason)` — other general causes
  (data-string conversion failures, parameters not meeting preconditions).

Each category is associated with a detailed reason enumeration. Example of the
`ResponseErrorReason` enumeration:

```swift
public enum ResponseErrorReason {
    // Error happens in the underlying `URLSession`. Code 2001.
    case URLSessionError(Error)
    // The response is not a valid `HTTPURLResponse`. Code 2002.
    case nonHTTPURLResponse
    // Cannot parse received data to an instance of target type. Code 2003.
    case dataParsingFailed(Any.Type, Data, Error)
    // Received response contains an invalid HTTP status code. Code 2004.
    case invalidHTTPStatusAPIError(detail: APIErrorDetail)
}
```

## Getting error data

Use Swift pattern matching to extract associated data. Example — check whether
an error comes from an invalid HTTP status code:

```swift
case .failure(let error):
    if case .responseFailed(
        reason: .invalidHTTPStatusAPIError(let detail)) = error
    {
        print("HTTP Status Code: \(detail.code)")
        print("API Error Detail: \(detail.error?.detail ?? "nil")")
        print("Raw Response: \(detail.raw)")
    }
```

For an `.invalidHTTPStatusAPIError`, check `detail.code`. `500` indicates a
server error; `403` indicates the current token has insufficient permissions —
prompt the user to log in again and grant required permissions:

```swift
case .failure(let error):
    if case .responseFailed(
        reason: .invalidHTTPStatusAPIError(let detail)) = error
    {
        if detail.code == 500 {
            print("LINE API Server Error: \(String(describing: detail.error)")
        } else if detail.code == 403 {
            print("Not enough permission. Login again with required permissions?")
            // Do Login
        }
    }
```

## Using shortcuts to handle common errors

Shortcuts to identify common errors without pattern-matching:

```swift
case .failure(let error):
    if error.isUserCancelled {
        // User cancelled the login process himself/herself.

    } else if error.isPermissionError {
        // Equivalent to checking .responseFailed.invalidHTTPStatusAPIError
        // with code 403. Should login again.

    } else if error.isURLSessionTimeOut {
        // Underlying request timeout in URL session. Should try again later.

    } else if error.isRefreshTokenError {
        // User is accessing a public API with expired token, LINE SDK tried to
        // refresh the access token automatically, but failed (due to refresh token)
        // also expired. Should login again.

    } else if /* error.isXYZ other condition */ {
        // You could also extend LineSDKError to make your own shortcuts.

    } else {
        // Any other errors.
        print("\(error)")
    }
```

As a good practice, put all error handling code in a single location.

## Error code and user data

`LineSDKError` conforms to the `CustomNSError` protocol and the `LocalizedError`
protocol. Each error reason has its own `errorCode` and `errorUserInfo`
properties. For possible error codes and what they indicate, see `LineSDKError`
in the LINE SDK for iOS Swift reference.

---

# Using the SDK with Objective-C code

The SDK is written in pure Swift but can be used in Objective-C projects. Two
options.

## Option 1: Make a mixed-language project

(Recommended if you have experience with Swift and Swift/Objective-C
interoperability.) Integrate the SDK directly and use Swift to call its APIs.

Any Objective-C project can become a mixed-language project. Add Swift files
that interact with the SDK. To use Swift declarations from Objective-C, expose
them with the `@objc` or `@objcMembers` attributes. Xcode auto-generates a
bridging header when you import Swift files.

## Option 2: Use the Objective-C wrapper

Use the Objective-C wrapper provided in the SDK. Unlike option 1, you add an
additional Objective-C wrapper framework. Some features are not available with
the wrapper due to Objective-C limitations.

Type names and most SDK components are prefixed with "LineSDK" to avoid naming
conflicts. The wrapper is a **temporary** method — migrating to Swift is
recommended for full functionality.

### Installation — Prerequisites

To build and use the SDK with the Objective-C wrapper, you need:

- iOS 11.0 or later as the deployment target.
- Xcode 10 or later.

### CocoaPods

1. Add the pod to your target:
   ```ruby
   platform :ios, '11.0'
   use_frameworks!

   target '<Your App Target Name>' do
       pod 'LineSDKSwift/ObjC', '~> 5.0'
   end
   ```
2. Run:
   ```bash
   $ pod install
   ```

**Importing the SDK:** Add `@import LineSDK;`:

```objective-c
#import "ViewController.h"
@import LineSDK;

@implementation ViewController
// ...
@end
```

### Carthage

1. Install the Carthage tool via Homebrew:
   ```bash
   $ brew update
   $ brew install carthage
   ```
2. Specify the SDK's GitHub repository in your Cartfile:
   ```
   github "line/line-sdk-ios-swift" ~> 5.0
   ```
3. Build the SDK:
   ```
   $ carthage update line-sdk-ios-swift
   ```

Add the built `LineSDK.framework` and `LineSDKObjC.framework` files to your
Xcode project.

**Linking the framework files:** Drag and drop `LineSDK.framework` and
`LineSDKObjC.framework` from `Carthage/Build/iOS` to the "Link Binary With
Libraries" section on the "Build Phases" tab.

**Copying the framework files during the build phase:**

1. On "Build Phases", click **+** > **New Run Script Phase**:
   ```
   /usr/local/bin/carthage copy-frameworks
   ```
2. Add under "Input Files":
   ```
   $(SRCROOT)/Carthage/Build/iOS/LineSDK.framework
   $(SRCROOT)/Carthage/Build/iOS/LineSDKObjC.framework
   ```
3. Add under "Output Files":
   ```
   $(BUILT_PRODUCTS_DIR)/$(FRAMEWORKS_FOLDER_PATH)/LineSDK.framework
   $(BUILT_PRODUCTS_DIR)/$(FRAMEWORKS_FOLDER_PATH)/LineSDKObjC.framework
   ```

**Enabling "Always Embed Swift Standard Libraries":** In "Build Settings", set
"Always Embed Swift Standard Libraries" (`ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES`)
to "YES".

**Importing the SDK:** Add `@import LineSDKObjC;`:

```objective-c
#import "ViewController.h"
@import LineSDKObjC;

@implementation ViewController
// ...
@end
```

### Naming conventions — code samples

**Logging in users with multiple permissions:**

```objective-c
NSSet *permissions = [NSSet setWithObjects:
                          [LineSDKLoginPermission profile],
                          [LineSDKLoginPermission openID],
                          nil];
[[LineSDKLoginManager sharedManager]
    loginWithPermissions:permissions
        inViewController:self
              parameters:nil
       completionHandler:^(LineSDKLoginResult *result, NSError *error) {
           if (result) {
               NSLog(@"User Name: %@", result.userProfile.displayName);
           } else {
               NSLog(@"Error: %@", error);
           }
       }
 ];
```

**Getting user profiles:**

```objective-c
[LineSDKAPI getProfileWithCompletionHandler:
    ^(LineSDKUserProfile * _Nullable profile, NSError * _Nullable error)
{
    if (profile) {
        NSLog(@"User Name: %@", profile.displayName);
    } else {
        NSLog(@"Error: %@", error);
    }
}];
```

### Handling errors with the Objective-C wrapper

The wrapper throws `NSError` objects. Check whether an error is from the SDK:

```objective-c
NSError *error = // ... An error from LINE SDK ObjC Wrapper
if ([error.domain isEqualToString:[LineSDKErrorConstant errorDomain]]) {
    // SDK Error
}
```

Errors thrown by the wrapper have the same `code` and `userInfo` as those thrown
by the original SDK:

```objective-c
if (error.code == 2004) {
    // invalidHTTPStatusAPIError
    NSNumber *statusCode = error.userInfo[[LineSDKErrorConstant userInfoKeyStatusCode]];
    if ([statusCode integerValue] == 403) {
        // Permission granting issue. Ask for authorization with enough permission again.
    }
}
```

---

# Upgrading the SDK (v4 → v5)

## Upgrading to the latest SDK

`5.0.0` is the first version of the LINE SDK for iOS Swift. It is **not
compatible** with the legacy Objective-C versions. You must change some code if
upgrading.

> **Note:** The new SDK is designed for Swift projects but can still be used with
> Objective-C code. See "Using the SDK with Objective-C code".

It is recommended to remove all old-SDK code and perform a clean installation
(see "Setting up your project"). To make changes based on your current
implementation, general steps:

1. Remove the old `LineSDK.framework` file.
   - For CocoaPods/Carthage: remove the "LineSDK" entry from Podfile/Cartfile,
     then perform a clean installation.
   - For a downloaded binary: remove it from your project.
2. Clean up your `Info.plist` — safely remove the `LineSDKConfig` entry (not
   needed anymore).
3. Install the LINE SDK for iOS Swift.
4. Set up the channel ID and callback handling in `AppDelegate`:
   ```swift
   func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
       // Add this to your "didFinishLaunching" delegate method.
       LoginManager.shared.setup(channelID: "YOUR_CHANNEL_ID", universalLinkURL: nil)

       return true
   }
   ```
   Update the open URL handling:
   ```swift
   func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
       return LoginManager.shared.application(app, open: url, options: options)
   }
   ```

> **Note — Logging in users into your app through LINE:** Access tokens issued by
> the LINE SDK version 4.x are **not usable with version 5.x**. If you upgrade,
> all users need to log in again before your app can access the LINE Platform.

## Updating your code (old vs new)

### Logging in

**Previous:**

```swift
// First set the delegate to the current object
LineSDKLogin.sharedInstance().delegate = self
LineSDKLogin.sharedInstance().start()

// MARK: LineSDKLoginDelegate

func didLogin(_ login: LineSDKLogin, credential: LineSDKCredential?, profile: LineSDKProfile?, error: Error?) {

    if let error = error {
        print("LINE Login Failed with Error: \(error.localizedDescription) ")
        return
    }

    print("LINE Login Succeeded")
}
```

**Now:**

```swift
LoginManager.shared.login(permissions: [.profile]) {
    result in
    switch result {
    case .success(let loginResult):
        print("User name: \(loginResult.userProfile?.displayName ?? "nil")")
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### Getting user profiles

**Previous:**

```swift
var apiClient: LineSDKAPI
apiClient = LineSDKAPI(configuration: LineSDKConfiguration.defaultConfig())

apiClient.getProfile(queue: .main) {
    (profile, error) in

    if let error = error {
        print("Error getting profile \(error.localizedDescription)")
    }

    print(profile?.displayName ?? "none")
    print(profile?.pictureURL ?? "none")
    print(profile?.statusMessage ?? "none")
    print(profile?.userID ?? "none")
}
```

**Now:**

```swift
API.getProfile { result in
    switch result {
    case .success(let profile):
        print("User name: \(profile.displayName)")
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### Logging out users

**Previous:**

```swift
var apiClient: LineSDKAPI
apiClient = LineSDKAPI(configuration: LineSDKConfiguration.defaultConfig())

apiClient.logout(queue: .main) {
    (success, error) in

    if success {
        print("Logout Succeeded")
    }
    else {
        print("Logout Failed \(error?.localizedDescription as String?)")
    }
}
```

**Now:**

```swift
LoginManager.shared.logout { result in
    switch result {
    case .success:            print("Logout Succeeded")
    case .failure(let error): print("Logout Failed: \(error)")
    }
}
```

### Getting the current access token

**Previous:**

```swift
var apiClient: LineSDKAPI
apiClient = LineSDKAPI(configuration: LineSDKConfiguration.defaultConfig())

let myToken = apiClient.currentAccessToken()
```

**Now:**

```swift
let token = AccessTokenStore.shared.current?.value
```

### Verifying access tokens

**Previous:**

```swift
var apiClient: LineSDKAPI
apiClient = LineSDKAPI(configuration: LineSDKConfiguration.defaultConfig())

apiClient.verifyToken(queue: .main) {
    (result, error) in

    if let error = error {
        print("Token is Invalid: \(error.localizedDescription)")
        return
    }

    guard let result = result, let permissions = result.permissions else {
        print("Response result is null")
        return
    }
    print("Token is Valid")
}
```

**Now:**

```swift
API.Auth.verifyAccessToken { result in
    switch result {
    case .success: print("Token is valid.")
    case .failure(let error): print("Error: \(error)")
    }
}
```

This section doesn't cover all SDK functionality, but corresponding types follow
similar conventions. A sample app compatible with the latest SDK is in the
open-source repository.
