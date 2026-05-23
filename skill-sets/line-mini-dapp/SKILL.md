---
name: line-mini-dapp
description: >-
  Mini Dapp / Unifi Apps SDK official reference at API-reference depth — the
  DApp Portal documentation, now rebranded as Unifi. Covers the Unifi Apps SDK
  (`@linenext/dapp-portal-sdk`, class `DappPortalSDK`), the EIP-1193 wallet
  provider, the payment provider and Payment Server REST API, the event
  provider, Web3 gas-fee delegation, the Kaia blockchain, LINE MINI App / LINE
  Login LIFF / Web integration, NFT drops and rewards, and the Unifi Pay PG
  integration. Use this skill whenever the task touches LINE's Web3 / Mini Dapp
  ecosystem: integrating the Unifi Apps SDK or Mini Dapp SDK, building a Unifi
  App / Mini Dapp / LINE MINI App with crypto, connecting a Kaia wallet
  (Unifi Wallet, Kaia Wallet, OKX, Bitget), sending KAIA or USDT, signing
  transactions, creating in-app purchases (crypto / Stripe fiat / LINE IAP),
  handling payment webhooks (lockUrl, unlockUrl, paymentStatusChangeCallbackUrl),
  finalizing payments, settlement and chargebacks, gas-fee delegation, ERC-20
  token balances, or onboarding/review of a Unifi App. Trigger on mentions of:
  Mini Dapp, Mini Dapp SDK, Unifi, Unifi Apps, Unifi Apps SDK, DApp Portal, Dapp
  Portal, DappPortalSDK, @linenext/dapp-portal-sdk, docs.dappportal.io,
  docs.unifi.me, payment.dappportal.io, getWalletProvider, getPaymentProvider,
  getEventProvider, walletProvider, paymentProvider, kaia_requestAccounts,
  kaia_accounts, kaia_connectAndSign, kaia_sendTransaction, kaia_signTransaction,
  personal_sign, getErc20TokenBalance, getErc20TokenBalanceWithDepositedBalance,
  startPayment, openPaymentHistory, createPayment, finalize payment, pgType,
  CRYPTO / STRIPE / LINE_IAP, clientId, clientSecret, chainId 1001 / 8217, Kaia
  blockchain, Kairos testnet, KAIA, USDT, WalletType, fee delegation,
  signAsFeePayer, Reown, projectId, LIFF SDK, LINE MINI App, GRAC, NFT drops.
---

# Mini Dapp / Unifi Apps SDK Reference

API-reference-level coverage of the **Mini Dapp / Unifi Apps SDK** and the **DApp
Portal** (now **Unifi**) ecosystem, extracted from the official documentation at
`https://docs.dappportal.io/` (which redirects to `https://docs.unifi.me/`).

The product was originally **Dapp Portal** and was rebranded to **Unifi**; **Mini
Dapp** is now **Unifi Apps** and the **Mini Dapp SDK** is the **Unifi Apps SDK**.
The npm package name did **not** change — it is still `@linenext/dapp-portal-sdk`,
the class is still `DappPortalSDK`, and the API hosts still use `dappportal.io`.

This skill splits the docs into topic-scoped reference files. **Read the reference
file that matches the task — do not guess SDK method names, RPC method names,
endpoint paths, or JSON shapes.**

## When this skill applies

Any work on a Unifi App / Mini Dapp — a Web3 service running inside LINE Messenger
or on the web, powered by the **Kaia blockchain**:

- Installing and initializing the SDK (`DappPortalSDK.init`), managing the
  singleton instance.
- Connecting wallets and signing — `WalletProvider` (EIP-1193): `kaia_accounts`,
  `kaia_requestAccounts`, `kaia_connectAndSign`, `personal_sign`,
  `kaia_sendTransaction`, `kaia_signTransaction`, `disconnectWallet`, ERC-20
  balances. Wallet types: Unifi Wallet, Kaia Wallet (extension/mobile), OKX,
  Bitget.
- Payments — `PaymentProvider`: `startPayment`, `openPaymentHistory`; the Payment
  Server REST API (`createPayment`, get info, get status, finalize); payment
  webhooks; `pgType` `CRYPTO` / `STRIPE` / `LINE_IAP`; settlement, refunds,
  chargebacks, cancellation policy.
- Mission rewards — `EventProvider` (`getEventProvider`, `callback`); the mission
  verification REST API.
- Web3 — Kaia gas-fee delegation (`signAsFeePayer`, fee payer servers).
- LINE integration — LINE MINI App, LINE Login LIFF, Official Account, Invite
  Friends (ShareTargetPicker), the LIFF SDK.
- Onboarding/review of a Unifi App; NFT drops, token/NFT rewards on the Unifi
  platform; the Unifi Pay PG integration.

Works for raw HTTP calls (`curl`, `fetch`) to the Payment / settlement APIs and
for the SDK (`@linenext/dapp-portal-sdk`).

## Key facts (do not get these wrong)

- **npm package**: `@linenext/dapp-portal-sdk`. **SDK class**: `DappPortalSDK`.
  Latest version `v1.6.0`. CDN: `https://static.kaiawallet.io/js/dapp-portal-sdk-{version}.js`.
- **Blockchain**: Kaia. `chainId` `"1001"` = Kairos **testnet** (default), `"8217"`
  = Kaia **mainnet**. RPC methods are prefixed `kaia_`.
- **Credentials**: `clientId` (used to `init` the SDK; becomes active only when a
  domain is registered) and `clientSecret` (server-side only, required for
  payments, never expose).
- **API hosts**: Payment Server `https://payment.dappportal.io`; settlement/B2B API
  `https://api.dappportal.io`; wallet `https://wallet.dappportal.io`.
- **testMode must match chainId**: `testMode: true` ↔ `chainId 1001`; `testMode:
  false` ↔ `chainId 8217`. A mismatch causes a payment error (v1.4.6+).
- **USDT balance**: Unifi auto-deposits USDT, so the pure on-chain balance often
  reads zero — use `getErc20TokenBalanceWithDepositedBalance()` for USDT.
- USDT contract on Kaia: `0xd077a400968890eacc75cdc901f0356c943e4fdb`.
- In LINE MINI App / LINE Login LIFF: call `liff.init()` **before**
  `DappPortalSDK.init()`; do **not** trigger wallet connection on entry.

## Reference file map

| File | Contents |
|---|---|
| `references/getting-started.md` | Product naming & Dapp Portal→Unifi rebrand, SDK package & versions, obtaining `clientId`/`clientSecret`, install & `DappPortalSDK.init()`, the `DappPortalSDK` class (methods, singleton rules), build architecture (LINE MINI App / LINE Login LIFF / Web), the Unifi migration guide (USDT deposit balance, v1.6.0), demo apps & the starter template. |
| `references/wallet-provider.md` | `WalletProvider` (EIP-1193): `getWalletProvider`, `getWalletType` + `WalletType` enum, `request()` and every KAIA RPC method (`kaia_accounts`, `kaia_requestAccounts`, `kaia_connectAndSign`, `personal_sign`, `kaia_getBalance`, `kaia_sendTransaction`, `kaia_signTransaction`), `disconnectWallet`, `getErc20TokenBalance`, `getErc20TokenBalanceWithDepositedBalance`, error codes, compatible libraries, wallet-connect UX rules, Bitget Wallet domain verification via Reown. |
| `references/payment-provider.md` | Payment flow (6 steps), the Payment Server REST API (`createPayment`, get info, get status, finalize) with full request/response schemas, `PaymentProvider` methods (`startPayment`, `openPaymentHistory`) + error codes, payment webhooks (lock/unlock/status-change), the payment status enum, payment policy (methods, currencies, minimum charges, UX), refund / cancellation / chargeback policy, settlement (fiat & crypto, claiming USDT for Stripe). |
| `references/event-and-web3-provider.md` | `EventProvider` (`getEventProvider`, `eventProvider.callback`) for mission completion + the mission-verification REST API; Web3 Provider; Kaia gas-fee delegation (concept, fee payer servers, frontend & backend code, balance check). |
| `references/line-integration.md` | LINE MINI App vs LINE Login LIFF; full channel setup steps for each; Official Account setup, rich menu, multi-language welcome message automation; Invite Friends (ShareTargetPicker, `isMultiple`); the design guide (tab name, OpenGraph, connect button, z-index, landscape, maintenance, close dialog). |
| `references/onboarding-and-review.md` | The Join Us onboarding process; launching on Unifi Apps (eligibility, benefits, evaluation criteria); about Kaia & developer resources; review guidelines (version selection, the LINE MINI App and LIFF/Web self-checklists, compliance); "How to build successful Unifi Apps"; the full FAQ (SDK, wallet, payment, LINE integration, web3). |
| `references/unifi-platform.md` | The Unifi consumer platform (Home/Apps/Market/Trade/My); applying Apps images & info; NFT minting & Drops (collections, stages, mint flow); rewards (token/NFT missions, mission monitoring); fungible token info; the GRAC (South Korea) policy; the Growth Competition. |
| `references/changelog.md` | The SDK changelog — every version v1.2.0 → v1.6.0 with API-relevant changes (added methods, behavior changes, webhook field additions) and a compact table for stability-only releases. |
| `references/unifi-pay.md` | Unifi Pay — the separate PG-facing product (redirect-based stablecoin payment): overview, onboarding, HMAC authentication, the payment API (`POST /api/v1/payment`, `GET /api/v1/payment/{transactionId}`). Plus reusable code snippets (close confirmation dialog, React & Vanilla JS). |

## Quick reference

### SDK surface

```
DappPortalSDK.init({ clientId, chainId })          → Promise<DappPortalSDK>
sdk.getWalletProvider()                            → WalletProvider
sdk.getPaymentProvider()                           → PaymentProvider
DappPortalSDK.getEventProvider()                   → EventProvider
sdk.isSupportedBrowser()                           → boolean
sdk.showUnsupportedBrowserGuide()                  → Promise<void>

walletProvider.getWalletType()                     → WalletType (Web|Liff|Extension|Mobile|OKX|BITGET)
walletProvider.request({ method, params })         → Promise<unknown>   (EIP-1193 / JSON-RPC)
walletProvider.disconnectWallet()                  → Promise<void>      (async since v1.2.12)
walletProvider.getErc20TokenBalance(contract, account)                  → Promise<hex string>
walletProvider.getErc20TokenBalanceWithDepositedBalance(contract, account) → Promise<hex string>  (use for USDT)

paymentProvider.startPayment(paymentId)            → Promise<unknown>   (resolves on CONFIRMED)
paymentProvider.openPaymentHistory()               → Promise<void>

eventProvider.callback(eventId, subMissionIndex)   → void               (mission completion banner)
```

### KAIA RPC methods (`walletProvider.request`)

```
kaia_accounts            params: null                    → string[] (empty [] if not connected)
kaia_requestAccounts     params: null                    → string[] (shows wallet-select UI)
kaia_connectAndSign      params: [message]                → [account, signature]  (recommended)
personal_sign            params: [message, account]      → signature              (EIP-191)
kaia_getBalance          params: [account, 'latest'|'earliest'] → balance hex in kei (1 KAIA = 10^18 kei)
kaia_sendTransaction     params: [{from,to,value,gas}]    → transactionHash
kaia_signTransaction     params: [tx]                     → signed (RLP) tx        (fee-delegated flows)
```

### Payment Server REST API — base `https://payment.dappportal.io`

```
POST /api/payment-v1/payment/create     headers X-Client-Id, X-Client-Secret  → { id }
GET  /api/payment-v1/payment/info        headers X-Client-Id, X-Client-Secret; ?id=  → full payment object
GET  /api/payment-v1/payment/status      ?id=  (no auth headers)               → { status }
POST /api/payment-v1/payment/finalize    body { id }                          → 200 (empty)
```

Payment webhooks (POST to your URLs): `lockUrl`, `unlockUrl`,
`paymentStatusChangeCallbackUrl` — must use **port 443** and return `200 OK`.

Payment status: `CREATED → STARTED → REGISTERED_ON_PG → CAPTURED → CONFIRMED →
FINALIZED`; plus `CONFIRM_FAILED`, `CANCELED`, `REFUNDED`, `CHARGEBACK`. `pgType` ∈
`{CRYPTO, STRIPE, LINE_IAP}`. `currencyCode` ∈ `{USD, KRW, JPY, TWD, THB, KAIA,
USDT}`.

### Settlement / B2B API — base `https://api.dappportal.io`

```
GET /api/b2b-v1/dapp-settlements/{client_id}/signed-receivable
    HMAC auth headers: X-Auth-Client-Id, X-Auth-Timestamp, X-Auth-Salt, X-Auth-Signature
```

### Working rules

- Initialize the SDK **once** and keep it as a singleton — repeated `init()` calls
  can break the wallet connection window.
- `clientId` works only on a registered/whitelisted domain (`http://localhost:3000`
  is allowed for testing). An unregistered origin → "Invalid Origin" error.
- `clientSecret` is server-side only — required for `createPayment`. Never ship it
  in frontend code or commit it.
- Only **single-item** purchases are supported in `createPayment`.
- Set `lockUrl` / `unlockUrl` to `null` when the product has no quantity limit.
- For USDT smart-contract transfers (e.g. Swap), when `walletType` is `WEB` or
  `LIFF`, add `depositTokenAddress` + `depositAmount` to `kaia_sendTransaction`;
  hard-code `gas` to ~`0x30D40` (gas estimation reverts).
- For Bitget Wallet, complete Reown domain verification and register a `projectId`
  with Unifi, or Bitget is not shown in the wallet list.
- Crypto payment prices: KAIA up to 4 decimals, USDT up to 2 decimals. Stripe USD
  is in cents (`$1` → `100`); KRW/JPY are 1:1; THB/TWD are ×100.
