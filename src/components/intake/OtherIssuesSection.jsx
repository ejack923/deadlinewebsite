import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function OtherIssuesSection({ formData, updateNestedField }) {
  const data = formData.other_issues_data || {};
  const update = (name, value) => updateNestedField("other_issues_data", name, value);

  return (
    <div>
      <SectionHeader number="9" title="Other" />
      <div className="space-y-4">
        <FormField label="Issue" name="issue" value={data.issue} onChange={update} />
        <FormField label="Details" name="details" multiline value={data.details} onChange={update} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Current Agency" name="current_agency" value={data.current_agency} onChange={update} />
          <FormField label="Worker" name="worker" value={data.worker} onChange={update} />
        </div>
        <FormField label="Action" name="action" type="radio" value={data.action} onChange={update} options={["New referral", "Follow-up existing", "N/A"]} />
      </div>
    </div>
  );
}