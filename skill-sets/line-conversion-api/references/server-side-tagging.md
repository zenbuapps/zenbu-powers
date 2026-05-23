# Server-side Tag Template Configuration Guidelines

Source: `https://conversion-api-docs.linebiz.com/en/#section/Server-side-tag-template-configuration-guidelines`

How to integrate **Google Tag Manager (GTM)** with the LINE Conversion API for
**server-side tagging**, using LINE's official server-side tag template.

## Table of contents

- Introduction
- How to import from the Community Template Gallery
- How to import a server-side tag template (direct `.tpl` import)
- Introduction to configuring server tags (example structure)
- Web container configuration
- Server-side container variable configuration
- Server tag configuration (the 6 template fields)
- Configure triggering for tags
- Debugging server-side containers
- About additional fields for server-side tag templates (`x-line-*` mapping)
- `user_data.*` common-event-data mapping
- About `deduplicationKey` for event deduplication
- Interoperability between Conversion API and LINE Tag in server-side tagging
- Notes / disclaimers

> This guide requires basic knowledge of LINE Tag, Conversion API, Google Tag
> Manager, and server-side tagging. The guide's content may differ from the
> latest GTM / server-side-tagging specifications — always check Google's
> latest documentation for each product.

---

# Introduction

Using the server-side tag template, you can integrate Google Tag Manager and
the Conversion API to perform **server-side tagging**.

By integrating, you can measure advertisement effectiveness and user behavior
with LINE Tag, as well as via server-side containers built on Google Cloud
Platform. **Only GA4 clients are currently supported.**

For an overview of server-side tagging, see Google's article:
`https://developers.google.com/tag-platform/tag-manager/server-side`.

The guide explains: how to install server tags using the template; how to
configure server tags by example; the additional fields for server-side tag
templates; interoperability between Conversion API and LINE Tag in server-side
tagging; and precautions.

---

# How to import from the Community Template Gallery

You can import the server-side tag template from Google's **Community Template
Gallery** — no need to manually download and import the template file.

- Community Template Gallery — LINE Conversion API:
  `https://tagmanager.google.com/gallery/#/owners/line/templates/line-conversion-api-server-tag`

For details, check Google's latest documentation.

---

# How to import a server-side tag template (direct `.tpl` import)

This is the alternative to the Community Gallery: importing the template file
directly.

- The server-side tag template is just a file with the `.tpl` extension.
- It is used by importing it from the Google Tag Manager management screen.
- The guide assumes a server-side container is **already built**. If not, build
  it with Google's server-side tagging documentation:
  `https://developers.google.com/tag-platform/tag-manager/server-side#create_a_google_cloud_platform_gcp_server`.

## Get tag template

Obtain `template.tpl` in advance from LINE's GitHub repository:
`https://github.com/line/line-conversion-api-server-tag/blob/main/template.tpl`

## Add a new tag template

Open the management page of Google Tag Manager and open your **server-side
container workspace** (prepared in advance). Select the **Templates** tab on
the left and click **New** in the **Tag Templates** panel to open the template
editor.

## Import tag templates

When the template editor opens, select the menu in the upper right and click
**Import**. In the file-selection dialog, select the `template.tpl` file you
prepared.

When loading completes you can preview the template and verify the UI changed.
Click **Save** in the upper right to save the template.

If **Conversion API** is added to the tag template panel, the template is
installed correctly. You can use this template to configure server tags from
now on.

---

# Introduction to configuring server tags

An example of installing a server tag into a container using the template and
implementing server-side tagging.

After completing the steps, you can send events with a **GA4 client** through
the Tag Manager web container and send conversion events to the Conversion API
with the server tags.

Example web-page hierarchy used by the guide (for simplicity), where
conversions should be measured only when `conversion.html` is accessed:

```
.
├── conversion.html
└── index.html
```

The page is assumed to be accessed as `https://{hostname}/conversion.html`.

---

# Web container configuration

To send events to the server-side container with a GA4 Client, the guide uses
Google Tag Manager. Set up the GTM **web container** in advance. If you already
manage LINE Tag measurement in the GTM web container, you can reuse it. If the
GTM tag is not installed, use Google's Quickstart guide
(`https://developers.google.com/tag-manager/quickstart`).

## Adding tags to the web container

The GA4 configuration tag was replaced by the **Google tag** in early September
2023. To send events to the server container, set up the **Google tag**.
(Announcement: `https://support.google.com/tagmanager/answer/13543899`.)

- Open the web-container workspace in GTM, display the **Tags** list, click
  **New**.
- Select **Google Tag** and add `server_container_url` to the **Configuration
  settings** — its value is the URL of the pre-built server container. Events
  can then be sent to the server container by tags delivered by GTM.
- To pass the additional fields required by the server tag, set the items in
  **Fields to Set**. Configure it properly when sending GTM built-in variables
  and data-layer variables. (See "About additional fields for server-side tag
  templates" below.)

In the guide's sample, the mapping between data-layer variables and the
parameters passed additionally to the server tag is registered as field/value
pairs in **Fields to Set**.

The web container's built-in **page hostname** and **page path** variables are
also passed to the server container so they can be used in the triggering
condition of the server tag. (Note: these URL values are *not* defined as
built-in variables on the server side; only request-relative info such as
request path and query string is. URL info about the original web page cannot
be obtained on the server side — as of June 21, 2022.)

---

# Server-side container variable configuration

As preparation, define the variables used in the server-side container.

Newly define **Page Hostname** and **Page Path** (the ones explicitly set as
**Fields to Set** in the web-container configuration) as **User-Defined
Variables**:

- Open the server-side container workspace, select **Variables** on the left,
  click **New**.
- Set the variable type to **Event Data** and set the **key path** to the value
  set on the web-container side.
- In the guide's example, **Page Hostname** is set to `page_hostname` and
  **Page Path** to `page_pathvar`, so those values are specified as the key
  paths.

Once defined, the server-side container can read the hostname and path of the
website when the tag fired on the client side.

---

# Server tag configuration

Set up the server tag. The server-side tag template uses the **"Conversion
API"** tag imported earlier.

- Select **Tags** on the left of the server-side container workspace and click
  **New**.
- Click **Tag Configuration**.
- When the tag-type selection menu appears, select **Conversion API** (shown
  under the custom items).

After selecting the tag type you enter the configuration items for the
server-side tag template. Each item has a tooltip; the guide explains them as
the following six fields:

| # | Field | What to enter |
|---|---|---|
| 1 | LINE Tag ID | The LINE Tag ID you issued Conversion API with. |
| 2 | Access token | The access token for Conversion API issued in **Business Manager**. |
| 3 | Channel ID | If measuring with **LINE User IDs**, the Channel ID of the Channel Provider that issues User IDs. (Channels & User IDs: see the LINE Developers site — `https://developers.line.biz/en/docs/line-developers-console/overview/#channel`.) |
| 4 | Event type | The event type to measure. **PageView** corresponds to the LINE Tag base code. **Conversion / Custom Conversion** is equivalent to the LINE Tag conversion code: if the event name to send is `"Conversion"` it is sent as the **default** conversion event; any other event name is sent as a **custom** event. |
| 5 | Fixed event name | A fixed event name. If unspecified, the event name is automatically set from the GA4 event name (e.g. a GA4 page view sets the event name to `page_view`; see `[GA4] Automatically collected events` — `https://support.google.com/analytics/answer/9234069`). For explicit control over the event name, set a tag to always send the same event, or use appropriate variables. |
| 6 | Cookie measurement | Enable cookie measurement to read first-party cookies and issue first-party cookies on the server container. Requires Custom Domain configuration (`https://developers.google.com/tag-platform/tag-manager/server-side/custom-domain`) set in advance, with the server container and the web page under the same domain so the server container is regarded as first-party. |

---

# Configure triggering for tags

Set the conditions for triggering the configured server tag. In the guide's
example, the trigger fires conversion measurement only when `conversion.html`
is visited.

- Get the URL information of the website where the web-container tag fired and
  set it as a trigger so the server tag fires when conditions match.
- Click **Triggering** to open the triggering-selection screen, then create a
  trigger.
- In the trigger configuration, select **Page View**; set the server tag to
  fire only if the beginning of **Page Hostname** matches the expected hostname
  **and** **Page Path** equals `/conversion.html`.

Click **Publish** to publish your changes.

---

# Debugging server-side containers

To check whether events are actually sent to the server-side container, click
the **Preview** button on the server-side container's management page to launch
the debug page.

By accessing `conversion.html` and actually sending events from the web
container, you can check:

- Whether the server tag fired or not.
- Details of the HTTP request actually sent to the Conversion API.
- The response from the Conversion API.
- The contents of the event data.
- Error logs.

If a tag fires it shows **"Tags Fired"**. If it does not, **"Tags Not Fired"**
is shown — check that the triggering configuration and the server container URL
are correct.

---

# About additional fields for server-side tag templates

In addition to the data automatically collected when sending events to
server-side tags in GA4, additional data can be sent. Additional data is sent
to the **corresponding Conversion API fields** by configuring additional values
in the **"Additional field"** column below.

| Additional field (GTM) | Corresponding Conversion API field |
|---|---|
| `x-line-deduplication_key` | `event.deduplication_key` |
| `x-line-hashed_phone` | `user.phone` |
| `x-line-hashed_email` | `user.email` |
| `x-line-user_id` | `user.line_uid` |
| `x-line-external_id` | `user.external_id` |
| `x-line-ifa` | `user.ifa` |
| `x-line-event-value` | `custom.value` |
| `x-line-event-currency` | `custom.currency` |

When sending events with GA4 from the GTM web container, you can pass these
additional fields as described in "Web container configuration".

## `user_data.*` common-event-data mapping

For `user_data.*` data usable as Google's **Common event data**
(`https://developers.google.com/tag-platform/tag-manager/server-side/common-event-data`),
the values are sent as the following corresponding fields if set for use.
**Unhashed values are automatically hashed and sent.** See Google's
documentation for configuration details.

| Common event data (GTM) | Corresponding Conversion API field |
|---|---|
| `user_data.phone_number` | `user.phone` |
| `user_data.email_address` | `user.email` |

---

# About `deduplicationKey` for event deduplication

`deduplication_key` is a **required** field used for event deduplication
(see `references/development-guidelines.md`).

- If nothing is specified in the additional configuration field
  `x-line-deduplication_key`, **a random UUID is generated and sent each time**
  instead.
- If an event is sent only once and limited to server-side tagging,
  deduplication is not necessarily required.
- However, if events are sent from **multiple routes**, events representing the
  same real event are sent multiple times — e.g. when interoperating LINE Tag
  and server-side tagging. In that case you must set a consistent
  `deduplication_key`.

---

# Interoperability between Conversion API and LINE Tag in server-side tagging

Using Google Tag Manager, you can interoperate the Conversion API and LINE
Tags. For example, using the Conversion API tag together with the LINE Tag
configuration added as HTML tags makes both tags fire for the same event.

In that case, **event-duplication elimination is essential**: conversion
measurement is performed for each tag, so to deduplicate you must set the
`deduplication_key` appropriately on both routes. (See the Conversion API
documentation for the detailed explanation of `deduplication_key`.)

## Set `deduplication_key` in a data layer variable

One way to deduplicate is to set the `deduplication_key` as a **data layer
variable**. It should be generated randomly to ensure uniqueness, and the same
value should be received by both LINE Tag and Conversion API.

Generate a `deduplication_key` with a JavaScript function and push the result
into the data layer:

```html

<script>
    window.dataLayer = window.dataLayer || [];

    function getDeduplicationKey() {
        return Date.now() + '_' + Math.floor((Math.random() * 10 ** 9));
    }

    dataLayer.push({
        'x-line-deduplication_key': getDeduplicationKey()
    });
</script>
```

This data-layer variable is set as `deduplicationKey` in the LINE Tag in web
containers, and passed as `x-line-deduplication_key` in server-side containers.
Passing the **same** `deduplication_key` over the separate routes makes
deduplication possible.

---

# Notes / disclaimers

- When using LINE's server-side tag template, the **Conversion API privacy
  policy and terms of use** also apply.
- LINE does **not guarantee** that the server-side tag templates it currently
  provides will work correctly.
- For inquiries about services not provided by LINE — Google Tag Manager,
  Google Cloud Platform, Google Analytics — contact the respective service
  provider.
- LINE cannot compensate for any disadvantages caused by modifying the
  LINE-provided server-side tag template on your own.
