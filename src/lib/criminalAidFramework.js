export const CRIMINAL_FRAMEWORK_SOURCES = {
  feeSchedule1: {
    label: "Fee Schedule 1",
    url: "https://www.handbook.vla.vic.gov.au/fee-schedule-1-lump-sum-and-other-fees-payable-criminal-law-matters",
  },
  feeSchedule1A: {
    label: "Fee Schedule 1A",
    url: "https://www.handbook.vla.vic.gov.au/fee-schedule-1a-fees-payable-criminal-matters-if-appeal-costs-certificate-has-been-granted",
  },
  feeSchedule4: {
    label: "Fee Schedule 4",
    url: "https://www.handbook.vla.vic.gov.au/fee-schedule-4-counsels-fees-criminal-trials",
  },
};

export const CRIMINAL_AID_PATHWAYS = [
  {
    id: "summary_crime",
    label: "Summary criminal proceedings",
    feeTableRef: "Table A",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["Magistrates' Court", "Children's Court"],
    appearanceFamilies: ["Mention", "Contest Mention", "Plea", "Sentence", "Conference"],
    notes: "Use for summary criminal proceedings under the lump sum criminal schedule.",
  },
  {
    id: "bail_applications",
    label: "Bail applications",
    feeTableRef: "Tables B, C and D",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["Children's Court", "Magistrates' Court", "County Court", "Supreme Court"],
    appearanceFamilies: ["Bail Application"],
    notes: "Children's and Magistrates' Court bail sits in Table B, County Court in Table C, Supreme Court in Table D.",
  },
  {
    id: "indictable_magistrates_stage",
    label: "Indictable crime - Magistrates' or Children's Court stage",
    feeTableRef: "Table E",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["Magistrates' Court", "Children's Court"],
    appearanceFamilies: ["Committal", "Mention", "Conference"],
    notes: "Use for the committal or lower-court stage of indictable crime matters.",
  },
  {
    id: "indictable_higher_court_stage",
    label: "Indictable crime - County or Supreme Court stage",
    feeTableRef: "Table F",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["County Court", "Supreme Court"],
    appearanceFamilies: ["Plea", "Trial", "Sentence", "Conference"],
    notes: "Use for higher-court indictable matters before adding counsel trial fees.",
  },
  {
    id: "serious_indictable_childrens",
    label: "Serious indictable crime - Children's Court",
    feeTableRef: "Table F(i)",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["Children's Court"],
    appearanceFamilies: ["Plea", "Trial", "Sentence", "Conference"],
    notes: "Use for serious indictable crime matters that remain in the Children's Court.",
  },
  {
    id: "county_sentence_appeal",
    label: "County Court sentence appeals",
    feeTableRef: "Table G",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["County Court"],
    appearanceFamilies: ["Appeal"],
    notes: "Use for sentence appeals in the County Court.",
  },
  {
    id: "county_conviction_sentence_appeal",
    label: "County Court appeals against sentence and conviction",
    feeTableRef: "Table H",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["County Court"],
    appearanceFamilies: ["Appeal"],
    notes: "Use for conviction appeals and combined conviction and sentence appeals in the County Court.",
  },
  {
    id: "breach_matters",
    label: "Supreme and County Court breach matters",
    feeTableRef: "Table J",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["County Court", "Supreme Court"],
    appearanceFamilies: ["Mention", "Hearing"],
    notes: "Use for breach proceedings in the Supreme or County Court.",
  },
  {
    id: "court_of_appeal",
    label: "Court of Appeal matters",
    feeTableRef: "Tables K, K(i) and K(ii)",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["Court of Appeal"],
    appearanceFamilies: ["Appeal", "Interlocutory Appeal"],
    notes: "Covers standard appeals, DPP appeals and interlocutory appeals in the Court of Appeal.",
  },
  {
    id: "high_court_appeal",
    label: "High Court criminal appeals",
    feeTableRef: "Table L",
    feeScheduleRef: "Fee Schedule 1",
    scheduleKey: "feeSchedule1",
    courts: ["High Court"],
    appearanceFamilies: ["Appeal"],
    notes: "Use for criminal appeals that proceed to the High Court.",
  },
  {
    id: "appeal_costs_certificate",
    label: "Appeal Costs Certificate matters",
    feeTableRef: "Table BBB",
    feeScheduleRef: "Fee Schedule 1A",
    scheduleKey: "feeSchedule1A",
    courts: ["Appeal jurisdictions"],
    appearanceFamilies: ["Appeal", "Retrial", "Adjournment"],
    notes: "Use when an Appeal Costs Certificate has been granted or equivalent Commonwealth prosecution rules apply.",
  },
  {
    id: "counsel_criminal_trials",
    label: "Counsel fees in criminal trials",
    feeTableRef: "Tables ZZ, RR and M",
    feeScheduleRef: "Fee Schedule 4",
    scheduleKey: "feeSchedule4",
    courts: ["County Court", "Supreme Court", "Circuit matters"],
    appearanceFamilies: ["Trial", "Conference", "Preparation"],
    notes: "Use when counsel fee structures in criminal trials need to be tracked alongside the solicitor grant pathway.",
  },
  {
    id: "mental_impairment_or_soa",
    label: "Special criminal schemes",
    feeTableRef: "Tables T and Z",
    feeScheduleRef: "Fee Schedule 4",
    scheduleKey: "feeSchedule4",
    courts: ["Relevant criminal courts"],
    appearanceFamilies: ["Hearing", "Review", "Application"],
    notes: "Use for Crimes (Mental Impairment and Unfitness to be Tried) Act matters and Serious Offenders Act proceedings.",
  },
];

export function getCriminalAidPathway(pathwayId) {
  return CRIMINAL_AID_PATHWAYS.find((item) => item.id === pathwayId) || null;
}

function includesAny(value, needles) {
  const normalized = String(value || "").toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

export function inferCriminalAidPathway({ matterType, court, appearanceType, appealCostsCertificateGranted = false }) {
  if (matterType !== "Criminal") {
    return null;
  }

  if (appealCostsCertificateGranted) {
    return getCriminalAidPathway("appeal_costs_certificate");
  }

  if (court === "Court of Appeal") {
    return getCriminalAidPathway("court_of_appeal");
  }

  if (court === "High Court") {
    return getCriminalAidPathway("high_court_appeal");
  }

  if (includesAny(appearanceType, ["bail"])) {
    return getCriminalAidPathway("bail_applications");
  }

  if (includesAny(appearanceType, ["cmia", "soa"])) {
    return getCriminalAidPathway("mental_impairment_or_soa");
  }

  if (court === "County Court" || court === "Supreme Court") {
    if (includesAny(appearanceType, ["appeal"])) {
      return getCriminalAidPathway("county_sentence_appeal");
    }

    if (
      includesAny(appearanceType, [
        "directions",
        "callover",
        "case conference",
        "plea",
        "trial",
        "sentence",
        "sentence indication",
        "special hearing",
        "mention",
      ])
    ) {
      return getCriminalAidPathway("indictable_higher_court_stage");
    }
  }

  if (court === "Magistrates' Court" || court === "Children's Court") {
    if (
      includesAny(appearanceType, [
        "committal",
        "summary jurisdiction",
        "case conference",
      ])
    ) {
      return getCriminalAidPathway("indictable_magistrates_stage");
    }

    if (
      includesAny(appearanceType, [
        "mention",
        "further mention",
        "contest mention",
        "contest",
        "hearing",
        "plea",
        "sentence",
        "arc review",
        "sentence indication",
      ])
    ) {
      return getCriminalAidPathway("summary_crime");
    }
  }

  return null;
}
