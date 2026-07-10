import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Clock, ArrowRight, Activity, Cpu } from "lucide-react";

export default function AdminPortal() {
  const [emailCount, setEmailCount] = useState(211); // Fallback to 211 as requested if fetch fails

  useEffect(() => {
    fetch("/api/lacw-emails")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.emails)) {
          setEmailCount(data.emails.length);
        }
      })
      .catch((err) => console.error("Failed to load email count:", err));
  }, []);

  const adminTools = [
    {
      title: "Submissions Inbox",
      description: "Review, tag, and match inbound client submissions. Process fee applications, travel claims, and document intakes.",
      icon: Mail,
      href: "/InboxScanner",
      tag: "Inbox & Processing",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-600 bg-blue-50",
      borderColor: "hover:border-blue-300",
      shadowColor: "hover:shadow-blue-50/50"
    },
    {
      title: "JBL Audit Manager",
      description: "Verify compliance standards across matters. Complete audit checks, sign off checklists, and generate executive summaries.",
      icon: ShieldCheck,
      href: "/AuditManager",
      tag: "Compliance & Audits",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-600 bg-emerald-50",
      borderColor: "hover:border-emerald-300",
      shadowColor: "hover:shadow-emerald-50/50"
    },
    {
      title: "Deadline Guard",
      description: "Detect critical deadline signals and invoice issues within Gmail threads using automated risk analysis and mapping.",
      icon: Clock,
      href: "/InboxScanner",
      tag: "Automated Monitoring",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconColor: "text-indigo-600 bg-indigo-50",
      borderColor: "hover:border-indigo-300",
      shadowColor: "hover:shadow-indigo-50/50"
    },
    {
      title: "LACW New Files Emails",
      description: "Review new LACW files, automate ATLAS letter attachments, and track real-time funding statuses.",
      icon: Mail,
      href: "/lacw-portal",
      tag: `Extracted Messages ${emailCount}`,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      iconColor: "text-purple-600 bg-purple-50",
      borderColor: "hover:border-purple-300",
      shadowColor: "hover:shadow-purple-50/50"
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-10 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Top Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">CLS Management Suite</p>
            </div>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Admin Portal
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Select an administrative tool to audit files, manage submissions, or review inbox signals.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              System Status: Active
            </span>
          </div>
        </header>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {adminTools.map((tool) => {
            const Icon = tool.icon;
            const isExternal = tool.href === "/lacw-portal";
            const CardComponent = isExternal ? "a" : Link;
            const props = isExternal ? { href: tool.href } : { to: tool.href };

            return (
              <CardComponent
                key={tool.title}
                {...props}
                className={`flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-350 ${tool.borderColor} ${tool.shadowColor} hover:shadow-lg hover:-translate-y-1 group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tool.badgeColor}`}>
                      {tool.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">V1.2</span>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${tool.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-650 transition-colors">
                      {tool.title}
                    </h2>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-500">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                  <span>Launch Module</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardComponent>
            );
          })}
        </div>

        {/* Info Banner */}
        <footer className="mt-12 rounded-2xl border border-slate-250 bg-slate-50/50 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Unified Portal Integration</p>
              <p className="text-xs text-slate-500">Shared database connection across all modules ensuring instant synchronization.</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            CLS Admin Engine v2.0
          </div>
        </footer>
      </div>
    </main>
  );
}
