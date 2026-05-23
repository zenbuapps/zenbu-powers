# Console Login & Account Relationships

Source: `https://developers.line.biz/en/docs/line-developers-console/login-account/`

## Table of contents

- Prerequisites
- Logging in to the console
- Business ID login methods (LINE account / business account / Yahoo! JAPAN ID)
- Creating a developer account (first login only)
- Account relationships (developer account / Business ID / LINE account)
- Linking a Business ID with a LINE account
- Unlinking a LINE account from a Business ID
- Available features by LINE-account link status

---

## Prerequisites

To log in to the [LINE Developers Console](https://developers.line.biz/console/)
you need a **Business ID** and a **developer account**.

---

## Logging in to the console

Click the **Log in to Console** button in the top-right corner of the
[LINE Developers site](https://developers.line.biz/). The Business ID login
screen appears; choose a login method and log in.

A Business ID can be logged in to with any of these accounts:

- LINE account
- Business account
- Yahoo! JAPAN ID (only available in Japan)

---

## Business ID login methods

### Log in with a LINE account

Sub-methods:

| Sub-method | How |
|---|---|
| **Auto login** | Log in with no operation on a smartphone that has LINE installed. |
| **Email address log in** | Log in with the email address and password registered for the LINE account. |
| **QR code log in** | Scan the displayed QR code with the QR reader of the smartphone's LINE app. |
| **Single Sign On (SSO) login** | Click the login button on the "Continue as" confirmation screen. |

**Two-factor authentication (LINE-account login)**

Two-factor authentication is enabled when logging in with a LINE account. When
logging in from a computer browser using an email address, enter the LINE
account email + password, then enter the authentication code shown in the
smartphone's LINE app.

- Once 2FA is executed, the browser used will **not** require 2FA again for
  **one year**.
- If you have already logged in to the [LINE Official Account Manager](https://manager.line.biz/)
  with 2FA, you will not be required to do 2FA again for the same account in the
  console.

### Log in with a business account

Use the **email address and password registered with the Business ID**.

### Log in with a Yahoo! JAPAN ID

The Yahoo! JAPAN ID must be linked to a Yahoo! JAPAN Business ID. Logging in to
a Business ID with a Yahoo! JAPAN ID is **only available in Japan**.

---

## Creating a developer account (first login only)

On your **first** login to the console with a LINE account or business account,
create a developer account:

1. Enter **Developer name** and **Your email**.
2. Read and agree to the [LINE Developers Agreement](https://terms2.line.me/LINE_Developers_Agreement?lang=en).
3. Click **Create my account**.

This step is required only on first login. A completion screen confirms the
developer account has been created.

---

## Account relationships

You need a developer account to use the console. The three account types relate
as follows:

| | Developer account | Business ID | LINE account |
|---|---|---|---|
| **Developer account** | — | One-to-one link (\*) | Linked via Business ID (one-to-one) |
| **Business ID** | One-to-one link (\*) | — | Can be linked one-to-one |
| **LINE account** | Linked via Business ID (one-to-one) | Can be linked one-to-one | — |

\* When you create a developer account, your Business ID is automatically
linked to it.

Key facts:

- A developer account is always linked to a Business ID **1:1**. The link is
  established automatically when the developer account is created on first
  login.
- A developer account and a LINE account are linked **through** a Business ID.
  Linking your LINE account to the Business ID that is linked to your developer
  account links the LINE account to the developer account.

**Notes on the developer-account ↔ Business-ID link**

- Deleting the Business ID linked with your developer account makes the
  developer account no longer loggable-in.
- A Business ID linked with a developer account **cannot be changed later**.

**Email addresses are managed separately** — the name and email address
registered for the developer account, Business ID, and LINE account are
independent and may differ.

### Account relationships when creating a new Business ID

When you first log in and create a **new** Business ID, whether your LINE
account ends up linked depends on the account type used to create the Business
ID:

| Account type used to create Business ID | LINE account linked to developer account |
|---|---|
| LINE account | The LINE account used to create the Business ID |
| Business account (email + password) | None (\*) |

\* A LINE account can be linked to a Business ID created with a business
account at any time later.

---

## Linking a Business ID with a LINE account

You can link **only one Business ID per LINE account** — multiple Business IDs
cannot be linked to a single LINE account.

Steps:

1. Log in to the [LINE Developers Console](https://developers.line.biz/console/).
2. Click the icon in the top-right corner.
3. Click the account information to open the profile screen.
4. Click **Go to Business ID Profile**.
5. Click the link icon next to **"Unlinked"** in the LINE account section.
6. Log in to the LINE account to link.
7. On completion, the LINE account is linked to the Business ID.

**"This LINE account is already in use."** — The LINE account being linked must
not already be linked to another Business ID. Linking to a LINE account that is
already linked elsewhere shows this message and the link fails.

> Linking the LINE account to the Business ID (which is linked to the developer
> account) also links the LINE account to the developer account.

---

## Unlinking a LINE account from a Business ID

To unlink, you must first register an **email address and password (business
account)** with the Business ID. Unlinking the LINE account from the Business ID
also invalidates the link between the developer account and the LINE account.

Steps:

1. Log in to the [LINE Developers Console](https://developers.line.biz/console/)
   with the Business ID whose LINE account you want to unlink.
2. Click the icon in the top-right corner.
3. Click the account information to open the profile screen.
4. Click **Go to Business ID Profile**.
5. Click the delete icon in the LINE account section.
   - If no email address and password (business account) is registered, the
     delete icon is **not** shown — register an email/password via the edit
     icon in the email address section first.
6. Click **Delete** on the confirmation screen.
7. The Business ID and the LINE account are unlinked.

---

## Available features by LINE-account link status

The channel types a developer account can **create** depend on whether the
developer account is linked to a LINE account. (Feature availability is also
constrained by the developer's assigned roles — see
`references/roles-and-permissions.md`.)

| Link status | LINE Login | Blockchain Service | LINE MINI App |
|---|---|---|---|
| Developer account linked to a LINE account | ✅ | ✅ | ✅ |
| Developer account **not** linked to a LINE account | ✅ | ❌ | ✅ |

Messaging API channels are created by creating a LINE Official Account — see
[Get started with the Messaging API](https://developers.line.biz/en/docs/messaging-api/getting-started/).
