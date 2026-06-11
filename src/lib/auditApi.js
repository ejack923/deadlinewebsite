const API_BASE = (import.meta.env?.VITE_AUDIT_API_BASE || "http://127.0.0.1:54322").replace(/\/+$/, "");

export async function auditFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof Blob) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Audit API request failed: ${response.status}`);
  }
  return payload;
}

export function exportAuditUrl(auditId) {
  return `${API_BASE}/api/audits/${auditId}/export`;
}
