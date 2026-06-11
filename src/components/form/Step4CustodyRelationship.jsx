import React from 'react';
import { RadioField, CheckboxGroup, SectionHeader } from './FormField';

const RELATIONSHIP_OPTIONS = [
  { value: "Single", label: "Single" }, { value: "Living with partner", label: "Living with partner" },
  { value: "Married", label: "Married" }, { value: "Separated from partner", label: "Separated from partner" },
  { value: "Married but separated", label: "Married but separated" }, { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" }, { value: "Not applicable", label: "Not applicable" },
];

const BENEFIT_OPTIONS = [
  { value: "Abstudy", label: "Abstudy*" }, { value: "Age pension", label: "Age pension*" },
  { value: "Austudy", label: "Austudy*" }, { value: "Carer payment", label: "Carer payment*" },
  { value: "Disability support pension", label: "Disability support pension*" },
  { value: "JobSeeker", label: "JobSeeker (formerly Newstart)*" },
  { value: "Youth allowance", label: "Youth allowance*" }, { value: "Parenting payment", label: "Parenting payment*" },
  { value: "Partner allowance", label: "Partner allowance*" }, { value: "Sickness allowance", label: "Sickness allowance*" },
  { value: "Special benefits", label: "Special benefits*" }, { value: "Veterans/war service", label: "Veterans/war service" },
  { value: "Widow allowance", label: "Widow allowance*" }, { value: "Widow B pension", label: "Widow B pension*" },
  { value: "Wife pension", label: "Wife pension*" }, { value: "Other", label: "Other" },
];

export default function Step4CustodyRelationship({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader number="10" title="Relationship status" />
        <RadioField label="What is your relationship status?" name="relationship_status" value={data.relationship_status} onChange={onChange} options={RELATIONSHIP_OPTIONS} inline={false} />
      </div>

      <div>
        <SectionHeader number="11" title="Are you currently experiencing or fleeing family violence?" />
        <RadioField label="" name="family_violence" value={data.family_violence} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
      </div>

      <div>
        <SectionHeader number="12" title="Partner details" />
        <div className="p-4 bg-blue-50 rounded-lg mb-5 text-sm text-gray-600 leading-relaxed">
          <p className="font-medium text-gray-800 mb-2">In this form 'Partner' means spouse or defacto partner, where you have lived together in a genuine domestic relationship for at least 6 months.</p>
          <p>We don't consider you to have a partner if: they have an opposing interest in your legal proceedings; you have recently separated; they live overseas without income/assets; they are in prison without assets; there is family violence involved; or your relationship may be damaged if they knew about your legal issue.</p>
        </div>
        <div className="space-y-5">
          <RadioField label="Do you have a partner?" name="has_partner" value={data.has_partner} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.has_partner === "Yes" && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
              Please include the partner's financial information, including their Centrelink details if they receive a benefit.
            </div>
          )}
          {data.has_partner === "Yes" && (
            <>
              <RadioField label="Does your partner receive a Centrelink benefit or income support?" name="partner_benefit" value={data.partner_benefit} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
              {data.partner_benefit === "Yes" && (
                <>
                  <CheckboxGroup label="What type of benefit do they receive?" name="partner_benefit_types" values={data.partner_benefit_types} onChange={onChange} options={BENEFIT_OPTIONS} />
                  <RadioField label="Do they receive the maximum rate of benefit?" name="partner_max_benefit" value={data.partner_max_benefit} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
