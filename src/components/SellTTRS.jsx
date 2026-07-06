import {
  SELL_TTRS_AMOUNT_HUMAN,
  SELL_MUSDT_AMOUNT_HUMAN,
} from "../lib/contracts";
import { Card } from "./ui";

export default function SellTTRS({
  onApprove,
  onSell,
  approving,
  selling,
  sellEnabled,
}) {
  return (
    <Card title="5. Sell TTRS" subtitle="Swap TTRS back for mUSDT">
      <div className="text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
        You give <b>{SELL_TTRS_AMOUNT_HUMAN} TTRS</b> → You receive{" "}
        <b>{SELL_MUSDT_AMOUNT_HUMAN} mUSDT</b>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          disabled={approving}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white transition-colors"
        >
          {approving ? "Approving…" : `Approve ${SELL_TTRS_AMOUNT_HUMAN} TTRS`}
        </button>
        <button
          onClick={onSell}
          disabled={!sellEnabled || selling}
          title={!sellEnabled ? "Approve TTRS first" : undefined}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white transition-colors"
        >
          {selling ? "Selling…" : `Sell ${SELL_TTRS_AMOUNT_HUMAN} TTRS`}
        </button>
      </div>
      {!sellEnabled && (
        <p className="text-xs text-slate-400">Sell unlocks once the TTRS approval is confirmed.</p>
      )}
    </Card>
  );
}
