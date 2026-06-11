import { Plus } from "lucide-react";
import { useState } from "react";
import { AUDIT_FINDING_TEMPLATES } from "@/audit-standards";

export default function AuditFindings({ findings = [], onAddFinding, isSaving = false }) {
  const [severity, setSeverity] = useState("High");
  const [finding, setFinding] = useState("");
  const [actionRequired, setActionRequired] = useState("");

  const submitFinding = async (selectedFinding = finding, template = null) => {
    const value = selectedFinding.trim();
    if (!value) return;
    await onAddFinding({
      severity: template?.severity || severity,
      finding: value,
      actionRequired: template?.actionRequired || actionRequired,
    });
    setFinding("");
    setActionRequired("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Add finding</h2>
        <div className="mt-4 grid gap-3">
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input
            value={finding}
            onChange={(event) => setFinding(event.target.value)}
            placeholder="Custom finding"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
          <textarea
            value={actionRequired}
            onChange={(event) => setActionRequired(event.target.value)}
            placeholder="Action required"
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => submitFinding()}
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add finding
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {AUDIT_FINDING_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => submitFinding(template.label, template)}
              disabled={isSaving}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {template.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">Findings</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {findings.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No findings recorded.</p>
          ) : findings.map((item) => (
            <article key={item.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">{item.severity}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{item.status}</span>
              </div>
              <h3 className="mt-2 font-semibold text-slate-950">{item.finding}</h3>
              {item.actionRequired && <p className="mt-1 text-sm text-slate-600">{item.actionRequired}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
