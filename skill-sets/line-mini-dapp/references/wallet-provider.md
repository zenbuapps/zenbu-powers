# Wallet Provider — Unifi Apps SDK

Source:
- `https://docs.unifi.me/unifi-apps-sdk/wallet-provider`
- `https://docs.unifi.me/unifi-apps-sdk/wallet-provider/domain-verification-via-reown`

## Table of contents

- WalletProvider overview (EIP-1193)
- `sdk.getWalletProvider()`
- `walletProvider.getWalletType()` + WalletType enum
- `walletProvider.request()` — JSON-RPC, all KAIA methods
- `walletProvider.disconnectWallet()`
- `walletProvider.getErc20TokenBalanceWithDepositedBalance()`
- `walletProvider.getErc20TokenBalance()`
- Error codes
- Compatible libraries
- Bitget Wallet domain verification via Reown

---

## Overview

`WalletProvider` follows the **EIP-1193** standard and supports the `EventEmitter`
interface defined in it. It exposes a JSON-RPC `request()` method plus convenience
methods for wallet type, disconnect, and ERC-20 balances.

The underlying blockchain is **Kaia** (chainId `1001` = Kairos testnet, `8217` =
Kaia mainnet). RPC methods are prefixed `kaia_` (Kaia's namespace, equivalent to
the legacy `klay_` namespace). For RPC methods not listed here, the SDK forwards
directly to the chain node — see Kaia's JSON-RPC API reference at
`https://docs.kaia.io/references/json-rpc/`.

## sdk.getWalletProvider()

Initializes the `walletProvider`, allowing developers to use wallet features.

```js
const walletProvider = sdk.getWalletProvider();
```

Parameters: none. Returns: `WalletProvider`.

## walletProvider.getWalletType()

Returns the type of the currently connected wallet.

```js
const walletType = walletProvider.getWalletType();
```

Parameters: none. Returns a `WalletType` enum value:

```ts
enum WalletType {
    Web = "Web",
    Liff = "Liff",
    Extension = "Extension",
    Mobile = "Mobile",
    OKX = "OKX",
    BITGET = "BITGET"
}
```

`Web` = Unifi Wallet via web social login; `Liff` = Unifi Wallet inside LINE;
`Extension` / `Mobile` = Kaia Wallet browser extension / mobile app; `OKX` and
`BITGET` are external wallets. (`OKX` was added in v1.2.8/v1.2.27 era; `BITGET` in
v1.3.0.)

This matters for USDT smart-contract transfers: when `walletType` is `Web` or
`Liff`, you must add `depositTokenAddress` / `depositAmount` to
`kaia_sendTransaction` (see `references/getting-started.md` → migration guide).

## walletProvider.request()

Provides JSON-RPC API access. Use it to query chain health and sign transactions.
**If you call it before a wallet is connected, the user sees a wallet-type
selection screen.**

```js
const getAccount = async() => {
   const accounts = await walletProvider.request({ method: 'kaia_accounts' }) as string[];
   return accounts[0];
}

const requestAccount = async () => {
   const addresses = await walletProvider.request({ method: 'kaia_requestAccounts' }) as string[];
   return accounts[0];
}

const connectAndSign = async (msg:string) => {
   const [account, signature] = await walletProvider.request({ method: 'kaia_connectAndSign', params: [msg]}) as string[];
   return [account, signature];
}

const getBalance = async(params: [account:string,blockNumberOrHash:'latest' | 'earliest'])=>{
   return await walletProvider.request({ method: 'kaia_getBalance', params: params });
}

const transaction = {
  from: 0xYourWalletAddress, //The currently connected wallet account can be retrieved using the kaia_accounts method.
  to: '0xRecipientAddress', //Please replace it with a valid wallet address.
  value: '0x10',
  gas: '0x5208', //general gas usage for Kaia transaction
};

const sendTransaction = async(transaction) => {
    const transactionHash = await walletProvider.request({ method: 'kaia_sendTransaction', params: [transaction]});
    return transactionHash;
};
```

`request(args)` parameters:

| Field | Type | Required | Description |
|---|---|---|---|
| `args.method` | string | Yes | RPC method name |
| `args.params` | `unknown[]` | No | Method parameters |

Returns: `Promise<unknown>` (cast to the type appropriate for the method).

### KAIA RPC methods

| Method | Params | Returns | Notes |
|---|---|---|---|
| `kaia_accounts` | `null` | `string[]` of connected addresses, e.g. `['Account1']` | Returns the list of addresses currently connected. **Returns `[]` (empty array) if no wallet is connected — does not show the wallet-connect screen** (fixed in v1.2.11; earlier versions showed the connect screen). |
| `kaia_requestAccounts` | `null` | `string[]` of addresses, e.g. `['Account1']` | Initiates wallet connection. Shows a wallet-provider selection window, returns addresses of the selected wallet. |
| `personal_sign` (EIP-191) | `[message: string, account: string]` | `signature` string, e.g. `"0xa3f2...1b"` | Initiates a sign procedure. Recommended for compatibility with various wallets including OKX. |
| `kaia_connectAndSign` (EIP-191) — **recommended** | `[message: string]` | `[account, signature]` array | Initiates wallet connection **and** signing in one step. Prompts the user to select a wallet provider, then signs the message. Most stable for OKX (avoids timing conflicts between connect and sign). |
| `kaia_getBalance` | `[account: string, blockNumberOrHash: string]` | balance hex string, e.g. `"0x00000000000000000"` | `blockNumberOrHash` may be `latest` (most recent block) or `earliest` (genesis block 0). Returns the balance in **kei**, the smallest unit of KAIA. **1 KAIA = 10^18 kei.** |
| `kaia_sendTransaction` | `[{ from, to, value, gas }]` (see below) | `transactionHash` string | Constructs and sends a transaction. `from` must be an account obtained from `kaia_accounts`, `kaia_requestAccounts`, or `kaia_connectAndSign`. |
| `kaia_signTransaction` | `[tx]` | signed (RLP-encoded) transaction | Signs a transaction without broadcasting — used for fee-delegated flows (see `references/event-and-web3-provider.md`). |

`kaia_sendTransaction` transaction object:

```
[{
    from: string,
    to: string,
    value: string,
    gas: string
}]
```

Older RPC method names used the `klay_` prefix and a string `type`/`SmartContractExecution`;
newer ones use `kaia_` and a numeric `typeInt` (e.g. `typeInt: 48` for smart
contract execution, `typeInt: 49` for fee-delegated). `personal_sign` is the
EIP-191 personal sign; legacy `kaia_signLegacy` triggers an explicit error on the
OKX wallet (v1.2.5+).

### Error object (request)

A user-cancelled or failed request rejects with an error object:

```js
{code: -32001, message: 'User canceled'}
```

| Code | Meaning / examples |
|---|---|
| `-32001` | User cancelled. Variants: `{code: -32001, message: "User canceled"}`; `{code: -32001, message: "User closed popup", data: null}` (dismissed the wallet connection popup); `{code: -32001, message: "User denied message signature"}` (dismissed signature popup); `{code: -32001, message: "User denied transaction send."}` (dismissed transaction popup). |
| `-32002` | `REQUEST_REJECTED` — user cancelled connection (e.g. during `kaia_connectAndSign`). |
| `-32004` | Invalid `from` address. Retry methods after calling `walletProvider.disconnectWallet()`. |
| `-32005` | User logged out due to incorrect password input. Retry methods after `walletProvider.disconnectWallet()`. |
| `-32006` | Wallet is not connected yet. If the error occurs while connected, retry methods after `walletProvider.disconnectWallet()`. If it occurs while not connected, connect the wallet first. |

If a transaction signature is requested from a wallet address that differs from the
actual signing address, an unknown error occurs — verify the connected wallet
(Web: `https://wallet.dappportal.io/`; LIFF: `https://liff.line.me/2006533014-r4jJyjy2`)
matches the signing address.

For "Sending transaction was failed after ~ try, network is busy" — a temporary
high-traffic error; retry the transaction.

## walletProvider.disconnectWallet()

Disconnects the wallet. A confirmation window appears to confirm the disconnection.
**This is an async function** (changed in v1.2.12 — earlier it was synchronous and
refreshing immediately after caused the OKX wallet not to disconnect).

```js
const disconnectWallet = async ()=>{
    await walletProvider.disconnectWallet();
    window.location.reload();
}
```

Parameters: none. Returns: none (`Promise`).

After calling it, you can select a wallet type again on a subsequent
`walletProvider.request({method: "kaia_requestAccounts"})` without any extra
implementation (v1.2.12+).

Implement `disconnectWallet()` when: the user lost the password of the connected
wallet; the wallet connected via `wallet.dappportal.io` differs from the one in the
Unifi App; or the user wants to switch wallets. In those cases access may be
restricted, and disconnecting lets the user connect a new wallet. The review
guidelines require the disconnect feature to be available.

## walletProvider.getErc20TokenBalanceWithDepositedBalance()

Returns the **total** amount = on-chain USDT balance **+** USDT balance deposited
in Unifi. **Use this for USDT** (because Unifi auto-deposits USDT, the pure
on-chain balance often reads zero). Added in v1.5.0.

```js
const getErc20TokenBalanceWithDepositedBalance = async(contractAddress:string,account:string)=> {
    return await walletProvider.getErc20TokenBalanceWithDepositedBalance(contractAddress,account);
}

const USDTContractAddress = '0xd077a400968890eacc75cdc901f0356c943e4fdb';
const account = 'my_account_address';
getErc20TokenBalanceWithDepositedBalance(USDTContractAddress, account).then(balance => {
    const formattedUSDTBalance = Number(microUSDTHexToUSDTDecimal(balance as string)).toFixed(2);
    //microUSDTHexToUSDTDecimal is format function to transform hexadecimal string to decimal string
    //https://github.com/techreadiness/unifi-apps-starter/blob/main/src/utils/format.ts
    console.log(formattedUSDTBalance);
    //0.00
})
```

Parameters:

| Name | Type | Required | Description |
|---|---|---|---|
| `contractAddress` | string | Yes | ERC-20 token contract address |
| `account` | string | Yes | Wallet address to query |

Returns: a **64-byte hexadecimal string**. The returned value includes the token's
decimal scaling per its `decimals` spec — USDT uses a decimal scale of 10⁶, DELABS
uses 10¹⁸. Convert with a helper such as `microUSDTHexToUSDTDecimal` (see the
starter repo's `src/utils/format.ts`).

## walletProvider.getErc20TokenBalance()

Returns the **on-chain** balance of an ERC-20 token only (no Unifi deposit balance).

```js
const getErc20TokenBalance = async(contractAddress:string,account:string)=> {
    return await walletProvider.getErc20TokenBalance(contractAddress,account);
}

const USDTContractAddress = '0xd077a400968890eacc75cdc901f0356c943e4fdb';
const account = 'my_account_address';
getErc20TokenBalance(USDTContractAddress, account).then(balance => {
    const formattedUSDTBalance = Number(microUSDTHexToUSDTDecimal(balance as string)).toFixed(2);
    //microUSDTHexToUSDTDecimal is format function to transform hexadecimal string to decimal string
    //https://github.com/techreadiness/dapp-starter/blob/main/src/utils/format.ts
    console.log(formattedUSDTBalance);
    //0.00
})
```

Parameters: `contractAddress` (string, required), `account` (string, required).
Returns: a 64-byte hexadecimal string with the token's decimal scaling applied.
Added in v1.4.0.

**Guidance**: for USDT use `getErc20TokenBalanceWithDepositedBalance()`; for other
tokens use `getErc20TokenBalance()`.

## Compatible libraries

The `walletProvider` can be wrapped by Kaia-ecosystem libraries:

- ethers-ext: `https://docs.kaia.io/references/sdk/ethers-ext/getting-started/`
- web3js-ext: `https://docs.kaia.io/references/sdk/web3js-ext/getting-started/`
- caver-js: `https://docs.kaia.io/references/sdk/caver-js/`

Example: `new Web3Provider(sdk.getWalletProvider())` from `@kaiachain/ethers-ext`.

## Wallet connect flow (UX rules)

Per the review guidelines, the wallet connection flow differs by version:

- **LINE MINI App**: Access Unifi Apps → Launch Unifi Apps → Wallet Connect (e.g.
  at payment or reward step). Do NOT connect on entry.
- **LINE Login LIFF**: Access Unifi Apps → Consent to Channel → Add Official
  Account → Launch Unifi Apps → Wallet Connect (e.g. at payment or reward step).
- **Web**: Access Unifi Apps → **Wallet Connect** → Launch Unifi Apps. For the Web
  version, Wallet Connect must be available on the initial screen for account
  creation. (Note: "Wallet Connect" here means the SDK's wallet integration, not
  LINE Login.)

Always show the connected wallet address to the user; expose `getWalletType()`,
`kaia_accounts()` (and `kaia_requestAccounts()` if not connected),
`getErc20TokenBalanceWithDepositedBalance()` for USDT and `getErc20TokenBalance()`
for other tokens. External wallets such as MetaMask are **not** allowed — you must
use the SDK's wallet integration.

### Wallet session persistence

To keep a session across re-entry/refresh: first call `kaia_accounts` to check for
an existing connected wallet. If found, use it directly. If not found, reconnect
with `kaia_requestAccounts` or `kaia_connectAndSign`.

## Bitget Wallet — domain verification via Reown

The SDK provides **Bitget Wallet** through WalletConnect. To offer it, you must
complete the WalletConnect domain verification first and share the **ProjectId**
generated by Reown with the Unifi team.

> Even after upgrading to the SDK version that supports Bitget, you cannot use
> Bitget Wallet unless domain registration and ProjectId submission are completed.

Steps (DNS-record authorization):

1. **Access the Reown dashboard** (`https://dashboard.reown.com/`). Log in, go to
   the Domain tab, add the domains you want to allowlist.
2. **Submit the ProjectId** to the Unifi team after verification (Telegram
   `@unifiapps_official`, or your existing tech support channel) so it can be added
   to the Unifi Apps SDK.

Rules:

- Reference: `https://docs.reown.com/cloud/verify`.
- The domain must be registered **entirely including protocol** (`http://` or
  `https://`).
- Ensure **no trailing slash** when registering the record. Good: `https://unifi.io`.
  Bad: `https://unifi.io/`.

If a `projectId` is registered with the SDK, Bitget Wallet is supported; otherwise
it is not shown in the wallet list. Exception: if the Bitget Wallet extension is
installed in a PC environment, Bitget is offered, but an error occurs if domain
verification and ProjectId registration are not complete.
