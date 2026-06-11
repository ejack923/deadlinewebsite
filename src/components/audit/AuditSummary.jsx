import { Download, RefreshCw } from "lucide-react";
import { exportAuditUrl } from "@/lib/auditApi";

export default function AuditSummary({ audit, sources = [], onGenerateSummary, isSaving = false }) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onGenerateSummary}
          disabled={isSaving}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </button>
        <a
          href={exportAuditUrl(audit.id)}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export report
        </a>
      </div>
      <section className="min-h-60 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        {audit.summary ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">{audit.summary}</pre>
        ) : (
          <p className="text-sm text-slate-500">No audit summary generated yet.</p>
        )}
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Report source set</h2>
        <div className="mt-3 grid gap-2">
          {sources.map((source) => (
            <div key={source.key} className="text-sm text-slate-700">
              <span className="font-medium text-slate-950">{source.title}</span>
              <span className="text-slate-500"> - {source.version}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
