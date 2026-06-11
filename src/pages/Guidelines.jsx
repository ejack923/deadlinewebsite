import React, { useState, useRef } from "react";
import AdminDetailsSection from "@/components/vla/AdminDetailsSection";
import GuidelineSection from "@/components/vla/GuidelineSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { brand } from "@/lib/demoConfig";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function VLAChecklist() {
  const today = new Date().toISOString().split("T")[0];
  const mainContentRef = useRef(null);

  const emptyForm = {
    client_name: "",
    client_dob: "",
    file_ref: "",
    lawyer: "",
    certified_by: "",
    cert_date: today,
    notes: "",
    guideline: "",
    criteria: {},
    signature: "",
    waiver_applies: false,
  };

  const [form, setForm] = useState(emptyForm);
  const [showDialog, setShowDialog] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      criteria: { ...prev.criteria, [key]: value },
    }));
  };

  const handleGuidelineChange = (value) => {
    setForm((prev) => ({ ...prev, guideline: value, criteria: {} }));
  };

  const handleClear = () => {
    setForm(emptyForm);
  };

  const handleSavePDF = async () => {
    setShowDialog(false);
    const element = mainContentRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Guideline-Certification.pdf");
    } catch (err) {
      console.error("PDF generation failed, falling back to print:", err);
      window.print();
    }
  };

  const handlePrint = () => {
    setShowDialog(false);
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b-4 border-purple-700 py-5 print:py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <a
            href={createPageUrl("Home")}
            className="text-sm text-purple-700 hover:text-purple-900 font-semibold uppercase tracking-wide print:hidden"
          >
            ← Back to Dashboard
          </a>
          <div className="text-center flex-1">
            <h1 className="text-purple-700 font-bold text-2xl md:text-3xl tracking-wide uppercase">
              {brand.appName}
            </h1>
            <p className="text-purple-400 text-base mt-1">Guideline Checklist</p>
          </div>
          <div className="w-32 print:hidden" />
        </div>
      </header>

      <main id="main-content" ref={mainContentRef} className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-900 rounded shadow-sm p-8 print:shadow-none print:p-0">
          <AdminDetailsSection form={form} onChange={handleChange} />
          <GuidelineSection
            form={form}
            onGuidelineChange={handleGuidelineChange}
            onCriteriaChange={handleCriteriaChange}
            onChange={handleChange}
          />

          {/* Buttons */}
          <div className="flex flex-wrap justify-end items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 print:hidden">
            <button
              onClick={handleClear}
              className="px-6 py-2 border-2 border-purple-700 text-purple-700 dark:text-purple-400 dark:border-purple-400 font-semibold uppercase tracking-wide text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors select-none"
            >
              Clear Form
            </button>
            <button
              onClick={() => setShowDialog(true)}
              className="px-6 py-2 bg-purple-700 text-white font-semibold uppercase tracking-wide text-sm flex items-center gap-2 hover:bg-purple-800 transition-colors select-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Download / Print to PDF
            </button>
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download or Print</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">How would you like to proceed?</p>
          <DialogFooter className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleSavePDF}
              className="border-purple-700 text-purple-700 dark:text-purple-400 dark:border-purple-400"
            >
              Save to Computer
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-purple-700 hover:bg-purple-800 text-white"
            >
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden, nav, .fixed { display: none !important; }
          body, html { background: white !important; margin: 0; padding: 0; }
          * { color: #000 !important; background: transparent !important; border-color: #ccc !important; }
          header { border-bottom: 3px solid #6b21a8 !important; padding: 12px 0 !important; text-align: center; }
          header h1 { color: #6b21a8 !important; font-size: 20px !important; }
          header p { color: #7c3aed !important; font-size: 13px !important; }
          main { padding: 12px 16px !important; }
          .shadow-sm, .rounded { box-shadow: none !important; border-radius: 0 !important; }
          input[type="text"], input[type="date"], textarea {
            border: none !important;
            border-bottom: 1px solid #888 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 1px 0 !important;
            font-size: 13px !important;
            color: #000 !important;
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
          }
          textarea { resize: none !important; min-height: 60px; }
          input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            width: 12px !important;
            height: 12px !important;
            border: 1.5px solid #444 !important;
            border-radius: 2px !important;
            background: transparent !important;
            position: relative;
            display: inline-block;
            flex-shrink: 0;
            margin-top: 2px;
          }
          input[type="checkbox"]:checked::after {
            content: "✓";
            position: absolute;
            top: -4px;
            left: 0px;
            font-size: 12px;
            color: #000 !important;
            font-weight: bold;
          }
          .text-purple-700 { color: #6b21a8 !important; }
          .border-purple-700 { border-color: #6b21a8 !important; }
          .bg-gray-50, .bg-gray-800 { background: white !important; }
          canvas { border: 1px solid #aaa !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
