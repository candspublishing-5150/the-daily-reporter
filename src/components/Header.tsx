"use client";
import Link from "next/link";

const EDITIONS = [
  { name: "Builder's Blueprint", date: "Mar 31", url: "https://www.flipsnack.com/66F8CBDD75E/builder-sblueprint-march-31-2026", cover: "https://thedailyreporter.net/tmp/Builder%E2%80%99sBlueprint-march-31-2026-1.jpg" },
  { name: "Southern CA Edition", date: "Apr 1",  url: "https://www.flipsnack.com/66F8CBDD75E/reporter-april-1-2026-south",          cover: "https://thedailyreporter.net/tmp/reporter-April%201-2026-south-1.jpg" },
  { name: "Northern CA Edition", date: "Apr 2",  url: "https://www.flipsnack.com/66F8CBDD75E/reporter-april-2-2026-north",          cover: "https://thedailyreporter.net/tmp/Reporter-April%202-2026-north-1.jpg" },
  { name: "CA State Water",      date: "Mar 27", url: "https://www.flipsnack.com/66F8CBDD75E/reporter-march-27-2026-water",         cover: "https://thedailyreporter.net/tmp/Reporter-March-27-2026-Water-1.jpg" },
];

export default function Header() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <header>
      {/* Utility bar */}
      <div style={{ background: "var(--dark)", color: "#cfcabd" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "7px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontSize: 12, letterSpacing: ".02em" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ color: "#fff", fontWeight: 600 }}>{today}</span>
            <span style={{ opacity: .45 }}>|</span>
            <span>Outreach Ads · Digital PR · Editorial Placements</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white transition-colors">My Campaigns</Link>
            <span style={{ opacity: .45 }}>|</span>
            <Link href="/login" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div style={{ background: "var(--bg-header)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 48px 26px", textAlign: "center" }}>
          <div style={{ height: 1, background: "rgba(28,26,23,0.28)", marginBottom: 20 }} />
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900, fontSize: "clamp(40px,6.4vw,84px)", lineHeight: .95, letterSpacing: "-.03em", color: "#1c1a17", marginBottom: 14, cursor: "pointer" }}>
              The Daily <span style={{ color: "var(--red-bright)" }}>Reporter</span>
            </h1>
          </Link>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#8a8478", letterSpacing: ".05em", margin: 0 }}>
            <span style={{ color: "var(--red-bright)", fontWeight: 500 }}>{today}</span>
            &nbsp;·&nbsp; Connecting California contractors to construction bidding leads
          </p>
          <div style={{ height: 1, background: "rgba(28,26,23,0.28)", marginTop: 20 }} />
        </div>

        {/* Nav */}
        <div style={{ borderTop: "1px solid var(--border)", borderBottom: "2px solid var(--dark)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14.5 }}>
              {[["Home", "/"], ["Browse Outreach Ads", "/ads"], ["Display Ads", "/display-ads"], ["Services", "/services"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ padding: "13px 14px", color: "var(--dark)", textDecoration: "none", display: "block" }} className="hover:bg-[#f1ece2] transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
            <Link href="/portal" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--red)", color: "#fff", padding: "9px 18px", margin: "7px 0", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }} className="hover:bg-[#8c1d27] transition-colors">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
              Run an ad
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
