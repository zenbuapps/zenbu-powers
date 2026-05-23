# Managing Users & the Add-Friend Option

Source:
- `https://developers.line.biz/en/docs/line-login/managing-users/`
- `https://developers.line.biz/en/docs/line-login/managing-users-v2/`
- `https://developers.line.biz/en/docs/line-login/link-a-bot/`
- `https://developers.line.biz/en/docs/line-login/managing-authorized-apps/`

Covers getting user profiles, logging users out, the add-friend option
(showing the option to add a LINE Official Account as a friend during login),
and what happens when a user revokes consent.

## Table of contents

- Getting user profiles
- Logging out users
- The add-friend option (`bot_prompt`)
  - Linking a LINE Official Account to the channel
  - The `bot_prompt` query parameter
  - Display options on the consent screen
  - Getting the friendship status (`friendship_status_changed` / API)
- Managing authorized apps & revoked consent

---

## Getting user profiles

Get profile information for a user identified by an access token. Profile
information = user ID, display name, profile image, status message.

**An access token with the `profile` scope is required.**

`GET https://api.line.me/v2/profile` with `Authorization: Bearer {access token}`.

```sh
curl -v -X GET https://api.line.me/v2/profile \
-H 'Authorization: Bearer {access token}'
```

```json
{
  "userId":"U4af4980629...",
  "displayName":"Brown",
  "pictureUrl":"https://profile.line-scdn.net/abcdefghijklmn",
  "statusMessage":"Hello, LINE!"
}
```

Both LINE Login v2.0 and v2.1 share this endpoint. Full field detail is in
`api-reference.md` ("Get user profile").

**Identifying users:** identify users by their **user ID**, which cannot
change. Display name, profile image, and status message can be changed by the
user at any time — never use them to identify a user. You can also obtain a
user's profile information and email via the **ID token** (see
`id-tokens-and-jwt.md`).

---

## Logging out users

Provide a way for users to log out. When a user logs out of your app:

1. **Revoke their access token.**
2. **Delete all of the user's data in your app.**

Revoke an access token (v2.1):

```sh
curl -v -X POST 'https://api.line.me/oauth2/v2.1/revoke' \
-H "Content-Type:application/x-www-form-urlencoded" \
-d "client_id={channel id}&client_secret={channel secret}&access_token={access token}"
```

v2.0 revoke takes a **refresh token** instead:

```sh
curl -v -X POST https://api.line.me/v2/oauth/revoke \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'refresh_token={refresh token}'
```

See `api-reference.md` for endpoint details.

---

## The add-friend option

You can display an option to **add a LINE Official Account as a friend** when a
user logs in. This is called the **add friend option**. If the user enables
"Add as friend" on the consent screen, the LINE Official Account is added as a
friend.

### 1. Link a LINE Official Account to the channel

Link a LINE Official Account to your LINE Login channel in the
[LINE Developers Console](https://developers.line.biz/console/).

Conditions to link:
- The Messaging API channel associated with the LINE Official Account belongs
  to the **same provider** as your LINE Login channel.
- You are an **administrator** of both the LINE Login channel (check in the
  LINE Developers Console) and the LINE Official Account (check in the
  [LINE Official Account Manager](https://manager.line.biz)).

Steps: open the LINE Login channel → **Basic settings** tab → under **Linked
LINE Official Account** click **Edit** → select the LINE Official Account →
**Update**. You can link **only one** LINE Official Account per LINE Login
channel.

### 2. The `bot_prompt` query parameter

After linking, redirect users to the authorization URL with the `bot_prompt`
query parameter:

```
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id={CHANNEL_ID}&redirect_uri={CALLBACK_URL}&state={STATE}&bot_prompt={BOT_PROMPT}&scope={SCOPE_LIST}
```

| Value | Behavior |
|---|---|
| `normal` | Displays the option to add the LINE Official Account as a friend **in the consent screen**. |
| `aggressive` | Opens a **new screen** with the option to add the LINE Official Account as a friend **after the consent screen**. |

(See `web-login-flow.md` for all other authorization URL parameters.)

### Display options on the consent screen

The option shown depends on the user's relationship to the LINE Official
Account:

| Friend relationship when the consent screen is shown | Option shown |
|---|---|
| Not a friend | The option to add the LINE Official Account as a friend. Added if the user selects it and continues. |
| Blocked | The option to unblock the LINE Official Account. Unblocked if the user selects it and continues. |
| Added as friend | Shows the user has already added it. No add-friend option is shown. |

If the LINE Login channel is under a **certified provider**, the option on the
consent screen shown when `bot_prompt=normal` is **selected by default**.

### Getting the friendship status

When using the add-friend option, get the friendship status between the user
and the linked LINE Official Account in one of two ways.

#### A. The `friendship_status_changed` query parameter

If you specified `bot_prompt` in the authorization request, the callback URL
receives a `friendship_status_changed` query parameter:

```
https://client.example.org/cb?code={CODE}&state={STATE}&friendship_status_changed={FRIENDSHIP_STATUS_CHANGED}
```

| Value | Meaning |
|---|---|
| `true` | The friendship status changed during login — the user added the LINE Official Account as a friend, or unblocked it. |
| `false` | The friendship status did not change — the user already had it as a friend, did not add it, or did not unblock it. |

`friendship_status_changed` is **not** included if the consent screen with the
add-friend option was not shown to the user.

#### B. The friendship status API

Use the access token retrieved by your web app to query the friendship status.

```sh
curl -v -X GET https://api.line.me/friendship/v1/status \
-H 'Authorization: Bearer {access token}'
```

```json
{ "friendFlag": true }
```

`friendFlag` is `true` if the user has added the linked LINE Official Account
as a friend and has not blocked it. Requires an access token with the
**`profile`** scope. See `api-reference.md` ("Get friendship status").

---

## Managing authorized apps & revoked consent

Users must consent to having their information (such as the user ID) obtained
when they use a LINE Login channel. After consenting they can review the terms
of consent or revoke consent at any time, from the LINE app:
**Settings → Account → Authorized apps** → tap the app → "View permissions" to
review, "Unlink" to revoke consent.

### When a user revokes consent

Access tokens and refresh tokens are deactivated **as soon as the user revokes
consent**:

| Target | Effect |
|---|---|
| User | When the user tries LINE Login on an app they revoked consent for, the consent screen is shown again. LINE Login is prohibited until consent is obtained. |
| Provider | You can no longer obtain the user ID or profile information even with an access token you already acquired. The access token cannot be updated because the refresh token is unavailable. You cannot obtain the user ID or profile information until the user consents again and uses LINE Login. |

> **Respect the revocation.** Each LINE user has a different user ID per
> provider, and the user ID does not change even if the user consents again
> after revoking — so information associated with a user ID could keep being
> used. Nonetheless, respect the user's decision to revoke and reacquire the
> user's information upon verifying the access token. If the access token
> expires, use the refresh token to update it — but if the user revoked
> consent, neither the access token nor the refresh token is available. Handle
> user information per the LINE User Data Policy; failure to adhere results in
> service discontinuation.
