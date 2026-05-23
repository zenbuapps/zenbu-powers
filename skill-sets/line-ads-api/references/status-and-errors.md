# Delivery Status Reasons, Error Reasons & Development Guidelines

Source:
- `https://ads.line.me/public-docs/certificated-ad-tech-general-partner` (sections 8 & 9)
- `https://developers.line.biz/en/docs/line-ads-api/development-guidelines/`
- `https://developers.line.biz/en/docs/line-ads-api/about/`

This file collects the two reason-code catalogs of the LINE Ads Management API
plus the HTTP status semantics and the development guidelines from the LINE
Developers site.

## Table of contents

- HTTP status codes
- Delivery Status Reasons (`deliveryStatusReasons[].code`)
- Error Reasons (`Error.reason`)
- Development guidelines (mass requests, non-existent IDs, logging)
- About — applying for access

---

# HTTP status codes

Most endpoints return:

| HTTP Code | Meaning |
|---|---|
| 200 | Successful operation. |
| 202 | Accepted — async job queued (CustomAudience create / upload / delete). |
| 400 | Problem with the request. Body: `< Errors > array`. |
| 401 | The token in the `Authorization` header is invalid. Body: `< Errors > array`. |
| 403 | Not authorized to use the API. Confirm the adaccount is authorized. Body: `< Errors > array`. |
| 422 | Some field values are absent or invalid (ARS simulation). Body: `ArsSimulationResult`. |
| 429 | Exceeded the rate limit (or the concurrent Request Quota). No content. |
| 500 | Internal server error. Body: `< Errors > array`. |

ProductSets / Products endpoints use named, body-less errors instead — see
`references/products-and-dpa.md`.

---

# Delivery Status Reasons

When an `Adaccount` / `Campaign` / `Adgroup` / `Ad` has a `deliveryStatus`, the
`deliveryStatusReasons` array carries `DeliveryStatusReason` objects whose `code`
is one of the following.

| code | description |
|---|---|
| `REMOVED` | Removed |
| `CREATIVE_REVIEW_NOT_APPROVED` | Ad not approved |
| `AD_BLOCKED` | Ad blocked |
| `CREATIVE_BLOCKED` | Creative blocked |
| `CREATIVE_REVIEW_IN_REVIEW` | Ad in review |
| `AD_DRAFT` | Ad drafted |
| `VIDEO_ENCODING_FAILED` | Video encoding failed |
| `DPA_SETTING_INVALID` | Dynamic ads cannot be served because an error has occurred. If the error persists for more than one hour, check that the LINE Tag is set correctly and that the tag and feed data match. |
| `ADGROUP_APP_REVIEW_NOT_APPROVED` | App not approved |
| `ADGROUP_BLOCKED` | Ad group blocked |
| `ADGROUP_APP_REVIEW_IN_REVIEW` | App in review |
| `ADGROUP_INVALID_TARGETING` | Ad group with invalid targeting |
| `ADGROUP_BEACON_TARGETING_CATEGORY_NOT_ACTIVE` | Beacon targeting category is not active |
| `ADGROUP_BEACON_TARGETING_NO_CHAIN_ACTIVE` | Beacon targeting does not have any active chain |
| `ADGROUP_BEACON_TARGETING_ALL_TAG_NOT_ACTIVE` | Beacon targeting all-tag is not active |
| `ALL_AUDIENCE_NOT_ACTIVE` | All include audiences are not active |
| `EXCLUDE_AUDIENCE_NOT_ACTIVE` | One of the exclude audiences has an invalid state |
| `ADGROUP_FREQUENCY_SCHEDULED` | Before ad group frequency period |
| `ADGROUP_FREQUENCY_ENDED` | After ad group frequency period |
| `PRODUCTSET_DELETED` | The product set set up for this ad group has been deleted |
| `PRODUCTSET_INACTIVE` | The product set needs more than 2 feed items. Change the conditions for creating the product set |
| `PRODUCTSET_NOTSET` | Product set is not set for the ad group |
| `CAMPAIGN_BLOCKED` | Campaign blocked |
| `CAMPAIGN_SCHEDULED` | Campaign scheduled |
| `CAMPAIGN_ENDED` | Campaign ended |
| `CAMPAIGN_SPENDING_LIMIT_OVER` | Campaign limited by budget |
| `CAMPAIGN_DPA_FEED_NO_PRODUCT` | Product feed has no products |
| `CAMPAIGN_DPA_FEED_INVALID` | Product feed is invalid |
| `CAMPAIGN_CPF_NOT_VERIFIED` | Unverified LINE Official Accounts cannot run gain-friends campaigns |
| `CAMPAIGN_CANNOT_MANAGE_LINE_POP` | Ad account cannot manage a line-pop campaign |
| `CAMPAIGN_SUNSET` | This campaign objective is not supported |
| `BILLING_REVIEW_NOT_APPROVED` | Billing not approved |
| `BILLING_REVIEW_IN_REVIEW` | Billing in review |
| `BILLING_NOT_LINKED` | Billing not linked |
| `BILLING_NO_CREDIT_CARD` | Billing has no credit card |
| `BILLING_REACHED_MONTHLY_LIMIT` | Billing reached monthly limit |
| `BILLING_AUTO_PAYMENT_SUSPENDED` | Billing auto-payment suspended |
| `ADACCOUNT_REVIEW_NOT_APPROVED` | Ad account not approved |
| `ADACCOUNT_BLOCKED` | Ad account blocked |
| `ADACCOUNT_REVIEW_IN_REVIEW` | Ad account in review |
| `LINE_ACCOUNT_LINK_NOT_APPROVED` | LINE account link not approved |
| `LINE_ACCOUNT_NOT_EXIST` | LINE account does not exist |
| `LINE_ACCOUNT_STATUS_DELETED` | LINE account deleted |
| `LINE_ACCOUNT_STATUS_IN_ACTIVE` | LINE account inactive |
| `LINE_ACCOUNT_STATUS_SUSPENDED` | LINE account suspended |
| `AD_PAUSED` | Ad paused |
| `ADGROUP_PAUSED` | Adgroup paused |
| `CAMPAIGN_PAUSED` | Campaign paused |
| `ADACCOUNT_PAUSED` | Ad account paused |
| `ACTIVE_ADGROUP_LEARNING` | Adgroup learning |
| `ACTIVE_ADGROUP_LEARNING_DONE` | Adgroup learning done |
| `ACTIVE_CUSTOM_CONVERSION_UNAVAILABLE` | Custom conversion unavailable |
| `ACTIVE_CUSTOM_CONVERSION_NEW` | Custom conversion new |
| `AD_TEXTAREA_PENALTY` | Ad textarea penalty |
| `ACTIVE_ADGROUP_BEACON_TARGETING_SOME_CHAIN_NOT_ACTIVE` | Beacon targeting some chains are not active |
| `ACTIVE_ADGROUP_BEACON_TARGETING_SOME_TAG_NOT_ACTIVE` | Beacon targeting some chains are not active |
| `ACTIVE` | Active |

---

# Error Reasons

The `reason` field of an `Error` (inside the `Errors` array of a `400` etc.) is
one of the following stable codes.

| reason | description |
|---|---|
| `ACCESSIBLE_ACCOUNT_LIMIT_EXCEEDED` | the number of account links exceeds the limit |
| `ACCOUNT_FRIENDS_AUDIENCE_GROUP_ALREADY_EXISTS` | the same friend audience already exists |
| `ACCOUNT_NOT_ALLOWED` | the account is not allowed to use the feature |
| `ACTIVE_AD_IN_ADGROUP_COUNT_OVER` | the number of active ads in the adgroup exceeds the limit |
| `ADACCOUNT_ALREADY_EXIST_IN_GROUP_TREE` | account already exists in the group tree |
| `ADACCOUNT_CANNOT_MANAGE_DPA` | managing DPA conversion is not allowed |
| `ADACCOUNT_CANNOT_MANAGE_IN_STREAM_VIDEO` | managing in-stream video adgroup is not allowed |
| `ADACCOUNT_CANNOT_MANAGE_RNF` | managing R&F conversion is not allowed |
| `ADACCOUNT_CANNOT_MANAGE_WEBSITE_CONVERSION` | managing website conversion is not allowed |
| `ADACCOUNT_LINKED_TOO_MANY_GROUP` | the number of account-group links exceeds the limit |
| `ADGROUP_APP_INSTALL_EVENT_NOT_YET` | app install event is not captured yet |
| `ADGROUP_INVALID_AUDIENCE_SETTING` | the audience setting of the adgroup is invalid |
| `ADGROUP_IN_ADACCOUNT_COUNT_OVER` | the number of adgroups exceeds the limit |
| `ADGROUP_IN_CAMPAIGN_COUNT_OVER` | the number of adgroups in the campaign exceeds the limit |
| `ADGROUP_IN_STREAM_VIDEO_AUTO_BIDDING_NOT_ALLOWED` | in-stream type adgroup is not allowed for the given campaign objective |
| `ADGROUP_IN_STREAM_VIDEO_CAMPAIGN_OBJECTIVE_NOT_ALLOWED` | in-stream type adgroup is not allowed for the given campaign objective |
| `ADGROUP_IN_STREAM_VIDEO_COUNTRY_NOT_ALLOWED` | in-stream type adgroup is not allowed for the given adaccount country |
| `ADGROUP_LINE_POP_BID_AMOUNT_MUST_BE_CATEGORY_FIXED_CPM` | adgroup bid amount of a line-pop campaign must be the fixed CPM of the category in beacon targeting |
| `ADGROUP_LINE_POP_UPDATING_BID_AMOUNT_NOT_ALLOWED` | updating `bidAmount` in a line-pop campaign is not allowed |
| `ADGROUP_NAME_DUPLICATED` | adgroup name is duplicated |
| `ADGROUP_REQUIRE_RNF_FIELDS` | all R&F fields in the adgroup are required |
| `ADGROUP_RNF_FIELDS_NOT_ALLOWED` | R&F field is not allowed |
| `ADGROUP_RNF_OUT_OF_DURATION_RANGE` | R&F is out of range |
| `ADGROUP_RNF_PERIOD_IS_NOT_IN_CAMPAIGN_PERIOD` | R&F period is not within the campaign period |
| `ADGROUP_UPDATING_RNF_BID_AMOUNT_NOT_ALLOWED` | updating `bidAmount` in an R&F campaign is not allowed |
| `ADGROUP_UPDATING_RNF_DURATION_SHOULD_INCREASE` | updating R&F duration is only allowed in an increasing manner |
| `ADGROUP_UPDATING_RNF_FREQUENCY_SHOULD_INCREASE` | updating R&F frequency is only allowed in an increasing manner |
| `ADGROUP_UPDATING_RNF_START_DATE_NOT_ALLOWED` | updating R&F `startDate` is not allowed |
| `AD_BUTTON_CAMPAIGN_OBJECTIVE_NOT_AVAILABLE` | call-to-action is not available for the campaign objective |
| `AD_CAMPAIGN_OBJECTIVE_NOT_AVAILABLE` | the creative format is not available for the campaign objective |
| `AD_CANNOT_HAVE_DESCRIPTION` | ad cannot have a description |
| `AD_CLICK_URL_IS_MANDATORY_WITH_VIEW_TRACK_URL` | click URL is mandatory when a view-track URL is given |
| `AD_CLICK_URL_MUST_MATCHED_VIEW_TRACK_DOMAIN` | the domain of the click URL must match the view-track URL |
| `AD_DESCRIPTION_REQUIRED` | ad description is required |
| `AD_GAIN_FRIENDS_CAMPAIGN_MUST_BE_IMAGE` | unsupported media type for a gain-friends campaign |
| `AD_IMP_TRACK_URL_SUPPORT_REACH_AND_FREQUENCY` | impression tracking URL is supported for the REACH_AND_FREQUENCY campaign objective |
| `AD_INVALID_FORMAT` | the creative's format is invalid |
| `AD_INVALID_FORMAT_VIEW_TRACK_URL` | the creative's format is invalid with a view-track URL |
| `AD_INVALID_PARENT` | cannot create an ad for a deleted parent entity |
| `AD_INVALID_VIEW_TRACK_DOMAIN` | the view-track URL's domain must start with `https://view.adjust.com` |
| `AD_IN_ADACCOUNT_COUNT_OVER` | the number of ads in the account exceeds the limit |
| `AD_IN_ADGROUP_COUNT_OVER` | the number of ads in the adgroup exceeds the limit |
| `AD_LONG_TITLE_ONLY_USE_SMALL_IMAGE` | long-title fields require a small-image ad |
| `AD_NAME_DUPLICATED` | ad name is duplicated |
| `AD_SMALL_IMAGE_MUST_BE_IMAGE_600_400` | a small-image ad must be image format (600x400) |
| `AD_SMALL_IMAGE_MUST_INCLUDE_LONG_TITLE` | a small-image ad must include the long title |
| `AD_TITLE_REQUIRED` | ad title is required |
| `AD_URL_NOT_FIT_CAMPAIGN_OBJECTIVE` | ad URL does not fit the campaign objective |
| `AD_VIEW_TRACK_BIDTYPE_MUST_CPM` | the bid type of the adgroup must be CPM when a view-track URL is entered |
| `AD_VIEW_TRACK_URL_SUPPORT_APP_INSTALL` | view-track URL is supported for the APP_INSTALL campaign objective |
| `AD_VIEW_TRACK_URL_SUPPORT_JP` | view-track URL is supported for JP adaccounts only |
| `APP_EVENT_AUDIENCE_GROUP_ACTION_TYPE_NOT_EXISTS` | app event type cannot be used |
| `APP_EVENT_AUDIENCE_GROUP_INVALID_COMBINATION_ACTION_TYPE_AND_PARAMETER` | invalid combination of event type and parameter |
| `APP_EVENT_AUDIENCE_GROUP_INVALID_COMBINATION_PARAMETER_AND_CONDITION` | invalid combination of parameter and condition |
| `APP_EVENT_AUDIENCE_GROUP_INVALID_CONDITION` | field has an invalid format |
| `APP_EVENT_AUDIENCE_GROUP_MAX_LENGTH_OVER_APP_EVENT_CONDITION_GROUP_KEYWORD` | keyword is out of range |
| `APP_EVENT_AUDIENCE_GROUP_MISSING_CONDITION_GROUP` | required field is not set |
| `APP_EVENT_AUDIENCE_GROUP_MISSING_CONDITION_GROUP_VALUES` | required field is not set |
| `APP_EVENT_AUDIENCE_GROUP_TOO_MANY_APP_EVENT_CONDITION_GROUP_VALUES` | the number of values exceeds the limit |
| `APP_IN_ADACCOUNT_COUNT_OVER` | you can only add one app per OS |
| `AUDIENCE_GROUPS_CAN_NOT_DELETE_REFFERED_LOOKALIKE_AUDIENCE_GROUP_STILL_EXISTS` | the audience to remove is still in use |
| `AUDIENCE_GROUP_COUNT_MAX_OVER` | the number of audiences in the group exceeds the limit |
| `AUDIENCE_GROUP_NAME_DUPLICATE` | custom audience name is duplicated |
| `AUDIENCE_GROUP_NAME_EMPTY` | audience group name is empty |
| `AUDIENCE_GROUP_NAME_SIZE_OVER` | field is out of range |
| `AUDIENCE_GROUP_NAME_WRONG` | field has an invalid format |
| `AUDIENCE_GROUP_NOT_FOUND` | id is invalid |
| `AUTHORIZATION_FAILED` | authorization failed |
| `AUTO_BID_NOT_ALLOWED` | the campaign objective does not allow the auto-bid type |
| `BID_AMOUNT_IS_NOT_NULL` | bid amount is not null for the given bid strategy |
| `BID_AMOUNT_IS_NULL` | bid amount is null for the given auto-bid type & bid strategy |
| `BID_AMOUNT_OUT_OF_RANGE` | field is out of range |
| `BID_TYPE_NOT_ALLOWED` | the campaign objective does not allow the bid type |
| `BLOCKED_BY_EXCEEDING_TIME_LIMIT` | operation time exceeded the lock timeout limit |
| `BLOCK_APP_CANNOT_ACQUIRE_LOCK` | operation time exceeded the lock timeout limit |
| `CAMPAIGN_IN_ADACCOUNT_COUNT_OVER` | the number of campaigns exceeds the limit |
| `CAMPAIGN_NAME_DUPLICATED` | campaign name is duplicated |
| `CAMPAIGN_START_END_DATE` | start date is later than end date |
| `CANNOT_CREATE_DPA_CAMPAIGN_AD` | cannot create a DPA campaign ad |
| `CANNOT_DELETE_DPA_CAMPAIGN_AD` | cannot delete a DPA campaign ad |
| `CANNOT_DELETE_ENTITY` | entity cannot be deleted |
| `CANNOT_DOWNLOAD_REPORT` | cannot download report |
| `CANNOT_EDIT_ENTITY` | entity cannot be edited |
| `CANNOT_REMOVE_AUDIENCE_STILL_IN_USE` | the audience to remove is still in use |
| `CANNOT_SET_FIELD` | field cannot be set |
| `CANNOT_SPECIFY_DELIVERY_TYPE_ON_AD_REPORT` | cannot specify delivery type |
| `CAROUSEL_ONLY_USE_1_1_IMAGE` | carousel ad can only use a 1:1 image |
| `CAROUSEL_SLOT_SIZE_OUT_OF_RANGE` | carousel ad slot size should be between 2 and 10 |
| `CONDITION_OF_CUSTOM_CONVERSION_IS_NOT_SATISFIED` | the custom conversion id does not satisfy the conditions to be usable |
| `COPY_FAILED_WITH_LOCK` | operation time exceeded the lock timeout limit |
| `COST_SCALE_ERROR` | currency does not allow multiple units |
| `CUSTOM_CONVERSION_AUTO_BIDDING_MUST_HAVE_CUSTOM_CONVERSION_ID` | a custom-conversion adgroup must have a custom conversion id |
| `CUSTOM_CONVERSION_COUNT_MAX_OVER` | the number of audience groups exceeds the limit |
| `CUSTOM_CONVERSION_CUSTOM_EVENT_NAME_NOT_EXISTS` | event name does not exist |
| `CUSTOM_CONVERSION_DESCRIPTION_SIZE_OVER` | field is out of range |
| `CUSTOM_CONVERSION_DESCRIPTION_WRONG` | field has an invalid format |
| `CUSTOM_CONVERSION_MAX_LENGTH_OVER_URL_CONDITION_GROUP_KEYWORDS` | keyword length is out of range |
| `CUSTOM_CONVERSION_MISSING_CONVERSION_EVENT_NAME` | required field is not set |
| `CUSTOM_CONVERSION_MISSING_URL_CONDITION_GROUP` | required field is not set |
| `CUSTOM_CONVERSION_MISSING_URL_CONDITION_GROUP_KEYWORDS` | required field is not set |
| `CUSTOM_CONVERSION_NAME_DUPLICATE` | custom conversion name is duplicated |
| `CUSTOM_CONVERSION_NAME_SIZE_OVER` | field is out of range |
| `CUSTOM_CONVERSION_NAME_WRONG` | field has an invalid format |
| `CUSTOM_CONVERSION_NOT_FOUND` | id is invalid |
| `CUSTOM_CONVERSION_SAME_URL_CONDITION_GROUP_KEYWORDS` | keyword is duplicated |
| `CUSTOM_CONVERSION_TOO_MANY_URL_CONDITION_GROUP_KEYWORDS` | the number of keywords exceeds the limit |
| `CUSTOM_CONVERSION_UNNECESSARY_CONVERSION_EVENT_NAME` | field cannot be set |
| `CUSTOM_CONVERSION_WRONG_URL_CONDITION_GROUP_KEYWORDS` | field has an invalid format |
| `DAILY_BUDGET_IS_LESS_THAN_BID_AMOUNT` | the daily budget amount must not be less than the bid micro amount |
| `DECODING_FAILED` | failed to decode the input stream |
| `DPA_CAMPAIGN_IN_ADACCOUNT_COUNT_OVER` | the number of DPA campaigns exceeds the limit |
| `DPA_CAMPAIGN_NO_FEED_SETTING` | DPA feed is not set |
| `DUPLICATE_KEY` | field has a duplicated key |
| `DURATION_LIMIT_EXCEEDED` | duration exceeds the limit |
| `DURATION_TOO_SHORT` | duration too short |
| `EMPTY_FILE` | file is empty |
| `ENTITY_NOT_FOUND_INVALID_ID` | id is invalid |
| `FILE_SIZE_LIMIT_EXCEEDED` | file exceeds the size limit |
| `GROUP_ALREADY_HAS_SAME_ADACCOUNT_LINK` | group already has the same account link |
| `GROUP_ALREADY_REQUESTED_SAME_ADACCOUNT` | group already requested the same account |
| `GROUP_HAS_TOO_MANY_ADACCOUNT` | the group has too many linked accounts |
| `GROUP_HAS_TOO_MANY_CHILDREN` | the number of group-group links exceeds the limit |
| `GROUP_HAS_TOO_MANY_DEPTH` | the group has too many ancestor groups |
| `GROUP_LINK_REQUEST_TARGET_ADACCOUNT_DOES_NOT_EXIST` | id is invalid |
| `HISTORY_DOWNLOAD_NOT_READY` | the status is not ready for downloading |
| `HISTORY_INVALID_FILE_FORMAT` | the file format is invalid |
| `HISTORY_INVALID_ID` | given id is invalid |
| `IMAGE_IN_ADACCOUNT_COUNT_OVER` | the number of images in the account exceeds the limit |
| `INVALID_ACCOUNT_ID` | invalid account id |
| `INVALID_ANIMATION` | invalid animation |
| `INVALID_ASPECT_RATIO` | invalid aspect ratio |
| `INVALID_CAMPAIGN_ID` | invalid campaign id |
| `INVALID_CONTENT_TYPE_HEADER` | content type header is invalid |
| `INVALID_DATE_FORMAT` | field has an invalid date format |
| `INVALID_ENUM` | field has an invalid enum |
| `INVALID_FILE_CONTENT` | file has invalid content |
| `INVALID_FORMAT` | the value format is invalid |
| `INVALID_GROUP_ID` | invalid group id |
| `INVALID_IMAGE_SIZE` | invalid image size |
| `INVALID_MEDIA_TYPE` | invalid media type |
| `INVALID_NUMBER_FORMAT` | field has an invalid number format |
| `INVALID_REQUEST` | the request input is invalid |
| `INVALID_SIZE` | array size is invalid |
| `INVALID_UNIQUE_ELEMENTS` | must only contain unique elements |
| `INVALID_VALUE` | the value is invalid |
| `LOCK_DEFAULT` | operation time exceeded the lock timeout limit |
| `LOOKALIKE_AUDIENCE_GROUP_COUNT_MAX_OVER` | the number of audience groups exceeds the limit |
| `LOOKALIKE_DUPLICATE_AUDIENCE_GROUP` | the same lookalike audience exists |
| `LOOKALIKE_SOURCE_AUDIENCE_GROUP_INSUFFICIENT` | source audience insufficient |
| `LOOKALIKE_SOURCE_AUDIENCE_GROUP_NOT_FOUND` | id is invalid |
| `LOOKALIKE_SOURCE_AUDIENCE_GROUP_TOO_MUCH` | source audience group contains too large an audience count |
| `MANUAL_BID_NOT_ALLOWED` | the campaign objective does not allow the manual bid type |
| `MEDIA_9_16_VIDEO_USED_NOT_IN_RNF` | 9:16 media is not allowed except for R&F |
| `MEDIA_APP_NOT_NEEDED` | media app is not needed for the given campaign objective |
| `MEDIA_APP_USING_AUDIENCE` | media app is in use by an audience |
| `MEDIA_APP_USING_IN_ACTIVE_ADGROUP` | media app is in use by an active adgroup |
| `MEDIA_PIXEL_SIZE_NOT_SUPPORTED` | media pixel size is not supported |
| `MEDIA_TYPE_NOT_MATCH_FILE_CONTENT` | media type does not match the file content |
| `MEDIA_URL_APPROVED_ALREADY` | media URL is already approved |
| `MEDIA_USING_IN_ACTIVE_AD` | media is in use by an active ad |
| `ONLY_FIRST_ID_CAN_USE_IN_CUSTOM_CONVERSION_AUTOBID` | custom-conversion autobid can only use the same conversion id as the first |
| `OUT_OF_RANGE` | field is out of range |
| `PARTNER_PERMISSION_DENIED` | partner permission denied |
| `REMOVED_ENTITY` | entity already removed |
| `REQUEST_ILLEGAL_ARGUMENT` | there is an illegal argument |
| `REQUEST_INPUT_ADACCOUNT_ID_INVALID` | id is invalid |
| `REQUEST_INPUT_AGE_MIN_MAX_REVERSED` | min age is bigger than max age |
| `REQUEST_INPUT_DATE_MUST_BE_FUTURE` | date must not be in the past |
| `REQUEST_INPUT_FORMAT_INVALID` | field has an invalid format |
| `REQUEST_INPUT_FUTURE` | date must not be in the future |
| `REQUEST_INPUT_INCLUDE_AND_EXCLUDE_CONTAINS_SAME_AUDIENCE` | include audiences and exclude audiences conflict |
| `REQUEST_INPUT_INVALID` | field cannot be set |
| `REQUEST_INPUT_NOT_NULL_APP` | media app cannot be null |
| `REQUEST_INPUT_OS_VERSION_INVALID` | min os version and max os version must be predefined values |
| `REQUEST_INPUT_OS_VERSION_REVERSED` | min os version is bigger than max os version |
| `REQUEST_INPUT_PAST` | date must not be in the past |
| `REQUEST_INPUT_PERIOD_LONGER_THAN_ONE_MONTH` | request period cannot be longer than a month |
| `REQUEST_INPUT_REQUIRED` | required field is not set |
| `REQUEST_INPUT_SIZE` | field is out of range |
| `REQUEST_INPUT_START_DATE_TOO_PAST` | start date is too far in the past |
| `REQUEST_INPUT_START_END_DATE_REVERSED` | start date is later than end date |
| `REQUEST_INPUT_TOO_HIGH` | field is too high |
| `REQUEST_INPUT_TOO_LOW` | field is too low |
| `REQUIRED` | required field is not set |
| `REQUIRED_REQUEST_BODY` | request body is required |
| `RESOURCE_ID_DUPLICATE` | resourceId duplicate |
| `TARGETING_BEACON_TARGETING_INCLUDES_MORE_THAN_ONE_CATEGORY` | chains in beacon targeting belong to more than one category |
| `TARGETING_BEACON_TARGETING_INCLUDES_NON_CHAIN_PLACEMENTS` | beacon targeting includes placements that are not a chain |
| `TARGETING_BEACON_TARGETING_INCLUDES_NOT_ACTIVE_PLACEMENTS` | beacon targeting cannot include inactive placements |
| `TARGETING_BEACON_TARGETING_INCLUDES_NOT_ACTIVE_TAGS` | beacon targeting cannot include inactive tags |
| `TARGETING_BEACON_TARGETING_NEEDED` | a line-pop adgroup must have beacon targeting |
| `TARGETING_CODE_IS_NOT_AVAILABLE_IN_CAMPAIGN_OBJECTIVE` | some targeting codes cannot be used in the campaign objective |
| `TARGETING_GAIN_FRIENDS_NO_EXCLUDE_FRIEND_AUDIENCE` | no excluded account-friend audience found for the gain-friends campaign |
| `TARGETING_INVALID_AUDIENCE` | an invalid audience exists |
| `TARGETING_LOCATION_NOT_MATCH_ADACCOUNT_COUNTRY` | targeting location does not match the account country |
| `TARGETING_OS_SPEC_HAS_MORE_THAN_ONE_OS_VERSION` | os cannot have more than one os version |
| `TOO_HIGH` | field is too high |
| `TOO_LOW` | field is too low |
| `TOO_LOW_SPENDING_LIMIT` | spending limit is too low |
| `UNKNOWN` | unknown error |
| `UPLOAD_AUDIENCE_GROUP_INVALID_AUDIENCE_ID_FORMAT` | advertising id format is invalid |
| `UPLOAD_AUDIENCE_GROUP_TOO_MANY_AUDIENCE_IDS` | the number of advertising ids exceeds the limit |
| `V2_API_AUTHORIZATION_FAILED` | V2 API is not allowed since LADM 9.7.0 |
| `VIDEO_IN_ADACCOUNT_COUNT_OVER` | the number of videos in the account exceeds the limit |
| `WEBTRAFFIC_AUDIENCE_GROUP_MAX_LENGTH_OVER_WEBTRAFFIC_CONDITION_GROUP_KEYWORDS` | keyword is out of range |
| `WEBTRAFFIC_AUDIENCE_GROUP_MISSING_WEBTRAFFIC_CONDITION_GROUP_KEYWORDS` | required field is not set |
| `WEBTRAFFIC_AUDIENCE_GROUP_MISSING_WEBTRAFFIC_CONDTION_GROUP` | required field is not set |
| `WEBTRAFFIC_AUDIENCE_GROUP_MISSING_WEBTRAFFIC_CUSTOM_EVENT_NAME` | required field is not set |
| `WEBTRAFFIC_AUDIENCE_GROUP_NOT_EXISTS_WEBTRAFFIC_CUSTOM_EVENT_NAME` | event name does not exist |
| `WEBTRAFFIC_AUDIENCE_GROUP_SAME_WEBTRAFFIC_CONDITION_GROUP_KEYWORDS` | keyword is duplicated |
| `WEBTRAFFIC_AUDIENCE_GROUP_TOO_MANY_WEBTRAFFIC_CONDITION_GROUP_KEYWORDS` | the number of keywords exceeds the limit |
| `WEBTRAFFIC_AUDIENCE_GROUP_UNNECESSARY_WEBTRAFFIC_CONDTION_GROUP` | field cannot be set |
| `WEBTRAFFIC_AUDIENCE_GROUP_UNNECESSARY_WEBTRAFFIC_CUSTOM_EVENT_NAME` | field cannot be set |
| `WEBTRAFFIC_AUDIENCE_GROUP_UNNECESSARY_WEBTRAFFIC_TAG_EVENT_TYPE` | field cannot be set |
| `WEBTRAFFIC_AUDIENCE_GROUP_WRONG_WEBTRAFFIC_CONDITION_GROUP_KEYWORDS` | field has an invalid format |
| `WEBTRAFFIC_AUDIENCE_GROUP_MISSING_WEBTRAFFIC_TAG_EVENT_TYPE` | required field is not set |

(Error Reasons last updated upstream 2026-04-01.)

---

# Development guidelines

From `https://developers.line.biz/en/docs/line-ads-api/development-guidelines/`.
Follow these when developing against the LINE Ads API.

## Prohibiting mass requests to the LINE Platform

- Do **not** send a large number of requests to the LINE Platform for the
  purpose of load testing or operation testing.
- Do **not** send requests beyond the specified rate limits for any purpose.
  (Rate limits: see `references/authentication.md` — 10 req/s for Ad Tech and
  Data Provider, 2 req/s for Reporting.)
- Sending requests that exceed the rate limit returns `429 Too Many Requests`.

## Prohibiting requests for non-existent IDs

- When sending a request, do **not** specify a non-existent ID (Ad account ID,
  Ad ID, etc.).

## Saving logs

It is recommended to keep request logs for a period of time so developers can
investigate the cause and scope of a problem. Recommended log fields:

- Time of the API request
- Request method
- API endpoint
- Status code returned in the response by the LINE Platform

Example log line format:

```
Time of API request          Request method  API Endpoint                            Status code
Mon, 05 Jul 2022 08:14:35 GMT GET             https://ads.line.me/api/v3/codes/ssps   200
```

---

# About — applying for access

From `https://developers.line.biz/en/docs/line-ads-api/about/`.

- The reference and documentation for the LINE Ads API are hosted on a separate
  site (`ads.line.me/public-docs/...`) — there is an **Ad Tech API** doc and a
  **Data Provider API** doc.
- The LINE Ads API can only be used by **corporate users who have submitted the
  required applications**. To use it with a LINE Ads Account, apply for
  authorization in the LINE Ads Manager. See "Using LINE Ads API" in LINE for
  Business (`lycbiz.com` — only available in Japanese).
