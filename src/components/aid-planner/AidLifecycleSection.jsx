import React, { useRef, useState } from "react";
import { Trash2, UploadCloud, HelpCircle, Copy, Check, Calendar } from "lucide-react";
import { extractTextFromPdfFile } from "@/lib/aidLetterClientParser";
import { APPEARANCE_TYPES } from "@/lib/aidPlannerSchema";
import {
  findClaimAvailabilityRow,
  formatClaimAvailabilityLabel,
  formatClaimedToDateLabel,
  formatClaimFeeLabel,
  getClaimAvailabilityTable,
  getClaimedToDateAmount,
  getPlannerAppearanceOptions,
  getClaimTrackerPreviewRows,
  claimMatchesTrackerRow,
} from "@/lib/aidPlannerCriminalFees";
import {
  mapGoogleCalendarEventsToAppearanceClaims,
  parseAppearanceCalendarFile,
  parseAppearanceEvidenceFile,
} from "@/lib/aidPlannerAppearanceImport";
import {
  createGoogleCalendarEvent,
  listGoogleCalendarEvents,
} from "@/lib/googleCalendarClient";
import {
  createOutlookCalendarEvent,
} from "@/lib/microsoftCalendarClient";
import { BooleanField, SelectField } from "./PlannerFields";

export default function AidLifecycleSection({
  planner,
  setFinalisationField,
  addAppearanceClaim,
  updateAppearanceClaim,
  removeAppearanceClaim,
  importAppearanceClaims,
}) {
  const claims = planner.appearanceClaims || [];
  const calendarInputRef = useRef(null);
  const evidenceInputRef = useRef(null);
  const [importError, setImportError] = useState("");
  const [isImportingCalendar, setIsImportingCalendar] = useState(false);
  const [isImportingEvidence, setIsImportingEvidence] = useState(false);
  const [googleAccessToken] = useState(() => window.sessionStorage.getItem("aidPlannerGoogleCalendarAccessToken") || "");
  const [googleCalendars] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("aidPlannerGoogleCalendars") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedGoogleCalendarId] = useState(() => window.sessionStorage.getItem("aidPlannerGoogleSelectedCalendarId") || "");
  const [googleDateFrom, setGoogleDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().slice(0, 10);
  });
  const [googleDateTo, setGoogleDateTo] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().slice(0, 10);
  });
  const [isImportingGoogle, setIsImportingGoogle] = useState(false);
  const [isCreatingGoogleEvent, setIsCreatingGoogleEvent] = useState(false);
  const [outlookAccessToken] = useState(() => window.sessionStorage.getItem("aidPlannerOutlookCalendarAccessToken") || "");
  const [outlookCalendars] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("aidPlannerOutlookCalendars") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedOutlookCalendarId] = useState(() => window.sessionStorage.getItem("aidPlannerOutlookSelectedCalendarId") || "");
  const [isCreatingOutlookEvent, setIsCreatingOutlookEvent] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState("");
  const [showTemplateHelp, setShowTemplateHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAidApproved =
    planner.aid?.applicationStatus === "Aid granted" ||
    planner.application?.decisionResult === "Granted" ||
    planner.funding?.grantInPlace;
  const appearanceOptions =
    planner.matter.matterType === "Criminal"
      ? [...new Set([...getPlannerAppearanceOptions(planner.matter.court, planner.aid?.aidTypeList || []), "Other"])]
      : APPEARANCE_TYPES;
  const claimAvailabilityRows = getClaimAvailabilityTable(planner);
  const previewClaimRows = getClaimTrackerPreviewRows(planner);
  const visibleClaimRows = claimAvailabilityRows.length > 0 ? claimAvailabilityRows : previewClaimRows;
  const grantTypeLabel = Array.isArray(planner.aid?.aidTypeList) && planner.aid.aidTypeList.length > 0
    ? planner.aid.aidTypeList.join("; ")
    : planner.aid?.aidType || "";
  const claimedToDateTotal = visibleClaimRows.reduce((sum, row) => sum + getClaimedToDateAmount(row), 0);
  const claimedToDateTotalLabel = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(claimedToDateTotal);

  const buildPlannerCalendarDraft = () => {
    const listingDate = planner.matter?.nextAppearanceDate;
    if (!listingDate) {
      throw new Error("Add the next listing date before sending the matter to a calendar.");
    }

    const clientName =
      planner.client?.fullName ||
      [planner.client?.firstName, planner.client?.lastName].filter(Boolean).join(" ") ||
      "Matter";
    const listingType = planner.matter?.appearanceType || "Court listing";
    const locationParts = [planner.matter?.court, planner.matter?.location].filter(Boolean);
    const descriptionLines = [
      `--- AID PLANNER TEMPLATE ---`,
      `Client: ${clientName}`,
      `Aid Number: ${planner.aid?.aidNumber || ""}`,
      `Type: ${listingType}`,
      `Outcome: `,
      `Units: `,
      `----------------------------`,
      "",
      listingType ? `Next listing type: ${listingType}` : "",
      planner.aid?.aidTypeList?.length ? `Aid type: ${planner.aid.aidTypeList.join("; ")}` : "",
      locationParts.length ? `Court: ${locationParts.join(" - ")}` : "",
      planner.guidance?.nextAction ? `Planner note: ${planner.guidance.nextAction}` : "",
    ].filter((line) => line !== null);

    const startDate = new Date(`${listingDate}T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const toIsoLocal = (value) => `${value.toISOString().slice(0, 10)}T00:00:00`;

    return {
      summary: `${clientName} - ${listingType}`,
      description: descriptionLines.join("\n"),
      location: planner.matter?.location || planner.matter?.court || "",
      listingDate,
      googleEvent: {
        summary: `${clientName} - ${listingType}`,
        description: descriptionLines.join("\n"),
        location: planner.matter?.location || planner.matter?.court || "",
        start: { date: listingDate },
        end: { date: endDate.toISOString().slice(0, 10) },
      },
      outlookEvent: {
        subject: `${clientName} - ${listingType}`,
        body: {
          contentType: "text",
          content: descriptionLines.join("\n"),
        },
        location: {
          displayName: planner.matter?.location || planner.matter?.court || "",
        },
        isAllDay: true,
        start: {
          dateTime: toIsoLocal(startDate),
          timeZone: "UTC",
        },
        end: {
          dateTime: toIsoLocal(endDate),
          timeZone: "UTC",
        },
      },
    };
  };

  const getEffectiveDateWarning = (claim) => {
    if (!planner.aid?.effectiveDate || !claim?.date) return "";
    if (claim.date >= planner.aid.effectiveDate) return "";
    return "The aid effective date is after your appearance. You cannot claim this appearance with your current grant. You may need to apply for a retropective grant to cover this claim.";
  };

  const handleCalendarImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImportingCalendar(true);
    setImportError("");
    setCalendarStatus("");
    try {
      const items = await parseAppearanceCalendarFile(file, planner);
      importAppearanceClaims(items);
      setCalendarStatus(
        items.length > 0
          ? `Imported ${items.length} calendar event${items.length === 1 ? "" : "s"} relevant to this matter.`
          : "No calendar events matched this matter's client and aid details."
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not import the calendar file.");
    } finally {
      setIsImportingCalendar(false);
      event.target.value = "";
    }
  };

  const handleEvidenceImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImportingEvidence(true);
    setImportError("");
    setCalendarStatus("");
    try {
      const items = await parseAppearanceEvidenceFile(file);
      importAppearanceClaims(items);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not parse the uploaded file note, order, or memo.");
    } finally {
      setIsImportingEvidence(false);
      event.target.value = "";
    }
  };

  const handleGoogleImport = async () => {
    setIsImportingGoogle(true);
    setImportError("");
    setCalendarStatus("");
    try {
      const events = await listGoogleCalendarEvents(
        googleAccessToken,
        selectedGoogleCalendarId,
        googleDateFrom,
        googleDateTo
      );
      const calendarLabel =
        googleCalendars.find((item) => item.id === selectedGoogleCalendarId)?.summary || "Google";
      const mapped = mapGoogleCalendarEventsToAppearanceClaims(events, calendarLabel, planner);
      importAppearanceClaims(mapped);
      setCalendarStatus(
        mapped.length > 0
          ? `Imported ${mapped.length} Google event${mapped.length === 1 ? "" : "s"} from ${calendarLabel} that match this matter.`
          : `No Google events in ${calendarLabel} matched this matter's client and aid details.`
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not import Google Calendar events.");
    } finally {
      setIsImportingGoogle(false);
    }
  };

  const handleGoogleCreateEvent = async () => {
    setIsCreatingGoogleEvent(true);
    setImportError("");
    setCalendarStatus("");
    try {
      const draft = buildPlannerCalendarDraft();
      const response = await createGoogleCalendarEvent(googleAccessToken, selectedGoogleCalendarId, draft.googleEvent);
      const calendarLabel =
        googleCalendars.find((item) => item.id === selectedGoogleCalendarId)?.summary || "Google Calendar";
      setCalendarStatus(`Created Google calendar event in ${calendarLabel}: ${response.summary || draft.summary}.`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not create the Google Calendar event.");
    } finally {
      setIsCreatingGoogleEvent(false);
    }
  };

  const handleOutlookCreateEvent = async () => {
    setIsCreatingOutlookEvent(true);
    setImportError("");
    setCalendarStatus("");
    try {
      const draft = buildPlannerCalendarDraft();
      const response = await createOutlookCalendarEvent(
        outlookAccessToken,
        selectedOutlookCalendarId,
        draft.outlookEvent
      );
      const calendarLabel =
        outlookCalendars.find((item) => item.id === selectedOutlookCalendarId)?.summary || "Outlook Calendar";
      setCalendarStatus(`Created Outlook calendar event in ${calendarLabel}: ${response.subject || draft.summary}.`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not create the Outlook calendar event.");
    } finally {
      setIsCreatingOutlookEvent(false);
    }
  };

  const calendarTemplateText = [
    `--- AID PLANNER TEMPLATE ---`,
    `Client: ${planner.client?.fullName || "CLIENT NAME"}`,
    `Aid Number: ${planner.aid?.aidNumber || ""}`,
    `Type: ${planner.matter?.appearanceType || "MENTION"}`,
    `Outcome: `,
    `Units: `,
    `----------------------------`
  ].join("\n");

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(calendarTemplateText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <section className="rounded-xl border border-slate-200 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Appearances and claims</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTemplateHelp(!showTemplateHelp)}
              className={`p-1.5 rounded-lg transition-colors ${showTemplateHelp ? "bg-purple-100 text-purple-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
              title="Calendar Entry Template Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {googleAccessToken && (
              <button
                type="button"
                onClick={handleGoogleImport}
                disabled={isImportingGoogle}
                className="rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50"
              >
                {isImportingGoogle ? "Syncing..." : "Sync calendar"}
              </button>
            )}
          </div>
        </div>

        {showTemplateHelp && (
          <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50/50 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Calendar Sync Template
                </h3>
                <p className="text-xs text-purple-700 mb-3 leading-relaxed">
                  To ensure your appearances and claims sync perfectly from <b>Google Calendar, Outlook, or Gmail</b>, 
                  simply paste this template into the <b>description/notes</b> field of your calendar event. 
                  When you sync, the system will automatically extract the Type, Outcome, and Units.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors shadow-sm whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Template"}
              </button>
            </div>
            <pre className="bg-white border border-purple-100 rounded-lg p-3 text-xs font-mono text-slate-600 overflow-x-auto whitespace-pre">
              {calendarTemplateText}
            </pre>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-[10px] text-purple-600 bg-white/50 rounded p-2 border border-purple-50">
                <span className="font-bold block mb-0.5 uppercase">Type</span>
                Matches automatically to the fee tracker rows.
              </div>
              <div className="text-[10px] text-purple-600 bg-white/50 rounded p-2 border border-purple-50">
                <span className="font-bold block mb-0.5 uppercase">Outcome</span>
                Fills in the "Notes / Outcome" field in the planner.
              </div>
              <div className="text-[10px] text-purple-600 bg-white/50 rounded p-2 border border-purple-50">
                <span className="font-bold block mb-0.5 uppercase">Units</span>
                Sets kilometres (e.g. 294) for travel fees.
              </div>
            </div>
          </div>
        )}

        {calendarStatus && (
          <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {calendarStatus}
          </div>
        )}
        {importError && (
          <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {importError}
          </div>
        )}

        {!isAidApproved ? (
          <p className="text-sm text-slate-500">This section will appear once aid is approved.</p>
        ) : (
          <>
            {(claimAvailabilityRows.length > 0 || planner.matter.matterType === "Criminal") && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Claim allocation tracker</h4>
                    {grantTypeLabel && (
                      <p className="mt-1 text-sm font-medium text-purple-700">Grant type: {grantTypeLabel}</p>
                    )}
                    <p className="mt-1 text-sm text-slate-500">
                      This table shows the fees, claimable appearance types, available days or lump sums, and what remains after lodged claims are counted.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer shadow-sm flex-shrink-0 transition-colors">
                    <UploadCloud className="w-4 h-4" />
                    Auto-import invoice
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === "application/pdf") {
                          try {
                            const text = await extractTextFromPdfFile(file);
                            const upperText = text.toUpperCase();
                            const seen = new Set();
                            
                            visibleClaimRows.forEach((row) => {
                              const feeTypeUpper = (row.feeType || "").toUpperCase();
                              if (!feeTypeUpper) return;
                              
                              let startIndex = 0;
                              while (startIndex < upperText.length) {
                                const feeTypeIndex = upperText.indexOf(feeTypeUpper, startIndex);
                                if (feeTypeIndex === -1) break;
                                
                                let extractedUnits = "";
                                let extractedDate = "";
                                const afterText = text.substring(feeTypeIndex + feeTypeUpper.length, feeTypeIndex + 100);
                                const numMatch = afterText.match(/^[\s\n]*([\d,.]+)/);
                                const dateMatch = afterText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                                
                                if (numMatch) {
                                  const num = parseFloat(numMatch[1].replace(/,/g, ""));
                                  if (!isNaN(num) && num > 0) {
                                    extractedUnits = Math.round(num).toString();
                                  }
                                }
                                if (dateMatch) {
                                  extractedDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
                                }
                                
                                const signature = `${row.feeType}-${extractedDate}-${extractedUnits}`;
                                if (!seen.has(signature)) {
                                  seen.add(signature);
                                  addAppearanceClaim({
                                    date: extractedDate,
                                    appearanceType: row.appearanceType,
                                    feeType: row.feeType,
                                    claimLodged: true,
                                    invoiceFileName: file.name,
                                    claimedUnits: row.allocationUnit === "kilometre" ? extractedUnits : "",
                                  });
                                }
                                
                                startIndex = feeTypeIndex + feeTypeUpper.length;
                              }
                            });
                          } catch (err) {
                            console.error("Bulk PDF extraction failed", err);
                          }
                          // clear input so same file can be uploaded again if needed
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
                {claimAvailabilityRows.length === 0 && (
                  <div className="mb-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Showing the currently supported claim table preview. Once the matter is recognised as a supported aid type, the claimed and remaining balances will calculate live.
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed divide-y divide-slate-200 text-xs">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="w-[28%] px-2 py-2 font-semibold">Appearance type</th>
                        <th className="w-[14%] px-2 py-2 font-semibold whitespace-nowrap">Available</th>
                        <th className="w-[14%] px-2 py-2 font-semibold whitespace-nowrap">Fee</th>
                        <th className="w-[10%] px-2 py-2 font-semibold whitespace-nowrap">Claimed</th>
                        <th className="w-[16%] px-2 py-2 font-semibold whitespace-nowrap">Remaining</th>
                        <th className="w-[18%] px-2 py-2 font-semibold whitespace-nowrap">Claimed to date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleClaimRows.map((row) => {
                        const isLow = row.remaining <= 1;
                        const isAppearanceUnit = ["appearance", "day", "mention", "attendance"].includes(row.allocationUnit);
                        const maxInputs = Math.min(row.allocationCount || 20, 20);
                        const matchingClaims = claims.filter((claim) => claimMatchesTrackerRow(claim, row));

                        return (
                          <React.Fragment key={row.feeType}>
                            <tr className={isLow ? "bg-amber-50" : ""}>
                              <td className="px-2 py-2 font-medium text-slate-900 break-words">{row.appearanceType}</td>
                              <td className="px-2 py-2 text-slate-700">{formatClaimAvailabilityLabel(row)}</td>
                              <td className="px-2 py-2 text-slate-700 whitespace-nowrap">{formatClaimFeeLabel(row)}</td>
                              <td className="px-2 py-2 text-slate-700">{row.claimed}</td>
                              <td className={`px-2 py-2 font-medium ${isLow ? "text-amber-700" : "text-slate-900"}`}>
                                {row.remainingLabel}
                              </td>
                              <td className="px-2 py-2 text-slate-700 whitespace-nowrap">{formatClaimedToDateLabel(row)}</td>
                            </tr>
                            {maxInputs > 0 && (
                              <tr className="bg-slate-50 border-b border-slate-100">
                                <td colSpan={6} className="px-3 py-2">
                                  <div className="flex flex-col gap-2">
                                    {matchingClaims.map((claim, i) => {
                                      const value = claim?.date || "";
                                      return (
                                        <div key={claim.id} className={`flex flex-wrap items-center gap-3 py-1 ${i > 0 ? "border-t border-slate-200 pt-2 mt-1" : ""}`}>
                                          <span className="text-xs font-medium text-slate-500 w-16 text-right">{isAppearanceUnit ? "App." : "Claim"} {i + 1}:</span>
                                          <input
                                            type="date"
                                            title={`${isAppearanceUnit ? "Appearance" : "Claim"} ${i + 1}`}
                                            value={value}
                                            onChange={(e) => {
                                              const newDate = e.target.value;
                                              if (!newDate && !claim.notes && !claim.invoiceFileName) {
                                                removeAppearanceClaim(claim.id);
                                              } else {
                                                updateAppearanceClaim(claim.id, "date", newDate);
                                              }
                                            }}
                                            className="h-8 w-[130px] rounded border border-purple-300 bg-purple-50 text-purple-900 px-2 text-xs shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                          />
                                          {row.allocationUnit === "kilometre" && (
                                            <input
                                              type="number"
                                              placeholder="km"
                                              title="Kilometres claimed"
                                              value={claim.claimedUnits || ""}
                                              onChange={(e) => updateAppearanceClaim(claim.id, "claimedUnits", e.target.value)}
                                              className="h-8 w-[70px] rounded border border-slate-200 px-2 text-xs shadow-sm focus:border-purple-500 outline-none"
                                            />
                                          )}

                                          <input
                                            type="text"
                                            placeholder="Notes / Outcome..."
                                            value={claim.notes || ""}
                                            onChange={(e) => updateAppearanceClaim(claim.id, "notes", e.target.value)}
                                            className="h-8 flex-1 min-w-[150px] rounded border border-slate-200 px-2 text-xs shadow-sm focus:border-purple-500 outline-none"
                                          />

                                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer whitespace-nowrap">
                                            <input
                                              type="checkbox"
                                              checked={claim.claimLodged || false}
                                              onChange={(e) => updateAppearanceClaim(claim.id, "claimLodged", e.target.checked)}
                                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                                            />
                                            Claimed through ATLAS
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => removeAppearanceClaim(claim.id)}
                                            className="ml-2 text-slate-400 hover:text-rose-600 flex-shrink-0"
                                            title={`Clear ${isAppearanceUnit ? "appearance" : "claim"}`}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      );
                                    })}

                                    {matchingClaims.length < maxInputs && (
                                      <div className={`${matchingClaims.length > 0 ? "border-t border-slate-200 pt-2 mt-1" : ""} py-1 pl-[76px]`}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            addAppearanceClaim({
                                              date: "",
                                              appearanceType: row.appearanceType,
                                              feeType: row.feeType,
                                              claimLodged: false,
                                            });
                                          }}
                                          className="text-xs font-medium text-purple-600 hover:text-purple-700"
                                        >
                                          + Add {isAppearanceUnit ? "appearance" : "claim"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="px-2 py-2 font-semibold text-slate-900">Total</td>
                        <td className="px-2 py-2" />
                        <td className="px-2 py-2" />
                        <td className="px-2 py-2" />
                        <td className="px-2 py-2" />
                        <td className="px-2 py-2 font-semibold text-slate-900 whitespace-nowrap">{claimedToDateTotalLabel}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {claims.length > 0 && claims.filter((claim) => !findClaimAvailabilityRow(planner, claim)).length > 0 && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-amber-900">
                  Unmatched Events ({claims.filter((claim) => !findClaimAvailabilityRow(planner, claim)).length})
                </h4>
                <p className="mb-4 text-xs text-amber-700">
                  These synced events didn't automatically match an appearance fee. You can manually assign them to a fee type to add them to the tracker.
                </p>
                <div className="space-y-3">
                  {claims
                    .filter((claim) => !findClaimAvailabilityRow(planner, claim))
                    .map((claim) => (
                      <div key={claim.id} className="rounded-md border border-amber-200 bg-white p-3 text-sm shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-slate-900">{claim.date || "Unknown Date"}</div>
                            {claim.importSource && <div className="text-xs text-slate-500 uppercase tracking-wide">Imported from {claim.importSource}</div>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAppearanceClaim(claim.id)}
                            className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                        <div className="mb-3 text-xs text-slate-700 max-h-24 overflow-y-auto whitespace-pre-wrap rounded bg-slate-50 p-2 border border-slate-100">
                          {claim.notes || "No notes provided."}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">Assign to fee type:</span>
                          <div className="w-full sm:w-64">
                            <SelectField
                              value={claim.appearanceType === "Other" ? "" : claim.appearanceType}
                              onChange={(value) => updateAppearanceClaim(claim.id, "appearanceType", value)}
                              options={appearanceOptions}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Finalisation and closure</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BooleanField
            label="Matter finalised?"
            value={planner.finalisation.matterFinalised}
            onChange={(value) => setFinalisationField("matterFinalised", value)}
          />
          <BooleanField
            label="Outcome entered in ATLAS?"
            value={planner.finalisation.outcomeEnteredInAtlas}
            onChange={(value) => setFinalisationField("outcomeEnteredInAtlas", value)}
          />
          <BooleanField
            label="Grant closed?"
            value={planner.finalisation.grantClosed}
            onChange={(value) => setFinalisationField("grantClosed", value)}
          />
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Closure date</span>
            <input
              type="date"
              value={planner.finalisation.closureDate}
              onChange={(e) => setFinalisationField("closureDate", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>
        </div>
      </section>
    </>
  );
}
