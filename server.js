import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAuditRouter } from "./src/audit-routes.js";

const app = express();
const port = Number(process.env.PORT || process.env.AUDIT_PORT || 54322);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "75mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/", (_req, res) => {
  res.json({
    service: "CLS Portal Audit Intelligence API",
    status: "running",
    endpoints: ["/api/audits", "/api/audits/:id"],
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/audit-dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "audit-dashboard.html"));
});

app.use("/api", createAuditRouter());

app.listen(port, "127.0.0.1", () => {
  console.log(`CLS Audit Intelligence API listening on http://127.0.0.1:${port}`);
});
