# Codes API (targeting value lookups)

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- `https://ads.line.me/public-docs/data-general-partner`
- `https://ads.line.me/public-docs/reporting-general-partner`

The Codes API is read-only and available to **all partner roles**. It returns
the valid codes you must use when building `Targeting` (and related fields) for
ad groups — gender codes, age ranges, OS codes/versions, placement codes, area
codes, advanced-targeting codes, etc. Always fetch these rather than hard-coding
values, because they vary by country and change over time.

Base URL `https://ads.line.me/api`; all paths prefixed with `/v3`. Unlike other
resources these are `/v3/codes/...` (no `adaccounts` segment). Every endpoint
produces `application/json` and shares the standard `400`/`401`/`403`/`429`/`500`
response set.

## Locale & country parameters

Many code endpoints take a `locale` (affects the human-readable `name` field)
and/or a `country`:

- `locale` enum: `ja`, `th`, `zh_TW`, `en`.
- `country` enum: `JP`, `TH`, `TW`.

## Table of contents

- 6.10 Codes — ssps / placements / ages / genders / os / call-to-actions / geo-delivery-targets / areas / advanced-targeting
- Definitions: Code, AgeCode, OsCode, AreaCode, AdvancedTargetingCodes, AdvancedTargetingCode

---

# 6.10 Codes

## ssps

```
GET /v3/codes/ssps
```

Get SSP (supply-side platform / placement-network) codes. Use the returned
`code` values for `Targeting.ssps`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< Code > array`.

## placements

```
GET /v3/codes/placements
```

Get placement codes. Use the returned `code` values for `Targeting.placements`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `country` (required) | The country. | enum (`JP`, `TH`, `TW`) |
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< Code > array`.

## ages

```
GET /v3/codes/ages
```

Get age codes. Use the returned `lower` / `upper` values for `Targeting.ageMin` /
`Targeting.ageMax`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `country` (optional) | The country. | enum (`JP`, `TH`, `TW`) |

Response `200`: `< AgeCode > array`.

## genders

```
GET /v3/codes/genders
```

Get gender codes. Use the returned `code` values for `Targeting.genders`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< Code > array`.

## os

```
GET /v3/codes/os
```

Get OS codes. Use the returned `code` for `OsVersion.os` and `versions` for
`OsVersion.verMin` / `verMax`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< OsCode > array`.

## call to actions

```
GET /v3/codes/call-to-actions
```

Get call-to-action codes. Use the returned `code` for `CallToAction.type`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `campaignObjective` (optional) | The objective of the campaign. | enum (`VISIT_MY_WEBSITE`, `APP_INSTALL`, `APP_ENGAGEMENT`, `WEBSITE_CONVERSION`, `DYNAMIC_PRODUCT`, `GAIN_FRIENDS`, `VIDEO_VIEW`) |
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< Code > array`.

## geo delivery targets

```
GET /v3/codes/geo-delivery-targets
```

Get geo delivery-target codes. Use the returned `code` for
`GeoArea.deliveryTargetingSetType`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< Code > array`.

## areas

```
GET /v3/codes/areas
```

Get area codes. Use the returned `code` for the `value` of a region-type
`Area`. The result is a tree (`children`).

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `country` (optional) | The country. | enum (`JP`, `TH`, `TW`) |
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `< AreaCode > array`.

## advanced targeting

```
GET /v3/codes/advanced-targeting
```

Get advanced-targeting codes (Interest, Behavior, Status, Purchase intent,
Yahoo! JAPAN segments). Use the returned `code` values for the arrays inside
`AdvancedTargeting`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Query | `campaignObjective` (optional) | The objective of the campaign. | enum (`VISIT_MY_WEBSITE`, `APP_INSTALL`, `APP_ENGAGEMENT`, `WEBSITE_CONVERSION`, `DYNAMIC_PRODUCT`, `GAIN_FRIENDS`, `VIDEO_VIEW`) |
| Query | `country` (optional) | The country. | enum (`JP`, `TH`, `TW`) |
| Query | `locale` (optional) | The locale. | enum (`ja`, `th`, `zh_TW`, `en`) |

Response `200`: `AdvancedTargetingCodes`.

---

# Definitions

## Code

The generic code object returned by ssps / placements / genders / call-to-actions /
geo-delivery-targets.

| Name | Description | Schema |
|---|---|---|
| `code` (read-only) | The code used in the request. | string |
| `type` (read-only) | The type of this code. | string |
| `name` (read-only) | The human-readable code name. | string |

## AgeCode

| Name | Description | Schema |
|---|---|---|
| `code` (read-only) | The age code. | string |
| `upper` (optional) | The upper limit of this age code, used in requests. | integer |
| `lower` (optional) | The lower limit of this age code, used in requests. | integer |

## OsCode

| Name | Description | Schema |
|---|---|---|
| `code` (read-only) | The code used in the request. | string |
| `type` (read-only) | The type of this code. | string |
| `name` (read-only) | The human-readable code name. | string |
| `versions` (optional) | Available versions of this OS code. | `< string > array` |

## AreaCode

A node of the area tree.

| Name | Description | Schema |
|---|---|---|
| `code` (read-only) | The code used in the request. | string |
| `name` (read-only) | The human-readable code name. | string |
| `children` (read-only) | The list of child areas. Optional. | `< AreaCode > array` |

## AdvancedTargetingCodes

A tree structure of all available advanced-targeting codes.

| Name | Description | Schema |
|---|---|---|
| `interests` (read-only) | List of Interest codes. | `< AdvancedTargetingCode > array` |
| `behaviors` (read-only) | List of user-behavior codes. | `< AdvancedTargetingCode > array` |
| `statuses` (read-only) | List of user-status codes. | `< AdvancedTargetingCode > array` |
| `purchaseIntents` (read-only) | List of user-purchase-intent codes. | `< AdvancedTargetingCode > array` |
| `yjInterests` (read-only) | List of Yahoo! Japan user-interest codes. Only JP is supported. | `< AdvancedTargetingCode > array` |
| `yjPurchaseIntents` (read-only) | List of Yahoo! Japan user-purchase-intent codes. Only JP is supported. | `< AdvancedTargetingCode > array` |
| `yjLifestyles` (read-only) | List of Yahoo! Japan user-lifestyle codes. Only JP is supported. | `< AdvancedTargetingCode > array` |

## AdvancedTargetingCode

A node of the tree representing one advanced-targeting code.

| Name | Description | Schema |
|---|---|---|
| `code` (read-only) | The code used in the request. | string |
| `type` (read-only) | The type of this code. | string |
| `name` (read-only) | The human-readable code name. | string |
| `description` (read-only) | The description of the code. | string |
| `audienceSize` (read-only) | The audience size of the targeting. Value `-1` means it is not available. | number |
| `betaFlag` (read-only) | Indicates whether the code is beta. | boolean |
| `selectable` (read-only) | Whether the code can actually be used for targeting. `true` — the code is a segment and can be used; `false` — the code is a category and cannot be used. | boolean |
| `children` (read-only) | The child nodes. | `< AdvancedTargetingCode > array` |
