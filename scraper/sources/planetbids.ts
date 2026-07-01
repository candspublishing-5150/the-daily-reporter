// PlanetBids scraper — used by MWD, Santa Clara Valley Water, Fresno
// API pattern: /portal/{id}/bo/bo-list-data

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
      // PlanetBids has a JSON data endpoint that powers the search page
      const url = `https://pbsystem.planetbids.com/portal/${portal.id}/bo/bo-list-data`;
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json, text/javascript, */*",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": `https://pbsystem.planetbids.com/portal/${portal.id}/bo/bo-search`,
        },
      });

      if (!res.ok) {
        console.warn(`PlanetBids ${portal.id}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json() as { data?: PlanetBidsRow[] };
      const rows = data?.data || (Array.isArray(data) ? data as PlanetBidsRow[] : []);

      for (const row of rows) {
        if (!row.BidNumber && !row.Description) continue;

        const bidDate = parsePlanetBidsDate(row.BidOpenDate || row.BidDueDate || "");
        const sourceUrl = `https://pbsystem.planetbids.com/portal/${portal.id}/bo/bo-detail?bidId=${row.BidId || ""}`;

        results.push({
          title: row.Description || row.BidTitle || row.BidNumber || "Untitled",
          agency: portal.agency,
          county: portal.county,
          bid_date: bidDate,
          description: [row.BidNumber, row.BidCategory].filter(Boolean).join(" · ") || null,
          source_url: sourceUrl,
          contact_info: row.ContactName ? `${row.ContactName} ${row.ContactPhone || ""}`.trim() : null,
        });
      }

      console.log(`PlanetBids ${portal.agency}: ${rows.length} listings`);
    } catch (err) {
      console.error(`PlanetBids ${portal.id} error:`, err);
    }
  }

  return results;
}

interface PlanetBidsRow {
  BidId?: string;
  BidNumber?: string;
  Description?: string;
  BidTitle?: string;
  BidOpenDate?: string;
  BidDueDate?: string;
  BidCategory?: string;
  ContactName?: string;
  ContactPhone?: string;
}

function parsePlanetBidsDate(raw: string): string | null {
  if (!raw) return null;
  // PlanetBids returns dates like "07/15/2026 2:00 PM" or ISO strings
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
