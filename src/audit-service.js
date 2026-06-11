import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { DatabaseSync } from "node:sqlite";
import { AUDIT_CHECKLIST_ITEMS, AUDIT_SOURCE_DOCUMENTS } from "./audit-standards.js";

export const DEFAULT_CHECKLIST = AUDIT_CHECKLIST_ITEMS;

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "audit-intelligence.sqlite");
const DEFAULT_UPLOAD_ROOT = path.join(process.cwd(), "data", "audit-uploads");
const MAX_TEXT_SCAN_BYTES = 12 * 1024 * 1024;

const toBoolInt = (value) => (value ? 1 : 0);

export function calculateScore(checklist = []) {
  if (!checklist.length) return 0;
  const completed = checklist.filter((item) => Number(item.completed) === 1).length;
  return Math.round((completed / checklist.length) * 100);
}

export function statusForScore(score) {
  if (score >= 90) return "PASS";
  if (score >= 75) return "ACTION REQUIRED";
  return "HIGH RISK";
}

const EVIDENCE_RULES = [
  { checklistKey: "conflict_check", label: "Conflict search/check", terms: ["conflict check", "conflict search", "conflicts search", "conflict clearance"] },
  { checklistKey: "application_on_file", label: "Application on file", terms: ["application for legal aid", "legal aid application", "vla application", "application on file"] },
  { checklistKey: "means_evidence", label: "Means evidence", terms: ["means test", "income", "centrelink", "bank statement", "payslip", "financial statement"] },
  { checklistKey: "merit_evidence", label: "Merit evidence", terms: ["merit", "prospects", "reasonable prospects", "legal merits"] },
  { checklistKey: "guideline_evidence", label: "Guideline evidence", terms: ["guideline", "guideline evidence", "vla guideline", "certification"] },
  { checklistKey: "client_instructions", label: "Client instructions", terms: ["client instructions", "instructions from client", "client instructed", "instructions received"] },
  { checklistKey: "advice_recorded", label: "Advice recorded", terms: ["advice given", "legal advice", "advised client", "advice recorded"] },
  { checklistKey: "progress_reports", label: "Progress report", terms: ["progress report", "matter update", "status update", "report to vla"] },
  { checklistKey: "outcome_letter", label: "Outcome letter", terms: ["outcome letter", "closing letter", "final letter", "matter outcome"] },
  { checklistKey: "attendance_notes", label: "Attendance note", terms: ["attendance note", "file note", "telephone attendance", "conference note"] },
  { checklistKey: "appearance_notes", label: "Appearance note", terms: ["appearance note", "court appearance", "hearing note", "appearance claim"] },
  { checklistKey: "claims_supported", label: "Claim support", terms: ["claim support", "claim evidence", "claim costs", "atlas claim", "fee claim"] },
  { checklistKey: "invoices_retained", label: "Invoice retained", terms: ["invoice", "tax invoice", "receipt", "disbursement"] },
  { checklistKey: "documents_in_order", label: "File index/order", terms: ["file index", "documents in order", "brief index", "document list"] },
  { checklistKey: "law_compliance_current", label: "Law compliance material", terms: ["compliance with law", "professional obligations", "legal profession uniform law"] },
  { checklistKey: "practitioner_responsibilities_met", label: "Practitioner responsibilities", terms: ["responsibilities as a legal aid practitioner", "practitioner responsibilities", "professional responsibility"] },
  { checklistKey: "client_service_standards_met", label: "Client service standards", terms: ["client service", "responsibilities to the client", "client communication", "client care"] },
  { checklistKey: "counsel_briefing_recorded", label: "Counsel briefing", terms: ["brief to counsel", "briefing counsel", "counsel brief", "instructions to counsel"] },
  { checklistKey: "grant_conditions_checked", label: "Grant conditions", terms: ["grant conditions", "conditions of grant", "grant letter", "extension of assistance"] },
  { checklistKey: "extension_or_amendment_evidence", label: "Extension/amendment evidence", terms: ["extension request", "amendment request", "extension of aid", "amend grant"] },
  { checklistKey: "quality_monitoring_ready", label: "Quality monitoring", terms: ["quality monitoring", "audit ready", "quality review", "file review"] },
  { checklistKey: "panel_terms_compliance", label: "Panel compliance terms", terms: ["panel compliance", "panel terms", "terms and conditions", "panel obligations"] },
  { checklistKey: "revocation_risk_reviewed", label: "Removal/revocation risk", terms: ["revocation", "panel removal", "certifier status", "non-compliance"] },
  { checklistKey: "atlas_access_and_claims_compliant", label: "ATLAS access/claims", terms: ["atlas", "atlas claim", "atlas terms", "claim submitted", "claim payment"] },
];

function safeFileName(fileName) {
  return String(fileName || "uploaded-file")
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 160);
}

function safeDisplayPath(fileName) {
  return String(fileName || "uploaded-file")
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => part.replace(/[^\w.\- ()]/g, "_"))
    .join("/")
    .slice(0, 260) || "uploaded-file";
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

function extractZipEntry(buffer, entryName) {
  let eocd = -1;
  for (let index = buffer.length - 22; index >= 0; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) return null;
  const centralDirectorySize = buffer.readUInt32LE(eocd + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocd + 16);
  let pointer = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;
  while (pointer < end) {
    if (buffer.readUInt32LE(pointer) !== 0x02014b50) return null;
    const method = buffer.readUInt16LE(pointer + 10);
    const compressedSize = buffer.readUInt32LE(pointer + 20);
    const fileNameLength = buffer.readUInt16LE(pointer + 28);
    const extraLength = buffer.readUInt16LE(pointer + 30);
    const commentLength = buffer.readUInt16LE(pointer + 32);
    const localOffset = buffer.readUInt32LE(pointer + 42);
    const fileName = buffer.toString("utf8", pointer + 46, pointer + 46 + fileNameLength);
    if (fileName === entryName) {
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const data = buffer.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return data;
      if (method === 8) return zlib.inflateRawSync(data);
      return null;
    }
    pointer += 46 + fileNameLength + extraLength + commentLength;
  }
  return null;
}

function extractDocumentText(buffer, fileName, mimeType = "") {
  const scanBuffer = buffer.length > MAX_TEXT_SCAN_BYTES ? buffer.subarray(0, MAX_TEXT_SCAN_BYTES) : buffer;
  const lowerName = String(fileName || "").toLowerCase();
  if (lowerName.endsWith(".docx") || mimeType.includes("wordprocessingml")) {
    const xml = extractZipEntry(buffer, "word/document.xml")?.toString("utf8") || "";
    return [...xml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)]
      .map((match) => decodeXml(match[1]))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (mimeType.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".csv")) {
    return scanBuffer.toString("utf8").replace(/\s+/g, " ").trim();
  }
  const roughText = scanBuffer.toString("latin1")
    .replace(/[^\x20-\x7E\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return roughText;
}

function findEvidenceMatches({ text, fileName }) {
  const haystack = `${fileName || ""} ${text || ""}`.toLowerCase();
  return EVIDENCE_RULES.flatMap((rule) => {
    const matchedTerm = rule.terms.find((term) => haystack.includes(term));
    if (!matchedTerm) return [];
    const termIndex = haystack.indexOf(matchedTerm);
    const excerptStart = Math.max(0, termIndex - 120);
    const excerpt = haystack.slice(excerptStart, excerptStart + 280);
    return [{
      checklistKey: rule.checklistKey,
      evidenceLabel: rule.label,
      confidence: matchedTerm.length > 8 ? 82 : 68,
      evidenceExcerpt: excerpt,
    }];
  });
}

export function createAuditService(dbPath = process.env.AUDIT_DB_PATH || DEFAULT_DB_PATH) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matter_id TEXT NOT NULL,
      client_name TEXT,
      auditor TEXT,
      audit_date TEXT,
      score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'In Progress',
      summary TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      severity TEXT NOT NULL,
      finding TEXT NOT NULL,
      action_required TEXT,
      status TEXT DEFAULT 'Open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (audit_id) REFERENCES audit_reviews(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      event_date TEXT,
      event_type TEXT,
      description TEXT,
      evidence_type TEXT,
      FOREIGN KEY (audit_id) REFERENCES audit_reviews(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      checklist_key TEXT,
      checklist_label TEXT,
      standard_domain TEXT,
      source_reference TEXT,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (audit_id) REFERENCES audit_reviews(id) ON DELETE CASCADE,
      UNIQUE (audit_id, checklist_key)
    );

    CREATE TABLE IF NOT EXISTS audit_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER DEFAULT 0,
      stored_path TEXT,
      text_excerpt TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (audit_id) REFERENCES audit_reviews(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_evidence_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      document_id INTEGER NOT NULL,
      checklist_key TEXT NOT NULL,
      evidence_label TEXT,
      confidence INTEGER DEFAULT 0,
      evidence_excerpt TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (audit_id) REFERENCES audit_reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES audit_documents(id) ON DELETE CASCADE
    );
  `);

  const checklistColumns = db.prepare("PRAGMA table_info(audit_checklist)").all().map((column) => column.name);
  if (!checklistColumns.includes("standard_domain")) {
    db.exec("ALTER TABLE audit_checklist ADD COLUMN standard_domain TEXT");
  }
  if (!checklistColumns.includes("source_reference")) {
    db.exec("ALTER TABLE audit_checklist ADD COLUMN source_reference TEXT");
  }

  const normalizeAudit = (audit) => audit ? {
    id: audit.id,
    matterId: audit.matter_id,
    clientName: audit.client_name || "",
    auditor: audit.auditor || "",
    auditDate: audit.audit_date || "",
    score: audit.score || 0,
    status: audit.status || "In Progress",
    summary: audit.summary || "",
    createdAt: audit.created_at,
  } : null;

  const normalizeFinding = (finding) => ({
    id: finding.id,
    auditId: finding.audit_id,
    severity: finding.severity,
    finding: finding.finding,
    actionRequired: finding.action_required || "",
    status: finding.status || "Open",
    createdAt: finding.created_at,
  });

  const normalizeTimeline = (event) => ({
    id: event.id,
    auditId: event.audit_id,
    eventDate: event.event_date || "",
    eventType: event.event_type || "",
    description: event.description || "",
    evidenceType: event.evidence_type || "",
  });

  const normalizeChecklist = (item) => ({
    id: item.id,
    auditId: item.audit_id,
    checklistKey: item.checklist_key,
    checklistLabel: item.checklist_label,
    standardDomain: item.standard_domain || "",
    sourceReference: item.source_reference || "",
    completed: Number(item.completed) === 1,
  });

  const normalizeDocument = (document) => ({
    id: document.id,
    auditId: document.audit_id,
    fileName: document.file_name,
    mimeType: document.mime_type || "",
    fileSize: document.file_size || 0,
    textExcerpt: document.text_excerpt || "",
    createdAt: document.created_at,
  });

  const normalizeEvidenceMatch = (match) => ({
    id: match.id,
    auditId: match.audit_id,
    documentId: match.document_id,
    checklistKey: match.checklist_key,
    evidenceLabel: match.evidence_label || "",
    confidence: match.confidence || 0,
    evidenceExcerpt: match.evidence_excerpt || "",
    createdAt: match.created_at,
  });

  const getChecklistRows = (auditId) =>
    db.prepare("SELECT * FROM audit_checklist WHERE audit_id = ? ORDER BY id").all(auditId);

  const recalculateAudit = (auditId) => {
    const checklist = getChecklistRows(auditId);
    const score = calculateScore(checklist);
    const status = statusForScore(score);
    db.prepare("UPDATE audit_reviews SET score = ?, status = ? WHERE id = ?").run(score, status, auditId);
    return { score, status };
  };

  const requireAudit = (auditId) => {
    const audit = db.prepare("SELECT * FROM audit_reviews WHERE id = ?").get(auditId);
    if (!audit) {
      const error = new Error("Audit not found");
      error.statusCode = 404;
      throw error;
    }
    return audit;
  };

  const ensureChecklistStandards = (auditId) => {
    const insertChecklist = db.prepare(`
      INSERT OR IGNORE INTO audit_checklist
        (audit_id, checklist_key, checklist_label, standard_domain, source_reference, completed)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    const updateChecklist = db.prepare(`
      UPDATE audit_checklist
      SET checklist_label = ?, standard_domain = ?, source_reference = ?
      WHERE audit_id = ? AND checklist_key = ?
    `);
    for (const [key, label, domain, source] of DEFAULT_CHECKLIST) {
      insertChecklist.run(auditId, key, label, domain, source);
      updateChecklist.run(label, domain, source, auditId, key);
    }
  };

  const createAudit = ({ matterId, clientName = "", auditor = "" }) => {
    if (!matterId || typeof matterId !== "string") {
      const error = new Error("matterId is required");
      error.statusCode = 400;
      throw error;
    }

    const auditDate = new Date().toISOString().slice(0, 10);
    const result = db.prepare(
      "INSERT INTO audit_reviews (matter_id, client_name, auditor, audit_date) VALUES (?, ?, ?, ?)"
    ).run(matterId.trim(), clientName, auditor, auditDate);
    const auditId = Number(result.lastInsertRowid);

    ensureChecklistStandards(auditId);

    recalculateAudit(auditId);
    return auditId;
  };

  const listAudits = () => db.prepare(`
    SELECT
      r.*,
      COALESCE(SUM(CASE WHEN f.status = 'Open' THEN 1 ELSE 0 END), 0) AS open_findings
    FROM audit_reviews r
    LEFT JOIN audit_findings f ON f.audit_id = r.id
    GROUP BY r.id
    ORDER BY COALESCE(r.audit_date, r.created_at) DESC, r.id DESC
  `).all().map((row) => ({
    ...normalizeAudit(row),
    openFindings: row.open_findings || 0,
  }));

  const getAudit = (auditId) => {
    requireAudit(auditId);
    ensureChecklistStandards(auditId);
    const scoreState = recalculateAudit(auditId);
    const audit = db.prepare("SELECT * FROM audit_reviews WHERE id = ?").get(auditId);
    const findings = db.prepare("SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY id DESC").all(auditId);
    const timeline = db.prepare("SELECT * FROM audit_timeline WHERE audit_id = ? ORDER BY event_date DESC, id DESC").all(auditId);
    const checklist = getChecklistRows(auditId);
    const documents = db.prepare("SELECT * FROM audit_documents WHERE audit_id = ? ORDER BY id DESC").all(auditId);
    const evidenceMatches = db.prepare("SELECT * FROM audit_evidence_matches WHERE audit_id = ? ORDER BY confidence DESC, id DESC").all(auditId);
    return {
      audit: { ...normalizeAudit(audit), ...scoreState },
      findings: findings.map(normalizeFinding),
      timeline: timeline.map(normalizeTimeline),
      checklist: checklist.map(normalizeChecklist),
      documents: documents.map(normalizeDocument),
      evidenceMatches: evidenceMatches.map(normalizeEvidenceMatch),
      sources: AUDIT_SOURCE_DOCUMENTS,
      calculatedScore: scoreState.score,
    };
  };

  const addDocumentBuffer = (auditId, { fileName, mimeType = "", buffer }) => {
    requireAudit(auditId);
    if (!fileName || !buffer?.length) {
      const error = new Error("fileName and file content are required");
      error.statusCode = 400;
      throw error;
    }
    const displayFileName = safeDisplayPath(fileName);
    const cleanFileName = safeFileName(path.basename(displayFileName));
    const auditUploadRoot = path.join(DEFAULT_UPLOAD_ROOT, String(auditId));
    fs.mkdirSync(auditUploadRoot, { recursive: true });
    const storedPath = path.join(auditUploadRoot, `${Date.now()}-${cleanFileName}`);
    fs.writeFileSync(storedPath, buffer);
    const extractedText = extractDocumentText(buffer, displayFileName, mimeType);
    const result = db.prepare(`
      INSERT INTO audit_documents (audit_id, file_name, mime_type, file_size, stored_path, text_excerpt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(auditId, displayFileName, mimeType, buffer.length, storedPath, extractedText.slice(0, 1600));
    const documentId = Number(result.lastInsertRowid);
    const matches = findEvidenceMatches({ text: extractedText, fileName: cleanFileName });
    const insertMatch = db.prepare(`
      INSERT INTO audit_evidence_matches
        (audit_id, document_id, checklist_key, evidence_label, confidence, evidence_excerpt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const match of matches) {
      insertMatch.run(auditId, documentId, match.checklistKey, match.evidenceLabel, match.confidence, match.evidenceExcerpt);
    }
    return {
      document: normalizeDocument(db.prepare("SELECT * FROM audit_documents WHERE id = ?").get(documentId)),
      evidenceMatches: db.prepare("SELECT * FROM audit_evidence_matches WHERE document_id = ? ORDER BY confidence DESC").all(documentId).map(normalizeEvidenceMatch),
    };
  };

  const addDocument = (auditId, { fileName, mimeType = "", base64 = "" }) => {
    if (!base64) {
      const error = new Error("base64 is required");
      error.statusCode = 400;
      throw error;
    }
    return addDocumentBuffer(auditId, {
      fileName,
      mimeType,
      buffer: Buffer.from(String(base64).replace(/^data:[^,]+,/, ""), "base64"),
    });
  };

  const addFinding = (auditId, { severity, finding, actionRequired = "" }) => {
    requireAudit(auditId);
    if (!severity || !finding) {
      const error = new Error("severity and finding are required");
      error.statusCode = 400;
      throw error;
    }
    const result = db.prepare(
      "INSERT INTO audit_findings (audit_id, severity, finding, action_required) VALUES (?, ?, ?, ?)"
    ).run(auditId, severity, finding, actionRequired);
    return normalizeFinding(db.prepare("SELECT * FROM audit_findings WHERE id = ?").get(result.lastInsertRowid));
  };

  const addTimelineEvent = (auditId, { eventDate = "", eventType = "", description = "", evidenceType = "" }) => {
    requireAudit(auditId);
    const result = db.prepare(
      "INSERT INTO audit_timeline (audit_id, event_date, event_type, description, evidence_type) VALUES (?, ?, ?, ?, ?)"
    ).run(auditId, eventDate, eventType, description, evidenceType);
    return normalizeTimeline(db.prepare("SELECT * FROM audit_timeline WHERE id = ?").get(result.lastInsertRowid));
  };

  const updateTimelineEvent = (auditId, eventId, payload) => {
    requireAudit(auditId);
    db.prepare(`
      UPDATE audit_timeline
      SET event_date = ?, event_type = ?, description = ?, evidence_type = ?
      WHERE id = ? AND audit_id = ?
    `).run(payload.eventDate || "", payload.eventType || "", payload.description || "", payload.evidenceType || "", eventId, auditId);
    return normalizeTimeline(db.prepare("SELECT * FROM audit_timeline WHERE id = ? AND audit_id = ?").get(eventId, auditId));
  };

  const deleteTimelineEvent = (auditId, eventId) => {
    requireAudit(auditId);
    db.prepare("DELETE FROM audit_timeline WHERE id = ? AND audit_id = ?").run(eventId, auditId);
  };

  const updateChecklistItem = (auditId, { checklistKey, completed }) => {
    requireAudit(auditId);
    if (!checklistKey) {
      const error = new Error("checklistKey is required");
      error.statusCode = 400;
      throw error;
    }
    const existing = db.prepare("SELECT * FROM audit_checklist WHERE audit_id = ? AND checklist_key = ?").get(auditId, checklistKey);
    if (!existing) {
      const error = new Error("Checklist item not found");
      error.statusCode = 404;
      throw error;
    }
    db.prepare("UPDATE audit_checklist SET completed = ? WHERE audit_id = ? AND checklist_key = ?")
      .run(toBoolInt(completed), auditId, checklistKey);
    return getAudit(auditId);
  };

  const generateSummary = (auditId) => {
    requireAudit(auditId);
    const openFindings = db.prepare(`
      SELECT severity, finding, action_required FROM audit_findings
      WHERE audit_id = ? AND status = 'Open'
      ORDER BY
        CASE severity WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END,
        id
      LIMIT 3
    `).all(auditId);

    const findingLines = openFindings.length
      ? openFindings.map((item, index) => {
        const action = item.action_required ? ` - ${item.action_required}` : "";
        return `${index + 1}. [${item.severity}] ${item.finding}${action}`;
      }).join("\n")
      : "1. No open findings recorded.";

    const sourceLines = AUDIT_SOURCE_DOCUMENTS
      .map((source) => `- ${source.title} (${source.version})`)
      .join("\n");
    const summary = `Conclusion and Further Action\n\nSource documents considered:\n${sourceLines}\n\n${findingLines}\n\nOverall file management is satisfactory subject to the matters identified above.`;
    db.prepare("UPDATE audit_reviews SET summary = ? WHERE id = ?").run(summary, auditId);
    return summary;
  };

  const getDashboardStats = () => {
    const audits = listAudits();
    const totalAudits = audits.length;
    const averageScore = totalAudits
      ? Math.round(audits.reduce((sum, audit) => sum + Number(audit.score || 0), 0) / totalAudits)
      : 0;
    const openFindings = db.prepare("SELECT COUNT(*) AS count FROM audit_findings WHERE status = 'Open'").get().count || 0;
    const highRiskAudits = audits.filter((audit) => audit.status === "HIGH RISK").length;
    return { totalAudits, averageScore, openFindings, highRiskAudits };
  };

  return {
    createAudit,
    listAudits,
    getAudit,
    addFinding,
    addTimelineEvent,
    addDocument,
    addDocumentBuffer,
    updateTimelineEvent,
    deleteTimelineEvent,
    updateChecklistItem,
    generateSummary,
    getDashboardStats,
    getSources: () => AUDIT_SOURCE_DOCUMENTS,
  };
}
