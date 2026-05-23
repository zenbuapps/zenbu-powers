# Onboarding, Review Guidelines & FAQ

Source:
- `https://docs.unifi.me/join-us-1` (+ `contact-us`, `launching-on-unifi-apps` and children, `faq`)
- `https://docs.unifi.me/unifi-apps-review-guidelines` (+ 3 children)

## Table of contents

- Onboarding process (Join Us)
- Launching on Unifi Apps (overview, eligibility, benefits, evaluation)
- About Kaia, developer resources
- Review guidelines (version selection, self-checklists, compliance)
- "How to build successful Unifi Apps" (featured requirements)
- FAQ (SDK, wallet, payment, LINE integration, web3)

---

## Onboarding process — Join Us

Available version combinations: LINE MINI App & LINE Login LIFF & Web; LINE MINI
App & Web; LINE Login LIFF & Web; LINE MINI App **or** Web (single type). LINE
Login LIFF cannot be a single type — it must ship with a Web version.

Supported onboarding types:

| Type | Environment | Users | Region | Eligibility | Payment | Reviewer |
|---|---|---|---|---|---|---|
| LINE MINI App | LINE mobile app, supports Unifi featured placements | LINE users | Japan | Japanese Corporate Number (Hōjin Bangō) holders or individual business owners with Japanese residency | IAP only | LY & LINE NEXT |
| LINE Login LIFF | LINE mobile app, supports Unifi featured placements | LINE users | Global | — | Crypto & STRIPE (Fiat) only | LINE NEXT |
| Web | General web browsers, supports Unifi featured placements | Non-LINE users | Global | — | Crypto & STRIPE (Fiat) only | LINE NEXT |

Onboarding steps:

1. **Submit Unifi Apps Application** — submit the designated application form; the
   info is used to evaluate eligibility and onboarding readiness.
2. **Internal review** — Unifi reviews the application (focus: LINE Mini App launch
   eligibility, core game mechanics, application materials). A dedicated BD manager
   may be assigned.
3. **Onboarding process initiation** — on passing internal review, Unifi provides
   the Unifi Apps SDK Terms & Conditions plus other materials (due diligence form,
   Dapp Information Registration form). After T&C submission, the SDK and all
   authentication credentials are provisioned and delivered to the registered email
   within ~3 business days.
4. **Develop Unifi Apps demo** — the payment integration differs by version (LINE
   MINI App → IAP; LINE Login LIFF / Web → Crypto & Stripe). Develop per the
   provided Development checklist. To develop a LINE MINI App, add the LINE NEXT
   review manager as an Admin to the LINE MINI App channel via the LINE Developers
   Console. Tech support: Telegram Tech Support Channel; email
   `unifiapps_review@unifi.me`.
5. **Review & feedback** —
   - LINE MINI App: LINE NEXT (pre-review) → LY (final approval). LY submission
     requires prior LINE NEXT review. Timeline **5–10 business days**.
   - LINE Login LIFF: LINE NEXT, submission via email. Up to **3 business days**.
   - Web: LINE NEXT, submission via email. Up to **3 business days**.

   **Demo submission** — LINE MINI App: review target is the staging version;
   submit the staging build to LINE NEXT for pre-review, then request LY approval
   via the LINE Developers Console. LINE Login LIFF & Web: review target is the
   LINE Login LIFF / Web version; submit by email to `unifiapps_review@unifi.me`
   with the Unifi App name, demo URL, and desired launch date.
6. **Launching Unifi Apps** — after onboarding, the launch date is finalized in
   coordination with your team; final technical and operational validations are
   completed before launch.

Contact: email `dl_unifiapps_support@linecorp.com`.

## Launching on Unifi Apps

**What Unifi Apps is** — enables projects to access 200M+ LINE Messenger users for
the full Web3 journey (wallet creation, dApps, stablecoin mission rewards, token/NFT
trading, app discovery and sharing) within LINE Messenger and the web.

**Who can apply** — projects creating meaningful value in the LINE and Kaia
ecosystems. Criteria: clear plans to distribute user rewards; a strong sustainable
monetization model; commitment to building a Kaia-native application; well-defined
KPIs and long-term growth objectives; demonstrated uniqueness/innovation; ability
to execute effective local/global marketing.

**Benefits** — social media exposure and curated marketing campaigns; dedicated
technical support for onboarding/integration; access to gas fee delegation
programs; tokenomics and ecosystem guidance with the Kaia Foundation.

### Qualifications & requirements

App categories: open to a wide range of service categories given a well-designed
game/service experience, a sustainable monetization mechanism, and a clear,
compliant user reward structure. Onboarding is subject to Unifi Apps and LINE Mini
App policies; certain categories may be restricted; DeFi-related apps may require
additional regulatory/compliance review. Apps already on Kaia (but not LINE) may
apply if: the app is deployed on Kaia, **and** the app exclusively integrates the
Unifi Apps SDK.

App build options: Web App (integrates the Unifi Apps SDK); LIFF App (integrates
the Unifi Apps SDK); LINE Mini App (integrates the Unifi Apps SDK including the
LINE IAP module; subject to additional LY review).

Additional requirements: a clearly defined in-app/in-game monetization strategy;
exclusive use of payment and wallet providers supported by the Unifi Apps SDK; full
localization of in-app content for core target markets; strict adherence to the SDK
payment and wallet connection methods. For projects deploying tokens: allocation of
a specified portion of tokens may be required; a detailed token launch plan must be
submitted; prior consultation and approval are required before the Token
Generation Event (TGE).

### Marketing package

An all-in-one marketing solution connecting a Unifi App to 196M+ users via LINE
Official Accounts, reward campaigns, and messaging tools: maximize exposure on
Unifi (banner placements on the Apps and Reward tabs); exposure on the LINE App
(LINE MINI App version exposed to Japan LINE users); LINE OA (featured on the
Global OA Channel, 2.2M+ users worldwide); social media amplification (Unifi & Kaia
Foundation X/community channels, AMA panels).

### Evaluation criteria

- **Team** — track record and market reputation for other projects.
- **Product/Service** — mass adoption potential (service intuitiveness, user
  accessibility, appeal); engagement drivers (social virality, gamification,
  originality, trend alignment).
- **Tokenomics** — Ecosystem/Dapp Tokens (native issuance on Kaia, airdrop
  plans/roadmap in Kaia/LINE ecosystem, sustainability, DEX/CEX listing potential);
  NFT (roadmap for integration with the Unifi NFT Market, dApp integration,
  trading-volume potential).
- **Marketing Capacity** — strategy for LINE-related marketing campaigns; use of
  pre-existing owned/collaborative channels for promotion.

### About Kaia

Kaia is an EVM Layer-1 blockchain formed by merging the **Klaytn** (Kakao) and
**Finschia** (LINE) blockchains. Key aspects: blazing fast (lowest transaction
latency among leading EVM L1s — 1-second block time, immediate finality); seamless
(account abstraction, gas fee delegation, integration with LINE and KakaoTalk
messenger apps — grants builders access to 250M+ users); interoperable (EVM
equivalence, planned CosmWasm support, cross-chain bridge integration).

### Developer resources (Kaia docs)

- Kaia Docs overview; Developer Hub; Public RPC endpoints; Oracles; Indexers; Block
  Explorers.
- Bridges: Stargate; Wormhole.
- Others: Gnosis Safe (treasury management); LayerZero OFT standard + Stargate
  (EVM multichain); Wormhole (EVM + non-EVM); Flipside Crypto and Dune Analytics
  (data dashboards); Kaiascan (contract labeling, on-chain transparency); SDKs and
  Libraries; Kaia Blockchain White Paper v1.2.

---

## Review guidelines

A Unifi App supports up to three versions; the required review guidelines depend on
the version(s):

| Version | Required guidelines |
|---|---|
| LINE MINI App | LINE MINI App Version Review Guidelines + "How to Build Successful Unifi Apps" |
| LINE Login LIFF | LINE Login LIFF & Web Version Review Guidelines + "How to Build Successful Unifi Apps" |
| Web | LINE Login LIFF & Web Version Review Guidelines + "How to Build Successful Unifi Apps" |

If the LINE MINI App version is included, **both** guideline sets are required. The
guidelines serve as a self-check checklist before review submission.

### LINE MINI App version review — self-checklist

- **Platform support** — LINE MINI App version supported.
- **SDK** — latest Unifi Apps SDK applied; ProjectId generated via Reown and domain
  verified.
- **Wallet Connect flow** — follows: Access Unifi Apps (LINE MINI App) → Launch
  Unifi Apps → Wallet Connect (e.g. at payment or reward step). Connected wallet
  address clearly shown. `disconnectWallet` feature available.
- **IAP approval** — applied for and received approval to use LINE IAP in the LINE
  Developers Console.
- **Payment features** — specific commercial transaction laws and fund settlement
  law notices displayed during purchase; payment precautions displayed; probability
  indicated if items are determined by probability; payment status notifications
  (UI/UX) provided; in-app virtual currencies and secondary currencies usable only
  within that LINE MINI App; purchase precautions shown before payment.
- **LINE integration** — LINE MINI App channel correctly created and Review
  environment ready; channel linked to the LINE Official Account; OA linked and set
  to `On (Normal)`; OA Rich Menu configured per the design guide.
- **Invite Friends** — ShareTargetPicker implemented for inviting friends.
- **UX/UI** — language localization based on browser settings or IP (English and
  Japanese must be supported); browser tab title `{Unifi Apps Name} | Unifi Apps`;
  OpenGraph set; Connect button complies with the design guideline; Close
  Confirmation Dialog provided.
- **Security** — never expose wallet private keys, `clientSecret`, or other
  sensitive credentials in frontend code, version control, or unsecured
  environments; store on the backend or a protected secrets manager.
- **Game content determination** — review the checklist; if it qualifies as a game,
  refer to the GRAC guideline.

### LINE Login LIFF & Web version review — self-checklist

Differences from the MINI App checklist:

- **Wallet Connect flow** — LINE version: Access (LINE Login LIFF) → Consent to
  Channel → Add Official Account → Launch → Wallet Connect. Web version: Access
  (Web) → Wallet Connect → Launch.
- **Payment features** — in-app item payment via the SDK (both Crypto **and**
  Stripe must be supported); `openPaymentHistory()` feature available; fiat/crypto
  prices displayed based on real-time rates (e.g. CMC, Kaia Open API).
- **LINE integration** — LINE Login, Messaging API channels, and a Published LIFF
  created; OA linked and `On (aggressive)` set (LINE Login Channel → LIFF → Add
  friend option).
- **Invite Friends** — LIFF version: ShareTargetPicker; Web version: a "copy invite
  link" feature.

### Game content determination checklist

Questions to determine whether a Unifi App qualifies as game content: Is the
primary purpose to provide entertainment or fun? Do different outcomes occur based
on user actions? Are there clear rules and constraints? Is there a game-like flow
with start, progress, and end? Are there obstacles to overcome and a sense of
accomplishment? If it qualifies as a game, refer to the GRAC guideline.

### Compliance (both checklists)

- **Gambling** — not permitted: providing cash/virtual assets as probability-based
  rewards using paid items; gacha mechanisms offering substantial value by
  probability using in-app currency/virtual assets; cash rewards via prize
  lotteries or slot games for a fee.
- **Violence** — extreme violent elements not permitted.
- **Crime and drug** — content promoting crime, drug use, abusive behavior, or
  inappropriate alcohol/tobacco depiction not permitted.
- **Discrimination and hate** — derogatory remarks about race, gender, or sexual
  orientation not permitted.
- **Explicitness** — sexually explicit content / sexual depictions not permitted.
- **Securities** — services that have securities not permitted (expectation of
  profit + investment of assets + assets in a joint enterprise + profits from a
  third party).
- **Intellectual property** — using unowned IP for commercial purposes not
  permitted.
- **Prize Contest Law** — for rewards contingent upon payment: paid below 1,000 YEN
  → max reward 200 YEN; paid ≥ 1,000 YEN → max reward 20% of paid volume.
- **Comprehensive regulatory compliance** — services generally difficult to
  reference per societal norms may not be permitted, subject to Unifi team review.

## How to build successful Unifi Apps (featured requirements)

The more a Unifi App meets these requirements during onboarding, the more likely it
is featured on Unifi:

- **Provision of services in various environments with Unifi Apps Connect** —
  build LINE version (LINE MINI App or LINE Login LIFF) and a Web version. For the
  LINE version, avoid Wallet Connect on the initial screen — enable it only when
  needed (payments, rewards), with a clearly visible entry point. For the Web
  version, Wallet Connect **must** be on the initial screen for account creation.
- **Provision of an in-app item store** — establish a sustainable revenue model.
  Payment method by platform: LINE MINI App must provide **IAP** as the primary
  method (Crypto/Fiat not supported in the MINI App version); LINE Login LIFF & Web
  must provide **Crypto and Fiat** ($KAIA, USDT, and STRIPE) via the SDK.
- **Provision of multi-language** — English and Japanese as default; other
  languages optional per target country. Classify user country by browser/system
  language settings or by IP.
- **Provision of point reward** — points used as in-app currency, supporting
  exchange with Unifi App tokens.
- **Provision of information about connected wallet** — show wallet type
  (`getWalletType()`), wallet address (`kaia_accounts()`, or `kaia_requestAccounts()`
  if not connected), and balance (`getErc20TokenBalanceWithDepositedBalance()` for
  USDT, `getErc20TokenBalance()` for others) on any screen.
- **Provision of payment status** — during payment, show "Payment in progress";
  after the payment-completion webhook, show item distribution; once complete,
  inform the user. Flow: Payment in progress → Payment completed → Item delivered.
- **Landscape mode** — operate in landscape even in portrait/auto-rotate if
  optimized for landscape.
- **Add To Home Screen** — Unifi provides a mobile home-screen shortcut, in two
  ways: available on the Unifi Apps detail screen within Unifi; or provided by the
  Unifi App via a shortcut URL —
  `https://www.dappportal.io/shortcut.html?dappId=dappId&register=1&&openExternalBrowser=1`
  (`dappId` from your bridge page URLs or support channel; `register=1` required;
  `openExternalBrowser=1` opens in an external browser from LINE Login LIFF).
- **Provision of maintenance mode** — show a maintenance screen during
  scheduled/emergency maintenance, including estimated end time and contact info.
- **Provision of close confirmation dialog** — show a confirmation popup when the
  page is about to close. See `references/unifi-pay.md` → "Reusable code snippets"
  for the React and Vanilla JS example code.

---

## FAQ

### SDK issuance & environment setup

- **When is the SDK issued?** Within 3 business days from submitting the SDK T&C.
  `clientId` and `clientSecret` are sent to the registered email.
- **Develop all three versions?** No — choose an onboarding combination. The LINE
  MINI App can only be onboarded by a Japanese corporation or sole proprietor in
  Japan, and serves Japan users only.
- **Configure chainId?** Yes — `chainId` distinguishes testnet vs mainnet. Default
  testnet `1001`. Use testnet during development; switch to mainnet `8217` for real
  payment testing or launch.
- **SDK version updates?** Announced via the official Telegram channel.
- **Integrate with Unity or Cocos?** Yes — port the Unity/Cocos project to WebGL
  and integrate as a web app using the SDK.
- **Sample code?** Yes — sample by method at `https://unifiapps-demo.unifi.me`;
  full integration sample at `https://github.com/techreadiness/dapp-starter`.

### Wallet Provider

- **"Invalid Origin" error / wallet connection fails?** The SDK works only on
  whitelisted domains. Share the test domain via Tech Support / email for
  registration.
- **Wallet connection window not opening?** Calling `DappPortalSDK.init()` on every
  request can malfunction — call it **once** at app startup and keep a singleton.
  In the LINE version, call `DappPortalSDK.init()` after `liff.init()` completes.
- **OKX Wallet fails to connect / requires re-entry with `kaia_requestAccounts` +
  `personalSign`?** Caused by timing conflicts during the signature step after
  connection — use `kaia_connectAndSign` instead.
- **Persist Wallet Connect session on re-entry/refresh?** Call `kaia_accounts` to
  check for an existing connected wallet; if found use it directly, else reconnect
  with `kaia_requestAccounts` or `kaia_connectAndSign`.
- **Why implement `disconnectWallet()`?** When the user lost the connected wallet's
  password; when the wallet connected via `wallet.dappportal.io` differs from the
  one in the app; or when the user wants to switch wallets.
- **Provide external wallets like MetaMask?** No — you must use the SDK's wallet
  integration. External wallet integrations (MetaMask) are not supported.
- **How are user accounts identified?** By wallet address in all three versions. In
  LINE MINI App / LINE Login LIFF, users can enter without connecting a wallet —
  temporarily create an account based on the LINE ID on first entry, then map the
  wallet address once connected.
- **Account compatibility across versions?** Yes — all three versions support LINE
  Wallet, OKX, and Bitget Wallet; if a user logs in with the same wallet address in
  multiple versions, maintain account compatibility.
- **Retrieve LINE ID / profile via LINE Login in the Web version?** No — the Web
  version does not support LINE Login (it is for non-LINE users); LINE features
  only in the LINE MINI App and LINE Login LIFF versions.
- **Distinguish LINE MINI App / LINE Login LIFF / Web environments?** Use
  `liff.isInClient()` — `true` → LINE environment (call `liff.init()` then
  `DappPortalSDK.init()`); `false` → web browser (call only `DappPortalSDK.init()`).
- **Bitget Wallet not in the wallet selection list?** Register a `projectId` —
  follow the Reown guide to create one, then submit it via Tech Support.
- **Unknown errors signing a transaction?** May occur if the wallet address
  requesting the signature differs from the actual signing address — verify the
  wallet connected via Web `https://wallet.dappportal.io/` or LIFF
  `https://liff.line.me/2006533014-r4jJyjy2` is the same address used for signing.

### Payment Provider

- **Support LINE IAP, Crypto, and Stripe?** Depends on the version — LINE MINI App:
  only LINE IAP (App Store policy); LINE Login LIFF / Web: both Crypto and Stripe.
- **Error during payment testing?** Check the parameters match the example request
  code; if it persists, contact Tech Support.
- **What are `lockUrl` and `unlockUrl`?** Useful for limited-stock products — they
  temporarily lock the quantity while a user purchases, preventing duplicate
  purchases. If the product has no quantity limit, set both to `null`.
- **Crypto works but Stripe fails (`500` on `startPayment()`)?** Usually the
  `imageUrl` parameter is invalid or not externally accessible — ensure the product
  image URL is valid and publicly accessible.
- **Webhook not received?** The `paymentStatusChangeCallbackUrl` must be publicly
  accessible (or whitelist the Unifi server IPs) and must return `HTTP 200 OK`.
- **`createPayment` succeeds but `startPayment` returns `400`?** Something went
  wrong in the `startPayment` phase — check the `paymentId` and error code; share
  details via Tech Support.
- **"Internal JSON-RPC error" / blank payment screen?** The `chainId` and
  `testMode` values do not match — testnet `chainId: 1001, testMode: true`; mainnet
  `chainId: 8217, testMode: false`.
- **Real payment testing?** Available only after settlement info is updated (after
  the Due Diligence form is submitted) — generally three business days before
  launch. Real payment tests are **non-refundable**.
- **Minimum payment amount?** USD minimum **$0.5**; KAIA minimum **0.01 KAIA**.
- **Apply exchange rates for crypto products?** Yes — provide a converted price
  based on the current market rate. The SDK does not convert; use CoinMarketCap or
  the Kaiascan Open API.
- **Why provide a payment history feature?** Increases user trust and helps CS
  (referencing `paymentId`). Implement `openPaymentHistory()` on the in-app store
  page or another frequently visited screen.

### LINE Integration

- **Create a LINE Developers account?** Create a LINE Business ID (Provider) using
  a personal LINE account or email — shared/team accounts are not supported.
- **Difference between LINE MINI App and LINE Login LIFF?** LINE MINI App: only
  Japanese corporations/sole proprietors can onboard; serves Japan LINE users only;
  must comply with App Store policies. LINE Login LIFF: no onboarding restrictions;
  serves global LINE users; not subject to App Store constraints (web-based).
- **`403` error accessing the LINE Login LIFF version?** LIFF URLs are inaccessible
  if the LINE Login channel is not in `Published` status — switch to Published when
  submitting the demo or testing.
- **Okay to publish the LINE Login LIFF before launch?** Yes — as long as you do
  not share the LIFF URL or test domain externally, general users won't have
  access. If you must test without publishing, add the reviewer's email as an admin
  to the LINE Login channel.

### Web3 Provider

- **"Sending transaction was failed after ~ try, network is busy"?** A temporary
  high-traffic error — retry the transaction.
