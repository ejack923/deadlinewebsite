import { useState } from "react";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Search, DollarSign, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

// ─── Real VLA fee data (effective 1 January 2025) ────────────────────────────

const FEE_CATEGORIES = [
  {
    category: "Summary matters - Magistrates Court (Table A)",
    sub: "Magistrates' Court & Children's Court",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-600",
    url: "https://www.handbook.vla.vic.gov.au/table-fees-summary-criminal-proceedings",
    items: [
      {
        type: "Preparation – general lump sum",
        primaryFee: 484,
        unit: "per matter",
        notes: "Covers perusal of the brief, taking instructions, summary case conference, organising witnesses, obtaining material, briefing counsel. Paid once per matter.",
        multiRows: [
          { label: "Single accused", fee: 484 },
          { label: "Two accused", fee: 726 },
          { label: "Three or more accused", fee: 966 },
        ],
      },
      {
        type: "Preparation – urgent matter",
        primaryFee: 277,
        unit: "per matter",
        notes: "Applies where the request for aid is made no earlier than the day immediately preceding the substantive hearing, or where the lawyer is in receipt of an urgent grant.",
        multiRows: [
          { label: "Single accused", fee: 277 },
          { label: "Two accused", fee: 414 },
          { label: "Three or more accused", fee: 552 },
        ],
      },
      {
        type: "Preparation – consolidated",
        primaryFee: 579,
        unit: "per matter",
        notes: "Where two or more briefs fall within guidelines and are consolidated and heard together. A specific grant for consolidation is required.",
        multiRows: [
          { label: "Single accused", fee: 579 },
          { label: "Two accused", fee: 868 },
          { label: "Three or more accused", fee: 1158 },
        ],
      },
      {
        type: "Contest hearing appearance",
        primaryFee: 1099,
        unit: "per hearing",
        notes: "Payable whether or not the matter proceeds as a contest on the day.",
        extension: "Extension required if a client has a consolidation grant in place and one matter goes off to contest — an extension must be sought to convert the grant to a contest grant for that matter. If a client has multiple contests listed, each contest attracts its own separate grant of aid.",
        multiRows: [
          { label: "Single accused", fee: 1099 },
          { label: "Two accused", fee: 1648 },
          { label: "Three or more accused", fee: 2196 },
        ],
      },
      {
        type: "Daily appearance fee",
        primaryFee: 484,
        unit: "per day",
        notes: "Standard daily appearance fee for plea or hearing day.",
        multiRows: [
          { label: "Single accused", fee: 484 },
          { label: "Two accused", fee: 726 },
          { label: "Three or more accused", fee: 966 },
        ],
      },
      {
        type: "Appearance on sentence or adjournment",
        primaryFee: 318,
        unit: "per appearance",
        notes: "For appearances on sentence or adjournment listings.",
        multiRows: [
          { label: "Single accused", fee: 318 },
          { label: "Two accused", fee: 476 },
          { label: "Three or more accused", fee: 636 },
        ],
      },
      {
        type: "Contest mention",
        primaryFee: 332,
        unit: "per necessary appearance",
        notes: "VLA will pay if the accused had a reasonable prospect of acquittal on all or some charges and would have qualified for a grant. Only one contest mention fee payable on same day for same accused.",
        multiRows: [
          { label: "Single accused", fee: 332 },
          { label: "Two accused", fee: 498 },
          { label: "Three or more accused", fee: 663 },
        ],
      },
      {
        type: "Consolidated contest mention",
        primaryFee: 581,
        unit: "per necessary appearance",
        notes: "Where there is more than one contest mention listed that meets the contest mention guideline.",
        multiRows: [
          { label: "Single accused", fee: 581 },
          { label: "Two accused", fee: 746 },
          { label: "Three or more accused", fee: 912 },
        ],
      },
      {
        type: "Jail conference",
        primaryFee: 185,
        unit: "per conference",
        notes: "One necessary jail conference (including by video). Only payable if the lawyer who attends also conducts the substantive hearing, and if not held in court or police cells on the day of the hearing. Only one jail conference fee is available on a grant.",
      },
      {
        type: "Transcribing taped record of interview",
        primaryFee: 99,
        unit: "per tape",
        notes: "Payable where transcription is necessary.",
      },
      {
        type: "Group conference – within work hours (Children's Court)",
        primaryFee: 464,
        unit: "per conference",
        multiRows: [
          { label: "Single accused", fee: 464 },
          { label: "Two accused", fee: 696 },
          { label: "Three or more accused", fee: 927 },
        ],
      },
      {
        type: "Group conference – outside work hours (Children's Court)",
        primaryFee: 594,
        unit: "per conference",
        multiRows: [
          { label: "Single accused", fee: 594 },
          { label: "Two accused", fee: 890 },
          { label: "Three or more accused", fee: 1188 },
        ],
      },
      {
        type: "CISP / Drug Court mention",
        primaryFee: 185,
        unit: "per attendance",
        notes: "Court Integrated Services Program or Drug Court mention. One necessary attendance payable where there is a prior indication the accused is not complying and the court is likely to take them off the program.",
      },
      {
        type: "Youth Control Order – planning meeting (Children's Court)",
        primaryFee: 358,
        unit: "per meeting",
        notes: "Youth Control Order planning meeting. Children's Court only. Single accused only.",
      },
      {
        type: "Youth Control Order – reporting/monitoring hearing (Children's Court)",
        primaryFee: 185,
        unit: "per hearing",
        notes: "Youth Control Order reporting and monitoring hearing, including variation to a less restrictive order. Children's Court only. Single accused only.",
      },
      {
        type: "Youth Control Order – oppose variation to more restrictive order (Children's Court)",
        primaryFee: 318,
        unit: "per hearing",
        notes: "Youth Control Order reporting and monitoring hearing to oppose a variation to a significantly more restrictive order. Children's Court only. Single accused only.",
      },
      {
        type: "Breach or Revocation of Youth Control Order (Children's Court)",
        primaryFee: 484,
        unit: "per hearing",
        multiRows: [
          { label: "Single accused", fee: 484 },
          { label: "Two accused", fee: 726 },
          { label: "Three or more accused", fee: 966 },
        ],
      },
      {
        type: "Application for summary jurisdiction (Children's Court)",
        primaryFee: 445,
        unit: "per application",
        notes: "Single accused only.",
      },
      {
        type: "Assessment and Referral Court",
        isGroup: true,
        subItems: [
          {
            type: "ARC – Review Hearing",
            primaryFee: 185,
            unit: "per hearing",
            notes: "Assessment and Referral Court review hearing. Single accused only.",
            extension: "All ARC appearances require an extension to be submitted prior to the eligibility hearing.\n\n*When submitting the extension please ensure Mag Court - ARC is selected from the drop down \"Which court/tribunal do you have to go to?\" on the court hearings page.",
          },
          {
            type: "ARC – Individual Support Plan Ratification hearing",
            primaryFee: 332,
            unit: "per hearing",
            notes: "Assessment and Referral Court — Individual Support Plan Ratification hearing. Single accused only.",
            extension: "All ARC appearances require an extension to be submitted prior to the eligibility hearing.\n\n*When submitting the extension please ensure Mag Court - ARC is selected from the drop down \"Which court/tribunal do you have to go to?\" on the court hearings page.",
          },
          {
            type: "ARC – Eligibility hearing",
            primaryFee: 185,
            unit: "per hearing",
            notes: "ARC Eligibility hearing. Single accused only.",
            extension: "All ARC appearances require an extension to be submitted prior to the eligibility hearing.\n\n*When submitting the extension please ensure Mag Court - ARC is selected from the drop down \"Which court/tribunal do you have to go to?\" on the court hearings page.",
          },
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
      {
        type: "Contested bail preparation",
        primaryFee: 226,
        unit: "per application",
        notes: "Lump sum preparation fee for a contested bail application in the Magistrates' Court or Children's Court.",
      },
      {
        type: "First remand hearing",
        primaryFee: 231,
        unit: "per hearing",
        notes: "Fee for the first remand hearing.",
      },
      {
        type: "Bail appearance fee",
        primaryFee: 484,
        unit: "per appearance",
        notes: "Appearance fee for bail application. Where counsel appears and it is in the accused's best interests to proceed to a plea instead, VLA will pay the Table A plea appearance fee instead.",
      },
      {
        type: "Intensive Bail Scheme supervision (Children's Court)",
        primaryFee: 185,
        unit: "per hearing",
        notes: "Intensive Bail Scheme supervision hearings in the Children's Court only.",
      },
    ],
  },
  {
    category: "Table C – Bail (County Court)",
    sub: "Bail applications in the County Court",
    color: "bg-indigo-50 border-indigo-200",
    headerColor: "bg-indigo-600",
    url: "https://www.handbook.vla.vic.gov.au/table-c-lump-sum-fees-bail-applications-county-court",
    items: [
      {
        type: "Bail preparation (County Court)",
        primaryFee: 1030,
        unit: "per application",
        notes: "Lump sum preparation fee covering obtaining instructions, preparing the case, proofing witnesses.",
      },
      {
        type: "Bail appearance fee (County Court)",
        primaryFee: 968,
        unit: "per appearance",
        notes: "Appearance fee for a County Court bail application.",
      },
      {
        type: "Mention / adjournment (County Court bail)",
        primaryFee: 298,
        unit: "per appearance",
        notes: "Mention or adjournment fee in the context of a County Court bail application.",
      },
    ],
  },
  {
    category: "Table E – Indictable Matters (Magistrates' Court / Committal stage)",
    sub: "Magistrates' Court and Children's Court stage of indictable crime matters",
    color: "bg-violet-50 border-violet-200",
    headerColor: "bg-violet-600",
    url: "https://www.handbook.vla.vic.gov.au/table-e-lump-sum-fees-childrens-court-and-magistrates-court-stage-indictable-crime-matter",
    items: [
      {
        type: "General preparation – indictable (Mag. Court)",
        primaryFee: 712,
        hours: 4,
        unit: "per matter",
        notes: "Covers obtaining instructions, advising about defence, negotiating with prosecution, perusing the hand-up brief, preparing Form 32 (Case Directions Notice).",
      },
      {
        type: "Brief analysis and case strategy fee",
        primaryFee: 712,
        hours: 4,
        unit: "per matter",
        notes: "Additional brief analysis and case strategy fee at the Magistrates' Court committal stage.",
      },
      {
        type: "Additional preparation – contested committal",
        primaryFee: 890,
        hours: 5,
        unit: "per matter",
        notes: "Payable where a contested committal is aided. Includes preparing the Form 32 (Case Directions Notice).",
      },
      {
        type: "Committal mention / case conference appearance",
        primaryFee: 445,
        hours: 2.5,
        unit: "per appearance",
        notes: "VLA will pay for subsequent committal mention only if the lawyer has applied (if appropriate) for an Appeal Costs Certificate, or satisfies VLA that substantial negotiation took place.",
      },
      {
        type: "Ground rules hearing (indictable, Mag. Court)",
        primaryFee: 484,
        unit: "daily appearance",
        notes: "Daily appearance fee for a ground rules hearing at the Magistrates' Court stage.",
      },
      {
        type: "Special mention",
        primaryFee: 178,
        hours: 1,
        unit: "per mention",
        notes: "Special mention fee at the Magistrates' Court committal stage.",
      },
      {
        type: "Contested committal – day 1",
        primaryFee: 1284,
        unit: "per day",
        notes: "Appearance fee for the first day of a contested committal. Where a plea is heard at committal no additional fee is payable.",
      },
      {
        type: "Contested committal – day 2",
        primaryFee: 1157,
        unit: "per day",
        notes: "Appearance fee for the second day of a contested committal.",
      },
      {
        type: "Jail conference (indictable, Mag. Court)",
        primaryFee: 185,
        unit: "per conference",
        notes: "One necessary jail conference at the Magistrates' Court committal stage.",
      },
      {
        type: "Plea in Magistrates' Court (committal resolves as plea)",
        primaryFee: 537,
        unit: "per plea",
        notes: "Where a committal resolves as a plea in the Magistrates' Court, heard on a day other than the committal contest (can be same day as the committal mention).",
      },
      {
        type: "Sentence (another day – indictable Mag. Court)",
        primaryFee: 318,
        unit: "per appearance",
        notes: "Sentence fee where sentence is heard on a day other than the plea day.",
      },
    ],
  },
  {
    category: "Table F – Indictable Matters (County Court & Supreme Court)",
    sub: "County Court and Supreme Court stage of indictable crime matters",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-600",
    url: "https://www.handbook.vla.vic.gov.au/table-f-lump-sum-fees-county-court-and-supreme-court-stage-indictable-crime-matter",
    items: [
      {
        type: "Post-committal negotiations",
        unit: "per matter",
        notes: "Counsel's post-committal negotiations fee.",
        multiRows: [
          { label: "County Court", fee: 714 },
          { label: "Supreme Court", fee: 978 },
        ],
        primaryFee: 714,
      },
      {
        type: "First directions hearing",
        unit: "per hearing",
        notes: "First directions hearing in the County or Supreme Court.",
        multiRows: [
          { label: "County Court", fee: 476 },
          { label: "Supreme Court", fee: 652 },
        ],
        primaryFee: 476,
      },
      {
        type: "Directions hearing / mention / callover",
        unit: "per appearance",
        notes: "Subsequent directions, mention or callover appearances.",
        multiRows: [
          { label: "County Court", fee: 297 },
          { label: "Supreme Court", fee: 407 },
        ],
        primaryFee: 297,
      },
      {
        type: "Defence response – first directions hearing",
        unit: "per hearing",
        multiRows: [
          { label: "County Court", fee: 476 },
          { label: "Supreme Court", fee: 652 },
        ],
        primaryFee: 476,
      },
      {
        type: "Plea preparation",
        unit: "per matter",
        notes: "Preparation fee for a guilty plea in the County or Supreme Court.",
        multiRows: [
          { label: "County Court (3h)", fee: 561 },
          { label: "Supreme Court (8.5h)", fee: 2533 },
        ],
        primaryFee: 561,
      },
      {
        type: "Plea – appearance fee (first day)",
        unit: "per day",
        notes: "Appearance fee for the first day of a plea, includes conferences.",
        multiRows: [
          { label: "County Court", fee: 1834 },
          { label: "Supreme Court", fee: 2504 },
        ],
        primaryFee: 1834,
      },
      {
        type: "Plea – appearance fee (subsequent days)",
        unit: "per day",
        multiRows: [
          { label: "County Court", fee: 638 },
          { label: "Supreme Court", fee: 1002 },
        ],
        primaryFee: 638,
      },
      {
        type: "Sentence (County/Supreme Court)",
        unit: "per appearance",
        notes: "Sentence appearance where heard on a different day to the plea.",
        multiRows: [
          { label: "County Court", fee: 356 },
          { label: "Supreme Court", fee: 491 },
        ],
        primaryFee: 356,
      },
      {
        type: "Sentence indication",
        unit: "per hearing",
        notes: "Appearance fee for a sentence indication hearing. Includes conferences.",
        multiRows: [
          { label: "County Court", fee: 1350 },
          { label: "Supreme Court", fee: 1838 },
        ],
        primaryFee: 1350,
      },
      {
        type: "Ground rules hearing (County/Supreme Court)",
        unit: "per hearing",
        multiRows: [
          { label: "County Court", fee: 1370 },
          { label: "Supreme Court", fee: 2197 },
        ],
        primaryFee: 1370,
      },
      {
        type: "Trial preparation",
        unit: "per matter",
        multiRows: [
          { label: "County Court (10h)", fee: 1870 },
          { label: "Supreme Court (15h)", fee: 4470 },
        ],
        primaryFee: 1870,
      },
      {
        type: "Trial – appearance fee (first day)",
        unit: "per day",
        notes: "Includes conferences. A 20% uplift applies in certain complex matters — see VLA Handbook for eligibility.",
        multiRows: [
          { label: "County Court", fee: 2982 },
          { label: "County Court (20% uplift)", fee: 3578 },
          { label: "Supreme Court", fee: 4737 },
          { label: "Supreme Court (20% uplift)", fee: 5684 },
        ],
        primaryFee: 2982,
      },
      {
        type: "Trial – appearance fee (subsequent days)",
        unit: "per day",
        multiRows: [
          { label: "County Court", fee: 1370 },
          { label: "Supreme Court", fee: 2197 },
        ],
        primaryFee: 1370,
      },
      {
        type: "Trial – instructing (per hour, max 5h/day)",
        unit: "per hour",
        multiRows: [
          { label: "County Court", fee: 165 },
          { label: "Supreme Court", fee: 298 },
        ],
        primaryFee: 165,
      },
      {
        type: "Plea hearing – first day (at trial)",
        unit: "per day",
        multiRows: [
          { label: "County Court", fee: 1106 },
          { label: "Supreme Court", fee: 1508 },
        ],
        primaryFee: 1106,
      },
      {
        type: "Advice on appeal",
        unit: "per matter",
        multiRows: [
          { label: "County Court", fee: 326 },
          { label: "Supreme Court", fee: 326 },
        ],
        primaryFee: 326,
      },
      {
        type: "Active Case Management – Case Initiation Notice (County Ct)",
        primaryFee: 476,
        unit: "per matter",
      },
      {
        type: "Active Case Management – case conference prep (County Ct)",
        primaryFee: 714,
        unit: "per conference",
        notes: "Instructor preparation fee for a County Court case conference under ACMS.",
      },
      {
        type: "Active Case Management – case conference appearance (County Ct)",
        primaryFee: 1370,
        unit: "per appearance",
      },
      {
        type: "Active Case Management – Trial Readiness Questionnaire (County Ct)",
        primaryFee: 476,
        unit: "per matter",
      },
      {
        type: "Active Case Management – case assessment hearing (County Ct)",
        primaryFee: 596,
        unit: "per hearing",
      },
    ],
  },
  {
    category: "Table G – Sentence Appeals (County Court)",
    sub: "Appeals against sentence in the County Court",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-600",
    url: "https://www.handbook.vla.vic.gov.au/table-g-lump-sum-fees-sentence-appeals-county-court",
    items: [
      {
        type: "Preparation – sentence appeal (County Court)",
        primaryFee: 1030,
        unit: "per matter",
        notes: "Covers obtaining instructions, preparing the case, proofing witnesses. VLA may limit the number of days for which it makes a grant in County Court appeals.",
      },
      {
        type: "Appearance fee – sentence appeal (County Court)",
        primaryFee: 968,
        unit: "per appearance",
        notes: "Brief fee where counsel is briefed in a County Court sentence appeal.",
      },
      {
        type: "Appearance to hear sentence (County Court appeal)",
        primaryFee: 356,
        unit: "per appearance",
      },
      {
        type: "Mention / adjournment (sentence appeal)",
        primaryFee: 298,
        unit: "per appearance",
      },
    ],
  },
  {
    category: "Table H – Conviction & Sentence Appeals (County Court)",
    sub: "Appeals against sentence and conviction in the County Court",
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-orange-600",
    url: "https://www.handbook.vla.vic.gov.au/table-h-lump-sum-fees-appeals-against-sentence-and-conviction-county-court",
    items: [
      {
        type: "Solicitor preparation – conviction/sentence appeal",
        primaryFee: 1028,
        hours: 5.5,
        unit: "per matter",
        notes: "VLA will not pay additional fees for lawyer to instruct or conferences with counsel. Circuit fees (Table NN) are payable where advocate does not practice in the circuit town.",
      },
      {
        type: "Mention (conviction/sentence appeal)",
        primaryFee: 297,
        hours: 1.25,
        unit: "per mention",
      },
      {
        type: "Daily appearance (conviction/sentence appeal)",
        primaryFee: 1087,
        unit: "per day",
      },
      {
        type: "Sentence (conviction/sentence appeal)",
        primaryFee: 356,
        unit: "per appearance",
      },
    ],
  },
  {
    category: "Table K – Appeals to the Court of Appeal",
    sub: "Conviction and/or sentence appeals in the Court of Appeal",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-600",
    url: "https://www.handbook.vla.vic.gov.au/table-k-lump-sum-fees-appeals-court-appeal",
    items: [
      {
        type: "Leave application – preparation",
        primaryFee: 596,
        hours: 2,
        unit: "per matter",
      },
      {
        type: "Drawing grounds of appeal & written case (conviction/conviction & sentence)",
        primaryFee: 1630,
        hours: 5,
        unit: "per matter",
      },
      {
        type: "Drawing grounds of appeal & written case (sentence only)",
        primaryFee: 978,
        hours: 3,
        unit: "per matter",
      },
      {
        type: "Revision of grounds of appeal",
        primaryFee: 326,
        hours: 1,
        unit: "per matter",
      },
      {
        type: "Application for renewal",
        primaryFee: 326,
        hours: 1,
        unit: "per application",
      },
      {
        type: "Oral hearing (exceptional circumstances)",
        primaryFee: 326,
        hours: 1,
        unit: "per hearing",
        notes: "Payable in exceptional circumstances only.",
      },
      {
        type: "Solicitor preparation – appeal against sentence (Court of Appeal)",
        primaryFee: 894,
        hours: 3,
        unit: "per matter",
      },
      {
        type: "Brief fee – appeal against sentence (includes prep & appearances)",
        primaryFee: 2269,
        unit: "per matter",
        notes: "Covers preparation and all appearance fees for a Court of Appeal sentence appeal.",
      },
      {
        type: "Subsequent day(s) – Court of Appeal",
        primaryFee: 1511,
        unit: "per day",
      },
      {
        type: "Appearance at judgment (Court of Appeal – different day)",
        primaryFee: 491,
        unit: "per appearance",
      },
      {
        type: "Solicitor preparation – appeal against conviction (Court of Appeal)",
        primaryFee: 1490,
        hours: 5,
        unit: "per matter",
      },
      {
        type: "Brief fee – appeal against conviction (includes prep & appearances)",
        primaryFee: 2269,
        unit: "per matter",
      },
    ],
  },
  {
    category: "Table M – Counsel's Fees (Criminal Trials)",
    sub: "Guide to fees for counsel — Senior Counsel, Senior Junior & Junior Counsel",
    color: "bg-slate-50 border-slate-200",
    headerColor: "bg-slate-700",
    url: "https://www.handbook.vla.vic.gov.au/table-m-guide-fees-counsel-criminal-trials",
    items: [
      {
        type: "Trial brief fee – first day (includes conferences)",
        unit: "per day",
        notes: "VLA does not pay counsel's accounts direct. The assigned lawyer is responsible for lodging, administering and paying counsel's accounts.",
        multiRows: [
          { label: "Senior Counsel – County Court", fee: 6264 },
          { label: "Senior Counsel – County Court (20% uplift)", fee: 7516 },
          { label: "Senior Counsel – Supreme Court", fee: 7149 },
          { label: "Senior Counsel – Supreme Court (20% uplift)", fee: 8578 },
          { label: "Senior Junior – County Court", fee: 2982 },
          { label: "Senior Junior – County Court (20% uplift)", fee: 3578 },
          { label: "Senior Junior – Supreme Court", fee: 4737 },
          { label: "Senior Junior – Supreme Court (20% uplift)", fee: 5684 },
          { label: "Junior Counsel – County Court", fee: 1403 },
          { label: "Junior Counsel – County Court (20% uplift)", fee: 1682 },
          { label: "Junior Counsel – Supreme Court", fee: 2524 },
          { label: "Junior Counsel – Supreme Court (20% uplift)", fee: 3028 },
        ],
        primaryFee: 1403,
      },
      {
        type: "Trial – subsequent days",
        unit: "per day",
        multiRows: [
          { label: "Senior Counsel", fee: 3364 },
          { label: "Senior Junior – County Court", fee: 1370 },
          { label: "Senior Junior – Supreme Court", fee: 2197 },
          { label: "Junior Counsel – County Court", fee: 754 },
          { label: "Junior Counsel – Supreme Court", fee: 1091 },
        ],
        primaryFee: 754,
      },
      {
        type: "Plea brief fee – first day (includes conferences)",
        unit: "per day",
        multiRows: [
          { label: "Senior Counsel – County/Supreme", fee: 4025 },
          { label: "Senior Junior – County Court", fee: 1834 },
          { label: "Senior Junior – Supreme Court", fee: 2504 },
          { label: "Junior Counsel – County Court", fee: 1086 },
          { label: "Junior Counsel – Supreme Court", fee: 1395 },
        ],
        primaryFee: 1086,
      },
      {
        type: "Plea – subsequent days",
        unit: "per day",
        multiRows: [
          { label: "Senior Counsel – County/Supreme", fee: 2240 },
          { label: "Senior Junior – County Court", fee: 638 },
          { label: "Senior Junior – Supreme Court", fee: 1002 },
          { label: "Junior Counsel – County Court", fee: 501 },
          { label: "Junior Counsel – Supreme Court", fee: 735 },
        ],
        primaryFee: 501,
      },
      {
        type: "Sentence (different day from plea)",
        unit: "per appearance",
        multiRows: [
          { label: "Senior Counsel – County/Supreme", fee: 661 },
          { label: "Senior Junior – County Court", fee: 356 },
          { label: "Senior Junior – Supreme Court", fee: 491 },
          { label: "Junior Counsel – County Court", fee: 356 },
          { label: "Junior Counsel – Supreme Court", fee: 491 },
        ],
        primaryFee: 356,
      },
      {
        type: "Sentence indication brief fee",
        unit: "per hearing",
        multiRows: [
          { label: "Senior Counsel – County/Supreme", fee: 3138 },
          { label: "Senior Junior – County Court", fee: 1350 },
          { label: "Senior Junior – Supreme Court", fee: 1838 },
          { label: "Junior Counsel – County Court", fee: 780 },
          { label: "Junior Counsel – Supreme Court", fee: 1045 },
        ],
        primaryFee: 780,
      },
      {
        type: "Post-committal negotiations (counsel)",
        unit: "per matter",
        multiRows: [
          { label: "Senior Counsel", fee: 1308 },
          { label: "Senior Junior – County Court", fee: 714 },
          { label: "Senior Junior – Supreme Court", fee: 978 },
          { label: "Junior Counsel – County Court", fee: 438 },
          { label: "Junior Counsel – Supreme Court", fee: 495 },
        ],
        primaryFee: 438,
      },
      {
        type: "First directions hearing (counsel)",
        unit: "per hearing",
        multiRows: [
          { label: "Senior Counsel", fee: 872 },
          { label: "Senior Junior – County Court", fee: 476 },
          { label: "Senior Junior – Supreme Court", fee: 652 },
          { label: "Junior Counsel – County Court", fee: 292 },
          { label: "Junior Counsel – Supreme Court", fee: 330 },
        ],
        primaryFee: 292,
      },
      {
        type: "Directions / mention / callover (counsel)",
        unit: "per appearance",
        multiRows: [
          { label: "Senior Counsel", fee: 545 },
          { label: "Senior Junior – County Court", fee: 297 },
          { label: "Senior Junior – Supreme Court", fee: 407 },
          { label: "Junior Counsel – County Court", fee: 182 },
          { label: "Junior Counsel – Supreme Court", fee: 206 },
        ],
        primaryFee: 182,
      },
      {
        type: "Special hearing brief fee – first day",
        unit: "per day",
        multiRows: [
          { label: "Senior Counsel", fee: 4934 },
          { label: "Senior Junior – County Court", fee: 2501 },
          { label: "Senior Junior – Supreme Court", fee: 3410 },
          { label: "Junior Counsel – County Court", fee: 1249 },
          { label: "Junior Counsel – Supreme Court", fee: 1666 },
        ],
        primaryFee: 1249,
      },
      {
        type: "Special hearing – subsequent days",
        unit: "per day",
        multiRows: [
          { label: "Senior Counsel", fee: 3364 },
          { label: "Senior Junior – County Court", fee: 1370 },
          { label: "Senior Junior – Supreme Court", fee: 2197 },
          { label: "Junior Counsel – County Court", fee: 754 },
          { label: "Junior Counsel – Supreme Court", fee: 1091 },
        ],
        primaryFee: 754,
      },
    ],
  },
];

function fmt(fee) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0 }).format(fee);
}

export default function FeesPayable() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // { catIdx, itemIdx } or { catIdx, itemIdx, subIdx }
  const [expandedGroups, setExpandedGroups] = useState({}); // key: "catIdx-itemIdx"

  const filtered = FEE_CATEGORIES.map((cat, catIdx) => ({
    ...cat,
    catIdx,
    items: cat.items
      .map((item, itemIdx) => ({ ...item, itemIdx }))
      .filter(item => {
        if (!search) return true;
        if (item.isGroup) {
          return item.subItems.some(s => s.type.toLowerCase().includes(search.toLowerCase()));
        }
        return item.type.toLowerCase().includes(search.toLowerCase());
      }),
  })).filter(cat => cat.items.length > 0);

  const selectedCat = selected != null ? FEE_CATEGORIES[selected.catIdx] : null;
  const rawItem = selectedCat ? selectedCat.items[selected.itemIdx] : null;
  const selectedItem = rawItem?.isGroup && selected.subIdx != null
    ? rawItem.subItems[selected.subIdx]
    : (!rawItem?.isGroup ? rawItem : null);

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
          <p className="font-semibold text-slate-800 text-sm">VLA Fees Payable</p>
          <p className="text-xs text-slate-400">Criminal law fee schedule — effective 1 January 2025</p>
        </div>
        <div className="w-24" />
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left: list */}
        <div className="md:w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search fees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
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
                        <button
                          onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))}
                          className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <p className="text-sm font-semibold text-slate-800">{item.type}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-amber-600 bg-amber-50 font-semibold px-1.5 py-0.5 rounded-full">Extension req.</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>
                        {isExpanded && item.subItems.map((sub, subIdx) => {
                          const isSelected = selected?.catIdx === cat.catIdx && selected?.itemIdx === item.itemIdx && selected?.subIdx === subIdx;
                          return (
                            <button
                              key={sub.type}
                              onClick={() => setSelected({ catIdx: cat.catIdx, itemIdx: item.itemIdx, subIdx })}
                              className={`w-full text-left pl-8 pr-4 py-3 border-b border-slate-100 transition-colors ${isSelected ? "bg-purple-50" : "hover:bg-slate-50"}`}
                            >
                              <p className={`text-sm font-medium leading-snug ${isSelected ? "text-purple-700" : "text-slate-700"}`}>{sub.type}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs font-bold ${isSelected ? "text-purple-600" : "text-slate-500"}`}>
                                  {sub.primaryFee != null ? fmt(sub.primaryFee) : "—"}
                                </span>
                                <span className="text-xs text-slate-400">{sub.unit}</span>
                                {sub.extension && <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Extension req.</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  const isSelected = selected?.catIdx === cat.catIdx && selected?.itemIdx === item.itemIdx && selected?.subIdx == null;
                  return (
                    <button
                      key={item.type}
                      onClick={() => setSelected({ catIdx: cat.catIdx, itemIdx: item.itemIdx })}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                        isSelected ? "bg-purple-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <p className={`text-sm font-medium leading-snug ${isSelected ? "text-purple-700" : "text-slate-800"}`}>
                        {item.type}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold ${isSelected ? "text-purple-600" : "text-slate-500"}`}>
                          {fmt(item.primaryFee)}
                          {item.multiRows && <span className="font-normal text-slate-400"> from</span>}
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

        {/* Right: detail */}
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
              {/* Category badge */}
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-block text-xs font-bold uppercase tracking-wide text-white px-3 py-1 rounded-full ${selectedCat.headerColor}`}>
                  {selectedCat.category}
                </span>
                {selectedCat.url && (
                  <a
                    href={selectedCat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    VLA Handbook <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Title + single fee */}
              <div className={`rounded-2xl border p-6 ${selectedCat.color}`}>
                <h1 className="text-xl font-bold text-slate-900 mb-1">{selectedItem.type}</h1>
                <p className="text-sm text-slate-500 mb-4">
                  {selectedItem.unit}
                  {selectedItem.hours && <> · {selectedItem.hours} hours</>}
                  {" · "}fees are GST inclusive
                </p>
                {!selectedItem.multiRows && (
                  <div className="text-4xl font-black text-slate-900">
                    {selectedItem.primaryFee != null ? fmt(selectedItem.primaryFee) : <span className="text-2xl text-slate-400">See VLA Handbook</span>}
                  </div>
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

              {/* Extension warning */}
              {selectedItem.extension && (
                <div className="bg-amber-50 rounded-xl border border-amber-300 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">⚠ Extension of Aid Required</p>
                  {selectedItem.extension.split("\n\n").map((para, i) => (
                    <p key={i} className={`text-sm text-amber-900 leading-relaxed ${i > 0 ? "mt-2" : ""}`}>{para}</p>
                  ))}
                </div>
              )}

              {/* Notes */}
              {selectedItem.notes && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Notes</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedItem.notes}</p>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center">
                Fees effective 1 January 2025 per the VLA Handbook. All fees are GST inclusive. Always verify with the current published VLA fee schedule before claiming.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}