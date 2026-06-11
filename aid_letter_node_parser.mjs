import { inflate } from "pako";

function decodeBase64ToBytes(base64 = "") {
  return new Uint8Array(Buffer.from(base64, "base64"));
}

function decodePdfString(value = "") {
  return value
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\000/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function latin1StringToUint8Array(value = "") {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function uint8ArrayToLatin1String(bytes) {
  let output = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    output += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return output;
}

function extractTextFromPdfBytes(bytes) {
  const latin1 = uint8ArrayToLatin1String(bytes);
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const pieces = [];
  let match;

  while ((match = streamRegex.exec(latin1))) {
    const chunkText = match[1];
    try {
      const inflated = new TextDecoder("latin1").decode(inflate(latin1StringToUint8Array(chunkText)));
      const tjMatches = [...inflated.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g)].map((item) =>
        decodePdfString(item[1])
      );
      const tjArrayMatches = [...inflated.matchAll(/\[(.*?)\]\s*TJ/gs)].flatMap((item) =>
        [...item[1].matchAll(/\(([^()]*(?:\\.[^()]*)*)\)/g)].map((inner) => decodePdfString(inner[1]))
      );
      pieces.push(...tjMatches, ...tjArrayMatches);
    } catch {
      // Ignore non-deflate streams and keep going.
    }
  }

  return pieces.filter(Boolean).join("\n");
}

function cleanLine(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function getLines(text = "") {
  return text
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);
}

function findLineIndex(lines, predicate) {
  return lines.findIndex((line, index) => predicate(line, index));
}

function getNextMeaningfulLine(lines, startIndex, { skip = [], maxLookahead = 8 } = {}) {
  const skipSet = new Set(skip.map((item) => item.toLowerCase()));
  for (let i = startIndex + 1; i < Math.min(lines.length, startIndex + 1 + maxLookahead); i += 1) {
    const candidate = cleanLine(lines[i]);
    if (!candidate) continue;
    if (skipSet.has(candidate.toLowerCase())) continue;
    return candidate;
  }
  return "";
}

function matchAfterLabel(text, label, nextLabels = []) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const blockers = nextLabels
    .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
    .join("|");
  const regex = blockers
    ? new RegExp(`${escaped}\\s+([\\s\\S]*?)(?=\\s+(?:${blockers})|$)`, "i")
    : new RegExp(`${escaped}\\s+([\\s\\S]*?)$`, "i");
  const match = text.match(regex);
  return cleanLine(match?.[1] || "");
}

function buildCompactUpper(text = "") {
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function extractAidNumber(text = "") {
  const match = text.match(/\b\d{2}A\d{6}\b/);
  return cleanLine(match?.[0] || "");
}

function extractExtensionNumber(lines = [], normalizedText = "", compactText = "", documentType = "") {
  if (documentType === "grant_approval_letter") return "";
  const extensionIndex = findLineIndex(lines, (line) => line.toLowerCase() === "extension");
  const candidate =
    getNextMeaningfulLine(lines, extensionIndex, { skip: ["Status", "Submitted", "Submitted by", "Application Source"] }) ||
    matchAfterLabel(normalizedText, "Extension", ["Status", "Submitted by", "Application Source"]);
  const lineMatch = cleanLine(candidate).match(/^\d+$/);
  if (lineMatch && Number(lineMatch[0]) > 0) return lineMatch[0];
  const compactMatch = compactText.match(/EXTENSION(\d+)/);
  if (compactMatch && Number(compactMatch[1]) > 0) return compactMatch[1];
  return "";
}

function normalizeMatterType(text = "", matterTypeRaw = "") {
  const upper = `${matterTypeRaw} ${text}`.toUpperCase();
  if (
    /(SUMMARY|INDICTABLE|BAIL|COMMITTAL|PLEA|SENTENCE|CONTEST|TRIAL|APPEAL|MAGISTRATES' COURT|COUNTY COURT|SUPREME COURT|COURT OF APPEAL)/.test(
      upper
    )
  ) {
    return "Criminal";
  }
  return "Other";
}

function parseDate(value = "") {
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function parseDateFromCompact(value = "") {
  const match = value.match(/(\d{1,2})(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)(\d{4})/);
  if (!match) return "";
  const months = {
    JANUARY: "01",
    FEBRUARY: "02",
    MARCH: "03",
    APRIL: "04",
    MAY: "05",
    JUNE: "06",
    JULY: "07",
    AUGUST: "08",
    SEPTEMBER: "09",
    OCTOBER: "10",
    NOVEMBER: "11",
    DECEMBER: "12",
  };
  const [, dd, month, yyyy] = match;
  return `${yyyy}-${months[month]}-${dd.padStart(2, "0")}`;
}

function parseApprovalEffectiveDate(compact = "") {
  const match = compact.match(/ASSISTANCEISEFFECTIVEFROM(\d{1,2}(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\d{4})/);
  return match ? parseDateFromCompact(match[1]) : "";
}

function normalizeCourt(value = "") {
  if (/magistrates/i.test(value)) return "Magistrates' Court";
  if (/children/i.test(value)) return "Children's Court";
  if (/county/i.test(value)) return "County Court";
  if (/supreme/i.test(value)) return "Supreme Court";
  if (/appeal/i.test(value)) return "Court of Appeal";
  return value ? "Other" : "";
}

function normalizeListingType(value = "") {
  const normalized = cleanLine(value).toUpperCase();
  if (!normalized) return "";
  if (normalized.includes("MENTION") && normalized.includes("CONTEST")) return "Contest Mention";
  if (normalized.includes("MENTION")) return "Mention";
  if (normalized.includes("PLEA")) return "Plea";
  if (normalized.includes("SENTENCE")) return "Sentence";
  if (normalized.includes("BAIL")) return "Bail Application";
  if (normalized.includes("COMMITTAL")) return "Committal";
  if (normalized.includes("APPEAL")) return "Appeal";
  if (normalized.includes("TRIAL") || normalized.includes("CONTESTED HEARING")) return "Trial";
  if (normalized.includes("CONFERENCE")) return "Conference";
  return "Other";
}

function inferApplicationStatus(statusValue = "") {
  const normalized = cleanLine(statusValue).toUpperCase();
  if (!normalized) return "Application applied for - Pending";
  if (normalized.includes("SUBMITTED") || normalized.includes("PENDING")) return "Application applied for - Pending";
  if (normalized.includes("GRANTED") || normalized.includes("APPROVED")) return "Aid granted";
  if (normalized.includes("REFUSED") || normalized.includes("REJECTED")) return "Aid refused";
  return "Application applied for - Pending";
}

function extractApplicationRequestStatus(statusRaw = "", compactText = "") {
  const normalized = cleanLine(statusRaw).toUpperCase();
  if (/(SUBMITTED|PENDING|GRANTED|APPROVED|REFUSED|REJECTED)/.test(normalized)) {
    return normalized;
  }
  if (compactText.includes("STATUSSUBMITTED")) return "SUBMITTED";
  if (compactText.includes("STATUSPENDING")) return "PENDING";
  if (compactText.includes("STATUSGRANTED") || compactText.includes("STATUSAPPROVED")) return "APPROVED";
  if (compactText.includes("STATUSREFUSED") || compactText.includes("STATUSREJECTED")) return "REFUSED";
  return "";
}

function inferAidTypes(text = "") {
  const aidTypes = [];
  const upper = text.toUpperCase();
  const compact = buildCompactUpper(text);
  if (
    upper.includes("SUMMARY - UP TO FIVE DEFENDED DAYS - MAGISTRATES' COURT") ||
    /SUMMARY\s*-\s*UP TO F\s*IVE DEFENDED DA\s*YS\s*-\s*MAGISTRA\s*TES'? COURT/.test(upper) ||
    compact.includes("SUMMARY-UPTOFIVEDEFENDEDDAYS-MAGISTRATES'COURT") ||
    compact.includes("SUMMARY-UPTOFIVEDEFENDEDDAYS-MAGISTRATESCOURT")
  ) {
    aidTypes.push("Summary Single");
  }
  if (
    upper.includes("MAGISTRATES' COURT - BAIL APPLICATION") ||
    compact.includes("MAGISTRATESCOURT-BAILAPPLICATION") ||
    compact.includes("MAGISTRATESCOURTBAILAPPLICATION")
  ) {
    aidTypes.push("Bail Application");
  }
  if (
    upper.includes("SUMMARY - INCREASE TO CONSOL - MAGISTRATES' COURT") ||
    upper.includes("MC EXT - INCREASE TO CONSOL") ||
    /SUMMARY\s*-\s*INCREAS\S*\s*TO\s*CONSO\S*\s*-\s*MAGISTRA\S*\s*COURT/.test(upper) ||
    compact.includes("SUMMARY-INCREASETOCONSOL-MAGISTRATES'COURT") ||
    compact.includes("SUMMARY-INCREASETOCONSOL-MAGISTRATESCOURT") ||
    compact.includes("MCEXT-INCREASETOCONSOL")
  ) {
    aidTypes.push("Summary Consolidated");
  }
  if (compact.includes("SUMMARYHEARINGCONSOLIDATIONOFCHARGES") || compact.includes("SUMMARYHEARINGCONSOLIDATIONOFCHARGESFEE")) {
    aidTypes.push("Summary Consolidated");
  }
  if (upper.includes("SUMMARY - UP TO FIVE DEFENDED DAYS - CONSOLIDATED") || upper.includes("CONSOLIDATED CONTEST MENTION")) {
    aidTypes.push("Summary Consolidated");
  }
  if (upper.includes("BAIL APPLICATION")) {
    aidTypes.push("Bail Application");
  }
  if (upper.includes("PSYCHOLOGICAL ASSESSMENT AND REPORT (NOT IN CUSTODY)")) {
    aidTypes.push("Disbursement - Psychological Assessment and Report (Not in custody)");
  }
  if (upper.includes("PSYCHOLOGICAL ASSESSMENT AND REPORT (IN CUSTODY)")) {
    aidTypes.push("Disbursement - Psychological Assessment and Report (In custody)");
  }
  if (compact.includes("PSYCHOLOGICALASSESSMENTANDREPORTINCLUDINGJAILVISIT")) {
    aidTypes.push("Disbursement - Psychological Assessment and Report (In custody)");
  }
  return Array.from(new Set(aidTypes));
}

function inferAidTypesFromLines(lines, text) {
  const aidTypes = inferAidTypes(text);
  const summaryHeadingIndex = findLineIndex(
    lines,
    (line) => /SUMMARY/.test(line) && /MAGISTRATES/.test(line) && /FIVE DEFENDED DAYS/.test(line)
  );
  if (summaryHeadingIndex >= 0 && !aidTypes.includes("Summary Single")) {
    aidTypes.unshift("Summary Single");
  }
  return Array.from(new Set(aidTypes));
}

function buildConflictFlags({ inCustody, aidTypes }) {
  const flags = [];
  if (inCustody === "YES" && aidTypes.some((item) => /psychological assessment and report \(not in custody\)/i.test(item))) {
    flags.push({
      id: "custody-psych-report-mismatch",
      level: "error",
      message:
        "The application records the client as in custody, but the scope of work includes Psychological Assessment and Report (Not in custody).",
      actionLabel: "Set action to manual review",
      recommendedStatus: "Needs manual review",
    });
  }
  return flags;
}

function detectDocumentType(text = "", compact = "") {
  if (compact.includes("APPLICATIONREQUEST")) return "application_request";
  if (compact.includes("LEGALASSISTANCEISAPPROVED") || compact.includes("APPROVEDLEGALASSISTANCE") || compact.includes("VLAGRANTNUMBER")) {
    return "grant_approval_letter";
  }
  return "unknown";
}

function extractApprovalLetterAidNumber(compact = "") {
  return compact.match(/VLAGRANTNUMBER(\d{2}A\d{6})/)?.[1] || "";
}

function extractApprovalLetterCourt(compact = "") {
  if (compact.includes("MAGISTRATESCOURT")) return "Magistrates' Court";
  if (compact.includes("COUNTYCOURT")) return "County Court";
  if (compact.includes("SUPREMECOURT")) return "Supreme Court";
  if (compact.includes("COURTOFAPPEAL")) return "Court of Appeal";
  return "";
}

function extractApprovalLetterLocation(text = "", compact = "") {
  const match = compact.match(/CRIMINALLAWMATTERINTHE(?:MAGISTRATESCOURT|COUNTYCOURT|SUPREMECOURT|COURTOFAPPEAL)IN([A-Z]+?)ASSISTANCEISEFFECTIVEFROM/);
  if (match?.[1]) {
    const raw = match[1];
    return raw.charAt(0) + raw.slice(1).toLowerCase();
  }
  if (/HEIDELBERG/i.test(text)) return "Heidelberg";
  return "";
}

function buildParsedAlerts({ documentType, compactText, listingType }) {
  const alerts = [];
  if (documentType !== "grant_approval_letter") return alerts;
  if (compactText.includes("DOESNOTINCLUDEASSISTANCEFORACONTESTEDHEARING")) {
    alerts.push({
      level: listingType === "Trial" ? "warning" : "info",
      title: "Contested hearing needs separate grant",
      message:
        "This grant does not include assistance for a contested hearing. A separate grant is required before the contested hearing proceeds.",
      nextAction: "Apply for separate contested hearing grant before hearing",
      recommendedStatus: "extension_review",
    });
  }
  if (compactText.includes("WILLNOTCOVER") && compactText.includes("APPEARANCEATAMENTIONHEARING")) {
    alerts.push({
      level: listingType === "Mention" ? "warning" : "info",
      title: "Mention appearances may not be covered",
      message:
        "The approval letter says this grant will generally not cover an appearance at a mention hearing or a client-requested adjournment, except in limited circumstances.",
      nextAction: "Check whether a special mention fee or different grant action is needed",
      recommendedStatus: "manual_review",
    });
  }
  if (compactText.includes("SPECIALMENTIONSCANONLYBECLAIMEDINVERYLIMITEDCIRCUMSTANCES")) {
    alerts.push({
      level: "info",
      title: "Special mention fees are limited",
      message:
        "The approval letter says special mentions can only be claimed in very limited circumstances under the VLA notes on the guidelines.",
      nextAction: "Confirm the listing qualifies before relying on a special mention fee",
      recommendedStatus: "manual_review",
    });
  }
  return alerts;
}

function parseAidLetterFromText(text = "") {
  const normalizedText = text.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n");
  if (!normalizedText.trim()) {
    throw new Error("Could not read text from the uploaded aid letter.");
  }
  const compactText = buildCompactUpper(normalizedText);
  const lines = getLines(normalizedText);
  const documentType = detectDocumentType(normalizedText, compactText);
  const statusIndex = findLineIndex(lines, (line) => line.toLowerCase() === "status");
  const fileIndex = findLineIndex(lines, (line) => line.toLowerCase() === "file");
  const idIndex = findLineIndex(lines, (line, index) => line.toLowerCase() === "id" && index === fileIndex + 1);
  const matterTypeIndex = findLineIndex(lines, (line) => line.toLowerCase() === "matter type");
  const courtIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("which court/tribunal do you have to go"));
  const locationIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("where is the court/tribunal"));
  const hearingTypeIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("what type of hearing is it"));
  const hearingDateIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("when is the next hearing date"));
  const custodyIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("are you in custody or detention"));
  const statusRaw =
    getNextMeaningfulLine(lines, statusIndex, { skip: ["Submitted", "by", "Submitted by"] }) ||
    matchAfterLabel(normalizedText, "Status", ["Submitted by", "Application Source"]);
  const applicationRequestStatus = extractApplicationRequestStatus(statusRaw, compactText);
  const fileId =
    extractAidNumber(normalizedText) ||
    getNextMeaningfulLine(lines, idIndex, { skip: ["ASHLEY WELSH", "Extension", "0", "Status"] }) ||
    matchAfterLabel(normalizedText, "File ID", ["Extension", "Status"]);
  const extensionNumber = extractExtensionNumber(lines, normalizedText, compactText, documentType);
  const matterTypeRaw =
    getNextMeaningfulLine(lines, matterTypeIndex, { skip: ["Plea", "CJEP / CAN"] }) ||
    matchAfterLabel(normalizedText, "Matter Type", ["Plea", "CJEP", "CAN"]);
  const courtRaw =
    getNextMeaningfulLine(lines, courtIndex, { skip: ["to?", "Where is the court/tribunal?"] }) ||
    matchAfterLabel(normalizedText, "Which court/tribunal do you have to go to?", ["Where is the court/tribunal?"]);
  const location =
    getNextMeaningfulLine(lines, locationIndex, { skip: ["What is your role in these proceedings?"] }) ||
    matchAfterLabel(normalizedText, "Where is the court/tribunal?", ["What is your role in these proceedings?"]);
  const hearingTypeRaw =
    getNextMeaningfulLine(lines, hearingTypeIndex, { skip: ["Court Proceedings Number"] }) ||
    matchAfterLabel(normalizedText, "What type of hearing is it?", ["Court Proceedings Number", "Is this the main hearing"]);
  const hearingDateRaw =
    getNextMeaningfulLine(lines, hearingDateIndex, { skip: ["Which court/tribunal do you have to go", "to?"] }) ||
    matchAfterLabel(normalizedText, "When is the next hearing date?", ["Which court/tribunal do you have to go to?"]);
  const custodyRaw =
    getNextMeaningfulLine(lines, custodyIndex, { skip: ["Partner Details", "Custody Details"] }) ||
    matchAfterLabel(normalizedText, "Are you in custody or detention?", ["Partner Details", "Partner / Dependants"]);
  const aidTypes = inferAidTypesFromLines(lines, normalizedText);
  const approvalAidNumber = extractApprovalLetterAidNumber(compactText);
  const approvalCourt = extractApprovalLetterCourt(compactText);
  const approvalLocation = extractApprovalLetterLocation(normalizedText, compactText);
  const inferredListingType = normalizeListingType(hearingTypeRaw);
  return {
    rawText: normalizedText,
    fields: {
      matterType: documentType === "grant_approval_letter" ? "Criminal" : normalizeMatterType(normalizedText, matterTypeRaw),
      aidType: aidTypes.join("; "),
      aidTypeList: aidTypes,
      aidNumber: cleanLine(approvalAidNumber || fileId),
      extensionNumber,
      court: approvalCourt || normalizeCourt(courtRaw),
      location: cleanLine(approvalLocation || location),
      listingType: inferredListingType,
      listingTypeRaw: cleanLine(hearingTypeRaw),
      listingDate: documentType === "grant_approval_letter" ? "" : parseDate(hearingDateRaw),
      applicationStatus: documentType === "grant_approval_letter" ? "Aid granted" : inferApplicationStatus(applicationRequestStatus),
      documentType,
      statusRaw: documentType === "grant_approval_letter" ? "APPROVED" : applicationRequestStatus,
      custodyStatus: documentType === "grant_approval_letter" ? "" : cleanLine(custodyRaw).split(" ")[0],
      effectiveDate: documentType === "grant_approval_letter" ? parseApprovalEffectiveDate(compactText) : "",
    },
    parsedAlerts: buildParsedAlerts({ documentType, compactText, listingType: inferredListingType }),
    conflictFlags: buildConflictFlags({ inCustody: cleanLine(custodyRaw).toUpperCase(), aidTypes }),
  };
}

export async function parseAidLetterFromDataUrl(fileUrl = "") {
  const base64 = String(fileUrl).split(",")[1] || "";
  if (!base64) {
    throw new Error("Could not read the uploaded aid letter.");
  }
  const bytes = decodeBase64ToBytes(base64);
  const text = extractTextFromPdfBytes(bytes);
  return parseAidLetterFromText(text);
}
