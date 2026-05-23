# Media & Creatives

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner`
- `https://ads.line.me/public-docs/reporting-general-partner` (read endpoints only)

Media management (create/update/delete/upload, rejected-URL re-review) is an
**Ad Tech** capability; **Reporting** partners get `read` only. Base URL
`https://ads.line.me/api`; all paths prefixed with `/v3`.

A **Media** is a reusable asset — an uploaded image/video/animation, an app, or
a landing-page URL. An **Ad** does not reference media directly: it embeds a
**Creative**, and the creative carries `imageHash` / `videoHash` /
`animationHash` (the `obsHash` of an uploaded media). Upload a file first, take
the `object.obsHash` from the returned `Media`, then put that hash into the
creative.

## Table of contents

- 6.9 Media — read / create-app / update / delete / upload / read-rejected-url / request-rereview
- Definitions: Media(s), MediaUpload, ObsObject, Review, MediaUrlReReviewRequest(s)
- Creative structure: Creative, CallToAction, CreativeSlot
- Creative formats reference

---

# 6.9 Media

## read

```
GET /v3/adaccounts/{adaccountId}/media
```

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `ids` (optional) | Entity ids. | `< number > array(multi)` | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is one of `id`, `name`, `mimeType`, `createdDate`. | string | `"createdDate,desc"` |

Response `200`: `Medias`.

## create

```
POST /v3/adaccounts/{adaccountId}/media
```

Create an `app` media. **To upload an image or video, use the Media upload API
below, not this endpoint** — this `create` is only for registering an app.

Body: `Media`. Consumes/Produces `application/json`. Response `200`: `Media`.

## update

```
POST /v3/adaccounts/{adaccountId}/media/{id}
```

Path `id` (number) + body `Media`. Consumes/Produces `application/json`. Response `200`: `Media`.

## delete

```
DELETE /v3/adaccounts/{adaccountId}/media/{id}
```

Path `id` (number). Response `200`: No Content.

## upload

```
POST /v3/adaccounts/{adaccountId}/media/upload
```

Upload a media file (image, video).

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `MediaUpload` |

**Consumes `multipart/form-data`** (so for signing, the digest is of the empty
string and Content-Type in the JWS payload is empty). Produces `application/json`.
Response `200`: `Media`.

## read rejected url

```
GET /v3/adaccounts/{adaccountId}/media/urls/rereview
```

Read the list of rejected media URLs eligible for re-review.

| Type | Name | Description | Schema | Default |
|---|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string | |
| Query | `page` (optional) | Page number. | integer | 1 |
| Query | `size` (optional) | Page size. | integer | 100 |
| Query | `sort` (optional) | `property(,asc\|desc)`. Property is one of `id`, `url`, `reviewStatus`, `lastLpRejectedDate`. | string | `"lastLpRejectedDate,desc"` |
| Query | `urlOrMediaUrlId` (optional) | URL or media URL id to search for. | string | |

Response `200`: `Medias`.

## request review of rejected url

```
POST /v3/adaccounts/{adaccountId}/media/urls/rereview
```

Request review of rejected media URLs. A rejected URL can only be re-reviewed
**10 times in JP**; check the `reReviewable` flag in the media's `review`.

| Type | Name | Description | Schema |
|---|---|---|---|
| Path | `adaccountId` (required) | Adaccount id. | string |
| Body | `body` (required) | | `MediaUrlReReviewRequests` |

Consumes/Produces `application/json`. Response `200`: `< Media > array`.

---

# Definitions

## Medias

| Name | Schema |
|---|---|
| `paging` (read-only) | `Paging` |
| `datas` (read-only) | `< Media > array` |

## Media

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of this media. | number |
| `name` (optional) | The name of this media. | string |
| `mediaType` (optional) | The type of media. | enum (`IMAGE`, `VIDEO`, `APP`, `URL`, `ANIMATION`) |
| `mimeType` (read-only) | The content type of this media. | string |
| `width` (read-only) | Horizontal length of this media. | number |
| `height` (read-only) | Vertical length of this media. | number |
| `fileSize` (read-only) | File size of this media. | number |
| `duration` (read-only) | Duration of video. | number |
| `loops` (read-only) | Loops of this animated media. | number |
| `frames` (read-only) | Frames of this animated media. | number |
| `object` (optional) | Obs object information. | `ObsObject` |
| `osCode` (optional) | Name of the mobile operating system. | enum (`IOS`, `ANDROID`) |
| `appstoreUrl` (optional) | URL of the app's page on the store. | string |
| `appBundle` (optional) | Identifier of the App — `App ID` for iOS or `Package Name` for Android. | string |
| `affectedAdCount` (read-only) | Number of ads affected. | number |
| `url` (optional) | URL of this media. | string |
| `lastLpRejectedDate` (read-only) | Last rejected date of this media URL, ISO 8601, in UTC. Example: `"2021-11-19T06:41:04Z"` | string (date) |
| `comment` (read-only) | Comments for reviewer. Only for media URL. | string |
| `relatedAdsCount` (read-only) | Number of ads using this media URL when the URL has been rejected. Only for the readRejectedUrl API. | number |
| `reviewStatus` (read-only) | Review status of this entity. | enum (`SKIPPED_REVIEW`, `IN_REVIEW`, `APPROVED`, `REJECTED`) |
| `review` (optional) | Review information. | `Review` |
| `createdDate` / `modifiedDate` / `removedDate` (read-only) | ISO 8601 timestamps in adaccount timezone. | string (date) |

## ObsObject

OBS-related media information. The `obsHash` is what you put into a creative's
`imageHash` / `videoHash` / `animationHash`.

| Name | Description | Schema |
|---|---|---|
| `obsOid` (read-only) | Id of this obs object. | string |
| `obsHash` (read-only) | Hash code of this obs object. | string |
| `fileName` (read-only) | File name of this obs object. | string |
| `sourceUrl` (read-only) | URL of this obs object. | string |

## Review

| Name | Description | Schema |
|---|---|---|
| `reasonCode` (read-only) | The reason code for rejection. | string |
| `comment` (read-only) | The comment of the reviewer. | string |
| `rejectReason` (read-only) | The human-readable reason for rejection. | string |
| `reReviewable` (read-only) | Whether re-review can be applied again after rejection. Only for the readRejectedUrl API. | boolean |

## MediaUpload

The `multipart/form-data` body of the upload endpoint.

| Name | Description | Schema |
|---|---|---|
| `file` (required) | The file content of this media. | file |
| `mediaType` (required) | The type of media. | enum (`IMAGE`, `VIDEO`, `ANIMATION`) |

## MediaUrlReReviewRequests

Review requests for rejected media URLs. Size: 1–10.

Type: `< MediaUrlReReviewRequest > array`.

## MediaUrlReReviewRequest

| Name | Description | Schema |
|---|---|---|
| `mediaUrlId` (optional) | Id of media URL for the re-review request. | number |
| `comment` (optional) | Comments for the reviewer. | string |

---

# Creative structure (used inside an Ad)

A `Creative` is the `creative` field of an `Ad`. It can be modified only while
the ad's `configuredStatus` is `DRAFT`, and modifications must be a complete
creative object.

## Creative

| Name | Description | Schema |
|---|---|---|
| `id` (optional) | Id of this creative. | number |
| `creativeFormat` (required) | Type of creative format. | enum (`IMAGE`, `VIDEO`, `CAROUSEL`, `SMALL_IMAGE`, `SMALL_IMAGE_CPF`, `IMAGE_ANIMATION`, `IMAGE_ANIMATION_CPF`, `SMALL_VIDEO`) |
| `title` (optional) | Title of this creative. **Required** if `creativeFormat` is `IMAGE`, `VIDEO`, `SMALL_IMAGE`, `SMALL_IMAGE_CPF`, `IMAGE_ANIMATION`, `IMAGE_ANIMATION_CPF`, `SMALL_VIDEO`. | string |
| `description` (optional) | Description of this creative. **Required** if `creativeFormat` is `IMAGE`, `SMALL_IMAGE_CPF` or `VIDEO`. | string |
| `longTitle` (read-only) | Long title of this creative. **Required** if `creativeFormat` is `SMALL_IMAGE`, `IMAGE_ANIMATION` or `SMALL_VIDEO`. Required if the image format of `smallImageHash` is 600x400. | string |
| `imageHash` (optional) | Obs hash of image media. **Required** if `creativeFormat` is `IMAGE`, `SMALL_IMAGE`, `SMALL_IMAGE_CPF`. | string |
| `smallImageHash` (optional) | Obs hash of small-image media. Optional if `creativeFormat` is `IMAGE`. | string |
| `videoHash` (optional) | Obs hash of video media. **Required** if `creativeFormat` is `VIDEO` or `SMALL_VIDEO`. | string |
| `animationHash` (optional) | Obs hash of animation media. **Required** if `creativeFormat` is `IMAGE_ANIMATION`, `IMAGE_ANIMATION_CPF`. | string |
| `callToAction` (optional) | Call-to-action and URL object. | `CallToAction` |
| `image` (read-only) | Image media if the creative uses an image. | `Media` |
| `smallImage` (read-only) | Small-image media if the creative uses a small image. | `Media` |
| `video` (read-only) | Video media if the creative uses a video. | `Media` |
| `animation` (read-only) | Animation media if the creative uses an animation. | `Media` |
| `slots` (optional) | Slots of a carousel-type creative. **Required when `creativeFormat` is `CAROUSEL`** — creative properties (title, description, …) must be set per slot. Size: 2–10. | `< CreativeSlot > array` |
| `labels` (optional) | Label string array. Optional if `creativeFormat` is not `CAROUSEL`. | `< string > array` |
| `reviewStatus` (read-only) | Review status of this entity. | enum (`SKIPPED_REVIEW`, `IN_REVIEW`, `APPROVED`, `REJECTED`) |
| `review` (optional) | Review information. | `Review` |

## CallToAction

| Name | Description | Schema |
|---|---|---|
| `type` (optional) | The call-to-action code (label of the action button). See the Call To Actions API. | string |
| `landingPageUrl` (optional) | URL users are sent to after clicking the ad. | string |
| `clickUrl` (optional) | URL for measuring ad performance and tracking attributes. If `viewTrackUrl` is given on the ad, this is mandatory and must match: if `viewTrackUrl` starts with `https://view.adjust.com`, this must start with `https://app.adjust.com`; if `https://app.adjust.io`, this must start with `https://app.adjust.io`; if `https://impression.appsflyer.com`, this must start with `https://app.appsflyer.com`. | string |
| `appStoreUrl` (optional) | URL of the app's page on the store. | string |
| `deepLinkUrl` (optional) | Link to an installed app on the user's mobile device. | string |

## CreativeSlot

A slot of a `CAROUSEL` creative (the `slots` array holds 2–10 of these).

| Name | Description | Schema |
|---|---|---|
| `title` (required) | Title of this creative slot. | string |
| `description` (required) | Description of this creative slot. | string |
| `imageHash` (optional) | Obs hash of image media. | string |
| `videoHash` (optional) | Obs hash of video media. | string |
| `callToAction` (optional) | Call-to-action and URL object. | `CallToAction` |
| `image` (read-only) | Image media if this creative uses an image. | `Media` |
| `smallImage` (read-only) | Small-image media if this creative uses a small image. | `Media` |
| `video` (read-only) | Video media if this creative uses a video. | `Media` |
| `animation` (read-only) | Animation media if this creative uses an animation. | `Media` |

---

# Creative formats reference

| `creativeFormat` | Notes |
|---|---|
| `IMAGE` | Standard image creative. `title` + `description` required, `imageHash` required, `smallImageHash` optional. |
| `VIDEO` | Standard video creative. `title` + `description` required, `videoHash` required. |
| `CAROUSEL` | Carousel — 2–10 `slots`, each a `CreativeSlot`. Carousel ads may only use 1:1 images. `title`/`description` set per slot, not at the creative level. |
| `SMALL_IMAGE` | Small image — `title` + `longTitle` + `imageHash` required. Small-image ads must use image format 600x400 and include a long title. |
| `SMALL_IMAGE_CPF` | Small image for CPF (gain-friends) — `title` + `description` + `imageHash` required. |
| `IMAGE_ANIMATION` | Animated image — `title` + `longTitle` + `animationHash` required. |
| `IMAGE_ANIMATION_CPF` | Animated image for CPF — `title` + `animationHash` required. |
| `SMALL_VIDEO` | Small video — `title` + `longTitle` + `videoHash` required. |
