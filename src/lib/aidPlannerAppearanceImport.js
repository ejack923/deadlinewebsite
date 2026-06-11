import { inflate } from "pako";

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

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const latin1 = uint8ArrayToLatin1String(bytes);
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const pieces = [];
  let match;

  while ((match = streamRegex.exec(latin1))) {
    try {
      const inflated = inflate(latin1StringToUint8Array(match[1]));
      const text = new TextDecoder("latin1").decode(inflated);
      const tjMatches = [...text.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g)].map((item) =>
        decodePdfString(item[1])
      );
      const tjArrayMatches = [...text.matchAll(/\[(.*?)\]\s*TJ/gs)].flatMap((item) =>
        [...item[1].matchAll(/\(([^()]*(?:\\.[^()]*)*)\)/g)].map((inner) => decodePdfString(inner[1]))
      );
      pieces.push(...tjMatches, ...tjArrayMatches);
    } catch {
      // ignore non-deflate streams
    }
  }

  return pieces.filter(Boolean).join("\n");
}

function cleanText(value = "") {
  return value.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n").replace(/\r/g, "\n");
}

function toIsoDate(value = "") {
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function extractTemplateField(text, label) {
  const regex = new RegExp(`${label}[:\\s]+(.*?)(?:\r?\n|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function inferAppearanceTypeFromText(text = "") {
  const templatedType = extractTemplateField(text, "Appearance Type") || extractTemplateField(text, "Type");
  if (templatedType) {
    const upperTemplated = templatedType.toUpperCase();
    if (upperTemplated.includes("CONTEST MENTION")) return { appearanceType: "Contest Mention", customAppearanceType: "" };
    if (upperTemplated.includes("MENTION")) return { appearanceType: "Mention", customAppearanceType: "" };
    if (upperTemplated.includes("BAIL")) return { appearanceType: "Bail Application", customAppearanceType: "" };
    if (upperTemplated.includes("PLEA")) return { appearanceType: "Plea", customAppearanceType: "" };
    if (upperTemplated.includes("SENTENCE")) return { appearanceType: "Sentence", customAppearanceType: "" };
    if (upperTemplated.includes("COMMITTAL")) return { appearanceType: "Committal", customAppearanceType: "" };
    if (upperTemplated.includes("APPEAL")) return { appearanceType: "Appeal", customAppearanceType: "" };
    if (upperTemplated.includes("CONTESTED HEARING") || upperTemplated.includes("TRIAL")) return { appearanceType: "Trial", customAppearanceType: "" };
    if (upperTemplated.includes("CONFERENCE")) return { appearanceType: "Conference", customAppearanceType: "" };
    return { appearanceType: "Other", customAppearanceType: templatedType };
  }

  const upper = text.toUpperCase();
  if (upper.includes("CONTEST MENTION")) return { appearanceType: "Contest Mention", customAppearanceType: "" };
  if (upper.includes("MENTION/DIRECTION/CALLOVE") || upper.includes("SPECIAL MENTION") || upper.includes("MENTION")) {
    return { appearanceType: "Mention", customAppearanceType: "" };
  }
  if (upper.includes("BAIL")) return { appearanceType: "Bail Application", customAppearanceType: "" };
  if (upper.includes("PLEA")) return { appearanceType: "Plea", customAppearanceType: "" };
  if (upper.includes("SENTENCE")) return { appearanceType: "Sentence", customAppearanceType: "" };
  if (upper.includes("COMMITTAL")) return { appearanceType: "Committal", customAppearanceType: "" };
  if (upper.includes("APPEAL")) return { appearanceType: "Appeal", customAppearanceType: "" };
  if (upper.includes("CONTESTED HEARING") || upper.includes("TRIAL")) return { appearanceType: "Trial", customAppearanceType: "" };
  if (upper.includes("CONFERENCE")) return { appearanceType: "Conference", customAppearanceType: "" };
  return { appearanceType: "Other", customAppearanceType: "" };
}

export function inferOutcomeFromText(text = "") {
  const templatedOutcome = extractTemplateField(text, "Outcome");
  if (templatedOutcome) return templatedOutcome;

  const compact = text.replace(/\s+/g, " ").trim();
  const adjMatch = compact.match(
    /(adj(?:ourned)?(?:\s+\w+){0,6}\s+to\s+(?:a\s+)?contested hearing(?:\s+on\s+\d{1,2}(?:\/\d{1,2}\/\d{2,4}|\s+[a-z]+\s+\d{2,4}))?)/i
  );
  if (adjMatch) return adjMatch[1];
  const listedForMatch = compact.match(
    /(adj(?:ourned)?(?:\s+\w+){0,6}\s+to\s+(?:a\s+)?[a-z][a-z\s/-]{2,80}?(?:\s+on\s+\d{1,2}(?:\/\d{1,2}\/\d{2,4}|\s+[a-z]+\s+\d{2,4}))?)(?=$|[.,;])/i
  );
  if (listedForMatch) return listedForMatch[1].trim();
  const genericAdj = compact.match(/(adj(?:ourned)?(?:\s+\w+){0,8})/i);
  if (genericAdj) return genericAdj[1];
  const outcomeMatch = compact.match(/Outcome[:\s]+(.+?)(?:\.|$)/i);
  if (outcomeMatch) return outcomeMatch[1].trim();
  const orderMatch = compact.match(/(ordered?.+?)(?:\.|$)/i);
  if (orderMatch) return orderMatch[1].trim();
  return "";
}

function inferAppearanceDateFromText(text = "") {
  const labelledMatch =
    text.match(/appearance date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    text.match(/court date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
    text.match(/dated[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (labelledMatch) return toIsoDate(labelledMatch[1]);

  const firstDate = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
  return firstDate ? toIsoDate(firstDate[0]) : "";
}

export async function parseAppearanceEvidenceFile(file) {
  const lowerName = (file.name || "").toLowerCase();
  let text = "";

  if (lowerName.endsWith(".pdf")) {
    text = await extractPdfText(file);
  } else {
    text = await file.text();
  }

  const normalized = cleanText(text);
  const { appearanceType, customAppearanceType } = inferAppearanceTypeFromText(normalized);
  const outcome = inferOutcomeFromText(normalized);
  const date = inferAppearanceDateFromText(normalized);

  return [
    {
      date,
      appearanceType,
      customAppearanceType,
      outcome,
      notes: normalized.slice(0, 1200),
      importSource: file.name || "Uploaded evidence",
    },
  ];
}

function unfoldIcsLines(text = "") {
  return text.replace(/\r\n[ \t]/g, "");
}

function parseIcsDate(value = "") {
  const match = value.match(/(\d{4})(\d{2})(\d{2})/);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function parseGoogleEventDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = `${value}`.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] || "";
}

function normalizeSearchText(value = "") {
  return `${value}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompactText(value = "") {
  return `${value}`.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getPlannerCalendarRelevance(planner) {
  const firstName = `${planner?.client?.firstName || ""}`.trim();
  const lastName = `${planner?.client?.lastName || ""}`.trim();
  const fullName = `${planner?.client?.fullName || [firstName, lastName].filter(Boolean).join(" ")}`.trim();
  const aidNumber = `${planner?.aid?.aidNumber || ""}`.trim();
  const aidTypes = Array.isArray(planner?.aid?.aidTypeList)
    ? planner.aid.aidTypeList.map((item) => `${item || ""}`.trim()).filter(Boolean)
    : [];

  return {
    fullName,
    firstName,
    lastName,
    normalizedFullName: normalizeSearchText(fullName),
    normalizedFirstName: normalizeSearchText(firstName),
    normalizedLastName: normalizeSearchText(lastName),
    normalizedAidNumber: normalizeCompactText(aidNumber),
  };
}

function tokenize(value = "") {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function matchesCalendarClient(eventText, planner) {
  const relevance = getPlannerCalendarRelevance(planner);
  const normalizedEventText = normalizeSearchText(eventText);
  const compactEventText = normalizeCompactText(eventText);

  // If the event explicitly contains the Aid Number, it's a guaranteed match regardless of name spelling
  if (relevance.normalizedAidNumber && compactEventText.includes(relevance.normalizedAidNumber)) {
    return true;
  }

  const hasClientContext = Boolean(relevance.normalizedFullName || relevance.normalizedFirstName || relevance.normalizedLastName);
  if (!hasClientContext) return true;

  // Exact match fallback
  if (relevance.normalizedFullName && normalizedEventText.includes(relevance.normalizedFullName)) {
    return true;
  }

  // Tokenize the full name (handles 'An Marie Jones' against 'anne marie jones' because 'an' matches inside 'anne')
  const fullTokens = tokenize(relevance.normalizedFullName);
  
  if (fullTokens.length > 0) {
    // Check if every part of the planner's name is found somewhere in the calendar event
    const allTokensMatch = fullTokens.every((t) => normalizedEventText.includes(t));
    if (allTokensMatch) return true;
    
    // As a fallback for extreme variations, if it's a long name, check if MOST of it matches
    if (fullTokens.length >= 2) {
       const matchCount = fullTokens.filter(t => normalizedEventText.includes(t)).length;
       if (matchCount >= Math.max(2, fullTokens.length - 1)) {
           return true;
       }
    }
  }

  return false;
}

function filterCalendarItemsForPlanner(items = [], planner, getSearchText) {
  const relevance = getPlannerCalendarRelevance(planner);
  const clientMatched = items.filter((item) => matchesCalendarClient(getSearchText(item), planner));
  if (!relevance.normalizedAidNumber) return clientMatched;

  const aidMatched = clientMatched.filter((item) =>
    normalizeCompactText(getSearchText(item)).includes(relevance.normalizedAidNumber)
  );

  return aidMatched.length > 0 ? aidMatched : clientMatched;
}

export async function parseAppearanceCalendarFile(file, planner) {
  const raw = unfoldIcsLines(await file.text());
  const events = raw.split("BEGIN:VEVENT").slice(1);

  const mappedItems = events.map((event) => {
    const summary = event.match(/SUMMARY:(.+)/)?.[1]?.trim() || "";
    const description = event.match(/DESCRIPTION:(.+)/)?.[1]?.replace(/\\n/g, "\n").trim() || "";
    const dtStart =
      event.match(/DTSTART(?:;VALUE=DATE)?:(.+)/)?.[1]?.trim() ||
      event.match(/DTSTART[^:]*:(.+)/)?.[1]?.trim() ||
      "";
    const date = parseIcsDate(dtStart);
    const inferred = inferAppearanceTypeFromText(`${summary}\n${description}`);
    const units = extractTemplateField(`${summary}\n${description}`, "Units");

    return {
      date,
      appearanceType: inferred.appearanceType,
      customAppearanceType: inferred.customAppearanceType,
      outcome: inferOutcomeFromText(`${summary}\n${description}`),
      claimedUnits: units,
      notes: [summary, description].filter(Boolean).join("\n"),
      importSource: file.name || "Calendar import",
    };
  }).filter((item) => item.date || item.appearanceType || item.notes);

  return filterCalendarItemsForPlanner(
    mappedItems,
    planner,
    (item) => `${item.notes || ""}\n${item.appearanceType || ""}\n${item.outcome || ""}`
  );
}

export function mapGoogleCalendarEventsToAppearanceClaims(events = [], calendarLabel = "Google Calendar", planner) {
  const mappedItems = events
    .map((event) => {
      const summary = event.summary || "";
      const description = event.description || "";
      const location = event.location || "";
      const date = parseGoogleEventDate(event.start?.dateTime || event.start?.date || "");
      const inferred = inferAppearanceTypeFromText(`${summary}\n${description}\n${location}`);
      const units = extractTemplateField(`${summary}\n${description}\n${location}`, "Units");

      return {
        date,
        appearanceType: inferred.appearanceType,
        customAppearanceType: inferred.customAppearanceType,
        outcome: inferOutcomeFromText(`${summary}\n${description}\n${location}`),
        claimedUnits: units,
        notes: [summary, location, description].filter(Boolean).join("\n"),
        importSource: `${calendarLabel} calendar`,
      };
    })
    .filter((item) => item.date || item.appearanceType || item.notes);

  return filterCalendarItemsForPlanner(
    mappedItems,
    planner,
    (item) => `${item.notes || ""}\n${item.appearanceType || ""}\n${item.outcome || ""}`
  );
}

export function deriveGrantActionAfterOutcome(planner, claim) {
  const outcome = `${claim?.outcome || inferOutcomeFromText(claim?.notes || "") || ""}`.toLowerCase();
  const aidTypes = Array.isArray(planner?.aid?.aidTypeList)
    ? planner.aid.aidTypeList.map((item) => item.toLowerCase())
    : [];

  const hasSummaryConsol = aidTypes.some((item) => item.includes("summary consolidated") || item.includes("summary consol"));
  if (hasSummaryConsol && /adj(?:ourned)?/.test(outcome) && /contested hearing/.test(outcome)) {
    return "New single summary grant required for contested hearing";
  }

  return claim?.grantActionRequired || "";
}
