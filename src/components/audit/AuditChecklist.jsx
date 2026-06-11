export default function AuditChecklist({ checklist = [], onToggle, isSaving = false }) {
  const groupedChecklist = checklist.reduce((groups, item) => {
    const key = item.standardDomain || "General audit checks";
    return {
      ...groups,
      [key]: [...(groups[key] || []), item],
    };
  }, {});

  return (
    <div className="grid gap-5">
      {Object.entries(groupedChecklist).map(([domain, items]) => (
        <section key={domain} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-950">{domain}</h2>
            <p className="mt-1 text-sm text-slate-500">{items[0]?.sourceReference}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <label
                key={item.checklistKey}
                className="flex min-h-14 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={isSaving}
                  onChange={(event) => onToggle(item.checklistKey, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className={item.completed ? "font-medium text-slate-900" : "text-slate-700"}>
                  {item.checklistLabel}
                </span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
