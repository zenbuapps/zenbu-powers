---
name: line-ly-ads-network
description: >-
  LY Ads Network (LINEヤフー広告ネットワーク / formerly LINE Ads Network) official
  publisher / SDK reference at API-reference depth. Covers the FiveSDK mobile ad
  SDK for iOS and Android, the ironSource mediation adapter, and the publisher
  Dashboard plus its Reporting API. Use this skill whenever the task touches
  monetizing a mobile app with LY Ads Network: integrating or debugging the
  FiveSDK, displaying custom layout / banner / rectangle, video reward,
  interstitial, or native ad formats, loading ads with the legacy load API or
  the new AdLoader API, handling ad event callbacks (impression, click, error,
  reward, play, viewThrough, pause, fullScreen open/close), wiring App Tracking
  Transparency (ATT) and SKAdNetwork on iOS, configuring AndroidManifest and
  Google Play Data safety on Android, app-ads.txt, registering apps and slots,
  test devices, block settings and TargetCPM in the Dashboard, fetching reports
  via the Dashboard Reporting API, or mediating LY Ads Network through ironSource
  / LevelPlay / AdMob / GAM / MAX. Trigger on mentions of: LY Ads Network, LINE
  Ads Network, LINEヤフー広告ネットワーク, adsnetwork.line.biz,
  adsnetwork-docs.linebiz.com, FiveSDK, FiveAd, pod 'FiveAd',
  com.linecorp.adsnetwork:fivead, FADConfig, FADSettings, FADAdLoader,
  FADAdViewCustomLayout, FADVideoReward, FADInterstitial, FADNative,
  FADLoadDelegate, FADAdSlotConfig, FiveAdConfig, FiveAd.initialize,
  FiveAdCustomLayout, FiveAdVideoReward, FiveAdInterstitial, FiveAdNative,
  FiveAdLoadListener, AdLoader.forConfig, AdSlotConfig, FiveAdErrorCode,
  loadAdAsync, showAd, registerViews, BadAppId, BadSlotId, NoAd, InvalidState,
  PlayerError, LineAdsNetworkIronSourceAdapter, ironsource-adapter, slot ID, app
  ID, mediation adapter, reporting API key, or publisher Dashboard.
---

# LY Ads Network Reference

API-reference-level coverage of **LY Ads Network** (LINEヤフー広告ネットワーク,
formerly LINE Ads Network), extracted from the official publisher documentation
at `https://adsnetwork-docs.linebiz.com/`.

The doc site is Japanese-only (its `/en/` locale is "Not available yet"); this
skill translates the explanatory prose to English and reproduces all code,
identifiers, IDs, and API names verbatim. **Read the reference file that matches
the task — do not guess class names, method signatures, callback names, error
codes, or JSON shapes.**

## When this skill applies

Any work that monetizes a mobile app with LY Ads Network:

- Integrating the **FiveSDK** into an iOS or Android app (the underlying ad SDK).
- Implementing the four ad formats — **Custom Layout** (banner / rectangle /
  square / infeed), **Video Reward**, **Interstitial**, **Native**.
- Choosing between the **legacy load API** (`loadAdAsync` + delegate/listener)
  and the **AdLoader API** (`FADAdLoader` / `AdLoader`, the new standard from
  SDK v3.0.0) — and migrating between them.
- Wiring ad-event callbacks, App Tracking Transparency, SKAdNetwork,
  AndroidManifest, Google Play Data safety, app-ads.txt.
- Mediating LY Ads Network through **ironSource / LevelPlay**, AdMob, GAM, or MAX.
- Using the publisher **Dashboard** (register apps & slots, test devices, block
  settings, TargetCPM) and the **Dashboard Reporting API** (REST, Basic Auth).
- Troubleshooting `BadAppId` / `BadSlotId` / `NoAd` / `InvalidState` /
  `PlayerError` / missing impressions.

## Two SDK variants — never mix them

iOS and Android FiveSDK have **different class names, method names, and callback
names**. They are not interchangeable. Always confirm the platform first.

| Concept | iOS class/API | Android class/API |
|---|---|---|
| App-wide config | `FADConfig` | `FiveAdConfig` |
| SDK init (legacy) | `FADSettings.register(config)` | `FiveAd.initialize(context, config)` |
| AdLoader entry | `FADAdLoader(for: config)` | `AdLoader.forConfig(context, config)` |
| Custom layout ad | `FADAdViewCustomLayout` | `FiveAdCustomLayout` |
| Video reward ad | `FADVideoReward` | `FiveAdVideoReward` |
| Interstitial ad | `FADInterstitial` | `FiveAdInterstitial` |
| Native ad | `FADNative` | `FiveAdNative` |
| Load listener (legacy) | `FADLoadDelegate` (`setLoadDelegate`) | `FiveAdLoadListener` (`setLoadListener`) |
| AdLoader slot config | `FADAdSlotConfig` | `AdSlotConfig` |
| Error enum | `FADErrorCode` | `FiveAdErrorCode` |
| Languages shown in docs | Swift / Objective-C | Kotlin / Java |

## SDK version note (as of the crawl)

- **iOS FiveSDK** latest: `v3.0.1` (Swift-based, recommended main-support line).
  Compatible with iOS 15+. v2-line fix release is `v2.9.20260303`.
- **Android FiveSDK** latest: `v3.1.1`. From `v3.1.0`, `minSdkVersion` is 23 and
  `targetSdkVersion` 36. Supports Android 5.0+ (older v2 releases) / API 23+ (v3.1).
- **AdLoader API** is the standard from SDK v3.0.0; the legacy load API is
  deprecated in v3.0.0 (still works). New integrations should use AdLoader.
- SDK versions below `v2.9.20241105` (iOS) / `v2.9.20250110` (Android) lose ad
  delivery on **2026-04-15** (support ended).

## Reference file map

| File | Contents |
|---|---|
| `references/overview-and-setup.md` | Product portal, publisher account registration, prerequisites, glossary, roles & access matrix, mediation options overview, ad-network guidelines, contact channels |
| `references/fivesdk-ios.md` | iOS FiveSDK with the **legacy load API**: CocoaPods/SPM/manual install, App Tracking Transparency, `FADConfig` init & test flag, sound settings, all 4 ad formats (object → `setLoadDelegate` → `loadAdAsync` → `fiveAdDidLoad`), SKAdNetwork IDs, store-release checklist, App Store privacy disclosure |
| `references/fivesdk-ios-adloader.md` | iOS **AdLoader API** (`FADAdLoader`, `FADAdSlotConfig`): obtaining the loader, the 4 `load*Ad` functions, all 4 ad formats, plus the AdLoader-API migration guide and the 20231115 ad-event migration guide |
| `references/fivesdk-android.md` | Android FiveSDK with the **legacy load API**: Maven install, `AndroidManifest` setup, `FiveAdConfig` init & test flag, sound settings, all 4 ad formats (`setLoadListener` → `loadAdAsync` → `onFiveAdLoad`), store-release checklist, Google Play Data safety |
| `references/fivesdk-android-adloader.md` | Android **AdLoader API** (`AdLoader`, `AdSlotConfig`): obtaining the loader, the 4 `load*Ad` functions with callbacks, all 4 ad formats, plus all v2.7.20240112 + AdLoader migration guides |
| `references/ad-events.md` | Ad event listener APIs for both platforms: per-format event listener interfaces, every callback (impression/click/error/reward/play/viewThrough/pause/fullScreenOpen/fullScreenClose/remove), `FADErrorCode` / `FiveAdErrorCode` values, impression-verification guidance |
| `references/ironsource-mediation.md` | ironSource / LevelPlay mediation: FiveSDK + adapter install (iOS & Android), ironSource Dashboard custom-adapter config (Network Key, app_id/slot_id/is_test), plugin release notes & SDK-compatibility matrix, troubleshooting |
| `references/dashboard-and-reporting-api.md` | Publisher Dashboard screens, app & slot registration (formats, aspect ratios, Bidding Type), test devices, slot editing & TargetCPM, block settings, KPI report & CSV columns, **Reporting API** (REST endpoints, request body, dimensions, metrics, filter, response codes), **API history endpoint** |
| `references/troubleshooting-and-faq.md` | Quick-diagnosis decision trees (iOS & Android), `BadAppId`/`BadSlotId`/`NoAd`/`InvalidState`/`PlayerError`/no-impression remedies, contact-form info checklist, the full publisher FAQ, platform-integration notice |

## Quick API index

### iOS — legacy load API (one format)

```swift
let config = FADConfig(appId: "your-app-id")
config.isTest = true                                   // test ads only
FADSettings.register(config)                            // SDK init

let ad = FADAdViewCustomLayout(slotId: "your-slot-id", width: Float(120))
ad.setLoadDelegate(self)                                // FADLoadDelegate
ad.loadAdAsync()
// FADLoadDelegate.fiveAdDidLoad(_:) → add to view / .show(with:)
```

### iOS — AdLoader API (new standard, v3.0.0+)

```swift
let adLoader = try FADAdLoader(for: FADConfig(appId: "your-app-id"))
let slot = FADAdSlotConfig(slotId: "your-slot-id")
adLoader.loadBannerAd(with: slot, withInitialWidth: 120) { ad, error in /* ... */ }
// loadInterstitialAd(with:withLoadCallback:) / loadRewardAd / loadNativeAd
```

### Android — legacy load API

```kotlin
val config = FiveAdConfig("your-app-id").apply { isTest = true }
FiveAd.initialize(context, config)                      // SDK init

val ad = FiveAdCustomLayout(context, "your-slot-id", width)
ad.setLoadListener(this)                                // FiveAdLoadListener
ad.loadAdAsync()
// FiveAdLoadListener.onFiveAdLoad(...) → addView / .showAd()
```

### Android — AdLoader API (new standard, v3.0.0+)

```kotlin
val adLoader = AdLoader.forConfig(context, FiveAdConfig("your-app-id"))   // null on error
adLoader?.loadBannerAd(AdSlotConfig("your-slot-id"), width, callback)
// loadInterstitialAd(config, callback) / loadRewardAd / loadNativeAd(config, width, callback)
```

### Dashboard Reporting API (REST)

```
POST https://adsnetwork.line.biz/api/public/v1/reports.csv     CSV report
POST https://adsnetwork.line.biz/api/public/v1/reports.json    JSON report
POST https://adsnetwork.line.biz/api/public/v1/api-key-history API call history
```

Auth: HTTP Basic — `curl -u ${API_KEY_ID}:${API_KEY_SECRET}`. API keys are
issued in the Dashboard "Reporting API key management" screen (admin role, max 5).

## Working rules

- A single ad object cannot be loaded twice — calling `loadAdAsync` again yields
  `InvalidState`. Re-create the ad object to reload. (Does not apply to AdLoader
  API, which returns a fresh object per load.)
- `isTest = true` delivers only **test ads**; production builds must clear it
  (or it is the #1 release bug). Test ads ignore app approval / bundle-ID checks.
- Interstitial format must **not** grant in-app incentives/points — use Video
  Reward for that.
- Native format requires manual **review** by sales before it can be enabled.
- Impressions only fire when the **entire** ad view is on-screen and unobscured
  by other views. Always verify the impression callback during integration.
- App ID + Slot ID must exactly match the Dashboard registration; mismatched
  bundle ID / package name blocks production delivery (test mode still works).
- The legacy load API is **deprecated** as of SDK v3.0.0 — prefer the AdLoader
  API for new code; see the `*-adloader.md` files.
- `revenue`, `ecpm`, `cpc` from reports/Dashboard are **tax-excluded** estimates.
- Dashboard host is `adsnetwork.line.biz`; docs host is `adsnetwork-docs.linebiz.com`.
