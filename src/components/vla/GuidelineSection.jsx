import React, { useState } from "react";
import { GUIDELINES } from "./guidelineCriteria";
import GuidelineDrawer from "./GuidelineDrawer";

const getStoredList = (key) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

const setStoredList = (key, list) => {
  localStorage.setItem(key, JSON.stringify(list));
};

function SelectWithAdd({ value, onChange, storageKey, label }) {
  const [options, setOptions] = useState(() => getStoredList(storageKey));
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (newValue.trim()) {
      const updated = [...options, newValue.trim()];
      const unique = [...new Set(updated)];
      setOptions(unique);
      setStoredList(storageKey, unique);
      onChange(newValue.trim());
      setNewValue("");
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="flex gap-2 items-center w-full">
        <input
          autoFocus
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } else if (e.key === 'Escape') setIsAdding(false); }}
          placeholder={`New ${label.toLowerCase()}...`}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 flex-1 min-w-0"
        />
        <button type="button" onClick={handleAdd} className="text-xs font-semibold text-purple-700 hover:text-purple-800 shrink-0">Save</button>
        <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-gray-500 hover:text-gray-700 shrink-0">Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex-1 min-w-0 print:appearance-none print:border-none print:border-b print:border-gray-400 print:rounded-none print:px-0 print:py-0"
      >
        <option value="">Select {label}...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button 
        type="button" 
        onClick={() => setIsAdding(true)}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-purple-700 hover:border-purple-200 transition-colors print:hidden"
        title={`Add new ${label.toLowerCase()}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
}

export default function GuidelineSection({ form, onGuidelineChange, onCriteriaChange, onChange }) {
  const [showNotes, setShowNotes] = useState(false);
  const selected = GUIDELINES[form.guideline];

  return (
    <section>
      <div className="text-xs font-bold tracking-widest text-purple-700 uppercase border-b border-gray-300 dark:border-gray-600 pb-2 mb-6">
        Guideline Selection &amp; Criteria
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Select VLA Guideline
        </label>
        <GuidelineDrawer value={form.guideline} onChange={onGuidelineChange} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Specific Criteria / Sub-Criteria
        </label>
        <div className="border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 p-4 min-h-[100px]">
          {!selected ? (
            <p className="text-gray-400 italic text-sm text-center mt-4">
              Please select a guideline above to view specific criteria.
            </p>
          ) : (
            <div className="space-y-6">
              {selected.criteria.filter(group => !group.label.toLowerCase().startsWith("documentary")).map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={!!form.criteria[item.id]}
                          onChange={(e) => onCriteriaChange(item.id, e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-purple-700 shrink-0"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-gray-100">
                          {item.text}
                        </span>
                      </label>
                    ))}
                    {group.id.endsWith("_means") && (
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={!!form.waiver_applies}
                          onChange={(e) => onChange("waiver_applies", e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-purple-700 shrink-0"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-gray-100">
                          Means test waiver applies
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(showNotes || form.notes) ? (
        <div className="flex flex-col gap-1 mt-6">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Certification Notes</label>
            <button 
              type="button" 
              onClick={() => { setShowNotes(false); onChange("notes", ""); }} 
              className="text-xs text-gray-500 hover:text-red-600 print:hidden"
            >
              Remove
            </button>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Enter any specific compliance notes or merit assessment details..."
            rows={4}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
      ) : (
        <div className="mt-6 print:hidden">
          <button 
            type="button" 
            onClick={() => setShowNotes(true)}
            className="text-sm font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Additional Certification Notes
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lawyer with Carriage</label>
          <SelectWithAdd
            value={form.lawyer}
            onChange={(val) => onChange("lawyer", val)}
            storageKey="eas_lawyers"
            label="Lawyer"
          />
        </div>
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Certified By</label>
          <SelectWithAdd
            value={form.certified_by}
            onChange={(val) => onChange("certified_by", val)}
            storageKey="eas_certifiers"
            label="Certifier"
          />
        </div>
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
          <input
            type="date"
            value={form.cert_date}
            onChange={(e) => onChange("cert_date", e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
      </div>

    </section>
  );
}
