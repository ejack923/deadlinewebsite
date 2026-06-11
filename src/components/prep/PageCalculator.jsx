import { useState, useRef, useEffect } from "react";
import { Calculator, Plus, Trash2, Check } from "lucide-react";

/**
 * A small inline adder calculator.
 * onResult(total) → called when user clicks Apply
 */
export default function PageCalculator({ onResult, unit = "pages" }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([""]);
  const containerRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const total = entries.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const apply = () => {
    onResult(total);
    setOpen(false);
    setEntries([""]);
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="Manual calculator"
        className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
      >
        <Calculator className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-52">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Add up {unit}</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto mb-2">
            {entries.map((val, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={val}
                  onChange={e => {
                    const next = [...entries];
                    next[i] = e.target.value;
                    setEntries(next);
                  }}
                  placeholder="0"
                  className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                  autoFocus={i === entries.length - 1}
                />
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setEntries(entries.filter((_, j) => j !== i))}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEntries([...entries, ""])}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add row
          </button>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total: <strong>{total}</strong></span>
            <button
              type="button"
              onClick={apply}
              className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg px-2.5 py-1 hover:bg-emerald-100 transition-colors"
            >
              <Check className="w-3 h-3" /> Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}