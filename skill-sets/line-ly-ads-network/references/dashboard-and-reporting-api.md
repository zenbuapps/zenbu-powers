# Dashboard & Reporting API

Source:
- `https://adsnetwork-docs.linebiz.com/cms/ui-and-daily-use/ui-guide.html`
- `https://adsnetwork-docs.linebiz.com/cms/general-guide/{how-to-add-member,how-to-remove-member,user-role-change,how-to-join}.html`
- `https://adsnetwork-docs.linebiz.com/cms/operation-guide/{how-to-register-your-app-and-slot,how-to-test-device-setting,how-to-edit-your-slot,how-to-block-setting}.html`
- `https://adsnetwork-docs.linebiz.com/cms/ui-and-daily-use/how-to-check-kpi.html`
- `https://adsnetwork-docs.linebiz.com/cms/api-guide/{how-to-use-api,how-to-fetch-reports-from-api,how-to-fetch-api-history}.html`

The publisher **Dashboard** is at `https://adsnetwork.line.biz/`. For account
registration, glossary, and the role/access matrix, see `overview-and-setup.md`.

## Table of contents

- Dashboard screens
- User management (invite / remove / change role / join)
- Register app & slot
- Test devices
- Edit slot & TargetCPM
- Block settings
- KPI report & CSV columns
- Reporting API — key issuance
- Reporting API — fetch reports
- Reporting API — fetch API history

---

## Dashboard screens

| Screen | Purpose |
|---|---|
| **App (アプリ)** | Lists apps owned by the company. Click an app name to see its detail. |
| **Report (レポート)** | Shows the past 7 days of reports; downloads report CSV. |
| **Payment (お支払い)** | Shows past ad-revenue payment history, by month. |
| **User management (ユーザー管理)** | Invite / remove members. |

## User management

### Invite a member

User management → "User list" → "Invite". In the popup, enter the invitee's
email address and role; an invite link is emailed.

- Invite emails are sent from `noreply@linecorp.com`.
- The invite link is valid for **24 hours**; after that it becomes invalid.
- The invite link works only for the person with the invited email address.

### Remove a user

"User management" → "User list" → click the delete button next to the user.
Only the **Administrator** role can remove users.

- Removed users can no longer log in (administrators can remove themselves too).
- An accidentally removed user can be re-invited.
- The last remaining administrator cannot be removed.

### Change a user's role

"User management" → "User list" → click the edit button. Select the role in the
popup, click Save.

- You can change your own role, but after changing to a non-Administrator role
  you can no longer change roles yourself.
- A company needs at least one Administrator — a role change that would leave
  the company with no administrator is not allowed.

### Join as a user (invitee flow)

1. **Receive the invite email** — sender `noreply@linecorp.com`, subject
   `[LINE Ads Network] ○カンパニーの Dashboard に招待されました`. Click the
   invite link → redirects to the Business ID login page.
2. **Register a Business ID** — the Dashboard manages members via Business ID;
   register one if you do not have one. (Skip this step if you already have one.)
3. **Accept the Dashboard invite** — after Business ID registration you reach
   the invite-acceptance screen; click "Join" to complete.

## Register app & slot

To display ads in an app: (1) register the app in the Dashboard, (2) register a
slot from the app-detail slot-creation screen, (3) embed the issued **App ID**
and **Slot ID** into the SDK.

### Register the app

Registering an app issues an **App ID**. Embedding the App ID into the SDK lets
LY Ads Network recognize the app. If the app is already registered and you only
need to add a slot, this step is unnecessary.

### Register the slot

App list → click the target app → in the app's slot list, click "Add" → the
slot-creation screen. Enter a slot name and select an ad format. Registering a
slot issues a **Slot ID**.

Ad formats:

| Format | Description | Extra selections |
|---|---|---|
| Custom Layout | The most standard format; displays an ad at a specified position. | Ad aspect ratio |
| Video Reward | Have the user watch a video ad in exchange for points etc. | Display orientation |
| Interstitial | Full-screen ad shown between content. | None |

#### Custom Layout extra selection — aspect ratio

Set the display-area aspect ratio to match the ad-slot ratio in the app:

| Type | Aspect ratio |
|---|---|
| Square (スクエア) | A square slot. |
| Rectangle (レクタングル) | A rectangular slot. Two kinds: 300x250 and 320x180. |
| Banner (バナー) | A banner-type slot. Width 320, choose from 4 heights. |

#### Video Reward extra selection — orientation

Set display orientation: **Portrait (縦向き)** or **Landscape (横向き)**, matching
the app.

#### Bidding Type extra selection

Select the Bidding Type in use. For SDK Bidding with LY Ads Network, select the
Bidding Type matching the mediation. For other cases (no mediation, waterfall),
select **`Standard`**.

> NOTE: Bidding Type **cannot be changed** after slot creation. Unity LevelPlay
> Bidding is currently in Closed test.

## Test devices

The test-device setting registers a device's ad identifier so test ads can be
checked. Ad identifiers (IDFA/AAID) — up to **10** can be registered.

"App" → "App list" → click the target app → app detail → click "Test devices" at
the top → click "Add" → enter the device's ad identifier and a name → click "Add".

## Edit slot & TargetCPM

Editable slot fields: **slot name**, **TargetCPM**, **status**.

App page → app list → select the target app → slot list → select the slot →
click the edit button.

### Edit TargetCPM

Toggle TargetCPM on/off in the edit screen; enter the desired value and Save.

> TargetCPM is a per-slot **target** CPM — it does not guarantee actual CPM. It
> can be set in **JPY only**; enter an integer `> 0` and `<= 8,000`. It cannot be
> set for slots whose Bidding Type is not `Standard`.

### Edit status

Toggle status between **Active** and **Stopped** in the edit screen.

> A "Stopped" slot does not display ads. Some slots are stopped by the system and
> cannot be changed.

## Block settings

The block feature blocks ads from competitors / unsuitable advertisers, by
**domain** or **app-store URL**. Enter only the domain, not the full URL — for
`http://example.com`, enter `example.com`.

> Block-setting reflection may not be immediate. Hiding some ads via block
> settings may negatively affect revenue.

### Block for all apps

"Block settings" → "All apps". Click "Edit" for Domain or App store URL. The
number of settable domains and app-store URLs is capped; see "Current
registrations" for the cap and current count. Enter the blocked domain /
app-store URL and Save; to unblock, delete the entry and Save.

### Block per app

"Block settings" → "By app" → click the app name → app info → click "Edit" for
Domain or App store URL. Same as above.

**Combination rule:** the per-app setting applies **in addition to** the
all-apps setting. Example: all-apps blocks `A`, per-app blocks `B` — an app with
a per-app block blocks both `A` and `B`; an app without a per-app block blocks
only `A`. Member-role users cannot configure per-app blocking — only the
Administrator role can.

## KPI report & CSV columns

Revenue and KPIs are shown on the Report screen.

> When impressions/clicks have 1 or fewer events, related metrics may be hidden
> or shown as 0.

### Report-screen item definitions

| Screen item | CSV column | Notes |
|---|---|---|
| Estimated revenue (tax-excl.) | `revenue` | Estimated revenue (tax-excl.), fractional part truncated |
| Ad display count | `imp` | Counted when >= 50% of the creative is shown (50% 0sec) |
| Click-through rate | `ctr` | clicks / ad-display-count, truncated below the 3rd decimal |
| Click count | `click` | Number of ad clicks |
| Estimated eCPM | `ecpm` | eCPM (tax-excl.), truncated below the 3rd decimal |

### CSV report download

Report screen → "CSV download" button → select a period:

| Selectable period |
|---|
| Previous day |
| Last 1 week |
| Last 30 days |
| This month |
| Last month |

### CSV columns

| CSV column | Meaning |
|---|---|
| `date_jst` | Date in JST |
| `app_id` | The app's LY Ads Network ID |
| `app_name` | The registered app name |
| `slot_id` | The slot's LY Ads Network ID |
| `slot_name` | The registered slot name |
| `imp` | That day's ad display count |
| `click` | That day's ad click count |
| `revenue` | That day's estimated revenue (tax-excl.) |
| `ctr` | Click-through rate (%), computed as `click / imp × 100` |
| `ecpm` | Revenue per 1000 ad displays (tax-excl.), `revenue / imp × 1000` |
| `cpc` | Cost per click (tax-excl.), `revenue / click` |

---

# Reporting API

The Dashboard exposes a REST **Reporting API** for programmatic report download
and API-call history. Authentication is HTTP Basic with an API key ID + secret.

> Estimated revenue, eCPM, CPC from the API are all **tax-excluded**. When
> impressions/clicks have 1 or fewer events, related metrics may be hidden or
> shown as 0. Values may differ from the Report screen.

## Reporting API — key issuance

API keys are managed in the Dashboard **"Reporting API key management"** screen.
This feature is available to the **Administrator role only**. Up to **5** API
keys can be created.

### Create an API key

1. Click "Create API key".
2. Enter a client name and click "Save".
3. The **API key ID** and **API key Secret** are displayed.
   - The Secret **cannot be re-displayed** — store it securely.

### Disable an API key

1. Click "Disable" on the API key to disable.
2. Confirm and click "Disable".
3. Click "Disable" on the final confirmation popup.
   - A disabled key **cannot be restored**, and disabled keys disappear from the
     list.

## Reporting API — fetch reports

The report API downloads a report for the specified metrics and dimensions.
Output format: CSV or JSON.

### Request URLs

| Format | URL |
|---|---|
| CSV | `https://adsnetwork.line.biz/api/public/v1/reports.csv` |
| JSON | `https://adsnetwork.line.biz/api/public/v1/reports.json` |

### Example command

```bash
curl -u ${API_KEY_ID}:${API_KEY_SECRET} \
-X POST \
-H "Content-Type: application/json" \
-d "${リクエストボディ}" \
${リクエストURL}
```

Example request body:

```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-01",
  "dimensions": [
    "date",
    "app_id",
    "slot_id"
  ],
  "metrics": [
    "imp",
    "click"
  ],
  "filter": {
    "app_ids": [
      12345
    ]
  },
  "from": 0,
  "limit": 1000
}
```

Example CSV response:

```plain
date,app_id,slot_id,imp,click
2024-01-01,12345,6789,5432,5
2024-01-01,12345,6790,3310,2
```

### Request body fields

| Field | Definition | Type | Required | Default | Notes |
|---|---|---|---|---|---|
| `start_date` | Start date, `YYYY-MM-DD` | string | YES | | Up to 2 years in the past |
| `end_date` | End date, `YYYY-MM-DD` | string | YES | | Start–end difference up to 90 days |
| `dimensions` | See Dimensions | Array[string] | YES | | |
| `metrics` | See Metrics | Array[string] | YES | | |
| `filter` | See Filter | object | NO | | |
| `from` | Fetch start position | int | NO | 0 | |
| `limit` | Number of records to fetch | int | NO | 1000 | Max 1000 |

### Dimensions

Specifying dimensions sets the aggregation level. No limit on count or order.

| Field | Description | Example |
|---|---|---|
| `date` | Date | `2024-01-01` |
| `app_id` | App ID | `12345` |
| `app_name` | App name | テストアプリ |
| `slot_id` | Slot ID | `6789` |
| `slot_name` | Slot name | テストスロット |
| `device_type` | Device type | `IOS` / `ANDROID` |

### Metrics

The specified metrics are included in each report row. No limit on count or order.

| Field | Description | Example |
|---|---|---|
| `imp` | Ad display count | `183` |
| `click` | Click count | `14` |
| `ctr` | Click-through rate | `0.1138` |
| `ecpm` | Estimated eCPM (tax-excl.) | `8.47` |
| `cpc` | Estimated CPC (tax-excl.) | `50.12` |
| `revenue` | Estimated revenue (tax-excl.) | `365.18` |

### Filter

Specifying a filter narrows the data in the response.

| Field | Description | Type | Required | Notes |
|---|---|---|---|---|
| `app_ids` | App ID list | Array[int] | NO | |
| `slot_ids` | Slot ID list | Array[string] | NO | |

### Response codes

| Code | Meaning |
|---|---|
| 400 | Request is invalid, or a syntax/validation error. Confirm the request is well-formed. |
| 401 | Authentication failed. Confirm the auth header is properly formatted. |
| 429 | Too many requests. Wait a while and retry. |
| 500 | Unknown error. |

## Reporting API — fetch API history

The API-history endpoint returns info about past authenticated API requests.

### Request URL

```
https://adsnetwork.line.biz/api/public/v1/api-key-history
```

### Example command

```bash
curl -u ${API_KEY_ID}:${API_KEY_SECRET} \
-X POST \
-H "Content-Type: application/json" \
-d "${リクエストボディ}" \
${リクエストURL}
```

Example request body:

```json
{
  "from": 0,
  "limit": 100
}
```

The result is returned in JSON format.

### Request body fields

| Field | Definition | Type | Required | Default | Notes |
|---|---|---|---|---|---|
| `from` | Fetch start position | int | NO | 0 | |
| `limit` | Number of records to fetch | int | NO | 100 | Max 100 |

### Response codes

Same as the report API: 400 (invalid request), 401 (auth failed), 429 (too many
requests), 500 (unknown error).

### Response body

| Field | Definition | Type | Notes |
|---|---|---|---|
| `histories` | See History object | Array[History] | API-call history, in descending order of request epoch seconds |

#### History object

| Field | Definition | Type |
|---|---|---|
| `request_epoch_time` | Request epoch seconds | long |
| `method` | HTTP method | string |
| `content_type` | HTTP Content-Type | string |
| `path` | HTTP request path | string |
| `body` | HTTP request body | string |
| `status_code` | HTTP status code | int |
