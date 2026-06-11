import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function InfringementsSection({ formData, updateNestedField }) {
  const data = formData.infringements_data || {};
  const update = (name, value) => updateNestedField("infringements_data", name, value);

  return (
    <div>
      <SectionHeader number="5" title="Infringements" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Agency" name="agency" value={data.agency} onChange={update} />
          <FormField label="Obligation No." name="obligation_no" value={data.obligation_no} onChange={update} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Dates of the Offence" name="offence_dates" value={data.offence_dates} onChange={update} />
          <FormField label="Licence No." name="licence_no" value={data.licence_no} onChange={update} />
        </div>
        <FormField
          label="Reason for Fines"
          name="fines_reason"
          type="checkbox-group"
          value={data.fines_reason}
          onChange={update}
          options={["Mental Health", "Homelessness", "Drugs and Alcohol", "FV"]}
        />
        <FormField label="Supporting Material (e.g. IVO documents or support letter)" name="supporting_material" multiline value={data.supporting_material} onChange={update} />
        <FormField label="Further Details (e.g. amount)" name="further_details" value={data.further_details} onChange={update} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Court" name="court" value={data.court} onChange={update} />
          <FormField label="Court Date" name="court_date" value={data.court_date} onChange={update} placeholder="DD/MM/YYYY" />
        </div>
        <FormField label="Other Parties" name="other_parties" value={data.other_parties} onChange={update} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Advice Only" name="advice_only" type="radio" value={data.advice_only} onChange={update} options={["Yes", "No"]} />
          <FormField label="LACW File No." name="file_no" value={data.file_no} onChange={update} />
        </div>
      </div>
    </div>
  );
}