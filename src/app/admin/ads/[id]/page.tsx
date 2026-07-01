import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminNav from "../../AdminNav";
import AdActionButtons from "./AdActionButtons";

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default async function AdminAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: ad, error } = await supabase.from("ads").select("*").eq("id", id).single();
  if (error || !ad) notFound();

  const statusLabel: Record<string, string> = {
    draft: "Draft", pending_review: "Pending Review",
    approved: "Approved", live: "Live", ended: "Ended",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3efe7" }}>
      <AdminNav />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 22px 72px" }}>

        {/* Breadcrumb */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)", marginBottom: 20 }}>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none" }}>Admin</Link>
          {" › "}
          <Link href="/admin/ads" style={{ color: "var(--muted)", textDecoration: "none" }}>Ads</Link>
          {" › "}
          <span style={{ color: "var(--dark)" }}>{ad.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28, alignItems: "start" }}>

          {/* Ad details */}
          <article>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "24px 24px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 22, margin: 0, flex: 1 }}>
                  {ad.headline || "(no headline)"}
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", padding: "4px 10px", borderRadius: 2,
                  background: ad.status === "pending_review" ? "#fff7e6" : ad.status === "live" ? "#e8f5ee" : "#f3f0ea",
                  color: ad.status === "pending_review" ? "#a07820" : ad.status === "live" ? "var(--green)" : "var(--muted)",
                }}>
                  {statusLabel[ad.status] || ad.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  ["Placement", `${ad.placement} · ${ad.ad_type}`],
                  ["Schedule", `${fmt(ad.start_date)} → ${fmt(ad.end_date)}`],
                  ["Budget", `$${Number(ad.budget || 0).toLocaleString()}`],
                  ["Submitted", fmt(ad.created_at)],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700, marginBottom: 4 }}>{label as string}</div>
                    <div style={{ fontSize: 14, color: "var(--dark)" }}>{value as string}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad creative */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "22px 24px", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, margin: "0 0 16px", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                Ad Creative
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["Headline", ad.headline],
                  ["Body copy", ad.body_copy],
                  ["CTA button", ad.cta_label],
                  ["CTA URL", ad.cta_url],
                  ["Accent color", ad.accent_color],
                ].map(([label, value]) => value ? (
                  <div key={label as string} style={{ display: "flex", gap: 16, paddingBottom: 14, borderBottom: "1px solid var(--border-dark)" }}>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, width: 100, flexShrink: 0, paddingTop: 2 }}>{label as string}</div>
                    <div style={{ fontSize: 14, color: "var(--dark)", flex: 1, wordBreak: "break-word" }}>
                      {label === "Accent color" ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", background: value as string, display: "inline-block", border: "1px solid var(--border)" }} />
                          {value as string}
                        </span>
                      ) : value as string}
                    </div>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Ad preview */}
            {ad.headline && (
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "22px 24px" }}>
                <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, margin: "0 0 14px" }}>Preview</h2>
                <div style={{ border: "1px solid var(--border)", borderRadius: 2, overflow: "hidden", maxWidth: 480 }}>
                  <div style={{ background: ad.accent_color || "var(--red)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, color: "#fff", flex: 1 }}>{ad.headline}</div>
                    {ad.cta_label && <div style={{ background: "#fff", color: ad.accent_color || "var(--red)", padding: "7px 12px", fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 12, borderRadius: 2, flexShrink: 0 }}>{ad.cta_label}</div>}
                  </div>
                  {ad.body_copy && <div style={{ padding: "11px 18px", fontSize: 13, color: "var(--text-body)", lineHeight: 1.55 }}>{ad.body_copy}</div>}
                  <div style={{ background: "#faf7f2", borderTop: "1px solid var(--border)", padding: "4px 10px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, letterSpacing: ".1em", color: "var(--muted)" }}>GFE OUTREACH AD · THE DAILY REPORTER</span>
                    <span style={{ fontSize: 9, color: "var(--muted)" }}>Ad</span>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Action sidebar */}
          <aside style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <AdActionButtons ad={ad} />

            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700, marginBottom: 8 }}>ADMIN NOTES</div>
              <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.6 }}>{ad.admin_notes || "—"}</div>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--muted)", fontWeight: 700, marginBottom: 8 }}>DELIVERY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Impressions", (ad.impressions || 0).toLocaleString()], ["Clicks", (ad.clicks || 0).toLocaleString()]].map(([k, v]) => (
                  <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--muted)" }}>{k as string}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
