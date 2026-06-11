import { getAppearanceFeeInfo, getAppearanceTypesForCourt } from "@/lib/vla-fees-data";

const PLANNER_TO_BACKSHEET_COURT = {
  "Children's Court": "Children's Court",
  "Magistrates' Court": "Magistrates Court",
  "County Court": "County Court",
  "Supreme Court": "Supreme Court",
  "Court of Appeal": "Court of appeal",
  "High Court": "High Court",
  Other: "Other",
};

const SINGLE_SUMMARY_APPEARANCE_LOOKUP = {
  "CONSOL CONT MENTION": {
    appearanceType: "CONSOL CONT MENTION",
    feeType: "CONSOL CONT MENTION",
    amountLabel: "1 APPEARANCE(s) @ $581.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "appearance",
  },
  PREPARATION: {
    appearanceType: "PREPARATION",
    feeType: "PREPARATION",
    amountLabel: "LUMP SUM $484.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "lump sum",
  },
  APPEARANCE: {
    appearanceType: "APPEARANCE",
    feeType: "APPEARANCE",
    amountLabel: "3 DAY(s) @ $484.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 3,
    allocationUnit: "day",
    trackerAliases: ["APPEARANCE", "PLEA"],
  },
  "DEFEND/CONTEST DAILY FEE": {
    appearanceType: "DEFEND/CONTEST DAILY FEE",
    feeType: "DEFEND/CONTEST DAILY FEE",
    amountLabel: "5 DAY(s) @ $1099.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 5,
    allocationUnit: "day",
    trackerAliases: ["DEFEND/CONTEST DAILY FEE", "CONTESTED HEARING"],
  },
  "CONTEST MENTION": {
    appearanceType: "CONTEST MENTION",
    feeType: "CONTEST MENTION",
    amountLabel: "3 MENTION(s) @ $332.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 3,
    allocationUnit: "mention",
  },
  "PLEA AT CONTEST MENTION": {
    appearanceType: "PLEA AT CONTEST MENTION",
    feeType: "PLEA AT CONTEST MENTION",
    amountLabel: "1 DAY(s) @ $318.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "day",
  },
  "CRED/DRUG COURT MENTION": {
    appearanceType: "CRED/DRUG COURT MENTION",
    feeType: "CRED/DRUG COURT MENTION",
    amountLabel: "ATTENDANCE $185.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "attendance",
  },
  "JAIL CONFERENCE": {
    appearanceType: "JAIL CONFERENCE",
    feeType: "JAIL CONFERENCE",
    amountLabel: "ATTENDANCE $185.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "attendance",
  },
  ADJOURNMENT: {
    appearanceType: "ADJOURNMENT",
    feeType: "ADJOURNMENT",
    amountLabel: "2 APPEARANCE(s) @ $318.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 2,
    allocationUnit: "appearance",
  },
  "BRIEF SENTENCE INDICATION": {
    appearanceType: "BRIEF SENTENCE INDICATION",
    feeType: "BRIEF SENTENCE INDICATION",
    amountLabel: "1 DAY(s) @ $484.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "day",
  },
  "APPEAR AT SENTENCE": {
    appearanceType: "APPEAR AT SENTENCE",
    feeType: "APPEAR AT SENTENCE",
    amountLabel: "2 APPEARANCE(s) @ $318.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 2,
    allocationUnit: "appearance",
    trackerAliases: ["APPEAR AT SENTENCE", "SENTENCE"],
  },
  "TRAVEL FEE": {
    appearanceType: "TRAVEL FEE",
    feeType: "TRAVEL FEE",
    amountLabel: "2000 KILOMETRE(s) @ $0.83",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 2000,
    allocationUnit: "kilometre",
  },
  "OVERNIGHT FEE": {
    appearanceType: "OVERNIGHT FEE",
    feeType: "OVERNIGHT FEE",
    amountLabel: "5 NIGHT(s) @ $394.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 5,
    allocationUnit: "night",
  },
  "TAPE TRANSCRIPTION": {
    appearanceType: "TAPE TRANSCRIPTION",
    feeType: "TAPE TRANSCRIPTION",
    amountLabel: "3 TAPE(s) @ $99.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 3,
    allocationUnit: "tape",
  },
  "FOI/TITLE LODG/SEARCH FEE": {
    appearanceType: "FOI/TITLE LODG/SEARCH FEE",
    feeType: "FOI/TITLE LODG/SEARCH FEE",
    amountLabel: "MAXIMUM LIMIT $668.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "limit",
  },
  "SERVICE/FILING/COND MONEY": {
    appearanceType: "SERVICE/FILING/COND MONEY",
    feeType: "SERVICE/FILING/COND MONEY",
    amountLabel: "MAXIMUM LIMIT $617.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "limit",
  },
  "SPECIAL MENTION - SUMMARY": {
    appearanceType: "SPECIAL MENTION - SUMMARY",
    feeType: "SPECIAL MENTION - SUMMARY",
    amountLabel: "2 MENTION(s) @ $185.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 2,
    allocationUnit: "mention",
  },
  "FIRST REMAND HEARING": {
    appearanceType: "FIRST REMAND HEARING",
    feeType: "FIRST REMAND HEARING",
    amountLabel: "1 APPEARANCE(s) @ $231.00",
    table: "Single Summary grant",
    note: "Effective 27/01/2026 to current.",
    effectiveFrom: "27/01/2026",
    allocationCount: 1,
    allocationUnit: "appearance",
    trackerAliases: ["FIRST REMAND HEARING"],
  },
  "SUMMARY CRIME MENTION": {
    appearanceType: "SUMMARY CRIME MENTION",
    feeType: "SUMMARY CRIME MENTION",
    amountLabel: "2 APPEARANCE(s) @ $185.00",
    table: "Single Summary grant",
    note: "Effective 30/03/2026 to current.",
    effectiveFrom: "30/03/2026",
    allocationCount: 2,
    allocationUnit: "appearance",
    trackerAliases: ["SUMMARY CRIME MENTION", "MENTION"],
  },
};

const SINGLE_SUMMARY_APPEARANCE_OPTIONS = Object.keys(SINGLE_SUMMARY_APPEARANCE_LOOKUP);

const COUNTY_COURT_BREACH_CLAIM_ROWS = [
  {
    appearanceType: "DAILY HEARING FEE",
    feeType: "DAILY HEARING FEE",
    amountLabel: "3 APPEARANCE(s) @ $1,087.00",
    table: "County Court Breach grant",
    note: "County Court Breach daily hearing fee allocation.",
    allocationCount: 3,
    allocationUnit: "appearance",
    trackerAliases: ["DAILY HEARING FEE", "TRIAL", "TRIAL (FIRST DAY)", "TRIAL (SUBSEQUENT DAY)", "CONTESTED HEARING"],
  },
  {
    appearanceType: "MENTION",
    feeType: "MENTION",
    amountLabel: "2 APPEARANCE(s) @ $297.00",
    table: "County Court Breach grant",
    note: "County Court Breach mention allocation.",
    allocationCount: 2,
    allocationUnit: "appearance",
    trackerAliases: ["MENTION", "DIRECTIONS HEARING / MENTION / CALLOVER", "DIRECTIONS HEARING", "FIRST DIRECTIONS HEARING"],
  },
  {
    appearanceType: "APPEAR AT SENTENCE",
    feeType: "APPEAR AT SENTENCE",
    amountLabel: "2 APPEARANCE(s) @ $356.00",
    table: "County Court Breach grant",
    note: "County Court Breach sentence allocation.",
    allocationCount: 2,
    allocationUnit: "appearance",
    trackerAliases: ["APPEAR AT SENTENCE", "SENTENCE", "RETURN FOR SENTENCE"],
  },
];

function hasSummarySingleAidType(aidTypeList = []) {
  return aidTypeList.some((item) => {
    const normalized = `${item || ""}`.toLowerCase();
    return normalized.includes("summary single") || normalized.includes("summary - up to five defended days");
  });
}

function hasCountyCourtBreachAidType(aidTypeList = []) {
  return aidTypeList.some((item) => {
    const normalized = `${item || ""}`.toLowerCase();
    return normalized.includes("county court breach") || normalized.includes("breach proceedings - county court");
  });
}

export function getBacksheetCourtName(courtName) {
  return PLANNER_TO_BACKSHEET_COURT[courtName] || "";
}

export function getPlannerAppearanceOptions(courtName, aidTypeList = [], currentValue = "") {
  let options = [];

  if (hasSummarySingleAidType(aidTypeList)) {
    options = [...SINGLE_SUMMARY_APPEARANCE_OPTIONS];
  } else {
    const backsheetCourt = getBacksheetCourtName(courtName);
    if (!backsheetCourt) {
      options = [];
    } else {
      options = getAppearanceTypesForCourt(backsheetCourt).map((option) => option.label);
    }
  }

  if (currentValue && !options.includes(currentValue)) {
    options = [currentValue, ...options];
  }

  return options;
}

export function getPlannerAppearanceFeeInfo(courtName, appearanceType, aidTypeList = []) {
  if (hasSummarySingleAidType(aidTypeList)) {
    if (SINGLE_SUMMARY_APPEARANCE_LOOKUP[appearanceType]) {
      return SINGLE_SUMMARY_APPEARANCE_LOOKUP[appearanceType];
    }
    // Check aliases
    const normalizedTarget = normalizeTrackerValue(appearanceType);
    for (const key of Object.keys(SINGLE_SUMMARY_APPEARANCE_LOOKUP)) {
      const row = SINGLE_SUMMARY_APPEARANCE_LOOKUP[key];
      const aliases = [row.appearanceType, row.feeType, ...(row.trackerAliases || [])]
        .map(normalizeTrackerValue)
        .filter(Boolean);
      if (aliases.includes(normalizedTarget)) {
        return row;
      }
    }
  }

  const backsheetCourt = getBacksheetCourtName(courtName);
  if (!backsheetCourt || !appearanceType) {
    return null;
  }

  return getAppearanceFeeInfo(backsheetCourt, appearanceType);
}

export function applyPlannerAppearanceFeeDefaults(claim, courtName, appearanceType, aidTypeList = []) {
  const feeInfo = getPlannerAppearanceFeeInfo(courtName, appearanceType, aidTypeList);
  if (!feeInfo) {
    return {
      ...claim,
      appearanceType,
      feeType: claim.feeType || "",
      feeAmount: "",
      feeTable: "",
      feeNote: "",
    };
  }

  return {
    ...claim,
    appearanceType,
    feeType: feeInfo.feeType || "",
    feeAmount: feeInfo.amountLabel || "",
    feeTable: feeInfo.table || "",
    feeNote: feeInfo.note || "",
  };
}

function formatRemainingLabel(row) {
  const unit = row.allocationUnit || "item";
  const plural = row.remaining === 1 ? unit : `${unit}s`;
  return `${row.remaining} ${plural} left`;
}

export function formatClaimAvailabilityLabel(row) {
  const feeType = `${row?.feeType || ""}`.toUpperCase();

  if (row?.allocationUnit === "lump sum") {
    return "Lump sum";
  }

  if (feeType === "FOI/TITLE LODG/SEARCH FEE" || feeType === "SERVICE/FILING/COND MONEY") {
    return "Maximum limit";
  }

  if (feeType === "TRAVEL FEE") {
    return `${row?.allocationCount || 0} km's`;
  }

  if (feeType === "OVERNIGHT FEE") {
    return `${row?.allocationCount || 0} overnight${row?.allocationCount === 1 ? "" : "s"}`;
  }

  if (feeType === "TAPE TRANSCRIPTION") {
    return `${row?.allocationCount || 0} tape${row?.allocationCount === 1 ? "" : "s"}`;
  }

  if (feeType === "JAIL CONFERENCE") {
    return `${row?.allocationCount || 0} Conference`;
  }

  return `${row?.allocationCount || 0} appearance${row?.allocationCount === 1 ? "" : "s"}`;
}

export function formatClaimFeeLabel(row) {
  const amountLabel = `${row?.amountLabel || ""}`;
  const moneyMatch = amountLabel.match(/\$\d[\d,]*(?:\.\d{2})?/);
  return moneyMatch?.[0] || amountLabel;
}

export function getClaimFeeAmount(row) {
  const amountLabel = `${row?.amountLabel || ""}`;
  const moneyMatch = amountLabel.match(/\$([\d,]+(?:\.\d{2})?)/);
  if (!moneyMatch) return 0;
  return Number(moneyMatch[1].replace(/,/g, "")) || 0;
}

export function formatClaimedToDateLabel(row) {
  const amount = getClaimFeeAmount(row) * (Number(row?.claimed) || 0);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getClaimedToDateAmount(row) {
  return getClaimFeeAmount(row) * (Number(row?.claimed) || 0);
}

function outcomeSuggestsMoreOfSameAppearance(claim) {
  const text = `${claim?.outcome || ""} ${claim?.notes || ""}`.toLowerCase();
  return /adj|adjourned|further mention|mention|return|callover|special mention|review/.test(text);
}

export function getSingleSummaryClaimRows() {
  return SINGLE_SUMMARY_APPEARANCE_OPTIONS.map((key) => SINGLE_SUMMARY_APPEARANCE_LOOKUP[key]);
}

function getCountyCourtBreachClaimRows() {
  return COUNTY_COURT_BREACH_CLAIM_ROWS;
}

function getClaimTrackerRowsForAidType(aidTypeList = []) {
  if (hasSummarySingleAidType(aidTypeList)) {
    return getSingleSummaryClaimRows();
  }

  if (hasCountyCourtBreachAidType(aidTypeList)) {
    return getCountyCourtBreachClaimRows();
  }

  return [];
}

function normalizeTrackerValue(value = "") {
  return `${value || ""}`.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

export function claimMatchesTrackerRow(claim, row) {
  const candidates = [
    claim?.appearanceType,
    claim?.customAppearanceType,
    claim?.feeType,
  ]
    .map(normalizeTrackerValue)
    .filter(Boolean);

  const aliases = [row.appearanceType, row.feeType, ...(row.trackerAliases || [])]
    .map(normalizeTrackerValue)
    .filter(Boolean);

  return candidates.some((candidate) => aliases.includes(candidate));
}

export function getClaimTrackerPreviewRows(planner) {
  return getClaimTrackerRowsForAidType(planner?.aid?.aidTypeList || []).map((row) => ({
    ...row,
    claimed: 0,
    remaining: row.allocationCount || 0,
    remainingLabel: formatRemainingLabel({ ...row, remaining: row.allocationCount || 0 }),
  }));
}

export function findClaimAvailabilityRow(planner, claim) {
  return getClaimAvailabilityTable(planner).find((row) => claimMatchesTrackerRow(claim, row)) || null;
}

export function getClaimAvailabilityTable(planner) {
  const trackerRows = getClaimTrackerRowsForAidType(planner?.aid?.aidTypeList || []);
  if (trackerRows.length === 0) {
    return [];
  }

  const claimedCounts = new Map();
  for (const claim of planner?.appearanceClaims || []) {
    const matchedRow = trackerRows.find((row) => claimMatchesTrackerRow(claim, row));
    if (!matchedRow) continue;
    
    let claimAmount = 1;
    if (matchedRow.allocationUnit === "kilometre" && claim.claimedUnits) {
      claimAmount = Number(claim.claimedUnits) || 0;
    }
    
    claimedCounts.set(matchedRow.feeType, (claimedCounts.get(matchedRow.feeType) || 0) + claimAmount);
  }

  return trackerRows.map((row) => {
    const claimed = claimedCounts.get(row.feeType) || 0;
    const remaining = Math.max(0, (row.allocationCount || 0) - claimed);
    return {
      ...row,
      claimed,
      remaining,
      remainingLabel: formatRemainingLabel({ ...row, remaining }),
    };
  });
}

export function getClaimRowWarning(claim, availabilityRow) {
  if (!claim?.claimLodged || !availabilityRow) return "";
  if (availabilityRow.remaining > 1) return "";
  if (!outcomeSuggestsMoreOfSameAppearance(claim)) return "";
  return "Consider lodging an extension for additional non defend days";
}
