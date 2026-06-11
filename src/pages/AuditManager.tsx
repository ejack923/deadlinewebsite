import { Download, FileDown, Plus, Printer, Save, Search, Trash2, ArrowUp, ArrowDown, ClipboardCheck } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  actionPriorities,
  actionStatuses,
  activityTypes,
  aidEligibilityItems,
  auditOutcomes,
  createEmptyAuditManagerData,
  ensureAuditManagerData,
  itemStatuses,
  matterTypes,
  timelineStatuses,
  validateAudit,
  yesNo,
  yesNoPartial,
  type AuditManagerData,
  type AuditManagerSummary,
} from "@/lib/auditManagerSchema";
import {
  auditManagerExportUrl,
  getAuditManagerAudit,
  listAuditManagerAudits,
  saveAuditManagerAudit,
} from "@/lib/auditManagerApi";

const rowId = () => Math.random().toString(36).slice(2, 10);

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100", props.className)} />;
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; emptyLabel?: string }) {
  const { options, emptyLabel = "Select", ...selectProps } = props;
  return (
    <select {...selectProps} className={cx("h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100", props.className)}>
      <option value="">{emptyLabel}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx("min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100", props.className)} />;
}

function Section({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function IconButton({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      type={props.type || "button"}
      title={label}
      aria-label={label}
      className={cx("inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40", props.className)}
    >
      {children}
    </button>
  );
}

export default function AuditManager() {
  const [audits, setAudits] = useState<AuditManagerSummary[]>([]);
  const [firms, setFirms] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [firmFilter, setFirmFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [auditId, setAuditId] = useState<number | null>(null);
  const [data, setData] = useState<AuditManagerData>(() => createEmptyAuditManagerData());
  const [saveState, setSaveState] = useState("Not saved");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autosaveReady = useRef(false);

  const completionErrors = useMemo(() => validateAudit(data, true), [data]);

  const loadAudits = async () => {
    const payload = await listAuditManagerAudits({ q: query, firm: firmFilter, status: statusFilter });
    setAudits(payload.audits || []);
    setFirms(payload.firms || []);
  };

  useEffect(() => {
    loadAudits().catch((error) => setErrors([error.message]));
  }, [query, firmFilter, statusFilter]);

  useEffect(() => {
    if (!autosaveReady.current) {
      autosaveReady.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      persist("Draft", true).catch((error) => setErrors([error.message]));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [data]);

  const patch = (next: (draft: AuditManagerData) => AuditManagerData) => {
    setData((current) => next(structuredClone(current)));
    setSaveState("Unsaved changes");
  };

  const persist = async (status: "Draft" | "Completed", silent = false) => {
    const validation = validateAudit(data, status === "Completed");
    if (validation.length) {
      setErrors(validation);
      return null;
    }
    setIsSaving(true);
    if (!silent) setSaveState(status === "Completed" ? "Completing..." : "Saving...");
    try {
      const payload = await saveAuditManagerAudit({ auditId, data, status });
      setAuditId(payload.audit.id);
      setData(ensureAuditManagerData(payload.audit.data));
      setSaveState(status === "Completed" ? "Audit completed" : "Draft saved");
      setErrors([]);
      await loadAudits();
      return payload.audit;
    } finally {
      setIsSaving(false);
    }
  };

  const newAudit = () => {
    autosaveReady.current = false;
    setAuditId(null);
    setData(createEmptyAuditManagerData());
    setErrors([]);
    setSaveState("New draft");
  };

  const openAudit = async (id: number) => {
    setIsLoading(true);
    try {
      const payload = await getAuditManagerAudit(id);
      autosaveReady.current = false;
      setAuditId(payload.audit.id);
      setData(ensureAuditManagerData(payload.audit.data));
      setSaveState(payload.audit.status);
      setErrors([]);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Unable to open audit."]);
    } finally {
      setIsLoading(false);
    }
  };

  const addInformantRow = () => patch((draft) => {
    draft.informantsChargesMerit.push({ id: rowId(), informantAgency: "", briefMaterialOnFile: "", chargeType: "", meritAssessed: "", notesQuestions: "" });
    return draft;
  });

  const addTimelineRow = () => patch((draft) => {
    draft.matterTimeline.push({ id: rowId(), date: "", matterProgress: "", activityType: "", status: "", notesActions: "", keyEvent: false });
    return draft;
  });

  const addActionRow = () => patch((draft) => {
    draft.actionPlan.push({ id: rowId(), priority: "", actionRequired: "", responsiblePerson: "", dueDate: "", status: "Open", completedDate: "" });
    return draft;
  });

  const exportAudit = async (format: "pdf" | "doc" | "json") => {
    const saved = auditId ? { id: auditId } : await persist("Draft");
    if (!saved) return;
    window.location.href = auditManagerExportUrl(saved.id, format);
  };

  const printAudit = async () => {
    if (!auditId) await persist("Draft");
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[330px_1fr]">
        <aside className="space-y-4 print:hidden">
          <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-purple-700">CLS Portal</p>
                <h1 className="mt-1 text-2xl font-semibold">Audit Manager</h1>
              </div>
              <button type="button" onClick={newAudit} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white">
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search audits" className="pl-9" />
              </div>
              <SelectInput value={firmFilter} onChange={(event) => setFirmFilter(event.target.value)} options={firms} emptyLabel="All firms" />
              <SelectInput value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={["Draft", "Completed"]} emptyLabel="All statuses" />
            </div>
          </section>

          <section className="max-h-[68vh] overflow-auto rounded-md border border-slate-200 bg-white shadow-sm">
            {audits.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No audits found.</p>
            ) : audits.map((audit) => (
              <button
                key={audit.id}
                type="button"
                onClick={() => openAudit(audit.id)}
                className={cx("block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50", audit.id === auditId && "bg-purple-50")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{audit.matterNumber || `Audit ${audit.id}`}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{audit.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{audit.clientName || "No client recorded"}</p>
                <p className="mt-1 text-xs text-slate-500">{audit.firmName || "No firm"} · {audit.reviewDate || "No date"}</p>
              </button>
            ))}
          </section>
        </aside>

        <div className="space-y-5">
          <header className="rounded-md border border-slate-200 bg-white p-4 shadow-sm print:border-0 print:shadow-none">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <ClipboardCheck className="h-4 w-4" />
                  Audit Manager
                </div>
                <h2 className="mt-1 text-2xl font-semibold">{data.matterInformation.clientName || "New audit draft"}</h2>
                <p className="mt-1 text-sm text-slate-500">{saveState}{isLoading ? " · Loading..." : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button type="button" onClick={() => persist("Draft")} disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50">
                  <Save className="h-4 w-4" />
                  Save as Draft
                </button>
                <button type="button" onClick={() => persist("Completed")} disabled={isSaving || completionErrors.length > 0} className="inline-flex h-10 items-center gap-2 rounded-md bg-purple-700 px-3 text-sm font-medium text-white shadow-sm hover:bg-purple-800 disabled:opacity-50">
                  <ClipboardCheck className="h-4 w-4" />
                  Complete Audit
                </button>
                <IconButton label="PDF Export" onClick={() => exportAudit("pdf")}><Download className="h-4 w-4" /></IconButton>
                <IconButton label="Word Export" onClick={() => exportAudit("doc")}><FileDown className="h-4 w-4" /></IconButton>
                <IconButton label="Print Audit Report" onClick={printAudit}><Printer className="h-4 w-4" /></IconButton>
              </div>
            </div>
            {errors.length > 0 && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            )}
          </header>

          <Section title="Matter Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Firm Name"><TextInput value={data.matterInformation.firmName} onChange={(event) => patch((draft) => { draft.matterInformation.firmName = event.target.value; return draft; })} /></Field>
              <Field label="Client Name"><TextInput value={data.matterInformation.clientName} onChange={(event) => patch((draft) => { draft.matterInformation.clientName = event.target.value; return draft; })} /></Field>
              <Field label="Matter Number"><TextInput value={data.matterInformation.matterNumber} onChange={(event) => patch((draft) => { draft.matterInformation.matterNumber = event.target.value; return draft; })} /></Field>
              <Field label="Matter Type"><SelectInput value={data.matterInformation.matterType} onChange={(event) => patch((draft) => { draft.matterInformation.matterType = event.target.value; return draft; })} options={matterTypes} /></Field>
              {data.matterInformation.matterType === "Other" && <Field label="Other"><TextInput value={data.matterInformation.otherMatterType} onChange={(event) => patch((draft) => { draft.matterInformation.otherMatterType = event.target.value; return draft; })} /></Field>}
              <Field label="Review Date"><TextInput type="date" value={data.matterInformation.reviewDate} onChange={(event) => patch((draft) => { draft.matterInformation.reviewDate = event.target.value; return draft; })} /></Field>
            </div>
          </Section>

          <Section title="Aid Eligibility">
            <div className="grid gap-3">
              {aidEligibilityItems.map(([key, label]) => (
                <div key={key} className="grid gap-3 rounded-md border border-slate-200 p-3 lg:grid-cols-[220px_170px_1fr]">
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <SelectInput value={data.aidEligibility[key].status} onChange={(event) => patch((draft) => { draft.aidEligibility[key].status = event.target.value as never; return draft; })} options={itemStatuses} emptyLabel="Status" />
                  <TextInput value={data.aidEligibility[key].comments} onChange={(event) => patch((draft) => { draft.aidEligibility[key].comments = event.target.value; return draft; })} placeholder="Comments" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Informants, Charges and Merit" actions={<button type="button" onClick={addInformantRow} className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add Row</button>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-2">Informant / Agency</th><th className="p-2">Is Brief / Material on File?</th><th className="p-2">Charge Type</th><th className="p-2">Has Merit Been Assessed?</th><th className="p-2">Notes / Questions Arising</th><th className="w-12 p-2"></th></tr></thead>
                <tbody>{data.informantsChargesMerit.map((row, index) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="p-2"><TextInput value={row.informantAgency} onChange={(event) => patch((draft) => { draft.informantsChargesMerit[index].informantAgency = event.target.value; return draft; })} /></td>
                    <td className="p-2"><SelectInput value={row.briefMaterialOnFile} onChange={(event) => patch((draft) => { draft.informantsChargesMerit[index].briefMaterialOnFile = event.target.value; return draft; })} options={yesNoPartial} /></td>
                    <td className="p-2"><TextInput value={row.chargeType} onChange={(event) => patch((draft) => { draft.informantsChargesMerit[index].chargeType = event.target.value; return draft; })} /></td>
                    <td className="p-2"><SelectInput value={row.meritAssessed} onChange={(event) => patch((draft) => { draft.informantsChargesMerit[index].meritAssessed = event.target.value; return draft; })} options={yesNo} /></td>
                    <td className="p-2"><TextInput value={row.notesQuestions} onChange={(event) => patch((draft) => { draft.informantsChargesMerit[index].notesQuestions = event.target.value; return draft; })} /></td>
                    <td className="p-2"><IconButton label="Delete Row" onClick={() => patch((draft) => { draft.informantsChargesMerit.splice(index, 1); return draft; })}><Trash2 className="h-4 w-4" /></IconButton></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Section>

          <Section title="Matter Timeline" actions={<button type="button" onClick={addTimelineRow} className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add Row</button>}>
            <div className="grid gap-3">
              {data.matterTimeline.map((row, index) => (
                <div key={row.id} className="grid gap-3 rounded-md border border-slate-200 p-3 xl:grid-cols-[140px_1fr_190px_170px_1fr_70px_96px]">
                  <TextInput type="date" value={row.date} onChange={(event) => patch((draft) => { draft.matterTimeline[index].date = event.target.value; return draft; })} />
                  <TextInput value={row.matterProgress} onChange={(event) => patch((draft) => { draft.matterTimeline[index].matterProgress = event.target.value; return draft; })} placeholder="Matter Progress" />
                  <SelectInput value={row.activityType} onChange={(event) => patch((draft) => { draft.matterTimeline[index].activityType = event.target.value; return draft; })} options={activityTypes} emptyLabel="Activity Type" />
                  <SelectInput value={row.status} onChange={(event) => patch((draft) => { draft.matterTimeline[index].status = event.target.value; return draft; })} options={timelineStatuses} emptyLabel="Status" />
                  <TextInput value={row.notesActions} onChange={(event) => patch((draft) => { draft.matterTimeline[index].notesActions = event.target.value; return draft; })} placeholder="Notes / Actions" />
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={row.keyEvent} onChange={(event) => patch((draft) => { draft.matterTimeline[index].keyEvent = event.target.checked; return draft; })} /> Key</label>
                  <div className="flex gap-1">
                    <IconButton label="Move Up" disabled={index === 0} onClick={() => patch((draft) => { [draft.matterTimeline[index - 1], draft.matterTimeline[index]] = [draft.matterTimeline[index], draft.matterTimeline[index - 1]]; return draft; })}><ArrowUp className="h-4 w-4" /></IconButton>
                    <IconButton label="Move Down" disabled={index === data.matterTimeline.length - 1} onClick={() => patch((draft) => { [draft.matterTimeline[index + 1], draft.matterTimeline[index]] = [draft.matterTimeline[index], draft.matterTimeline[index + 1]]; return draft; })}><ArrowDown className="h-4 w-4" /></IconButton>
                    <IconButton label="Delete Row" onClick={() => patch((draft) => { draft.matterTimeline.splice(index, 1); return draft; })}><Trash2 className="h-4 w-4" /></IconButton>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="File Compliance Checklist">
            <div className="grid gap-2">
              {data.fileComplianceChecklist.map((row, index) => (
                <div key={row.id} className="grid gap-3 rounded-md border border-slate-200 p-3 lg:grid-cols-[1fr_160px_1.4fr]">
                  <p className="text-sm font-medium text-slate-800">{row.item}</p>
                  <SelectInput value={row.status} onChange={(event) => patch((draft) => { draft.fileComplianceChecklist[index].status = event.target.value as never; return draft; })} options={itemStatuses} emptyLabel="Status" />
                  <TextInput value={row.comments} onChange={(event) => patch((draft) => { draft.fileComplianceChecklist[index].comments = event.target.value; return draft; })} placeholder="Comments" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Action Plan" actions={<button type="button" onClick={addActionRow} className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add Row</button>}>
            <div className="grid gap-3">
              {data.actionPlan.map((row, index) => (
                <div key={row.id} className="grid gap-3 rounded-md border border-slate-200 p-3 xl:grid-cols-[140px_1fr_180px_150px_160px_150px_48px]">
                  <SelectInput value={row.priority} onChange={(event) => patch((draft) => { draft.actionPlan[index].priority = event.target.value; return draft; })} options={actionPriorities} emptyLabel="Priority" />
                  <TextInput value={row.actionRequired} onChange={(event) => patch((draft) => { draft.actionPlan[index].actionRequired = event.target.value; return draft; })} placeholder="Action Required" />
                  <TextInput value={row.responsiblePerson} onChange={(event) => patch((draft) => { draft.actionPlan[index].responsiblePerson = event.target.value; return draft; })} placeholder="Responsible Person" />
                  <TextInput type="date" value={row.dueDate} onChange={(event) => patch((draft) => { draft.actionPlan[index].dueDate = event.target.value; return draft; })} />
                  <SelectInput value={row.status} onChange={(event) => patch((draft) => { draft.actionPlan[index].status = event.target.value; return draft; })} options={actionStatuses} emptyLabel="Status" />
                  <TextInput type="date" value={row.completedDate} onChange={(event) => patch((draft) => { draft.actionPlan[index].completedDate = event.target.value; return draft; })} />
                  <IconButton label="Delete Row" onClick={() => patch((draft) => { draft.actionPlan.splice(index, 1); return draft; })}><Trash2 className="h-4 w-4" /></IconButton>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Audit Conclusion">
            <div className="grid gap-4">
              <Field label="Outcome"><SelectInput value={data.auditConclusion.outcome} onChange={(event) => patch((draft) => { draft.auditConclusion.outcome = event.target.value; return draft; })} options={auditOutcomes} /></Field>
              <Field label="Findings and Observations"><TextArea value={data.auditConclusion.findingsAndObservations} onChange={(event) => patch((draft) => { draft.auditConclusion.findingsAndObservations = event.target.value; return draft; })} /></Field>
              <Field label="Recommendations"><TextArea value={data.auditConclusion.recommendations} onChange={(event) => patch((draft) => { draft.auditConclusion.recommendations = event.target.value; return draft; })} /></Field>
              <Field label="Follow Up Required"><SelectInput value={data.auditConclusion.followUpRequired} onChange={(event) => patch((draft) => { draft.auditConclusion.followUpRequired = event.target.value; return draft; })} options={yesNo} /></Field>
            </div>
          </Section>

          <Section title="Sign Off">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Reviewer Name"><TextInput value={data.signOff.reviewerName} onChange={(event) => patch((draft) => { draft.signOff.reviewerName = event.target.value; return draft; })} /></Field>
              <Field label="Review Date"><TextInput type="date" value={data.signOff.reviewDate} onChange={(event) => patch((draft) => { draft.signOff.reviewDate = event.target.value; return draft; })} /></Field>
              <Field label="Electronic Signature"><TextInput value={data.signOff.electronicSignature} onChange={(event) => patch((draft) => { draft.signOff.electronicSignature = event.target.value; return draft; })} /></Field>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
