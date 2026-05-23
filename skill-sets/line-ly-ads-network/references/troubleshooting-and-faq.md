# Troubleshooting & FAQ

Source:
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/trouble-shooting/*.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/trouble-shooting/*.html`
- `https://adsnetwork-docs.linebiz.com/faq/`
- `https://adsnetwork-docs.linebiz.com/notice/20251105.html`

The iOS and Android troubleshooting pages are near-identical; differences are
noted. For error-code reference and listener APIs see `ad-events.md`.

## Table of contents

- Quick diagnosis (decision tree)
- `BadAppId` / `BadSlotId`
- `InvalidState`
- `NoAd`
- No impression
- `PlayerError`
- Verify with the sample app
- Contact-form info checklist
- Publisher FAQ
- Platform-integration notice (2025-11-05)

---

## Quick diagnosis (decision tree)

Check in order, top to bottom.

### Step 1 — Is the ad loading?

Confirm the load-success callback fires: `fiveAdDidLoad` (iOS `FADLoadDelegate`)
/ `onFiveAdLoad` (Android `FiveAdLoadListener`).

iOS:

```swift
func fiveAdDidLoad(_ ad: FADAdInterface!) {
    print("fiveAdDidLoad")
}
```

Android:

```kotlin
override fun onFiveAdLoad(fiveAdInterface: FiveAdInterface) {
    Log.d("FiveAd", "onFiveAdLoad")
}
```

**If the ad is not loading**, implement the load error handler and check the
error code:

iOS:

```swift
func fiveAd(_ ad: FADAdInterface!, didFailedToReceiveAdWithError errorCode: FADErrorCode) {
    print("five ad load error: \(errorCode.rawValue)")
}
```

Android:

```kotlin
override fun onFiveAdLoadError(fiveAdInterface: FiveAdInterface, errorCode: FiveAdErrorCode) {
    Log.d("FiveAd", "onFiveAdLoadError: errorCode = " + errorCode.name)
}
```

Load error codes:

| Code | Name | Handling |
|---|---|---|
| 1 | `NetworkError` | Retry in a stable network environment. |
| 2 | `NoAd` | See the `NoAd` section. |
| 4 | `BadAppId` | See the `BadAppId`/`BadSlotId` section. |
| 5 | `StorageError` | Device storage problem — retry on a different device. |
| 6 | `InternalError` | Possibly an SDK or OS bug — contact support. |
| 8 | `InvalidState` | See the `InvalidState` section. |
| 9 | `BadSlotId` | See the `BadAppId`/`BadSlotId` section. |
| 10 | `Suppressed` | Contact support. |

If no error code appears, the load itself is probably not happening — confirm
`loadAdAsync` is being called.

### Step 2 — Is an impression firing?

Implement the per-format impression callback. If none fires, see the
**No impression** section.

| Ad format | iOS protocol → callback | Android callback |
|---|---|---|
| Custom Layout | `FADCustomLayoutEventListener` → `fiveCustomLayoutAdDidImpression` | `onImpression` (or legacy `onFiveAdImpression`) |
| Video Reward | `FADVideoRewardEventListener` → `fiveVideoRewardAdDidImpression` | `onImpression` |
| Interstitial | `FADInterstitialEventListener` → `fiveInterstitialAdDidImpression` | `onImpression` |
| Native | `FADNativeEventListener` → `fiveNativeAdDidImpression` | `onImpression` |

### Step 3 — Is an error event firing?

Implement the per-format error handler and check the error code:

| Code | Name | Handling |
|---|---|---|
| 1 | `NetworkError` | Retry in a stable network environment. |
| 5 | `StorageError` | Device storage problem — retry on a different device. |
| 6 | `InternalError` | Possibly an SDK or OS bug — contact support. |
| 12 | `PlayerError` | See the `PlayerError` section. |

If no error code appears, contact support.

## `BadAppId` / `BadSlotId`

- **Verify the App ID and Slot ID** match the registered values. If wrong, ads
  are not delivered even with the test flag set.
- **Wait, then retry** — on first launch, loading an ad before the SDK's internal
  init completes can give `BadAppId`/`BadSlotId`. Wait a while and reload.
- **Restart the app** — if first-launch SDK init failed for some reason, you can
  get `BadAppId`/`BadSlotId`; an app restart may fix it.

## `InvalidState`

- **Check for ad-object reuse** — FiveSDK does not allow calling `loadAdAsync`
  multiple times on the same ad object. To reload, **re-create** the ad object.
  (The AdLoader API is not affected — each load returns a fresh object.)

## `NoAd`

- **Changed App ID / test flag** — after changing the App ID or test flag,
  uninstall and reinstall the app once. FiveSDK's cache can temporarily prevent
  ads from showing.
- **Check the ad format** — if the slot's registered ad format and the class used
  in the implementation do not match, ads are not delivered. Fix the code or
  re-register the slot.
- **Check the device clock** — if the device clock is far off from the current
  time, ads are not delivered. Fix the clock and retry.
- **Check the OS setting** — confirm the target OS set for the app in the
  Dashboard is correct. If wrong, ads are not delivered. If you registered the
  wrong target OS, re-register the app as new.
- **Check the bundle ID / package name** — confirm the package name set in the
  Dashboard matches the app's bundle ID (iOS) / package name (Android). If they
  do not match, production ads are not delivered (test mode still works).
- **Check the app is approved** — if the app is not approved in the Dashboard,
  only test ads are delivered. Apply for approval from the Dashboard.
- **Check you are not accessing from outside Japan** — if no deliverable campaign
  exists, ads are not delivered (test mode still works). To deliver to a specific
  device as an exception, contact support with the device's IDFA (iOS) / ADID
  (Android).

## No impression

- **Check no view overlaps the ad view** — FiveSDK does not fire an impression
  if another view covers the ad view. Use Xcode's Debug View Hierarchy (iOS) /
  Android Studio's Layout Inspector (Android) to check for overlapping views.
- **Check the whole ad view is on-screen** — FiveSDK does not fire an impression
  unless the entire ad view is shown. Check no part of the slot is off-screen.

## `PlayerError`

- **Limit the number of simultaneously placed ads** — `PlayerError` occurs when
  the video player cannot secure enough resources. Limit the number of
  simultaneously placed ads to reduce resource consumption.

## Verify with the sample app

A simple sample app is provided for testing FiveSDK (downloadable from the
in-page link on the sample-app pages). If ads are not delivered in your real app,
test the sample app with the same settings:

- If the sample app crashes or fails to build — the FiveSDK version may be
  unsupported, or the Dashboard settings may be wrong.
- If the sample app shows no ads — the Dashboard settings may be wrong.
- If the sample app shows ads but your code does not — your implementation code
  may be wrong.

The sample-app distribution page always carries a sample matching the latest SDK,
and serves as an AdLoader-API implementation example.

## Contact-form info checklist

When ads are not delivered, contact your sales representative (or the JA / EN
inquiry forms) with this info:

| Item | Example (iOS) | Example (Android) | Notes |
|---|---|---|---|
| Test time | 2021/1/11 17:00–18:00 | 2021/1/11 17:00–18:00 | |
| Platform | iOS | Android | |
| Framework | Unity 2020.3.25f1 | Unity 2020.3.25f1 | Only if using a framework like Unity |
| Test device model | iPhone 13 mini | Google Pixel 5a (5G) | |
| Test device OS version | iOS 15.2 | Android 11 | |
| Test device ad ID | IDFA `xxxxxxxx-...` | ADID `xxxxxxxx-...` | iOS: run the test with ATT approved |
| FiveSDK version | v2.4.20211028 | v2.7.20240214 | |
| App ID | 1 | 1 | |
| Bundle ID | `com.five-corp.MyApp` | `com.five-corp.myapp` | |
| Mediation SDK name & version | GoogleMobileAds SDK 8.13.0 | GoogleMobileAds SDK 8.13.0 | Only if using mediation |
| Mediation adapter version | 1.4.0 | 1.4.0 | Only if using mediation |
| Quick-diagnosis result | e.g. 1. ad loads; 2. no impression | | |
| Troubleshooting result | e.g. view overlap → none; whole ad on-screen → yes | | Attach logs/screenshots |
| Observed phenomenon | e.g. ad loads but is not shown; appears in the view hierarchy | | Describe in detail |
| Helpful logs/screenshots | `<screenshot.png>`, `<view-hierarchy.png>`, `<debug-log.txt>` | | Send logs as text files |

Forms — JA: `https://form-business.yahoo.co.jp/claris/enqueteForm?inquiry_type=laninquiry`;
EN: same with `inquiry_type=laninquiry` and English form variant.

---

# Publisher FAQ

Verbatim Q&A from the FAQ page.

## Account

- **Add a user** → Add from Dashboard "User management".
- **Stop an account** → Contact via the inquiry form.
- **Differences between Dashboard permissions** → See the per-role access matrix
  (`overview-and-setup.md` / `cms/general-guide/terms.html`).
- **Change a user's permission** → Change from Dashboard "User management".
- **Grant a read-only user permission** → Not possible.
- **Invite another company's user** → Not recommended. Access cannot be
  controlled per app or per slot.
- **Transfer a business (app)** → Contact via the inquiry form.
- **App owner changed** → Contact via the inquiry form.
- **Find the Company ID** → The Company ID (`cm~~`) is in the Dashboard's
  "Company info".

## Login

- **Cannot log in** → Contact via the inquiry form.
- **Dashboard login URL** → `https://adsnetwork.line.biz/`.
- **Forgot the ID** → See `https://help2.line.me/business_id/web/pc?lang=ja&contentId=20011265`.
- **Forgot the password** → Use password reset on the login screen.

## Review

- **Time for app review** → After pressing the review-start button, approval
  usually takes about 3 to 5 business days; longer when applications are
  concentrated.
- **Error when pressing the app review button** → The package name may already
  be registered by another account. Contact via the inquiry form.

## Account (bank)

- **Change the bank account** → Contact via the inquiry form.
- **Confirm bank account info** → Contact via the inquiry form. Normally the bank
  info entered at application time is registered.

## Slot settings

- **Delete a slot** → Deletion is not possible. Disable the slot's status via
  App → Slot info.
- **Rename a slot** → Editable via Dashboard App → Slot info.
- **Set a floor price** → Editable via Dashboard App → Slot info.
- **Implement a Native slot** → Generally not accepting new deliveries except for
  some; usage requires a delivery-surface design review. Contact via the inquiry
  form.

## App settings

- **Deliver production ads to a test app** → Not possible for test apps not
  released on the app store.
- **How to test ad display** → Use test ads (see the test flag) or App → Test
  devices.

## Payment

- **USD payment** → Currently JPY payment only.
- **Cost to integrate** → No cost to integrate the LY Ads Network SDK.
- **When the payment amount is fixed** → Generally fixed on the first business
  day of the month.
- **Payment cycle** → Closed at month-end, paid at the end of the following
  month. (Note: from Feb 2027, the new "Partner Network Terms" change this to
  closed at month-end, paid at the end of the **month after next**.)
- **Dashboard report revenue tax-inclusive or exclusive?** → **Tax-excluded.**

## Payment / Report

- **Report amount vs "monthly reward amount" differ?** → Yes, they can. Reports
  are preliminary values; the final fixed reward is in "Reward & payment".
- **Can CSV download be per app / per slot?** → Yes.
- **Difference between 0-yen reward and a hidden item?** → Whether a sub-1-yen
  impression occurred that month: impression exists → shown as 0 yen; no
  impression → not shown.
- **When are delivery reports reflected?** → Generally about 3 hours; up to about
  8 hours in some cases.

## Report

- **Do test-mode numbers appear in reports?** → No, test-mode numbers are not
  reflected in reports.
- **Are bidding reports shown?** → Google SDK Bidding is not shown in reports;
  MAX and Unity (ironSource) are shown.
- **Is there an API to fetch reports?** → Yes. See `dashboard-and-reporting-api.md`
  (`cms/api-guide/how-to-fetch-reports-from-api.html`).

## app-ads.txt

- **app-ads.txt content** → app-ads.txt is not changed and is always fixed. Your
  company ID is in the application-confirmation email; it can also be checked via
  the inquiry form.

## Block

- **Category-block support** → Request via the block-setting form.
- **Raise the block cap** → Request via the block-setting form.
- **How do "all apps" and "by app" settings apply?** → The all-apps setting plus
  the per-app setting both apply. Example: all-apps = `A`, per-app = `B` — apps
  with a per-app block block `A` and `B`; apps without it block only `A`.
- **Can member-permission users set per-app blocking?** → No. Only the
  Administrator role can configure block settings.

## Impressions not appearing

- **Shown as 0 imp** → When impressions/clicks have 1 or fewer events, 1 imp is
  shown as 0. No revenue impact — it is a display-only 0 imp.
- **No impressions** → See the troubleshooting sections above.

## Mediation

- **Mediation connection methods** → AdMob / Google Ad Manager (GAM):
  `developers.google.com/admob/{ios,android}/mediation/line`. LevelPlay
  (ironSource): see `ironsource-mediation.md`. MAX:
  `support.axon.ai/en/max/mediated-network-guides/sdk-bidder-network-guides#line`.
- **Mediation version & SDK compatibility** → Check each mediation's guide /
  release notes.
- **Connectable mediations** → AdMob, Google Ad Manager (GAM), LevelPlay
  (ironSource), MAX.

## Other

- **Place an ad order (advertise)** → Contact via `https://www.lycbiz.com/jp/contact/`.
- **When does the interstitial close button appear?** → Video: after 5 seconds;
  still image: immediately. (Spec may change.)
- **Video Reward video length** → 15–45-second videos are commonly delivered.
- **SDK version supporting Xcode 26** → For apps built with Xcode 26, supported
  from iOS FiveSDK `v2.9.20250930`.
- **Dashboard manual** → See `https://adsnetwork-docs.linebiz.com/cms/`.

---

# Platform-integration notice (2025-11-05)

Source: `https://adsnetwork-docs.linebiz.com/notice/20251105.html`

"LINE広告" (LINE Ads) and "Yahoo!広告 ディスプレイ広告" are being merged into
"LINEヤフー広告" around **spring 2026**. Accordingly, the ad-placement guidelines
applied separately to "LINE広告ネットワーク" and "Yahoo!広告 ネットワークパートナー"
are being unified, and after the merger will apply commonly to "LINEヤフー広告
ネットワーク" services. Until the merger, the current guidelines continue to apply.

Post-merger guidelines (with supplementary explanatory material):

| Guideline |
|---|
| 統合版_LINEヤフー広告_広告配信ガイドライン (unified Ad Delivery Guidelines) |
| 統合版_LINEヤフー広告_広告実装ガイドライン (unified Ad Implementation Guidelines) |
| 統合版_LINEヤフー広告_トラフィッククオリティガイドライン (unified Traffic Quality Guidelines) |

Effective: around spring 2026 (the exact start date is announced ~2 months
before the new guidelines take effect).
