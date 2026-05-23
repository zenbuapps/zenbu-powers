# Development Guidelines

Source: `https://conversion-api-docs.linebiz.com/en/#section/Development-Guidelines`

The official guidelines and best practices for developing against the
Conversion API. If you have reviewed these guidelines and your issue remains
unresolved, refer to LINE's help section
(`https://www.lycbiz.com/jp/manual/line-ads/other_004/?list=7161`) and contact
LINE via the LINE Ads Management Console.

## Table of contents

- Order to send events
- Timing to send events (conversion expiration windows)
- Event deduplication
  - The unit of fields to be deduplicated
  - Event deduplication period
  - LINE Tag configuration for deduplication
  - Notes on sending `deduplicationKey` via LINE Tag
- User match
  - Fields available for user matching
  - User mapping inside the system
  - The scope where user mapping data is used

---

# Order to send events

When sending events, send them in the order the events **actually occurred**,
as much as possible.

If events are not sent in occurrence order, a conversion that originally
occurred may appear to occur later, or LINE's ad delivery optimization could be
adversely affected.

---

# Timing to send events

For more accurate conversion measurement, send events **as soon as possible
after they occur**. In LINE's conversion reporting, the time the event is
**actually accepted to the LINE server** is used as the time the conversion
occurred.

## Conversion expiration windows

Expiration dates for LINE web conversions:

| Conversion type | Expiration window |
|---|---|
| Default conversions | 30 days after the user pressed on the ad |
| Custom conversions | A custom period you can set, between **1 and 90 days** |

For both LINE Tag and Conversion API, the time the event is **accepted to
LINE's servers** is the criterion for the expiration date. Example: even if a
conversion event occurred within 30 days of the user pressing an ad, it is not
measured if it is not sent to LINE's server within the term.

This is why `event_timestamp` (occurrence time) and acceptance time matter
differently — see `references/send-conversion-event.md` (`EventObj` ›
`event_timestamp`).

---

# Event deduplication

To avoid duplicated conversions, every event should include a
`deduplication_key` value. Clients may have to send the same event multiple
times for these reasons:

1. **Retries** — a client error, a temporary failure on the Conversion API
   side, or a network error. In these cases the client must retry sending the
   event.
2. **Multi-route sending** — sending duplicate events through *both* LINE Tag
   and Conversion API, so data not measurable via LINE Tag is complemented by
   Conversion API data. Because the same events are sent from different routes,
   they are always sent more than once.

## The unit of fields to be deduplicated

Events are deduplicated by specifying the `deduplication_key` field to a unique
key that identifies the event. **Two events are considered the same event if
and only if they have the same `event_name` value AND the same
`deduplication_key` value.**

Therefore the following three events are all handled as **different** events
and are **not** subject to deduplication (different `event_name`, or different
`deduplication_key`):

```json
{
  ...
  "event": {
    "source_type": "web",
    "event_type": "conversion",
    "event_name": "Conversion",
    "deduplication_key": "key1"
  },
  ...
}
```

```json
{
  ...
  "event": {
    "source_type": "web",
    "event_type": "conversion",
    "event_name": "Conversion",
    "deduplication_key": "key2"
  },
  ...
}
```

```json
{
  ...
  "event": {
    "source_type": "web",
    "event_type": "conversion",
    "event_name": "Purchase",
    "deduplication_key": "key1"
  },
  ...
}
```

(The first two share `event_name` but differ in `deduplication_key`; the first
and third share `deduplication_key` but differ in `event_name` — so no pair is
a duplicate.)

## Event deduplication period

If multiple events with the same `event_name` value and `deduplication_key`
value are sent, the events that arrive within **30 days** of being accepted for
the first time will be deduplicated.

## LINE Tag configuration for deduplication

When sending duplicate events through both LINE Tag and Conversion API, set the
**same** `deduplication_key` on both routes. To set the `deduplication_key` in
the LINE Tag, an additional field is required. Ensure the value is dynamically
set to be unique for each event:

```javascript
_lt('init', {
  customerType: 'lap',
  tagId: '{{ TAG_ID }}',
  deduplicationKey: '{{ DEDUPLICATION_KEY }}'
})
```

## Notes on sending `deduplicationKey` via LINE Tag

The `deduplication_key` is used for event deduplication, so its value **must be
unique**. When generating and passing the `deduplication_key` to the LINE Tag
via JavaScript, ensure the generation process works correctly.

If you use JavaScript string templates to expand the value of the
`deduplication_key` variable as a string, be careful: if the variable's value
is `undefined` or `null`, it may be sent as the literal string `undefined` or
`null`. In that case, **all those events share the same `deduplication_key`,
leading to incorrect deduplication**.

Problematic — `deduplicationKey` may be sent as the literal string `undefined`:

```javascript
_lt('init', {
  customerType: 'lap',
  tagId: '{{ TAG_ID }}',
  // deduplicationKey: `undefined` may be sent
  deduplicationKey: `${deduplication_key}`
});
```

Correct — if `deduplication_key` is `undefined` / `null`, do not send the value
at all (pass the variable directly, not a template string):

```javascript
_lt('init', {
  customerType: 'lap',
  tagId: '{{ TAG_ID }}',
  deduplicationKey: deduplication_key
});
```

**Server-side behavior**: to avoid unintended deduplication, if the literal
string `undefined` is specified for `deduplication_key`, LINE treats that
`deduplication_key` as if it has **not** been sent, and the event is excluded
from deduplication. (This same "treated as not sent" rule applies to the
`external_id` field — see `references/send-conversion-event.md`.)

---

# User match

When you send an event via Conversion API, a conversion measurement process
determines whether a LINE ad is attributed to the event. To do so, LINE must
match **you** and **the user who raised the event**.

The conversion measurement process uses the `user` object to match LINE users.
Therefore **the `user` object must contain at least one field usable for user
matching**. Events where the user match fails are not subject to conversion
measurement.

## Fields available for user matching

Include as many user-matching fields as possible. The fields available for user
matching are:

| Field | Notes |
|---|---|
| `user.line_uid` | **Recommended** |
| `user.click_id` | **Recommended** |
| `user.phone` | **Recommended** |
| `user.email` | |
| `user.ifa` | |
| `user.browser_id` | Usable for matching **only if user mapping data already exists** |
| `user.external_id` | Usable for matching **only if user mapping data already exists** |

LINE accepts the event for conversion measurement only if **both** of these
conditions are met:

1. **Successful user match** in LINE's system.
2. **User consent** — the user has consented to LINE's application for LINE to
   collect personally referable information received from customers as personal
   data.

If the user match fails, or the user's consent cannot be confirmed, **the event
is discarded without being processed** — conversion is not measured, and the
**Conversion API status on Business Manager is not updated** either. (Note that
the API still returns `202` for receipt; discard happens afterward, silently.)

## User mapping inside the system

It is recommended to include one of `browser_id` or `external_id` in the `user`
object.

By including `browser_id` or `external_id`, the data used for matching is
internally **mapped** using user data *other than* `browser_id` and
`external_id`. LINE calls the created mapping of user data the **"mapping"**,
and calls `browser_id` and `external_id` the **"mapping keys"**.

- The created mapping is also used for conversion measurement by events sent
  thereafter.
- A mapping created via Conversion API is also used for events sent via LINE
  Tag, and vice versa.
- All mapping data has expiration dates and is deleted after a certain period.
  **Update mapping data regularly by sending the latest user data.**

If you send `external_id` through **both** Conversion API and LINE Tag for
internal mapping, you must also set `externalId` in the LINE Tag:

```javascript
_lt('init', {
  customerType: 'lap',
  tagId: '{{ TAG_ID }}',
  deduplicationKey: '{{ DEDUPLICATION_KEY }}',
  externalId: '{{ EXTERNAL_ID }}'
})
```

## The scope where user mapping data is used

- **`browser_id`** is **first-party cookie data** and is issued to the domain
  of your website. (The LINE Tag stores it in the `__lt__cid` first-party
  cookie — see `references/send-conversion-event.md`, `UserObj` › `browser_id`.)
- **`external_id`** — you can set any value. However, mapping with `external_id`
  is available **only between data sent with the same LINE Tag ID**. LINE
  internally hashes the value, stores it, and uses it when matching.

---

# Quick checklist for a correct event

- `event.source_type` = `"web"`, `event.event_type` set, `event.event_timestamp`
  within −90 days … +24 h of arrival.
- `event.deduplication_key` present, unique, matches `^[0-9a-zA-Z\-_]{1,256}$`,
  not the literal string `undefined`.
- For conversions: `event.event_name` set (`"Conversion"` for default, custom
  name otherwise, `^[A-Za-z0-9_\-]{1,20}$`).
- `user` carries ≥ 1 matching field; prefer `line_uid` / `click_id` / `phone`.
- `phone` / `email` SHA-256-hashed; `line_uid` / `click_id` / `ifa` /
  `browser_id` un-hashed; `external_id` hashed and format-consistent with LINE
  Tag.
- If `user.line_uid` is used, send the `X-Line-ChannelID` header.
- Same real event sent on both LINE Tag and Conversion API → same
  `deduplication_key` (and same `external_id` format) on both.
- For a `Purchase` event: `custom.value` set, plus `custom.currency` if `value`
  is an item price.
