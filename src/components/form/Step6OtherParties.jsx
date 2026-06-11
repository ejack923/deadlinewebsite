import React from 'react';
import { TextField, RadioField, SectionHeader } from './FormField';
import { Label } from "@/components/ui/label";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" }, { value: "Mrs", label: "Mrs" }, { value: "Ms", label: "Ms" },
  { value: "Miss", label: "Miss" }, { value: "Master", label: "Master" }, { value: "Dr", label: "Dr" },
  { value: "Mr/Mrs", label: "Mr/Mrs" }, { value: "Estate of", label: "Estate of" }, { value: "Mx", label: "Mx" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "Spouse/partner", label: "Spouse/partner" }, { value: "Child", label: "Child" },
  { value: "Ex-spouse", label: "Ex-spouse" }, { value: "Sibling", label: "Sibling" },
  { value: "Grandparent", label: "Grandparent" }, { value: "Grandchild", label: "Grandchild" },
  { value: "Parent", label: "Parent" }, { value: "Co-accused", label: "Co-accused" },
  { value: "Other", label: "Other" },
];

const ROLE_OPTIONS = [
  { value: "Applicant/plaintiff/appellant", label: "Applicant/plaintiff/appellant" },
  { value: "Accused/defendant/respondent", label: "Accused/defendant/respondent" },
  { value: "Interested party", label: "Interested party" },
  { value: "No court proceedings", label: "No court proceedings" },
  { value: "Other", label: "Other" },
];

/**
 * @param {{
 *   data: Record<string, any>,
 *   onChange: (name: string, value: any) => void
 * }} props
 */
export default function Step6OtherParties({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader number="17" title="Other parties" />
        <div className="p-4 bg-blue-50 rounded-lg mb-5 text-sm text-gray-600">
          For some disputes (e.g. family law matter) VLA may use this information to contact the other party to attempt appropriate dispute resolution.
        </div>
        <div className="space-y-5">
          <RadioField label="Are there other parties to this matter?" name="has_other_parties" value={data.has_other_parties} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.has_other_parties === "Yes" && (
            <>
              <RadioField label="Specify whether the other party is:" name="other_party_type" value={data.other_party_type} onChange={onChange} options={[{value:"A person",label:"A person"},{value:"An institution",label:"An institution"}]} />
              
              {data.other_party_type === "An institution" && (
                <TextField label="Name of institution" name="op_institution_name" value={data.op_institution_name} onChange={onChange} />
              )}
              
              {data.other_party_type === "A person" && (
                <div className="space-y-5 p-4 border border-gray-200 rounded-lg">
                  <RadioField label="Title" name="op_title" value={data.op_title} onChange={onChange} options={TITLE_OPTIONS} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <TextField label="First name" name="op_first_name" value={data.op_first_name} onChange={onChange} />
                    <TextField label="Middle name" name="op_middle_name" value={data.op_middle_name} onChange={onChange} />
                    <TextField label="Last name" name="op_last_name" value={data.op_last_name} onChange={onChange} />
                  </div>
                  <RadioField label="Gender" name="op_gender" value={data.op_gender} onChange={onChange} options={[{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Self-described",label:"Self-described"},{value:"Not applicable",label:"Not applicable"}]} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField label="Date of birth" name="op_dob" value={data.op_dob} onChange={onChange} type="date" />
                    <RadioField label="Is date of birth an estimate only?" name="op_dob_estimate" value={data.op_dob_estimate} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField label="Phone" name="op_phone" value={data.op_phone} onChange={onChange} />
                    <TextField label="Mobile" name="op_mobile" value={data.op_mobile} onChange={onChange} />
                  </div>
                  <TextField label="Email address" name="op_email" value={data.op_email} onChange={onChange} type="email" />
                  <TextField label="Address" name="op_address" value={data.op_address} onChange={onChange} />
                  <RadioField label="Please describe the other party's relationship to you:" name="op_relationship" value={data.op_relationship} onChange={onChange} options={RELATIONSHIP_OPTIONS} inline={false} />
                  <RadioField label="Please describe the other party's role in these proceedings:" name="op_role" value={data.op_role} onChange={onChange} options={ROLE_OPTIONS} inline={false} />
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Label className="text-sm font-semibold text-[#0071BC] block mb-3">Details of other party's lawyer</Label>
                    <div className="space-y-4">
                      <TextField label="Name of firm" name="op_lawyer_firm" value={data.op_lawyer_firm} onChange={onChange} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextField label="Phone" name="op_lawyer_phone" value={data.op_lawyer_phone} onChange={onChange} />
                        <TextField label="Fax" name="op_lawyer_fax" value={data.op_lawyer_fax} onChange={onChange} />
                      </div>
                      <TextField label="Email address" name="op_lawyer_email" value={data.op_lawyer_email} onChange={onChange} type="email" />
                      <TextField label="Postal address" name="op_lawyer_address" value={data.op_lawyer_address} onChange={onChange} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
