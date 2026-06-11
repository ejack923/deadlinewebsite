import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function CriminalSection({ formData, updateNestedField }) {
  const data = formData.criminal_data || {};
  const update = (name, value) => updateNestedField("criminal_data", name, value);

  return (
    <div>
      <SectionHeader number="3" title="Criminal Matters" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Informant" name="informant" value={data.informant} onChange={update} />
          <FormField label="Station" name="station" value={data.station} onChange={update} />
        </div>
        <FormField label="Charges" name="charges" multiline value={data.charges} onChange={update} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Court" name="court" value={data.court} onChange={update} />
          <FormField label="Court Date" name="court_date" value={data.court_date} onChange={update} placeholder="DD/MM/YYYY" />
        </div>
        <FormField label="Other Parties" name="other_parties" value={data.other_parties} onChange={update} />
        <FormField label="Type" name="type" type="radio" value={data.type} onChange={update} options={["Summary", "Indictable", "Kids"]} />
        <div className="flex flex-wrap gap-6">
          <FormField label="Summons" name="summons" type="checkbox" value={data.summons} onChange={update} />
          <FormField label="Bail" name="bail" type="checkbox" value={data.bail} onChange={update} />
          <FormField label="Custody" name="custody" type="checkbox" value={data.custody} onChange={update} />
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