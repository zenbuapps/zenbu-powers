# Managing Roles — Provider & Channel Permissions

Source: `https://developers.line.biz/en/docs/line-developers-console/managing-roles/`

Roles control what information developers can view and edit in the
[LINE Developers Console](https://developers.line.biz/console/). Providers and
channels each have their **own, independent** roles.

## Table of contents

- Provider roles (Admin / Member / No role) + permission matrix
- Provider role notes
- Member vs No role on a provider
- Adding / editing / deleting developers on a provider
- Channel roles (Admin / Member / Tester / No role)
- Common-to-all-channels matrices: Basic settings tab, Roles tab, Developing-test
- LINE Login channel matrix
- Messaging API channel matrix
- LINE MINI App channel matrix
- Adding / editing / deleting developers on a channel
- Invite-by-email caveats

---

## Provider roles

A developer registered on a provider can have the **Admin** role or the
**Member** role. It is also possible to grant a developer channel access
*without* provider access — that developer's provider role is then **No role**.

| | Admin | Member | No role \*1 |
|---|---|---|---|
| View provider name | ✅ | ✅ | ✅ |
| View provider ID | ✅ | ✅ \*2 | ✅ \*2 |
| Edit provider name | ✅ | ❌ | ❌ |
| Delete provider \*3 | ✅ | ❌ | ❌ |
| View list of channels linked to provider | ✅ | ❌ | ❌ |
| Create a channel under provider | ✅ | ❌ | ❌ |
| Add or delete developer to/from provider | ✅ | ❌ | ❌ |
| View or edit provider role settings | ✅ | ❌ | ❌ |

\*1 Only with access to a channel linked to the provider.
\*2 Cannot view the **Provider settings** screen, but the provider ID is
included in the URL when the developer selects a provider.
\*3 Cannot delete a provider that has existing channels.

### Provider role notes

- Even with the provider Admin role, **without channel access** you cannot see
  detailed information of a channel linked to the provider.
- Granting a developer provider access does **not** automatically grant access
  to the channels linked to the provider.
- When deleting a developer from a provider, even if **"Also delete the selected
  developer(s) from the channels that belong to this provider."** is checked,
  the developer is **not** deleted from any channel where their status is
  `Pending`.

### Member vs No role on a provider

Both **Member** and **No role** on a provider can only view the provider name.
The difference:

- If a developer has the **Member** role on a provider, you can add them to a
  channel linked to that provider simply by clicking **Import from provider** on
  the channel's **Roles** tab.
- **Import from provider** is available only to a developer account that has the
  **Admin role both in the channel and in the provider**.

### Adding, editing, and deleting developers on a provider

Open the **Roles** tab: select the provider from the console sidebar, then
click the **Roles** tab.

| Action | Steps |
|---|---|
| **Add** | Click **Invite by email**, register the email address, set the developer's role, then click **Send invitation**. The developer receives an email titled "You have received an invitation to join a provider". If they accept, they are added to the provider. |
| **Edit** | Click **Edit**, then select a role from the dropdown. |
| **Delete** | Select the checkbox next to a member's name and click **Delete selected**. |

---

## Channel roles

A developer can have the **Admin**, **Member**, or **Tester** role on a channel.
The operations each role can perform depend on the channel type. The matrices
below apply, in order: common to all channel types, then channel-type-specific.

### Common to all channel types — Basic settings tab

| | Admin | Member | Tester | No role |
|---|---|---|---|---|
| View **Channel ID** | ✅ | ✅ | ✅ | ❌ |
| View **Region to provide the service** \*1 | ✅ | ❌ | ❌ | ❌ |
| View or edit **Company or owner's country or region** \*1 | ✅ | ❌ | ❌ | ❌ |
| View **Channel icon** | ✅ | ✅ | ✅ | ❌ |
| Edit **Channel icon** | ✅ | ❌ | ❌ | ❌ |
| View **Channel name** | ✅ | ✅ | ✅ | ❌ |
| Edit **Channel name** | ✅ | ❌ | ❌ | ❌ |
| View **Channel description** | ✅ | ✅ | ❌ | ❌ |
| Edit **Channel description** | ✅ | ❌ | ❌ | ❌ |
| View or edit **Email address** | ✅ | ❌ | ❌ | ❌ |
| View **Privacy policy URL** | ✅ | ✅ | ❌ | ❌ |
| Edit **Privacy policy URL** | ✅ | ❌ | ❌ | ❌ |
| View **Terms of use URL** | ✅ | ✅ | ❌ | ❌ |
| Edit **Terms of use URL** | ✅ | ❌ | ❌ | ❌ |
| View **App types** | ✅ | ❌ | ❌ | ❌ |
| View **Permissions** | ✅ | ❌ | ❌ | ❌ |
| View **Channel secret** | ✅ | ❌ | ❌ | ❌ |
| View or edit **Assertion Signing Key** | ✅ | ❌ | ❌ | ❌ |
| View **Your user ID** \*2 | ✅ | ✅ | ✅ | ❌ |
| View or edit **Require two-factor authentication** \*3 | ✅ | ❌ | ❌ | ❌ |
| View or edit **Localization (multi-language support)** \*1 | ✅ | ❌ | ❌ | ❌ |
| View or edit **Linked LINE Official Account** \*1 | ✅ | ❌ | ❌ | ❌ |
| View or edit **Email address permission** \*1 | ✅ | ❌ | ❌ | ❌ |
| Perform **Delete this channel** \*4 | ✅ | ❌ | ❌ | ❌ |
| Perform **Leave channel** | ❌ | ✅ | ✅ | ❌ |

\*1 Only displayed in the LINE Login channel or the LINE MINI App channel.
\*2 Only displayed in the LINE Login channel or the Messaging API channel. In
either role, **Your user ID** is not displayed if your Business ID is not linked
to a LINE account (see "Available features" in `references/account-and-login.md`).
\*3 Only displayed in the LINE MINI App channel.
\*4 You cannot delete the Blockchain Service channel or the LINE MINI App
channel.

### Common to all channel types — Roles tab

| | Admin | Member | Tester | No role |
|---|---|---|---|---|
| View or edit **Roles** tab | ✅ | ❌ | ❌ | ❌ |

### Common to all channel types — Test on a channel set to "Developing"

| Admin | Member | Tester | No role |
|---|---|---|---|
| ✅ | ❌ | ✅ | ❌ |

Only the **LINE Login** channel, the **LINE MINI App** channel, and the
**Blockchain Service** channel have a status (`Developing` / `Published`). For
how to test after granting the Tester role in a LINE Login channel, see
[How to test with a LINE Login channel with the "Developing" status](https://developers.line.biz/en/docs/line-login/getting-started/#how-to-test-login-channel).

### LINE Login channel

| | Admin | Member | Tester | No role |
|---|---|---|---|---|
| View or edit **LINE Login** tab | ✅ | ❌ | ❌ | ❌ |
| View or edit **LIFF** tab | ✅ | ❌ | ❌ | ❌ |

### Messaging API channel

| | Admin | Member | Tester | No role |
|---|---|---|---|---|
| View or edit **Messaging API** tab | ✅ | ❌ | ❌ | ❌ |
| View **LIFF** tab | ✅ | ❌ | ❌ | ❌ |
| View or edit **Security** tab | ✅ | ❌ | ❌ | ❌ |
| View **Webhook errors** tab \*1 | ✅ | ✅ | ❌ | ❌ |
| View **QR code** \*2 | ✅ | ✅ | ✅ | ❌ |

\*1 The **Webhook errors** tab is displayed only for channels where **Error
statistics aggregation** is enabled on the **Messaging API** tab.
\*2 For developers with the Admin role it appears under the **Messaging API**
tab. For developers with the Member or Tester role it appears under the **Basic
settings** tab.

### LINE MINI App channel

> A LINE MINI App channel uses only **Admin** and **Tester** roles (no Member).

| | Admin | Tester | No role |
|---|---|---|---|
| View or edit **Web app settings** tab | ✅ | ❌ | ❌ |
| View or edit **Review request** tab | ✅ | ❌ | ❌ |
| View or edit **Business information** tab | ✅ | ❌ | ❌ |
| View or edit **Contact information** tab | ✅ | ❌ | ❌ |
| View or edit **Service message template** tab | ✅ | ❌ | ❌ |
| View **LIFF URL** \* | ✅ | ✅ | ❌ |

\* For developers with the Admin role it appears under the **Web app settings**
tab. For developers with the Tester role it appears under the **Basic settings**
tab — and Tester developers can view only the LIFF URL for `Developing`.

---

## Adding, editing, and deleting developers on a channel

Open the channel's **Roles** tab on the console.

| Action | Steps |
|---|---|
| **Add** | Either: (1) Click **Invite by email**, register the email address, set the role, then click **Send invitation** — the developer receives an email titled "You have received an invitation to join a channel"; if they accept, they are added. Or (2) Click **Import from provider** and select members previously registered under the same provider — the role is assigned **immediately** on clicking **Import**; no acceptance needed. |
| **Edit** | Click **Edit** and select a role from the dropdown. |
| **Delete** | Select the checkbox next to a member's name and click **Delete selected**. |

**Restriction — adding an Admin in Messaging API channels** — If developer A is
registered as Admin in 100 Messaging API channels, developer A **cannot** be
added as an Admin to Messaging API channels created by developer B, but **can**
be added as a Member or Tester. This conflicts with the "LINE Official Account
Manager restriction" — see "The number of channels" in
`references/providers-and-channels.md`.

### Invite-by-email caveats

The email address entered when clicking **Invite by email** is used **only** for
the invitation. The role specified at invitation time is granted to the
developer account that logs in to the console after clicking **Accept the
invitation** in the email.

The "email address entered when sending an invitation" does **not** have to
match the "email address of the developer account to which the role is
granted". A role may therefore be **unintentionally granted** to a developer
account registered with a different email address.

**When you receive an invitation** — Before clicking accept:

- If not logged in to the console, log in with the developer account that
  *should* be given the role.
- If already logged in, confirm the logged-in developer account is the one that
  *should* be given the role.
