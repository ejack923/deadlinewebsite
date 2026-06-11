import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Printer } from "lucide-react";
import { addToBundle } from "@/components/BundleBar";

const YesNo = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <p className="text-sm text-slate-700 mb-2">{label}</p>
    <div className="flex gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} value="yes" checked={value === "yes"} onChange={() => onChange(name, "yes")} className="w-4 h-4 accent-pink-700" />
        <span className="font-semibold text-sm">Yes</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} value="no" checked={value === "no"} onChange={() => onChange(name, "no")} className="w-4 h-4 accent-pink-700" />
        <span className="font-semibold text-sm">No</span>
      </label>
    </div>
  </div>
);

const SectionHeading = ({ children }) => (
  <h2 className="text-base font-bold text-pink-700 mt-8 mb-3 border-b border-pink-100 pb-1">{children}</h2>
);
const FieldLabel = ({ children, className = "" }) => (
  <label className={`block text-sm text-slate-700 mb-1 ${className}`}>{children}</label>
);
const TextInput = ({ value, onChange, placeholder = "", className = "", type = "text" }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 ${className}`} />
);
const TextArea = ({ value, onChange, rows = 3, placeholder = "" }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y" />
);

const EMPTY_FORM = {
  fileName: "", clientName: "", charges: "",
  detailedHistory: "", historySupportsExpectation: "", reportRelevant: "", cannotPresent: "",
  otherSources: "", otherSourcesDetail: "", costBenefitAnalysis: "", mostAppropriateReport: "",
  directlyRelates: "", factor1: "", factor2: "", factor3: "", factor4: "", factor5: "", factor6: "", factor7: "",
  sentenceReductionEvidence: "", evid1: "", evid2: "", evid3: "", evidDetails: "",
  typeOfReport: "", quoteSelected: false, quoteAmount: "", hourlyRateSelected: false,
  hourlyRate: "", hoursRequired: "", hoursCapped: "", nonAttendanceFee: "", materialDetails: "",
  vlaTypeOfReport: "", feeAllowed: "", practitioner: "", deputyLawyer: "", vlaDate: "",
};

export default function VLAReportWorksheet() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleYesNo = (name, value) => setField(name, value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "ejackson@completelawsupport.com",
      subject: `VLA Report Worksheet – ${form.clientName || "Unknown Client"} (${form.fileName || "No File"})`,
      body: `
VLA Medical/Psychologist/Psychiatrist Report Worksheet

FILE DETAILS
------------
File Name: ${form.fileName}
Client Name: ${form.clientName}
Charge/s: ${form.charges}

FOR ALL REPORTS
---------------
Detailed history of client's medical/personal circumstances? ${form.detailedHistory}
History supports reasonable expectation? ${form.historySupportsExpectation}
Report relevant to client's position? ${form.reportRelevant}
Material cannot be presented without report? ${form.cannotPresent}
Other available sources? ${form.otherSources}
Other sources detail: ${form.otherSourcesDetail}
Cost/Benefit Analysis: ${form.costBenefitAnalysis}
Most appropriate report considered? ${form.mostAppropriateReport}

FOR PLEAS IN MITIGATION
------------------------
Directly relates to proposed plea? ${form.directlyRelates}
Factor 1 - Reduces moral culpability? ${form.factor1}
Factor 2 - Bearing on type of sentence? ${form.factor2}
Factor 3 - Affected mental capacity? ${form.factor3}
Factor 4 - Sufficiently severe for specific deterrence? ${form.factor4}
Factor 5 - Condition weighs more heavily on offender? ${form.factor5}
Factor 6 - Protection of community / risk of reoffending? ${form.factor6}
Factor 7 - Youth justice facility submission? ${form.factor7}
Evidence for criteria: ${form.sentenceReductionEvidence}

FOR EVIDENTIARY REPORTS
------------------------
1. Not currently fit to plead? ${form.evid1}
2. Mentally impaired at time of conduct? ${form.evid2}
3. Both 1 and 2? ${form.evid3}
Details: ${form.evidDetails}

EXPERT REPORT INFORMATION
--------------------------
Type of Report: ${form.typeOfReport}
Quote Selected: ${form.quoteSelected ? "Yes" : "No"}
Quote Amount: $${form.quoteAmount}
Hourly Rate Selected: ${form.hourlyRateSelected ? "Yes" : "No"}
Hourly Rate: $${form.hourlyRate}
Hours Required: ${form.hoursRequired}
Hours Capped: ${form.hoursCapped}
Non-Attendance Fee: $${form.nonAttendanceFee}
Material Details: ${form.materialDetails}

VLA OFFICE USE ONLY
-------------------
Type of Report: ${form.vlaTypeOfReport}
Fee Allowed: $${form.feeAllowed}
Practitioner: ${form.practitioner}
Deputy/Managing Lawyer: ${form.deputyLawyer}
Date: ${form.vlaDate}
      `.trim()
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Worksheet Submitted</h2>
          <p className="text-slate-500 text-sm mb-6">The worksheet has been sent to ejackson@completelawsupport.com</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({ ...EMPTY_FORM }); }}
              className="bg-pink-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-800 transition-colors">
              Submit Another
            </button>
            <a href={createPageUrl("Home")} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">
              Back to Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back nav */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <a href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
      </div>

      <div className="py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-pink-700 to-pink-800 px-8 py-6 flex items-center justify-between">
            <div>
              <p className="text-pink-200 text-xs mb-1">Victoria Legal Aid</p>
              <h1 className="text-white text-xl font-bold">Medical/Psychologist/Psychiatrist</h1>
              <h1 className="text-white text-xl font-bold">Report Worksheet</h1>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 text-right">
              <p className="text-pink-700 font-bold text-sm leading-tight">Victoria</p>
              <p className="text-pink-700 font-bold text-sm leading-tight">Legal Aid</p>
              <p className="text-slate-500 text-xs">Lawyers And Legal Services</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div><FieldLabel>File name</FieldLabel><TextInput value={form.fileName} onChange={v => setField("fileName", v)} /></div>
              <div><FieldLabel>Client name</FieldLabel><TextInput value={form.clientName} onChange={v => setField("clientName", v)} /></div>
              <div><FieldLabel>Charge/s</FieldLabel><TextInput value={form.charges} onChange={v => setField("charges", v)} /></div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4 text-sm text-slate-600">
              <p className="mb-2">Before assistance can be granted for a disbursement the practitioner must have formed the view that:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The disbursement must be relevant to the position the aided person wishes to put to the court and not be fishing; <strong>AND</strong></li>
                <li>The disbursement must necessarily and/or reasonably be required to maintain that position and cannot be achieved in some other way; <strong>AND</strong></li>
                <li>The expenditure can be justified on a cost/benefit analysis.</li>
                <li>For a <strong>not guilty plea</strong> there is a reasonable expectation the report will substantiate a defence to the charges or raise an evidentiary issue (Reports for not guilty pleas are considered by VLA to be exceptionally rare).</li>
              </ul>
            </div>

            <SectionHeading>For all reports</SectionHeading>
            <YesNo label="Do you have a detailed history of your client's medical or personal circumstances?" name="detailedHistory" value={form.detailedHistory} onChange={handleYesNo} />
            <YesNo label="Does this history support a reasonable expectation that a report will confirm the existence of an identifiable condition?" name="historySupportsExpectation" value={form.historySupportsExpectation} onChange={handleYesNo} />
            <YesNo label="Is the report relevant to the position your client wishes to put to the court and is not speculative?" name="reportRelevant" value={form.reportRelevant} onChange={handleYesNo} />
            <YesNo label="Have you formed the view from your client's medical, psychological or psychiatric state that the material cannot be presented to the court without obtaining the report?" name="cannotPresent" value={form.cannotPresent} onChange={handleYesNo} />
            <YesNo label="Are there any other available sources for this information, such as previous reports, medical records, discharge summaries, mental health plans and the like?" name="otherSources" value={form.otherSources} onChange={handleYesNo} />

            <div className="mb-4">
              <FieldLabel><em>If yes, what is the other information and why is a report required rather than relying on this material?</em></FieldLabel>
              <TextArea value={form.otherSourcesDetail} onChange={v => setField("otherSourcesDetail", v)} rows={3} />
            </div>
            <div className="mb-4">
              <FieldLabel>Please detail your cost/benefit analysis:</FieldLabel>
              <p className="text-xs text-slate-500 mb-1">The cost of the report must be balanced against the likely benefit. If a prudent self-funding litigant would not spend the money, it will not be reasonable to expect VLA to pay for it.</p>
              <TextArea value={form.costBenefitAnalysis} onChange={v => setField("costBenefitAnalysis", v)} rows={4} />
            </div>
            <YesNo label="All efforts must be made to prevent the legal aid fund incurring avoidable costs. Have you considered which is the most appropriate report?" name="mostAppropriateReport" value={form.mostAppropriateReport} onChange={handleYesNo} />

            <SectionHeading>For pleas in mitigation</SectionHeading>
            <YesNo label="The report must directly relate to the proposed plea and there must be a reasonable expectation that it will provide substantial exculpatory material leading to a significant reduction in the sentence that might otherwise be expected. Is this the case?" name="directlyRelates" value={form.directlyRelates} onChange={handleYesNo} />
            <p className="text-sm text-slate-700 mb-3">Please indicate which of the below factors that will lead to a <em>significant sentence reduction</em> (note that the mere existence of a condition is not sufficient to support a recommendation):</p>
            <YesNo label="1. The condition may reduce the moral culpability of the offending conduct so that it effects determination of the punishment:" name="factor1" value={form.factor1} onChange={handleYesNo} />
            <YesNo label="2. The condition may have a bearing on the type of sentence imposed and the conditions in which it should be served:" name="factor2" value={form.factor2} onChange={handleYesNo} />
            <YesNo label="3. The condition effected the mental capacity of the offender at the time of the offending or of sentencing such as to moderate general deterrence:" name="factor3" value={form.factor3} onChange={handleYesNo} />
            <YesNo label="4. The effect of the condition at the time of offending or sentencing are sufficiently severe to warrant moderation of specific deterrence:" name="factor4" value={form.factor4} onChange={handleYesNo} />
            <YesNo label="5. The existence of the condition at the date of sentence or a foreseeable recurrence may mean that the sentence may weigh more heavily on the offender than someone in normal health:" name="factor5" value={form.factor5} onChange={handleYesNo} />
            <YesNo label="6. The circumstances of the offending or the offender raise the issue of protection of the community and a report is necessary to address the individual offender's risk of reoffending:" name="factor6" value={form.factor6} onChange={handleYesNo} />
            <YesNo label="7. A report will support a submission that the sentence should be served in a youth justice facility:" name="factor7" value={form.factor7} onChange={handleYesNo} />
            <div className="mb-4">
              <FieldLabel>Please provide details outlining the evidence which led you to conclude that there is a reasonable expectation that the material fulfilled any of the criteria in the above table:</FieldLabel>
              <TextArea value={form.sentenceReductionEvidence} onChange={v => setField("sentenceReductionEvidence", v)} rows={4} />
            </div>

            <SectionHeading>For evidentiary reports</SectionHeading>
            <p className="text-sm text-slate-600 mb-3">For an evidentiary report: is there a <em>reasonable expectation</em> that the report will <em>substantiate</em> a defence to the charges on the grounds of mental impairment, or raise an evidentiary issue in relation to fitness to plead?</p>
            <YesNo label="1. Not currently fit to plead?" name="evid1" value={form.evid1} onChange={handleYesNo} />
            <YesNo label="2. Mentally impaired at the time of the conduct?" name="evid2" value={form.evid2} onChange={handleYesNo} />
            <YesNo label="3. Both 1 and 2?" name="evid3" value={form.evid3} onChange={handleYesNo} />
            <div className="mb-4">
              <FieldLabel>Additional details:</FieldLabel>
              <TextArea value={form.evidDetails} onChange={v => setField("evidDetails", v)} rows={4} />
            </div>

            <SectionHeading>Information required for obtaining quote for expert report <span className="font-normal italic text-slate-500 text-sm">(Note: Information to be provided by the expert)</span></SectionHeading>
            <div className="mb-4">
              <FieldLabel>Type of report</FieldLabel>
              <TextInput value={form.typeOfReport} onChange={v => setField("typeOfReport", v)} />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={form.quoteSelected} onChange={e => setField("quoteSelected", e.target.checked)} className="w-4 h-4 accent-pink-700" />
                <span className="text-sm text-slate-700">Quote for the report (specifying if GST inclusive or exclusive)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">$</span>
                <TextInput value={form.quoteAmount} onChange={v => setField("quoteAmount", v)} placeholder="0.00" className="max-w-xs" />
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={form.hourlyRateSelected} onChange={e => setField("hourlyRateSelected", e.target.checked)} className="w-4 h-4 accent-pink-700" />
                <span className="text-sm text-slate-700">Hourly rate</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">$</span>
                <TextInput value={form.hourlyRate} onChange={v => setField("hourlyRate", v)} placeholder="0.00" className="max-w-xs" />
              </div>
              <FieldLabel>How many hours required?</FieldLabel>
              <TextInput value={form.hoursRequired} onChange={v => setField("hoursRequired", v)} className="max-w-xs" />
            </div>
            <div className="mb-4">
              <FieldLabel>Are the hours to be capped? If so, up to how many hours?</FieldLabel>
              <TextInput value={form.hoursCapped} onChange={v => setField("hoursCapped", v)} className="max-w-xs" />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-pink-700" />
                <span className="text-sm text-slate-700">Quote for any non-attendance fees (specifying if GST inclusive or exclusive)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">$</span>
                <TextInput value={form.nonAttendanceFee} onChange={v => setField("nonAttendanceFee", v)} placeholder="0.00" className="max-w-xs" />
              </div>
            </div>
            <div className="mb-4">
              <FieldLabel>Please provide details outlining:</FieldLabel>
              <ul className="list-none text-sm text-slate-600 mb-2 space-y-1 ml-2">
                <li>i) the volume of material required to be read (please specify what material is required to be read, number of pages required to be read, and why it is necessary to read the material for preparing the report?), and</li>
                <li>ii) the correlation between the time for assessment and preparation of report and the volume of materials</li>
              </ul>
              <TextArea value={form.materialDetails} onChange={v => setField("materialDetails", v)} rows={5} />
            </div>

            <SectionHeading>VLA Office Use Only</SectionHeading>
            <p className="text-sm font-bold text-slate-800 mb-3">Authority to obtain assistance:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><FieldLabel>Type of report:</FieldLabel><TextInput value={form.vlaTypeOfReport} onChange={v => setField("vlaTypeOfReport", v)} /></div>
              <div><FieldLabel>Fee allowed: $</FieldLabel><TextInput value={form.feeAllowed} onChange={v => setField("feeAllowed", v)} placeholder="0.00" /></div>
              <div><FieldLabel>Practitioner:</FieldLabel><TextInput value={form.practitioner} onChange={v => setField("practitioner", v)} /></div>
              <div><FieldLabel>Deputy / managing lawyer:</FieldLabel><TextInput value={form.deputyLawyer} onChange={v => setField("deputyLawyer", v)} /></div>
              <div><FieldLabel>Date:</FieldLabel><TextInput value={form.vlaDate} onChange={v => setField("vlaDate", v)} type="date" /></div>
            </div>

            <div className="mt-8 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                Save / Print to PDF
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const content = `VLA REPORT WORKSHEET\n\nFile: ${form.fileName}\nClient: ${form.clientName}\nCharges: ${form.charges}\n\nType of Report: ${form.typeOfReport}\nFee Quote: $${form.quoteAmount || form.hourlyRate}`;
                    addToBundle("VLA Report Worksheet", content);
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  Add to Bundle
                </button>
                <button type="submit" disabled={submitting}
                  className="bg-pink-700 hover:bg-pink-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Submitting..." : "Submit Worksheet"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}