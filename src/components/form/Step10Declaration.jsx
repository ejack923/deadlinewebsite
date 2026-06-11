import React, { useEffect } from 'react';
import { TextField, TextAreaField, RadioField, CheckboxGroup, SectionHeader } from './FormField';
import SignatureBox from '../vla/SignatureBox';

const WAIVER_OPTIONS = [
  { value: "custody_savings", label: "I am in custody or detention and have savings and investments ≤ $1095" },
  { value: "custody_bail", label: "I am in custody or detention and applying for assistance for a bail application" },
  { value: "custody_summary", label: "I am in custody or detention and applying for a summary crime proceeding within 7 days" },
  { value: "atsi", label: "I am of Aboriginal or Torres Strait Islander origin" },
  { value: "family_violence", label: "I am experiencing or fleeing family violence" },
  { value: "homeless", label: "I am homeless" },
  { value: "remote", label: "I live in a remote location" },
];

const MTC_OPTIONS = [
  { value: "mtc1", label: "I certify that I have on file the required current documentary proof of income and assets for both my client, and (where applicable), their partner, and that those documents substantiate the financial information given by my client in their application for legal assistance." },
  { value: "mtc3", label: "My client instructs that she/he is on Centrelink benefits and I have obtained his/her authorisation to obtain proof of benefits from Centrelink. I will not render an account until that proof is obtained. I am aware that I am required to render a final account within 30 days of completion of the matter." },
  { value: "mtc4", label: "I request a waiver of the documentary proof of means requirement and certify that my client qualifies for such a waiver on the basis that she/he is in custody, has no partner, and the matter will be heard within 7 days of the date of this application." },
  { value: "mtc5", label: "No proof of income or assets is required as my client is in custody, has declared assets below the allowable limit and has no partner." },
  { value: "mtc7", label: "My client has failed to provide adequate and/or current documentary proof of their income and assets and/or that of a partner. I recommend that assistance be refused. I have informed my client of this recommendation." },
  { value: "mtc8", label: "No proof of income or assets is required as my client is experiencing homelessness, and/or is fleeing from or experiencing family violence, and/or resides in a remote area, and/or identifies as Aboriginal and/or Torres Strait Islander descent." },
];

const DECLARATION_METHOD_OPTIONS = [
  { value: "client_to_sign", label: "Client to sign" },
  { value: "telephone_declaration", label: "Telephone Declaration" },
  { value: "other", label: "Other" },
];

export default function Step10Declaration({ data, onChange }) {
  useEffect(() => {
    const now = new Date();
    const sydneyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    const year = sydneyTime.getFullYear();
    const month = String(sydneyTime.getMonth() + 1).padStart(2, '0');
    const day = String(sydneyTime.getDate()).padStart(2, '0');
    const hours = String(sydneyTime.getHours()).padStart(2, '0');
    const minutes = String(sydneyTime.getMinutes()).padStart(2, '0');

    if (!data.declaration_meeting_datetime) {
      const dateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
      onChange("declaration_meeting_datetime", dateTime);
    }

    if (!data.lawyer_date) {
      onChange("lawyer_date", `${year}-${month}-${day}`);
    }

    if (!data.centrelink_consent_date) {
      onChange("centrelink_consent_date", `${year}-${month}-${day}`);
    }

    if (!data.verbal_consent_datetime_location) {
      onChange("verbal_consent_datetime_location", `${year}-${month}-${day} ${hours}:${minutes}`);
    }

    if (!data.declaration_method) {
      onChange("declaration_method", "telephone_declaration");
    }
  }, [onChange]);

  const isClientToSign = data.declaration_method === "client_to_sign";
  const isTelephoneDeclaration = data.declaration_method === "telephone_declaration";
  const isOtherDeclaration = data.declaration_method === "other";

  return (
    <div className="space-y-8">
      <div>
        <SectionHeader number="29" title="Application for legal assistance – telephone declaration record" />
        <div className="space-y-5">
          <RadioField
            label="Declaration method"
            name="declaration_method"
            value={data.declaration_method}
            onChange={onChange}
            options={DECLARATION_METHOD_OPTIONS}
            inline={false}
          />
          {isOtherDeclaration && (
            <TextField
              label="Other declaration method"
              name="declaration_method_other"
              value={data.declaration_method_other}
              onChange={onChange}
              placeholder="Specify other declaration method..."
            />
          )}

          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
            {isClientToSign
              ? "Use this section when the client will sign the declaration directly."
              : "This document is to be used when a client makes a declaration about their application verbally."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Client name" name="declaration_client_name" value={data.declaration_client_name} onChange={onChange} />
            <TextField label="File reference" name="declaration_file_reference" value={data.declaration_file_reference} onChange={onChange} />
          </div>
          <TextField label="Date and time of client meeting" name="declaration_meeting_datetime" value={data.declaration_meeting_datetime} onChange={onChange} />

          {isTelephoneDeclaration && (
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed space-y-2">
              <p>Read the script to the client and get the client's verbal agreement.</p>
              <p>Create the consent record (i.e. complete this form) at the same time you get consent from the client ensuring the words used to get consent are included.</p>
              <p>Record the following:</p>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#0071BC] text-white px-4 py-2 text-sm font-semibold">Applicant declaration (to be read to client)</div>
            <div className="p-4 text-sm text-gray-600 leading-relaxed space-y-3">
              <p>In relation to my application for legal assistance:</p>
              <TextField label="I" name="declaration_name" value={data.declaration_name} onChange={onChange} placeholder="full name" />
              <div className="space-y-2 mt-2">
                <p>(i) acknowledge that it is an offence to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>fail to disclose all information relevant to this application for legal assistance</li>
                  <li>provide false information to Victoria Legal Aid</li>
                  <li>make a false statement about this application for legal assistance</li>
                </ul>
                <p>(ii) understand that I can ask for a copy of Victoria Legal Aid's privacy statement to be sent to me</p>
                <p>(iii) consent to the submission of the application for legal assistance by electronic means to Victoria Legal Aid via the ATLAS grants management system.</p>
              </div>
              {isClientToSign && (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <SignatureBox
                    value={data.client_signature}
                    onChange={(value) => onChange("client_signature", value)}
                  />
                  <TextField
                    label="Date signed"
                    name="client_signature_date"
                    value={data.client_signature_date}
                    onChange={onChange}
                    type="date"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#0071BC] text-white px-4 py-2 text-sm font-semibold">Centrelink consent and authority</div>
            <div className="p-4 text-sm text-gray-600 leading-relaxed space-y-3">
              <div>
                <p className="font-medium text-gray-700 mb-1">I authorise:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Victoria Legal Aid to check with Centrelink about my customer details and concession card status</li>
                  <li>Services Australia (previously the Australian Government Department of Human Services) to provide the results of that enquiry to Victoria Legal Aid.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">I understand that:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Services Australia will disclose my personal information to Victoria Legal Aid including my name, address, payment status, payment type and amount to confirm my eligibility for legal assistance</li>
                  <li>this consent remains valid while I am a client of Victoria Legal Aid unless I withdraw it by contacting Victoria Legal Aid or Services Australia</li>
                  <li>I can obtain proof of my circumstances/details from Services Australia and provide it to Victoria Legal Aid so that my eligibility for legal assistance can be determined</li>
                  <li>if I withdraw consent or do not provide proof of my circumstances/details, I may not be eligible for the grant of aid provided by Victoria Legal Aid.</li>
                </ul>
              </div>
            </div>
          </div>

          {!isClientToSign && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#0071BC] text-white px-4 py-2 text-sm font-semibold">Legal practitioner declaration</div>
              <div className="p-4 text-sm text-gray-600 leading-relaxed space-y-4">
                <p className="font-semibold text-gray-700">Declaration</p>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p>Did the client demonstrate an understanding that it is an offence to lie or fail to disclose relevant information in the aid application?</p>
                    <RadioField label="" name="practitioner_q1" value={data.practitioner_q1} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
                  </div>
                  <div className="space-y-1">
                    <p>Is the client aware that they can ask for a copy of VLA's privacy statement to be sent to them?</p>
                    <RadioField label="" name="practitioner_q2" value={data.practitioner_q2} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
                  </div>
                  <div className="space-y-1">
                    <p>Does the client consent to electronic submission of the legal aid application form?</p>
                    <RadioField label="" name="practitioner_q3" value={data.practitioner_q3} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
                  </div>
                  <div className="space-y-1">
                    <p>Does the client consent to VLA checking the information provided with Centrelink?</p>
                    <RadioField label="" name="practitioner_q4" value={data.practitioner_q4} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-700">Client consent obtained via:</p>
                    <RadioField
                      label=""
                      name="consent_obtained_via"
                      value={data.consent_obtained_via}
                      onChange={onChange}
                      options={[
                        { value:"Outbound phone call", label:"Outbound phone call" },
                        { value:"Inbound phone call", label:"Inbound phone call" },
                        { value:"Other", label:"Other" },
                      ]}
                    />
                    {data.consent_obtained_via === "Other" && (
                      <TextField
                        label="Specify other consent method"
                        name="consent_obtained_via_other"
                        value={data.consent_obtained_via_other}
                        onChange={onChange}
                        placeholder="Specify other method..."
                      />
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-2 text-gray-600">
                  <p className="font-medium text-gray-700">I declare:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>I have given the client the opportunity to ask questions about the declaration</li>
                    <li>I have taken reasonable steps to ensure that the client understood the declaration</li>
                    <li>I am satisfied that the client's response indicated acceptance of the declaration</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <TextField label="Signed by lawyer" name="lawyer_signed" value={data.lawyer_signed} onChange={onChange} />
                  <TextField label="Name" name="lawyer_name" value={data.lawyer_name} onChange={onChange} />
                  <TextField label="Date" name="lawyer_date" value={data.lawyer_date} onChange={onChange} type="date" />
                </div>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#0071BC] text-white px-4 py-2 text-sm font-semibold">Centrelink eConfirmation Services Consent form</div>
            <div className="p-4 text-sm text-gray-600 leading-relaxed space-y-4">
              <TextField label="I (full name)" name="centrelink_consent_name" value={data.centrelink_consent_name} onChange={onChange} placeholder="full name" />

              <div>
                <p className="font-medium text-gray-700 mb-1">I authorise:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The Law and Advocacy Centre for Women Ltd (LACW) to use Centrelink Confirmation eServices to perform a Centrelink enquiry of my customer details and concession card status in order to enable the business to determine if I qualify for legal service.</li>
                  <li>Services Australia to provide the results of that enquiry to LACW.</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">I understand:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Services Australia will disclose personal information to LACW including my name, concession card status, payment type, payment status, one off payment, income, assets, deductions, shared care arrangements and partner status to confirm my eligibility for relevant legal service.</li>
                  <li>This consent, once signed, remains valid while I am a customer of LACW unless I withdraw it by contacting LACW or Services Australia.</li>
                  <li>I can get proof of my circumstances/details from Services Australia and provide it to LACW so that my eligibility for relevant legal services can be determined.</li>
                  <li>If I withdraw my consent or do not alternatively provide proof of my circumstances/details, I may not be eligible for the legal service provided by LACW.</li>
                </ul>
              </div>

              {isClientToSign ? (
                <div className="space-y-4">
                  <SignatureBox
                    value={data.centrelink_consent_signature}
                    onChange={(value) => onChange("centrelink_consent_signature", value)}
                  />
                  <TextField label="Date" name="centrelink_consent_date" value={data.centrelink_consent_date} onChange={onChange} type="date" />
                </div>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <p className="font-medium text-gray-700">Notes: If obtaining verbal consent you need to do all of these:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Read the script to the client and get the client's verbal agreement</li>
                      <li>Create the consent record (i.e. complete this form) at the same time you get consent from the client ensuring the words used to get consent are included.</li>
                      <li>Record the following:</li>
                    </ol>
                    <div className="pl-5 space-y-4">
                      <TextField
                        label="1. Date, time and location of obtaining verbal consent"
                        name="verbal_consent_datetime_location"
                        value={data.verbal_consent_datetime_location}
                        onChange={onChange}
                        placeholder="2026-04-16 13:59"
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">2. Method of obtaining consent:</p>
                        <RadioField
                          label=""
                          name="verbal_consent_method"
                          value={data.verbal_consent_method}
                          onChange={onChange}
                          options={[
                            { value:"By telephone", label:"By telephone" },
                            { value:"In person", label:"In person" },
                            { value:"Other", label:"Other" },
                          ]}
                          inline={false}
                        />
                        {data.verbal_consent_method === "Other" && (
                          <TextField label="Specify other method" name="verbal_consent_method_other" value={data.verbal_consent_method_other} onChange={onChange} placeholder="Specify other method..." />
                        )}
                      </div>
                      <TextField label="3. Name of staff member of LACW getting consent" name="lacw_staff_name" value={data.lacw_staff_name} onChange={onChange} />
                      {isOtherDeclaration && (
                        <TextAreaField
                          label="Additional notes for other declaration method"
                          name="declaration_method_notes"
                          value={data.declaration_method_notes}
                          onChange={onChange}
                          placeholder="Include any extra details about how consent was obtained..."
                          rows={4}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader number="30" title="Proof of means" />
        <div className="p-4 bg-blue-50 rounded-lg mb-5 text-sm text-gray-600">
          The means test does not apply if you are seeking a grant for a review of a crimes mental impairment matter; or seeking a grant for a war veteran's matter; or are 18 years or younger and are seeking a grant for a Children's Court or Commonwealth Family Law matter.
        </div>
        <div className="space-y-5">
          <RadioField label="Are you seeking a waiver of the obligation to provide proof of means?" name="waiver_proof_means" value={data.waiver_proof_means} onChange={onChange} options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
          {data.waiver_proof_means === "Yes" && (
            <CheckboxGroup label="I seek a waiver on the following basis:" name="waiver_basis" values={data.waiver_basis} onChange={onChange} options={WAIVER_OPTIONS} />
          )}
        </div>
      </div>

      {data.waiver_proof_means !== "Yes" && (
        <div>
          <SectionHeader number="31" title="Means certification" />
          <div className="space-y-4">
            <CheckboxGroup label="" name="matter_triaged_condition" values={data.matter_triaged_condition} onChange={onChange} options={MTC_OPTIONS} />
          </div>
        </div>
      )}
    </div>
  );
}
