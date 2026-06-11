import { AlertTriangle, BarChart3, ClipboardCheck, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auditFetch } from "@/lib/auditApi";

const emptyForm = {
  matterId: "",
  clientName: "",
  auditor: "Operator",
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
    </section>
  );
}

export default function AuditDashboard() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [stats, setStats] = useState({ totalAudits: 0, averageScore: 0, openFindings: 0, highRiskAudits: 0 });
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const loadAudits = async () => {
    setIsLoading(true);
    setError("");
    try {
      const payload = await auditFetch("/api/audits");
      setAudits(payload.audits || []);
      setStats(payload.stats || stats);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const filteredAudits = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return audits;
    return audits.filter((audit) =>
      [audit.matterId, audit.clientName, audit.auditor, audit.status].some((field) =>
        String(field || "").toLowerCase().includes(value)
      )
    );
  }, [audits, query]);

  const createAudit = async (event) => {
    event.preventDefault();
    if (!form.matterId.trim()) return;
    setIsCreating(true);
    setError("");
    try {
      const payload = await auditFetch("/api/audits", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      navigate(`/AuditMatter/${payload.auditId}`);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">CLS Portal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Audit Intelligence</h1>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search audits"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm"
            />
          </div>
        </header>

        {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total audits" value={stats.totalAudits} icon={ClipboardCheck} />
          <StatCard label="Average score" value={`${stats.averageScore}%`} icon={BarChart3} />
          <StatCard label="Open findings" value={stats.openFindings} icon={AlertTriangle} />
          <StatCard label="High risk audits" value={stats.highRiskAudits} icon={AlertTriangle} />
        </section>

        <section className="mt-6 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={createAudit} className="grid gap-3 md:grid-cols-[180px_1fr_180px_auto]">
            <input value={form.matterId} onChange={(event) => setForm({ ...form, matterId: event.target.value })} placeholder="Matter ID" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <input value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} placeholder="Client name" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <input value={form.auditor} onChange={(event) => setForm({ ...form, auditor: event.target.value })} placeholder="Auditor" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <button type="submit" disabled={isCreating} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60">
              <Plus className="h-4 w-4" />
              Create audit
            </button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Matter</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Auditor</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Audit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading audits...</td></tr>
              ) : filteredAudits.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No audits found.</td></tr>
              ) : filteredAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950"><Link to={`/AuditMatter/${audit.id}`}>{audit.matterId}</Link></td>
                  <td className="px-4 py-3 text-slate-700">{audit.clientName || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{audit.auditor || "-"}</td>
                  <td className="px-4 py-3 font-medium text-slate-950">{audit.score}%</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">{audit.status}</span></td>
                  <td className="px-4 py-3 text-slate-700">{audit.auditDate || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
