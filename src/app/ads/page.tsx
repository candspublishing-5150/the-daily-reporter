import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailSignup from "@/components/EmailSignup";
import { createClient } from "@/lib/supabase/server";

const COUNTIES = [
  "All Counties",
  "Alameda", "Butte", "Contra Costa", "El Dorado", "Fresno",
  "Kern", "Kings", "Los Angeles", "Madera", "Marin",
  "Merced", "Monterey", "Napa", "Nevada", "Orange",
  "Placer", "Riverside", "Sacramento", "San Bernardino",
  "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo",
  "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz",
  "Shasta", "Solano", "Sonoma", "Stanislaus", "Tulare",
  "Ventura", "Yolo",
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

export default async function AdsPage({
  searchParams,
}: {
  searchParams: Promise<{ county?: string; page?: string }>;
}) {
  const params = await searchParams;
  const selectedCounty = params.county || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const perPage = 20;

  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .order("bid_date", { ascending: true })
    .range((currentPage - 1) * perPage, currentPage * perPage - 1);

  if (selectedCounty && selectedCounty !== "All Counties") {
    query = query.ilike("county", `%${selectedCounty}%`);
  }

  const { data: listings, count, error } = await query;

  const totalPages = Math.ceil((count || 0) / perPage);

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 22px 60px", width: "100%" }}>

        {/* Page header */}
        <div style={{ borderBottom: "2px solid var(--dark)", paddingBottom: 18, marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(22px,3vw,34px)", margin: "0 0 6px" }}>
            Browse GFE Outreach Ads
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            Public works projects open for bid across California — updated weekly.
            {count !== null && (
              <> <strong style={{ color: "var(--dark)" }}>{count.toLocaleString()} listings</strong> currently active.</>
            )}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "start" }}>

          {/* Sidebar filters */}
          <aside>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ background: "var(--dark)", color: "#f6f1e8", padding: "11px 16px", fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 13, letterSpacing: ".04em" }}>
                FILTER BY COUNTY
              </div>
              <div style={{ padding: "8px 0", maxHeight: 420, overflowY: "auto" }}>
                {COUNTIES.map((county) => {
                  const isActive = county === "All Counties" ? !selectedCounty : selectedCounty === county;
                  const href = county === "All Counties" ? "/ads" : `/ads?county=${encodeURIComponent(county)}`;
                  return (
                    <Link
                      key={county}
                      href={href}
                      style={{
                        display: "block",
                        padding: "7px 16px",
                        fontSize: 13.5,
                        textDecoration: "none",
                        color: isActive ? "#fff" : "var(--text-body)",
                        background: isActive ? "var(--red)" : "transparent",
                        fontWeight: isActive ? 600 : 400,
                      }}
                      className={isActive ? "" : "hover:bg-[#f3efe7] transition-colors"}
                    >
                      {county}
                    </Link>
                  );
                })}
              </div>
            </div>

            <EmailSignup compact />
          </aside>

          {/* Listings */}
          <div>
            {error && (
              <div style={{ background: "#fff3f3", border: "1px solid #f5c6c6", padding: "16px 20px", borderRadius: 3, marginBottom: 20, fontSize: 14 }}>
                Unable to load listings right now. Please try again.
              </div>
            )}

            {!error && listings?.length === 0 && (
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "40px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
                  No listings found
                </div>
                <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 20px" }}>
                  {selectedCounty
                    ? `No active listings in ${selectedCounty} right now. Try another county or check back soon.`
                    : "No active listings at the moment. Check back soon."}
                </p>
                {selectedCounty && (
                  <Link href="/ads" style={{ display: "inline-block", background: "var(--red)", color: "#fff", padding: "9px 18px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }}>
                    View all counties
                  </Link>
                )}
              </div>
            )}

            {!error && listings && listings.length > 0 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {listings.map((listing, i) => {
                    const days = daysUntil(listing.bid_date);
                    const isUrgent = days !== null && days <= 7 && days >= 0;
                    const isPast = days !== null && days < 0;

                    return (
                      <Link
                        key={listing.id}
                        href={`/ads/${listing.id}`}
                        style={{
                          display: "block",
                          padding: "20px 0",
                          borderBottom: "1px solid var(--border)",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                        className="hover:bg-[#faf7f2] transition-colors"
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, padding: "0 4px" }}>
                          {/* Number */}
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", paddingTop: 3, minWidth: 28, textAlign: "right" }}>
                            {(currentPage - 1) * perPage + i + 1}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                              {listing.county && (
                                <span style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--red)", fontWeight: 700, background: "#fdf0f1", border: "1px solid #f5c6c6", padding: "2px 7px" }}>
                                  {listing.county.toUpperCase()}
                                </span>
                              )}
                            </div>

                            <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 18, lineHeight: 1.2, margin: "0 0 6px", color: "var(--dark)" }}>
                              {listing.title}
                            </h2>

                            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 6 }}>
                              {listing.agency}
                            </div>

                            {listing.description && (
                              <p style={{ fontSize: 13.5, color: "#5c5e66", lineHeight: 1.5, margin: "0 0 10px" }}>
                                {listing.description.length > 180
                                  ? listing.description.slice(0, 180) + "…"
                                  : listing.description}
                              </p>
                            )}

                            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
                              <span style={{ fontFamily: "var(--font-mono)", color: isUrgent ? "var(--red)" : isPast ? "var(--muted)" : "var(--dark)", fontWeight: isUrgent ? 600 : 400 }}>
                                Bid date: {formatDate(listing.bid_date)}
                                {isUrgent && ` · ${days}d left`}
                                {isPast && " · Closed"}
                              </span>
                              {listing.source_url && (
                                <span style={{ color: "var(--red)", fontWeight: 600 }}>View details →</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
                    {currentPage > 1 && (
                      <Link
                        href={`/ads?${selectedCounty ? `county=${encodeURIComponent(selectedCounty)}&` : ""}page=${currentPage - 1}`}
                        style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 2, fontSize: 13, fontFamily: "var(--font-zilla)", fontWeight: 600, textDecoration: "none", color: "var(--dark)", background: "#fff" }}
                        className="hover:border-[var(--dark)] transition-colors"
                      >
                        ← Prev
                      </Link>
                    )}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <Link
                        href={`/ads?${selectedCounty ? `county=${encodeURIComponent(selectedCounty)}&` : ""}page=${currentPage + 1}`}
                        style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 2, fontSize: 13, fontFamily: "var(--font-zilla)", fontWeight: 600, textDecoration: "none", color: "var(--dark)", background: "#fff" }}
                        className="hover:border-[var(--dark)] transition-colors"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
