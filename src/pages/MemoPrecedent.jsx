import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, RotateCcw, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { addToBundle } from "@/components/BundleBar";
import LacwWordmark from "@/components/LacwWordmark";
import { usePersistentForm } from "@/lib/usePersistentForm";
import { brand } from "@/lib/demoConfig";

const EMPTY_FORM = {
  ourRef: "",
  date: new Date().toISOString().split("T")[0],
  to: "",
  from: "",
  grantRefNumber: "",
  clientName: "",
  fundingSought: "",
};

export default function MemoPrecedent() {
  const { form, setForm, resetForm } = usePersistentForm("demo_memo_precedent_draft", EMPTY_FORM);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "ejackson@completelawsupport.com",
      subject: `Memo Precedent – ${form.clientName || "Unknown Client"} (${form.grantRefNumber || "No Ref"})`,
      body: `
MEMO PRECEDENT — FUNDING REQUEST
${brand.memoOrgName}

Our Ref: ${form.ourRef}
Date: ${form.date}
To: ${form.to}
From: ${form.from}
Grant Reference Number: ${form.grantRefNumber}
Client Name: ${form.clientName}

Re: Request for funding for psychiatric assessment and report

Request for funding:
${form.fundingSought}

Should you require any further information, please contact ${brand.genericContactLine}.

Yours faithfully
${form.from}
      `.trim()
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Memo Submitted</h2>
          <p className="text-slate-500 text-sm mb-6">Saved through the demo outbox flow</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSubmitted(false)} className="bg-slate-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors">Submit Another</button>
            <a href={createPageUrl("Home")} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">Back to Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>

      {/* Print View */}
      <div className="print-only" style={{ fontFamily: "Arial, sans-serif", fontSize: "11pt", color: "#000" }}>
        <style>{`@media screen { .print-only { display: none !important; } }`}</style>
        <div style={{ padding: "20mm", minHeight: "297mm", background: "white" }}>
          <div style={{ display: "flex", marginBottom: "30px", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>{brand.memoOrgName}</p>
              <p style={{ margin: "0 0 4px 0" }}>Demo address line</p>
              <p style={{ margin: "0 0 4px 0" }}>Sydney, NSW 2000</p>
              <p style={{ margin: "0 0 4px 0" }}>{brand.genericContactLine}</p>
              <p style={{ margin: "0" }}>{brand.genericWebsite}</p>
            </div>
            <div>
              <LacwWordmark compact />
            </div>
          </div>
          <div style={{ marginBottom: "30px" }}>
            <p style={{ margin: "0 0 12px 0" }}>Our Ref:  <strong>{form.ourRef}</strong></p>
            <p style={{ margin: "0 0 12px 0" }}>Date:  <strong>{form.date}</strong></p>
            <p style={{ margin: "0 0 12px 0" }}>Grant Reference Number:  <strong>{form.grantRefNumber}</strong></p>
            <p style={{ margin: "0 0 12px 0" }}>Client Name:  <strong>{form.clientName}</strong></p>
          </div>
          <p style={{ margin: "0 0 12px 0" }}>Dear {form.to}</p>
          <p style={{ margin: "0 0 12px 0", fontWeight: "bold" }}>Re: Request for funding for psychiatric assessment and report</p>
          <p style={{ margin: "0 0 12px 0" }}>I refer to our request for</p>
          <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>Request for funding</p>
          <p style={{ margin: "0 0 24px 0", whiteSpace: "pre-wrap" }}>{form.fundingSought}</p>
          <p style={{ margin: "0 0 12px 0" }}>Should you require any further information, please contact {brand.genericContactLine}.</p>
          <p style={{ margin: "24px 0 0 0", fontWeight: "bold" }}>Yours faithfully</p>
          {canvasRef.current && (
            <img src={canvasRef.current.toDataURL()} alt="Signature"
              style={{ height: "60px", marginTop: "12px", marginBottom: "12px" }} />
          )}
          <p style={{ margin: "0" }}>{form.from}</p>
        </div>
      </div>

      {/* Back nav */}
      <div className="no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <a href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              clearSignature();
            }}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Draft
          </Button>
        </div>
      </div>

      {/* Form View */}
      <div className="max-w-3xl mx-auto p-4 md:p-8 no-print">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Memo Precedent</h1>
            <p className="text-slate-500 mt-1">Create a funding request memo</p>
          </div>
          <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memo Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Our Reference</Label>
                <Input value={form.ourRef} onChange={e => set("ourRef", e.target.value)} placeholder="e.g. LAC001" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>To</Label>
                <Input value={form.to} onChange={e => set("to", e.target.value)} placeholder="e.g. Grants Officer" />
              </div>
              <div>
                <Label>From</Label>
                <Input value={form.from} onChange={e => set("from", e.target.value)} placeholder="Your name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Grant Reference Number</Label>
                <Input value={form.grantRefNumber} onChange={e => set("grantRefNumber", e.target.value)} placeholder="e.g. GR-2026-001" />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Client name" />
              </div>
            </div>
            <div>
              <Label>Request for funding</Label>
              <Textarea value={form.fundingSought} onChange={e => set("fundingSought", e.target.value)}
                placeholder="Describe the funding being sought..." rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Sign Below</Label>
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border-2 border-slate-300 rounded-lg bg-white cursor-crosshair w-full"
                style={{ touchAction: "none" }}
              />
              <Button type="button" variant="outline" onClick={clearSignature} className="mt-2 gap-2">
                <RotateCcw className="w-4 h-4" /> Clear Signature
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit + Print buttons */}
        <div className="mt-8 flex justify-between items-center gap-3">
          <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Save / Print to PDF
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                const content = `MEMO PRECEDENT\n\nOur Ref: ${form.ourRef}\nClient: ${form.clientName}\nGrant Ref: ${form.grantRefNumber}\n\nRequest for funding:\n${form.fundingSought}`;
                addToBundle("Memo Precedent", content);
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium px-6 py-2"
            >
              Add to Bundle
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-slate-700 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Memo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
