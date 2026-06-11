import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function MatterDetailsSection({ formData, updateField }) {
  return (
    <div>
      <SectionHeader number="2" title="Matter Details" />
      <FormField
        label="Matter Type(s)"
        name="matter_types"
        type="checkbox-group"
        value={formData.matter_types}
        onChange={updateField}
        options={["Criminal", "VOCAT", "Infringements", "IVO", "Other"]}
      />
    </div>
  );
}