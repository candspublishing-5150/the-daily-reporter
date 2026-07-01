import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import AdminNav from "./AdminNav";

export const metadata: Metadata = { title: "Admin Dashboard — TDR" };

function statusColor(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    pending_review: { bg: "#fff7e6", color: "#a07820" },
    approved:       { bg: "#e8f5ee", color: "#2f7d52" },
    live:           { bg: "#e8f5ee", color: "#2f7d52" },
    draft:          { bg: "#f3f0ea", color: "#7a7668" },
    ended:          { bg: "#f3f0ea", color: "#7a7668" },
  };
  return map[status] || { bg: "#f3f0ea", color: "#7a7668" };
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { data: pendingAds },
    { data: allAds, count: adCount },
    { data: subscribers, count: subCount },
    { data: invoices },
    { data: editions },
  ] = await Promise.all([
    supabase.from("ads").select("*").eq("status", "pending_review").order("created_at", { ascending: false }),
    supabase.from("ads").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(50),
    supabase.from("subscribers").select("*", { count: "exact" }).eq("is_active", true),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("editions").select("*").order("publish_date", { ascending: false }).limit(10),
  ]);

  const totalRevenue = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;
  const pendingRevenue = invoices?.filter(i => i.status === "unpaid").reduce((s, i) => s + Number(i.amount), 0) || 0;
  const liveAds = allAds?.filter(a => a.status === "live") || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f3efe7" }}>
      <AdminNav />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 22px 72px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
          {[
            { label: "Pending Review", value: (pendingAds?.length || 0).toString(), alert: (pendingAds?.length || 0) > 0 },
            { label: "Live Ads",       value: liveAds.length.toString(), alert: false },
            { label: "Subscribers",    value: (subCount || 0).toLocaleString(), alert: false },
            { label: "Revenue (paid)", value: `$${totalRevenue.toLocaleString()}`, alert: false },
            { label: "Pending payment",value: `$${pendingRevenue.toLocaleString()}`, alert: pendingRevenue > 0 },
          ].map(({ label, value, alert }) => (
            <div key={label} style={{ background: alert ? "#fff7e6" : "#fff", border: `1px solid ${alert ? "#f0d080" : "var(--border)"}`, borderRadius: 3, padding: "16px 18px" }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".1em", color: alert ? "#a07820" : "var(--muted)", fontWeight: 700, marginBottom: 6 }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: alert ? "#a07820" : "var(--dark)" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Pending review queue */}
        {pendingAds && pendingAds.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f0a84a", display: "inline-block" }} />
              Needs Review ({pendingAds.length})
              <span style={{ flex: 1, height: 2, background: "#f0d080" }} />
            </h2>
            <div style={{ background: "#fff", border: "1px solid #f0d080", borderRadius: 3, overflow: "hidden" }}>
              {pendingAds.map((ad, i) => (
                <div key={ad.id} style={{ display: "grid", gridTemplateColumns: "1fr 130px 160px 120px 100px", gap: 0, padding: "16px 20px", borderBottom: i < pendingAds.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{ad.headline || "(no headline)"}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{ad.admin_notes || `${ad.placement} · ${ad.ad_type}`}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)" }}>{fmt(ad.created_at)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)" }}>{fmt(ad.start_date)} → {fmt(ad.end_date)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14 }}>${Number(ad.budget || 0).toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/admin/ads/${ad.id}`}
                      style={{ padding: "7px 12px", background: "var(--dark)", color: "#fff", fontSize: 12, fontFamily: "var(--font-zilla)", fontWeight: 600, borderRadius: 2, textDecoration: "none" }}>
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

          {/* All ads table */}
          <section>
            <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 10 }}>
              All Ads
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>({adCount || 0} total)</span>
              <span style={{ flex: 1, height: 2, background: "var(--border)" }} />
            </h2>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px", padding: "10px 18px", background: "#faf7f2", borderBottom: "1px solid var(--border)", fontSize: 10.5, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700 }}>
                <span>AD</span><span>STATUS</span><span>BUDGET</span><span>ACTION</span>
              </div>
              {(!allAds || allAds.length === 0) && (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No ads yet.</div>
              )}
              {allAds?.map((ad, i) => {
                const sc = statusColor(ad.status);
                return (
                  <div key={ad.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px", padding: "13px 18px", borderBottom: i < (allAds.length - 1) ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{ad.headline || "(no headline)"}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{ad.placement} · {fmt(ad.start_date)}</div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", padding: "3px 8px", background: sc.bg, color: sc.color, borderRadius: 2, display: "inline-block" }}>
                      {ad.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>${Number(ad.budget || 0).toLocaleString()}</span>
                    <Link href={`/admin/ads/${ad.id}`} style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>Edit</Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Invoices */}
            <section>
              <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
                Recent Invoices <span style={{ flex: 1, height: 2, background: "var(--border)" }} />
              </h2>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden" }}>
                {(!invoices || invoices.length === 0) && (
                  <div style={{ padding: "20px", color: "var(--muted)", fontSize: 13 }}>No invoices yet.</div>
                )}
                {invoices?.map((inv, i) => (
                  <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < invoices.length - 1 ? "1px solid var(--border)" : "none", gap: 12 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)" }}>
                      #{inv.id.slice(0, 8).toUpperCase()}<br />
                      <span style={{ fontSize: 10.5 }}>{fmt(inv.created_at)}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14 }}>${Number(inv.amount).toLocaleString()}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", padding: "3px 8px", borderRadius: 2,
                      background: inv.status === "paid" ? "#e8f5ee" : inv.status === "refunded" ? "#fff7e6" : "#fdf0f1",
                      color: inv.status === "paid" ? "var(--green)" : inv.status === "refunded" ? "#a07820" : "var(--red)",
                    }}>
                      {inv.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Editions */}
            <section>
              <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
                Editions <span style={{ flex: 1, height: 2, background: "var(--border)" }} />
              </h2>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <Link href="/admin/editions/new" style={{ display: "inline-block", background: "var(--dark)", color: "#fff", padding: "8px 14px", fontSize: 13, fontFamily: "var(--font-zilla)", fontWeight: 600, borderRadius: 2, textDecoration: "none" }}>
                    + Upload new edition
                  </Link>
                </div>
                {(!editions || editions.length === 0) && (
                  <div style={{ padding: "16px", color: "var(--muted)", fontSize: 13 }}>No editions in database yet.</div>
                )}
                {editions?.map((ed, i) => (
                  <div key={ed.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < editions.length - 1 ? "1px solid var(--border)" : "none", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontFamily: "var(--font-zilla)", fontWeight: 600 }}>{ed.name}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{fmt(ed.publish_date)}</div>
                    </div>
                    {ed.flipsnack_url && (
                      <a href={ed.flipsnack_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>View ↗</a>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
