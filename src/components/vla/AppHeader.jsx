import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft } from "lucide-react";

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <div
      className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 select-none"
      style={{ paddingTop: "env(safe-area-inset-top)", minHeight: "48px" }}
    >
      <button
        onClick={() => navigate(createPageUrl("SavedChecklists"))}
        className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium text-sm py-2 pr-3"
      >
        <ChevronLeft size={20} />
        Back
      </button>
      <span className="flex-1 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 pr-12">
        Edit Checklist
      </span>
    </div>
  );
}