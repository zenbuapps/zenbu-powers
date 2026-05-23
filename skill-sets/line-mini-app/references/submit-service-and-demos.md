# Submission, Service Operation, Design Specs & Demos

Source:
- `https://developers.line.biz/en/docs/line-mini-app/submit/submission-guide/`
- `https://developers.line.biz/en/docs/line-mini-app/service/service-operation/`
- `https://developers.line.biz/en/docs/line-mini-app/service/line-mini-app-ads/`
- `https://developers.line.biz/en/docs/line-mini-app/service/update-service/`
- `https://developers.line.biz/en/docs/line-mini-app/service/line-mini-app-oa/`
- `https://developers.line.biz/en/docs/line-mini-app/design/line-mini-app-icon/`
- `https://developers.line.biz/en/docs/line-mini-app/design/landscape/`
- `https://developers.line.biz/en/docs/line-mini-app/design/loading-icon/`
- `https://developers.line.biz/en/docs/line-mini-app/demo/*`
- `https://developers.line.biz/en/docs/line-mini-app/technicalcase/*`

## Table of contents

- Submitting a LINE MINI App for verification review
- The review process & status flow
- Re-review after updating a verified MINI App
- Running your service & conditions for service messages
- Place ads in LINE MINI Apps
- Using a LINE Official Account
- Design specs (icon, safe area, loading icon)
- Demo apps & technical case studies

---

## Submitting a LINE MINI App for verification review

A new channel creates an unverified MINI App with some features restricted. To
become a verified MINI App, the LINE MINI App must pass LY Corporation's review.

> For **Taiwan or Thailand**, only LINE MINI App channels under a
> [certified provider](https://developers.line.biz/en/docs/line-developers-console/overview/#certified-provider)
> can apply. Become a certified provider via LINE Biz-Solutions (Taiwan) or LINE
> for Business (Thailand).

### Things to check before requesting review

- Adherence to all guidelines/rules — in particular: icon specs, safe area for
  landscape mode, loading icon, custom action button, performance guidelines.
- Adherence to the [LINE MINI App Policy](https://terms2.line.me/LINE_MINI_App?lang=en).
- Console info is accurate and up-to-date — the provider name must match the
  service provider; the **Channel description** must be a correct service
  description; in the privacy policy, the company acquiring user data must match
  the provider name.
- The Published channel's LIFF URL and the Review channel's LIFF URL reflect the
  same service. (LY Corporation checks the Review channel's LIFF URL; channel/
  LIFF settings are auto-copied to the Review channel, but the LIFF URL itself
  must reflect the same service.)

### Review period

Approximately **1–2 weeks**. A rejection adds a few more days for
re-application/re-review. The completion date cannot be specified.

### Reviewing multiple LINE MINI Apps

When reviewing multiple LINE MINI Apps at once (same package, same brand, etc.),
first request review for one; once it's approved, request a batch review.

## The review process & status flow

### 1. Submit an application for review

Enter the required info on the **Review request** tab in the Console and submit.
Results show in the Console and are emailed to the registered address.

- If you restricted access by basic authentication, inform LY of the username
  and password in **Reference materials for the review**.
- After requesting, you can **cancel** from **Cancel review request** as long as
  the review hasn't begun. Once it begins (status "Reviewing"), you cannot
  cancel or change the entered info.
- Once the review begins, you can access the Review channel's LIFF URL.
- For services with reservations, payments, or orders, you **must** enter test
  scenarios (accounts, products, stores) in **Reference materials for the
  review**.
- The review is based on the **Channel description** — provide a specific
  service description (Bad: "LINE FRIENDS STORE is a store for LINE character
  goods." Good: "This is a mobile ordering service at the LINE FRIENDS STORE…").
- **When using IAP**: first [apply to use IAP](https://developers.line.biz/en/docs/line-mini-app/in-app-purchase/request-iap-review/);
  once approved, turn on the **Apply to publish in-app purchase** toggle in the
  **Review request** tab. If IAP isn't approved yet, you can't submit for
  verification review even with the toggle on. You can't submit a verification
  review while the IAP application is under review, and you can't apply for IAP
  during the verification review.

### 2. After approval

The workflow differs by whether it's the first submission or an
already-published verified MINI App:

**First submission** — the channel status auto-changes to "Approved" then
immediately to "Reflected". Click **Search enable** in the **Review request**
tab to let users search for the LINE MINI App within LINE. Even at "Reflected",
users can't search until search is enabled. If **Search enable** isn't activated
within 30 days (incl. weekends/holidays) after "Reflected", search is auto-
enabled at 9:00 AM JST on the 31st day. Once search is enabled, the channel
status returns to "Not yet reviewed" and you can change settings and resubmit;
changes don't affect the published app until it passes review again and
**Publish changes** is clicked.

**Already published verified MINI App** — the status changes to "Approved".
Click **Publish changes** in the **Review request** tab to manually change the
status to "Reflected". At "Reflected", the review-request changes are applied to
the Published channel and its LIFF (LINE MINI App name, channel settings, LIFF
settings, etc.). If **Publish changes** isn't activated within 30 days after
"Approved", the changes are auto-reflected at 9:00 AM JST on the 31st day. After
reflection, the status returns to "Not yet reviewed".

> The auto status change at 9:00 AM JST on the 31st day may be delayed 1–2
> hours.

### Provider after passing review

If **Region to provide the service** is "Japan", when the channel passes review
the provider becomes a [certified provider](https://developers.line.biz/en/docs/line-developers-console/overview/#certified-provider).

## Re-review after updating a verified MINI App

After a LINE MINI App becomes verified, updating the following info in the
Console requires a **re-review**. All other info can be updated freely.

| Channel tab | Info requiring re-review |
|---|---|
| Basic settings | Channel icon; Channel name; Channel description; Email address; Privacy policy URL; Terms of use URL; Localization (multi-language support); Linked LINE Official Account |
| Web app settings | shareTargetPicker; Channel consent simplification (*); Endpoint URL for Published; Scopes; Add friend option |
| Business information | Service company information; Development company information; Provider information |
| Contact information | All information |
| Service message template | All information |
| In-app purchase | Info within the **Apply to use in-app purchase** tab (updating IAP info also requires IAP re-review) |

\* "Channel consent simplification" can be updated only for LINE MINI App
channels in Japan created before 2026-01-08.

Re-review is **not** required for changes that don't touch Console settings —
but updates to service content/features must still comply with the LINE MINI
App Policy.

> Temporarily replacing the published **Endpoint URL** with a different URL for
> maintenance does **not** require a re-review — the page switches over
> immediately after the change.

Inappropriate expressions in a released LINE MINI App must be corrected
immediately; failure may result in penalties.

## Running your service & conditions for service messages

### Sharing the LINE MINI App link

When sharing your LINE MINI App or its page, [create a permanent link](https://developers.line.biz/en/docs/line-mini-app/develop/permanent-links/).
Use a permanent link especially when: sharing outside LINE (web pages, emails,
social media); sharing via rich messages or rich menus on the LINE Official
Account; implementing a custom action button; sharing via a service message;
using a LINE MINI App POP template with a QR code.

### Conditions for service messages

Service messages may be sent **only** as a confirmation or response to a user
action on the LINE MINI App.

**Allowed notifications:**

| Type | Use case |
|---|---|
| Action Confirmation Notification | Reservation confirmations (restaurants, accommodations); confirmation of purchased tickets/merchandise |
| Action Result Notification | Check-in completion; order shipment completion |
| Reminder Notification | Reservation reminders; reminder for a play/movie/concert with a purchased ticket |

**Disallowed notifications:**

- Notifications that aren't confirmations/responses to user actions (e.g.
  purchase-completion or reminder notifications for tickets bought from ticket
  vending machines).
- Advertisements and event notifications including discounts, shopping rewards,
  new products, coupons, or promotions.

Sending unacceptable content results in temporary prohibition of the Service
Message API; repeated violations may remove the LINE MINI App from LINE.

**Message count limit:** up to 5 messages per user action (applies to each of
action confirmation, action result, and reminder use cases). The limit may
change depending on the use scenario; LY Corporation notifies you at review
time.

**Service message templates:** add a template to the LINE MINI App channel; up
to 20 templates per channel.

## Place ads in LINE MINI Apps

LINE MINI Apps can be monetized by displaying ads. Ads can be placed in both
verified and unverified MINI Apps, but the **service must be provided in Japan**.

The supported ad network is **LY Ads Network Display Ads (Web)** — LINE MINI
Apps only display ads reviewed and approved by LY Corporation.

Steps to place LY Ads:

1. **Check the documentation** (PDF, Japanese only) — covers the placement
   process, the LY Ads site review, and important notes.
2. **Apply to become a network partner** of LY Ads Network Display Ads (Web) via
   the application form (Japanese only). Even prior users of LY Ads Network
   Display Ads (App) or Search Ads must apply separately.
3. **Apply for LY Ads site review** — from the Network Partner Tool, submit the
   LINE MINI App for the LY Ads site review. After passing, issue tags for ad
   placement.

If you became a network partner of the former Yahoo! JAPAN Ads by 2026-03-31, or
of LY Ads Network Display Ads (Web) on/after 2026-04-01, proceed straight to
step 3.

## Using a LINE Official Account

You can promote a LINE MINI App using a LINE Official Account.

**Send rich messages** — visually engaging messages that help users understand
the LINE MINI App's value.

**Set a link in a rich menu** — set your LINE MINI App's
[LIFF URL](https://developers.line.biz/en/glossary/#liff-url) or
[permanent link](https://developers.line.biz/en/glossary/#permanent-link-liff)
in a rich menu so users access the app from the OA chat screen.

**Add the OA as a friend on the LINE MINI App** — two ways:

### Add friend option

Displays an option to add your LINE Official Account as a friend on the
[verification screen](https://developers.line.biz/en/docs/line-mini-app/develop/configure-console/#verification-screen)
or [channel consent screen](https://developers.line.biz/en/docs/line-mini-app/develop/configure-console/#consent-screen-settings).

To use the add friend option, **all** must be true:

- The LINE Official Account uses the Messaging API.
- The Messaging API channel linked to the OA and the LINE MINI App channel
  belong to the **same provider**.
- The operating account has both the **Admin** role for the LINE MINI App
  channel and the **Administrator** role for the LINE Official Account.

How to set the add friend option:

1. In the Console, **Basic settings** tab of the LINE MINI App channel.
2. In "Linked LINE Official Account", click **Edit**.
3. Select the LINE Official Account, click **Update**.
4. **Web app settings** tab of the LINE MINI App channel.
5. In "Add friend option", click **Edit**.
6. Select **On (normal)**, click **Update**.

> For certified providers, the add friend option on the verification screen and
> channel consent screen is enabled by default — unless users turn it off, the
> specified OA is added as a friend when users grant authorization.

> Using Channel consent simplification together with the add friend option may
> prevent the verification screen and channel consent screen from appearing —
> see `develop.md`.

### `liff.requestFriendship()` method

Calling [`liff.requestFriendship()`](https://developers.line.biz/en/reference/liff/#request-friendship)
displays a subwindow prompting users to add your LINE Official Account as a
friend or unblock it.

## Design specs

### LINE MINI App icon specifications

The icon is used in many places: channel consent screen, Home tab, LINE
messages, service messages.

**Prohibited**: do not include the LINE MINI App logo in your icon.

**Required:**

- **Icon size** — the background area (BG SIZE) must be **130×130 px**.
- **Logo size** — the logo (LOGO SIZE) must be min **54×54 px**, max **90×90 px**;
  recommended 54×54 px to 76×76 px.

**Recommended:** design the logo as a stand-alone icon or wordmark for
visibility/quality.

A PSD template file is provided (optional) — it lets you set an icon outline so
the icon is recognizable against a same-color background. Outline color/opacity
by background color:

| Background color | Outline color | Outline opacity |
|---|---|---|
| White (#FFFFFF) | Black (#000000) | 12% |
| Black (#000000) / Dark (#181818) | White (#FFFFFF) | 8% |
| Other color | Black (#000000) | 8% |

**Uploading**: upload from **Channel icon** in the **Basic settings** tab. Only
**PNG and JPEG** are allowed. The uploaded image is auto-cropped with a
transparent background — ensure the logo fits the green square in the preview.

### Safe area of LINE MINI App

Use CSS to keep the LINE MINI App within the safe area (e.g. on notched
devices). LINE MINI App supports normal mode and landscape mode, which need
different safe areas:

**Normal mode** — bottom: 34px.

```
{
  padding-bottom: 34px;
}
```

**Landscape mode** — left and right: 44px; bottom: 21px.

```
{
  padding-right: 44px;
  padding-bottom: 21px;
  padding-left: 44px;
}
```

### Loading icon

The loading icon is a recommended UI element. Download the spinner SVG and use
it as the loading icon:

- Light mode spinner: `https://developers.line.biz/media/line-mini-app/LINE_spinner_light.svg`
- Dark mode spinner: `https://developers.line.biz/media/line-mini-app/LINE_spinner_dark.svg`

The spinner size is **30×30 px**. Center-align it.

## Demo apps & technical case studies

> The demo and technical-case pages contain articles migrated from the LINE API
> Use Case site (closed 2026-03-31); content reflects information at the time of
> publication.

### Demo apps

LY Corporation provides demo LINE MINI Apps (most viewable by scanning a QR code
with LINE on a smartphone). The demos' system/sequence diagrams show how each
uses the LINE API (and include functions not actually implemented in the demo).

| Demo | What it shows |
|---|---|
| Store reservation | Hair-salon / restaurant reservations; reminder service messages before a visit; push messages for sales promotion using the user ID. |
| Table order | Pre-order to payment (incl. delivery) inside and outside a store; separate ordering/payment per person; reduces labor/terminal-lease costs; links the LINE MINI App with a LINE Official Account. |
| Membership card | Digital membership cards on LINE; issue without entering personal info (linked to LINE registration); message delivery based on activity history. |
| Event experience | Combines LINE with the mixway API (multimodal route search) for concerts/festivals; ticket purchase, route search incl. demand mobility, and notifications all in LINE. |
| Mobile experience | Combines TraISARE (integrated mobility data platform) with LINE for personalized mobility — excursion tickets, transit updates, recommendations/coupons. Demo via the demo site. |
| Purchase experience | OMO (Online Merges with Offline) for retail — smartphone checkout, digital membership cards, purchase-history receipts; uses GS1-standard 2D symbols. Demo via the demo site. |
| Travel experience | MaaS on LINE — ticket selection/reservation/payment, route visualization, congestion checks. Demo via the demo site. |

Common demo benefits: no app download or member registration; reminder/push
messages; behavior-history-based messaging (with user consent). Demo system
diagrams are also provided in AWS and Azure variants.

> Demos access your LINE account profile (display name + user ID); the user ID
> is stored on the server and deleted daily. Demo payments use a demo-prepared
> LINE Pay balance — no actual payment.

### Technical case studies

Case studies of companies that adopted the LINE Platform via LINE MINI App:

| Company / service | Summary |
|---|---|
| KIRIFUDA — "Letters from the Forest" | A LINE MINI App for logging environmental actions as NFTs (blockchain). Client built on LIFF; server uses LINE Login + Messaging API; Web3Auth for wallets, Alchemy for NFTs, Google Cloud Tasks for async minting. Emphasizes precise LIFF initialization timing. |
| BraveTechnology — "matoca" / "yoboca" | Queue management (waitlist) and pickup notifications via LINE MINI Apps. Serverless on AWS (Lambda, SQS) with CI/CD; APIs to integrate with POS/ticketing/EC. |
| Classmethod — "CX ORDER" | A cloud service for building mobile-ordering LINE MINI Apps. Built on AWS (CloudFront, ECS, Aurora, DynamoDB, Lambda, SQS) + AWS CDK (TypeScript); Sentry + Slack monitoring; Google Analytics. |
| Grandream — GDL Platform | Provides generic LINE-app functions (friend status, payment, rich menus, 1-on-1 chat) as SaaS/packages so developers focus on business features. AWS (EventBridge, ECS Fargate Spot, ElastiCache) + AWS CDK (TypeScript) for cost reduction. |
| HAKUHODO — "PoHUNT" | A community-revitalization initiative for Asahi Town, Toyama — earn points by scanning QR codes / viewing health info, redeemable for lucky draws; integrates with a ride-sharing service. Built with anybot; AWS EC2; CloudWatch + Zabbix monitoring. |

Common themes across case studies: no per-OS development, low initial/operational
workload, LINE as ID infrastructure to lower the barrier to start, and continued
engagement via the LINE Official Account.
