import { useMemo, useState } from "react";
import { ArrowLeft, Clipboard, Copy, Download, FileText, Printer, RotateCcw, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { usePersistentForm } from "@/lib/usePersistentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const EMPTY_FORM = {
  documentTitle: "Document Tool",
  documentType: "Funding request",
  clientName: "",
  matterReference: "",
  preparedBy: "",
  date: new Date().toISOString().split("T")[0],
  recipient: "",
  sourceText: "",
  purpose: "",
  background: "",
  request: "",
  nextSteps: "",
  notes: "",
};

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function splitSourceText(text = "") {
  const lines = text
    .split(/\r?\n/)
    .map(clean)
    .filter(Boolean);

  const firstLongLine = lines.find((line) => line.length > 25) || "";
  const dateLine = lines.find((line) => /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/.test(line)) || "";
  const refLine = lines.find((line) => /\b(ref|reference|matter|file)\b/i.test(line)) || "";

  return {
    firstLongLine,
    dateLine,
    refLine,
    summary: lines.slice(0, 6).join("\n"),
  };
}

function buildDraft(form) {
  const source = splitSourceText(form.sourceText);
  const title = clean(form.documentTitle) || clean(form.documentType) || "Document";
  const client = clean(form.clientName) || "[Client name]";
  const ref = clean(form.matterReference) || clean(source.refLine) || "[Matter reference]";
  const date = clean(form.date) || clean(source.dateLine) || new Date().toISOString().split("T")[0];
  const recipient = clean(form.recipient) || "[Recipient]";
  const preparedBy = clean(form.preparedBy) || "[Prepared by]";
  const purpose = clean(form.purpose) || clean(source.firstLongLine) || "[State the purpose of this document]";
  const background = clean(form.background) || clean(source.summary) || "[Add relevant background]";
  const request = clean(form.request) || "[Set out the request, recommendation, or action required]";
  const nextSteps = clean(form.nextSteps) || "[List required next steps]";
  const notes = clean(form.notes);

  return `${title}

Date: ${date}
To: ${recipient}
Prepared by: ${preparedBy}
Client: ${client}
Matter reference: ${ref}
Document type: ${clean(form.documentType) || "General document"}

Purpose
${purpose}

Background
${background}

Request
${request}

Next steps
${nextSteps}
${notes ? `\nNotes\n${notes}` : ""}`;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DocumentTool() {
  const { form, setForm, resetForm } = usePersistentForm("lacw_document_tool_draft", EMPTY_FORM);
  const [copied, setCopied] = useState(false);
  const draft = useMemo(() => buildDraft(form), [form]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleTextFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    update("sourceText", text);
    if (!form.documentTitle || form.documentTitle === EMPTY_FORM.documentTitle) {
      update("documentTitle", file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @media print {
          .document-tool-no-print { display: none !important; }
          body { background: white !important; }
          .document-tool-print { box-shadow: none !important; border: 0 !important; }
        }
      `}</style>

      <div className="document-tool-no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <a href={createPageUrl("Home")} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetForm}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()} className="bg-purple-600 hover:bg-purple-700">
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="document-tool-no-print mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 bg-white">Local draft</Badge>
            <h1 className="text-3xl font-bold text-slate-900">Document Tool</h1>
            <p className="text-slate-500 mt-1">Turn pasted precedent text into an editable staff document.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
              {copied ? "Copied" : "Copy draft"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadText(`${clean(form.documentTitle) || "document-tool-draft"}.txt`, draft)}
            >
              <Download className="w-4 h-4" />
              Download text
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="document-tool-no-print space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Upload plain text or paste Word content below</Label>
                  <Input type="file" accept=".txt,.md,text/plain" onChange={handleTextFile} className="mt-2 cursor-pointer" />
                </div>
                <div>
                  <Label>Source text</Label>
                  <Textarea
                    value={form.sourceText}
                    onChange={(event) => update("sourceText", event.target.value)}
                    placeholder="Paste the example document text here."
                    className="mt-2 min-h-[180px] font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Document details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={form.documentTitle} onChange={(event) => update("documentTitle", event.target.value)} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Input value={form.documentType} onChange={(event) => update("documentType", event.target.value)} />
                  </div>
                  <div>
                    <Label>Client</Label>
                    <Input value={form.clientName} onChange={(event) => update("clientName", event.target.value)} />
                  </div>
                  <div>
                    <Label>Matter reference</Label>
                    <Input value={form.matterReference} onChange={(event) => update("matterReference", event.target.value)} />
                  </div>
                  <div>
                    <Label>Prepared by</Label>
                    <Input value={form.preparedBy} onChange={(event) => update("preparedBy", event.target.value)} />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Recipient</Label>
                  <Input value={form.recipient} onChange={(event) => update("recipient", event.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clipboard className="w-5 h-5 text-purple-600" />
                  Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["purpose", "Purpose"],
                  ["background", "Background"],
                  ["request", "Request"],
                  ["nextSteps", "Next steps"],
                  ["notes", "Notes"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Textarea
                      value={form[field]}
                      onChange={(event) => update(field, event.target.value)}
                      className="mt-2 min-h-[92px]"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="document-tool-print bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="document-tool-no-print border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Preview</p>
                <p className="text-xs text-slate-500">This is what prints or copies.</p>
              </div>
              <Badge variant="secondary">{draft.split(/\s+/).filter(Boolean).length} words</Badge>
            </div>
            <article className="px-7 py-8 md:px-10 md:py-10 text-slate-900">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7">{draft}</pre>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
