import React from 'react';
import { TextAreaField, SectionHeader } from './FormField';

export default function Step8LegalDetails({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader number="22" title="Describe your legal problem" />
        <div className="p-4 bg-blue-50 rounded-lg mb-5 text-sm text-gray-600">
          For criminal matters, please provide details of the charges; for family matters and family violence matters, please specify the issue(s), the background, and the orders being sought (e.g. residence of children).
        </div>
        <TextAreaField label="Please provide details of your legal problem:" name="legal_problem_details" value={data.legal_problem_details} onChange={onChange} rows={6} />
      </div>

      <div>
        <SectionHeader number="23" title="VLA guideline under which assistance is being sought" />
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5 text-sm text-gray-600">
          Help: please see the VLA Handbook at <a href="http://handbook.vla.vic.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#0071BC] underline">handbook.vla.vic.gov.au</a>
        </div>
        <TextAreaField label="Please identify and address the VLA guideline:" name="vla_guideline" value={data.vla_guideline} onChange={onChange} rows={5} />
      </div>

      <div>
        <SectionHeader number="24" title="Merits of the application" />
        <p className="text-sm text-gray-500 italic mb-3">This question does not need to be completed in indictable matters.</p>
        <TextAreaField label="Please set out the merits of the application:" name="application_merits" value={data.application_merits} onChange={onChange} rows={5} />
      </div>

      <div>
        <SectionHeader number="25" title="Detriment to the applicant if this application is refused" />
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5 text-sm text-gray-600">
          Help: please see the VLA Handbook at <a href="http://handbook.vla.vic.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#0071BC] underline">handbook.vla.vic.gov.au</a>
        </div>
        <TextAreaField label="Please outline the detriment:" name="applicant_detriment" value={data.applicant_detriment} onChange={onChange} rows={5} />
      </div>
    </div>
  );
}