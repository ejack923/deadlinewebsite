import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function AdviceSection({ formData, updateField }) {
  return (
    <div>
      <SectionHeader number="10" title="Advice and Instructions" />
      <div className="space-y-4">
        <FormField
          label="See attached for further notes"
          name="see_attached"
          type="checkbox"
          value={formData.see_attached}
          onChange={updateField}
        />
        <FormField
          label="Notes"
          name="advice_instructions"
          multiline
          value={formData.advice_instructions}
          onChange={updateField}
          placeholder="Enter advice and instructions..."
        />
        
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name of Staff Member" name="staff_name" value={formData.staff_name} onChange={updateField} />
            <FormField label="Role" name="staff_role" type="radio" value={formData.staff_role} onChange={updateField} options={["Solicitor", "Volunteer", "Case Manager", "Paralegal"]} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Checked by Supervisor" name="checked_by_supervisor" type="radio" value={formData.checked_by_supervisor} onChange={updateField} options={["Yes", "N/A"]} />
          <FormField label="Supervisor Check Date" name="supervisor_date" type="date" value={formData.supervisor_date} onChange={updateField} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Conflict Check" name="conflict_check" type="radio" value={formData.conflict_check} onChange={updateField} options={["Yes", "No"]} />
          <FormField label="Conflict Check Date" name="conflict_check_date" type="date" value={formData.conflict_check_date} onChange={updateField} />
        </div>
      </div>
    </div>
  );
}