import { inflate } from "pako";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

const API_BASE = (import.meta.env?.VITE_AUDIT_API_BASE || "").replace(/\/+$/, "");

const PDFJS_BROWSER_OPTIONS = {
  disableWorker: true,
  useSystemFonts: true,
  isEvalSupported: false,
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
};

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

async function inflateChunk(chunk) {
  const inflated = inflate(chunk);
  return new TextDecoder("latin1").decode(inflated);
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

export async function extractTextFromPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const loadingTask = getDocument({
    data: bytes,
    ...PDFJS_BROWSER_OPTIONS,
  });
  const pdf = await loadingTask.promise;
  const pieces = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = (content.items || [])
      .map((item) => cleanLine(item?.str || ""))
      .filter(Boolean)
      .join("\n");

    if (pageText) {
      pieces.push(pageText);
    }
  }

  const pdfJsText = pieces.join("\n").trim();
  if (pdfJsText) {
    return pdfJsText;
  }

  throw new Error("Could not extract readable text from the uploaded aid letter.");
}

function getItemRect(item) {
  const [, , , d, e, f] = item.transform || [];
  const width = item.width || 0;
  const height = item.height || Math.abs(d) || 0;
  return {
    x1: e || 0,
    y1: f || 0,
    x2: (e || 0) + width,
    y2: (f || 0) + height,
  };
}

function rectsIntersect(itemRect, annotRect) {
  return !(
    annotRect[2] < itemRect.x1 ||
    annotRect[0] > itemRect.x2 ||
    annotRect[3] < itemRect.y1 ||
    annotRect[1] > itemRect.y2
  );
}

function toCoordinateArray(value) {
  if (!value || typeof value.length !== "number") return [];
  return Array.from(value);
}

function getAnnotationRects(annotation) {
  const quadPoints = toCoordinateArray(annotation?.quadPoints);
  if (quadPoints.length >= 8) {
    const rects = [];
    for (let i = 0; i < quadPoints.length; i += 8) {
      const points = quadPoints.slice(i, i + 8);
      if (points.length < 8) break;
      rects.push([
        Math.min(points[0], points[2], points[4], points[6]),
        Math.min(points[1], points[3], points[5], points[7]),
        Math.max(points[0], points[2], points[4], points[6]),
        Math.max(points[1], points[3], points[5], points[7]),
      ]);
    }
    return rects;
  }

  const rect = toCoordinateArray(annotation?.rect);
  if (rect.length === 4) {
    return [rect];
  }

  return [];
}

function extractTextForAnnotation(annotation, contentItems = []) {
  const rects = getAnnotationRects(annotation);
  if (rects.length === 0) return "";

  const hits = [];
  for (const item of contentItems) {
    const text = cleanLine(item?.str || "");
    if (!text) continue;
    const itemRect = getItemRect(item);
    if (rects.some((rect) => rectsIntersect(itemRect, rect))) {
      hits.push(text);
    }
  }

  return cleanLine(hits.join(" "));
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

function normalizeAidTypesFromHighlightedText(value = "") {
  const compact = buildCompactUpper(value);
  if (!compact) return [];
  if (compact.includes("SUMMARYHEARINGLUMPSUM")) return ["Summary Single"];
  if (compact.includes("SUMMARYHEARING")) return ["Summary Single"];
  if (compact.includes("SUMMARYCONSOL")) return ["Summary Consolidated"];
  if (compact.includes("COUNTYCOURTBREACH")) return ["County Court Breach"];
  if (compact.includes("SUPREMECOURTBREACH")) return ["Supreme Court Breach"];
  return inferAidTypes(value);
}

async function extractAnnotatedFieldOverrides(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const loadingTask = getDocument({
    data: bytes,
    ...PDFJS_BROWSER_OPTIONS,
  });
  const pdf = await loadingTask.promise;
  const overrides = {};

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const [annotations, content] = await Promise.all([page.getAnnotations(), page.getTextContent()]);
    const items = content.items || [];

    for (const annotation of annotations) {
      if (annotation?.subtype === "Popup") continue;

      const comment = cleanLine(annotation?.contentsObj?.str || annotation?.contents || "");
      if (!comment) continue;

      const commentLower = comment.toLowerCase();
      const highlightedText = extractTextForAnnotation(annotation, items);

      if (commentLower.includes("aid number for the box marked aid number")) {
        overrides.aidNumber = extractAidNumber(highlightedText) || overrides.aidNumber || "";
      }

      if (commentLower.includes("ext number for the box marked ext")) {
        const extMatch = cleanLine(highlightedText).match(/\b\d+\b/);
        overrides.extensionNumber = extMatch?.[0] || overrides.extensionNumber || "";
      }

      if (commentLower.includes("application status box")) {
        overrides.applicationStatus = "Aid applied for";
      }

      if (commentLower.includes("custody status")) {
        const custodyMatch = cleanLine(highlightedText).match(/\b(YES|NO)\b/i);
        overrides.custodyStatus = cleanLine(custodyMatch?.[1] || highlightedText || overrides.custodyStatus || "");
      }

      if (commentLower.includes("aid effective date")) {
        overrides.effectiveDate = parseDate(highlightedText) || overrides.effectiveDate || "";
      }

      if (commentLower.includes("next listing date")) {
        overrides.listingDate = parseDate(highlightedText) || overrides.listingDate || "";
      }

      if (commentLower.includes("court type")) {
        overrides.court = normalizeCourt(highlightedText) || overrides.court || "";
      }

      if (commentLower.includes("court location")) {
        overrides.location = cleanLine(highlightedText) || overrides.location || "";
      }

      if (commentLower.includes("next listing type")) {
        overrides.listingTypeRaw = cleanLine(highlightedText) || overrides.listingTypeRaw || "";
      }

      if (commentLower.includes("guideline in the guideline box")) {
        overrides.guideline = cleanLine(highlightedText) || overrides.guideline || "";
      }

      if (commentLower.includes("aid type")) {
        const aidTypeList = normalizeAidTypesFromHighlightedText(highlightedText);
        if (aidTypeList.length > 0) {
          overrides.aidTypeList = aidTypeList;
          overrides.aidType = aidTypeList.join("; ");
        }
      }
    }
  }

  if (overrides.listingTypeRaw) {
    overrides.listingType = normalizeListingType(overrides.listingTypeRaw, overrides.court || "");
  }

  return overrides;
}

function extractAidNumber(text = "") {
  return cleanLine(text.match(/\b\d{2}A\d{6}\b/) ? text.match(/\b\d{2}A\d{6}\b/)[0] : "");
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

function parseApplicationEffectiveDate(text = "") {
  const requestMatches = [...String(text).matchAll(/APPLICATION REQUEST\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi)];
  if (requestMatches.length > 0) {
    return parseDate(requestMatches[requestMatches.length - 1][1]);
  }

  const applicantDeclarationMatch = text.match(/Applicant'?s Declaration[\s\S]*?Date\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (applicantDeclarationMatch?.[1]) {
    return parseDate(applicantDeclarationMatch[1]);
  }

  const declarationMatch = text.match(/Practitioner's Signature[\s\S]*?Date\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (declarationMatch?.[1]) {
    return parseDate(declarationMatch[1]);
  }

  return "";
}

function extractTemplateGuideline(lines = []) {
  const startIndex = findLineIndex(
    lines,
    (line) => cleanLine(line).toUpperCase() === "GL" || /your selection of the guideline/i.test(line)
  );
  if (startIndex < 0) return "";

  const shouldSkip = (value = "") => {
    const normalized = cleanLine(value);
    const lower = normalized.toLowerCase();
    if (!normalized) return true;
    if (
      /^(GL|\*+|YES|NO|G\d+[A-Z]?|GUIDELINE|STATEMENT|ADDITIO|NAL GUIDELINE|INFORMAT|ION|MEANS TE|ST RESULT|S|PROFESSIONA|L COSTS|ELIGIBIL|CONTRIB|PROFESSION|COSTS?|-)$/i.test(
        normalized
      )
    ) {
      return true;
    }
    if (
      lower.includes("guideline for the primary matter") ||
      lower.includes("when this application is for both bail") ||
      lower.includes("select the special circumstances guideline") ||
      lower.includes("selection of the guideline constitutes")
    ) {
      return true;
    }
    return normalized.length < 5;
  };

  for (let i = startIndex + 1; i < Math.min(lines.length, startIndex + 18); i += 1) {
    const candidate = cleanLine(lines[i]);
    if (shouldSkip(candidate)) continue;
    return candidate;
  }

  return "";
}

function extractTemplateAidType(lines = []) {
  const startIndex = findLineIndex(
    lines,
    (line) =>
      cleanLine(line).toUpperCase() === "MC" ||
      /please check that you have the correct grant of aid/i.test(line)
  );
  if (startIndex < 0) return [];

  for (let i = startIndex + 1; i < Math.min(lines.length, startIndex + 24); i += 1) {
    const candidate = cleanLine(lines[i]);
    const compact = buildCompactUpper(candidate);
    if (!candidate) continue;
    if (compact.includes("SUMMARYHEARINGLUMPSUM") || compact.includes("SUMMARYHEARING")) {
      return ["Summary Single"];
    }
    if (compact.includes("CONSOLIDATED") || compact.includes("CONSOL")) {
      return ["Summary Consolidated"];
    }
    if (compact.includes("BAIL")) {
      return ["Bail Application"];
    }
  }

  return [];
}

function extractTemplateListingType(rawValue = "", courtValue = "") {
  const cleaned = cleanLine(rawValue);
  if (!cleaned) return "";
  return cleaned;
}

function normalizeCourt(value = "") {
  if (/magistrates/i.test(value)) return "Magistrates' Court";
  if (/children/i.test(value)) return "Children's Court";
  if (/county/i.test(value)) return "County Court";
  if (/supreme/i.test(value)) return "Supreme Court";
  if (/appeal/i.test(value)) return "Court of Appeal";
  return value ? "Other" : "";
}

function normalizeListingType(value = "", courtValue = "") {
  const normalized = cleanLine(value).toUpperCase();
  const normalizedCourt = cleanLine(courtValue).toUpperCase();
  if (!normalized) return "";
  if (normalized.includes("CONTESTED HEARING")) return "Contested Hearing";
  if (normalized.includes("MENTION/DIRECTION/CALLOVE")) {
    return normalizedCourt.includes("COUNTY") || normalizedCourt.includes("SUPREME")
      ? "Directions Hearing / Mention / Callover"
      : "Mention";
  }
  if (normalized.includes("DIRECTION") || normalized.includes("CALLOVE")) {
    return normalizedCourt.includes("COUNTY") || normalizedCourt.includes("SUPREME")
      ? "Directions Hearing / Mention / Callover"
      : "Mention";
  }
  if (normalized.includes("MENTION") && normalized.includes("CONTEST")) return "Contest Mention";
  if (normalized.includes("MENTION")) return "Mention";
  if (normalized.includes("PLEA")) return "Plea";
  if (normalized.includes("SENTENCE")) return "Sentence";
  if (normalized.includes("BAIL")) return "Bail Application";
  if (normalized.includes("COMMITTAL")) return "Committal";
  if (normalized.includes("APPEAL")) return "Appeal";
  if (normalized.includes("TRIAL")) return "Trial";
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

const AID_TYPE_CATALOG = [
  { label: "Summary Single", patterns: ["SUMMARYSINGLE", "SUMMARYUPTOFIVEDEFENDEDDAYSMAGISTRATESCOURT"] },
  { label: "Summary Consolidated", patterns: ["SUMMARYCONSOL", "SUMMARYCONSOLIDATED", "CONSOLIDATEDCONTESTMENTION"] },
  { label: "Summary ARC", patterns: ["SUMMARYARC"] },
  { label: "Summary Bail", patterns: ["SUMMARYBAIL"] },
  { label: "Summary - Increase to consol", patterns: ["SUMMARYINCREASETOCONSOL", "MCEXTINCREASETOCONSOL"] },
  { label: "Summary - Ground Rules hearing", patterns: ["SUMMARYGROUNDRULESHEARING"] },
  { label: "Infringements", patterns: ["INFRINGEMENTS", "INFRINGEMENT"] },
  { label: "Family Violence - Respondent", patterns: ["FAMILYVIOLENCERESPONDENT"] },
  { label: "Family Violence - Applicant", patterns: ["FAMILYVIOLENCEAPPLICANT"] },
  { label: "Personal Safety Intervention order", patterns: ["PERSONALSAFETYINTERVENTIONORDER"] },
  {
    label: "Indictable - Committal and or Plea in the County Court",
    patterns: ["INDICTABLECOMMITTALANDORPLEAINTHECOUNTYCOURT", "COMMITTALANDPLEACOUNTYCOURT", "INDICTABLECOUNTYPLEA"],
  },
  {
    label: "Indictable - Committal and or Plea in the Supreme Court",
    patterns: ["INDICTABLECOMMITTALANDORPLEAINTHESUPREMECOURT", "COMMITTALANDPLEASUPREMECOURT", "INDICTABLESUPREMEPLEA"],
  },
  { label: "Indictable - Contested Committal", patterns: ["INDICTABLECONTESTEDCOMMITTAL", "CONTESTEDCOMMITTAL"] },
  { label: "Indictable - Ground Rules Hearing", patterns: ["INDICTABLEGROUNDRULESHEARING"] },
  { label: "Indictable - Bail (Magistrates Court)", patterns: ["INDICTABLEBAILMAGISTRATESCOURT"] },
  { label: "County Court Bail", patterns: ["COUNTYCOURTBAIL"] },
  { label: "Supreme Court Bail", patterns: ["SUPREMECOURTBAIL"] },
  { label: "Special Disbursement", patterns: ["SPECIALDISBURSEMENT", "SPECIALDISBURSMENT"] },
  { label: "Disbursement - Ballistic Report", patterns: ["BALLISTICREPORT"] },
  { label: "Disbursement - Car Collision Experts", patterns: ["CARCOLLISIONEXPERTS"] },
  { label: "Disbursement - Engineer Report", patterns: ["ENGINEERREPORT"] },
  { label: "Disbursement - Handwriting Expert", patterns: ["HANDWRITINGEXPERT"] },
  { label: "Disbursement - Medical Report - Doctor", patterns: ["MEDICALREPORTDOCTOR"] },
  { label: "Disbursement - Medical Report - Hospital", patterns: ["MEDICALREPORTHOSPITAL"] },
  { label: "Disbursement - Neuropsychological Report", patterns: ["NEUROPSYCHOLOGICALREPORT"] },
  { label: "Disbursement - Non-attendance Fee", patterns: ["NONATTENDANCEFEE"] },
  { label: "Disbursement - Other Disbursement", patterns: ["OTHERDISBURSEMENT"] },
  { label: "Disbursement - Pathologist Report", patterns: ["PATHOLOGISTREPORT"] },
  { label: "Disbursement - Psychiatric Attendance at City Court - Full Day", patterns: ["PSYCHIATRICATTENDANCEATCITYCOURTFULLDAY", "PSYCHIATRICATTENANDANCEATCITYCOURTFULLDAY"] },
  { label: "Disbursement - Psychiatric Attendance at City Court - Half Day", patterns: ["PSYCHIATRICATTENDANCEATCITYCOURTHALFDAY", "PSYCHIATRICATTENANDANCEATCITYCOURTHALFDAY"] },
  { label: "Disbursement - Psychiatric Attendance at Country Court - Full Day", patterns: ["PSYCHIATRICATTENDANCEATCOUNTRYCOURTFULLDAY", "PSYCHIATRICATTENANDANCEATCOUNTRYCOURTFULLDAY"] },
  { label: "Disbursement - Psychiatric Attendance at Country Court - Half Day", patterns: ["PSYCHIATRICATTENDANCEATCOUNTRYCOURTHALFDAY", "PSYCHIATRICATTENANDANCEATCOUNTRYCOURTHALFDAY"] },
  { label: "Disbursement - Psychiatric Doli Incapax", patterns: ["PSYCHIATRICDOLIINCAPAX", "PSYCHIATIRCDOLIINCAPAX"] },
  { label: "Disbursement - Psychiatric Evidentiary", patterns: ["PSYCHIATRICEVIDENTIARY", "PSYCHIATIRCEVIDENTIARY"] },
  { label: "Disbursement - Psychiatric New Assessment", patterns: ["PSYCHIATRICNEWASSESSMENT", "PSYCHIATIRCNEWASSESSMENT"] },
  { label: "Disbursement - Psychiatric New Assessment Including Jail", patterns: ["PSYCHIATRICNEWASSESSMENTINCLUDINGJAIL", "PSYCHIATIRCNEWASSESSMENTINCLUDINGJAIL"] },
  { label: "Disbursement - Psychiatric Supplementary", patterns: ["PSYCHIATRICSUPPLEMENTARY"] },
  { label: "Disbursement - Psychiatric Treating", patterns: ["PSYCHIATRICTREATING"] },
  { label: "Disbursement - Psychological Attendance at City Court - Full Day", patterns: ["PSYCHOLOGICALATTENDANCEATCITYCOURTFULLDAY", "PSYCHOLOGICALATTENANDANCEATCITYCOURTFULLDAY"] },
  { label: "Disbursement - Psychological Attendance at City Court - Half Day", patterns: ["PSYCHOLOGICALATTENDANCEATCITYCOURTHALFDAY", "PSYCHOLOGICALATTENANDANCEATCITYCOURTHALFDAY"] },
  { label: "Disbursement - Psychological Attendance at Country Court - Full Day", patterns: ["PSYCHOLOGICALATTENDANCEATCOUNTRYCOURTFULLDAY", "PSYCHOLOGICALATTENANDANCEATCOUNTRYCOURTFULLDAY"] },
  { label: "Disbursement - Psychological Attendance at Country Court - Half Day", patterns: ["PSYCHOLOGICALATTENDANCEATCOUNTRYCOURTHALFDAY", "PSYCHOLOGICALATTENANDANCEATCOUNTRYCOURTHALFDAY"] },
  { label: "Disbursement - Psychological Evidentiary", patterns: ["PSYCHOLOGICALEVIDENTIARY"] },
  { label: "Disbursement - Psychological New Assessment", patterns: ["PSYCHOLOGICALNEWASSESSMENT"] },
  { label: "Disbursement - Psychological New Assessment Including Jail", patterns: ["PSYCHOLOGICALNEWASSESSMENTINCLUDINGJAIL"] },
  { label: "Disbursement - Psychological Report with Risk Assessment", patterns: ["PSYCHOLOGICALREPORTWITHRISKASSESSMENT"] },
  { label: "Disbursement - Psychological Supplementary", patterns: ["PSYCHOLOGICALSUPPLEMENTARY"] },
  { label: "Disbursement - Psychological Treating", patterns: ["PSYCHOLOGICALTREATING"] },
  { label: "Disbursement - Psychological Doli Incapax", patterns: ["PSYCHOLOGICALDOLIINCAPAX", "PSYCHOLOGICALDOLIINCAPAX"] },
  { label: "County Court Breach", patterns: ["COUNTYCOURTBREACH", "BREACHPROCEEDINGSCOUNTYCOURT"] },
  { label: "Supreme Court Breach", patterns: ["SUPREMECOURTBREACH", "BREACHPROCEEDINGSSUPREMECOURT"] },
  { label: "County Court - Special Hearing", patterns: ["COUNTYCOURTSPECIALHEARING"] },
  { label: "County Court - Section 198A", patterns: ["COUNTYCOURTSECTION198A", "COUNTYCOURTS198A"] },
  { label: "County Court - Active Case Management (Pre Trial)", patterns: ["COUNTYCOURTACTIVECASEMANAGEMENTPRETRIAL", "COUNTYCOURTACTIVECASEMANAGMENTPRETRIAL"] },
  { label: "County Court - Trial", patterns: ["COUNTYCOURTTRIAL"] },
  { label: "Supreme Court - Special Hearing", patterns: ["SUPREMECOURTSPECIALHEARING"] },
  { label: "Supreme Court - s198B/Case Management", patterns: ["SUPREMECOURTS198BCASEMANAGEMENT", "SUPREMECOURTS198BCASEMANAGMENT"] },
  { label: "Supreme Court Trial", patterns: ["SUPREMECOURTTRIAL"] },
  { label: "Additional Prep", patterns: ["ADDITIONALPREP"] },
  { label: "County Court Appeal - Sentence", patterns: ["COUNTYCOURTAPPEALSENTENCE"] },
  { label: "County Court Appeal - Conviction or Conviction/Sentence", patterns: ["COUNTYCOURTAPPEALCONVICTIONORCONVICTIONSENTENCE"] },
  { label: "Court of Appeal - Leave Application", patterns: ["COURTOFAPPEALLEAVEAPPLICATION"] },
  { label: "Court of Appeal - Appeal against Sentence", patterns: ["COURTOFAPPEALAPPEALAGAINSTSENTENCE"] },
  { label: "Court of Appeal - Appeal against Conviction or Conviction and Sentence", patterns: ["COURTOFAPPEALAPPEALAGAINSTCONVICTIONORCONVICTIONANDSENTENCE"] },
  { label: "Court of Appeal - DPP Appeal", patterns: ["COURTOFAPPEALDPPAPPEAL"] },
  { label: "Interlocutory Appeal", patterns: ["INTERLOCUTORYAPPEAL", "INTERLOCUTORYAPPEAK"] },
  { label: "High Court Appeal", patterns: ["HIGHCOURTAPPEAL"] },
  { label: "Circuit Fees - Committals, bail, pleas and appeals in the Supreme and County Court", patterns: ["CIRCUITFEESCOMMITTALSBAILPLEASANDAPPEALSINTHESUPREMEANDCOUNTYCOURT"] },
  { label: "Circuit Fees - Trials in the Supreme and County Court", patterns: ["CIRCUITFEESTRIALSINTHESUPREMEANDCOUNTYCOURT"] },
  { label: "Crimes Mental Impairment - Post", patterns: ["CRIMESMENTALIMPAIRMENTPOST"] },
  { label: "Emergency detention orders", patterns: ["EMERGENCYDETENTIONORDERS"] },
  { label: "Detention orders / Commonwealth continuing detention orders", patterns: ["DETENTIONORDERSCOMMONWEALTHCONTINUINGDETENTIONORDERS"] },
  { label: "Supervision orders / Commonwealth extended supervision orders or control orders", patterns: ["SUPERVISIONORDERSCOMMONWEALTHEXTENDEDSUPERVISIONORDERSORCONTROLORDERS"] },
  { label: "Application for review brought by a person subject to an order", patterns: ["APPLICATIONFORREVIEWBROUGHTBYAPERSONSUBJECTTOANORDER"] },
  { label: "Crimes (Mental Impairment and Unfitness to be Tried) Act matters", patterns: ["CRIMESMENTALIMPAIRMENTANDUNFITNESSTOBETRIEDACTMATTERS"] },
  { label: "Children Court - Bail", patterns: ["CHILDRENCOURTBAIL", "CHILDRENSCOURTBAIL"] },
  { label: "Childrens Court - Single", patterns: ["CHILDRENSCOURTSINGLE", "CHILDRENCOURTSINGLE"] },
  { label: "Childrens Court - Consol", patterns: ["CHILDRENSCOURTCONSOL", "CHILDRENCOURTCONSOL"] },
  { label: "Childrens Court - Increase to consol", patterns: ["CHILDRENSCOURTINCREASETOCONSOL", "CHILDRENCOURTINCREASETOCONSOL"] },
  { label: "Childrens Court - Committal and Plea in the County Court", patterns: ["CHILDRENSCOURTCOMMITTALANDPLEAINTHECOUNTYCOURT", "CHILDRENCOURTCOMMITTALANDPLEAINTHECOUNTYCOURT"] },
  { label: "Childrens Court - Committal and Plea in the Supreme Court", patterns: ["CHILDRENSCOURTCOMMITTALANDPLEAINTHESUPREMECOURT", "CHILDRENCOURTCOMMITTALANDPLEAINTHESUPREMECOURT"] },
  { label: "Childrens Court - Serious Indictable Crime", patterns: ["CHILDRENSCOURTSERIOUSINDICTABLECRIME", "CHILDRENCOURTSERIOUSINDICTABLECRIME"] },
  { label: "Bail Application", patterns: ["MAGISTRATESCOURTBAILAPPLICATION", "BAILAPPLICATION"] },
  { label: "Disbursement - Psychological Assessment and Report (Not in custody)", patterns: ["PSYCHOLOGICALASSESSMENTANDREPORTNOTINCUSTODY"] },
  { label: "Disbursement - Psychological Assessment and Report (In custody)", patterns: ["PSYCHOLOGICALASSESSMENTANDREPORTINCUSTODY", "PSYCHOLOGICALASSESSMENTANDREPORTINCLUDINGJAILVISIT"] },
];

function inferAidTypes(text) {
  const compact = buildCompactUpper(text);
  const aidTypes = AID_TYPE_CATALOG.filter(({ patterns }) => patterns.some((pattern) => compact.includes(pattern))).map(({ label }) => label);

  if (aidTypes.some((label) => label.startsWith("Disbursement -")) && !aidTypes.includes("Special Disbursement")) {
    aidTypes.unshift("Special Disbursement");
  }

  return Array.from(new Set(aidTypes));
}

function extractApplicationRequestScopeOfWorkText(text = "") {
  const scopeMatch = text.match(/SCOPE OF WORK[\s\S]*?(?:Please check that you have the correct grant of aid\.[\s\S]*?)([A-Z0-9\s\-\/\(\)']+?)(?:Waiver of Proof of Means|MTC3|Practitioners are required to certify|PLEASE NOTE:)/i);
  if (scopeMatch?.[1]) {
    return scopeMatch[1];
  }
  return text;
}

function extractApplicationRequestScopeOfWorkLines(text = "") {
  return extractApplicationRequestScopeOfWorkText(text)
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);
}

function inferAidTypesFromLines(lines, text, documentType = "") {
  let aidTypes = [];

  if (documentType === "application_request") {
    const scopeLines = extractApplicationRequestScopeOfWorkLines(text);
    const matchedScopeLine = scopeLines.find((line) => inferAidTypes(line).length > 0);
    aidTypes = matchedScopeLine ? inferAidTypes(matchedScopeLine) : [];
  } else {
    aidTypes = inferAidTypes(text);
  }

  const summaryHeadingIndex = findLineIndex(
    lines,
    (line) =>
      /SUMMARY/.test(line) &&
      /MAGISTRATES/.test(line) &&
      /FIVE DEFENDED DAYS/.test(line)
  );

  if (summaryHeadingIndex >= 0 && !aidTypes.includes("Summary Single")) {
    aidTypes.unshift("Summary Single");
  }

  return Array.from(new Set(aidTypes));
}

function buildConflictFlags({ inCustody, aidTypes }) {
  const flags = [];
  if (
    inCustody === "YES" &&
    aidTypes.some((item) => /psychological assessment and report \(not in custody\)/i.test(item))
  ) {
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
  if (
    compact.includes("LEGALASSISTANCEISAPPROVED") ||
    compact.includes("APPROVEDLEGALASSISTANCE") ||
    compact.includes("VLAGRANTNUMBER")
  ) {
    return "grant_approval_letter";
  }
  return "unknown";
}

function extractApprovalLetterAidNumber(compact = "") {
  const match = compact.match(/VLAGRANTNUMBER(\d{2}A\d{6})/);
  return match?.[1] || "";
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

export async function parseAidLetterFile(file) {
  const text = await extractTextFromPdfFile(file);
  const annotatedOverrides = await extractAnnotatedFieldOverrides(file).catch(() => ({}));
  const normalizedText = text.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n");
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

  const aidTypes =
    Array.isArray(annotatedOverrides.aidTypeList) && annotatedOverrides.aidTypeList.length > 0
      ? annotatedOverrides.aidTypeList
      : (() => {
          const templateAidTypes = documentType === "application_request" ? extractTemplateAidType(lines) : [];
          return templateAidTypes.length > 0
            ? templateAidTypes
            : inferAidTypesFromLines(lines, normalizedText, documentType);
        })();
  const templateGuideline = documentType === "application_request" ? extractTemplateGuideline(lines) : "";
  const approvalAidNumber = extractApprovalLetterAidNumber(compactText);
  const approvalCourt = extractApprovalLetterCourt(compactText);
  const approvalLocation = extractApprovalLetterLocation(normalizedText, compactText);
  const normalizedCourt = annotatedOverrides.court || approvalCourt || normalizeCourt(courtRaw);
  const inferredListingType =
    documentType === "application_request"
      ? extractTemplateListingType(annotatedOverrides.listingTypeRaw || hearingTypeRaw, normalizedCourt)
      : annotatedOverrides.listingType || normalizeListingType(annotatedOverrides.listingTypeRaw || hearingTypeRaw, normalizedCourt);
  const parsedAlerts = buildParsedAlerts({
    documentType,
    compactText,
    listingType: inferredListingType,
  });
  const conflictFlags = buildConflictFlags({
    inCustody: cleanLine(custodyRaw).toUpperCase(),
    aidTypes,
  });

  return {
    rawText: normalizedText,
    fields: {
      matterType:
        documentType === "grant_approval_letter"
          ? "Criminal"
          : normalizeMatterType(normalizedText, matterTypeRaw),
      aidType: annotatedOverrides.aidType || aidTypes.join("; "),
      aidTypeList: aidTypes,
      guideline: annotatedOverrides.guideline || templateGuideline || "",
      aidNumber: cleanLine(annotatedOverrides.aidNumber || approvalAidNumber || fileId),
      extensionNumber: annotatedOverrides.extensionNumber ?? extensionNumber,
      court: normalizedCourt,
      location: cleanLine(annotatedOverrides.location || approvalLocation || location),
      listingType: inferredListingType,
      listingTypeRaw: cleanLine(annotatedOverrides.listingTypeRaw || hearingTypeRaw),
      listingDate:
        documentType === "grant_approval_letter"
          ? ""
          : annotatedOverrides.listingDate || parseDate(hearingDateRaw),
      applicationStatus:
        documentType === "grant_approval_letter"
          ? "Aid granted"
          : annotatedOverrides.applicationStatus || inferApplicationStatus(applicationRequestStatus),
      documentType,
      statusRaw:
        documentType === "grant_approval_letter"
          ? "APPROVED"
          : applicationRequestStatus,
      custodyStatus:
        documentType === "grant_approval_letter"
          ? ""
          : cleanLine(annotatedOverrides.custodyStatus || cleanLine(custodyRaw).split(" ")[0]),
      effectiveDate:
        documentType === "grant_approval_letter"
          ? parseApprovalEffectiveDate(compactText)
          : documentType === "application_request"
            ? annotatedOverrides.effectiveDate || parseApplicationEffectiveDate(normalizedText)
            : "",
    },
    parsedAlerts,
    conflictFlags,
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = `${reader.result || ""}`;
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (!base64) {
        reject(new Error("Could not encode the uploaded aid letter."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read the uploaded aid letter."));
    reader.readAsDataURL(file);
  });
}

export async function parseAidLetterUpload(file) {
  try {
    const base64 = await fileToBase64(file);
    const response = await fetch(`${API_BASE}/api/parse-aid-letter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64 }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Could not parse the uploaded aid letter.");
    }

    return payload;
  } catch {
    return await parseAidLetterFile(file);
  }
}
