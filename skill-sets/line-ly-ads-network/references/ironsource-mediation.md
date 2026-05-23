# ironSource / LevelPlay Mediation

Source:
- `https://adsnetwork-docs.linebiz.com/ironsource-mediation/` (intro)
- `https://adsnetwork-docs.linebiz.com/ironsource-mediation/quick-start/installation-ios.html`
- `https://adsnetwork-docs.linebiz.com/ironsource-mediation/quick-start/installation-android.html`
- `https://adsnetwork-docs.linebiz.com/ironsource-mediation/mediation-settings/`
- `https://adsnetwork-docs.linebiz.com/ironsource-mediation/trouble-shooting/check-list.html`
- `https://adsnetwork-docs.linebiz.com/ironsource-mediation/release-notes/{ios-plugin,android-plugin}.html`

Integration guide for calling FiveSDK through **ironSource (LevelPlay)**
mediation. The mediation adapter wraps FiveSDK; the ironSource SDK is assumed
already integrated.

> Ad Quality SDK caveat: when also using the **ironSource Ad Quality SDK**, you
> must use a FiveSDK version at or below the "Supported SDK version" registered
> at `https://developers.is.com/ironsource-mobile/android/supported-ad-sources/`.
> An unregistered FiveSDK version causes a runtime error.

## Table of contents

- iOS adapter installation
- Android adapter installation
- ironSource Dashboard configuration
- Troubleshooting checklist
- iOS plugin release notes & SDK-compatibility matrix
- Android plugin release notes & SDK-compatibility matrix

---

## iOS adapter installation

### CocoaPods (recommended)

Add to your app target's `Podfile`:

```ruby
pod 'LineAdsNetworkIronSourceAdapter'
```

Then run:

```bash
pod install
```

### Manual

The ironSource SDK is assumed already integrated.

1. Integrate FiveSDK per the iOS install guide (see `fivesdk-ios.md`).
2. Download the mediation-adapter zip, unzip, and add
   `LineAdsNetworkIronSourceAdapter.xcframework` to the project.

## Android adapter installation

Open `build.gradle`, register `mavenCentral` in `repositories`:

```groovy
repositories {
    // ... other repositories
    mavenCentral()
}
```

Add both `com.linecorp.adsnetwork:fivead` and
`com.linecorp.adsnetwork:ironsource-adapter` to `dependencies`:

```groovy
dependencies {
    // ... other libraries
    implementation 'com.linecorp.adsnetwork:fivead:+'
    implementation 'com.linecorp.adsnetwork:ironsource-adapter:+'
}
```

With `+`, the latest FiveSDK and adapter are always used. To pin versions,
replace `+` with explicit versions (see the FiveSDK Maven repository and the
mediation-adapter Maven repository).

## ironSource Dashboard configuration

Refer also to the ironSource usage guides for Android and iOS.

### Register the custom adapter

1. In the ironSource Dashboard, go to the **[SDK Networks]** page and click
   **[Manage Networks]**, then select **[Custom Adapter]**.
2. In the **Network Key** field, enter Line Ads Network's Network Key:
   **`15bbe6b05`**.
3. For **Reported Revenue**, select **Rate based revenue** and create the custom
   adapter. (Line Ads Network does not support the Reporting API.)

### Configure the custom adapter

In the ironSource Dashboard [SDK Networks] page, select the app to register Line
Ads Network for, and press Line Ads Network's **Setup** button.

Line Ads Network settings:

| Setting | Value |
|---|---|
| `is_test` | Enter `false` to deliver production ads, `true` to deliver test ads. |
| `app_id` | Enter the app ID. |
| `slot_id` | Enter the slot ID per format, per ad unit. |

## Troubleshooting checklist

First, confirm the ironSource SDK works correctly **without** LINE ad mediation.
If there is a problem with LINE ad mediation, check:

- Is LINE ad mediation enabled in the ironSource Dashboard?
- Is the custom-event eCPM not set extremely low in the ironSource Dashboard?
- Are the `app_id`, `slot_id`, and `is_test` flag format entered in the
  ironSource Dashboard correct?
- Run `IronSource.setAdapterDebug(true)` — does a LINE-ad-mediation-adapter error
  message appear?

If none of these is the problem, see the iOS / Android FiveSDK troubleshooting
(`troubleshooting-and-faq.md`).

---

## iOS plugin release notes & SDK-compatibility matrix

| Plugin version | FiveSDK | ironSource SDK | Notes |
|---|---|---|---|
| v1.5.0 (2026-02-03) | 3.0.0+ | 9.0.0+ | Supports FiveSDK 3.0.0 (dependency-version fix only) |
| v1.4.0 (2026-01-13) | 2.9.20241105+ | 9.0.0+ | Supports ironSource SDK 9.0.0; supports FiveSDK AdLoader API |
| v1.2.0 (2024-05-28) | 2.7.20240318+ | 8.0.0+ | Supports ironSource SDK 8.0.0 |
| v1.1.0 (2024-04-11) | 2.7+ | 7.7+ | Supports FiveSDK new API; updated libraries |
| v1.0.1 (2022-10-25) | 2.4.20220722+ | 7.2.4+ | Fixed: showing Interstitial/Rewarded Video from a non-main thread failed |
| v1.0.0 (2022-09-06) | 2.4.20220722+ | 7.2.4+ | Published the iOS plugin; supports Interstitial & Rewarded Video formats |

## Android plugin release notes & SDK-compatibility matrix

| Plugin version | FiveSDK | ironSource SDK | Notes |
|---|---|---|---|
| v1.4.0 (2026-01-13) | 2.9.20250519+ | 9.0.0+ | Supports ironSource SDK 9.0.0; uses FiveSDK AdLoader API |
| v1.3.0 (2025-02-21) | 2.9.20250110+ | 8.6.1+ | Supports ironSource SDK 8.6.1; builds without error when app depends on `com.unity3d.ads-mediation:mediation-sdk`; removed explicit dependency on `com.ironsource.sdk:mediationsdk` and `org.jetbrains:annotations`; `minSdk` raised to 19, `compileSdk` to 35 |
| v1.2.0 (2024-05-28) | 2.7.20240515+ | 8.0.0+ | Supports ironSource SDK 8.0.0 |
| v1.1.0 (2023-04-17) | 2.6.20230215+ | 7.3.0.1+ | Supports ironSource SDK 7.3.0.1 |
| v1.0.1 (2022-10-25) | 2.4.20220617+ | 7.2.4+ | Fixed: crash when showing Interstitial/Rewarded Video from a non-main thread |
| v1.0.0 (2022-09-06) | 2.4.20220617+ | 7.2.4+ | Published the Android plugin; supports Interstitial & Rewarded Video formats |

> The ironSource mediation plugin supports only the **Interstitial** and
> **Rewarded Video** formats (not Custom Layout / Native).
