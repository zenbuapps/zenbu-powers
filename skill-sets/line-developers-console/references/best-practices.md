# Best Practices for Provider & Channel Management

Source: `https://developers.line.biz/en/docs/line-developers-console/best-practices-for-provider-and-channel-management/`

Five official best practices for managing providers and channels in the
[LINE Developers Console](https://developers.line.biz/console/). Each is stated
as a good example vs a bad example.

## Table of contents

- Example organizations & characters (used throughout)
- 1. Grant Admin roles to several developers
- 2. Create a provider for each service provider
- 3. Create channels you want to link under the same provider
- 4. Create channels by region
- 5. Register a mailing-list email on the Basic settings tab

---

## Example organizations & characters

The docs use these hypothetical organizations and characters:

| Organization / character | Description |
|---|---|
| Beverage Manufacturer A | A beverage manufacturer offering the coffee drink "Brown Coffee" and the tea drink "Cony Tea". Outsources LINE Platform development to Development Company C and D. |
| Beverage Manufacturer B | A beverage manufacturer offering the cola drink "Sally Cola". The US subsidiary of Beverage Manufacturer A. |
| Development Company C | Outsourced by Beverage Manufacturer A; developing a "Brown Coffee" campaign site using LINE Login. |
| Development Company D | Outsourced by Beverage Manufacturer A; developing a "Brown Coffee" LINE Bot and a "Cony Tea" LINE Bot using the Messaging API. |
| Brown | An employee of Beverage Manufacturer A. |
| Cony | An employee of Beverage Manufacturer A. |

Beverage Manufacturer A manages the provider "Beverage Manufacturer A" with
these channels under it:

| Channel type | Channel name | Description |
|---|---|---|
| LINE Login | Brown Coffee | A channel for a "Brown Coffee" campaign site. |
| Messaging API | Brown Coffee | A channel for a "Brown Coffee" LINE Bot. |
| Messaging API | Cony Tea | A channel for a "Cony Tea" LINE Bot. |

---

## 1. Grant Admin roles to several developers for each provider and channel

| | |
|---|---|
| **Good example** | Grant Admin roles to several developers for each provider and each channel. |
| **Bad example** | Grant the Admin role to only one developer for each provider and each channel. |

If the only developer with an Admin role for a provider/channel becomes
unavailable (sudden resignation, etc.), the provider/channel can no longer be
accessed with an Admin role, making continued operation difficult. Grant Admin
roles to **several** developers to prepare for such situations.

Example: if both Brown and Cony have the Admin role for the provider "Beverage
Manufacturer A" and the LINE Login channel "Brown Coffee", then even if Brown
suddenly resigns, Cony can continue operating the provider and channel.

Provider and channel roles are independent — granting a provider Admin role does
**not** grant Admin roles for the channels under that provider. See
`references/roles-and-permissions.md`.

**Notes on deleting developers from a provider** — When deleting developers from
a provider, if you check **"Also delete the selected developer(s) from the
channels that belong to this provider."** and click **OK**, the selected
developers are deleted from the channels under the provider. This can leave a
channel with **zero developers holding the Admin role**. Before checking that
option, confirm other developers have Admin roles for those channels.

---

## 2. Create a provider for each service provider

| | |
|---|---|
| **Good example** | Create a separate provider for Beverage Manufacturer A and for Beverage Manufacturer B. |
| **Bad example** | Create one provider shared by Beverage Manufacturer A and Beverage Manufacturer B. |

A service provider (service company in LINE MINI App) — an individual developer,
company, or organization that provides services and obtains user information —
is registered as a provider in the console. Create **one provider per service
provider**.

Example: Beverage Manufacturer B (US subsidiary of A) wants a "Sally Cola" LINE
Bot. Instead of creating a Messaging API channel under provider "Beverage
Manufacturer A", Beverage Manufacturer B creates its **own provider** and
creates the Messaging API channel under it.

When a company (outsourcer) outsources LINE Platform development to other
companies, create the provider for the **outsourcer** as the main service
provider. Example: Beverage Manufacturer A outsources to Development Company C
and D. The main service provider is the outsourcer, Beverage Manufacturer A — so
create the provider for **Beverage Manufacturer A** (not for C or D) and create
channels under it.

---

## 3. Create channels that you want to link under the same provider

| | |
|---|---|
| **Good example** | Create channels you want to link under the same provider. |
| **Bad example** | Create channels you want to link under different providers. |

When developing a service that links multiple channels, create the channels to
be linked under the **same provider**. Channels under the same provider assign
the **same [user ID](https://developers.line.biz/en/glossary/#user-id)** to the
same user. **Channels cannot be moved to a different provider later** — do not
split linked channels across providers.

Example: to encourage users to add the "Cony Tea" LINE Bot as a friend via the
[add friend option](https://developers.line.biz/en/docs/line-login/link-a-bot/)
when they log in to the "Brown Coffee" campaign site, create the "Brown Coffee"
LINE Login channel and the "Cony Tea" Messaging API channel under the **same**
provider "Beverage Manufacturer A".

When using the LINE Platform for multiple services, you must publish the
provider page and comply with the terms of use to link LINE user data obtained
from each service — see [Cautions on the common use of user IDs](https://developers.line.biz/en/docs/partner-docs/provider-page/#cautions-on-the-common-use-of-user-ids).

---

## 4. Create channels by region where you provide services

| | |
|---|---|
| **Good example** | Create channels by region where you provide services. |
| **Bad example** | Use a single channel to provide services to multiple regions. |

If you provide services in multiple countries or regions under the same brand,
create **separate channels per region** instead of sharing a single channel.

Example: Beverage Manufacturer A runs a "Brown Coffee" campaign website in
Japan and decides to launch campaign websites for the same product in Taiwan
and Thailand. Create **separate LINE Login channels per region** under the
provider "Beverage Manufacturer A".

---

## 5. Register a mailing-list email address in Email address on the Basic settings tab

| | |
|---|---|
| **Good example** | Register a mailing-list email address in **Email address** on the **Basic settings** tab. |
| **Bad example** | Register a personal email address in **Email address** on the **Basic settings** tab. |

Important announcements are sent to the email address registered in **Email
address** on the **Basic settings** tab of each channel. Register a
**mailing-list** address (not a personal address) so the team keeps receiving
announcements even when individuals are unavailable.

Example: on the **Basic settings** tab of the LINE Login channel "Brown
Coffee", register the mailing-list address of Brown and Cony's department, so
the department receives important channel announcements even when Brown and
Cony are out of office.

Important channel announcements can also be received at the email addresses of
developers who have channel roles, or via the notification center — see
`references/notifications.md`.
