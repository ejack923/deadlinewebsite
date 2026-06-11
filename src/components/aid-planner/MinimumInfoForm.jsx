import React, { useRef, useState } from "react";
import {
  APPLICATION_STATUS_OPTIONS,
  COURTS,
  MATTER_TYPES,
} from "@/lib/aidPlannerSchema";
import { getPlannerAppearanceOptions } from "@/lib/aidPlannerCriminalFees";
import { parseAidLetterUpload } from "@/lib/aidLetterClientParser";
import { SelectField } from "./PlannerFields";

export default function MinimumInfoForm({
  planner,
  missingCoreFields,
  showAdvanced,
  onToggleAdvanced,
  setMatterField,
  setFundingField,
  setAidField,
  onAidLetterParsed,
}) {
  const fileInputRef = useRef(null);
  const [isParsingLetter, setIsParsingLetter] = useState(false);
  const [letterError, setLetterError] = useState("");
  const showAidEffectiveDate =
    planner.aid?.documentType === "grant_approval_letter" || planner.aid?.applicationStatus === "Aid granted";
  const appearanceOptions =
    planner.matter.matterType === "Criminal"
      ? getPlannerAppearanceOptions(
          planner.matter.court,
          planner.aid.aidTypeList || [],
          planner.matter.appearanceType
        )
      : [];

  const handleLetterUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingLetter(true);
    setLetterError("");

    try {
      const payload = await parseAidLetterUpload(file);
      onAidLetterParsed(payload, file.name);
    } catch (error) {
      setLetterError(error instanceof Error ? error.message : "Could not parse the uploaded aid letter.");
    } finally {
      setIsParsingLetter(false);
      event.target.value = "";
    }
  };

  const applyConflictAction = (flag) => {
    if (!flag?.recommendedStatus) return;
    setAidField("applicationStatus", flag.recommendedStatus);
  };

  const handleRemoveUploadedLetter = () => {
    setLetterError("");
    setAidField("uploadedLetterName", "");
    setAidField("parsedAlerts", []);
    setAidField("conflictFlags", []);
    setAidField("documentType", "");
    setAidField("custodyStatus", "");
  };

  const aidTypeItems =
    Array.isArray(planner.aid.aidTypeList) && planner.aid.aidTypeList.length > 0
      ? planner.aid.aidTypeList
      : planner.aid.aidType
        ? planner.aid.aidType.split(";").map((item) => item.trim()).filter(Boolean)
        : [""];

  const updateAidTypeItem = (index, value) => {
    const nextItems = [...aidTypeItems];
    nextItems[index] = value;
    setAidField(
      "aidTypeList",
      nextItems.map((item) => item.trim()).filter(Boolean)
    );
  };

  const addAidTypeItem = () => {
    setAidField("aidTypeList", [...aidTypeItems, ""]);
  };

  const removeAidTypeItem = (index) => {
    const nextItems = aidTypeItems.filter((_, itemIndex) => itemIndex !== index);
    setAidField("aidTypeList", nextItems.map((item) => item.trim()).filter(Boolean));
  };

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Aid details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload an ATLAS application request or aid letter to prefill the key aid details, then confirm or refine the information below.
          </p>
          <div className="mt-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
            Aid upload parser 20260504b
          </div>
        </div>
        <div className="aid-planner-no-print flex flex-col items-end gap-2 text-right">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700"
          >
            {isParsingLetter ? "Uploading letter..." : "Upload aid letter"}
          </button>
          <button
            onClick={() => onToggleAdvanced((value) => !value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700"
          >
            {showAdvanced ? "Hide optional details" : "Show optional details"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleLetterUpload}
            className="hidden"
          />
        </div>
      </div>

      {planner.aid.uploadedLetterName && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div>
            Uploaded letter: <span className="font-medium">{planner.aid.uploadedLetterName}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveUploadedLetter}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:border-rose-300 hover:text-rose-700"
          >
            Remove letter
          </button>
        </div>
      )}

      {isParsingLetter && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <div className="font-semibold">Parsing aid letter...</div>
          <div className="mt-1 text-blue-800">
            Extracting the PDF text, checking aid details, and prefilling the matter fields now.
          </div>
        </div>
      )}

      {letterError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {letterError}
        </div>
      )}

      {planner.aid.conflictFlags?.length > 0 && (
        <div className="mb-4 space-y-3">
          {planner.aid.conflictFlags.map((flag) => (
            <div key={flag.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="font-semibold">Potential application issue</div>
              <div className="mt-1">{flag.message}</div>
              <button
                type="button"
                onClick={() => applyConflictAction(flag)}
                className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                {flag.actionLabel || "Set action"}
              </button>
            </div>
          ))}
        </div>
      )}

      {planner.aid.parsedAlerts?.length > 0 && (
        <div className="mb-4 space-y-3">
          {planner.aid.parsedAlerts.map((alert, index) => (
            <div
              key={`${alert.message}-${index}`}
              className={`rounded-lg px-4 py-3 text-sm ${
                alert.level === "error"
                  ? "border border-rose-200 bg-rose-50 text-rose-800"
                  : "border border-blue-200 bg-blue-50 text-blue-900"
              }`}
            >
              <div className="font-semibold">{alert.title || "Grant alert"}</div>
              <div className="mt-1">{alert.message}</div>
              {alert.nextAction && <div className="mt-2 text-xs font-medium uppercase tracking-wide">{alert.nextAction}</div>}
            </div>
          ))}
        </div>
      )}

      {missingCoreFields.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-medium">Still needed:</span> {missingCoreFields.join(", ")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectField
          required
          label="Matter type"
          value={planner.matter.matterType}
          onChange={(value) => setMatterField("matterType", value)}
          options={MATTER_TYPES}
        />
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-700">Aid type <span className="text-rose-600">*</span></span>
            <button
              type="button"
              onClick={addAidTypeItem}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700"
            >
              Add aid type
            </button>
          </div>
          <div className="space-y-2">
            {aidTypeItems.map((item, index) => (
              <div key={`aid-type-${index}`} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => updateAidTypeItem(index, e.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3"
                  placeholder={index === 0 ? "e.g. Summary Consol" : "e.g. Summary bail or Disbursement: Psychological Report (In custody)"}
                />
                {aidTypeItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAidTypeItem(index)}
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:border-rose-300 hover:text-rose-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Guideline</span>
          <input
            value={planner.aid.guideline || ""}
            onChange={(e) => setAidField("guideline", e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3"
          />
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Aid Number <span className="text-rose-600">*</span></span>
            <input
              value={planner.aid.aidNumber}
              onChange={(e) => setAidField("aidNumber", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Ext</span>
            <input
              value={planner.aid.extensionNumber}
              onChange={(e) => setAidField("extensionNumber", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>
        </div>
        <SelectField
          required
          label="Court"
          value={planner.matter.court}
          onChange={(value) => setMatterField("court", value)}
          options={COURTS}
        />
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Location <span className="text-rose-600">*</span></span>
          <input
            value={planner.matter.location}
            onChange={(e) => setMatterField("location", e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3"
          />
        </label>
        {planner.matter.matterType === "Criminal" ? (
          <SelectField
            required
            label="Next listing type"
            value={planner.matter.appearanceType}
            onChange={(value) => setMatterField("appearanceType", value)}
            options={appearanceOptions}
          />
        ) : (
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Next listing type <span className="text-rose-600">*</span></span>
            <input
              value={planner.matter.appearanceType}
              onChange={(e) => setMatterField("appearanceType", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>
        )}
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Next listing date <span className="text-rose-600">*</span></span>
          <input
            type="date"
            value={planner.matter.nextAppearanceDate}
            onChange={(e) => setMatterField("nextAppearanceDate", e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3"
          />
        </label>
        {showAidEffectiveDate ? (
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Aid effective date</span>
            <input
              type="date"
              value={planner.aid.effectiveDate || ""}
              onChange={(e) => setAidField("effectiveDate", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3"
            />
          </label>
        ) : null}
        <SelectField
          label="Application status"
          value={planner.aid.applicationStatus}
          onChange={(value) => setAidField("applicationStatus", value)}
          options={APPLICATION_STATUS_OPTIONS}
        />
        {planner.aid.custodyStatus && (
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Custody status</span>
            <input
              value={planner.aid.custodyStatus}
              readOnly
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-700"
            />
          </label>
        )}
        </div>
    </section>
  );
}
