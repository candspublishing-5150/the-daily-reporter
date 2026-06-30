"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Something went wrong. Please try again.");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "36px 28px", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, background: "var(--green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 24, color: "#fff" }}>
          ✓
        </div>
        <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 22, margin: "0 0 10px" }}>
          Check your email
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, margin: "0 0 20px" }}>
          We sent a magic link to <strong style={{ color: "var(--dark)" }}>{email}</strong>.
          Click it to sign in — it expires in 1 hour.
        </p>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>
          Didn&rsquo;t get it? Check your spam folder, or{" "}
          <button
            onClick={() => setStatus("idle")}
            style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "inherit", padding: 0, fontWeight: 600 }}
          >
            try again
          </button>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "28px 28px 24px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--dark)" }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            required
            autoFocus
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid var(--border)",
              borderRadius: 2,
              fontSize: 15,
              fontFamily: "inherit",
              background: "#faf7f2",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {status === "error" && (
          <div style={{ fontSize: 13, color: "var(--red)", background: "#fdf0f1", border: "1px solid #f5c6c6", padding: "10px 12px", borderRadius: 2 }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%",
            padding: "13px",
            background: status === "loading" ? "#ccc" : "var(--red)",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontFamily: "var(--font-zilla)",
            fontWeight: 600,
            fontSize: 16,
            cursor: status === "loading" ? "wait" : "pointer",
            letterSpacing: ".01em",
          }}
        >
          {status === "loading" ? "Sending link…" : "Send magic link →"}
        </button>
      </form>
    </div>
  );
}
