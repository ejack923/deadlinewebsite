import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ClaimCosts() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <a
          href={createPageUrl("Home")}
          className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900">Claim costs</h1>
          <p className="text-slate-500 mt-2">Claim costs workspace</p>
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">
              This tile is ready and the page is connected. I can build out the claim costs workflow here next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
