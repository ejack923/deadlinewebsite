import { useState } from "react";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, RotateCcw } from "lucide-react";
import AidChatBubble from "@/components/aid/AidChatBubble";

// ─── Decision tree data ───────────────────────────────────────────────────────

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

// ─── Result definitions ───────────────────────────────────────────────────────

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
    costs: "Fixed fee schedule — Table A with ARC-specific items. Extensions of aid are required for each ARC appearance. See VLA ARC fee items.",
    notes: [
      "An extension of aid must be submitted prior to each ARC eligibility hearing.",
      "When submitting the extension, ensure 'Mag Court - ARC' is selected from the drop-down 'Which court/tribunal do you have to go to?' on the court hearings page.",
      "ARC Review Hearings, ISP Ratification hearings, and Eligibility hearings each have separate fee items under Table A.",
      "See Guideline 1.3 — handbook.vla.vic.gov.au/guideline-13-assessment-and-referral-court-list-matters.",
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
      "Commonwealth criminal law guidelines mirror state guidelines — see National Partnership Agreement Schedule A for Commonwealth priorities.",
      "Retain on file: charge copies, prior convictions, lawyer's assessment.",
    ],
    handbook: "Guidelines 1.4 & 1.5 — handbook.vla.vic.gov.au/guidelines-14-and-15-social-security-prosecutions"
  };

  if (matterType === "g6") {
    if (bailCourt === "bail_mag") return {
      status: "eligible",
      title: "Guideline 6 – Bail application (Magistrates' or Children's Court)",
      description: "VLA will generally grant aid for bail applications in the Magistrates' Court or Children's Court where there is a reasonable basis for the application, taking into account charges, personal circumstances, and relevant bail law.",
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
        "See Guideline 7.2 — handbook.vla.vic.gov.au/guideline-72-interlocutory-appeals-court-appeal.",
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
        "See Guideline 7.3 — handbook.vla.vic.gov.au/guideline-73-appeals-high-court.",
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
      "See Guideline 9 — handbook.vla.vic.gov.au/guideline-9-hearings-under-crimes-mental-impairment-and-unfitness-be-tried-act.",
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
      "See Guideline 10 — handbook.vla.vic.gov.au/guideline-10-post-sentence-supervision-detention-orders-community-safety-orders.",
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
    description: "If the matter falls outside the criminal law guidelines, VLA may still grant aid under special circumstances where the person meets the means test, the state reasonableness test or interests of justice test, and one of the State's special circumstances applies.",
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

// ─── Step components ──────────────────────────────────────────────────────────

function OptionCard({ label, sub, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
        selected
          ? "border-purple-500 bg-purple-50"
          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40"
      }`}
    >
      <p className={`font-semibold text-sm ${selected ? "text-purple-700" : "text-slate-800"}`}>{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </button>
  );
}

function YesNoRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-700 font-medium flex-1">{label}</p>
      <div className="flex gap-2">
        {["yes", "no", "unsure"].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt === "yes" ? true : opt === "no" ? false : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              (opt === "yes" && value === true) || (opt === "no" && value === false) || (opt === "unsure" && value === null && value !== undefined)
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-purple-400"
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

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
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wide ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{result.title}</h2>
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

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-semibold text-sm transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Start again
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const INIT_STATE = {
  matterType: null,
  bailCourt: null,
  committralType: null,
  trialCourt: null,
  coaType: null,
};

export default function WhatAidDoINeed() {
  const [state, setState] = useState(INIT_STATE);
  const [showResult, setShowResult] = useState(false);

  const set = (key, val) => setState(prev => ({ ...prev, [key]: val }));

  const reset = () => {
    setState(INIT_STATE);
    setShowResult(false);
  };

  const needsBailCourt = state.matterType === "g6";
  const needsCommittalType = state.matterType === "g3";
  const needsTrialCourt = state.matterType === "g4";
  const needsCoaType = state.matterType === "g7_coa";

  const subTypeSelected =
    (!needsBailCourt || state.bailCourt) &&
    (!needsCommittalType || state.committralType) &&
    (!needsTrialCourt || state.trialCourt) &&
    (!needsCoaType || state.coaType);

  const matterReady = state.matterType && subTypeSelected;
  const result = showResult ? getResult(state) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <a
          href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">What aid do I need?</p>
          <p className="text-xs text-slate-400">VLA criminal law grant finder</p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">

          {!showResult ? (
            <>
              {/* Step 1: Matter type */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Step 1 — Select the applicable guideline</p>
                <div className="space-y-2">
                  {MATTER_TYPES.map(m => (
                    <OptionCard
                      key={m.id}
                      label={m.label}
                      sub={m.sub}
                      selected={state.matterType === m.id}
                      onClick={() => setState({ ...INIT_STATE, matterType: m.id })}
                    />
                  ))}
                </div>
              </div>

              {/* Sub-step: bail court */}
              {needsBailCourt && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Step 2 — Which court?</p>
                  <div className="space-y-2">
                    {BAIL_COURTS.map(m => (
                      <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.bailCourt === m.id} onClick={() => set("bailCourt", m.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-step: committal type */}
              {needsCommittalType && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Step 2 — Which committal guideline applies?</p>
                  <div className="space-y-2">
                    {COMMITTAL_TYPES.map(m => (
                      <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.committralType === m.id} onClick={() => set("committralType", m.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-step: trial court */}
              {needsTrialCourt && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Step 2 — Which court?</p>
                  <div className="space-y-2">
                    {TRIAL_COURTS.map(m => (
                      <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.trialCourt === m.id} onClick={() => set("trialCourt", m.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-step: Court of Appeal type */}
              {needsCoaType && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Step 2 — What type of appeal?</p>
                  <div className="space-y-2">
                    {COA_TYPES.map(m => (
                      <OptionCard key={m.id} label={m.label} sub={m.sub} selected={state.coaType === m.id} onClick={() => set("coaType", m.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Get result button */}
              {matterReady && (
                <button
                  onClick={() => setShowResult(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md"
                >
                  See recommendation
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            result && <ResultCard result={result} onReset={reset} />
          )}
        </div>
      </div>

      <AidChatBubble />
    </div>
  );
}