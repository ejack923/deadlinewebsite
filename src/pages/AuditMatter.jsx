import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuditChecklist from "@/components/audit/AuditChecklist";
import AuditEvidence from "@/components/audit/AuditEvidence";
import AuditFindings from "@/components/audit/AuditFindings";
import AuditScoreCard from "@/components/audit/AuditScoreCard";
import AuditSummary from "@/components/audit/AuditSummary";
import AuditTimeline from "@/components/audit/AuditTimeline";
import { auditFetch } from "@/lib/auditApi";

const tabs = ["Overview", "Timeline", "Checklist", "Evidence", "Findings", "Summary"];

export default function AuditMatter() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const audit = data?.audit || {};
  const checklist = data?.checklist || [];
  const findings = data?.findings || [];
  const timeline = data?.timeline || [];
  const documents = data?.documents || [];
  const evidenceMatches = data?.evidenceMatches || [];
  const sources = data?.sources || [];
  const completedItems = useMemo(() => checklist.filter((item) => item.completed).length, [checklist]);

  const loadAudit = async () => {
    setError("");
    try {
      const payload = await auditFetch(`/api/audits/${id}`);
      setData(payload);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [id]);

  const runMutation = async (callback) => {
    setIsSaving(true);
    setError("");
    try {
      await callback();
      await loadAudit();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChecklist = (checklistKey, completed) => runMutation(() =>
    auditFetch(`/api/audits/${id}/checklist`, {
      method: "POST",
      body: JSON.stringify({ checklistKey, completed }),
    })
  );

  const addFinding = (payload) => runMutation(() =>
    auditFetch(`/api/audits/${id}/findings`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );

  const addTimelineEvent = (payload) => runMutation(() =>
    auditFetch(`/api/audits/${id}/timeline`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );

  const uploadFiles = (files) => runMutation(async () => {
    for (const file of files) {
      const uploadName = file.webkitRelativePath || file.name;
      await auditFetch(`/api/audits/${id}/documents/raw?fileName=${encodeURIComponent(uploadName)}`, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
        parseJson: true,
      });
    }
  });

  const applyEvidenceMatches = () => runMutation(async () => {
    const keys = [...new Set(evidenceMatches.map((match) => match.checklistKey))];
    for (const checklistKey of keys) {
      await auditFetch(`/api/audits/${id}/checklist`, {
        method: "POST",
        body: JSON.stringify({ checklistKey, completed: true }),
      });
    }
  });

  const updateTimelineEvent = (eventId, payload) => runMutation(() =>
    auditFetch(`/api/audits/${id}/timeline/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  );

  const deleteTimelineEvent = (eventId) => runMutation(() =>
    auditFetch(`/api/audits/${id}/timeline/${eventId}`, { method: "DELETE" })
  );

  const generateSummary = () => runMutation(() =>
    auditFetch(`/api/audits/${id}/generate-summary`, { method: "POST", body: "{}" })
  );

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 p-6 text-slate-600">Loading audit...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/AuditDashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to audits
        </Link>

        {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

        <header className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">Matter {audit.matterId}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">{audit.clientName || "Audit matter"}</h1>
            <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div><dt className="font-medium text-slate-500">Auditor</dt><dd className="mt-1 text-slate-950">{audit.auditor || "-"}</dd></div>
              <div><dt className="font-medium text-slate-500">Audit Date</dt><dd className="mt-1 text-slate-950">{audit.auditDate || "-"}</dd></div>
              <div><dt className="font-medium text-slate-500">Open Findings</dt><dd className="mt-1 text-slate-950">{findings.filter((finding) => finding.status === "Open").length}</dd></div>
            </dl>
          </section>
          <AuditScoreCard score={audit.score} status={audit.status} totalItems={checklist.length} completedItems={completedItems} />
        </header>

        <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-h-11 whitespace-nowrap border-b-2 px-4 text-sm font-medium ${activeTab === tab ? "border-slate-950 text-slate-950" : "border-transparent text-slate-500 hover:text-slate-950"}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="mt-6">
          {activeTab === "Overview" && (
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <h2 className="text-base font-semibold">Compliance snapshot</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-4"><p className="text-sm text-slate-500">Checklist</p><p className="mt-1 text-xl font-semibold">{completedItems}/{checklist.length}</p></div>
                  <div className="rounded-md bg-slate-50 p-4"><p className="text-sm text-slate-500">Findings</p><p className="mt-1 text-xl font-semibold">{findings.length}</p></div>
                  <div className="rounded-md bg-slate-50 p-4"><p className="text-sm text-slate-500">Evidence</p><p className="mt-1 text-xl font-semibold">{evidenceMatches.length}</p></div>
                </div>
              </section>
              <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">Recent findings</h2>
                <div className="mt-3 grid gap-2">
                  {findings.slice(0, 4).map((finding) => <p key={finding.id} className="text-sm text-slate-700">{finding.finding}</p>)}
                  {findings.length === 0 && <p className="text-sm text-slate-500">No findings recorded.</p>}
                </div>
              </section>
              <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
                <h2 className="text-base font-semibold">Source documents considered</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {sources.map((source) => (
                    <article key={source.key} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold text-slate-950">{source.title}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">{source.version}</p>
                      <p className="mt-2 text-sm text-slate-700">{source.focus}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
          {activeTab === "Timeline" && <AuditTimeline timeline={timeline} onAddEvent={addTimelineEvent} onUpdateEvent={updateTimelineEvent} onDeleteEvent={deleteTimelineEvent} isSaving={isSaving} />}
          {activeTab === "Checklist" && <AuditChecklist checklist={checklist} onToggle={toggleChecklist} isSaving={isSaving} />}
          {activeTab === "Evidence" && <AuditEvidence documents={documents} evidenceMatches={evidenceMatches} checklist={checklist} onUploadFiles={uploadFiles} onApplyMatches={applyEvidenceMatches} isSaving={isSaving} />}
          {activeTab === "Findings" && <AuditFindings findings={findings} onAddFinding={addFinding} isSaving={isSaving} />}
          {activeTab === "Summary" && <AuditSummary audit={audit} sources={sources} onGenerateSummary={generateSummary} isSaving={isSaving} />}
        </section>
      </div>
    </main>
  );
}
