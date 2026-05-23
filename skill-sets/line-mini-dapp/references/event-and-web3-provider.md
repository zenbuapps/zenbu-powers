# Event Provider & Web3 Provider — Unifi Apps SDK

Source:
- `https://docs.unifi.me/unifi-apps-sdk/event-provider`
- `https://docs.unifi.me/unifi-apps-sdk/web3-provider`
- `https://docs.unifi.me/unifi-apps-sdk/web3-provider/gas-fee-delegation`

## Table of contents

- Event Provider — `getEventProvider()`, `eventProvider.callback()`
- Event Provider — Unifi Apps Server REST API (mission verification)
- Web3 Provider overview
- Gas Fee Delegation (Kaia fee delegation program)

---

# Event Provider

The Event Provider supports **OA Promotion** / Unifi Apps mission completion. It
lets a Unifi App report mission completion so Unifi can verify it and automatically
show a success banner. Introduced for "OA Promotion Phase 3" in SDK v1.4.7.

## DappPortalSDK.getEventProvider()

Returns the `EventProvider`.

```js
const eventProvider = DappPortalSDK.getEventProvider();

// When the mission is completed
const eventId: string = "eventId";          // Unique event ID provided by Unifi
const subMissionIndex: string = "1";        // Sub-mission index, starting from 0

await eventProvider.callback(eventId, subMissionIndex); // If verification is successful, a banner will be displayed automatically.
```

## eventProvider.callback(eventId, subMissionIndex)

Verifies mission completion on the Unifi side and automatically displays a success
banner when verification succeeds.

Parameters:

| Name | Type | Description |
|---|---|---|
| `eventId` | string | The unique identifier provided by Unifi. |
| `subMissionIndex` | string | The index of the sub-mission provided by Unifi. **Indexing starts from 0.** E.g. an "event item purchase" mission → `subMissionIndex = "0"`; an "Lv4 achievement" mission → `subMissionIndex = "1"`. |

Returns: none (`void`). If verification succeeds, a banner is displayed
automatically.

## Unifi Apps Server REST API implementation (mission verification)

To enable mission completion on the Unifi charts, your Unifi Apps **server** must
provide an API endpoint that lets Unifi verify whether a mission has been completed.

Information you must submit to Unifi:

- **API URL** (required)
- **Custom Header** (optional)

API requirements:

| Aspect | Value |
|---|---|
| Method | `GET` |
| Scheme | `https` |
| Read Timeout | **1 second** — if Unifi does not receive a response within 1s, the mission is treated as failed. |

**Custom header** (optional): you may include one custom header when the API is
called. No restriction on header key/value format. Only one custom header can be
used. Example: `x-dapp-custom-key: gq8g0Ah1MD98`.

**URL format**:

- Base URL: your Unifi Apps server URL.
- The `$identifier` query parameter **must** be included. `$identifier` is a
  placeholder that Unifi replaces with the user's wallet address (in lowercase).
- Example: `https://example.dapp.io/api/mission/1111?param=zzzz&identifier=$identifier`.

**Response body** — Content-Type `JSON`. If Unifi receives a successful response,
the user is considered to have completed the mission.

Mission complete:

```
HTTP/1.1 200 OK

{
  "result": true
}
```

Mission fail:

```
HTTP/1.1 200 OK

{
  "result": false
}
```

---

# Web3 Provider

The Web3 Provider section covers Web3 integration helpers. The parent
`web3-provider` page is a placeholder; the substantive content is **Gas Fee
Delegation**.

## Gas Fee Delegation

Kaia's **fee delegation** feature lets another account pay a transaction's gas fee,
so users can transact without spending their own `$KAIA` for gas. This is the Kaia
Fee Delegation Program for Kaia Wave builders. Apply via the Unifi apply form.

### Concept

Kaia fee delegation has three components:

- **Sender** — the account submitting the transaction (`from`).
- **Unifi Apps** — the relayer that relays the user-signed transaction to the fee
  payer server.
- **Fee payer server** — signs as fee payer, sends the signed transaction to the
  network, and returns the receipt.

Operation sequence:

1. The sender creates the transaction.
2. The sender specifies the fee payer's address in the transaction.
3. The sender signs the transaction.
4. The sender sends the signed transaction to the Unifi Apps backend.
5. The backend requests a transaction sign from the fee payer server.
6. The fee payer server signs the transaction as fee payer, sends it to the
   network, gets a receipt, and returns the transaction receipt.

### Prerequisites

- **SDK**: `ethers-ext` (one of the Kaia SDKs) must be installed. See
  `https://docs.kaia.io/references/sdk/ethers-ext/getting-started/`.
- **Wallet**: fee delegation is supported only by **Kaia Wallet mobile/extension**
  and **Unifi Wallet liff/web**. The Unifi Apps front-end must obtain a user-signed
  transaction via these wallets.

### Fee payer server URLs

| Network | URL | Notes |
|---|---|---|
| Mainnet | `https://fee-delegation.kaia.io` | Contract or sender must be registered. |
| Testnet | `https://fee-delegation-kairos.kaia.io` | — |

Fee payer addresses (used as `feePayer` in transactions):

- Testnet: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Mainnet: `0x22a4ebd6c88882f7c5907ec5a2ee269fecb5ed7a`

### Code — frontend (React): get a user-signed transaction

Fee-delegated value transfer example:

```js
import { Web3Provider } from "@kaiachain/ethers-ext";
import { TxType, parseKaia } from "@kaiachain/js-ext-core";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import { useEffect, useState } from "react";

// testnet
const feePayer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
// mainnet
const feePayer = "0x22a4ebd6c88882f7c5907ec5a2ee269fecb5ed7a";

const clientId = "30e…b89";
const chainId = "1001";

export default function home() {
 const [provider, setProvider] = useState<any>(null);
 const [accounts, setAccounts] = useState<string[]>([]);

 const initProvider = async () => {
   const sdk = await DappPortalSDK.init({
     clientId,
     chainId,
   });
   const provider = new Web3Provider(sdk.getWalletProvider());
   const accounts = await provider.send("kaia_requestAccounts", []);
   setProvider(provider);
   setAccounts(accounts);
 };

 const sign = async () => {
   const tx = {
     typeInt: TxType.FeeDelegatedValueTransfer,
     from: accounts[0],
     to: accounts[0],
     value: parseKaia("0.1").toHexString(),
     feePayer,
   };
   const signedTx = await provider.send("kaia_signTransaction", [tx]);

   // send the signed tx to backend
   console.log(signedTx);
 };

 useEffect(() => {
   initProvider();
 }, []);

 return (
   <div>
     <button onClick={sign}>Get user signed tx</button>
   </div>
 );
}
```

Fee-delegated smart-contract execution example:

```js
import { Web3Provider } from "@kaiachain/ethers-ext";
import { TxType, parseKaia } from "@kaiachain/js-ext-core";
import DappPortalSDK from "@linenext/dapp-portal-sdk";
import { useEffect, useState } from "react";

const feePayer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const clientId = "30e…b89";
const chainId = "1001";
const contractAddr = "0x95Be48607498109030592C08aDC9577c7C2dD505";
const abi = '[...]' //copy from https://docs.kaia.io/references/sdk/ethers-ext/v6/smart-contract/write/

export default function home() {
const [provider, setProvider] = useState<any>(null);
const [accounts, setAccounts] = useState<string[]>([]);

const initProvider = async () => {
  const sdk = await DappPortalSDK.init({
    clientId,
    chainId,
  });
  const provider = new Web3Provider(sdk.getWalletProvider());
  const accounts = await provider.send("kaia_requestAccounts", []);
  setProvider(provider);
  setAccounts(accounts);
};

const sign = async () => {
  const contract = new ethers.Contract(contractAddr, abi, provider);
  const contractCallData = await contract.increment.populateTransaction();
  const tx = {
    typeInt: TxType.FeeDelegatedSmartContractExecution, // fee delegated smart contract execution
    from: accountAddress,
    to: contractCallData.to,
    input: contractCallData.data,
    value: "0x0",
    feePayer: feePayer,
  };
  const signedTx = await provider.send("kaia_signTransaction", [tx]);
  // send the signed tx to backend
  console.log(signedTx);
};

useEffect(() => {
  initProvider();
}, []);

return (
  <div>
    <button onClick={sign}>Get user signed tx</button>
  </div>
);
}
```

### Code — backend: request `signAsFeePayer` from the fee payer server

Input: `userSignedTx` — the RLP-encoded transaction. Returns: the transaction
receipt.

```js
const { Wallet } = require("@kaiachain/ethers-ext/v6");
const ethers = require("ethers");

//testnet
const feePayerServer = "https://fee-delegation-kairos.kaia.io";
const provider = new ethers.JsonRpcProvider("https://public-en-kairos.node.kaia.io");

async function main() {
/* signed tx from user on frontend side */
const signedTxRLPEncoded = {
   raw: RLP encoded signed TX hex string
}
const response = await fetch(`${feePayerServer}/api/signAsFeePayer`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ userSignedTx:signedTxRLPEncoded }),
});
const data = await response.json();
console.log(data);
}

main();
```

### Code — balance check (is the fee payer's registered address funded)

```js
const checkBalance = async () => {
 // It's an address of contracts or senders you registered for fee delegation
 const address = "0x63d4f17d2a8a729fd050f7679d961b1dfbb1e3af";
 const result = await fetch(`${feePayerServer}/api/balance?address=${address}`);
 const isEnough = (await result.json()).data;
 console.log(isEnough ? "enough balance" : "not enough balance");
};
```

`GET {feePayerServer}/api/balance?address={address}` returns `{ data: boolean }`
where `data` is `true` when the balance is sufficient.

### Notes

- Gas fee delegation is supported for OKX Wallet from SDK v1.2.9, and for Bitget
  Wallet from v1.3.5. USDT payment supports gas fee delegation from v1.4.0.
- For the settlement-claim flow that also uses fee delegation (transaction
  `type: 49`), see `references/payment-provider.md` → "Claiming USDT for a STRIPE
  transaction".
