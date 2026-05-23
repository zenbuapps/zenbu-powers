# LinkRequests, Groups & Adaccounts

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- `https://ads.line.me/public-docs/data-general-partner`
- `https://ads.line.me/public-docs/reporting-general-partner`

These three resources are available to **all partner roles** (Ad Tech, Data
Provider, Reporting). Base URL `https://ads.line.me/api`; all paths below are
prefixed with `/v3`.

## Concepts

- A **Group** is an organizational container. Your API-enabled Group can hold
  child Groups (`depth` counts ancestors) and is linked to **ad accounts**.
- A **LinkRequest** is how a Group requests authority over an ad account it does
  not yet manage; the ad account side approves/rejects it.
- An **Adaccount** is the entity that owns campaigns, ad groups, ads, media,
  audiences, etc. `id` is a number; everywhere it is used as a path parameter
  (`adaccountId`) it is treated as a string.

## Table of contents

- 6.1 LinkRequests — read / create / update
- 6.2 Groups — read / create child / update
- 6.3 Adaccounts — read
- Definitions: LinkRequests, LinkRequest, Groups, Group, Adaccounts, Adaccount, LineAccount, Paging

---

# 6.1 LinkRequests

Request authority for an ad account so its resources become accessible.

## read

```
GET /v3/groups/{groupId}/link-request
```

Read link requests. **Does not return link requests in `CANCELED` or `UNLINKED`
status.**

Parameters:

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `groupId` (required) | Group id. | string | |
| Query | `includeRemoved` (optional) | Include removed entities if `true`. | boolean | `"false"` |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`; default ascending. Property is one of `id`, `targetAdaccountId`, `status`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `LinkRequests`. Errors: `400`/`401`/`403`/`500` → `< Errors > array`; `429` no content.

## create

```
POST /v3/groups/{groupId}/link-request/adaccount
```

Create an ad account link request.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `groupId` (required) | Group id. | string |
| Body | `body` (required) | | `LinkRequest` |

Consumes/Produces `application/json`. Response `200`: `LinkRequest`.

## update

```
POST /v3/groups/{groupId}/link-request/{id}/{actionType}
```

Update a link request — cancel a pending one or unlink an approved one.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `actionType` (required) | `cancel` — cancel a link request waiting for approval. `unlink` — unlink an approved link request. | enum (`cancel`, `unlink`) |
| Path | `groupId` (required) | Group id. | string |
| Path | `id` (required) | Entity id. | number |

Produces `application/json`. Response `200`: `LinkRequest`.

---

# 6.2 Groups

Manage Groups under the API-enabled Group.

## read

```
GET /v3/groups/{groupId}/children
```

Read child groups.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `groupId` (required) | Group id. | string | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`; default ascending. Property is one of `id`, `name`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Groups`.

## create

```
POST /v3/groups/{groupId}/children
```

Create a child group.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `groupId` (required) | Group id. | string |
| Body | `body` (required) | | `Group` |

Consumes/Produces `application/json`. Response `200`: `Group`.

## update

```
POST /v3/groups/{groupId}
```

Update a group.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `groupId` (required) | Group id. | string |
| Body | `body` (required) | | `Group` |

Consumes/Produces `application/json`. Response `200`: `Groups`.

---

# 6.3 Adaccounts

Get ad accounts authorized by the API-enabled Group.

## read

```
GET /v3/groups/{groupId}/adaccounts
```

Read ad accounts.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `groupId` (required) | Group id. | string | |
| Query | `includeLinked` (optional) | Include entities linked to propagated groups if `true`. | boolean | `"true"` |
| Query | `includeRemoved` (optional) | Include removed entities if `true`. | boolean | `"false"` |
| Query | `name` (optional) | Name for search. | string | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`; default ascending. Property is one of `id`, `name`, `configuredStatus`, `currency`, `timezone`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Adaccounts`.

---

# Definitions

## Paging

Returned inside every list response.

| Name | Description | Schema |
|---|---|---|
| `page` (read-only) | Page number. Example: `1` | integer |
| `size` (read-only) | Page size. Example: `100` | integer |
| `totalElements` (read-only) | Total number of elements. Example: `200` | integer |
| `sorts` (read-only) | Sort properties and orders. Example: `[ "createdDate,DESC" ]` | `< string > array` |

## Adaccounts

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Adaccount > array` |

## Adaccount

> If a field is `required` **and** `read-only`, it is used and required in
> `READ` / `DOWNLOAD` operations but cannot be used (and is not required) in
> `CREATE` / `UPDATE` / `DELETE`. This rule applies to every entity below.

| Name | Description | Schema |
|---|---|---|
| `id` (required, read-only) | Id of this account. | number |
| `name` (required, read-only) | The name of this adaccount. | string |
| `configuredStatus` (read-only) | The status of this adaccount. | enum (`ACTIVE`, `PAUSED`, `REMOVED`) |
| `productType` (required) | Product type. `PERFORMANCE` = adaccount for performance ads; `BRAND` = adaccount for reservation ads. | enum (`PERFORMANCE`, `BRAND`) |
| `availableCampaignObjective` (required, read-only) | Available campaign objectives for this adaccount. | `< enum (VISIT_MY_WEBSITE, APP_INSTALL, APP_ENGAGEMENT, WEBSITE_CONVERSION, DYNAMIC_PRODUCT, GAIN_FRIENDS, VIDEO_VIEW) > array` |
| `currency` (required, read-only) | The currency of this adaccount. | string |
| `timezone` (required, read-only) | The timezone of this adaccount. | string |
| `country` (required, read-only) | The country of this adaccount. | string |
| `lineAccount` (optional) | | `LineAccount` |
| `deliveryStatus` (read-only) | The delivery status of ads. | enum (`ACTIVE`, `PAUSED`, `REMOVED`, `NOT_DELIVERING`, `NOT_APPROVED`) |
| `deliveryStatusReasons` (read-only) | The reason of the delivery status. | `< DeliveryStatusReason > array` |
| `createdDate` (read-only) | Created date, ISO 8601, in adaccount timezone. Example: `"2021-12-22T14:28:56+09:00"` | string (date) |
| `modifiedDate` (read-only) | Last modified date, ISO 8601, in adaccount timezone. | string (date) |
| `removedDate` (read-only) | Removed date, ISO 8601, in adaccount timezone. | string (date) |

## LineAccount

| Name | Description | Schema |
|---|---|---|
| `name` (read-only) | The name of the LINE account. | string |
| `lineId` (optional) | The ID of the LINE account. | string |

## Groups

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Group > array` |

## Group

| Name | Description | Schema |
|---|---|---|
| `id` (required, read-only) | The id of this group. | string |
| `name` (optional) | The name of this group. | string |
| `parentGroupId` (required, read-only) | The id of the parent group. | string |
| `parentGroupName` (read-only) | The name of the parent group. | string |
| `depth` (required, read-only) | The number of ancestor groups. | number |
| `createdDate` (read-only) | Created date, ISO 8601, in adaccount timezone. | string (date) |
| `modifiedDate` (read-only) | Last modified date, ISO 8601, in adaccount timezone. | string (date) |
| `removedDate` (read-only) | Removed date, ISO 8601, in adaccount timezone. | string (date) |

## LinkRequests

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< LinkRequest > array` |

## LinkRequest

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of this link request. | number |
| `sourceGroupId` (optional) | Id of the source group requesting the link. | string |
| `sourceGroupName` (read-only) | Name of the source group requesting the link. | string |
| `targetAdaccountId` (optional) | Id of the adaccount requested for link. | string |
| `targetAdaccountName` (read-only) | Name of the adaccount requested for link. | string |
| `status` (read-only) | Approval status by the entity requested for link. | enum (`WAITING_APPROVAL`, `REJECTED`, `LINKED`, `CANCELED`, `UNLINKED`) |
| `targetType` (optional) | Target entity type. | enum (`ADACCOUNT`) |
| `createdDate` (read-only) | Created date, ISO 8601, in UTC. Date the link was requested. Example: `"2021-12-03T07:49:13Z"` | string (date) |
| `modifiedDate` (read-only) | Last modified date, ISO 8601, in UTC. Date of approval if status is `LINKED`. | string (date) |
| `removedDate` (read-only) | Removed date, ISO 8601, in UTC. | string (date) |
