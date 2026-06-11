import { isDemoMode } from "@/lib/demoConfig";

export default function DemoBanner() {
  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-xs font-semibold tracking-wide text-amber-900">
      Demo Version - sample branding, local-only actions, and non-production data
    </div>
  );
}
