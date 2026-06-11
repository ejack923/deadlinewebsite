import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function VOCATSection({ formData, updateNestedField }) {
  const data = formData.vocat_data || {};
  const update = (name, value) => updateNestedField("vocat_data", name, value);

  return (
    <div>
      <SectionHeader number="4" title="VOCAT" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Injury" name="injury" value={data.injury} onChange={update} />
          <FormField label="Date of Injury" name="date_of_injury" value={data.date_of_injury} onChange={update} placeholder="DD/MM/YYYY" />
        </div>
        <FormField label="Details" name="details" multiline value={data.details} onChange={update} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tribunal" name="tribunal" value={data.tribunal} onChange={update} />
          <FormField label="Hearing Date" name="hearing_date" value={data.hearing_date} onChange={update} placeholder="DD/MM/YYYY" />
        </div>
        <FormField label="Other Parties" name="other_parties" value={data.other_parties} onChange={update} />
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