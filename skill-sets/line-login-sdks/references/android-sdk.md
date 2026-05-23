# LINE SDK v5 for Android

Source:
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/overview/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/try-line-login/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/integrate-line-login/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/link-a-bot/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/managing-users/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/managing-access-tokens/`
- `https://developers.line.biz/en/docs/line-login-sdks/android-sdk/handling-errors/`

## Table of contents

- Overview & features
- Trying the sample app
- Integrating LINE Login (prerequisites, dependency, manifest, channel linking, login button, starting login, handling the result, `LineApiClient`)
- Enabling the add friend option
- Managing users (profile, ID token, logout)
- Managing access tokens (refresh, get, verify)
- Handling errors (response codes)

---

# Overview

The LINE SDK for Android provides a modern way of implementing the LINE Platform
APIs.

**Features:**

- **User authentication** — users log in with their LINE accounts. If already
  logged in to LINE on the device, they log in automatically.
- **Utilizing user data with OpenID support** — get the user's LINE profile. The
  SDK supports OpenID Connect 1.0; get ID tokens containing the user's LINE
  profile when you retrieve the access token.
- **API calls** — methods to get user profile information, log out users, manage
  access tokens.
- **Open-source SDK** — repository: `https://github.com/line/line-sdk-android`.

**High-level steps:** (1) Create a channel. (2) Use the SDK to add LINE Login
support (see "Integrating LINE Login with your Android app"; for the add friend
option see "Enabling the add friend option with the SDK"). (3) Use LINE Login —
client-side via Managing users; server-side via Managing access tokens + the
LINE Login v2.1 API reference.

---

# Trying the sample app

The LINE Login sample app for Android demonstrates how LINE Login works.

**Prerequisites:** Android Studio installed.

### Trying the sample app

1. Clone the open-source repository:
   ```sh
   $ git clone https://github.com/line/line-sdk-android.git
   ```
2. Open the LINE SDK project in Android Studio.
3. Build the project and run the app using an Android device or Android
   Emulator.

> **Tip:** The sample app has already defined its own sample channel id, and its
> value is `1620019587`. You don't need to set it again.

**Running:** Run on an Android device or Emulator. The first login requires
agreeing to let the app access your profile information.

- **"Log in with LINE" button** — the green button is the SDK's built-in login
  button; logs in using app-to-app login. If LINE is installed and you're logged
  in, login is automatic; otherwise login happens in the device browser with
  credentials.
- **"login" button** — triggers the LINE app-to-app login process; same as the
  built-in button but with adjustable options such as Scopes. Refer to the
  `getLoginIntent` method of `LineLoginApi`. The default Scopes used are
  `PROFILE` and `OPENID_CONNECT`.
- **"web login" button** — opens a LINE login webpage in the browser.
- **"logout" button** — logs out the current user.

Once logged in, the **API List Page** lets you try: getting user profiles,
getting the current access token, refreshing access tokens, verifying access
tokens, and using LINE Login to get friendship status.

---

# Integrating LINE Login with your Android app

## Prerequisites

To build and use the LINE SDK for Android, you need:

- A provider and a LINE Login channel (create both in the LINE Developers
  Console).
- To set `minSdkVersion` to 24 or higher (Android 7.0 or later).

> **Tip — Set minSdkVersion to earlier than 24 (earlier than Android 7.0):** Use
> an earlier version of the LINE SDK for Android. See the GitHub Releases page.

> **Note — Resource naming conflicts:** Don't use resource IDs that start with
> `linesdk_` as this may cause conflicts with the resources in the SDK.

## Upgrading from earlier SDK versions

If upgrading from LINE SDK v4.x or earlier, the current version has these major
differences:

- When starting login, you must specify Scopes to determine which user data your
  app can access.
- If you specify the `OPENID_CONNECT` scope during login, you can get an ID
  token to securely verify the user's identity.

## Add LINE SDK dependency

### Import the library into your project

Add the LINE SDK dependency in your module-level `build.gradle` file (latest
version is on Maven Central, group `com.linecorp.linesdk`, artifact `linesdk`):

```groovy
repositories {
   ...
   mavenCentral()
}

dependencies {
    ...
    implementation 'com.linecorp.linesdk:linesdk:latest.release'
    ...
}
```

### Add Android compilation options

Enable Java 1.8 support. In the same `build.gradle` file:

```
android {
...
  compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
...
}
```

## Setting the Android manifest file

Add the `INTERNET` permission to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

> **Note:** Make sure the launch mode of the activity making the login call is
> not set to `singleInstance`, as that may prevent the activity from receiving
> the `onActivityResult` callback.

## Linking your app to your channel

Enable **Mobile app** on the **LINE Login** tab of your channel settings in the
LINE Developers Console, and complete these fields:

- **Package names:** Required. Application's package name used to launch the
  Google Play store.
- **Package signatures:** Optional. You can set multiple signatures, one per
  line.
- **Android URL scheme:** Optional. Custom URL scheme used to launch your app.

### Set Package Signatures

Package signatures enhance authentication interactions between your app and the
LINE app. There are two types: debug and release. These relate to the key hash
in SHA-1 format.

**Debug package signature** — generated from a Debug certificate automatically
generated by Android Studio:

```bash
# For macOS
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1

# For Windows
keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -storepass android -keypass android | openssl sha1
```

**Release package signature** — generated from a Release certificate. Replace
`<RELEASE_KEY_ALIAS>` and `<RELEASE_KEY_PATH>` with your actual values:

```bash
keytool -exportcert -alias <RELEASE_KEY_ALIAS> -keystore <RELEASE_KEY_PATH> | openssl sha1
```

**Using the Google Play Console to get Release key hash:** If you use Play App
Signing, use the SHA-1 certificate fingerprint from the Google Play Console
instead of generating a Release key hash on the Terminal. In the Google Play
Console, navigate to **Setup** > **App signing**, then copy the SHA-1
certificate fingerprint.

## Adding the LINE Login button

Two ways to add a login button: use the SDK's built-in login button, or use a
customized login button.

### Use the LINE SDK's built-in login button

1. Add the login button in your layout XML file:
   ```xml
   <com.linecorp.linesdk.widget.LoginButton
       android:id="@+id/line_login_btn"
       android:layout_width="match_parent"
       android:layout_height="wrap_content" />
   ```
2. Find the view in your activity or fragment, set up parameters, and assign a
   listener:
   ```java
   import java.util.Arrays;

   // A delegate for delegating the login result to the internal login handler.
   private LoginDelegate loginDelegate = LoginDelegate.Factory.create();

   LoginButton loginButton = rootView.findViewById(R.id.line_login_btn);

   // if the button is inside a Fragment, this function should be called.
   loginButton.setFragment(this);

   loginButton.setChannelId(channelIdEditText.getText().toString());

   // configure whether login process should be done by Line App, or inside WebView.
   loginButton.enableLineAppAuthentication(true);

   // set up required scopes and nonce.
   loginButton.setAuthenticationParams(new LineAuthenticationParams.Builder()
           .scopes(Arrays.asList(Scope.PROFILE))
           // .nonce("<a randomly-generated string>") // nonce can be used to improve security
           .build()
   );
   loginButton.setLoginDelegate(loginDelegate);
   loginButton.addLoginListener(new LoginListener() {
       @Override
       public void onLoginSuccess(@NonNull LineLoginResult result) {
           Toast.makeText(getContext(), "Login success", Toast.LENGTH_SHORT).show();
       }

       @Override
       public void onLoginFailure(@Nullable LineLoginResult result) {
           Toast.makeText(getContext(), "Login failure", Toast.LENGTH_SHORT).show();
       }
   });
   ```

### Use a customized login button

Customize your user interface and login process with your own code.

**Download and add the images:** The LINE Login button image set includes images
for iOS, Android, and desktop. The Android image set includes images for
multiple screen densities and button states.

1. Download and extract the LINE Login button images.
2. Add the "base" and "pressed" login button images to the `drawable` folder for
   each screen density.

**Configure the images:** Add the login button text you want (see "LINE Login
button design guidelines"). Define stretchable regions of the image.

1. Create 9-patch files for each image and define the stretchable regions for
   the login button text.
2. Add the button to the login screen as a clickable text view with your login
   button text.
3. Add selector XML files in your drawable folders to define the image
   corresponding to the state of the text view.

## Starting the login activity

When a user taps the login button, your app calls `getLoginIntent()` to get the
login intent and start the login activity. The context and channel ID must be
passed. If LINE is installed, LINE opens to perform login without asking for
credentials. If not, users are redirected to the LINE Login screen in a browser.

1. Set an on-click listener to listen for the button tap.
2. In the `onClick` callback, call `getLoginIntent()` in `LineLoginApi` to get
   the login intent.
3. Start authentication by calling `startActivityForResult()` and passing the
   login intent and request code (an integer to identify the request).

```java
private static final int REQUEST_CODE = 1;
...

final TextView loginButton = (TextView) findViewById(R.id.login_button);
loginButton.setOnClickListener(new View.OnClickListener() {

    public void onClick(View view) {
        try {
            // App-to-app login
            Intent loginIntent = LineLoginApi.getLoginIntent(
              view.getContext(),
              Constants.CHANNEL_ID,
              new LineAuthenticationParams.Builder()
                .scopes(Arrays.asList(Scope.PROFILE))
                        // .nonce("<a randomly-generated string>") // nonce can be used to improve security
                .build());
            startActivityForResult(loginIntent, REQUEST_CODE);
        }
        catch(Exception e) {
            Log.e("ERROR", e.toString());
        }
    }
});
```

> **Note:** If you don't want to use app-to-app login and instead have the user
> log in via the LINE Login screen in a browser, use the
> `getLoginIntentWithoutLineAppAuth()` method.

## Handling the login result

After login, the result is returned in the activity's `onActivityResult()`
method. Override it to handle the result. Use `getResponseCode()` of
`LineLoginResult` to determine success — if it returns `SUCCESS`, login
succeeded; any other value indicates failure (see "Handling errors").

```java
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode != REQUEST_CODE) {
        Log.e("ERROR", "Unsupported Request");
        return;
    }

    LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);

    switch (result.getResponseCode()) {

        case SUCCESS:
            // Login successful
            String accessToken = result.getLineCredential().getAccessToken().getTokenString();

            Intent transitionIntent = new Intent(this, PostLoginActivity.class);
            transitionIntent.putExtra("line_profile", result.getLineProfile());
            transitionIntent.putExtra("line_credential", result.getLineCredential());
            startActivity(transitionIntent);
            break;

        case CANCEL:
            // Login canceled by user
            Log.e("ERROR", "LINE Login Canceled by user.");
            break;

        default:
            // Login canceled due to other error
            Log.e("ERROR", "Login FAILED!");
            Log.e("ERROR", result.getErrorData().toString());
    }
}
```

### Get the access token

The login result contains a `LineCredential()` object with the user's access
token:

```java
String accessToken = result.getLineCredential().getAccessToken().getTokenString();
```

### Get user profile immediately after login

The SDK automatically gets a user's profile information upon login (display
name, user ID, status message, profile media URL). Access it via
`getLineProfile()` of `LineLoginResult`:

```java
transitionIntent.putExtra("display_name", result.getLineProfile().getDisplayName());
transitionIntent.putExtra("status_message", result.getLineProfile().getStatusMessage());
transitionIntent.putExtra("user_id", result.getLineProfile().getUserId());
transitionIntent.putExtra("picture_url", result.getLineProfile().getPictureUrl().toString());
```

The user ID is only unique to an individual provider. The same LINE user has a
different user ID for different providers — avoid using it across providers.

### Using user data on your server

> **Warning — User impersonation:** Do not trust user IDs, or other information
> in the `LineProfile` object, when sent by a client to your backend server. A
> malicious client can send an arbitrary user ID or malformed information to
> impersonate a user. Instead, the client should send the server an access
> token, and the server should use the token to retrieve user data.

The client should send an access token; the server uses it to securely verify
the user's identity against the LINE Platform's server. Server-side APIs:
Verify access token validity; Get user profile (LINE Login v2.1 API reference).

## Using the `LineApiClient` interface

Use the SDK by calling the methods of the `LineApiClient` interface. Create a
static variable of a `lineApiClient` object and initialize it.

1. Create a static variable of the object:
   ```java
   private static LineApiClient lineApiClient;
   ```
2. Initialize the `lineApiClient` variable in your activity's `onCreate()`
   method. The channel ID and the context are required:
   ```java
   LineApiClientBuilder apiClientBuilder = new LineApiClientBuilder(getApplicationContext(), "your channel id here");
   lineApiClient = apiClientBuilder.build();
   ```

> **Note:** All methods in the LINE SDK for Android perform network operations
> and will cause `NetworkOnMainThreadExceptions` if called on the main thread.
> To avoid this, call the methods using `AsyncTask`.

---

# Enabling the add friend option with the SDK

You can display an option to add the LINE Official Account as a friend when a
user logs in. This is the **add friend option**. See "Add a LINE Official
Account as a friend when logged in (add friend option)" in the LINE Login docs
for: linking a LINE Official Account with your channel, the bot prompt parameter
and its behavior, and the friendship status flag.

## Setting the bot prompt parameter in the login request

Set the `botPrompt` parameter when using the `LoginButton` widget:

```java
...
LoginButton loginButton = rootView.findViewById(R.id.line_login_btn);

loginButton.setAuthenticationParams(new LineAuthenticationParams.Builder()
        .scopes(Arrays.asList(Scope.PROFILE))
        .botPrompt(BotPrompt.normal) // configure it here
        .build()
);
...
```

Set the `botPrompt` parameter when using the `LoginApi.getLoginIntent()` method:

```java
Intent loginIntent = LineLoginApi.getLoginIntent(
    view.getContext(),
    Constants.CHANNEL_ID,
    new LineAuthenticationParams.Builder()
            .scopes(Arrays.asList(Scope.PROFILE))
            .botPrompt(BotPrompt.normal) // configure it here
            .build());

startActivityForResult(loginIntent, REQUEST_CODE);
```

See `LineAuthenticationParams.BotPrompt` in the LINE SDK for Android reference.

## Checking the friendship status between the user and the LINE Official Account

Two methods: check the `LineLoginResult` object in the login response, or use
LINE Login to get friendship status.

### Check the `LineLoginResult` object in the login response

After successful login, `LineLoginResult` contains a boolean indicating whether
the friendship status changed; get it with `getFriendshipStatusChanged()`. To
get the flag:

- The `botPrompt` parameter must be specified with the `LineAuthenticationParams`
  object in the login request.
- The consent screen with the add-friend option must be displayed to the user.

```java
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    ...

    LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);

    boolean friendshipStatusChanged = result.getFriendshipStatusChanged();

    ...
}
```

See `getFriendshipStatusChanged()` in the LINE SDK for Android reference.

### Use LINE Login to get friendship status

Call `LineApiClient.getFriendshipStatus()` after the user has logged in and an
access token has been returned:

```java
boolean isFriendToTheBot = lineApiClient.getFriendshipStatus();
```

See `getFriendshipStatus()` in the LINE SDK for Android reference.

---

# Managing users

Covers: getting user profiles, using ID tokens to verify user identities,
logging out users.

> **Tip — Creating a secure login process:** See "Creating a secure login
> process between your app and server".

## Getting user profiles

If the login request includes the `Scope.PROFILE` scope, you can get the user's
LINE profile information (user ID, display name, profile media, status message).
Call `LineApiClient.getProfile()`:

```java
LineProfile profile = lineApiClient.getProfile().getResponseData()
Log.i(TAG, profile.getDisplayName());
Log.i(TAG, profile.getUserId());
Log.i(TAG, profile.getStatusMessage());
Log.i(TAG, profile.getPictureUrl().toString());
```

`getDisplayName()`, `getPictureURL()`, and `getStatusMessage()` get the values at
the time of login; users can change those anytime. To identify users, use
`getUserId()`, whose return value (user ID) doesn't change.

You can change the size of the user's profile image by adding a suffix to the
URL:

| Image Size | Suffix |
|---|---|
| 200 x 200 | `/large` |
| 51 x 51 | `/small` |

## Using ID tokens to verify user identity

OpenID Connect 1.0 is an identity layer on top of OAuth 2.0. With it you can get
the user profile and email address from the LINE Platform via ID tokens.

### Applying for email permission

Request permission to get the user's email address. Apply for it in the LINE
Developers Console. See "Applying for email permission".

### Login with the OpenID and email scopes

Once your channel has the email permission, log in with `Scope.OPENID_CONNECT`
and `Scope.OC_EMAIL`:

```java
import java.util.Arrays;

private static final int REQUEST_CODE = 1;

LineAuthenticationParams params = new LineAuthenticationParams.Builder()
                                    .scopes(Arrays.asList(Scope.OPENID_CONNECT, Scope.OC_EMAIL))
                                    .build();

Intent loginIntent = LineLoginApi.getLoginIntent(
                        view.getContext(),
                        Constants.CHANNEL_ID,
                        params);

startActivityForResult(loginIntent, REQUEST_CODE);
```

An ID token is a signed JSON Web Token. The SDK validates it (signature and
validity period). If validation passes, get a `LineIdToken` instance in
`onActivityResult()`:

```java
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode != REQUEST_CODE) {
        Log.e("ERROR", "Unsupported Request");
        return;
    }

    LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);

    switch (result.getResponseCode()) {
        case SUCCESS:
            // Login successful
            LineIdToken lineIdToken = result.getLineIdToken();
            Log.v("INFO", lineIdToken.getEmail());
    ...
    }
}
```

### Using ID tokens on your server

> **Warning — User spoofing:** Do not trust user IDs or other information sent by
> a client to your backend server. A malicious client can send an arbitrary user
> ID or malformed information to impersonate a user. Instead, the client should
> send the raw ID token string to your server. After verifying the token against
> the ID token verification API, the server can retrieve the user ID or any
> other information.

**Sending raw ID token string:** When logging in with `Scope.OPENID_CONNECT`,
you can assign a custom value to the `nonce` parameter:

```java
private static final int REQUEST_CODE = 1;
...
LineAuthenticationParams params = new LineAuthenticationParams.Builder()
                                  ...
                                  .nonce("<a randomly-generated string>")
                                  .build();

Intent loginIntent = LineLoginApi.getLoginIntent(
                        view.getContext(),
                        Constants.CHANNEL_ID,
                        params);

startActivityForResult(loginIntent, REQUEST_CODE);
```

The SDK automatically assigns a value to `nonce` if none is specified, but it's
recommended to generate a random value and specify it. You can use the `nonce`
value when verifying ID tokens with the LINE Login API. Using a `nonce` helps
prevent replay attacks.

After a successful login with `Scope.OPENID_CONNECT`, get the raw ID token
string:

```java
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    ...
    LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);

    switch (result.getResponseCode()) {
        case SUCCESS:
            // Login successful
            LineIdToken lineIdToken = result.getLineIdToken();
            String idTokenStr = lineIdToken.getRawString();
            if (idTokenStr != null) {
                // Send `idTokenStr` to your server.
            } else {
                // Something went wrong. You should fail the login.
            }
    ...
}
```

Send `idTokenStr` to your backend server to verify ID tokens.

**Verify ID tokens on your backend server:** Your server sends both the token
and the corresponding `nonce` value to the LINE Platform's ID token
verification endpoint. If valid, the API returns a JSON object with ID token
claims. Server-side API: "Verify ID token" (LINE Login v2.1 API reference).

### Handling user data responsibly

Do not save sensitive user data in plain text or transfer it over non-secure
HTTP. Such data includes the access token, user ID, username, and any
information in the ID token. The SDK stores the user's access token; access it
after authorization:

```java
LineAccessToken accessToken = lineApiClient.getCurrentAccessToken().getResponseData();
```

ID tokens are issued only at login. To update the ID token, the user must log in
again. If you set the `Scope.PROFILE` scope, you can call
`LineApiClient.getProfile()` for the profile.

## Logging out users

To invalidate the access token and log out the user, call `logout()`. After
logout, the user must go through login again:

```java
lineApiClient.logout();
```

---

# Managing access tokens

Covers: refreshing access tokens, getting the current access token, verifying
access tokens.

> **Tip — Creating a secure login process:** See "Creating a secure login
> process between your app and server".

## Refreshing access tokens

The SDK stores the user's valid access token after successful authorization and
uses it for API requests. Get the validity period:

```java
LineAccessToken accessToken = lineApiClient.getCurrentAccessToken().getResponseData();
Log.i(TAG, accessToken.getExpiresInMillis());
```

When making an API request, the SDK automatically refreshes any expired access
token through the `LineApiClient` interface. However, the refresh operation
fails if the token has been expired for a long time — an error occurs and the
user must log in again.

It is **not recommended** to refresh access tokens yourself. Automatic
management by the SDK is easier and safer for future upgrading. If necessary,
manually refresh:

```java
LineAccessToken newAccessToken = lineApiClient.refreshAccessToken().getResponseData();
```

## Getting the current access token

When building a client-server application, use access tokens to send user data
between your app and the server. If you obtain an access token in your app and
send it to a server, you can make LINE Login API calls from that server (see the
LINE Login v2.1 API reference).

To get the access token the SDK has saved, call `getCurrentAccessToken()`:

```java
String accessToken = lineApiClient.getCurrentAccessToken().getResponseData().getTokenString();
```

> **Note:** Encrypt your access tokens before sending them to your server via an
> SSL connection. Verify these conditions before using an access token on your
> server:
> - The server has received the same access token that is used to make LINE
>   Login API calls.
> - The channel ID used to make LINE Login API calls matches your own channel
>   ID.

## Verifying access tokens

Call `verifyToken()` in your app to verify the access token saved by the SDK is
valid. It returns a `LineApiResponse` object. Call `isSuccess()` to check if the
token is valid.

If `isSuccess()` returns `true`, the token is valid. Otherwise the access token
is invalid or expired, or a LINE Login API call failed. If `isSuccess()` returns
`false`, use `LineApiResponse.getErrorData()` to determine why `verifyToken()`
failed; `getResponseData()` returns `null` in this case.

```java
LineApiResponse verifyResponse = lineApiClient.verifyToken();

if (verifyResponse.isSuccess()) {

    Log.i(TAG, "getResponseData: " + verifyResponse.getResponseData().toString());
    Log.i(TAG, "getResponseCode: " + verifyResponse.getResponseCode().toString());

    return true;
} else {

    Log.i(TAG, "getResponseCode: " + verifyResponse.getResponseCode());
    Log.i(TAG, "getErrorData: " + verifyResponse.getErrorData());

    return false;

}
```

To get the scopes associated with the access token, call
`LineApiResponse.getResponseData().getScopes()`. Example displaying a list of
scopes in a toast:

```java
protected void onPostExecute(LineApiResponse response){
    if (response.isSuccess()){
        LineCredential lineCredential = response.getResponseData();
        List<Scope> scopes = lineCredential.getScopes();
        String scopesString = Scope.join(scopes);
        Toast.makeText(getApplicationContext(), scopesString, Toast.LENGTH_SHORT).show();
    }
}
```

---

# Handling errors

The `getResponseCode()` method of the `LineLoginResult` object returns one of
the following response codes:

| Response code | Description |
|---|---|
| `SUCCESS` | The login was successful. |
| `CANCEL` | The login failed because the user canceled the login process. |
| `AUTHENTICATION_AGENT_ERROR` | The login failed because the user tapped the Cancel or Back button on the consent screen. |
| `SERVER_ERROR` | The login failed due to a server-side error. |
| `NETWORK_ERROR` | The login failed because the SDK could not connect to the LINE Platform. |
| `INTERNAL_ERROR` | The login failed due to an unknown error. |
