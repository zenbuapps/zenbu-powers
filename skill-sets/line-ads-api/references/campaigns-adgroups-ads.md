# Campaigns, Adgroups & Ads

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- `https://ads.line.me/public-docs/data-general-partner`
- `https://ads.line.me/public-docs/reporting-general-partner`

Create/update/delete are available to **Ad Tech** (and partly Data Provider);
**Reporting** partners get the `read` endpoints only. Base URL
`https://ads.line.me/api`; all paths prefixed with `/v3`.

The entity hierarchy is **Adaccount → Campaign → Adgroup → Ad**. An Ad embeds a
`Creative` (see `references/media-and-creatives.md`); an Adgroup embeds
`Targeting`.

## Table of contents

- 6.6 Campaigns — read / create / update / delete
- 6.7 Adgroups — read / create / update / delete
- 6.8 Ads — read / create / update / delete
- Definitions: Campaign(s), Adgroup(s), Ad(s), Targeting, OsVersion, GeoArea, Area, AdvancedTargeting, Allowlist, AdgroupLearning
- Enum reference: campaign objectives, bid types, auto-bid types, bid strategies

---

# 6.6 Campaigns

## read

```
GET /v3/adaccounts/{adaccountId}/campaigns
```

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `includeRemoved` (optional) | Include removed entities if `true`. | boolean | `"false"` |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is one of `id`, `name`, `campaignObjective`, `configuredStatus`, `spendingLimitMicro`, `startDate`, `endDate`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Campaigns`.

## create

```
POST /v3/adaccounts/{adaccountId}/campaigns
```

Body: `Campaign`. Consumes/Produces `application/json`. Response `200`: `Campaign`.

## update

```
POST /v3/adaccounts/{adaccountId}/campaigns/{id}
```

Path `id` (number) + body `Campaign`. Consumes/Produces `application/json`. Response `200`: `Campaign`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/campaigns/{id}
```

Path `id` (number). Response `200`: No Content.

---

# 6.7 Adgroups

## read

```
GET /v3/adaccounts/{adaccountId}/adgroups
```

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `campaignId` (optional) | Campaign id. | number | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `includeRemoved` (optional) | Include removed entities if `true`. | boolean | `"false"` |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is one of `id`, `name`, `campaignId`, `configuredStatus`, `bidType`, `bidAmountMicro`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Adgroups`.

## create

```
POST /v3/adaccounts/{adaccountId}/adgroups
```

Body: `Adgroup`. Consumes/Produces `application/json`. Response `200`: `Adgroup`.

## update

```
POST /v3/adaccounts/{adaccountId}/adgroups/{id}
```

Path `id` (number) + body `Adgroup`. Consumes/Produces `application/json`. Response `200`: `Adgroup`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/adgroups/{id}
```

Path `id` (number). Response `200`: No Content.

---

# 6.8 Ads

## read

```
GET /v3/adaccounts/{adaccountId}/ads
```

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `adgroupId` (optional) | Adgroup id. | number | |
| Query | `campaignId` (optional) | Campaign id. | number | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `includeRemoved` (optional) | Include removed entities if `true`. | boolean | `"false"` |
| Query | `mediaId` (optional) | Media id. | number | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is one of `id`, `name`, `adgroupId`, `creative.id`, `configuredStatus`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Ads`.

## create

```
POST /v3/adaccounts/{adaccountId}/ads
```

Body: `Ad`. Consumes/Produces `application/json`. Response `200`: `Ad`.

## update

```
POST /v3/adaccounts/{adaccountId}/ads/{id}
```

Path `id` (number) + body `Ad`. Consumes/Produces `application/json`. Response `200`: `Ad`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/ads/{id}
```

Path `id` (number). Response `200`: No Content.

---

# Definitions

## Campaigns

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Campaign > array` |

## Campaign

| Name | Description | Schema |
|---|---|---|
| `id` (required, read-only) | Id of this campaign. | number |
| `name` (required) | Name of this campaign. Length: 1–120. | string |
| `campaignObjective` (required) | The objective of this campaign. | enum (`VISIT_MY_WEBSITE`, `APP_INSTALL`, `APP_ENGAGEMENT`, `WEBSITE_CONVERSION`, `DYNAMIC_PRODUCT`, `GAIN_FRIENDS`, `VIDEO_VIEW`) |
| `configuredStatus` (optional) | The status of this campaign. Becomes `REMOVED` if the entity is removed. | enum (`ACTIVE`, `PAUSED`, `REMOVED`) |
| `spendingLimitType` (required) | `NONE` — no spending limit. `MONTHLY` — spending limit is a monthly budget. `LIFETIME` — spending limit is a total budget. | enum (`NONE`, `MONTHLY`, `LIFETIME`) |
| `spendingLimitMicro` (optional) | Spending limit in micros, in adaccount currency. Campaigns that reach their spending limit are paused automatically. Example: `1000000000000` | integer (int64) |
| `startDate` (required) | Date to start delivering ads, ISO 8601, in adaccount timezone. Example: `"2021-12-20T17:19:00+09:00"` | string (date) |
| `endDate` (optional) | Date to suspend delivering ads, ISO 8601, in adaccount timezone. The value `1970-01-01T00:00:00Z` means the campaign runs indefinitely; set this field to `1970-01-01T00:00:00Z` to erase `endDate`. Example: `"2021-12-22T13:42:00+09:00"` | string (date) |
| `activeCbo` (optional) | Campaign budget optimization — splits the daily budget across ad groups by performance. **Cannot be modified.** Default: `false` | boolean |
| `bidStrategy` (optional) | Bidding strategy for campaign budget optimization; applies to all adgroups. Set on a new campaign; **cannot be changed** when making/editing adgroups. Usable when `activeCbo` is `true`. **Cannot be modified.** `LOWEST_COST` — no limit; spend daily budget as aggressively as possible. `COST_CAP` — set a target event cost cap. `TARGET_COST` — set target event cost. `TARGET_ROAS` — set target ROAS; `autoBidType` must be `CV_VALUE_STANDARD_PURCHASE`. | enum (`LOWEST_COST`, `COST_CAP`, `TARGET_COST`, `TARGET_ROAS`) |
| `dailyBudgetMicro` (optional) | Daily budget used for budget optimization, split between the campaign's adgroups, in micros, in adaccount currency. Set on a new campaign; **cannot be changed** when making/editing adgroups. Usable when `activeCbo` is `true`. Example: `120000000000` | integer (int64) |
| `deliveryStatus` (read-only) | Delivery status of the ad. | enum (`ACTIVE`, `PAUSED`, `REMOVED`, `NOT_DELIVERING`, `NOT_APPROVED`) |
| `deliveryStatusReasons` (read-only) | The reason of the delivery status. | `< DeliveryStatusReason > array` |
| `createdDate` / `modifiedDate` / `removedDate` (read-only) | ISO 8601 timestamps in adaccount timezone. | string (date) |

## Adgroups

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Adgroup > array` |

## Adgroup

| Name | Description | Schema |
|---|---|---|
| `id` (required, read-only) | Id of this adgroup. | number |
| `campaignId` (required) | Id of the parent campaign. | number |
| `name` (required) | Name of this adgroup. Length: 1–120. | string |
| `mediaApp` (optional) | App media of this adgroup. | `Media` |
| `configuredStatus` (optional) | Status of this adgroup. Becomes `REMOVED` if removed. | enum (`ACTIVE`, `PAUSED`, `REMOVED`) |
| `adgroupLearning` (read-only) | Adgroup learning information. | `AdgroupLearning` |
| `bidType` (required) | Type of bidding. Ignored when an action is set. | enum (`CPC`, `CPF`, `CPM`) |
| `bidAmountMicro` (optional) | Bid amount in micros, in adaccount currency. Acts as bid amount / max CPC / max CPA etc. depending on `autoBidType`. Example: `100000000` | integer (int64) |
| `targetRoas` (optional) | Target ROAS (Return on Ad Spend), used when `bidStrategy` is `TARGET_ROAS`. Percentage with range 1%–100000%. Example: `100000` | integer (int64) |
| `bidStrategy` (optional) | Strategy of auto bidding. Required when using an `autoBidType` other than `MANUAL`. When using lowest-cost, `bidAmountMicro` must be `null`. Values as for Campaign `bidStrategy`. | enum (`LOWEST_COST`, `COST_CAP`, `TARGET_COST`, `TARGET_ROAS`) |
| `dailyBudgetMicro` (optional) | Daily budget in micros, in adaccount currency. Example: `120000000000` | integer (int64) |
| `autoBidType` (optional) | Type of auto bidding. | enum (`MANUAL`, `CLICK`, `CONVERSION`, `CUSTOM_CONVERSION`, `STANDARD_CV_PURCHASE`, `CV_INSTALL`, `CV_OPEN`, `FRIEND`, `VIDEO_VIEW_3S`, `VIDEO_VIEW_COMPLETION`, `REACH`, `CV_SKADNETWORK`, `CV_LEAD`, `CV_VALUE_STANDARD_PURCHASE`) |
| `autoBidConversionId` (optional) | Custom conversion id. Usable when: `autoBidType` is `CUSTOM_CONVERSION`; the custom conversion's attribution period ≤ 30; its last contact date is not null. | string |
| `firstAutoBidConversionId` (read-only) | First custom conversion id set to this adgroup. If the adgroup is edited and becomes a custom-conversion adgroup again later, the id must be the one set first. | string |
| `activateSkAdNetworkReporting` (optional) | Select if using SKAdNetwork tracking with this ad group. | boolean |
| `targeting` (optional) | Targeting of this adgroup. | `Targeting` |
| `dpaDestinationType` (optional) | Type of DPA destination. (DPA only) | enum (`APP_STORE_URL`, `WEB_URL`, `TRACKING_URL_CMS`) |
| `dpaDestinationUrl` (optional) | URL of DPA destination. (DPA only) | string |
| `productSetId` (optional) | Product set id. (DPA only) | string |
| `dpaFeedType` (optional) | DPA feed type. If `PRODUCT_SET`, `productSetId` is mandatory. (DPA only) | enum (`CATALOG`, `PRODUCT_SET`) |
| `rnfStartDate` (optional) | Reach's start date, ISO 8601, in adaccount timezone. Example: `"2021-11-28T04:28:14+09:00"` | string (date) |
| `rnfEndDate` (optional) | Reach's end date, ISO 8601, in adaccount timezone. | string (date) |
| `rnfFrequency` (optional) | Reach's frequency cap. Min 2, max 10. | number |
| `rnfFrequencyInterval` (optional) | Reach's frequency interval — time interval which frequency resets for the ad group. Min 1, max 31. | number |
| `inStreamVideoIncluded` (optional) | Whether this adgroup is in-stream type. Requires: adaccount country `TW`; campaign objective can use video creative format; `autoBidType` is `MANUAL`. | boolean |
| `allowlist` (optional) | Adgroup LFP allow list. Create/update payload example: `{… "allowlist": "id" …}`. Remove payload example: `{… "allowlist": {} …}`. | `Allowlist` |
| `generatedByAi` (optional) | Flag indicating media is generated by AI. Only required for TW adgroups under DPA campaigns. | boolean |
| `deliveryStatus` (read-only) | Delivery status of the ad. | enum (`ACTIVE`, `PAUSED`, `REMOVED`, `NOT_DELIVERING`, `NOT_APPROVED`) |
| `deliveryStatusReasons` (read-only) | The reason of the delivery status. | `< DeliveryStatusReason > array` |
| `createdDate` / `modifiedDate` / `removedDate` (read-only) | ISO 8601 timestamps in adaccount timezone. | string (date) |

## AdgroupLearning

| Name | Description | Schema |
|---|---|---|
| `learningStatus` (read-only) | The status of learning. | enum (`LEARNING`, `NONE`, `DONE`) |
| `learningStatusCode` (read-only) | The code of learning. | integer |
| `lastLearningStartTs` (read-only) | Start date of learning. Example: `1569900000` | integer |
| `lastLearningEndTs` (read-only) | End date of learning. Example: `1569900000` | integer |
| `targetReachRatio` (read-only) | Progress percentage. Example: `0.3` | number (double) |
| `hasLearningCompletionHistory` (read-only) | Whether learning has been completed in the past. | boolean |

## Targeting

> Each targeting parameter is **replaced** with the one in a request when you
> call the `update` action — it is not a merge.
> Note: `GeoArea` is not supported by ARS, so for ad groups with geoTargeting,
> all ARS requests return `422`.

| Name | Description | Schema |
|---|---|---|
| `country` (optional) | Targeting country. Must be the country of the requesting adaccount. | enum (`JP`, `TH`, `TW`) |
| `targetingMode` (optional) | Targeting mode of the adgroup. Mode `AUTO` restricts audience and advanced targeting. | enum (`MANUAL`, `AUTO`) |
| `genders` (optional) | List of gender codes. See the Gender Codes API. | `< string > array` |
| `ageMin` (optional) | Lower limit of age in the age-targeting range. See the Age Codes API. | integer |
| `ageMax` (optional) | Upper limit of age in the age-targeting range. See the Age Codes API. | integer |
| `userOs` (optional) | List of `OsVersion`. | `< OsVersion > array` |
| `customAudienceIds` (optional) | List of audience ids for inclusion. | `< string > array` |
| `excludedCustomAudienceIds` (optional) | List of audience ids for exclusion. | `< string > array` |
| `geoArea` (optional) | Geo targeting. | `GeoArea` |
| `ssps` (optional) | List of placement-network types. See the SSP Codes API. | `< string > array` |
| `placements` (optional) | List of placement types. See the Placement Codes API. | `< string > array` |
| `includeAdvancedTargetings` (optional) | List of Advanced Targetings to include. | `< AdvancedTargeting > array` |
| `excludeAdvancedTargeting` (optional) | Advanced Targetings to exclude. | `AdvancedTargeting` |

## OsVersion

See the OS Codes API for the os codes and versions.

| Name | Description | Schema |
|---|---|---|
| `os` (required) | Name of the mobile operating system. | string |
| `verMin` (optional) | Minimum version in the OS version range. Example: `"10.0"` | string |
| `verMax` (optional) | Maximum version in the OS version range. Example: `"10.1"` | string |

## GeoArea

Geo targeting data. The maximum number of include and exclude radius areas is 5.

| Name | Description | Schema |
|---|---|---|
| `deliveryTargetingSetType` (optional) | The type of people targeted to deliver ads. See the Geo Delivery Target Codes API. | string |
| `includeAreas` (optional) | Locations that include people for ad delivery. | `< Area > array` |
| `excludeAreas` (optional) | Locations that exclude people for ad delivery. | `< Area > array` |

## Area

Location for targeting people.

| Name | Description | Schema |
|---|---|---|
| `areaType` (required) | Type of this area. `0` — Region type, represented by area code. `1` — Radius type, represented by latitude, longitude and radius. Example: `"0"` | string |
| `value` (optional) | Value representing the area location. Region type: an area code (e.g. `392.1`). Radius type: comma-separated latitude and longitude (e.g. `36.589921,139.081554`). See the Area Codes API. | string |
| `radius` (optional) | Radius of the circular location centered at latitude/longitude, in kilometers. Radius type only. Min 3, max 50. | integer |
| `label` (read-only) | Description of this location. | string |

## AdvancedTargeting

Advanced targeting data (Interest, Behavior, Status, Purchase intent, Yahoo!
JAPAN Interest, Yahoo! JAPAN Purchase Intent, Yahoo! JAPAN Lifestyle). See the
Advanced Targeting Codes API.

| Name | Description | Schema |
|---|---|---|
| `interests` (optional) | List of user interests. | `< string > array` |
| `behaviors` (optional) | List of user behaviors. | `< string > array` |
| `statuses` (optional) | List of user statuses. | `< string > array` |
| `purchaseIntents` (optional) | List of user purchase intents. | `< string > array` |
| `yjInterests` (optional) | List of Yahoo! Japan user interests. | `< string > array` |
| `yjPurchaseIntents` (optional) | List of Yahoo! Japan user purchase intents. | `< string > array` |
| `yjLifestyles` (optional) | List of Yahoo! Japan user lifestyles. | `< string > array` |

## Allowlist

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | The id of an LFP allowlist registered via Ad Manager. | number |

## Ads

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Ad > array` |

## Ad

| Name | Description | Schema |
|---|---|---|
| `id` (required, read-only) | Id of this ad. | number |
| `adaccountId` (optional) | Id of the parent adaccount. | string |
| `adgroupId` (required) | Id of the parent adgroup. | number |
| `name` (required) | Name of this ad. Length: 1–120. | string |
| `creative` (required) | Creative of this ad. Can be modified only when `configuredStatus` is `DRAFT`. When modifying, the creative must be complete, not a partial diff. | `Creative` |
| `configuredStatus` (optional) | Status of this ad. Becomes `REMOVED` if removed. Becomes `DRAFT` if copied via Ad Manager or created with `DRAFT` status. Status cannot be changed **to** `DRAFT` from another, only **from** `DRAFT` to another. | enum (`ACTIVE`, `PAUSED`, `DRAFT`, `REMOVED`) |
| `impTrackUrl` (optional) | Impression tracking URL of Nielsen, Flashtalking and Cinarra. Accepted domains: `.imrworldwide.com` (Nielsen), `.flashtalking.com` (Flashtalking), `*3ppa.jp.cinarra.com` (Cinarra). Modifiable only when `configuredStatus` is `DRAFT`. To remove, set value to empty string `""`. | string |
| `viewTrackUrl` (optional) | URL for measuring view-through conversion; shown as 'Impression URL' in the management site. Currently must start with `https://view.adjust.com`, `https://app.adjust.io` or `https://impression.appsflyer.com`. Usable when: bid type is `CPM`; campaign objective is `APP_INSTALL`; creative format is `VIDEO`. Modifiable only when `configuredStatus` is `DRAFT`. To remove, set value to empty string `""`. | string |
| `smallDelivery` (optional) | An ad with `CreativeFormat.VIDEO` can be delivered to small inventory such as smart channel. Video size should be 1by1 or 16by9. Available only for adaccounts with smart channel enabled. Default: `false` | boolean |
| `generatedByAi` (optional) | Flag indicating media is generated by AI. Only required for TW ads under non-DPA campaigns. | boolean |
| `deliveryStatus` (read-only) | Delivery status of the ad. | enum (`ACTIVE`, `PAUSED`, `REMOVED`, `NOT_DELIVERING`, `NOT_APPROVED`) |
| `deliveryStatusReasons` (read-only) | The reason of the delivery status. | `< DeliveryStatusReason > array` |
| `createdDate` / `modifiedDate` / `removedDate` (read-only) | ISO 8601 timestamps in adaccount timezone. | string (date) |

---

# Enum reference

## Campaign objectives (`campaignObjective`)

| Value | Meaning |
|---|---|
| `VISIT_MY_WEBSITE` | Drive traffic to a website. |
| `APP_INSTALL` | Drive app installs. |
| `APP_ENGAGEMENT` | Re-engage existing app users. |
| `WEBSITE_CONVERSION` | Optimize for website conversions (requires the WEBSITE_CONVERSION feature; uses LINE Tag). |
| `DYNAMIC_PRODUCT` | Dynamic Product Ads (DPA) — requires a product catalog / product set. |
| `GAIN_FRIENDS` | Add friends to a LINE Official Account (CPF). Unverified LINE Official Accounts cannot run these. |
| `VIDEO_VIEW` | Optimize for video views. |

An adaccount's `availableCampaignObjective` lists which objectives it may use.

## Bid types (`bidType`)

`CPC` (cost per click), `CPF` (cost per friend — used with `GAIN_FRIENDS`),
`CPM` (cost per mille / thousand impressions).

## Auto-bid types (`autoBidType`)

`MANUAL`, `CLICK`, `CONVERSION`, `CUSTOM_CONVERSION`, `STANDARD_CV_PURCHASE`,
`CV_INSTALL`, `CV_OPEN`, `FRIEND`, `VIDEO_VIEW_3S`, `VIDEO_VIEW_COMPLETION`,
`REACH`, `CV_SKADNETWORK`, `CV_LEAD`, `CV_VALUE_STANDARD_PURCHASE`. When
`autoBidType` is anything other than `MANUAL`, `bidStrategy` must be set; with
`LOWEST_COST`, `bidAmountMicro` must be `null`.

## Bid strategies (`bidStrategy`)

`LOWEST_COST`, `COST_CAP`, `TARGET_COST`, `TARGET_ROAS`. `TARGET_ROAS` requires
`autoBidType = CV_VALUE_STANDARD_PURCHASE` and `targetRoas` set on the adgroup.
