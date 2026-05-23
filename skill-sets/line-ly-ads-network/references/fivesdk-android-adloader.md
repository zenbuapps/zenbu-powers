# Android FiveSDK — AdLoader API & Migration Guides

Source:
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/ad-loader/prepare-ad-loader.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/ad-loader/{custom-layout,interstitial,video-reward,native}.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/ad-loader-api-migration.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-api-change.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-new-ad-events.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-fullscreen-showad.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-long-description.html`

> The **AdLoader API** is supported from Android FiveSDK `v2.9.20241129` and is
> the **standard from v3.0.0** (the legacy load API is deprecated in v3.0.0).
> New integrations should use AdLoader. For the legacy API see
> `fivesdk-android.md`; for ad-event callbacks see `ad-events.md`.

## Table of contents

- Obtaining `AdLoader`
- AdLoader format: Custom Layout
- AdLoader format: Interstitial
- AdLoader format: Video Reward
- AdLoader format: Native
- Migration guide: legacy load API → AdLoader API
- Migration guide: v2.7.20240112 API change overview
- Migration guide: v2.7.20240112 ad-event API change
- Migration guide: v2.7.20240112 `show` → `showAd`
- Migration guide: v2.7.20240112 `getLongDescriptionText`

---

## Obtaining `AdLoader`

The AdLoader API merges SDK init and ad loading into one API. First get an
`AdLoader` instance.

### Create `FiveAdConfig`

```kotlin
val config = FiveAdConfig("your-app-id")
```

```java
FiveAdConfig config = new FiveAdConfig("your-app-id");
```

### Test flag

```kotlin
config.isTest = true
```

```java
config.isTest = true;
```

### Get the `AdLoader`

`AdLoader.forConfig`'s first argument is an `android.content.Context`. A `null`
return indicates an error.

```kotlin
val adLoader: AdLoader? = AdLoader.forConfig(context, config)
if (adLoader == null) {
    // error handling
}
```

```java
AdLoader adLoader = AdLoader.forConfig(context, config);
if (adLoader == null) {
    // error handling
}
```

The `AdLoader` instance is cached internally — the same config returns the same
instance. Because thread-safety has a cost, keep the obtained instance.

> TIP (v2.9.20250718+): the SDK allows multiple `AdLoader` instances for
> different configs. Currently only useful for testing; the design anticipates
> future updates.

Init failure only happens in rare cases (e.g. failing to allocate the SDK's
storage), **not** for communication failure. A failed init has almost no chance
on retry — no retry handling needed.

## AdLoader format: Custom Layout

Load `FiveAdCustomLayout`. Specify the slot ID via `AdSlotConfig`. The `AdLoader`
signals load success/failure through `AdLoader.LoadBannerAdCallback`.

```kotlin
adLoader.loadBannerAd(
    AdSlotConfig("your-slot-id"),
    width,
    object : AdLoader.LoadBannerAdCallback {
        override fun onLoad(fiveAdCustomLayout: FiveAdCustomLayout) {
            this.viewGroup.addView(fiveAdCustomLayout)
        }

        override fun onError(fiveAdErrorCode: FiveAdErrorCode) {
            // load failure handling
        }
    })
```

```java
adLoader.loadBannerAd(
    new AdSlotConfig("your-slot-id"),
    width,
    new LoadBannerAdCallback() {
        @Override
        public void onLoad(@NonNull FiveAdCustomLayout fiveAdCustomLayout) {
            this.viewGroup.addView(fiveAdCustomLayout);
        }

        @Override
        public void onError(@NonNull FiveAdErrorCode fiveAdErrorCode) {
            // load failure handling
        }
    });
```

The aspect ratio is server-side; pass width only. Add the `FiveAdCustomLayout`
returned in `onLoad` to a view to display it.

## AdLoader format: Interstitial

The `AdLoader` signals via `AdLoader.LoadInterstitialAdCallback`.

```kotlin
adLoader.loadInterstitialAd(
    AdSlotConfig("your-slot-id"),
    object : AdLoader.LoadInterstitialAdCallback {
        override fun onLoad(fiveAdInterstitial: FiveAdInterstitial) {
            fiveAdInterstitial.showAd()
        }

        override fun onError(fiveAdErrorCode: FiveAdErrorCode) {
            // load failure handling
        }
    })
```

```java
adLoader.loadInterstitialAd(
    new AdSlotConfig("your-slot-id"),
    new LoadInterstitialAdCallback() {
        @Override
        public void onLoad(@NonNull FiveAdInterstitial fiveAdInterstitial) {
            fiveAdInterstitial.showAd();
        }

        @Override
        public void onError(@NonNull FiveAdErrorCode errorCode) {
            // load failure handling
        }
    });
```

Call `showAd` on the `FiveAdInterstitial` passed to `onLoad` to display
full-screen.

## AdLoader format: Video Reward

The `AdLoader` signals via `AdLoader.LoadRewardAdCallback`.

```kotlin
adLoader.loadRewardAd(
    AdSlotConfig("your-slot-id"),
    object : AdLoader.LoadRewardAdCallback {
        override fun onLoad(fiveAdVideoReward: FiveAdVideoReward) {
            fiveAdVideoReward.showAd()
        }

        override fun onError(fiveAdErrorCode: FiveAdErrorCode) {
            // load failure handling
        }
    })
```

```java
adLoader.loadRewardAd(
    new AdSlotConfig("your-slot-id"),
    new LoadRewardAdCallback() {
        @Override
        public void onLoad(@NonNull FiveAdVideoReward fiveAdVideoReward) {
            fiveAdVideoReward.showAd();
        }

        @Override
        public void onError(@NonNull FiveAdErrorCode fiveAdErrorCode) {
            // load failure handling
        }
    });
```

Register a `FiveAdVideoRewardEventListener` via `setEventListener` to receive
events. When the user watches enough of the video, `onReward` is called — grant
the reward there. Other `FiveAdVideoRewardEventListener` callbacks: see
`ad-events.md`.

```kotlin
fiveAdVideoReward.setEventListener(object : FiveAdVideoRewardEventListener {
    override fun onReward(fiveAdVideoReward: FiveAdVideoReward) {
        // grant reward
    }
    // other FiveAdVideoRewardEventListener methods
})
```

```java
fiveAdVideoReward.setEventListener(new FiveAdVideoRewardEventListener() {
    @Override
    public void onReward(@NonNull FiveAdVideoReward fiveAdVideoReward) {
        // grant reward
    }
    // other FiveAdVideoRewardEventListener methods
});
```

## AdLoader format: Native

> Native format requires **review** before integration — contact sales.

The `AdLoader` signals via `AdLoader.LoadNativeAdCallback`.

```kotlin
adLoader.loadNativeAd(
    AdSlotConfig("your-slot-id"),
    adMainAssetWidth,
    object : AdLoader.LoadNativeAdCallback {
        override fun onLoad(fiveAdNative: FiveAdNative) {
            // load success handling
        }

        override fun onError(fiveAdErrorCode: FiveAdErrorCode) {
            // load failure handling
        }
    })
```

```java
adLoader.loadNativeAd(
    new AdSlotConfig("your-slot-id"),
    adMainAssetWidth,
    new AdLoader.LoadNativeAdCallback() {
        @Override
        public void onLoad(@NonNull FiveAdNative nativeAd) {
            // load success handling
        }

        @Override
        public void onError(@NonNull FiveAdErrorCode errorCode) {
            // load failure handling
        }
    });
```

Ad asset APIs are identical to the legacy native ad — see `fivesdk-android.md`:
`getAdMainView`, `getButtonText`/`buttonText`, `getLongDescriptionText`/
`longDescriptionText`, `getAdvertiserName`/`advertiserName`, `getAdTitle`/
`adTitle`, `loadInformationIconImageAsync`, `loadIconImageAsync`, `registerViews`.

ViewBinding example for the native ad view:

```kotlin
private fun fillNativeAd(activity: Activity, fiveAdNative: FiveAdNative) {
    val nativeAdBinding = NativeAdBinding.inflate(activity.layoutInflater)

    nativeAdBinding.adMainViewHolder.addView(fiveAdNative.adMainView)
    nativeAdBinding.descriptionTextView.text = fiveAdNative.longDescriptionText
    nativeAdBinding.ctaButton.text = fiveAdNative.buttonText

    fiveAdNative.loadInformationIconImageAsync { informationBitmap: Bitmap? ->
        if (informationBitmap != null) {
            nativeAdBinding.informationIconButton.setImageBitmap(informationBitmap)
        }
    }

    fiveAdNative.registerViews(
        nativeAdBinding.root,
        nativeAdBinding.informationIconButton,
        listOf(nativeAdBinding.ctaButton)
    )

    activity.setContentView(nativeAdBinding.root)
}
```

```java
private void fillNativeAd(@NonNull Activity activity, @NonNull FiveAdNative fiveAdNative) {
    NativeAdBinding nativeAdBinding = NativeAdBinding.inflate(activity.getLayoutInflater());

    nativeAdBinding.adMainViewHolder.addView(fiveAdNative.getAdMainView());
    nativeAdBinding.descriptionTextView.setText(fiveAdNative.getLongDescriptionText());
    nativeAdBinding.ctaButton.setText(fiveAdNative.getButtonText());

    fiveAdNative.loadInformationIconImageAsync(informationBitmap -> {
        if (informationBitmap != null) {
            nativeAdBinding.informationIconButton.setImageBitmap(informationBitmap);
        }
    });

    fiveAdNative.registerViews(
        nativeAdBinding.getRoot(),
        nativeAdBinding.informationIconButton,
        List.of(nativeAdBinding.ctaButton)
    );

    activity.setContentView(nativeAdBinding.getRoot());
}
```

---

# Migration guide: legacy load API → AdLoader API

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/ad-loader-api-migration.html`

For Android FiveSDK v3.0.0+, the AdLoader API becomes standard and the legacy
SDK-init and ad-load APIs are deprecated.

## SDK initialization

Legacy — register `FiveAdConfig` with `FiveAd`:

```kotlin
FiveAd.initialize(context, config)
```

AdLoader — get an `AdLoader` for the `FiveAdConfig` (this performs init):

```kotlin
val adLoader: AdLoader? = AdLoader.forConfig(context, config)
if (adLoader == null) {
    // error handling
}
```

```java
AdLoader adLoader = AdLoader.forConfig(context, config);
if (adLoader == null) {
    // error handling
}
```

Init failure only happens in rare cases (e.g. SDK storage allocation failure),
not communication failure — no retry handling needed.

## Ad-load procedure

| Legacy | AdLoader |
|---|---|
| Create ad object | Create `AdSlotConfig` |
| Register `FiveAdLoadListener` | — |
| Call `loadAdAsync` | Call an `AdLoader` load function |
| Receive load success in `onFiveAdLoad` | Receive the loaded ad object in the callback |

Per-format `AdLoader` load functions:

| Format | Kotlin | Java |
|---|---|---|
| Custom Layout | `loadBannerAd(config: AdSlotConfig, initialWidth: Int, callback: LoadBannerAdCallback)` | `loadBannerAd(@NonNull AdSlotConfig config, int initialWidth, @NonNull LoadBannerAdCallback callback)` |
| Video Reward | `loadRewardAd(config: AdSlotConfig, callback: LoadRewardAdCallback)` | `loadRewardAd(@NonNull AdSlotConfig config, @NonNull LoadRewardAdCallback callback)` |
| Interstitial | `loadInterstitialAd(config: AdSlotConfig, callback: LoadInterstitialAdCallback)` | `loadInterstitialAd(@NonNull AdSlotConfig config, @NonNull LoadInterstitialAdCallback callback)` |
| Native | `loadNativeAd(config: AdSlotConfig, initialWidth: Int, callback: LoadBannerAdCallback)` | `loadNativeAd(@NonNull AdSlotConfig config, int initialWidth, @NonNull LoadBannerAdCallback callback)` |

### Custom Layout migration example

Legacy:

```kotlin
class MyActivity : Activity(), FiveAdLoadListener {
    private lateinit var fiveAdCustomLayoutHolder: FrameLayout
    private var fiveAdCustomLayout: FiveAdCustomLayout? = null

    private fun loadFiveAdCustomLayout() {
        fiveAdCustomLayout = FiveAdCustomLayout(this,"your-slot-id", 120)
        fiveAdCustomLayout?.setLoadListener(this)
        fiveAdCustomLayout?.loadAdAsync()
    }

    override fun onFiveAdLoad(fiveAdInterface: FiveAdInterface) {
        val fiveAdCustomLayout: FiveAdCustomLayout = this.fiveAdCustomLayout ?: return
        fiveAdCustomLayoutHolder.removeAllViews()
        fiveAdCustomLayoutHolder.addView(fiveAdCustomLayout)
    }

    override fun onFiveAdLoadError(fiveAdInterface: FiveAdInterface, fiveAdErrorCode: FiveAdErrorCode) {
        Log.e(this::class.simpleName, "onFiveAdLoadError: $fiveAdErrorCode")
        this.fiveAdCustomLayout = null;
    }
}
```

AdLoader (loader pre-initialized), final form:

```kotlin
class MyActivity : Activity() {
    private lateinit var fiveAdCustomLayoutHolder: FrameLayout
    private var adLoader: AdLoader? = null

    private fun loadFiveAdCustomLayout() {
        val adSlotConfig = AdSlotConfig("your-slot-id")
        adLoader?.loadBannerAd(adSlotConfig, 120, object : AdLoader.LoadBannerAdCallback {
            override fun onLoad(fiveAdCustomLayout: FiveAdCustomLayout) {
                onLoadSucceeded(fiveAdCustomLayout)
            }

            override fun onError(fiveAdErrorCode: FiveAdErrorCode) {
                onLoadFailure(fiveAdErrorCode)
            }
        })
    }

    private fun onLoadSucceeded(fiveAdCustomLayout: FiveAdCustomLayout) {
        fiveAdCustomLayoutHolder.removeAllViews()
        fiveAdCustomLayoutHolder.addView(fiveAdCustomLayout)
    }

    private fun onLoadFailure(fiveAdErrorCode: FiveAdErrorCode) {
        Log.e(this::class.simpleName, "onLoadFailure: $fiveAdErrorCode")
    }
}
```

```java
public class MyActivity extends Activity {
    @NonNull
    private FrameLayout fiveAdCustomLayoutHolder;

    @Nullable
    private AdLoader adLoader = null;

    private void loadFiveAdCustomLayout() {
        AdLoader adLoader = this.adLoader;
        if (adLoader == null) {
            return;
        }

        AdSlotConfig adSlotConfig = new AdSlotConfig("your-slot-id");
        adLoader.loadBannerAd(adSlotConfig, 120, new AdLoader.LoadBannerAdCallback() {
            @Override
            public void onLoad(@NonNull FiveAdCustomLayout fiveAdCustomLayout) {
                onLoadSucceeded(fiveAdCustomLayout);
            }

            @Override
            public void onError(@NonNull FiveAdErrorCode fiveAdErrorCode) {
                onLoadFailure(fiveAdErrorCode);
            }
        });
    }

    private void onLoadSucceeded(@NonNull FiveAdCustomLayout fiveAdCustomLayout) {
        fiveAdCustomLayoutHolder.removeAllViews();
        fiveAdCustomLayoutHolder.addView(fiveAdCustomLayout);
    }

    private void onLoadFailure(@NonNull FiveAdErrorCode fiveAdErrorCode) {
        Log.e(MyActivity.class.getSimpleName(), "onFiveAdLoadError: " + fiveAdErrorCode.name());
    }
}
```

Key migration notes: `FiveAdLoadListener` is gone — replaced by the callback;
use the ad object returned by the callback (not `this.fiveAdCustomLayout`); code
registered with `setEventListener` can be reused unchanged.

---

# Migration guide: v2.7.20240112 API change overview

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-api-change.html`

Android FiveSDK v2.7.20240112 made three API changes:
1. The ad-event acquisition method changed.
2. `show` on Video Reward and Interstitial was deprecated and replaced by `showAd`.
3. `FiveAdNative` gained a method to get a more accurate ad description.

---

# Migration guide: v2.7.20240112 ad-event API change

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-new-ad-events.html`

v2.7.20240112 introduced per-format callback interfaces (instead of one shared
interface) and a Video Reward reward-grant event.

> NOTE: `FiveAdLoadListener` (load completion) needs no migration work.

The legacy `FiveAdViewEventListener` (registered via `setViewEventListener`) is
replaced by per-format event listeners registered via `setEventListener`. See
`ad-events.md` for the full new callback set.

### Custom Layout — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `onFiveAdViewError` | `onViewError` |
| Impression | both | `onFiveAdImpression` | `onImpression` |
| Click | both | `onFiveAdClick` | `onClick` |
| View removal | both | `onFiveAdClose` | `onRemove` |
| Play start | video only | `onFiveAdStart` | `onPlay` |
| Pause | video only | `onFiveAdPause` | `onPause` |
| Play complete | video only | `onFiveAdViewThrough` | `onViewThrough` |
| Play resume | video only | `onFiveAdResume` | removed (merged into `onPlay`) |
| Replay | video only | `onFiveAdReplay` | removed (merged into `onPlay`) |
| Stall | video only | `onFiveAdStall` | removed |
| Stall recover | video only | `onFiveAdRecover` | removed |

After (new API) — Custom Layout:

```kotlin
val fiveAdCustomLayout = FiveAdCustomLayout(context, "your-slot-id", 120)
fiveAdCustomLayout.setEventListener(object : FiveAdCustomLayoutEventListener {
    override fun onViewError(fiveAdCustomLayout: FiveAdCustomLayout, fiveAdErrorCode: FiveAdErrorCode) { }
    override fun onImpression(fiveAdCustomLayout: FiveAdCustomLayout) { }
    override fun onClick(fiveAdCustomLayout: FiveAdCustomLayout) { }
    override fun onRemove(fiveAdCustomLayout: FiveAdCustomLayout) { }
    override fun onPlay(fiveAdCustomLayout: FiveAdCustomLayout) { }
    override fun onPause(fiveAdCustomLayout: FiveAdCustomLayout) { }
    override fun onViewThrough(fiveAdCustomLayout: FiveAdCustomLayout) { }
})
```

### Video Reward — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `onFiveAdViewError` | `onViewError` |
| Reward | both | none (merged into `onFiveAdClose`) | `onReward` |
| Impression | both | `onFiveAdImpression` | `onImpression` |
| Click | both | `onFiveAdClick` | `onClick` |
| Full-screen open | both | none | `onFullScreenOpen` |
| Full-screen close | both | `onFiveAdClose` | `onFullScreenClose` |
| Play start | video only | `onFiveAdStart` | `onPlay` |
| Pause | video only | `onFiveAdPause` | `onPause` |
| Play complete | video only | `onFiveAdViewThrough` | `onViewThrough` |
| Play resume / Replay / Stall / Stall recover | video only | `onFiveAdResume` etc. | removed (resume/replay merged into `onPlay`) |

### Interstitial — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `onFiveAdViewError` | `onViewError` |
| Impression | both | `onFiveAdImpression` | `onImpression` |
| Click | both | `onFiveAdClick` | `onClick` |
| Full-screen open | both | none | `onFullScreenOpen` |
| Full-screen close | both | `onFiveAdClose` | `onFullScreenClose` |
| Play start | video only | `onFiveAdStart` | `onPlay` |
| Pause | video only | `onFiveAdPause` | `onPause` |
| Play complete | video only | `onFiveAdViewThrough` | `onViewThrough` |
| Play resume / Replay / Stall / Stall recover | video only | `onFiveAdResume` etc. | removed |

### Native — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `onFiveAdViewError` | `onViewError` |
| Impression | both | `onFiveAdImpression` | `onImpression` |
| Click | both | `onFiveAdClick` | `onClick` |
| View removal | both | `onFiveAdClose` | `onRemove` |
| Play start | video only | `onFiveAdStart` | `onPlay` |
| Pause | video only | `onFiveAdPause` | `onPause` |
| Play complete | video only | `onFiveAdViewThrough` | `onViewThrough` |
| Play resume / Replay / Stall / Stall recover | video only | `onFiveAdResume` etc. | removed |

## Reward-grant event (Video Reward)

The legacy API recommended granting reward on the ad-close event. The new API
provides an independent reward-grant event — use it instead.

Before (legacy):

```kotlin
override fun onFiveAdClose(fiveAdInterface: FiveAdInterface) {
    if (fiveAdInterface.state != FiveAdState.ERROR) {
        // grant reward
    }
}
```

```java
@Override
public void onFiveAdClose(@NonNull FiveAdInterface fiveAdInterface) {
    if (fiveAdInterface.getState() != FiveAdState.ERROR) {
        // grant reward
    }
}
```

After (new):

```kotlin
override fun onReward(fiveAdVideoReward: FiveAdVideoReward) {
    // grant reward
}
```

```java
@Override
public void onReward(@NonNull FiveAdVideoReward fiveAdVideoReward) {
    // grant reward
}
```

---

# Migration guide: v2.7.20240112 `show` → `showAd`

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-fullscreen-showad.html`

In v2.7.20240112 the `show` method (Video Reward, Interstitial) was deprecated
and replaced by `showAd`.

Steps:
1. Move the show success/failure handling into callback methods —
   `onFullScreenOpen` for success, `onViewError` for failure. The new `show`
   always returns `true` regardless of success, so handling must move to
   callbacks.
2. Replace `show` with `showAd`.

### Video Reward migration

Before (legacy):

```kotlin
val fiveAdVideoReward = FiveAdVideoReward(context, "slot-id")

if (fiveVideoReward.show()) {
    // shown successfully
} else {
    // show failed
}
```

After (new):

```kotlin
val fiveAdVideoReward = FiveAdVideoReward(context, "slot-id")

fiveAdVideoReward.setEventListener(object : FiveAdVideoRewardEventListener {
    override fun onFullScreenOpen(FiveAdVideoReward: FiveAdVideoReward) {
        // shown successfully
    }
    override fun onViewError(FiveAdVideoReward: FiveAdVideoReward, fiveAdErrorCode: FiveAdErrorCode) {
        // show failed
    }
})

fiveAdVideoReward.showAd()
```

```java
FiveAdVideoReward fiveAdVideoReward = new FiveAdVideoReward(context, "slot-id");

fiveAdVideoReward.setEventListener(new FiveAdVideoRewardEventListener() {
    @Override
    public void onFullScreenOpen(@NonNull FiveAdVideoReward fiveAdVideoReward) {
        // shown successfully
    }

    @Override
    public void onViewError(@NonNull FiveAdVideoReward fiveAdVideoReward, @NonNull FiveAdErrorCode fiveAdErrorCode) {
        // show failed
    }
});

fiveAdVideoReward.showAd();
```

### Interstitial migration

Before (legacy):

```kotlin
val fiveAdInterstitial = FiveAdInterstitial(context, "slot-id")

if (fiveAdInterstitial.show()) {
    // shown successfully
} else {
    // show failed
}
```

After (new):

```kotlin
val fiveAdInterstitial = FiveAdInterstitial(context, "slot-id")

fiveAdInterstitial.setEventListener(object : FiveAdInterstitialEventListener {
    override fun onFullScreenOpen(fiveAdInterstitial: FiveAdInterstitial) {
        // shown successfully
    }
    override fun onViewError(fiveAdInterstitial: FiveAdInterstitial, fiveAdErrorCode: FiveAdErrorCode) {
        // show failed
    }
})

fiveAdInterstitial.showAd()
```

```java
FiveAdInterstitial fiveAdInterstitial = new FiveAdInterstitial(context, "slot-id");

fiveAdInterstitial.setEventListener(new FiveAdInterstitialEventListener() {
    @Override
    public void onFullScreenOpen(@NonNull FiveAdInterstitial fiveAdInterstitial) {
        // shown successfully
    }

    @Override
    public void onViewError(@NonNull FiveAdInterstitial fiveAdInterstitial, @NonNull FiveAdErrorCode fiveAdErrorCode) {
        // show failed
    }
});

fiveAdInterstitial.showAd();
```

---

# Migration guide: v2.7.20240112 `getLongDescriptionText`

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-android/migration-guide/20240112-long-description.html`

The legacy API got the ad description from a native ad via `getDescriptionText`.
v2.7.20240112 adds `getLongDescriptionText`, which (due to the delivery system)
yields a more accurate ad description. Use `getLongDescriptionText` going forward.

> NOTE: `getDescriptionText` is not scheduled for removal — it can still be used
> without error.

Before (legacy):

```kotlin
val description = TextView(this)
description.text = fiveAdNative.descriptionText
```

```java
TextView description = new TextView(this);
description.setText(fiveAdNative.getDescriptionText());
```

After (new):

```kotlin
val description = TextView(this)
description.text = fiveAdNative.longDescriptionText // new API
```

```java
TextView description = new TextView(this);
description.setText(fiveAdNative.getLongDescriptionText()); // new API
```
