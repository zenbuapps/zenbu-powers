# Overview & Setup

Source:
- `https://adsnetwork-docs.linebiz.com/`
- `https://adsnetwork-docs.linebiz.com/cms/` (Dashboard intro)
- `https://adsnetwork-docs.linebiz.com/cms/general-guide/terms.html` (glossary, roles)

## Table of contents

- What LY Ads Network is
- Two integration paths: direct FiveSDK vs mediation
- Prerequisites (iOS / Android)
- Publisher account registration
- Glossary
- Roles & access-rights matrix
- Ad-network guidelines
- Contact channels

---

## What LY Ads Network is

**LY Ads Network** (LINEヤフー広告ネットワーク; formerly **LINE Ads Network**) is
a mobile in-app advertising network. App publishers integrate an SDK to display
ads and earn revenue. The underlying ad SDK is called **FiveSDK** (classes are
prefixed `FAD` on iOS, `FiveAd` on Android). The publisher web console is the
**Dashboard** at `https://adsnetwork.line.biz/`.

Platform note: "LINE広告" (LINE Ads) and "Yahoo! ディスプレイ広告" are being merged
into "LINEヤフー広告" around spring 2026; the network is being renamed to "LINEヤフー
広告ネットワーク". Guidelines are being unified — see `troubleshooting-and-faq.md`.

## Two integration paths

| Path | When | Docs |
|---|---|---|
| **Direct FiveSDK** | You display LY Ads Network ads without a third-party mediation layer (or via waterfall). | `fivesdk-ios.md`, `fivesdk-android.md` (legacy) or `fivesdk-ios-adloader.md`, `fivesdk-android-adloader.md` (new) |
| **Mediation** | LY Ads Network is one network inside a mediation stack. | ironSource/LevelPlay → `ironsource-mediation.md`. AdMob/GAM → Google's docs (`developers.google.com/admob/{ios,android,unity,flutter}/mediation/line`). MAX → `support.axon.ai/.../sdk-bidder-network-guides#line`. |

The home page also lists the SDK install guides (`/fivesdk-ios/`, `/fivesdk-android/`),
mediation guides, the Dashboard guide (`/cms/`), and the FAQ (`/faq/`).

## Prerequisites

### iOS
- iOS FiveSDK requires **iOS 15+** (v3-line and v2.9.20250507+). Older v2 releases
  supported iOS 11.
- Latest Xcode is recommended.
- v3.0.x is the recommended main-support line; v2 fix release is `v2.9.20260303`.

### Android
- Android FiveSDK supports **Android 5.0+** (older v2 releases). From `v3.1.0`,
  `minSdkVersion` is **23** and `targetSdkVersion` **36**.
- Latest Android Studio is recommended.
- No ProGuard rules need to be added.

To deliver ads you must register an **app** and a **slot** in the Dashboard and
embed the issued App ID and Slot ID in the SDK. See `dashboard-and-reporting-api.md`.

## Publisher account registration

Using LY Ads Network requires a **Publisher account**. Register at:

```
https://account.line.biz/login?scope=email&layout=email&redirectUri=https%3A%2F%2Fadsnetwork.line.biz%2F
```

The user who applies for company registration becomes the initial **Administrator**.

Recommended Dashboard browser: **Google Chrome (latest)** on Windows / macOS.
Other browsers/versions are not supported.

## Glossary

| Term | Meaning |
|---|---|
| **Dashboard** | The LY Ads Network management console (`adsnetwork.line.biz`). |
| **Company (カンパニー)** | The corporation or individual using LY Ads Network. |
| **User (ユーザー)** | A collective name for company participants. |
| **Role (ロール)** | A permission level controlling Dashboard access. A user holds exactly one role. |
| **Administrator (管理者)** | Role with access to all features; can delete/edit members. A company can have multiple administrators. The user who applied for the company is registered as an administrator. |
| **Member (メンバー)** | Role that can configure apps & slots and view reports. Unlike Administrator, cannot view payment history or delete/edit members. |
| **Finance (ファイナンス)** | Role that can view payment history. |
| **App (アプリ)** | An app registered with LY Ads Network. iOS and Android must be registered separately. |
| **Slot (スロット)** | An ad placement that displays an LY Ads Network ad. Placing a slot in your app lets it show ads. |
| **Bidding Type** | The bidding-method setting. Chosen at slot creation per bidding method. If not using bidding (e.g. waterfall), select `Standard`. |
| **TargetCPM** | A per-slot target-CPM feature. Can be enabled/disabled. When enabled, accepts an integer `> 0` and `<= 8,000`. |

## Roles & access-rights matrix

| Role \ Screen | App | Report | Payment | Block settings | User management | Reporting API key management |
|---|---|---|---|---|---|---|
| Administrator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Member | ✓ | ✓ | | | | |
| Finance | | | ✓ | | | |

There is no read-only role.

## Ad-network guidelines

The home page links these guidelines (external, hosted on `ads-help.yahoo-net.jp`,
JA + EN versions):

| Guideline | JA / EN article |
|---|---|
| Ad Delivery Guidelines (広告配信ガイドライン) | `H000062226` |
| Ad Implementation Guidelines (広告実装ガイドライン) | `H000062228` |
| Ad Traffic Quality Guidelines (トラフィッククオリティーガイドライン) | `H000062258` |

A 2025-11-05 notice announces unified post-merger guidelines (effective ~spring
2026); current guidelines apply until the merger. See `troubleshooting-and-faq.md`.

## Contact channels

- General inquiry form: `https://form-business.yahoo.co.jp/claris/enqueteForm?inquiry_type=laninquiry`
- Block-setting request form (JA): `inquiry_type=lanblock`; (EN): `inquiry_type=lanblock_en&lang=en`
- Ad-placement inquiry / advertising: `https://www.lycbiz.com/jp/contact/`
- Terms of service: `https://www.lycbiz.com/jp/terms-and-policies/line-ads-network/`
- For SDK integration troubleshooting, contact the sales representative with the
  info checklist in `troubleshooting-and-faq.md`.
