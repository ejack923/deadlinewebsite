const COURT_APPEARANCE_TYPES = {
  "Children's Court": [{ label: "Mention" }, { label: "Plea" }, { label: "Contest Mention" }, { label: "Contest" }, { label: "Sentence" }, { label: "Bail Application" }, { label: "Directions Hearing" }, { label: "Other" }],
  "Magistrates Court": [{ label: "Mention" }, { label: "Further Mention" }, { label: "Hearing (Summary Crime)" }, { label: "Contest Mention" }, { label: "Bail Application" }, { label: "Committal Mention" }, { label: "Committal Hearing" }, { label: "Contested Committal First Day" }, { label: "Contested Committal Day 1" }, { label: "Contested Committal Day 2" }, { label: "Plea" }, { label: "Contest" }, { label: "Sentence" }, { label: "Return for Sentence" }, { label: "Directions Hearing" }, { label: "Case Assessment Hearing" }, { label: "Filing Hearing" }, { label: "ARC Review" }, { label: "Sentence Indication" }, { label: "Appeal" }, { label: "Other" }],
  "County Court": [{ label: "First Directions Hearing" }, { label: "Directions Hearing / Mention / Callover" }, { label: "Case Conference" }, { label: "Bail Application" }, { label: "Plea" }, { label: "Plea (post day 1 of trial)" }, { label: "Plea (subsequent day after day 1 of trial)" }, { label: "Trial (first day)" }, { label: "Trial (first day - 20% uplift applicable)" }, { label: "Trial (subsequent day)" }, { label: "Sentence" }, { label: "Return for Sentence" }, { label: "Sentence Indication" }, { label: "Appeal from Magistrates Court" }, { label: "CMIA Appearance and conference" }, { label: "CMIA Mention" }, { label: "CMIA Judgement" }, { label: "CMIA Hearing (first day)" }, { label: "CMIA Hearing (subsequent day)" }, { label: "SOA Supervision Order Mention / directions" }, { label: "SOA Supervision Order Hearing (first day)" }, { label: "SOA Supervision Order Hearing (subsequent day)" }, { label: "SOA Review Hearing" }, { label: "SOA Review Mention / directions" }, { label: "SOA Review Judgement" }, { label: "Other" }],
  "Supreme Court": [{ label: "First Directions Hearing" }, { label: "Directions Hearing / Mention / Callover" }, { label: "Bail Application" }, { label: "Plea" }, { label: "Plea (post day 1 of trial)" }, { label: "Plea (subsequent day after day 1 of trial)" }, { label: "Trial (first day)" }, { label: "Trial (first day - 20% uplift applicable)" }, { label: "Trial (subsequent day)" }, { label: "Sentence" }, { label: "Return for Sentence" }, { label: "Appeal" }, { label: "CMIA Appearance and conference" }, { label: "CMIA Mention" }, { label: "CMIA Judgement" }, { label: "CMIA Hearing (first day)" }, { label: "CMIA Hearing (subsequent day)" }, { label: "SOA Emergency Detention Order Hearing" }, { label: "SOA Emergency Detention Order Mention / directions" }, { label: "SOA Emergency Detention Order Judgement" }, { label: "SOA Detention Order Mention / directions" }, { label: "SOA Detention Order Hearing (first day)" }, { label: "SOA Detention Order Hearing (subsequent day)" }, { label: "SOA Detention Order Judgement" }, { label: "SOA Supervision Order Mention / directions" }, { label: "SOA Supervision Order Hearing (first day)" }, { label: "SOA Supervision Order Hearing (subsequent day)" }, { label: "SOA Supervision Order Judgement" }, { label: "SOA Review Hearing" }, { label: "SOA Review Mention / directions" }, { label: "SOA Review Judgement" }, { label: "Other" }],
  "Court of appeal": [{ label: "Application for Leave to Appeal" }, { label: "Appeal" }, { label: "Other" }],
  "High Court": [{ label: "Application for Special Leave" }, { label: "Appeal" }, { label: "Other" }],
  "Office of Chief Examiner": [{ label: "Examination" }, { label: "Other" }],
  "Other": [{ label: "Mention" }, { label: "Hearing" }, { label: "Other" }],
};

const APPEARANCE_MATTER_TYPES = {
  "Mention": [{ label: "Criminal" }, { label: "Family Violence Intervention Order" }, { label: "Personal Safety Intervention Order" }, { label: "Other" }],
  "Further Mention": [{ label: "Criminal" }, { label: "Family Violence Intervention Order" }, { label: "Personal Safety Intervention Order" }, { label: "Other" }],
  "Hearing (Summary Crime)": [{ label: "Criminal" }, { label: "Other" }],
  "Contest Mention": [{ label: "Criminal" }, { label: "Other" }],
  "Bail Application": [{ label: "Criminal" }, { label: "Other" }],
  "Committal Mention": [{ label: "Criminal" }, { label: "Other" }],
  "Committal Hearing": [{ label: "Criminal — Contested" }, { label: "Criminal — Uncontested" }, { label: "Other" }],
  "Contested Committal First Day": [{ label: "Criminal" }, { label: "Other" }],
  "Contested Committal Day 1": [{ label: "Criminal" }, { label: "Other" }],
  "Contested Committal Day 2": [{ label: "Criminal" }, { label: "Other" }],
  "Plea": [{ label: "Criminal" }, { label: "Family Violence Intervention Order" }, { label: "Personal Safety Intervention Order" }, { label: "Other" }],
  "Plea (post day 1 of trial)": [{ label: "Criminal" }, { label: "Other" }],
  "Plea (subsequent day after day 1 of trial)": [{ label: "Criminal" }, { label: "Other" }],
  "Contest": [{ label: "Criminal" }, { label: "Family Violence Intervention Order" }, { label: "Personal Safety Intervention Order" }, { label: "Other" }],
  "Trial": [{ label: "Criminal" }, { label: "Other" }],
  "Sentence": [{ label: "Criminal" }, { label: "Other" }],
  "Return for Sentence": [{ label: "Criminal" }, { label: "Other" }],
  "First Directions Hearing": [{ label: "Criminal" }, { label: "Other" }],
  "Directions Hearing": [{ label: "Criminal" }, { label: "Family Violence Intervention Order" }, { label: "Personal Safety Intervention Order" }, { label: "Other" }],
  "Directions Hearing / Mention / Callover": [{ label: "Criminal" }, { label: "Other" }],
  "Case Assessment Hearing": [{ label: "Criminal" }, { label: "Other" }],
  "Case Conference": [{ label: "Criminal" }, { label: "Other" }],
  "Filing Hearing": [{ label: "Criminal" }, { label: "Other" }],
  "ARC Review": [{ label: "Drug Court" }, { label: "Other" }],
  "Sentence Indication": [{ label: "Criminal" }, { label: "Other" }],
  "Trial (first day)": [{ label: "Criminal" }, { label: "Other" }],
  "Trial (first day - 20% uplift applicable)": [{ label: "Criminal" }, { label: "Other" }],
  "Trial (subsequent day)": [{ label: "Criminal" }, { label: "Other" }],
  "Appeal": [{ label: "Criminal" }, { label: "Other" }],
  "Appeal from Magistrates Court": [{ label: "Criminal" }, { label: "Other" }],
  "CMIA Appearance and conference": [{ label: "Criminal" }, { label: "Other" }],
  "CMIA Mention": [{ label: "Criminal" }, { label: "Other" }],
  "CMIA Judgement": [{ label: "Criminal" }, { label: "Other" }],
  "CMIA Hearing (first day)": [{ label: "Criminal" }, { label: "Other" }],
  "CMIA Hearing (subsequent day)": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Emergency Detention Order Hearing": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Emergency Detention Order Mention / directions": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Emergency Detention Order Judgement": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Detention Order Mention / directions": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Detention Order Hearing (first day)": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Detention Order Hearing (subsequent day)": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Detention Order Judgement": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Supervision Order Mention / directions": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Supervision Order Hearing (first day)": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Supervision Order Hearing (subsequent day)": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Supervision Order Judgement": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Review Hearing": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Review Mention / directions": [{ label: "Criminal" }, { label: "Other" }],
  "SOA Review Judgement": [{ label: "Criminal" }, { label: "Other" }],
  "Application for Leave to Appeal": [{ label: "Criminal" }, { label: "Other" }],
  "Application for Special Leave": [{ label: "Criminal" }, { label: "Other" }],
  "Examination": [{ label: "Other" }],
  "Hearing": [{ label: "Other" }],
  "Other": [{ label: "Other" }],
};

const APPEARANCE_FEE_LOOKUP = {
  "Children's Court": {
    "Mention": {
      fee: 185,
      feeType: "Appearance at mention hearing",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Contest Mention": {
      fee: 332,
      feeType: "Contest mention",
      table: "Table A",
      note: "Single accused summary rate for each necessary appearance.",
    },
    "Contest": {
      fee: 1099,
      feeType: "Contest hearing appearance",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Sentence": {
      fee: 318,
      feeType: "Appearance on sentence or adjournment",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Bail Application": {
      fee: 484,
      feeType: "Appearance fee",
      table: "Table B",
      note: "Children's Court or Magistrates' Court bail application.",
    },
  },
  "Magistrates Court": {
    "Mention": {
      fee: 185,
      feeType: "Appearance at mention hearing",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Further Mention": {
      fee: 185,
      feeType: "Appearance at mention hearing",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Contest Mention": {
      fee: 332,
      feeType: "Contest mention",
      table: "Table A",
      note: "Single accused summary rate for each necessary appearance.",
    },
    "Bail Application": {
      fee: 484,
      feeType: "Appearance fee",
      table: "Table B",
      note: "Children's Court or Magistrates' Court bail application.",
    },
    "Committal Mention": {
      fee: 445,
      feeType: "Appearance committal mention/case conference",
      table: "Table E",
      note: "Magistrates' Court stage of an indictable crime matter.",
    },
    "Committal Hearing": {
      fee: 1284,
      feeType: "Appearance on contested committal: day 1",
      table: "Table E",
      note: "Day 1 rate for an indictable committal.",
    },
    "Contested Committal First Day": {
      fee: 1284,
      feeType: "Appearance on contested committal: day 1",
      table: "Table E",
      note: "Day 1 rate for an indictable committal.",
    },
    "Contested Committal Day 1": {
      fee: 1284,
      feeType: "Appearance on contested committal: day 1",
      table: "Table E",
      note: "Day 1 rate for an indictable committal.",
    },
    "Contested Committal Day 2": {
      fee: 1157,
      feeType: "Appearance on contested committal: day 2",
      table: "Table E",
      note: "Day 2 rate for an indictable committal.",
    },
    "Contest": {
      fee: 1099,
      feeType: "Contest hearing appearance",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Sentence": {
      fee: 318,
      feeType: "Appearance on sentence or adjournment",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "Return for Sentence": {
      fee: 318,
      feeType: "Appearance on sentence or adjournment",
      table: "Table A",
      note: "Single accused summary rate.",
    },
    "ARC Review": {
      fee: 185,
      feeType: "Assessment and Referral Court Review Hearing",
      table: "Table A",
      note: "Single accused rate.",
    },
  },
  "County Court": {
    "Mention": {
      fee: 297,
      feeType: "Directions hearing / mention / call over",
      table: "Table F",
      note: "General indictable County Court rate.",
    },
    "First Directions Hearing": {
      fee: 476,
      feeType: "First directions hearing",
      table: "Table F",
      note: "County Court first directions hearing.",
    },
    "Directions Hearing": {
      fee: 297,
      feeType: "Directions hearing / mention / call over",
      table: "Table F",
      note: "General indictable County Court rate.",
    },
    "Directions Hearing / Mention / Callover": {
      fee: 297,
      feeType: "Directions hearing / mention / call over",
      table: "Table F",
      note: "General indictable County Court rate.",
    },
    "Case Conference": {
      fee: 1370,
      feeType: "Appearance at case conference",
      table: "Table F",
      note: "Active Case Management System fee.",
    },
    "Bail Application": {
      fee: 968,
      feeType: "Appearance fee",
      table: "Table C",
      note: "County Court bail application.",
    },
    "Plea": {
      fee: 1834,
      feeType: "Appearance fee – first day",
      table: "Table F",
      note: "County Court plea fee, first day.",
    },
    "Plea (post day 1 of trial)": {
      fee: 1106,
      feeType: "Plea hearing – first day",
      table: "Table F",
      note: "County Court plea after day 1 of trial.",
    },
    "Plea (subsequent day after day 1 of trial)": {
      fee: 638,
      feeType: "Plea hearing – subsequent day",
      table: "Table F",
      note: "County Court plea after day 1 of trial, subsequent day rate.",
    },
    "Sentence": {
      fee: 356,
      feeType: "Sentence",
      table: "Table F",
      note: "County Court plea or trial sentence appearance.",
    },
    "Return for Sentence": {
      fee: 356,
      feeType: "Sentence",
      table: "Table F",
      note: "County Court plea or trial sentence appearance.",
    },
    "Sentence Indication": {
      fee: 1350,
      feeType: "Appearance fee (includes conferences)",
      table: "Table F",
      note: "County Court sentence indication.",
    },
    "Trial": {
      fee: 2982,
      feeType: "Appearance fee – first day",
      table: "Table F",
      note: "County Court trial first day.",
    },
    "Trial (first day)": {
      fee: 2982,
      feeType: "Appearance fee – first day",
      table: "Table F",
      note: "County Court trial first day.",
    },
    "Trial (first day - 20% uplift applicable)": {
      fee: 3578,
      feeType: "Appearance fee – first day where 20% uplift applicable",
      table: "Table F",
      note: "County Court trial first day uplift rate.",
    },
    "Trial (subsequent day)": {
      fee: 1370,
      feeType: "Appearance fee – subsequent day",
      table: "Table F",
      note: "County Court trial subsequent day.",
    },
    "CMIA Appearance and conference": {
      fee: 707,
      feeType: "Appearance and conference",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Mention": {
      fee: 297,
      feeType: "Mention fee",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Judgement": {
      fee: 356,
      feeType: "Judgement",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Hearing (first day)": {
      fee: 2982,
      feeType: "Appearance fee – first day (includes conferences)",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Hearing (subsequent day)": {
      fee: 1370,
      feeType: "Appearance fee – subsequent day",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "SOA Supervision Order Mention / directions": {
      fee: 298,
      feeType: "Mention / directions",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Supervision Order Hearing (first day)": {
      fee: 2501,
      feeType: "Brief (includes conferences)",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Supervision Order Hearing (subsequent day)": {
      fee: 1370,
      feeType: "Subsequent day",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Review Hearing": {
      fee: 1087,
      feeType: "Daily appearance fee",
      table: "Table Z",
      note: "Review brought by a person subject to an order.",
    },
    "SOA Review Mention / directions": {
      fee: 298,
      feeType: "Mention / directions",
      table: "Table Z",
      note: "Review brought by a person subject to an order.",
    },
    "SOA Review Judgement": {
      fee: 356,
      feeType: "Judgement fee",
      table: "Table Z",
      note: "Review brought by a person subject to an order.",
    },
  },
  "Supreme Court": {
    "Mention": {
      fee: 407,
      feeType: "Directions hearing / mention / call over",
      table: "Table F",
      note: "General indictable Supreme Court rate.",
    },
    "First Directions Hearing": {
      fee: 652,
      feeType: "First directions hearing",
      table: "Table F",
      note: "Supreme Court first directions hearing.",
    },
    "Directions Hearing": {
      fee: 407,
      feeType: "Directions hearing / mention / call over",
      table: "Table F",
      note: "General indictable Supreme Court rate.",
    },
    "Directions Hearing / Mention / Callover": {
      fee: 407,
      feeType: "Directions hearing / mention / call over",
      table: "Table F",
      note: "General indictable Supreme Court rate.",
    },
    "Bail Application": {
      fee: 1041,
      feeType: "Appearance fee",
      table: "Table D",
      note: "Supreme Court bail application.",
    },
    "Plea": {
      fee: 2504,
      feeType: "Appearance fee – first day",
      table: "Table F",
      note: "Supreme Court plea fee, first day.",
    },
    "Plea (post day 1 of trial)": {
      fee: 1508,
      feeType: "Plea hearing – first day",
      table: "Table F",
      note: "Supreme Court plea after day 1 of trial.",
    },
    "Plea (subsequent day after day 1 of trial)": {
      fee: 1002,
      feeType: "Plea hearing – subsequent day",
      table: "Table F",
      note: "Supreme Court plea after day 1 of trial, subsequent day rate.",
    },
    "Sentence": {
      fee: 491,
      feeType: "Sentence",
      table: "Table F",
      note: "Supreme Court plea or trial sentence appearance.",
    },
    "Return for Sentence": {
      fee: 491,
      feeType: "Sentence",
      table: "Table F",
      note: "Supreme Court plea or trial sentence appearance.",
    },
    "Trial": {
      fee: 4737,
      feeType: "Appearance fee – first day",
      table: "Table F",
      note: "Supreme Court trial first day.",
    },
    "Trial (first day)": {
      fee: 4737,
      feeType: "Appearance fee – first day",
      table: "Table F",
      note: "Supreme Court trial first day.",
    },
    "Trial (first day - 20% uplift applicable)": {
      fee: 5684,
      feeType: "Appearance fee – first day where 20% uplift applicable",
      table: "Table F",
      note: "Supreme Court trial first day uplift rate.",
    },
    "Trial (subsequent day)": {
      fee: 2197,
      feeType: "Appearance fee – subsequent day",
      table: "Table F",
      note: "Supreme Court trial subsequent day.",
    },
    "CMIA Appearance and conference": {
      fee: 1344,
      feeType: "Appearance and conference",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Mention": {
      fee: 407,
      feeType: "Mention fee",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Judgement": {
      fee: 491,
      feeType: "Judgement",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Hearing (first day)": {
      fee: 4737,
      feeType: "Appearance fee – first day (includes conferences)",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "CMIA Hearing (subsequent day)": {
      fee: 2197,
      feeType: "Appearance fee – subsequent day",
      table: "Table T",
      note: "Crimes (Mental Impairment and Unfitness to be Tried) Act matter.",
    },
    "SOA Emergency Detention Order Hearing": {
      fee: 1050,
      feeType: "Daily appearance fee",
      table: "Table Z",
      note: "Serious Offenders Act emergency detention order matter.",
    },
    "SOA Emergency Detention Order Mention / directions": {
      fee: 408,
      feeType: "Mention / directions",
      table: "Table Z",
      note: "Serious Offenders Act emergency detention order matter.",
    },
    "SOA Emergency Detention Order Judgement": {
      fee: 491,
      feeType: "Judgement fee",
      table: "Table Z",
      note: "Serious Offenders Act emergency detention order matter.",
    },
    "SOA Detention Order Mention / directions": {
      fee: 408,
      feeType: "Mention / directions",
      table: "Table Z",
      note: "Serious Offenders Act detention order matter.",
    },
    "SOA Detention Order Hearing (first day)": {
      fee: 4737,
      feeType: "Brief (includes conferences)",
      table: "Table Z",
      note: "Serious Offenders Act detention order matter.",
    },
    "SOA Detention Order Hearing (subsequent day)": {
      fee: 2197,
      feeType: "Subsequent day",
      table: "Table Z",
      note: "Serious Offenders Act detention order matter.",
    },
    "SOA Detention Order Judgement": {
      fee: 491,
      feeType: "Judgement fee",
      table: "Table Z",
      note: "Serious Offenders Act detention order matter.",
    },
    "SOA Supervision Order Mention / directions": {
      fee: 408,
      feeType: "Mention / directions",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Supervision Order Hearing (first day)": {
      fee: 4074,
      feeType: "Brief (includes conferences)",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Supervision Order Hearing (subsequent day)": {
      fee: 2197,
      feeType: "Subsequent day",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Supervision Order Judgement": {
      fee: 491,
      feeType: "Judgement fee",
      table: "Table Z",
      note: "Serious Offenders Act supervision order matter.",
    },
    "SOA Review Hearing": {
      fee: 2273,
      feeType: "Daily appearance fee",
      table: "Table Z",
      note: "Review brought by a person subject to an order.",
    },
    "SOA Review Mention / directions": {
      fee: 408,
      feeType: "Mention / directions",
      table: "Table Z",
      note: "Review brought by a person subject to an order.",
    },
    "SOA Review Judgement": {
      fee: 491,
      feeType: "Judgement fee",
      table: "Table Z",
      note: "Review brought by a person subject to an order.",
    },
  },
  "Court of appeal": {
    "Application for Leave to Appeal": {
      fee: 326,
      feeType: "Oral hearing",
      table: "Table K",
      note: "Exceptional circumstances leave application hearing.",
    },
    "Appeal": {
      fee: 2269,
      feeType: "Brief fee (includes preparation and appearances)",
      table: "Table K",
      note: "Court of Appeal rate for appeal against sentence or conviction/conviction and sentence.",
    },
  },
  "High Court": {
    "Application for Special Leave": {
      fee: 2269,
      feeType: "Appearance fee",
      table: "Table L",
      note: "High Court special leave application, first day.",
    },
    "Appeal": {
      fee: 2269,
      feeType: "Appearance fee",
      table: "Table L",
      note: "High Court appeal, first day.",
    },
  },
};

const APPEAL_COSTS_CERTIFICATE_FEE_LOOKUP = {
  "Magistrates Court": {
    "Hearing (Summary Crime)": {
      fee: 484,
      feeType: "Hearing (summary crime) – appearance fee in all matters",
      table: "Table BBB",
      note: "Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Contest Mention": {
      fee: 332,
      feeType: "Contest mention (summary crime) – contest mention fee",
      table: "Table BBB",
      note: "Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Committal Mention": {
      fee: 447,
      feeType: "Committal mention – committal mention fee",
      table: "Table BBB",
      note: "Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Contested Committal First Day": {
      fee: 1157,
      feeType: "Contested committal – second day fee",
      table: "Table BBB",
      note: "Appeal Costs Certificate table wording uses the second day fee.",
      certificateFee: true,
    },
    "Contested Committal Day 1": {
      fee: 1157,
      feeType: "Contested committal – second day fee",
      table: "Table BBB",
      note: "Appeal Costs Certificate table wording uses the second day fee.",
      certificateFee: true,
    },
    "Contested Committal Day 2": {
      fee: 1157,
      feeType: "Contested committal – second day fee",
      table: "Table BBB",
      note: "Appeal Costs Certificate rate.",
      certificateFee: true,
    },
  },
  "County Court": {
    "Appeal from Magistrates Court": {
      fee: 968,
      feeType: "Appeal – brief fee",
      table: "Table BBB",
      note: "Per day or part day. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Plea": {
      fee: 638,
      feeType: "Plea – second day fee",
      table: "Table BBB",
      note: "Per day or part day. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Trial": {
      fee: 1370,
      feeType: "Trial, single day adjournment – subsequent day fee",
      table: "Table BBB",
      note: "Counsel rate per day. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Trial (subsequent day)": {
      fee: 1370,
      feeType: "Trial, single day adjournment – subsequent day fee",
      table: "Table BBB",
      note: "Counsel rate per day. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
  },
  "Supreme Court": {
    "Appeal": {
      fee: 2269,
      feeType: "Appeal – brief fee",
      table: "Table BBB",
      note: "Per day or part day. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Plea": {
      fee: 1002,
      feeType: "Plea – second day fee",
      table: "Table BBB",
      note: "Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Trial": {
      fee: 2197,
      feeType: "Trial, single day adjournment – subsequent day fee",
      table: "Table BBB",
      note: "Per day or part day. Counsel rate. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
    "Trial (subsequent day)": {
      fee: 2197,
      feeType: "Trial, single day adjournment – subsequent day fee",
      table: "Table BBB",
      note: "Per day or part day. Counsel rate. Appeal Costs Certificate rate.",
      certificateFee: true,
    },
  },
};

const COUNSEL_TRIAL_FEE_LOOKUP = {
  "County Court": {
    "Mention": {
      feeType: "Directions hearing / mention / callover",
      table: "Table M",
      roles: {
        "Senior Counsel": 545,
        "Senior Junior Counsel": 297,
        "Junior Counsel / Trial Counsel Development Program": 182,
      },
    },
    "First Directions Hearing": {
      feeType: "First directions hearing",
      table: "Table M",
      roles: {
        "Senior Counsel": 872,
        "Senior Junior Counsel": 476,
        "Junior Counsel / Trial Counsel Development Program": 292,
      },
    },
    "Directions Hearing": {
      feeType: "Directions hearing / mention / callover",
      table: "Table M",
      roles: {
        "Senior Counsel": 545,
        "Senior Junior Counsel": 297,
        "Junior Counsel / Trial Counsel Development Program": 182,
      },
    },
    "Directions Hearing / Mention / Callover": {
      feeType: "Directions hearing / mention / callover",
      table: "Table M",
      roles: {
        "Senior Counsel": 545,
        "Senior Junior Counsel": 297,
        "Junior Counsel / Trial Counsel Development Program": 182,
      },
    },
    "Plea": {
      feeType: "Brief fee – first day (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 4025,
        "Senior Junior Counsel": 1834,
        "Junior Counsel / Trial Counsel Development Program": 1086,
      },
    },
    "Plea (post day 1 of trial)": {
      feeType: "Plea hearing",
      table: "Table M",
      roles: {
        "Senior Counsel": 2694,
        "Senior Junior Counsel": 1106,
        "Junior Counsel / Trial Counsel Development Program": 628,
      },
    },
    "Plea (subsequent day after day 1 of trial)": {
      feeType: "Plea hearing – subsequent days",
      table: "Table M",
      roles: {
        "Senior Counsel": 2240,
        "Senior Junior Counsel": 638,
        "Junior Counsel / Trial Counsel Development Program": 501,
      },
    },
    "Sentence": {
      feeType: "Sentence (if on a different day)",
      table: "Table M",
      roles: {
        "Senior Counsel": 661,
        "Senior Junior Counsel": 356,
        "Junior Counsel / Trial Counsel Development Program": 356,
      },
    },
    "Return for Sentence": {
      feeType: "Sentence (if on a different day)",
      table: "Table M",
      roles: {
        "Senior Counsel": 661,
        "Senior Junior Counsel": 356,
        "Junior Counsel / Trial Counsel Development Program": 356,
      },
    },
    "Sentence Indication": {
      feeType: "Brief fee (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 3138,
        "Senior Junior Counsel": 1350,
        "Junior Counsel / Trial Counsel Development Program": 780,
      },
    },
    "Trial": {
      feeType: "Brief fee – first day (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 6264,
        "Senior Junior Counsel": 2982,
        "Junior Counsel / Trial Counsel Development Program": 1403,
      },
      note: "First-day trial fee.",
    },
    "Trial (first day)": {
      feeType: "Brief fee – first day (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 6264,
        "Senior Junior Counsel": 2982,
        "Junior Counsel / Trial Counsel Development Program": 1403,
      },
    },
    "Trial (first day - 20% uplift applicable)": {
      feeType: "Brief fee – first day where 20% uplift applicable",
      table: "Table M",
      roles: {
        "Senior Counsel": 7516,
        "Senior Junior Counsel": 3578,
        "Junior Counsel / Trial Counsel Development Program": 1682,
      },
    },
    "Trial (subsequent day)": {
      feeType: "Subsequent day",
      table: "Table M",
      roles: {
        "Senior Counsel": 3364,
        "Senior Junior Counsel": 1370,
        "Junior Counsel / Trial Counsel Development Program": 754,
      },
    },
  },
  "Supreme Court": {
    "Mention": {
      feeType: "Directions hearing / mention / callover",
      table: "Table M",
      roles: {
        "Senior Counsel": 545,
        "Senior Junior Counsel": 407,
        "Junior Counsel / Trial Counsel Development Program": 206,
      },
    },
    "First Directions Hearing": {
      feeType: "First directions hearing",
      table: "Table M",
      roles: {
        "Senior Counsel": 872,
        "Senior Junior Counsel": 652,
        "Junior Counsel / Trial Counsel Development Program": 330,
      },
    },
    "Directions Hearing": {
      feeType: "Directions hearing / mention / callover",
      table: "Table M",
      roles: {
        "Senior Counsel": 545,
        "Senior Junior Counsel": 407,
        "Junior Counsel / Trial Counsel Development Program": 206,
      },
    },
    "Directions Hearing / Mention / Callover": {
      feeType: "Directions hearing / mention / callover",
      table: "Table M",
      roles: {
        "Senior Counsel": 545,
        "Senior Junior Counsel": 407,
        "Junior Counsel / Trial Counsel Development Program": 206,
      },
    },
    "Plea": {
      feeType: "Brief fee – first day (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 4025,
        "Senior Junior Counsel": 2504,
        "Junior Counsel / Trial Counsel Development Program": 1395,
      },
    },
    "Plea (post day 1 of trial)": {
      feeType: "Plea hearing",
      table: "Table M",
      roles: {
        "Senior Counsel": 2694,
        "Senior Junior Counsel": 1508,
        "Junior Counsel / Trial Counsel Development Program": 880,
      },
    },
    "Plea (subsequent day after day 1 of trial)": {
      feeType: "Plea hearing – subsequent days",
      table: "Table M",
      roles: {
        "Senior Counsel": 2240,
        "Senior Junior Counsel": 1002,
        "Junior Counsel / Trial Counsel Development Program": 735,
      },
    },
    "Sentence": {
      feeType: "Sentence (if on a different day)",
      table: "Table M",
      roles: {
        "Senior Counsel": 661,
        "Senior Junior Counsel": 491,
        "Junior Counsel / Trial Counsel Development Program": 491,
      },
    },
    "Return for Sentence": {
      feeType: "Sentence (if on a different day)",
      table: "Table M",
      roles: {
        "Senior Counsel": 661,
        "Senior Junior Counsel": 491,
        "Junior Counsel / Trial Counsel Development Program": 491,
      },
    },
    "Trial": {
      feeType: "Brief fee – first day (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 7149,
        "Senior Junior Counsel": 4737,
        "Junior Counsel / Trial Counsel Development Program": 2524,
      },
      note: "First-day trial fee.",
    },
    "Trial (first day)": {
      feeType: "Brief fee – first day (includes conferences)",
      table: "Table M",
      roles: {
        "Senior Counsel": 7149,
        "Senior Junior Counsel": 4737,
        "Junior Counsel / Trial Counsel Development Program": 2524,
      },
    },
    "Trial (first day - 20% uplift applicable)": {
      feeType: "Brief fee – first day where 20% uplift applicable",
      table: "Table M",
      roles: {
        "Senior Counsel": 8578,
        "Senior Junior Counsel": 5684,
        "Junior Counsel / Trial Counsel Development Program": 3028,
      },
    },
    "Trial (subsequent day)": {
      feeType: "Subsequent day",
      table: "Table M",
      roles: {
        "Senior Counsel": 3364,
        "Senior Junior Counsel": 2197,
        "Junior Counsel / Trial Counsel Development Program": 1091,
      },
    },
  },
};

const COUNSEL_TYPE_OPTIONS = [
  { value: "n_a", label: "N/A" },
  { value: "Senior Counsel", label: "Senior Counsel" },
  { value: "Senior Junior Counsel", label: "Senior Junior Counsel" },
  { value: "Junior Counsel / Trial Counsel Development Program", label: "Junior Counsel / Trial Counsel Development Program" },
];

const HOURLY_PREPARATION_RATES = {
  "County Court": {
    "Senior Counsel": 436,
    Counsel: 238,
    Solicitor: 187,
  },
  "Supreme Court": {
    "Senior Counsel": 436,
    Counsel: 326,
    Solicitor: 298,
  },
};

const CMIA_SUPPORTING_RATES = {
  "County Court": {
    preparationHours: 8,
    preparationRate: 187,
    preparationFee: 1496,
    instructingRate: 165,
    instructingMaxHours: 5,
  },
  "Supreme Court": {
    preparationHours: 8,
    preparationRate: 298,
    preparationFee: 2384,
    instructingRate: 298,
    instructingMaxHours: 5,
  },
};

const SOA_SUPPORTING_RATES = {
  "County Court": {
    "SOA Supervision Order Hearing (first day)": {
      preparation: "5 hours at $187 per hour = $935",
      instructing: "$165 per hour, up to 5 hours per day",
    },
    "SOA Review Hearing": {
      preparation: "5 hours at $187 per hour = $935",
      instructing: "",
    },
  },
  "Supreme Court": {
    "SOA Emergency Detention Order Hearing": {
      preparation: "3.5 hours at $298 per hour = $1043",
      instructing: "",
    },
    "SOA Detention Order Hearing (first day)": {
      preparation: "10 hours at $298 per hour = $2980",
      instructing: "$298 per hour, up to 5 hours per day",
    },
    "SOA Supervision Order Hearing (first day)": {
      preparation: "7 hours at $298 per hour = $2086",
      instructing: "$298 per hour, up to 5 hours per day",
    },
    "SOA Review Hearing": {
      preparation: "7 hours at $298 per hour = $2086",
      instructing: "",
    },
  },
};

const CIRCUIT_FEES_BY_TOWN = {
  Ararat: { firstDay: 259, laterDays: 171, overnight: 394 },
  Bairnsdale: { firstDay: 286, laterDays: 190, overnight: 394 },
  Ballarat: { firstDay: 187, laterDays: 126, overnight: 394 },
  Bendigo: { firstDay: 214, laterDays: 141, overnight: 394 },
  Colac: { firstDay: 217, laterDays: 141, overnight: 394 },
  Geelong: { firstDay: 151, laterDays: 98, overnight: 394 },
  Hamilton: { firstDay: 300, laterDays: 197, overnight: 394 },
  Horsham: { firstDay: 300, laterDays: 197, overnight: 394 },
  Kerang: { firstDay: 300, laterDays: 197, overnight: 394 },
  Korumburra: { firstDay: 187, laterDays: 126, overnight: 394 },
  Mildura: {
    firstDay: 363,
    laterDays: 245,
    overnight: 394,
    note: "If the return economy airfare is more than the first day circuit fee, VLA will pay the airfare instead of the first day circuit fee.",
  },
  Sale: { firstDay: 259, laterDays: 168, overnight: 394 },
  Shepparton: { firstDay: 247, laterDays: 165, overnight: 394 },
  Wangaratta: { firstDay: 272, laterDays: 185, overnight: 394 },
  Warrnambool: { firstDay: 286, laterDays: 190, overnight: 394 },
  Wodonga: { firstDay: 300, laterDays: 197, overnight: 394 },
};

const CIRCUIT_LOCATION_ALIASES = {
  "Latrobe Valley": "Morwell",
};

const CIRCUIT_FEE_ELIGIBILITY = {
  "Magistrates Court": {
    "Committal Hearing": { feeType: "Circuit fee for contested committal", includeOvernight: true },
    "Contested Committal First Day": { feeType: "Circuit fee for contested committal", includeOvernight: true },
    "Contested Committal Day 1": { feeType: "Circuit fee for contested committal", includeOvernight: true },
    "Contested Committal Day 2": { feeType: "Circuit fee for contested committal", includeOvernight: true },
  },
  "County Court": {
    "Bail Application": { feeType: "Circuit fee for bail hearing", includeOvernight: true },
    "Plea": { feeType: "Circuit fee for plea hearing", includeOvernight: true },
    "Plea (post day 1 of trial)": { feeType: "Circuit fee for plea hearing", includeOvernight: true },
    "Plea (subsequent day after day 1 of trial)": { feeType: "Circuit fee for plea hearing", includeOvernight: true },
    "Appeal from Magistrates Court": { feeType: "Circuit fee for appeal", includeOvernight: true },
    "Trial": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
    "Trial (first day)": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
    "Trial (first day - 20% uplift applicable)": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
    "Trial (subsequent day)": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
  },
  "Supreme Court": {
    "Bail Application": { feeType: "Circuit fee for bail hearing", includeOvernight: true },
    "Plea": { feeType: "Circuit fee for plea hearing", includeOvernight: true },
    "Plea (post day 1 of trial)": { feeType: "Circuit fee for plea hearing", includeOvernight: true },
    "Plea (subsequent day after day 1 of trial)": { feeType: "Circuit fee for plea hearing", includeOvernight: true },
    "Trial": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
    "Trial (first day)": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
    "Trial (first day - 20% uplift applicable)": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
    "Trial (subsequent day)": { feeType: "Solicitor out-of-office fee for trial", solicitorOutOfOffice: true },
  },
};

const COUNSEL_CIRCUIT_FEES_BY_TOWN = {
  Ararat: 749,
  Bairnsdale: 1125,
  Ballarat: 373,
  Bendigo: 562,
  Colac: 562,
  Geelong: 187,
  Hamilton: 1125,
  Horsham: 1220,
  Kerang: 1125,
  Korumburra: 373,
  Mildura: 1450,
  Morwell: 562,
  Sale: 843,
  Shepparton: 656,
  Wangaratta: 939,
  Warragul: 373,
  Warrnambool: 1032,
  Wodonga: 1220,
};

const COUNSEL_CIRCUIT_FEE_ELIGIBILITY = {
  "County Court": {
    "Trial": true,
    "Trial (first day)": true,
    "Trial (first day - 20% uplift applicable)": true,
    "Trial (subsequent day)": true,
  },
  "Supreme Court": {
    "Trial": true,
    "Trial (first day)": true,
    "Trial (first day - 20% uplift applicable)": true,
    "Trial (subsequent day)": true,
  },
};

function formatFee(fee) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fee);
}

export function getAppearanceTypesForCourt(courtName) {
  return COURT_APPEARANCE_TYPES[courtName] || COURT_APPEARANCE_TYPES.Other;
}

export function getMatterTypesForAppearanceType(appearanceType) {
  return APPEARANCE_MATTER_TYPES[appearanceType] || [{ label: "Other" }];
}

export function getAppearanceFeeInfo(courtName, appearanceType) {
  const feeInfo = APPEARANCE_FEE_LOOKUP[courtName]?.[appearanceType];
  if (!feeInfo) return null;

  return {
    ...feeInfo,
    amountLabel: formatFee(feeInfo.fee),
  };
}

export function getAppealCostsCertificateFeeInfo(courtName, appearanceType) {
  const feeInfo = APPEAL_COSTS_CERTIFICATE_FEE_LOOKUP[courtName]?.[appearanceType];
  if (!feeInfo) return null;

  return {
    ...feeInfo,
    amountLabel: formatFee(feeInfo.fee),
  };
}

export function getCounselTrialFeeInfo(courtName, appearanceType) {
  const feeInfo = COUNSEL_TRIAL_FEE_LOOKUP[courtName]?.[appearanceType];
  if (!feeInfo) return null;

  return {
    ...feeInfo,
    roleFees: Object.entries(feeInfo.roles).map(([role, fee]) => ({
      role,
      fee,
      amountLabel: formatFee(fee),
    })),
  };
}

export function getCounselTypeOptions() {
  return COUNSEL_TYPE_OPTIONS;
}

export function getCircuitFeeInfo(courtName, appearanceType, regionalLocation) {
  const gazettedTown = CIRCUIT_LOCATION_ALIASES[regionalLocation] || regionalLocation;
  const locationFees = CIRCUIT_FEES_BY_TOWN[gazettedTown];
  const eligibility = CIRCUIT_FEE_ELIGIBILITY[courtName]?.[appearanceType];
  if (!locationFees || !eligibility) return null;

  const feeItems = eligibility.solicitorOutOfOffice
    ? [
        {
          label: "Out-of-office fee",
          amount: locationFees.firstDay,
          amountLabel: formatFee(locationFees.firstDay),
        },
        {
          label: "Overnight fee",
          amount: locationFees.overnight,
          amountLabel: formatFee(locationFees.overnight),
        },
      ]
    : [
        {
          label: "First day",
          amount: locationFees.firstDay,
          amountLabel: formatFee(locationFees.firstDay),
        },
        {
          label: "Second and later days",
          amount: locationFees.laterDays,
          amountLabel: formatFee(locationFees.laterDays),
        },
        {
          label: "Overnight fee",
          amount: locationFees.overnight,
          amountLabel: formatFee(locationFees.overnight),
        },
      ];

  return {
    regionalLocation,
    gazettedTown,
    feeType: eligibility.feeType,
    feeItems,
    note: locationFees.note || "",
  };
}

export function getCounselCircuitFeeInfo(courtName, appearanceType, regionalLocation) {
  const gazettedTown = CIRCUIT_LOCATION_ALIASES[regionalLocation] || regionalLocation;
  const circuitFee = COUNSEL_CIRCUIT_FEES_BY_TOWN[gazettedTown];
  const isEligible = Boolean(COUNSEL_CIRCUIT_FEE_ELIGIBILITY[courtName]?.[appearanceType]);
  const overnightFee = CIRCUIT_FEES_BY_TOWN[gazettedTown]?.overnight;
  if (!circuitFee || !isEligible || !overnightFee) return null;

  return {
    regionalLocation,
    gazettedTown,
    feeType: "Counsel circuit fee for each 5-day period or part of trial",
    circuitFee: formatFee(circuitFee),
    overnightFee: formatFee(overnightFee),
    note: "If the trial lasts longer than five sitting days, an additional circuit fee is payable. Overnight fee is also payable if counsel must stay overnight in the circuit town.",
  };
}

export function getHourlyPreparationFeeInfo(courtName, appearanceType) {
  if (!COUNSEL_TRIAL_FEE_LOOKUP[courtName]?.[appearanceType]) return null;

  const rates = HOURLY_PREPARATION_RATES[courtName];
  if (!rates) return null;

  return {
    feeType: "Hourly preparation fees and conferences",
    rates: Object.entries(rates).map(([role, fee]) => ({
      role,
      fee,
      amountLabel: formatFee(fee),
    })),
    note: "Preparation fees are payable to trial counsel only. No preparation fees are available for junior or co-counsel.",
  };
}

export function getCmiaFeeInfo(courtName, appearanceType) {
  if (!appearanceType.startsWith("CMIA ")) return null;

  const courtRates = CMIA_SUPPORTING_RATES[courtName];
  if (!courtRates) return null;

  return {
    feeType: "Crimes (Mental Impairment and Unfitness to be Tried) Act supporting rates",
    preparation: `${formatFee(courtRates.preparationRate)} per hour for ${courtRates.preparationHours} hours = ${formatFee(courtRates.preparationFee)}`,
    instructing: `${formatFee(courtRates.instructingRate)} per hour, up to ${courtRates.instructingMaxHours} hours per day`,
    note: "These fees may be increased in matters involving a revocation of a supervision order, an order for review, or a major review.",
  };
}

export function getSoaFeeInfo(courtName, appearanceType) {
  if (!appearanceType.startsWith("SOA ")) return null;

  const supporting = SOA_SUPPORTING_RATES[courtName]?.[appearanceType];
  return {
    feeType: "Serious Offenders Act supporting rates",
    preparation: supporting?.preparation || "",
    instructing: supporting?.instructing || "",
    note: "VLA may allow additional claims for additional preparation by counsel with advance approval.",
  };
}
