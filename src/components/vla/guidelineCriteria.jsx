// All VLA Guideline criteria definitions
export const GUIDELINES = {
  "1.1": {
    label: "Guideline 1.1 – 'not guilty' plea in the Magistrates' Court",
    criteria: [
      {
        id: "1.1_means",
        label: "Means Test",
        items: [
          { id: "1.1_means_1", text: "Client satisfies VLA means test" },
          { id: "1.1_means_2", text: "Proof of means obtained and on file" },
        ],
      },
      {
        id: "1.1_merit",
        label: "Merit Test",
        items: [
          { id: "1.1_merit_1", text: "The individual must plead not guilty" },
          { id: "1.1_merit_2", text: "There should be a reasonable prospect of acquittal on one or more charges" },
          { id: "1.1_merit_3", text: "A conviction is likely to result in immediate imprisonment" },
          { id: "1.1_merit_4", text: "The individual is an Aboriginal and/or Torres Strait Islander person" },
          { id: "1.1_merit_5", text: "The individual is a woman and/or a member of the LGBTQ+ community charged with family violence offences due to being misidentified as the predominant aggressor by the police" },
          { id: "1.1_merit_6", text: "An unjustified, disproportionate, or unreasonable use of power by a person in a special position of authority, such as a police officer, led to the charges being laid" },
        ],
      },
      {
        id: "1.1_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "1.1_docs_1", text: "Reference to Guideline 1.1 noted" },
          { id: "1.1_docs_2", text: "Copies of the charge(s)" },
          { id: "1.1_docs_3", text: "Full details of prior convictions (if any)" },
          { id: "1.1_docs_4", text: "Lawyer's assessment of strengths and weaknesses of the defence(s)" },
          { id: "1.1_docs_5", text: "Lawyer's assessment of likely penalty having regard to prior convictions (if any)" },
          { id: "1.1_docs_6", text: "Relevant proof of means (if waiver does not apply)" },
        ],
      },
    ],
  },
  "1.2": {
    label: "Guideline 1.2 – 'guilty' plea in the Magistrates' Court",
    criteria: [
      {
        id: "1.2_means",
        label: "Means Test",
        items: [
          { id: "1.2_means_1", text: "Client satisfies VLA means test" },
          { id: "1.2_means_2", text: "Proof of means obtained and on file" },
        ],
      },
      {
        id: "1.2_merit",
        label: "Merit Test",
        items: [
          { id: "1.2_merit_1", text: "No reasonable prospect of acquittal OR client/lawyer does not provide enough information to support such a view" },
          { id: "1.2_merit_2", text: "A conviction is likely to result in a term of immediate imprisonment" },
        ],
      },
      {
        id: "1.2_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "1.2_docs_1", text: "Reference to Guideline 1.2 noted" },
          { id: "1.2_docs_2", text: "Copies of the charge(s)" },
          { id: "1.2_docs_3", text: "Full details of prior convictions (if any)" },
          { id: "1.2_docs_4", text: "Lawyer's assessment of likely penalty having regard to prior relevant convictions" },
          { id: "1.2_docs_5", text: "Lawyer's assessment of strengths and weaknesses of defence(s)" },
          { id: "1.2_docs_6", text: "Relevant proof of means (if waiver does not apply)" },
        ],
      },
    ],
  },
  "1.3": {
    label: "Guideline 1.3 – Assessment and Referral Court List matters",
    criteria: [
      {
        id: "1.3_means",
        label: "Means Test",
        items: [
          { id: "1.3_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "1.3_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "1.3_merit_1", text: "Client is participating in the Assessment and Referral Court (ARC) List" },
          { id: "1.3_merit_2", text: "Matter involves a mental health condition or cognitive impairment linked to the offending" },
          { id: "1.3_merit_3", text: "A sentence of immediate imprisonment is likely if the matter proceeded to a plea/contest" },
        ],
      },
      {
        id: "1.3_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "1.3_docs_1", text: "Reference to Guideline 1.3 noted" },
          { id: "1.3_docs_2", text: "Copies of the charge(s)" },
          { id: "1.3_docs_3", text: "Evidence of ARC List participation" },
          { id: "1.3_docs_4", text: "Relevant proof of means (if waiver does not apply)" },
        ],
      },
    ],
  },
  "13": {
    label: "Guideline 13 (Civil Guideline) – infringements cases",
    criteria: [
      {
        id: "13_means",
        label: "Means Test",
        items: [
          { id: "13_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "13_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "13_merit_1", text: "Client has infringement(s) referred to the Infringements Court (Magistrates' Court)" },
          { id: "13_merit_2", text: "Client has a special circumstances defence OR other compelling defence to the infringement(s)" },
          { id: "13_merit_3", text: "Enforcement warrant has been issued OR matter is listed for hearing" },
        ],
      },
      {
        id: "13_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "13_docs_1", text: "Reference to Guideline 13 noted" },
          { id: "13_docs_2", text: "Details of the infringement(s)" },
          { id: "13_docs_3", text: "Lawyer's assessment of the special circumstances / defence" },
          { id: "13_docs_4", text: "Relevant proof of means (if waiver does not apply)" },
        ],
      },
    ],
  },
  "1.4": {
    label: "Guidelines 1.4 – social security prosecutions – Not Guilty pleas",
    criteria: [
      {
        id: "1.4_means",
        label: "Means Test",
        items: [
          { id: "1.4_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "1.4_merit",
        label: "Merit Test",
        items: [
          { id: "1.4_merit_1", text: "There is a reasonable prospect of acquittal" },
          { id: "1.4_merit_2", text: "The total amount alleged to have been obtained is $5,000 or more, OR a custodial sentence is likely" },
        ],
      },
      {
        id: "1.4_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "1.4_docs_1", text: "Reference to Guideline 1.4 noted" },
          { id: "1.4_docs_2", text: "Copies of the charge(s)" },
          { id: "1.4_docs_3", text: "Relevant Centrelink/DSS documentation" },
          { id: "1.4_docs_4", text: "Lawyer's assessment of strengths and weaknesses of the defence(s)" },
          { id: "1.4_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "1.5": {
    label: "Guidelines 1.5 – social security prosecutions – Guilty pleas",
    criteria: [
      {
        id: "1.5_means",
        label: "Means Test",
        items: [
          { id: "1.5_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "1.5_merit",
        label: "Merit Test",
        items: [
          { id: "1.5_merit_1", text: "No reasonable prospect of acquittal" },
          { id: "1.5_merit_2", text: "The total amount alleged to have been obtained is $5,000 or more, OR a custodial sentence is likely" },
        ],
      },
      {
        id: "1.5_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "1.5_docs_1", text: "Reference to Guideline 1.5 noted" },
          { id: "1.5_docs_2", text: "Copies of the charge(s)" },
          { id: "1.5_docs_3", text: "Relevant Centrelink/DSS documentation" },
          { id: "1.5_docs_4", text: "Lawyer's assessment of likely penalty" },
          { id: "1.5_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "2": {
    label: "Guideline 2 – traffic offence charges in the Magistrates' Court",
    criteria: [
      {
        id: "2_means",
        label: "Means Test",
        items: [
          { id: "2_means_1", text: "Client satisfies VLA means test" },
          { id: "2_means_2", text: "Proof of means obtained and on file" },
        ],
      },
      {
        id: "2_merit",
        label: "Merit Test",
        items: [
          { id: "2_merit_1", text: "Client is charged with a traffic offence" },
          { id: "2_merit_2", text: "A term of immediate imprisonment is likely" },
          { id: "2_merit_3", text: "OR loss of livelihood is likely due to loss of licence (and livelihood is wholly dependent on licence)" },
        ],
      },
      {
        id: "2_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "2_docs_1", text: "Reference to Guideline 2 noted" },
          { id: "2_docs_2", text: "Copies of the charge(s)" },
          { id: "2_docs_3", text: "Full details of prior traffic convictions / licence history" },
          { id: "2_docs_4", text: "If loss of livelihood claimed: evidence that livelihood is wholly dependent on licence" },
          { id: "2_docs_5", text: "Lawyer's assessment of likely penalty" },
          { id: "2_docs_6", text: "Relevant proof of means (if waiver does not apply)" },
        ],
      },
    ],
  },
  "6": {
    label: "Guideline 6 – bail applications, variations and revocations",
    criteria: [
      {
        id: "6_means",
        label: "Means Test",
        items: [
          { id: "6_means_1", text: "Client satisfies VLA means test" },
          { id: "6_means_2", text: "Proof of means obtained and on file" },
        ],
      },
      {
        id: "6_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "6_merit_1", text: "Client is in custody and seeking bail OR bail variation/revocation" },
          { id: "6_merit_2", text: "Client is charged with a serious offence OR bail was refused by Magistrates' Court and application is to Supreme/County Court" },
          { id: "6_merit_3", text: "There is a reasonable basis to make the application — having regard to the charges, the client's personal circumstances, and relevant bail law (including ss 3AAAA and 3AAA Bail Act)" },
          { id: "6_merit_4", text: "Considered whether time on remand is likely to exceed any sentence of imprisonment for the underlying offending" },
          { id: "6_merit_5", text: "If client is a child: s3B Bail Act applied — VLA considers there is always a reasonable basis for a bail application" },
          { id: "6_merit_6", text: "If client is an Aboriginal or Torres Strait Islander person: s3A Bail Act applied — VLA considers there is always a reasonable basis for a bail application" },
          { id: "6_merit_7", text: "OR assistance sought to apply to vary bail conditions" },
          { id: "6_merit_8", text: "OR assistance sought to respond to an application for revocation" },
        ],
      },
      {
        id: "6_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "6_docs_1", text: "Reference to Guideline 6 noted" },
          { id: "6_docs_2", text: "Copies of the charge(s)" },
          { id: "6_docs_3", text: "Details of prior bail applications (if any) and outcome" },
          { id: "6_docs_4", text: "Lawyer's assessment of grounds for bail" },
          { id: "6_docs_5", text: "Relevant proof of means (if waiver does not apply)" },
        ],
      },
    ],
  },
  "5.1": {
    label: "Guideline 5.1 – proceedings in the Children's Court",
    criteria: [
      {
        id: "5.1_means",
        label: "Means Test",
        items: [
          { id: "5.1_means_1", text: "Client (child/young person) satisfies VLA means test" },
        ],
      },
      {
        id: "5.1_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "5.1_merit_1", text: "Matter is in the Criminal Division of the Children's Court" },
          { id: "5.1_merit_2", text: "Client is charged with a serious offence likely to result in a custodial disposition" },
          { id: "5.1_merit_3", text: "OR client is charged with an indictable offence" },
          { id: "5.1_merit_4", text: "OR the matter is a contested hearing with a reasonable prospect of acquittal" },
        ],
      },
      {
        id: "5.1_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "5.1_docs_1", text: "Reference to Guideline 5.1 noted" },
          { id: "5.1_docs_2", text: "Copies of the charge(s)" },
          { id: "5.1_docs_3", text: "Details of the client's criminal history (if any)" },
          { id: "5.1_docs_4", text: "Lawyer's assessment of likely disposition" },
          { id: "5.1_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "15": {
    label: "Guideline 15 – Special circumstances",
    criteria: [
      {
        id: "15_means",
        label: "Means Test",
        items: [
          { id: "15_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "15_merit",
        label: "Special Circumstances",
        items: [
          { id: "15_merit_1", text: "Client has a reading or writing difficulty that prevents self-representation" },
          { id: "15_merit_2", text: "Client has a serious mental health issue or intellectual disability affecting ability to represent themselves" },
          { id: "15_merit_3", text: "The matter is of unusual difficulty, complexity or importance such that it would be contrary to the interests of justice for the client to be unrepresented" },
        ],
      },
      {
        id: "15_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "15_docs_1", text: "Reference to Guideline 15 noted" },
          { id: "15_docs_2", text: "Medical, psychological or other expert evidence of special circumstances (where applicable)" },
          { id: "15_docs_3", text: "Lawyer's explanation of why special circumstances apply" },
          { id: "15_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "3.1": {
    label: "Guideline 3.1 – committal involving homicide/consent/id",
    criteria: [
      {
        id: "3.1_means",
        label: "Means Test",
        items: [
          { id: "3.1_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "3.1_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "3.1_merit_1", text: "Client is charged with homicide, OR the case involves issues of consent or identification" },
          { id: "3.1_merit_2", text: "Matter is at committal stage" },
          { id: "3.1_merit_3", text: "There is a reasonable prospect of a successful committal (i.e., charge dismissed or reduced)" },
        ],
      },
      {
        id: "3.1_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "3.1_docs_1", text: "Reference to Guideline 3.1 noted" },
          { id: "3.1_docs_2", text: "Copies of the charge(s)" },
          { id: "3.1_docs_3", text: "Brief of evidence / witness list" },
          { id: "3.1_docs_4", text: "Lawyer's assessment of grounds for the committal application" },
          { id: "3.1_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "3.2": {
    label: "Guideline 3.2 – committal proceedings in other cases",
    criteria: [
      {
        id: "3.2_means",
        label: "Means Test",
        items: [
          { id: "3.2_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "3.2_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "3.2_merit_1", text: "Matter is at committal stage (not involving homicide/consent/id)" },
          { id: "3.2_merit_2", text: "There is a reasonable prospect that cross-examination will result in the charge being dismissed or substantially reduced" },
          { id: "3.2_merit_3", text: "Counsel has advised that cross-examination at committal is justified" },
        ],
      },
      {
        id: "3.2_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "3.2_docs_1", text: "Reference to Guideline 3.2 noted" },
          { id: "3.2_docs_2", text: "Copies of the charge(s)" },
          { id: "3.2_docs_3", text: "Brief of evidence / witness list" },
          { id: "3.2_docs_4", text: "Counsel's advice on the committal" },
          { id: "3.2_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "4": {
    label: "Guideline 4 – trials in the County or Supreme courts",
    criteria: [
      {
        id: "4_means",
        label: "Means Test",
        items: [
          { id: "4_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "4_merit",
        label: "Merit Test",
        items: [
          { id: "4_merit_1", text: "Matter is listed for trial in the County Court or Supreme Court" },
          { id: "4_merit_2", text: "There is a reasonable prospect of acquittal" },
        ],
      },
      {
        id: "4_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "4_docs_1", text: "Reference to Guideline 4 noted" },
          { id: "4_docs_2", text: "Copies of the indictment / charge(s)" },
          { id: "4_docs_3", text: "Brief of evidence" },
          { id: "4_docs_4", text: "Counsel's advice on prospects of acquittal" },
          { id: "4_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "4.1": {
    label: "Guideline 4.1 – County Court and Supreme Court pleas",
    criteria: [
      {
        id: "4.1_means",
        label: "Means Test",
        items: [
          { id: "4.1_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "4.1_merit",
        label: "Merit Test",
        items: [
          { id: "4.1_merit_1", text: "Matter is listed for plea in the County Court or Supreme Court" },
          { id: "4.1_merit_2", text: "No reasonable prospect of acquittal" },
          { id: "4.1_merit_3", text: "Immediate custodial sentence is likely" },
        ],
      },
      {
        id: "4.1_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "4.1_docs_1", text: "Reference to Guideline 4.1 noted" },
          { id: "4.1_docs_2", text: "Copies of the indictment / charge(s)" },
          { id: "4.1_docs_3", text: "Prior convictions" },
          { id: "4.1_docs_4", text: "Counsel's advice / plea assessment" },
          { id: "4.1_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "11": {
    label: "Guideline 11 – Supreme and County Court breach proceedings",
    criteria: [
      {
        id: "11_means",
        label: "Means Test",
        items: [
          { id: "11_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "11_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "11_merit_1", text: "Client is subject to a Supreme or County Court order (e.g. CCO, suspended sentence)" },
          { id: "11_merit_2", text: "Breach proceedings have been commenced" },
          { id: "11_merit_3", text: "Immediate imprisonment is likely as a result of the breach" },
        ],
      },
      {
        id: "11_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "11_docs_1", text: "Reference to Guideline 11 noted" },
          { id: "11_docs_2", text: "Copy of the original court order" },
          { id: "11_docs_3", text: "Details of the alleged breach" },
          { id: "11_docs_4", text: "Lawyer's assessment of likely outcome" },
          { id: "11_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.1": {
    label: "Guideline 7.1 – Criminal appeals in the County Court",
    criteria: [
      {
        id: "7.1_means",
        label: "Means Test",
        items: [
          { id: "7.1_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.1_merit",
        label: "Merit Test",
        items: [
          { id: "7.1_merit_1", text: "Client was convicted / sentenced in the Magistrates' Court and appeals to the County Court" },
          { id: "7.1_merit_2", text: "There are reasonable grounds for the appeal (against conviction and/or sentence)" },
          { id: "7.1_merit_3", text: "A term of immediate imprisonment was imposed OR is likely on the appeal" },
        ],
      },
      {
        id: "7.1_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.1_docs_1", text: "Reference to Guideline 7.1 noted" },
          { id: "7.1_docs_2", text: "Notice of appeal" },
          { id: "7.1_docs_3", text: "Transcript of Magistrates' Court hearing (if available)" },
          { id: "7.1_docs_4", text: "Lawyer's assessment of grounds of appeal" },
          { id: "7.1_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.2": {
    label: "Guideline 7.2 – interlocutory appeals to the Court of Appeal",
    criteria: [
      {
        id: "7.2_means",
        label: "Means Test",
        items: [
          { id: "7.2_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.2_merit",
        label: "Merit Test",
        items: [
          { id: "7.2_merit_1", text: "An interlocutory ruling has been made in a trial" },
          { id: "7.2_merit_2", text: "There are reasonable grounds to appeal the ruling" },
          { id: "7.2_merit_3", text: "Counsel has advised that the appeal has reasonable prospects of success" },
        ],
      },
      {
        id: "7.2_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.2_docs_1", text: "Reference to Guideline 7.2 noted" },
          { id: "7.2_docs_2", text: "Ruling being appealed" },
          { id: "7.2_docs_3", text: "Counsel's advice on the appeal" },
          { id: "7.2_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.3": {
    label: "Guideline 7.3 – appeals to the High Court",
    criteria: [
      {
        id: "7.3_means",
        label: "Means Test",
        items: [
          { id: "7.3_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.3_merit",
        label: "Merit Test",
        items: [
          { id: "7.3_merit_1", text: "Special leave to appeal to the High Court has been granted OR application for special leave is justified" },
          { id: "7.3_merit_2", text: "The appeal involves a question of law of public importance" },
          { id: "7.3_merit_3", text: "Senior counsel has advised that the appeal has reasonable prospects" },
        ],
      },
      {
        id: "7.3_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.3_docs_1", text: "Reference to Guideline 7.3 noted" },
          { id: "7.3_docs_2", text: "Court of Appeal judgment" },
          { id: "7.3_docs_3", text: "Senior counsel's advice" },
          { id: "7.3_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.4": {
    label: "Guideline 7.4 – leave to appeal against sentence (CoA)",
    criteria: [
      {
        id: "7.4_means",
        label: "Means Test",
        items: [
          { id: "7.4_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.4_merit",
        label: "Merit Test",
        items: [
          { id: "7.4_merit_1", text: "Client was sentenced in the County or Supreme Court" },
          { id: "7.4_merit_2", text: "There are reasonable grounds to seek leave to appeal against sentence" },
          { id: "7.4_merit_3", text: "Counsel has advised leave is justified" },
        ],
      },
      {
        id: "7.4_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.4_docs_1", text: "Reference to Guideline 7.4 noted" },
          { id: "7.4_docs_2", text: "Sentencing remarks" },
          { id: "7.4_docs_3", text: "Counsel's advice on leave application" },
          { id: "7.4_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.5": {
    label: "Guideline 7.5 – appeal against sentence (CoA - leave granted)",
    criteria: [
      {
        id: "7.5_means",
        label: "Means Test",
        items: [
          { id: "7.5_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.5_merit",
        label: "Merit Test",
        items: [
          { id: "7.5_merit_1", text: "Leave to appeal against sentence has been granted by the Court of Appeal" },
          { id: "7.5_merit_2", text: "Appeal is listed for hearing" },
        ],
      },
      {
        id: "7.5_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.5_docs_1", text: "Reference to Guideline 7.5 noted" },
          { id: "7.5_docs_2", text: "Order granting leave" },
          { id: "7.5_docs_3", text: "Counsel's advice / submissions" },
          { id: "7.5_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.6": {
    label: "Guideline 7.6 – leave to appeal against conviction (CoA)",
    criteria: [
      {
        id: "7.6_means",
        label: "Means Test",
        items: [
          { id: "7.6_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.6_merit",
        label: "Merit Test",
        items: [
          { id: "7.6_merit_1", text: "Client was convicted in the County or Supreme Court" },
          { id: "7.6_merit_2", text: "There are reasonable grounds to seek leave to appeal against conviction" },
          { id: "7.6_merit_3", text: "Counsel has advised leave is justified" },
        ],
      },
      {
        id: "7.6_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.6_docs_1", text: "Reference to Guideline 7.6 noted" },
          { id: "7.6_docs_2", text: "Trial transcript (relevant portions)" },
          { id: "7.6_docs_3", text: "Counsel's advice on leave application" },
          { id: "7.6_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.7": {
    label: "Guideline 7.7 – appeal against conviction (CoA - leave granted)",
    criteria: [
      {
        id: "7.7_means",
        label: "Means Test",
        items: [
          { id: "7.7_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.7_merit",
        label: "Merit Test",
        items: [
          { id: "7.7_merit_1", text: "Leave to appeal against conviction has been granted by the Court of Appeal" },
          { id: "7.7_merit_2", text: "Appeal is listed for hearing" },
        ],
      },
      {
        id: "7.7_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.7_docs_1", text: "Reference to Guideline 7.7 noted" },
          { id: "7.7_docs_2", text: "Order granting leave" },
          { id: "7.7_docs_3", text: "Counsel's submissions / advice" },
          { id: "7.7_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "7.8": {
    label: "Guideline 7.8 – election to renew leave to appeal (CoA)",
    criteria: [
      {
        id: "7.8_means",
        label: "Means Test",
        items: [
          { id: "7.8_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "7.8_merit",
        label: "Merit Test",
        items: [
          { id: "7.8_merit_1", text: "Leave to appeal was refused by a single judge" },
          { id: "7.8_merit_2", text: "Client elects to renew the application before the full Court of Appeal" },
          { id: "7.8_merit_3", text: "Counsel has advised that renewal is justified" },
        ],
      },
      {
        id: "7.8_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "7.8_docs_1", text: "Reference to Guideline 7.8 noted" },
          { id: "7.8_docs_2", text: "Single judge's refusal" },
          { id: "7.8_docs_3", text: "Counsel's advice on renewal" },
          { id: "7.8_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "8": {
    label: "Guideline 8 – stay applications under Criminal Procedure Act",
    criteria: [
      {
        id: "8_means",
        label: "Means Test",
        items: [
          { id: "8_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "8_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "8_merit_1", text: "An application to stay proceedings under the Criminal Procedure Act is contemplated" },
          { id: "8_merit_2", text: "There are reasonable grounds for the stay application (e.g. abuse of process, delay)" },
          { id: "8_merit_3", text: "Counsel has advised the application is justified" },
        ],
      },
      {
        id: "8_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "8_docs_1", text: "Reference to Guideline 8 noted" },
          { id: "8_docs_2", text: "Grounds for the stay application" },
          { id: "8_docs_3", text: "Counsel's advice" },
          { id: "8_docs_4", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "9": {
    label: "Guideline 9 – hearings under Crimes (Mental Impairment) Act",
    criteria: [
      {
        id: "9_means",
        label: "Means Test",
        items: [
          { id: "9_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "9_merit",
        label: "Merit / Eligibility",
        items: [
          { id: "9_merit_1", text: "Proceedings are under the Crimes (Mental Impairment and Unfitness to be Tried) Act 1997" },
          { id: "9_merit_2", text: "Question of unfitness to stand trial OR finding of not guilty by reason of mental impairment is raised" },
          { id: "9_merit_3", text: "Expert evidence supports the application" },
        ],
      },
      {
        id: "9_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "9_docs_1", text: "Reference to Guideline 9 noted" },
          { id: "9_docs_2", text: "Psychiatric / psychological reports" },
          { id: "9_docs_3", text: "Copies of the charge(s)" },
          { id: "9_docs_4", text: "Lawyer's assessment of the CMIA application" },
          { id: "9_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
  "10": {
    label: "Guideline 10 – Post-Sentence Supervision and Detention Orders and Community Safety Orders",
    criteria: [
      {
        id: "10_means",
        label: "Means Test",
        items: [
          { id: "10_means_1", text: "Client satisfies VLA means test" },
        ],
      },
      {
        id: "10_eligibility",
        label: "Eligible Proceedings",
        items: [
          { id: "10_elig_1", text: "Application by the Director of Public Prosecutions for a Detention Order" },
          { id: "10_elig_2", text: "Application by the Secretary to the Department of Justice and Community Safety for an Emergency Detention Order" },
          { id: "10_elig_3", text: "Application by the Secretary to the Department of Justice and Community Safety for a Supervision Order" },
          { id: "10_elig_4", text: "Application by the Minister for the Department of Home Affairs for a Continuing Detention Order, Control Order or Extended Supervision Order or review of these orders" },
          { id: "10_elig_5", text: "Application by the Secretary to the Department of Justice and Community Safety for a review of conditions or renewal of a Detention or Supervision Order" },
          { id: "10_elig_6", text: "Application by the Minister for Immigration or their legal representative for a community safety order, to vary a condition of a community safety order, or to review a community safety order" },
          { id: "10_elig_7", text: "Application by a person subject to a community safety order to review a community safety order" },
          { id: "10_elig_8", text: "Appeal against an order made in community safety order proceedings" },
          { id: "10_elig_9", text: "Proceedings regarding the contravention of a community safety order" },
          { id: "10_elig_10", text: "Application for review of conditions by the person subject to an Order under these Acts" },
        ],
      },
      {
        id: "10_merit",
        label: "Merit Test",
        items: [
          { id: "10_merit_1", text: "The benefit of representation outweighs the detriment that the person is likely to suffer if they are not represented" },
          { id: "10_merit_2", text: "The proceedings will terminate in a manner favourable to the person" },
          { id: "10_merit_3", text: "It is reasonable in all the circumstances, having regard to section 24 of the Legal Aid Act 1978, the merit of the application and benefit to the person, to provide a grant of legal assistance" },
          { id: "10_merit_4", text: "The applicant has been ordered by the court" },
        ],
      },
      {
        id: "10_special",
        label: "Special Circumstances (client)",
        items: [
          { id: "10_spec_1", text: "Client has a mental or intellectual disability, disorder or illness, either now or when the offence occurred" },
          { id: "10_spec_2", text: "Client has a serious addiction to drugs, alcohol or a volatile substance either now or when the offence occurred" },
          { id: "10_spec_3", text: "Client was homeless at the time of the offence" },
        ],
      },
      {
        id: "10_outcomes",
        label: "Potential Outcomes",
        items: [
          { id: "10_out_1", text: "The enforcement order being revoked" },
          { id: "10_out_2", text: "The infringement penalty being substantially discharged" },
        ],
      },
      {
        id: "10_docs",
        label: "Documentary Requirements (retained on file)",
        items: [
          { id: "10_docs_1", text: "Reference to Guideline 10 noted" },
          { id: "10_docs_2", text: "Copy of the application / existing order (if any)" },
          { id: "10_docs_3", text: "Expert reports (if available)" },
          { id: "10_docs_4", text: "Lawyer's assessment" },
          { id: "10_docs_5", text: "Relevant proof of means" },
        ],
      },
    ],
  },
};

export const GUIDELINE_GROUPS = [
  {
    label: "Summary & Children's Court",
    options: ["1.1", "1.2", "1.3", "13", "1.4", "1.5", "2", "6", "5.1", "15"],
  },
  {
    label: "Committals, Trials & Breaches",
    options: ["3.1", "3.2", "4", "4.1", "11"],
  },
  {
    label: "Appeals",
    options: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8"],
  },
  {
    label: "Other Applications",
    options: ["8", "9", "10"],
  },
];