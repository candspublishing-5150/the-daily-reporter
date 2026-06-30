import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--dark)", color: "var(--muted)", marginTop: "auto" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 22px", display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>The Daily Reporter</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>Connecting California contractors to construction bidding leads since 1994.</div>
          <div style={{ marginTop: 16, fontSize: 12, lineHeight: 1.7 }}>
            <div>8258 Scarlet Oak Cir, Citrus Heights CA 95610</div>
            <div><a href="mailto:CandSPublishing@gmail.com" style={{ color: "var(--muted)", textDecoration: "none" }} className="hover:text-white transition-colors">CandSPublishing@gmail.com</a></div>
            <div>(916) 729-5432</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", fontSize: 13 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span style={{ color: "#fff", fontWeight: 600, fontFamily: "var(--font-zilla)" }}>Browse</span>
            {[["Outreach Ads", "/ads"], ["Current Issues", "/editions"], ["Display Ads", "/display-ads"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "var(--muted)", textDecoration: "none" }} className="hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span style={{ color: "#fff", fontWeight: 600, fontFamily: "var(--font-zilla)" }}>Advertise</span>
            {[["Run an ad", "/portal"], ["Campaign manager", "/dashboard"], ["Media kit", "/media-kit"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "var(--muted)", textDecoration: "none" }} className="hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span style={{ color: "#fff", fontWeight: 600, fontFamily: "var(--font-zilla)" }}>Company</span>
            {[["About", "/about"], ["Privacy Policy", "/privacy"], ["Services", "/services"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "var(--muted)", textDecoration: "none" }} className="hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #2c2e34" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 22px", fontSize: 11.5, color: "#6b6d75" }}>
          © {new Date().getFullYear()} C&S Publishing. All rights reserved. · C&S Publishing is certified DBE/WBE/SBE/SMBE.
        </div>
      </div>
    </footer>
  );
}
