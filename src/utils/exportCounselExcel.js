import * as XLSX from "xlsx";

const clampMinutes = (value) => {
  const minutes = Math.floor(Number(value) || 0);
  return Math.min(59, Math.max(0, minutes));
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

export function exportCounselExcel(form, calc) {
  const {
    prepRole,
    clientName, vlaRefNo, chargeType, chargeDetails, caseType, stage, court,
    statements, committaltranscript, previousTrialTranscript, recordOfInterview,
    photographs, financialDocuments, transcriptsLDTI, surveillanceLogs,
    otherExhibits, otherExhibitsDetails, otherDocuments, otherDocumentsDetails,
    excessScanningHours, videoAudioHours, videoAudioMinutes, videoAudioDetails,
    satisfiedPrep, satisfiedGrant,
    previousGrantMade, previousGrantDetails, nonsittingDays,
    practitionerName, signatureDate, firmNameAddress, reference,
  } = form;

  const {
    totalPerusals, perusalsHours, totalScanning, scanningHoursBase,
    scanningHours, videoHours, subtotal, billableHours, hourlyRate, preparationAmount,
  } = calc;
  const videoDuration = formatHoursAndMinutes(videoAudioHours, videoAudioMinutes);

  const roleLabel = prepRole || "Counsel";
  const rows = [
    ["APPLICATION FOR EXTENSION OF LEGAL ASSISTANCE"],
    [`PREPARATION FEES WORKSHEET/CHECKLIST - ${roleLabel.toUpperCase()} - 2026 FEES`],
    ["For use by Section 29A Panel Practitioners (Simplified Grants Process)"],
    [],
    ["CLIENT NAME:", clientName, "", "", "", "VLA REF NO:", vlaRefNo],
    ["Part A: Background"],
    ["Charges:", chargeType, "", "Details:", chargeDetails || "(Provide further details re: charges if required)"],
    ["Type of case:", caseType],
    ["Stage of matter:", stage],
    ["Court:", court],
    [],
    ["Where two Counsel are engaged, Junior Counsel is only entitled to perusals."],
    [],
    ["Part B: Information"],
    ["Material to peruse"],
    [" Statements:", statements, "pages"],
    [" Committal transcript", committaltranscript, "pages"],
    [" Previous trial transcript", previousTrialTranscript, "pages"],
    [" Record of interview", recordOfInterview, "pages"],
    [" TOTAL perusals", totalPerusals, "pages, which equates to", "", perusalsHours.toFixed(2), `hours at 90 pages/hr ("perusals")`],
    [],
    ["Material to scan"],
    [" Photographs", photographs, "pages"],
    [" Financial documents", financialDocuments, "pages"],
    [" Transcripts of LD/TI", transcriptsLDTI, "pages"],
    [" Surveillance logs", surveillanceLogs, "pages"],
    [" Other exhibits", otherExhibits, "pages", "Details:", otherExhibitsDetails || ""],
    [" Other documents", otherDocuments, "pages", "Details:", otherDocumentsDetails || ""],
    [" TOTAL scanning", totalScanning, "pages, which equates to", "", scanningHoursBase.toFixed(2), `hours at 180 pages/hr ("scanning")`],
    ...(scanningHoursBase > 10 ? [["", "", "", "", "", "", "If in excess of 10 hours allow", excessScanningHours, "hours"]] : []),
    ["Video/Audio Tapes/CDs"],
    [" Video/Audio tapes/CDs", videoDuration, "", videoAudioDetails || "(Set out the disputed or material issues, the location and duration of the tapes / CDs that will need to be viewed or listened to.)"],
    [],
    [],
    ["Part C: Relevant guideline"],
    ["The relevant guideline is contained fee schedule 4 of the Legal Aid Handbook (Part 23)."],
    [`I am ${satisfiedPrep || "___"} that the preparation sought is necessary and that I have all information necessary to make this decision.`],
    [],
    ["Part D: Decision"],
    [`I am ${satisfiedGrant || "___"} that a grant of assistance for additional preparation is warranted. (if aid refused strike out rest of Part D)`],
    [],
    ["Perusals", perusalsHours.toFixed(2), "hours"],
    ["Scanning", scanningHours.toFixed(2), "hours"],
    ["Video/Audio Tape", videoHours.toFixed(2), "hours"],
    ["Subtotal =", subtotal.toFixed(2), "hours"],
    ["Less 8 hours =", billableHours.toFixed(2), "total hours at the relevant", "", "", "", "hourly rate of", hourlyRate, "per hour"],
    ["Preparation amount $", preparationAmount.toFixed(2)],
    [],
    [`Has a previous grant of aid been made for preparation in this matter? ${previousGrantMade || "___"}`],
    ["Revised amount (if applic.)", ""],
    [],
    ["Details of previous grants for preparation:", previousGrantMade === "Yes" ? previousGrantDetails : "(Specify amount/details of any previous grants of aid for preparation)"],
    [],
    [],
    ["Are there non-sitting days covered by an ACF / payable by VLA?", "", "", "", "", nonsittingDays || "", "days"],
    [],
    ["The amount required for additional preparation is"],
    ["a grant of additional preparation as detailed above."],
    [],
    ["Part E: Means"],
    ["The client's financial details have not changed since originally applying for aid, and all documentary proof of means are retained on file."],
    [],
    ["Part F: Practitioner recommendation"],
    ["In my opinion the application meets the requirements of the relevant guideline and I recommend that assistance be granted. All required substantiating documentation and information is on file. I have informed my client of this recommendation."],
    [],
    [],
    ["I acknowledge that under section 44(1) of the Legal Aid Act the provision of a false statement or a failure to disclose relevant information renders me liable to the penalties therein contained, and to action by VLA to remove me and my firm from the Simplified Grants Process and/or the referral panel maintained under section 30 of the Legal Aid Act."],
    [],
    [],
    [],
    [],
    ["SIGNATURE", "", "", "DATE", signatureDate || ""],
    [],
    ["", "", "", "Name & address"],
    ["PRINT PRACTITIONER'S NAME", practitionerName || "", "", "of firm:", firmNameAddress || ""],
    [],
    ["", "", "", "Reference:", reference || ""],
    [],
    ["Video/Audio tapes: VLA will only allow the viewing or listening of the pertinent hours of tapes and not the whole of the recorded material. Please allow only a proportion of the relevant time dealing with the disputed or material issues and not the viewing of the tapes in their entirety. Do not include material that is duplicated in transcripts."],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 55 }, { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 40 },
    { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PrepFees");

  const clientSlug = (clientName || "Client").replace(/\s+/g, "_");
  const roleSlug = roleLabel.replace(/\s+/g, "_");
  XLSX.writeFile(wb, `PrepWorksheet_${roleSlug}_${clientSlug}.xlsx`);
}
