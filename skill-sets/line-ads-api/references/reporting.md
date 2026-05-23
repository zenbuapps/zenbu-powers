# Reporting, History & Simulations

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- `https://ads.line.me/public-docs/reporting-general-partner`

`Reports`, `OnlineReports`, `Simulations` are available to both **Ad Tech** and
**Reporting** partners; `Histories` is **Ad Tech** only. Base URL
`https://ads.line.me/api`; all paths prefixed with `/v3`.

Two report paths exist:

- **Performance reports (`pfreports`)** — async CSV generation. Create a report
  (returns a `Report` with `status`), poll until `status` is `READY`, then
  download the CSV.
- **Online reports** — synchronous JSON. `GET .../reports/online/{reportLevel}`
  returns statistics directly as `ReportOnlineResponse`.

The **Report Online — Read** endpoint enforces a Request Quota (at most 30
simultaneous requests; see `references/authentication.md`).

## Table of contents

- 6.4 Reports — read / create / delete / download / download-sample
- 6.5 OnlineReports — read
- 6.12 Histories — read / create / delete / download
- 6.11 Simulations — ars
- Definitions: Reports, Report, ReportQueryParams, ReportBreakdown, ReportFiltering, ReportOnlineResponse, ReportOnlineDto, ReportOnlineStatistics, TimeRange, HistoryCreations, HistoryCreation, ArsSimulationRequest, ArsSimulationResult
- Performance-report CSV columns (by report level)

---

# 6.4 Reports (performance reports)

## read

```
GET /v3/adaccounts/{adaccountId}/pfreports
```

Read performance reports.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is one of `id`, `name`, `status`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Reports`.

## create

```
POST /v3/adaccounts/{adaccountId}/pfreports
```

Create a performance report. **Reports for dates more than five years after the
report reference date cannot be provided.**

Path `adaccountId` + body `ReportQueryParams`. Consumes/Produces
`application/json`. Response `200`: `Report`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/pfreports/{id}
```

Path `id` (number). Response `200`: No Content.

## download

```
GET /v3/adaccounts/{adaccountId}/pfreports/{id}/download
```

Download a performance report. On success it returns a response body in
`text/csv;charset=utf-8` **or** `text/csv;charset=utf-16le` (with BOM). On error
it returns `application/json`.

Path `adaccountId` + `id` (number). Response `200`: `file`. Produces:
`text/csv;charset=utf-8`, `text/csv;charset=utf-16le`, `application/json`.

## download sample

```
GET /v3/adaccounts/{adaccountId}/pfreports/{id}/download/sample
```

Download sample report data. 5 levels of reports are available; pass the `id`
assigned to the level:

| Report level | Id |
|---|---|
| ADACCOUNT | 1 |
| CAMPAIGN | 2 |
| ADGROUP | 3 |
| AD | 4 |
| AD (Carousel only) | 5 |

On success it returns `text/csv;charset=utf-8` or `text/csv;charset=utf-16le`
(with BOM); on error `application/json`.

Path `adaccountId` + `id` (number). Response `200`: `file`.

---

# 6.5 OnlineReports

## read

```
GET /v3/adaccounts/{adaccountId}/reports/online/{reportLevel}
```

Read online reports — synchronous JSON statistics.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Path | `reportLevel` (required) | The level of report to get. | enum (`campaign`, `adgroup`, `ad`) | |
| Query | `adgroupId` (optional) | Adgroup id. | number | |
| Query | `campaignId` (optional) | Campaign id. | number | |
| Query | `includeRemoved` (optional) | Include removed entities if `true`. | boolean | `"false"` |
| Query | `lpId` (optional) | The landing page id to filter the report on. | number | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `searchKey` (optional) | The id or name to search. | string | |
| Query | `since` (optional) | Receive data after this date, `YYYY-MM-DD` (e.g. `2021-12-21`). | string (date) | |
| Query | `size` (optional) | Page size. Maximum value: 100. | integer | 20 |
| Query | `until` (optional) | Receive data before this date, `YYYY-MM-DD` (e.g. `2021-12-22`). | string (date) | |

Response `200`: `ReportOnlineResponse`.

---

# 6.12 Histories (change-history reports)

## read

```
GET /v3/adaccounts/{adaccountId}/history-files
```

Read change-history reports.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `HistoryCreations`.

## create

```
POST /v3/adaccounts/{adaccountId}/history-files
```

Path `adaccountId` + body `HistoryCreation`. Consumes/Produces
`application/json`. Response `200`: `HistoryCreation`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/history-files/{ids}
```

Delete change-history reports.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` |

Response `200`: No Content.

## download

```
GET /v3/adaccounts/{adaccountId}/history-files/{id}/download
```

Download a change-history report. On success returns `text/csv;charset=utf-8`
or `text/csv;charset=utf-16le` (with BOM); on error `application/json`.

Path `adaccountId` + `id` (number). Response `200`: `file`.

---

# 6.11 Simulations

## ars

```
POST /v3/adaccounts/{adaccountId}/simulation/ars
```

Execute ARS (Adgroup Result Simulator) — estimate an ad group's reach and
result before creating it.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `ArsSimulationRequest` |

Consumes/Produces `application/json`. Response `200`: `ArsSimulationResult`.
**Response `422`** — when some field values are absent or invalid; the body is
still an `ArsSimulationResult`, with `absentFields` / `invalidFields` populated.
(GeoArea is not supported by ARS — adgroups with `geoTargeting` always return `422`.)

---

# Definitions

## Reports

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Report > array` |

## Report

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of this report. | number |
| `name` (read-only) | Name of this report. | string |
| `status` (read-only) | The status of report creation. | enum (`CREATED`, `PREPARING`, `ERROR`, `READY`) |
| `queryParams` (optional) | Report query parameters. | `ReportQueryParams` |

## ReportQueryParams

The body of `POST .../pfreports`.

| Name | Description | Schema |
|---|---|---|
| `level` (required) | The entity level of the report. | enum (`ADACCOUNT`, `CAMPAIGN`, `ADGROUP`, `AD`) |
| `since` (optional) | Start date for statistics. Default: 3 months ago. Pattern `YYYY-MM-DD`. Example: `"2021-12-21"` | string |
| `until` (optional) | End date for statistics. Default: today. Pattern `YYYY-MM-DD`. Example: `"2021-12-22"` | string |
| `breakdown` (optional) | Report breakdown parameters. | `ReportBreakdown` |
| `filtering` (required) | Report filtering parameters. | `ReportFiltering` |
| `includeRemove` (optional) | Whether to include reports of removed entities. Default: `false` | boolean |
| `onlyCarouselSlot` (optional) | **Deprecated** — use `CAROUSEL` for `ReportBreakdown.specific`. A flag that the report includes only the carousel-ads report; can be `true` only when `level` is `AD`. Default: `false` | boolean |
| `fileFormat` (required) | The report file format. | enum (`CSV`, `CSV_EXCEL`) |
| `locale` (optional) | The report locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

## ReportBreakdown

| Name | Description | Schema |
|---|---|---|
| `delivery` (optional) | The unit of delivery segment for collecting the report. | enum (`os`, `gender`, `age`, `area`, `interest`, `behavior`, `status`, `purchase_intent`) |
| `time` (optional) | Time unit for collecting the report. | enum (`DAY`) |
| `byServiceGroup` (optional) | Flag separating the report by placement type. Cannot be `true` when `level` is `AD`. Only for JP, TW adaccounts. | boolean |
| `specific` (optional) | The specific type of report. `CAROUSEL` and `IMAGE_SIZE` can be set only when `level` is `AD`. | enum (`CAROUSEL`, `IMAGE_SIZE`) |

## ReportFiltering

| Name | Description | Schema |
|---|---|---|
| `idType` (optional) | The type of id for filtering. | enum (`ADACCOUNT`) |
| `ids` (optional) | The ids for filtering. For `idType` `ADACCOUNT`, it must be a list of the single adaccount id in your request path. | `< string > array` |

## ReportOnlineResponse

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< ReportOnlineDto > array` |
| `timeRange` (optional) | `TimeRange` |

## ReportOnlineDto

| Name | Description | Schema |
|---|---|---|
| `adaccount` (read-only) | Simple adaccount info (may be partial). | `Adaccount` |
| `campaign` (read-only) | Simple campaign info (may be partial). | `Campaign` |
| `adgroup` (read-only) | Simple adgroup info (may be partial). | `Adgroup` |
| `ad` (read-only) | Simple ad info (may be partial). | `Ad` |
| `statistics` (read-only) | Statistics information. | `ReportOnlineStatistics` |

## TimeRange

| Name | Description | Schema |
|---|---|---|
| `since` (read-only) | Start date for displaying data. Pattern `YYYY-MM-DD`. | string |
| `until` (read-only) | End date for displaying data. Pattern `YYYY-MM-DD`. | string |

## HistoryCreations

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< HistoryCreation > array` |

## HistoryCreation

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of this change history. | number |
| `adaccountId` (optional) | Adaccount id. | string |
| `name` (optional) | The name of this change-history report. | string |
| `fileFormat` (required) | The report file format. | enum (`CSV`, `CSV_EXCEL`) |
| `status` (optional) | The status of this change-history report. | enum (`CREATED`, `PREPARING`, `READY`, `ERROR`) |
| `startDate` (required) | Start date of the change-history report. Pattern `YYYY-MM-DD`. Example: `"2022-01-26"` | string |
| `endDate` (required) | End date of the change-history report. Pattern `YYYY-MM-DD`. Example: `"2022-01-26"` | string |
| `createdDate` / `modifiedDate` (read-only) | ISO 8601 timestamps in adaccount timezone. | string (date) |

## ArsSimulationRequest

| Name | Description | Schema |
|---|---|---|
| `adaccountId` (required) | Id of the adaccount. | string |
| `campaignId` (required) | Id of the campaign. | number |
| `adgroupId` (optional) | Id of the adgroup. | number |
| `campaignObjective` (required) | The objective of the campaign. | enum (`VISIT_MY_WEBSITE`, `APP_INSTALL`, `APP_ENGAGEMENT`, `WEBSITE_CONVERSION`, `DYNAMIC_PRODUCT`, `GAIN_FRIENDS`, `VIDEO_VIEW`) |
| `dailyBudgetMicro` (required) | Daily budget in micros, in adaccount currency. Example: `120000000000` | integer (int64) |
| `bidAmountMicro` (optional) | Bid amount in micros, in adaccount currency. Example: `100000000` | integer (int64) |
| `bidType` (required) | The type of bid. | enum (`CPC`, `CPF`, `CPM`) |
| `bidStrategy` (optional) | The type of bid strategy. If `autoBidType` is `MANUAL`, `bidStrategy` is null. | enum (`LOWEST_COST`, `COST_CAP`, `TARGET_COST`, `TARGET_ROAS`) |
| `autoBidType` (required) | The type of auto bidding. | enum (`MANUAL`, `CLICK`, `CONVERSION`, `CUSTOM_CONVERSION`, `STANDARD_CV_PURCHASE`, `CV_INSTALL`, `CV_OPEN`, `FRIEND`, `VIDEO_VIEW_3S`, `VIDEO_VIEW_COMPLETION`, `REACH`, `CV_SKADNETWORK`, `CV_LEAD`, `CV_VALUE_STANDARD_PURCHASE`) |
| `targeting` (required) | | `Targeting` |

## ArsSimulationResult

| Name | Description | Schema |
|---|---|---|
| `uuid` (optional) | Id of the simulation result. | string |
| `reach` (optional) | The min and max of reach. | `< integer > array` |
| `resultEventId` (optional) | Id of the event. | string |
| `result` (optional) | The min and max of click. | `< integer > array` |
| `ignoredFields` (optional) | Ignored fields list. | object |
| `absentFields` (optional) | Required fields list (fields that were absent). | `< object > array` |
| `invalidFields` (optional) | Invalid fields list. | object |

---

# ReportOnlineStatistics

The `statistics` of each `ReportOnlineDto`. All fields are `number` and
`optional`. SKAdNetwork-specific fields are only available in SKAdNetwork-enabled
ad groups in ad accounts with the SKAdNetwork feature enabled.

| Name | Description |
|---|---|
| `currency` | The currency of statistics. (string) |
| `cost` | Cost |
| `imp` | Impression |
| `viewableImp` | Viewable impression |
| `click` | Clicks |
| `cv` | Conversions |
| `cvApi` | CV API |
| `cvWithCvApi` | Conversions + CV API |
| `cvWithCvApiWithEv` | Conversions + CV API + Engagement View Conversions |
| `videoCompletions` | Video 100% watched |
| `videoStart` | Video play start |
| `videoView3s` / `videoView25r` / `videoView50r` / `videoView75r` / `videoView95r` | Video watched for at least 3s / 25% / 50% / 75% / 95% (JP only) |
| `reach` | Reach of reach (nullable). |
| `ctr` / `cvr` / `cpc` / `cpm` / `cpa` | Standard rates / costs. |
| `cvWithCvApiCvr` / `cvWithCvApiCpa` | CVR / CPA of `cvWithCvApi`. |
| `cvWithCvApiCvrWithEv` / `cvWithCvApiCpaWithEv` | CVR / CPA of `cvWithCvApiWithEv`. |
| `cvViewItemDetailWithEv` / `cvrViewItemDetailWithEv` / `cpaViewItemDetailWithEv` | "View item detail (ALL)" event count / CVR / CPA. |
| `cvViewItemDetail` / `cvrViewItemDetail` / `cpaViewItemDetail` | "View item detail" event count / CVR / CPA. |
| `cvAddToCartWithEv` / `cvrAddToCartWithEv` / `cpaAddToCartWithEv` | "Add To Cart (ALL)" count / CVR / CPA. |
| `cvAddToCart` / `cvrAddToCart` / `cpaAddToCart` | "Add To Cart" count / CVR / CPA. |
| `cvInitiateCheckOutWithEv` / `cvrInitiateCheckOutWithEv` / `cpaInitiateCheckOutWithEv` | "Initiate Check Out (ALL)" count / CVR / CPA. |
| `cvInitiateCheckOut` / `cvrInitiateCheckOut` / `cpaInitiateCheckOut` | "Initiate Check Out" count / CVR / CPA. |
| `cvPurchaseWithEv` / `cvrPurchaseWithEv` / `cpaPurchaseWithEv` | "Purchase (ALL)" count / CVR / CPA. |
| `cvPurchase` / `cvrPurchase` / `cpaPurchase` | "Purchase" count / CVR / CPA. |
| `cvPurchaseValue` | Value of "Conversion Purchase (Clicks)" event. |
| `cvPurchaseValueWithEv` | Value of "Conversion Purchase (ALL)" event. |
| `ROAS` / `ROASWithEv` | Return on ad spend for purchase event — Clicks / All. |
| `cvGenerateLeadWithEv` / `cvrGenerateLeadWithEv` / `cpaGenerateLeadWithEv` | "Generate lead (ALL)" count / CVR / CPA. |
| `cvGenerateLead` / `cvrGenerateLead` / `cpaGenerateLead` | "Generate lead" count / CVR / CPA. |
| `cvCompleteReservationWithEv` / `cvrCompleteReservationWithEv` / `cpaCompleteReservationWithEv` | "Complete Reservation (ALL)" count / CVR / CPA. |
| `cvCompleteReservation` / `cvrCompleteReservation` / `cpaCompleteReservation` | "Complete Reservation" count / CVR / CPA. |
| `cvCompleteRegistrationWithEv` / `cvrCompleteRegistrationWithEv` / `cpaCompleteRegistrationWithEv` | "Complete Registration (ALL)" count / CVR / CPA. |
| `cvCompleteRegistration` / `cvrCompleteRegistration` / `cpaCompleteRegistration` | "Complete Registration" count / CVR / CPA. |
| `costPerVideoView3s` / `costPerVideoCompletion` | Cost per 3-sec views / Complete views. |
| `install` / `vtInstall` / `totalInstall` / `totalInstallWithEv` | Install count — click / view (JP) / click+view (JP) / click+view+evcv (JP). |
| `skadnInstall` | Install count measured by SKAdNetwork. |
| `openWithEv` / `open` | Open count — with engagement view conversion / plain. |
| `viewHomeWithEv` / `viewHome` | Viewing home — with engagement view conversion / plain. |
| `viewCategoryWithEv` / `viewCategory` | Viewing category — with EVC / plain. |
| `viewItemWithEv` / `viewItem` | Viewing item — with EVC / plain. |
| `searchWithEv` / `search` | Search count — with EVC / plain. |
| `addToCartWithEv` / `addToCart` | Adding to cart — with EVC / plain. |
| `purchaseWithEv` / `purchase` | Purchasing count — with EVC / plain. |
| `levelAchievedWithEv` / `levelAchieved` | Level achieving count — with EVC / plain. |
| `tutorialCompleteWithEv` / `tutorialComplete` | Tutorial completion count — with EVC / plain. |
| `totalInstallCvrWithEv` / `installCvr` / `skadnInstallCvr` | Install CVR — with EVC / plain / SKAdNetwork. |
| `installCpa` / `totalInstallCpaWithEv` / `totalInstallCpa` / `skadnInstallCpa` | Install CPA — click / click+view+evcv (JP) / click+view (JP) / SKAdNetwork. |
| `openCvrWithEv` / `openCpaWithEv` / `openCvr` / `openCpa` | Open (ALL) CTR/CPA and Open CTR/CPA. |
| `viewHomeCvrWithEv` / `viewHomeCpaWithEv` / `viewHomeCvr` / `viewHomeCpa` | View home (ALL / plain) CVR / CPA. |
| `viewCategoryCvrWithEv` / `viewCategoryCpaWithEv` / `viewCategoryCvr` / `viewCategoryCpa` | View category (ALL / plain) CVR / CPA. |
| `viewItemCvrWithEv` / `viewItemCpaWithEv` / `viewItemCvr` / `viewItemCpa` | View item (ALL / plain) CVR / CPA. |
| `searchCvrWithEv` / `searchCpaWithEv` / `searchCvr` / `searchCpa` | Search (ALL / plain) CVR / CPA. |
| `addToCartCvrWithEv` / `addToCartCpaWithEv` / `addToCartCvr` / `addToCartCpa` | Add-to-cart (ALL / plain) CVR / CPA. |
| `purchaseCvrWithEv` / `purchaseCpaWithEv` / `purchaseCvr` / `purchaseCpa` | Purchase (ALL / plain) CVR / CPA. |
| `levelAchievedCpaWithEv` / `levelAchievedCvrWithEv` / `levelAchievedCpa` / `levelAchievedCvr` | Level achieved (ALL / plain) CTR / CVR. |
| `tutorialCompleteCvrWithEv` / `tutorialCompleteCpaWithEv` / `tutorialCompleteCvr` / `tutorialCompleteCpa` | Tutorial complete (ALL / plain) CVR / CPA. |
| `impShareRate` | Percentage of ads actually shown out of all display opportunities. Adgroup only. |
| `lostImpShareByBudgetRate` | Percentage of ads not shown due to insufficient budget. Adgroup only. |
| `lostImpShareByRankRate` | Percentage of ads not shown due to low auction rank. Adgroup only. |
| `recommendedBudgetMicro` | Estimated lowest budget at which the campaign/adgroup would not lose bidding opportunities to budget constraints. Micros, local currency. Campaign and adgroup. |

---

# Performance-report CSV columns (by report level)

Columns of the downloadable performance-report CSV, and which report `level`
each appears in. `Y` = present at that level. SKAdNetwork-specific fields are
only available in SKAdNetwork-enabled ad groups in ad accounts with the
SKAdNetwork feature enabled.

| Column | Description | ADACCOUNT | CAMPAIGN | ADGROUP | AD | AD (Carousel) |
|---|---|---|---|---|---|---|
| Day (optional) | Base date | Y | Y | Y | Y | Y |
| Ad account name / ID | Name / ID of the account | Y | Y | Y | Y | Y |
| Campaign name / objective / ID | Name / objective type / ID of the campaign | - | Y | Y | Y | Y |
| Ad group name / ID | Name / ID of the adGroup | - | - | Y | Y | Y |
| Ad name / ID | Name / ID of the ad | - | - | - | Y | Y |
| Title | Ad title or Carousel Slot Ad Title | - | - | - | Y | Y |
| Description | Ad Description or Carousel Slot Ad Description | - | - | - | Y | Y |
| Currency | Currency of the account | Y | Y | Y | Y | - |
| Reach (estimated) | Estimated number of people who have seen ads. Present only when report delivery type is null. | Y | Y | Y | Y | - |
| Frequency | Reach's frequency cap | Y | Y | Y | Y | - |
| Impressions | Number of impressions | Y | Y | Y | Y | Y |
| Clicks | Number of clicks | Y | Y | Y | Y | Y |
| CPM | Cost per thousand impressions | Y | Y | Y | Y | Y |
| CTR | Click-through rate | Y | Y | Y | Y | Y |
| CPC | Cost per click | Y | Y | Y | Y | - |
| Cost | Number of costs | Y | Y | Y | Y | - |
| CV / CVR / CPA (conversions or LINE Tag clicks) | Conversion count / rate / cost | Y | Y | Y | Y | Y (CV, CVR) |
| CV / CVR / CPA (product details viewed) [+ (ALL)] | Product-details-viewed event metrics | Y | Y | Y | Y | Y |
| CV / CVR / CPA (item added to cart) [+ (ALL)] | Item-added-to-cart event metrics | Y | Y | Y | Y | Y |
| CV / CVR / CPA (checkout started) [+ (ALL)] | Checkout-started event metrics | Y | Y | Y | Y | Y |
| CV / CVR / CPA (purchased) [+ (ALL)] | Purchased event metrics | Y | Y | Y | Y | Y |
| CV value (purchased) [+ (click)] | Value of Conversion Purchase events | Y | Y | Y | Y | Y |
| ROAS [+ (click)] | Return on ad spend for purchase | Y | Y | Y | Y | Y |
| CV / CVR / CPA (lead generated) [+ (ALL)] | Lead-generated event metrics | Y | Y | Y | Y | Y |
| CV / CVR / CPA (reservation completed) [+ (ALL)] | Reservation-completed event metrics | Y | Y | Y | Y | Y |
| CV / CVR / CPA (signup completed) [+ (ALL)] | Signup-completed event metrics | Y | Y | Y | Y | Y |
| CV API | Number of CV API | Y | Y | Y | Y | Y |
| CV (All) / CVR (All) / CPA (All) | CV + CV API + Engagement view conversion, and its rate/cost | Y | Y | Y | Y | Y |
| CV / CVR / CPA (LINE tag + CV API) | CV + CV API metrics | Y | Y | Y | Y | Y |
| Installs (clicks / views / clicks and views / ALL / SKAN clicks) | App-install event counts by attribution | Y | Y | Y | Y (no SKAN) | Y (no SKAN) |
| Install rate (clicks / ALL / SKAN clicks) | Ratio of installs to clicks | Y | Y | Y | Y (no SKAN) | Y (no SKAN) |
| Cost per install (clicks / clicks and views / ALL / SKAN clicks) | Cost per install event | Y | Y | Y | Y (no SKAN) | - |
| Open / Open rate / Cost per open [+ (ALL)] | App-opening event metrics | Y | Y | Y | Y | Y (count, rate) |
| View home screen / Home screen view rate / Cost per view (home) [+ (ALL)] | Home-screen-view event metrics | Y | Y | Y | Y | Y (count, rate) |
| Category view / Category view rate / Cost per view (category) [+ (ALL)] | Category-view event metrics | Y | Y | Y | Y | Y (count, rate) |
| View product / Product view rate / Cost per view (product) [+ (ALL)] | Product-view event metrics | Y | Y | Y | Y | Y (count, rate) |
| Search / Search rate / Cost per search [+ (ALL)] | Search event metrics | Y | Y | Y | Y | Y (count, rate) |
| Add-to-cart / Add-to-cart rate / Cost per add-to-cart [+ (ALL)] | Add-to-cart event metrics | Y | Y | Y | Y | Y |
| Purchase / Purchase rate / Cost per purchase [+ (ALL)] | In-app purchase event metrics | Y | Y | Y | Y | Y (count, rate) |
| Level achieved / Level achieved rate / Cost per level achieved [+ (ALL)] | Level-achieved event metrics | Y | Y | Y | Y | Y (count, rate) |
| Tutorial complete / Tutorial percent complete / Cost per tutorial completion [+ (ALL)] | Tutorial-completion event metrics | Y | Y | Y | Y | Y (count, rate) |
| `<Custom conversion name>` / `<...> rate` / Cost per `<...>` | Custom-conversion event metrics. Column named after the custom conversion. Present only while the conversion is accumulated. | Y | Y | Y | Y | Y (count, rate) |
| Video (100% watched) / Cost per complete video view | Video completion count / cost | Y | Y | Y | Y | - |
| Video (viewed for at least three seconds) / Cost per 3-second playback | 3-second video views / cost | Y | Y | Y | Y | - |
| Video (25% / 50% / 75% / 95% watched) | Partial video-view counts | Y | Y | Y | Y | - |
