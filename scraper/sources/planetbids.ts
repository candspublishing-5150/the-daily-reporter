// PlanetBids scraper — used by MWD, Santa Clara Valley Water, Fresno
// Scrapes the HTML search results page since their JSON API requires auth

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const PORTALS = [
  { id: "16151", agency: "Metropolitan Water District of Southern California", county: "Los Angeles" },
  { id: "48397", agency: "Santa Clara Valley Water District",                 county: "Santa Clara" },
  { id: "14769", agency: "City of Fresno",                                    county: "Fresno" },
];

export async function scrapePlanetBids(): Promise<Listing[]> {
  const results: Listing[] = [];

  for (const portal of PORTALS) {
    try {
      const url = `https://pbsystem.planetbids.com/portal/${portal.id}/bo/bo-search`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.warn(`PlanetBids ${portal.agency}: HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // PlanetBids renders a table or list of bids
      // Try multiple selectors for different versions of their UI
      const rows = $("table tbody tr, .bid-row, [class*='bid-item'], .row-bid");
      let found = 0;

      rows.each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 2) return;

        const getText = (i: number) => $(cells[i]).text().replace(/\s+/g, " ").trim();
        const title = getText(1) || getText(0);
        const bidDateText = getText(3) || getText(2);
        const link = $(row).find("a").first().attr("href") || "";

        if (!title || title.length < 3) return;
        if (/^(bid|title|description|project|#)/i.test(title)) return;

        const sourceUrl = link
          ? (link.startsWith("http") ? link : `https://pbsystem.planetbids.com${link}`)
          : url;

        results.push({
          title,
          agency: portal.agency,
          county: portal.county,
          bid_date: tryParseDate(bidDateText),
          description: getText(0) || null, // bid number
          source_url: sourceUrl,
          contact_info: null,
        });
        found++;
      });

      // If table scraping got nothing, try JSON embedded in page script tags
      if (found === 0) {
        const scriptMatch = html.match(/var\s+bidList\s*=\s*(\[[\s\S]*?\]);/)
          || html.match(/bidListData\s*=\s*(\[[\s\S]*?\])/)
          || html.match(/"bids"\s*:\s*(\[[\s\S]*?\])/);
        if (scriptMatch) {
          try {
            const bids = JSON.parse(scriptMatch[1]) as Array<Record<string, string>>;
            for (const bid of bids) {
              const title = bid.description || bid.title || bid.BidTitle || bid.BidDescription;
              if (!title) continue;
              results.push({
                title,
                agency: portal.agency,
                county: portal.county,
                bid_date: tryParseDate(bid.bidDate || bid.BidDueDate || bid.dueDate || ""),
                description: bid.bidNumber || bid.BidNumber || null,
                source_url: bid.url || url,
                contact_info: null,
              });
              found++;
            }
          } catch { /* JSON parse failed */ }
        }
      }

      console.log(`PlanetBids ${portal.agency}: ${found} listings`);
    } catch (err) {
      console.error(`PlanetBids ${portal.agency} error:`, err instanceof Error ? err.message : err);
    }
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
