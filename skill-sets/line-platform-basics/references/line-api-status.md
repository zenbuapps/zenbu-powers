# LINE API Status — Platform Availability & Outage Monitoring

Source: `https://developers.line.biz/en/docs/basics/line-api-status/`

This basics page documents **LINE API Status**, the official site for checking
LINE Platform availability and outage status. It covers what the site is, the
ATOM/RSS feeds it exposes, the status displays, the services it covers, and how
to reach it from the LINE Developers site.

## Table of contents

- What LINE API Status is
- ATOM / RSS feed provision
- Status displays (stable vs. outage)
- Services covered by LINE API Status
- Accessing LINE API Status

---

## What is LINE API Status

**LINE API Status** is a site through which you can check the **availability
and outage status of the LINE Platform**. It is provided by LY Corporation.

- Site URL: `https://api.line-status.info/`
- Availability and outage status information is provided in **English**.

> **Note — On the information on LINE API Status.** LY Corporation provides
> information on outage status through LINE API Status, but this **does not
> guarantee immediate, accurate, or comprehensive information**. Details of an
> outage — such as cause and extent of influence — continue to be communicated
> through **News** on the LINE Developers site:
> `https://developers.line.biz/en/news/tags/outage-report/`.

### Provision of ATOM and RSS feeds

LINE API Status provides **ATOM and RSS feeds**. Get the ATOM or RSS feed by
clicking **SUBSCRIBE TO UPDATES** on LINE API Status. Use this to programmatically
monitor outages (e.g. wire the feed into an alerting system).

### Display when operation is stable

When there is **no outage** and operation is stable, the site displays:

```
All Systems Operational
```

### Display when an outage occurs

When an outage occurs, the site displays information about the service
undergoing the outage and the occurrence of the outage. The outage status is
**also surfaced as a pop-up on the LINE Developers site** itself
(`https://developers.line.biz/`) — so developers browsing the docs see outage
notices without having to open LINE API Status separately.

---

## Services covered by LINE API Status

LINE API Status covers these services:

- **Messaging API**
  - API
  - Webhook
- **LINE Developers**
  - LINE Developers site
  - LINE Developers Console
- **LIFF**
- **LINE Login**

**Not covered:** the LINE app itself, and any services other than those listed
above, are **not** covered by LINE API Status.

---

## Accessing LINE API Status

You can reach LINE API Status from the LINE Developers site in two places:

- The **More** menu in the **header** of the LINE Developers site.
- The **footer** of the LINE Developers site.

Either entry point opens `https://api.line-status.info/`.

---

## Practical use

- When a LINE API call fails unexpectedly (timeouts, 5xx, webhook not firing),
  **check LINE API Status before assuming the bug is in your code** — the
  Messaging API, Webhook, LIFF, LINE Login, and the Console each have their own
  status entry.
- For automated monitoring, subscribe to the **ATOM/RSS feed** rather than
  scraping the HTML page.
- LINE API Status is **best-effort** and not a guaranteed SLA signal — for
  authoritative incident detail (root cause, scope, timeline), follow the
  outage-report **News** tag on the LINE Developers site.
