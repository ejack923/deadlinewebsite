import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    title: "Getting Started",
    icon: "🏠",
    content: [
      {
        heading: "Accessing the Portal",
        text: "The LACW Staff Portal is your central hub for all legal aid tools. When you log in, you'll see the home page with tiles for each available tool. Click any tile to open that tool.",
      },
      {
        heading: "Navigation",
        text: "Each tool has a 'Back to Portal' button in the top-left corner to return to the home page. Some tools also have an 'Add to Bundle' button (top-right) which lets you collect multiple documents to email together.",
      },
    ],
  },
  {
    title: "Legal Aid Form Portal",
    icon: "📄",
    content: [
      {
        heading: "What it does",
        text: "The Victoria Legal Aid (VLA) application form. Use this to complete and submit legal aid applications on behalf of clients.",
      },
      {
        heading: "How to use it",
        text: "Fill in the form across its multiple pages. Use the 'Add to Bundle' button in the top-right to save it to your document bundle for sending later.",
      },
    ],
  },
  {
    title: "LACW Intake Form",
    icon: "📋",
    content: [
      {
        heading: "What it does",
        text: "A dedicated client intake form for new LACW clients. Collects all initial client information needed to open a matter.",
      },
      {
        heading: "How to use it",
        text: "Complete the form with the client's details. You can print the completed form directly from the portal.",
      },
    ],
  },
  {
    title: "LACW Guidelines",
    icon: "📖",
    content: [
      {
        heading: "What it does",
        text: "The VLA guideline certification portal. Use this to check whether a matter meets VLA guidelines for grant eligibility.",
      },
      {
        heading: "How to use it",
        text: "Browse or search for the relevant matter type, then work through the certification questions. The tool will indicate whether the matter meets guidelines.",
      },
    ],
  },
  {
    title: "Means Calculator",
    icon: "🧮",
    content: [
      {
        heading: "What it does",
        text: "A quick financial screening tool to check whether a client appears to meet the financial side of VLA's means test. This is a practical guide only — not a substitute for a formal VLA grant decision.",
      },
      {
        heading: "Matter settings",
        text: "Select the matter cost category (Low, Medium, High, Custom, or Special Circumstances) and the client's housing region. These affect the income threshold used.",
      },
      {
        heading: "Income fields",
        text: "Enter the applicant's gross income and, if applicable, their partner's income. Each field has a frequency selector — choose Weekly, Fortnightly, Monthly, or Yearly and the calculator converts it automatically.",
      },
      {
        heading: "Deductions",
        text: "Enter allowable deductions including income tax, Medicare levy, housing payments (rent or mortgage), childcare, business expenses, and maintenance/child support. All amounts can be entered in any frequency.",
      },
      {
        heading: "Assets",
        text: "Enter cash savings, vehicle equity, principal residence equity, and any other assessable assets. The calculator applies the standard VLA exclusions automatically.",
      },
      {
        heading: "Reading the result",
        text: "The right-hand panel shows the quick result: green = likely eligible (no contribution), amber = likely eligible with contribution, red = likely not financially eligible. A breakdown of how the result was calculated is shown below.",
      },
      {
        heading: "Important",
        text: "This tool does not determine guideline eligibility, merits, or contribution amounts. Always check the current VLA Handbook before relying on the outcome.",
      },
    ],
  },
  {
    title: "VLA Criminal Law Tools",
    icon: "⚖️",
    content: [
      {
        heading: "What it does",
        text: "An all-in-one tool combining a grant finder and fees payable reference for VLA criminal law matters.",
      },
      {
        heading: "Grant Finder",
        text: "Answer the eligibility questions to find the appropriate VLA grant type for the matter.",
      },
      {
        heading: "Fees Payable",
        text: "Browse or search the VLA criminal law fee schedule (effective 1 January 2025). Select a fee category from the left panel to see the full breakdown on the right, including notes and extension requirements.",
      },
    ],
  },
  {
    title: "Worksheets (Prep Fee Claims)",
    icon: "📝",
    content: [
      {
        heading: "What they do",
        text: "There are three preparation fee worksheets: one for Senior Counsel, one for Counsel, and one for Solicitors. These calculate and submit additional preparation fee claims to VLA.",
      },
      {
        heading: "How to use them",
        text: "Fill in the matter details, select the appropriate charge type and case stage, then enter the volume of material (documents, pages, media hours). The worksheet calculates billable hours automatically based on VLA thresholds.",
      },
      {
        heading: "Submitting",
        text: "Click 'Submit' to send the completed worksheet by email. You can also export to Excel or print to PDF using the buttons at the top.",
      },
      {
        heading: "File counter tool",
        text: "Next to page count fields, there is an upload button (📎) — upload a PDF to automatically count its pages, or a video/audio file to get its duration in hours. There is also a calculator button (🔢) to manually add up multiple document counts.",
      },
    ],
  },
  {
    title: "VLA Report Worksheet",
    icon: "🏥",
    content: [
      {
        heading: "What it does",
        text: "A worksheet for claiming fees for medical, psychologist, or psychiatrist reports obtained in a VLA matter.",
      },
      {
        heading: "How to use it",
        text: "Complete the matter details and report information. Submit via email or add to your document bundle.",
      },
    ],
  },
  {
    title: "Brief to Counsel / Appearance Claims",
    icon: "👩‍⚖️",
    content: [
      {
        heading: "Brief to Counsel",
        text: "Use this to prepare and send a brief to counsel. Select the court, level, fee type, and counsel details. Fee rows are added automatically based on the selected options.",
      },
      {
        heading: "Appearance Claims",
        text: "Record court appearances for billing purposes. Enter the matter number, appearance type, fee, date, and who appeared.",
      },
    ],
  },
  {
    title: "LACW Billing (Diary Processor)",
    icon: "💳",
    content: [
      {
        heading: "What it does",
        text: "Upload a LACW court diary PDF and the tool uses AI to extract all client entries, classify them, and suggest the correct ATLAS claim type for each appearance.",
      },
      {
        heading: "How to use it",
        text: "Drag and drop (or click to browse) your diary PDF. Click 'Process diary & extract claims'. The tool will read every page and list all appearances grouped by client.",
      },
      {
        heading: "Reviewing entries",
        text: "Each entry shows the date, client name, grant type, appearance type, lawyer initials, and suggested ATLAS claim. Click any entry to expand it and see the outcome, next date, and notes.",
      },
      {
        heading: "Setting actions",
        text: "Use the dropdown on each entry to set its action: Claimed, Not Claimed, Aid Required, Extension Required, Aid Pending, ACF Lodged, or Query. Entries marked 'Aid Required' or 'Extension Required' will prompt you to notify staff by email.",
      },
      {
        heading: "Billing Summary",
        text: "Once every entry has an action, a Billing Summary appears at the bottom. Review claimed and further-action entries, add notes, attach client approval letters, and email the summary to the billing team.",
      },
      {
        heading: "Important",
        text: "AI extraction may not be 100% accurate. Always verify each entry against the original diary before submitting claims in ATLAS.",
      },
    ],
  },
  {
    title: "Document Bundle",
    icon: "📦",
    content: [
      {
        heading: "What it does",
        text: "The Bundle Bar (floating bar at the bottom of the screen) lets you collect multiple completed forms and send them together in one email.",
      },
      {
        heading: "Adding to bundle",
        text: "On supported pages, click the 'Add to Bundle' button (top-right). The item will appear in the bundle bar.",
      },
      {
        heading: "Sending the bundle",
        text: "Click the bundle bar to expand it, review the items, enter the recipient email address and any notes, then click Send.",
      },
    ],
  },
  {
    title: "Memo Precedent",
    icon: "✉️",
    content: [
      {
        heading: "What it does",
        text: "Creates a funding request memo to VLA. Fill in the matter details, the nature of the application, and supporting information, then generate the memo for review and submission.",
      },
    ],
  },
];

function Section({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <span className="font-semibold text-slate-800">{section.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          {section.content.map((item, i) => (
            <div key={i}>
              <p className="text-sm font-bold text-purple-700 mb-1">{item.heading}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainingGuide() {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <a
          href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">Staff Training Guide</p>
          <p className="text-xs text-slate-400">LACW Staff Portal</p>
        </div>
        <div className="w-28" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Intro */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
          <h1 className="text-xl font-bold mb-2">Welcome to the LACW Staff Portal</h1>
          <p className="text-purple-100 text-sm leading-relaxed">
            This guide covers all the tools available in the portal. Click each section to expand it.
            If you have questions, speak to your supervising lawyer or the practice manager.
          </p>
        </div>

        {/* Expand/collapse all */}
        <div className="flex justify-end">
          <button
            onClick={() => setAllOpen(o => !o)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 border border-purple-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {/* Sections */}
        <ExpandAllContext allOpen={allOpen} sections={sections} />

        <p className="text-xs text-slate-400 text-center pt-2">
          LACW Staff Portal · Law and Advocacy Centre for Women · lacw.org.au
        </p>
      </div>
    </div>
  );
}

function ExpandAllContext({ allOpen, sections }) {
  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <ControlledSection key={i} section={section} forceOpen={allOpen} />
      ))}
    </div>
  );
}

function ControlledSection({ section, forceOpen }) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <span className="font-semibold text-slate-800">{section.title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          {section.content.map((item, i) => (
            <div key={i}>
              <p className="text-sm font-bold text-purple-700 mb-1">{item.heading}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}