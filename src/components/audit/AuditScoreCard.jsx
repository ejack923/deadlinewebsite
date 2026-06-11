import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

const statusStyles = {
  PASS: "border-emerald-200 bg-emerald-50 text-emerald-900",
  "ACTION REQUIRED": "border-amber-200 bg-amber-50 text-amber-900",
  "HIGH RISK": "border-red-200 bg-red-50 text-red-900",
  "In Progress": "border-slate-200 bg-slate-50 text-slate-900",
};

export default function AuditScoreCard({ score = 0, status = "In Progress", totalItems = 0, completedItems = 0 }) {
  const Icon = status === "PASS" ? CheckCircle2 : status === "HIGH RISK" ? AlertTriangle : ShieldCheck;

  return (
    <section className={`rounded-md border p-5 ${statusStyles[status] || statusStyles["In Progress"]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-80">Audit score</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-normal">{score}%</span>
            <span className="text-sm font-semibold uppercase">{status}</span>
          </div>
          <p className="mt-2 text-sm opacity-80">{completedItems} of {totalItems} checklist items complete</p>
        </div>
        <Icon className="h-8 w-8 shrink-0" />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
        <div className="h-full rounded-full bg-current transition-all" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
    </section>
  );
}
