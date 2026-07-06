import { Card, Row } from "./ui";

export default function MyBalances({ balances, onRefresh, refreshing }) {
  return (
    <Card title="2. My Balances" subtitle="Connected wallet holdings">
      <div>
        <Row label="tBNB" value={balances.bnb ?? "—"} />
        <Row label="mUSDT" value={balances.musdt ?? "—"} />
        <Row label="TTRS" value={balances.ttrs ?? "—"} />
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="self-start text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        {refreshing ? "Refreshing…" : "Refresh My Balances"}
      </button>
    </Card>
  );
}
