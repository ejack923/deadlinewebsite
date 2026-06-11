import { brand } from "@/lib/demoConfig";

export default function PrintView({ form, travelLegs = [] }) {
  const prosecution = [form.prosecution, form.local_council, form.other_prosecution].filter(Boolean).join(" / ");
  const courtDisplay = form.court_type === "OTHER" ? form.other_court_type : form.court_type;
  const courtLocation = form.court_location_regional || form.court_location || "";
  const total = form.fee_rows.reduce((s, r) => s + (parseFloat(r.quantity) || 1) * (parseFloat(r.amount) || 0), 0);

  const listingDate = form.listing_date
    ? new Date(form.listing_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()
    : "";

  const validTravelLegs = travelLegs.filter(l => l.estimatedKm != null && l.estimatedKm > 0);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#000", margin: 0, padding: 0 }}>
      <style>{`
        @media screen { .print-only { display: none !important; } }
        @media print { @page { margin: 15mm 15mm; } }
      `}</style>
      <div className="print-only">
        <div style={{ display: "flex", minHeight: "240mm", gap: 0 }}>

          {/* LEFT COLUMN */}
          <div style={{ width: "42%", borderRight: "1px solid #000", padding: "20mm 10mm 10mm 10mm", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <span style={{ fontWeight: "bold" }}>CORAM:</span>{" "}
              <span>{form.coram || ""}</span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>CONTRA:</span>{" "}
              <span>{form.contra || ""}</span>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>OUTCOME:</span>{" "}
              <span style={{ whiteSpace: "pre-wrap" }}>{form.outcome || ""}</span>
            </div>
            {form.notes && (
              <div style={{ whiteSpace: "pre-wrap" }}>{form.notes}</div>
            )}
            <div style={{ marginTop: "8px" }}>
              <p style={{ margin: "0 0 4px 0" }}>Please see outcome memo for further information.</p>
              <p style={{ margin: "0 0 32px 0" }}>Thank you for your instructions.</p>
              <p style={{ margin: "0 0 4px 0" }}>Kind regards</p>
              <div style={{ height: "40px" }} />
              <p style={{ margin: 0 }}>{form.counsel_name || ""}</p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: 1, padding: "20mm 10mm 10mm 16mm" }}>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0", fontWeight: "bold" }}>IN THE {courtDisplay}</p>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>OF VICTORIA</p>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>AT {courtLocation}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 12px 0", fontWeight: "bold" }}>BETWEEN</p>
              <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>{prosecution}</p>
              <p style={{ margin: "0 0 8px 0" }}>and</p>
              <p style={{ margin: "0", fontWeight: "bold" }}>{form.accused_name}</p>
            </div>

            <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", padding: "8px 0", marginBottom: "20px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                BRIEF TO COUNSEL TO APPEAR{listingDate ? ` ON ${listingDate}` : ""}
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {form.counsel_name && (
                <div style={{ display: "flex", gap: "12px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "bold", minWidth: "60px" }}>Counsel:</span>
                  <span style={{ fontWeight: "bold" }}>{form.counsel_name}</span>
                </div>
              )}
              {form.counsel_clerk && (
                <div style={{ display: "flex", gap: "12px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "bold", minWidth: "60px" }}>Clerk:</span>
                  <span style={{ fontWeight: "bold" }}>{form.counsel_clerk}</span>
                </div>
              )}
              {form.fee_rows.filter(r => r.fee_type).map((row, i) => {
                const desc = row.fee_type === "__OTHER__" ? row.other_description : row.fee_type;
                const qty = parseFloat(row.quantity) || 1;
                const amt = parseFloat(row.amount) || 0;
                const lineTotal = qty * amt;
                return (
                  <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "bold", minWidth: "60px" }}>Fee:</span>
                    <span>{desc}{qty > 1 ? ` x${qty}` : ""} — <strong>${lineTotal.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                );
              })}
              {validTravelLegs.map((leg, i) => {
                const claimableKm = Math.max(0, leg.estimatedKm * 2 - 80);
                const travelFee = claimableKm * 0.83;
                return (
                  <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "bold", minWidth: "60px" }}>Travel:</span>
                    <span>{leg.from} → {leg.to} — {claimableKm} km claimable — <strong>${travelFee.toFixed(2)}</strong></span>
                  </div>
                );
              })}
              {total > 0 && form.fee_rows.filter(r => r.fee_type).length > 1 && (
                <div style={{ display: "flex", gap: "12px", marginTop: "4px", borderTop: "1px solid #000", paddingTop: "4px" }}>
                  <span style={{ fontWeight: "bold", minWidth: "60px" }}>Total:</span>
                  <span style={{ fontWeight: "bold" }}>${total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "16px" }}>
              <p style={{ margin: "0 0 4px 0" }}>{brand.memoOrgName}</p>
              <p style={{ margin: "0 0 4px 0" }}>Demo address line</p>
              <p style={{ margin: "0 0 4px 0" }}>Sydney, NSW 2000</p>
              {form.file_reference && (
                <p style={{ margin: "0 0 4px 0" }}>Ref Number: {form.file_reference}</p>
              )}
              <p style={{ margin: "0 0 4px 0" }}>Email: {brand.genericContactLine}</p>
              <p style={{ margin: "0 0 4px 0" }}>Web: {brand.genericWebsite}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
