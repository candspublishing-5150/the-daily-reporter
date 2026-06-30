import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignOutButton from "./SignOutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Campaigns — The Daily Reporter",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    draft:          { label: "Draft",           bg: "#f3f0ea", color: "#7a7668" },
    pending_review: { label: "Pending Review",  bg: "#fff7e6", color: "#a07820" },
    approved:       { label: "Approved",        bg: "#e8f5ee", color: "#2f7d52" },
    live:           { label: "Live",            bg: "#e8f5ee", color: "#2f7d52" },
    ended:          { label: "Ended",           bg: "#f3f0ea", color: "#7a7668" },
  };
  const s = map[status] || { label: status, bg: "#f3f0ea", color: "#7a7668" };
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", padding: "3px 9px", background: s.bg, color: s.color, borderRadius: 2 }}>
      {s.label.toUpperCase()}
      {status === "live" && (
        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--green)", marginLeft: 5, verticalAlign: "middle" }} />
      )}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DeliveryBar({ impressions, budget }: { impressions: number; budget: number | null }) {
  if (!budget || budget === 0) return <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>;
  const estTotal = Math.round(budget * 80);
  const pct = Math.min(100, Math.round((impressions / estTotal) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct >= 90 ? "var(--red)" : "var(--green)", transition: "width .3s" }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{pct}%</span>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, campaign_ads(ad_id, ads(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const liveAds = ads?.filter((a) => a.status === "live") || [];
  const totalImpressions = ads?.reduce((s, a) => s + (a.impressions || 0), 0) || 0;
  const totalSpend = invoices?.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;
  const totalClicks = ads?.reduce((s, a) => s + (a.clicks || 0), 0) || 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 22px 72px", width: "100%" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--gold)", fontWeight: 700, marginBottom: 6 }}>ADVERTISER DASHBOARD</div>
            <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(20px,2.8vw,30px)", margin: "0 0 4px" }}>
              My Campaigns
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{user.email}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a
              href="/portal"
              style={{ display: "inline-block", background: "var(--red)", color: "#fff", padding: "10px 18px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }}
            >
              + New campaign
            </a>
            <SignOutButton />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 36 }}>
          {[
            { label: "Active Campaigns", value: liveAds.length.toString(), mono: false },
            { label: "Total Impressions", value: totalImpressions.toLocaleString(), mono: true },
            { label: "Total Spend", value: `$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, mono: true },
            { label: "Avg. CTR", value: `${ctr}%`, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "18px 18px 16px" }}>
              <div style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--muted)", fontWeight: 600, marginBottom: 8 }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: mono ? "var(--font-mono)" : "var(--font-zilla)", fontWeight: 700, fontSize: 26, lineHeight: 1, color: "var(--dark)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* No campaigns state */}
        {(!ads || ads.length === 0) && (
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "52px 28px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
              No campaigns yet
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              Launch your first GFE outreach ad and reach 13,000+ California construction firms.
            </p>
            <a
              href="/portal"
              style={{ display: "inline-block", background: "var(--red)", color: "#fff", padding: "12px 24px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 15, borderRadius: 2, textDecoration: "none" }}
            >
              Run your first ad →
            </a>
          </div>
        )}

        {/* Ads table */}
        {ads && ads.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 10 }}>
              Your Ads
              <span style={{ flex: 1, height: 2, background: "var(--border)" }} />
            </h2>

            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 180px 120px 90px 80px", gap: 0, background: "#faf7f2", borderBottom: "1px solid var(--border)", padding: "10px 20px", fontSize: 10.5, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700 }}>
                <span>AD</span>
                <span>STATUS</span>
                <span>DATES</span>
                <span>DELIVERY</span>
                <span>SPEND</span>
                <span>CTR</span>
              </div>

              {ads.map((ad, i) => {
                const adCtr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "—";
                return (
                  <div
                    key={ad.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 110px 180px 120px 90px 80px",
                      gap: 0,
                      padding: "16px 20px",
                      borderBottom: i < ads.length - 1 ? "1px solid var(--border)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 15, marginBottom: 3, lineHeight: 1.2 }}>
                        {ad.headline || "(Untitled ad)"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                        {ad.ad_type === "outreach" ? "GFE Outreach" : "Display"} · {ad.placement || "—"}
                      </div>
                    </div>
                    <div><StatusBadge status={ad.status} /></div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.7 }}>
                      <div>{formatDate(ad.start_date)}</div>
                      <div>→ {formatDate(ad.end_date)}</div>
                    </div>
                    <div>
                      <DeliveryBar impressions={ad.impressions || 0} budget={ad.budget} />
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                        {(ad.impressions || 0).toLocaleString()} impr.
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--dark)" }}>
                      ${Number(ad.budget || 0).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>
                      {adCtr}{adCtr !== "—" ? "%" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Invoices */}
        {invoices && invoices.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 10 }}>
              Invoices
              <span style={{ flex: 1, height: 2, background: "var(--border)" }} />
            </h2>

            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px", padding: "10px 20px", background: "#faf7f2", borderBottom: "1px solid var(--border)", fontSize: 10.5, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700 }}>
                <span>INVOICE</span>
                <span>DATE</span>
                <span>AMOUNT</span>
                <span>STATUS</span>
              </div>
              {invoices.map((inv, i) => (
                <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px", padding: "14px 20px", borderBottom: i < invoices.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>#{inv.id.slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{formatDate(inv.created_at)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>${Number(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                  <div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", padding: "3px 9px", borderRadius: 2,
                      background: inv.status === "paid" ? "#e8f5ee" : inv.status === "refunded" ? "#fff7e6" : "#fdf0f1",
                      color: inv.status === "paid" ? "var(--green)" : inv.status === "refunded" ? "#a07820" : "var(--red)",
                    }}>
                      {inv.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
