import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailSignup from "@/components/EmailSignup";
import { createClient } from "@/lib/supabase/server";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) notFound();

  const days = daysUntil(listing.bid_date);
  const isUrgent = days !== null && days <= 7 && days >= 0;
  const isPast = days !== null && days < 0;

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 22px 60px", width: "100%" }}>

        {/* Breadcrumb */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/ads" style={{ color: "var(--muted)", textDecoration: "none" }} className="hover:text-[var(--red)] transition-colors">
            Browse Outreach Ads
          </Link>
          <span>›</span>
          <span style={{ color: "var(--dark)" }}>Listing Detail</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 36, alignItems: "start" }}>

          {/* Main content */}
          <article>
            {/* Tags */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {listing.county && (
                <span style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--red)", fontWeight: 700, background: "#fdf0f1", border: "1px solid #f5c6c6", padding: "3px 9px" }}>
                  {listing.county.toUpperCase()}
                </span>
              )}
{isPast && (
                <span style={{ fontSize: 10, letterSpacing: ".12em", color: "#fff", fontWeight: 700, background: "var(--muted)", padding: "3px 9px" }}>
                  CLOSED
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.15, margin: "0 0 10px", color: "var(--dark)" }}>
              {listing.title}
            </h1>

            {/* Agency */}
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted)", marginBottom: 24, letterSpacing: ".01em" }}>
              {listing.agency}
            </div>

            {/* Bid deadline card */}
            <div style={{
              border: isUrgent ? "2px solid var(--red)" : isPast ? "2px solid var(--border)" : "2px solid var(--dark)",
              borderRadius: 3,
              padding: "18px 22px",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              background: isUrgent ? "#fdf0f1" : "transparent",
            }}>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: ".16em", color: isUrgent ? "var(--red)" : "var(--muted)", fontWeight: 700, marginBottom: 4 }}>
                  {isPast ? "BID DATE (CLOSED)" : "BID DEADLINE"}
                </div>
                <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 22, color: isPast ? "var(--muted)" : "var(--dark)" }}>
                  {formatDate(listing.bid_date)}
                </div>
              </div>
              {!isPast && days !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 600, color: isUrgent ? "var(--red)" : "var(--dark)", lineHeight: 1 }}>
                    {days}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>DAYS LEFT</div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  Project Description
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-body)", margin: 0, whiteSpace: "pre-wrap" }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Contact / source link */}
            {listing.source_url && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  Official Source
                </h2>
                <a
                  href={listing.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--dark)", color: "#fff", padding: "10px 18px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }}
                  className="hover:opacity-80 transition-opacity"
                >
                  View official listing ↗
                </a>
              </div>
            )}

            {/* Contact info */}
            {listing.contact_info && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  Contact Information
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-body)", margin: 0, whiteSpace: "pre-wrap" }}>
                  {listing.contact_info}
                </p>
              </div>
            )}

            {/* Back link */}
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <Link
                href={listing.county ? `/ads?county=${encodeURIComponent(listing.county)}` : "/ads"}
                style={{ fontSize: 14, fontFamily: "var(--font-zilla)", fontWeight: 600, color: "var(--red)", textDecoration: "none" }}
                className="hover:underline"
              >
                ← Back to {listing.county ? `${listing.county} listings` : "all listings"}
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Run an ad CTA */}
            <div style={{ background: "var(--dark)", color: "#f6f1e8", padding: "22px 20px", borderRadius: 3 }}>
              <div style={{ fontSize: 9.5, letterSpacing: ".16em", color: "#a08a52", fontWeight: 700, marginBottom: 8 }}>GFE OUTREACH ADS</div>
              <h3 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, lineHeight: 1.2, margin: "0 0 10px" }}>
                Reach 13,000+ California contractors
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#cfcabd", margin: "0 0 16px" }}>
                Run your GFE outreach ad in The Daily Reporter — printed, emailed weekly, and posted online until your bid date.
              </p>
              <Link
                href="/portal"
                style={{ display: "block", background: "var(--red)", color: "#fff", padding: "11px 16px", textAlign: "center", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }}
                className="hover:bg-[#8c1d27] transition-colors"
              >
                Run an ad →
              </Link>
            </div>

            {/* Ad slot */}
            <Link
              href="/portal"
              style={{ display: "block", border: "1.5px dashed #c9b27e", background: "repeating-linear-gradient(135deg,#faf6ec,#faf6ec 11px,#f5efe1 11px,#f5efe1 22px)", borderRadius: 2, textDecoration: "none" }}
              className="hover:border-[var(--red)] transition-colors"
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "24px 18px", textAlign: "center", minHeight: 180 }}>
                <div style={{ fontSize: 9.5, letterSpacing: ".18em", color: "var(--gold)", fontWeight: 700 }}>SPONSOR SLOT · 300 × 600</div>
                <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: "var(--dark)" }}>Sponsor a county page</div>
                <span style={{ color: "var(--red)", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 13 }}>Reserve this slot →</span>
              </div>
            </Link>

            <EmailSignup compact />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
