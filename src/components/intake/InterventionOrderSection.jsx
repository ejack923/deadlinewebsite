import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function InterventionOrderSection({ formData, updateNestedField }) {
  const data = formData.intervention_order_data || {};
  const update = (name, value) => updateNestedField("intervention_order_data", name, value);

  return (
    <div>
      <SectionHeader number="6" title="Intervention Order" />
      <div className="space-y-4">
        <FormField
          label="Parties"
          name="parties_role"
          type="checkbox-group"
          value={data.parties_role}
          onChange={update}
          options={["AFM", "Applicant", "Respondent", "Cross-App"]}
        />
        <FormField label="Details" name="details" multiline value={data.details} onChange={update} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Court" name="court" value={data.court} onChange={update} />
          <FormField label="Court Date" name="court_date" value={data.court_date} onChange={update} placeholder="DD/MM/YYYY" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Other Parties" name="other_parties" value={data.other_parties} onChange={update} />
          <FormField label="Station" name="station" value={data.station} onChange={update} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Advice Only" name="advice_only" type="radio" value={data.advice_only} onChange={update} options={["Yes", "No"]} />
          <FormField label="LACW File No." name="file_no" value={data.file_no} onChange={update} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Client advised of limitation date?" name="limitation_advised" type="radio" value={data.limitation_advised} onChange={update} options={["Yes", "N/A"]} />
          <FormField label="Limitation Date" name="limitation_date" value={data.limitation_date} onChange={update} placeholder="DD/MM/YYYY" />
        </div>
      </div>
    </div>
  );
}