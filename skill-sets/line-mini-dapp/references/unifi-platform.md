# Unifi Platform — Apps Listing, NFT Drops, Rewards, Tokens

Source:
- `https://docs.unifi.me/unifi` (home, Apps, Trade, My)
- `https://docs.unifi.me/unifi/guide-to-applying-apps-images-and-information`
- `https://docs.unifi.me/unifi/how-to-mint-nfts-and-set-up-drops.` (+ children)
- `https://docs.unifi.me/unifi/reward` (+ `how-to-monitor-mission-completion`)
- `https://docs.unifi.me/unifi/fungible-token-information`
- `https://docs.unifi.me/unifi/policy/grac-south-korea`
- `https://docs.unifi.me/extra-packages-1/growth-competition` (+ `playbook-for-teams`)

## Table of contents

- Unifi platform screens (Home, Apps, Market, Trade, My)
- Applying Apps images & information
- NFT minting & Drops (collections, stages, mint flow)
- Rewards (token / NFT missions, mission monitoring)
- Fungible Token information
- GRAC policy (South Korea)
- Growth Competition

This section describes the **Unifi consumer platform** (where users discover Unifi
Apps, mint NFTs, complete missions). Most of these are submission/registration
processes handled with the Unifi Operations (Ops) team rather than SDK calls.

---

## Unifi platform screens

- **Home** — shows the interest rate for depositing USDt on Unifi; users preview
  interest for a given deposit. Additional interest-rate benefits apply for
  depositing above a threshold or making payments within Apps. Apps and rewards on
  Home are selected from those running USDt missions.
- **Apps** — introduces Apps played by millions of users; announces ongoing events
  and missions. The top section can announce events or scheduled TGE news. Can
  feature ongoing missions with USDt, Kaia, or NFT rewards (up to 3 missions;
  exposure priority by internal review — reward-distribution seamlessness, mission
  difficulty, App popularity). The lower section exposes all Apps; promoted Apps can
  be in the Editor's Pick section; sorting by category, popularity, latest updates.
- **Market** — users buy/sell NFTs issued by the Unifi team. Top area: user-to-user
  buying/selling (P2P trading). Ranking area: rankings by trading volume (daily,
  weekly, monthly). Drops area: B2C sales — App teams can sell NFTs issued in
  discussion with the Unifi team.
- **Trade** — users swap held tokens for USDt, KAIA, or other KAIA-based tokens;
  check tokens acquired by playing Apps; navigate to Apps for collecting more
  coins. Top/middle sections show tokens scheduled for or successfully listed.
- **My** — displays the user's held assets — owned KAIA-based FTs and NFTs,
  interest earned from USDt deposits, and the % change in current FT value vs the
  purchase time. Users can add other wallets to check assets held there.

## Guide to applying Apps images & information

Submit these materials/info to the Operations team to feature your App on Unifi:

| Item | Field | Notes / size |
|---|---|---|
| A | Apps Logo | Featured image for Apps, **420×420** |
| B | Apps Name | Only English allowed |
| C | Official Site | Official website for the project/service |
| D | Category | Select **one**: Social, Game, Contents, DeFi, SocialFi, RWA, DePIN, AI, Memes, Payment |
| E | LINE OA | LINE OA URL (`line.me/R/ti/p/@BasicID` — check the Basic ID in LINE Account Manager → Settings → Account Settings → Account Details) |
| F | Play URL | Provide both the WEB version and the LIFF version. External web = URL where the App can be played on the web |
| G | Apps info | Compelling introductory copy. All languages mandatory: EN, KR, JA, TW, TH |
| H | Tag | Up to 5 tags related to your app |
| I | Screenshot | Images representing the App, max 7, **600×1296** |
| J | SNS Account | X (Twitter), Facebook, Medium, Discord |
| K | Apps to be listed On Coin | Wide horizontal image for the TGE/Apps promotion area, **1005×468** |

## NFT minting & Drops

**All NFTs must be minted by the Unifi Apps team.**

### Process to submit information for NFT Collections & Drops

1. **Submit information** — to launch NFT Drops or run an NFT Airdrop, submit the
   relevant Collection and Drops info. Complete the Excel template in the BOX
   folder provided by the Ops team; upload the accompanying meta file and image
   files to the same location.
2. **Register NFT Collections** — the submitted info is registered to the Unifi
   Apps database (executed by the Unifi Apps team on your behalf). Apps can be
   assigned to multiple NFT collection contracts.
3. **Deploy contract for NFT Collections assigned to Apps** — the contract is
   deployed by the Unifi Apps server. Once confirmed, it is assigned to the App
   (matching the unique contract of the App within Unifi Apps; not a permission
   grant).
4. **Set Drops** — the Unifi Apps team configures Drops from the gathered info.
   When setting up a Drop, the NFT minting limit is required. A Drop can have
   multiple **stages**; stage sale dates **cannot overlap**. Configured stages show
   in the Market tab; once each stage's time arrives, users can mint.

### Configurable Drop stages

- **Airdrop stage** — a specific wallet receives NFTs for Airdrop purposes. If the
  Airdrop stage is mandatory in the collection, it must occur before the Presale
  and Public Sale stages; if an Airdrop must occur during Presale/Public, use a new
  collection.
- **Presale stage** — purchasable only by pre-registered users (Allowlist). Request
  an allowlist stage via the Ops Support channel.
- **Public stage** — purchasable by any Unifi App user. The public stage **must be
  the very last** stage; stages can be added until the public stage begins.

### Collection information

Before issuing a collection, review two items:

| # | Field | Notes |
|---|---|---|
| 1 | Token symbol | Symbol of the collection (e.g. Collection CryptoPunks → Symbol PUNKS). Not visible on screen; verifiable on-chain. |
| 2 | Create Earning | Fee the Creator receives in C2C transactions: `Wallet Address | %(Fee)`. The Create Earning fee can be set **1%–10%**. |

Collection info & image assets (a Sale is not mandatory — an Airdrop-only flow is
possible):

| Item | Field | Notes / size |
|---|---|---|
| A | Collection Name | Representative name; cannot be changed once decided; cannot duplicate an issued collection. Only English. |
| B | Collection Description | All languages must be filled. |
| C | Collection Main Image | Represents the collection, **408×408**. |
| D | Collection Background Image | Represents the collection's characteristics, **1125×459**. |

### Upload NFT information

- **A. Original Contents (mandatory)** — Collection Name (one of the issued
  collections) + Meta (the NFT metadata in the specified format). The meta file
  must contain all attributes of every NFT to mint — minting 10,000 NFTs requires
  10,000 lines of data, even if all info is identical.
- **B. Pre-reveal (optional)** — used when original content must be disclosed at a
  specific time (unnecessary if the NFT at purchase equals the NFT being held).
  Fields: Collection Name; Pre-reveal Image (**600×600**); Description (supported
  languages); Requested Reveal Date (`yyyy-mm-dd tt:mm` in UTC — fill only for a
  pre-reveal).

### Drops information

Order of writing: 1st Collection & Total Supply; 2nd Airdrop; 3rd Presale; 4th
Public. If no Drops are planned, writing is not required. Drops Type: Airdrop,
Presale, Public.

- **a. Collection & Total Supply** — Collection name; Total Supply = sum of Airdrop
  + Public. Recommended to issue no more than 100,000. The initially determined
  Drops amount cannot be changed; additional issuance requires a new collection.
- **b. Airdrop (optional)** — Wallet Address (address to receive the airdrop);
  Minting Amount (Apps receive these from Team Unifi Apps, then send from the Apps
  Wallet to the User Wallet); Due Date (must precede the presale/public sale;
  `yyyy-mm-dd tt:mm` UTC).
- **c. Presale (optional)** — Stage name (English only); Thumbnail Image
  (landscape, **1005×630**); Drops Image (square, **1005×1005**); Drops price (per
  NFT, **only $KAIA**); Limit the mint amount per wallet; Allowlist (Whitelist) of
  wallet addresses; Opened at / Closed at (exact time including minutes).
- **d. Public (optional)** — Stage name (English only); Thumbnail Image (**1005×630**);
  Drops Image (**1005×1005**); Drops price (**only $KAIA**); Limit per wallet;
  Opened at / Closed at.

### How to mint NFT

1. **NFT minting for Airdrops** (Ops Support) — executed by the Ops Support team.
   Provide collection info, recipient wallet addresses, and airdrop details
   (quantity, duration). Ops mints and airdrops the NFTs to the provided wallets.
2. **NFT minting for Marketplace sales** (Unifi Apps) — NFTs sold on the
   Marketplace are minted immediately upon purchase by the user, complying with the
   collection info set before sales registration; minting is sequential per the
   order in the `meta.csv` file provided by the App team.

## Rewards

The distribution of Tokens (KAIA or USDT), NFTs, and Points based on condition
fulfillment must be **implemented directly within the App** (see Kaia JSON-RPC at
`https://docs.kaia.io/references/json-rpc/references/`). Only missions with these
features fully implemented can be listed on Unifi Apps. NFT minting must be carried
out exclusively through Unifi Apps.

### 1) $Token (KAIA or USDT) reward

| Field | Notes |
|---|---|
| Reward Token type | KAIA and USDt missions can be configured separately — select the mission. |
| Mission Name | Multilingual; 15-character limit. |
| Reward Amount per Mission | $Token (KAIA or USDT) reward distribution amount. |
| Wallet Address | The `from` address the App uses to airdrop $KAIA / $USDt. A separate wallet address is required per event if multiple events run at once. **Contract addresses are not allowed.** |
| Reward URL | Submit URLs for two versions: LIFF and External Web. |
| Opened at / Closed at | Specify the exact time including minutes. |

### 2) NFT reward

| Field | Notes |
|---|---|
| Mission Name | Multilingual; 15-character limit. |
| Wallet Address | The `from` address the App uses to airdrop the NFT. Contract addresses not allowed. |
| Collection Name | The collection name (or contract address) of the NFT to airdrop. |
| Reward URL | Submit URLs for LIFF and External Web. |
| Opened at / Closed at | Specify the exact time including minutes. |

### How to monitor mission completion

Each reward (KAIA/USDt, NFT, point) implemented within the App is listed and
tracked on Unifi Apps:

- Unifi Apps tracks the transactions of the **EOA Wallet** (for rewards) submitted
  by the App. When a transaction of a specific amount occurs from that wallet to a
  specific user's wallet, Unifi recognizes the mission as completed and the reward
  as distributed. **A separate wallet must be prepared for each mission** — if the
  same wallet is used for multiple missions, Unifi cannot tell which mission was
  completed.
- **NFT reward** — similar tracking: Unifi tracks the transactions of the EOA
  Wallet from which the submitted NFT is distributed, referencing the contract
  address. The EOA Wallet must be submitted to the Unifi Apps team when minting the
  NFT; the team airdrops the NFT to that wallet. Tracking works only when a **single
  NFT is distributed in a single event**.

## Fungible Token information

To expose a token in the Apps Wallet or Kaia Wallet search list, submit:

| Field | Notes / example |
|---|---|
| Token Name | English only. E.g. `Tether USD`. |
| Token Ticker | Symbol for the fungible token. E.g. `USDt`. |
| On Kaiascan | The contract address where the FT is deployed. E.g. `0xd077a400968890eacc75cdc901f0356c943e4fdb`. |
| Token Image | Upload the token image. |
| Web Site | The FT's official website. E.g. `https://tether.io`. |

## GRAC policy (South Korea)

For users accessing from a South Korea-based IP, only Unifi Apps that have obtained
a rating classification from **GRAC** (Game Rating and Administration Committee) may
be served normally. If a Unifi App is game-like and lacks a valid rating, Korean-IP
users see "This service is not available in your country" and access is blocked
when they execute the App.

- **Scope** — applies to Unifi Apps with game-like characteristics (progression,
  rewards, competition, chance-based items). Non-game utilities are generally out
  of scope, subject to review.
- **Effective date** — from August 22, 2025.
- **Policy summary** — Allow: Korean IP **and** approved GRAC status. Block: Korean
  IP **and** no approved GRAC status. Exception: non-game Unifi Apps.
- **What developers must provide** — GRAC rating info (rating, decision number,
  decision date); evidence (certificate PDF/image and/or official lookup URL).
- **Game content checklist** — Entertainment Purpose (is the primary purpose
  entertainment/fun?); Interactivity (do different outcomes occur based on user
  actions?); Rules System (clear rules and constraints?); Progression Structure
  (game-like flow with start, progress, end?); Challenges and Achievements
  (obstacles to overcome and a sense of accomplishment?).

## Growth Competition (Extra Packages)

The Unifi Apps Growth Competition fosters rapid user growth, rewards top-performing
projects, and drives market traction. It identifies standout Unifi Apps by monthly
active user (MAU) milestones and on-chain token holder counts.

- **Summary** — competitions based on key metrics select top Unifi Apps for
  marketing and liquidity support. A ranking dashboard is public on Kaia Square
  (`https://square.kaia.io/Competition`), updated weekly. The Top 10 Unifi Apps are
  highlighted; among them, 2 teams are selected for growth packages.
- **Participation eligibility** — all Unifi Apps built on Kaia are automatically
  enrolled. For metric tracking, submit the App info and smart contract addresses
  (NFT, token, payment contracts) via the provided link. To verify tracking, see
  `https://dune.com/queries/4773070`. New contracts can be sent to `portal@kaia.io`.
  Teams that haven't issued tokens must airdrop tokens at TGE.
- **Leaderboard metrics** — Weekly On-chain Active Accounts (high weight, accounts
  holding ≥ a minimum KAIA amount, e.g. 1 KAIA, with ≥1 transaction to the App
  contract get higher weight); Weekly On-chain Transactions (low weight); Unifi
  Apps Revenue (high weight, crypto and cash payments based on LINE data). Rankings
  are standardized across user, wallet, and revenue data with a weighted score.
- **Growth Support Package** — the 2 selected teams receive up to **$0.5M**
  marketing/user rewards and up to **$0.1M** liquidity support (post-TGE, deployed
  as $KAIA liquidity in DEX pools).

### Playbook for teams

To maximize the score, excel at weekly on-chain active accounts, weekly on-chain
transactions, and revenue:

- **On-chain active accounts** — greater weight for users holding more than a
  minimum KAIA amount (e.g. 1 KAIA), maintained sufficiently to cover multiple
  transaction fees; users must send ≥1 transaction to the App's smart contract per
  week. Strategy: distribute KAIA to as many users as possible; optimize smart
  contracts (payments, tokens, NFTs) for on-chain activity, especially asset-transfer
  transactions like swaps. Contracts are tracked by the addresses submitted to the
  Kaia Portal.
- **On-chain transactions** — do not over-focus; they carry less weight.
  Transactions sent directly by Unifi Apps operators are filtered out.
- **Prohibited** — no fraudulent activity (bot-generated actions). Data is monitored
  in real time; excessive bot activity → disqualification.
- **Revenue** — crypto payments can be advantageous for on-chain data (no extra
  weight); prioritize stability and easy wallet connection / payment completion.
