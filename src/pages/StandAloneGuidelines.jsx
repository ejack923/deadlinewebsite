import React, { useState, useRef } from "react";
import AdminDetailsSection from "@/components/vla/AdminDetailsSection";
import GuidelineSection from "@/components/vla/GuidelineSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Shield } from "lucide-react";

// Re-branding for EAS Legal standalone version
const altBrand = {
  appName: "EAS Legal",
  appSubtitle: "Guideline Certification form",
  firmName: "EAS Legal",
  logoUrl: "https://easlegal.com.au/wp-content/uploads/2023/04/EAS-Legal-Logo-1.png" // Using website logo as reference
};

export default function StandAloneGuidelines() {
  const isJblPortal = window.location.pathname.toLowerCase().includes("jbl-portal");
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

  const handleSavePDF = () => {
    setShowDialog(false);
    // Small delay to let the dialog close before printing
    setTimeout(() => window.print(), 300);
  };

  const handlePrint = () => {
    setShowDialog(false);
    setTimeout(() => window.print(), 300);
  };

  if (isJblPortal) {
    const primary = "#C29A5B";
    const tools = [
      {
        title: "JBL Guideline Certification",
        description: "Complete and export VLA guideline compliance certificates for JBL matters.",
        icon: Printer,
        href: "/jbl-certification",
      },
      {
        title: "JBL Legal Aid Application",
        description: "Complete and export Victoria Legal Aid application forms for JBL matters.",
        icon: FileText,
        href: "/jbl-aidapplication",
      },
      {
        title: "JBL Medical Worksheet",
        description: "Complete the VLA medical, psychologist, or psychiatrist report worksheet.",
        icon: FileText,
        href: "/jbl-medicalworksheet",
      },
      {
        title: "JBL Conflict Check",
        description: "Upload documents to scan and check against conflict databases.",
        icon: Shield,
        href: "/jbl-conflictcheck",
      },
      {
        title: "Jarrod Behan Law",
        description: "Open the Jarrod Behan Law website and contact details.",
        logo: "/jarrod-behan-law-logo.webp",
        href: "https://www.jarrodbehanlaw.com.au/",
        external: true,
      },
    ];

    return (
      <main className="min-h-screen bg-white px-6 py-16 font-sans text-neutral-900 lg:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neutral-500">Jarrod Behan Law Portal</p>
          <div className="mb-6 h-[1.5px] w-12" style={{ backgroundColor: primary }} />
          <h1 className="text-3xl font-semibold text-neutral-900">Your Tools</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">Access your workflow tools and resources below.</p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.title}
                  href={tool.href}
                  target={tool.external ? "_blank" : undefined}
                  rel={tool.external ? "noreferrer" : undefined}
                  className="group flex min-h-[218px] flex-col justify-between border border-neutral-200 bg-white p-6 text-left transition hover:shadow-md"
                  style={{ borderRadius: 0 }}
                >
                  <div className="w-full">
                    {tool.logo ? (
                      <div className="mb-4 flex min-h-14 items-center overflow-hidden bg-[#223761] px-3 py-2">
                        <img src={tool.logo} alt={tool.title} className="h-10 w-full object-contain" />
                      </div>
                    ) : (
                      <div className="mb-4 flex h-10 w-10 items-center justify-center" style={{ backgroundColor: `${primary}15`, color: primary }}>
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                    <h2 className="text-base font-semibold text-neutral-900 transition-colors group-hover:text-[#C29A5B]">{tool.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">{tool.description}</p>
                  </div>
                  <p className="mt-4 text-xs font-medium" style={{ color: primary }}>
                    Open tool →
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 print:bg-white print:min-h-0">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#C29A5B] py-4 print:py-3 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
          <div className="text-center flex-1">
            <div className="flex flex-col items-center gap-2">
              <img
                src="https://easlegal.com.au/wp-content/uploads/2025/11/easlegal-gold-dark@4x-1024x308.png.webp"
                alt="EAS Legal"
                className="h-10 md:h-12 w-auto object-contain"
              />
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.25em]">{altBrand.appSubtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main id="eas-legal-form" ref={mainContentRef} className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-slate-200/40 p-8 print:shadow-none print:p-0 border border-slate-100">
          <AdminDetailsSection form={form} onChange={handleChange} />
          <GuidelineSection
            form={form}
            onGuidelineChange={handleGuidelineChange}
            onCriteriaChange={handleCriteriaChange}
            onChange={handleChange}
          />

          {/* Buttons */}
          <div className="flex flex-wrap justify-end items-center gap-4 mt-8 pt-6 border-t border-slate-100 print:hidden">
            <button
              onClick={handleClear}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wide text-xs hover:bg-slate-50 transition-all select-none"
            >
              Reset Form
            </button>
            <button
              onClick={() => setShowDialog(true)}
              className="px-6 py-2.5 bg-[#1A1F2C] text-white rounded-xl font-bold uppercase tracking-wide text-xs flex items-center gap-2 hover:bg-[#2D3446] shadow-xl shadow-slate-200 transition-all select-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Generate Certificate
            </button>
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1A1F2C]">Export Certification</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-sm">Your browser's print dialog will open. To save as a PDF, select <strong>"Save as PDF"</strong> as the destination.</p>
          <DialogFooter className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleSavePDF}
              className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
            >
              Save as PDF
            </Button>
            <Button
              onClick={handlePrint}
              className="rounded-xl bg-[#1A1F2C] hover:bg-[#2D3446] text-white font-bold"
            >
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        /* EAS Legal brand overrides — remap purple to gold/navy */
        #eas-legal-form .text-purple-700,
        #eas-legal-form .text-purple-700 * { color: #C29A5B !important; }
        #eas-legal-form .border-purple-700 { border-color: #C29A5B !important; }
        #eas-legal-form .text-purple-400 { color: #C29A5B !important; }
        #eas-legal-form .text-purple-500 { color: #1A1F2C !important; }
        #eas-legal-form .border-purple-500,
        #eas-legal-form input:focus,
        #eas-legal-form textarea:focus,
        #eas-legal-form select:focus { border-color: #C29A5B !important; outline-color: #C29A5B !important; box-shadow: 0 0 0 2px rgba(194,154,91,0.15) !important; }
        #eas-legal-form .accent-purple-700,
        #eas-legal-form input[type="checkbox"] { accent-color: #C29A5B !important; }
        #eas-legal-form .hover\\:text-gray-900:hover { color: #1A1F2C !important; }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }

          /* Hide all UI chrome */
          .print\\:hidden, nav, .fixed, button, dialog, [role="dialog"] {
            display: none !important;
          }

          body, html {
            background: #fff !important;
            margin: 0;
            padding: 12mm 12mm 15mm 12mm;
            font-family: 'Georgia', serif;
            font-size: 11pt;
            color: #1a1a1a;
            height: auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
            max-height: 296mm !important;
          }

          /* ── Header ── */
          header {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            padding: 0 0 6pt 0 !important;
            margin-bottom: 8pt !important;
            border-bottom: 2pt solid #C29A5B !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          header img {
            height: 28pt !important;
            width: auto !important;
            object-fit: contain !important;
            margin-bottom: 2pt !important;
          }
          header p {
            font-family: 'Arial', sans-serif !important;
            font-size: 7.5pt !important;
            letter-spacing: 0.18em !important;
            text-transform: uppercase !important;
            color: #888 !important;
            margin: 0 !important;
          }

          /* ── Main wrapper ── */
          main {
            padding: 0 !important;
            background: transparent !important;
          }
          .rounded-2xl, .shadow-2xl {
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }

          /* ── Section headings (e.g. CLIENT DETAILS) ── */
          section > div:first-child {
            font-family: 'Arial', sans-serif !important;
            font-size: 7pt !important;
            font-weight: 700 !important;
            letter-spacing: 0.15em !important;
            text-transform: uppercase !important;
            color: #C29A5B !important;
            border-bottom: 1pt solid #C29A5B !important;
            padding-bottom: 2pt !important;
            margin-bottom: 6pt !important;
          }

          /* ── Field labels ── */
          label {
            font-family: 'Arial', sans-serif !important;
            font-size: 7pt !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.06em !important;
            color: #555 !important;
            display: block !important;
            margin-bottom: 1pt !important;
          }

          /* ── Text inputs and selects ── */
          input[type="text"], input[type="date"], select {
            display: block !important;
            width: 100% !important;
            border: none !important;
            border-bottom: 0.75pt solid #bbb !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 1pt 0 !important;
            height: 18pt !important;
            font-family: 'Georgia', serif !important;
            font-size: 9.5pt !important;
            line-height: 1.2 !important;
            color: #1a1a1a !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            outline: none !important;
          }

          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-clear-button {
            display: none !important;
            -webkit-appearance: none !important;
          }

          /* ── Textarea (notes) ── */
          textarea {
            display: block !important;
            width: 100% !important;
            border: 0.75pt solid #ddd !important;
            border-radius: 2pt !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 3pt 4pt !important;
            font-family: 'Georgia', serif !important;
            font-size: 9.5pt !important;
            color: #1a1a1a !important;
            resize: none !important;
            min-height: 40pt !important;
          }

          /* ── Checkboxes ── */
          input[type="checkbox"] {
            -webkit-appearance: none !important;
            appearance: none !important;
            width: 8pt !important;
            height: 8pt !important;
            border: 1pt solid #999 !important;
            border-radius: 1.5pt !important;
            background: transparent !important;
            position: relative !important;
            display: inline-block !important;
            flex-shrink: 0 !important;
            margin-top: 2pt !important;
            margin-right: 5pt !important;
            vertical-align: top !important;
          }
          input[type="checkbox"]:checked {
            background: #C29A5B !important;
            border-color: #C29A5B !important;
          }
          input[type="checkbox"]:checked::after {
            content: "✓" !important;
            position: absolute !important;
            top: -1.5pt !important;
            left: 0.5pt !important;
            font-size: 7.5pt !important;
            color: #fff !important;
            font-weight: bold !important;
          }

          /* ── Checkbox item rows ── */
          .flex.items-start {
            margin-bottom: 3pt !important;
            align-items: flex-start !important;
          }
          .flex.items-start span, .flex.items-start label {
            font-family: 'Georgia', serif !important;
            font-size: 9.5pt !important;
            line-height: 1.3 !important;
            color: #1a1a1a !important;
            text-transform: none !important;
            letter-spacing: 0 !important;
            font-weight: 400 !important;
            padding-left: 6pt !important;
          }

          /* ── Grid layout for fields ── */
          .grid { display: grid !important; gap: 6pt !important; }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }

          /* ── Page footer ── */
          @page {
            @bottom-center {
              content: "EAS Legal — Guideline Certification  |  Page " counter(page) " of " counter(pages);
              font-family: Arial, sans-serif;
              font-size: 7pt;
              color: #aaa;
            }
          }

          canvas { display: none !important; }
        }
      `}</style>
    </div>
  );
}
