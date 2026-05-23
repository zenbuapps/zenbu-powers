# Usage Guidelines & Release Notes

Sources:
- `https://developers.line.biz/en/docs/line-social-plugins/general/guidelines/`
- `https://developers.line.biz/en/docs/line-social-plugins/resources/release-notes/`

---

# Usage Guidelines for the LINE Social Plugin

The Guidelines are the basic rules governing use of the LINE Social Plugin
provided by **LY Corporation** ("the Company"). They are published in 6
languages (English, 日本語, 한국어, 中文, ภาษาไทย, Bahasa Indonesia).

**Agreeing is implicit:** By installing a LINE Social Plugin Button on an
External Site, the Installer is **deemed to have agreed** to the Guidelines. You
must read and agree to them before using any plugin (the install-guide builders
require ticking an "I agree to the LINE Social Plugins guidelines" checkbox
before showing the generated code).

## Definitions (key terms)

| Term | Meaning |
|---|---|
| **LINE** | The "LINE" service operated by the Company. |
| **LINE Social Plugin Button** | Collectively/each of: LINE Share Button, Add Friend Button, Like Button. |
| **LINE Share Button** | Function to share information on External Sites with other Users and post it to Timeline. |
| **Add Friend Button** | Function through which a User adds a LINE Official Account (etc.) from an External Site to their Friends list. |
| **Like Button** | Function through which Users recommend information on an External Site; Installers can display the recommend count or post it to Timeline. |
| **The Service** | The LINE Social Plugin Button service. |
| **Dedicated Icons** | The official LINE Social Plugin Button icons specified by the Company. |
| **External Sites** | Websites and applications managed by third parties other than the Company. |
| **Installers** | Persons installing the LINE Social Plugin Button on External Sites. |
| **Users** | End users using LINE. |
| **Timeline** | The function for viewing, in chronological order, content posted/shared by a User, their friends, and official accounts. |

## Retention of Rights

The Company (or its licensors) reserves **all rights** — including copyrights,
trademarks, patents and other intellectual-property rights — in the LINE Social
Plugin Button, the Dedicated Icons, and every other aspect of the Service.

## Terms of Use (developer-actionable rules)

Permission to use the Service is conditional on the Installer abiding by all of
the following:

- **Use the Dedicated Icons** when installing a button — or use the
  Company-specified **text wordings** in their place.
- **Do not alter or modify** the Dedicated Icons in any manner.
- **Do not install** a button where the site design interferes with the
  button's **readability**.
- **Do not display** trademarks/logos/icons/emblems **similar to** the Dedicated
  Icons on sites where the button is installed.
- **Do not install** the button on prohibited External Sites (the Company has
  final judgment): sites with excessively violent or sexually explicit content,
  discriminatory content, content encouraging suicide / self-harm / drug abuse,
  or other anti-social content; sexual-encounter dating sites; sites that
  illegally acquire personal/privacy information; **spam sites** (affiliate-ads-
  only, traffic-redirection, web-scraping, word-salad sites); sites infringing
  IP / honor / privacy or other rights; or any site the Company deems
  inappropriate.
- **Do not include information irrelevant to the External Site** in shared/
  posted content (e.g. irrelevant or distorted/exaggerated headings, URLs of
  pages other than the one the button is on).
- For the Add Friend Button, **do not set** an Official Account that is
  irrelevant to the External Site it is installed on.
- **Do not include prohibited content** in shared/posted/recommended
  information, or in the Official Account added as a friend — same prohibited
  categories as above, plus content prohibited under the **LY Corporation
  Common Terms of Use** (`https://terms.line.me/line_terms?lang=en`).
- **Do not use the Service in a way that misleads** viewers into believing the
  Company endorses or supports the External Site.
- Ensure compliance with **all applicable laws, regulations, and industry
  standards** when installing the Service.

**Data the Company may collect** from Installers' External Sites:

- Records of a User's LINE login activities while using the Service.
- The URL and timestamp of an External Site (that includes the Service) a User
  visits via the browser.

The Company uses this to switch display content (e.g. button state) according
to usage conditions and to prevent misconduct; it may link the data to the
User's LINE account if the User is logged in, and may use it in a personally
identifiable manner to provide more relevant content. Personal information is
governed by the **LY Corporation Privacy Policy**
(`https://line.me/en/terms/policy/`).

## Alteration and Termination of the Service

The Company may modify part or all of the Service, or terminate it, **without
prior notice**, at its own discretion.

## The Installer's Responsibility

- The Company may take measures it considers necessary (e.g. **suspending the
  Installer's use**) if it finds the Service was used in violation of the
  Guidelines. The Company is not responsible for correcting or preventing such
  violations.
- If the Company suffers loss/damage/expense (including legal fees), directly or
  indirectly, due to the Installer's use of the Service, the Installer must
  **immediately compensate or indemnify** the Company on demand.

## Exemption of Liability

- The Company does **not guarantee** the Service is free of factual or legal
  flaws (safety, reliability, accuracy, integrity, effectiveness, fitness for
  purpose, security faults, bugs, rights violations).
- The Company is **not responsible** for any damages inflicted on the Installer
  in relation to use of the Service.

## Modification of the Guidelines

The Company may modify the Guidelines when it deems necessary, **without prior
notification**. A modification becomes effective once posted at an appropriate
location on the Company's website. Continuing to use the Service constitutes
valid and irrevocable consent to the modified Guidelines.

## Governing Law and Jurisdiction

- Where a translation of the Japanese version exists, the **Japanese version
  governs**; in any contradiction, the Japanese version prevails.
- The Guidelines are governed by the **laws of Japan**.
- Disputes are under the exclusive jurisdiction of the **District Court of
  Tokyo**.

## Inquiries

Send inquiries about the Service to: **`dl_social_plugins_inquiry@linecorp.com`**

## Revision history of the Guidelines

- First published: December 21, 2012
- First revision: April 1, 2013
- Second revision: December 3, 2015
- Third revision: December 31, 2016
- Latest revision: February 1, 2024

---

# Release Notes

Since **October 2021**, the latest updates to LINE Social Plugins are published
in the **News** section, tagged `social-plugins`
(`https://developers.line.biz/en/news/tags/social-plugins/`). The release-notes
page itself lists older milestones:

| Date | Change |
|---|---|
| **April 26, 2021** | **Seamless sharing experience from desktop to mobile.** Visitors can see all groups added to Favorites on the Friends tab and share with closest friends and groups on desktop LINE. Friends hidden on mobile LINE also stay hidden on desktop. |
| **March 17, 2021** | **Removed the "Like and share" option.** The "Like and share" button can no longer be created; existing ones are automatically changed to Like buttons. Button designs were also updated to the new LINE style — all buttons update automatically unless you use a custom icon. |
| **December 28, 2020** | **Added an option to customize the share counter.** You can create the Share button with custom icons even when showing the share counter. A server-side-only API checks the share count for custom icons (see the share-count API in `share-button.md`). |
| **December 17, 2020** | **Easily share content from desktop.** Chats are sorted latest-first on desktop LINE; visitors can immediately check shared content on Timeline. |
| **April 1, 2020** | **Newly added share counter.** You can see how many times a webpage was shared via the Share button — turn on the share-counter option when creating the button. Only available with the official LINE icons. |
| **January 23, 2019** | **New service name: LINE Social Plugins.** The old name "LINE it!" is retired; the "LINE it!" button is renamed **Share**. |
| **May 15, 2018** | **Added an option to share to a specific audience.** On desktop LINE, visitors can choose whether shared content is visible to the public, to friends, or private (only themselves). |
| **January 12, 2017** | **New Add friend and Like buttons.** The Like button lets others react to your content; the Add friend button lets visitors add your LINE Official Account. Two new languages added: **Thai and Indonesian**. |
| **April 21, 2014** | **Support of traditional Chinese.** |
| **December 21, 2012** | **Release of LINE Social Plugins** — available globally. |
