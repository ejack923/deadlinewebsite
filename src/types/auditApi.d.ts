declare module "@/lib/auditApi" {
  export function auditFetch<T = unknown>(path: string, options?: RequestInit): Promise<T>;
  export function exportAuditUrl(auditId: number): string;
}
