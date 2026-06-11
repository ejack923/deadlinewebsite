import { useState, useRef, useMemo } from "react";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2, AlertCircle, RotateCcw, Copy } from "lucide-react";
import { parseLacwDiaryFileStandalone } from "@/lib/standaloneServices";
import BillingSummary from "@/components/billing/BillingSummary";
import ClientGroup from "@/components/billing/ClientGroup";
import AppearanceRow from "@/components/billing/AppearanceRow";
import { APPEARANCE_COLOR, BILLING_PARSER_VERSION } from "@/lib/billingConstants";

export default function LACWBilling() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [actions, setActions] = useState({});
  const fileRef = useRef();

  const handleActionChange = (id, value) => {
    setActions(prev => ({ ...prev, [id]: value }));
  };

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const extracted = await parseLacwDiaryFileStandalone(file);

      if (!extracted?.entries?.length) {
        const debugText = extracted?.debug
          ? ` [debug source=${extracted.debug.selectedSource}, pdfJs=${extracted.debug.pdfJsTextLength}, stream=${extracted.debug.streamTextLength}, ocr=${extracted.debug.ocrTextLength}, normalized=${extracted.debug.normalizedLength}, context=${extracted.debug.contextEntriesCount}, merged=${extracted.debug.mergedLineCount}, fallback=${extracted.debug.fallbackEntriesCount}]`
          : "";
        setError(`No entries extracted. The PDF may be a scanned image or unreadable. Try a different file.${debugText}`);
        setLoading(false);
        return;
      }

      // Add a unique ID to each entry to be used as state keys instead of array indices
      const entriesWithId = extracted.entries.map((entry, idx) => ({
        ...entry,
        id: crypto.randomUUID ? crypto.randomUUID() : `entry_${idx}_${Date.now()}`
      }));
      
      setResult({ ...extracted, entries: entriesWithId });
      setLoading(false);
    } catch (err) {
      setError("Error processing diary: " + (err?.message || "Unknown error"));
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!result?.entries?.length) return;
    const text = result.entries.map((e, i) =>
      `#${i + 1} | ${e.date || ""} | ${e.client_name || ""} | ${e.court || ""} | ${e.appearance_type || ""} | ATLAS: ${e.atlas_claim_type || ""} | Outcome: ${e.outcome || ""}`
    ).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setActions({});
    if (fileRef.current) fileRef.current.value = "";
  };

  // Memoize grouped and filtered entries to avoid recalculating on every render (e.g. when an action is selected)
  const { all, claimable, displayed, groupedEntries, allActioned } = useMemo(() => {
    if (!result?.entries) return { all: [], claimable: [], displayed: [], groupedEntries: [], allActioned: false };
    
    const all = result.entries;
    const claimable = all.filter(e => e.claimable !== false);
    const displayed = showAll ? all : claimable;
    
    const groups = [];
    const seen = new Map();
    displayed.forEach(entry => {
      const key = (entry.client_name || "Unknown").trim().toUpperCase();
      if (!seen.has(key)) {
        seen.set(key, groups.length);
        groups.push({ clientName: entry.client_name || "Unknown", grantType: entry.grant_type, entries: [] });
      }
      groups[seen.get(key)].entries.push(entry);
    });

    const allActioned = displayed.length > 0 && displayed.every(e => !!actions[e.id]);

    return { all, claimable, displayed, groupedEntries: groups, allActioned };
  }, [result?.entries, showAll, actions]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
        <a href={createPageUrl("Home")} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">LACW Billing</p>
          <p className="text-xs text-slate-400">Diary to ATLAS claim processor</p>
          <div className="mt-1 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
            Parser {BILLING_PARSER_VERSION}
          </div>
        </div>
        {result ? (
          <button onClick={reset} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        ) : <div className="w-20" />}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Upload area */}
          {!result && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-10 h-10 text-purple-500" />
                  <p className="font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-slate-300" />
                  <p className="font-semibold text-slate-700">Drop your diary PDF here</p>
                  <p className="text-xs text-slate-400">or click to browse · PDF files only</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {file && !result && !loading && (
            <button
              onClick={handleProcess}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md"
            >
              <FileText className="w-4 h-4" />
              Process diary & extract claims
            </button>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              <p className="font-semibold text-slate-700">Reading your diary PDF…</p>
              <p className="text-xs text-slate-400">This uses AI to extract and classify each entry. May take 15–30 seconds.</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">
                    {claimable.length} claimable entries · {all.length} total extracted
                  </p>
                    {result.summary && (
                      <p className="text-xs text-purple-700 mt-0.5">
                        {result.summary}
                        {result.debug?.parserMode ? ` Parser source=${result.debug.parserMode}.` : ""}
                        {result.debug
                          ? ` Debug: source=${result.debug.selectedSource}, pdfJs=${result.debug.pdfJsTextLength}, legacy=${result.debug.legacyTextLength}, stream=${result.debug.streamTextLength}, ocr=${result.debug.ocrTextLength}, normalized=${result.debug.normalizedLength}, context=${result.debug.contextEntriesCount}, merged=${result.debug.mergedLineCount}, fallback=${result.debug.fallbackEntriesCount}`
                          : ""}
                      </p>
                    )}
                  </div>
                <button onClick={handleCopyAll} className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 border border-purple-300 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0">
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy all"}
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[["contest", "Contest"], ["plea", "Plea"], ["bail", "Bail"], ["mention", "Mention"], ["conference", "Conference"], ["sentence", "Sentence"]].map(([key, label]) => (
                    <span key={key} className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${APPEARANCE_COLOR[key]}`}>{label}</span>
                  ))}
                </div>
                <button onClick={() => setShowAll(v => !v)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 ml-2">
                  {showAll ? "Claimable only" : "Show all"}
                </button>
              </div>

              {/* Entries grouped by client */}
              <div className="space-y-3">
                {groupedEntries.map((group, gi) => (
                  group.entries.length === 1
                    ? <AppearanceRow key={group.entries[0].id} entry={group.entries[0]} action={actions[group.entries[0].id]} onActionChange={handleActionChange} />
                    : <ClientGroup key={gi} clientName={group.clientName} grantType={group.grantType} entries={group.entries} actions={actions} onActionChange={handleActionChange} />
                ))}
              </div>

              {!all.length && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">No diary entries could be extracted from this PDF. Check that the file is a text-based PDF (not a scanned image) and try again.</p>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center">AI extraction may not be 100% accurate. Always verify each entry against the original diary before submitting claims in ATLAS.</p>

              {/* Summary — show once every displayed entry has an action */}
              {allActioned && <BillingSummary entries={displayed} actions={actions} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
