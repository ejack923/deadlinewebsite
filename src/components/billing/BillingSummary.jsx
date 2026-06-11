import { useState, useRef } from "react";
import { CheckCircle2, AlertCircle, Send, ChevronDown, ChevronUp, Paperclip, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { brand } from "@/lib/demoConfig";

const ACTION_STYLE = {
  "Claimed": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Not claimed": "bg-slate-100 text-slate-500 border-slate-200",
  "Aid required": "bg-red-100 text-red-700 border-red-300",
  "Extension required": "bg-orange-100 text-orange-700 border-orange-300",
  "Aid pending": "bg-amber-100 text-amber-700 border-amber-300",
  "ACF lodged": "bg-teal-100 text-teal-700 border-teal-300",
  "Query": "bg-blue-100 text-blue-700 border-blue-300",
};

const NEEDS_ACTION = ["Aid required", "Extension required", "Aid pending", "ACF lodged", "Query"];

export default function BillingSummary({ entries, actions }) {
  const [notes, setNotes] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [claimedOpen, setClaimedOpen] = useState(true);
  const [furtherOpen, setFurtherOpen] = useState(true);
  const [approvalLetters, setApprovalLetters] = useState([]); // [{name, url}]
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadLetters = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push({ name: file.name, url: file_url });
    }
    setApprovalLetters(prev => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const claimed = entries.filter(e => actions[e.id] === "Claimed");
  const notClaimed = entries.filter(e => actions[e.id] === "Not claimed");
  const furtherAction = entries.filter(e => NEEDS_ACTION.includes(actions[e.id]));

  const handleSendSummary = async () => {
    setSending(true);

    const entryRow = (e, showAction = false) => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:8px 10px;font-size:13px;color:#334155;white-space:nowrap;">${e.date || "—"}</td>
        <td style="padding:8px 10px;font-size:13px;color:#1e293b;font-weight:600;">${e.client_name || "—"}</td>
        <td style="padding:8px 10px;font-size:12px;color:#64748b;">${e.grant_type || "—"}</td>
        <td style="padding:8px 10px;font-size:12px;color:#64748b;">${e.appearance_type || "—"}</td>
        ${showAction ? `<td style="padding:8px 10px;"><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:${actionBg(actions[e.id])};color:${actionColor(actions[e.id])};">${actions[e.id]}</span></td>` : `<td style="padding:8px 10px;font-size:12px;color:#7c3aed;">${e.atlas_claim_type || "—"}</td>`}
        <td style="padding:8px 10px;font-size:12px;color:#475569;font-style:italic;">${notes[e.id] || ""}</td>
      </tr>`;

    const tableHeader = (cols) => `
      <tr style="background:#f8fafc;">
        ${cols.map(c => `<th style="padding:8px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;text-align:left;">${c}</th>`).join("")}
      </tr>`;

    const section = (title, color, count, rows, cols) => `
      <div style="margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:15px;font-weight:700;color:#1e293b;">${title}</span>
          <span style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:20px;background:${color.bg};color:${color.text};">${count}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          ${tableHeader(cols)}
          ${rows.length ? rows.join("") : `<tr><td colspan="${cols.length}" style="padding:12px 10px;font-size:13px;color:#94a3b8;font-style:italic;">None</td></tr>`}
        </table>
      </div>`;

    const body = `
      <div style="font-family:system-ui,sans-serif;max-width:700px;margin:0 auto;padding:24px;">
        <div style="background:linear-gradient(135deg,#374151,#1e293b);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h1 style="color:white;font-size:20px;font-weight:700;margin:0;">Demo Billing Summary</h1>
          <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">Generated: ${new Date().toLocaleDateString("en-AU")}</p>
        </div>
        ${section("Claimed", { bg: "#d1fae5", text: "#065f46" }, claimed.length,
          claimed.map(e => entryRow(e, false)),
          ["Date", "Client", "Grant", "Appearance", "ATLAS Claim", "Notes"]
        )}
        ${section("Further Action Required", { bg: "#ffedd5", text: "#9a3412" }, furtherAction.length,
          furtherAction.map(e => entryRow(e, true)),
          ["Date", "Client", "Grant", "Appearance", "Action", "Notes"]
        )}
        ${notClaimed.length > 0 ? section("Not Claimed", { bg: "#f1f5f9", text: "#475569" }, notClaimed.length,
          notClaimed.map(e => entryRow(e, false)),
          ["Date", "Client", "Grant", "Appearance", "ATLAS Claim", "Notes"]
        ) : ""}
        ${approvalLetters.length > 0 ? `
        <div style="margin-bottom:28px;">
          <div style="margin-bottom:10px;"><span style="font-size:15px;font-weight:700;color:#1e293b;">Client Approval Letters</span></div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <tr style="background:#f8fafc;"><th style="padding:8px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;text-align:left;">File</th><th style="padding:8px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;text-align:left;">Link</th></tr>
            ${approvalLetters.map(l => `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 10px;font-size:13px;color:#334155;">${l.name}</td><td style="padding:8px 10px;"><a href="${l.url}" style="color:#7c3aed;font-size:13px;">Download</a></td></tr>`).join("")}
          </table>
        </div>` : ""}
        <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:24px;">Sent from ${brand.appName}</p>
      </div>`;

    await base44.integrations.Core.SendEmail({
      to: "ejackson@completelawsupport.com",
      cc: "",
      subject: `Demo Billing Summary - ${new Date().toLocaleDateString("en-AU")}`,
      body,
    });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const actionBg = (a) => ({ "Claimed": "#d1fae5", "Not claimed": "#f1f5f9", "Aid required": "#fee2e2", "Extension required": "#ffedd5", "Aid pending": "#fef3c7", "ACF lodged": "#ccfbf1", "Query": "#dbeafe" }[a] || "#f1f5f9");
  const actionColor = (a) => ({ "Claimed": "#065f46", "Not claimed": "#475569", "Aid required": "#991b1b", "Extension required": "#9a3412", "Aid pending": "#92400e", "ACF lodged": "#0f766e", "Query": "#1e40af" }[a] || "#475569");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
        <h2 className="text-white font-bold text-base">Billing Summary</h2>
        <p className="text-slate-300 text-xs mt-0.5">All entries actioned — review below</p>
      </div>

      <div className="divide-y divide-slate-100">
        {/* Claimed */}
        <div>
          <button
            onClick={() => setClaimedOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-800">Claimed</span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{claimed.length}</span>
            </div>
            {claimedOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {claimedOpen && (
            <div className="px-5 pb-4 space-y-3">
              {claimed.length === 0 && <p className="text-xs text-slate-400 italic">None</p>}
              {claimed.map(e => (
                <SummaryEntry key={e.id} entry={e} action={actions[e.id]} note={notes[e.id] || ""} onNoteChange={v => setNotes(n => ({ ...n, [e.id]: v }))} />
              ))}
            </div>
          )}
        </div>

        {/* Further action */}
        <div>
          <button
            onClick={() => setFurtherOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-slate-800">Further Action Required</span>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{furtherAction.length}</span>
            </div>
            {furtherOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {furtherOpen && (
            <div className="px-5 pb-4 space-y-3">
              {furtherAction.length === 0 && <p className="text-xs text-slate-400 italic">None</p>}
              {furtherAction.map(e => (
                <SummaryEntry key={e.id} entry={e} action={actions[e.id]} note={notes[e.id] || ""} onNoteChange={v => setNotes(n => ({ ...n, [e.id]: v }))} />
              ))}
            </div>
          )}
        </div>

        {/* Not claimed — collapsed by default, just count */}
        {notClaimed.length > 0 && (
          <div className="px-5 py-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Not claimed:</span>
            <span className="text-xs font-bold text-slate-500">{notClaimed.length} matter{notClaimed.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Approval Letters Upload */}
      <div className="px-5 py-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Client Approval Letters</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
            {uploading ? "Uploading…" : "Attach letter"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*,.doc,.docx"
            multiple
            className="hidden"
            onChange={e => handleUploadLetters(e.target.files)}
          />
        </div>
        {approvalLetters.length > 0 && (
          <div className="space-y-1.5">
            {approvalLetters.map((l, i) => (
              <div key={i} className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                <Paperclip className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-purple-700 font-medium hover:underline truncate flex-1">{l.name}</a>
                <button onClick={() => setApprovalLetters(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {approvalLetters.length === 0 && (
          <p className="text-xs text-slate-400 italic">No letters attached yet</p>
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
        <button
          onClick={handleSendSummary}
          disabled={sending || sent}
          className="flex items-center gap-2 text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {sent ? "✓ Summary sent!" : sending ? "Sending…" : <><Send className="w-4 h-4" /> Email summary</>}
        </button>
      </div>
    </div>
  );
}

function SummaryEntry({ entry, action, note, onNoteChange }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-700">{entry.date || "—"}</span>
        <span className="text-xs font-semibold text-slate-800">{entry.client_name || "—"}</span>
        {entry.grant_type && <span className="text-xs text-slate-500">({entry.grant_type})</span>}
        {entry.appearance_type && <span className="text-xs text-slate-500">· {entry.appearance_type}</span>}
        {action && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ml-auto ${ACTION_STYLE[action] || ""}`}>{action}</span>
        )}
      </div>
      {entry.atlas_claim_type && action === "Claimed" && (
        <p className="text-xs text-purple-700 font-medium">ATLAS: {entry.atlas_claim_type}</p>
      )}
      <textarea
        value={note}
        onChange={e => onNoteChange(e.target.value)}
        placeholder="Add a note for this entry…"
        rows={2}
        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-white"
      />
    </div>
  );
}
