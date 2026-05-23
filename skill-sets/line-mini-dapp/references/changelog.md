# SDK Changelog & Update Note

Source:
- `https://docs.unifi.me/update-note-1` (update note)
- `https://docs.unifi.me/update-note-1/sdk-version` (+ all version pages v1.2.0–v1.6.0)

## Latest version

| | Value |
|---|---|
| Latest SDK version | `v1.6.0` |
| npm | `https://www.npmjs.com/package/@linenext/dapp-portal-sdk/v/1.6.0` |
| CDN | `https://static.kaiawallet.io/js/dapp-portal-sdk-1.6.0.js` |

Package name is `@linenext/dapp-portal-sdk` for every version. CDN URL pattern:
`https://static.kaiawallet.io/js/dapp-portal-sdk-{version}.js`.

SDK version updates are announced via the official Telegram channel. Always use the
latest version for security and compatibility. Versions earlier than the documented
ones used the name "Mini Dapp SDK"; from v1.5.0 it is the "Unifi Apps SDK" — same
package.

## API-relevant changes by version (most recent first)

These are the version notes that change the SDK surface or behavior an integrator
must know. Pure internal/stability releases are listed in the compact table below.

### v1.6.0 — Mar 9, 2026

Added support for **in-app purchases (IAP) in LINE Mini Apps**. To use this, IAP
must be applied for in the Mini App channel in advance. This is the Unifi-supporting
SDK version — see the migration guide in `references/getting-started.md`.

### v1.5.2 — Jan 16, 2026

Fixed a minor issue related to the USDT payment flow.

### v1.5.0 — Dec 30, 2025

Released to support the Dapp Portal → Unifi rebrand. **Added methods:**

- `getErc20TokenBalanceWithDepositedBalance()` — query USDT balance (on-chain +
  Unifi deposit).
- Smart-contract USDT transfer signing — for USDT transfers via smart contract
  (including Swap), include `depositTokenAddress` and `depositAmount` in
  `kaia_sendTransaction`. Required when `walletType` is `WEB` or `LIFF`; for other
  wallet types use the AS-IS parameters.

  AS-IS (walletType not WEB/LIFF):
  ```
  params = {
    type: "SmartContractExecution",
    from: "0x4b53..dbe6",
    to: "contractAddress",
    input: "0xabcd...",
  }
  ```

  TO-BE (walletType WEB or LIFF):
  ```
  params = {
    type: "SmartContractExecution",
    from: "0x4b53..dbe6",
    to: "contractAddress",
    input: "0xabcd...",
    depositTokenAddress: "0xd077...", // USDT contract address
    depositAmount: "100" // Amount of USDT to transfer
  }
  ```

  An immediate update is not required — the added methods work after the rebranded
  Dapp Portal launches.

### v1.4.7 — Nov 6, 2025

Added **OA Promotion Phase 3** support → introduced the **Event Provider**:
`DappPortalSDK.getEventProvider()` and `eventProvider.callback(eventId,
subMissionIndex)`, plus the Unifi/Dapp Server REST API for mission verification
(`GET`, `https`, 1s read timeout). See `references/event-and-web3-provider.md`.

### v1.4.6 — Oct 15, 2025

Added a safeguard that rejects payment requests when the connected wallet's
`chainId` does not match the payment environment. Testnet: `chainId: 1001,
testMode: true`. Mainnet: `chainId: 8217, testMode: false`. Any other combination
causes a payment error and the SDK throws an exception. Log messages: `The payment
is set to test mode, but DappPortalSDK is initialized with mainnet (8217).` / `The
payment is set to non-test mode, but DappPortalSDK is initialized with testnet
(1001).`.

### v1.4.5 — Sep 22, 2025

Added **OA Promotion Phase 2** support. Resolved a blank-screen issue when
scrolling during Connect. Updated all Payment API processes to run as
**non-cancellable jobs** for more stable execution.

### v1.4.4 — Sep 5, 2025

Outputs error logs when not using the latest SDK (logs do not affect
functionality). Fixed an error during reconnect after `disconnectWallet()` (Bitget
Wallet).

### v1.4.1 — Aug 19, 2025

Added the Dapp Portal **OA Popup event** (USDT rewards / cross-promotion).

### v1.4.0 — Jul 25, 2025

- `cryptoPaymentInfo` field added to the webhook when payment status is `CONFIRMED`:
  ```
  {
      "paymentId": "",
      "status": "CONFIRMED",
      "cryptoPaymentInfo": { // added when status: CONFIRMED
          "paymentTxHash": "0x.."
      }
  }
  ```
- Added `walletProvider.getErc20TokenBalance(contractAddress, walletAddress)` to
  retrieve fungible-token balance.
- **USDT added as a `currencyCode` where `pgType: CRYPTO`.** Gas fee delegation is
  supported for USDT payment.

(USDT payment has been supported from the SDK since v1.4.0, per the Aug 1, 2025
update note.)

### v1.3.5 — Jun 16, 2025

Gas Fee Delegation support for the **Bitget Wallet**. Fixed a bug where
`openPaymentHistory()` did not work while connected to the Bitget Wallet.

### v1.3.3 — Jun 10, 2025

Fixed bugs that may occur in v1.3.0+ — specifically: methods not executing properly
when called immediately after `DappPortalSDK.init()`.

- No issue (sufficient interval between init and method call):
  ```
  // index.tsx
  globalSdk = await DappPortalSDK.init()

  // login.tsx
  const provider = global.getWalletProvider();
  const accounts = provider.request({method: 'kaia_requestAccounts'})
  ```
- Issue (called immediately after init):
  ```
  const sdk = await DappPortalSdk.init();
  const provider = sdk.getWalletProvider();
  const accounts = provider.request({method: 'kaia_requestAccounts'})
  ```

### v1.3.0 — May 27, 2025

Provides the **Bitget Wallet** as a `walletType` — `getWalletType()` returns
`WalletType.BITGET`. An SDK upgrade is required; no code changes needed. Complete
domain verification (via Reown) before upgrading and submit the `projectId`. (v1.3.1
clarified: Bitget is supported only if a `projectId` is registered with the SDK.)

### v1.2.13 — May 20, 2025

No impact on the client's side. (On May 9, 2025, the Get Payment Information API
response and payment status were updated to include refund and chargeback entries.)

### v1.2.12 — Apr 23, 2025

- **Point #1** — fixed an issue where the SDK failed to detect account changes in
  the OKX Wallet. Before: after the user changed the account in the extension while
  OKX was connected, `kaia_accounts()` / `kaia_requestAccounts()` returned the
  former account and the user could not sign. After: the new account is returned.
- **Point #2 [Action Required]** — fixed an issue where the OKX Wallet was not
  properly disconnected on `walletProvider.disconnectWallet()`. **Changed
  `walletProvider.disconnectWallet()` to an async function:**
  ```
  // ASIS
  walletProvider.disconnectWallet();
  window.location.reload(); // <- Failed to disconnect OKX Wallet

  // TOBE
  await walletProvider.disconnectWallet();
  window.location.reload(); // <- Success to disconnect OKX Wallet
  ```
- **Point #3 [Action Required]** — after `disconnectWallet()`, you can select a
  wallet type again on a subsequent `walletProvider.request({method:
  "kaia_requestAccounts"})` without page refresh or reassigning `walletProvider`.

### v1.2.11 — Apr 10, 2025

Fixed a bug where requesting `kaia_accounts()` with no connected wallet showed the
wallet connection screen and the client responded with `[]`. From v1.2.11,
`kaia_accounts()` with no connected wallet returns `[]` **without** showing the
connection screen.

### v1.2.9 — Mar 6, 2025

Gas fee delegation support from the **OKX Wallet** (SDK upgrade mandatory).

### v1.2.8 — Feb 27, 2025

Added the **`kaia_connectAndSign`** function. (Also: `getWalletType()` updated —
`WalletType.OKX` added; Wallet Connect flow added.)

- Request: `[data]` — `data` = data to sign.
- Response: `[address, signature]` — `address` = the signing address; `signature` =
  the cryptographic signature.
- Error: `REQUEST_REJECTED: -32002` — when the user cancels the connection.

(v1.2.7 was an internal-improvement version.)

### v1.2.5 — Feb 4, 2025

Changed the `408` long-polling timeout error to respond as `202`. Triggers an
explicit error when requesting `kaia_signLegacy` with the OKX wallet. Resumed
`testMode: true` (no SDK upgrade needed).

### v1.2.1 — Jan 21, 2025

For STRIPE and CRYPTO payments in a `CONFIRMED` state where the finalize API was
not called, the status auto-changes to `FINALIZED` within 5 minutes (for normal
settlement).

### v1.2.0 — Jan 20, 2025

(In v1.2.0 notes: green = mandatory to apply to the Mini Dapp's code; blue =
optional.)

- **Wallet** — improved responses so clients can clearly recognize the cancellation
  and closing options of the popup. Fixed a UI bug if the Mini Dapp name includes
  `'`. Fixed the `z-index` on the popup to proceed signing if blocked — `z-index`
  `9999999`; set any popup's z-index below `9999999` to avoid conflicts. Improved
  Mobile App Wallet connection and iOS response time.
- **Payment** — added the **payment status change webhook**. Improved
  `createPayment` parameters: whitespace disallowed in `lockUrl` / `unlockUrl`;
  include `lockUrl` / `unlockUrl` as `null` even with no data; added URL validation;
  added `paymentStatusChangeCallbackUrl` (`confirmCallbackUrl` usable only up to
  v1.2.0); only `false` allowed for `testMode`; fixed a price bug for the payment
  history page. Added the OKX wallet option; improved payment error codes.
- **Wallet (Mobile, Extension)** — `personal_sign()` is supported.

## Compact version table (stability / bug-fix-only releases)

| Version | Date (UTC) | Note |
|---|---|---|
| v1.5.1 | Jan 6, 2026 | Fixed a minor issue in the library. |
| v1.4.8 | Nov 17, 2025 | Bitget Wallet integration improvement — mainnet signatures now correctly display as "Kaia" instead of "Kairos". |
| v1.4.2 & v1.4.3 | Aug 21, 2025 | Internal feature improvement. |
| v1.3.8 | Jul 11, 2025 | Fixed a minor bug for Kaia Wallet (App). |
| v1.3.7 | Jul 10, 2025 | SDK updated to work properly in the Kaia Wallet (App) in-app browser. |
| v1.3.6 | Jul 8, 2025 | Fixed a minor bug in `openPaymentHistory()`. |
| v1.3.4 | Jun 12, 2025 | Internal feature improvement. |
| v1.3.2 | May 30, 2025 | Stability enhancement (no client impact). |
| v1.3.1 | May 27, 2025 | Minor Bitget Wallet improvement. |
| v1.2.10 | Apr 7, 2025 | Wallet Connect UX improvement (single-screen connect options). |
| v1.2.6 | Feb 12, 2025 | Updated OKX Wallet to `@okxconnect/ui` v1.7.4; added the return-to-LINE flow after an OKX request in the LIFF browser; fixed an OKX init error; improved the OKX connection UI. |
| v1.2.4 | Jan 23, 2025 | Fixed an OKX connect/sign error; fixed "Buffer is not defined". |
| v1.2.3 | Jan 22, 2025 | Fixed minor bugs. |
| v1.2.2 | Jan 21, 2025 | Fixed intermittent iOS LIFF wallet connection failures and crashes. |

## Non-SDK doc updates (selected)

- Mar 25, 2025 — Minimum price policy for KAIA payment updated from 1 KAIA to
  **0.01 KAIA**.
- May 9, 2025 — Get Payment Information API response and payment status updated to
  include refund and chargeback entries.
- Jul 28, 2025 — Updated guide to claim USDT for STRIPE payment.
- Apr 2, 2025 — Dapp Portal compliance policy added to the Review Guidelines.
