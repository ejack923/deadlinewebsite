import { useState } from "react";
import { createPageUrl } from "@/utils";
import ChargeSelector from "@/components/aid/ChargeSelector";
import { ArrowLeft, Printer, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MATTER_OPTIONS = {
  "Civil Law": [
    "Victims Legal Service",
    "Civil Law Guideline 10",
    "Transfer from Another Office",
    "Migration Matters (Guideline 3.1 Only)",
    "Migration Matters (Guideline 3.2 Only)",
    "Simplified Process - Victims Financial Assistance Scheme",
    "Crimes Mental Impairment Act",
    "VLA Assessed - Evictions at VCAT",
    "VLA Assessed - Infringements",
    "VLA Assessed - Other Commonwealth Entitlement Matters",
    "VLA Assessed - Other Commonwealth Equality Matters",
    "VLA Assessed - Other Commonwealth Matters",
    "VLA Assessed - Other State Matters",
    "VLA Assessed - Public Interest & Strategic Litigation Guideline",
    "VLA Assessed - Supreme Court Guideline",
    "VLA Assessed - VETS Administrative Appeals Tribunal",
    "VLA Assessed - VETS Federal Appeals",
  ],
  "Criminal Law": [
    "Adult - Indictable (Committal/Plea/Bail)",
    "Adult - County Court Appeal",
    "Adult - Court of Appeal / High Court / Public Interest",
    "Adult - Indictable (County and Supreme Court)",
    "Adult - Summary (including indictable offences heard summarily)",
    "Youth - Appeal",
    "Youth - Indictable (Offences that cannot be determined summarily)",
    "Youth - Summary (including indictable offences determined summarily)",
    "Transfer from Another Office",
    "Serious Offenders Act",
  ],
  "Family Law": [
    "Transfer from Another Office",
    "Simplified Process - Child Support",
    "Simplified Process - Information/Location/Recovery/Enforcement Orders",
    "Simplified Process - FDRS & Stage 2",
    "Simplified Process - Trial",
    "VLA Assessed - Child Support",
    "VLA Assessed - Information/Location/Recovery/Enforcement Orders",
    "VLA Assessed - Family Law Property Program",
    "VLA Assessed - FDRS & Stage 2",
    "VLA Assessed - Trial",
    "VLA Assessed - Appeals",
    "Child Protection/Appeal/Judicial Review/VCAT",
    "Simplified Process - Family Violence",
    "Simplified Process - Personal Safety Intervention Order",
    "VLA Assessed - Family Violence Appeals in the County Court",
    "VLA Assessed - Personal Safety Appeals in the County Court",
  ],
};

function MatterTypeSelector({ value, onChange }) {
  const [openGroups, setOpenGroups] = useState({ "Civil Law": false, "Criminal Law": false, "Family Law": false });

  const toggle = (item) => {
    const current = value || [];
    if (current.includes(item)) {
      onChange(current.filter(v => v !== item));
    } else {
      onChange([...current, item]);
    }
  };

  const toggleGroup = (group) => setOpenGroups(g => ({ ...g, [group]: !g[group] }));

  const selected = value || [];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {Object.entries(MATTER_OPTIONS).map(([group, items]) => {
        const groupSelected = items.filter(i => selected.includes(i)).length;
        return (
          <div key={group} className="border-b border-slate-100 last:border-b-0">
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{group}</span>
                {groupSelected > 0 && (
                  <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{groupSelected} selected</span>
                )}
              </div>
              <span className="text-slate-400 text-xs">{openGroups[group] ? "▲" : "▼"}</span>
            </button>
            {openGroups[group] && (
              <div className="px-4 py-2 space-y-1 bg-white">
                {items.map(item => (
                  <label key={item} className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-slate-50 rounded px-1">
                    <input
                      type="checkbox"
                      checked={selected.includes(item)}
                      onChange={() => toggle(item)}
                      className="w-4 h-4 accent-purple-600 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {selected.length > 0 && (
        <div className="px-4 py-2 bg-purple-50 border-t border-purple-100">
          <p className="text-xs text-purple-700 font-medium">{selected.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  client_surname: "",
  client_first_name: "",
  file_no: "",
  custody_status: "",
  matter_types: [],
  funding_types: "",
  charges: [],
  certified_by: "",
  proof_of_means: "",
  proof_of_means_notes: "",
  assigned_to: "",
  next_court_date: "",
  court_location: "",
  notes: "",
};

const STAFF = ["AM", "CC", "BJ", "JW", "BU", "MZ", "CB", "EC", "EM", "MP", "RC"];

export default function ApplyForAid() {
  const [form, setForm] = useState(EMPTY_FORM);
  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const today = new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between print:hidden">
        <a href={createPageUrl("Home")} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">Aid Request</p>
          <p className="text-xs text-slate-400">Law and Advocacy Centre for Women</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setForm(EMPTY_FORM)} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1.5 bg-purple-600 hover:bg-purple-700">
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block max-w-3xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between border-b border-slate-300 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Aid Request</h1>
            <p className="text-sm text-slate-500">Law and Advocacy Centre for Women</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Date: {today}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Client & Matter */}
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Client &amp; Matter Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Surname *</Label>
                <Input value={form.client_surname} onChange={e => update("client_surname", e.target.value)} placeholder="Family name" />
              </div>
              <div className="space-y-2">
                <Label>Client First Name *</Label>
                <Input value={form.client_first_name} onChange={e => update("client_first_name", e.target.value)} placeholder="Given name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>File No</Label>
              <Input value={form.file_no} onChange={e => update("file_no", e.target.value)} placeholder="e.g. 233623" />
            </div>

            <div className="space-y-2">
              <Label>Custody Status</Label>
              <Select value={form.custody_status} onValueChange={v => update("custody_status", v)}>
                <SelectTrigger><SelectValue placeholder="Select custody status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="In custody (DPFC)">In custody (DPFC)</SelectItem>
                  <SelectItem value="In custody (remand)">In custody (remand)</SelectItem>
                  <SelectItem value="In custody (sentenced)">In custody (sentenced)</SelectItem>
                  <SelectItem value="On bail">On bail</SelectItem>
                  <SelectItem value="On remand (community)">On remand (community)</SelectItem>
                  <SelectItem value="Summons / attending">Summons / attending</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Matter Type(s)</Label>
              <MatterTypeSelector value={form.matter_types} onChange={v => update("matter_types", v)} />
            </div>

            <div className="space-y-2">
              <Label>Charge(s)</Label>
              <ChargeSelector value={form.charges} onChange={(v) => update("charges", v)} />
            </div>

            <div className="space-y-2">
              <Label>Funding Type(s)</Label>
              <Input value={form.funding_types} onChange={e => update("funding_types", e.target.value)} placeholder="e.g. VLA*, Aid pending" />
              <p className="text-xs text-slate-400">Include asterisk for provisional grants</p>
            </div>
          </CardContent>
        </Card>

        {/* Certification & Means */}
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Certification &amp; Proof of Means</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Certified By</Label>
              <Select value={form.certified_by} onValueChange={v => update("certified_by", v)}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {STAFF.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Confirmed Proof of Means</Label>
              <Select value={form.proof_of_means} onValueChange={v => update("proof_of_means", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Exempt">Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proof of Means Notes</Label>
              <Input
                value={form.proof_of_means_notes}
                onChange={e => update("proof_of_means_notes", e.target.value)}
                placeholder="e.g. Centrelink payments ceased while client is in DPFC"
              />
            </div>
          </CardContent>
        </Card>

        {/* Court & Assignment */}
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-lg">Court &amp; Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={form.assigned_to} onValueChange={v => update("assigned_to", v)}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {STAFF.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Court Date</Label>
                <Input type="date" value={form.next_court_date} onChange={e => update("next_court_date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Court Location</Label>
                <Input value={form.court_location} onChange={e => update("court_location", e.target.value)} placeholder="e.g. Melbourne County Court" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={e => update("notes", e.target.value)}
                placeholder="Any additional notes..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-8 print:hidden">
          <Button variant="outline" onClick={() => setForm(EMPTY_FORM)} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button onClick={() => window.print()} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>
      </div>
    </div>
  );
}