import React, { useState } from "react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  FileText, Clipboard, ClipboardList, BookOpen,
  Briefcase, Scale, FileCheck, FilePen, ChevronRight, Package, Car, Receipt, CalendarDays, ClipboardCheck
} from "lucide-react";
import { addToBundle } from "@/components/BundleBar";

const tools = [
  { title: "Legal Aid Form Portal", description: "Victoria Legal Aid application form", icon: FileText, page: "LegalAidForm" },
  { title: "LACW Intake Form", description: "Client intake form dedicated portal", icon: Clipboard, page: "IntakeForm" },
  { title: "LACW Guidelines", description: "VLA guideline certification portal", icon: BookOpen, page: "Guidelines" },
  { title: "VLA Report Worksheet", description: "Medical/Psychologist/Psychiatrist report worksheet", icon: ClipboardList, page: "VLAReportWorksheet" },
  { title: "Additional Prep Worksheet", description: "Preparation fees worksheet — Senior Counsel, Senior Junior Counsel, Junior Counsel, or Solicitor", icon: Briefcase, page: "AdditionalPrepWorksheet" },
  { title: "Memo Precedent", description: "Create a funding request memo", icon: FilePen, page: "MemoPrecedent" },
  { title: "Means Calculator", description: "VLA means test quick calculator", icon: Scale, page: "MeansCalculator" },
  { title: "VLA Criminal Law Tools", description: "Grant finder & fees payable — all in one", icon: Scale, page: "VLATools" },
  { title: "LACW Billing", description: "Upload a diary PDF to process ATLAS claims", icon: FileText, page: "LACWBilling" },
  { title: "Staff Training Guide", description: "How to use all tools in the portal", icon: BookOpen, page: "TrainingGuide" },
  { title: "Backsheet to Counsel", description: "Prepare and print instructions for counsel", icon: FilePen, page: "BacksheetToCounsel" },
  { title: "Staff Travel Claims", description: "LACW travel allowance and expense claim form", icon: Car, page: "TravelClaims" },
  { title: "Claim costs", description: "Open the claim costs workspace", icon: Receipt, page: "ClaimCosts" },
  { title: "Aid Planner", description: "Portable aid, extension, and billing guidance planner", icon: CalendarDays, page: "AidPlanner" },
  { title: "Audit Manager", description: "CLS matter audit, compliance review, and action plan", icon: ClipboardCheck, page: "AuditManager" },
  { title: "Aid Request", description: "Submit an application for legal aid assistance", icon: FileCheck, page: "ApplyForAid" },
];

export default function Home() {
  const [bundled, setBundled] = useState({});

  const handleBundle = (e, tool) => {
    e.preventDefault();
    e.stopPropagation();
    addToBundle(tool.title, `${tool.title} — ${tool.description}`);
    setBundled(b => ({ ...b, [tool.page]: true }));
    setTimeout(() => setBundled(b => ({ ...b, [tool.page]: false })), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-[5]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Law and Advocacy Centre for Women</h1>
            <p className="text-slate-500 text-sm mt-0.5">Staff Portal — select a tool to get started</p>
          </div>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6994d499f463deaf526b6d79/69214a516_lacw-logo-purple-150_logolacw.png"
            alt="LACW Logo"
            className="h-12 object-contain"
          />
        </div>

        {/* Tool grid */}
        <div className="flex-1 px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool, i) => (
              <motion.a
                key={tool.page}
                href={createPageUrl(tool.page)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 hover:scale-[1.01] transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] group"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                    <tool.icon className="w-4 h-4 text-purple-700" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm leading-snug">{tool.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{tool.description}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={(e) => handleBundle(e, tool)}
                    className="flex items-center gap-1 text-slate-400 hover:text-purple-600 text-xs transition-colors"
                    title="Add to bundle"
                  >
                    <Package className="w-3.5 h-3.5" />
                    {bundled[tool.page] ? "Added!" : "Bundle"}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-slate-400 text-xs space-y-1 pb-8">
            <p>RMIT Building 152, Level 1 · 147-155 Pelham Street, Carlton, Vic 3053</p>
            <p>Tel 03 9448 8930 · 0415 330 198 · Fax 03 9923 6669</p>
            <a href="https://www.lacw.org.au" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-600 transition-colors">www.lacw.org.au</a>
          </div>
        </div>
      </div>
    </div>
  );
}
