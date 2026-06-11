import { useState, useCallback } from "react";
import { createPageUrl } from "@/utils";
import { brand } from "@/lib/demoConfig";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Printer, Mail } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";


import FormField from "@/components/intake/FormField";
import ClientDetailsSection from "@/components/intake/ClientDetailsSection";
import MatterDetailsSection from "@/components/intake/MatterDetailsSection";
import CriminalSection from "@/components/intake/CriminalSection";
import VOCATSection from "@/components/intake/VOCATSection";
import InfringementsSection from "@/components/intake/InfringementsSection";
import InterventionOrderSection from "@/components/intake/InterventionOrderSection";
import GlobalAssessmentSection from "@/components/intake/GlobalAssessmentSection";
import OtherLegalSection from "@/components/intake/OtherLegalSection";
import OtherIssuesSection from "@/components/intake/OtherIssuesSection";
import AdviceSection from "@/components/intake/AdviceSection";
import ApprovalAndAssignmentSection from "@/components/intake/ApprovalAndAssignmentSection";

const initialFormData = {
  date: new Date().toISOString(),
  client_status: "",
  first_name: "",
  middle_name: "",
  surname: "",
  alias: "",
  dob: "",
  address: "",
  phone: "",
  email_address: "",
  authorised_to_speak_to: "",
  custody_status: "",
  crn: "",
  country_of_birth: "",
  citizenship: "",
  citizenship_other: "",
  cald_status: "",
  preferred_language: "",
  preferred_language_other: "",
  interpreter_required: "",
  indigenous_status: "",
  disability: "",
  disability_details: "",
  employment: "",
  occupation: "",
  weekly_income: "",
  centrelink_reference: "",
  health_care_card: "",
  benefit_type: "",
  maximum_rate: "",
  dependents: "",
  other_financial_supports: "",
  relationship_status: "",
  living_with: "",
  housing_type: "",
  referring_agency: "",
  referring_agency_other: "",
  referrer_contact: "",
  current_lawyer: "",
  matter_types: [],
  criminal_data: {},
  vocat_data: {},
  infringements_data: {},
  intervention_order_data: {},
  family_violence_data: {},
  housing_data: {},
  drug_alcohol_data: {},
  health_wellbeing_data: {},
  financial_disadvantage_data: {},
  children_data: {},
  other_legal_na: false,
  other_legal_matters: [],
  other_issues_data: {},
  advice_instructions: "",
  see_attached: false,
  staff_name: "",
  staff_role: "",
  checked_by_supervisor: "",
  supervisor_date: "",
  conflict_check: "",
  conflict_check_date: "",
  form_status: "Draft",
  approval_data: {},
};

export default function IntakeForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showUpdateFormsDialog, setShowUpdateFormsDialog] = useState(false);
  const [selectedForms, setSelectedForms] = useState([]);
  const [emailAddress, setEmailAddress] = useState("");
  const [ccAddress, setCcAddress] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);

  const toggleForm = (form) => {
    setSelectedForms(prev => prev.includes(form) ? prev.filter(f => f !== form) : [...prev, form]);
  };

  const generateCleanFormHtml = () => {
    const renderField = (label, value) => {
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) return '';
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      return `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: 600; width: 30%; color: #444;">${label}</td><td style="padding: 8px; color: #666;">${displayValue}</td></tr>`;
    };

    const sections = [];
    
    sections.push(`<div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4f46e5;">
      <h1 style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 10px 0 5px 0;">Client Intake Form</h1>
      <p style="font-size: 14px; color: #4f46e5; margin: 0;">${brand.intakeOrgName}</p>
    </div>`);
    
    sections.push(`<h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 20px 0 10px 0;">Client Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${renderField('First Name', formData.first_name)}
        ${renderField('Middle Name', formData.middle_name)}
        ${renderField('Surname', formData.surname)}
        ${renderField('Email', formData.email_address)}
        ${renderField('Phone', formData.phone)}
        ${renderField('Date of Birth', formData.dob)}
        ${renderField('Address', formData.address)}
      </table>`);

    if (formData.matter_types && formData.matter_types.length > 0) {
      sections.push(`<h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 20px 0 10px 0;">Matter Types</h2>
        <p style="color: #666;">${formData.matter_types.join(', ')}</p>`);
    }

    if (formData.staff_name || formData.staff_role) {
      sections.push(`<h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 20px 0 10px 0;">Staff Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${renderField('Staff Name', formData.staff_name)}
          ${renderField('Staff Role', formData.staff_role)}
        </table>`);
    }

    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">${sections.join('')}</div>`;
  };

  const handleSendEmail = async () => {
    if (!emailAddress) return;
    
    setIsEmailSending(true);
    try {
      const formHtml = generateCleanFormHtml();
      const doc = await generatePDF();
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      await base44.functions.invoke('sendFormEmail', {
        recipientEmail: emailAddress,
        ccEmail: ccAddress || null,
        message: emailMessage || null,
        formName: `${formData.first_name} ${formData.surname}` || 'Client Intake Form',
        formHtml: formHtml,
        pdfBase64: pdfBase64
      });
      
      toast.success(`Email sent successfully to ${emailAddress}`);
      setShowEmailDialog(false);
      setEmailAddress("");
      setCcAddress("");
      setEmailMessage("");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  const updateField = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const updateNestedField = useCallback((parentKey, name, value) => {
    setFormData(prev => ({
      ...prev,
      [parentKey]: { ...(prev[parentKey] || {}), [name]: value },
    }));
  }, []);

  const generatePDF = async () => {
    const formElement = document.getElementById('form-content');
    const canvas = await html2canvas(formElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }
    
    return doc;
  };

  const handlePrint = async () => {
    const doc = await generatePDF();
    doc.autoPrint();
    window.open(doc.output('bloburi'));
    setShowPrintDialog(false);
  };

  const handleDownload = async () => {
    const doc = await generatePDF();
    doc.save(`intake_${formData.full_name || "form"}.pdf`);
    setShowPrintDialog(false);
  };

  const matterTypes = formData.matter_types || [];

  return (
    <div className="min-h-screen bg-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-indigo-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href={createPageUrl("Home")}
            className="text-sm text-purple-700 hover:text-purple-900 font-semibold uppercase tracking-wide"
          >
            ← Back to Dashboard
          </a>
          <div>
            <h1 className="text-lg font-semibold text-indigo-900 tracking-tight">Client Intake Form</h1>
              <p className="text-xs text-indigo-600">{brand.intakeOrgName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormData(initialFormData)} className="text-sm">
              Reset
            </Button>
            <Button onClick={() => setShowEmailDialog(true)} className="gap-2 text-sm border-indigo-300 hover:bg-indigo-50" variant="outline">
              <Mail className="h-3.5 w-3.5" /> Email
            </Button>
            <Button onClick={() => setShowPrintDialog(true)} className="gap-2 text-sm bg-indigo-700 hover:bg-indigo-800 text-white">
              <Printer className="h-3.5 w-3.5" /> Print/Download
            </Button>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div id="form-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-2">
        {/* Header for Print */}
        <div className="bg-white rounded-xl border border-indigo-200 p-6 text-center space-y-2 mb-6">
          <h2 className="text-lg font-semibold text-indigo-900">Client Intake Form</h2>
          <p className="text-xs text-indigo-600">{brand.intakeOrgName}</p>
        </div>

        {/* Top Meta */}
        <div className="bg-white rounded-xl border border-indigo-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date" name="date" type="date" value={formData.date} onChange={updateField} />
            <FormField
              label="Client Status"
              name="client_status"
              type="radio"
              value={formData.client_status}
              onChange={updateField}
              options={["New Client", "Existing Client", "Former Client"]}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <ClientDetailsSection formData={formData} updateField={updateField} />
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <MatterDetailsSection formData={formData} updateField={updateField} />
        </div>

        {matterTypes.includes("Criminal") && (
          <div className="bg-white rounded-xl border border-indigo-200 p-6">
            <CriminalSection formData={formData} updateNestedField={updateNestedField} />
          </div>
        )}

        {matterTypes.includes("VOCAT") && (
          <div className="bg-white rounded-xl border border-indigo-200 p-6">
            <VOCATSection formData={formData} updateNestedField={updateNestedField} />
          </div>
        )}

        {matterTypes.includes("Infringements") && (
          <div className="bg-white rounded-xl border border-indigo-200 p-6">
            <InfringementsSection formData={formData} updateNestedField={updateNestedField} />
          </div>
        )}

        {matterTypes.includes("IVO") && (
          <div className="bg-white rounded-xl border border-indigo-200 p-6">
            <InterventionOrderSection formData={formData} updateNestedField={updateNestedField} />
          </div>
        )}

        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <GlobalAssessmentSection formData={formData} updateNestedField={updateNestedField} />
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <OtherLegalSection formData={formData} updateField={updateField} />
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <OtherIssuesSection formData={formData} updateNestedField={updateNestedField} />
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <AdviceSection formData={formData} updateField={updateField} />
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <ApprovalAndAssignmentSection formData={formData} updateField={updateField} updateNestedField={updateNestedField} />
        </div>

        {/* Footer */}
        <div className="bg-indigo-50 rounded-xl p-5 text-center space-y-1 border border-indigo-200">
          <p className="text-sm font-semibold text-indigo-900">{brand.intakeOrgName}</p>
          <p className="text-xs text-indigo-700">Demo environment for showcasing form workflows</p>
          <p className="text-xs text-indigo-700">{brand.genericContactLine} | {brand.genericWebsite}</p>
        </div>

        {/* Bottom padding */}
        <div className="pb-8"></div>
      </div>

      <Dialog open={showUpdateFormsDialog} onOpenChange={setShowUpdateFormsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Other Forms</DialogTitle>
            <DialogDescription>Select the form you would like updated</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {[
              "Aid application form",
              "Guideline form",
              "Medical worksheet",
              "Memo",
              "Additional prep worksheet",
            ].map((form) => (
              <button
                key={form}
                onClick={() => toggleForm(form)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center gap-3 ${
                  selectedForms.includes(form)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  selectedForms.includes(form) ? "border-white bg-white" : "border-slate-400"
                }`}>
                  {selectedForms.includes(form) && (
                    <svg className="w-3 h-3 text-slate-900" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {form}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500">{selectedForms.length} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowUpdateFormsDialog(false); setSelectedForms([]); }}>Close</Button>
              <Button className="bg-slate-900 hover:bg-slate-800" disabled={selectedForms.length === 0}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Form</DialogTitle>
            <DialogDescription>Enter the recipient's email address</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">To:</label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={isEmailSending}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">CC:</label>
              <Input
                type="email"
                placeholder="cc@example.com (optional)"
                value={ccAddress}
                onChange={(e) => setCcAddress(e.target.value)}
                disabled={isEmailSending}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Message:</label>
              <textarea
                placeholder="Add a message (optional)"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                disabled={isEmailSending}
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                rows="4"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isEmailSending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail} 
              className="bg-slate-900 hover:bg-slate-800" 
              disabled={!emailAddress || isEmailSending}
            >
              {isEmailSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Form</DialogTitle>
            <DialogDescription>Would you like to print this form or save it to your computer?</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownload} className="bg-slate-900 hover:bg-slate-800">
              Save to Computer
            </Button>
            <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800">
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
