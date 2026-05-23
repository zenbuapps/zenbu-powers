# Android FiveSDK — Legacy Load API

Source:
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/` (intro)
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/quick-start/install-fivesdk.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/quick-start/setup-manifest.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/quick-start/initialize-sdk.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/ad-formats/{custom-layout,interstitial,video-reward,native}.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/advanced/sound-settings.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/store-release/{check-sheet,app-ads-txt,google-play-data-safety}.html`

> This file covers the **legacy load API** (`loadAdAsync` + `FiveAdLoadListener`).
> For the new AdLoader API (standard from SDK v3.0.0) see `fivesdk-android-adloader.md`.
> For ad-event callbacks see `ad-events.md`.

## Table of contents

- Installation
- AndroidManifest setup
- SDK initialization — `FiveAdConfig`, `FiveAd.initialize`
- Sound settings
- Ad format: Custom Layout
- Ad format: Interstitial
- Ad format: Video Reward
- Ad format: Native
- Pre-release checklist
- app-ads.txt
- Google Play Data safety

---

## Installation

Android FiveSDK supports Android 5.0+ (older v2 releases); from `v3.1.0`,
`minSdkVersion` is 23 and `targetSdkVersion` 36. Latest Android Studio recommended.

Open `build.gradle`, register `mavenCentral` in `repositories`:

```groovy
repositories {
    // ... other repositories
    mavenCentral()
}
```

Add `com.linecorp.adsnetwork:fivead` to `dependencies`:

```groovy
dependencies {
    // ... other libraries
    implementation 'com.linecorp.adsnetwork:fivead:+'
}
```

With `+`, the latest FiveSDK is always used. To pin a version, replace `+` with
an explicit version (see the Maven repository for available versions). **No
ProGuard rules need to be added.**

## AndroidManifest setup

Add this to the activities you use:

```plain
android:hardwareAccelerated="true"
```

Example `AndroidManifest.xml`:

```plain
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="example.app.myapplication">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## SDK initialization

FiveSDK must be initialized once before displaying ads. Initialize at app launch.

### Create `FiveAdConfig`

`FiveAdConfig` holds app-wide settings. Replace `your-app-id` with the registered
App ID.

```kotlin
val config = FiveAdConfig("your-app-id")
```

```java
FiveAdConfig config = new FiveAdConfig("your-app-id");
```

### Test flag

`FiveAdConfig.isTest` — when set, **test ads** are delivered.

```kotlin
config.isTest = true
```

```java
config.isTest = true;
```

### Initialize FiveSDK

After configuring `FiveAdConfig`, initialize. When init completes, ad delivery
becomes possible. `FiveAd.initialize`'s first argument is a `Context`.

```kotlin
FiveAd.initialize(context, config)
```

```java
FiveAd.initialize(context, config);
```

## Sound settings

### App-wide default

Set on `FiveAdConfig` before `FiveAd.initialize`. The SDK-init setting overrides
the Dashboard setting.

```kotlin
val config = FiveAdConfig("your-app-id")
// Enable sound by default app-wide
config.enableSoundByDefault(true)
// Must be set before `FiveAd.initialize`
FiveAd.initialize(this, config)
```

```java
FiveAdConfig config = new FiveAdConfig("your-app-id");
config.enableSoundByDefault(true);
FiveAd.initialize(this, config);
```

### Per-ad-instance

`enableSound` on each ad instance. Overrides the app-wide default; the user's
mute-button operation overrides both.

```kotlin
this.adReward = FiveAdVideoReward(this, "your-slot-id")
this.adReward.enableSound(false)   // OFF
this.adReward.enableSound(true)    // ON
```

```java
this.adReward = new FiveAdVideoReward(this, "your-slot-id");
this.adReward.enableSound(false);
this.adReward.enableSound(true);
```

## Ad format: Custom Layout

`FiveAdCustomLayout` — the most standard format; displays an ad at a specified
position. The first constructor argument is a `Context`. The aspect ratio is
server-side per slot format — the API takes **width only**.

```kotlin
// Prepare
this.adCustomLayout = FiveAdCustomLayout(context, "your-slot-id", width)

// Load — register a FiveAdLoadListener first
this.adCustomLayout.setLoadListener(this)
this.adCustomLayout.loadAdAsync()

// Display — in FiveAdLoadListener.onFiveAdLoad
override fun onFiveAdLoad(fiveAdInterface: FiveAdInterface) {
    this.viewGroup.addView(this.adCustomLayout)
}
```

```java
this.adCustomLayout = new FiveAdCustomLayout(context, "your-slot-id", width);

this.adCustomLayout.setLoadListener(this);
this.adCustomLayout.loadAdAsync();

@Override
public void onFiveAdLoad(FiveAdInterface fiveAdInterface) {
    this.viewGroup.addView(this.adCustomLayout);
}
```

## Ad format: Interstitial

`FiveAdInterstitial` — full-screen ad. First constructor argument is a `Context`.

> NOTE: Interstitial format **cannot** be used for ad slots that grant in-app
> incentives or points. Use Video Reward for that.

```kotlin
this.adInterstitial = FiveAdInterstitial(context, "your-slot-id")

this.adInterstitial.setLoadListener(this)
this.adInterstitial.loadAdAsync()

// Display — call showAd in onFiveAdLoad
override fun onFiveAdLoad(fiveAdInterface: FiveAdInterface) {
    this.adInterstitial.showAd()
}
```

```java
this.adInterstitial = new FiveAdInterstitial(context, "your-slot-id");

this.adInterstitial.setLoadListener(this);
this.adInterstitial.loadAdAsync();

@Override
public void onFiveAdLoad(FiveAdInterface fiveAdInterface) {
    this.adInterstitial.showAd();
}
```

> The `show` method was deprecated in v2.7.20240112 in favour of `showAd`. See
> the migration guide in `fivesdk-android-adloader.md`.

## Ad format: Video Reward

`FiveAdVideoReward` — full-screen video; grants in-app items/points in exchange
for watching. First constructor argument is a `Context`.

```kotlin
// Prepare
this.adReward = FiveAdVideoReward(context, "your-slot-id")

// Load
this.adReward.setLoadListener(this)
this.adReward.loadAdAsync()

// Display
override fun onFiveAdLoad(fiveAdInterface: FiveAdInterface) {
    this.adReward.showAd()
}

// Reward — register a FiveAdVideoRewardEventListener
this.adReward.setEventListener(this)

override fun onReward(fiveAdVideoReward: FiveAdVideoReward) {
    // grant reward
}
```

```java
this.adReward = new FiveAdVideoReward(context, "your-slot-id");

this.adReward.setLoadListener(this);
this.adReward.loadAdAsync();

@Override
public void onFiveAdLoad(FiveAdInterface fiveAdInterface) {
    this.adReward.showAd();
}

this.adReward.setEventListener(this);

@Override
public void onReward(@NonNull FiveAdVideoReward fiveAdVideoReward) {
    // grant reward
}
```

The reward is signalled by `onReward` (on `FiveAdVideoRewardEventListener`).

## Ad format: Native

`FiveAdNative` — fully customizable ad design. First constructor argument is a
`Context`.

> Native format requires **review** before integration. Contact sales.

```kotlin
// Prepare
this.native = FiveAdNative(context, "your-slot-id")

// Load
this.native.setLoadListener(this)
this.native.loadAdAsync()
```

```java
this.native = new FiveAdNative(context, "your-slot-id");

this.native.setLoadListener(this);
this.native.loadAdAsync();
```

### Ad asset APIs

Main ad view (video/still): `getAdMainView`.

Text-content APIs:

| Element | Kotlin | Java |
|---|---|---|
| Click-to-action button text | `buttonText` | `getButtonText()` |
| Ad description | `longDescriptionText` | `getLongDescriptionText()` |
| Advertiser name | `advertiserName` | `getAdvertiserName()` |
| Ad title | `adTitle` | `getAdTitle()` |

Image APIs — `loadInformationIconImageAsync` (info icon `Bitmap`) and
`loadIconImageAsync` (advertiser icon `Bitmap`) take a
`FiveAdNative.LoadImageCallback`, which returns a `Bitmap` on success or `null`
if the image is missing or fails:

```kotlin
fiveAdNative.loadInformationIconImageAsync(object : FiveAdNative.LoadImageCallback {
    override fun onImageLoad(bitmap: Bitmap?) {
        if (bitmap != null) {
            // info icon loaded
        } else {
            // info icon missing or load failed
        }
    }
})

fiveAdNative.loadIconImageAsync(object : FiveAdNative.LoadImageCallback {
    override fun onImageLoad(bitmap: Bitmap?) {
        if (bitmap != null) {
            // advertiser icon loaded
        } else {
            // advertiser icon missing or load failed
        }
    }
})
```

```java
fiveAdNative.loadInformationIconImageAsync(new FiveAdNative.LoadImageCallback() {
    @Override
    public void onImageLoad(@Nullable Bitmap bitmap) {
        if (bitmap != null) {
            // info icon loaded
        } else {
            // info icon missing or load failed
        }
    }
});

fiveAdNative.loadIconImageAsync(new FiveAdNative.LoadImageCallback() {
    @Override
    public void onImageLoad(@Nullable Bitmap bitmap) {
        if (bitmap != null) {
            // advertiser icon loaded
        } else {
            // advertiser icon missing or load failed
        }
    }
});
```

### Register the ad view

After building the ad view, register it with `registerViews`. Arg 1 = the whole
ad view; arg 2 = the info-icon view; arg 3 = the list of views that lead to the
landing page when clicked. Calling `registerViews` makes the SDK route the user
to the landing page when those views are clicked.

```kotlin
private fun createAdViewGroup(fiveAdNative: FiveAdNative): ViewGroup {
    val adViewGroup = FrameLayout(this)
    val adMainView = fiveAdNative.adMainView
    adMainView.layoutParams = videoViewLayoutParams
    adViewGroup.addView(adMainView)
    val description = TextView(this)
    description.text = fiveAdNative.longDescriptionText
    description.layoutParams = descriptionParams
    adViewGroup.addView(description)
    val ctaButton = Button(this)
    val informationIconImageView = ImageView(this)
    fiveAdNative.loadInformationIconImageAsync { bitmap ->
        if (bitmap != null) {
            informationIconImageView.setImageBitmap(bitmap)
        }
    }
    informationIconImageView.layoutParams = informationIconImageViewParams
    adViewGroup.addView(informationIconImageView)
    fiveAdNative.registerViews(adViewGroup, informationIconImageView, Arrays.asList(ctaButton))
    return adViewGroup
}
```

```java
@Nullable private ViewGroup createAdViewGroup(final FiveAdNative fiveAdNative) {
    final FrameLayout adViewGroup = new FrameLayout(this);

    View adMainView = fiveAdNative.getAdMainView();
    adMainView.setLayoutParams(videoViewLayoutParams);
    adViewGroup.addView(adMainView);

    TextView description = new TextView(this);
    description.setText(fiveAdNative.getLongDescriptionText());
    description.setLayoutParams(descriptionParams);
    adViewGroup.addView(description);

    Button ctaButton = new Button(this);
    final ImageView informationIconImageView = new ImageView(this);
    fiveAdNative.loadInformationIconImageAsync(new FiveAdNative.LoadImageCallback() {
        public void onImageLoad(Bitmap bitmap) {
            if (bitmap != null) {
                informationIconImageView.setImageBitmap(bitmap);
            }
        }
    });
    informationIconImageView.setLayoutParams(informationIconImageViewParams);
    adViewGroup.addView(informationIconImageView);

    fiveAdNative.registerViews(adViewGroup, informationIconImageView, Arrays.asList(ctaButton));

    return adViewGroup;
}
```

## Pre-release checklist

### Required

- **Test flag disabled** — verify `FiveAdConfig.isTest`. If `true`, only test
  ads are delivered.

### Recommended

- **Verify impressions** — register a `FiveAdViewEventListener` on the ad object;
  `onFiveAdImpression` fires when an impression is measured. FiveSDK checks
  whether the ad is hidden by other views; the impression event proves correct
  integration. (Note: per-format event listeners introduced in v2.7.20240112
  use `onImpression` — see `ad-events.md`.)

## app-ads.txt

Place an `app-ads.txt` file at the root domain of the developer website
registered in the app store. If another company's `app-ads.txt` already exists,
**append** LY Ads Network's content. Contact sales for the exact content. Spec:
IAB manual.

## Google Play Data safety

Since April 2022, publishing/updating an app on Google Play requires disclosing
the data usage of the **entire app** (including bundled SDKs).

### Data automatically collected & shared

FiveSDK collects and shares the following data for ad delivery, analytics, and
fraud prevention:

| Data | Content |
|---|---|
| Other personal info (language) | Collects the user's language |
| IP address | Collects the device IP address; may be used to estimate coarse location |
| User interaction with the service | Collects interaction counts and info (app launches, taps, video views etc.) |
| Diagnostic info | Collects app/SDK performance info (display size, network environment, network speed etc.) |
| Device & account identifiers | Collects the Android advertising ID and the instance ID |

### Data handling

Collecting the Android advertising ID is optional. Users can reset or delete the
ad ID via the ad-ID control in the Android Settings menu. App developers can opt
out of collecting the ad ID by updating the app's manifest file.
