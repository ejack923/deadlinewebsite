import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from "@/utils";
import { brand } from "@/lib/demoConfig";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, FileText, Printer, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import FormProgress, { STEPS } from '../components/form/FormProgress';
import Step1PersonalDetails from '../components/form/Step1PersonalDetails';
import Step2LanguageHealth from '../components/form/Step2LanguageHealth';
import Step3Employment from '../components/form/Step3Employment';
import Step4CustodyRelationship from '../components/form/Step4CustodyRelationship';
import Step5Finances from '../components/form/Step5Finances';
import Step6OtherParties from '../components/form/Step6OtherParties';
import Step7Court from '../components/form/Step7Court';
import Step8LegalDetails from '../components/form/Step8LegalDetails';
import Step9SpecificMatters from '../components/form/Step9SpecificMatters';
import Step10Declaration from '../components/form/Step10Declaration';
import PrintableForm from '../components/form/PrintableForm';
import SavePDFDialog from '../components/form/SavePDFDialog';

const STEP_COMPONENTS = [
  Step1PersonalDetails, Step2LanguageHealth, Step3Employment, Step4CustodyRelationship,
  Step5Finances, Step6OtherParties, Step7Court, Step8LegalDetails,
  Step9SpecificMatters, Step10Declaration,
];

export default function LegalAidForm() {
        const [currentStep, setCurrentStep] = useState(0);
        const [formData, setFormData] = useState({});
        const [applicationId, setApplicationId] = useState(null);
        const [saving, setSaving] = useState(false);
        const [submitted, setSubmitted] = useState(false);
        const [completedSteps, setCompletedSteps] = useState([]);
        const [showPDFDialog, setShowPDFDialog] = useState(false);
        const [downloadingPDF, setDownloadingPDF] = useState(false);
        const [emailing, setEmailing] = useState(false);
        const printRef = React.useRef(null);

  // Load existing draft from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      loadApplication(id);
    }
  }, []);

  const loadApplication = async (id) => {
    const app = await base44.entities.LegalAidApplication.get(id);
    if (app) {
      setFormData(app.form_data || {});
      setCurrentStep(app.current_step || 0);
      setApplicationId(app.id);
      if (app.status === 'submitted') setSubmitted(true);
    }
  };

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      form_data: formData,
      current_step: currentStep,
      applicant_name: `${formData.first_name || ''} ${formData.last_name || ''}`.trim(),
      status: 'draft',
    };

    if (applicationId) {
      await base44.entities.LegalAidApplication.update(applicationId, payload);
    } else {
      const created = await base44.entities.LegalAidApplication.create(payload);
      setApplicationId(created.id);
    }
    setSaving(false);
    toast.success("Draft saved successfully");
  };

  const handleEmailForm = async () => {
    setEmailing(true);
    try {
      let appId = applicationId;
      if (!applicationId) {
        const created = await base44.entities.LegalAidApplication.create({
          form_data: formData,
          current_step: currentStep,
          applicant_name: `${formData.first_name || ''} ${formData.last_name || ''}`.trim(),
          status: 'draft',
        });
        appId = created.id;
        setApplicationId(created.id);
      }
      await base44.functions.invoke('submitApplicationEmail', {
        formData,
        applicationId: appId,
      });
      toast.success("Form emailed successfully!");
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setEmailing(false);
    }
  };

  const handlePrintDownload = async () => {
    setDownloadingPDF(true);
    try {
      await generatePDF();
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const generatePDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = printRef.current;
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const doc = new jsPDF('p', 'mm', 'a4');

    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    doc.save(`legal_aid_application_${applicationId || 'draft'}.pdf`);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await generatePDF();
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPDF(false);
      setShowPDFDialog(false);
      proceedWithSubmit();
    }
  };

  const proceedWithSubmit = async () => {
    setSaving(true);
    const payload = {
      form_data: formData,
      current_step: currentStep,
      applicant_name: `${formData.first_name || ''} ${formData.last_name || ''}`.trim(),
      status: 'submitted',
      submission_date: new Date().toISOString(),
    };

    try {
      let appId = applicationId;
      if (applicationId) {
        await base44.entities.LegalAidApplication.update(applicationId, payload);
      } else {
        const created = await base44.entities.LegalAidApplication.create(payload);
        appId = created.id;
        setApplicationId(created.id);
      }

      // Send email with PDF attachment
      const response = await base44.functions.invoke('submitApplicationEmail', {
        formData,
        applicationId: appId,
      });

      setSaving(false);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      setSaving(false);
      console.error('Submission failed:', err);
      toast.error(`Submission failed: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    setShowPDFDialog(true);
  };

  const goNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the entire form? This cannot be undone.')) {
      setFormData({});
      setCurrentStep(0);
      setCompletedSteps([]);
      toast.success("Form cleared");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <a
            href={createPageUrl("Home")}
            className="mb-4 inline-block text-sm text-purple-700 hover:text-purple-900 font-semibold uppercase tracking-wide"
          >
            ← Back to Dashboard
          </a>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted</h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Your demo application has been submitted successfully. This demo keeps the workflow local and does not send a live application.
          </p>
          <p className="text-sm text-gray-400">Reference ID: {applicationId}</p>
        </motion.div>
        </div>
      </div>
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div id="print-area" className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30" ref={printRef}>
        <style>{`
          .vla-print-document {
            display: block;
          }
          
          @media print {
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; font-family: Arial, sans-serif; }
            #print-area > div:not(.vla-print-document) { display: none !important; }
            .vla-print-document { display: block !important; position: static !important; left: auto !important; }
            
            .vla-print-header {
              border-bottom: 2px solid #111827;
              color: #111827;
              padding: 0 0 16px 0;
              margin: 0 20px 20px 20px;
              page-break-after: avoid;
            }
            .vla-print-header h1 { font-size: 20px; font-weight: 700; margin: 10px 0 4px 0; }
            .vla-print-header p { font-size: 11px; margin: 0; color: #4b5563; }
            .vla-print-header-meta {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              color: #4b5563;
            }

            .vla-section-header {
              border-top: 1px solid #d1d5db;
              border-bottom: 1px solid #d1d5db;
              color: #111827;
              padding: 7px 15px;
              margin: 20px 0 12px 0;
              font-weight: bold;
              font-size: 12px;
              background: #f9fafb;
              page-break-after: avoid;
            }

            .vla-form-content {
              padding: 0 20px;
              font-size: 11px;
              line-height: 1.5;
              color: #333;
            }

            .vla-form-row {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 20px;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }

            .vla-form-field {
              display: flex;
              flex-direction: column;
            }

            .vla-form-field label {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 2px;
              color: #333;
            }

            .vla-form-field div {
              border-bottom: 1px solid #333;
              padding: 3px 0;
              min-height: 14px;
              font-size: 11px;
            }

            .vla-form-field-full {
              grid-column: 1 / -1;
              margin-bottom: 12px;
            }

            .vla-paragraph-block {
              margin-bottom: 14px;
              page-break-inside: avoid;
            }

            .vla-paragraph-block label {
              display: block;
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #333;
            }

            .vla-paragraph-block div {
              border: 1px solid #d1d5db;
              padding: 8px 10px;
              min-height: 34px;
              white-space: pre-wrap;
            }

            .vla-table-wrap,
            .vla-subrecord,
            .vla-signature-block {
              margin-bottom: 14px;
              page-break-inside: avoid;
            }

            .vla-table-title {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 6px;
              color: #333;
            }

            .vla-data-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }

            .vla-data-table th,
            .vla-data-table td {
              border: 1px solid #d1d5db;
              padding: 5px 6px;
              text-align: left;
              vertical-align: top;
            }

            .vla-data-table th {
              background: #f3f4f6;
              font-weight: bold;
            }

            .vla-signature-image-wrap {
              border: 1px solid #d1d5db;
              padding: 8px;
              min-height: 60px;
              display: flex;
              align-items: center;
            }

            .vla-signature-image {
              max-height: 54px;
              max-width: 180px;
              object-fit: contain;
            }

            .vla-signature-date {
              font-size: 10px;
              margin-top: 4px;
              color: #4b5563;
            }

            .vla-print-footer {
              margin: 24px 20px 0 20px;
              padding-top: 10px;
              border-top: 1px solid #d1d5db;
              font-size: 10px;
              text-align: center;
              color: #666;
            }

            .vla-checkbox-group {
              display: flex;
              gap: 15px;
              flex-wrap: wrap;
              margin: 6px 0;
            }

            .vla-checkbox {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 10px;
            }

            .vla-checkbox input {
              width: 11px;
              height: 11px;
              margin: 0;
            }
          }
        `}</style>
        <PrintableForm formData={formData} applicationId={applicationId} />
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 print-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4 min-w-0">
              <a
                href={createPageUrl("Home")}
                className="text-sm text-purple-700 hover:text-purple-900 font-semibold uppercase tracking-wide"
              >
                ← Back to Dashboard
              </a>
              <div className="w-10 h-10 bg-[#0071BC] rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">Legal Assistance Application</h1>
                <p className="text-xs text-gray-400">{brand.appName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearForm}
                className="gap-2"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailForm}
                disabled={emailing}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                {emailing ? 'Sending...' : 'Email'}
              </Button>
              <Button
                size="sm"
                onClick={handlePrintDownload}
                disabled={downloadingPDF}
                className="gap-2 bg-[#0071BC] hover:bg-[#005A96]"
              >
                <Printer className="w-4 h-4" />
                {downloadingPDF ? 'Downloading...' : 'Print/Download'}
              </Button>
            </div>
          </div>
          <FormProgress
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            completedSteps={completedSteps}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <span className="text-xs font-medium text-[#0071BC] tracking-wide uppercase">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{STEPS[currentStep].label}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Sections {STEPS[currentStep].sections}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
          >
            <StepComponent data={formData} onChange={handleChange} />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-end mt-8 pb-8 print-hidden">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button onClick={goNext} className="gap-2 bg-[#0071BC] hover:bg-[#005A96]">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}


          </div>
        </div>
      </div>

      {/* Save PDF Dialog */}
      <SavePDFDialog 
        open={showPDFDialog} 
        onOpenChange={setShowPDFDialog}
        onSave={handleDownloadPDF}
        onSkip={() => {
          setShowPDFDialog(false);
          proceedWithSubmit();
        }}
        isLoading={downloadingPDF}
      />
      </div>
      );
      }
