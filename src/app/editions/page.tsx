import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailSignup from "@/components/EmailSignup";
import { createClient } from "@/lib/supabase/server";

// Fallback hardcoded editions while the database is being populated
const FALLBACK_EDITIONS = [
  {
    id: "fallback-1",
    name: "Builder's Blueprint",
    edition_type: "blueprint",
    publish_date: "2026-03-31",
    flipsnack_url: "https://www.flipsnack.com/66F8CBDD75E/builder-sblueprint-march-31-2026",
    cover_image_url: "https://thedailyreporter.net/tmp/Builder%E2%80%99sBlueprint-march-31-2026-1.jpg",
  },
  {
    id: "fallback-2",
    name: "Southern CA Edition",
    edition_type: "southern_ca",
    publish_date: "2026-04-01",
    flipsnack_url: "https://www.flipsnack.com/66F8CBDD75E/reporter-april-1-2026-south",
    cover_image_url: "https://thedailyreporter.net/tmp/reporter-April%201-2026-south-1.jpg",
  },
  {
    id: "fallback-3",
    name: "Northern CA Edition",
    edition_type: "northern_ca",
    publish_date: "2026-04-02",
    flipsnack_url: "https://www.flipsnack.com/66F8CBDD75E/reporter-april-2-2026-north",
    cover_image_url: "https://thedailyreporter.net/tmp/Reporter-April%202-2026-north-1.jpg",
  },
  {
    id: "fallback-4",
    name: "CA State Water",
    edition_type: "water",
    publish_date: "2026-03-27",
    flipsnack_url: "https://www.flipsnack.com/66F8CBDD75E/reporter-march-27-2026-water",
    cover_image_url: "https://thedailyreporter.net/tmp/Reporter-March-27-2026-Water-1.jpg",
  },
];

const EDITION_TYPE_LABELS: Record<string, string> = {
  blueprint: "Builder's Blueprint",
  southern_ca: "Southern CA",
  northern_ca: "Northern CA",
  water: "CA State Water",
};

function formatPublishDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export default async function EditionsPage() {
  const supabase = await createClient();
  const { data: dbEditions } = await supabase
    .from("editions")
    .select("*")
    .order("publish_date", { ascending: false });

  const editions = dbEditions && dbEditions.length > 0 ? dbEditions : FALLBACK_EDITIONS;

  // Group by edition type
  const grouped: Record<string, typeof editions> = {};
  for (const ed of editions) {
    const type = ed.edition_type || "other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(ed);
  }

  const typeOrder = ["blueprint", "southern_ca", "northern_ca", "water"];
  const sortedTypes = [
    ...typeOrder.filter((t) => grouped[t]),
    ...Object.keys(grouped).filter((t) => !typeOrder.includes(t)),
  ];

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 22px 60px", width: "100%" }}>

        {/* Page header */}
        <div style={{ borderBottom: "2px solid var(--dark)", paddingBottom: 18, marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(22px,3vw,34px)", margin: "0 0 6px" }}>
            Current Issues
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            The Daily Reporter publishes four weekly editions covering California&rsquo;s construction bidding market.
            Click any edition to read it online.
          </p>
        </div>

        {/* About the editions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 48 }}>
          {[
            { type: "blueprint", label: "Builder's Blueprint", desc: "Statewide overview of the week's top construction bids, featured projects, and industry news." },
            { type: "southern_ca", label: "Southern CA Edition", desc: "Public works bids open in Los Angeles, Orange, San Diego, Riverside, San Bernardino, and surrounding counties." },
            { type: "northern_ca", label: "Northern CA Edition", desc: "Public works bids open in Sacramento, Bay Area, Central Valley, and Northern California counties." },
            { type: "water", label: "CA State Water", desc: "Water infrastructure, flood control, and water agency projects across California." },
          ].map((item) => (
            <div key={item.type} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "18px 18px 16px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--red)", fontWeight: 700, marginBottom: 6 }}>
                {EDITION_TYPE_LABELS[item.type]?.toUpperCase() || item.type.toUpperCase()}
              </div>
              <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 15, marginBottom: 7, color: "var(--dark)" }}>
                {item.label}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Edition grids by type */}
        {sortedTypes.map((type) => (
          <section key={type} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 20, margin: 0 }}>
                {EDITION_TYPE_LABELS[type] || type}
              </h2>
              <span style={{ flex: 1, height: 2, background: "var(--dark)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
              {grouped[type].map((ed) => (
                <a
                  key={ed.id}
                  href={ed.flipsnack_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textDecoration: "none", color: "inherit" }}
                  className="group"
                >
                  {/* Cover */}
                  <div style={{ position: "relative", aspectRatio: "3/4", background: "var(--dark)", borderRadius: 2, overflow: "hidden", marginBottom: 10, border: "1px solid var(--border)" }}
                    className="group-hover:border-[var(--red)] transition-colors"
                  >
                    {ed.cover_image_url ? (
                      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${ed.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "top center" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,#2c2e34,#2c2e34 12px,#22242a 12px,#22242a 24px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#6b6d75", letterSpacing: ".1em" }}>NO COVER</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(15,18,22,0.85) 100%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 11px 9px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".1em", color: "#f0a84a", display: "block", marginBottom: 2 }}>
                        {formatPublishDate(ed.publish_date)}
                      </span>
                      <span style={{ display: "inline-block", background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", letterSpacing: ".04em" }}>
                        READ ONLINE ↗
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, color: "var(--dark)", lineHeight: 1.2 }}>
                    {ed.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                    {formatPublishDate(ed.publish_date)}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Subscribe CTA */}
        <EmailSignup />
      </main>
      <Footer />
    </>
  );
}
