import { useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { STAFF } from "@/lib/billingConstants";

export default function EmailModal({ entry, actionType, onClose }) {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleStaff = (email) => {
    setSelectedStaff(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSend = async () => {
    if (!selectedStaff.length) return;
    setSending(true);
    const subject = `LACW — ${actionType}: ${entry.client_name || "Client"} (${entry.date || ""})`;
    const body = `Hi,\n\nThis is a notification regarding the following matter:\n\nClient: ${entry.client_name || "—"}\nDate: ${entry.date || "—"}\nCourt: ${entry.court || "—"}\nAppearance Type: ${entry.appearance_type || "—"}\nGrant Type: ${entry.grant_type || "—"}\nATLAS Claim: ${entry.atlas_claim_type || "—"}\nOutcome: ${entry.outcome || "—"}\n\nAction Required: ${actionType}\n\n${message ? `Message:\n${message}\n\n` : ""}Please refer to the LACW Certification Tool for the relevant documentation.\n\nThis email was sent from the LACW Billing Portal.`;

    for (const email of selectedStaff) {
      await base44.integrations.Core.SendEmail({ to: email, subject, body });
    }
    setSending(false);
    setSent(true);
    setTimeout(() => { onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{actionType}</p>
            <p className="text-xs text-slate-400">{entry.client_name} · {entry.date}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Notify staff</p>
            <div className="space-y-2">
              {STAFF.map(s => (
                <label key={s.email} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(s.email)}
                    onChange={() => toggleStaff(s.email)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Message (optional)</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Add any additional context or notes…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>
          <p className="text-xs text-slate-400">The certification tool link and matter details will be included automatically.</p>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg border border-slate-200 transition-colors">Cancel</button>
          <button
            onClick={handleSend}
            disabled={!selectedStaff.length || sending || sent}
            className="flex items-center gap-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {sent ? "✓ Sent!" : sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send</>}
          </button>
        </div>
      </div>
    </div>
  );
}
