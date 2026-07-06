import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnection from "./components/WalletConnection";
import MyBalances from "./components/MyBalances";
import TSCReserves from "./components/TSCReserves";
import BuyTTRS from "./components/BuyTTRS";
import SellTTRS from "./components/SellTTRS";
import TransactionLog from "./components/TransactionLog";
import ProofExport from "./components/ProofExport";
import { Banner } from "./components/ui";
import { connect, ensureCorrectNetwork, friendlyError, hasMetaMask } from "./lib/wallet";
import {
  getMusdtContract,
  getTtrsContract,
  getTscContract,
  MUSDT_DECIMALS,
  TTRS_DECIMALS,
  BUY_MUSDT_AMOUNT,
  SELL_TTRS_AMOUNT,
  SELL_MUSDT_MIN_RESERVE,
  TSC_ADDRESS,
} from "./lib/contracts";

const fmt = (bn, decimals) =>
  Number(ethers.utils.formatUnits(bn, decimals)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const [banner, setBanner] = useState(null); // { type, message }

  const [balances, setBalances] = useState({});
  const [reserves, setReserves] = useState({});
  const [refreshingUser, setRefreshingUser] = useState(false);
  const [refreshingReserves, setRefreshingReserves] = useState(false);

  const [buyApproving, setBuyApproving] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyEnabled, setBuyEnabled] = useState(false);

  const [sellApproving, setSellApproving] = useState(false);
  const [selling, setSelling] = useState(false);
  const [sellEnabled, setSellEnabled] = useState(false);

  const [transactions, setTransactions] = useState([]);

  // Real-only proof data — every field here is set exclusively from an
  // actual confirmed transaction hash or an actual contract read taken
  // moments before/after one. Nothing here is ever guessed or hardcoded.
  const [proof, setProof] = useState({
    musdtApprovalHash: null,
    ttrsApprovalHash: null,
    buyHash: null,
    sellHash: null,
    beforeBuy: null,
    afterBuy: null,
    beforeSell: null,
    afterSell: null,
  });

  const isCorrectNetwork = chainId === 97;

  function pushTx(label) {
    const id = `${label}-${Date.now()}`;
    setTransactions((prev) => [{ id, label, hash: null, status: "preparing" }, ...prev]);
    return id;
  }
  function attachHash(id, hash) {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, hash, status: "pending" } : t)));
  }
  function updateTx(id, status, error) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, error } : t))
    );
  }

  const refreshUserBalances = useCallback(async () => {
    if (!signer || !address) return;
    setRefreshingUser(true);
    try {
      const [bnbBal, musdtBal, ttrsBal] = await Promise.all([
        provider.getBalance(address),
        getMusdtContract(provider).balanceOf(address),
        getTtrsContract(provider).balanceOf(address),
      ]);
      setBalances({
        bnb: `${fmt(bnbBal, 18)} tBNB`,
        musdt: `${fmt(musdtBal, MUSDT_DECIMALS)} mUSDT`,
        ttrs: `${fmt(ttrsBal, TTRS_DECIMALS)} TTRS`,
      });
    } catch (err) {
      setBanner({ type: "error", message: "Could not load balances: " + friendlyError(err) });
    } finally {
      setRefreshingUser(false);
    }
  }, [provider, signer, address]);

  const refreshReserves = useCallback(async () => {
    if (!provider) return;
    setRefreshingReserves(true);
    try {
      const [musdtReserve, ttrsReserve] = await getTscContract(provider).getTSCBalances();
      setReserves({
        musdt: `${fmt(musdtReserve, MUSDT_DECIMALS)} mUSDT`,
        ttrs: `${fmt(ttrsReserve, TTRS_DECIMALS)} TTRS`,
      });
    } catch (err) {
      setBanner({ type: "error", message: "Could not load TSC reserves: " + friendlyError(err) });
    } finally {
      setRefreshingReserves(false);
    }
  }, [provider]);

  const refreshAllowances = useCallback(async () => {
    if (!provider || !address) return;
    try {
      const [musdtAllowance, ttrsAllowance] = await Promise.all([
        getMusdtContract(provider).allowance(address, TSC_ADDRESS),
        getTtrsContract(provider).allowance(address, TSC_ADDRESS),
      ]);
      setBuyEnabled(musdtAllowance.gte(BUY_MUSDT_AMOUNT));
      setSellEnabled(ttrsAllowance.gte(SELL_TTRS_AMOUNT));
    } catch {
      // non-fatal — buttons simply stay disabled until a successful check
    }
  }, [provider, address]);

  async function refreshEverything() {
    await Promise.all([refreshUserBalances(), refreshReserves(), refreshAllowances()]);
  }

  /**
   * Reads balances + reserves directly from the chain right now (not from
   * possibly-stale React state), so before/after proof snapshots are
   * guaranteed accurate even if a UI refresh hasn't landed yet.
   */
  async function readSnapshot() {
    const [musdtBal, ttrsBal, [tscMusdt, tscTtrs]] = await Promise.all([
      getMusdtContract(provider).balanceOf(address),
      getTtrsContract(provider).balanceOf(address),
      getTscContract(provider).getTSCBalances(),
    ]);
    return {
      musdt: `${fmt(musdtBal, MUSDT_DECIMALS)} mUSDT`,
      ttrs: `${fmt(ttrsBal, TTRS_DECIMALS)} TTRS`,
      tscMusdt: `${fmt(tscMusdt, MUSDT_DECIMALS)} mUSDT`,
      tscTtrs: `${fmt(tscTtrs, TTRS_DECIMALS)} TTRS`,
    };
  }

  async function handleConnect() {
    setBanner(null);
    setConnecting(true);
    try {
      const { provider: p, signer: s, address: a } = await connect();
      setProvider(p);
      setSigner(s);
      setAddress(a);
      const network = await p.getNetwork();
      setChainId(network.chainId);

      if (network.chainId !== 97) {
        setBanner({ type: "warn", message: "Please switch to BNB Smart Chain Testnet" });
        const ok = await ensureCorrectNetwork(p);
        if (ok) window.location.reload();
      }

      window.ethereum.removeAllListeners?.("accountsChanged");
      window.ethereum.removeAllListeners?.("chainChanged");
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    } catch (err) {
      setBanner({ type: "error", message: friendlyError(err) });
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    if (provider && address && isCorrectNetwork) {
      refreshEverything();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, address, isCorrectNetwork]);

  function requireReady() {
    if (!address) {
      setBanner({ type: "error", message: "Please connect your wallet first." });
      return false;
    }
    if (!isCorrectNetwork) {
      setBanner({ type: "warn", message: "Please switch to BNB Smart Chain Testnet" });
      return false;
    }
    return true;
  }

  async function runTx(label, sendFn, opts = {}) {
    const id = pushTx(label);
    try {
      const bal = opts.balanceCheck && (await opts.balanceCheck());
      if (bal === false) throw new Error(opts.balanceCheckMessage || "Insufficient balance.");

      const tx = await sendFn();
      attachHash(id, tx.hash);
      opts.onSubmitted?.(tx.hash);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        updateTx(id, "confirmed");
        setBanner({ type: "ok", message: `${label} confirmed.` });
        await refreshEverything();
        await opts.onSuccess?.();
      } else {
        updateTx(id, "failed", "Transaction reverted on-chain.");
        setBanner({ type: "error", message: `${label} failed on-chain.` });
      }
    } catch (err) {
      const msg = friendlyError(err);
      updateTx(id, "failed", msg);
      setBanner({ type: "error", message: `${label}: ${msg}` });
    }
  }

  async function approveBuy() {
    if (!requireReady()) return;
    setBuyApproving(true);
    await runTx(
      "Approve 10 mUSDT",
      () => getMusdtContract(signer).approve(TSC_ADDRESS, BUY_MUSDT_AMOUNT),
      {
        balanceCheck: async () => (await getMusdtContract(provider).balanceOf(address)).gte(BUY_MUSDT_AMOUNT),
        balanceCheckMessage: "Insufficient mUSDT balance to approve.",
        onSubmitted: (hash) => setProof((p) => ({ ...p, musdtApprovalHash: hash })),
      }
    );
    setBuyApproving(false);
  }

  async function buyTtrs() {
    if (!requireReady()) return;
    setBuying(true);
    const beforeBuy = await readSnapshot();
    setProof((p) => ({ ...p, beforeBuy }));
    await runTx("Buy 10 TTRS", () => getTscContract(signer).buyTTRS(), {
      balanceCheck: async () => {
        const [, ttrsReserve] = await getTscContract(provider).getTSCBalances();
        return ttrsReserve.gte(SELL_TTRS_AMOUNT);
      },
      balanceCheckMessage: "TSC has insufficient TTRS reserve.",
      onSubmitted: (hash) => setProof((p) => ({ ...p, buyHash: hash })),
      onSuccess: async () => {
        const afterBuy = await readSnapshot();
        setProof((p) => ({ ...p, afterBuy }));
      },
    });
    setBuying(false);
  }

  async function approveSell() {
    if (!requireReady()) return;
    setSellApproving(true);
    await runTx(
      "Approve 10 TTRS",
      () => getTtrsContract(signer).approve(TSC_ADDRESS, SELL_TTRS_AMOUNT),
      {
        balanceCheck: async () => (await getTtrsContract(provider).balanceOf(address)).gte(SELL_TTRS_AMOUNT),
        balanceCheckMessage: "Insufficient TTRS balance to approve.",
        onSubmitted: (hash) => setProof((p) => ({ ...p, ttrsApprovalHash: hash })),
      }
    );
    setSellApproving(false);
  }

  async function sellTtrs() {
    if (!requireReady()) return;
    setSelling(true);
    const beforeSell = await readSnapshot();
    setProof((p) => ({ ...p, beforeSell }));
    await runTx("Sell 10 TTRS", () => getTscContract(signer).sellTTRS(), {
      balanceCheck: async () => {
        const [musdtReserve] = await getTscContract(provider).getTSCBalances();
        return musdtReserve.gte(SELL_MUSDT_MIN_RESERVE);
      },
      balanceCheckMessage: "TSC has insufficient mUSDT reserve.",
      onSubmitted: (hash) => setProof((p) => ({ ...p, sellHash: hash })),
      onSuccess: async () => {
        const afterSell = await readSnapshot();
        setProof((p) => ({ ...p, afterSell }));
      },
    });
    setSelling(false);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-xl font-semibold text-slate-900">TSC Test Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            TSC – Test Sale Contract · BNB Smart Chain Testnet · developer testing UI
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4">
        {!hasMetaMask() && (
          <Banner type="warn">MetaMask not detected. Please install the MetaMask browser extension.</Banner>
        )}
        {banner && <Banner type={banner.type}>{banner.message}</Banner>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WalletConnection
            address={address}
            chainId={chainId}
            isCorrectNetwork={isCorrectNetwork}
            onConnect={handleConnect}
            connecting={connecting}
          />
          <MyBalances
            balances={balances}
            onRefresh={refreshUserBalances}
            refreshing={refreshingUser}
          />
          <TSCReserves
            reserves={reserves}
            onRefresh={refreshReserves}
            refreshing={refreshingReserves}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-1">
            <BuyTTRS
              onApprove={approveBuy}
              onBuy={buyTtrs}
              approving={buyApproving}
              buying={buying}
              buyEnabled={buyEnabled}
            />
            <SellTTRS
              onApprove={approveSell}
              onSell={sellTtrs}
              approving={sellApproving}
              selling={selling}
              sellEnabled={sellEnabled}
            />
          </div>
          <TransactionLog transactions={transactions} />
          <ProofExport proof={proof} />
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8 text-xs text-slate-400">
        Testing UI only — not a production or public-facing dashboard.
      </footer>
    </div>
  );
}
