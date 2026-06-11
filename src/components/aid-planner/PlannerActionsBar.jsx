import React from "react";
import { BriefcaseBusiness, CalendarDays, Download, FileUp, Printer, RefreshCcw } from "lucide-react";

export default function PlannerActionsBar({
  onUploadClick,
  onOpenPracticeManagerImport,
  onDownload,
  onExportCalendar,
  onPrint,
  onReset,
}) {
  return (
    <div className="aid-planner-no-print flex flex-wrap gap-2">
      <button onClick={onUploadClick} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700">
        <FileUp className="w-4 h-4 inline mr-2" />
        Upload planner
      </button>
      <button onClick={onOpenPracticeManagerImport} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700">
        <BriefcaseBusiness className="w-4 h-4 inline mr-2" />
        Import from practice manager
      </button>
      <button onClick={onDownload} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700">
        <Download className="w-4 h-4 inline mr-2" />
        Download planner
      </button>
      <button onClick={onExportCalendar} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700">
        <CalendarDays className="w-4 h-4 inline mr-2" />
        Export ICS
      </button>
      <button onClick={onPrint} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700">
        <Printer className="w-4 h-4 inline mr-2" />
        Download PDF summary
      </button>
      <button onClick={onReset} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-rose-300 hover:text-rose-700">
        <RefreshCcw className="w-4 h-4 inline mr-2" />
        Reset
      </button>
    </div>
  );
}
