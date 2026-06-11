import { useState, useRef } from "react";
import { Upload, Loader2, Check } from "lucide-react";

async function countPdfPages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer));
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

async function getMediaHours(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const tag = file.type.startsWith("video") ? "video" : "audio";
    const media = document.createElement(tag);
    media.src = url;
    media.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(parseFloat((media.duration / 3600).toFixed(4)));
    });
    media.addEventListener("error", () => { URL.revokeObjectURL(url); resolve(0); });
  });
}

/**
 * type: "pdf" → detects page count
 * type: "video" → detects duration in hours
 * currentValue → existing field value to add to
 * onCount(value) → callback with detected value
 */
export default function FileCounter({ type = "pdf", onCount, currentValue = 0 }) {
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState(null);
  const inputRef = useRef();

  const accept = type === "pdf"
    ? "application/pdf"
    : "video/*,audio/*,.mp4,.mp3,.mov,.avi,.wav,.m4a,.m4v,.wmv";

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setDetected(null);
    const raw = type === "pdf" ? await countPdfPages(file) : await getMediaHours(file);
    const existing = parseFloat(currentValue) || 0;
    setDetected(existing > 0 ? { raw, total: raw + existing } : { raw, total: raw });
    setLoading(false);
    e.target.value = "";
  };

  const existing = parseFloat(currentValue) || 0;

  const label = detected !== null
    ? (type === "pdf"
        ? (existing > 0 ? `${detected.raw} + ${existing} = ${detected.total} pages` : `Use ${detected.total} pages`)
        : (existing > 0 ? `${(detected.raw * 60).toFixed(1)}min + ${(existing * 60).toFixed(1)}min = ${(detected.total * 60).toFixed(1)}min` : `Use ${(detected.total * 60).toFixed(1)} min`))
    : null;

  return (
    <div className="flex items-center gap-1">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={type === "pdf" ? "Upload PDF to auto-count pages" : "Upload video/audio to get duration"}
        className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
      </button>
      {detected !== null && (
        <button
          type="button"
          onClick={() => { onCount(detected.total); setDetected(null); }}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded hover:bg-emerald-100 transition-colors font-semibold whitespace-nowrap"
        >
          <Check className="w-3 h-3" />
          {label}
        </button>
      )}
    </div>
  );
}