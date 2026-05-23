# Product Sets & Products (Dynamic Product Ads)

Source: `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`

ProductSets and Products are **Ad Tech** capabilities, used to build the
catalogs that feed **Dynamic Product Ads** (DPA — campaign objective
`DYNAMIC_PRODUCT`). Base URL `https://ads.line.me/api`; all paths prefixed with
`/v3`.

A **Product** is one feed item (one row of a catalog). A **ProductSet** is a
rule-based subset of a catalog; an adgroup with `dpaFeedType=PRODUCT_SET`
references a `productSetId`.

## Distinct error scheme

Unlike the rest of the API, the ProductSets / Products endpoints return errors
**without a body**, using these named reasons (in the doc text of the status):

| HTTP Code | Reasons |
|---|---|
| 400 | `BAD_REQUEST` — request feed item count exceeded / invalid request parameter or payload / validation failed. `UNSUPPORTED_TYPE` — unsupported type. `INVALID_PRICE` — price format not acceptable. |
| 403 | `NO_AUTHORITY` — credentials in the header differ from the data requested. |
| 404 | `NO_DATA` — requested data does not exist. |
| 500 | `EXCEED_LIMIT` — request received beyond the limit. `INTERNAL_SERVER_ERROR` — unmanaged server error. |

## Table of contents

- 6.15 ProductSets — read / create / read-single / update / delete / read-feed-items
- 6.16 Products — read / create-and-update / delete
- Definitions: ProductSet(s), ProductSetRule, ProductSetRuleFilter, ProductSetPageInfo, ProductSetCreateOrUpdateRequest, Product(s), ProductItem(s), ProductItem_EC / _Hotels / _Flight / _RealEstate / _Recruitment, UpsertProductResponse

---

# 6.15 ProductSets

## read

```
GET /v3/adaccounts/{adaccountId}/product-sets
```

Read product sets.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Content size. | integer | 50 |
| Query | `sort` (optional) | Sort condition. | string | `"createdDate,desc"` |

Response `200`: `ProductSets`.

## create

```
POST /v3/adaccounts/{adaccountId}/product-sets
```

Path `adaccountId` + body `ProductSetCreateOrUpdateRequest`. Consumes/Produces
`application/json`. Response `200`: `ProductSet`.

## read single

```
GET /v3/adaccounts/{adaccountId}/product-sets/{id}
```

Path `adaccountId` (string) + `id` (string, the product set pk). Produces
`application/json`. Response `200`: `ProductSet`.

## update

```
POST /v3/adaccounts/{adaccountId}/product-sets/{id}
```

Path `adaccountId` + `id` (string) + body `ProductSetCreateOrUpdateRequest`.
Consumes/Produces `application/json`. Response `200`: `ProductSet`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/product-sets/{id}
```

Path `adaccountId` + `id` (string). Response `200`: No Content.

## read feed items of product set

```
GET /v3/adaccounts/{adaccountId}/product/products/product-set-feeds
```

Read the feed items (products) belonging to a product set.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `productSetId` (required) | Product set pk. | string | |
| Query | `size` (optional) | Content size. | integer | 50 |
| Query | `sort` (optional) | Sort condition. | string | `"createdDate,desc"` |

Response `200`: `Products`.

---

# 6.16 Products

## read

```
GET /v3/adaccounts/{adaccountId}/product/products
```

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Query | `itemIds` (required) | Multiple item ids separated by comma. An item id is a unique product id per adaccount. **Request size: max 200.** | string |

Response `200`: `Products`.

## create and update

```
POST /v3/adaccounts/{adaccountId}/product/products
```

Create and update Products in a single call (upsert).

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `ProductItems` |

Consumes/Produces `application/json`. Response `200`: `UpsertProductResponse`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/product/products
```

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Query | `itemIds` (required) | Multiple item ids separated by comma. **Request size: max 200.** | string |

Response `200`: No Content.

---

# Definitions

## ProductSets

| Name | Description | Schema |
|---|---|---|
| `data` (optional) | Product set list. | `< ProductSet > array` |
| `pageInfo` (optional) | | `ProductSetPageInfo` |

## ProductSet

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Product set id. | string |
| `catalogId` (optional) | Product set catalog id. | number (double) |
| `adaccountId` (optional) | Adaccount id. | string |
| `name` (optional) | Product set name. | string |
| `rule` (optional) | Product set rule. | `ProductSetRule` |
| `activated` (optional) | Product set active flag. | boolean |
| `activeStatus` (optional) | Product set active status. | enum (`CREATED`, `INACTIVE`, `ACTIVE`, `DELETED`) |
| `createdDate` / `modifiedDate` / `removedDate` (optional) | Timestamps. | string (date) |

## ProductSetRule

| Name | Description | Schema |
|---|---|---|
| `operator` (optional) | Product set rule operator — `"AND"`, `"OR"`, `"ALL"`. | string |
| `filters` (optional) | Product set rule filters. When `operator` is `"ALL"`, `filters` must be set to `[]`. | `< ProductSetRuleFilter > array` |

## ProductSetRuleFilter

| Name | Description | Schema |
|---|---|---|
| `target` (optional) | Filter target name. `price` → `data.price` (maps columns price, salary). `productType` → `data.productType` (maps columns productType, hotelType, jobType, itemType, destinationType). One of `["data.customLabel0", "data.customLabel1", "data.customLabel2", "data.customLabel3", "data.customLabel4", "data.price", "data.productType"]`. | string |
| `condition` (optional) | Target condition. For customLabels / productType: `is contained in`, `is not contained in`, `is one of`, `is not one of`. For price: `is greater than`, `is less than`, `is greater than or equal to`, `is less than or equal to`. | string |
| `value` (optional) | Target value list. Max length 500 (price: 20, salary: 25, customLabel: 100, productType: 500). `price` (price, salary) has only 1 element. Example: `[ "10" ]` | `< string > array` |

## ProductSetPageInfo

| Name | Description | Schema |
|---|---|---|
| `pageSize` (optional) | Page size. | integer |
| `number` (optional) | Page number. | integer |
| `totalElements` (optional) | Total element count. | integer |

## ProductSetCreateOrUpdateRequest

| Name | Description | Schema |
|---|---|---|
| `name` (optional) | Product set name. | string |
| `rule` (optional) | Product set rule. | `ProductSetRule` |

## Products

| Name | Schema |
|---|---|
| `list` (optional) | `< Product > array` |

## Product

The catalog-level wrapper around a feed item (returned by reads / upserts).

| Name | Description | Schema |
|---|---|---|
| `accUid` (required) | Adaccount id. Example: `"A123456789012"` | string |
| `tranId` (required) | Last transaction id (set API). Example: `"641910718cf1e9275e751e8d"` | string |
| `itemId` (required) | Unique product id per adaccount. Example: `"ECPEA19"` | string |
| `data` (required) | See `ProductItem`. | `ProductItem` |
| `status` (required) | `w` — wait for review (default). `a` — review approved, can be delivered. `rp` — review processing. `e` — post-validation error (invalid data field value not caught during API validation, e.g. image link). `d` — deleted (includes out_of_stock availability). `p` — paused media. `r` — review rejected. Example: `"w"` | string |
| `imageFileSize` (optional) | Image file size (bytes). Example: `123456` | integer |
| `err` (optional) | Error message. `REQUIRED` — missing mandatory field. `EMPTY` — value must not be empty. `NOT_URL` — value must be URL format. `TOO_LONG` — string value too long. `NOT_POSITIVE` — numeric value must be positive. `INVALID_VALUE` — value must be one of the examples. `INVALID_TYPE` — unexpected value type. | string |
| `textReviewStatus` (required) | Same values as `status`. | string |
| `imgReviewStatus` (required) | Same values as `status`. | string |
| `created` (required) | Created date. Example: `"2022-05-25T07:15:24.000Z"` | string (date) |
| `updated` (optional) | Last updated date. | string (date) |

## ProductItem

The feed item — choose one of the five schemas by your business vertical.

| Name | Schema |
|---|---|
| schema for EC (optional) | `ProductItem_EC` |
| schema for Hotels (optional) | `ProductItem_Hotels` |
| schema for Flight (optional) | `ProductItem_Flight` |
| schema for Real estate (optional) | `ProductItem_RealEstate` |
| schema for Recruitment (optional) | `ProductItem_Recruitment` |

## ProductItem_EC

| Name | Description | Schema |
|---|---|---|
| `productId` (required) | Unique identifier (SKU) per product. If duplicated in one request, the last one overwrites. Does not support `.`, `#`, `%`, emoji. | string |
| `productType` (required) | The category / category list the item belongs to; match the customer's website category. | string |
| `title` (required) | Product title shown in the ad. Catalog max 150 chars (half-width = 1, full-width = 2). Displayed length varies by surface/device (avg. 20). | string |
| `description` (required) | Product description shown in the ad. Catalog max 5000 chars. Displayed avg. 40. | string |
| `imageLink` (required) | Image link. Errors if below minimum resolution or above max aspect ratio. Minimum resolution: 1:1 = 100×100 (*600×600+ recommended); 1.91:1 = 100×100 (*1200×628 recommended). | string |
| `link` (required) | Site link — a vendor where products can be purchased. | string |
| `availability` (required) | In stock or not (case-insensitive): `in_stock`, `out_of_stock` (ad will not be sent), `preorder`. | string |
| `price` (required) | Selling price. 0 allowed. Only numbers and commas; no currency symbols. | integer |
| `currency` (required) | ISO 4217 alphabetic currency code (case-sensitive). | string |
| `analyzeTitle` (optional) | Product title used for analysis. Max 100 chars. | string |
| `analyzeDescription` (optional) | Product description used for analysis. Max 5000 chars. | string |
| `productGroupId` (optional) | Used to group products. LINE DPA picks only one item per `product_group_id` for a recommendation (same-group products not in the same carousel). | string |
| `googleProductCategory` (optional) | Google product category — see `support.google.com/merchants/answer/6324436`. | string |
| `condition` (optional) | Product status: `new`, `refurbished`, `used`. | string |
| `size` (optional) | Item size. | string |
| `sizeSystem` (optional) | Country size system: `US`, `UK`, `EU`, `DE`, `FR`, `JP`, `CN`, `IT`, `BR`, `MEX`, `AU`. | string |
| `color` (optional) | Product color. | string |
| `material` (optional) | Product material. | string |
| `pattern` (optional) | Product pattern. | string |
| `ageGroup` (optional) | Product age group. | string |
| `gender` (optional) | Product gender group. | string |
| `salePrice` (optional) | Discount price. 0 allowed. Numbers and commas only. | integer |
| `saleRate` (optional) | Discount rate (%). 0 allowed (no decimal point). | integer |
| `salePriceEffectiveDate` (optional) | Sale start/end time. Example: `"YYYY-MM-DDT0:00-23:59/YYYY-MM-DDT0:00-23:59"` | string |
| `badge` (optional) | Used for badges (e.g. number of ratings, new). 0–5 in 0.5 increments. | number (double) |
| `brand` (required) | The brand of a product. | string |
| `androidUrl` (optional) | Custom scheme for the Android app as URL. | string |
| `androidTracking` (optional) | 3rd-party tracking URL for `androidUrl` (fired in background, tracking only). | string |
| `iosUrl` (optional) | Custom scheme for the iOS app or iOS Universal URL. | string |
| `iosTracking` (optional) | 3rd-party tracking URL for `iosUrl`. | string |
| `customLabel0`–`customLabel4` (optional) | Strings + numbers + special characters (not `.`, `#`, `,`, emoji). Up to 1000 unique values per custom-label field. | string |

## ProductItem_Hotels

| Name | Description | Schema |
|---|---|---|
| `hotelId` (required) | Unique identifier for a hotel room. Duplicates after the first are ignored. Max 100 chars; no dots. | string |
| `title` (required) | Title shown in the ad. Catalog max 150 chars; ad max 20 chars. | string |
| `description` (required) | Description shown in the ad. Catalog max 5000 chars; ad max 40 chars. | string |
| `analyzeTitle` / `analyzeDescription` (optional) | For analysis. Max 100 / 5000 chars. | string |
| `imageLink` (required) | Image link. Min resolution 1:1 = 100×100 (*600×600+ rec), 16:9 = 100×100 (*1200×628 rec). Max image size 10MB. Max aspect ratio: height ≤ 2× width, width ≤ 7× height. | string |
| `link` (required) | Site link. | string |
| `availability` (required) | `in_stock`, `out_of_stock` (ad not sent). | string |
| `price` (required) | Price per night × stay duration = total price. 0 allowed. | integer |
| `currency` (required) | ISO 4217 alphabetic (case-sensitive). Supported: `JPY`, `USD`, `THB`, `TWD`, `KRW`, `IDR`. | string |
| `salePrice` (optional) | Discount price. 0 allowed. | integer |
| `saleRate` (optional) | Discount rate (%). 0 allowed. | integer |
| `salePriceEffectiveDate` (optional) | Sale start/end. Example: `"YYYY-MM-DDT0:00-23:59/YYYY-MM-DDT0:00-23:59"` | string |
| `guestRatings` (optional) | Evaluation (0.5 units). | number (double) |
| `thenumberOfReviewers` (optional) | Number of guests who participated in the evaluation. | number |
| `guestRatingSystem` (optional) | The review/rating service. Max 100 chars. Example: `"TripAdviser"` | string |
| `starRating` (optional) | Hotel grade (1–5, 0.5 increments). | number (double) |
| `hotelType` (required) | Accommodation type. Samples: `hotel`, `apartment`, `hostel`, `guesthouse`, `resort`, `motel`, `private villa`, `capsule hotel`, `others`. | string |
| `roomType` (optional) | Room type. Samples: `Suit room`, `Executive room`, `Deluxe`. | string |
| `country` (optional) | ISO 3166-1 alpha-2. | string |
| `prefecture` / `city` / `route` (optional) | Arbitrary string format. | string |
| `zipcode` (optional) | ZIP code. | string |
| `androidUrl` / `androidTracking` / `iosUrl` / `iosTracking` (optional) | App URLs and 3rd-party tracking URLs. | string |
| `customLabel0`–`customLabel4` (optional) | Strings + numbers + special characters. Up to 100 unique values per field. | string |

## ProductItem_Flight

| Name | Description | Schema |
|---|---|---|
| `destinationId` (required) | Flight destination by IATA code. The (`destination_id` + `origin_id`) combination must be unique. Max 50 chars. | string |
| `originId` (required) | Flight origin by IATA code. The (`destination_id` + `origin_id`) combination must be unique; duplicates after the first are ignored. Max 50 chars. | string |
| `title` (required) | Title shown in the ad. Catalog max 150; ad max 20. | string |
| `description` (required) | Description shown in the ad. Catalog max 5000; ad max 40. | string |
| `analyzeTitle` / `analyzeDescription` (optional) | For analysis. Max 100 / 5000 chars. | string |
| `imageLink` (required) | Image link. Min resolution 1:1 = 100×100 (*600×600+ rec), 16:9 = 100×100 (*1200×628 rec). Max 10MB. Max aspect ratio: height ≤ 2× width, width ≤ 7× height. | string |
| `link` (required) | Site link. | string |
| `price` (required) | One-way ticket price. 0 allowed. | integer |
| `currency` (required) | ISO 4217 alphabetic (case-sensitive). Sample: `JPY`, `USD`, `THB`, `TWD`, `KRW`, `IDR`. | string |
| `destinationType` (required) | Destination in Country-City format. Sample: `japan-tokyo`. | string |
| `salePrice` / `saleRate` / `salePriceEffectiveDate` (optional) | Discount price/rate/effective date. | integer / integer / string |
| `androidUrl` / `androidTracking` / `iosUrl` / `iosTracking` (optional) | App URLs and 3rd-party tracking URLs. | string |
| `customLabel0`–`customLabel4` (optional) | Strings + numbers + special characters. Up to 100 unique values per field. | string |

## ProductItem_RealEstate

| Name | Description | Schema |
|---|---|---|
| `itemId` (required) | Unique identifier (SKU) per product. Duplicates ignore all products. Max 100 chars; no dots. | string |
| `title` (required) | Title shown in the ad. Catalog max 150; ad max 20. | string |
| `description` (required) | Description shown in the ad. Catalog max 5000; ad max 40. | string |
| `analyzeTitle` / `analyzeDescription` (optional) | For analysis. Max 100 / 5000 chars. | string |
| `imageLink` (required) | Link to product image. Min aspect 100×100 (*600×600+ rec); max aspect 2000×2000. Max aspect ratio: height ≤ 2× width, width ≤ 7× height. Formats jpeg/jpg/png; max 10MB. | string |
| `link` (required) | Site link. | string |
| `availability` (required) | `in_stock`, `out_of_stock` (ad not sent), `preorder`. | string |
| `price` (required) | Sale price or rent. 0 allowed. For new construction etc., enter one representative price. | integer |
| `currency` (required) | ISO 4217 alphabetic. Sample: `JPY`, `USD`, `THB`, `TWD`, `KRW`, `IDR`. | string |
| `itemType` (required) | Product type — arbitrary string. Max length 50000. Sample: `apartment`, `condo`, `house`, `land`, `manufactured`, `other`, `townhouse`, `office`. | string |
| `country` (optional) | ISO 3166-1 alpha-2. | string |
| `prefecture` / `city` / `route` (optional) | Arbitrary string format. | string |
| `zipcode` (optional) | ZIP code. | string |
| `numRoom` (optional) | The number of rooms. | number |
| `numBaths` (optional) | The number of bathrooms. | number |
| `androidUrl` / `androidTracking` / `iosUrl` / `iosTracking` (optional) | App URLs and 3rd-party tracking URLs. | string |
| `customLabel0`–`customLabel4` (optional) | Strings + numbers + special characters. Up to 100 unique values per field. | string |

## ProductItem_Recruitment

| Name | Description | Schema |
|---|---|---|
| `jobId` (required) | Unique identifier (primary key) for a job posting. Duplicates after the first are ignored. Max 100 chars; no dots. | string |
| `title` (required) | Title shown in the ad. Catalog max 150; ad max 20. | string |
| `description` (required) | Description shown in the ad. Catalog max 5000; ad max 40. | string |
| `analyzeTitle` / `analyzeDescription` (optional) | For analysis. Max 100 / 5000 chars. | string |
| `imageLink` (required) | Image link. Min resolution 1:1 = 100×100 (*600×600+ rec), 16:9 = 100×100 (*1200×628 rec). Max 10MB. Max aspect ratio: height ≤ 2× width, width ≤ 7× height. | string |
| `link` (required) | Site link. | string |
| `salary` (optional) | Salary. 0 allowed. | number |
| `currency` (optional) | ISO 4217 alphabetic. Sample: `JPY`, `USD`, `THB`, `TWD`, `KRW`, `IDR`. | string |
| `company` (optional) | Company name posting the job opening. Max 100 chars. | string |
| `jobType` (required) | The category / category list `jobId` belongs to. Hierarchy levels separated by `>`. Multiple categories separated by `,`. Must start with character or number; ASCII only. Max 5000 chars. Sample: single `IT>Technical;`; multiple `IT>Technical;,IT>Designer>Planner`. | string |
| `careerMin` (optional) | Minimum years of experience desired. | number |
| `careerMax` (optional) | Maximum years of experience desired. | number |
| `country` (optional) | Workplace country, ISO 3166-1 alpha-2. | string |
| `prefecture` / `city` / `route` (optional) | Arbitrary string format. | string |
| `zipcode` (optional) | ZIP code. | string |
| `androidUrl` / `androidTracking` / `iosUrl` / `iosTracking` (optional) | App URLs and 3rd-party tracking URLs. | string |
| `customLabel0`–`customLabel4` (optional) | Strings + numbers + special characters. Up to 100 unique values per field. | string |

## ProductItems

The request body of the create-and-update endpoint.

| Name | Description | Schema |
|---|---|---|
| `list` (optional) | **Request size: max 200.** | `ProductItem` |

## UpsertProductResponse

The response of the create-and-update endpoint.

| Name | Schema |
|---|---|
| `created` (optional) | `< Product > array` |
| `updated` (optional) | `< Product > array` |
| `error` (optional) | `< Product > array` |
