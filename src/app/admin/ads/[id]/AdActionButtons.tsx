"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdActionButtons({ ad }: { ad: { id: string; status: string } }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    setError("");
    const res = await fetch(`/api/admin/ads/${ad.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setError("Update failed. Try again.");
    }
    setLoading(null);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "18px 18px 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700, marginBottom: 12 }}>ACTIONS</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ad.status === "pending_review" && (
          <>
            <button
              onClick={() => updateStatus("approved")}
              disabled={!!loading}
              style={{ width: "100%", padding: "11px", background: "var(--green)", color: "#fff", border: "none", borderRadius: 2, fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer" }}
            >
              {loading === "approved" ? "Approving…" : "✓ Approve"}
            </button>
            <button
              onClick={() => updateStatus("draft")}
              disabled={!!loading}
              style={{ width: "100%", padding: "11px", background: "var(--red)", color: "#fff", border: "none", borderRadius: 2, fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer" }}
            >
              {loading === "draft" ? "Rejecting…" : "✗ Reject (send back to draft)"}
            </button>
          </>
        )}

        {ad.status === "approved" && (
          <button
            onClick={() => updateStatus("live")}
            disabled={!!loading}
            style={{ width: "100%", padding: "11px", background: "var(--green)", color: "#fff", border: "none", borderRadius: 2, fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer" }}
          >
            {loading === "live" ? "Going live…" : "Set Live"}
          </button>
        )}

        {ad.status === "live" && (
          <button
            onClick={() => updateStatus("ended")}
            disabled={!!loading}
            style={{ width: "100%", padding: "11px", background: "#fff", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 2, fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, cursor: loading ? "wait" : "pointer" }}
          >
            {loading === "ended" ? "Ending…" : "End campaign"}
          </button>
        )}

        {(ad.status === "draft" || ad.status === "ended") && (
          <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>
            No actions available for {ad.status} ads.
          </div>
        )}
      </div>

      {error && <div style={{ fontSize: 12.5, color: "var(--red)", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
