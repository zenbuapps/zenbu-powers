# LINE SDK for Flutter & SDK Release Notes

Source:
- `https://developers.line.biz/en/docs/line-login-sdks/flutter-sdk/`
- `https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/release-notes/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/release-notes/`
- `https://developers.line.biz/en/docs/line-login-sdks/unity-sdk/release-notes/`

## Table of contents

- LINE SDK for Flutter
- Release notes for LINE SDK for iOS
- Release notes for LINE SDK for Android
- Release notes for LINE SDK for Unity

---

# LINE SDK for Flutter

The LINE SDK for Flutter is a [Flutter](https://flutter.dev/) plugin that lets
you access the functions of the [LINE SDK for iOS](https://developers.line.biz/en/docs/line-login-sdks/ios-sdk/)
and the [LINE SDK for Android](https://developers.line.biz/en/docs/line-login-sdks/android-sdk/)
in Flutter apps with [Dart](https://dart.dev/).

The plugin helps you integrate LINE Login features in your app. You can redirect
users to LINE or a web page where they log in with their LINE credentials.

## GitHub repository

The LINE SDK for Flutter is an open-source project. The code and README are on
GitHub: `https://github.com/line/flutter_line_sdk/`.

## API reference

All classes and methods are documented on the Dart packages website:
`https://pub.dev/documentation/flutter_line_sdk/latest/flutter_line_sdk/`

> The Flutter SDK is a wrapper, like the Unity SDK — it delegates to the native
> iOS and Android SDKs and therefore runs only on iOS/Android targets. The
> complete API surface (the `LineSDK` Dart class, `login`, `getProfile`,
> `getCurrentAccessToken`, `verifyAccessToken`, `refreshToken`, `logout`, the
> `LoginResult` / `UserProfile` / `AccessToken` / `LineSdkError` Dart types) is
> documented on the linked pub.dev pages — the LINE Developers docs section
> itself only provides the overview above and points to pub.dev for the full
> reference.

---

# Release notes for LINE SDK for iOS

> Release notes for LINE SDK for iOS **version 5.0.0 or later** are available on
> the GitHub repository. See "Releases" at `https://github.com/line/line-sdk-ios-swift/releases`.

## November 20, 2018 — LINE SDK 5.0.0 for iOS released

For installation and usage instructions, see the LINE SDK for iOS guide.

**Changes:**

- **LINE Login v2.1 and Social API v2.1 are supported.** You can set permissions
  to be granted to your app as scopes when users log in with LINE Login. By
  setting scopes, you can get ID tokens when you get access tokens — those
  tokens contain user data according to the scopes set with the login request.
  You can display an option to add your bot as a friend to users logging in to
  your app. You can get the friendship status between users and your bot with
  login responses and the Social API.
- **New SDK version in Swift.** Developed in Swift, the LINE SDK for iOS Swift
  provides a modern way of implementing LINE APIs. The LINE SDK 5.0.0 for iOS
  Objective-C is the last version of the Objective-C SDK.
- **Open-source SDK.** The LINE SDK for iOS Swift is open-sourced.
- **Detailed reference.** Detailed reference based on the source code is
  available: LINE SDK for iOS Swift reference and LINE SDK for iOS Objective-C
  reference.

## April 13, 2018 — LINE SDK 4.1.1 for iOS released

**Changes:** Fixed an issue that the `LineSDKLogin` object has the access token
in cache even after logout.

## January 29, 2018 — LINE SDK 4.1.0 for iOS released

**Changes:** The web login process now uses a Safari View Controller instead of
an external browser.

## March 22, 2017 — LINE SDK for iOS CocoaPod released

The LINE SDK for iOS is now on CocoaPods. You can download it using CocoaPods for
Objective-C and Swift projects.

## January 27, 2017 — LINE SDK 4.0.1 for iOS released

**Changes:** Fixed an issue which causes an authentication error when using Web
Login.

## December 13, 2016 — Change to requirement on whitelisting LINE domains

Whitelisting LINE domains is no longer a requirement for using the LINE SDK for
iOS. The documentation on whitelisting LINE domains in the "Settings for iOS 9 or
later" section has been removed.

## October 7, 2016 — LINE SDK 3.2.1 for iOS released

**Changes:**

- `LineAdapter+Login.framework` and `LineAdapterUI.framework` merged to
  `LineAdapter.framework`.
- Definition changed for swift.

The LINE SDK starter application was revised for compatibility. Repository:
`https://github.com/line/line-sdk-starter-ios`.

---

# Release notes for LINE SDK for Android

> Release notes for LINE SDK for Android **version 5.0.0 or later** are available
> on the GitHub repository. See "Releases" at `https://github.com/line/line-sdk-android/releases`.

## November 30, 2018 — LINE SDK 4.0.10 for Android released

**Changes:** Fixed an issue where an activity is not found when authenticating
with LINE Login after LINE is invalidated on the device.

## November 20, 2018 — LINE SDK 5.0.0 for Android released

For installation and usage instructions, see the LINE SDK for Android guide.

**Changes:**

- **LINE Login v2.1 and Social API v2.1 are supported.** You can set permissions
  to be granted to your app as scopes when users log in with LINE Login. By
  setting scopes, you can get ID tokens when you get access tokens — those
  tokens contain user data according to the scopes set with the login request.
  You can display an option to add your bot as a friend to users logging in to
  your app. You can get the friendship status between users and your bot with
  login responses and the Social API.
- **Open-source SDK.** From version 5.0.0, the LINE SDK for Android is
  open-sourced.
- **Detailed reference.** Detailed reference based on the source code is
  available: LINE SDK for Android reference.

## March 12, 2018 — LINE SDK 4.0.8 for Android released

**Changes:** Fixed an infinite loading indicator problem that occurs if the user
attempts to log in before LINE has been opened for the first time.

## February 6, 2018 — LINE SDK 4.0.7 for Android released

**Changes:** Fixed a crash that occurs if the user exits LINE using the home
button and then opens the SDK app before LINE finishes the authentication
process.

## September 29, 2017 — LINE SDK 4.0.6 for Android released

**Changes:** Fixed an infinite loading indicator problem that occurs when the
user presses the back button while LINE's passcode prompt is on screen.

## June 2, 2017 — LINE SDK 4.0.5 for Android released

**Changes:** Fixed an issue where a runtime error occurs upon calling
`startActivityForActivity` with a login intent when using appcompat version
25.0.0 or higher.

## April 26, 2017 — LINE SDK 4.0.4 for Android released

**Changes:**

- Made a minor change to the SDK's authentication logic to fix a problem where
  `onActivityResult` does not get executed during app-to-app login.
- Fixed a known issue in 4.0.2 where `onActivityResult` returns a result of
  "CANCEL" on the first time that a user logs into an application using
  app-to-app login.

## April 10, 2017 — LINE SDK 4.0.2 for Android released

**Changes:** Fixed an issue where browser login fails with an `INTERNAL_ERROR`
on Android 4.x devices.

**Known issues:** On Android 4.x devices, `onActivityResult` returns a result of
"CANCEL" the first time that a user logs into an application using the
app-to-app login. The user will be able to successfully log in from their second
attempt. This issue is caused by a problem in LINE and will be resolved in a
future update.

## October 14, 2016 — LINE SDK 3.1.21 for Android released

**Changes:** Updated to prevent build warnings.

## October 11, 2016 — LINE SDK 3.1.20 for Android released

**Changes:** Updated build with Java 1.7 for compatibility.

## March 15, 2016 — LINE SDK 3.1.19 for Android released

**Changes:** Fixed login error issue when user attempts to login again.

## March 9, 2016 — LINE SDK 3.1.18 for Android released

**Changes:**

- Added support for 64-bit architecture.
- Added the `locale` property to the login method.
- Fixed some bugs.

---

# Release notes for LINE SDK for Unity

> Release notes for LINE SDK for Unity **version 1.0.0 or later** are available
> on the GitHub repository. See "Releases" at `https://github.com/line/line-sdk-unity/releases`.

## February 26, 2019 — LINE SDK 1.0.0 for Unity released

The LINE SDK for Unity was released. Download the SDK from GitHub.
