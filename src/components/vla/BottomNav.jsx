import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PlusCircle, Clock } from "lucide-react";

export default function BottomNav({ currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "VLAChecklist", label: "New", icon: PlusCircle },
    { name: "SavedChecklists", label: "History", icon: Clock },
  ];

  const handleTabClick = (e, name) => {
    const rootUrl = createPageUrl(name);
    if (currentPageName === name && location.search) {
      e.preventDefault();
      navigate(rootUrl, { replace: true });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-50 select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ name, label, icon: Icon }) => {
        const active = currentPageName === name;
        return (
          <Link
            key={name}
            to={createPageUrl(name)}
            onClick={(e) => handleTabClick(e, name)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active
                ? "text-purple-700 dark:text-purple-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}