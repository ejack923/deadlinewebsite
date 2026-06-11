import { useState, useMemo } from "react";
import { CHARGE_DATA } from "@/lib/chargeData";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * @param {{
 *   value?: string[],
 *   onChange: (next: string[]) => void
 * }} props
 */
export default function ChargeSelector({ value = [], onChange }) {
  const [search, setSearch] = useState("");
  const [openSubdivisions, setOpenSubdivisions] = useState({});
  const [openGroups, setOpenGroups] = useState({});

  /** @param {string} sub */
  const toggleSubdivision = (sub) =>
    setOpenSubdivisions((prev) => ({ ...prev, [sub]: !prev[sub] }));

  /** @param {string} group */
  const toggleGroup = (group) =>
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));

  /** @param {string} desc */
  const toggle = (desc) => {
    if (value.includes(desc)) {
      onChange(value.filter((v) => v !== desc));
    } else {
      onChange([...value, desc]);
    }
  };

  // Search: flatten to subdivision+group+desc matches
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    /** @type {Record<string, Record<string, string[]>>} */
    const results = {};
    for (const [sub, groups] of Object.entries(CHARGE_DATA)) {
      for (const [group, descs] of Object.entries(groups)) {
        const matched = descs.filter(
          (d) =>
            d.toLowerCase().includes(q) ||
            group.toLowerCase().includes(q) ||
            sub.toLowerCase().includes(q)
        );
        if (matched.length > 0) {
          if (!results[sub]) results[sub] = {};
          results[sub][group] = matched;
        }
      }
    }
    return results;
  }, [search]);

  const isSearching = search.trim().length > 0;

  /** @param {string[]} descs */
  const countSelected = (descs) => descs.filter((d) => value.includes(d)).length;
  /** @param {Record<string, string[]>} groups */
  const countGroupSelected = (groups) =>
    Object.values(groups).flat().filter((d) => value.includes(d)).length;

  const data = isSearching ? searchResults : CHARGE_DATA;

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search charges..."
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected pills */}
      {value.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-white border border-purple-300 text-purple-800 text-xs px-2 py-0.5 rounded-full"
            >
              {v}
              <button
                onClick={() => onChange(value.filter((x) => x !== v))}
                className="text-purple-400 hover:text-purple-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tree */}
      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        {!data || Object.keys(data).length === 0 ? (
          <p className="p-4 text-sm text-slate-400 text-center">No results found</p>
        ) : (
          Object.entries(data).map(([sub, groups]) => {
            const subSelectedCount = countGroupSelected(groups);
            const subOpen = isSearching || openSubdivisions[sub];
            return (
              <div key={sub} className="border-b border-slate-100 last:border-b-0">
                {/* Subdivision header */}
                <button
                  type="button"
                  onClick={() => toggleSubdivision(sub)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {subOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-sm font-bold text-slate-800">{sub}</span>
                    {subSelectedCount > 0 && (
                      <span className="text-xs bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {subSelectedCount}
                      </span>
                    )}
                  </div>
                </button>

                {subOpen &&
                  Object.entries(groups).map(([group, descs]) => {
                    const groupSelectedCount = countSelected(descs);
                    const groupOpen = isSearching || openGroups[group];
                    return (
                      <div key={group} className="border-t border-slate-100">
                        {/* Group header */}
                        <button
                          type="button"
                          onClick={() => toggleGroup(group)}
                          className="w-full flex items-center justify-between pl-8 pr-4 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            {groupOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="text-sm font-semibold text-slate-700">{group}</span>
                            {groupSelectedCount > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">
                                {groupSelectedCount}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{descs.length}</span>
                        </button>

                        {groupOpen &&
                          descs.map((desc) => {
                            const isChecked = value.includes(desc);
                            return (
                              <label
                                key={desc}
                                className={`flex items-center gap-3 pl-12 pr-4 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors ${isChecked ? "bg-purple-50" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggle(desc)}
                                  className="w-4 h-4 accent-purple-600 flex-shrink-0"
                                />
                                <span className="text-sm text-slate-800">{desc}</span>
                              </label>
                            );
                          })}
                      </div>
                    );
                  })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
