import React from "react";
import { Chip } from "./PlannerFields";
import {
  CRIMINAL_AID_PATHWAYS,
  CRIMINAL_FRAMEWORK_SOURCES,
} from "@/lib/criminalAidFramework";

export default function CriminalFrameworkSection({ planner, setCriminalField }) {
  if (planner.matter.matterType !== "Criminal") {
    return null;
  }

  const selectedPathway = CRIMINAL_AID_PATHWAYS.find((item) => item.id === planner.criminal.pathwayId) || null;
  const selectedSource = selectedPathway ? CRIMINAL_FRAMEWORK_SOURCES[selectedPathway.scheduleKey] : null;

  const handlePathwayChange = (pathwayId) => {
    const nextPathway = CRIMINAL_AID_PATHWAYS.find((item) => item.id === pathwayId) || null;
    setCriminalField("pathwayId", pathwayId);
    setCriminalField("pathwayLabel", nextPathway?.label || "");
    setCriminalField("feeTableRef", nextPathway?.feeTableRef || "");
    setCriminalField("feeScheduleRef", nextPathway?.feeScheduleRef || "");
  };

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Criminal grant framework</h2>
        <p className="mt-1 text-sm text-slate-500">
          This crime-only layer gives the planner the main VLA criminal pathways and fee-table families first, so the outcome and extension rules can be added on top of a real structure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Criminal pathway</span>
          <select
            value={planner.criminal.pathwayId}
            onChange={(e) => handlePathwayChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3"
          >
            <option value="">Select...</option>
            {CRIMINAL_AID_PATHWAYS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        The options below are drawn from the criminal handbook schedules rather than your local office rules. The planner will also try to infer the pathway automatically from the minimum matter details.
      </div>

      {selectedPathway ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pathway</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{selectedPathway.label}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fee table</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{selectedPathway.feeTableRef}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fee schedule</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{selectedPathway.feeScheduleRef}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</div>
              {selectedSource ? (
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-purple-700 hover:text-purple-800"
                >
                  {selectedSource.label}
                </a>
              ) : (
                <div className="mt-2 text-sm font-medium text-slate-900">Not linked</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Courts usually associated with this pathway</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPathway.courts.map((court) => (
                <Chip key={court}>{court}</Chip>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Appearance families in this pathway</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPathway.appearanceFamilies.map((appearance) => (
                <Chip key={appearance}>{appearance}</Chip>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Framework note</div>
            <p className="mt-2 text-sm text-slate-600">{selectedPathway.notes}</p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Choose the criminal pathway that looks closest to the current grant or work type. Once that is selected, you can start layering the office rules about outcomes, next listings, extensions and split-off matters.
        </div>
      )}
    </section>
  );
}
