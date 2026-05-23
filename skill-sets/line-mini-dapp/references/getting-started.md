# Getting Started — Unifi Apps SDK (Mini Dapp SDK)

Source:
- `https://docs.unifi.me/` (home — Unifi & Unifi Apps overview)
- `https://docs.unifi.me/unifi-apps-sdk` (SDK getting started, init, DappPortalSDK class)
- `https://docs.unifi.me/unifi-and-unifi-apps/unifi-migration-guide`
- `https://docs.unifi.me/unifi-apps` (build architecture)
- `https://docs.unifi.me/unifi-apps-demo` and `.../unifi-apps-starter`

## Table of contents

- Product naming & rebrand (Dapp Portal → Unifi, Mini Dapp → Unifi Apps)
- SDK package & versions
- Obtaining SDK access (clientId / clientSecret)
- Installing & initializing the SDK
- DappPortalSDK class reference
- Build architecture (LINE MINI App / LINE Login LIFF / Web)
- Unifi migration guide (USDT deposit balance, v1.6.0)
- Demo apps & starter template

---

## Product naming & rebrand

The product was originally **Dapp Portal** and was rebranded to **Unifi**. The doc
site `docs.dappportal.io` now redirects to `docs.unifi.me`. The terms map 1:1:

| Old name (Dapp Portal era) | New name (Unifi era) |
|---|---|
| Dapp Portal | Unifi |
| Mini Dapp | Unifi Apps |
| Mini Dapp SDK | Unifi Apps SDK |
| Dapp Portal Wallet | Unifi Wallet |

**The npm package name did NOT change** — it is still `@linenext/dapp-portal-sdk`,
and the SDK class is still `DappPortalSDK`. API hosts still use `dappportal.io`
(`payment.dappportal.io`, `api.dappportal.io`, `wallet.dappportal.io`). Treat
"Mini Dapp SDK" and "Unifi Apps SDK" as the same thing.

**What Unifi is**: a stablecoin-based Web3 wallet and platform powered by the
**Kaia blockchain**, running natively inside LINE Messenger and on the web with no
separate app install. The Unifi Apps SDK lets a Mini App developer add Web3
(wallet, payments, on-chain rewards) to a service. Main environments: LINE and Web.

## SDK package & versions

| | Value |
|---|---|
| npm package | `@linenext/dapp-portal-sdk` |
| Latest version (as documented) | `v1.6.0` |
| npm | `https://www.npmjs.com/package/@linenext/dapp-portal-sdk/v/1.6.0` |
| CDN | `https://static.kaiawallet.io/js/dapp-portal-sdk-1.6.0.js` |

CDN URL pattern for any version: `https://static.kaiawallet.io/js/dapp-portal-sdk-{version}.js`.

**v1.6.0 added LINE Mini App in-app purchase (IAP) support.** v1.5.0 added the
Unifi rebrand support and `getErc20TokenBalanceWithDepositedBalance()`. See
`references/changelog.md` for the full version history.

## Obtaining SDK access (clientId / clientSecret)

To integrate the SDK you must receive a `clientId` and `clientSecret` from the
Unifi team:

1. Submit the Unifi Apps application.
2. Review and submit the Unifi Apps SDK Terms & Conditions as instructed.
3. Receive your `clientId` and `clientSecret` via the submitted email (delivered
   within ~3 business days of submitting the SDK T&C).

Rules and gotchas:

- **Never expose `clientSecret` publicly.** If compromised, request regeneration
  via Tech Support. Never commit it to source control or ship it in frontend code.
- Your `clientId` becomes active **only when a domain is registered**.
- For local testing you may use `http://localhost:3000`. For external test domains,
  request whitelisting via Tech Support or email. The SDK only works on whitelisted
  domains — an unregistered origin yields an "Invalid Origin" error and wallet
  connection fails.
- Payments via `paymentProvider` require a valid `clientSecret`.

## Installing the SDK

```sh
npm install @linenext/dapp-portal-sdk

# or

yarn add @linenext/dapp-portal-sdk

# or

pnpm add @linenext/dapp-portal-sdk
```

## Initializing the SDK

You must initialize the SDK each time the Unifi Apps is loaded.

```js
import DappPortalSDK from '@linenext/dapp-portal-sdk'

const sdk = await DappPortalSDK.init({
  clientId: '<CLIENT_ID>',
  chainId: '1001', // or '8217' for mainnet
});
```

`DappPortalSDK.init(config)` parameters:

| Name | Type | Required | Description |
|---|---|---|---|
| `clientId` | string | Yes | The `clientId` provided when applying for the SDK |
| `chainId` | string | No | Default `1001` (testnet/Kairos). Set to `8217` for Kaia mainnet after development. |

Returns a `DappPortalSDK` object (a `Promise<DappPortalSDK>`).

### LINE MINI App / LINE Login LIFF init notes

- Call `liff.init()` **before** calling `DappPortalSDK.init()`.
- Do **not** trigger wallet connection (`connectWallet` / `kaia_requestAccounts`) on
  LINE MINI App or LINE Login LIFF entry. Only connect when needed (e.g. item
  purchase, on-chain rewards). This ensures accurate active-user tracking and LINE
  attribution.
- Detect environment with `liff.isInClient()`:
  - returns `true` → LINE MINI App or LINE Login LIFF → call `liff.init()` then `DappPortalSDK.init()`.
  - returns `false` → web browser → call only `DappPortalSDK.init()`.

### Singleton best practice

Initialize the SDK only once and manage the `DappPortalSDK` instance as a
**singleton**. Calling `DappPortalSDK.init()` multiple times may cause unexpected
behavior or malfunctions (especially the wallet connection window failing to open).

The SDK does not enforce singleton usage by default — this allows multi-config
setups (e.g. running both testnet and mainnet in one app). In that case, keep one
singleton instance **per configuration** (one for testnet, one for mainnet).

If there is too little interval between `init()` and the first method call, methods
may not execute properly. v1.3.3 fixed this; otherwise allow a gap or upgrade.

## DappPortalSDK class reference

### Constructor

`DappPortalSDK(config: DappPortalSDKClientConfig)` — initializes the SDK using your
credentials.

- `clientId: string` — provided by the Unifi team.
- `chainId: string` — `"1001"` for testnet, `"8217"` for mainnet.

Use the static async factory `DappPortalSDK.init(config)` rather than the
constructor directly.

### Instance methods

| Method | Returns | Description |
|---|---|---|
| `getWalletProvider()` | `WalletProvider` | EIP-1193-compatible wallet provider. Send transactions, sign messages, interact with wallets. See `references/wallet-provider.md`. |
| `getPaymentProvider()` | `PaymentProvider` | Object for managing payments and transaction history. See `references/payment-provider.md`. |
| `getEventProvider()` | `EventProvider` | Object for Unifi Apps mission-completion callbacks. See `references/event-and-web3-provider.md`. |
| `isSupportedBrowser()` | `boolean` | Whether the current browser is compatible. |
| `showUnsupportedBrowserGuide()` | `Promise<void>` | Displays a guide prompting the user to open the app in a supported browser. |

## Security guidelines

- Keep `clientSecret` confidential. Never commit it to source control.
- If exposed, rotate it immediately via Tech Support.
- Never expose wallet private keys, `clientSecret`, or other sensitive credentials
  in frontend code, version control, or unsecured environments. Store them on the
  backend or in a protected secrets manager.

## Build architecture — how to build Unifi Apps

A Unifi App can run in up to three environments. Available version combinations:

- LINE MINI App & LINE Login LIFF & Web
- LINE MINI App & Web
- LINE Login LIFF & Web
- LINE MINI App **or** Web (single type)

LINE Login LIFF **cannot** be a single type — it is technically built on top of a
Web service, so a LINE Login LIFF service must always ship with a Web version.

### ① LINE version — LIFF SDK integration

LINE-based experiences come in two forms, both run inside the LINE mobile app and
both use the LIFF SDK, but they use different channel types and onboarding tracks:

| | LINE MINI App | LINE Login LIFF |
|---|---|---|
| Channel | LINE MINI App Channel | LINE Login Channel |
| App Store policy | Must comply with App Store policies | n/a |
| LIFF SDK | Yes | Yes |
| Unifi Apps SDK | Yes — WalletProvider, PaymentProvider (IAP) | Yes — WalletProvider, PaymentProvider (Crypto/Stripe Fiat) |
| Onboarding eligibility | Japanese corporation or sole proprietor residing in Japan only | No restriction |
| Target users | Japan LINE users | Global LINE users |

Technically: a LINE MINI App / LINE Login LIFF is built by first integrating the
Unifi Apps SDK into a base Web service, then adding the LIFF SDK on top — so the
Web + Unifi Apps SDK environment is inherently included.

### ② Web version

A web browser version for non-LINE users is recommended. To support WalletProvider
and PaymentProvider (Crypto / Stripe Fiat), the Unifi Apps SDK must be integrated
into the web version.

### ③ Web3 integration (WalletProvider)

Wallet types available per environment:

| Environment | Wallet types |
|---|---|
| LINE MINI App | LINE (Liff), OKX, Bitget Wallet |
| LINE Login LIFF | LINE (Liff), OKX, Bitget Wallet |
| Web | Social Login (Web), Kaia Wallet App/Extension, OKX, Bitget Wallet |

### ④ Payment integration (PaymentProvider)

| Environment | Payment methods |
|---|---|
| LINE MINI App | IAP payments |
| LINE Login LIFF | Crypto & Stripe (Fiat) payments |
| Web | Crypto & Stripe (Fiat) payments |

### ⑤ App review

| Version | Reviewer |
|---|---|
| LINE MINI App | LINE NEXT (pre-review) → LY (final approval). LY submission requires prior LINE NEXT review. |
| LINE Login LIFF | LINE NEXT, submission via email |
| Web | LINE NEXT, submission via email |

### ⑥ Onboarding & launch

| Version | Launch surfaces | Audience |
|---|---|---|
| LINE MINI App | MINI Tab in LINE App, Apps in Unifi | Japan LINE users |
| LINE Login LIFF | Apps in Unifi | Global LINE users |
| Web | Apps in Unifi | Global users |

## Unifi migration guide (rebrand, effective Feb 12, 2026)

Dapp Portal rebranded to Unifi. The Wallet functionality was updated; certain
actions are required so existing Apps keep working.

**Unifi is a stablecoin wallet on Kaia.** After user registration and Approve
authorization, it provides an **automatic deposit service**:

- Auto-deposit target at launch: **USDT**.
- Other assets (KAIA, BORA, etc.) remain supported but are NOT eligible for auto-deposit.
- Once a Dapp Portal user migrates to Unifi: the user's **on-chain USDT balance may
  appear as zero**, because all USDT is automatically deposited into Unifi's account
  pool. Developers must query the **Unifi account balance**, not only the on-chain
  balance.

### Required changes

1. **SDK update**: the Unifi-supporting SDK version is **v1.6.0** — update to it.
   If not updated: USDT payments via PaymentProvider fail due to insufficient
   balance, and auto-deposited USDT is not detected. (By using PaymentProvider,
   USDT payments execute against the auto-deposited Unifi balance simply by updating
   the SDK version, with no code change.)
2. **USDT balance query**: switch from `getErc20TokenBalance()` (on-chain only) to
   `getErc20TokenBalanceWithDepositedBalance()` (on-chain + Unifi deposit balance).
3. **Smart-contract USDT transfer** (e.g. Swap): include `depositTokenAddress` and
   `depositAmount` in the `kaia_sendTransaction` request when `walletType` is `WEB`
   or `LIFF`. For `OKX`, `BITGET`, `Extension`, `Mobile`, use the AS-IS parameters.

   AS-IS:
   ```
   params = {
     typeInt: 48,
     from: "walletAddress",
     to: "contractAddress",
     value: "0x0",
     input: "0xabcd..."
   }
   ```

   TO-BE (WEB / LIFF):
   ```
   params = {
     typeInt: 48,
     from: "walletAddress",
     to: "contractAddress",
     value: "0x0", // Kaia Amount
     input: "0xabcd...",
     depositTokenAddress: "0xd077a400968890eacc75cdc901f0356c943e4fdb", // USDT contract address
     depositAmount: "1000000", // Amount of USDT as token decimal. 1 USDT = 1000000
     gas: "0x30D40" // recommend hard-coding the gas limit to ~200,000
   }
   ```
   Note: gas estimation is not possible for these transfers (an `execution revert`
   error occurs) because USDT in Unifi Wallet is fully deposited into the interest
   vault. Hard-code `gas` to ~`0x30D40` (200,000).
4. **Browser tab name**: change from `{dapp_name} | Mini Dapp` to `{dapp_name} | Unifi Apps`.
5. **Connect button**: update for Unifi.
6. **OA Rich Menu**: replace the Dapp Portal logo with the Unifi logo. The LIFF URL
   is unchanged: `https://liff.line.me/2006533014-8gD06D64`.

USDT contract address on Kaia: `0xd077a400968890eacc75cdc901f0356c943e4fdb`.

## Demo apps & starter template

- **Unifi Apps Demo** — LINE Login LIFF: `https://liff.line.me/2006880697-nWPg5LpZ`;
  Web: `https://unifiapps-demo.unifi.me`. Sample code by method:
  `https://unifiapps-demo.unifi.me`.
- **Unifi Apps Demo repository**: `https://github.com/techreadiness/unifi-apps-starter`
  (older docs also reference `https://github.com/techreadiness/dapp-starter`).
- **Unifi Apps Starter** — a Next.js template project that integrates
  `dapp-portal-sdk`. Requires Node.js >= 20.0.0; `.nvmrc` pins `v20.18.0`. Uses
  `pnpm` (npm-compatible). Deploy via Netlify:
  ```
  # Go to the root directory
  cd ./
  # Build the project
  pnpm build
  # Deploy to a draft (preview) environment
  netlify deploy
  # Once verified, deploy to production
  netlify deploy --prod
  ```
  Published reference: `https://unifi-apps-starter.netlify.app`. The starter
  includes reference implementations of: connect/disconnect wallet, wallet session
  persistence via `kaia_accounts`, crypto/fiat payment, KAIA/STRIPE price
  conversion (`usd-to-kaia`), KAIA/USDT/ERC20 balance, smart-contract USDT transfer,
  and LIFF integration (`shareTargetPicker`).
- **Game engine integration**: Unity — `https://docs.kaia.io/minidapps/`; Cocos
  Creator — `https://docs.kaia.io/minidapps/cocos-creator/`. Port the Unity/Cocos
  project to WebGL and integrate as a web app using the Unifi Apps SDK.

## Where to apply (Unifi entry points)

- Apply for Unifi Apps / developer site: `https://developers.unifi.me/`
- Unifi web app: `https://unifi.me`
- Explore Unifi Apps — LINE Login LIFF: `https://liff.line.me/2006533014-8gD06D64`
- Tech support: Telegram `@unifiapps_official`; email `dl_unifiapps_support@linecorp.com`
  / `unifiapps_review@unifi.me`.
