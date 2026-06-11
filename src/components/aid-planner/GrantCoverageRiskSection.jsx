import React from "react";
import { APPEARANCE_TYPES } from "@/lib/aidPlannerSchema";

const PROVIDER_TYPES = ["Counsel", "Psychologist", "Interpreter", "Report writer", "Other"];
const COVERAGE_OPTIONS = ["Yes", "No", "Review"];
const RISK_OPTIONS = ["Low", "Medium", "High"];

export default function GrantCoverageRiskSection({
  planner,
  addExternalWork,
  updateExternalWork,
  removeExternalWork,
}) {
  const rows = planner.externalWork || [];

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Grant coverage risk</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track external work or provider engagements that may require the right grant or an extension before the lawyer can safely brief them.
          </p>
        </div>
        <button
          type="button"
          onClick={addExternalWork}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700"
        >
          Add engagement
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          No external work or provider engagements added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">
                  {row.providerName || row.providerType || "New engagement"}
                </div>
                <button
                  type="button"
                  onClick={() => removeExternalWork(row.id)}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Provider type</span>
                  <select
                    value={row.providerType}
                    onChange={(e) => updateExternalWork(row.id, "providerType", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option value="">Select...</option>
                    {PROVIDER_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Provider name</span>
                  <input
                    value={row.providerName}
                    onChange={(e) => updateExternalWork(row.id, "providerName", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Work requested</span>
                  <input
                    value={row.workRequested}
                    onChange={(e) => updateExternalWork(row.id, "workRequested", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Work date / due date</span>
                  <input
                    type="date"
                    value={row.workDate}
                    onChange={(e) => updateExternalWork(row.id, "workDate", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Linked appearance or task</span>
                  <select
                    value={row.linkedAppearance}
                    onChange={(e) => updateExternalWork(row.id, "linkedAppearance", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option value="">Select...</option>
                    {APPEARANCE_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Expected fee / claim type</span>
                  <input
                    value={row.feeType}
                    onChange={(e) => updateExternalWork(row.id, "feeType", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Current grant appears to cover this work?</span>
                  <select
                    value={row.coveredByCurrentGrant}
                    onChange={(e) => updateExternalWork(row.id, "coveredByCurrentGrant", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option value="">Select...</option>
                    {COVERAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Extension likely needed?</span>
                  <select
                    value={row.extensionLikelyNeeded}
                    onChange={(e) => updateExternalWork(row.id, "extensionLikelyNeeded", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option value="">Select...</option>
                    {COVERAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">New grant likely needed?</span>
                  <select
                    value={row.newGrantLikelyNeeded}
                    onChange={(e) => updateExternalWork(row.id, "newGrantLikelyNeeded", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option value="">Select...</option>
                    {COVERAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Payment risk</span>
                  <select
                    value={row.paymentRisk}
                    onChange={(e) => updateExternalWork(row.id, "paymentRisk", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option value="">Select...</option>
                    {RISK_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Provider already engaged?</span>
                  <select
                    value={row.providerEngaged ? "Yes" : "No"}
                    onChange={(e) => updateExternalWork(row.id, "providerEngaged", e.target.value === "Yes")}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Work already completed?</span>
                  <select
                    value={row.workCompleted ? "Yes" : "No"}
                    onChange={(e) => updateExternalWork(row.id, "workCompleted", e.target.value === "Yes")}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Notes</span>
                <textarea
                  value={row.notes}
                  onChange={(e) => updateExternalWork(row.id, "notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
