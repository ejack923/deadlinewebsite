import React from "react";
import { statusClasses } from "./PlannerFields";

export default function GuidancePanel({ guidance }) {
  return (
    <section className="rounded-xl border border-slate-200 p-5 bg-slate-50">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Guidance</h2>
      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusClasses(guidance.status)}`}>
        {guidance.status.replaceAll("_", " ")}
      </div>
      <p className="text-slate-800 font-medium mt-4">{guidance.nextAction}</p>

      {guidance.reasons.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Reasons</div>
          <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
            {guidance.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.warnings.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Warnings</div>
          <ul className="space-y-2 text-sm text-rose-700 list-disc pl-5">
            {guidance.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
