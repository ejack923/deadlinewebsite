import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  FileText, Clipboard, ClipboardList, BookOpen,
  Briefcase, Scale, FileCheck, FilePen, ChevronRight, ChevronLeft, Package, Car, Receipt, CalendarDays,
  Users, FileStack, Phone, ShieldCheck, Trash2, ExternalLink, Users as UsersIcon, Eye, Folder, Upload, FileIcon, Shield, CheckCircle2, Loader2, Sparkles, Printer, Plus, Mic, FileEdit, Mail, Calendar as CalendarIcon, Paperclip, UserPlus
} from "lucide-react";
import { addToBundle } from "@/components/BundleBar";
import { Calendar } from "@/components/ui/calendar";
import { listGoogleCalendars, requestGoogleCalendarAccessToken, listGoogleCalendarEvents } from "@/lib/googleCalendarClient";
import { listOutlookCalendars, requestMicrosoftCalendarAccessToken, listOutlookCalendarEvents } from "@/lib/microsoftCalendarClient";
import PracticeManagerImportModal from "@/components/aid-planner/PracticeManagerImportModal";
import { practiceManagerAdapters } from "@/lib/aidPlannerAdapters";
import { createPlanner, normalizePlanner } from "@/lib/aidPlannerSchema";
import { saveMatterToDevice, setLastOpenedMatterId, listLocalMatters, deleteLocalMatter, loadMatterFromDevice } from "@/lib/aidPlannerStore";
import MinimumInfoForm from "@/components/aid-planner/MinimumInfoForm";
import { getMissingCoreFields } from "@/lib/aidPlannerRules";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tools = [
  { title: "Legal Aid Form Portal", description: "Victoria Legal Aid application form", icon: FileText, page: "LegalAidForm" },
  { title: "LACW Intake Form", description: "Client intake form dedicated portal", icon: Clipboard, page: "IntakeForm" },
  { title: "LACW Guidelines", description: "VLA guideline certification portal", icon: BookOpen, page: "Guidelines" },
  { title: "VLA Report Worksheet", description: "Medical/Psychologist/Psychiatrist report worksheet", icon: ClipboardList, page: "VLAReportWorksheet" },
  { title: "Additional Prep Worksheet", description: "Preparation fees worksheet — Senior Counsel, Senior Junior Counsel, Junior Counsel, or Solicitor", icon: Briefcase, page: "AdditionalPrepWorksheet" },
  { title: "Memo Precedent", description: "Create a funding request memo", icon: FilePen, page: "MemoPrecedent" },
  { title: "Document Tool", description: "Create an editable document from pasted precedent text", icon: FileEdit, page: "DocumentTool" },
  { title: "Means Calculator", description: "VLA means test quick calculator", icon: Scale, page: "MeansCalculator" },
  { title: "VLA Criminal Law Tools", description: "Grant finder & fees payable — all in one", icon: Scale, page: "VLATools" },
  { title: "LACW Billing", description: "Upload a diary PDF to process ATLAS claims", icon: FileText, page: "LACWBilling" },
  { title: "Staff Training Guide", description: "How to use all tools in the portal", icon: BookOpen, page: "TrainingGuide" },
  { title: "Backsheet to Counsel", description: "Prepare and print instructions for counsel", icon: FilePen, page: "BacksheetToCounsel" },
  { title: "Staff Travel Claims", description: "LACW travel allowance and expense claim form", icon: Car, page: "TravelClaims" },
  { title: "Claim costs", description: "Open the claim costs workspace", icon: Receipt, page: "ClaimCosts" },
  { title: "Aid Planner", description: "Portable aid, extension, and billing guidance planner", icon: CalendarDays, page: "AidPlanner" },
  { title: "Audit Intelligence", description: "Run file audits, findings, checklists, summaries, and exports", icon: ShieldCheck, page: "AuditDashboard" },
  { title: "Inbox Scanner", description: "Review Gmail funding, billing, admin, and deadline signals", icon: Mail, page: "InboxScanner" },
  { title: "Aid Request", description: "Submit an application for legal aid assistance", icon: FileCheck, page: "ApplyForAid" },
  { title: "LACW New Files Emails", description: "Manage new files, ATLAS letter uploads, and statuses", icon: Mail, page: "lacw-portal", isExternal: true },
];

const menuItems = [
  { title: "Dashboard", icon: Package, href: "#" },
  { title: "Clients", icon: Users, href: "#" },
  { title: "Forms", icon: FileStack, href: "#" },
  { title: "Billing", icon: Receipt, href: "#" },
  { title: "Contacts", icon: Phone, href: "#" },
  { title: "Advice/Pre intake", icon: Clipboard, href: "#" },
  { title: "Compliance Check", icon: ShieldCheck, href: "#" },
  { title: "To Do", icon: CheckCircle2, href: "#" },
  { title: "Portal Tools", icon: Briefcase, href: "#portal-tools" },
];

export default function Home() {
  const [bundled, setBundled] = useState({});
  const [selectedPortalDate, setSelectedPortalDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("daily");
  const [googleClientId, setGoogleClientId] = useState(() => window.localStorage.getItem("aidPlannerGoogleClientId") || "");
  const [googleAccessToken, setGoogleAccessToken] = useState(() => window.sessionStorage.getItem("aidPlannerGoogleCalendarAccessToken") || "");
  const [googleCalendars, setGoogleCalendars] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("aidPlannerGoogleCalendars") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedGoogleCalendarId, setSelectedGoogleCalendarId] = useState(
    () => window.sessionStorage.getItem("aidPlannerGoogleSelectedCalendarId") || ""
  );
  const [outlookClientId, setOutlookClientId] = useState(() => window.localStorage.getItem("aidPlannerOutlookClientId") || "");
  const [outlookAccessToken, setOutlookAccessToken] = useState(() => window.sessionStorage.getItem("aidPlannerOutlookCalendarAccessToken") || "");
  const [outlookCalendars, setOutlookCalendars] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("aidPlannerOutlookCalendars") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedOutlookCalendarId, setSelectedOutlookCalendarId] = useState(
    () => window.sessionStorage.getItem("aidPlannerOutlookSelectedCalendarId") || ""
  );
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);
  const [connectorError, setConnectorError] = useState("");
  const [connectorStatus, setConnectorStatus] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard"); // dashboard, client-list, client-home, to-do
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [activeEventMenu, setActiveEventMenu] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [activeEventForVoice, setActiveEventForVoice] = useState(null);
  const [voiceContext, setVoiceContext] = useState("file-note"); // file-note, task
  const [activeFolder, setActiveFolder] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, stopped
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [globalTasks, setGlobalTasks] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("aidPortalGlobalTasks") || "[]");
    } catch {
      return [];
    }
  });

  const [taskToAllocate, setTaskToAllocate] = useState(null);
  const [taskToSchedule, setTaskToSchedule] = useState(null);
  const [allocationEmail, setAllocationEmail] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const saveGlobalTasks = (tasks) => {
    setGlobalTasks(tasks);
    window.localStorage.setItem("aidPortalGlobalTasks", JSON.stringify(tasks));
  };

  const missingCoreFields = useMemo(() => selectedMatter ? getMissingCoreFields(selectedMatter) : [], [selectedMatter]);

  const setMatterField = (field, value) => {
    setSelectedMatter(prev => {
      const next = { ...prev, matter: { ...prev.matter, [field]: value } };
      saveMatterToDevice(next);
      return next;
    });
  };

  const setFundingField = (field, value) => {
    setSelectedMatter(prev => {
      const next = { ...prev, funding: { ...prev.funding, [field]: value } };
      saveMatterToDevice(next);
      return next;
    });
  };

  const setAidField = (field, value) => {
    setSelectedMatter(prev => {
      const next = { ...prev, aid: { ...prev.aid, [field]: value } };
      saveMatterToDevice(next);
      return next;
    });
  };

  const handleAidLetterParsed = (parsed) => {
    setSelectedMatter(prev => {
      const next = { ...prev, ...parsed };
      saveMatterToDevice(next);
      return next;
    });
  };

  // Conflict Check Logic
  const [conflictFiles, setConflictFiles] = useState([]);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [extractedNames, setExtractedNames] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [scanError, setScanError] = useState("");

  const { data: conflictNames } = useQuery({
    queryKey: ["conflictNames"],
    queryFn: () => base44.entities.ConflictName.list("name", 500),
    initialData: [],
  });

  const handleConflictScan = async () => {
    if (conflictFiles.length === 0) return;
    setConflictLoading(true);
    setScanError("");
    try {
      const aggregatedExtracted = {
        victims: [],
        witnesses: [],
        other_parties: []
      };

      for (const file of conflictFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              victims: {
                type: "array",
                items: { type: "object", properties: { full_name: { type: "string" }, role: { type: "string" } } },
                description: "Victims mentioned in the document"
              },
              witnesses: {
                type: "array",
                items: { type: "object", properties: { full_name: { type: "string" }, role: { type: "string" } } },
                description: "Witnesses mentioned in the document"
              },
              other_parties: {
                type: "array",
                items: { type: "object", properties: { full_name: { type: "string" }, role: { type: "string" } } },
                description: "Other relevant parties (co-accused, informants, etc.)"
              }
            }
          }
        });

        if (result.status === "success" && result.output) {
          ["victims", "witnesses", "other_parties"].forEach(key => {
            (result.output[key] || []).forEach(newItem => {
              const exists = aggregatedExtracted[key].some(
                existing => (existing.full_name || "").toLowerCase() === (newItem.full_name || "").toLowerCase()
              );
              if (!exists) aggregatedExtracted[key].push(newItem);
            });
          });
        }
      }

      setExtractedNames(aggregatedExtracted);
      const allNames = [
        ...aggregatedExtracted.victims,
        ...aggregatedExtracted.witnesses,
        ...aggregatedExtracted.other_parties
      ];

      const foundConflicts = [];
      allNames.forEach((person) => {
        const nameLower = (person.full_name || "").toLowerCase().trim();
        const matches = (conflictNames || []).filter(cn => {
          const dbName = (cn.name || "").toLowerCase().trim();
          return dbName && nameLower && (
            dbName.includes(nameLower) || nameLower.includes(dbName)
          );
        });
        if (matches.length > 0) {
          foundConflicts.push({ name: person.full_name, role: person.role, matches });
        }
      });
      setConflicts(foundConflicts);
    } catch (err) {
      console.error("Conflict scan failed", err);
      setScanError(err instanceof Error ? err.message : "An unexpected error occurred during the conflict check.");
    } finally {
      setConflictLoading(false);
    }
  };

  const handleConflictReset = () => {
    setConflictFiles([]);
    setExtractedNames(null);
    setConflicts(null);
    setScanError("");
  };

  const handleAddConflictFiles = (e) => {
    const newFiles = Array.from(e.target.files);
    setConflictFiles(prev => [...prev, ...newFiles]);
  };

  const handleSaveConflictCheck = () => {
    if (!selectedMatter || !extractedNames || conflicts === null) return;
    
    const newCheck = {
      id: `check-${Date.now()}`,
      date: new Date().toISOString(),
      files: conflictFiles.map(f => f.name),
      extracted: extractedNames,
      conflicts: conflicts,
      performedBy: "Local Operator"
    };

    setSelectedMatter(prev => {
      const next = { 
        ...prev, 
        conflictChecks: [newCheck, ...(prev.conflictChecks || [])] 
      };
      saveMatterToDevice(next);
      return next;
    });
  };

  const allExtracted = extractedNames ? [
    ...(extractedNames.victims || []).map(p => ({ ...p, category: "Victim" })),
    ...(extractedNames.witnesses || []).map(p => ({ ...p, category: "Witness" })),
    ...(extractedNames.other_parties || []).map(p => ({ ...p, category: "Other Party" })),
  ] : [];

  const clientDailyEvents = useMemo(() => {
    if (!selectedMatter) return [];
    const today = new Date(selectedPortalDate || new Date());
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const clientName = (selectedMatter?.matter?.clientName || "").toLowerCase();
    
    const syncedEvents = calendarEvents.filter(event => {
      try {
        const startStr = event.start?.dateTime || event.start?.date;
        if (!startStr) return false;
        const start = new Date(startStr);
        const isSameDay = start >= today && start < tomorrow;
        const summary = (event.summary || "").toLowerCase();
        const matchesClient = clientName && (summary.includes(clientName) || (event.description || "").toLowerCase().includes(clientName));
        return isSameDay && matchesClient;
      } catch (e) { return false; }
    });

    const manualEvents = (selectedMatter?.manualEvents || []).filter(event => {
      try {
        const start = new Date(event.start?.dateTime || event.start?.date);
        const isToday = start >= today && start < tomorrow;
        return isToday;
      } catch (e) { return false; }
    });

    return [...syncedEvents, ...manualEvents].sort((a, b) => {
      try {
        const aTime = new Date(a.start?.dateTime || a.start?.date).getTime();
        const bTime = new Date(b.start?.dateTime || b.start?.date).getTime();
        return aTime - bTime;
      } catch (e) { return 0; }
    });
  }, [selectedMatter, calendarEvents, selectedPortalDate]);

  const formatDateISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedPortalDate),
    [selectedPortalDate]
  );

  const selectedDayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-AU", {
        weekday: "long",
      }).format(selectedPortalDate),
    [selectedPortalDate]
  );

  const selectedShortDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-AU", {
        day: "numeric",
        month: "short",
      }).format(selectedPortalDate),
    [selectedPortalDate]
  );

  const weekDates = useMemo(() => {
    const base = new Date(selectedPortalDate);
    const day = base.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    base.setDate(base.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, index) => {
      const next = new Date(base);
      next.setDate(base.getDate() + index);
      return next;
    });
  }, [selectedPortalDate]);

  const isSameDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const dayEvents = useMemo(() => {
    return calendarEvents.filter((e) => isSameDay(e.start, selectedPortalDate));
  }, [calendarEvents, selectedPortalDate]);

  React.useEffect(() => {
    let active = true;

    async function loadEvents() {
      if (!googleAccessToken && !outlookAccessToken) {
        setCalendarEvents([]);
        return;
      }

      setIsLoadingEvents(true);

      let start, end;
      if (calendarView === "daily") {
        start = formatDateISO(selectedPortalDate);
        end = formatDateISO(selectedPortalDate);
      } else if (calendarView === "weekly") {
        start = formatDateISO(weekDates[0]);
        end = formatDateISO(weekDates[6]);
      } else {
        const firstDay = new Date(selectedPortalDate.getFullYear(), selectedPortalDate.getMonth(), 1);
        const lastDay = new Date(selectedPortalDate.getFullYear(), selectedPortalDate.getMonth() + 1, 0);
        start = formatDateISO(firstDay);
        end = formatDateISO(lastDay);
      }

      try {
        let events = [];
        if (googleAccessToken && selectedGoogleCalendarId) {
          const gEvents = await listGoogleCalendarEvents(googleAccessToken, selectedGoogleCalendarId, start, end);
          events = [...events, ...gEvents.map((e) => ({
            id: e.id,
            summary: e.summary || "Busy",
            start: { dateTime: e.start.dateTime || e.start.date },
            end: { dateTime: e.end.dateTime || e.end.date },
            isAllDay: !e.start.dateTime,
            source: "google",
          }))];
        }

        if (outlookAccessToken && selectedOutlookCalendarId) {
          const oEvents = await listOutlookCalendarEvents(outlookAccessToken, selectedOutlookCalendarId, start, end);
          events = [...events, ...oEvents.map((e) => ({
            id: e.id,
            summary: e.subject || "Busy",
            start: { dateTime: e.start.dateTime + "Z" },
            end: { dateTime: e.end.dateTime + "Z" },
            isAllDay: e.isAllDay,
            source: "outlook",
          }))];
        }

        if (active) {
          setCalendarEvents(events);
        }
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        if (active) setIsLoadingEvents(false);
      }
    }

    loadEvents();
    return () => { active = false; };
  }, [calendarView, selectedPortalDate, weekDates, googleAccessToken, selectedGoogleCalendarId, outlookAccessToken, selectedOutlookCalendarId]);

  const handleConfirmImport = (adapter, selectedMatter) => {
    if (!selectedMatter) return;
    
    const mattersToImport = Array.isArray(selectedMatter) ? selectedMatter : [selectedMatter];
    let lastMatterId = "";

    mattersToImport.forEach((matter, idx) => {
      const newPlanner = createPlanner();
      const client = {
        ...newPlanner.client,
        ...matter.client,
        fullName: matter.client?.fullName || 
          [matter.client?.firstName, matter.client?.lastName].filter(Boolean).join(" "),
      };

      const importedPlanner = normalizePlanner({
        ...newPlanner,
        matterId: `matter-${Date.now()}-${idx}`,
        updatedAt: new Date().toISOString(),
        source: {
          type: "pms",
          provider: adapter.name,
          externalId: matter.externalId || "",
          actionstep: matter.actionstep || {},
        },
        client,
        matter: {
          ...newPlanner.matter,
          ...matter.matter,
        }
      });

      saveMatterToDevice(importedPlanner);
      lastMatterId = importedPlanner.matterId;
      if (mattersToImport.length === 1) {
        setSelectedMatter(importedPlanner);
      }
    });

    if (lastMatterId) {
      setLastOpenedMatterId(lastMatterId);
    }
    
    setImportModalOpen(false);
    
    if (Array.isArray(selectedMatter) && selectedMatter.length > 1) {
      setViewMode("client-list");
    } else {
      setViewMode("client-home");
    }
  };

  const localMatters = useMemo(() => listLocalMatters(), [viewMode, importModalOpen]);
  const actionstepClients = useMemo(() => {
    return localMatters.filter(m => m.source?.provider === "Actionstep");
  }, [localMatters]);

  const handleDeleteClient = (id) => {
    if (window.confirm("Are you sure you want to delete this client record? This only removes it from your local portal view.")) {
      deleteLocalMatter(id);
      setViewMode(v => v === "client-list" ? "client-list" : v);
    }
  };

  const handleOpenClient = (id) => {
    const raw = loadMatterFromDevice(id);
    if (raw) {
      const matter = normalizePlanner(raw);
      setSelectedMatter(matter);
      setViewMode("client-home");
    }
  };

  const persistGoogleConnection = (accessToken, calendars, selectedId) => {
    window.sessionStorage.setItem("aidPlannerGoogleCalendarAccessToken", accessToken);
    window.sessionStorage.setItem("aidPlannerGoogleCalendars", JSON.stringify(calendars));
    window.sessionStorage.setItem("aidPlannerGoogleSelectedCalendarId", selectedId || "");
  };

  const persistOutlookConnection = (accessToken, calendars, selectedId) => {
    window.sessionStorage.setItem("aidPlannerOutlookCalendarAccessToken", accessToken);
    window.sessionStorage.setItem("aidPlannerOutlookCalendars", JSON.stringify(calendars));
    window.sessionStorage.setItem("aidPlannerOutlookSelectedCalendarId", selectedId || "");
  };

  const handleBundle = (e, tool) => {
    e.preventDefault();
    e.stopPropagation();
    addToBundle(tool.title, `${tool.title} — ${tool.description}`);
    setBundled(b => ({ ...b, [tool.page]: true }));
    setTimeout(() => setBundled(b => ({ ...b, [tool.page]: false })), 1500);
  };

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    setConnectorError("");
    setConnectorStatus("");
    try {
      const accessToken = await requestGoogleCalendarAccessToken(googleClientId);
      const calendars = await listGoogleCalendars(accessToken);
      const selectedId = selectedGoogleCalendarId || calendars.find((item) => item.primary)?.id || calendars[0]?.id || "";
      setGoogleAccessToken(accessToken);
      setGoogleCalendars(calendars);
      setSelectedGoogleCalendarId(selectedId);
      window.localStorage.setItem("aidPlannerGoogleClientId", googleClientId);
      persistGoogleConnection(accessToken, calendars, selectedId);
      setConnectorStatus(`Google Calendar connected. ${calendars.length} calendar${calendars.length === 1 ? "" : "s"} ready for Aid Planner.`);
    } catch (error) {
      setConnectorError(error instanceof Error ? error.message : "Could not connect Google Calendar.");
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleOutlookConnect = async () => {
    setIsConnectingOutlook(true);
    setConnectorError("");
    setConnectorStatus("");
    try {
      const accessToken = await requestMicrosoftCalendarAccessToken(outlookClientId);
      const calendars = await listOutlookCalendars(accessToken);
      const selectedId = selectedOutlookCalendarId || calendars.find((item) => item.primary)?.id || calendars[0]?.id || "";
      setOutlookAccessToken(accessToken);
      setOutlookCalendars(calendars);
      setSelectedOutlookCalendarId(selectedId);
      window.localStorage.setItem("aidPlannerOutlookClientId", outlookClientId);
      persistOutlookConnection(accessToken, calendars, selectedId);
      setConnectorStatus(`Outlook Calendar connected. ${calendars.length} calendar${calendars.length === 1 ? "" : "s"} ready for Aid Planner.`);
    } catch (error) {
      setConnectorError(error instanceof Error ? error.message : "Could not connect Outlook Calendar.");
    } finally {
      setIsConnectingOutlook(false);
    }
  };

  const handleGoogleCalendarSelection = (value) => {
    setSelectedGoogleCalendarId(value);
    persistGoogleConnection(googleAccessToken, googleCalendars, value);
  };

  const handleOutlookCalendarSelection = (value) => {
    setSelectedOutlookCalendarId(value);
    persistOutlookConnection(outlookAccessToken, outlookCalendars, value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[10] shadow-sm">
        <div className="cursor-pointer" onClick={() => setViewMode("dashboard")}>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Law and Advocacy Centre for Women</h1>
          <p className="text-slate-500 text-sm mt-0.5">Staff Portal</p>
        </div>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6994d499f463deaf526b6d79/69214a516_lacw-logo-purple-150_logolacw.png"
          alt="LACW Logo"
          className="h-10 object-contain"
        />
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                <button
                    onClick={() => {
                      if (item.title === "Clients") setViewMode("client-list");
                      else if (item.title === "To Do") setViewMode("to-do");
                      else if (item.title === "Dashboard") setViewMode("dashboard");
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[13px]",
                      (item.title === "Clients" && viewMode === "client-list") || 
                      (item.title === "To Do" && viewMode === "to-do") ||
                      (item.title === "Dashboard" && viewMode === "dashboard")
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-200" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-purple-600"
                    )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </button>
                {item.title === "Clients" && viewMode === "client-list" && (
                  <div className="ml-9 mt-1 space-y-1 border-l border-slate-100 pl-3">
                    {["Search Client", "New Client", "Import Client", "Client List"].map((subItem) => (
                      <a
                        key={subItem}
                        href="#"
                        onClick={(e) => {
                          if (subItem === "Import Client") {
                            e.preventDefault();
                            setImportModalOpen(true);
                          }
                        }}
                        className="block px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                      >
                        {subItem}
                      </a>
                    ))}
                  </div>
                )}
                {item.title === "Portal Tools" && (
                  <div className="ml-9 mt-1 space-y-1 border-l border-slate-100 pl-3">
                    {tools.map((tool) => (
                      <a
                        key={tool.page}
                        href={tool.isExternal ? "/lacw-portal" : createPageUrl(tool.page)}
                        className="block px-3 py-1.5 text-xs font-medium text-slate-500 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        {tool.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
          {viewMode === "to-do" ? (
            <div className="max-w-4xl mx-auto space-y-6 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Task Management</h2>
                  <p className="text-sm text-slate-500">Capture and organize your upcoming actions</p>
                </div>
                <button 
                  onClick={() => {
                    setVoiceModalOpen(true);
                    setVoiceContext("task");
                    setRecordingStatus("idle");
                    setVoiceTranscript("");
                  }}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
                >
                  <Mic className="w-5 h-5" />
                  Record New Task
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {globalTasks.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <ClipboardList className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Your To-Do List is Empty</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Use the microphone above to record tasks. They will be automatically transcribed and saved here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {globalTasks.map((task, idx) => (
                      <div key={task.id} className="p-6 flex flex-col gap-4 hover:bg-slate-50 transition-all group">
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox" 
                            checked={task.completed}
                            onChange={(e) => {
                              const next = [...globalTasks];
                              next[idx].completed = e.target.checked;
                              if (e.target.checked) next[idx].status = "Completed";
                              saveGlobalTasks(next);
                            }}
                            className="mt-1 h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className={cn("font-bold text-slate-900", task.completed && "text-slate-400 line-through")}>
                                {task.title}
                              </p>
                              <Badge variant={task.status === "Pending" ? "warning" : task.status === "Completed" ? "success" : "secondary"} className={cn("text-[10px] px-2 py-0", task.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" : task.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                                {task.status || "Not Actioned"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span>Added {new Date(task.date).toLocaleDateString()}</span>
                              {task.assignedTo && <span className="flex items-center gap-1 text-purple-600 font-medium"><Mail className="w-3 h-3" /> Allocated to {task.assignedTo}</span>}
                              {task.scheduledDate && <span className="flex items-center gap-1 text-amber-600 font-medium"><CalendarIcon className="w-3 h-3" /> Scheduled for {new Date(task.scheduledDate).toLocaleDateString()}</span>}
                              {task.attachments?.length > 0 && <span className="flex items-center gap-1 text-blue-600 font-medium"><Paperclip className="w-3 h-3" /> {task.attachments.length} Document(s)</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => { setTaskToAllocate(task.id); setAllocationEmail(task.assignedTo || ""); }}
                              title="Allocate Task"
                              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setTaskToSchedule(task.id); setScheduleDate(task.scheduledDate || ""); }}
                              title="Schedule Task"
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <CalendarIcon className="w-4 h-4" />
                            </button>
                            <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                              <Paperclip className="w-4 h-4" />
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const next = [...globalTasks];
                                    if (!next[idx].attachments) next[idx].attachments = [];
                                    next[idx].attachments.push({ name: file.name, date: new Date().toISOString() });
                                    saveGlobalTasks(next);
                                  }
                                }}
                              />
                            </label>
                            <button 
                              onClick={() => {
                                if (window.confirm("Remove this task?")) {
                                  saveGlobalTasks(globalTasks.filter((_, i) => i !== idx));
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Modals for Allocation and Scheduling */}
                        {taskToAllocate === task.id && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="ml-9 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex gap-3 items-center">
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2">Allocate to Email</p>
                              <input 
                                value={allocationEmail}
                                onChange={(e) => setAllocationEmail(e.target.value)}
                                placeholder="Enter email address..."
                                className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div className="flex gap-2 pt-5">
                              <button 
                                onClick={() => {
                                  const next = [...globalTasks];
                                  next[idx].assignedTo = allocationEmail;
                                  next[idx].status = "Pending";
                                  saveGlobalTasks(next);
                                  setTaskToAllocate(null);
                                }}
                                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                              >
                                Save
                              </button>
                              <button onClick={() => setTaskToAllocate(null)} className="bg-white text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">Cancel</button>
                            </div>
                          </motion.div>
                        )}

                        {taskToSchedule === task.id && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="ml-9 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-center">
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Schedule Action Date</p>
                              <input 
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div className="flex gap-2 pt-5">
                              <button 
                                onClick={() => {
                                  const next = [...globalTasks];
                                  next[idx].scheduledDate = scheduleDate;
                                  next[idx].status = "Pending";
                                  saveGlobalTasks(next);
                                  setTaskToSchedule(null);
                                }}
                                className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                              >
                                Save
                              </button>
                              <button onClick={() => setTaskToSchedule(null)} className="bg-white text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">Cancel</button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === "client-home" && selectedMatter ? (
            <motion.section
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setViewMode("client-list")}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedMatter.client?.fullName || "Unnamed Client"}</h2>
                      <p className="text-slate-500 text-sm">Matter Home Screen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setLastOpenedMatterId(selectedMatter.matterId);
                        window.location.href = createPageUrl("AidPlanner");
                      }}
                      className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Open Aid Planner
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Details and Folders */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Matter Details Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          Matter Details
                        </h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Name</p>
                          <p className="text-sm font-medium text-slate-900">{selectedMatter.client?.fullName || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                          <input 
                            type="text" 
                            value={selectedMatter.client?.dateOfBirth || ""} 
                            onChange={(e) => setMatterField("dateOfBirth", e.target.value)}
                            placeholder="e.g. 01/01/1990"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matter Type</p>
                          <p className="text-sm font-medium text-slate-900">
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                              {selectedMatter.matter?.matterType || "Unassigned"}
                            </span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Head Charge</p>
                          <input 
                            type="text" 
                            value={selectedMatter.matter?.headCharge || ""} 
                            onChange={(e) => setMatterField("headCharge", e.target.value)}
                            placeholder="Enter primary charge"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Listing</p>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedMatter.matter?.nextAppearanceDate ? 
                              new Date(selectedMatter.matter.nextAppearanceDate).toLocaleDateString("en-AU", { day: 'numeric', month: 'long', year: 'numeric' }) 
                              : "No date set"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listing Type</p>
                          <p className="text-sm font-medium text-slate-900">
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                              {selectedMatter.matter?.appearanceType || "Unassigned"}
                            </span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                          <p className="text-sm font-medium text-slate-900">{selectedMatter.matter?.court || "No location specified"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custody</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => setMatterField("isCustody", true)}
                              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMatter.matter?.isCustody ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setMatterField("isCustody", false)}
                              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${!selectedMatter.matter?.isCustody ? "bg-slate-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aid Details Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-purple-600" />
                          Aid Details
                        </h3>
                      </div>
                      <div className="p-1">
                        <MinimumInfoForm
                          planner={selectedMatter}
                          missingCoreFields={missingCoreFields}
                          showAdvanced={showAdvanced}
                          onToggleAdvanced={setShowAdvanced}
                          setMatterField={setMatterField}
                          setFundingField={setFundingField}
                          setAidField={setAidField}
                          onAidLetterParsed={handleAidLetterParsed}
                        />
                      </div>
                    </div>

                    {/* Conflict Check Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          Conflict of Interest Check
                        </h3>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Upload document to scan</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or Image (Police brief, fact sheet, etc.)</p>
                          </div>
                          <input 
                            type="file" 
                            multiple
                            className="hidden" 
                            id="conflict-upload"
                            onChange={(e) => setConflictFiles(Array.from(e.target.files))}
                          />
                          <button 
                            onClick={() => document.getElementById("conflict-upload").click()}
                            className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4 text-purple-600" />
                            Upload Documents
                          </button>
                        </div>
                        {conflictFiles.length > 0 && (
                          <button
                            onClick={handleConflictScan}
                            disabled={conflictLoading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 disabled:bg-slate-300 transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            {conflictLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Scanning...</> : <><Shield className="w-4 h-4" />Run Multi-File Check</>}
                          </button>
                        )}
                        {conflicts !== null && (
                          <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
                            <p className="text-sm font-bold text-amber-900">{conflicts.length === 0 ? "No conflicts detected." : `${conflicts.length} Potential Conflicts Found`}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Matter Documents / Folders Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <Folder className="w-4 h-4 text-purple-600" />
                          <h3 className="font-bold text-slate-900 text-sm">
                            {activeFolder ? (
                              <button onClick={() => setActiveFolder(null)} className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                                Matter Documents <span className="text-slate-300">/</span> {activeFolder}
                              </button>
                            ) : "Matter Documents"}
                          </h3>
                        </div>
                        {activeFolder && (
                          <button onClick={() => setActiveFolder(null)} className="text-xs font-bold text-purple-600 hover:underline">Back to Folders</button>
                        )}
                      </div>
                      <div className="p-6">
                        {!activeFolder ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(selectedMatter.folders || {}).map(([folderName, files]) => (
                              <div 
                                key={folderName}
                                onClick={() => setActiveFolder(folderName)}
                                className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all cursor-pointer"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm group-hover:border-purple-200">
                                    <Folder className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const fileName = window.prompt(`Enter file name for ${folderName}:`);
                                      if (fileName) {
                                        const next = { ...selectedMatter };
                                        if (!next.folders) next.folders = {};
                                        next.folders[folderName] = [...(next.folders[folderName] || []), { name: fileName, date: new Date().toISOString(), type: "file" }];
                                        saveMatterToDevice(next);
                                        setSelectedMatter({ ...next });
                                      }
                                    }}
                                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-purple-600 transition-all"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm truncate">{folderName}</h4>
                                <p className="text-[10px] text-slate-500 mt-1">{(files || []).length} items</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(selectedMatter.folders?.[activeFolder] || []).length === 0 ? (
                              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                <FileIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-400 italic">This folder is empty</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {(selectedMatter.folders?.[activeFolder] || []).map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="p-2 rounded-lg bg-white border border-slate-50">
                                        <FileIcon className="w-4 h-4 text-purple-400" />
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(file.date).toLocaleDateString("en-AU")}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setPreviewFile(file)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-purple-600 transition-all"><Eye className="w-4 h-4" /></button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (window.confirm(`Delete "${file.name}"?`)) {
                                            const next = { ...selectedMatter };
                                            next.folders[activeFolder] = next.folders[activeFolder].filter((_, i) => i !== idx);
                                            saveMatterToDevice(next);
                                            setSelectedMatter({ ...next });
                                          }
                                        }}
                                        className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tasks & Schedule */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-purple-600" />
                          Tasks to Action
                        </h3>
                      </div>
                      <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {(!selectedMatter.tasks || selectedMatter.tasks.length === 0) ? (
                          <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                            <ClipboardList className="w-5 h-5 text-slate-300" />
                            <p className="text-xs text-slate-400">No tasks for this matter yet.</p>
                          </div>
                        ) : (
                          selectedMatter.tasks.map((task, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
                              <input 
                                type="checkbox" 
                                checked={task.completed} 
                                onChange={(e) => {
                                  const next = { ...selectedMatter };
                                  next.tasks[idx].completed = e.target.checked;
                                  saveMatterToDevice(next);
                                  setSelectedMatter({ ...next });
                                }}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-purple-600 cursor-pointer" 
                              />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{task.title}</p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete task?`)) {
                                    const next = { ...selectedMatter };
                                    next.tasks = next.tasks.filter((_, i) => i !== idx);
                                    saveMatterToDevice(next);
                                    setSelectedMatter({ ...next });
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                        <button 
                          onClick={() => {
                            const title = window.prompt("Enter task description:");
                            if (title) {
                              const next = { ...selectedMatter };
                              next.tasks = [...(next.tasks || []), { title, completed: false, id: crypto.randomUUID() }];
                              saveMatterToDevice(next);
                              setSelectedMatter({ ...next });
                            }
                          }}
                          className="w-full py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg border border-dashed border-purple-200 transition-all"
                        >+ Add New Task</button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
                      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-purple-600" />
                          Client Schedule
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {clientDailyEvents.length === 0 ? (
                          <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                            <CalendarDays className="w-5 h-5 text-slate-200" />
                            <p className="text-[11px] text-slate-400">No entries for today.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {clientDailyEvents.map((event, idx) => (
                              <div key={idx} className="relative p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center justify-center border-r border-slate-200 pr-4 min-w-[70px]">
                                    <span className="text-[10px] font-bold text-slate-900">
                                      {new Date(event.start?.dateTime || event.start?.date).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })}
                                    </span>
                                  </div>
                                  <div className="flex-1 overflow-hidden pr-8">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-slate-900 truncate">{event.summary}</p>
                                      {event.isManual && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm("Delete manual entry?")) {
                                              const next = { ...selectedMatter };
                                              next.manualEvents = (next.manualEvents || []).filter(me => me.id !== event.id);
                                              saveMatterToDevice(next);
                                              setSelectedMatter({ ...next });
                                            }
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded transition-all"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <button onClick={() => {
                                    setActiveEventMenu(activeEventMenu === (event.id || idx) ? null : (event.id || idx));
                                  }} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 transition-all shadow-sm">
                                    <Plus className={cn("w-3.5 h-3.5 transition-transform", activeEventMenu === (event.id || idx) && "rotate-45")} />
                                  </button>
                                  {activeEventMenu === (event.id || idx) && (
                                    <div className="absolute top-8 right-0 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-20 py-1.5 overflow-hidden">
                                      <button onClick={() => {
                                        setVoiceModalOpen(true);
                                        setActiveEventForVoice(event);
                                        setVoiceContext("file-note");
                                        setRecordingStatus("idle");
                                        setVoiceTranscript("");
                                        setActiveEventMenu(null);
                                      }} className="w-full px-4 py-2 text-left text-[11px] font-medium text-slate-700 hover:bg-purple-50 flex items-center gap-2 transition-colors">
                                        <Mic className="w-3.5 h-3.5" />Add Voice Memo
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input id="quick-add-summary" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Plea - MMC" />
                            <button onClick={() => {
                              const summary = document.getElementById("quick-add-summary").value;
                              if (summary) {
                                const next = { ...selectedMatter };
                                const eventDate = new Date(selectedPortalDate);
                                eventDate.setHours(12, 0, 0, 0);
                                const newEvent = { id: `manual-${Date.now()}`, summary, start: { dateTime: eventDate.toISOString() }, isManual: true };
                                next.manualEvents = [...(next.manualEvents || []), newEvent];
                                saveMatterToDevice(next);
                                setSelectedMatter({ ...next });
                                document.getElementById("quick-add-summary").value = "";
                              }
                            }} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-all">Add</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : viewMode === "client-list" ? (
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 p-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><UsersIcon className="w-7 h-7 text-purple-600" />Imported Clients</h2>
                    <p className="text-slate-500 mt-1">Showing all clients imported from Actionstep and other programs.</p>
                  </div>
                  <button onClick={() => setImportModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />Import New Client
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Client Name</th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">File Reference</th>
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {actionstepClients.length === 0 ? (
                          <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500">No imported clients found.</td></tr>
                        ) : (
                          actionstepClients.map((matter) => (
                            <tr key={matter.matterId} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleOpenClient(matter.matterId)}>
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{matter.client?.fullName || "Unnamed Client"}</p>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{matter.client?.fileNumber || matter.source?.externalId || "N/A"}</td>
                              <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleOpenClient(matter.matterId)} className="p-2 text-slate-400 hover:text-purple-600 transition-all"><Eye className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteClient(matter.matterId)} className="p-2 text-slate-400 hover:text-rose-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.section>
            ) : (
              <>
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-purple-700" /></div>
                        <h2 className="text-2xl font-bold text-slate-900">Portal Calendar</h2>
                      </div>
                      <p className="text-slate-500 text-sm md:text-base max-w-xl">Manage your schedule and workflows.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setCalendarView("daily")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${calendarView === "daily" ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Daily</button>
                    <button onClick={() => setCalendarView("weekly")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${calendarView === "weekly" ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Weekly</button>
                    <button onClick={() => setCalendarView("monthly")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${calendarView === "monthly" ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Monthly</button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
                    <div className="min-h-[400px]">
                      {calendarView === "monthly" ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 h-full">
                          <Calendar mode="single" selected={selectedPortalDate} onSelect={(date) => date && setSelectedPortalDate(date)} className="w-full" />
                        </div>
                      ) : calendarView === "weekly" ? (
                        <div className="grid grid-cols-7 gap-3 h-full">
                          {weekDates.map((date) => (
                            <button key={date.toISOString()} onClick={() => setSelectedPortalDate(date)} className={`rounded-xl border p-4 text-center transition-colors flex flex-col justify-center items-center h-full ${isSameDay(date, selectedPortalDate) ? "border-purple-300 bg-purple-50 text-purple-900 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50"}`}>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-2">{new Intl.DateTimeFormat("en-AU", { weekday: "short" }).format(date)}</p>
                              <p className={`text-3xl font-bold mb-1 ${isSameDay(date, selectedPortalDate) ? "text-purple-700" : "text-slate-800"}`}>{new Intl.DateTimeFormat("en-AU", { day: "numeric" }).format(date)}</p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-inner h-full min-h-[400px]">
                          <div className="flex items-center justify-between mb-8">
                            <button onClick={() => setSelectedPortalDate(new Date(selectedPortalDate.setDate(selectedPortalDate.getDate() - 1)))} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 transition-all shadow-sm"><ChevronLeft className="w-6 h-6" /></button>
                            <div className="text-center flex-1 px-4">
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-1">{new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(selectedPortalDate)}</p>
                              <p className="text-4xl font-bold text-slate-900 mb-1 tracking-tight">{new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long" }).format(selectedPortalDate)}</p>
                              <p className="text-sm text-slate-500 font-medium">{selectedPortalDate.getFullYear()}</p>
                            </div>
                            <button onClick={() => setSelectedPortalDate(new Date(selectedPortalDate.setDate(selectedPortalDate.getDate() + 1)))} className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 transition-all shadow-sm"><ChevronRight className="w-6 h-6" /></button>
                          </div>
                          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-y-auto">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-purple-600" />Schedule for the day</h3>
                            {isLoadingEvents ? <p className="text-sm text-slate-500 text-center py-8">Loading schedule...</p> : dayEvents.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No events scheduled for this day.</p> : (
                              <div className="space-y-3">
                                {dayEvents.map((evt, idx) => (
                                  <div key={idx} className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-purple-200 transition-colors">
                                    <div className="w-16 flex-shrink-0 text-right"><p className="text-sm font-bold text-slate-700">{evt.isAllDay ? "All Day" : new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(evt.start)}</p></div>
                                    <div className="w-1 bg-purple-200 rounded-full" />
                                    <div><p className="text-sm font-semibold text-slate-900">{evt.summary}</p></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1.5">Selected date</p>
                        <p className="text-base font-semibold text-slate-900">{selectedDateLabel}</p>
                        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {dayEvents.map((evt, idx) => (
                            <div key={idx} className="text-sm bg-white border border-slate-200 rounded-md p-2 shadow-sm">
                              <p className="font-semibold text-slate-800 truncate" title={evt.summary}>{evt.summary}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{evt.isAllDay ? "All Day" : new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(evt.start)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <a href={createPageUrl("AidPlanner")} className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 text-purple-900 hover:bg-purple-100 transition-colors group shadow-sm">
                        <div><p className="font-bold text-base">Open Aid Planner</p><p className="text-sm text-purple-700/80 mt-0.5">Manage matter funding and listings.</p></div>
                        <ChevronRight className="h-5 w-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                      </a>
                    </div>
                  </div>
                </motion.section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Calendar Integration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%202020%29.svg" className="w-5 h-5" alt="Google Calendar" />Google Calendar</p>
                      <input value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm mb-3 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Google OAuth client ID" />
                      <button onClick={handleGoogleConnect} className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-purple-50 transition-colors shadow-sm">{googleAccessToken ? "Reconnect Google" : "Connect Google"}</button>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%202018%E2%80%93present%29.svg" className="w-5 h-5" alt="Outlook Calendar" />Outlook Calendar</p>
                      <input value={outlookClientId} onChange={(e) => setOutlookClientId(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm mb-3 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Microsoft OAuth client ID" />
                      <button onClick={handleOutlookConnect} className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-purple-50 transition-colors shadow-sm">{outlookAccessToken ? "Reconnect Outlook" : "Connect Outlook"}</button>
                    </div>
                  </div>
                </section>
              </>
            )}
            </div>

            <footer className="pt-8 pb-12 text-center text-slate-400 text-xs space-y-1.5 border-t border-slate-200/60 mt-8">
              <p>RMIT Building 152, Level 1 · 147-155 Pelham Street, Carlton, Vic 3053</p>
              <p>Tel 03 9448 8930 · 0415 330 198 · Fax 03 9923 6669</p>
              <a href="https://www.lacw.org.au" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-600 transition-colors font-medium">www.lacw.org.au</a>
            </footer>
        </main>
      </div>

      <PracticeManagerImportModal open={importModalOpen} onOpenChange={setImportModalOpen} adapters={practiceManagerAdapters} onConfirmAdapter={handleConfirmImport} />
      
      {/* Voice Memo Modal */}
      {voiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", recordingStatus === "recording" ? "bg-red-50 text-red-600 animate-pulse" : isPolishing ? "bg-amber-50 text-amber-600 animate-spin" : "bg-purple-50 text-purple-600")}>
                    {isPolishing ? <Loader2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{isPolishing ? "AI Polishing..." : "Voice Memo"}</h3>
                </div>
                <button onClick={() => { if (speechRecognition) speechRecognition.stop(); setVoiceModalOpen(false); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><Plus className="w-5 h-5 rotate-45" /></button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-6 min-h-[160px] border border-slate-100 flex flex-col items-center justify-center text-center">
                {recordingStatus === "idle" ? <p className="text-slate-400 text-sm italic">Ready to record...</p> : recordingStatus === "recording" ? (
                  <div className="space-y-4 w-full"><div className="flex justify-center gap-1">{[1,2,3,4,5].map(i => (<div key={i} className="w-1.5 h-8 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />))}</div><p className="text-slate-900 font-medium">Recording in progress...</p></div>
                ) : isPolishing ? <p className="text-slate-900 font-medium">Emma AI is cleaning up your note...</p> : <div className="text-left w-full space-y-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transcription Result</p><p className="text-slate-900 text-sm leading-relaxed">"{voiceTranscript || "No speech detected"}"</p></div>}
              </div>

              {recordingStatus === "idle" ? (
                <button onClick={() => {
                  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                  const rec = new SpeechRecognition();
                  rec.lang = 'en-AU'; rec.continuous = true; rec.interimResults = true;
                  rec.onstart = () => setRecordingStatus("recording");
                  rec.onresult = (event) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) { if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript; }
                    if (finalTranscript) setVoiceTranscript(prev => prev + ' ' + finalTranscript);
                  };
                  rec.onend = () => setRecordingStatus("stopped");
                  rec.start(); setSpeechRecognition(rec);
                }} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"><Mic className="w-5 h-5" />Start Recording</button>
              ) : recordingStatus === "recording" ? (
                <button onClick={() => { speechRecognition.stop(); setRecordingStatus("stopped"); }} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"><div className="w-3 h-3 bg-white rounded-sm" />Stop Recording</button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => {
                    if (voiceContext === "task") {
                      const newTask = { 
                        id: Date.now().toString(), 
                        title: voiceTranscript.trim(), 
                        completed: false,
                        date: new Date().toISOString(),
                        status: "Not Actioned",
                        assignedTo: null,
                        scheduledDate: null,
                        attachments: []
                      };
                      saveGlobalTasks([newTask, ...globalTasks]);
                    } else {
                      const next = { ...selectedMatter };
                      const folder = "File Notes";
                      if (!next.folders) next.folders = {};
                      const clientName = next.matter?.clientName || "Unknown Client";
                      const hearingType = activeEventForVoice?.summary || "General Note";
                      const hearingDate = activeEventForVoice?.start?.dateTime || activeEventForVoice?.start?.date || new Date().toISOString();
                      const formattedDate = new Date(hearingDate).toLocaleDateString("en-AU", { day: 'numeric', month: 'long', year: 'numeric' });
                      
                      const structuredContent = `FILE NOTE\n-------------------------\nCLIENT: ${clientName}\nHEARING: ${hearingType}\nDATE: ${formattedDate}\nTIME: ${new Date().toLocaleTimeString()}\n-------------------------\n\nNOTES:\n${voiceTranscript}\n\n-------------------------\nGenerated by Emma AI Voice Note system`.trim();

                      next.folders[folder] = [...(next.folders[folder] || []), { 
                        name: `File Note - ${hearingType} - ${new Date().toLocaleDateString()}`, 
                        content: structuredContent, 
                        date: new Date().toISOString(), 
                        type: "voice-note",
                        metadata: {
                          clientName,
                          hearingType,
                          date: hearingDate
                        }
                      }];
                      saveMatterToDevice(next); setSelectedMatter({ ...next });
                    }
                    setVoiceModalOpen(false);
                  }} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all group">
                    <FileEdit className="w-5 h-5 text-slate-400 group-hover:text-purple-600 mb-2" />
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-purple-900">Generate {voiceContext === "task" ? "Task" : "File Note"}</span>
                  </button>
                  <button onClick={() => setVoiceModalOpen(false)} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all group">
                    <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-purple-900">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><FileText className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-slate-900">{previewFile.name}</h3>
                </div>
                <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><Plus className="w-5 h-5 rotate-45" /></button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-8 min-h-[300px] max-h-[500px] overflow-y-auto border border-slate-100 font-mono text-sm whitespace-pre-wrap text-slate-700">
                {previewFile.content || "No content."}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    disabled={isPolishing}
                    onClick={async () => {
                      try {
                        setIsPolishing(true);
                        const cleaned = await base44.integrations.Core.InvokeLLM({ prompt: `Clean up this legal file note: ${previewFile.content}` });
                        const next = { ...selectedMatter };
                        Object.keys(next.folders || {}).forEach(folderName => {
                          next.folders[folderName] = next.folders[folderName].map(f => (f.name === previewFile.name && f.date === previewFile.date) ? { ...f, content: cleaned } : f);
                        });
                        saveMatterToDevice(next); setSelectedMatter({ ...next }); setPreviewFile(prev => ({ ...prev, content: cleaned })); setIsPolishing(false);
                      } catch (err) { console.error(err); setIsPolishing(false); }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600"
                  >
                    {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI Polish✨
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                    <Printer className="w-3.5 h-3.5" />
                    Print Note
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in New Tab
                  </button>
                </div>
                <button onClick={() => setPreviewFile(null)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Close</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
