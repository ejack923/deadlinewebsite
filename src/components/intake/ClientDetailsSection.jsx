import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

export default function ClientDetailsSection({ formData, updateField }) {
  return (
    <div>
      <SectionHeader number="1" title="Client Details" />
      
      <div className="space-y-5">
        {/* Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="First Name" name="first_name" value={formData.first_name} onChange={updateField} />
          <FormField label="Middle Name" name="middle_name" value={formData.middle_name} onChange={updateField} />
          <FormField label="Surname" name="surname" value={formData.surname} onChange={updateField} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Alias" name="alias" value={formData.alias} onChange={updateField} />
          <FormField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={updateField} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Address" name="address" value={formData.address} onChange={updateField} className="md:col-span-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Phone" name="phone" value={formData.phone} onChange={updateField} />
          <FormField label="Email" name="email_address" value={formData.email_address} onChange={updateField} />
          <FormField label="Authorised to Speak To" name="authorised_to_speak_to" value={formData.authorised_to_speak_to} onChange={updateField} />
        </div>

        {/* Custody */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Custody Status" name="custody_status" value={formData.custody_status} onChange={updateField} />
          <FormField label="CRN (if in custody)" name="crn" value={formData.crn} onChange={updateField} />
          <FormField label="Country of Birth" name="country_of_birth" value={formData.country_of_birth} onChange={updateField} placeholder="Australia" />
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Citizenship" name="citizenship" type="radio" value={formData.citizenship} onChange={updateField} options={["Australian", "Other"]} />
          {formData.citizenship === "Other" && (
            <FormField label="Specify Citizenship" name="citizenship_other" value={formData.citizenship_other} onChange={updateField} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="CALD Status" name="cald_status" type="radio" value={formData.cald_status} onChange={updateField} options={["Yes", "No"]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Preferred Language" name="preferred_language" type="radio" value={formData.preferred_language} onChange={updateField} options={["English", "Other"]} />
          {formData.preferred_language === "Other" && (
            <FormField label="Specify Language" name="preferred_language_other" value={formData.preferred_language_other} onChange={updateField} />
          )}
        </div>

        <FormField label="Interpreter Required" name="interpreter_required" type="radio" value={formData.interpreter_required} onChange={updateField} options={["Never", "Always", "Court Appearances Only"]} />

        <FormField label="Indigenous Status" name="indigenous_status" type="radio" value={formData.indigenous_status} onChange={updateField} options={["Aboriginal", "TSI", "Aboriginal and TSI", "Neither", "Not stated"]} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Disability" name="disability" type="radio" value={formData.disability} onChange={updateField} options={["No", "Yes"]} />
          {formData.disability === "Yes" && (
            <FormField label="Disability Details" name="disability_details" value={formData.disability_details} onChange={updateField} />
          )}
        </div>

        {/* Employment & Financial */}
        <div className="pt-4 border-t border-slate-100">
          <FormField label="Employment" name="employment" type="radio" value={formData.employment} onChange={updateField} options={["Full Time", "Part time", "Casual", "Unemployed"]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Occupation" name="occupation" value={formData.occupation} onChange={updateField} />
          <FormField label="Weekly Income" name="weekly_income" value={formData.weekly_income} onChange={updateField} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Centrelink Reference" name="centrelink_reference" value={formData.centrelink_reference} onChange={updateField} />
          <FormField label="Health Care Card" name="health_care_card" type="radio" value={formData.health_care_card} onChange={updateField} options={["Yes", "No"]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Benefit Type" name="benefit_type" value={formData.benefit_type} onChange={updateField} />
          <FormField label="Maximum Rate?" name="maximum_rate" type="radio" value={formData.maximum_rate} onChange={updateField} options={["Yes", "No"]} />
        </div>

        {/* Personal */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Dependents (children and others)" name="dependents" value={formData.dependents} onChange={updateField} />
            <FormField label="Other Financial Supports" name="other_financial_supports" value={formData.other_financial_supports} onChange={updateField} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Relationship Status" name="relationship_status" value={formData.relationship_status} onChange={updateField} />
          <FormField label="Living With" name="living_with" value={formData.living_with} onChange={updateField} />
          <FormField label="Housing Type" name="housing_type" value={formData.housing_type} onChange={updateField} />
        </div>

        {/* Referral */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Referring Agency" name="referring_agency" type="radio" value={formData.referring_agency} onChange={updateField} options={["Djirra", "VLA", "Other", "N/A"]} />
            {formData.referring_agency === "Other" && (
              <FormField label="Specify Agency" name="referring_agency_other" value={formData.referring_agency_other} onChange={updateField} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Referrer's Contact" name="referrer_contact" value={formData.referrer_contact} onChange={updateField} />
          <FormField label="Current Lawyer" name="current_lawyer" value={formData.current_lawyer} onChange={updateField} />
        </div>
      </div>
    </div>
  );
}