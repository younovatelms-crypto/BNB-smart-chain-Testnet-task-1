import { Card, Row } from "./ui";
import { MUSDT_ADDRESS, TTRS_ADDRESS, TSC_ADDRESS, explorerAddressUrl } from "../lib/contracts";

export default function TSCReserves({ reserves, onRefresh, refreshing }) {
  return (
    <Card title="3. TSC Contract Reserves" subtitle="Live reserves held by the TSC contract">
      <div>
        <Row label="TSC mUSDT reserve" value={reserves.musdt ?? "—"} />
        <Row label="TSC TTRS reserve" value={reserves.ttrs ?? "—"} />
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="self-start text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        {refreshing ? "Refreshing…" : "Refresh Balances"}
      </button>

      <div className="pt-2 mt-1 border-t border-slate-100 space-y-1">
        <p className="text-xs font-medium text-slate-500">Contract addresses</p>
        <AddressLink label="mUSDT" address={MUSDT_ADDRESS} />
        <AddressLink label="TTRS" address={TTRS_ADDRESS} />
        <AddressLink label="TSC" address={TSC_ADDRESS} />
      </div>
    </Card>
  );
}

function AddressLink({ label, address }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <a
        href={explorerAddressUrl(address)}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-brand-600 hover:underline"
      >
        {address.slice(0, 8)}…{address.slice(-6)} ↗
      </a>
    </div>
  );
}
