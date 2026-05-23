---
name: line-ads-api
description: >-
  LINE Ads API (LINE Ads Management API / LADM) official reference at
  API-reference depth. Covers the entire ad-platform REST API exposed at
  ads.line.me/api: every endpoint, request/response schema, query parameter,
  enum, definition object, delivery-status reason, and error reason. Use this
  skill whenever the task touches LINE advertising automation: building or
  debugging a LINE Ads integration, an Ad Tech partner, a Data Provider
  partner, or a Reporting partner; managing ad accounts (adaccounts), groups,
  link requests, campaigns, ad groups (adgroups), ads, creatives, media (image
  / video / animation / app upload), product catalogs / DPA product sets and
  products; building or reading custom audiences (UPLOAD, LOOKALIKE,
  WEBTRAFFIC, APP_EVENT, ACCOUNT_FRIENDS, VIDEO_VIEW, IMAGE_CLICK), custom
  conversions, LINE Tags and tag events; generating performance reports
  (pfreports), online reports, change-history reports; running ARS adgroup
  result simulations; or signing requests with JWS / HMAC-SHA256. Trigger on
  mentions of: LINE Ads API, LINE Ads Manager, LADM, ads.line.me, LINE Ad
  Manager API, /api/v3/adaccounts, /api/v3/campaigns, /api/v3/adgroups,
  /api/v3/ads, pfreports, custom-audiences, custom-conversions, line-tags,
  product-sets, campaignObjective, autoBidType, bidStrategy, DPA, dynamic
  product ads, GAIN_FRIENDS, WEBSITE_CONVERSION, APP_INSTALL, spendingLimitMicro,
  bidAmountMicro, JWS signature for LINE Ads, Access key / Secret key, X-Request-
  Quota-Limit, Ad Tech General partner, Data Provider General partner,
  certificated-ad-tech-general-partner, data-general-partner,
  reporting-general-partner, ml-lads-api-support, developers.line.biz/docs/line-ads-api.
---

# LINE Ads API (LINE Ads Management API) Reference

API-reference-level coverage of the **LINE Ads Management API** (internally
"LADM", currently v3 / spec version 3.12.0.1, LADM v12.0.1 feature set).

The official LINE Developers site (`developers.line.biz/en/docs/line-ads-api/`)
only carries an "About" page and a "development guidelines" page — it explicitly
states that the real reference lives **on another site**. The full API
specification is published at:

- Ad Tech (General): `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- Data Provider (General): `https://ads.line.me/public-docs/data-general-partner`
- Reporting (General): `https://ads.line.me/public-docs/reporting-general-partner`

All three are the same underlying spec, scoped to a partner role; this skill
folds them into topic-scoped reference files. **Read the reference file that
matches the task — do not guess endpoint paths, parameter names, enum values,
or JSON shapes.**

## When this skill applies

Any work against the LINE Ads platform over HTTP (`curl`, `fetch`, `axios`,
`requests`, etc.): managing ad accounts, groups, link requests, campaigns,
ad groups, ads, creatives, media, DPA product catalogs; creating or reading
custom audiences, custom conversions, LINE Tags; pulling performance / online /
history reports; running ARS simulations; or implementing the JWS request
signature. There is no official SDK — every call is a signed raw HTTP request.

## Three partner roles — pick the right doc

The API surface depends on which partner permission your authorized Group holds.
A single Group can hold more than one.

| Role | Resources it exposes | Rate limit |
|---|---|---|
| **Ad Tech** (`certificated-ad-tech-general-partner`) | Full management: LinkRequests, Groups, Adaccounts, Reports, OnlineReports, Campaigns, Adgroups, Ads, Media, Codes, Simulations, Histories, CustomAudiences (read), CustomConversions (read), ProductSets, Products | 10 req/sec |
| **Data Provider** (`data-general-partner`) | LinkRequests, Groups, Adaccounts, Codes, Simulations, **CustomAudiences (full CRUD + upload + overlap)**, **CustomConversions (CRUD)**, **LineTags**, **TagEvents** | 10 req/sec |
| **Reporting** (`reporting-general-partner`) | Read-only: LinkRequests, Groups, Adaccounts, Reports, OnlineReports, Campaigns (read), Adgroups (read), Ads (read), Media (read), Codes, Simulations | 2 req/sec |

When an inquiry asks which permission you use, answer `LINE Ads API` or
`Conversion API` (support email: `ml-lads-api-support@lycorp.co.jp`).

## API basics in one line

- **Base URL**: `https://ads.line.me/api` — every path below is appended after `/api`.
- **Versioned prefix**: all endpoints live under `/v3/...` (so the full path is e.g. `https://ads.line.me/api/v3/adaccounts/{adaccountId}/campaigns`).
- **Auth**: every request carries a JWS signature in `Authorization: Bearer <signature>` plus a `Date` header. There is no OAuth token. See `references/authentication.md`.
- **Money fields** are in **micros**, in the ad account's currency (e.g. `1000000` micros = 1 unit of currency). Field names end in `Micro`.
- **Dates**: entity timestamps are ISO 8601 in the ad account timezone; report `since`/`until` are `YYYY-MM-DD`.
- **List endpoints** return `{ paging, datas }`; paginate with `page` (1-based) and `size`.
- IDs: `adaccountId` and `groupId` are **strings**; campaign / adgroup / ad / report entity `id` is a **number**.

## Reference file map

| File | Contents |
|---|---|
| `references/authentication.md` | The JWS / HMAC-SHA256 request signature in full: JOSE header, payload construction (Digest-SHA-256 / Content-Type / Date / CanonicalURI), signing input, worked examples (with and without request body), the complete Python sample, required HTTP headers, common specs (rate limits, Request Quota headers), error response shape |
| `references/groups-and-adaccounts.md` | LinkRequests (read/create/update), Groups (read/create child/update), Adaccounts (read). Definitions: `LinkRequest`, `Group`, `Adaccount`, `LineAccount`, `Paging` |
| `references/campaigns-adgroups-ads.md` | Campaigns, Adgroups, Ads endpoints (read/create/update/delete). Definitions: `Campaign`, `Adgroup`, `Ad`, `Targeting`, `GeoArea`, `Area`, `OsVersion`, `AdvancedTargeting`, `Allowlist`, `AdgroupLearning`. Campaign objectives, bid types, auto-bid types, bid strategies |
| `references/media-and-creatives.md` | Media endpoints (read/create-app/update/delete/upload, rejected-URL re-review) and Creative structure used inside an Ad. Definitions: `Media`, `MediaUpload`, `ObsObject`, `Review`, `Creative`, `CallToAction`, `CreativeSlot`, `MediaUrlReReviewRequest`. Creative formats |
| `references/audiences-conversions-tags.md` | CustomAudiences (read everywhere; create/update/delete/upload/get-upload-job/overlap on Data Provider), CustomConversions (read everywhere; create/update on Data Provider), LineTags, TagEvents. Definitions: `CustomAudience` + all function-type sub-objects (`WebTraffic`, `Lookalike`, `AppEvent`, `AccountFriends`, `VideoView`, `ImageClick`, …), `CustomConversion`, `LineTag`, `TagEvent` |
| `references/products-and-dpa.md` | ProductSets and Products endpoints (Dynamic Product Ads catalogs). Definitions: `ProductSet`, `ProductSetRule`, `ProductSetRuleFilter`, `Product`, and the five `ProductItem_*` feed schemas (EC, Hotels, Flight, RealEstate, Recruitment) |
| `references/reporting.md` | Reports (pfreports: create/read/delete/download/download-sample), OnlineReports, Histories (change-history reports), Simulations (ARS). Definitions: `ReportQueryParams`, `ReportBreakdown`, `ReportFiltering`, `ReportOnlineStatistics`, `HistoryCreation`, `ArsSimulationRequest/Result`, `TimeRange`. Full report-field matrix |
| `references/codes.md` | The Codes API (read-only lookup of valid values for targeting): ssps, placements, ages, genders, os, call-to-actions, geo-delivery-targets, areas, advanced-targeting. Definitions: `Code`, `AgeCode`, `OsCode`, `AreaCode`, `AdvancedTargetingCode(s)` |
| `references/status-and-errors.md` | The `deliveryStatus` / `deliveryStatusReasons` reason-code catalog, the full Error Reasons catalog (`reason` strings), HTTP status code meanings, development guidelines (no mass requests, no non-existent IDs, log retention) |

## Quick endpoint index

Base URL `https://ads.line.me/api`; all paths prefixed `/v3`. `aid` = adaccountId
(string), `gid` = groupId (string), `id` = numeric entity id.

```
# Groups & access (all roles)
GET    /v3/groups/{gid}/link-request                     Read link requests
POST   /v3/groups/{gid}/link-request/adaccount           Create adaccount link request
POST   /v3/groups/{gid}/link-request/{id}/{actionType}   Update link request (cancel|unlink)
GET    /v3/groups/{gid}/children                         Read child groups
POST   /v3/groups/{gid}/children                         Create child group
POST   /v3/groups/{gid}                                  Update group
GET    /v3/groups/{gid}/adaccounts                       Read adaccounts

# Campaigns / Adgroups / Ads  (Ad Tech & Data Provider full; Reporting read-only)
GET    /v3/adaccounts/{aid}/campaigns                    Read campaigns
POST   /v3/adaccounts/{aid}/campaigns                    Create campaign
POST   /v3/adaccounts/{aid}/campaigns/{id}               Update campaign
DELETE /v3/adaccounts/{aid}/campaigns/{id}               Delete campaign
GET    /v3/adaccounts/{aid}/adgroups                     Read adgroups
POST   /v3/adaccounts/{aid}/adgroups                     Create adgroup
POST   /v3/adaccounts/{aid}/adgroups/{id}                Update adgroup
DELETE /v3/adaccounts/{aid}/adgroups/{id}                Delete adgroup
GET    /v3/adaccounts/{aid}/ads                          Read ads
POST   /v3/adaccounts/{aid}/ads                          Create ad
POST   /v3/adaccounts/{aid}/ads/{id}                     Update ad
DELETE /v3/adaccounts/{aid}/ads/{id}                     Delete ad

# Media
GET    /v3/adaccounts/{aid}/media                        Read media
POST   /v3/adaccounts/{aid}/media                        Create 'app' media
POST   /v3/adaccounts/{aid}/media/{id}                   Update media
DELETE /v3/adaccounts/{aid}/media/{id}                   Delete media
POST   /v3/adaccounts/{aid}/media/upload                 Upload image/video (multipart)
GET    /v3/adaccounts/{aid}/media/urls/rereview          Read rejected media URLs
POST   /v3/adaccounts/{aid}/media/urls/rereview          Request re-review of rejected URLs

# Reporting
GET    /v3/adaccounts/{aid}/pfreports                    Read performance reports
POST   /v3/adaccounts/{aid}/pfreports                    Create performance report
DELETE /v3/adaccounts/{aid}/pfreports/{id}               Delete performance report
GET    /v3/adaccounts/{aid}/pfreports/{id}/download      Download report CSV
GET    /v3/adaccounts/{aid}/pfreports/{id}/download/sample  Download sample report
GET    /v3/adaccounts/{aid}/reports/online/{reportLevel} Read online report (campaign|adgroup|ad)
GET    /v3/adaccounts/{aid}/history-files                Read change-history reports
POST   /v3/adaccounts/{aid}/history-files                Create change-history report
DELETE /v3/adaccounts/{aid}/history-files/{ids}          Delete change-history reports
GET    /v3/adaccounts/{aid}/history-files/{id}/download  Download change-history CSV
POST   /v3/adaccounts/{aid}/simulation/ars               Run ARS adgroup result simulation

# Custom audiences / conversions / tags
GET    /v3/adaccounts/{aid}/custom-audiences             Read custom audiences      (all roles)
POST   /v3/adaccounts/{aid}/custom-audiences             Create custom audience     (Data Provider)
POST   /v3/adaccounts/{aid}/custom-audiences/{id}        Update custom audience     (Data Provider)
DELETE /v3/adaccounts/{aid}/custom-audiences/{ids}       Delete custom audiences    (Data Provider)
GET    /v3/adaccounts/{aid}/custom-audiences/{ids}/upload-job  Get upload job result (Data Provider)
POST   /v3/adaccounts/{aid}/custom-audiences/upload      Upload Advertising IDs     (Data Provider, multipart)
POST   /v3/adaccounts/{aid}/custom-audiences/overlapping-audiences  Estimate audience overlap (Data Provider)
GET    /v3/adaccounts/{aid}/custom-conversions           Read custom conversions    (all roles)
POST   /v3/adaccounts/{aid}/custom-conversions           Create custom conversion   (Data Provider)
POST   /v3/adaccounts/{aid}/custom-conversions/{id}      Update custom conversion   (Data Provider)
GET    /v3/adaccounts/{aid}/line-tags                    Read LINE Tags             (Data Provider)
GET    /v3/adaccounts/{aid}/tag-events                   Read tag events            (Data Provider)

# DPA product catalogs
GET    /v3/adaccounts/{aid}/product-sets                 Read product sets
POST   /v3/adaccounts/{aid}/product-sets                 Create product set
GET    /v3/adaccounts/{aid}/product-sets/{id}            Read one product set
POST   /v3/adaccounts/{aid}/product-sets/{id}            Update product set
DELETE /v3/adaccounts/{aid}/product-sets/{id}            Delete product set
GET    /v3/adaccounts/{aid}/product/products/product-set-feeds  Read feed items of a product set
GET    /v3/adaccounts/{aid}/product/products             Read products (?itemIds=, max 200)
POST   /v3/adaccounts/{aid}/product/products             Create & update products (max 200)
DELETE /v3/adaccounts/{aid}/product/products             Delete products (?itemIds=, max 200)

# Codes (read-only lookup of valid targeting values)
GET    /v3/codes/ssps                                    SSP / placement-network codes
GET    /v3/codes/placements                              Placement codes (?country= JP|TH|TW)
GET    /v3/codes/ages                                    Age codes
GET    /v3/codes/genders                                 Gender codes
GET    /v3/codes/os                                      OS codes + versions
GET    /v3/codes/call-to-actions                         Call-to-action codes
GET    /v3/codes/geo-delivery-targets                    Geo delivery-target codes
GET    /v3/codes/areas                                   Area codes
GET    /v3/codes/advanced-targeting                      Advanced-targeting code tree
```

## Working rules

- **Sign every request.** The signature is JWS over `Digest-SHA-256\nContent-Type\nDate\nCanonicalURI`. With no body (or `multipart/form-data`), the digest is SHA-256 of an **empty string** and Content-Type is the empty string. The `Date` header must be RFC 1123 and within ±15 minutes of server time, and its `YYYYMMDD` form must equal the `Date` field inside the payload. See `references/authentication.md`.
- **CanonicalURI includes `/api`** — e.g. `/api/v3/adaccounts/A1/campaigns`, not `/v3/adaccounts/A1/campaigns`.
- **`update` is `POST`, not `PUT`** for every resource. There is no `PATCH`.
- **Updates replace, not merge.** For `Adgroup.targeting` each targeting field is replaced wholesale; for `Ad.creative` you must send the complete creative, not a partial diff. A creative can only be modified while `configuredStatus` is `DRAFT`.
- **Money is micros.** `spendingLimitMicro`, `dailyBudgetMicro`, `bidAmountMicro` etc. are integers in account currency × 1,000,000.
- **Async results.** CustomAudience `create`/`upload`/`delete` return `202`; poll the upload-job endpoint. ARS `simulation/ars` can return `422` with an `ArsSimulationResult` listing `absentFields` / `invalidFields`.
- **Removed entities are hidden by default.** Pass `includeRemoved=true` (or `includeRemove` on report params) to see `REMOVED` entities.
- **endDate sentinel:** a campaign `endDate` of `1970-01-01T00:00:00Z` means "runs indefinitely"; set it to that value to erase a previously set end date.
- **Rate limits are per API user, per endpoint** (10 req/s Ad Tech & Data Provider, 2 req/s Reporting); over-limit yields `429`. Some endpoints also enforce a concurrent **Request Quota** (`X-Request-Quota-Limit` / `X-Request-Quota-Used` headers) — exceeding it returns the value `EXCEED_LIMIT`.
- **Never send requests for non-existent IDs** and never load-test against the platform — see `references/status-and-errors.md`.
