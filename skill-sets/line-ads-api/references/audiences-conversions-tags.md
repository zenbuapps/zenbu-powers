# Custom Audiences, Custom Conversions, LINE Tags & Tag Events

Source:
- `https://ads.line.me/public-docs/data-general-partner` (full CRUD)
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner` (CustomAudiences / CustomConversions `read` only)

**Role matters here.** The **Ad Tech** doc only exposes `read` for
`CustomAudiences` and `CustomConversions`. All write operations
(create / update / delete / upload / overlap), plus `LineTags` and
`TagEvents`, are **Data Provider** capabilities. Base URL
`https://ads.line.me/api`; all paths prefixed with `/v3`.

## Table of contents

- 6.x CustomAudiences — read / create / update / delete / get-upload-job / upload / overlapping-audiences
- 6.x CustomConversions — read / create / update
- 6.x LineTags — read
- 6.x TagEvents — read
- Definitions: CustomAudience(s) + function-type sub-objects, CustomAudienceUpdateRequest, CustomAudienceUploadJob(s), CustomAudienceFileUpload, OverlappingAudiences*, CustomConversion(s), CustomConversionUpdateRequest, LineTag(s), TagEvent(s), TagEventValue, UrlConditionGroup

---

# CustomAudiences

## read  (all roles)

```
GET /v3/adaccounts/{adaccountId}/custom-audiences
```

Read custom audiences.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `name` (optional) | Name for search. | string | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sortKey` (optional) | Page sort key. One of `id`, `name`, `functionType`, `estimatedAudienceSize`, `created`. | string | `"created"` |
| Query | `sortOrder` (optional) | Page sort order. | enum (`asc`, `desc`) | `"desc"` |

Response `200`: `CustomAudiences`.

## create  (Data Provider)

```
POST /v3/adaccounts/{adaccountId}/custom-audiences
```

Create a custom audience.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `CustomAudience` |

Consumes/Produces `application/json`. **Response `202`** (accepted — async): `CustomAudience`.

For `create`, set `functionType` to one of: `LOOKALIKE`, `APP_EVENT`,
`WEBTRAFFIC`, `ACCOUNT_FRIENDS`, `VIDEO_VIEW`, `IMAGE_CLICK`, and fill the
matching sub-object (`lookalike`, `appEvent`, `webtraffic`, `accountFriends`,
`videoView`, `imageClick`). `UPLOAD`-type audiences are created via the `upload`
endpoint instead.

## update  (Data Provider)

```
POST /v3/adaccounts/{adaccountId}/custom-audiences/{id}
```

Path `id` (number) + body `CustomAudienceUpdateRequest` (renames the audience).
Consumes/Produces `application/json`. Response `200`: `CustomAudience`.

## delete  (Data Provider)

```
DELETE /v3/adaccounts/{adaccountId}/custom-audiences/{ids}
```

Delete custom audiences.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` |

**Response `202`** (accepted): No Content.

## get upload job  (Data Provider)

```
GET /v3/adaccounts/{adaccountId}/custom-audiences/{ids}/upload-job
```

Get the result of an accepted upload job (poll this after an async `upload`).

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Path | `id` (required) | Entity id. | number |

Response `200`: `CustomAudienceUploadJobs`.

## upload  (Data Provider)

```
POST /v3/adaccounts/{adaccountId}/custom-audiences/upload
```

Upload Advertising IDs for a custom audience.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `CustomAudienceFileUpload` |

**Consumes `multipart/form-data`**. Produces `application/json`. **Response
`202`** (accepted): `CustomAudience`. Note: for the `REPLACE` action, the number
of simultaneous API requests under the same `adaccountId` is limited to **three (3)**
— exceeding it returns `429`.

## get overlapping audiences  (Data Provider)

```
POST /v3/adaccounts/{adaccountId}/custom-audiences/overlapping-audiences
```

Estimate overlapping rates of audience groups.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `OverlappingAudiencesRequest` |

Consumes/Produces `application/json`. Response `200`: `OverlappingAudiences`.

---

# CustomConversions

## read  (all roles)

```
GET /v3/adaccounts/{adaccountId}/custom-conversions
```

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `name` (optional) | Name for search. | string | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sortKey` (optional) | Page sort key. One of `customConversionId`, `name`, `customConversionStatus`, `lastContact`, `created`. | string | `"created"` |
| Query | `sortOrder` (optional) | Page sort order. | enum (`asc`, `desc`) | `"desc"` |

Response `200`: `CustomConversions`.

## create  (Data Provider)

```
POST /v3/adaccounts/{adaccountId}/custom-conversions
```

Path `adaccountId` + body `CustomConversion`. Consumes/Produces
`application/json`. Response `200`: `CustomConversion`.

## update  (Data Provider)

```
POST /v3/adaccounts/{adaccountId}/custom-conversions/{id}
```

Path `id` (number) + body `CustomConversionUpdateRequest`. Consumes/Produces
`application/json`. Response `200`: `CustomConversion`.

---

# LineTags  (Data Provider)

## read

```
GET /v3/adaccounts/{adaccountId}/line-tags
```

Read LINE Tags. Path `adaccountId` only. Produces `application/json`. Response
`200`: `LineTags`.

---

# TagEvents  (Data Provider)

## read

```
GET /v3/adaccounts/{adaccountId}/tag-events
```

Read tag events.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Query | `tagId` (optional) | The tag id. If not specified, the adaccount's own tag id is used. | string |

Produces `application/json`. Response `200`: `TagEvents`.

---

# Definitions

## CustomAudiences

| Name | Description | Schema |
|---|---|---|
| `page` (read-only) | Page number. Example: `1` | integer |
| `size` (read-only) | Page size. Example: `100` | integer |
| `totalElements` (read-only) | Total number of elements. Example: `200` | integer |
| `hasNextPage` (read-only) | Whether there is a next page. Example: `true` | boolean |
| `audienceGroups` (read-only) | | `< CustomAudience > array` |

## CustomAudience

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of this custom audience. | string |
| `name` (optional) | The name of this custom audience. | string |
| `functionType` (optional) | The function type of the custom audience. For `create`, use one of `LOOKALIKE`, `APP_EVENT`, `WEBTRAFFIC`, `ACCOUNT_FRIENDS`, `VIDEO_VIEW`, `IMAGE_CLICK`. | enum (`UPLOAD`, `LOOKALIKE`, `APP_EVENT`, `WEBTRAFFIC`, `ACCOUNT_FRIENDS`, `IMP`, `CLICK`, `CHAT_TAG`, `FRIEND_PATH`, `VIDEO_VIEW`, `IMAGE_CLICK`, `THV_EVENT`, `HASHED_PHONE_NUMBER_UPLOAD`, `HASHED_EMAIL_UPLOAD`, `TRACKINGTAG_WEBTRAFFIC`) |
| `status` (read-only) | Status of custom audience creation. | enum (`IN_PROGRESS`, `READY`, `FAILED`, `EXPIRED`) |
| `failedType` (optional) | Failure reason when `status=FAILED`. Present only then. | string |
| `estimatedAudienceSize` (optional) | Estimated size as a string. Can be a number, `"-"` if the size isn't enough, or `"100 or fewer"` if the size is ≤ 100. | string |
| `webtraffic` (optional) | Used when `functionType=WEBTRAFFIC`. | `WebTraffic` |
| `lookalike` (optional) | Used when `functionType=LOOKALIKE`. | `Lookalike` |
| `appEvent` (optional) | Used when `functionType=APP_EVENT`. | `AppEvent` |
| `accountFriends` (optional) | Used when `functionType=ACCOUNT_FRIENDS`. | `AccountFriends` |
| `videoView` (optional) | Used when `functionType=VIDEO_VIEW`. | `VideoView` |
| `imageClick` (optional) | Used when `functionType=IMAGE_CLICK`. | `ImageClick` |
| `created` (read-only) | Created date, ISO 8601, in adaccount timezone. | string (date) |

## WebTraffic

Used when `functionType=WEBTRAFFIC`.

| Name | Description | Schema |
|---|---|---|
| `tagId` (optional) | Tag id used for creating the webtraffic audience. A shared tag id is only available when `visitType=VISIT_ALL` or `URL_MATCHING`. Default is the adaccount's tag id. | string |
| `tagOwnerName` (read-only) | The owner name of the tag used in this custom audience. | string |
| `visitType` (required) | Target type for accumulating visit history. | enum (`VISIT_ALL`, `URL_MATCHING`, `EVENT_MATCHING`) |
| `retentionDays` (required) | Valid period of visit history to the website. Min 1, max 180. | number |
| `matchingType` (optional) | The matching type of URL. Used when `visitType=URL_MATCHING` or `EVENT_MATCHING`. | enum (`NONE`, `NORMAL`) |
| `conditionGroup` (optional) | Webtraffic URL conditions. Used when `matchingType=NORMAL`. | `< UrlConditionGroup > array` |
| `tagEventType` (optional) | Target event of visit history. Used when `visitType=EVENT_MATCHING`. | enum (`CONVERSION_EVENT`, `CUSTOM_EVENT`) |
| `customEventName` (optional) | The name of the custom event. | string |

## UrlConditionGroup

The URL rule for accumulating visit history (shared by WebTraffic and CustomConversion).

| Name | Description | Schema |
|---|---|---|
| `conditionType` (required) | The match type of the URL rule. | enum (`EQUAL_TO`, `CONTAIN`, `NOT_CONTAIN`) |
| `keywords` (required) | Target keywords for accumulating visit history. | `< string > array` |

## Lookalike

Used when `functionType=LOOKALIKE`.

| Name | Description | Schema |
|---|---|---|
| `source` (required) | The source audience group of the lookalike audience. | `LookalikeSource` |
| `volumeRate` (required) | Lookalike volume rate. | `VolumeRate` |

## LookalikeSource

| Name | Description | Schema |
|---|---|---|
| `audienceGroupId` (required) | Id of the source audience for selecting similar users. | number |
| `available` (read-only) | Whether the source audience group is available. | boolean |
| `unavailableReason` (read-only) | Why the source audience group is not available for the caller. Included only when `available == false`. | enum (`DELETED`, `NOT_SHARED`, `NOT_FOUND`) |

## VolumeRate

| Name | Description | Schema |
|---|---|---|
| `auto` (optional) | `true` if the lookalike volume rate is auto. | boolean |
| `rate` (optional) | Ratio of audience size to LINE users. Between `0` (0%) and `0.15` (15%). | number (double) |

## AppEvent

Used when `functionType=APP_EVENT`.

| Name | Description | Schema |
|---|---|---|
| `mobileAppId` (optional) | The id of the target media app. | number |
| `actionType` (required) | Target event type for accumulation. | enum (`INSTALL`, `OPEN`, `ADD_TO_CART`, `PURCHASE`, `VIEW_HOME`, `VIEW_CATEGORY`, `VIEW_ITEM`, `SEARCH`, `LEVEL_ACHIEVED`, `TUTORIAL_COMPLETE`, `CUSTOM`) |
| `retentionDays` (required) | Valid period of the occurred app event. Min 1, max 180. | number |
| `matchMethod` (required) | The match method of the app event. | enum (`NONE`, `NORMAL`) |
| `conditionGroup` (optional) | Conditions to accumulate app-event audience. Used when `matchMethod=NORMAL`. | `< AppEventConditionGroup > array` |

## AppEventConditionGroup

| Name | Description | Schema |
|---|---|---|
| `parameterKey` (required) | The column of an app-event detail. | enum (`CATEGORY_IDS`, `ITEM_IDS`, `ITEM_PRICE`, `ITEM_QUANTITY`, `SEARCH_KEYWORDS`, `LEVEL_IDS`, `DATA`, `EVENT_NAMES`) |
| `conditionType` (required) | The match type of this rule. | enum (`EQUAL_TO`, `NOT_EQUAL_TO`, `CONTAIN`, `NOT_CONTAIN`, `PREFIX`, `SUFFIX`, `GREATER_THAN`, `LESS_THAN`, `GREATER_THAN_OR_EQ`, `LESS_THAN_OR_EQ`) |
| `values` (required) | The value of an app-event detail. | `< string > array` |

## AccountFriends

Used when `functionType=ACCOUNT_FRIENDS`.

| Name | Description | Schema |
|---|---|---|
| `friendStatus` (required) | Target friend type of the account-friends audience. | enum (`ACTIVE`, `BLOCKED`) |

## VideoView

Used when `functionType=VIDEO_VIEW`.

| Name | Description | Schema |
|---|---|---|
| `eventType` (required) | Target event type for the video-view audience. | enum (`CLICK`, `PLAY_START`, `VIDEO_PLAY_3S`, `VIDEO_PLAY_25P`, `VIDEO_PLAY_50P`, `VIDEO_PLAY_75P`, `VIDEO_PLAY_95P`, `VIDEO_PLAY_COMPLETED`) |
| `mediaVideoId` (required) | The id of the target media video. | number |
| `recency` (required) | Valid period of video view occurred. Performance Ads: max 30. Reservation Ads: max 180. Min 1, max 180. | number |

## ImageClick

Used when `functionType=IMAGE_CLICK`.

| Name | Description | Schema |
|---|---|---|
| `eventType` (required) | Target event type for the image-click audience. | enum (`CLICK`) |
| `campaignId` (required) | The id of the target campaign for the image-click audience. | number |
| `recency` (required) | Valid period of image click occurred. Min 1, max 180. | number |

## CustomAudienceUpdateRequest

| Name | Description | Schema |
|---|---|---|
| `name` (optional) | The name of this custom audience. | string |

## CustomAudienceUploadJobs

| Name | Description | Schema |
|---|---|---|
| `jobs` (read-only) | Audience upload jobs. | `< CustomAudienceUploadJob > array` |

## CustomAudienceUploadJob

| Name | Description | Schema |
|---|---|---|
| `audienceGroupId` (read-only) | Id of the custom audience. | number |
| `audienceGroupJobId` (read-only) | Id of the job for custom audience creation. | number |
| `name` (optional) | The name of the upload file. | string |
| `type` (optional) | The action type of upload data. | enum (`DIFF_ADD`, `DIFF_AUTO_ADD`, `DIFF_REPLACE`, `DIFF_REMOVE`) |
| `jobStatus` (optional) | The status of the upload. | enum (`QUEUED`, `WORKING`, `FINISHED`, `FAILED`) |
| `failedType` (read-only) | Error reason if the job failed. | string |
| `audienceCount` (optional) | The number of audiences processed correctly. | number |
| `created` (optional) | Date of uploading the file, ISO 8601, in adaccount timezone. | string (date) |

## CustomAudienceFileUpload

The `multipart/form-data` body of the upload endpoint.

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of the custom audience. **Required when only uploading difference data.** | number |
| `name` (optional) | The name of the custom audience. **Required the first time uploading data.** | string |
| `action` (required) | The action type of upload data. | enum (`ADD`, `REPLACE`) |
| `idType` (optional) | The type of data id. Hash values with SHA-256 for privacy if you select a `HASHED_*` type. `IFA` → audience type `UPLOAD`; `HASHED_PHONE_NUMBER` → `HASHED_PHONE_NUMBER_UPLOAD`; `HASHED_EMAIL` → `HASHED_EMAIL_UPLOAD`. Validation: phone number — no `+`, space, or half-byte numbers; email — max 120 characters. | enum (`IFA`, `HASHED_PHONE_NUMBER`, `HASHED_EMAIL`) |
| `file` (required) | The file including Advertising IDs. | file |

## OverlappingAudiencesRequest

| Name | Description | Schema |
|---|---|---|
| `baseId` (required) | An audience group id to be compared. | number |
| `comparedIds` (required) | Audience group ids to be compared with the `base` group. Up to 4. Size: 1–4. | `< number > array` |

## OverlappingAudiences

| Name | Description | Schema |
|---|---|---|
| `estimations` (optional) | Estimation result. Each key is one of `comparedIds`. | `< string, OverlappingAudienceEstimation > map` |

## OverlappingAudienceEstimation

| Name | Description | Schema |
|---|---|---|
| `rate` (optional) | Estimated overlap rate between `base` and the group with the specified audience group id. | number |

## CustomConversions

| Name | Description | Schema |
|---|---|---|
| `page` / `size` / `totalElements` (read-only) | Paging metadata. | integer |
| `hasNextPage` (read-only) | Whether there is a next page. | boolean |
| `customConversions` (read-only) | | `< CustomConversion > array` |

## CustomConversion

| Name | Description | Schema |
|---|---|---|
| `customConversionId` (optional) | Id of this custom conversion. | number |
| `name` (optional) | The name of this custom conversion. | string |
| `description` (optional) | The description of this custom conversion. | string |
| `adaccountId` (read-only) | Adaccount id of this custom conversion. | string |
| `tagId` (optional) | The tag ID used for this custom conversion. If null, the adaccount's own tag is used. | number |
| `tagOwnerName` (read-only) | The name of the tag owner. | string |
| `attributionPeriod` (optional) | The term of tracking the conversion. | number |
| `customConversionStatus` (optional) | The status of the custom conversion. Ignored when creating. | enum (`RUNNING`, `PAUSED`) |
| `customConversionMatchMethod` (optional) | The method of applying conditions for accumulating conversions. | enum (`URL`, `EVENT`) |
| `urlConditionGroups` (optional) | URL conditions. Used when `customConversionMatchMethod=URL`. | `< UrlConditionGroup > array` |
| `customConversionEventType` (optional) | Target conversion event for accumulation. Used when `customConversionMatchMethod=EVENT`. | enum (`CONVERSION_EVENT`, `CUSTOM_CONVERSION_EVENT`) |
| `customConversionEventName` (optional) | The name of the custom event. Used when `customConversionMatchMethod=EVENT`. | string |
| `lastContact` (read-only) | Last date the conversion event occurred, ISO 8601, in adaccount timezone. | string (date) |
| `created` (read-only) | Created date, ISO 8601, in adaccount timezone. | string (date) |

## CustomConversionUpdateRequest

| Name | Description | Schema |
|---|---|---|
| `name` (optional) | The name of this custom conversion. | string |
| `description` (optional) | The description of this custom conversion. | string |
| `customConversionStatus` (optional) | The status of the custom conversion. | enum (`RUNNING`, `PAUSED`) |

## LineTags

| Name | Schema |
|---|---|
| `data` (read-only) | `< LineTag > array` |

## LineTag

| Name | Description | Schema |
|---|---|---|
| `tagId` (read-only) | Id of the LINE tag. | string |
| `ownerName` (read-only) | Name of the LINE tag owner. | string |
| `ownerCustomerId` (read-only) | Id of the LINE tag owner. Empty if `ownerCustomerType` is not `LAP`. | string |
| `ownerCustomerType` (read-only) | Type of the LINE tag owner. | string |
| `myTag` (read-only) | Whether the tag belongs to the request owner. | boolean |

## TagEvents

| Name | Description | Schema |
|---|---|---|
| `pageView` (optional) | Page view event. | `TagEvent` |
| `conversion` (optional) | Conversion event. | `TagEvent` |
| `customEvents` (read-only) | User-defined custom events. | `< TagEvent > array` |
| `eventValues` (read-only) | User-defined custom event values. | `< TagEventValue > array` |

## TagEvent

| Name | Description | Schema |
|---|---|---|
| `name` (read-only) | The name of the event. For `pageView` it is fixed to `"Base code"`; for `conversion` it is fixed to `"Conversion"`; for `customEvents` it is the user-defined custom event name. | string |
| `status` (read-only) | The status of this tag event. | enum (`ACTIVE`, `INACTIVE`) |
| `errorReason` (read-only) | Error reason for this tag event. | string |
| `lastContactAt` (read-only) | Last contact date, ISO 8601, in adaccount timezone. | string (date) |

## TagEventValue

| Name | Description | Schema |
|---|---|---|
| `name` (read-only) | The name of the event value. | string |
| `errorReason` (read-only) | Error reason for this event value. | string |
