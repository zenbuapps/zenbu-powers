# Developers, Providers & Channels

Source: `https://developers.line.biz/en/docs/line-developers-console/overview/`

## Table of contents

- The LINE Platform & the console
- Developer
- Provider — creating, deleting, count limit, certified provider
- Channel — creating, deleting, count limit
- Channel ↔ provider linkage rules
- LINE Official Account Manager

---

## The LINE Platform & the console

LY Corporation provides two third-party developer features through the **LINE
Platform**:

- Authenticating users with the credentials of their LINE account — **LINE Login**.
- Exchanging LINE messages with users — the **Messaging API**.

To use these features you create a **channel** on a managing tool such as the
**LINE Developers Console** (`https://developers.line.biz/console/`). Creating a
channel grants permission to use the LINE Platform feature.

The console manages three things: **Developer**, **Provider**, and **Channel**.

---

## Developer

On the LINE Developers site, anyone who accesses the LINE Developers Console is
a **Developer**.

Registering developers on providers and channels lets you control what
information each developer can view or edit in the console. For example, a role
on a channel created by one developer can be assigned to another developer. See
`references/roles-and-permissions.md`.

---

## Provider

A **Provider** is the LINE Developers Console representation of a **Service
provider** — an individual developer, company, or organization that provides a
service and acquires user information to that end. (In LINE MINI App docs the
term is **Service company**.)

### Creating a provider

1. On the **Providers** page of the Console home, click **Create**.
2. In the **Create a new provider** screen, enter the desired **Provider name**
   and confirm with **Create**.

**Tips**

- The provider name is shown on the **user consent screen**; users identify the
  service provider by it. Do **not** use temporary names (internal brand names,
  project codenames, etc.).
- When providing service as a company or organization, name the provider after
  the company or organization.
- A channel used by a service provider must be created within the **same**
  provider.

### Deleting a provider

Based on your provider role, delete a provider with the **Delete** button at the
bottom of the **Settings** tab. Requires the provider Admin role; **a provider
with existing channels cannot be deleted**. See "Provider roles" in
`references/roles-and-permissions.md`.

### The number of providers that can be created

| Restriction | Description |
|---|---|
| LINE Developers Console restriction | Each developer can create up to **10 providers**. The 11th cannot be created. |

### Certified provider

Once you become a **certified provider**, the text **"Certified"** is shown on
the channel consent screen that users review, and you may configure and publish
a [Provider page](https://developers.line.biz/en/docs/partner-docs/provider-page/).

A certified provider indicates LY Corporation has confirmed the authenticity of
the service provider that created the provider. LY Corporation checks:

- Whether the organization is a real entity.
- Whether the application was submitted by someone who belongs to the
  organization (or a representative).
- Whether the organization has an established, disclosed privacy policy.

**Required procedure** — In principle only **corporate users** are eligible. A
specific application is required; contact a sales representative or LY
Corporation Sales partners.

**Notes**

- The "Certified" display does **not** indicate LY Corporation's support or
  warranty for the service.
- Changing a certified provider name requires submitting an application for
  review to LY Corporation.

---

## Channel

A **Channel** enables a service provider to use LINE Platform features. To
develop a service that uses the LINE Platform you must create a channel. The
LINE Platform uses the credentials associated with the channel to confirm the
developer has permission to use the platform.

**Prohibition (user-data protection)** — When using the LINE Platform for
multiple services, do **not** link the LINE user data obtained from each
individual service.

### Creating a channel

**Messaging API channels** are created by creating a **LINE Official Account**.
See [Get started with the Messaging API](https://developers.line.biz/en/docs/messaging-api/getting-started/).

For any **other** channel type:

1. On the **Channels** tab of your provider page, choose the channel type.
   These channel types can be created on the console:

   | Type | Description |
   |---|---|
   | [LINE Login](https://developers.line.biz/en/docs/line-login/) | Use LINE Account credentials to authenticate users of your service. |
   | Blockchain Service | Provide a service that uses blockchain service. |
   | [LINE MINI App](https://developers.line.biz/en/docs/line-mini-app/quickstart/) | Provide a service through a LINE MINI App without developing a native app. |

2. Enter the channel name plus any required/optional information and click
   **Create**.

   **Channel name restriction** — `"LINE"` or a similar string cannot be
   included in the channel name.

   **Precautions for a LINE Login channel**

   - Immediately after creation, a LINE Login channel is in **`Developing`**
     mode.
   - In `Developing` mode, only developers registered as the channel **Admin**
     or **Tester** can use LINE Login.
   - To let end users use LINE Login, set the channel to **`Published`**.

#### Precautions for channel & provider linkage

- Once a channel is created, **you cannot move the channel to another provider
  later**.
- If you [use the Messaging API with an existing LINE Official Account](https://developers.line.biz/en/docs/messaging-api/getting-started/#using-oa-manager)
  created via the [LINE Official Account Manager](https://manager.line.biz/),
  you must create a new provider or pick an existing one for the channel during
  initial setup — and again, the channel cannot be moved afterwards.
- When developing a service that links a **Messaging API channel** with a
  **LINE Login channel**, create both channels within the **same provider**.
- A LINE user gets a **different user ID per provider**. User IDs cannot be used
  to identify the same user across channels under different providers.

**Cases requiring special attention when creating a channel**

- Channels and providers managed by individuals or companies.
- Channels of unrelated services or companies created under one provider.
- Channels created under a provider managed by a service (company) that
  operates channel-management tools.

Because channels cannot be moved between providers later and a user has
different user IDs per provider, problems may arise. Assess the risks and create
each channel under the appropriate provider.

### Deleting a channel

Based on your channel role, delete a channel with the **Delete** button at the
bottom of the **Basic Settings** tab. Requires the channel Admin role. See
"Channel roles" in `references/roles-and-permissions.md`.

> The **Blockchain Service** channel and the **LINE MINI App** channel cannot be
> deleted.

### The number of channels that can be created

| Restriction / specification | Description |
|---|---|
| LINE Developers Console restriction | A developer can own a maximum of **100 channels with an Admin role under one provider**, regardless of channel type. |
| LINE Official Account Manager restriction | A developer can own a maximum of **100 LINE Official Accounts** per account logged in to the LINE Official Account Manager. |

---

## LINE Official Account Manager

You can log in to the [LINE Official Account Manager](https://manager.line.biz/)
with the **same account** you use in the LINE Developers Console, to check and
configure your LINE Official Account.
