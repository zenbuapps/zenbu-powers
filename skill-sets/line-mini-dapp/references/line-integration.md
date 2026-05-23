# LINE Integration — LINE MINI App, LINE Login LIFF, Official Account

Source:
- `https://docs.unifi.me/unifi-apps/line-integration`
- `https://docs.unifi.me/unifi-apps/line-integration/line-mini-app`
- `https://docs.unifi.me/unifi-apps/line-integration/line-login-liff`
- `https://docs.unifi.me/unifi-apps/line-integration/official-account`
- `https://docs.unifi.me/unifi-apps/line-integration/invite-friends`
- `https://docs.unifi.me/unifi-apps/design-guide`

## Table of contents

- LINE MINI App vs LINE Login LIFF
- LINE MINI App — channel setup steps
- LINE Login LIFF — channel setup steps
- Official Account (OA) setup, rich menu, welcome message automation
- Invite Friends (ShareTargetPicker)
- Design guide (tab name, OpenGraph, connect button, z-index)

---

## LINE MINI App vs LINE Login LIFF

A Unifi App's LINE version is a web application built with the **LIFF SDK**. It can
be a **LINE MINI App** or a **LINE Login LIFF** — both run inside the LINE mobile
app but use different channel types and onboarding tracks.

- **LINE MINI App** (official doc: LINE MINI App) — a web application delivering
  services inside LINE that meet users' lifestyle needs. No download or complicated
  registration → minimizes bounce, improves CVR. Quick launch from the LINE Home
  Tab, Official Accounts, and external channels (web links, QR codes). **Service
  Messages** allow free transactional notifications (e.g. order confirmations) even
  if the user has not friended the Official Account. Users can share reservations
  or coupons via LINE Talk.
- **LINE Login LIFF** (LINE Front-end Framework) — a web app framework by LY
  Corporation. Integrating the LIFF SDK gives access to LINE Platform info and LINE
  app functionality. LIFF is integrated with LINE Login (safe access to a user's
  profile via the LINE Platform's authorization flow). The **share target picker**
  sends messages to selected LINE friends from a LIFF app without opening a chat
  room. LIFF is cross-browser compatible (works in regular browsers and LINE).
  Provides utilities (LINE app version, device OS type, QR reader) and three screen
  sizes.

## LINE MINI App — channel setup steps

**Onboarding requirements**: LINE MINI App onboarding is available only for
companies with a Japanese Corporate Number or individual business owners residing
in Japan. Global builders wishing to onboard a MINI App must discuss the process
separately with LINE NEXT.

1. **Create LINE Business ID & sign in to LINE Developers** — sign in with a
   personal LINE account or email; create a Business ID to access the LINE
   Developers Console.
2. **Register developer information** — add Developer Name and Email.
3. **Create a Provider** — enter Provider Name and create it.
4. **Create a LINE MINI App channel** — if you deploy both a LINE MINI App and a
   LINE Login LIFF, create both channels under the **same LINE Provider** so the
   user's LINE UID stays consistent across channels (reliable tracking/analytics).
   Fields: Region to provide the service (target country); Channel name (Unifi Apps
   name); Channel description (brief service description).
5. **Basic settings** (LINE Developers → Provider → LINE MINI App Channel → Basic
   settings): Channel icon (130×130px image); Privacy policy URL (must belong to a
   corporate domain); Localization (at least three languages — EN and JP required;
   unclear/ambiguous localization is frequently rejected).
6. **Web app settings** (→ Web app settings): Endpoint URL (Unifi Apps URL —
   development/review/production URLs); Scopes (`openid` required, `profile`
   optional); Add friend option (`On (Normal)`).
7. **Business information**: Customer support page URL; Customer support email;
   LINE Official Account ID (available after step 11); Service company name;
   Service company type (corporate / self-employed); Certificate document
   (business registration certificate); Identification document (representative's
   ID); Website URL; Email (corporate domain); Development company information.
8. **Contact information**: First/Last name; Email (corporate domain — review
   results & notices sent here); Phone number; Company name; Company address;
   Registration number (corporate: Corporate Number; sole proprietor:
   `0000000000000`).
9. **Create a Messaging API channel & LINE Official Account** (Provider → Create a
   new Channel → Messaging API → Create a LINE Official Account). The interface is
   Japanese-only (MINI App is for Japan). Configure SMS verification, account name,
   email, country/region, company name, industry, operation purposes, usage type,
   and Business Manager organization connection.
10. **Enable Messaging API for the LINE Official Account** (LINE Official Account →
    Settings → Enable Messaging API → Select Provider).
11. **Link the LINE Official Account with the LINE Login channel** (LINE Developers
    → Provider → LINE MINI App Channel → Basic settings → Add friend option →
    Linked LINE Official Account → Edit).
12. **Review request** (→ Review request) — can be requested only after completing
    all previous settings. LINE MINI App review is performed by LY Corporation. For
    Web3 review, add the Unifi Tech Support Team as an Admin in the MINI App
    Channel. Onboarding is complete only after all reviews are approved and the
    status becomes **Reflected**.

**Re-verification requirements**: modifying any of these fields after approval
requires re-review — Channel name, Description (Localization), Privacy policy URL,
Endpoint URL, Linked LINE Official Account, Business information fields, Contact
information fields. Modifications are not reflected until the re-review is approved;
ensure stable information before the initial review.

## LINE Login LIFF — channel setup steps

1. **Create LINE Business ID & sign in to LINE Developers** — same as MINI App.
2. **Register developer information** — Developer Name and Email.
3. **Create a Provider** — Provider Name.
4. **Create a LINE Login channel** — Region to provide the service; Company or
   owner's country/region (legal entity country); Channel name (Unifi Apps name);
   Channel description; App types (select **Web app**).
5. **Create a LIFF** (LINE Developers → Provider → LINE Login Channel → LIFF tab):
   LIFF app name (Unifi Apps name); Size (`Full`); Endpoint URL (Unifi Apps URL);
   Scopes (`openid` required, `profile` optional); Add friend option (`On (Normal)`,
   set to `On (aggressive)`).
6. **Create a Messaging API channel & LINE Official Account** (→ Create a new
   Channel → Messaging API): SMS verification, account name, email, legal entity
   country/region, company name, industry.
7. **Enable Messaging API for the LINE Official Account** (LINE Official Account →
   Settings → Enable Messaging API → Select Provider).
8. **Link the LINE Official Account with the LINE Login channel** (→ Basic settings
   → Add friend option → Linked LINE Official Account → Edit → Select the created OA).
9. **Publish your LINE Login LIFF (Production)** (→ Developing → Publish). LIFF
   must be **Published** in Production for demo submission. In `Developing` status,
   LIFF access is restricted and the demo review cannot proceed (a `403` error
   occurs accessing a LIFF URL whose channel is not Published).

## Official Account (OA)

A LINE Official Account is used as a communication channel for a Unifi App —
announcements, onboarding, marketing campaigns, customer support. Create one per
"Create an Account | LINE for Business".

### OA types

- **Unverified OA (recommended)** — no approval from LINE's local legal entity;
  immediately usable and easy to integrate; recommended for all Unifi Apps
  onboarding.
- **Verified OA** — requires approval from LINE local entities in Japan, Thailand,
  or Taiwan; approval can take 3+ months; not recommended unless legally required.

### OA profile

Profile (name, icon, description) should follow the same style and branding as the
Unifi App.

### Contents — welcome message

- **Text**: default language English (OA is globally accessible). Optional
  languages: Japanese, Thai, Chinese. Multiple languages may be included in one
  welcome message.
- **Rich message**: may include images or videos with descriptive text. A **CTA
  URL is required** (e.g. the Unifi Apps URL).

### Rich menu setup

Location: LINE Official Account > Home > Chat screen > Rich menus > Menu content
setting. Default language: English.

Template guidelines (structure to maximize conversion into the Unifi App):

- **A** — LINE MINI App URL or LINE Login LIFF URL for the Unifi App.
- **B & C** — if A contains the LINE MINI App URL, put the LINE Login LIFF URL in
  B; for other sections, put URLs for social media, the website, or related
  channels.
- **D** — Unifi URL. Image: Unifi Icon + Unifi Wordmark (Unifi_Logo_Primary).
  URL: `https://liff.line.me/2006533014-8gD06D64`.

### Sending messages

To send messages to specific users, operate bots, or integrate the OA with
external systems, use the **Messaging API** (LINE Messaging API). Configure message
content via the Message Objects API.

### (Optional) Multi-language welcome message automation

1. Create an OA channel on LINE Developers.
2. Implement an API to receive Webhook events for the OA channel (used in step 8).
   Method `POST`, flexible URL. Refer to the Webhook specifications. Verifying the
   webhook signature is recommended.
3. When a **Follow Event** is received via the webhook, retrieve the `userId` from
   the request body.
4. Use the `userId` to fetch the user's LINE language setting. Use the channel
   access token issued from the Messaging API tab; use the **Get Profile API** to
   retrieve the user's language.
5. Create templates for OA messaging — configure content in multiple languages per
   locale, store locally or in the cloud (refer to the Message Objects API for
   template formatting). Example: for Korean and English, save `oa_ko.json` and
   `oa_en.json`.
6. Load the template matching the user's language and call the OA Send API.
7. Access the Messaging API tab in LINE Developers.
8. Set the API endpoint built in steps 1–6 as the Webhook URL; turn **Use Webhook**
   ON.
9. After step 8, followers receive an automated welcome message in their language.
   Turn OFF the welcome message setting in the existing Official Account Manager.

### LINE OpenChat (optional)

Useful for two-way communication outside the OA. Available only in Japan, Thailand,
and Taiwan. You need a LINE account registered in each country to create OpenChat
there. You may add one translation bot (e.g. Korean ↔ English auto-translation).

## Invite Friends

The **Invite Friends** feature is available in LINE versions (LINE MINI App and
LINE Login LIFF). It is a key user-acquisition / activation tool that drives
organic growth within the LINE ecosystem (viral spread). Strongly recommended.

| Version | Invite Friends | Method |
|---|---|---|
| LINE MINI App | Yes | ShareTargetPicker supported |
| LINE Login LIFF | Yes | ShareTargetPicker supported |
| Web | No | Implement via referral URL copy |

### How to implement (LIFF APIs)

Use these LIFF APIs: **Sending Messages** and **ShareTargetPicker**.

**Restricting message targets** — to ensure messages go only to the user's LINE
friends (not to Official Accounts or group chats), set `options.isMultiple` to
`false`:

```js
options.isMultiple = false;
```

## Design guide

- **Browser tab name** — set the format `Name | Unifi Apps` to indicate the app is
  part of the Unifi Apps ecosystem.
- **OpenGraph** — configure Open Graph for the LINE MINI App and LINE Login
  LIFF/Web URLs. Without it, blank spaces or alternative text appear where the link
  is displayed, reducing content delivery effectiveness across marketing channels.
- **Connect button** — if Wallet Connect is integrated when initiating specific
  actions (Buy, NFT Airdrop, FT Airdrop, etc.) rather than using a standard button,
  ensure Wallet Connect is triggered when those actions execute. If you create a
  button similar to Wallet Connect, follow the connect-button guidelines.
- **z-index for pop-ups** — the SDK's pop-up uses `z-index` `999` (to prevent
  blocking new windows from the browser). **Set any of your own pop-ups' z-index
  below `999`** to avoid conflicts. (A historical note in v1.2.0 referenced
  `9999999`; the current design guide states `999`.)
- **Landscape mode** — if your Unifi App is optimized for landscape, ensure it
  operates in landscape even when the device is in portrait, and when auto-rotate
  is used.
- **Maintenance mode** — provide a maintenance screen during scheduled/emergency
  maintenance; include estimated end time and contact info.
- **Close confirmation dialog** — display a confirmation popup when the page is
  about to be closed (so an accidental back-button press does not lose progress).
  See `references/unifi-pay.md` → "Reusable code snippets" for the React and
  Vanilla JS example code.
