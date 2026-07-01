"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#9a968c", letterSpacing: ".08em" }}>
          PASSWORD
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          style={{
            width: "100%", padding: "12px 14px",
            border: "1px solid #2c2e34", borderRadius: 2,
            fontSize: 15, fontFamily: "inherit",
            background: "#22242a", color: "#f6f1e8",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "#f98989", background: "#2a1a1a", border: "1px solid #5a2222", padding: "10px 12px", borderRadius: 2 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "13px", background: loading ? "#3d3f47" : "var(--red)",
          color: "#fff", border: "none", borderRadius: 2,
          fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 15,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
