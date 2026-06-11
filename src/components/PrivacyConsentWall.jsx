import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield } from "lucide-react";

export default function PrivacyConsentWall({ onAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleAccept = async () => {
    if (!checked) return;
    setAccepting(true);
    await base44.auth.updateMe({
      privacy_accepted: true,
      privacy_accepted_date: new Date().toISOString(),
    });
    setAccepting(false);
    onAccepted();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Privacy & Data Consent</h2>
            <p className="text-sm text-slate-500">Required before accessing this system</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm text-slate-700 space-y-3 max-h-64 overflow-y-auto leading-relaxed">
          <p className="font-semibold text-slate-900">Law and Advocacy Centre for Women — Practice Management System</p>
          <p>This system stores and processes confidential client information. By using this system, you acknowledge and agree to the following:</p>
          <p><strong>1. Confidentiality:</strong> All client information accessed through this system is strictly confidential and subject to legal professional privilege and the duties owed under the Legal Profession Uniform Law (Victoria).</p>
          <p><strong>2. Privacy Act 1988 (Cth):</strong> You must handle all personal information in accordance with the Australian Privacy Principles (APPs). Client data must only be used for its intended purpose.</p>
          <p><strong>3. Health Records Act 2001 (Vic):</strong> Health information (including medical and psychological reports) must be handled with the additional protections required under this Act.</p>
          <p><strong>4. Authorised Use Only:</strong> You may only access client files and records relevant to your authorised role. Unauthorised access to client records may constitute a breach of professional obligations and applicable law.</p>
          <p><strong>5. No Unauthorised Disclosure:</strong> You must not disclose, share, copy, or transmit any client information outside of authorised firm systems or without proper authorisation.</p>
          <p><strong>6. Security:</strong> You are responsible for keeping your login credentials secure. You must not share your account with any other person.</p>
          <p><strong>7. Audit:</strong> Your activity within this system may be logged for compliance and audit purposes.</p>
          <p className="text-slate-500 text-xs">For questions about data handling, contact your firm's Privacy Officer or system administrator.</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-blue-700"
          />
          <span className="text-sm text-slate-700">
            I have read and understood the above. I agree to handle all client information in accordance with my professional obligations and applicable Australian law.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checked || accepting}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {accepting ? "Saving..." : "I Accept — Continue to App"}
        </button>
      </div>
    </div>
  );
}