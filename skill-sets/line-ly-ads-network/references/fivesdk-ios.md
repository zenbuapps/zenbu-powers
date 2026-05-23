# iOS FiveSDK — Legacy Load API

Source:
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/` (intro)
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/quick-start/install-fivesdk.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/quick-start/app-tracking.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/quick-start/initialize-sdk.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/ad-formats/{custom-layout,video-reward,interstitial,native}.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/advanced/{sound-settings,sk-ad-network}.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/store-release/{check-sheet,app-ads-txt,app-store-disclosure}.html`

> This file covers the **legacy load API** (`loadAdAsync` + `FADLoadDelegate`).
> For the new AdLoader API (standard from SDK v3.0.0) see `fivesdk-ios-adloader.md`.
> For ad-event callbacks (impression/click/error/...) see `ad-events.md`.

## Table of contents

- Installation (CocoaPods / SPM / manual)
- App Tracking Transparency (ATT)
- SDK initialization — `FADConfig`, `FADSettings`
- Sound settings
- Ad format: Custom Layout
- Ad format: Video Reward
- Ad format: Interstitial
- Ad format: Native
- SKAdNetwork
- Pre-release checklist
- App Store privacy disclosure

---

## Installation

iOS FiveSDK supports iOS 15+. Latest Xcode recommended.

### CocoaPods (recommended)

Add to your app target's `Podfile`:

```ruby
pod 'FiveAd'
```

Then run:

```bash
pod install
```

### Swift Package Manager (BETA)

> WARNING: SPM integration is in **BETA**. Prefer another method if stability matters.

In Xcode: `[File] > [Add Package Dependencies...]`, search the repository URL,
pick a version (`Up to Next Major Version` recommended), add to the app target.

```plain
https://github.com/ly-ads-network/swift-package-manager-fivead
```

### Manual

Download the FiveSDK zip, unzip, and add **either** `FiveAd.xcframework` **or**
`FiveAd.framework` to the project (`.xcframework` recommended — same features,
modern format). Also add these dependent frameworks:

```
AdSupport.framework
AppTrackingTransparency.framework
AVFoundation.framework
CoreMedia.framework
CoreTelephony.framework
Network.framework
AudioToolbox.framework
WebKit.framework
StoreKit.framework
```

## App Tracking Transparency (ATT)

iOS 14.5+ requires explicit user consent before tracking ads via IDFA. Without
it, ad revenue drops significantly. Two steps: edit `Info.plist` and add code.

### Info.plist

Add the **`Privacy - Tracking Usage Description`**
(`NSUserTrackingUsageDescription`) key with the consent-prompt text. The wording
can affect ad revenue.

### Request code

Call `ATTrackingManager.requestTrackingAuthorization`:

```swift
import AppTrackingTransparency

ATTrackingManager.requestTrackingAuthorization { (status) in
    print("ATT status: \(status)")
}
```

```objc
#import <AppTrackingTransparency/AppTrackingTransparency.h>

[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {
    NSLog(@"ATT status: %lu", (unsigned long)status);
}];
```

The call can happen any time (launch, after SDK init, after ad load). The dialog
shows **only once** — once denied, it can only be changed in Settings — so the
display timing is critical for opt-in rate.

## SDK initialization

FiveSDK must be initialized once before displaying ads. Initialize at app launch.

### Create `FADConfig`

`FADConfig` holds app-wide settings. Replace `your-app-id` with the registered App ID.

```swift
let config: FADConfig = FADConfig(appId: "your-app-id")
```

```objc
FADConfig *config = [[FADConfig alloc] initWithAppId:@"your-app-id"];
```

### Test flag

`FADConfig.isTest` — when set, **test ads** are delivered (only test ads).

```swift
config.isTest = true
```

```objc
config.isTest = YES;
```

### Register the config

Registering the config starts SDK initialization.

```swift
FADSettings.register(config)
```

```objc
[FADSettings registerConfig:config];
```

## Sound settings

### App-wide default

Set on `FADConfig` before `register`. The SDK-init setting overrides the
Dashboard setting.

```swift
let config: FADConfig = FADConfig(appId: "your-app-id")
// Enable sound by default app-wide
config.enableSound(byDefault: true)
// Must be set before `register`
FADSettings.register(config)
```

```objc
FADConfig *config = [[FADConfig alloc] initWithAppId:@"your-app-id"];
[config enableSoundByDefault:YES];
[FADSettings registerConfig:config];
```

### Per-ad-instance

`enableSound` on each ad instance. The per-ad setting overrides the app-wide
default; the user's mute-button operation overrides both.

```swift
let rewardAd: FADVideoReward = FADVideoReward(slotId: "your-slot-id")
rewardAd.enableSound(false)   // OFF
rewardAd.enableSound(true)    // ON
```

```objc
FADVideoReward *rewardAd = [[FADVideoReward alloc] initWithSlotId:@"your-slot-id"];
[rewardAd enableSound:NO];
[rewardAd enableSound:YES];
```

## Ad format: Custom Layout

`FADAdViewCustomLayout` — the most standard format; displays an ad at a specified
position inside the app (feed screens, in-content placements). Integrates
multiple sub-formats. The aspect ratio is set server-side per slot format, so the
API takes **width only** (no height).

```swift
// Prepare
self.adCustomLayout = FADAdViewCustomLayout(slotId: "your-slot-id", width: Float(120))

// Load — register a FADLoadDelegate first
self.adCustomLayout?.setLoadDelegate(self)
self.adCustomLayout?.loadAdAsync()

// Display — in FADLoadDelegate.fiveAdDidLoad
func fiveAdDidLoad(_ ad: FADAdInterface!) {
    if let ad = self.adCustomLayout {
        self.view.addSubview(ad)
    }
}
```

```objc
self.adCustomLayout = [[FADAdViewCustomLayout alloc] initWithSlotId:@"your-slot-id" width:120];

[self.adCustomLayout setLoadDelegate:self];
[self.adCustomLayout loadAdAsync];

- (void)fiveAdDidLoad:(id<FADAdInterface>)ad {
    [self.view addSubview:self.adCustomLayout];
}
```

## Ad format: Video Reward

`FADVideoReward` — full-screen video; grants in-app items/points in exchange for
watching.

```swift
// Prepare
self.adReward = FADVideoReward(slotId: "your-slot-id")

// Load
self.adReward?.setLoadDelegate(self)
self.adReward?.loadAdAsync()

// Display — call show(with:) in fiveAdDidLoad
func fiveAdDidLoad(_ ad: FADAdInterface!) {
    self.adReward?.show(with: self)
}

// Reward — register a FADVideoRewardEventListener
self.adReward?.setEventListener(self)

func fiveVideoRewardAdDidReward(_ ad: FADVideoReward) {
    // grant reward
}
```

```objc
self.adReward = [[FADVideoReward alloc] initWithSlotId:@"your-slot-id"];

[self.adReward setLoadDelegate:self];
[self.adReward loadAdAsync];

- (void)fiveAdDidLoad:(id<FADAdInterface>)ad {
    [self.adReward showWithViewController:self];
}

[self.adReward setEventListener:self];

- (void) fiveVideoRewardAdDidReward:(nonnull FADVideoReward*)ad {
    // grant reward
}
```

`show` takes the current `UIViewController`. Passing `nil` is allowed (SDK
auto-searches for a `UIViewController`), but in edge cases (external display
connected) it may show on the wrong window. The reward is signalled by
`fiveVideoRewardAdDidReward`.

## Ad format: Interstitial

`FADInterstitial` — full-screen ad for content-download time, between game
levels, between content transitions, during data loads.

> NOTE: Interstitial format **cannot** be used for ad slots that grant in-app
> incentives or points. Use Video Reward for that.

```swift
self.interstitial = FADInterstitial(slotId: "your-slot-id")

self.interstitial?.setLoadDelegate(self)
self.interstitial?.loadAdAsync()

func fiveAdDidLoad(_ ad: FADAdInterface!) {
    self.interstitial?.show(with: self)
}
```

```objc
self.interstitial = [[FADInterstitial alloc] initWithSlotId:@"your-slot-id"];

[self.interstitial setLoadDelegate:self];
[self.interstitial loadAdAsync];

- (void)fiveAdDidLoad:(id<FADAdInterface>)ad {
    [self.interstitial showWithViewController:self];
}
```

Same `show` semantics as Video Reward (`nil` allowed; auto-search caveat).

## Ad format: Native

`FADNative` — fully customizable ad design controlled by the publisher.

> Native format requires **review** before integration. Contact your sales
> representative.

```swift
// Prepare (videoViewWidth = main asset width)
self.adNative = FADNative(slotId: "your-slot-id", videoViewWidth: Float(120))

// Load
self.adNative?.setLoadDelegate(self)
self.adNative?.loadAdAsync()
```

```objc
self.adNative = [[FADNative alloc] initWithSlotId:@"your-slot-id" videoViewWidth:120];

[self.adNative setLoadDelegate:self];
[self.adNative loadAdAsync];
```

### Ad asset APIs

Main ad view (video/still): `getAdMainView`.

Text-content APIs:

| Element | API |
|---|---|
| Click-to-action button text | `getButtonText` |
| Ad description | `getLongDescriptionText` |
| Advertiser name | `getAdvertiserName` |
| Ad title | `getAdTitle` |

Image APIs — `loadInformationIconImageAsync` (info icon) and `loadIconImageAsync`
(advertiser icon) load asynchronously and return a `UIImage` via callback:

```swift
self.adNative?.loadInformationIconImageAsync { (infoIconImage) in
    if let infoIconImage = infoIconImage {
        // info icon loaded
    } else {
        // info icon missing or load failed
    }
}
```

```objc
[self.adNative loadInformationIconImageAsyncWithBlock:^(UIImage* infoIconImage){
    if (infoIconImage) {
        // info icon loaded
    } else {
        // info icon missing or load failed
    }
}];
```

### Register the ad view

After building the ad view, register it with `registerView`. Arg 1 = the whole
ad view; arg 2 = the info-icon view; arg 3 = the list of views that lead to the
landing page when clicked.

```swift
func createAdView(ad: FADNative) -> UIView? {
    let base = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 320))

    guard let adMainView = ad.getAdMainView() else {
        return nil
    }

    let descriptionText = ad.getLongDescriptionText()
    let description = UILabel(frame: CGRect(x: 0, y: 180, width: 320, height: 180))
    description.font = UIFont.systemFont(ofSize: CGFloat(9))
    description.text = descriptionText

    let infoIconView = UIImageView(frame: CGRect(x: 300, y: 0, width: 20, height: 20))
    ad.loadInformationIconImageAsync { (infoIconImage) in
        if let infoIconImage = infoIconImage {
            infoIconView.image = infoIconImage
            base.addSubview(infoIconView)
        }
    }

    base.addSubview(adMainView)
    base.addSubview(description)

    ad.registerView(forInteraction: base, withInformationIconView: infoIconView, withClickableViews: [base])

    return base
}
```

```objc
- (UIView*) createAdView:(FADNative*)ad
{
    UIView* base = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 320, 320)];

    UIView* adMainView = [ad getAdMainView];
    if (adMainView == nil) return nil;

    NSString* descriptionText = [ad getLongDescriptionText];
    UILabel* description = [[UILabel alloc] initWithFrame:CGRectMake(0, 180, 320, 180)];
    [description setFont:[UIFont systemFontOfSize:9]];
    [description setText:descriptionText];

    UIImageView* infoIconView = [[UIImageView alloc] initWithFrame:CGRectMake(300, 0, 20, 20)];
    [ad loadInformationIconImageAsyncWithBlock:^(UIImage* image){
        if (image) {
            infoIconView.image = image;
            [base addSubview:infoIconView];
        }
    }];

    [base addSubview:adMainView];
    [base addSubview:description];

    [ad registerViewForInteraction:base withInformationIconView:infoIconView withClickableViews:@[base]];

    return base;
}
```

## SKAdNetwork

LY Ads Network supports Apple's SKAdNetwork conversion tracking — it can measure
conversions even for users who opted out of ad tracking. To support it, register
**all** ad-network IDs that may be served, in `Info.plist`.

Ad-network IDs that may be served via FiveSDK:

```plain
vutu7akeur.skadnetwork
eh6m2bh4zr.skadnetwork
cstr6suwn9.skadnetwork
578prtvx9j.skadnetwork
9t245vhmpl.skadnetwork
v72qych5uu.skadnetwork
x8uqf25wch.skadnetwork
7ug5zh24hu.skadnetwork
hs6bdukanm.skadnetwork
dbu4b84rxf.skadnetwork
8c4e2ghe7u.skadnetwork
```

`Info.plist` form:

```plain
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>SKAdNetworkItems</key>
  <array>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>vutu7akeur.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>eh6m2bh4zr.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>cstr6suwn9.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>578prtvx9j.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>9t245vhmpl.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>v72qych5uu.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>x8uqf25wch.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>7ug5zh24hu.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>hs6bdukanm.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>dbu4b84rxf.skadnetwork</string>
    </dict>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>8c4e2ghe7u.skadnetwork</string>
    </dict>
  </array>
</dict>
</plist>
```

## Pre-release checklist

### Required

- **Test flag disabled** — verify `FADConfig.isTest`. If `true`, only test ads
  are delivered.

### Recommended

- **Verify impressions** — register the per-format event listener and confirm
  the impression callback fires. FiveSDK checks whether the ad is hidden by
  other views; the impression callback proves correct integration.

| Ad object format | Event listener protocol | Impression callback |
|---|---|---|
| Custom Layout | `FADCustomLayoutEventListener` | `fiveCustomLayoutAdDidImpression` |
| Video Reward | `FADVideoRewardEventListener` | `fiveVideoRewardAdDidImpression` |
| Interstitial | `FADInterstitialEventListener` | `fiveInterstitialAdDidImpression` |
| Native | `FADNativeEventListener` | `fiveNativeAdDidImpression` |

## app-ads.txt

Place an `app-ads.txt` file at the root domain of the developer website
registered in the app store. If another company's `app-ads.txt` already exists,
**append** LY Ads Network's content. Contact sales for the exact content. Spec:
IAB manual.

## App Store privacy disclosure

When submitting to the App Store, answer the "App Privacy" questions using these
tables. Items marked `(※)` are collected for **tracking** purposes. All collected
data is linked to the user's personal information.

### Data collected (collected = ✔)

| Type | Item | Collected | Description |
|---|---|---|---|
| Contact Info | Name | | First/last name |
| | Email Address | | Includes hashed email addresses, not limited to |
| | Phone Number | | Includes hashed phone numbers, not limited to |
| | Physical Address | | Home address, location, mailing address etc. |
| | Other User Contact Info | | Home or location |
| Health & Fitness | Health | | Clinical health records, HealthKit etc. |
| | Fitness | | Motion/Fitness API etc. |
| Financial Info | Payment Info | | Payment method, card number, bank account etc. |
| | Credit Info | | Credit score etc. |
| | Other Financial Info | | Salary, income, assets, debts etc. |
| Location | Precise Location | | Lat/long at >= 3-decimal resolution |
| | Coarse Location | | Lat/long below 3-decimal resolution |
| Sensitive Info | | | Race/ethnicity, sexual orientation, etc. |
| Contacts | | | The user's contact list |
| User Content | Emails or Text Messages | | Subject, sender, recipient, content |
| | Photos or Videos | | The user's photos/videos |
| | Audio Data | | The user's voice/recordings |
| | Gameplay Content | | User-generated in-game content |
| | Customer Support | | Data generated during customer support |
| | Other User Content | | Other user-generated content |
| Browsing History | | | Content the user browsed (not part of the app) |
| Search History | | | Searches performed in the app |
| Identifiers | User ID | | Screen name, handle, account ID etc. |
| | **Device ID** | **✔ (※)** | Device advertising ID or other device-level IDs |
| Purchases | | | Account/personal purchases or purchase tendency |
| Usage Data | **Product Interaction** | **✔ (※)** | App launches, taps, clicks, scroll info, video views etc. |
| | **Advertising Data** | **✔ (※)** | Info about ads the user saw etc. |
| | **Other Usage Data** | **✔** | Other data about app user activity |
| Diagnostics | Crash Data | | Crash logs etc. |
| | **Performance Data** | **✔** | Launch time, hang rate, energy usage etc. |
| | Other Diagnostic Data | | Other technical-diagnostic data |
| Other Data | | | Other data types not mentioned |

### Data use purposes (applies = ✔)

| Purpose | Applies | Description |
|---|---|---|
| **Third-Party Advertising** | **✔** | Display third-party ads in the app, share data with third-party ad entities |
| Developer's Advertising or Marketing | | Display own ads in the app, direct marketing etc. |
| **Analytics** | **✔** | Evaluate user behavior — feature effectiveness, audience measurement etc. |
| Product Personalization | | Customize content shown to the user |
| **App Functionality** | **✔** | User authentication, feature enablement, fraud prevention, security, uptime, crash minimization, scalability, customer support etc. |
| Other Purposes | | Other purposes not described |
