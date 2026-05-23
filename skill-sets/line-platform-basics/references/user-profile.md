# Get User Profile Information — Sources, Methods & Field Coverage

Source: `https://developers.line.biz/en/docs/basics/user-profile/`

This basics page explains **what** user profile information is, **the seven
methods** for obtaining it across LINE products, and exactly **which fields
each method returns**. The full field-coverage matrix is the load-bearing part
of this page — copy it verbatim when deciding which API to call.

## Table of contents

- What is user profile information (Profile, Common Profile, LINE Profile+)
- How to get profile information (7 methods)
- Types of profile information that can be obtained (full coverage matrix)
- Permission / application requirements

---

## Overview

With the **Messaging API**, **LINE Login**, the **LINE Front-end Framework
(LIFF)**, and the **LINE MINI App**, you can obtain user profile information.

The **types of profile information available depend on the method used** to
obtain it. Some profile information (such as a user's email address and
address) requires a **separate application or contract** before it can be
obtained.

---

## What is user profile information

Users set basic profile information (name, profile picture, etc.) in the LINE
app under **Settings > Profile**.

Beyond this basic **Profile**, there are two additional profile types:

- **Common Profile**
- **LINE Profile+**

### Common Profile

**Common Profile** is a profile that users create by **combining the profile
information they have registered with the LINE app or Yahoo! JAPAN**. Users set
their Common Profile in the **Account Center**.

Reference: "Set Common Profile to use Quick-fill" (LINE user's guide, Japanese
only) — `https://guide.line.me/ja/services/quick-fill.html`.

### LINE Profile+

In addition to usual profile information, users can register **additional
information** (address, phone number, etc.) via **Settings > Profile > LINE
Profile+** in the LINE app.

With **LINE Profile+**, users can set:

- **Name** — last name, first name, middle name, first name pronunciation, etc.
- **Gender**
- **Birthday** — info from **Settings > Profile > Birthday** also appears here
- **Phone number** — info from **Settings > Account > Phone number** also appears here
- **Email address** — info from **Settings > Account > Email address** also appears here
- **Address** — postal code, state, city, street address, etc.

Registering this in LINE Profile+ lets users avoid manually re-entering their
address, phone number, etc. when using LINE family apps or external services.

Using LINE Profile+ data in your service is a **corporate option** — see
"LINE Profile+" in the options-for-corporate-customers documentation:
`https://developers.line.biz/en/docs/partner-docs/line-profile-plus/`.

---

## How to get profile information

There are **seven methods** for obtaining user profile information on the LINE
Platform:

| # | Method | Product | Reference URL |
|---|---|---|---|
| 1 | **Get profile** endpoint | Messaging API | `https://developers.line.biz/en/reference/messaging-api/#get-profile` |
| 2 | **Get user information** endpoint | LINE Login | `https://developers.line.biz/en/reference/line-login/#userinfo` |
| 3 | **Get user profile** endpoint | LINE Login | `https://developers.line.biz/en/reference/line-login/#get-user-profile` |
| 4 | **Payload of the ID token** | LINE Login | `https://developers.line.biz/en/docs/line-login/verify-id-token/#payload` |
| 5 | **`liff.getProfile()`** method | LIFF | `https://developers.line.biz/en/reference/liff/#get-profile` |
| 6 | **Payload** via **`liff.getDecodedIDToken()`** | LIFF | `https://developers.line.biz/en/reference/liff/#get-decoded-id-token` |
| 7 | **Common Profile Quick-fill** feature | LINE MINI App | `https://developers.line.biz/en/docs/line-mini-app/quick-fill/overview/` |

Source split:

- **Methods 1–6** obtain information from the **LINE profile** and **LINE
  Profile+**.
- **Method 7** obtains information from the **Common Profile**.

Constraint: you can only get the **main profile** information. You **cannot**
get the user's **subprofile**.

---

## Types of profile information that can be obtained

The types of profile information you can get depend on the method. Below is the
full coverage matrix for methods 1–7. `✅` = obtainable (the JSON / payload key
that carries it is shown in parentheses); `❌` = not obtainable by that method.

| Profile information | M1 — Messaging API Get profile | M2 — LINE Login Get user information | M3 — LINE Login Get user profile | M4 — LINE Login ID token payload | M5 — LIFF `liff.getProfile()` | M6 — LIFF `liff.getDecodedIDToken()` payload | M7 — LINE MINI App Common Profile Quick-fill |
|---|---|---|---|---|---|---|---|
| User ID | ✅ `userId` | ✅ `sub` | ✅ `userId` | ✅ `sub` | ✅ `userId` | ✅ `sub` | ❌ |
| Display name | ✅ `displayName` | ✅ `name` | ✅ `displayName` | ✅ `name` | ✅ `displayName` | ✅ `name` | ❌ |
| Profile image | ✅ `pictureUrl` | ✅ `picture` | ✅ `pictureUrl` | ✅ `picture` | ✅ `pictureUrl` | ✅ `picture` | ❌ |
| Status message | ✅ `statusMessage` | ❌ | ✅ `statusMessage` | ❌ | ✅ `statusMessage` | ❌ | ❌ |
| Language | ✅ `language` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Email address | ❌ | ❌ | ❌ | ✅ `email` | ❌ | ✅ `email` | ✅ `email` |
| Name | ❌ | ❌ | ❌ | ✅ `given_name`, `family_name` etc. | ❌ | ✅ `given_name`, `family_name` etc. | ✅ `given-name`, `family-name` etc. |
| Gender | ❌ | ❌ | ❌ | ✅ `gender` | ❌ | ✅ `gender` | ✅ `sex-enum` |
| Birthday | ❌ | ❌ | ❌ | ✅ `birthdate` | ❌ | ✅ `birthdate` | ✅ `bday-year`, `bday-month` etc. |
| Address | ❌ | ❌ | ❌ | ✅ `address` | ❌ | ✅ `address` | ✅ `address-level1`, `address-level2` etc. |
| Phone number | ❌ | ❌ | ❌ | ✅ `phone_number` | ❌ | ✅ `phone_number` | ✅ `tel` |

Notes on reading the matrix:

- **`language` is unique to Method 1** (Messaging API Get profile) — no other
  method returns the user's language.
- **`statusMessage`** is returned only by Methods 1, 3, and 5 (the
  "Get profile"-style endpoints), not by the `userinfo` / ID-token methods.
- The **extended fields** (email, name, gender, birthday, address, phone) come
  only from the **ID-token payload methods (4 and 6)** and from **Common
  Profile Quick-fill (7)**. Plain `userinfo` (M2), `Get user profile` (M3),
  Messaging API `Get profile` (M1), and `liff.getProfile()` (M5) do **not**
  carry them.
- Method 7's keys use a **different naming style** (`given-name`, `sex-enum`,
  `bday-year`, `address-level1`, `tel` — autofill-style hyphenated tokens)
  because Common Profile Quick-fill is built on browser autofill semantics.

---

## Permission / application requirements

| To obtain... | Via methods... | You must... |
|---|---|---|
| Email address | Method 4, Method 6 | Request permission to access the user's email address — see "Requesting permission to access the user's email address" in the LINE Login docs: `https://developers.line.biz/en/docs/line-login/integrate-line-login/#applying-for-email-permission` |
| Name, gender, birthday, address, phone number | Method 4, Method 6 | Apply for **LINE Profile+** (a corporate-user option) — see `https://developers.line.biz/en/docs/partner-docs/line-profile-plus/` |
| Any profile information | Method 7 (Common Profile Quick-fill) | Apply to use the **Quick-fill** feature — see "Overview of Common Profile Quick-fill": `https://developers.line.biz/en/docs/line-mini-app/quick-fill/overview/` |

Practical consequence: basic identity fields (user ID, display name, picture)
are available with no extra application via Methods 1–6. Anything more
sensitive (email, legal name, gender, birthday, address, phone) is gated behind
an email-permission request and/or a LINE Profile+ corporate contract, and is
only delivered through ID-token payloads (M4/M6) or Common Profile Quick-fill (M7).
