import React, { useMemo, useState } from "react";
import { ArrowLeft, FileSpreadsheet, Printer } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { addToBundle } from "@/components/BundleBar";
import FileCounter from "@/components/prep/FileCounter";
import PageCalculator from "@/components/prep/PageCalculator";
import { exportCounselExcel } from "@/utils/exportCounselExcel";

const CHARGE_TYPES = [
  "Affray", "Armed robbery", "Cause serious injury", "Drug cultivation",
  "Drug importation", "Drug trafficking", "Fraud", "Homicide", "Kidnapping",
  "Sexual offences", "Taxation offences", "Theft/burglary", "Other (give details)",
];
const CASE_TYPES = ["State law", "Commonwealth law"];
const STAGES = ["Committal", "Plea", "Trial"];
const PREP_ROLES = [
  "Senior Counsel",
  "Senior Junior Counsel",
  "Junior Counsel",
  "Solicitor",
];
const COUNSEL_RATES = {
  "Magistrates' Court": 178,
  "County Court": 238,
  "Supreme Court": 326,
};
const SOLICITOR_RATES = {
  "Magistrates' Court": 178,
  "County Court": 187,
  "Supreme Court": 298,
};
const PERUSAL_RATE = 90;
const SCAN_RATE = 180;

const ROLE_CONFIG = {
  "Senior Counsel": {
    title: "Additional Preperation - Senior Counsel",
    summaryTitle: "Preparation fees worksheet - Senior Counsel",
    bundleLabel: "Additional Prep (Senior Counsel)",
    emailSubject: "Additional Prep Worksheet (Senior Counsel)",
    emailHeading: "ADDITIONAL PREPERATION - SENIOR COUNSEL",
    guideline: "The relevant guideline is contained in fee schedule 4 of the Legal Aid Handbook (Part 23).",
    accent: {
      heading: "text-blue-800 border-blue-100",
      input: "focus:ring-blue-300",
      radio: "accent-blue-700",
      banner: "from-blue-700 to-blue-800",
      button: "bg-blue-700 hover:bg-blue-800",
      secondaryButton: "bg-indigo-600 hover:bg-indigo-700",
      summary: "bg-blue-50 border-blue-200 text-blue-800 border-blue-300",
      backLink: "hover:text-blue-600",
    },
    usesCourt: false,
    usesScanning: true,
    usesVideo: true,
    supportsExcel: false,
    note: "",
    hourlyRate: () => 436,
    billableHours: ({ subtotal }) => Math.round(Math.max(0, subtotal - 8)),
    summaryLine: (rate) => `Less 8 hours at $${rate}/hr:`,
  },
  "Senior Junior Counsel": {
    title: "Additional Preperation - Senior Junior Counsel",
    summaryTitle: "Preparation fees worksheet - Senior Junior Counsel",
    bundleLabel: "Additional Prep (Senior Junior Counsel)",
    emailSubject: "Additional Prep Worksheet (Senior Junior Counsel)",
    emailHeading: "ADDITIONAL PREPERATION - SENIOR JUNIOR COUNSEL",
    guideline: "The relevant guideline is contained in fee schedule 4 of the Legal Aid Handbook (Part 23).",
    accent: {
      heading: "text-purple-800 border-purple-100",
      input: "focus:ring-purple-300",
      radio: "accent-purple-700",
      banner: "from-purple-700 to-purple-800",
      button: "bg-purple-700 hover:bg-purple-800",
      secondaryButton: "bg-purple-600 hover:bg-purple-700",
      summary: "bg-purple-50 border-purple-200 text-purple-800 border-purple-300",
      backLink: "hover:text-purple-600",
    },
    usesCourt: true,
    usesScanning: true,
    usesVideo: true,
    supportsExcel: true,
    note: "",
    hourlyRate: (court) => COUNSEL_RATES[court] || 0,
    billableHours: ({ subtotal }) => Math.round(Math.max(0, subtotal - 8)),
    summaryLine: (rate, court) => `Less 8 hours at $${rate}/hr${court ? ` (${court})` : ""}:`,
  },
  "Junior Counsel": {
    title: "Additional Preperation - Junior Counsel",
    summaryTitle: "Preparation fees worksheet - Junior Counsel",
    bundleLabel: "Additional Prep (Junior Counsel)",
    emailSubject: "Additional Prep Worksheet (Junior Counsel)",
    emailHeading: "ADDITIONAL PREPERATION - JUNIOR COUNSEL",
    guideline: "The relevant guideline is contained in fee schedule 4 of the Legal Aid Handbook (Part 23).",
    accent: {
      heading: "text-purple-800 border-purple-100",
      input: "focus:ring-purple-300",
      radio: "accent-purple-700",
      banner: "from-purple-700 to-purple-800",
      button: "bg-purple-700 hover:bg-purple-800",
      secondaryButton: "bg-purple-600 hover:bg-purple-700",
      summary: "bg-purple-50 border-purple-200 text-purple-800 border-purple-300",
      backLink: "hover:text-purple-600",
    },
    usesCourt: true,
    usesScanning: true,
    usesVideo: true,
    supportsExcel: true,
    note: "Where two Counsel are engaged, Junior Counsel is only entitled to perusals.",
    hourlyRate: (court) => COUNSEL_RATES[court] || 0,
    billableHours: ({ subtotal }) => Math.round(Math.max(0, subtotal - 8)),
    summaryLine: (rate, court) => `Less 8 hours at $${rate}/hr${court ? ` (${court})` : ""}:`,
  },
  "Solicitor": {
    title: "Additional Preperation - Solicitor",
    summaryTitle: "Preparation fees worksheet - Solicitor",
    bundleLabel: "Additional Prep (Solicitor)",
    emailSubject: "Additional Prep Worksheet (Solicitor)",
    emailHeading: "ADDITIONAL PREPERATION - SOLICITOR",
    guideline: "The relevant guideline is contained in fee schedule 1 of the Legal Aid Handbook (Part 23).",
    accent: {
      heading: "text-green-800 border-green-100",
      input: "focus:ring-green-300",
      radio: "accent-green-700",
      banner: "from-green-700 to-green-800",
      button: "bg-green-700 hover:bg-green-800",
      secondaryButton: "bg-green-600 hover:bg-green-700",
      summary: "bg-green-50 border-green-200 text-green-800 border-green-300",
      backLink: "hover:text-green-600",
    },
    usesCourt: true,
    usesScanning: false,
    usesVideo: false,
    supportsExcel: false,
    note: "Solicitor additional preparation can only calculate perusals.",
    hourlyRate: (court) => SOLICITOR_RATES[court] || 0,
    billableHours: ({ perusalsHours }) => Math.min(15, Math.max(0, perusalsHours - 20)),
    summaryLine: (rate, court) => `Total (max 15 hours) at $${rate}/hr${court ? ` (${court})` : ""}:`,
  },
};

const SectionHeading = ({ children, className }) => (
  <h2 className={`text-base font-bold mt-8 mb-3 border-b pb-1 ${className}`}>{children}</h2>
);
const FieldLabel = ({ children }) => (
  <label className="block text-sm text-slate-700 mb-1">{children}</label>
);
const TextInput = ({ value, onChange, placeholder = "", type = "text", className = "" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${className}`}
  />
);
const NumInput = ({ value, onChange, className = "" }) => (
  <input
    type="number"
    min="0"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    className={`border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 w-24 ${className}`}
  />
);
const TextArea = ({ value, onChange, rows = 3, placeholder = "", className = "" }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    placeholder={placeholder}
    className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y ${className}`}
  />
);
const Row = ({ label, children }) => (
  <div className="flex items-center gap-4 mb-2">
    <span className="text-sm text-slate-700 w-52 flex-shrink-0">{label}</span>
    {children}
  </div>
);

const clampMinutes = (value) => {
  const minutes = Math.floor(Number(value) || 0);
  return Math.min(59, Math.max(0, minutes));
};

const splitHoursAndMinutes = (value) => {
  const totalMinutes = Math.max(0, Math.round((Number(value) || 0) * 60));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};

const formatHoursAndMinutes = (hours, minutes) => {
  const hourValue = Math.max(0, Number(hours) || 0);
  const minuteValue = clampMinutes(minutes);
  const parts = [];

  if (hourValue || !minuteValue) {
    parts.push(`${hourValue} hour${hourValue === 1 ? "" : "s"}`);
  }
  if (minuteValue) {
    parts.push(`${minuteValue} minute${minuteValue === 1 ? "" : "s"}`);
  }

  return parts.join(" ");
};

const getInitialRole = (searchParams) => {
  const requestedRole = searchParams.get("role");
  return PREP_ROLES.includes(requestedRole) ? requestedRole : "Senior Counsel";
};

export default function AdditionalPrepWorksheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    prepRole: getInitialRole(searchParams),
    clientName: "", vlaRefNo: "", charges: "", chargeType: "", chargeDetails: "",
    caseType: "", stage: "", court: "",
    statements: 0, committaltranscript: 0, previousTrialTranscript: 0, recordOfInterview: 0,
    photographs: 0, financialDocuments: 0, transcriptsLDTI: 0, surveillanceLogs: 0,
    otherExhibits: 0, otherExhibitsDetails: "", otherDocuments: 0, otherDocumentsDetails: "",
    excessScanningHours: 0,
    videoAudioHours: 0, videoAudioMinutes: 0, videoAudioDetails: "",
    satisfiedPrep: "", satisfiedGrant: "",
    previousGrantMade: "", previousGrantDetails: "",
    nonsittingDays: 0,
    meansConfirm: false, practitionerConfirm: false,
    practitionerName: "", signatureDate: "", firmNameAddress: "", reference: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const config = ROLE_CONFIG[form.prepRole];

  const set = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "prepRole") {
        if (!ROLE_CONFIG[value].usesCourt) {
          next.court = "";
        }
      }
      return next;
    });
  };

  const totalPerusals = form.statements + form.committaltranscript + form.previousTrialTranscript + form.recordOfInterview;
  const perusalsHours = totalPerusals / PERUSAL_RATE;
  const totalScanning = form.photographs + form.financialDocuments + form.transcriptsLDTI + form.surveillanceLogs + form.otherExhibits + form.otherDocuments;
  const scanningHoursBase = totalScanning / SCAN_RATE;
  const scanningHours = config.usesScanning ? (scanningHoursBase > 10 ? parseFloat(form.excessScanningHours) || 0 : scanningHoursBase) : 0;
  const videoHours = config.usesVideo ? ((parseFloat(form.videoAudioHours) || 0) + (clampMinutes(form.videoAudioMinutes) / 60)) : 0;
  const videoDuration = formatHoursAndMinutes(form.videoAudioHours, form.videoAudioMinutes);
  const subtotal = perusalsHours + scanningHours + videoHours;
  const hourlyRate = config.hourlyRate(form.court);
  const billableHours = config.billableHours({ perusalsHours, subtotal });
  const preparationAmount = billableHours * hourlyRate;

  const ratesByCourt = useMemo(() => (form.prepRole === "Solicitor" ? SOLICITOR_RATES : COUNSEL_RATES), [form.prepRole]);

  const setVideoAudioFromDecimal = (value) => {
    const next = splitHoursAndMinutes(value);
    setForm((current) => ({
      ...current,
      videoAudioHours: next.hours,
      videoAudioMinutes: next.minutes,
    }));
  };

  const handleRoleChange = (nextRole) => {
    set("prepRole", nextRole);
    setSearchParams({ role: nextRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const infoLines = [
      "PART B: INFORMATION",
      "Material to peruse:",
      `  Statements: ${form.statements} pages`,
      `  Committal transcript: ${form.committaltranscript} pages`,
      `  Previous trial transcript: ${form.previousTrialTranscript} pages`,
      `  Record of interview: ${form.recordOfInterview} pages`,
      `  TOTAL perusals: ${totalPerusals} pages = ${perusalsHours.toFixed(2)} hours at ${PERUSAL_RATE} pages/hr`,
    ];

    if (config.usesScanning) {
      infoLines.push(
        "",
        "Material to scan:",
        `  Photographs: ${form.photographs} pages`,
        `  Financial documents: ${form.financialDocuments} pages`,
        `  Transcripts of LD/TI: ${form.transcriptsLDTI} pages`,
        `  Surveillance logs: ${form.surveillanceLogs} pages`,
        `  Other exhibits: ${form.otherExhibits} pages (${form.otherExhibitsDetails})`,
        `  Other documents: ${form.otherDocuments} pages (${form.otherDocumentsDetails})`,
        `  TOTAL scanning: ${totalScanning} pages = ${scanningHoursBase.toFixed(2)} hrs base${scanningHoursBase > 10 ? ` | Allowed hours (excess): ${form.excessScanningHours}` : ""}`,
      );
    }

    if (config.usesVideo) {
      infoLines.push(
        "",
        `Video/Audio Tapes/CDs: ${videoDuration}`,
        `  Details: ${form.videoAudioDetails}`,
      );
    }

    const decisionLines = [
      "PART D: DECISION",
      `Grant of assistance warranted: ${form.satisfiedGrant}`,
      `  Perusals: ${perusalsHours.toFixed(2)} hours`,
    ];

    if (config.usesScanning) {
      decisionLines.push(`  Scanning: ${scanningHours.toFixed(2)} hours`);
    }
    if (config.usesVideo) {
      decisionLines.push(`  Video/Audio Tape: ${videoHours.toFixed(2)} hours`);
    }
    if (form.prepRole === "Solicitor") {
      decisionLines.push(
        `  Less 20 hours: ${Math.max(0, perusalsHours - 20).toFixed(2)} hours`,
        `  Total (max 15 hours): ${billableHours.toFixed(2)} hours at $${hourlyRate}/hr${form.court ? ` (${form.court})` : ""}`,
      );
    } else {
      decisionLines.push(
        `  Subtotal: ${subtotal.toFixed(2)} hours`,
        `  Less 8 hours: ${billableHours.toFixed(2)} hours at $${hourlyRate}/hr${form.court ? ` (${form.court})` : ""}`,
      );
    }
    decisionLines.push(`  PREPARATION AMOUNT: $${preparationAmount.toFixed(2)}`);

    await base44.integrations.Core.SendEmail({
      to: "ejackson@completelawsupport.com",
      subject: `${config.emailSubject} - ${form.clientName || "Unknown Client"} (${form.vlaRefNo || "No Ref"})`,
      body: `
${config.emailHeading}

CLIENT NAME: ${form.clientName}
VLA REF NO: ${form.vlaRefNo}

PART A: BACKGROUND
Charges: ${form.chargeType}${form.chargeDetails ? ` - ${form.chargeDetails}` : ""}
Additional charge detail: ${form.charges}
Type of case: ${form.caseType}
Stage of matter: ${form.stage}
${config.usesCourt ? `Court: ${form.court}` : ""}
${config.note ? `Note: ${config.note}` : ""}

${infoLines.join("\n")}

PART C: RELEVANT GUIDELINE
Satisfied preparation is necessary: ${form.satisfiedPrep}

${decisionLines.join("\n")}

Previous grant of aid made for preparation: ${form.previousGrantMade}
Previous grant details: ${form.previousGrantDetails}
${form.prepRole === "Senior Counsel" ? `Non-sitting days covered by ACF/VLA: ${form.nonsittingDays} days` : ""}

PART E: MEANS
Client financial details unchanged since original application: ${form.meansConfirm ? "Confirmed" : "Not confirmed"}

PART F: PRACTITIONER RECOMMENDATION
Practitioner recommends assistance: ${form.practitionerConfirm ? "Confirmed" : "Not confirmed"}
Practitioner Name: ${form.practitionerName}
Date: ${form.signatureDate}
Firm Name/Address: ${form.firmNameAddress}
Reference: ${form.reference}
      `.trim(),
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Worksheet Submitted</h2>
          <p className="text-slate-500 text-sm mb-6">The worksheet has been sent to ejackson@completelawsupport.com</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSubmitted(false)} className={`${config.accent.button} text-white px-6 py-2 rounded-lg text-sm transition-colors`}>
              Submit Another
            </button>
            <a href={createPageUrl("Home")} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">
              Back to Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>

      <div className="no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <a
          href={createPageUrl("Home")}
          className={`flex items-center gap-2 text-slate-600 transition-colors text-sm font-medium ${config.accent.backLink}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
      </div>

      <div className="py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`bg-gradient-to-r ${config.accent.banner} px-8 py-6`}>
            <h1 className="text-white text-2xl font-bold">{config.title}</h1>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel>Worksheet Type</FieldLabel>
                <select
                  value={form.prepRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.accent.input}`}
                >
                  {PREP_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div><FieldLabel>Client Name</FieldLabel><TextInput value={form.clientName} onChange={(v) => set("clientName", v)} className={config.accent.input} /></div>
              <div><FieldLabel>VLA Ref No</FieldLabel><TextInput value={form.vlaRefNo} onChange={(v) => set("vlaRefNo", v)} className={config.accent.input} /></div>
            </div>

            <SectionHeading className={config.accent.heading}>Part A: Background</SectionHeading>
            {config.note && (
              <div className={`p-3 mb-4 border rounded text-sm ${config.accent.summary.split(" ").slice(0, 2).join(" ")} ${config.accent.heading.split(" ")[0]}`}>
                <strong>Note:</strong> {config.note}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel>Charges</FieldLabel>
                <select
                  value={form.chargeType}
                  onChange={(e) => set("chargeType", e.target.value)}
                  className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.accent.input}`}
                >
                  <option value="">Select charge type...</option>
                  {CHARGE_TYPES.map((charge) => (
                    <option key={charge} value={charge}>{charge}</option>
                  ))}
                </select>
              </div>
              <div><FieldLabel>Details (if required)</FieldLabel><TextInput value={form.chargeDetails} onChange={(v) => set("chargeDetails", v)} placeholder="Additional charge details..." className={config.accent.input} /></div>
              <div>
                <FieldLabel>Type of case</FieldLabel>
                <select
                  value={form.caseType}
                  onChange={(e) => set("caseType", e.target.value)}
                  className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.accent.input}`}
                >
                  <option value="">Select...</option>
                  {CASE_TYPES.map((caseType) => (
                    <option key={caseType} value={caseType}>{caseType}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Stage of matter</FieldLabel>
                <select
                  value={form.stage}
                  onChange={(e) => set("stage", e.target.value)}
                  className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.accent.input}`}
                >
                  <option value="">Select...</option>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              {config.usesCourt && (
                <div>
                  <FieldLabel>Court</FieldLabel>
                  <select
                    value={form.court}
                    onChange={(e) => set("court", e.target.value)}
                    className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.accent.input}`}
                  >
                    <option value="">Select court...</option>
                    {Object.keys(ratesByCourt).map((court) => (
                      <option key={court} value={court}>{court} (${ratesByCourt[court]}/hr)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <SectionHeading className={config.accent.heading}>Part B: Information</SectionHeading>
            <p className="text-sm font-semibold text-slate-700 mb-3">Material to peruse</p>
            <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
              <Row label="Statements"><NumInput value={form.statements} onChange={(v) => set("statements", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.statements} onCount={(v) => set("statements", v)} /><PageCalculator onResult={(v) => set("statements", v)} /></Row>
              <Row label="Committal transcript"><NumInput value={form.committaltranscript} onChange={(v) => set("committaltranscript", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.committaltranscript} onCount={(v) => set("committaltranscript", v)} /><PageCalculator onResult={(v) => set("committaltranscript", v)} /></Row>
              <Row label="Previous trial transcript"><NumInput value={form.previousTrialTranscript} onChange={(v) => set("previousTrialTranscript", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.previousTrialTranscript} onCount={(v) => set("previousTrialTranscript", v)} /><PageCalculator onResult={(v) => set("previousTrialTranscript", v)} /></Row>
              <Row label="Record of interview"><NumInput value={form.recordOfInterview} onChange={(v) => set("recordOfInterview", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.recordOfInterview} onCount={(v) => set("recordOfInterview", v)} /><PageCalculator onResult={(v) => set("recordOfInterview", v)} /></Row>
              <div className="border-t border-slate-200 pt-2 mt-2 flex items-center gap-4 text-sm font-semibold text-slate-700">
                <span className="w-52 flex-shrink-0">TOTAL perusals:</span>
                <span>{totalPerusals} pages</span>
                <span className="text-slate-500">= {perusalsHours.toFixed(2)} hours at {PERUSAL_RATE} pages/hr</span>
              </div>
            </div>

            {config.usesScanning && (
              <>
                <p className="text-sm font-semibold text-slate-700 mb-3">Material to scan</p>
                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                  <Row label="Photographs"><NumInput value={form.photographs} onChange={(v) => set("photographs", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.photographs} onCount={(v) => set("photographs", v)} /><PageCalculator onResult={(v) => set("photographs", v)} /></Row>
                  <Row label="Financial documents"><NumInput value={form.financialDocuments} onChange={(v) => set("financialDocuments", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.financialDocuments} onCount={(v) => set("financialDocuments", v)} /><PageCalculator onResult={(v) => set("financialDocuments", v)} /></Row>
                  <Row label="Transcripts of LD/TI"><NumInput value={form.transcriptsLDTI} onChange={(v) => set("transcriptsLDTI", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.transcriptsLDTI} onCount={(v) => set("transcriptsLDTI", v)} /><PageCalculator onResult={(v) => set("transcriptsLDTI", v)} /></Row>
                  <Row label="Surveillance logs"><NumInput value={form.surveillanceLogs} onChange={(v) => set("surveillanceLogs", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.surveillanceLogs} onCount={(v) => set("surveillanceLogs", v)} /><PageCalculator onResult={(v) => set("surveillanceLogs", v)} /></Row>
                  <div className="flex items-start gap-4 mb-2">
                    <span className="text-sm text-slate-700 w-52 flex-shrink-0 pt-2">Other exhibits</span>
                    <div className="flex items-center gap-2"><NumInput value={form.otherExhibits} onChange={(v) => set("otherExhibits", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.otherExhibits} onCount={(v) => set("otherExhibits", v)} /><PageCalculator onResult={(v) => set("otherExhibits", v)} /></div>
                    <div className="flex-1"><TextInput value={form.otherExhibitsDetails} onChange={(v) => set("otherExhibitsDetails", v)} placeholder="Details..." className={config.accent.input} /></div>
                  </div>
                  <div className="flex items-start gap-4 mb-2">
                    <span className="text-sm text-slate-700 w-52 flex-shrink-0 pt-2">Other documents</span>
                    <div className="flex items-center gap-2"><NumInput value={form.otherDocuments} onChange={(v) => set("otherDocuments", v)} className={config.accent.input} /><span className="text-sm text-slate-500">pages</span><FileCounter type="pdf" currentValue={form.otherDocuments} onCount={(v) => set("otherDocuments", v)} /><PageCalculator onResult={(v) => set("otherDocuments", v)} /></div>
                    <div className="flex-1"><TextInput value={form.otherDocumentsDetails} onChange={(v) => set("otherDocumentsDetails", v)} placeholder="Details..." className={config.accent.input} /></div>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex items-center gap-4 text-sm font-semibold text-slate-700">
                    <span className="w-52 flex-shrink-0">TOTAL scanning:</span>
                    <span>{totalScanning} pages</span>
                    <span className="text-slate-500">= {scanningHoursBase.toFixed(2)} hours at {SCAN_RATE} pages/hr</span>
                  </div>
                  {scanningHoursBase > 10 && (
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-700 w-52 flex-shrink-0">If in excess of 10 hours, allow:</span>
                      <NumInput value={form.excessScanningHours} onChange={(v) => set("excessScanningHours", v)} className={config.accent.input} />
                      <span className="text-sm text-slate-500">hours</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {config.usesVideo && (
              <>
                <p className="text-sm font-semibold text-slate-700 mb-2">Video/Audio Tapes/CDs</p>
                <p className="text-xs text-slate-500 mb-3">VLA will only allow the viewing or listening of the pertinent hours of tapes and not the whole of the recorded material. Please allow only a proportion of the relevant time dealing with the disputed or material issues and not the viewing of the tapes in their entirety. Do not include material that is duplicated in transcripts.</p>
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <Row label="Video/Audio tapes/CDs">
                    <NumInput value={form.videoAudioHours} onChange={(v) => set("videoAudioHours", v)} className={config.accent.input} />
                    <span className="text-sm text-slate-500">hours</span>
                    <NumInput value={form.videoAudioMinutes} onChange={(v) => set("videoAudioMinutes", clampMinutes(v))} className={config.accent.input} />
                    <span className="text-sm text-slate-500">minutes</span>
                    <FileCounter type="video" currentValue={videoHours} onCount={(v) => setVideoAudioFromDecimal(parseFloat(v.toFixed(3)))} />
                    <PageCalculator onResult={(v) => setVideoAudioFromDecimal(v)} unit="hours" />
                  </Row>
                  <div className="mt-2">
                    <FieldLabel>Details</FieldLabel>
                    <TextArea value={form.videoAudioDetails} onChange={(v) => set("videoAudioDetails", v)} rows={3} placeholder="e.g. Identification of accused in affray outside venue estimated 15 minutes, tape 4" className={config.accent.input} />
                  </div>
                </div>
              </>
            )}

            <SectionHeading className={config.accent.heading}>Part C: Relevant Guideline</SectionHeading>
            <p className="text-sm text-slate-600 mb-3">{config.guideline}</p>
            <div className="mb-4">
              <FieldLabel>I am satisfied / not satisfied that the preparation sought is necessary:</FieldLabel>
              <div className="flex gap-6 mt-2">
                {["satisfied", "not satisfied"].map((value) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="satisfiedPrep" value={value} checked={form.satisfiedPrep === value} onChange={() => set("satisfiedPrep", value)} className={`w-4 h-4 ${config.accent.radio}`} />
                    <span className="text-sm font-semibold capitalize">{value}</span>
                  </label>
                ))}
              </div>
            </div>

            <SectionHeading className={config.accent.heading}>Part D: Decision</SectionHeading>
            <div className="mb-4">
              <FieldLabel>I am satisfied / not satisfied that a grant of assistance for additional preparation is warranted:</FieldLabel>
              <div className="flex gap-6 mt-2">
                {["satisfied", "not satisfied"].map((value) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="satisfiedGrant" value={value} checked={form.satisfiedGrant === value} onChange={() => set("satisfiedGrant", value)} className={`w-4 h-4 ${config.accent.radio}`} />
                    <span className="text-sm font-semibold capitalize">{value}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={`border rounded-lg p-4 mb-4 ${config.accent.summary}`}>
              <p className="text-sm font-bold mb-3">Calculation Summary</p>
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex justify-between"><span>Perusals:</span><span>{perusalsHours.toFixed(2)} hours</span></div>
                {config.usesScanning && <div className="flex justify-between"><span>Scanning:</span><span>{scanningHours.toFixed(2)} hours</span></div>}
                {config.usesVideo && <div className="flex justify-between"><span>Video/Audio Tape:</span><span>{videoHours.toFixed(2)} hours</span></div>}
                {form.prepRole !== "Solicitor" && (
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} hours</span>
                  </div>
                )}
                {form.prepRole === "Solicitor" && (
                  <div className="flex justify-between text-slate-500"><span>Subtract 20 hours:</span><span>-20</span></div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>{config.summaryLine(hourlyRate, form.court)}</span>
                  <span>{billableHours.toFixed(2)} hrs</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1 mt-1 text-base">
                  <span>Preparation Amount:</span>
                  <span>${preparationAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <FieldLabel>Has a previous grant of aid been made for preparation in this matter?</FieldLabel>
              <div className="flex gap-6 mt-2 mb-2">
                {["Yes", "No"].map((value) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="previousGrantMade" value={value} checked={form.previousGrantMade === value} onChange={() => set("previousGrantMade", value)} className={`w-4 h-4 ${config.accent.radio}`} />
                    <span className="text-sm font-semibold">{value}</span>
                  </label>
                ))}
              </div>
              {form.previousGrantMade === "Yes" && (
                <div className="mt-2">
                  <FieldLabel>Details of previous grants for preparation:</FieldLabel>
                  <TextArea value={form.previousGrantDetails} onChange={(v) => set("previousGrantDetails", v)} rows={3} className={config.accent.input} />
                </div>
              )}
            </div>

            {form.prepRole === "Senior Counsel" && (
              <div className="mb-4 flex items-center gap-4">
                <FieldLabel>Non-sitting days covered by ACF / payable by VLA:</FieldLabel>
                <NumInput value={form.nonsittingDays} onChange={(v) => set("nonsittingDays", v)} className={config.accent.input} />
                <span className="text-sm text-slate-500">days</span>
              </div>
            )}

            <SectionHeading className={config.accent.heading}>Part E: Means</SectionHeading>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.meansConfirm} onChange={(e) => set("meansConfirm", e.target.checked)} className={`w-4 h-4 mt-0.5 ${config.accent.radio}`} />
              <span className="text-sm text-slate-700">The client's financial details have not changed since originally applying for aid, and all documentary proof of means are retained on file.</span>
            </label>

            <SectionHeading className={config.accent.heading}>Part F: Practitioner Recommendation</SectionHeading>
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={form.practitionerConfirm} onChange={(e) => set("practitionerConfirm", e.target.checked)} className={`w-4 h-4 mt-0.5 ${config.accent.radio}`} />
              <span className="text-sm text-slate-700">
                {form.prepRole === "Solicitor"
                  ? "I have attached a letter / memorandum setting out why the grant is justified. I request that assistance be granted at the amount calculated."
                  : "In my opinion the application meets the requirements of the relevant guideline and I recommend that assistance be granted. All required substantiating documentation and information is on file. I have informed my client of this recommendation."}
              </span>
            </label>
            <p className="text-xs text-slate-500 mb-4 bg-amber-50 border border-amber-200 rounded p-3">I acknowledge that under section 44(1) of the Legal Aid Act the provision of a false statement or a failure to disclose relevant information renders me liable to the penalties therein contained, and to action by VLA to remove me and my firm from the Simplified Grants Process and/or the referral panel maintained under section 30 of the Legal Aid Act.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><FieldLabel>Print Practitioner's Name</FieldLabel><TextInput value={form.practitionerName} onChange={(v) => set("practitionerName", v)} className={config.accent.input} /></div>
              <div><FieldLabel>Date</FieldLabel><TextInput type="date" value={form.signatureDate} onChange={(v) => set("signatureDate", v)} className={config.accent.input} /></div>
              <div><FieldLabel>Name & Address of Firm</FieldLabel><TextArea value={form.firmNameAddress} onChange={(v) => set("firmNameAddress", v)} rows={2} className={config.accent.input} /></div>
              <div><FieldLabel>Reference</FieldLabel><TextInput value={form.reference} onChange={(v) => set("reference", v)} className={config.accent.input} /></div>
            </div>

            <div className="mt-8 flex justify-between items-center gap-3 no-print">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Save / Print to PDF
                </button>
                {config.supportsExcel && (
                  <button
                    type="button"
                    onClick={() => exportCounselExcel(form, {
                      totalPerusals, perusalsHours, totalScanning, scanningHoursBase,
                      scanningHours, videoHours, subtotal, billableHours, hourlyRate, preparationAmount,
                    })}
                    className="flex items-center gap-2 border border-green-400 text-green-700 hover:bg-green-50 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export to Excel
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const content = `${config.summaryTitle.toUpperCase()}\n\nClient: ${form.clientName}\nVLA Ref: ${form.vlaRefNo}\nCharges: ${form.chargeType}\n${form.court ? `Court: ${form.court}\n` : ""}\nAmount: $${preparationAmount.toFixed(2)}`;
                    addToBundle(config.bundleLabel, content);
                  }}
                  className={`${config.accent.secondaryButton} text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm`}
                >
                  Add to Bundle
                </button>
                <button type="submit" disabled={submitting} className={`${config.accent.button} text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {submitting ? "Submitting..." : "Submit Worksheet"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
