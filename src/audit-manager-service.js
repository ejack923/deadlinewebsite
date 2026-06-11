import { Buffer } from "node:buffer";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "audit-intelligence.sqlite");

const emptyAuditData = {
  matterInformation: {
    firmName: "",
    clientName: "",
    matterNumber: "",
    matterType: "",
    otherMatterType: "",
    reviewDate: "",
  },
  aidEligibility: {
    meansTest: { status: "", comments: "" },
    meritTest: { status: "", comments: "" },
    guidelineTest: { status: "", comments: "" },
    overallEligibility: { status: "", comments: "" },
  },
  informantsChargesMerit: [],
  matterTimeline: [],
  fileComplianceChecklist: [],
  actionPlan: [],
  auditConclusion: {
    outcome: "",
    findingsAndObservations: "",
    recommendations: "",
    followUpRequired: "",
  },
  signOff: {
    reviewerName: "",
    reviewDate: "",
    electronicSignature: "",
  },
};

function nowIso() {
  return new Date().toISOString();
}

function parseData(value) {
  if (!value) return structuredClone(emptyAuditData);
  try {
    return { ...structuredClone(emptyAuditData), ...JSON.parse(value) };
  } catch {
    return structuredClone(emptyAuditData);
  }
}

function normalizeRow(row) {
  const data = parseData(row.audit_data);
  return {
    id: row.id,
    firmName: row.firm_name || data.matterInformation?.firmName || "",
    clientName: row.client_name || data.matterInformation?.clientName || "",
    matterNumber: row.matter_number || data.matterInformation?.matterNumber || "",
    matterType: row.matter_type || data.matterInformation?.matterType || "",
    reviewDate: row.review_date || data.matterInformation?.reviewDate || "",
    status: row.status || "Draft",
    outcome: row.outcome || data.auditConclusion?.outcome || "",
    reviewerName: row.reviewer_name || data.signOff?.reviewerName || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || "",
    data,
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textLines(value) {
  return String(value || "-").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function makePdfBuffer(title, lines) {
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };
  const pageIds = [];
  const chunks = [];
  const pageLines = [];
  for (const line of lines) {
    const wrapped = String(line || "").match(/.{1,88}(\s|$)|\S+/g) || [""];
    for (const piece of wrapped) pageLines.push(piece.trim());
  }
  const pages = [];
  for (let index = 0; index < pageLines.length; index += 42) {
    pages.push(pageLines.slice(index, index + 42));
  }
  if (!pages.length) pages.push(["No audit content recorded."]);

  for (const page of pages) {
    const streamLines = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"];
    for (const [index, line] of [title, "", ...page].entries()) {
      if (index > 0) streamLines.push("T*");
      streamLines.push(`(${String(line).replace(/[\\()]/g, "\\$&")}) Tj`);
    }
    streamLines.push("ET");
    const stream = streamLines.join("\n");
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 0 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
    chunks.push({ pageId, contentId });
  }

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  for (const chunk of chunks) {
    objects[chunk.pageId - 1] = objects[chunk.pageId - 1]
      .replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`)
      .replace("/F1 0 0 R", `/F1 ${fontId} 0 R`);
  }

  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, body] of objects.entries()) {
    offsets.push(Buffer.byteLength(output));
    output += `${index + 1} 0 obj\n${body}\nendobj\n`;
  }
  const xref = Buffer.byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(output);
}

function auditReportLines(audit) {
  const data = audit.data || emptyAuditData;
  const lines = [
    `Firm: ${audit.firmName || "-"}`,
    `Client: ${audit.clientName || "-"}`,
    `Matter number: ${audit.matterNumber || "-"}`,
    `Matter type: ${audit.matterType || "-"}`,
    `Review date: ${audit.reviewDate || "-"}`,
    `Status: ${audit.status}`,
    `Outcome: ${audit.outcome || "-"}`,
    "",
    "Aid Eligibility",
    ...Object.entries(data.aidEligibility || {}).map(([key, item]) => `${key}: ${item.status || "-"} - ${item.comments || ""}`),
    "",
    "Informants, Charges and Merit",
    ...(data.informantsChargesMerit || []).map((row) => `${row.informantAgency || "-"} | ${row.briefMaterialOnFile || "-"} | ${row.chargeType || "-"} | Merit: ${row.meritAssessed || "-"} | ${row.notesQuestions || ""}`),
    "",
    "Matter Timeline",
    ...(data.matterTimeline || []).map((row) => `${row.date || "-"} | ${row.activityType || "-"} | ${row.status || "-"} | ${row.matterProgress || ""} | ${row.notesActions || ""}${row.keyEvent ? " | Key event" : ""}`),
    "",
    "File Compliance Checklist",
    ...(data.fileComplianceChecklist || []).map((row) => `${row.item || "-"}: ${row.status || "-"} - ${row.comments || ""}`),
    "",
    "Action Plan",
    ...(data.actionPlan || []).map((row) => `${row.priority || "-"} | ${row.actionRequired || "-"} | ${row.responsiblePerson || "-"} | Due ${row.dueDate || "-"} | ${row.status || "-"} | Completed ${row.completedDate || "-"}`),
    "",
    "Conclusion",
    ...textLines(data.auditConclusion?.findingsAndObservations),
    "Recommendations",
    ...textLines(data.auditConclusion?.recommendations),
    `Follow up required: ${data.auditConclusion?.followUpRequired || "-"}`,
    "",
    "Sign Off",
    `Reviewer: ${data.signOff?.reviewerName || "-"}`,
    `Review date: ${data.signOff?.reviewDate || "-"}`,
    `Electronic signature: ${data.signOff?.electronicSignature || "-"}`,
  ];
  return lines;
}

function makeWordHtml(audit) {
  const rows = auditReportLines(audit).map((line) => `<p>${escapeHtml(line || "\u00a0")}</p>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Audit Manager ${escapeHtml(audit.matterNumber || audit.id)}</title><style>body{font-family:Arial,sans-serif;font-size:11pt;color:#111827}h1{font-size:20pt}p{margin:0 0 7px}</style></head><body><h1>CLS Audit Manager Report</h1>${rows}</body></html>`;
}

export function createAuditManagerService(dbPath = process.env.AUDIT_DB_PATH || DEFAULT_DB_PATH) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_manager_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firm_name TEXT,
      client_name TEXT,
      matter_number TEXT,
      matter_type TEXT,
      review_date TEXT,
      status TEXT NOT NULL DEFAULT 'Draft',
      outcome TEXT,
      reviewer_name TEXT,
      audit_data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_manager_firm ON audit_manager_audits(firm_name);
    CREATE INDEX IF NOT EXISTS idx_audit_manager_status ON audit_manager_audits(status);
    CREATE INDEX IF NOT EXISTS idx_audit_manager_matter ON audit_manager_audits(matter_number);
  `);

  const listAudits = ({ q = "", firm = "", status = "" } = {}) => {
    const rows = db.prepare("SELECT * FROM audit_manager_audits ORDER BY datetime(updated_at) DESC, id DESC").all();
    const query = String(q).trim().toLowerCase();
    const firmFilter = String(firm).trim().toLowerCase();
    const statusFilter = String(status).trim().toLowerCase();
    return rows.map(normalizeRow).filter((audit) => {
      const searchable = [audit.firmName, audit.clientName, audit.matterNumber, audit.matterType, audit.outcome].join(" ").toLowerCase();
      return (!query || searchable.includes(query))
        && (!firmFilter || audit.firmName.toLowerCase() === firmFilter)
        && (!statusFilter || audit.status.toLowerCase() === statusFilter);
    });
  };

  const getAudit = (auditId) => {
    const row = db.prepare("SELECT * FROM audit_manager_audits WHERE id = ?").get(auditId);
    if (!row) {
      const error = new Error("Audit Manager audit not found");
      error.statusCode = 404;
      throw error;
    }
    return normalizeRow(row);
  };

  const saveAudit = ({ auditId, data, status = "Draft" }) => {
    const auditData = { ...structuredClone(emptyAuditData), ...(data || {}) };
    const matter = auditData.matterInformation || {};
    const conclusion = auditData.auditConclusion || {};
    const signOff = auditData.signOff || {};
    const updatedAt = nowIso();
    if (auditId) getAudit(auditId);
    if (auditId) {
      db.prepare(`
        UPDATE audit_manager_audits
        SET firm_name = ?, client_name = ?, matter_number = ?, matter_type = ?, review_date = ?,
            status = ?, outcome = ?, reviewer_name = ?, audit_data = ?, updated_at = ?,
            completed_at = CASE WHEN ? = 'Completed' THEN COALESCE(completed_at, ?) ELSE completed_at END
        WHERE id = ?
      `).run(
        matter.firmName || "",
        matter.clientName || "",
        matter.matterNumber || "",
        matter.matterType || "",
        matter.reviewDate || "",
        status,
        conclusion.outcome || "",
        signOff.reviewerName || "",
        JSON.stringify(auditData),
        updatedAt,
        status,
        updatedAt,
        auditId
      );
      return getAudit(auditId);
    }
    const result = db.prepare(`
      INSERT INTO audit_manager_audits
        (firm_name, client_name, matter_number, matter_type, review_date, status, outcome, reviewer_name, audit_data, updated_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      matter.firmName || "",
      matter.clientName || "",
      matter.matterNumber || "",
      matter.matterType || "",
      matter.reviewDate || "",
      status,
      conclusion.outcome || "",
      signOff.reviewerName || "",
      JSON.stringify(auditData),
      updatedAt,
      status === "Completed" ? updatedAt : null
    );
    return getAudit(Number(result.lastInsertRowid));
  };

  const deleteAudit = (auditId) => {
    getAudit(auditId);
    db.prepare("DELETE FROM audit_manager_audits WHERE id = ?").run(auditId);
  };

  const exportAudit = (auditId, format) => {
    const audit = getAudit(auditId);
    if (format === "doc") {
      return {
        contentType: "application/msword",
        fileName: `cls-audit-${audit.matterNumber || audit.id}.doc`,
        buffer: Buffer.from(makeWordHtml(audit), "utf8"),
      };
    }
    if (format === "pdf") {
      return {
        contentType: "application/pdf",
        fileName: `cls-audit-${audit.matterNumber || audit.id}.pdf`,
        buffer: makePdfBuffer("CLS Audit Manager Report", auditReportLines(audit)),
      };
    }
    return {
      contentType: "application/json",
      fileName: `cls-audit-${audit.matterNumber || audit.id}.json`,
      buffer: Buffer.from(JSON.stringify({ exportedAt: nowIso(), audit }, null, 2), "utf8"),
    };
  };

  return {
    listAudits,
    getAudit,
    saveAudit,
    deleteAudit,
    exportAudit,
    emptyAuditData: () => structuredClone(emptyAuditData),
  };
}
