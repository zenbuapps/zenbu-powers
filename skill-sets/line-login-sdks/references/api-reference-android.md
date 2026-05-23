# LINE SDK v5 for Android — API Reference

Source: `https://developers.line.biz/en/reference/android-sdk/` (LINE SDK for
Android, Javadoc — version 5.12.0 at time of crawl). All 22 public
classes/interfaces/enums across 4 packages.

This is the class/method reference. For task-oriented integration steps see
`android-sdk.md`. Maven Central: `com.linecorp.linesdk:linesdk`.

## Table of contents

- Package `com.linecorp.linesdk.auth`: LineLoginApi, LineLoginResult, LineAuthenticationParams (+ Builder, BotPrompt, WebAuthenticationMethod)
- Package `com.linecorp.linesdk.api`: LineApiClient, LineApiClientBuilder
- Package `com.linecorp.linesdk.widget`: LoginButton
- Package `com.linecorp.linesdk`: LineProfile, LineCredential, LineAccessToken, LineIdToken, LineFriendshipStatus, LineApiResponse, LineApiResponseCode, LineApiError (+ ErrorCode), Scope, LoginDelegate (+ Factory), LoginListener

---

## Package `com.linecorp.linesdk.auth`

### `LineLoginApi` (class)

`public class LineLoginApi extends Object` — the API that performs LINE Login.

**Usage:**

```java
Intent loginIntent = LineLoginApi.getLoginIntent(context, channelId);
startActivityForResult(loginIntent, REQUEST_CODE_LINE_LOGIN);
```

```java
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode != REQUEST_CODE_LINE_LOGIN) {
        return;
    }
    LineLoginResult result = LineLoginApi.getLoginResultFromIntent(data);
    if (result.isSuccess()) {
        // You can retrieve the LINE account information and the access token
        // from LineLoginResult.
    } else {
        updateErrorUi();
    }
}
```

| Method | Signature | Notes |
|---|---|---|
| `getLoginIntent` | `static Intent getLoginIntent(Context context, String channelId, LineAuthenticationParams params)` | Intent for LINE Login. If LINE is installed, app-to-app auth through LINE; otherwise browser login. Returns a login intent that defaults to app-to-app. |
| `getLoginIntentWithoutLineAppAuth` | `static Intent getLoginIntentWithoutLineAppAuth(Context context, String channelId, LineAuthenticationParams params)` | Login intent that **only** performs browser login. |
| `getLoginResultFromIntent` | `static LineLoginResult getLoginResultFromIntent(Intent intent)` | Parses a `LineLoginResult` from the `onActivityResult` `Intent`. |

### `LineLoginResult` (class)

`public class LineLoginResult extends Object implements Parcelable` — a login
result returned from the LINE Platform.

**Field:** `public static final Creator<LineLoginResult> CREATOR`.

| Method | Signature | Notes |
|---|---|---|
| `getResponseCode()` | `LineApiResponseCode getResponseCode()` | Response code indicating success/failure. |
| `isSuccess()` | `boolean isSuccess()` | `true` if login succeeded. |
| `getLineProfile()` | `LineProfile getLineProfile()` | The user's `LineProfile`. |
| `getLineCredential()` | `LineCredential getLineCredential()` | The user's credentials. |
| `getLineIdToken()` | `LineIdToken getLineIdToken()` | ID token containing the user's information. |
| `getNonce()` | `String getNonce()` | The `nonce` value used for performing login in LINE. |
| `getFriendshipStatusChanged()` | `Boolean getFriendshipStatusChanged()` | `true` if the user added the LINE Official Account as a friend and did not block it; `false` otherwise. |
| `getErrorData()` | `LineApiError getErrorData()` | Information about a login error. Call only if login failed. Returns a `LineApiError` with response 0 and `null` string if no error. |

**Static factory methods (mainly internal):** `authenticationAgentError(LineApiError)`,
`canceledError()`, `error(LineApiResponseCode, LineApiError)`,
`error(LineApiResponse<?>)`, `internalError(Exception)`,
`internalError(LineApiError)`, `internalError(String)`.

### `LineAuthenticationParams` (class)

`public class LineAuthenticationParams extends Object implements Parcelable` — a
container holding parameters for performing LINE Login (permission scopes and
the bot-prompt option).

**Nested:** enum `LineAuthenticationParams.BotPrompt`, class
`LineAuthenticationParams.Builder`, enum
`LineAuthenticationParams.WebAuthenticationMethod`.

| Method | Signature |
|---|---|
| `getScopes()` | `List<Scope> getScopes()` — the list of scopes. |
| `getNonce()` | `String getNonce()` — a nonce string (returned in an ID token; prevents replay attacks). |
| `getBotPrompt()` | `LineAuthenticationParams.BotPrompt getBotPrompt()` — how to prompt the user to add a bot as a friend. |
| `getUILocale()` | `Locale getUILocale()` — the language in which login pages are displayed. |
| `getPromptBotID()` | `String getPromptBotID()` — the prompt bot ID. |
| `getInitialWebAuthenticationMethod()` | `LineAuthenticationParams.WebAuthenticationMethod getInitialWebAuthenticationMethod()` |

### `LineAuthenticationParams.Builder` (class)

`public static final class LineAuthenticationParams.Builder extends Object` —
builder for `LineAuthenticationParams`. `public Builder()`.

| Method | Signature | Notes |
|---|---|---|
| `scopes` | `Builder scopes(List<Scope> val)` | Sets scopes. Returns the builder. |
| `nonce` | `Builder nonce(String val)` | A string to prevent replay attacks, returned in the ID token. If unspecified, the LINE SDK generates one. |
| `botPrompt` | `Builder botPrompt(LineAuthenticationParams.BotPrompt val)` | Sets how to prompt the user to add a LINE Official Account as a friend. |
| `uiLocale` | `Builder uiLocale(Locale val)` | The language for login pages. If unspecified, uses the browser/LINE-app language. |
| `initialWebAuthenticationMethod` | `Builder initialWebAuthenticationMethod(LineAuthenticationParams.WebAuthenticationMethod method)` | Initial web authentication method when starting login. |
| `promptBotID` | `Builder promptBotID(String botID)` | |
| `build` | `LineAuthenticationParams build()` | Builds the `LineAuthenticationParams`. |

### `LineAuthenticationParams.BotPrompt` (enum)

`public static final enum LineAuthenticationParams.BotPrompt` — how to prompt the
user to add a LINE Official Account as a friend during login.

- `normal` — Includes an option to add a LINE Official Account as a friend in the consent screen.
- `aggressive` — Opens a new screen to add a LINE Official Account as a friend after the user agrees to the permissions in the consent screen.

Methods: `static BotPrompt valueOf(String name)`, `static BotPrompt[] values()`.

### `LineAuthenticationParams.WebAuthenticationMethod` (enum)

`public static final enum LineAuthenticationParams.WebAuthenticationMethod` — the
method for authentication when using the web authentication flow.

- `email`
- `qrCode`

Methods: `static WebAuthenticationMethod valueOf(String name)`,
`static WebAuthenticationMethod[] values()`.

---

## Package `com.linecorp.linesdk.api`

### `LineApiClient` (interface)

`public interface LineApiClient` — provides access to the Social API: getting
the current access token, getting the user profile, logging out, refreshing the
access token, verifying the access token.

| Method | Signature | Notes |
|---|---|---|
| `getCurrentAccessToken()` | `abstract LineApiResponse<LineAccessToken> getCurrentAccessToken()` | The access token the SDK is using. On success the response contains a `LineAccessToken`; on failure the payload is `null`. |
| `getProfile()` | `abstract LineApiResponse<LineProfile> getProfile()` | The user's profile information. On success the response contains a `LineProfile`. |
| `getFriendshipStatus()` | `abstract LineApiResponse<LineFriendshipStatus> getFriendshipStatus()` | Friendship status between the LINE Official Account (linked to the channel) and the user. |
| `refreshAccessToken()` | `abstract LineApiResponse<LineAccessToken> refreshAccessToken()` | Refreshes the access token. On success the response contains a new `LineAccessToken`. |
| `verifyToken()` | `abstract LineApiResponse<LineCredential> verifyToken()` | Checks whether the access token is valid. On success the response contains a `LineCredential`. |
| `logout()` | `abstract LineApiResponse<?> logout()` | Revokes the access token. |

### `LineApiClientBuilder` (class)

`public class LineApiClientBuilder extends Object` — builder for `LineApiClient`
objects.

**Constructor:** `public LineApiClientBuilder(Context context, String channelId)`
— constructs a builder for a `LineApiClient` with the given `channelId`. Throws
`IllegalArgumentException` if `channelId` is `null`.

| Method | Signature | Notes |
|---|---|---|
| `build()` | `LineApiClient build()` | Creates a `LineApiClient` instance. |
| `disableEncryptorPreparation()` | `LineApiClientBuilder disableEncryptorPreparation()` | Disables the SDK feature that prepares an encryptor. Returns the builder. |
| `disableTokenAutoRefresh()` | `LineApiClientBuilder disableTokenAutoRefresh()` | Disables the SDK feature that automatically refreshes the access token. Returns the builder. |

---

## Package `com.linecorp.linesdk.widget`

### `LoginButton` (class)

`public class LoginButton extends AppCompatTextView` — a button widget that
simplifies the login flow.

Before adding login listeners via `addLoginListener(LoginListener)`, you must set
the channel ID via `setChannelId(String)` and the login delegate via
`setLoginDelegate(LoginDelegate)`, or a `RuntimeException` is thrown. Use
`LoginDelegate.Factory.create()` to create the delegate. By default the button
logs in using LINE with the `PROFILE` scope only. Finally, call
`onActivityResult(int, int, Intent)` (via the delegate) in your Activity/Fragment.

**Setup example:**

```java
int loginButtonResId = ...;
String channelId = ...;
LoginDelegate loginDelegate = LoginDelegate.Factory.create();
LineAuthenticationParams params = LineAuthenticationParams.Builder()
                                        .scopes(...)
                                        .nonce(...)
                                        .botPrompt(...)
                                        .build();

LoginButton loginButton = findViewById(loginButtonResId);
loginButton.setChannelId(channelId);
loginButton.setLoginDelegate(loginDelegate);
loginButton.enableLineAppAuthentication(true);
loginButton.setAuthenticationParams(params);
loginButton.addLoginListener(new LoginListener() {
   @Override
    public void onLoginSuccess(@NonNull LineLoginResult result) {
        ...
    }

   @Override
    public void onLoginFailure(@Nullable LineLoginResult result) {
    if (result != null) {
        ...
    } else {
        ...
    }
});
```

**Handling the result intent:**

```java
@Override
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (loginDelegate.onActivityResult(requestCode, resultCode, data)) {
        // login result intent is consumed.
        return;
    }
}
```

**Constructors:** `LoginButton(Context context)`,
`LoginButton(Context context, AttributeSet attrs)`,
`LoginButton(Context context, AttributeSet attrs, int defStyleAttr)`.

| Method | Signature | Notes |
|---|---|---|
| `setChannelId` | `void setChannelId(String channelId)` | The channel ID used to log in. |
| `setLoginDelegate` | `void setLoginDelegate(LoginDelegate loginDelegate)` | Created via `LoginDelegate.Factory.create()`. If not set, a `RuntimeException` is thrown. Also call the delegate's `onActivityResult` in your Activity/Fragment. |
| `setAuthenticationParams` | `void setAuthenticationParams(LineAuthenticationParams params)` | The authentication parameters for login. |
| `enableLineAppAuthentication` | `void enableLineAppAuthentication(boolean isEnabled)` | `true` to log in with LINE instead of the browser. Default `true`. |
| `addLoginListener` | `void addLoginListener(LoginListener loginListener)` | Adds a listener for the login result. |
| `removeLoginListener` | `void removeLoginListener(LoginListener loginListener)` | Removes a listener. |
| `setFragment` | `void setFragment(Fragment fragment)` | For `android.app.Fragment` — so its `onActivityResult` is called properly. |
| `setFragment` | `void setFragment(androidx.fragment.app.Fragment fragment)` | For `androidx.fragment.app.Fragment`. |
| `setOnClickListener` | `void setOnClickListener(OnClickListener externalListener)` | Callback when the button is tapped (may be `null`). |

---

## Package `com.linecorp.linesdk`

### `LineProfile` (class)

`public class LineProfile extends Object implements Parcelable` — a user's LINE
profile in the Social API.

**Field:** `public static final Creator<LineProfile> CREATOR`.
**Constructor:** `public LineProfile(String userId, String displayName, Uri pictureUrl, String statusMessage)`.

| Method | Signature |
|---|---|
| `getUserId()` | `String getUserId()` — the user's user ID. |
| `getDisplayName()` | `String getDisplayName()` — the user's display name. |
| `getPictureUrl()` | `Uri getPictureUrl()` — the user's profile image URL. |
| `getStatusMessage()` | `String getStatusMessage()` — the user's status message. |

### `LineCredential` (class)

`public class LineCredential extends Object implements Parcelable` — credentials
granting access to the Social API.

**Field:** `public static final Creator<LineCredential> CREATOR`.
**Constructor:** `public LineCredential(LineAccessToken accessToken, List<Scope> scopes)`.

| Method | Signature |
|---|---|
| `getAccessToken()` | `LineAccessToken getAccessToken()` — the access token. |
| `getScopes()` | `List<Scope> getScopes()` — permission codes the access token holds. |

### `LineAccessToken` (class)

`public class LineAccessToken extends Object implements Parcelable` — an access
token used to call the Social API.

**Field:** `public static final Creator<LineAccessToken> CREATOR`.
**Constructor:** `public LineAccessToken(String accessToken, long expiresInMillis, long issuedClientTimeMillis)`.

| Method | Signature | Notes |
|---|---|---|
| `getTokenString()` | `String getTokenString()` | The access token string. |
| `getExpiresInMillis()` | `long getExpiresInMillis()` | Milliseconds until the access token expires. |
| `getEstimatedExpirationTimeMillis()` | `long getEstimatedExpirationTimeMillis()` | Estimated UNIX time when the token expires (inexact — uses client-cached time values). |
| `getIssuedClientTimeMillis()` | `long getIssuedClientTimeMillis()` | UNIX time the token info was last updated (on login, refresh, verification). |

### `LineIdToken` (class)

`public class LineIdToken extends Object implements Parcelable` — an ID token
containing the user's information (follows OpenID Connect 1.0).

**Field:** `public static final Creator<LineIdToken> CREATOR`.

| Method | Signature | Notes |
|---|---|---|
| `getRawString()` | `String getRawString()` | Raw string of the ID token. |
| `getIssuer()` | `String getIssuer()` | The URL of the LINE Platform, `https://access.line.me`. |
| `getSubject()` | `String getSubject()` | The user ID the ID token is generated for. |
| `getAudience()` | `String getAudience()` | The channel ID. |
| `getExpiresAt()` | `Date getExpiresAt()` | Expiration time (UNIX time). |
| `getIssuedAt()` | `Date getIssuedAt()` | Generation time of the ID token (UNIX time). |
| `getAuthTime()` | `Date getAuthTime()` | When user authentication occurred (UNIX time). |
| `getName()` | `String getName()` | The user's display name. |
| `getPicture()` | `String getPicture()` | The user's profile image URL. |
| `getEmail()` | `String getEmail()` | The user's email address. |
| `getAmr()` | `List<String>  getAmr()` | Authentication Methods References — identifiers for authentication methods used. |

### `LineFriendshipStatus` (class)

`public class LineFriendshipStatus extends Object` — the friendship status
between a LINE Official Account and a user.

**Constructor:** `public LineFriendshipStatus(boolean friendFlag)`.

- `isFriend()` → `boolean` — `true` if the user added the LINE Official Account
  as a friend and has not blocked it; `false` otherwise.

### `LineApiResponse` (class)

`public class LineApiResponse<R> extends Object` — a response from the Social
API.

| Method | Signature | Notes |
|---|---|---|
| `isSuccess()` | `boolean isSuccess()` | `true` if the API call is successful. |
| `isNetworkError()` | `boolean isNetworkError()` | `true` if the call failed with a network error. |
| `isServerError()` | `boolean isServerError()` | `true` if the call failed with a server error. |
| `getResponseCode()` | `LineApiResponseCode getResponseCode()` | The `LineApiResponseCode` (HTTP status code indicating success). |
| `getResponseData()` | `R getResponseData()` | Response data (same type as the generic parameter). Throws `NoSuchElementException` if the data is `null` — check `isSuccess()` first. |
| `getErrorData()` | `LineApiError getErrorData()` | Information about an API error. Call only if the call failed. |

### `LineApiResponseCode` (enum)

`public final enum LineApiResponseCode` — a response code returned from the LINE
Platform.

| Value | Meaning |
|---|---|
| `SUCCESS` | The request was successful. |
| `CANCEL` | The request was canceled. |
| `AUTHENTICATION_AGENT_ERROR` | An authentication agent error occurred. |
| `NETWORK_ERROR` | A network error occurred. |
| `SERVER_ERROR` | A server error occurred. |
| `INTERNAL_ERROR` | An internal error occurred. |

Methods: `static LineApiResponseCode valueOf(String name)`,
`static LineApiResponseCode[] values()`.

### `LineApiError` (class)

`public class LineApiError extends Object implements Parcelable` — an error
thrown by the Social API.

**Nested:** enum `LineApiError.ErrorCode`.
**Fields:** `public static final Creator<LineApiError> CREATOR`,
`public static final LineApiError DEFAULT`.
**Constructors:** `LineApiError(Exception e)`, `LineApiError(String message)`,
`LineApiError(Exception e, LineApiError.ErrorCode errorCode)`,
`LineApiError(int httpResponseCode, String message, LineApiError.ErrorCode errorCode)`.
**Static factories:** `createWithHttpResponseCode(int httpResponseCode, Exception e)`,
`createWithHttpResponseCode(int httpResponseCode, String errorString)`.

| Method | Signature |
|---|---|
| `getHttpResponseCode()` | `int getHttpResponseCode()` — the HTTP response code. |
| `getMessage()` | `String getMessage()` — the error message. |
| `getErrorCode()` | `LineApiError.ErrorCode getErrorCode()` — the error code. |

### `LineApiError.ErrorCode` (enum)

`public static final enum LineApiError.ErrorCode` — detailed error reasons.

| Value | Meaning |
|---|---|
| `NOT_DEFINED` | The default value when the detail error reason is not defined yet. |
| `LOGIN_ACTIVITY_NOT_FOUND` | Login intent can't be handled by system. |
| `HTTP_RESPONSE_PARSE_ERROR` | HTTP response result can't be successfully parsed. |

Methods: `static ErrorCode valueOf(String name)`, `static ErrorCode[] values()`.

### `Scope` (class)

`public class Scope extends Object` — a permission the user grants your app
during login.

**Constructor:** `public Scope(String code)`.

| Field | Declaration | Meaning |
|---|---|---|
| `PROFILE` | `public static final Scope PROFILE` | Permission to get the user's profile information. |
| `OPENID_CONNECT` | `public static final Scope OPENID_CONNECT` | Permission to get an ID token that includes the user information. |
| `OC_EMAIL` | `public static final Scope OC_EMAIL` | Permission to get the user's email address. |
| `OPEN_CHAT_PLUG_INFO` | `public static final Scope OPEN_CHAT_PLUG_INFO` | (Open Chat plug) |
| `OPEN_CHAT_PLUG_MANAGEMENT` | `public static final Scope OPEN_CHAT_PLUG_MANAGEMENT` | (Open Chat plug) |
| `OPEN_CHAT_PLUG_PROFILE` | `public static final Scope OPEN_CHAT_PLUG_PROFILE` | (Open Chat plug) |
| `OPEN_CHAT_PLUG_RECEIVCE_MESSAGE_AND_EVENT` | `public static final Scope OPEN_CHAT_PLUG_RECEIVCE_MESSAGE_AND_EVENT` | (Open Chat plug — spelling per Javadoc) |
| `OPEN_CHAT_PLUG_SEND_MESSAGE` | `public static final Scope OPEN_CHAT_PLUG_SEND_MESSAGE` | (Open Chat plug) |

> The `Scope` class also exposes a static `join(List<Scope>)` helper used to
> render a scope list as a string (see `android-sdk.md` verifying-tokens
> example).

### `LoginDelegate` (interface)

`public interface LoginDelegate` — delegates the login result to the internal
login handler. Create one via `LoginDelegate.Factory.create()`.

**Nested:** class `LoginDelegate.Factory`.

- `onActivityResult(int requestCode, int resultCode, Intent data)` → `abstract boolean`
  — call this in the `onActivityResult()` of an Activity/Fragment.
  - `requestCode` — the request code supplied to `startActivityForResult()`.
  - `resultCode` — the result code from the login activity's `setResult()`.
  - `data` — the login result's intent.

### `LoginDelegate.Factory` (class)

`public static class LoginDelegate.Factory extends Object` — factory creating
objects that implement `LoginDelegate`. `public Factory()`.

- `static LoginDelegate create()` — creates a `LoginDelegate`.

### `LoginListener` (interface)

`public interface LoginListener` — a listener for the login result (used with
`LoginButton`).

- `onLoginSuccess(LineLoginResult result)` → `abstract void` — called if login
  succeeds; `result` contains information about the login.
- `onLoginFailure(LineLoginResult result)` → `abstract void` — called if login
  fails; `result` contains error information, or is `null` if login was
  cancelled.
