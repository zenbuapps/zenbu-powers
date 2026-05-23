# LINE SDK for Unity

Source:
- `https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/overview/`
- `https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/project-setup/`
- `https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/try-line-login/`
- `https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/integrate-line-login/`
- `https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/using-sdk/`

## Table of contents

- Overview & features
- Setting up your project (Unity / iOS / Android requirements)
- Trying the starter app
- Integrating LINE Login (importing the package, LineSDK prefab, player settings, implementing login)
- Using LINE SDK for other APIs and result handling (errors, profile, logout, token get/verify/refresh)

---

# Overview

The LINE SDK for Unity provides a modern way of implementing the LINE Platform
APIs for Unity games.

The LINE SDK for Unity is a **wrapper for the LINE SDK for iOS Swift and the
LINE SDK for Android**. It provides the following features in a Unity game
running on iOS or Android:

- **User authentication** — users log in with their LINE accounts. If already
  logged in to LINE on the device, they log in automatically.
- **Utilizing user data with OpenID support** — get the user's LINE profile. The
  SDK supports OpenID Connect 1.0; get ID tokens containing the user's LINE
  profile when you retrieve the access token.
- **API calls** — methods to get user profile information, log out users, manage
  access tokens.
- **Open-sourced SDK** — repository: `https://github.com/line/line-sdk-unity`.

**High-level steps:** (1) Create a channel. (2) Use the SDK to add LINE Login
support to your Unity game (see "Integrating LINE Login with your Unity game").
(3) Make API calls from your app using the SDK, or from server-side code through
the LINE Login API (see the LINE SDK for Unity API reference and the LINE Login
v2.1 API reference).

---

# Setting up your project

The LINE SDK for Unity provides an interface for using the LINE SDK on either
iOS or Android. To use the LINE SDK in Unity Editor and export it to a platform,
your development environment needs a few things.

## Unity requirements

- Unity 2020.3.15 or later, with iOS and Android modules installed.
- A valid subscription for Unity Personal, Unity Plus, or Unity Pro.

## Installation on iOS

To integrate the LINE SDK for Unity on iOS, you need:

- iOS 13.0 or higher as the deployment target.
- Xcode 14.1 or higher.

On iOS, the LINE SDK for Unity works as a wrapper for the LINE SDK for iOS
Swift. It adds the necessary libraries when you export your project to Xcode.

## Installation on Android

You must have the Android SDK installed, because Unity will use it to build your
project to the Android platform. If you have previously configured Unity for
Android development, you already have the Android SDK.

---

# Trying the starter app

The LINE Login starter app for Unity lets you quickly see how LINE Login works
in a Unity game.

**Prerequisites:** Before building and running the starter app, follow the
"Setting up your project" guide to set up your environment for Unity, iOS, and
Android.

## Trying the starter app with the predefined sample channel

1. Clone the open-source repository:
   ```sh
   $ git clone https://github.com/line/line-sdk-unity.git
   ```
2. In Unity, open the project in the folder `LINE_SDK_Unity`.
3. Build and export the scene under `Assets/LineSDK/Demo/Scenes/Main` to either
   iOS or Android.
4. Install the exported project/binary to your device.

> **Note:** You may need to modify the certification to install the sample app
> to an iOS device. If you do not have one, go to **Player Settings** >
> **Settings for iOS** > **Other Settings** and set **Target SDK** to
> **Simulator SDK**, then run the sample app on an iOS simulator.

## Trying the starter app with your own channel

You can link the starter app to your own channel. If you don't have a channel,
create one (and select or create a provider). Make these changes in your Unity
project:

1. Select **File > Build Settings**.
2. Click **Player Settings**.
3. Select the iOS settings tab > **Other Settings**, and set **Bundle
   Identifier** to the same value as **iOS bundle ID** in the **LINE Login** tab
   of your LINE Login channel in the LINE Developers Console.
4. In the next two fields — **Product Name** and the Android settings tab >
   **Other Settings** > **Package Name** — set the same value as **Android
   Package Name** in the **LINE Login** tab of your channel.
5. From the main page, select the **LineSDK** object.
6. Enter your LINE Login channel ID in the **Channel ID** field under **Line SDK
   (Script)**.

**Running:** Run on an iOS/Android device or Simulator. The first login requires
agreeing to let the app access your profile information. Tap **Log in with
LINE** for app-to-app login. If LINE is installed and you're logged in, login is
automatic; otherwise login happens in the browser with credentials.

Features available to general users: log out user, get user profile, verify
access token, get the friendship status between a linked LINE Official Account
and the user. Other features are limited-user only.

---

# Integrating LINE Login with your Unity game

After setting up your project, you can import the LINE SDK for Unity into your
existing Unity game.

## Getting the SDK

### Download from GitHub

To get the latest LINE SDK for Unity, download the `.unitypackage` file from the
GitHub Releases page: `https://github.com/line/line-sdk-unity/releases`.

### Import into your project

> **Note:** Before you import the LINE SDK for Unity into your project, backup
> your project and/or store it in a version control system.

With your Unity project open, double-click on the downloaded `.unitypackage`
file. Import everything in the package.

## Add LineSDK prefab to your scene

After importing the package, in your **Project** panel, find a **LineSDK** prefab
under `Assets/LineSDK/`. Drag it to the **Hierarchy** panel of the scene to which
you want to add LINE Login.

Then click on the LineSDK GameObject in the scene, and update the **Channel ID**
field with your LINE Login channel ID. Find your LINE Login channel ID in the
LINE Developers Console; if you don't have a channel, create one (and select or
create a provider).

## Update player settings

Before implementing LINE Login or using LINE APIs, make sure your project player
setting is correct.

### Settings for Android export

1. Select **File > Build Settings**.
2. Click **Player Settings**.
3. Set **Company Name** and **Product Name** to the same value as **Package
   names** in your channel settings in the LINE Developers Console (**LINE
   Login** tab).
4. Select the Android settings tab > **Other Settings**.
5. Set **Package Name** to the same value as **Package names** in the **LINE
   Login** tab of your channel.
6. Set **Minimum API Level** to at least **API level 19**.
7. Under **Publishing Settings**, enable **Custom Gradle Template**.

### Settings for iOS export

1. Select **File > Build Settings**.
2. Click **Player Settings**.
3. Select the iOS settings tab > **Other Settings**.
4. Set **Bundle Identifier** to the same value as **iOS bundle ID** in the **LINE
   Login** tab of your channel.
5. Set **Target minimum iOS Version** to at least `11.0`.

## Implement login with LINE

Implement login with LINE in the scene where the LineSDK GameObject exists. For
example:

```csharp
using Line.LineSDK;

public class MyController : MonoBehaviour {
    public void LoginButtonClicked() {
        var scopes = new string[] {"profile", "openid"};
        LineSDK.Instance.Login(scopes, result => {
            result.Match(
                value => {
                    Debug.Log("Login OK. User display name: " + value.UserProfile.DisplayName);
                },
                error => {
                    Debug.Log("Login failed, reason: " + error.Message);
                }
            );
        });
    }
}
```

> The LINE SDK for Unity supports only iOS and Android for now. It will always
> return an error if you run it in Unity Editor play mode. To test it, export
> your scene to an iOS or Android device.

---

# Using LINE SDK for other APIs and result handling

## Calling LINE APIs with result handling

Every LINE SDK for Unity API operation that can fail provides a `Result` object
in the callback. By checking the result value, you handle both the success and
failure cases:

```csharp
LineSDK.Instance.Login(scopes, result => {
    result.Match(
        value => {
            Debug.Log("Login OK");
        },
        error => {
            Debug.Log("Login failed, error code: " + error.Code);
        }
    );
});
```

In the `error` branch, every `Error` object contains an error `Code`. **The
error code is different for each platform.** See the iOS Swift and Android error
handling pages for the per-platform codes:

- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/swift/error-handling/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/handling-errors/`
- Swift error reference: `LineSDKError`
- Android error reference: `LineApiResponseCode`

## Getting user profile

If the login request includes the `profile` scope, you can get the user's LINE
profile information (user ID, display name, profile media, status message). Call
`LineAPI.GetProfile`:

```csharp
LineAPI.GetProfile(result => {
    result.Match(
        value => {
            Debug.Log("User ID: " + value.UserId);
            Debug.Log("User Display Name: " + value.DisplayName);
            Debug.Log("User Status Message: " + value.StatusMessage);
            Debug.Log("User Icon: " + value.PictureUrl);
        },
        error => {
            Debug.Log(error.Message);
        }
    );
});
```

## Logging out users

Call the `Logout` method to invalidate a user's access token and log them out.
After logout, the user must go through login again:

```csharp
LineSDK.Instance.Logout(result => {
    result.Match(
        _ => { /* User logout done. Update UI. */ },
        error => {
            Debug.Log(error.Message);
        }
    );
});
```

## Getting access token

Server-side code can make LINE Login API calls using access tokens (see the LINE
Login v2.1 API reference). To get the current access token, get the
`CurrentAccessToken` property of the `LineSDK` instance:

```csharp
var currentToken = LineSDK.Instance.CurrentAccessToken;
if (currentToken != null) {
    Debug.Log("Current token value: " + currentToken.Value);
}
```

> **Note:** When sending access tokens to your server, encrypt the access token
> and use SSL to send the encrypted data. Verify that the access token received
> by your server matches the access token used to call LINE Login, and that the
> channel ID matches the one for your channel.

## Verify and refresh access tokens

`CurrentAccessToken` doesn't ensure the access token is valid, even if it returns
a non-null value — the token might already be expired or revoked. Use
`LineAPI.VerifyToken` to check whether the current access token is still valid:

```csharp
LineAPI.VerifyAccessToken(result => {
    result.Match(
        value => {
            Debug.Log("Channel Id bound to the token: " + value.ChannelId);
        },
        error => {
            Debug.Log("The token verifying failed: " + error.Message);
        }
    );
});
```

When making an API request through `LineAPI`, the LINE SDK automatically
refreshes any expired access token. However, the refresh operation fails if the
token has been expired for a long time — an error occurs and the user must log
in again.

Refreshing access tokens yourself is **not recommended** — it's easier and safer
to let the SDK manage them. If necessary, manually refresh:

```csharp
LineAPI.RefreshAccessToken(result => {
    result.Match(
        token => {
            Debug.Log("Token refreshed. New token: " + token.Value);
        },
        error => {
            Debug.Log("Something wrong when refreshing token: " + error.Message);
        }
    );
});
```
