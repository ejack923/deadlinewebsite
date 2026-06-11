import { createPracticeManagerAdapter } from "@/lib/aidPlannerAdapters/baseAdapter";
import { actionstepAdapter } from "@/lib/aidPlannerAdapters/actionstepAdapter";

const plannedAdapters = [
  createPracticeManagerAdapter({
    id: "leap",
    name: "LEAP",
    stage: "planned",
    description: "Planned connector using the same portable import pattern as Actionstep.",
    connectSummary: "Search for a LEAP matter and prefill the same planner schema once the connector is added.",
    importFields: ["Client", "Matter reference", "Court", "Next date", "Responsible staff"],
    manualFields: ["Funding judgement", "Extension decisions", "Billing judgement items"],
  }),
  createPracticeManagerAdapter({
    id: "smokeball",
    name: "Smokeball",
    stage: "planned",
    description: "Planned connector for local import-first planning without retaining a central copy.",
    connectSummary: "Use the same schema mapping to bring across matter basics and keep the completed planner on the user's device.",
    importFields: ["Client", "Matter reference", "Matter summary", "Court", "Next date"],
    manualFields: ["Funding judgement", "Stage covered", "Billing judgement items"],
  }),
  createPracticeManagerAdapter({
    id: "clio",
    name: "Clio",
    stage: "planned",
    description: "Planned connector for the same portable planner workflow.",
    connectSummary: "Import matter basics into the planner and let users keep the result locally or as a downloaded file.",
    importFields: ["Client", "Matter reference", "Matter summary", "Responsible lawyer", "Key dates"],
    manualFields: ["Aid and extension assessment", "Billing judgement items"],
  }),
];

export const practiceManagerAdapters = [actionstepAdapter, ...plannedAdapters];

export function getPracticeManagerAdapter(adapterId) {
  return practiceManagerAdapters.find((adapter) => adapter.id === adapterId) || null;
}
