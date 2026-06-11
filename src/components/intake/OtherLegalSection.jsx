import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function OtherLegalSection({ formData, updateField }) {
  const matters = formData.other_legal_matters || [];

  const addMatter = () => {
    updateField("other_legal_matters", [...matters, { type: "", critical_dates: "", representation: "", referral_required: "" }]);
  };

  const removeMatter = (index) => {
    updateField("other_legal_matters", matters.filter((_, i) => i !== index));
  };

  const updateMatter = (index, field, value) => {
    const updated = matters.map((m, i) => i === index ? { ...m, [field]: value } : m);
    updateField("other_legal_matters", updated);
  };

  return (
    <div>
      <SectionHeader number="8" title="Other Legal Matters" />
      
      <FormField
        label="N/A"
        name="other_legal_na"
        type="checkbox"
        value={formData.other_legal_na}
        onChange={updateField}
        className="mb-4"
      />

      {!formData.other_legal_na && (
        <div className="space-y-4">
          {matters.map((matter, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-7 w-7 text-slate-400 hover:text-red-500"
                onClick={() => removeMatter(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Type" name="type" value={matter.type} onChange={(n, v) => updateMatter(index, n, v)} />
                <FormField label="Critical Dates" name="critical_dates" value={matter.critical_dates} onChange={(n, v) => updateMatter(index, n, v)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Representation" name="representation" value={matter.representation} onChange={(n, v) => updateMatter(index, n, v)} />
                <FormField label="Referral Required" name="referral_required" type="radio" value={matter.referral_required} onChange={(n, v) => updateMatter(index, n, v)} options={["Yes", "No"]} />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addMatter} className="gap-2">
            <Plus className="h-4 w-4" /> Add Legal Matter
          </Button>
        </div>
      )}
    </div>
  );
}