import { normalizePlanner } from "./aidPlannerSchema";

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function getPlannerFileName(planner) {
  const safeName = [planner?.client?.lastName || "matter", planner?.client?.firstName || "planner"]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  return `aid-planner-${safeName}.json`;
}

export function downloadPlannerJson(planner, guidance) {
  const payload = normalizePlanner({
    ...planner,
    guidance,
    updatedAt: new Date().toISOString(),
  });
  downloadFile(getPlannerFileName(payload), JSON.stringify(payload, null, 2), "application/json");
}

export function parsePlannerJson(text) {
  return normalizePlanner(JSON.parse(text));
}

export function downloadPlannerIcs(planner, guidance) {
  if (!planner?.matter?.nextAppearanceDate) return;
  const dt = planner.matter.nextAppearanceDate.replaceAll("-", "");
  const title = planner.matter.appearanceType || "Court event";
  const summary = `${planner.client.fullName || "Matter"} - ${title}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LACW//Aid Planner//EN",
    "BEGIN:VEVENT",
    `UID:${planner.matterId}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${guidance.nextAction}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  downloadFile("aid-planner-event.ics", ics, "text/calendar");
}
