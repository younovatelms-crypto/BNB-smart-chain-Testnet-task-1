import { StatusBadge, Card } from "./ui";
import HashChip from "./HashChip";

export default function TransactionLog({ transactions }) {
  return (
    <Card
      title="6. Transaction Log"
      subtitle="Every attempt — approvals, buys, sells, and failures — newest first"
      className="lg:col-span-2"
    >
      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400">No transactions yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 max-h-96 overflow-y-auto scroll-thin -mx-1">
          {transactions.map((tx) => (
            <li key={tx.id} className="px-1 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800">{tx.label}</span>
                <StatusBadge status={tx.status} />
              </div>
              {tx.hash ? (
                <HashChip hash={tx.hash} />
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {tx.status === "preparing" ? "Waiting for wallet confirmation…" : "No hash — never reached the wallet."}
                </p>
              )}
              {tx.error && <p className="text-xs text-danger-700">{tx.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
