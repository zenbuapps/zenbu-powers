---
name: line-developers-console
description: >-
  LINE Developers Console official reference at API-reference depth. Covers the
  whole management-tool layer of the LINE Platform: what a Developer, Provider,
  and Channel are and how they relate; creating / deleting providers and
  channels; provider and channel limits; certified providers and provider
  pages; the immovable channel-to-provider linkage and per-provider user ID
  rule; logging in to the console with a Business ID; creating a developer
  account on first login; the developer account / Business ID / LINE account
  relationship; linking and unlinking a LINE account; which channel types a
  developer can create based on LINE-account link status; provider roles (Admin
  / Member / No role) and channel roles (Admin / Member / Tester) with the full
  per-tab, per-channel-type permission matrices for LINE Login, Messaging API,
  Blockchain Service and LINE MINI App channels; inviting developers by email,
  importing developers from a provider, editing roles, removing developers;
  best practices for provider and channel management; and the console
  notification center (notification types, email vs notification-center
  delivery, configuring notification settings). Use this skill whenever the
  task touches the LINE Developers Console / console.line.biz / the
  developers.line.biz site: setting up a provider, creating a Messaging API or
  LINE Login or LINE MINI App or Blockchain Service channel, deciding which
  provider a channel belongs to, granting or revoking developer access,
  understanding why a teammate can or can't see Channel secret / Channel ID /
  the Roles tab, debugging "This LINE account is already in use", first-time
  console login, Business ID, two-factor authentication on console login,
  developer account, channel modes (Developing / Published), webhook-error or
  QR-code visibility, or LINE Developers Console notifications. Trigger on
  mentions of: LINE Developers Console, LINE Developers site, console.line.biz,
  provider, channel, developer account, Business ID, channel role, provider
  role, Admin / Member / Tester role, Invite by email, Import from provider,
  certified provider, provider page, Channel secret, Assertion Signing Key,
  LINE Official Account Manager, notification center.
---

# LINE Developers Console Reference

API-reference-level coverage of the **LINE Developers Console** documentation
section, extracted from the official docs at
`https://developers.line.biz/en/docs/line-developers-console/`.

The console is the management tool for the LINE Platform. It is where you
create and configure the **channels** (credentials) that LINE Login, the
Messaging API, LINE MINI App, and Blockchain Service all run on. This skill
covers the *console itself* — the account / provider / channel / role / login /
notification model — not the runtime APIs. For the Messaging API runtime
(endpoints, message objects, webhooks), see the sibling `line-message-api`
skill.

## When this skill applies

Any work on the LINE Developers Console:

- Onboarding: first console login, creating a developer account, linking a
  Business ID to a LINE account.
- Structure: creating a provider, creating a channel (LINE Login / Messaging
  API / LINE MINI App / Blockchain Service), deciding which provider a channel
  belongs to, becoming a certified provider.
- Access control: granting/revoking developer access, understanding why a
  teammate can or can't see a given setting, the full provider/channel role
  permission matrices.
- Governance: best practices for provider and channel management.
- Notifications: the console notification center and email notifications.

It is concept- and UI-driven (there is no HTTP API for the console itself), so
the reference files document **what each entity is, what each role can do, and
the exact rules and limits** rather than request/response shapes.

## Core mental model — three entities

| Entity | What it is | Identified by |
|---|---|---|
| **Developer** | Anyone who accesses the console. Always 1:1-linked to a Business ID. | Developer account |
| **Provider** | The service provider (individual / company / organization). "Service company" in LINE MINI App. | Provider ID |
| **Channel** | Per-service credentials that authorize use of a LINE Platform feature. | Channel ID + Channel secret |

A channel belongs to exactly one provider and **can never be moved** to another
provider afterwards. A LINE user gets a **different user ID per provider** — the
same user ID is shared only across channels under the *same* provider. These
two facts drive almost every provider/channel design decision.

## Rules you must not get wrong

- **Channel ↔ provider linkage is permanent.** Channels you intend to link
  (e.g. a LINE Login channel + a Messaging API channel sharing user IDs, or
  using add-friend option) must be created under the **same provider** from the
  start. There is no move/transfer operation.
- **User IDs are per-provider.** A user ID cannot identify the same user across
  channels under different providers.
- **Provider roles and channel roles are independent.** Provider Admin does not
  grant any channel access; channel access does not grant any provider access.
  Granting a developer provider access never auto-grants channel access.
- **A new LINE Login channel starts in `Developing` mode** — only Admin/Tester
  developers can use it until it is set to `Published`.
- **Limits:** 10 providers per developer; up to 100 channels with an Admin role
  per provider; up to 100 LINE Official Accounts per LINE Official Account
  Manager account; up to 30 channel access tokens per channel (token detail
  lives in `line-message-api`).
- **`Import from provider`** assigns a channel role *immediately* with no
  invitation acceptance; **`Invite by email`** requires the invitee to click
  the link, and the role goes to whichever developer account is logged in when
  they accept — not necessarily the invited email address.

## Reference file map

| File | Contents |
|---|---|
| `references/providers-and-channels.md` | The Developer / Provider / Channel model; creating & deleting a provider; provider count limit; certified provider & provider page; creating & deleting a channel; the channel-type table; channel name restrictions; LINE Login `Developing`/`Published` modes; permanent channel-provider linkage; per-provider user IDs; channel count limits; LINE Official Account Manager relationship |
| `references/account-and-login.md` | Logging in to the console via Business ID; the three Business ID login methods (LINE account / business account / Yahoo! JAPAN ID); LINE-account login sub-methods & two-factor authentication; creating a developer account on first login; developer account ↔ Business ID ↔ LINE account relationship matrix; linking & unlinking a LINE account; the channel types available by LINE-account link status |
| `references/roles-and-permissions.md` | Provider roles (Admin / Member / No role) full permission matrix; channel roles (Admin / Member / Tester / No role); common-to-all-channels Basic settings / Roles tab / Developing-test matrices; per-channel-type matrices for LINE Login, Messaging API, LINE MINI App channels; adding / editing / deleting developers on providers and channels; `Invite by email` vs `Import from provider`; the Admin-in-100-Messaging-API-channels restriction |
| `references/best-practices.md` | Five official best practices: grant Admin to several developers; one provider per service provider; link-intended channels under one provider; one channel per region; register a mailing-list email on the Basic settings tab — each with good/bad examples |
| `references/notifications.md` | The console notification center: the five notification types (Important announcements / Activity / News / Channel activity / Provider activity) with their triggering events; configuring notification types & delivery (notification center vs verified email); checking notifications via the bell icon |

## Quick topic index

```
ONBOARDING
  Log in to Console        Business ID required; "Log in to Console" button, top-right
  Business ID login        LINE account | business account | Yahoo! JAPAN ID (JP only)
  Developer account        Created on first login; 1:1 with Business ID; permanent link
  Link LINE account        1 Business ID per LINE account; via Business ID profile
  2FA                      Auto-enabled for LINE-account login; browser trusted ~1 year

STRUCTURE
  Provider                 Service provider; up to 10 per developer
  Channel                  Per-service credentials; up to 100 (Admin role) per provider
  Channel types            LINE Login | Messaging API | LINE MINI App | Blockchain Service
  Messaging API channel    Created by creating a LINE Official Account
  Certified provider       LY Corporation-verified; "Certified" on consent screen; application required
  Provider linkage         Permanent — a channel cannot be moved between providers
  User ID                  Different per provider; shared only within one provider

ACCESS CONTROL
  Provider roles           Admin | Member | No role
  Channel roles            Admin | Member | Tester  (LINE MINI App: Admin | Tester)
  Add developer            Invite by email (needs acceptance) | Import from provider (instant)
  Roles tab                Visible/editable to channel Admin only

GOVERNANCE
  Best practices           Multiple Admins; provider-per-service-provider; co-locate linked
                           channels; channel-per-region; mailing-list email

NOTIFICATIONS
  Notification types       Important announcements | Activity | News | Channel activity | Provider activity
  Delivery                 Notification center (bell icon) and/or verified email
  Important announcements  Cannot be turned off
```

## Working notes

- The console URL is `https://developers.line.biz/console/`; the docs site is
  `https://developers.line.biz/`. There is no programmatic API for the console.
- "Provider" in standard docs == "Service company" in LINE MINI App docs.
- The provider name is shown on the user consent screen — never use a temporary
  or internal-only name.
- A channel name may not contain `LINE` or a similar string.
- Blockchain Service and LINE MINI App channels **cannot be deleted** from the
  console; LINE Login and Messaging API channels can (channel Admin only).
- "Your user ID" and Blockchain Service channel creation require the developer
  account's Business ID to be linked to a LINE account.
- When deleting a developer from a provider, the "also delete from channels"
  option can strand a channel with zero Admins — verify other Admins exist
  first. It also never removes developers whose channel status is `Pending`.
