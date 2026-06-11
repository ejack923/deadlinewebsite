import React from "react";

export default function PlannerSidebar({ showAdvanced, notes, setNotes, selectedAdapter }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Portable workflow</h2>
        <ul className="space-y-3 text-sm text-slate-600">
          <li>1. Complete or upload a planner file.</li>
          <li>2. Review the aid, extension, and billing guidance.</li>
          <li>3. Download the planner file and store it on your own device.</li>
          <li>4. Re-upload later to continue the matter.</li>
        </ul>
      </section>

      {selectedAdapter && (
        <section className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Practice manager path</h2>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{selectedAdapter.name}</span> is set as the next connector path for this planner. Matter basics can be imported into the local planner once the live sign-in step is connected.
          </p>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Will prefill first</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedAdapter.importFields.slice(0, 4).map((field) => (
                <span key={field} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">What you need first</h2>
        <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
          <li>Matter type</li>
          <li>Court</li>
          <li>Appearance type</li>
          <li>Next appearance date</li>
          <li>Whether aid has already been applied for</li>
          <li>Whether a grant is already in place</li>
          <li>Current stage covered, if a grant exists</li>
        </ul>
        {showAdvanced && (
          <>
            <div className="border-t border-slate-200 my-4" />
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Freeform notes for the downloaded planner file..."
            />
          </>
        )}
      </section>
    </div>
  );
}
