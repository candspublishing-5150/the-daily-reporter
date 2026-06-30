import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CurrentIssues from "@/components/CurrentIssues";
import EmailSignup from "@/components/EmailSignup";

const SECONDARY_ADS = [
  { kicker: "STEVE P. RADOS, INC.", title: "Western Trunk Line Project – Phase 1", meta: "Bid date: June 30, 2026 at 2:00 PM" },
  { kicker: "CRATUS, INC.", title: "8-Inch Ductile Iron Water Main Replacement, Sewer Replacement, and Paving Renovation", meta: "Bid Date: July 2, 2026 at 12:00 PM" },
  { kicker: "SULLY-MILLER CONTRACTING", title: "San Pedro Waterfront – Harbor Boulevard Roadway and 22nd Street Parking Lot Improvements", meta: "Bid date: July 8, 2026 at 2:45 PM" },
];

const LATEST_ADS = [
  { initial: "A", brand: "Anchor Mental Health", vertical: "HEALTHCARE", title: "Adult women aren't developing ADHD late — they've been masking it for decades", quote: "A 73% jump in women over 35 seeking evaluation isn't an epidemic — it's a correction.", metric: "Placed via Qwoted · DR 81" },
  { initial: "N", brand: "Northwind Analytics", vertical: "B2B SAAS", title: "The hidden cost of dashboard sprawl on mid-market finance teams", quote: "Teams now juggle nine reporting tools on average — and fully trust none of them.", metric: "Editorial feature · DR 76" },
  { initial: "C", brand: "Cedar & Sage Home", vertical: "ECOMMERCE", title: "What 12,000 orders taught us about packaging that survives shipping", quote: "Recyclable isn't the bar anymore — buyers want zero-waste that still protects the product.", metric: "Product story · DR 72" },
  { initial: "B", brand: "Beacon Credit Union", vertical: "FINANCIAL SERVICES", title: "How first-time buyers are actually closing deals at 6% mortgage rates", quote: "Rate buy-downs and assumable loans are quietly back — most buyers just don't ask.", metric: "Expert byline · DR 84" },
  { initial: "S", brand: "Sentinel Edge", vertical: "CYBERSECURITY", title: "The invoice-spoofing tactic now targeting construction procurement teams", quote: "Attackers study your bid calendar — the fake change-order lands the week a contract closes.", metric: "Bylined op-ed · DR 79" },
];

function AdSlot({ dims, label }: { dims: string; label: string }) {
  return (
    <Link href="/portal" className="block hover:border-[var(--red)] transition-colors"
      style={{ border: "1.5px dashed #c9b27e", background: "repeating-linear-gradient(135deg,#faf6ec,#faf6ec 11px,#f5efe1 11px,#f5efe1 22px)", borderRadius: 2 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "22px 18px", textAlign: "center", minHeight: 180 }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".18em", color: "var(--gold)", fontWeight: 700 }}>{dims}</div>
        <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 18, lineHeight: 1.15 }}>{label}</div>
        <span style={{ color: "var(--red)", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 13.5 }}>Reserve this slot →</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 22px 60px", width: "100%" }}>

        {/* Leaderboard self-serve slot */}
        <Link href="/portal" className="block mb-6 hover:border-[var(--red)] transition-colors"
          style={{ border: "1.5px dashed #c9b27e", background: "repeating-linear-gradient(135deg,#faf6ec,#faf6ec 11px,#f5efe1 11px,#f5efe1 22px)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderRadius: 2, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 9.5, letterSpacing: ".18em", color: "var(--gold)", fontWeight: 700, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>AD SPACE</div>
            <div>
              <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 19, color: "var(--dark)" }}>Your placement belongs here — 970 × 90 leaderboard</div>
              <div style={{ fontSize: 13, color: "#6b6d75", marginTop: 3 }}>Reach 13,000+ California construction firms. Launch in minutes, no sales call.</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, color: "var(--red)", whiteSpace: "nowrap" }}>Start an ad →</div>
        </Link>

        {/* Currently Running GFE Outreach Ads */}
        <div style={{ border: "2px solid var(--dark)", borderRadius: 3, marginBottom: 30, overflow: "hidden" }}>
          <div style={{ background: "var(--dark)", color: "#f6f1e8", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(15px,1.8vw,20px)", letterSpacing: ".02em" }}>Currently Running GFE Outreach Ads</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5dd693", fontWeight: 600, whiteSpace: "nowrap" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2f7d52", display: "inline-block" }} />Live
            </span>
            <span style={{ flex: 1, height: 2, background: "#f6f1e8" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 30, alignItems: "start", padding: 24 }}>
            <div style={{ gridColumn: "span 2", minWidth: 280 }}>
              <div style={{ width: "100%", aspectRatio: "16/9", background: "repeating-linear-gradient(135deg,#e7e1d4,#e7e1d4 12px,#ded7c7 12px,#ded7c7 24px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", color: "#9a937f" }}>LEAD IMAGE — client editorial</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 260 }}>
              {SECONDARY_ADS.map((ad) => (
                <div key={ad.kicker} style={{ display: "flex", gap: 14, paddingBottom: 18, borderBottom: "1px solid var(--border-dark)", cursor: "pointer" }} className="hover:opacity-75 transition-opacity">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--red)", fontWeight: 700, marginBottom: 6 }}>{ad.kicker}</div>
                    <h3 style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 18, lineHeight: 1.16, margin: "0 0 6px" }}>{ad.title}</h3>
                    <div style={{ fontSize: 11.5, color: "#8a8c93" }}>{ad.meta}</div>
                  </div>
                  <div style={{ width: 78, height: 78, flexShrink: 0, background: "repeating-linear-gradient(135deg,#e7e1d4,#e7e1d4 8px,#ded7c7 8px,#ded7c7 16px)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* California Construction News */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 15, letterSpacing: ".02em" }}>California Construction News</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />Live
          </span>
          <span style={{ flex: 1, height: 2, background: "var(--dark)" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "#6b6d75", marginBottom: 18 }}>Sponsored editorial placements live across the network this week.</div>

        {/* Main content + sidebar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 38, marginTop: 8, alignItems: "start" }}>

          {/* Main column */}
          <div style={{ gridColumn: "span 2", minWidth: 290 }}>
            {LATEST_ADS.map((ad) => (
              <div key={ad.brand} style={{ display: "flex", gap: 18, padding: "18px 0", borderBottom: "1px solid var(--border-dark)", cursor: "pointer" }} className="hover:opacity-80 transition-opacity">
                <div style={{ width: 64, height: 64, flexShrink: 0, background: "var(--dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 26 }}>{ad.initial}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--gold)", fontWeight: 700, border: "1px solid #e0d3ad", background: "#faf6ec", padding: "2px 7px" }}>SPONSORED</span>
                    <span style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--red)", fontWeight: 700 }}>{ad.vertical}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 20, lineHeight: 1.14, margin: "0 0 7px" }}>{ad.title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5c5e66", margin: "0 0 8px", fontStyle: "italic" }}>&ldquo;{ad.quote}&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 11.5, color: "#8a8c93" }}>
                    <span style={{ fontWeight: 600, color: "var(--dark)" }}>{ad.brand}</span>
                    <span>{ad.metric}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--green)", fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />Running
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* In-feed billboard slot */}
            <Link href="/portal" className="block mt-6 hover:border-[var(--red)] transition-colors"
              style={{ border: "1.5px dashed #c9b27e", background: "repeating-linear-gradient(135deg,#faf6ec,#faf6ec 11px,#f5efe1 11px,#f5efe1 22px)", padding: 26, textAlign: "center", borderRadius: 2 }}>
              <div style={{ fontSize: 9.5, letterSpacing: ".2em", color: "var(--gold)", fontWeight: 700, marginBottom: 9 }}>IN-FEED BILLBOARD · 970 × 250</div>
              <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 23, marginBottom: 6 }}>Get your brand in this feed</div>
              <div style={{ fontSize: 13.5, color: "#6b6d75", marginBottom: 14 }}>Self-serve placement, live in under five minutes.</div>
              <span style={{ display: "inline-block", background: "var(--red)", color: "#fff", padding: "9px 20px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 13.5, borderRadius: 2 }}>Build your ad →</span>
            </Link>
          </div>

          {/* Sidebar */}
          <div style={{ minWidth: 260, display: "flex", flexDirection: "column", gap: 26 }}>
            <CurrentIssues />
            <AdSlot dims="SPONSOR SLOT · 300 × 600" label="Sponsor a vertical" />
            <AdSlot dims="SPONSOR SLOT · 300 × 600" label="Sponsor a county" />
          </div>
        </div>

        {/* Email signup */}
        <div style={{ marginTop: 48 }}>
          <EmailSignup />
        </div>
      </main>
      <Footer />
    </>
  );
}
