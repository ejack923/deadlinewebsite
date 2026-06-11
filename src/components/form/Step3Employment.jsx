import React from 'react';
import { TextField, RadioField, CheckboxGroup, SectionHeader } from './FormField';
import { Label } from "@/components/ui/label";

const EMPLOYMENT_OPTIONS = [
  { value: "Full time", label: "Full time" }, { value: "Part time", label: "Part time" },
  { value: "Casual", label: "Casual" }, { value: "Not employed", label: "Not employed" },
  { value: "Self-employed", label: "Self-employed" },
];

const SUPPORT_OPTIONS = [
  { value: "APPLYING FOR BENEFITS", label: "APPLYING FOR BENEFITS" },
  { value: "FLEEING FAMILY VIOLENCE", label: "FLEEING FAMILY VIOLENCE" },
  { value: "IN CUSTODY", label: "IN CUSTODY" },
  { value: "OTHER", label: "OTHER" },
  { value: "SUPPORTED BY NON PARTNER", label: "SUPPORTED BY NON PARTNER" },
  { value: "SUPPORTED BY PARTNER LISTED", label: "SUPPORTED BY PARTNER LISTED" },
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

/**
 * @param {{
 *   data: Record<string, any>,
 *   onChange: (name: string, value: any) => void
 * }} props
 */
export default function Step3Employment({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader number="7" title="Employment status" />
        <RadioField label="What is your employment status?" name="employment_status" value={data.employment_status} onChange={onChange} options={EMPLOYMENT_OPTIONS} />
      </div>

      <div>
        <SectionHeader number="8" title="Benefit details" />
        <div className="space-y-5">
          <RadioField label="Do you receive a Centrelink benefit or income support?" name="receives_benefit" value={data.receives_benefit} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.receives_benefit === "Yes" && (
            <>
              <div className="space-y-2">
                <a
                  href="https://business.centrelink.gov.au/LoginServices/source/VANguard/ValidateBAN.jsp?finalURL=http%3A%2F%2Fbusiness.humanservices.gwy%2FLoginServices%2FAuthenticate.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-700 underline hover:text-blue-900 block"
                >
                  Confirm Centrelink payment
                </a>
                <a
                  href="https://www.servicesaustralia.gov.au/how-to-apply-to-use-centrelink-confirmation-eservices-for-businesses?context=23236"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-700 underline hover:text-blue-900 block"
                >
                  Apply for Centrelink online services
                </a>
              </div>
              <TextField label="What is your Centrelink reference number?" name="centrelink_ref" value={data.centrelink_ref} onChange={onChange} />
              <CheckboxGroup label="What type of benefit do you receive?" name="benefit_types" values={data.benefit_types} onChange={onChange} options={BENEFIT_OPTIONS} />
              <RadioField label="Do you receive the maximum rate of benefit?" name="max_benefit_rate" value={data.max_benefit_rate} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            </>
          )}
          {data.employment_status === "Not employed" && data.receives_benefit === "No" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Please select your support source:</Label>
              <select
                value={data.support_source || ""}
                onChange={e => onChange("support_source", e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0071BC]/20"
              >
                <option value="">Select...</option>
                {SUPPORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
