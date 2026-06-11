import React from 'react';

const INCOME_ROWS = [
  { key: 'pensions', label: 'Pensions/benefits/allowances' },
  { key: 'employment', label: 'Income – employment' },
  { key: 'business', label: 'Business / self-employed' },
  { key: 'child_support', label: 'Child support' },
  { key: 'other', label: 'Other' },
  { key: 'total', label: 'Total income' },
];

const EXPENSE_ROWS = [
  { key: 'tax', label: 'Income tax' },
  { key: 'rent', label: 'Rent' },
  { key: 'mortgage', label: 'Mortgage' },
  { key: 'board', label: 'Board' },
  { key: 'rates', label: 'Rates' },
  { key: 'business_exp', label: 'Business expenses' },
  { key: 'childcare', label: 'Child care' },
  { key: 'maintenance', label: 'Child support / maintenance' },
  { key: 'total', label: 'Total expenses' },
];

const ASSET_ROWS = [
  { key: 'home', label: 'Home' },
  { key: 'home_mortgage', label: 'Home mortgage' },
  { key: 'real_estate', label: 'Other real estate' },
  { key: 'other_mortgage', label: 'Other mortgage' },
  { key: 'farm', label: 'Farm / business' },
  { key: 'farm_mortgage', label: 'Farm / business mortgage' },
  { key: 'vehicle', label: 'Motor vehicle' },
  { key: 'vehicle_loan', label: 'Motor vehicle loan' },
  { key: 'cash', label: 'Cash / savings' },
  { key: 'other_assets', label: 'Other assets' },
  { key: 'total', label: 'Total assets' },
];

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === 0) return true;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function Field({ label, value, fullWidth = false }) {
  if (!hasValue(value)) return null;
  return (
    <div className={`vla-form-field${fullWidth ? ' vla-form-field-full' : ''}`}>
      <label>{label}</label>
      <div>{formatValue(value)}</div>
    </div>
  );
}

function Section({ title, children }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <>
      <div className="vla-section-header">{title}</div>
      <div className="vla-form-content">{items}</div>
    </>
  );
}

function ParagraphBlock({ label, value }) {
  if (!hasValue(value)) return null;
  return (
    <div className="vla-paragraph-block">
      <label>{label}</label>
      <div>{formatValue(value)}</div>
    </div>
  );
}

function DataTable({ title, rows, name, formData, hasPartner }) {
  const populatedRows = rows.filter((row) =>
    hasValue(formData[`${name}_${row.key}_you`]) ||
    hasValue(formData[`${name}_${row.key}_partner`]) ||
    hasValue(formData[`${name}_${row.key}_freq`])
  );
  if (populatedRows.length === 0) return null;

  return (
    <div className="vla-table-wrap">
      <div className="vla-table-title">{title}</div>
      <table className="vla-data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>You</th>
            {hasPartner && <th>Your partner</th>}
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          {populatedRows.map((row) => (
            <tr key={`${name}-${row.key}`}>
              <td>{row.label}</td>
              <td>{formatValue(formData[`${name}_${row.key}_you`] || '')}</td>
              {hasPartner && <td>{formatValue(formData[`${name}_${row.key}_partner`] || '')}</td>}
              <td>{formatValue(formData[`${name}_${row.key}_freq`] || '')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignaturePreview({ title, value, date }) {
  if (!hasValue(value) && !hasValue(date)) return null;
  return (
    <div className="vla-signature-block">
      <div className="vla-table-title">{title}</div>
      {hasValue(value) && (
        <div className="vla-signature-image-wrap">
          <img src={value} alt={title} className="vla-signature-image" />
        </div>
      )}
      {hasValue(date) && <div className="vla-signature-date">Date: {formatValue(date)}</div>}
    </div>
  );
}

export default function PrintableForm({ formData, applicationId }) {
  const hasPartner = formData.has_partner === 'Yes';
  const otherPartyName = [formData.op_first_name, formData.op_middle_name, formData.op_last_name].filter(Boolean).join(' ');

  return (
    <div className="vla-print-document" style={{ display: 'none' }}>
      <div className="vla-print-header">
        <div className="vla-print-header-meta">
          <div>Victoria Legal Aid</div>
          {hasValue(applicationId) && <div>Reference ID: {applicationId}</div>}
        </div>
        <h1>Application for Grant of Legal Assistance</h1>
        <p>Full application record</p>
      </div>

      <Section title="1. Personal details">
        <div className="vla-form-row">
          <Field label="Title" value={formData.title} />
          <Field label="Gender" value={formData.gender} />
        </div>
        <div className="vla-form-row">
          <Field label="First name" value={formData.first_name} />
          <Field label="Middle name" value={formData.middle_name} />
          <Field label="Last name" value={formData.last_name} />
        </div>
        <div className="vla-form-row">
          <Field label="Date of birth" value={formData.date_of_birth} />
          <Field label="Date of birth estimate only" value={formData.dob_estimate} />
          <Field label="Currently in custody" value={formData.currently_in_custody} />
        </div>
        <div className="vla-form-row">
          <Field label="Custody facility" value={formData.custody_facility} />
          <Field label="Date remanded into custody or detention" value={formData.custody_date} />
          <Field label="Corrective services ID" value={formData.corrective_services_id} />
        </div>
        <Field label="Home address" value={formData.home_address} fullWidth />
        <Field label="Postal address" value={formData.postal_address} fullWidth />
        <div className="vla-form-row">
          <Field label="Homeless" value={formData.homeless} />
          <Field label="Prefer contact by email" value={formData.contact_email_pref} />
          <Field label="Send correspondence to lawyer only" value={formData.correspondence_lawyer} />
        </div>
        <div className="vla-form-row">
          <Field label="Email address" value={formData.email} />
          <Field label="Home phone" value={formData.home_phone} />
          <Field label="Mobile phone" value={formData.mobile_phone} />
        </div>
        <div className="vla-form-row">
          <Field label="Work phone" value={formData.work_phone} />
          <Field label="Other contact phone" value={formData.other_phone} />
        </div>
      </Section>

      <Section title="2. Additional details">
        <div className="vla-form-row">
          <Field label="Other names used with VLA" value={formData.other_names_used} />
        </div>
        <Field label="Other names used" value={formData.other_names_list} fullWidth />
      </Section>

      <Section title="3. Your background">
        <div className="vla-form-row">
          <Field label="Country of birth" value={formData.country_of_birth} />
          <Field label="Year arrived in Australia" value={formData.arrival_year} />
        </div>
        <Field label="Aboriginal or Torres Strait Islander origin" value={formData.atsi_origin} fullWidth />
      </Section>

      <Section title="4. Language">
        <div className="vla-form-row">
          <Field label="Speaks a language other than English at home" value={formData.other_language} />
          <Field label="Language spoken" value={formData.which_language} />
        </div>
        <div className="vla-form-row">
          <Field label="English level" value={formData.english_level} />
          <Field label="Needs interpreter" value={formData.need_interpreter} />
          <Field label="Interpreter language" value={formData.interpreter_language} />
        </div>
      </Section>

      <Section title="5. Disability and mental health">
        <div className="vla-form-row">
          <Field label="Has disability" value={formData.has_disability} />
          <Field label="Disability types" value={formData.disability_types} />
        </div>
        <Field label="Other disability" value={formData.disability_other} fullWidth />
      </Section>

      <Section title="6. Disability and mental health support">
        <div className="vla-form-row">
          <Field label="Requires disability or mental health support" value={formData.need_support} />
          <Field label="Support types" value={formData.support_types} />
        </div>
        <Field label="Other support" value={formData.support_other} fullWidth />
      </Section>

      <Section title="7. Employment status">
        <div className="vla-form-row">
          <Field label="Employment status" value={formData.employment_status} />
          <Field label="Support source" value={formData.support_source} />
        </div>
      </Section>

      <Section title="8. Benefit details">
        <div className="vla-form-row">
          <Field label="Receives Centrelink benefit or income support" value={formData.receives_benefit} />
          <Field label="Centrelink reference number" value={formData.centrelink_ref} />
        </div>
        <div className="vla-form-row">
          <Field label="Benefit types" value={formData.benefit_types} />
          <Field label="Maximum rate of benefit" value={formData.max_benefit_rate} />
        </div>
      </Section>

      <Section title="10. Relationship status">
        <div className="vla-form-row">
          <Field label="Relationship status" value={formData.relationship_status} />
        </div>
      </Section>

      <Section title="11. Family violence">
        <div className="vla-form-row">
          <Field label="Currently experiencing or fleeing family violence" value={formData.family_violence} />
        </div>
      </Section>

      <Section title="12. Partner details">
        <div className="vla-form-row">
          <Field label="Has partner" value={formData.has_partner} />
          <Field label="Partner receives Centrelink benefit" value={formData.partner_benefit} />
        </div>
        <div className="vla-form-row">
          <Field label="Partner benefit types" value={formData.partner_benefit_types} />
          <Field label="Partner maximum benefit rate" value={formData.partner_max_benefit} />
        </div>
      </Section>

      <Section title="13. Dependant details">
        <div className="vla-form-row">
          <Field label="Dependants live with applicant" value={formData.has_dependants} />
          <Field label="Pays child support or maintenance" value={formData.pays_child_support} />
          <Field label="Number of child support / maintenance dependants" value={formData.child_support_count} />
        </div>
        {Array.isArray(formData.dependants) && formData.dependants.filter(Boolean).map((dep, idx) => (
          <div className="vla-subrecord" key={`dep-${idx}`}>
            <div className="vla-table-title">Dependant {idx + 1}</div>
            <div className="vla-form-row">
              <Field label="First name" value={dep.first_name} />
              <Field label="Last name" value={dep.last_name} />
              <Field label="Relationship" value={dep.relationship} />
            </div>
            <div className="vla-form-row">
              <Field label="Date of birth" value={dep.dob} />
            </div>
          </div>
        ))}
      </Section>

      <Section title="14. Your income (before tax)">
        <DataTable title="Income" rows={INCOME_ROWS} name="income" formData={formData} hasPartner={hasPartner} />
        <Field label="Other income type" value={formData.income_other_type} fullWidth />
      </Section>

      <Section title="15. Expenses">
        <DataTable title="Expenses" rows={EXPENSE_ROWS} name="expense" formData={formData} hasPartner={hasPartner} />
        <ParagraphBlock label="Reason for no expenses" value={formData.no_expenses_reason} />
      </Section>

      <Section title="16. Assets">
        <DataTable title="Assets" rows={ASSET_ROWS} name="asset" formData={formData} hasPartner={hasPartner} />
        <div className="vla-form-row">
          <Field label="Homeowner" value={formData.is_homeowner} />
          <Field label="Property address" value={formData.property_address} />
          <Field label="Names on title" value={formData.property_names} />
        </div>
        <div className="vla-form-row">
          <Field label="Assets seized, frozen or restrained" value={formData.assets_seized} />
        </div>
        <div className="vla-form-row">
          <Field label="Self employed" value={formData.biz_self_employed} />
          <Field label="Partner or director in business/company" value={formData.biz_director} />
          <Field label="Shareholder in private company" value={formData.biz_shareholder} />
        </div>
        <div className="vla-form-row">
          <Field label="Receiving money from a trust" value={formData.biz_trust} />
          <Field label="Receiving other benefit from business/company" value={formData.biz_other_benefit} />
        </div>
        <Field label="Business details" value={formData.biz_details} fullWidth />
      </Section>

      <Section title="17. Other parties">
        <div className="vla-form-row">
          <Field label="Other parties to the matter" value={formData.has_other_parties} />
          <Field label="Other party type" value={formData.other_party_type} />
          <Field label="Institution name" value={formData.op_institution_name} />
        </div>
        <div className="vla-form-row">
          <Field label="Other party title" value={formData.op_title} />
          <Field label="Other party name" value={otherPartyName} />
          <Field label="Other party gender" value={formData.op_gender} />
        </div>
        <div className="vla-form-row">
          <Field label="Other party date of birth" value={formData.op_dob} />
          <Field label="DOB estimate only" value={formData.op_dob_estimate} />
          <Field label="Relationship to applicant" value={formData.op_relationship} />
        </div>
        <Field label="Other party role in proceedings" value={formData.op_role} fullWidth />
        <div className="vla-form-row">
          <Field label="Other party phone" value={formData.op_phone} />
          <Field label="Other party mobile" value={formData.op_mobile} />
          <Field label="Other party email" value={formData.op_email} />
        </div>
        <Field label="Other party address" value={formData.op_address} fullWidth />
        <div className="vla-form-row">
          <Field label="Other party lawyer firm" value={formData.op_lawyer_firm} />
          <Field label="Other party lawyer phone" value={formData.op_lawyer_phone} />
          <Field label="Other party lawyer fax" value={formData.op_lawyer_fax} />
        </div>
        <div className="vla-form-row">
          <Field label="Other party lawyer email" value={formData.op_lawyer_email} />
          <Field label="Other party lawyer address" value={formData.op_lawyer_address} />
        </div>
      </Section>

      <Section title="18. Court hearings">
        <div className="vla-form-row">
          <Field label="Any proceedings" value={formData.has_proceedings} />
          <Field label="Next hearing date" value={formData.hearing_date} />
          <Field label="Court or tribunal" value={formData.court_tribunal} />
        </div>
        <div className="vla-form-row">
          <Field label="Role in proceedings" value={formData.proceedings_role} />
          <Field label="Type of hearing" value={formData.hearing_type} />
          <Field label="Other hearing type" value={formData.hearing_type_other} />
        </div>
        <div className="vla-form-row">
          <Field label="Court proceedings number" value={formData.court_number} />
        </div>
      </Section>

      <Section title="19. Payment of fees">
        <div className="vla-form-row">
          <Field label="Any legal fees already paid" value={formData.fees_paid} />
          <Field label="Fee payer name" value={formData.fee_payer_name} />
          <Field label="Relationship to applicant" value={formData.fee_payer_relationship} />
        </div>
        <div className="vla-form-row">
          <Field label="Amount paid" value={formData.fee_amount_paid} />
        </div>
        <ParagraphBlock label="Why another person cannot continue to pay" value={formData.fee_payer_reason} />
      </Section>

      <Section title="20. Your lawyer">
        <div className="vla-form-row">
          <Field label="Preferred lawyer" value={formData.preferred_lawyer} />
          <Field label="Firm details" value={formData.lawyer_firm_details} />
        </div>
      </Section>

      <Section title="21. Your legal problem">
        <div className="vla-form-row">
          <Field label="Type of law" value={formData.law_type} />
          <Field label="Civil law specify" value={formData.civil_law_specify} />
        </div>
        <Field label="Relevant factors" value={formData.relevant_factors} fullWidth />
      </Section>

      <Section title="22. Describe your legal problem">
        <ParagraphBlock label="Legal problem details" value={formData.legal_problem_details} />
      </Section>

      <Section title="23. VLA guideline under which assistance is being sought">
        <ParagraphBlock label="VLA guideline" value={formData.vla_guideline} />
      </Section>

      <Section title="24. Merits of the application">
        <ParagraphBlock label="Application merits" value={formData.application_merits} />
      </Section>

      <Section title="25. Detriment to the applicant if this application is refused">
        <ParagraphBlock label="Applicant detriment" value={formData.applicant_detriment} />
      </Section>

      <Section title="26. Criminal prosecutions only">
        <div className="vla-form-row">
          <Field label="Prior convictions" value={formData.prior_convictions} />
        </div>
        <ParagraphBlock label="Convictions details" value={formData.convictions_details} />
      </Section>

      <Section title="27. Criminal appeals only">
        <div className="vla-form-row">
          <Field label="Appeal conviction" value={formData.appeal_conviction} />
          <Field label="Appeal sentence" value={formData.appeal_sentence} />
          <Field label="Appeal court" value={formData.appeal_court} />
        </div>
        <div className="vla-form-row">
          <Field label="Original decision date" value={formData.appeal_date} />
        </div>
        <ParagraphBlock label="Appeal details" value={formData.appeal_details} />
      </Section>

      <Section title="28. Family law matters only">
        <div className="vla-form-row">
          <Field label="Children relevant to legal problem" value={formData.has_family_children} />
          <Field label="Current orders" value={formData.existing_orders} />
          <Field label="Order date" value={formData.order_date} />
        </div>
        <div className="vla-form-row">
          <Field label="Order court or tribunal" value={formData.order_court} />
          <Field label="Order types" value={formData.order_types} />
        </div>
        {Array.isArray(formData.family_children) && formData.family_children.filter(Boolean).map((child, idx) => (
          <div className="vla-subrecord" key={`child-${idx}`}>
            <div className="vla-table-title">Child {idx + 1}</div>
            <div className="vla-form-row">
              <Field label="Name" value={[child.first_name, child.middle_name, child.last_name].filter(Boolean).join(' ')} />
              <Field label="Gender" value={child.gender} />
              <Field label="Date of birth" value={child.dob} />
            </div>
            <div className="vla-form-row">
              <Field label="Relationship to applicant" value={child.relationship} />
              <Field label="Lives with" value={child.lives_with} />
              <Field label="Since when" value={child.since_when} />
            </div>
          </div>
        ))}
        <div className="vla-form-row">
          <Field label="Lived with the other party" value={formData.lived_with_party} />
          <Field label="Date of marriage" value={formData.marriage_date} />
          <Field label="Date de facto relationship started" value={formData.defacto_date} />
        </div>
        <div className="vla-form-row">
          <Field label="Date of separation" value={formData.separation_date} />
          <Field label="Date of divorce" value={formData.divorce_date} />
          <Field label="Attended family dispute resolution" value={formData.attended_fdr} />
        </div>
        <ParagraphBlock label="Reasons for not attending FDR" value={formData.fdr_reasons} />
        <div className="vla-form-row">
          <Field label="Fear for applicant safety" value={formData.fear_safety} />
          <Field label="Fear for children's safety" value={formData.fear_children_safety} />
          <Field label="Current child abuse investigation" value={formData.child_abuse_investigation} />
        </div>
        <div className="vla-form-row">
          <Field label="Family violence order for applicant" value={formData.fvo_you} />
          <Field label="Family violence order for children" value={formData.fvo_children} />
          <Field label="Role in child protection order" value={formData.fvo_children_role} />
        </div>
      </Section>

      <Section title="29. Application for legal assistance – telephone declaration record">
        <div className="vla-form-row">
          <Field label="Declaration method" value={formData.declaration_method} />
          <Field label="Other declaration method" value={formData.declaration_method_other} />
        </div>
        <div className="vla-form-row">
          <Field label="Client name" value={formData.declaration_client_name} />
          <Field label="File reference" value={formData.declaration_file_reference} />
          <Field label="Date and time of client meeting" value={formData.declaration_meeting_datetime} />
        </div>
        <Field label="Applicant declaration name" value={formData.declaration_name} fullWidth />
        <div className="vla-form-row">
          <Field label="Client consent obtained via" value={formData.consent_obtained_via} />
          <Field label="Other consent method" value={formData.consent_obtained_via_other} />
        </div>
        <div className="vla-form-row">
          <Field label="Practitioner declaration question 1" value={formData.practitioner_q1} />
          <Field label="Practitioner declaration question 2" value={formData.practitioner_q2} />
          <Field label="Practitioner declaration question 3" value={formData.practitioner_q3} />
        </div>
        <div className="vla-form-row">
          <Field label="Practitioner declaration question 4" value={formData.practitioner_q4} />
          <Field label="Lawyer signed" value={formData.lawyer_signed} />
          <Field label="Lawyer name" value={formData.lawyer_name} />
        </div>
        <div className="vla-form-row">
          <Field label="Lawyer date" value={formData.lawyer_date} />
        </div>
        <SignaturePreview title="Client signature" value={formData.client_signature} date={formData.client_signature_date} />
        <SignaturePreview title="Centrelink consent signature" value={formData.centrelink_consent_signature} date={formData.centrelink_consent_date} />
      </Section>

      <Section title="Centrelink consent and authority">
        <div className="vla-form-row">
          <Field label="Centrelink consent name" value={formData.centrelink_consent_name} />
          <Field label="Verbal consent date, time and location" value={formData.verbal_consent_datetime_location} />
        </div>
        <div className="vla-form-row">
          <Field label="Verbal consent method" value={formData.verbal_consent_method} />
          <Field label="Other verbal consent method" value={formData.verbal_consent_method_other} />
          <Field label="LACW staff member" value={formData.lacw_staff_name} />
        </div>
        <ParagraphBlock label="Other declaration notes" value={formData.declaration_method_notes} />
      </Section>

      <Section title="30. Proof of means">
        <div className="vla-form-row">
          <Field label="Seeking waiver of proof of means" value={formData.waiver_proof_means} />
          <Field label="Waiver basis" value={formData.waiver_basis} />
        </div>
      </Section>

      <Section title="31. Means certification">
        <Field label="Means certification" value={formData.matter_triaged_condition} fullWidth />
      </Section>

      <div className="vla-print-footer">
        <p>Reference ID: {applicationId || 'Draft'}</p>
        <p>Printed: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
