import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geocodeSearch } from "./geocode-service.mjs";
import { parseAidLetterFromPdfBuffer } from "./aid-letter-parser.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "dist");
const workspaceRoot = __dirname;
const host = "0.0.0.0";
const port = 4373;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".bcmap": "application/octet-stream",
  ".pfb": "application/octet-stream",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/geocode") {
    const query = requestUrl.searchParams.get("q") || "";
    if (!query.trim()) {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end("[]");
      return;
    }

    geocodeSearch(query.trim())
      .then((results) => {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(JSON.stringify(results));
      })
      .catch(() => {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end("[]");
      });
    return;
  }

  if (requestUrl.pathname === "/api/parse-aid-letter" && req.method === "POST") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const base64 = String(body.base64 || "");
        if (!base64) {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: "Missing PDF payload." }));
          return;
        }
        const buffer = Buffer.from(base64, "base64");
        const parsed = parseAidLetterFromPdfBuffer(buffer);
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(JSON.stringify(parsed));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse aid letter." }));
      }
    });
    return;
  }

  const baseRoot = urlPath.startsWith("/node_modules/") ? workspaceRoot : root;
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(baseRoot, normalizedPath);

  if (!filePath.startsWith(baseRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (baseRoot === root && (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory())) {
    filePath = path.join(root, "index.html");
  } else if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Current app server running at http://${host}:${port}`);
});
