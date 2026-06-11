import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

function cleanDiaryLine(line = "") {
  return String(line || "").replace(/\s+/g, " ").trim();
}

function normalizeDiaryText(text = "") {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[\u2013\u2014]/g, " - ")
    .replace(/[\u2022\u00b7]/g, " ")
    .replace(/[Ã¢â‚¬â€œÃ¢â‚¬â€]/g, " - ")
    .replace(/[Ã¢â‚¬Â¢Ã‚Â·]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function isDateHeading(line = "") {
  return /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+[a-z]+\s+\d{1,2},?\s+\d{4}$/i.test(line.trim());
}

function parseDiaryDate(line = "") {
  const match = line.match(/^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (!match) return "";
  const monthMap = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };
  const month = monthMap[match[1].toLowerCase()] || "";
  if (!month) return "";
  return `${String(match[2]).padStart(2, "0")}/${month}/${match[3]}`;
}

function isCourtHeading(line = "") {
  const value = line.trim();
  return /(magistrates'?\s+court|county\s+court|supreme\s+court|children'?s\s+court|court of appeal|drug court|neighbourhood justice centre|koori court)/i.test(value);
}

function isLikelyDiaryEntryStart(line = "") {
  return /^([A-Z][A-Za-z'' -]+|[A-Z'' -]+),\s*[A-Z][A-Za-z'' -]+/.test(line.trim());
}

function normalizeDiaryDashSpacing(line = "") {
  return String(line || "").replace(/\s*[–—-]\s*/g, " - ").replace(/\s+/g, " ").trim();
}

function extractCourtName(line = "") {
  return cleanDiaryLine(line)
    .replace(/^(A REMANDS)\b.*/i, "$1")
    .replace(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}\/\d{2,4}.*$/i, "")
    .replace(/\bLocation:.*$/i, "")
    .replace(/\(All day\).*$/i, "")
    .replace(/[]/g, "")
    .trim();
}

function isDiaryMetaLine(line = "") {
  const value = cleanDiaryLine(line);
  if (!value) return true;
  if (/^\d+\.$/.test(value)) return true;
  if (/^Location:?$/i.test(value)) return true;
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}\/\d{2,4}/i.test(value)) return true;
  if (/^(All day)$/i.test(value)) return true;
  if (/^(by|via|in person|to org)\b/i.test(value)) return true;
  if (/^[A-Z]{1,4}(?:\s*[;/]\s*[A-Z]{1,4})?\s+(?:by|via|in person|to org)\b/i.test(value)) return true;
  if (/^Counsel briefed\b/i.test(value)) return true;
  if (/^[A-Z]{1,4}[;/]\s*[A-Z]{1,4}$/i.test(value)) return true;
  return false;
}

function looksLikeInitials(value = "") {
  return /^[A-Z]{1,8}(?:\/[A-Z]{1,8})?$/.test(cleanDiaryLine(value));
}

function suggestAtlasClaimType(appearanceType = "", outcome = "") {
  const appearance = String(appearanceType || "").toLowerCase();
  const outcomeText = String(outcome || "").toLowerCase();
  if (/adj|adjourn/.test(outcomeText) && /\bfor\b/.test(outcomeText)) return "Confirm adj type";
  if (appearance.includes("contest")) return "Contest hearing appearance";
  if (appearance.includes("sentence") || appearance.includes("return for sentence")) return "Appearance on sentence or adjournment";
  if (appearance.includes("bail")) return "Bail appearance fee";
  if (appearance.includes("committal mention")) return "Committal mention / case conference appearance";
  if (appearance.includes("arc review")) return "ARC Review Hearing";
  if (appearance.includes("case assessment")) return "Active Case Management case assessment hearing";
  if (appearance.includes("sentence indication")) return "Sentence indication";
  if (appearance.includes("plea")) return "Plea appearance fee (first day)";
  if (appearance.includes("trial")) return "Trial appearance fee (first day)";
  if (appearance.includes("direction") || appearance.includes("callover")) return "Directions hearing / mention / callover";
  if (appearance.includes("mention") || appearance.includes("adjourn")) return "Daily appearance fee";
  return "";
}

function splitClientHeadAndTail(block = "") {
  const normalized = normalizeDiaryDashSpacing(block);
  const separatorIndex = normalized.indexOf(" - ");
  if (separatorIndex === -1) return { head: normalized, tail: "" };
  return {
    head: normalized.slice(0, separatorIndex).trim(),
    tail: normalized.slice(separatorIndex + 3).trim(),
  };
}

function parseDiaryEntryBlock(block = "", currentDate = "", currentCourt = "") {
  const normalized = normalizeDiaryDashSpacing(block).replace(/^\d+\.\s*/, "");
  if (!normalized) return null;
  const { head, tail } = splitClientHeadAndTail(normalized);
  if (!head) return null;

  let client_name = head;
  let grant_type = "";
  let appearance_type = "";

  let match = head.match(/^(.*?)(?:\s*\((VC|VU|VLA|L|V|pending)\))\s*$/i);
  if (match) {
    client_name = cleanDiaryLine(match[1]);
    grant_type = cleanDiaryLine(match[2]);
  } else {
    match = head.match(/^(.*?)(?:\s*\((VC|VU|VLA|L|V|pending)\))\s+(.+)$/i);
    if (match) {
      client_name = cleanDiaryLine(match[1]);
      grant_type = cleanDiaryLine(match[2]);
      appearance_type = cleanDiaryLine(match[3]);
    }
  }

  client_name = cleanDiaryLine(client_name).replace(/[()]+$/g, "").trim();
  if (!isLikelyDiaryEntryStart(client_name)) return null;

  const segments = tail.split(/\s+-\s+/).map(cleanDiaryLine).filter(Boolean);
  if (!appearance_type) appearance_type = cleanDiaryLine(segments.shift() || "");

  let lawyer_initials = "";
  let counsel_briefed = "";
  const outcomeSegments = [];

  const firstDetail = cleanDiaryLine(segments.shift() || "");
  if (looksLikeInitials(firstDetail)) {
    lawyer_initials = firstDetail;
  } else if (firstDetail) {
    const initialsWithTail = firstDetail.match(/^([A-Z]{1,8}(?:\/[A-Z]{1,8})?)\s+(.*)$/);
    if (initialsWithTail) {
      lawyer_initials = cleanDiaryLine(initialsWithTail[1]);
      if (initialsWithTail[2]) outcomeSegments.push(cleanDiaryLine(initialsWithTail[2]));
    } else if (/briefed/i.test(firstDetail)) {
      counsel_briefed = firstDetail;
    } else {
      outcomeSegments.push(firstDetail);
    }
  }

  for (const segment of segments) {
    if (!segment) continue;
    if (!counsel_briefed && /briefed/i.test(segment)) {
      counsel_briefed = segment;
      continue;
    }
    if (!lawyer_initials && looksLikeInitials(segment)) {
      lawyer_initials = segment;
      continue;
    }
    outcomeSegments.push(segment);
  }

  const outcome = cleanDiaryLine(outcomeSegments.join(" - "));
  const nextDateMatch =
    outcome.match(/\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/) ||
    outcome.match(/\b(\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\b/);
  const claimable = /^(vc|l|vla)$/i.test(grant_type);

  return {
    date: currentDate,
    client_name,
    grant_type,
    court: currentCourt,
    appearance_type,
    lawyer_initials,
    counsel_briefed,
    outcome,
    next_date: nextDateMatch ? nextDateMatch[1] : "",
    claimable,
    atlas_claim_type: claimable ? suggestAtlasClaimType(appearance_type, outcome) : "",
    notes: "",
  };
}

function extractDiaryEntryBlocksWithContext(text = "") {
  const lines = String(text || "").split("\n").map(cleanDiaryLine).filter(Boolean);
  const entries = [];
  let currentDate = "";
  let currentCourt = "";
  let currentBlock = "";

  const flushCurrentBlock = () => {
    const parsed = parseDiaryEntryBlock(currentBlock, currentDate, currentCourt);
    if (parsed) entries.push(parsed);
    currentBlock = "";
  };

  for (const rawLine of lines) {
    const line = normalizeDiaryDashSpacing(rawLine);
    if (!line) continue;

    if (isDateHeading(line)) {
      flushCurrentBlock();
      currentDate = parseDiaryDate(line);
      continue;
    }

    if (isCourtHeading(line) || /\b(?:Magistrates'? Court|County Court|Supreme Court|Neighbourhood Justice Centre|Koori Court|A REMANDS)\b/i.test(line)) {
      flushCurrentBlock();
      currentCourt = extractCourtName(line);
      continue;
    }

    if (isDiaryMetaLine(line)) continue;

    const lineWithoutNumber = line.replace(/^\d+\.\s*/, "");
    if (isLikelyDiaryEntryStart(lineWithoutNumber)) {
      flushCurrentBlock();
      currentBlock = lineWithoutNumber;
      continue;
    }

    if (currentBlock) currentBlock = `${currentBlock} ${lineWithoutNumber}`.trim();
  }

  flushCurrentBlock();
  return entries;
}

export async function parseLacwDiaryFromDataUrl(fileUrl = "") {
  const base64 = String(fileUrl).split(",")[1] || "";
  if (!base64) {
    return {
      entries: [],
      summary: "No diary file payload received.",
      debug: { source: "server", textLength: 0, entries: 0, claimable: 0 },
    };
  }

  const binary = Buffer.from(base64, "base64");
  const pdf = await getDocument({
    data: new Uint8Array(binary),
    disableWorker: true,
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise;

  const pieces = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pieces.push(...(content.items || []).map((item) => item?.str || "").filter(Boolean));
  }

  const text = pieces.join("\n");
  const normalized = normalizeDiaryText(text);
  const entries = extractDiaryEntryBlocksWithContext(normalized);
  const claimableCount = entries.filter((entry) => entry.claimable !== false).length;

  return {
    entries,
    summary: `Extracted ${entries.length} diary entr${entries.length === 1 ? "y" : "ies"}, including ${claimableCount} claimable entr${claimableCount === 1 ? "y" : "ies"}.`,
    debug: {
      source: "server",
      textLength: text.length,
      normalizedLength: normalized.length,
      contextEntriesCount: entries.length,
      claimableCount,
    },
  };
}
