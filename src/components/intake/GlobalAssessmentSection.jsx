import SectionHeader from "./SectionHeader";
import AssessmentSection from "./AssessmentSection";

export default function GlobalAssessmentSection({ formData, updateNestedField }) {
  return (
    <div>
      <SectionHeader number="7" title="Global Assessment" />
      <div className="space-y-5">
        <AssessmentSection
          title="Family Violence"
          dataKey="family_violence_data"
          formData={formData}
          updateNestedField={updateNestedField}
          issueOptions={["Yes", "No", "At Risk", "Other", "Unknown", "Current IVO", "IVO Application required", "Other safety plan in place", "N/A"]}
        />
        <AssessmentSection
          title="Housing"
          dataKey="housing_data"
          formData={formData}
          updateNestedField={updateNestedField}
          issueOptions={["Homeless", "At risk/Unstable", "Other", "N/A"]}
        />
        <AssessmentSection
          title="Drug and Alcohol"
          dataKey="drug_alcohol_data"
          formData={formData}
          updateNestedField={updateNestedField}
          issueOptions={["Alcohol", "Drugs", "Other", "N/A"]}
        />
        <AssessmentSection
          title="Health and Wellbeing"
          dataKey="health_wellbeing_data"
          formData={formData}
          updateNestedField={updateNestedField}
          issueOptions={["Mental illness", "Disability", "Trauma", "Other", "N/A"]}
        />
        <AssessmentSection
          title="Financial Disadvantage"
          dataKey="financial_disadvantage_data"
          formData={formData}
          updateNestedField={updateNestedField}
          issueOptions={["Unpaid fines", "Outstanding debt", "Cannot Access Funds", "No Means", "Centrelink", "Other", "N/A"]}
        />
        <AssessmentSection
          title="Children"
          dataKey="children_data"
          formData={formData}
          updateNestedField={updateNestedField}
          issueOptions={["Family law proceedings", "Custody Issues", "Other", "N/A"]}
        />
      </div>
    </div>
  );
}