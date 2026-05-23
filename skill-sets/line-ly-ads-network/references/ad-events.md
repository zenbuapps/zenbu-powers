# Ad Event APIs (iOS & Android)

Source:
- `https://adsnetwork-docs.linebiz.com/fivesdk-ios/advanced/ad-events.html`
- `https://adsnetwork-docs.linebiz.com/fivesdk-android/advanced/ad-events.html`

FiveSDK notifies ad-related events through per-format callback protocols
(iOS) / interfaces (Android). Register the listener via `setEventListener`.

This applies to both the legacy load API and the AdLoader API — the event
listener registration is unchanged across them.

## Table of contents

- iOS event listener protocols
- iOS: still-image / video common events
- iOS: video-only events
- Android event listener interfaces
- Android: still-image / video common events
- Android: video-only events
- Error codes (`FADErrorCode` / `FiveAdErrorCode`)

---

# iOS event listener protocols

| Ad format | Event protocol |
|---|---|
| Custom Layout | `FADCustomLayoutEventListener` |
| Video Reward | `FADVideoRewardEventListener` |
| Interstitial | `FADInterstitialEventListener` |
| Native | `FADNativeEventListener` |

Register: `ad.setEventListener(self)` (Swift) / `[ad setEventListener:self]` (ObjC).

## iOS: still-image / video common events

### Impression event

Fires when ad viewing starts. Fires **once** per ad. Requires the ad view to be
unobscured by other views and judged viewable. Verify this event when integrating
an ad slot.

```swift
func fiveCustomLayoutAdDidImpression(_ ad: FADAdViewCustomLayout)
func fiveVideoRewardAdDidImpression(_ ad: FADVideoReward)
func fiveInterstitialAdDidImpression(_ ad: FADInterstitial)
func fiveNativeAdDidImpression(_ ad: FADNative)
```

```objc
- (void) fiveCustomLayoutAdDidImpression:(nonnull FADAdViewCustomLayout*)ad
- (void) fiveVideoRewardAdDidImpression:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdDidImpression:(nonnull FADInterstitial*)ad
- (void) fiveNativeAdDidImpression:(nonnull FADNative*)ad
```

### Click event

Fires when the ad is clicked and a transition occurs. Fires even for transitions
to an in-app WebView or StoreKit. May fire **multiple times** per ad.

```swift
func fiveCustomLayoutAdDidClick(_ ad: FADAdViewCustomLayout)
func fiveVideoRewardAdDidClick(_ ad: FADVideoReward)
func fiveInterstitialAdDidClick(_ ad: FADInterstitial)
func fiveNativeAdDidClick(_ ad: FADNative)
```

```objc
- (void) fiveCustomLayoutAdDidClick:(nonnull FADAdViewCustomLayout*)ad
- (void) fiveVideoRewardAdDidClick:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdDidClick:(nonnull FADInterstitial*)ad
- (void) fiveNativeAdDidClick:(nonnull FADNative*)ad
```

### Error event

Fires when an error occurs while displaying the ad. Provides an error code.

```swift
func fiveCustomLayoutAd(_ ad: FADAdViewCustomLayout, didFailedToShowAdWithError errorCode: FADErrorCode)
func fiveVideoRewardAd(_ ad: FADVideoReward, didFailedToShowAdWithError errorCode: FADErrorCode)
func fiveInterstitialAd(_ ad: FADInterstitial, didFailedToShowAdWithError errorCode: FADErrorCode)
func fiveNativeAd(_ ad: FADNative, didFailedToShowAdWithError errorCode: FADErrorCode)
```

```objc
- (void) fiveCustomLayoutAd:(nonnull FADAdViewCustomLayout*)ad didFailedToShowAdWithError:(FADErrorCode) errorCode
- (void) fiveVideoRewardAd:(nonnull FADVideoReward*)ad didFailedToShowAdWithError:(FADErrorCode) errorCode
- (void) fiveInterstitialAd:(nonnull FADInterstitial*)ad didFailedToShowAdWithError:(FADErrorCode) errorCode
- (void) fiveNativeAd:(nonnull FADNative*)ad didFailedToShowAdWithError:(FADErrorCode) errorCode
```

Show-error codes:

| Code | Name | Handling |
|---|---|---|
| 5 | `StorageError` | Device storage problem — use a different device. |
| 12 | `PlayerError` | Possibly the device's processing-performance limit. Reduce simultaneously placed ads. |
| 6 | `InternalError` | Possibly a FiveSDK-side problem — contact support. |

### Reward event

Fires when a reward ad's reward condition is met.

```swift
func fiveVideoRewardAdDidReward(_ ad: FADVideoReward)
```

```objc
- (void) fiveVideoRewardAdDidReward:(nonnull FADVideoReward*)ad
```

### Custom Layout / Native view-removal event

Fires when the Custom Layout / Native ad view is removed (e.g. the ad template's
close button is tapped).

```swift
func fiveCustomLayoutAdViewDidRemove(_ ad: FADAdViewCustomLayout)
func fiveNativeAdViewDidRemove(_ ad: FADNative)
```

```objc
- (void) fiveCustomLayoutAdViewDidRemove:(nonnull FADAdViewCustomLayout*)ad
- (void) fiveNativeAdViewDidRemove:(nonnull FADNative*)ad
```

### Full-screen open event

Fires when the full-screen ad view starts.

```swift
func fiveVideoRewardAdFullScreenDidOpen(_ ad: FADVideoReward)
func fiveInterstitialAdFullScreenDidOpen(_ ad: FADInterstitial)
```

```objc
- (void) fiveVideoRewardAdFullScreenDidOpen:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdFullScreenDidOpen:(nonnull FADInterstitial*)ad
```

### Full-screen close event

Fires when the full-screen ad view ends.

```swift
func fiveVideoRewardAdFullScreenDidClose(_ ad: FADVideoReward)
func fiveInterstitialAdFullScreenDidClose(_ ad: FADInterstitial)
```

```objc
- (void) fiveVideoRewardAdFullScreenDidClose:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdFullScreenDidClose:(nonnull FADInterstitial*)ad
```

## iOS: video-only events

### Play-start event

Fires when video playback starts — not only on first play, but also on resume
from pause and on replay.

```swift
func fiveCustomLayoutAdDidPlay(_ ad: FADAdViewCustomLayout)
func fiveVideoRewardAdDidPlay(_ ad: FADVideoReward)
func fiveInterstitialAdDidPlay(_ ad: FADInterstitial)
func fiveNativeAdDidPlay(_ ad: FADNative)
```

```objc
- (void) fiveCustomLayoutAdDidPlay:(nonnull FADAdViewCustomLayout*)ad
- (void) fiveVideoRewardAdDidPlay:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdDidPlay:(nonnull FADInterstitial*)ad
- (void) fiveNativeAdDidPlay:(nonnull FADNative*)ad
```

### Play-complete event

Fires when the video plays to the end. May fire **multiple times** per ad.

```swift
func fiveCustomLayoutAdDidViewThrough(_ ad: FADAdViewCustomLayout)
func fiveVideoRewardAdDidViewThrough(_ ad: FADVideoReward)
func fiveInterstitialAdDidViewThrough(_ ad: FADInterstitial)
func fiveNativeAdDidViewThrough(_ ad: FADNative)
```

```objc
- (void) fiveCustomLayoutAdDidViewThrough:(nonnull FADAdViewCustomLayout*)ad
- (void) fiveVideoRewardAdDidViewThrough:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdDidViewThrough:(nonnull FADInterstitial*)ad
- (void) fiveNativeAdDidViewThrough:(nonnull FADNative*)ad
```

### Pause event

Fires when video playback pauses. May fire **multiple times** per ad.

```swift
func fiveCustomLayoutAdDidPause(_ ad: FADAdViewCustomLayout)
func fiveVideoRewardAdDidPause(_ ad: FADVideoReward)
func fiveInterstitialAdDidPause(_ ad: FADInterstitial)
func fiveNativeAdDidPause(_ ad: FADNative)
```

```objc
- (void) fiveCustomLayoutAdDidPause:(nonnull FADAdViewCustomLayout*)ad
- (void) fiveVideoRewardAdDidPause:(nonnull FADVideoReward*)ad
- (void) fiveInterstitialAdDidPause:(nonnull FADInterstitial*)ad
- (void) fiveNativeAdDidPause:(nonnull FADNative*)ad
```

---

# Android event listener interfaces

| Ad format | Event interface |
|---|---|
| Custom Layout | `FiveAdCustomLayoutEventListener` |
| Video Reward | `FiveAdVideoRewardEventListener` |
| Interstitial | `FiveAdInterstitialEventListener` |
| Native | `FiveAdNativeEventListener` |

Register: `ad.setEventListener(this)`.

Android callbacks are **overloaded by ad type** — the same method name (`onClick`,
`onImpression`, etc.) is overloaded with `FiveAdCustomLayout` /
`FiveAdVideoReward` / `FiveAdInterstitial` / `FiveAdNative` arguments.

## Android: still-image / video common events

### Impression event

Fires when ad viewing starts. Fires **once** per ad. Requires the ad view to be
unobscured and judged viewable. Verify this event when integrating.

```kotlin
override fun onImpression(fiveAdCustomLayout: FiveAdCustomLayout)
override fun onImpression(fiveAdVideoReward: FiveAdVideoReward)
override fun onImpression(fiveAdInterstitial: FiveAdInterstitial)
override fun onImpression(fiveAdNative: FiveAdNative)
```

```java
@Override public void onImpression(@NonNull FiveAdCustomLayout fiveAdCustomLayout)
@Override public void onImpression(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onImpression(@NonNull FiveAdInterstitial fiveAdInterstitial)
@Override public void onImpression(@NonNull FiveAdNative fiveAdNative)
```

### Click event

Fires when the ad is clicked and a transition occurs (including transitions to an
in-app WebView). May fire **multiple times** per ad.

```kotlin
override fun onClick(fiveAdCustomLayout: FiveAdCustomLayout)
override fun onClick(fiveAdVideoReward: FiveAdVideoReward)
override fun onClick(fiveAdInterstitial: FiveAdInterstitial)
override fun onClick(fiveAdNative: FiveAdNative)
```

```java
@Override public void onClick(@NonNull FiveAdCustomLayout fiveAdCustomLayout)
@Override public void onClick(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onClick(@NonNull FiveAdInterstitial fiveAdInterstitial)
@Override public void onClick(@NonNull FiveAdNative fiveAdNative)
```

### Error event

Fires when an error occurs while displaying the ad. Provides an error code.

```kotlin
override fun onViewError(fiveAdCustomLayout: FiveAdCustomLayout, errorCode: FiveAdErrorCode)
override fun onViewError(fiveAdVideoReward: FiveAdVideoReward, errorCode: FiveAdErrorCode)
override fun onViewError(fiveAdInterstitial: FiveAdInterstitial, errorCode: FiveAdErrorCode)
override fun onViewError(fiveAdNative: FiveAdNative, errorCode: FiveAdErrorCode)
```

```java
@Override public void onViewError(@NonNull FiveAdCustomLayout fiveAdCustomLayout, @NonNull FiveAdErrorCode errorCode)
@Override public void onViewError(@NonNull FiveAdVideoReward fiveAdVideoReward, @NonNull FiveAdErrorCode errorCode)
@Override public void onViewError(@NonNull FiveAdInterstitial fiveAdInterstitial, @NonNull FiveAdErrorCode errorCode)
@Override public void onViewError(@NonNull FiveAdNative fiveAdNative, @NonNull FiveAdErrorCode errorCode)
```

Show-error codes:

| Code | Name | Handling |
|---|---|---|
| 5 | `StorageError` | Device storage problem — use a different device. |
| 12 | `PlayerError` | Possibly the device's processing-performance limit. Reduce simultaneously placed ads. |
| 6 | `InternalError` | Possibly a FiveSDK-side problem — contact support. |

### Reward event

Fires when a reward ad's reward condition is met.

```kotlin
override fun onReward(fiveAdVideoReward: FiveAdVideoReward)
```

```java
@Override public void onReward(@NonNull FiveAdVideoReward fiveAdVideoReward)
```

### Native / Custom Layout view-removal event

Fires when the Native / Custom Layout ad view is removed (e.g. close button tap).

```kotlin
override fun onRemove(fiveAdCustomLayout: FiveAdCustomLayout)
override fun onRemove(fiveAdNative: FiveAdNative)
```

```java
@Override public void onRemove(@NonNull FiveAdCustomLayout fiveAdCustomLayout)
@Override public void onRemove(@NonNull FiveAdNative fiveAdNative)
```

### Full-screen open event

```kotlin
override fun onFullScreenOpen(fiveAdVideoReward: FiveAdVideoReward)
override fun onFullScreenOpen(fiveAdInterstitial: FiveAdInterstitial)
```

```java
@Override public void onFullScreenOpen(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onFullScreenOpen(@NonNull FiveAdInterstitial fiveAdInterstitial)
```

### Full-screen close event

```kotlin
override fun onFullScreenClose(fiveAdVideoReward: FiveAdVideoReward)
override fun onFullScreenClose(fiveAdInterstitial: FiveAdInterstitial)
```

```java
@Override public void onFullScreenClose(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onFullScreenClose(@NonNull FiveAdInterstitial fiveAdInterstitial)
```

## Android: video-only events

### Play-start event

Fires when video playback starts — also on resume from pause and on replay.

```kotlin
override fun onPlay(fiveAdCustomLayout: FiveAdCustomLayout)
override fun onPlay(fiveAdVideoReward: FiveAdVideoReward)
override fun onPlay(fiveAdInterstitial: FiveAdInterstitial)
override fun onPlay(fiveAdNative: FiveAdNative)
```

```java
@Override public void onPlay(@NonNull FiveAdCustomLayout fiveAdCustomLayout)
@Override public void onPlay(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onPlay(@NonNull FiveAdInterstitial fiveAdInterstitial)
@Override public void onPlay(@NonNull FiveAdNative fiveAdNative)
```

### Play-complete event

Fires when the video plays to the end. May fire **multiple times** per ad.

```kotlin
override fun onViewThrough(fiveAdCustomLayout: FiveAdCustomLayout)
override fun onViewThrough(fiveAdVideoReward: FiveAdVideoReward)
override fun onViewThrough(fiveAdInterstitial: FiveAdInterstitial)
override fun onViewThrough(fiveAdNative: FiveAdNative)
```

```java
@Override public void onViewThrough(@NonNull FiveAdCustomLayout fiveAdCustomLayout)
@Override public void onViewThrough(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onViewThrough(@NonNull FiveAdInterstitial fiveAdInterstitial)
@Override public void onViewThrough(@NonNull FiveAdNative fiveAdNative)
```

### Pause event

Fires when video playback pauses. May fire **multiple times** per ad.

```kotlin
override fun onPause(fiveAdCustomLayout: FiveAdCustomLayout)
override fun onPause(fiveAdVideoReward: FiveAdVideoReward)
override fun onPause(fiveAdInterstitial: FiveAdInterstitial)
override fun onPause(fiveAdNative: FiveAdNative)
```

```java
@Override public void onPause(@NonNull FiveAdCustomLayout fiveAdCustomLayout)
@Override public void onPause(@NonNull FiveAdVideoReward fiveAdVideoReward)
@Override public void onPause(@NonNull FiveAdInterstitial fiveAdInterstitial)
@Override public void onPause(@NonNull FiveAdNative fiveAdNative)
```

---

# Error codes

`FADErrorCode` (iOS) / `FiveAdErrorCode` (Android) — the same numeric codes apply
to both platforms.

## Load errors (delivered via the load delegate / listener / callback)

| Code | Name | Handling |
|---|---|---|
| 1 | `NetworkError` | Retry in a stable network environment. |
| 2 | `NoAd` | See the `NoAd` section in `troubleshooting-and-faq.md`. |
| 4 | `BadAppId` | See the `BadAppId`/`BadSlotId` section in `troubleshooting-and-faq.md`. |
| 5 | `StorageError` | Device storage problem — retry on a different device. |
| 6 | `InternalError` | Possibly an SDK or OS bug — contact support. |
| 8 | `InvalidState` | See the `InvalidState` section in `troubleshooting-and-faq.md`. |
| 9 | `BadSlotId` | See the `BadAppId`/`BadSlotId` section in `troubleshooting-and-faq.md`. |
| 10 | `Suppressed` | Contact support. |

## Show errors (delivered via the per-format event listener)

| Code | Name | Handling |
|---|---|---|
| 1 | `NetworkError` | Retry in a stable network environment. |
| 5 | `StorageError` | Device storage problem — retry on a different device. |
| 6 | `InternalError` | Possibly an SDK or OS bug — contact support. |
| 12 | `PlayerError` | See the `PlayerError` section in `troubleshooting-and-faq.md`. |
