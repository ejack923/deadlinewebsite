// @ts-nocheck
import React, { useEffect } from 'react';
import { TextField, RadioField, SectionHeader, SelectField } from './FormField';
import AddressAutocomplete from './AddressAutocomplete';

const PRISON_ADDRESSES = {
  "Barwon Prison (Lara)": "1140 Bacchus Marsh Road, Lara VIC 3212",
  "Melbourne Assessment Prison (Melbourne)": "317-353 Spencer Street, West Melbourne VIC 3003",
  "Metropolitan Remand Centre (Ravenhall)": "Middle Road, Ravenhall VIC 3023",
  "Port Phillip Prison (Truganina)": "451 Dohertys Road, Truganina VIC 3029",
  "Ravenhall Correctional Centre (Ravenhall)": "97 Riding Boundary Road, Ravenhall VIC 3023",
  "Fulham Correctional Centre (Fulham)": "110 Hopkins Road, Fulham VIC 3851",
  "Dame Phyllis Frost Centre (Ravenhall)": "101-201 Riding Boundary Road, Ravenhall VIC 3023",
  "Loddon Prison (Castlemaine)": "19 Hitchcock Street, Castlemaine VIC 3450",
  "Hopkins Correctional Centre (Ararat)": "156A Warrak Road, Ararat VIC 3377",
  "Langi Kal Kal Prison (Langi Kal Kal)": "Langi Kal Kal Road, Langi Kal Kal VIC 3352",
  "Beechworth Correctional Centre (Beechworth)": "494 Flat Rock Road, Beechworth VIC 3747",
  "Tarrengower Prison (Maldon)": "9 Maldon-Shelbourne Rd, Nuggetty VIC 3463",
  "Judy Lazarus Transition Centre (West Melbourne)": "50 Adderley Street, West Melbourne VIC 3003",
  "Western Plains Correctional Centre (Lara)": "1150 Bacchus Marsh Rd, Lara VIC 3212",
};

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" }, { value: "Mrs", label: "Mrs" }, { value: "Ms", label: "Ms" },
  { value: "Miss", label: "Miss" }, { value: "Master", label: "Master" }, { value: "Dr", label: "Dr" },
  { value: "Mr/Mrs", label: "Mr/Mrs" }, { value: "Estate of", label: "Estate of" }, { value: "Mx", label: "Mx" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" }, { value: "Female", label: "Female" },
  { value: "Self-described", label: "Self-described" },
  { value: "Trans or gender diverse", label: "Trans or gender diverse" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const ATSI_OPTIONS = [
  { value: "No", label: "No" }, { value: "Yes, Aboriginal", label: "Yes, Aboriginal" },
  { value: "Yes, Torres Strait Islander", label: "Yes, Torres Strait Islander" },
  { value: "Yes, Aboriginal and Torres Strait Islander", label: "Yes, Aboriginal and Torres Strait Islander" },
];

export default function Step1PersonalDetails({ data, onChange }) {
  useEffect(() => {
    if (data.custody_facility) {
      if (PRISON_ADDRESSES[data.custody_facility]) {
        onChange({ target: { name: 'postal_address', value: PRISON_ADDRESSES[data.custody_facility] } });
      }
      onChange({ target: { name: 'custody_location', value: data.custody_facility } });
    }
  }, [data.custody_facility]);

  return (
    <div className="space-y-8">
      {/* Section 1 */}
      <div>
        <SectionHeader number="1" title="Personal details" />
        <div className="space-y-5">
          <RadioField label="Title" name="title" value={data.title} onChange={onChange} options={TITLE_OPTIONS} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField label="First name" name="first_name" value={data.first_name} onChange={onChange} required />
            <TextField label="Middle name" name="middle_name" value={data.middle_name} onChange={onChange} />
            <TextField label="Last name" name="last_name" value={data.last_name} onChange={onChange} required />
          </div>
          <RadioField label="Gender" name="gender" value={data.gender} onChange={onChange} options={GENDER_OPTIONS} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Date of birth" name="date_of_birth" value={data.date_of_birth} onChange={onChange} type="date" />
            <RadioField label="Is date of birth an estimate only?" name="dob_estimate" value={data.dob_estimate} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            <RadioField label="Are you currently in custody?" name="currently_in_custody" value={data.currently_in_custody} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            {data.currently_in_custody === "Yes" && (
              <SelectField label="Which facility?" name="custody_facility" value={data.custody_facility} onChange={onChange} options={[
                { value: "Barwon Prison (Lara)", label: "Barwon Prison (Lara)" },
                { value: "Melbourne Assessment Prison (Melbourne)", label: "Melbourne Assessment Prison (Melbourne)" },
                { value: "Metropolitan Remand Centre (Ravenhall)", label: "Metropolitan Remand Centre (Ravenhall)" },
                { value: "Port Phillip Prison (Truganina)", label: "Port Phillip Prison (Truganina)" },
                { value: "Ravenhall Correctional Centre (Ravenhall)", label: "Ravenhall Correctional Centre (Ravenhall)" },
                { value: "Fulham Correctional Centre (Fulham)", label: "Fulham Correctional Centre (Fulham)" },
                { value: "Dame Phyllis Frost Centre (Ravenhall)", label: "Dame Phyllis Frost Centre (Ravenhall)" },
                { value: "Loddon Prison (Castlemaine)", label: "Loddon Prison (Castlemaine)" },
                { value: "Hopkins Correctional Centre (Ararat)", label: "Hopkins Correctional Centre (Ararat)" },
                { value: "Langi Kal Kal Prison (Langi Kal Kal)", label: "Langi Kal Kal Prison (Langi Kal Kal)" },
                { value: "Beechworth Correctional Centre (Beechworth)", label: "Beechworth Correctional Centre (Beechworth)" },
                { value: "Tarrengower Prison (Maldon)", label: "Tarrengower Prison (Maldon)" },
                { value: "Judy Lazarus Transition Centre (West Melbourne)", label: "Judy Lazarus Transition Centre (West Melbourne)" },
                { value: "Western Plains Correctional Centre (Lara)", label: "Western Plains Correctional Centre (Lara)" },
              ]} />
            )}
          </div>
          {data.currently_in_custody === "Yes" && (
            <>
              <TextField label="Date remanded into custody or detention" name="custody_date" value={data.custody_date} onChange={onChange} type="date" />
              <TextField label="Corrective services ID (not compulsory)" name="corrective_services_id" value={data.corrective_services_id} onChange={onChange} />
            </>
          )}
          <AddressAutocomplete label="Your home address (even if you are in custody)" name="home_address" value={data.home_address} onChange={onChange} />
          <AddressAutocomplete label="Your postal address (leave blank if same as home address)" name="postal_address" value={data.postal_address || (data.custody_facility ? PRISON_ADDRESSES[data.custody_facility] || '' : '')} onChange={onChange} />
          <RadioField label="Are you homeless?" name="homeless" value={data.homeless} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          <RadioField label="Would you prefer to be contacted by email?" name="contact_email_pref" value={data.contact_email_pref} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.contact_email_pref === "Yes" && (
            <TextField label="Email address" name="email" value={data.email} onChange={onChange} type="email" />
          )}
          <RadioField label="Send all correspondence to your lawyer only?" name="correspondence_lawyer" value={data.correspondence_lawyer} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Home phone" name="home_phone" value={data.home_phone} onChange={onChange} />
            <TextField label="Mobile phone" name="mobile_phone" value={data.mobile_phone} onChange={onChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Work phone" name="work_phone" value={data.work_phone} onChange={onChange} />
            <TextField label="Other contact phone" name="other_phone" value={data.other_phone} onChange={onChange} />
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <SectionHeader number="2" title="Additional details" />
        <div className="space-y-5">
          <RadioField label="Have you used any other names with Victoria Legal Aid (VLA)?" name="other_names_used" value={data.other_names_used} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.other_names_used === "Yes" && (
            <TextField label="If yes, please list any other name(s) used" name="other_names_list" value={data.other_names_list} onChange={onChange} />
          )}
        </div>
      </div>

      {/* Section 3 */}
      <div>
        <SectionHeader number="3" title="Your background" />
        <div className="space-y-5">
          <TextField label="Country of birth" name="country_of_birth" value={data.country_of_birth} onChange={onChange} />
          <TextField label="If you were not born in Australia, which year did you arrive here?" name="arrival_year" value={data.arrival_year} onChange={onChange} />
          <RadioField label="Are you of Aboriginal or Torres Strait Islander origin?" name="atsi_origin" value={data.atsi_origin} onChange={onChange} options={ATSI_OPTIONS} inline={false} />
        </div>
      </div>
    </div>
  );
}
