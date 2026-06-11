export const matterTypes = [
  "Criminal",
  "Family Violence",
  "Youth Crime",
  "Child Protection",
  "Civil",
  "Mental Health",
  "Coroner's",
  "Other",
] as const;

export const itemStatuses = ["Met", "Not Met", "Other"] as const;
export const yesNoPartial = ["Yes", "No", "Partial"] as const;
export const yesNo = ["Yes", "No"] as const;

export const activityTypes = [
  "Client Contact",
  "SCC",
  "Court Appearance",
  "Conference",
  "Aid Application",
  "Aid Extension",
  "Grant Approval",
  "Claim Submitted",
  "Claim Paid",
  "Outcome Letter",
  "Authority Received",
  "Authority Sent",
  "Materials Requested",
  "Materials Received",
  "Counsel Briefed",
  "File Management",
  "Compliance",
  "Administrative",
  "Other",
] as const;

export const timelineStatuses = ["Complete", "Outstanding", "Follow Up Required"] as const;
export const actionPriorities = ["Low", "Medium", "High", "Critical"] as const;
export const actionStatuses = ["Open", "In Progress", "Completed"] as const;
export const auditOutcomes = [
  "Compliant",
  "Compliant - Minor Recommendations",
  "Further Review Required",
  "Non-Compliant",
] as const;

export const aidEligibilityItems = [
  ["meansTest", "Means Test"],
  ["meritTest", "Merit Test"],
  ["guidelineTest", "Guideline Test"],
  ["overallEligibility", "Overall Eligibility"],
] as const;

export const complianceChecklistItems = [
  "Conflict check has been completed",
  "Documents relevant to the grant of legal assistance are clearly identifiable",
  "Signed and dated application for legal assistance retained",
  "Information and documents establishing the funding guideline was met",
  "Information and documents establishing the merits test was met",
  "Means test supporting documents retained for client",
  "Means test supporting documents retained for partner (if applicable)",
  "File maintained in logical order (chronological)",
  "File notes are legible",
  "Client instructions documented at each stage of the matter",
  "Personal history and background information recorded",
  "Record of advice provided to the client",
  "Regular contact maintained with the client",
  "Progress reports provided to the client",
  "Evidence of supervision on file (where another lawyer was supervised)",
  "Final outcome letter retained",
  "Payments made under the grant supported by invoices",
  "Payments made under the grant supported by proof of matter",
  "Claims submitted supported by file material",
  "Outcome recorded and supported by file documentation",
  "All authorities signed and retained",
  "All appearance notes retained",
  "All conference notes retained",
  "All SCC notes retained",
  "All client contact notes retained",
  "All correspondence retained",
  "Grant approvals retained",
  "Claim receipts retained",
  "Counsel invoices retained (if applicable)",
  "Third-party disbursement invoices retained (if applicable)",
  "File outcome submitted and retained on file",
] as const;

export type ItemStatus = (typeof itemStatuses)[number] | "";

export interface StatusComment {
  status: ItemStatus;
  comments: string;
}

export interface AuditManagerData {
  matterInformation: {
    firmName: string;
    clientName: string;
    matterNumber: string;
    matterType: string;
    otherMatterType: string;
    reviewDate: string;
  };
  aidEligibility: {
    meansTest: StatusComment;
    meritTest: StatusComment;
    guidelineTest: StatusComment;
    overallEligibility: StatusComment;
  };
  informantsChargesMerit: Array<{
    id: string;
    informantAgency: string;
    briefMaterialOnFile: string;
    chargeType: string;
    meritAssessed: string;
    notesQuestions: string;
  }>;
  matterTimeline: Array<{
    id: string;
    date: string;
    matterProgress: string;
    activityType: string;
    status: string;
    notesActions: string;
    keyEvent: boolean;
  }>;
  fileComplianceChecklist: Array<{
    id: string;
    item: string;
    status: ItemStatus;
    comments: string;
  }>;
  actionPlan: Array<{
    id: string;
    priority: string;
    actionRequired: string;
    responsiblePerson: string;
    dueDate: string;
    status: string;
    completedDate: string;
  }>;
  auditConclusion: {
    outcome: string;
    findingsAndObservations: string;
    recommendations: string;
    followUpRequired: string;
  };
  signOff: {
    reviewerName: string;
    reviewDate: string;
    electronicSignature: string;
  };
}

export interface AuditManagerSummary {
  id: number;
  firmName: string;
  clientName: string;
  matterNumber: string;
  matterType: string;
  reviewDate: string;
  status: string;
  outcome: string;
  reviewerName: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
  data: AuditManagerData;
}

const rowId = () => Math.random().toString(36).slice(2, 10);

export function createEmptyAuditManagerData(): AuditManagerData {
  return {
    matterInformation: {
      firmName: "",
      clientName: "",
      matterNumber: "",
      matterType: "",
      otherMatterType: "",
      reviewDate: new Date().toISOString().slice(0, 10),
    },
    aidEligibility: {
      meansTest: { status: "", comments: "" },
      meritTest: { status: "", comments: "" },
      guidelineTest: { status: "", comments: "" },
      overallEligibility: { status: "", comments: "" },
    },
    informantsChargesMerit: [],
    matterTimeline: [],
    fileComplianceChecklist: complianceChecklistItems.map((item) => ({
      id: rowId(),
      item,
      status: "",
      comments: "",
    })),
    actionPlan: [],
    auditConclusion: {
      outcome: "",
      findingsAndObservations: "",
      recommendations: "",
      followUpRequired: "",
    },
    signOff: {
      reviewerName: "",
      reviewDate: new Date().toISOString().slice(0, 10),
      electronicSignature: "",
    },
  };
}

export function ensureAuditManagerData(data?: Partial<AuditManagerData> | null): AuditManagerData {
  const empty = createEmptyAuditManagerData();
  return {
    ...empty,
    ...(data || {}),
    matterInformation: { ...empty.matterInformation, ...(data?.matterInformation || {}) },
    aidEligibility: {
      meansTest: { ...empty.aidEligibility.meansTest, ...(data?.aidEligibility?.meansTest || {}) },
      meritTest: { ...empty.aidEligibility.meritTest, ...(data?.aidEligibility?.meritTest || {}) },
      guidelineTest: { ...empty.aidEligibility.guidelineTest, ...(data?.aidEligibility?.guidelineTest || {}) },
      overallEligibility: { ...empty.aidEligibility.overallEligibility, ...(data?.aidEligibility?.overallEligibility || {}) },
    },
    informantsChargesMerit: data?.informantsChargesMerit || empty.informantsChargesMerit,
    matterTimeline: data?.matterTimeline || empty.matterTimeline,
    fileComplianceChecklist: data?.fileComplianceChecklist?.length ? data.fileComplianceChecklist : empty.fileComplianceChecklist,
    actionPlan: data?.actionPlan || empty.actionPlan,
    auditConclusion: { ...empty.auditConclusion, ...(data?.auditConclusion || {}) },
    signOff: { ...empty.signOff, ...(data?.signOff || {}) },
  };
}

export function validateAudit(data: AuditManagerData, requireSignOff = false): string[] {
  const errors: string[] = [];
  if (requireSignOff) {
    if (!data.matterInformation.firmName.trim()) errors.push("Firm Name is required.");
    if (!data.matterInformation.clientName.trim()) errors.push("Client Name is required.");
    if (!data.matterInformation.matterNumber.trim()) errors.push("Matter Number is required.");
    if (!data.matterInformation.matterType) errors.push("Matter Type is required.");
    if (!data.matterInformation.reviewDate) errors.push("Review Date is required.");
    if (!data.auditConclusion.outcome) errors.push("Audit Conclusion outcome is required.");
    if (!data.signOff.reviewerName.trim()) errors.push("Reviewer Name is required.");
    if (!data.signOff.reviewDate) errors.push("Sign Off Review Date is required.");
    if (!data.signOff.electronicSignature.trim()) errors.push("Electronic Signature is required.");
  }
  return errors;
}
