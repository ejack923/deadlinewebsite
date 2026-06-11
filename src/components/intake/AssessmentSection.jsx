import FormField from "./FormField";

export default function AssessmentSection({ title, dataKey, formData, updateNestedField, issueOptions }) {
  const data = formData[dataKey] || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
      <FormField
        label="Issues"
        name="issues"
        type="checkbox-group"
        value={data.issues}
        onChange={(n, v) => updateNestedField(dataKey, n, v)}
        options={issueOptions}
      />
      <FormField
        label="Details"
        name="details"
        multiline
        value={data.details}
        onChange={(n, v) => updateNestedField(dataKey, n, v)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Current Agency"
          name="current_agency"
          value={data.current_agency}
          onChange={(n, v) => updateNestedField(dataKey, n, v)}
        />
        <FormField
          label="Worker"
          name="worker"
          value={data.worker}
          onChange={(n, v) => updateNestedField(dataKey, n, v)}
        />
      </div>
      <FormField
        label="Action"
        name="action"
        type="radio"
        value={data.action}
        onChange={(n, v) => updateNestedField(dataKey, n, v)}
        options={["New referral", "Follow-up existing", "N/A"]}
      />
    </div>
  );
}