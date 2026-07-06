export function StatusBadge({ status }) {
  const styles = {
    pending: "bg-warn-50 text-warn-700 border-warn-500/30",
    confirmed: "bg-ok-50 text-ok-700 border-ok-500/30",
    failed: "bg-danger-50 text-danger-700 border-danger-500/30",
  };
  const dot = {
    pending: "bg-warn-500 animate-pulse",
    confirmed: "bg-ok-500",
    failed: "bg-danger-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

export function Card({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 ${className}`}
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function Banner({ type, children }) {
  if (!children) return null;
  const styles = {
    error: "bg-danger-50 text-danger-700 border-danger-500/30",
    warn: "bg-warn-50 text-warn-700 border-warn-500/30",
    ok: "bg-ok-50 text-ok-700 border-ok-500/30",
  };
  return (
    <div className={`text-sm border rounded-lg px-4 py-2.5 ${styles[type]}`}>{children}</div>
  );
}
