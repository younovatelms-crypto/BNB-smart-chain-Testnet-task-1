import { useState } from "react";
import { Card } from "./ui";
import { explorerTxUrl } from "../lib/contracts";

/**
 * Builds the exact README "Transaction proof" table from data actually
 * captured during this session — never invented. Every field here comes
 * from a real confirmed transaction or a real balance read moments before
 * one, so pasting this into the README is guaranteed to reflect what
 * actually happened on-chain, not a guess.
 */
export default function ProofExport({ proof }) {
  const [copied, setCopied] = useState(false);

  const ready = {
    musdtApproval: Boolean(proof.musdtApprovalHash),
    ttrsApproval: Boolean(proof.ttrsApprovalHash),
    buy: Boolean(proof.buyHash),
    sell: Boolean(proof.sellHash),
  };
  const allReady = ready.musdtApproval && ready.ttrsApproval && ready.buy && ready.sell;

  function row(label, hash) {
    return hash
      ? `| ${label} | \`${hash}\` | ✅ [View on BscScan](${explorerTxUrl(hash)}) |`
      : `| ${label} | _not run yet this session_ | ⏳ |`;
  }

  const markdown = `## Transaction proof

${row("mUSDT approval", proof.musdtApprovalHash)}
${row("TTRS approval", proof.ttrsApprovalHash)}
${row("\`buyTTRS()\`", proof.buyHash)}
${row("\`sellTTRS()\`", proof.sellHash)}

**Balances captured this session:**

| | mUSDT | TTRS | TSC mUSDT reserve | TSC TTRS reserve |
|---|---|---|---|---|
| Before Buy | ${proof.beforeBuy?.musdt ?? "—"} | ${proof.beforeBuy?.ttrs ?? "—"} | ${proof.beforeBuy?.tscMusdt ?? "—"} | ${proof.beforeBuy?.tscTtrs ?? "—"} |
| After Buy | ${proof.afterBuy?.musdt ?? "—"} | ${proof.afterBuy?.ttrs ?? "—"} | ${proof.afterBuy?.tscMusdt ?? "—"} | ${proof.afterBuy?.tscTtrs ?? "—"} |
| Before Sell | ${proof.beforeSell?.musdt ?? "—"} | ${proof.beforeSell?.ttrs ?? "—"} | ${proof.beforeSell?.tscMusdt ?? "—"} | ${proof.beforeSell?.tscTtrs ?? "—"} |
| After Sell | ${proof.afterSell?.musdt ?? "—"} | ${proof.afterSell?.ttrs ?? "—"} | ${proof.afterSell?.tscMusdt ?? "—"} | ${proof.afterSell?.tscTtrs ?? "—"} |

_Generated automatically from real on-chain reads during this session — no manual typing._`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — the text box below still lets you select + copy manually
    }
  }

  return (
    <Card
      title="README Proof Block"
      subtitle="Auto-built from real transactions run this session — paste straight into README.md"
      className="lg:col-span-2"
    >
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <ProofPill label="mUSDT approval" done={ready.musdtApproval} />
        <ProofPill label="TTRS approval" done={ready.ttrsApproval} />
        <ProofPill label="buyTTRS()" done={ready.buy} />
        <ProofPill label="sellTTRS()" done={ready.sell} />
      </ul>

      <textarea
        readOnly
        value={markdown}
        rows={14}
        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={copy}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          type="button"
        >
          {copied ? "Copied ✓" : "Copy markdown block"}
        </button>
        {!allReady && (
          <p className="text-xs text-slate-400">
            Fields still show "not run yet this session" until you actually run that
            step — approve mUSDT, buy, approve TTRS, sell, in order.
          </p>
        )}
      </div>
    </Card>
  );
}

function ProofPill({ label, done }) {
  return (
    <li
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
        done ? "bg-ok-50 text-ok-700 border-ok-500/30" : "bg-slate-50 text-slate-400 border-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-ok-500" : "bg-slate-300"}`} />
      {label}
    </li>
  );
}
