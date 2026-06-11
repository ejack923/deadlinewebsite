import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AuditEvidence({ documents = [], evidenceMatches = [], checklist = [], onUploadFiles, onApplyMatches, isSaving = false }) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  const uploadFiles = async (event) => {
    event.preventDefault();
    const files = [
      ...(fileInputRef.current?.files || []),
      ...(folderInputRef.current?.files || []),
    ];
    if (!files.length) return;
    setIsUploading(true);
    try {
      await onUploadFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Upload electronic file material</h2>
        <p className="mt-1 text-sm text-slate-500">Upload PDFs, DOCX files, notes, letters, invoices, claim material, or other file documents for evidence matching.</p>
        <form onSubmit={uploadFiles} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="grid gap-3 md:grid-cols-2">
            <input ref={fileInputRef} type="file" multiple className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
            <input ref={folderInputRef} type="file" multiple className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={isUploading || isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60">
            <Upload className="h-4 w-4" />
            Upload and scan
          </button>
        </form>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Evidence matches</h2>
            <p className="mt-1 text-sm text-slate-500">{documents.length} document(s), {evidenceMatches.length} proposed match(es)</p>
          </div>
          <button type="button" onClick={onApplyMatches} disabled={!evidenceMatches.length || isSaving} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-60">
            Mark matched items complete
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {evidenceMatches.length === 0 ? (
            <p className="text-sm text-slate-500">No evidence matches yet.</p>
          ) : evidenceMatches.map((match) => {
            const item = checklist.find((check) => check.checklistKey === match.checklistKey);
            const document = documents.find((doc) => doc.id === match.documentId);
            return (
              <article key={match.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800">{match.confidence}% confidence</span>
                <h3 className="mt-2 font-semibold text-slate-950">{item?.checklistLabel || match.checklistKey}</h3>
                <p className="mt-1 text-sm text-slate-600">{match.evidenceLabel} from {document?.fileName || "uploaded document"}</p>
                {match.evidenceExcerpt && <p className="mt-2 text-sm text-slate-700">{match.evidenceExcerpt}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
