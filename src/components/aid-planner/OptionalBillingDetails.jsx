import React from "react";
import { TextListField } from "./PlannerFields";

export default function OptionalBillingDetails({ planner, setMatterField, setBillingField }) {
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Optional billing details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Last invoice date</span>
          <input type="date" value={planner.billing.lastInvoiceDate} onChange={(e) => setBillingField("lastInvoiceDate", e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3" />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-1 mt-6">
          <input type="checkbox" checked={planner.matter.currentAppearanceComplete} onChange={(e) => setMatterField("currentAppearanceComplete", e.target.checked)} />
          Current appearance complete
        </label>
        <TextListField label="Billable now" values={planner.billing.billableItems} onChange={(values) => setBillingField("billableItems", values)} />
        <TextListField label="Hold" values={planner.billing.holdItems} onChange={(values) => setBillingField("holdItems", values)} />
        <TextListField label="Needs extension first" values={planner.billing.extensionItems} onChange={(values) => setBillingField("extensionItems", values)} />
        <TextListField label="Needs approval" values={planner.billing.approvalItems} onChange={(values) => setBillingField("approvalItems", values)} />
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Billing notes</span>
          <textarea value={planner.billing.billingNotes} onChange={(e) => setBillingField("billingNotes", e.target.value)} rows={4} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
        </label>
      </div>
    </section>
  );
}
