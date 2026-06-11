import zlib from "node:zlib";

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

function extractTextFromPdfBuffer(buffer) {
  const latin1 = buffer.toString("latin1");
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const pieces = [];
  let match;

  while ((match = streamRegex.exec(latin1))) {
    const chunk = Buffer.from(match[1], "latin1");
    let inflated;
    try {
      inflated = zlib.inflateSync(chunk).toString("latin1");
    } catch {
      continue;
    }

    const tjMatches = [...inflated.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g)].map((item) =>
      decodePdfString(item[1])
    );
    const tjArrayMatches = [...inflated.matchAll(/\[(.*?)\]\s*TJ/gs)].flatMap((item) =>
      [...item[1].matchAll(/\(([^()]*(?:\\.[^()]*)*)\)/g)].map((inner) => decodePdfString(inner[1]))
    );

    pieces.push(...tjMatches, ...tjArrayMatches);
  }

  return pieces.filter(Boolean).join("\n");
}

function cleanLine(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function buildCompactUpper(text = "") {
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, "");
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
    ? new RegExp(`${escaped}\\s+([\\s\\S]*?)(?=\\s+(?:${blockers})\\b|$)`, "i")
    : new RegExp(`${escaped}\\s+([\\s\\S]*?)$`, "i");
  const match = text.match(regex);
  return cleanLine(match?.[1] || "");
}

function parseDate(value = "") {
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function extractAidNumber(text = "") {
  const match = text.match(/\b\d{2}A\d{6}\b/);
  return cleanLine(match?.[0] || "");
}

function normalizeCourt(value = "") {
  if (/magistrates/i.test(value)) return "Magistrates' Court";
  if (/children/i.test(value)) return "Children's Court";
  if (/county/i.test(value)) return "County Court";
  if (/supreme/i.test(value)) return "Supreme Court";
  if (/appeal/i.test(value)) return "Court of Appeal";
  return value ? "Other" : "";
}

function extractTemplateGuideline(lines = []) {
  const startIndex = findLineIndex(
    lines,
    (line) => cleanLine(line).toUpperCase() === "GL" || /your selection of the guideline/i.test(line)
  );
  if (startIndex < 0) return "";

  const shouldSkip = (value = "") => {
    const normalized = cleanLine(value);
    if (!normalized) return true;
    if (
      /^(GL|\*+|YES|NO|G\d+[A-Z]?|GUIDELINE|STATEMENT|ADDITIO|NAL GUIDELINE|INFORMAT|ION|MEANS TE|ST RESULT|S|PROFESSIONA|L COSTS|ELIGIBIL|CONTRIB|PROFESSION|COSTS?|-)$/i.test(
        normalized
      )
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

function normalizeListingType(value = "") {
  const normalized = cleanLine(value).toUpperCase();
  if (!normalized) return "";
  if (normalized.includes("CONTESTED HEARING")) return "Contested Hearing";
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

function inferAidTypes(text) {
  const aidTypes = [];
  const compact = buildCompactUpper(text);

  if (compact.includes("SUMMARYUPTOFIVEDEFENDEDDAYSMAGISTRATESCOURT")) {
    aidTypes.push("Summary Single");
  }
  if (compact.includes("SUMMARYCONSOLIDATED") || compact.includes("SUMMARYUPTOFIVEDEFENDEDDAYSCONSOLIDATED")) {
    aidTypes.push("Summary Consolidated");
  }
  if (compact.includes("MAGISTRATESCOURTBAILAPPLICATION") || compact.includes("SUMMARYBAIL")) {
    aidTypes.push("Bail Application");
  }
  if (compact.includes("PSYCHOLOGICALASSESSMENTANDREPORTNOTINCUSTODY")) {
    aidTypes.push("Disbursement - Psychological Assessment and Report (Not in custody)");
  }
  if (compact.includes("PSYCHOLOGICALASSESSMENTANDREPORTINCUSTODY") || compact.includes("PSYCHOLOGICALASSESSMENTANDREPORTINCLUDINGJAILVISIT")) {
    aidTypes.push("Disbursement - Psychological Assessment and Report (In custody)");
  }

  return Array.from(new Set(aidTypes));
}

function extractApplicationRequestScopeOfWorkText(text = "") {
  const scopeMatch = text.match(/SCOPE OF WORK[\s\S]*?(?:Please check that you have the correct grant of aid\.[\s\S]*?)([A-Z0-9\s\-\/\(\)'\*]+?)(?:Waiver of Proof of Means|MTC\d+|Practitioners are required to certify|PLEASE NOTE:)/i);
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

function inferAidTypesFromText(text = "") {
  const scopeLines = extractApplicationRequestScopeOfWorkLines(text);
  const matchedScopeLine = scopeLines.find((line) => inferAidTypes(line).length > 0);
  return matchedScopeLine ? inferAidTypes(matchedScopeLine) : inferAidTypes(text);
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

export function parseAidLetterFromPdfBuffer(buffer) {
  const text = extractTextFromPdfBuffer(buffer);
  const normalizedText = text.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n");
  const compactText = buildCompactUpper(normalizedText);
  const lines = getLines(normalizedText);
  const statusIndex = findLineIndex(lines, (line) => line.toLowerCase() === "status");
  const courtIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("which court/tribunal do you have to go"));
  const locationIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("where is the court/tribunal"));
  const hearingTypeIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("what type of hearing is it"));
  const hearingDateIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("when is the next hearing date"));
  const custodyIndex = findLineIndex(lines, (line) => line.toLowerCase().includes("are you in custody or detention"));

  const statusRaw =
    getNextMeaningfulLine(lines, statusIndex, { skip: ["Submitted", "by", "Submitted by", "Extension", "0"] }) ||
    matchAfterLabel(normalizedText, "Status", ["Submitted by", "Application Source"]);
  const fileId = extractAidNumber(normalizedText);
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

  const templateAidTypes = extractTemplateAidType(lines);
  const aidTypes = templateAidTypes.length > 0 ? templateAidTypes : inferAidTypesFromText(normalizedText);
  const templateGuideline = extractTemplateGuideline(lines);
  const applicationRequestStatus = extractApplicationRequestStatus(statusRaw, compactText);
  const conflictFlags = buildConflictFlags({
    inCustody: cleanLine(custodyRaw).toUpperCase(),
    aidTypes,
  });

  return {
    rawText: normalizedText,
    fields: {
      matterType: "Criminal",
      aidType: aidTypes.join("; "),
      aidTypeList: aidTypes,
      guideline: templateGuideline,
      aidNumber: cleanLine(fileId),
      court: normalizeCourt(courtRaw),
      location: cleanLine(location),
      listingType: normalizeListingType(hearingTypeRaw),
      listingTypeRaw: cleanLine(hearingTypeRaw),
      listingDate: parseDate(hearingDateRaw),
      applicationStatus: inferApplicationStatus(applicationRequestStatus),
      statusRaw: cleanLine(applicationRequestStatus),
      custodyStatus: cleanLine(custodyRaw),
    },
    conflictFlags,
  };
}
