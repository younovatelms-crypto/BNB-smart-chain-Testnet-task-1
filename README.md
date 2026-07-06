# TSC Test Dashboard

A clean, responsive React + Vite + Tailwind dashboard for manually testing the
**TSC (Test Sale Contract)** on **BNB Smart Chain Testnet** — no Remix required.

---

## Tech stack

- React 19 + Vite
- Tailwind CSS
- ethers.js v5
- MetaMask (browser wallet)

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
      HashChip.jsx        (copy button + BscScan link, used in the tx log)
      ui.jsx              (shared Card / Row / Banner / StatusBadge)
    lib/
      contracts.js         (reads all addresses/decimals/amounts from .env)
      abis.js
      wallet.js             (connect, network switch, error formatting)
    App.jsx
    main.jsx
  .env.example
  README.md
  package.json
```

---

## Setup

```bash
git clone <this-repo-url>
cd tsc-dashboard
npm install
cp .env.example .env    # fill in / confirm the token & contract addresses
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### Requirements
- MetaMask browser extension installed
- MetaMask able to connect to **BNB Smart Chain Testnet** (the app prompts to
  add/switch the network automatically if it isn't added yet)
- A test wallet funded with tBNB (gas) and mUSDT/TTRS test tokens

### Build for production
```bash
npm run build
npm run preview
```

---

## Environment variables (`.env`)

All contract addresses, decimals, and trade sizes are read from environment
variables — nothing is hardcoded in the source. See `.env.example` for the
full list. Key ones:

| Variable | Meaning |
|---|---|
| `VITE_MUSDT_ADDRESS` | mUSDT token contract |
| `VITE_TTRS_ADDRESS` | TTRS token contract |
| `VITE_TSC_ADDRESS` | TSC (Test Sale Contract) |
| `VITE_CHAIN_ID` / `VITE_CHAIN_ID_HEX` | BSC Testnet chain id (97 / 0x61) |
| `VITE_MUSDT_DECIMALS` / `VITE_TTRS_DECIMALS` | Token decimals (6 / 18) |
| `VITE_BUY_MUSDT_AMOUNT` / `VITE_BUY_TTRS_AMOUNT` | Buy trade size (10 / 10) |
| `VITE_SELL_TTRS_AMOUNT` / `VITE_SELL_MUSDT_AMOUNT` | Sell trade size (10 / 9) |

**`.env` is git-ignored and must never be pushed.** Only `.env.example` (with
placeholder/shared testnet values, no private keys) is committed.

---

## How the approve → buy → sell flow works

ERC-20 tokens don't let a contract move your tokens on its own — you first
have to **approve** it as a spender. That's why every trade is two separate
transactions:

1. **Approve mUSDT** — `mUSDT.approve(TSC_ADDRESS, 10)`. This just raises
   your on-chain allowance for the TSC contract; no tokens move yet.
2. **Buy TTRS** — `TSC.buyTTRS()`. The contract now pulls the 10 mUSDT you
   already approved and sends back 10 TTRS.
3. **Approve TTRS** — `TTRS.approve(TSC_ADDRESS, 10)`, same idea, for the
   token you're about to sell.
4. **Sell TTRS** — `TSC.sellTTRS()`. The contract pulls the approved 10 TTRS
   and sends back 9 mUSDT.

The dashboard checks the **actual on-chain allowance** (not just "did I click
approve") before enabling Buy/Sell, so the buttons stay disabled until the
approval has genuinely confirmed — even across a page refresh.

After every confirmed transaction, balances, reserves, and allowances are
refreshed automatically.

---

## UI features

- Responsive layout (mobile → desktop)
- Full transaction hash shown, with a one-click **Copy** button
- **BscScan Testnet** link on every transaction and every contract address
- Buy button disabled until the mUSDT approval is confirmed on-chain
- Sell button disabled until the TTRS approval is confirmed on-chain
- Auto-refresh of balances, reserves, and allowances after every confirmed tx
- Loading states on every button while a transaction is pending
- Clear success (green) / warning (amber) / error (red) banners
- Contract address section with direct BscScan links

---

## Expected results

**After Buy 10 TTRS:**
- User mUSDT decreases by 10
- User TTRS increases by 10
- TSC mUSDT reserve increases by 10
- TSC TTRS reserve decreases by 10

**After Sell 10 TTRS:**
- User TTRS decreases by 10
- User mUSDT increases by 9
- TSC TTRS reserve increases by 10
- TSC mUSDT reserve decreases by 9

---

## Proof / screenshots

_See `/screenshots` for the required proof images (wallet connected, before/after
balances, BscScan approval pages, buy/sell success states) and their naming
convention._

| Step | Screenshot |
|---|---|
| Wallet connected, correct network | `screenshots/wallet-connected.png` |
| Balances before Buy | `screenshots/balances-before-buy.png` |
| mUSDT approval on BscScan | `screenshots/approve-musdt-bscscan.png` |
| Buy 10 TTRS success | `screenshots/buy-success.png` |
| Balances after Buy | `screenshots/balances-after-buy.png` |
| TTRS approval on BscScan | `screenshots/approve-ttrs-bscscan.png` |
| Sell 10 TTRS success | `screenshots/sell-success.png` |
| Balances after Sell | `screenshots/balances-after-sell.png` |

**Transaction hashes:**
- `buyTTRS()`: _paste hash here after running the test_
- `sellTTRS()`: _paste hash here after running the test_

---

## Assumptions about the TSC contract ABI

The assignment brief didn't include the deployed contract's ABI, so `src/lib/abis.js`
assumes:
- `getTSCBalances()` returns `(musdtReserve, ttrsReserve)` in that order
- `buyTTRS()` and `sellTTRS()` take **no arguments** — they pull whatever was
  already approved (fixed at 10 mUSDT / 10 TTRS per the assignment)

If the real contract differs, only `src/lib/abis.js` needs updating.

---

## Known limitations

- Manual QA tool only — no automated test suite (as requested)
- Trade size is fixed at 10 mUSDT / 10 TTRS via `.env` (not a free-amount
  input yet — natural next iteration)
- Contract ABI is inferred, pending confirmation against the real deployment
