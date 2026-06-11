export const MATTER_TYPES = ["Criminal", "Family", "Family Violence", "Civil", "Other"];
export const APPLICATION_STATUS_OPTIONS = [
  "Aid not applied for",
  "Application applied for - Pending",
  "Aid granted",
  "Aid refused",
  "Needs manual review",
];

export const COURTS = [
  "Magistrates' Court",
  "County Court",
  "Supreme Court",
  "Children's Court",
  "Family Court",
  "Federal Circuit and Family Court",
  "Other",
];

export const APPEARANCE_TYPES = [
  "Mention",
  "Contest Mention",
  "Plea",
  "Sentence",
  "Bail Application",
  "Committal",
  "Appeal",
  "Trial",
  "Conference",
  "Other",
];

export const GRANT_TYPES = ["No grant yet", "Initial aid", "Ongoing aid", "Extension", "Appeal funding", "Other"];

export const STAGE_OPTIONS = [
  "Advice only",
  "Mention",
  "Bail",
  "Plea",
  "Sentence",
  "Committal",
  "Trial prep",
  "Trial",
  "Appeal",
  "Other",
];

export const EVENT_TYPES = [
  "instructions_received",
  "aid_application_started",
  "aid_application_lodged",
  "grant_approved",
  "hearing",
  "extension_review",
  "extension_requested",
  "invoice_ready",
  "invoice_sent",
];

export const GRANT_DECISION_OPTIONS = ["Pending", "Granted", "Refused"];
export const POST_APPEARANCE_ACTIONS = [
  "No action",
  "Extension likely needed",
  "New grant likely needed",
  "New single summary grant required for contested hearing",
  "Manual review required",
];

export function createExternalWorkItem() {
  return {
    id: crypto.randomUUID(),
    providerType: "",
    providerName: "",
    workRequested: "",
    workDate: "",
    linkedAppearance: "",
    feeType: "",
    providerEngaged: false,
    workCompleted: false,
    coveredByCurrentGrant: "",
    extensionLikelyNeeded: "",
    newGrantLikelyNeeded: "",
    paymentRisk: "",
    notes: "",
  };
}

export function createAppearanceClaim() {
  return {
    id: crypto.randomUUID(),
    date: "",
    appearanceType: "",
    customAppearanceType: "",
    outcome: "",
    nextListingType: "",
    grantActionRequired: "",
    feeType: "",
    feeAmount: "",
    feeTable: "",
    feeNote: "",
    invoiceFileName: "",
    claimedUnits: "",
    claimExpected: true,
    claimLodged: false,
    claimPaid: false,
    importSource: "",
    notes: "",
  };
}

export function createPlanner() {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    matterId: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    source: {
      type: "manual",
      provider: "",
      externalId: "",
    },
    client: {
      firstName: "",
      lastName: "",
      fullName: "",
      fileNumber: "",
      dateOfBirth: "",
    },
    matter: {
      matterType: "",
      court: "",
      location: "",
      appearanceType: "",
      nextAppearanceDate: "",
      currentAppearanceComplete: false,
      lawyer: "",
      counsel: "",
      summary: "",
      headCharge: "",
      isCustody: false,
    },
    aid: {
      aidType: "",
      aidTypeList: [],
      guideline: "",
      aidNumber: "",
      extensionNumber: "",
      effectiveDate: "",
      applicationStatus: "Aid not applied for",
      uploadedLetterName: "",
      custodyStatus: "",
      documentType: "",
      parsedAlerts: [],
      conflictFlags: [],
    },
    criminal: {
      pathwayId: "",
      pathwayLabel: "",
      feeTableRef: "",
      feeScheduleRef: "",
      appealCostsCertificateGranted: false,
      counselFeeScheme: "",
      notes: "",
    },
    application: {
      formCompleted: false,
      lodgedInAtlas: false,
      lodgedDate: "",
      decisionReceived: false,
      decisionDate: "",
      decisionResult: "",
    },
    funding: {
      aidApplied: false,
      grantInPlace: false,
      grantType: "",
      vlaReference: "",
      currentStageCovered: "",
      extensionRequested: false,
      extensionDecision: "",
      missingRequirements: [],
    },
    billing: {
      lastInvoiceDate: "",
      billableItems: [],
      holdItems: [],
      extensionItems: [],
      approvalItems: [],
      billingNotes: "",
    },
    finalisation: {
      matterFinalised: false,
      outcomeEnteredInAtlas: false,
      grantClosed: false,
      closureDate: "",
    },
    externalWork: [],
    appearanceClaims: [],
    timeline: [],
    tasks: [],
    folders: {
      "Funding Docs": [],
      "Correspondence": [],
      "Court Orders": [],
      "Medical/Specialist Reports": [],
      "BOE and Disclosure material": [],
      "File Notes": [],
    },
    guidance: {
      status: "missing_info",
      nextAction: "Complete the matter details to assess the matter.",
      reasons: [],
      warnings: [],
    },
    notes: "",
  };
}

export function normalizePlanner(input = {}) {
  const base = createPlanner();
  return {
    ...base,
    ...input,
    source: { ...base.source, ...(input.source || {}) },
    client: { ...base.client, ...(input.client || {}) },
    matter: { ...base.matter, ...(input.matter || {}) },
    aid: {
      ...base.aid,
      ...(input.aid || {}),
      aidTypeList: Array.isArray(input.aid?.aidTypeList) ? input.aid.aidTypeList : base.aid.aidTypeList,
      parsedAlerts: Array.isArray(input.aid?.parsedAlerts) ? input.aid.parsedAlerts : base.aid.parsedAlerts,
      conflictFlags: Array.isArray(input.aid?.conflictFlags) ? input.aid.conflictFlags : base.aid.conflictFlags,
    },
    criminal: { ...base.criminal, ...(input.criminal || {}) },
    application: { ...base.application, ...(input.application || {}) },
    funding: { ...base.funding, ...(input.funding || {}) },
    billing: { ...base.billing, ...(input.billing || {}) },
    finalisation: { ...base.finalisation, ...(input.finalisation || {}) },
    externalWork: Array.isArray(input.externalWork) ? input.externalWork : [],
    appearanceClaims: Array.isArray(input.appearanceClaims) ? input.appearanceClaims : [],
    timeline: Array.isArray(input.timeline) ? input.timeline : [],
    tasks: Array.isArray(input.tasks) ? input.tasks : [],
    folders: input.folders || {
      "Funding Docs": [],
      "Correspondence": [],
      "Court Orders": [],
      "Medical/Specialist Reports": [],
      "BOE and Disclosure material": [],
      "File Notes": [],
    },
    guidance: { ...base.guidance, ...(input.guidance || {}) },
    updatedAt: new Date().toISOString(),
  };
}
