import {
  BUY_MUSDT_AMOUNT_HUMAN,
  BUY_TTRS_AMOUNT_HUMAN,
} from "../lib/contracts";
import { Card } from "./ui";

export default function BuyTTRS({
  onApprove,
  onBuy,
  approving,
  buying,
  buyEnabled,
}) {
  return (
    <Card title="4. Buy TTRS" subtitle="Swap mUSDT for TTRS">
      <div className="text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
        You give <b>{BUY_MUSDT_AMOUNT_HUMAN} mUSDT</b> → You receive{" "}
        <b>{BUY_TTRS_AMOUNT_HUMAN} TTRS</b>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          disabled={approving}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white transition-colors"
        >
          {approving ? "Approving…" : `Approve ${BUY_MUSDT_AMOUNT_HUMAN} mUSDT`}
        </button>
        <button
          onClick={onBuy}
          disabled={!buyEnabled || buying}
          title={!buyEnabled ? "Approve mUSDT first" : undefined}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white transition-colors"
        >
          {buying ? "Buying…" : `Buy ${BUY_TTRS_AMOUNT_HUMAN} TTRS`}
        </button>
      </div>
      {!buyEnabled && (
        <p className="text-xs text-slate-400">Buy unlocks once the mUSDT approval is confirmed.</p>
      )}
    </Card>
  );
}
