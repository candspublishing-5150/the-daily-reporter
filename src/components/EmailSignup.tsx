"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EmailSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();

    const { error } = await supabase
      .from("subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        // duplicate — treat as success
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } else {
      setStatus("success");
    }
  }

  if (compact) {
    return (
      <div style={{ background: "var(--bg-header)", border: "1px solid var(--border)", borderRadius: 3, padding: "18px 16px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--gold)", fontWeight: 700, marginBottom: 6 }}>
          FREE WEEKLY DIGEST
        </div>
        <h3 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 15, lineHeight: 1.25, margin: "0 0 8px", color: "var(--dark)" }}>
          Get new bid leads every week
        </h3>
        <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 12px" }}>
          Join 13,000+ CA construction firms. Never sold.
        </p>
        {status === "success" ? (
          <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, padding: "10px 0" }}>
            ✓ You&rsquo;re on the list!
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 2, fontSize: 13, fontFamily: "inherit", background: "#fff", outline: "none" }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ width: "100%", padding: "9px", background: "var(--red)", color: "#fff", border: "none", borderRadius: 2, fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 13.5, cursor: status === "loading" ? "wait" : "pointer" }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe free →"}
            </button>
            {status === "error" && (
              <div style={{ fontSize: 12, color: "var(--red)" }}>{errorMsg}</div>
            )}
          </form>
        )}
      </div>
    );
  }

  // Full-width version (for homepage)
  return (
    <div style={{ background: "var(--dark)", padding: "36px 28px", borderRadius: 3, textAlign: "center" }}>
      <div style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--gold)", fontWeight: 700, marginBottom: 10 }}>
        FREE WEEKLY DIGEST
      </div>
      <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", color: "#f6f1e8", lineHeight: 1.2, margin: "0 0 10px" }}>
        Get new California bid leads in your inbox every week
      </h2>
      <p style={{ fontSize: 14, color: "#9a968c", lineHeight: 1.6, margin: "0 0 22px", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
        Join 13,000+ California construction firms. We never sell your email.{" "}
        <a href="/privacy" style={{ color: "#cfcabd" }}>Privacy policy.</a>
      </p>
      {status === "success" ? (
        <div style={{ fontSize: 16, color: "#5dd693", fontWeight: 600, padding: "14px 0" }}>
          ✓ You&rsquo;re subscribed! Look for your first digest this week.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto", flexWrap: "wrap" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{ flex: 1, minWidth: 220, padding: "12px 14px", border: "1px solid #3d3f47", borderRadius: 2, fontSize: 14, fontFamily: "inherit", background: "#22242a", color: "#f6f1e8", outline: "none" }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{ padding: "12px 22px", background: "var(--red)", color: "#fff", border: "none", borderRadius: 2, fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, cursor: status === "loading" ? "wait" : "pointer", whiteSpace: "nowrap" }}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe free →"}
          </button>
          {status === "error" && (
            <div style={{ width: "100%", fontSize: 13, color: "#f98989", marginTop: -4 }}>{errorMsg}</div>
          )}
        </form>
      )}
    </div>
  );
}
