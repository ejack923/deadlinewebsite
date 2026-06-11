import { useState } from "react";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, RotateCcw,
  Search, DollarSign, ExternalLink, ChevronDown, BookOpen, Scale
} from "lucide-react";
import AidChatBubble from "@/components/aid/AidChatBubble";

// ═══════════════════════════════════════════════════════════════════════════
// AID FINDER DATA
// ═══════════════════════════════════════════════════════════════════════════

const MATTER_TYPES = [
  { id: "g1_1", label: "Not guilty plea – Magistrates' Court", sub: "Guideline 1.1 — contested hearing, client pleads not guilty" },
  { id: "g1_2", label: "Guilty plea – Magistrates' Court", sub: "Guideline 1.2 — no reasonable prospect of acquittal, imprisonment likely" },
  { id: "g2", label: "Traffic offences – Magistrates' Court", sub: "Guideline 2 — traffic offence charges" },
  { id: "g1_3", label: "Assessment and Referral Court (ARC)", sub: "Guideline 1.3 — ARC List matters" },
  { id: "g_social", label: "Social security prosecution", sub: "Guidelines 1.4 & 1.5 — Commonwealth social security offences" },
  { id: "g6", label: "Bail application", sub: "Guideline 6 — bail in Children's, Magistrates', County or Supreme Court" },
  { id: "g3", label: "Committal proceedings", sub: "Guidelines 3.1 & 3.2 — committal in Magistrates' Court" },
  { id: "g4", label: "Trial – County or Supreme Court", sub: "Guideline 4 — indictable trial" },
  { id: "g4_1", label: "Plea – County or Supreme Court", sub: "Guideline 4.1 — guilty plea in County or Supreme Court" },
  { id: "g5_1", label: "Children's Court (criminal)", sub: "Guideline 5.1 — Criminal Division of the Children's Court" },
  { id: "g7_1", label: "Criminal appeal – County Court", sub: "Guideline 7.1 — appeal against summary conviction/sentence" },
  { id: "g7_coa", label: "Criminal appeal – Court of Appeal / High Court", sub: "Guidelines 7.2–7.8 — indictable appeals" },
  { id: "g9", label: "Crimes Mental Impairment Act hearing", sub: "Guideline 9 — fitness/mental impairment proceedings" },
  { id: "g10", label: "Serious Offenders Act 2018", sub: "Guideline 10 — post-sentence supervision, detention or community safety orders" },
  { id: "g11", label: "Breach proceedings – County/Supreme Court", sub: "Guideline 11 — breach of certain orders in County or Supreme Court" },
  { id: "other", label: "Other / unsure", sub: "Special circumstances, non-criminal, or matters outside the guidelines" },
];

const BAIL_COURTS = [
  { id: "bail_mag", label: "Magistrates' Court or Children's Court", sub: "SGP — simplified grants process" },
  { id: "bail_county", label: "County Court", sub: "Table C fees" },
  { id: "bail_supreme", label: "Supreme Court", sub: "Prior approval may be required" },
];

const COMMITTAL_TYPES = [
  { id: "c3_1", label: "Homicide, consent or identification issue", sub: "Guideline 3.1 — homicide (incl. culpable driving), real issue of consent or identification" },
  { id: "c3_2", label: "Other cases", sub: "Guideline 3.2 — other committal proceedings" },
];

const TRIAL_COURTS = [
  { id: "trial_county", label: "County Court trial", sub: "Guideline 4 — County Court" },
  { id: "trial_supreme", label: "Supreme Court trial", sub: "Guideline 4 — Supreme Court" },
];

const COA_TYPES = [
  { id: "coa_sentence", label: "Appeal against sentence only", sub: "Guidelines 7.4 & 7.5" },
  { id: "coa_conviction", label: "Appeal against conviction (or conviction & sentence)", sub: "Guidelines 7.6 & 7.7" },
  { id: "coa_interlocutory", label: "Interlocutory appeal", sub: "Guideline 7.2" },
  { id: "coa_high", label: "Appeal to the High Court", sub: "Guideline 7.3" },
];

function getResult(state) {
  const { matterType, bailCourt, committralType, trialCourt, coaType } = state;

  if (matterType === "g1_1") return {
    status: "eligible",
    title: "Guideline 1.1 – Not guilty plea in the Magistrates' Court",
    description: "VLA may grant aid where the person pleads not guilty and has a reasonable prospect of acquittal on one or more charges, and one of the additional criteria applies (imprisonment likely, Aboriginal/Torres Strait Islander, misidentified family violence aggressor, or unjustified use of power by authority).",
    grant: "Summary Crime Grant — Not Guilty Plea (Guideline 1.1)",
    costs: "Fixed fee schedule — Table A. Covers preparation, mentions, and the contested hearing. Claim at completion via SGP (simplified grants process). No prior approval required for standard matters.",
    notes: [
      "Client must have a reasonable prospect of acquittal on at least one charge.",
      "At least one of the following must also apply: conviction likely to result in immediate imprisonment; client is Aboriginal/Torres Strait Islander; client is a woman/LGBTIQ+ person charged with family violence offences as a result of misidentification as the predominant aggressor; or an unjustified/disproportionate use of power by police led to the charge(s).",
      "Retain on file: charge copies, basis of defence, prior convictions, evidence supporting defence, lawyer's merits assessment, proof of means.",
      "Consider completing a summary crime worksheet and proof of means worksheet.",
    ],
    handbook: "Guideline 1.1 — handbook.vla.vic.gov.au/guideline-11-not-guilty-plea-magistrates-court"
  };

  if (matterType === "g1_2") return {
    status: "eligible",
    title: "Guideline 1.2 – Guilty plea in the Magistrates' Court",
    description: "VLA may grant aid where there is no reasonable prospect of acquittal (or insufficient information to support one), and a conviction is likely to result in a term of immediate imprisonment.",
    grant: "Summary Crime Grant — Guilty Plea (Guideline 1.2)",
    costs: "Fixed fee schedule — Table A. Claim at completion via SGP.",
    notes: [
      "Both criteria must be met: (1) no reasonable prospect of acquittal, and (2) immediate imprisonment likely on conviction.",
      "Breach of a previous court order qualifies if the breach is likely to result in immediate imprisonment (not typically a CCO breach).",
      "VLA will not normally grant aid for variation of a court order — must be submitted via standard grants process.",
      "Retain on file: charge copies, prior convictions, lawyer's penalty assessment, strengths/weaknesses of defence, proof of means.",
    ],
    handbook: "Guideline 1.2 — handbook.vla.vic.gov.au/guideline-12-guilty-plea-magistrates-court"
  };

  if (matterType === "g2") return {
    status: "eligible",
    title: "Guideline 2 – Traffic offences in the Magistrates' Court",
    description: "VLA may grant aid for traffic offence charges in the Magistrates' Court where the criteria under Guideline 2 are met (typically immediate loss of licence or imprisonment likely).",
    grant: "Summary Crime Grant — Traffic (Guideline 2)",
    costs: "Fixed fee schedule — Table A. Claim at completion via SGP.",
    notes: [
      "Check the specific criteria under Guideline 2 — see handbook.vla.vic.gov.au/guideline-2-traffic-offence-charges-magistrates-court.",
      "Traffic prosecution guideline also applies where a traffic offence triggers a breach of a previous court order.",
      "Retain on file: charge copies, prior convictions, lawyer's assessment of likely penalty.",
    ],
    handbook: "Guideline 2 — handbook.vla.vic.gov.au/guideline-2-traffic-offence-charges-magistrates-court"
  };

  if (matterType === "g1_3") return {
    status: "eligible-check",
    title: "Guideline 1.3 – Assessment and Referral Court (ARC) List",
    description: "VLA may grant aid for criminal charges being heard in the Assessment and Referral Court List in the Magistrates' Court.",
    grant: "Summary Crime Grant — ARC List (Guideline 1.3)",
    costs: "Fixed fee schedule — Table A with ARC-specific items. Extensions of aid are required for each ARC appearance.",
    notes: [
      "An extension of aid must be submitted prior to each ARC eligibility hearing.",
      "When submitting the extension, ensure 'Mag Court - ARC' is selected from the drop-down 'Which court/tribunal do you have to go to?' on the court hearings page.",
      "ARC Review Hearings, ISP Ratification hearings, and Eligibility hearings each have separate fee items under Table A.",
    ],
    handbook: "Guideline 1.3 — handbook.vla.vic.gov.au/guideline-13-assessment-and-referral-court-list-matters"
  };

  if (matterType === "g_social") return {
    status: "eligible-check",
    title: "Guidelines 1.4 & 1.5 – Social security prosecutions",
    description: "VLA may grant aid for social security prosecutions under Commonwealth law where Guidelines 1.4 and/or 1.5 are met.",
    grant: "Summary/Commonwealth Crime Grant — Social Security (Guidelines 1.4 & 1.5)",
    costs: "Fixed fee schedule for Magistrates' Court. Claim at completion via SGP for matters within guidelines.",
    notes: [
      "Review the specific criteria under Guidelines 1.4 and 1.5 — see handbook.vla.vic.gov.au/guidelines-14-and-15-social-security-prosecutions.",
      "Commonwealth criminal law guidelines mirror state guidelines.",
      "Retain on file: charge copies, prior convictions, lawyer's assessment.",
    ],
    handbook: "Guidelines 1.4 & 1.5 — handbook.vla.vic.gov.au/guidelines-14-and-15-social-security-prosecutions"
  };

  if (matterType === "g6") {
    if (bailCourt === "bail_mag") return {
      status: "eligible",
      title: "Guideline 6 – Bail application (Magistrates' or Children's Court)",
      description: "VLA will generally grant aid for bail applications in the Magistrates' Court or Children's Court where there is a reasonable basis for the application.",
      grant: "Bail Grant — Magistrates'/Children's Court (Guideline 6)",
      costs: "Fixed fee schedule — Table B. Includes contested bail preparation, first remand hearing, and bail appearance fees. Claim at completion via SGP.",
      notes: [
        "VLA considers there is always a reasonable basis for a bail application where the applicant is a child and/or an Aboriginal/Torres Strait Islander person.",
        "Consider s3AAAA and s3AAA Bail Act — including whether time on remand would exceed likely sentence.",
        "Apply s3A Bail Act for Aboriginal clients and s3B for children.",
        "A First Remand Hearing fee is available where no bail application or plea takes place on the first court date.",
        "Bail variations and revocations must be submitted via the standard grants process.",
        "Retain on file: charge copies, grounds for application, merits assessment, prior convictions, proof of means.",
      ],
      handbook: "Guideline 6 — handbook.vla.vic.gov.au/guideline-6-bail-applications-childrens-magistrates-county-and-supreme-courts"
    };
    if (bailCourt === "bail_county") return {
      status: "eligible",
      title: "Guideline 6 – Bail application (County Court)",
      description: "VLA will generally grant aid for County Court bail applications where there is a reasonable basis for the application.",
      grant: "Bail Grant — County Court (Guideline 6)",
      costs: "Fixed fee schedule — Table C. Covers preparation, appearance, and mention/adjournment fees.",
      notes: [
        "See Table C for County Court bail fee items.",
        "Submit via standard grants assessment process.",
        "Retain on file: charge copies, grounds, merits assessment, prior convictions, proof of means.",
      ],
      handbook: "Guideline 6 — handbook.vla.vic.gov.au/guideline-6-bail-applications-childrens-magistrates-county-and-supreme-courts"
    };
    if (bailCourt === "bail_supreme") return {
      status: "eligible-check",
      title: "Guideline 6 – Bail application (Supreme Court)",
      description: "VLA will generally grant aid for Supreme Court bail applications where there is a reasonable basis. Prior approval may be required.",
      grant: "Bail Grant — Supreme Court (Guideline 6)",
      costs: "Fee schedule for Supreme Court bail — check current VLA fee schedule. Prior approval may be required.",
      notes: [
        "Submit via standard grants assessment process.",
        "Retain on file: charge copies, grounds, merits assessment, prior convictions, proof of means.",
        "Consider whether a County Court bail application has already been made and refused.",
      ],
      handbook: "Guideline 6 — handbook.vla.vic.gov.au/guideline-6-bail-applications-childrens-magistrates-county-and-supreme-courts"
    };
  }

  if (matterType === "g3") {
    if (committralType === "c3_1") return {
      status: "eligible",
      title: "Guideline 3.1 – Committal proceedings (homicide, consent or identification)",
      description: "VLA may grant aid for committal proceedings where the person is charged with homicide (including culpable driving and attempted murder), or where there is a real issue of consent or identification.",
      grant: "Committal Grant — Guideline 3.1",
      costs: "Fixed fee schedule — Table E. Covers committal preparation, mentions, and contested committal hearing. Separate grant required for subsequent trial.",
      notes: [
        "If the charge could usually be heard in the Magistrates' Court, there must be compelling reasons to grant aid for committal proceedings.",
        "Cross-examination of witnesses at committal requires prior VLA approval.",
        "A separate indictable trial grant will be needed if the matter is committed for trial.",
        "See the Major Criminal Cases Framework for complex homicide matters.",
      ],
      handbook: "Guideline 3.1 — handbook.vla.vic.gov.au/guideline-31-committal-proceedings-involving-homicide-consent-or-identification"
    };
    if (committralType === "c3_2") return {
      status: "eligible",
      title: "Guideline 3.2 – Committal proceedings (other cases)",
      description: "VLA may grant aid for committal proceedings in cases other than homicide, consent or identification, where Guideline 3.2 criteria are met.",
      grant: "Committal Grant — Guideline 3.2",
      costs: "Fixed fee schedule — Table E. Check current fee schedule for committal-stage items.",
      notes: [
        "Check the specific criteria under Guideline 3.2 — see handbook.vla.vic.gov.au/guideline-32-committal-proceedings-other-cases.",
        "A separate indictable trial grant will be needed if the matter is committed for trial.",
        "Cross-examination of witnesses at committal requires prior VLA approval.",
      ],
      handbook: "Guideline 3.2 — handbook.vla.vic.gov.au/guideline-32-committal-proceedings-other-cases"
    };
  }

  if (matterType === "g4") {
    const isSupreme = trialCourt === "trial_supreme";
    return {
      status: "eligible-check",
      title: `Guideline 4 – Trial in the ${isSupreme ? "Supreme" : "County"} Court`,
      description: `VLA may grant aid for a criminal trial in the ${isSupreme ? "Supreme" : "County"} Court where: the charges cannot be heard in the Magistrates' Court (or there are compelling reasons they should not be), and it is desirable in the interests of justice to provide aid.`,
      grant: `Indictable Crime Grant — ${isSupreme ? "Supreme" : "County"} Court Trial (Guideline 4)`,
      costs: `Fixed fee schedule — Table F (${isSupreme ? "Supreme" : "County"} Court rates). Trial preparation, directions, and daily appearance fees apply. Prior VLA approval required before trial commences.`,
      notes: [
        "Prior approval from VLA is required before commencing trial preparation.",
        "Counsel must be briefed from VLA's Criminal Trial Preferred Barrister List (exceptions require advance VLA approval).",
        "Senior Counsel may be approved for complex trials — brief fee per Table M.",
        "Upon conviction, counsel must provide written advice on appeal merits within 7 days of sentence.",
        `Instructing/co-counsel fees are payable under VLA's instructing guideline — check Table F for ${isSupreme ? "Supreme" : "County"} Court rates.`,
      ],
      handbook: "Guideline 4 — handbook.vla.vic.gov.au/guideline-4-trials-county-or-supreme-courts"
    };
  }

  if (matterType === "g4_1") return {
    status: "eligible",
    title: "Guideline 4.1 – Plea in the County or Supreme Court",
    description: "VLA may grant aid for a guilty plea in the County Court or Supreme Court under Guideline 4.1.",
    grant: "Indictable Crime Grant — Plea (Guideline 4.1)",
    costs: "Fixed fee schedule — Table F. Covers plea preparation and appearance fees. Claim at completion via SGP for standard pleas.",
    notes: [
      "Counsel is required to provide written advice on appeal merits within 7 days of sentence (fee under Table F).",
      "Submit via ATLAS under the simplified grants assessment process.",
    ],
    handbook: "Guideline 4.1 — handbook.vla.vic.gov.au/guideline-41-county-court-and-supreme-court-pleas"
  };

  if (matterType === "g5_1") return {
    status: "eligible",
    title: "Guideline 5.1 – Children's Court (Criminal Division)",
    description: "VLA will generally grant aid to a child in the Criminal Division of the Children's Court where a finding of guilt is likely to result in youth detention or youth justice supervision, or the child has a reasonable prospect of obtaining diversion.",
    grant: "Children's Criminal Grant (Guideline 5.1)",
    costs: "Fixed fee schedule for Children's Court. Claim at completion via SGP.",
    notes: [
      "Either criterion suffices: (1) likely to result in youth detention or youth justice supervision, OR (2) reasonable prospect of diversion.",
      "Includes serious indictable crimes by children (e.g. rape) — not just Magistrates' Court charges.",
      "Breach of court order qualifies if likely to result in youth detention or supervision.",
      "The State's special circumstances guideline does NOT apply to Children's Court matters.",
      "Retain on file: charge copies, prior convictions, lawyer's penalty assessment.",
    ],
    handbook: "Guideline 5.1 — handbook.vla.vic.gov.au/guideline-51-proceedings-criminal-division-childrens-court"
  };

  if (matterType === "g7_1") return {
    status: "eligible",
    title: "Guideline 7.1 – Criminal appeal to the County Court",
    description: "VLA may grant aid for a criminal appeal to the County Court against a summary conviction or sentence from the Magistrates' Court.",
    grant: "Criminal Appeal Grant — County Court (Guideline 7.1)",
    costs: "Fixed fee schedule — Table G (sentence appeals) or Table H (conviction & sentence appeals). Claim at completion via SGP for standard appeals.",
    notes: [
      "Grounds of appeal must be identified before applying.",
      "Check time limits — notice of appeal must be filed within 28 days of sentence (extensions possible).",
      "Consider whether an Appeal Costs Certificate should be applied for.",
      "VLA may limit the number of days for which a grant is made in County Court appeals.",
    ],
    handbook: "Guideline 7.1 — handbook.vla.vic.gov.au/guideline-71-criminal-appeals-county-court"
  };

  if (matterType === "g7_coa") {
    if (coaType === "coa_sentence") return {
      status: "eligible-check",
      title: "Guidelines 7.4 & 7.5 – Appeal against sentence (Court of Appeal)",
      description: "VLA may grant aid for leave to appeal (Guideline 7.4) and an appeal against sentence (Guideline 7.5) in the Court of Appeal.",
      grant: "Court of Appeal Grant — Sentence Appeal (Guidelines 7.4 & 7.5)",
      costs: "Fixed fee schedule — Table K. Includes preparation of grounds, written case, and appearance fees.",
      notes: [
        "Grounds of appeal must be identified and supported — VLA may require counsel's advice on prospects.",
        "Transcript costs are claimable separately.",
        "Applications for leave to appeal are within the grant.",
        "Brief fee under Table K covers preparation and all appearances for a sentence appeal.",
      ],
      handbook: "Guidelines 7.4 & 7.5 — handbook.vla.vic.gov.au/guideline-74-leave-appeal-against-sentence-court-appeal"
    };
    if (coaType === "coa_conviction") return {
      status: "eligible-check",
      title: "Guidelines 7.6 & 7.7 – Appeal against conviction (Court of Appeal)",
      description: "VLA may grant aid for leave to appeal (Guideline 7.6) and an appeal against conviction or conviction and sentence (Guideline 7.7) in the Court of Appeal.",
      grant: "Court of Appeal Grant — Conviction Appeal (Guidelines 7.6 & 7.7)",
      costs: "Fixed fee schedule — Table K. Higher fees apply for conviction appeals versus sentence-only appeals.",
      notes: [
        "VLA may require a written merits opinion from counsel before granting.",
        "Grounds of appeal and written case fees are higher for conviction matters — see Table K.",
        "Transcript of the trial is usually required — claimable.",
        "Election to renew leave to appeal is covered under Guideline 7.8.",
      ],
      handbook: "Guidelines 7.6 & 7.7 — handbook.vla.vic.gov.au/guideline-76-leave-appeal-against-convictionconviction-and-sentence-court-appeal"
    };
    if (coaType === "coa_interlocutory") return {
      status: "eligible-check",
      title: "Guideline 7.2 – Interlocutory appeal to the Court of Appeal",
      description: "VLA may grant aid for interlocutory appeals to the Court of Appeal under Guideline 7.2.",
      grant: "Court of Appeal Grant — Interlocutory Appeal (Guideline 7.2)",
      costs: "Fees under Table K. Prior approval likely required — contact VLA Grants.",
      notes: [
        "Interlocutory appeals are assessed individually — contact VLA Grants before proceeding.",
      ],
      handbook: "Guideline 7.2 — handbook.vla.vic.gov.au/guideline-72-interlocutory-appeals-court-appeal"
    };
    if (coaType === "coa_high") return {
      status: "eligible-check",
      title: "Guideline 7.3 – Appeal to the High Court",
      description: "VLA may grant aid for criminal appeals to the High Court under Guideline 7.3.",
      grant: "High Court Criminal Appeal Grant (Guideline 7.3)",
      costs: "Assessed individually. Prior approval required. Contact VLA Grants before commencing.",
      notes: [
        "High Court appeals are assessed case by case — prior approval is essential.",
        "VLA will typically require senior counsel's written advice on prospects.",
      ],
      handbook: "Guideline 7.3 — handbook.vla.vic.gov.au/guideline-73-appeals-high-court"
    };
  }

  if (matterType === "g9") return {
    status: "eligible-check",
    title: "Guideline 9 – Crimes Mental Impairment Act hearings",
    description: "VLA may grant aid for hearings under the Crimes (Mental Impairment and Unfitness to be Tried) Act 1997, including fitness hearings and special hearings.",
    grant: "Criminal Grant — Mental Impairment (Guideline 9)",
    costs: "Fees for special hearings are in Table F. Prior approval is typically required for extended hearings.",
    notes: [
      "Covers fitness hearings, special hearings, and supervision order reviews.",
      "Must be submitted via the standard grants assessment process.",
    ],
    handbook: "Guideline 9 — handbook.vla.vic.gov.au/guideline-9-hearings-under-crimes-mental-impairment-and-unfitness-be-tried-act"
  };

  if (matterType === "g10") return {
    status: "eligible-check",
    title: "Guideline 10 – Serious Offenders Act 2018",
    description: "VLA may grant aid for applications under the Serious Offenders Act 2018, including post-sentence supervision and detention orders and community safety orders.",
    grant: "Criminal Grant — Serious Offenders Act (Guideline 10)",
    costs: "Assessed individually — prior approval required. Contact VLA Grants.",
    notes: [
      "Covers post-sentence supervision orders, detention orders, and community safety orders.",
      "Must be submitted via the standard grants assessment process.",
    ],
    handbook: "Guideline 10 — handbook.vla.vic.gov.au/guideline-10-post-sentence-supervision-detention-orders-community-safety-orders"
  };

  if (matterType === "g11") return {
    status: "eligible-check",
    title: "Guideline 11 – Supreme and County Court breach proceedings",
    description: "VLA may grant aid for proceedings in the County or Supreme Court for breach of certain orders under Guideline 11.",
    grant: "Criminal Grant — Breach Proceedings (Guideline 11)",
    costs: "Assessed individually — check applicable fee table and whether prior approval is required.",
    notes: [
      "Check the specific orders and criteria under Guideline 11 — see handbook.vla.vic.gov.au/guideline-11-supreme-and-county-court-breach-proceedings.",
      "Must be submitted via the standard grants assessment process.",
    ],
    handbook: "Guideline 11 — handbook.vla.vic.gov.au/guideline-11-supreme-and-county-court-breach-proceedings"
  };

  if (matterType === "other") return {
    status: "other",
    title: "Outside standard guidelines — consider special circumstances",
    description: "If the matter falls outside the criminal law guidelines, VLA may still grant aid under special circumstances.",
    grant: null,
    costs: null,
    notes: [
      "Special circumstances include: person is under 18, has a reading/writing difficulty, has an intellectual disability, or has a serious mental health issue receiving services from a designated mental health service.",
      "Cannot apply to traffic matters in the Magistrates' Court.",
      "Use the AI Advisor (bottom right) for family law, FVIO, civil, or other non-criminal matters.",
      "See handbook.vla.vic.gov.au/15-special-circumstances for full criteria.",
    ],
    handbook: "Special circumstances — handbook.vla.vic.gov.au/15-special-circumstances"
  };

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// FEE SCHEDULE DATA
// ═══════════════════════════════════════════════════════════════════════════

const FEE_CATEGORIES = [
  {
    category: "Table A – Summary Criminal Proceedings",
    sub: "Magistrates' Court & Children's Court",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-600",
    url: "https://www.handbook.vla.vic.gov.au/table-fees-summary-criminal-proceedings",
    items: [
      { type: "Preparation – general lump sum", primaryFee: 484, unit: "per matter", notes: "Covers perusal of the brief, taking instructions, summary case conference, organising witnesses, obtaining material, briefing counsel. Paid once per matter.", multiRows: [{ label: "Single accused", fee: 484 }, { label: "Two accused", fee: 726 }, { label: "Three or more accused", fee: 966 }] },
      { type: "Preparation – urgent matter", primaryFee: 277, unit: "per matter", notes: "Applies where the request for aid is made no earlier than the day immediately preceding the substantive hearing, or where the lawyer is in receipt of an urgent grant.", multiRows: [{ label: "Single accused", fee: 277 }, { label: "Two accused", fee: 414 }, { label: "Three or more accused", fee: 552 }] },
      { type: "Preparation – consolidated", primaryFee: 579, unit: "per matter", notes: "Where two or more briefs fall within guidelines and are consolidated and heard together. A specific grant for consolidation is required.", multiRows: [{ label: "Single accused", fee: 579 }, { label: "Two accused", fee: 868 }, { label: "Three or more accused", fee: 1158 }] },
      { type: "Contest hearing appearance", primaryFee: 1099, unit: "per hearing", notes: "Payable whether or not the matter proceeds as a contest on the day.", extension: "Extension required if a client has a consolidation grant in place and one matter goes off to contest — an extension must be sought to convert the grant to a contest grant for that matter. If a client has multiple contests listed, each contest attracts its own separate grant of aid.", multiRows: [{ label: "Single accused", fee: 1099 }, { label: "Two accused", fee: 1648 }, { label: "Three or more accused", fee: 2196 }] },
      { type: "Daily appearance fee", primaryFee: 484, unit: "per day", notes: "Standard daily appearance fee for plea or hearing day.", multiRows: [{ label: "Single accused", fee: 484 }, { label: "Two accused", fee: 726 }, { label: "Three or more accused", fee: 966 }] },
      { type: "Appearance on sentence or adjournment", primaryFee: 318, unit: "per appearance", notes: "For appearances on sentence or adjournment listings.", multiRows: [{ label: "Single accused", fee: 318 }, { label: "Two accused", fee: 476 }, { label: "Three or more accused", fee: 636 }] },
      { type: "Contest mention", primaryFee: 332, unit: "per necessary appearance", notes: "VLA will pay if the accused had a reasonable prospect of acquittal on all or some charges and would have qualified for a grant. Only one contest mention fee payable on same day for same accused.", multiRows: [{ label: "Single accused", fee: 332 }, { label: "Two accused", fee: 498 }, { label: "Three or more accused", fee: 663 }] },
      { type: "Consolidated contest mention", primaryFee: 581, unit: "per necessary appearance", notes: "Where there is more than one contest mention listed that meets the contest mention guideline.", multiRows: [{ label: "Single accused", fee: 581 }, { label: "Two accused", fee: 746 }, { label: "Three or more accused", fee: 912 }] },
      { type: "Jail conference", primaryFee: 185, unit: "per conference", notes: "One necessary jail conference (including by video). Only payable if the lawyer who attends also conducts the substantive hearing, and if not held in court or police cells on the day of the hearing. Only one jail conference fee is available on a grant." },
      { type: "Transcribing taped record of interview", primaryFee: 99, unit: "per tape", notes: "Payable where transcription is necessary." },
      { type: "Group conference – within work hours (Children's Court)", primaryFee: 464, unit: "per conference", multiRows: [{ label: "Single accused", fee: 464 }, { label: "Two accused", fee: 696 }, { label: "Three or more accused", fee: 927 }] },
      { type: "Group conference – outside work hours (Children's Court)", primaryFee: 594, unit: "per conference", multiRows: [{ label: "Single accused", fee: 594 }, { label: "Two accused", fee: 890 }, { label: "Three or more accused", fee: 1188 }] },
      { type: "CISP / Drug Court mention", primaryFee: 185, unit: "per attendance", notes: "Court Integrated Services Program or Drug Court mention. One necessary attendance payable where there is a prior indication the accused is not complying and the court is likely to take them off the program." },
      { type: "Youth Control Order – planning meeting (Children's Court)", primaryFee: 358, unit: "per meeting", notes: "Youth Control Order planning meeting. Children's Court only. Single accused only." },
      { type: "Youth Control Order – reporting/monitoring hearing (Children's Court)", primaryFee: 185, unit: "per hearing", notes: "Youth Control Order reporting and monitoring hearing, including variation to a less restrictive order. Children's Court only. Single accused only." },
      { type: "Youth Control Order – oppose variation to more restrictive order (Children's Court)", primaryFee: 318, unit: "per hearing", notes: "Youth Control Order reporting and monitoring hearing to oppose a variation to a significantly more restrictive order. Children's Court only. Single accused only." },
      { type: "Breach or Revocation of Youth Control Order (Children's Court)", primaryFee: 484, unit: "per hearing", multiRows: [{ label: "Single accused", fee: 484 }, { label: "Two accused", fee: 726 }, { label: "Three or more accused", fee: 966 }] },
      { type: "Application for summary jurisdiction (Children's Court)", primaryFee: 445, unit: "per application", notes: "Single accused only." },
      {
        type: "Assessment and Referral Court", isGroup: true,
        subItems: [
          { type: "ARC – Review Hearing", primaryFee: 185, unit: "per hearing", notes: "Assessment and Referral Court review hearing. Single accused only.", extension: "All ARC appearances require an extension to be submitted prior to the eligibility hearing.\n\n*When submitting the extension please ensure Mag Court - ARC is selected from the drop down \"Which court/tribunal do you have to go to?\" on the court hearings page." },
          { type: "ARC – Individual Support Plan Ratification hearing", primaryFee: 332, unit: "per hearing", notes: "Assessment and Referral Court — Individual Support Plan Ratification hearing. Single accused only.", extension: "All ARC appearances require an extension to be submitted prior to the eligibility hearing.\n\n*When submitting the extension please ensure Mag Court - ARC is selected from the drop down \"Which court/tribunal do you have to go to?\" on the court hearings page." },
          { type: "ARC – Eligibility hearing", primaryFee: 185, unit: "per hearing", notes: "ARC Eligibility hearing. Single accused only.", extension: "All ARC appearances require an extension to be submitted prior to the eligibility hearing.\n\n*When submitting the extension please ensure Mag Court - ARC is selected from the drop down \"Which court/tribunal do you have to go to?\" on the court hearings page." },
        ],
      },
    ],
  },
  {
    category: "Table B – Bail (Children's Court & Magistrates' Court)",
    sub: "Bail applications in Magistrates' Court and Children's Court",
    color: "bg-sky-50 border-sky-200",
    headerColor: "bg-sky-600",
    url: "https://www.handbook.vla.vic.gov.au/table-b-lump-sum-fees-bail-applications-childrens-court-and-magistrates-court",
    items: [
      { type: "Contested bail preparation", primaryFee: 226, unit: "per application", notes: "Lump sum preparation fee for a contested bail application in the Magistrates' Court or Children's Court." },
      { type: "First remand hearing", primaryFee: 231, unit: "per hearing", notes: "Fee for the first remand hearing." },
      { type: "Bail appearance fee", primaryFee: 484, unit: "per appearance", notes: "Appearance fee for bail application. Where counsel appears and it is in the accused's best interests to proceed to a plea instead, VLA will pay the Table A plea appearance fee instead." },
      { type: "Intensive Bail Scheme supervision (Children's Court)", primaryFee: 185, unit: "per hearing", notes: "Intensive Bail Scheme supervision hearings in the Children's Court only." },
    ],
  },
  {
    category: "Table C – Bail (County Court)",
    sub: "Bail applications in the County Court",
    color: "bg-indigo-50 border-indigo-200",
    headerColor: "bg-indigo-600",
    url: "https://www.handbook.vla.vic.gov.au/table-c-lump-sum-fees-bail-applications-county-court",
    items: [
      { type: "Bail preparation (County Court)", primaryFee: 1030, unit: "per application", notes: "Lump sum preparation fee covering obtaining instructions, preparing the case, proofing witnesses." },
      { type: "Bail appearance fee (County Court)", primaryFee: 968, unit: "per appearance", notes: "Appearance fee for a County Court bail application." },
      { type: "Mention / adjournment (County Court bail)", primaryFee: 298, unit: "per appearance", notes: "Mention or adjournment fee in the context of a County Court bail application." },
    ],
  },
  {
    category: "Table E – Indictable Matters (Magistrates' Court / Committal stage)",
    sub: "Magistrates' Court and Children's Court stage of indictable crime matters",
    color: "bg-violet-50 border-violet-200",
    headerColor: "bg-violet-600",
    url: "https://www.handbook.vla.vic.gov.au/table-e-lump-sum-fees-childrens-court-and-magistrates-court-stage-indictable-crime-matter",
    items: [
      { type: "General preparation – indictable (Mag. Court)", primaryFee: 712, hours: 4, unit: "per matter", notes: "Covers obtaining instructions, advising about defence, negotiating with prosecution, perusing the hand-up brief, preparing Form 32 (Case Directions Notice)." },
      { type: "Brief analysis and case strategy fee", primaryFee: 712, hours: 4, unit: "per matter", notes: "Additional brief analysis and case strategy fee at the Magistrates' Court committal stage." },
      { type: "Additional preparation – contested committal", primaryFee: 890, hours: 5, unit: "per matter", notes: "Payable where a contested committal is aided. Includes preparing the Form 32 (Case Directions Notice)." },
      { type: "Committal mention / case conference appearance", primaryFee: 445, hours: 2.5, unit: "per appearance", notes: "VLA will pay for subsequent committal mention only if the lawyer has applied (if appropriate) for an Appeal Costs Certificate, or satisfies VLA that substantial negotiation took place." },
      { type: "Ground rules hearing (indictable, Mag. Court)", primaryFee: 484, unit: "daily appearance", notes: "Daily appearance fee for a ground rules hearing at the Magistrates' Court stage." },
      { type: "Special mention", primaryFee: 178, hours: 1, unit: "per mention", notes: "Special mention fee at the Magistrates' Court committal stage." },
      { type: "Contested committal – day 1", primaryFee: 1284, unit: "per day", notes: "Appearance fee for the first day of a contested committal. Where a plea is heard at committal no additional fee is payable." },
      { type: "Contested committal – day 2", primaryFee: 1157, unit: "per day", notes: "Appearance fee for the second day of a contested committal." },
      { type: "Jail conference (indictable, Mag. Court)", primaryFee: 185, unit: "per conference", notes: "One necessary jail conference at the Magistrates' Court committal stage." },
      { type: "Plea in Magistrates' Court (committal resolves as plea)", primaryFee: 537, unit: "per plea", notes: "Where a committal resolves as a plea in the Magistrates' Court, heard on a day other than the committal contest (can be same day as the committal mention)." },
      { type: "Sentence (another day – indictable Mag. Court)", primaryFee: 318, unit: "per appearance", notes: "Sentence fee where sentence is heard on a day other than the plea day." },
    ],
  },
  {
    category: "Table F – Indictable Matters (County Court & Supreme Court)",
    sub: "County Court and Supreme Court stage of indictable crime matters",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-600",
    url: "https://www.handbook.vla.vic.gov.au/table-f-lump-sum-fees-county-court-and-supreme-court-stage-indictable-crime-matter",
    items: [
      { type: "Post-committal negotiations", unit: "per matter", multiRows: [{ label: "County Court", fee: 714 }, { label: "Supreme Court", fee: 978 }], primaryFee: 714 },
      { type: "First directions hearing", unit: "per hearing", multiRows: [{ label: "County Court", fee: 476 }, { label: "Supreme Court", fee: 652 }], primaryFee: 476 },
      { type: "Directions hearing / mention / callover", unit: "per appearance", multiRows: [{ label: "County Court", fee: 297 }, { label: "Supreme Court", fee: 407 }], primaryFee: 297 },
      { type: "Defence response – first directions hearing", unit: "per hearing", multiRows: [{ label: "County Court", fee: 476 }, { label: "Supreme Court", fee: 652 }], primaryFee: 476 },
      { type: "Plea preparation", unit: "per matter", multiRows: [{ label: "County Court (3h)", fee: 561 }, { label: "Supreme Court (8.5h)", fee: 2533 }], primaryFee: 561 },
      { type: "Plea – appearance fee (first day)", unit: "per day", notes: "Appearance fee for the first day of a plea, includes conferences.", multiRows: [{ label: "County Court", fee: 1834 }, { label: "Supreme Court", fee: 2504 }], primaryFee: 1834 },
      { type: "Plea – appearance fee (subsequent days)", unit: "per day", multiRows: [{ label: "County Court", fee: 638 }, { label: "Supreme Court", fee: 1002 }], primaryFee: 638 },
      { type: "Sentence (County/Supreme Court)", unit: "per appearance", notes: "Sentence appearance where heard on a different day to the plea.", multiRows: [{ label: "County Court", fee: 356 }, { label: "Supreme Court", fee: 491 }], primaryFee: 356 },
      { type: "Sentence indication", unit: "per hearing", notes: "Appearance fee for a sentence indication hearing. Includes conferences.", multiRows: [{ label: "County Court", fee: 1350 }, { label: "Supreme Court", fee: 1838 }], primaryFee: 1350 },
      { type: "Ground rules hearing (County/Supreme Court)", unit: "per hearing", multiRows: [{ label: "County Court", fee: 1370 }, { label: "Supreme Court", fee: 2197 }], primaryFee: 1370 },
      { type: "Trial preparation", unit: "per matter", multiRows: [{ label: "County Court (10h)", fee: 1870 }, { label: "Supreme Court (15h)", fee: 4470 }], primaryFee: 1870 },
      { type: "Trial – appearance fee (first day)", unit: "per day", notes: "Includes conferences. A 20% uplift applies in certain complex matters — see VLA Handbook for eligibility.", multiRows: [{ label: "County Court", fee: 2982 }, { label: "County Court (20% uplift)", fee: 3578 }, { label: "Supreme Court", fee: 4737 }, { label: "Supreme Court (20% uplift)", fee: 5684 }], primaryFee: 2982 },
      { type: "Trial – appearance fee (subsequent days)", unit: "per day", multiRows: [{ label: "County Court", fee: 1370 }, { label: "Supreme Court", fee: 2197 }], primaryFee: 1370 },
      { type: "Trial – instructing (per hour, max 5h/day)", unit: "per hour", multiRows: [{ label: "County Court", fee: 165 }, { label: "Supreme Court", fee: 298 }], primaryFee: 165 },
      { type: "Plea hearing – first day (at trial)", unit: "per day", multiRows: [{ label: "County Court", fee: 1106 }, { label: "Supreme Court", fee: 1508 }], primaryFee: 1106 },
      { type: "Advice on appeal", unit: "per matter", multiRows: [{ label: "County Court", fee: 326 }, { label: "Supreme Court", fee: 326 }], primaryFee: 326 },
      { type: "Active Case Management – Case Initiation Notice (County Ct)", primaryFee: 476, unit: "per matter" },
      { type: "Active Case Management – case conference prep (County Ct)", primaryFee: 714, unit: "per conference", notes: "Instructor preparation fee for a County Court case conference under ACMS." },
      { type: "Active Case Management – case conference appearance (County Ct)", primaryFee: 1370, unit: "per appearance" },
      { type: "Active Case Management – Trial Readiness Questionnaire (County Ct)", primaryFee: 476, unit: "per matter" },
      { type: "Active Case Management – case assessment hearing (County Ct)", primaryFee: 596, unit: "per hearing" },
    ],
  },
  {
    category: "Table G – Sentence Appeals (County Court)",
    sub: "Appeals against sentence in the County Court",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-600",
    url: "https://www.handbook.vla.vic.gov.au/table-g-lump-sum-fees-sentence-appeals-county-court",
    items: [
      { type: "Preparation – sentence appeal (County Court)", primaryFee: 1030, unit: "per matter", notes: "Covers obtaining instructions, preparing the case, proofing witnesses." },
      { type: "Appearance fee – sentence appeal (County Court)", primaryFee: 968, unit: "per appearance", notes: "Brief fee where counsel is briefed in a County Court sentence appeal." },
      { type: "Appearance to hear sentence (County Court appeal)", primaryFee: 356, unit: "per appearance" },
      { type: "Mention / adjournment (sentence appeal)", primaryFee: 298, unit: "per appearance" },
    ],
  },
  {
    category: "Table H – Conviction & Sentence Appeals (County Court)",
    sub: "Appeals against sentence and conviction in the County Court",
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-orange-600",
    url: "https://www.handbook.vla.vic.gov.au/table-h-lump-sum-fees-appeals-against-sentence-and-conviction-county-court",
    items: [
      { type: "Solicitor preparation – conviction/sentence appeal", primaryFee: 1028, hours: 5.5, unit: "per matter", notes: "VLA will not pay additional fees for lawyer to instruct or conferences with counsel." },
      { type: "Mention (conviction/sentence appeal)", primaryFee: 297, hours: 1.25, unit: "per mention" },
      { type: "Daily appearance (conviction/sentence appeal)", primaryFee: 1087, unit: "per day" },
      { type: "Sentence (conviction/sentence appeal)", primaryFee: 356, unit: "per appearance" },
    ],
  },
  {
    category: "Table K – Appeals to the Court of Appeal",
    sub: "Conviction and/or sentence appeals in the Court of Appeal",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-600",
    url: "https://www.handbook.vla.vic.gov.au/table-k-lump-sum-fees-appeals-court-appeal",
    items: [
      { type: "Leave application – preparation", primaryFee: 596, hours: 2, unit: "per matter" },
      { type: "Drawing grounds of appeal & written case (conviction/conviction & sentence)", primaryFee: 1630, hours: 5, unit: "per matter" },
      { type: "Drawing grounds of appeal & written case (sentence only)", primaryFee: 978, hours: 3, unit: "per matter" },
      { type: "Revision of grounds of appeal", primaryFee: 326, hours: 1, unit: "per matter" },
      { type: "Application for renewal", primaryFee: 326, hours: 1, unit: "per application" },
      { type: "Oral hearing (exceptional circumstances)", primaryFee: 326, hours: 1, unit: "per hearing", notes: "Payable in exceptional circumstances only." },
      { type: "Solicitor preparation – appeal against sentence (Court of Appeal)", primaryFee: 894, hours: 3, unit: "per matter" },
      { type: "Brief fee – appeal against sentence (includes prep & appearances)", primaryFee: 2269, unit: "per matter", notes: "Covers preparation and all appearance fees for a Court of Appeal sentence appeal." },
      { type: "Subsequent day(s) – Court of Appeal", primaryFee: 1511, unit: "per day" },
      { type: "Appearance at judgment (Court of Appeal – different day)", primaryFee: 491, unit: "per appearance" },
      { type: "Solicitor preparation – appeal against conviction (Court of Appeal)", primaryFee: 1490, hours: 5, unit: "per matter" },
      { type: "Brief fee – appeal against conviction (includes prep & appearances)", primaryFee: 2269, unit: "per matter" },
    ],
  },
  {
    category: "Table M – Counsel's Fees (Criminal Trials)",
    sub: "Guide to fees for counsel — Senior Counsel, Senior Junior & Junior Counsel",
    color: "bg-slate-50 border-slate-200",
    headerColor: "bg-slate-700",
    url: "https://www.handbook.vla.vic.gov.au/table-m-guide-fees-counsel-criminal-trials",
    items: [
      { type: "Trial brief fee – first day (includes conferences)", unit: "per day", notes: "VLA does not pay counsel's accounts direct. The assigned lawyer is responsible for lodging, administering and paying counsel's accounts.", multiRows: [{ label: "Senior Counsel – County Court", fee: 6264 }, { label: "Senior Counsel – County Court (20% uplift)", fee: 7516 }, { label: "Senior Counsel – Supreme Court", fee: 7149 }, { label: "Senior Counsel – Supreme Court (20% uplift)", fee: 8578 }, { label: "Senior Junior – County Court", fee: 2982 }, { label: "Senior Junior – County Court (20% uplift)", fee: 3578 }, { label: "Senior Junior – Supreme Court", fee: 4737 }, { label: "Senior Junior – Supreme Court (20% uplift)", fee: 5684 }, { label: "Junior Counsel – County Court", fee: 1403 }, { label: "Junior Counsel – County Court (20% uplift)", fee: 1682 }, { label: "Junior Counsel – Supreme Court", fee: 2524 }, { label: "Junior Counsel – Supreme Court (20% uplift)", fee: 3028 }], primaryFee: 1403 },
      { type: "Trial – subsequent days", unit: "per day", multiRows: [{ label: "Senior Counsel", fee: 3364 }, { label: "Senior Junior – County Court", fee: 1370 }, { label: "Senior Junior – Supreme Court", fee: 2197 }, { label: "Junior Counsel – County Court", fee: 754 }, { label: "Junior Counsel – Supreme Court", fee: 1091 }], primaryFee: 754 },
      { type: "Plea brief fee – first day (includes conferences)", unit: "per day", multiRows: [{ label: "Senior Counsel – County/Supreme", fee: 4025 }, { label: "Senior Junior – County Court", fee: 1834 }, { label: "Senior Junior – Supreme Court", fee: 2504 }, { label: "Junior Counsel – County Court", fee: 1086 }, { label: "Junior Counsel – Supreme Court", fee: 1395 }], primaryFee: 1086 },
      { type: "Plea – subsequent days", unit: "per day", multiRows: [{ label: "Senior Counsel – County/Supreme", fee: 2240 }, { label: "Senior Junior – County Court", fee: 638 }, { label: "Senior Junior – Supreme Court", fee: 1002 }, { label: "Junior Counsel – County Court", fee: 501 }, { label: "Junior Counsel – Supreme Court", fee: 735 }], primaryFee: 501 },
      { type: "Sentence (different day from plea)", unit: "per appearance", multiRows: [{ label: "Senior Counsel – County/Supreme", fee: 661 }, { label: "Senior Junior – County Court", fee: 356 }, { label: "Senior Junior – Supreme Court", fee: 491 }, { label: "Junior Counsel – County Court", fee: 356 }, { label: "Junior Counsel – Supreme Court", fee: 491 }], primaryFee: 356 },
      { type: "Sentence indication brief fee", unit: "per hearing", multiRows: [{ label: "Senior Counsel – County/Supreme", fee: 3138 }, { label: "Senior Junior – County Court", fee: 1350 }, { label: "Senior Junior – Supreme Court", fee: 1838 }, { label: "Junior Counsel – County Court", fee: 780 }, { label: "Junior Counsel – Supreme Court", fee: 1045 }], primaryFee: 780 },
      { type: "Post-committal negotiations (counsel)", unit: "per matter", multiRows: [{ label: "Senior Counsel", fee: 1308 }, { label: "Senior Junior – County Court", fee: 714 }, { label: "Senior Junior – Supreme Court", fee: 978 }, { label: "Junior Counsel – County Court", fee: 438 }, { label: "Junior Counsel – Supreme Court", fee: 495 }], primaryFee: 438 },
      { type: "First directions hearing (counsel)", unit: "per hearing", multiRows: [{ label: "Senior Counsel", fee: 872 }, { label: "Senior Junior – County Court", fee: 476 }, { label: "Senior Junior – Supreme Court", fee: 652 }, { label: "Junior Counsel – County Court", fee: 292 }, { label: "Junior Counsel – Supreme Court", fee: 330 }], primaryFee: 292 },
      { type: "Directions / mention / callover (counsel)", unit: "per appearance", multiRows: [{ label: "Senior Counsel", fee: 545 }, { label: "Senior Junior – County Court", fee: 297 }, { label: "Senior Junior – Supreme Court", fee: 407 }, { label: "Junior Counsel – County Court", fee: 182 }, { label: "Junior Counsel – Supreme Court", fee: 206 }], primaryFee: 182 },
    ],
  },
];

function fmt(fee) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0 }).format(fee);
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function OptionCard({ label, sub, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
        selected ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40"
      }`}
    >
      <p className={`font-semibold text-sm ${selected ? "text-purple-700" : "text-slate-800"}`}>{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </button>
  );
}

function ResultCard({ result, onReset }) {
  const statusConfig = {
    eligible: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Likely eligible" },
    "eligible-check": { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Eligible — check with VLA" },
    "not-eligible": { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Not eligible" },
    other: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "See AI Advisor" },
  }[result.status];
  const Icon = statusConfig.icon;
  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-5 border ${statusConfig.bg} ${statusConfig.border}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${statusConfig.color}`} />
          <div>
            <span className={`text-xs font-bold uppercase tracking-wide ${statusConfig.color}`}>{statusConfig.label}</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{result.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{result.description}</p>
          </div>
        </div>
      </div>
      {result.grant && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Recommended grant</p>
          <p className="text-sm font-semibold text-slate-800">{result.grant}</p>
        </div>
      )}
      {result.costs && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Costs payable</p>
          <p className="text-sm text-slate-700 leading-relaxed">{result.costs}</p>
        </div>
      )}
      {result.notes?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Key considerations</p>
          <ul className="space-y-1.5">
            {result.notes.map((note, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.handbook && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Reference</p>
          <p className="text-xs text-slate-500">{result.handbook}</p>
        </div>
      )}
      <p className="text-xs text-slate-400 text-center">This tool is a guide only. Always verify with the current VLA Handbook and fee schedule.</p>
      <button onClick={onReset} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-semibold text-sm transition-all">
        <RotateCcw className="w-4 h-4" />
        Start again
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AID FINDER PANEL
// ═══════════════════════════════════════════════════════════════════════════

const INIT_STATE = { matterType: null, bailCourt: null, committralType: null, trialCourt: null, coaType: null };

function AidFinderPanel() {
  const [state, setState] = useState(INIT_STATE);
  const [showResult, setShowResult] = useState(false);
  const set = (key, val) => setState(prev => ({ ...prev, [key]: val }));
  const reset = () => { setState(INIT_STATE); setShowResult(false); };

  const needsBailCourt = state.matterType === "g6";
  const needsCommittalType = state.matterType === "g3";
  const needsTrialCourt = state.matterType === "g4";
  const needsCoaType = state.matterType === "g7_coa";
  const subTypeSelected = (!needsBailCourt || state.bailCourt) && (!needsCommittalType || state.committralType) && (!needsTrialCourt || state.trialCourt) && (!needsCoaType || state.coaType);
  const matterReady = state.matterType && subTypeSelected;
  const result = showResult ? getResult(state) : null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-5">
        {!showResult ? (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Select the applicable guideline</p>
              <div className="space-y-2">
                {MATTER_TYPES.map(m => (
                  <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.matterType === m.id} onClick={() => setState({ ...INIT_STATE, matterType: m.id })} />
                ))}
              </div>
            </div>
            {needsBailCourt && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Which court?</p>
                <div className="space-y-2">{BAIL_COURTS.map(m => <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.bailCourt === m.id} onClick={() => set("bailCourt", m.id)} />)}</div>
              </div>
            )}
            {needsCommittalType && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Which committal guideline applies?</p>
                <div className="space-y-2">{COMMITTAL_TYPES.map(m => <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.committralType === m.id} onClick={() => set("committralType", m.id)} />)}</div>
              </div>
            )}
            {needsTrialCourt && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Which court?</p>
                <div className="space-y-2">{TRIAL_COURTS.map(m => <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.trialCourt === m.id} onClick={() => set("trialCourt", m.id)} />)}</div>
              </div>
            )}
            {needsCoaType && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">What type of appeal?</p>
                <div className="space-y-2">{COA_TYPES.map(m => <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.coaType === m.id} onClick={() => set("coaType", m.id)} />)}</div>
              </div>
            )}
            {matterReady && (
              <button onClick={() => setShowResult(true)} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md">
                See recommendation <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          result && <ResultCard result={result} onReset={reset} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEES PANEL
// ═══════════════════════════════════════════════════════════════════════════

function FeesPanel() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const filtered = FEE_CATEGORIES.map((cat, catIdx) => ({
    ...cat, catIdx,
    items: cat.items.map((item, itemIdx) => ({ ...item, itemIdx })).filter(item => {
      if (!search) return true;
      if (item.isGroup) return item.subItems.some(s => s.type.toLowerCase().includes(search.toLowerCase()));
      return item.type.toLowerCase().includes(search.toLowerCase());
    }),
  })).filter(cat => cat.items.length > 0);

  const selectedCat = selected != null ? FEE_CATEGORIES[selected.catIdx] : null;
  const rawItem = selectedCat ? selectedCat.items[selected.itemIdx] : null;
  const selectedItem = rawItem?.isGroup && selected.subIdx != null ? rawItem.subItems[selected.subIdx] : (!rawItem?.isGroup ? rawItem : null);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ minHeight: 0 }}>
      {/* List */}
      <div className="md:w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search fees..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(cat => (
            <div key={cat.category}>
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wide text-white ${cat.headerColor}`}>
                {cat.category.split("–")[0].trim()}
              </div>
              {cat.items.map(item => {
                const groupKey = `${cat.catIdx}-${item.itemIdx}`;
                const isExpanded = !!expandedGroups[groupKey];
                if (item.isGroup) {
                  return (
                    <div key={item.type}>
                      <button onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))}
                        className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{item.type}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-amber-600 bg-amber-50 font-semibold px-1.5 py-0.5 rounded-full">Extension req.</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>
                      {isExpanded && item.subItems.map((sub, subIdx) => {
                        const isSelected = selected?.catIdx === cat.catIdx && selected?.itemIdx === item.itemIdx && selected?.subIdx === subIdx;
                        return (
                          <button key={sub.type} onClick={() => setSelected({ catIdx: cat.catIdx, itemIdx: item.itemIdx, subIdx })}
                            className={`w-full text-left pl-8 pr-4 py-3 border-b border-slate-100 transition-colors ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}>
                            <p className={`text-sm font-medium leading-snug ${isSelected ? "text-purple-700" : "text-slate-700"}`}>{sub.type}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs font-bold ${isSelected ? "text-purple-600" : "text-slate-500"}`}>{sub.primaryFee != null ? fmt(sub.primaryFee) : "—"}</span>
                              <span className="text-xs text-slate-400">{sub.unit}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                }
                const isSelected = selected?.catIdx === cat.catIdx && selected?.itemIdx === item.itemIdx && selected?.subIdx == null;
                return (
                  <button key={item.type} onClick={() => setSelected({ catIdx: cat.catIdx, itemIdx: item.itemIdx })}
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}>
                    <p className={`text-sm font-medium leading-snug ${isSelected ? "text-purple-700" : "text-slate-800"}`}>{item.type}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold ${isSelected ? "text-purple-600" : "text-slate-500"}`}>
                        {fmt(item.primaryFee)}{item.multiRows && <span className="font-normal text-slate-400"> from</span>}
                      </span>
                      <span className="text-xs text-slate-400">{item.unit}</span>
                      {item.hours && <span className="text-xs text-slate-300">· {item.hours}h</span>}
                      {item.extension && <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Extension req.</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedItem ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Select a fee item</h2>
            <p className="text-sm text-slate-400">Choose any item from the list on the left to see the VLA fee, applicable hours, and notes.</p>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-block text-xs font-bold uppercase tracking-wide text-white px-3 py-1 rounded-full ${selectedCat.headerColor}`}>{selectedCat.category}</span>
              {selectedCat.url && (
                <a href={selectedCat.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors">
                  VLA Handbook <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className={`rounded-2xl border p-6 ${selectedCat.color}`}>
              <h1 className="text-xl font-bold text-slate-900 mb-1">{selectedItem.type}</h1>
              <p className="text-sm text-slate-500 mb-4">{selectedItem.unit}{selectedItem.hours && <> · {selectedItem.hours} hours</>} · fees are GST inclusive</p>
              {!selectedItem.multiRows && (
                <div className="text-4xl font-black text-slate-900">{selectedItem.primaryFee != null ? fmt(selectedItem.primaryFee) : <span className="text-2xl text-slate-400">See VLA Handbook</span>}</div>
              )}
              {selectedItem.multiRows && (
                <div className="space-y-2">
                  {selectedItem.multiRows.map(row => (
                    <div key={row.label} className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-700">{row.label}</span>
                      <span className="text-lg font-black text-slate-900">{fmt(row.fee)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedItem.extension && (
              <div className="bg-amber-50 rounded-xl border border-amber-300 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">⚠ Extension of Aid Required</p>
                {selectedItem.extension.split("\n\n").map((para, i) => (
                  <p key={i} className={`text-sm text-amber-900 leading-relaxed ${i > 0 ? "mt-2" : ""}`}>{para}</p>
                ))}
              </div>
            )}
            {selectedItem.notes && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedItem.notes}</p>
              </div>
            )}
            <p className="text-xs text-slate-400 text-center">Fees effective 1 January 2025. All fees are GST inclusive. Always verify with the current published VLA fee schedule before claiming.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function VLATools() {
  const [tab, setTab] = useState("aid");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <a href={createPageUrl("Home")} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">VLA Criminal Law Tools</p>
          <p className="text-xs text-slate-400">Grant finder & fee schedule — effective 1 January 2025</p>
        </div>
        <div className="w-24" />
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1 max-w-sm">
          <button
            onClick={() => setTab("aid")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === "aid" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            What aid do I need?
          </button>
          <button
            onClick={() => setTab("fees")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === "fees" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Scale className="w-4 h-4" />
            Fees Payable
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === "aid" ? <AidFinderPanel /> : <FeesPanel />}
      </div>

      <AidChatBubble />
    </div>
  );
}