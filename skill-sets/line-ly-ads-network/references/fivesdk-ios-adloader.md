# iOS FiveSDK — AdLoader API & Migration Guides

Source:
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/ad-loader/prepare-ad-loader.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/ad-loader/{custom-layout,interstitial,video-reward,native}.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/migration-guide/ad-loader-api-migration.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/migration-guide/20231115-new-ad-events.html`

> The **AdLoader API** is supported from iOS FiveSDK `v2.9.20241105` and is the
> **standard from v3.0.0** (the legacy load API is deprecated in v3.0.0). New
> integrations should use AdLoader. For the legacy API see `fivesdk-ios.md`; for
> ad-event callbacks see `ad-events.md`.

## Table of contents

- Obtaining `FADAdLoader`
- AdLoader format: Custom Layout
- AdLoader format: Interstitial
- AdLoader format: Video Reward
- AdLoader format: Native
- Migration guide: legacy load API → AdLoader API
- Migration guide: 20231115 ad-event API change

---

## Obtaining `FADAdLoader`

The AdLoader API merges SDK init and ad loading into one API. To use it, first
get a `FADAdLoader` instance.

### Create `FADConfig`

```swift
let config: FADConfig = FADConfig(appId: "your-app-id")
```

```objc
FADConfig* config = [[FADConfig alloc] initWithAppId:@"your-app-id"];
```

### Test flag

```swift
config.isTest = true
```

```objc
config.isTest = YES;
```

### Get the `FADAdLoader`

Obtaining the loader performs SDK initialization.

```swift
do {
    let adLoader: FADAdLoader = try FADAdLoader(for: config)
} catch {
    // error handling
}
```

```objc
NSError* error = nil;
FADAdLoader* adLoader = [FADAdLoader adLoaderForConfig:config outError:&error];
if (error) {
    // error handling
}
```

The `FADAdLoader` instance is cached internally by the SDK — the same config
returns the same instance. Because thread-safety has a cost, keep the obtained
instance rather than re-fetching.

> TIP (v2.9.20250507+): the SDK is designed to allow multiple `FADAdLoader`
> instances for different configs. Currently this is only useful for testing
> (one app does not get multiple App IDs); the design anticipates future updates.

The initialization fails only in rare cases (e.g. failing to allocate the SDK's
storage), **not** for reasons like communication failure. A failed init has
almost no chance of succeeding on retry — no retry handling is needed.

## AdLoader format: Custom Layout

Load `FADAdViewCustomLayout`. The aspect ratio is server-side; the API takes
width only.

```swift
let slotConfig = FADAdSlotConfig(slotId: "your-slot-id")
adLoader.loadBannerAd(with: slotConfig, withInitialWidth: Double(120)) { ad, error in
    if let error = error {
        // load failure handling
    } else {
        self.view.addSubview(ad!)
    }
}
```

```objc
FADAdSlotConfig* slotConfig = [FADAdSlotConfig configWithSlotId:@"your-slot-id"];
[adLoader loadBannerAdWithConfig:slotConfig withInitialWidth:120 withLoadCallback:^(FADAdViewCustomLayout* ad, NSError* error) {
    if (error) {
        // load failure handling
    } else {
        [self.view addSubview:ad];
    }
}];
```

The load callback receives `ad` (`FADAdViewCustomLayout`) and `error` (`NSError`).
On success `ad` is set and `error` is `nil`; on failure `ad` is `nil`.

## AdLoader format: Interstitial

```swift
let slotConfig = FADAdSlotConfig(slotId: "your-slot-id")
adLoader.loadInterstitialAd(with: slotConfig) { ad, error in
    if let error = error {
        // load failure handling
    } else {
        ad?.show(with: self)
    }
}
```

```objc
FADAdSlotConfig* slotConfig = [FADAdSlotConfig configWithSlotId:@"your-slot-id"];
[adLoader loadInterstitialAdWithConfig:slotConfig withLoadCallback:^(FADInterstitial* ad, NSError* error) {
    if (error) {
        // load failure handling
    } else {
        [ad showWithViewController:self];
    }
}];
```

`show` takes the current `UIViewController`; `nil` is allowed (auto-search, with
the wrong-window caveat for external displays).

## AdLoader format: Video Reward

```swift
let slotConfig = FADAdSlotConfig(slotId: "your-slot-id")
adLoader.loadRewardAd(with: slotConfig) { ad, error in
    if let error = error {
        // load failure handling
    } else {
        ad?.setEventListener(self)
        ad?.show(with: self)
    }
}

func fiveVideoRewardAdDidReward(_ ad: FADVideoReward) {
    // grant reward
}
```

```objc
FADAdSlotConfig* slotConfig = [FADAdSlotConfig configWithSlotId:@"your-slot-id"];
[adLoader loadRewardAdWithConfig:slotConfig withLoadCallback:^(FADVideoReward* ad, NSError* error) {
    if (error) {
        // load failure handling
    } else {
        [ad setEventListener:self];
        [ad showWithViewController:self];
    }
}];

- (void) fiveVideoRewardAdDidReward:(nonnull FADVideoReward*)ad {
    // grant reward
}
```

Register the `FADVideoRewardEventListener` (via `setEventListener`) **before**
calling `show`. The reward is signalled by `fiveVideoRewardAdDidReward`.

## AdLoader format: Native

> Native format requires **review** before integration — contact sales.

```swift
let slotConfig = FADAdSlotConfig(slotId: "your-slot-id")
adLoader.loadNativeAd(with: slotConfig, withInitialWidth: Double(120)) { ad, error in
    if let error = error {
        // load failure handling
    } else {
        // load success handling
    }
}
```

```objc
FADAdSlotConfig* slotConfig = [FADAdSlotConfig configWithSlotId:@"your-slot-id"];
[adLoader loadNativeAdWithConfig:slotConfig withInitialWidth:120 withLoadCallback:^(FADNative* ad, NSError* error) {
    if (error) {
        // load failure handling
    } else {
        // load success handling
    }
}];
```

Ad asset APIs are identical to the legacy native ad — see `fivesdk-ios.md`:
`getAdMainView`, `getButtonText`, `getLongDescriptionText`, `getAdvertiserName`,
`getAdTitle`, `loadInformationIconImageAsync`, `loadIconImageAsync`,
`registerView(forInteraction:withInformationIconView:withClickableViews:)`.

---

# Migration guide: legacy load API → AdLoader API

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-ios/migration-guide/ad-loader-api-migration.html`

For iOS FiveSDK v3.0.0+, the AdLoader API becomes standard and the legacy SDK-init
and ad-load APIs are deprecated.

## SDK initialization

Legacy — register `FADConfig` with `FADSettings`:

```swift
FADSettings.register(config)
```

```objc
[FADSettings registerConfig:config];
```

AdLoader — get a `FADAdLoader` for the `FADConfig` (this performs init):

```swift
do {
    let adLoader: FADAdLoader = try FADAdLoader(for: config)
} catch {
    // error handling
}
```

```objc
NSError* error = nil;
FADAdLoader* adLoader = [FADAdLoader adLoaderForConfig:config outError:&error];
if (error) {
    // error handling
}
```

Keep the `FADAdLoader` instance in an accessible field — e.g. on `AppDelegate`:

```swift
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    private(set) var adLoader: FADAdLoader?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let config: FADConfig = FADConfig(appId: "your-app-id")
        do {
            self.adLoader = try FADAdLoader(for: config)
        } catch {
            print("Failed to initialize FADAdLoader: \(error)")
            self.adLoader = nil
        }
        return true
    }
}
```

```objc
// AppDelegate.h
@class FADAdLoader;
@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property (nonatomic, strong, readonly, nullable) FADAdLoader *adLoader;
@end

// AppDelegate.m
@interface AppDelegate ()
@property (nonatomic, strong, readwrite, nullable) FADAdLoader *adLoader;
@end

@implementation AppDelegate
- (BOOL) application:(UIApplication*)application
didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {

    FADConfig* config = [[FADConfig alloc] initWithAppId:@"your-app-id"];

    NSError* error = nil;
    self.adLoader = [FADAdLoader adLoaderForConfig:config outError:&error];

    if (error != nil) {
        NSLog(@"Failed to initialize FADAdLoader: %@", error);
        self.adLoader = nil;
    }
    return YES;
}
@end
```

Access it from anywhere:

```swift
let appDelegate = UIApplication.shared.delegate as? AppDelegate
let adLoader: FADAdLoader? = appDelegate?.adLoader
```

```objc
AppDelegate* appDelegate = (AppDelegate*)[UIApplication sharedApplication].delegate;
FADAdLoader* adLoader = appDelegate.adLoader;
```

## Ad-load procedure

| Legacy | AdLoader |
|---|---|
| Create ad object | Create `FADAdSlotConfig` |
| Register `FADLoadDelegate` | — |
| Call `loadAdAsync` | Call a `FADAdLoader` load function |
| Receive load success in `fiveAdDidLoad` | Receive the loaded ad object in the load callback |

Per-format `FADAdLoader` load functions:

| Format | Swift | Objective-C |
|---|---|---|
| Custom Layout | `loadBannerAd(with:withInitialWidth:withLoadCallback:)` | `loadBannerAdWithConfig:withInitialWidth:withLoadCallback:` |
| Video Reward | `loadRewardAd(with:withLoadCallback:)` | `loadRewardAdWithConfig:withLoadCallback:` |
| Interstitial | `loadInterstitialAd(with:withLoadCallback:)` | `loadInterstitialAdWithConfig:withLoadCallback:` |
| Native | `loadNativeAd(with:withInitialWidth:withLoadCallback:)` | `loadNativeAdWithConfig:withInitialWidth:withLoadCallback:` |

### Custom Layout migration example

Legacy:

```swift
class ViewController: UIViewController {
    @IBOutlet weak var adContainerView: UIView!
    private var adCustomLayout: FADAdViewCustomLayout?

    func loadCustomLayoutAd() {
        self.adCustomLayout = FADAdViewCustomLayout(slotId: "your-slot-id", width: Float(120))
        self.adCustomLayout?.setLoadDelegate(self)
        self.adCustomLayout?.loadAdAsync()
    }
}

extension ViewController: FADLoadDelegate {
    func fiveAdDidLoad(_ : FADAdInterface!) {
        guard let adView = self.adCustomLayout else {
            return
        }
        if adView.superview != self.adContainerView {
            adView.removeFromSuperview()
            self.adContainerView.addSubview(adView)

            adView.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                adView.topAnchor.constraint(equalTo: self.adContainerView.topAnchor),
                adView.leadingAnchor.constraint(equalTo: self.adContainerView.leadingAnchor),
                adView.trailingAnchor.constraint(equalTo: self.adContainerView.trailingAnchor),
                adView.bottomAnchor.constraint(equalTo: self.adContainerView.bottomAnchor),
            ])
        }
    }
    func fiveAd(_: FADAdInterface!, didFailedToReceiveAdWithError errorCode: FADErrorCode) {
        NSLog("Failed to load ad with error code: \(errorCode.rawValue)")
    }
}
```

AdLoader (loader stored on `AppDelegate`), final form:

```swift
class ViewController: UIViewController {
    @IBOutlet weak var adContainerView: UIView!

    func loadCustomLayoutAd() {
        let slotConfig = FADAdSlotConfig(slotId: "your-slot-id")
        let appDelegate = UIApplication.shared.delegate as? AppDelegate
        let adLoader: FADAdLoader? = appDelegate?.adLoader
        adLoader?.loadBannerAd(with: slotConfig, withInitialWidth: Double(120)) { ad, error in
            if let error = error {
                self.onLoadFailure(error: error)
            } else {
                self.onLoadSucceeded(ad: ad!)
            }
        }
    }

    func onLoadSucceeded(ad: FADAdViewCustomLayout) {
        self.adContainerView.addSubview(ad)
        ad.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            ad.topAnchor.constraint(equalTo: self.adContainerView.topAnchor),
            ad.leadingAnchor.constraint(equalTo: self.adContainerView.leadingAnchor),
            ad.trailingAnchor.constraint(equalTo: self.adContainerView.trailingAnchor),
            ad.bottomAnchor.constraint(equalTo: self.adContainerView.bottomAnchor),
        ])
    }
    func onLoadFailure(error: Error) {
        print("Failed to load ad with error code: \((error as NSError).code)")
    }
}
```

```objc
// ViewController.m
@implementation ViewController
- (void)loadCustomLayoutAd {
    FADAdSlotConfig* slotConfig = [FADAdSlotConfig configWithSlotId:@"your-slot-id"];
    AppDelegate* appDelegate = (AppDelegate*)[UIApplication sharedApplication].delegate;
    FADAdLoader* adLoader = appDelegate.adLoader;
    [adLoader loadBannerAdWithConfig:slotConfig withInitialWidth:120 withLoadCallback:^(FADAdViewCustomLayout* ad, NSError* error) {
        if (error) {
            [self onLoadFailureWithError:error];
        } else {
            [self onLoadSucceededWithAd:ad];
        }
    }];
}
- (void)onLoadSucceededWithAd:(FADAdViewCustomLayout*)ad {
    [self.adContainerView addSubview:ad];
    ad.translatesAutoresizingMaskIntoConstraints = NO;
    [NSLayoutConstraint activateConstraints:@[
        [ad.topAnchor constraintEqualToAnchor:self.adContainerView.topAnchor],
        [ad.leadingAnchor constraintEqualToAnchor:self.adContainerView.leadingAnchor],
        [ad.trailingAnchor constraintEqualToAnchor:self.adContainerView.trailingAnchor],
        [ad.bottomAnchor constraintEqualToAnchor:self.adContainerView.bottomAnchor],
    ]];
}
- (void)onLoadFailureWithError:(NSError*)error {
    NSLog(@"Failed to load ad with error code: %ld", (long)error.code);
}
@end
```

Key migration notes:
- `FADLoadDelegate` is gone — replace it with the load callback.
- Use the ad object **returned by the callback**, not `self.adCustomLayout`.
- The load callback is called **exactly once**: success sets `ad`, failure sets
  `error`. If `error` is `nil`, `ad` is always set.
- Because the callback is invoked once then released, strong references in the
  callback do **not** leak memory; weak references add extra safety.
- `removeFromSuperview` and similar reuse-handling can be omitted (each load
  returns a fresh object).
- Code registered with `setEventListener` can be reused unchanged.

---

# Migration guide: 20231115 ad-event API change

Source: `https://adsnetwork-docs.linebiz.com/fivesdk-ios/migration-guide/20231115-new-ad-events.html`

iOS FiveSDK `v2.7.20231115` introduced a new ad-event API:
1. Per-format callback protocols (instead of one shared protocol).
2. (Video Reward) a dedicated reward-grant event.

> NOTE: The load-completion protocol `FADLoadDelegate` needs no migration work.

## Per-format callback protocols

The legacy `FADAdViewEventListener` (registered via `setAdViewEventListener`) is
replaced by per-format event listeners registered via `setEventListener`. See
`ad-events.md` for the full new callback set.

### Custom Layout — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `fiveAd:didFailedToShowAdWithError:` | `fiveCustomLayoutAd:didFailedToShowAdWithError:` |
| Impression | both | `fiveAdDidImpression:` | `fiveCustomLayoutAdDidImpression:` |
| Click | both | `fiveAdDidClick:` | `fiveCustomLayoutAdDidClick:` |
| View removal | both | `fiveAdDidClose:` | `fiveCustomLayoutAdViewDidRemove:` |
| Play start | video only | `fiveAdDidStart:` | `fiveCustomLayoutAdDidPlay:` |
| Pause | video only | `fiveAdDidPause:` | `fiveCustomLayoutAdDidPause:` |
| Play complete | video only | `fiveAdDidViewThrough:` | `fiveCustomLayoutAdDidViewThrough:` |
| Play resume | video only | `fiveAdDidResume:` | removed (merged into `fiveCustomLayoutAdDidPlay:`) |
| Replay | video only | `fiveAdDidReplay:` | removed (merged into `fiveCustomLayoutAdDidPlay:`) |
| Stall | video only | `fiveAdDidStall:` | removed |
| Stall recover | video only | `fiveAdDidRecover:` | removed |

After (new API) — Custom Layout:

```swift
class MyAdView : UIView {
    init {
        self.adCustomLayout = FADAdViewCustomLayout(slotId: "your-slot-id", width: Float(120))
        self.adCustomLayout?.setEventListener(self)
    }
}

extension MyAdView : FADCustomLayoutEventListener {
    func fiveCustomLayoutAd(_ ad: FADAdViewCustomLayout, didFailedToShowAdWithError errorCode: FADErrorCode) { }
    func fiveCustomLayoutAdDidImpression(_ ad: FADAdViewCustomLayout) { }
    func fiveCustomLayoutAdDidClick(_ ad: FADAdViewCustomLayout) { }
    func fiveCustomLayoutAdViewDidRemove(_ ad: FADAdViewCustomLayout) { }
    func fiveCustomLayoutAdDidPlay(_ ad: FADAdViewCustomLayout) { }
    func fiveCustomLayoutAdDidPause(_ ad: FADAdViewCustomLayout) { }
    func fiveCustomLayoutAdDidViewThrough(_ ad: FADAdViewCustomLayout) { }
}
```

### Video Reward — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `fiveAd:didFailedToShowAdWithError:` | `fiveVideoRewardAd:didFailedToShowAdWithError:` |
| Reward | both | none (merged into `fiveAdDidClose:`) | `fiveVideoRewardAdDidReward:` |
| Impression | both | `fiveAdDidImpression:` | `fiveVideoRewardAdDidImpression:` |
| Click | both | `fiveAdDidClick:` | `fiveVideoRewardAdDidClick:` |
| Full-screen open | both | none | `fiveVideoRewardAdFullScreenDidOpen:` |
| Full-screen close | both | `fiveAdDidClose:` | `fiveVideoRewardAdFullScreenDidClose` |
| Play start | video only | `fiveAdDidStart:` | `fiveVideoRewardAdDidPlay:` |
| Pause | video only | `fiveAdDidPause:` | `fiveVideoRewardAdDidPause:` |
| Play complete | video only | `fiveAdDidViewThrough:` | `fiveVideoRewardAdDidViewThrough` |
| Play resume / Replay / Stall / Stall recover | video only | `fiveAdDidResume:` / `fiveAdDidReplay:` / `fiveAdDidStall:` / `fiveAdDidRecover:` | removed (resume/replay merged into `fiveVideoRewardAdDidPlay:`) |

### Interstitial — old → new API

| Event | Kind | Old API | New API |
|---|---|---|---|
| Error | both | `fiveAd:didFailedToShowAdWithError:` | `fiveInterstitialAd:didFailedToShowAdWithError:` |
| Impression | both | `fiveAdDidImpression:` | `fiveInterstitialAdDidImpression:` |
| Click | both | `fiveAdDidClick:` | `fiveInterstitialAdDidClick:` |
| Full-screen open | both | none | `fiveInterstitialAdFullScreenDidOpen:` |
| Full-screen close | both | `fiveAdDidClose:` | `fiveInterstitialAdFullScreenDidClose:` |
| Play start | video only | `fiveAdDidStart:` | `fiveInterstitialAdDidPlay:` |
| Pause | video only | `fiveAdDidPause:` | `fiveInterstitialAdDidPause:` |
| Play complete | video only | `fiveAdDidViewThrough:` | `fiveInterstitialAdDidViewThrough:` |
| Play resume / Replay / Stall / Stall recover | video only | `fiveAdDidResume:` etc. | removed (resume/replay merged into `fiveInterstitialAdDidPlay:`) |

## Reward-grant event (Video Reward)

The legacy API recommended granting reward on the ad-close event. The new API
provides an independent reward-grant event — use it instead.

Before (legacy):

```swift
func fiveAdDidClose(_ ad: FADAdInterface!) {
    if self.rewardAd?.state != kFADStateError {
        // grant reward
    }
}
```

After (new):

```swift
func fiveVideoRewardAdDidReward(_ ad: FADVideoReward) {
    // grant reward
}
```

```objc
- (void) fiveVideoRewardAdDidReward:(nonnull FADVideoReward*)ad {
    // grant reward
}
```
