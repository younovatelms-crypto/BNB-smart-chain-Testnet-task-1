import { useState } from "react";
import { explorerTxUrl } from "../lib/contracts";

export default function HashChip({ hash }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API blocked (e.g. insecure context) — silently ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 min-w-0">
      <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded break-all">
        {hash}
      </code>
      <button
        onClick={copy}
        className="shrink-0 text-xs font-medium px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors"
        type="button"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <a
        href={explorerTxUrl(hash)}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 text-xs font-medium px-2 py-1 rounded border border-brand-300 text-brand-700 hover:bg-brand-50 transition-colors"
      >
        View on BscScan ↗
      </a>
    </div>
  );
}
