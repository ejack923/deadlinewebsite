import React, { useState } from "react";
import { GUIDELINES, GUIDELINE_GROUPS } from "./guidelineCriteria";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuidelineDrawer({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = value ? GUIDELINES[value] : null;

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2.5 text-sm text-left flex items-center justify-between bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-red-500 select-none"
      >
        <span className={selected ? "" : "text-gray-400 dark:text-gray-500"}>
          {selected ? selected.label : "-- Choose a Guideline --"}
        </span>
        <ChevronDown size={16} className="text-gray-400 shrink-0 ml-2" />
      </button>

      {/* Backdrop + Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Handle + header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-2">Select VLA Guideline</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-2 select-none">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto flex-1 px-2 pb-4">
                {GUIDELINE_GROUPS.map((group) => (
                  <div key={group.label} className="mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 py-2">
                      {group.label}
                    </p>
                    {group.options.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelect(key)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors select-none
                          ${value === key
                            ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        {GUIDELINES[key].label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}