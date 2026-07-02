// East Bay Municipal Utility District (EBMUD) — Construction Bids
// Server-rendered ASP.NET page at construction-bids.ebmud.com

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const URL = "https://construction-bids.ebmud.com/CurrentorFutureBid.aspx?BidMode=Current";

export async function scrapeEBMUD(): Promise<Listing[]> {
  const results: Listing[] = [];

  try {
    const res = await fetch(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      console.warn(`EBMUD: HTTP ${res.status}`);
      return results;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // The page has a table with columns: Project, Spec #, Estimate, Bid Opening Date
    $("table tr").each((i, row) => {
      if (i === 0) return; // skip header

      const cells = $(row).find("td");
      if (cells.length < 2) return;

      const title = cells.eq(0).text().replace(/\s+/g, " ").trim();
      const specNum = cells.eq(1).text().trim();
      const bidDateText = cells.eq(3).text().trim() || cells.eq(2).text().trim();

      if (!title || title.length < 4) return;
      if (/^(project|title|spec|bid|date)/i.test(title)) return;

      const href = cells.eq(0).find("a").attr("href") || "";
      const sourceUrl = href
        ? (href.startsWith("http") ? href : `https://construction-bids.ebmud.com/${href}`)
        : URL;

      results.push({
        title: specNum ? `${title} (Spec ${specNum})` : title,
        agency: "East Bay Municipal Utility District (EBMUD)",
        county: "Alameda",
        bid_date: tryParseDate(bidDateText),
        description: null,
        source_url: sourceUrl,
        contact_info: "specs@ebmud.com | (510) 287-0425",
      });
    });

    console.log(`EBMUD: ${results.length} listings`);
  } catch (err) {
    console.error("EBMUD error:", err instanceof Error ? err.message : err);
  }

  return results;
}

function tryParseDate(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020) return d.toISOString();
  const match = raw.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
  if (match) {
    const d2 = new Date(match[0]);
    if (!isNaN(d2.getTime())) return d2.toISOString();
  }
  return null;
}
