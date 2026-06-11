import express from "express";
import { createAuditService } from "./audit-service.js";
import { createAuditManagerService } from "./audit-manager-service.js";

const asyncRoute = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export function createAuditRouter(service = createAuditService(), auditManagerService = createAuditManagerService()) {
  const router = express.Router();

  router.get("/audit-manager/audits", asyncRoute(async (req, res) => {
    const audits = auditManagerService.listAudits({
      q: req.query.q,
      firm: req.query.firm,
      status: req.query.status,
    });
    const firms = [...new Set(audits.map((audit) => audit.firmName).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    res.json({ success: true, audits, firms });
  }));

  router.post("/audit-manager/audits", asyncRoute(async (req, res) => {
    const audit = auditManagerService.saveAudit({ data: req.body?.data, status: req.body?.status || "Draft" });
    res.status(201).json({ success: true, audit });
  }));

  router.get("/audit-manager/audits/:id", asyncRoute(async (req, res) => {
    const audit = auditManagerService.getAudit(Number(req.params.id));
    res.json({ success: true, audit });
  }));

  router.put("/audit-manager/audits/:id", asyncRoute(async (req, res) => {
    const audit = auditManagerService.saveAudit({
      auditId: Number(req.params.id),
      data: req.body?.data,
      status: req.body?.status || "Draft",
    });
    res.json({ success: true, audit });
  }));

  router.delete("/audit-manager/audits/:id", asyncRoute(async (req, res) => {
    auditManagerService.deleteAudit(Number(req.params.id));
    res.json({ success: true });
  }));

  router.get("/audit-manager/audits/:id/export/:format", asyncRoute(async (req, res) => {
    const exported = auditManagerService.exportAudit(Number(req.params.id), req.params.format);
    res.setHeader("Content-Type", exported.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${exported.fileName}"`);
    res.send(exported.buffer);
  }));

  router.post("/audits", asyncRoute(async (req, res) => {
    const auditId = service.createAudit(req.body || {});
    res.status(201).json({ success: true, auditId });
  }));

  router.get("/audits", asyncRoute(async (_req, res) => {
    const audits = service.listAudits();
    res.json({ success: true, audits, stats: service.getDashboardStats(), sources: service.getSources() });
  }));

  router.get("/audits/sources", asyncRoute(async (_req, res) => {
    res.json({ success: true, sources: service.getSources() });
  }));

  router.get("/audits/:id", asyncRoute(async (req, res) => {
    res.json({ success: true, ...service.getAudit(Number(req.params.id)) });
  }));

  router.post("/audits/:id/findings", asyncRoute(async (req, res) => {
    const finding = service.addFinding(Number(req.params.id), req.body || {});
    res.status(201).json({ success: true, finding });
  }));

  router.post("/audits/:id/timeline", asyncRoute(async (req, res) => {
    const event = service.addTimelineEvent(Number(req.params.id), req.body || {});
    res.status(201).json({ success: true, event });
  }));

  router.post("/audits/:id/documents", asyncRoute(async (req, res) => {
    const result = service.addDocument(Number(req.params.id), req.body || {});
    res.status(201).json({ success: true, ...result });
  }));

  router.put(
    "/audits/:id/documents/raw",
    express.raw({ type: "*/*", limit: process.env.AUDIT_UPLOAD_LIMIT || "750mb" }),
    asyncRoute(async (req, res) => {
      const result = service.addDocumentBuffer(Number(req.params.id), {
        fileName: req.query.fileName || req.headers["x-file-name"],
        mimeType: req.headers["content-type"] || "application/octet-stream",
        buffer: req.body,
      });
      res.status(201).json({ success: true, ...result });
    })
  );

  router.put("/audits/:id/timeline/:eventId", asyncRoute(async (req, res) => {
    const event = service.updateTimelineEvent(Number(req.params.id), Number(req.params.eventId), req.body || {});
    res.json({ success: true, event });
  }));

  router.delete("/audits/:id/timeline/:eventId", asyncRoute(async (req, res) => {
    service.deleteTimelineEvent(Number(req.params.id), Number(req.params.eventId));
    res.json({ success: true });
  }));

  router.post("/audits/:id/checklist", asyncRoute(async (req, res) => {
    res.json({ success: true, ...service.updateChecklistItem(Number(req.params.id), req.body || {}) });
  }));

  router.post("/audits/:id/generate-summary", asyncRoute(async (req, res) => {
    const summary = service.generateSummary(Number(req.params.id));
    res.json({ success: true, summary });
  }));

  router.get("/audits/:id/export", asyncRoute(async (req, res) => {
    const audit = service.getAudit(Number(req.params.id));
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="audit-${req.params.id}.json"`);
    res.json({ success: true, exportedAt: new Date().toISOString(), ...audit });
  }));

  router.use((error, _req, res, _next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Audit request failed",
    });
  });

  return router;
}
