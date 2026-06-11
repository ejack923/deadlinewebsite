import React, { useEffect, useMemo, useState } from "react";
import { createActionstepFileNote, createActionstepTask } from "@/lib/aidPlannerAdapters/actionstepClient";

function getMissingImportedFields(planner) {
  const missing = [];
  if (!planner.client.fullName) missing.push("Client name");
  if (!planner.client.fileNumber) missing.push("File reference");
  if (!planner.matter.summary) missing.push("Matter summary");
  if (!planner.matter.court) missing.push("Court");
  if (!planner.matter.nextAppearanceDate) missing.push("Next appearance date");
  if (!planner.matter.lawyer) missing.push("Responsible lawyer");
  return missing;
}

function defaultNoteText(planner) {
  return [
    `Aid Planner guidance: ${planner.guidance?.nextAction || "Review matter funding."}`,
    planner.matter?.summary ? `Matter summary: ${planner.matter.summary}` : "",
    planner.matter?.nextAppearanceDate ? `Next appearance date: ${planner.matter.nextAppearanceDate}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function getRecommendedActions(planner) {
  const nextDateLine = planner.matter?.nextAppearanceDate ? ` before ${planner.matter.nextAppearanceDate}` : "";
  const summaryLine = planner.matter?.summary ? `Matter summary: ${planner.matter.summary}` : "";

  const presets = {
    apply_now: {
      noteText: [
        "Aid Planner recommendation: Apply for legal assistance now.",
        summaryLine,
        planner.matter?.nextAppearanceDate ? `Next appearance date: ${planner.matter.nextAppearanceDate}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      taskTitle: "Apply for legal assistance",
      dueDate: planner.matter?.nextAppearanceDate || "",
    },
    extension_review: {
      noteText: [
        `Aid Planner recommendation: Review and request an extension${nextDateLine}.`,
        summaryLine,
        `Current stage covered: ${planner.funding?.currentStageCovered || "Not recorded"}`,
      ]
        .filter(Boolean)
        .join("\n"),
      taskTitle: "Review extension requirement",
      dueDate: planner.matter?.nextAppearanceDate || "",
    },
    ready_to_bill: {
      noteText: [
        "Aid Planner recommendation: Matter appears ready for billing review.",
        summaryLine,
        planner.matter?.nextAppearanceDate ? `Latest appearance date: ${planner.matter.nextAppearanceDate}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      taskTitle: "Prepare billing review",
      dueDate: planner.matter?.nextAppearanceDate || "",
    },
  };

  return presets[planner.guidance?.status] || {
    noteText: defaultNoteText(planner),
    taskTitle: planner.guidance?.nextAction || "Review Aid Planner guidance",
    dueDate: planner.matter?.nextAppearanceDate || "",
  };
}

function getMissingTaskWritebackFields({ taskTitle, assigneeId, rateId }) {
  const missing = [];
  if (!taskTitle?.trim()) missing.push("Task title");
  if (!assigneeId?.trim()) missing.push("Actionstep assignee ID");
  if (!rateId?.trim()) missing.push("Actionstep rate ID");
  return missing;
}

export default function ImportedMatterSummary({ planner, actionstepSession }) {
  const isImported = planner.source?.type === "pms" && planner.source?.provider;
  const missingFields = useMemo(() => getMissingImportedFields(planner), [planner]);
  const [noteText, setNoteText] = useState(defaultNoteText(planner));
  const [taskTitle, setTaskTitle] = useState(planner.guidance?.nextAction || "Review Aid Planner guidance");
  const [taskDueDate, setTaskDueDate] = useState(planner.matter?.nextAppearanceDate || "");
  const [assigneeId, setAssigneeId] = useState(planner.source?.actionstep?.assignedToId || "");
  const [rateId, setRateId] = useState(planner.source?.actionstep?.rateId || "");
  const [writebackStatus, setWritebackStatus] = useState("");
  const [writebackError, setWritebackError] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const hasAssigneeId = Boolean(assigneeId);
  const hasRateId = Boolean(rateId);
  const recommendedAction = useMemo(() => getRecommendedActions(planner), [planner]);
  const missingTaskWritebackFields = useMemo(
    () => getMissingTaskWritebackFields({ taskTitle, assigneeId, rateId }),
    [taskTitle, assigneeId, rateId]
  );
  const taskReady = missingTaskWritebackFields.length === 0;

  useEffect(() => {
    setNoteText(defaultNoteText(planner));
    setTaskTitle(planner.guidance?.nextAction || "Review Aid Planner guidance");
    setTaskDueDate(planner.matter?.nextAppearanceDate || "");
    setAssigneeId(planner.source?.actionstep?.assignedToId || "");
    setRateId(planner.source?.actionstep?.rateId || "");
    setWritebackStatus("");
    setWritebackError("");
  }, [planner]);

  if (!isImported) return null;

  const canWriteBack =
    planner.source?.provider === "Actionstep" &&
    actionstepSession?.provider === "actionstep" &&
    actionstepSession?.apiEndpoint &&
    actionstepSession?.accessToken;

  const handleCreateNote = async () => {
    setWritebackError("");
    setWritebackStatus("");
    setIsSavingNote(true);

    try {
      await createActionstepFileNote({
        apiEndpoint: actionstepSession.apiEndpoint,
        accessToken: actionstepSession.accessToken,
        actionId: planner.source.externalId,
        text: noteText,
      });
      setWritebackStatus("Actionstep file note created.");
    } catch (error) {
      setWritebackError(error instanceof Error ? error.message : "Actionstep file note failed.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCreateTask = async () => {
    setWritebackError("");
    setWritebackStatus("");
    setIsSavingTask(true);

    try {
      await createActionstepTask({
        apiEndpoint: actionstepSession.apiEndpoint,
        accessToken: actionstepSession.accessToken,
        actionId: planner.source.externalId,
        name: taskTitle,
        assigneeId,
        rateId,
        dueDate: taskDueDate,
      });
      setWritebackStatus("Actionstep task created.");
    } catch (error) {
      setWritebackError(error instanceof Error ? error.message : "Actionstep task failed.");
    } finally {
      setIsSavingTask(false);
    }
  };

  const applyRecommendedPreset = () => {
    setNoteText(recommendedAction.noteText);
    setTaskTitle(recommendedAction.taskTitle);
    setTaskDueDate(recommendedAction.dueDate);
    setWritebackStatus("");
    setWritebackError("");
  };

  const useExtensionPreset = () => {
    setNoteText(
      [
        `Aid Planner recommendation: Review and request an extension${planner.matter?.nextAppearanceDate ? ` before ${planner.matter.nextAppearanceDate}` : ""}.`,
        planner.matter?.summary ? `Matter summary: ${planner.matter.summary}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
    setTaskTitle("Review extension requirement");
    setTaskDueDate(planner.matter?.nextAppearanceDate || "");
    setWritebackStatus("");
    setWritebackError("");
  };

  const useBillingPreset = () => {
    setNoteText(
      [
        "Aid Planner recommendation: Review matter for billing and invoice readiness.",
        planner.matter?.summary ? `Matter summary: ${planner.matter.summary}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
    setTaskTitle("Prepare billing follow-up");
    setTaskDueDate(planner.matter?.nextAppearanceDate || "");
    setWritebackStatus("");
    setWritebackError("");
  };

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Imported from {planner.source.provider}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Matter basics were brought into the planner from the practice manager and can now be reviewed locally before you complete the funding and billing assessment.
          </p>
        </div>
        {planner.source.externalId && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
            External ID: {planner.source.externalId}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</div>
          <div className="mt-2 text-sm text-slate-900">{planner.client.fullName || "Not imported"}</div>
          <div className="mt-1 text-sm text-slate-600">{planner.client.fileNumber || "No file reference returned"}</div>
        </div>
        <div className="rounded-lg bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Matter</div>
          <div className="mt-2 text-sm text-slate-900">{planner.matter.summary || "Not imported"}</div>
          <div className="mt-1 text-sm text-slate-600">{planner.matter.court || "Court not returned"}</div>
        </div>
        <div className="rounded-lg bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Responsible lawyer</div>
          <div className="mt-2 text-sm text-slate-900">{planner.matter.lawyer || "Not returned"}</div>
          <div className="mt-1 text-sm text-slate-600">
            {planner.matter.nextAppearanceDate ? `Next date: ${planner.matter.nextAppearanceDate}` : "Next appearance date still needs to be checked"}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Imported legal context</div>
          <div className="mt-2 text-sm text-slate-900">
            {planner.matter.matterType || "Matter type still needs checking"}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {planner.matter.appearanceType || "Appearance type still needs checking"}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-emerald-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Still best completed manually</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Aid applied", "Grant in place", "Current stage covered", "Extension decision", "Billing judgement"].map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {item}
            </span>
          ))}
        </div>

        {missingFields.length > 0 && (
          <>
            <div className="mt-4 text-sm font-semibold text-slate-900">Check these imported fields</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingFields.map((item) => (
                <span key={item} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {item}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-emerald-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Optional write-back to Actionstep</div>
        <p className="mt-1 text-sm text-slate-600">
          These actions are user-triggered only. Nothing is sent back to Actionstep unless you click one of the buttons below in this session.
        </p>

        <div className="mt-4 space-y-4">
          {!canWriteBack && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Reconnect through the Actionstep import modal in live mode before using note or task write-back.
            </div>
          )}

          <div className={`${canWriteBack ? "" : "opacity-60"}`}>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Recommended next actions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applyRecommendedPreset}
                  disabled={!canWriteBack}
                  className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-200"
                >
                  Use planner recommendation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNoteText(
                      [
                        "Aid Planner recommendation: Apply for legal assistance now.",
                        planner.matter?.summary ? `Matter summary: ${planner.matter.summary}` : "",
                        planner.matter?.nextAppearanceDate ? `Next appearance date: ${planner.matter.nextAppearanceDate}` : "",
                      ]
                        .filter(Boolean)
                        .join("\n")
                    );
                    setTaskTitle("Apply for legal assistance");
                    setTaskDueDate(planner.matter?.nextAppearanceDate || "");
                    setWritebackStatus("");
                    setWritebackError("");
                  }}
                  disabled={!canWriteBack}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Create apply-for-aid follow-up
                </button>
                <button
                  type="button"
                  onClick={useExtensionPreset}
                  disabled={!canWriteBack}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Create extension review follow-up
                </button>
                <button
                  type="button"
                  onClick={useBillingPreset}
                  disabled={!canWriteBack}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Create billing follow-up
                </button>
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">File note text</span>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                disabled={!canWriteBack}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Task title</span>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  disabled={!canWriteBack}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Task due date</span>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  disabled={!canWriteBack}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Actionstep assignee ID</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${hasAssigneeId ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {hasAssigneeId ? "Auto-filled" : "Still needed"}
                  </span>
                </div>
                <input
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  placeholder="Required by the Actionstep tasks endpoint"
                  disabled={!canWriteBack}
                />
              </label>
              <label className="block space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Actionstep rate ID</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${hasRateId ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {hasRateId ? "Auto-filled" : "Still needed"}
                  </span>
                </div>
                <input
                  value={rateId}
                  onChange={(e) => setRateId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  placeholder="Required by the Actionstep tasks endpoint"
                  disabled={!canWriteBack}
                />
              </label>
            </div>

            {planner.source?.actionstep?.rateName && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Imported Actionstep rate: <span className="font-medium text-slate-900">{planner.source.actionstep.rateName}</span>
              </div>
            )}

            <div className={`rounded-lg border px-3 py-3 text-sm ${
              taskReady
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}>
              <div className="font-semibold">
                {taskReady ? "Task write-back is ready." : "Task write-back still needs attention."}
              </div>
              {!taskReady && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {missingTaskWritebackFields.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreateNote}
                disabled={!canWriteBack || isSavingNote}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSavingNote ? "Creating note..." : "Create Actionstep note"}
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={!canWriteBack || !taskReady || isSavingTask}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {isSavingTask ? "Creating task..." : "Create Actionstep task"}
              </button>
            </div>

            {writebackStatus && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {writebackStatus}
              </div>
            )}
            {writebackError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {writebackError}
              </div>
            )}

            <p className="text-xs text-slate-500">
              File notes only need the matter ID. Tasks are stricter, so the planner now tries to auto-fill the assignee and rate from Actionstep search results first and only leaves them manual when Actionstep did not return them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
