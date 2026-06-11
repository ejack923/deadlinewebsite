import { auditFetch } from "@/lib/auditApi";
import type { AuditManagerData, AuditManagerSummary } from "@/lib/auditManagerSchema";

export async function listAuditManagerAudits(filters: { q?: string; firm?: string; status?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.firm) params.set("firm", filters.firm);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return auditFetch(`/api/audit-manager/audits${query ? `?${query}` : ""}`) as Promise<{
    success: boolean;
    audits: AuditManagerSummary[];
    firms: string[];
  }>;
}

export async function getAuditManagerAudit(id: number) {
  return auditFetch(`/api/audit-manager/audits/${id}`) as Promise<{ success: boolean; audit: AuditManagerSummary }>;
}

export async function saveAuditManagerAudit(payload: { auditId?: number | null; data: AuditManagerData; status: "Draft" | "Completed" }) {
  const path = payload.auditId ? `/api/audit-manager/audits/${payload.auditId}` : "/api/audit-manager/audits";
  return auditFetch(path, {
    method: payload.auditId ? "PUT" : "POST",
    body: JSON.stringify({ data: payload.data, status: payload.status }),
  }) as Promise<{ success: boolean; audit: AuditManagerSummary }>;
}

export function auditManagerExportUrl(id: number, format: "pdf" | "doc" | "json") {
  const base = (import.meta.env?.VITE_AUDIT_API_BASE || "http://127.0.0.1:54322").replace(/\/+$/, "");
  return `${base}/api/audit-manager/audits/${id}/export/${format}`;
}
