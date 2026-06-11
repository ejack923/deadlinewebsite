import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GRANT_BADGE } from "@/lib/billingConstants";
import AppearanceRow from "./AppearanceRow";

export default function ClientGroup({ clientName, entries, grantType, actions, onActionChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const grantBadge = GRANT_BADGE[grantType] || "bg-slate-100 text-slate-600 border-slate-200";
  const claimableCount = entries.filter(e => e.claimable !== false).length;
  const claimedCount = entries.filter(e => actions[e.id] === "Claimed").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{clientName}</span>
          {grantType && <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${grantBadge}`}>{grantType}</span>}
          <span className="text-xs text-slate-400">{entries.length} appearance{entries.length !== 1 ? "s" : ""}{claimableCount < entries.length ? ` · ${claimableCount} claimable` : ""}</span>
          {claimedCount > 0 && <span className="text-xs font-semibold text-emerald-600">· {claimedCount} claimed</span>}
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {!collapsed && (
        <div className="p-3 space-y-2">
          {entries.map(entry => (
            <AppearanceRow
              key={entry.id}
              entry={entry}
              action={actions[entry.id]}
              onActionChange={onActionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
