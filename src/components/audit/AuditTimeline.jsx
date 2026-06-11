import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

const emptyEvent = {
  eventDate: "",
  eventType: "",
  description: "",
  evidenceType: "",
};

export default function AuditTimeline({ timeline = [], onAddEvent, onUpdateEvent, onDeleteEvent, isSaving = false }) {
  const [draft, setDraft] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyEvent);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateEditDraft = (key, value) => setEditDraft((current) => ({ ...current, [key]: value }));

  const addEvent = async () => {
    if (!draft.eventDate && !draft.eventType && !draft.description) return;
    await onAddEvent(draft);
    setDraft(emptyEvent);
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditDraft({
      eventDate: event.eventDate,
      eventType: event.eventType,
      description: event.description,
      evidenceType: event.evidenceType,
    });
  };

  const saveEdit = async () => {
    await onUpdateEvent(editingId, editDraft);
    setEditingId(null);
    setEditDraft(emptyEvent);
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Add timeline event</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[150px_180px_1fr_160px_auto]">
          <input type="date" value={draft.eventDate} onChange={(event) => updateDraft("eventDate", event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
          <input value={draft.eventType} onChange={(event) => updateDraft("eventType", event.target.value)} placeholder="Event" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
          <input value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} placeholder="Description" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
          <input value={draft.evidenceType} onChange={(event) => updateDraft("evidenceType", event.target.value)} placeholder="Evidence" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
          <button type="button" onClick={addEvent} disabled={isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Evidence</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {timeline.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No timeline events recorded.</td></tr>
            ) : timeline.map((event) => (
              <tr key={event.id}>
                {editingId === event.id ? (
                  <>
                    <td className="px-4 py-3"><input type="date" value={editDraft.eventDate} onChange={(input) => updateEditDraft("eventDate", input.target.value)} className="h-9 w-full rounded-md border border-slate-300 px-2" /></td>
                    <td className="px-4 py-3"><input value={editDraft.eventType} onChange={(input) => updateEditDraft("eventType", input.target.value)} className="h-9 w-full rounded-md border border-slate-300 px-2" /></td>
                    <td className="px-4 py-3"><input value={editDraft.description} onChange={(input) => updateEditDraft("description", input.target.value)} className="h-9 w-full rounded-md border border-slate-300 px-2" /></td>
                    <td className="px-4 py-3"><input value={editDraft.evidenceType} onChange={(input) => updateEditDraft("evidenceType", input.target.value)} className="h-9 w-full rounded-md border border-slate-300 px-2" /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={saveEdit} className="rounded-md p-2 text-emerald-700 hover:bg-emerald-50" aria-label="Save event"><Check className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setEditingId(null)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Cancel edit"><X className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate-700">{event.eventDate || "-"}</td>
                    <td className="px-4 py-3 font-medium text-slate-950">{event.eventType || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{event.description || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{event.evidenceType || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => startEdit(event)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Edit event"><Pencil className="h-4 w-4" /></button>
                        <button type="button" onClick={() => onDeleteEvent(event.id)} className="rounded-md p-2 text-red-700 hover:bg-red-50" aria-label="Delete event"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
