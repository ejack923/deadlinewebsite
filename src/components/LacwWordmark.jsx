import { brand } from "@/lib/demoConfig";

export default function LacwWordmark({ className = "", compact = false }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-rose-500 text-white flex items-center justify-center shadow-sm">
        <span className="text-sm font-black tracking-tight">{brand.badgeText}</span>
      </div>
      <div className="leading-tight">
        <div className="text-slate-900 font-bold text-sm">{brand.wordmarkPrimary}</div>
        <div className="text-slate-700 font-semibold text-sm">{brand.wordmarkSecondary}</div>
        {!compact && <div className="text-[11px] text-slate-400">{brand.appSubtitle}</div>}
      </div>
    </div>
  );
}
