export const BILLING_PARSER_VERSION = "20260424ai";

export const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    entries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string", description: "Date of the appearance (DD/MM/YYYY format)" },
          client_name: { type: "string", description: "Client full name as written in the diary (e.g. WONGRAM, Nicole)" },
          grant_type: { type: "string", description: "Grant/funding type from brackets after client name: VC = VLA client, L = Legal Aid, V = victim-funded, VLA = VLA, pending = pending. Leave blank if not shown." },
          court: { type: "string", description: "Full court or tribunal name (e.g. Melbourne Magistrates' Court, Mildura County Court, Supreme Court)" },
          appearance_type: { type: "string", description: "Type of appearance — use the exact term from the diary: Mention, Further Mention, Contest, Plea, Sentence, Sentencing, Bail, Committal Mention, ARC Review, Filing Hearing, Case Assessment Hearing, Sentence Indication, Return for Sentence, ICML, CME, FVIO, etc." },
          lawyer_initials: { type: "string", description: "Initials of the LACW lawyer who appeared (e.g. CC, BJ, JW, BU, MZ, CB, EC, EM, AM, MP, RC)" },
          counsel_briefed: { type: "string", description: "Name of any external counsel briefed, if mentioned" },
          outcome: { type: "string", description: "Outcome or result of the appearance as noted in the diary" },
          next_date: { type: "string", description: "Next court date mentioned in the outcome, if any" },
          claimable: { type: "boolean", description: "True if this entry is a claimable VLA appearance (VC, L or VLA grant type, or clearly a legal aid matter). False for admin notes, public holidays, non-sitting days, remand calendars, or matters with no appearance." },
          atlas_claim_type: { type: "string", description: "Suggested ATLAS claim type. IMPORTANT: If the outcome notes an adjournment to a specific future date for a specific appearance type (e.g. 'adj to 15/4 for contest', 'adjourned to 3 June for plea'), set this to 'Confirm adj type' — the next appearance type is not yet billed. Otherwise use: 'Daily appearance fee' for mentions/adjournments; 'Contest hearing appearance' for contests; 'Appearance on sentence or adjournment' for sentence/return for sentence; 'Bail appearance fee' for bail applications; 'Committal mention / case conference appearance' for committal mentions; 'ARC — Review Hearing' for ARC reviews; 'ARC — Eligibility hearing' for ARC eligibility/finalisation; 'Active Case Management — case assessment hearing' for case assessment hearings; 'Sentence indication' for sentence indications; 'Plea — appearance fee (first day)' for pleas; 'Trial — appearance fee (first day)' for trial day 1; 'Directions hearing / mention / callover' for callover/directions. Leave blank if not claimable." },
          notes: { type: "string", description: "Any other relevant notes, flags or observations from the diary entry" },
        }
      }
    },
    summary: { type: "string", description: "Brief summary: diary period covered, total entries found, total claimable entries" }
  }
};

export const APPEARANCE_COLOR = {
  contest: "bg-red-50 border-red-200 text-red-700",
  plea: "bg-purple-50 border-purple-200 text-purple-700",
  bail: "bg-sky-50 border-sky-200 text-sky-700",
  mention: "bg-slate-50 border-slate-200 text-slate-700",
  conference: "bg-amber-50 border-amber-200 text-amber-700",
  sentence: "bg-orange-50 border-orange-200 text-orange-700",
  default: "bg-green-50 border-green-200 text-green-700",
};

export function getAppearanceColor(type) {
  if (!type) return APPEARANCE_COLOR.default;
  const t = type.toLowerCase();
  for (const key of Object.keys(APPEARANCE_COLOR)) {
    if (t.includes(key)) return APPEARANCE_COLOR[key];
  }
  return APPEARANCE_COLOR.default;
}

export const GRANT_BADGE = {
  VC: "bg-purple-100 text-purple-700 border-purple-200",
  L: "bg-blue-100 text-blue-700 border-blue-200",
  V: "bg-pink-100 text-pink-700 border-pink-200",
  VLA: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

export const ACTION_OPTIONS = [
  { value: "", label: "Set action…" },
  { value: "Claimed", label: "Claimed" },
  { value: "Billed and closed", label: "Billed and closed" },
  { value: "Not claimed", label: "Not claimed" },
  { value: "Aid required", label: "Aid required" },
  { value: "Extension required", label: "Extension required" },
  { value: "Aid pending", label: "Aid pending" },
  { value: "ACF lodged", label: "ACF lodged" },
  { value: "Query", label: "Query" },
];

export const ACTION_STYLE = {
  "Claimed": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Billed and closed": "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Not claimed": "bg-slate-100 text-slate-500 border-slate-200",
  "Aid required": "bg-red-100 text-red-700 border-red-300",
  "Extension required": "bg-orange-100 text-orange-700 border-orange-300",
  "Aid pending": "bg-amber-100 text-amber-700 border-amber-300",
  "ACF lodged": "bg-teal-100 text-teal-700 border-teal-300",
  "Query": "bg-blue-100 text-blue-700 border-blue-300",
};

export const STAFF = [
  { name: "Ashleigh McPhail", email: "amcphail@lacw.org.au" },
  { name: "Laura Heffes", email: "lheffes@lacw.org.au" },
  { name: "Ellen Murphy", email: "emurphy@lacw.org.au" },
  { name: "Ellie Pappas", email: "epappas@lacw.org.au" },
];
