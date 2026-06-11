import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env?.VITE_DEADLINE_GUARD_API_BASE || "http://127.0.0.1:54322";

const TABS = [
  { key: "", label: "Open" },
  { key: "needs_review", label: "Review" },
  { key: "ready_to_claim", label: "Ready to claim" },
  { key: "invoice_disbursement", label: "Disbursements" },
  { key: "missing_information", label: "Missing info" },
  { key: "possible_deadline", label: "Deadlines" },
  { key: "saved_tasks", label: "Saved tasks" },
  { key: "processed", label: "Processed" },
  { key: "dismissed", label: "Dismissed" }
];

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function formatMoney(value) {
  if (value == null || value === "") return "No amount";
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(value));
}

function riskClass(risk) {
  if (risk === "high") return "dg-inbox-risk-high";
  if (risk === "medium") return "dg-inbox-risk-medium";
  return "dg-inbox-risk-low";
}

function matterLabel(matter = {}) {
  return matter.matter_name || matter.title || matter.subject || matter.name || `Matter ${matter.matter_id || matter.id || ""}`.trim();
}

function matterMeta(matter = {}) {
  return [matter.matter_key, matter.atlas_reference, matter.queue, matter.next_action_label]
    .filter(Boolean)
    .join(" | ");
}

function normalizeMatterResults(payload = {}) {
  const candidates = payload.matters || payload.items || payload.results || payload.data || [];
  return Array.isArray(candidates) ? candidates.slice(0, 6) : [];
}

export default function InboxScanner() {
  const [items, setItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [activeQueue, setActiveQueue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading inbox scanner...");
  const [linkForms, setLinkForms] = useState({});

  const visibleItems = useMemo(() => {
    if (!activeQueue) return items;
    return items.filter((item) => item.queue === activeQueue);
  }, [activeQueue, items]);

  async function refresh(queue = activeQueue) {
    const query = queue ? `?queue=${encodeURIComponent(queue)}&include_closed=true` : "?include_closed=false";
    const [payload, savedPayload] = await Promise.all([
      apiFetch(`/api/inbox/queue${query}`),
      apiFetch("/api/inbox/queue?queue=saved_tasks&include_closed=true")
    ]);
    setItems(payload.items || []);
    setSavedItems(savedPayload.items || []);
    setSummary(payload.summary || {});
    setMessage(`${payload.items?.length || 0} inbox item${payload.items?.length === 1 ? "" : "s"} loaded.`);
  }

  async function runAction(item, action, body = {}) {
    setBusy(true);
    try {
      await apiFetch(`/api/inbox/item/${item.id}/${action}`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      await refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function updateLinkForm(itemId, patch) {
    setLinkForms((current) => ({
      ...current,
      [itemId]: {
        term: "",
        results: [],
        selectedMatterId: "",
        selectedMatterLabel: "",
        loading: false,
        ...(current[itemId] || {}),
        ...patch
      }
    }));
  }

  async function searchMatters(item) {
    const form = linkForms[item.id] || {};
    const fallbackTerm = [item.client_name, item.matter_reference, item.subject].filter(Boolean)[0] || "";
    const term = String(form.term || fallbackTerm || "").trim();
    if (!term) {
      setMessage("Enter a client, matter reference, or matter name to search.");
      return;
    }
    updateLinkForm(item.id, { loading: true, term });
    try {
      const payload = await apiFetch(`/api/matters?search=${encodeURIComponent(term)}`);
      updateLinkForm(item.id, { loading: false, results: normalizeMatterResults(payload) });
      setMessage(`Matter search returned ${normalizeMatterResults(payload).length} result${normalizeMatterResults(payload).length === 1 ? "" : "s"}.`);
    } catch (error) {
      updateLinkForm(item.id, { loading: false });
      setMessage(error.message);
    }
  }

  async function linkSelectedMatter(item) {
    const form = linkForms[item.id] || {};
    const matterId = String(form.selectedMatterId || form.term || "").trim();
    if (!matterId) {
      setMessage("Select a matter or enter a matter ID before linking.");
      return;
    }
    await runAction(item, "link-matter", {
      matter_id: matterId,
      note: form.selectedMatterLabel ? `Linked from inbox scanner to ${form.selectedMatterLabel}` : "Linked from inbox scanner"
    });
  }

  async function runDemoScan() {
    setBusy(true);
    try {
      const payload = await apiFetch("/api/inbox/scan-demo", { method: "POST", body: "{}" });
      setMessage(`Demo scan complete: ${payload.scanned_count} scanned, ${payload.created_queue_items} new queue items.`);
      await refresh("");
      setActiveQueue("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function runGmailScan() {
    setBusy(true);
    try {
      const payload = await apiFetch("/api/inbox/scan-gmail", {
        method: "POST",
        body: JSON.stringify({ max_results: 25 })
      });
      setMessage(`Gmail scan complete: ${payload.gmail_fetched_count || payload.scanned_count || 0} fetched, ${payload.created_queue_items} new queue items.`);
      await refresh("");
      setActiveQueue("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(error.message));
  }, []);

  return (
    <section className="dg-inbox">
      <style>{`
        .dg-inbox { display: grid; gap: 16px; color: #1d2228; }
        .dg-inbox-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .dg-inbox-title { display: grid; gap: 4px; }
        .dg-inbox-title h2 { margin: 0; font-size: 24px; }
        .dg-inbox-muted { color: #697683; font-size: 14px; }
        .dg-inbox-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .dg-inbox button { border: 1px solid #dde5ee; background: white; color: #1d2228; border-radius: 10px; padding: 9px 12px; cursor: pointer; }
        .dg-inbox button:disabled { opacity: 0.55; cursor: wait; }
        .dg-inbox .primary { background: #204a60; border-color: #204a60; color: white; }
        .dg-inbox-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 6px; border: 1px solid #dde5ee; border-radius: 14px; background: #fbfcfe; }
        .dg-inbox-tab-active { background: #204a60 !important; border-color: #204a60 !important; color: white !important; }
        .dg-inbox-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .dg-inbox-stat { border: 1px solid #dde5ee; border-radius: 12px; padding: 12px; background: #fffdf9; }
        .dg-inbox-stat strong { display: block; font-size: 22px; margin-top: 4px; }
        .dg-inbox-list { display: grid; gap: 10px; }
        .dg-inbox-card { border: 1px solid #dde5ee; border-radius: 12px; background: #fffdf9; padding: 14px; display: grid; gap: 10px; }
        .dg-inbox-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .dg-inbox-subject { font-weight: 700; }
        .dg-inbox-meta { color: #697683; font-size: 13px; }
        .dg-inbox-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .dg-inbox-chip { border-radius: 999px; border: 1px solid #dde5ee; padding: 5px 9px; font-size: 12px; background: #fbfcfe; }
        .dg-inbox-risk-high { border-color: #b42318; color: #b42318; background: #fff1f1; }
        .dg-inbox-risk-medium { border-color: #89692f; color: #6b4f1d; background: #fff6e8; }
        .dg-inbox-risk-low { border-color: #2f6b4f; color: #246346; background: #eefaf4; }
        .dg-inbox-card-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .dg-inbox-card-actions input { border: 1px solid #dde5ee; border-radius: 10px; padding: 9px 10px; min-width: 160px; }
        .dg-inbox-section-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
        .dg-inbox-section-head h3 { margin: 0; font-size: 18px; }
        .dg-inbox-linker { display: grid; gap: 8px; border-top: 1px solid #dde5ee; padding-top: 10px; }
        .dg-inbox-link-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .dg-inbox-link-row input { border: 1px solid #dde5ee; border-radius: 10px; padding: 9px 10px; min-width: min(100%, 280px); }
        .dg-inbox-results { display: grid; gap: 6px; }
        .dg-inbox-result { text-align: left; display: grid; gap: 2px; border-radius: 10px !important; }
        .dg-inbox-result-active { border-color: #204a60 !important; box-shadow: inset 0 0 0 1px #204a60; background: #f3f8fb !important; }
      `}</style>

      <div className="dg-inbox-header">
        <div className="dg-inbox-title">
          <h2>Inbox Scanner</h2>
          <div className="dg-inbox-muted">Operator-reviewed funding, billing, admin, and deadline signals.</div>
        </div>
        <div className="dg-inbox-actions">
          <button type="button" onClick={() => refresh()} disabled={busy}>Refresh</button>
          <button type="button" className="primary" onClick={runGmailScan} disabled={busy}>Scan Gmail</button>
          <button type="button" onClick={runDemoScan} disabled={busy}>Run demo scan</button>
        </div>
      </div>

      <div className="dg-inbox-summary">
        <div className="dg-inbox-stat"><span className="dg-inbox-muted">Open</span><strong>{summary.total_open_items || 0}</strong></div>
        <div className="dg-inbox-stat"><span className="dg-inbox-muted">High risk</span><strong>{summary.high_risk_count || 0}</strong></div>
        <div className="dg-inbox-stat"><span className="dg-inbox-muted">Ready to claim</span><strong>{summary.ready_to_claim_count || 0}</strong></div>
        <div className="dg-inbox-stat"><span className="dg-inbox-muted">Missing info</span><strong>{summary.missing_information_count || 0}</strong></div>
        <div className="dg-inbox-stat"><span className="dg-inbox-muted">Saved tasks</span><strong>{summary.saved_tasks_count || 0}</strong></div>
      </div>

      <div className="dg-inbox-tabs" role="tablist" aria-label="Inbox scanner queues">
        {TABS.map((tab) => (
          <button
            key={tab.key || "open"}
            type="button"
            className={activeQueue === tab.key ? "dg-inbox-tab-active" : ""}
            onClick={() => {
              setActiveQueue(tab.key);
              refresh(tab.key).catch((error) => setMessage(error.message));
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dg-inbox-muted">{message}</div>

      <div className="dg-inbox-list">
        {visibleItems.map((item) => {
          const linkForm = linkForms[item.id] || {};
          return (
          <article className="dg-inbox-card" key={item.id}>
            <div className="dg-inbox-card-head">
              <div>
                <div className="dg-inbox-subject">{item.subject || "Untitled message"}</div>
                <div className="dg-inbox-meta">{item.sender || "Unknown sender"}</div>
              </div>
              <span className={`dg-inbox-chip ${riskClass(item.risk_level)}`}>{item.risk_level || "review"}</span>
            </div>
            <div className="dg-inbox-chips">
              <span className="dg-inbox-chip">{String(item.category || "unknown").replaceAll("_", " ")}</span>
              <span className="dg-inbox-chip">{item.provider || "inbox"}</span>
              <span className="dg-inbox-chip">{formatMoney(item.amount)}</span>
              <span className="dg-inbox-chip">{item.due_date ? `Due ${item.due_date}` : "No due date"}</span>
              <span className="dg-inbox-chip">{item.queue}</span>
              {item.first_attachment_id && (
                <a
                  className="dg-inbox-chip"
                  href={`${API_BASE}/api/inbox/attachment/${item.first_attachment_id}/view`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View invoice
                </a>
              )}
            </div>
            <div>{item.recommended_action || "Review before taking action."}</div>
            <div className="dg-inbox-card-actions">
              {item.status !== "saved" && (
                <button type="button" onClick={() => runAction(item, "save", { note: "Saved for later review" })} disabled={busy}>Save task</button>
              )}
              <button type="button" onClick={() => runAction(item, "approve")} disabled={busy}>Approve</button>
              <button type="button" onClick={() => runAction(item, "process")} disabled={busy}>Process</button>
              <button type="button" onClick={() => runAction(item, "snooze")} disabled={busy}>Snooze</button>
              <button type="button" onClick={() => runAction(item, "dismiss")} disabled={busy}>Dismiss</button>
            </div>
            <div className="dg-inbox-linker">
              <div className="dg-inbox-link-row">
                <input
                  value={linkForm.term ?? item.client_name ?? ""}
                  onChange={(event) => updateLinkForm(item.id, {
                    term: event.target.value,
                    selectedMatterId: "",
                    selectedMatterLabel: ""
                  })}
                  placeholder="Search client, matter reference, or matter ID"
                />
                <button type="button" onClick={() => searchMatters(item)} disabled={busy || linkForm.loading}>
                  {linkForm.loading ? "Searching..." : "Find matter"}
                </button>
                <button type="button" onClick={() => linkSelectedMatter(item)} disabled={busy || !String(linkForm.selectedMatterId || linkForm.term || "").trim()}>
                  Link matter
                </button>
              </div>
              {!!linkForm.selectedMatterLabel && (
                <div className="dg-inbox-meta">Selected: {linkForm.selectedMatterLabel}</div>
              )}
              {!!linkForm.results?.length && (
                <div className="dg-inbox-results">
                  {linkForm.results.map((matter) => {
                    const id = String(matter.matter_id || matter.id || matter.matter_key || "");
                    const label = matterLabel(matter);
                    return (
                      <button
                        key={`${item.id}-${id}-${label}`}
                        type="button"
                        className={`dg-inbox-result ${String(linkForm.selectedMatterId || "") === id ? "dg-inbox-result-active" : ""}`}
                        onClick={() => updateLinkForm(item.id, {
                          selectedMatterId: id,
                          selectedMatterLabel: label,
                          term: label
                        })}
                      >
                        <strong>{label}</strong>
                        <span className="dg-inbox-meta">{matterMeta(matter) || id}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </article>
        );
        })}
      </div>

      <div className="dg-inbox-section-head">
        <h3>Saved tasks</h3>
        <span className="dg-inbox-muted">{savedItems.length} saved task{savedItems.length === 1 ? "" : "s"}</span>
      </div>

      <div className="dg-inbox-list">
        {savedItems.length ? savedItems.map((item) => (
          <article className="dg-inbox-card" key={`saved-${item.id}`}>
            <div className="dg-inbox-card-head">
              <div>
                <div className="dg-inbox-subject">{item.subject || "Untitled message"}</div>
                <div className="dg-inbox-meta">{item.sender || "Unknown sender"}</div>
              </div>
              <span className={`dg-inbox-chip ${riskClass(item.risk_level)}`}>{item.risk_level || "review"}</span>
            </div>
            <div className="dg-inbox-chips">
              <span className="dg-inbox-chip">{String(item.category || "unknown").replaceAll("_", " ")}</span>
              <span className="dg-inbox-chip">{item.provider || "inbox"}</span>
              <span className="dg-inbox-chip">{formatMoney(item.amount)}</span>
              <span className="dg-inbox-chip">{item.due_date ? `Due ${item.due_date}` : "No due date"}</span>
              {item.first_attachment_id && (
                <a
                  className="dg-inbox-chip"
                  href={`${API_BASE}/api/inbox/attachment/${item.first_attachment_id}/view`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View invoice
                </a>
              )}
            </div>
            <div>{item.recommended_action || "Review before taking action."}</div>
            <div className="dg-inbox-card-actions">
              <button type="button" onClick={() => runAction(item, "process")} disabled={busy}>Process</button>
              <button type="button" onClick={() => runAction(item, "dismiss")} disabled={busy}>Dismiss</button>
            </div>
          </article>
        )) : (
          <div className="dg-inbox-card dg-inbox-muted">Saved inbox tasks will appear here after you press Save task.</div>
        )}
      </div>
    </section>
  );
}
