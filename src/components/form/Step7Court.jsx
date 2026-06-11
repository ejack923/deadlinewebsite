import React from 'react';
import { TextField, TextAreaField, RadioField, CheckboxGroup, SectionHeader } from './FormField';

const ROLE_OPTIONS = [
  { value: "Applicant/plaintiff/appellant", label: "Applicant/plaintiff/appellant" },
  { value: "Accused/defendant/respondent", label: "Accused/defendant/respondent" },
  { value: "Interested party", label: "Interested party" },
  { value: "No court proceedings", label: "No court proceedings" },
  { value: "Other", label: "Other" },
];

const HEARING_TYPE_OPTIONS = [
  { value: "Appeal", label: "Appeal" }, { value: "Summary hearing", label: "Summary hearing" },
  { value: "Indictable hearing", label: "Indictable hearing" },
  { value: "Family law hearing", label: "Family law hearing" },
  { value: "Civil application", label: "Civil application" },
  { value: "Mediation/ADR", label: "Mediation/alternative dispute resolution (ADR)" },
  { value: "No hearing", label: "No hearing" }, { value: "Other", label: "Other" },
];

const LAW_TYPE_OPTIONS = [
  { value: "Criminal law", label: "Criminal law" },
  { value: "Family law", label: "Family law" },
  { value: "Family violence", label: "Family violence" },
  { value: "Civil law", label: "Civil law" },
];

const FACTOR_OPTIONS = [
  { value: "fv_victim", label: "Family violence – victim/survivor" },
  { value: "fv_perpetrator", label: "Family violence – alleged perpetrator" },
  { value: "covid", label: "COVID-19" }, { value: "ice", label: "Ice" },
  { value: "alcohol", label: "Alcohol" }, { value: "drugs_other", label: "Drugs – other" },
];

export default function Step7Court({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader number="18" title="Court hearings" />
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
          <p className="font-medium">Search for court listings:</p>
          <ul className="space-y-1">
            <li>
              <a href="https://dailylists.magistratesvic.com.au/EFAS/CaseSearch" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
                Magistrates' Court Daily Lists – Case Search
              </a>
            </li>
            <li>
              <a href="http://cjep.justice.vic.gov.au/pls/p100/ck_public_qry_crim.cp_crimlist_setup_idx" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
                County Court List
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-5">
          <RadioField label="Are there any proceedings?" name="has_proceedings" value={data.has_proceedings} onChange={onChange} options={[{value:"No",label:"No"},{value:"Yes, current",label:"Yes, current"},{value:"Yes, intended",label:"Yes, intended"}]} />
          {data.has_proceedings !== "No" && data.has_proceedings && (
            <>
              <TextField label="When is the next hearing date?" name="hearing_date" value={data.hearing_date} onChange={onChange} type="date" />
              <TextField label="Which court/tribunal do you have to go to?" name="court_tribunal" value={data.court_tribunal} onChange={onChange} />
              <RadioField label="What is your role in these proceedings?" name="proceedings_role" value={data.proceedings_role} onChange={onChange} options={ROLE_OPTIONS} inline={false} />
              <RadioField label="What type of hearing is it?" name="hearing_type" value={data.hearing_type} onChange={onChange} options={HEARING_TYPE_OPTIONS} inline={false} />
              {data.hearing_type === "Other" && (
                <TextField label="Please specify" name="hearing_type_other" value={data.hearing_type_other} onChange={onChange} />
              )}
              <TextField label="Court proceedings number (not mandatory)" name="court_number" value={data.court_number} onChange={onChange} />
            </>
          )}
        </div>
      </div>

      <div>
        <SectionHeader number="19" title="Payment of fees" />
        <div className="space-y-5">
          <RadioField label="Have you or any other person paid any of your legal fees for this case?" name="fees_paid" value={data.fees_paid} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.fees_paid === "Yes" && (
            <>
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
                Please include any proof of payment for legal fee's paid.
              </div>
              <TextField label="Name of the person who paid the legal fees" name="fee_payer_name" value={data.fee_payer_name} onChange={onChange} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Relationship to you" name="fee_payer_relationship" value={data.fee_payer_relationship} onChange={onChange} />
                <TextField label="Amount paid" name="fee_amount_paid" value={data.fee_amount_paid} onChange={onChange} />
              </div>
              <TextAreaField label="If another person has paid previous fees, please outline why they cannot continue to pay:" name="fee_payer_reason" value={data.fee_payer_reason} onChange={onChange} />
            </>
          )}
        </div>
      </div>

      <div>
        <SectionHeader number="20" title="Your lawyer" />
        <div className="space-y-5">
          <TextField label="Who do you want as a lawyer?" name="preferred_lawyer" value={data.preferred_lawyer} onChange={onChange} />
          <TextField label="Firm's name and details" name="lawyer_firm_details" value={data.lawyer_firm_details} onChange={onChange} />
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
            If you have a lawyer assisting you with this application, we recommend that you ask the lawyer to submit the application on your behalf.
          </div>
        </div>
      </div>

      <div>
        <SectionHeader number="21" title="Your legal problem" />
        <div className="space-y-5">
          <RadioField label="What type of law applies to your legal problem?" name="law_type" value={data.law_type} onChange={onChange} options={LAW_TYPE_OPTIONS} inline={false} />
          {data.law_type === "Civil law" && (
            <TextField label="Please specify (e.g. inquest, discrimination)" name="civil_law_specify" value={data.civil_law_specify} onChange={onChange} />
          )}
          <CheckboxGroup label="Are any of the following factors relevant to your legal problem?" name="relevant_factors" values={data.relevant_factors} onChange={onChange} options={FACTOR_OPTIONS} />
        </div>
      </div>
    </div>
  );
}
