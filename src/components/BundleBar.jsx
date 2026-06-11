import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, X, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const BUNDLE_KEY = "lacw_form_bundle";

/**
 * @typedef {{
 *   formName: string,
 *   content: string,
 *   addedAt: string
 * }} BundleItem
 */

/**
 * @typedef {{
 *   x: number,
 *   y: number
 * }} Position
 */

/** @returns {BundleItem[]} */
export function getBundle() {
  try {
    return JSON.parse(localStorage.getItem(BUNDLE_KEY)) || [];
  } catch {
    return [];
  }
}

/** @param {string} formName @param {string} content */
export function addToBundle(formName, content) {
  const bundle = getBundle();
  const idx = bundle.findIndex(f => f.formName === formName);
  if (idx > -1) {
    bundle[idx] = { formName, content, addedAt: new Date().toISOString() };
  } else {
    bundle.push({ formName, content, addedAt: new Date().toISOString() });
  }
  localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  window.dispatchEvent(new Event("bundle-updated"));
}

/** @param {string} formName */
export function removeFromBundle(formName) {
  const bundle = getBundle().filter(f => f.formName !== formName);
  localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  window.dispatchEvent(new Event("bundle-updated"));
}

export function clearBundle() {
  localStorage.removeItem(BUNDLE_KEY);
  window.dispatchEvent(new Event("bundle-updated"));
}

// BundleBar component
export default function BundleBar() {
  /** @type {[BundleItem[], Function]} */
  const [bundle, setBundle] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendTo, setSendTo] = useState("ejackson@completelawsupport.com");
  const [cc, setCc] = useState("");
  const [notes, setNotes] = useState("");
  /** @type {[Position, Function]} */
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  /** @type {[Position, Function]} */
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => setBundle(getBundle());
    update();
    window.addEventListener("bundle-updated", update);
    
    // Always default to bottom-left
    setPosition({ x: 24, y: window.innerHeight - 90 });
    localStorage.removeItem("bundle-bar-position");
    
    return () => window.removeEventListener("bundle-updated", update);
  }, []);

  /** @param {{ clientX: number, clientY: number }} e */
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  /** @param {{ clientX: number, clientY: number }} e */
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newPos = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    setPosition(newPos);
    localStorage.setItem("bundle-bar-position", JSON.stringify(newPos));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const isEmpty = bundle.length === 0;

  const handleSendBundle = async () => {
    setSending(true);
    const body = bundle.map((f, i) =>
      `${"=".repeat(60)}\nFORM ${i + 1}: ${f.formName}\n${"=".repeat(60)}\n\n${f.content}`
    ).join("\n\n\n");

    const fullBody = notes 
      ? `${notes}\n\n${"=".repeat(60)}\nFORMS SUBMITTED\n${"=".repeat(60)}\n\n${body}`
      : body;

    await base44.integrations.Core.SendEmail({
      to: sendTo,
      cc,
      subject: `LACW Bundle Submission — ${bundle.length} form${bundle.length > 1 ? "s" : ""} (${new Date().toLocaleDateString("en-AU")})`,
      body: fullBody,
    });

    clearBundle();
    setSending(false);
    setSent(true);
    setShowSendDialog(false);
    setSendTo("ejackson@completelawsupport.com");
    setCc("");
    setNotes("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <>
    <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Bundle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sendTo" className="text-sm">Send To</Label>
            <Input
              id="sendTo"
              type="email"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder="recipient@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cc" className="text-sm">CC (optional)</Label>
            <Input
              id="cc"
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
          <Button onClick={handleSendBundle} disabled={sending || !sendTo} className="bg-purple-600 hover:bg-purple-700">
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <div className="fixed z-[9999] pointer-events-none" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      {expanded && !isEmpty && (
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl pointer-events-auto mb-3 w-72 p-4">
          <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">Forms in bundle</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bundle.map(f => (
              <div key={f.formName} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                <span className="text-sm">{f.formName}</span>
                <button onClick={() => removeFromBundle(f.formName)} className="text-slate-400 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { clearBundle(); setExpanded(false); }}
              className="flex-1 text-slate-400 hover:text-white transition-colors text-xs px-3 py-2 rounded-lg hover:bg-slate-800">
              Clear
            </button>
            <button onClick={() => setShowSendDialog(true)} disabled={sending || sent}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50 text-xs">
              {sent ? "✓ Sent!" : sending ? "Sending..." : <><Send className="w-3 h-3" /> Send</>}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setExpanded(e => !e)}
        onMouseDown={handleMouseDown}
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl pointer-events-auto transition-all hover:scale-110 cursor-grab active:cursor-grabbing"
        title={isEmpty ? "Add forms to bundle" : `${bundle.length} form${bundle.length > 1 ? "s" : ""} in bundle`}
      >
        <div className="flex flex-col items-center gap-0.5">
          <Package className="w-5 h-5" />
          {!isEmpty && <span className="text-xs font-bold">{bundle.length}</span>}
        </div>
      </button>
    </div>
    </>
  );
}
