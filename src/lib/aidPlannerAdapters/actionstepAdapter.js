import { createPracticeManagerAdapter } from "@/lib/aidPlannerAdapters/baseAdapter";

export const actionstepAdapter = createPracticeManagerAdapter({
  id: "actionstep",
  name: "Actionstep",
  stage: "adapter-ready",
  description: "First import path for pulling matter basics into the portable planner without storing them in the app backend.",
  connectSummary: "Connect to Actionstep, search for a matter, and prefill the planner with client, file, court, date, and responsible-lawyer details.",
  supportsStubSearch: true,
  importFields: [
    "Client first name and surname",
    "Matter/file reference",
    "Matter summary or description",
    "Responsible lawyer",
    "Court",
    "Next appearance date",
  ],
  manualFields: [
    "Aid applied and grant in place",
    "Current stage covered",
    "Extension requested / decision",
    "Billing judgement items",
  ],
  writeBackOptions: [
    "Create Actionstep note",
    "Create Actionstep task",
  ],
  sampleMatters: [
    {
      externalId: "act-100245",
      client: {
        firstName: "Emma",
        lastName: "Jackson",
        fullName: "Emma Jackson",
        fileNumber: "AS-100245",
      },
      matter: {
        matterType: "Criminal",
        court: "Magistrates' Court",
        appearanceType: "Bail Application",
        nextAppearanceDate: "2026-05-02",
        lawyer: "Ashlee McPhail",
        summary: "Bail application listed at Melbourne Magistrates' Court.",
      },
    },
    {
      externalId: "act-100813",
      client: {
        firstName: "Jane",
        lastName: "Smith",
        fullName: "Jane Smith",
        fileNumber: "AS-100813",
      },
      matter: {
        matterType: "Criminal",
        court: "County Court",
        appearanceType: "Plea",
        nextAppearanceDate: "2026-05-11",
        lawyer: "Christine Callaghan",
        summary: "County Court plea with existing briefing history.",
      },
    },
    {
      externalId: "act-101004",
      client: {
        firstName: "Riley",
        lastName: "Wangman",
        fullName: "Riley Wangman",
        fileNumber: "AS-101004",
      },
      matter: {
        matterType: "Family Violence",
        court: "Magistrates' Court",
        appearanceType: "Mention",
        nextAppearanceDate: "2026-04-30",
        lawyer: "Britt Jeffs",
        summary: "Family violence mention requiring funding review before the next date.",
      },
    },
    {
      externalId: "act-101118",
      client: {
        firstName: "Paige",
        lastName: "Stewart",
        fullName: "Paige Stewart",
        fileNumber: "AS-101118",
      },
      matter: {
        matterType: "Criminal",
        court: "Magistrates' Court",
        appearanceType: "Mention",
        nextAppearanceDate: "2026-05-19",
        lawyer: "Emma Muir",
        summary: "Summary crime mention requiring aid and claim review before the next listing.",
      },
    },
    {
      externalId: "act-101203",
      client: {
        firstName: "Ann-Marie",
        lastName: "Jones",
        fullName: "Ann-Marie Jones",
        fileNumber: "AS-101203",
      },
      matter: {
        matterType: "Criminal",
        court: "Magistrates' Court",
        appearanceType: "Mention",
        nextAppearanceDate: "2026-05-21",
        lawyer: "Emma Muir",
        summary: "Criminal mention listed for funding and next-appearance review.",
      },
    },
    {
      externalId: "act-101300",
      client: {
        firstName: "Phillip",
        lastName: "Souter",
        fullName: "Phillip Souter",
        fileNumber: "AS-101300",
      },
      matter: {
        matterType: "Criminal",
        court: "Magistrates' Court",
        appearanceType: "Mention",
        nextAppearanceDate: "2026-06-01",
        lawyer: "Emma Muir",
        summary: "Start-to-finish testing matter for the staff portal.",
      },
    },
  ],
});
