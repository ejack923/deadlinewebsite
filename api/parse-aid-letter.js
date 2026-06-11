import { parseAidLetterFromDataUrl } from "../aid_letter_node_parser.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const fileUrl =
      typeof payload.fileUrl === "string" && payload.fileUrl
        ? payload.fileUrl
        : typeof payload.base64 === "string" && payload.base64
          ? `data:application/pdf;base64,${payload.base64}`
          : "";

    const result = await parseAidLetterFromDataUrl(fileUrl);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error?.message || "Failed to parse aid letter" });
  }
}
