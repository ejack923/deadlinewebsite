import React from "react";
import { GRANT_TYPES } from "@/lib/aidPlannerSchema";
import { BooleanField, SelectField } from "./PlannerFields";

export default function OptionalMatterDetails({ planner, setClientField, setMatterField, setFundingField }) {
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Matter details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Client first name</span>
          <input value={planner.client.firstName} onChange={(e) => setClientField("firstName", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Client last name</span>
          <input value={planner.client.lastName} onChange={(e) => setClientField("lastName", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">File number</span>
          <input value={planner.client.fileNumber} onChange={(e) => setClientField("fileNumber", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Date of birth</span>
          <input type="date" value={planner.client.dateOfBirth} onChange={(e) => setClientField("dateOfBirth", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Lawyer</span>
          <input value={planner.matter.lawyer} onChange={(e) => setMatterField("lawyer", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Counsel</span>
          <input value={planner.matter.counsel} onChange={(e) => setMatterField("counsel", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <SelectField label="Grant type" value={planner.funding.grantType} onChange={(value) => setFundingField("grantType", value)} options={GRANT_TYPES} />
        <BooleanField label="Custody?" value={planner.matter.isCustody} onChange={(value) => setMatterField("isCustody", value)} />
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">VLA reference</span>
          <input value={planner.funding.vlaReference} onChange={(e) => setFundingField("vlaReference", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <BooleanField label="Extension requested?" value={planner.funding.extensionRequested} onChange={(value) => setFundingField("extensionRequested", value)} />
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Extension decision</span>
          <input value={planner.funding.extensionDecision} onChange={(e) => setFundingField("extensionDecision", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Matter summary</span>
          <textarea value={planner.matter.summary} onChange={(e) => setMatterField("summary", e.target.value)} rows={4} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Missing requirements</span>
          <textarea
            value={planner.funding.missingRequirements.join("\n")}
            onChange={(e) => setFundingField("missingRequirements", e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
            rows={4}
            placeholder="One item per line"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </label>
      </div>
    </section>
  );
}
