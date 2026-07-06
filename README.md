# TSC Test Dashboard

**Developer testing UI for the TSC (Test Sale Contract).**
Lets you connect a wallet and manually run the full approve → buy → sell
loop from a normal browser — no Remix required.

---

## Purpose

A minimal, functional dashboard so anyone on the team can test the TSC
contract like a normal user: connect wallet, check balances, buy TTRS with
mUSDT, sell TTRS back for mUSDT, and see every transaction's status and hash.
Not a production or public-facing UI — it's a QA tool.

---

## Network

**BNB Smart Chain Testnet only** (chain ID `97`). The app detects the wrong
network and offers to switch/add it automatically — it will not let you
transact on mainnet.

---

## Contract addresses

| Contract | Address |
|---|---|
| mUSDT | `0xF77731BEd6153bB153Ec7147BcabC14A8C0E4Cc8` |
| TTRS | `0xF37446A2Cd7f542f8d1667d24FEFCEAacee10a2d` |
| TSC | `0x13275E9365471d2505a2F1F8b2C85b9483eDc29d` |

These are also read from `.env` at runtime (see below) — nothing is
hardcoded in the source, so pointing this dashboard at a different
deployment is a one-file config change.

---

## Tech stack

React 19 + Vite · Tailwind CSS · ethers.js v5 · MetaMask

---

## Project structure

```
tsc-dashboard/
  src/
    components/
      WalletConnection.jsx
      MyBalances.jsx
      TSCReserves.jsx
      BuyTTRS.jsx
      SellTTRS.jsx
      TransactionLog.jsx
      HashChip.jsx        (full hash + copy button + BscScan link)
      ui.jsx              (shared Card / Row / Banner / StatusBadge)
    lib/
      contracts.js         (all addresses/decimals/amounts, from .env)
      abis.js
      wallet.js             (connect, network switch, error messages)
    App.jsx
    main.jsx
  public/
  screenshots/
  .env.example
  .gitignore
  README.md
  package.json
```

---

## Setup

```bash
git clone <this-repo-url>
cd tsc-dashboard
npm install
cp .env.example .env
```

`.env.example` already contains working testnet values — you only need to
edit it if you're pointing at a different deployment.

## Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Requirements
- MetaMask browser extension
- A test wallet with tBNB (for gas) and mUSDT/TTRS test tokens
- MetaMask able to add/switch to BNB Smart Chain Testnet (the app prompts
  for this automatically)

### Production build
```bash
npm run build
npm run preview
```

---

## Environment variables

| Variable | Meaning | Example |
|---|---|---|
| `VITE_TSC_ADDRESS` | TSC contract | `0x1327...c29d` |
| `VITE_MUSDT_ADDRESS` | mUSDT token contract | `0xF777...4Cc8` |
| `VITE_TTRS_ADDRESS` | TTRS token contract | `0xF374...a2d` |
| `VITE_CHAIN_ID` | BSC Testnet chain id | `97` |
| `VITE_CHAIN_ID_HEX` | same, as hex (for wallet calls) | `0x61` |
| `VITE_BSCSCAN_TESTNET_URL` | Explorer base URL | `https://testnet.bscscan.com` |
| `VITE_MUSDT_DECIMALS` / `VITE_TTRS_DECIMALS` | Token decimals | `6` / `18` |
| `VITE_BUY_MUSDT_AMOUNT` / `VITE_BUY_TTRS_AMOUNT` | Buy trade size | `10` / `10` |
| `VITE_SELL_TTRS_AMOUNT` / `VITE_SELL_MUSDT_AMOUNT` | Sell trade size | `10` / `9` |

**`.env` is git-ignored and is never pushed.** Only `.env.example` (safe
placeholder/shared testnet values, zero private keys) is committed.

---

## How the approve → buy → sell flow works

ERC-20 tokens don't let a contract move your tokens on its own — you must
first **approve** it as a spender. Every trade is therefore two transactions:

1. **Approve mUSDT** — `mUSDT.approve(TSC_ADDRESS, 10)`. Raises your
   on-chain allowance for the TSC contract; no tokens move yet.
2. **Buy TTRS** — `TSC.buyTTRS()`. The contract pulls the 10 mUSDT you just
   approved and sends back 10 TTRS.
3. **Approve TTRS** — `TTRS.approve(TSC_ADDRESS, 10)`, same idea, for the
   token you're about to sell.
4. **Sell TTRS** — `TSC.sellTTRS()`. The contract pulls the approved 10 TTRS
   and sends back 9 mUSDT.

The dashboard checks the **real on-chain allowance** (not just "did I click
approve") before enabling Buy/Sell, so the buttons stay correctly disabled
even across a page refresh. After every confirmed transaction, balances,
reserves, and allowances refresh automatically.

---

## Dashboard screenshots

_Images live in `/screenshots` — add them using the file names below and they
render here automatically on GitHub._

| | |
|---|---|
| Wallet connected, correct network | ![wallet](screenshots/wallet-connected.png) |
| Balances before Buy | ![before-buy](screenshots/balances-before-buy.png) |
| Buy 10 TTRS success | ![buy-success](screenshots/buy-success.png) |
| Balances after Buy | ![after-buy](screenshots/balances-after-buy.png) |
| Balances after Sell | ![after-sell](screenshots/balances-after-sell.png) |
| Final TSC reserves | ![final-reserves](screenshots/final-reserves.png) |

---

## Transaction proof

**This section is generated automatically by the dashboard itself** — click
through Approve mUSDT → Buy → Approve TTRS → Sell in a live session, and a
**"README Proof Block"** panel appears in the UI with a ready-to-paste
markdown table (real hashes + real before/after balances/reserves, each
captured directly from the chain at the moment it happened) and a **Copy**
button. Paste its output below, replacing this line.

| Transaction | Hash | Status |
|---|---|---|
| mUSDT approval | `PENDING — run the flow, then paste from the dashboard's Proof Block` | ⏳ |
| TTRS approval | `PENDING — run the flow, then paste from the dashboard's Proof Block` | ⏳ |
| `buyTTRS()` | `PENDING — run the flow, then paste from the dashboard's Proof Block` | ⏳ |
| `sellTTRS()` | `PENDING — run the flow, then paste from the dashboard's Proof Block` | ⏳ |

Expected balance changes once the above are filled in:

**After Buy 10 TTRS:** user mUSDT −10, user TTRS +10, TSC mUSDT reserve +10, TSC TTRS reserve −10
**After Sell 10 TTRS:** user TTRS −10, user mUSDT +9, TSC TTRS reserve +10, TSC mUSDT reserve −9

_This is the only part of the repo still pending — it needs a live, funded
wallet to actually run the flow, since real hashes can only come from real
signed transactions._

---

## Assumptions about the TSC contract ABI

The assignment brief didn't include the deployed contract's ABI, so
`src/lib/abis.js` assumes:
- `getTSCBalances()` returns `(musdtReserve, ttrsReserve)` in that order
- `buyTTRS()` and `sellTTRS()` take **no arguments** — they pull whatever was
  already approved (fixed at 10 mUSDT / 10 TTRS per the assignment)

If the real contract differs, only `src/lib/abis.js` needs updating —
nothing else in the app changes.

---

## Known issues / next improvements

- Trade size is fixed at 10 mUSDT / 10 TTRS via `.env`, not a free-amount
  input field yet
- Contract ABI above is inferred pending confirmation against the real
  deployed bytecode/ABI
- No automated test suite — this is a manual QA tool by design
- Transaction proof section above needs real hashes + screenshots from a
  live test run (see previous section)
