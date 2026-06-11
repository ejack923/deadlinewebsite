import { useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getAppearanceColor, GRANT_BADGE, ACTION_OPTIONS, ACTION_STYLE } from "@/lib/billingConstants";
import EmailModal from "./EmailModal";

export default function AppearanceRow({ entry, action, onActionChange }) {
  const [expanded, setExpanded] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [acfFile, setAcfFile] = useState(null); // { name, url }
  const [acfUploading, setAcfUploading] = useState(false);
  const acfInputRef = useRef();
  
  const colorClass = getAppearanceColor(entry.appearance_type);
  const isNotClaimable = entry.claimable === false;

  const [userNotes, setUserNotes] = useState("");

  const handleActionSelect = (value) => {
    if (value === "Aid required" || value === "Extension required") {
      setPendingAction(value);
      setShowEmailModal(true);
    }
    if (value === "ACF lodged") {
      setExpanded(true);
    }
    onActionChange(entry.id, value);
  };

  const handleEmailClose = () => {
    setShowEmailModal(false);
    setPendingAction(null);
  };

  const handleAcfUpload = async (file) => {
    if (!file) return;
    setAcfUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAcfFile({ name: file.name, url: file_url });
    setAcfUploading(false);
    if (acfInputRef.current) acfInputRef.current.value = "";
  };

  return (
    <>
      {showEmailModal && (
        <EmailModal
          entry={entry}
          actionType={pendingAction}
          onClose={handleEmailClose}
        />
      )}
      <div className={`rounded-lg border overflow-hidden ${isNotClaimable ? "border-slate-100 opacity-60 bg-slate-50" : "border-slate-200 bg-white"}`}>
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-900">{entry.date || "—"}</span>
              {entry.client_name && <span className="text-sm font-semibold text-slate-700">{entry.client_name}</span>}
              {entry.grant_type && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${GRANT_BADGE[entry.grant_type] || "bg-slate-100 text-slate-600 border-slate-200"}`}>{entry.grant_type}</span>
              )}
              {entry.appearance_type && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>{entry.appearance_type}</span>
              )}
              {entry.lawyer_initials && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{entry.lawyer_initials}</span>
              )}
              {entry.court && <span className="text-xs text-slate-500">{entry.court}</span>}
            </div>
            {entry.atlas_claim_type && !isNotClaimable && (
              <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 border ${entry.atlas_claim_type === "Confirm adj type" ? "bg-amber-50 border-amber-300" : "bg-purple-50 border-purple-200"}`}>
                <span className={`text-xs font-medium ${entry.atlas_claim_type === "Confirm adj type" ? "text-amber-600" : "text-purple-500"}`}>ATLAS:</span>
                <span className={`text-xs font-semibold ${entry.atlas_claim_type === "Confirm adj type" ? "text-amber-800" : "text-purple-800"}`}>{entry.atlas_claim_type}</span>
              </div>
            )}
            {isNotClaimable && <span className="text-xs text-slate-400 italic">Not claimable</span>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <select
              value={action || ""}
              onChange={e => handleActionSelect(e.target.value)}
              className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer ${
                action ? ACTION_STYLE[action] : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              {ACTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>
        {expanded && (
          <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-3 bg-slate-50">
            <div className="space-y-2">
              {entry.outcome && <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Outcome</p><p className="text-sm text-slate-700">{entry.outcome}</p></div>}
              {entry.next_date && <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Next Date</p><p className="text-sm text-slate-700">{entry.next_date}</p></div>}
              {entry.counsel_briefed && <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Counsel</p><p className="text-sm text-slate-700">{entry.counsel_briefed}</p></div>}
              {entry.notes && <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Notes</p><p className="text-sm text-slate-700">{entry.notes}</p></div>}
            </div>
            
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Action Notes</p>
              <textarea
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                placeholder="Add any internal notes about this claim..."
                rows={2}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-white"
              />
            </div>

          </div>
        )}
      </div>
    </>
  );
}
