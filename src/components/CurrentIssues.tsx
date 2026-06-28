const EDITIONS = [
  { name: "Builder's Blueprint", date: "Mar 31", url: "https://www.flipsnack.com/66F8CBDD75E/builder-sblueprint-march-31-2026", cover: "https://thedailyreporter.net/tmp/Builder%E2%80%99sBlueprint-march-31-2026-1.jpg" },
  { name: "Southern CA Edition", date: "Apr 1",  url: "https://www.flipsnack.com/66F8CBDD75E/reporter-april-1-2026-south",          cover: "https://thedailyreporter.net/tmp/reporter-April%201-2026-south-1.jpg" },
  { name: "Northern CA Edition", date: "Apr 2",  url: "https://www.flipsnack.com/66F8CBDD75E/reporter-april-2-2026-north",          cover: "https://thedailyreporter.net/tmp/Reporter-April%202-2026-north-1.jpg" },
  { name: "CA State Water",      date: "Mar 27", url: "https://www.flipsnack.com/66F8CBDD75E/reporter-march-27-2026-water",         cover: "https://thedailyreporter.net/tmp/Reporter-March-27-2026-Water-1.jpg" },
];

export default function CurrentIssues() {
  return (
    <div style={{ background: "var(--dark)", color: "#f3efe7", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
        <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16 }}>Current Issues</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".12em", color: "#8a8c93" }}>VOL. XXXII</div>
      </div>
      <div style={{ fontSize: 11.5, color: "#9a968c", marginBottom: 16 }}>This week's editions — tap to read</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {EDITIONS.map((ed) => (
          <a key={ed.name} href={ed.url} target="_blank" rel="noreferrer"
            style={{ position: "relative", display: "block", aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden", background: "#2c2e34", textDecoration: "none" }}
            className="hover:border-[#d98a8f] transition-colors"
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${ed.cover})`, backgroundSize: "cover", backgroundPosition: "top center" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 42%, rgba(15,24,40,0.92) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "9px 9px 8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".1em", color: "#f0a84a", textTransform: "uppercase", display: "block", marginBottom: 2 }}>{ed.date}</span>
              <span style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 12.5, color: "#f6f1e8", lineHeight: 1.15, display: "block" }}>{ed.name}</span>
            </div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 15, fontSize: 12, color: "#d98a8f", fontWeight: 600, cursor: "pointer" }}>Browse all editions →</div>
    </div>
  );
}
