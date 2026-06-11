import React from 'react';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Personal Details", sections: "1–3" },
  { label: "Language & Health", sections: "4–6" },
  { label: "Employment & Benefits", sections: "7–8" },
  { label: "Relationship", sections: "9–12" },
  { label: "Dependants & Finances", sections: "13–16" },
  { label: "Other Parties", sections: "17" },
  { label: "Court & Legal", sections: "18–21" },
  { label: "Legal Details", sections: "22–25" },
  { label: "Specific Matters", sections: "26–28" },
  { label: "Declaration & Submit", sections: "29–30" },
];

export { STEPS };

export default function FormProgress({ currentStep, onStepClick, completedSteps }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-max gap-1 px-1">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isComplete = completedSteps?.includes(i);
          
          return (
            <button
              key={i}
              onClick={() => onStepClick(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                isActive && "bg-[#0071BC] text-white shadow-md",
                !isActive && isComplete && "bg-[#0071BC]/10 text-[#0071BC] hover:bg-[#0071BC]/20",
                !isActive && !isComplete && "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                isActive && "bg-white/20 text-white",
                !isActive && isComplete && "bg-[#0071BC] text-white",
                !isActive && !isComplete && "bg-gray-200 text-gray-500"
              )}>
                {isComplete && !isActive ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden lg:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}