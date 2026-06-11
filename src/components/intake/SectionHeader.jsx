import { cn } from "@/lib/utils";

/**
 * @param {{
 *   number?: string,
 *   title: string,
 *   className?: string
 * }} props
 */
export default function SectionHeader({ number, title, className }) {
  return (
    <div className={cn("flex items-center gap-3 mb-6 pt-8 first:pt-0", className)}>
      {number && (
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
          {number}
        </span>
      )}
      <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
