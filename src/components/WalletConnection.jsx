import { Card, Row, Banner } from "./ui";
import { CHAIN_NAME } from "../lib/contracts";

export default function WalletConnection({
  address,
  chainId,
  isCorrectNetwork,
  onConnect,
  connecting,
}) {
  return (
    <Card title="1. Wallet Connection" subtitle="MetaMask · BNB Smart Chain Testnet">
      <button
        onClick={onConnect}
        disabled={connecting}
        className="self-start bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {connecting ? "Connecting…" : address ? "Reconnect Wallet" : "Connect Wallet"}
      </button>

      <div>
        <Row label="Address" value={address ? shorten(address) : "—"} />
        <Row label="Network" value={chainId ? CHAIN_NAME : "—"} />
        <Row label="Chain ID" value={chainId ?? "—"} />
      </div>

      {address && !isCorrectNetwork && (
        <Banner type="warn">Please switch to BNB Smart Chain Testnet</Banner>
      )}
    </Card>
  );
}

function shorten(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
