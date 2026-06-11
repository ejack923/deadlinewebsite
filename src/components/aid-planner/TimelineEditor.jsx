import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { EVENT_TYPES } from "@/lib/aidPlannerSchema";
import { SelectField } from "./PlannerFields";

export default function TimelineEditor({ timeline, addTimelineEvent, updateTimelineEvent, removeTimelineEvent }) {
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
        <button onClick={addTimelineEvent} className="aid-planner-no-print px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Add timeline event
        </button>
      </div>

      {timeline.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No timeline events yet.
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={event.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium text-slate-800">Event {index + 1}</div>
                <button onClick={() => removeTimelineEvent(event.id)} className="aid-planner-no-print text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Date</span>
                  <input type="date" value={event.date} onChange={(e) => updateTimelineEvent(event.id, "date", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
                </label>
                <SelectField compact label="Event type" value={event.type} onChange={(value) => updateTimelineEvent(event.id, "type", value)} options={EVENT_TYPES} />
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Title</span>
                  <input value={event.title} onChange={(e) => updateTimelineEvent(event.id, "title", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
                </label>
                <SelectField compact label="Source" value={event.source} onChange={(value) => updateTimelineEvent(event.id, "source", value)} options={["manual", "email", "calendar"]} />
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-medium text-slate-700">Note</span>
                  <textarea value={event.note} onChange={(e) => updateTimelineEvent(event.id, "note", e.target.value)} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
