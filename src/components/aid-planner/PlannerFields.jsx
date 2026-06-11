import React from "react";

export function statusClasses(status) {
  const map = {
    missing_info: "bg-slate-100 text-slate-700",
    apply_now: "bg-amber-100 text-amber-800",
    waiting_on_vla: "bg-blue-100 text-blue-800",
    extension_review: "bg-rose-100 text-rose-800",
    covered: "bg-emerald-100 text-emerald-800",
    ready_to_bill: "bg-purple-100 text-purple-800",
    manual_review: "bg-orange-100 text-orange-800",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

export function Chip({ children }) {
  return <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{children}</span>;
}

export function SelectField({ label, value, onChange, options, compact = false, required = false }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full border border-slate-200 rounded-lg px-3 ${compact ? "h-10" : "h-10"}`}>
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function BooleanField({ label, value, onChange }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select value={value ? "yes" : "no"} onChange={(e) => onChange(e.target.value === "yes")} className="w-full h-10 border border-slate-200 rounded-lg px-3">
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </label>
  );
}

export function TextListField({ label, values, onChange }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <textarea
        value={values.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
        rows={4}
        placeholder="One item per line"
        className="w-full border border-slate-200 rounded-lg px-3 py-2"
      />
    </label>
  );
}
