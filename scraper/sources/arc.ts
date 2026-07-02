// ARC (reprographics) plan rooms — SoCal and NorCal
// Note: e-arc.com moved to arcplanroom.com

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const ROOMS = [
  {
    url: "https://www.arcplanroom.com/public-jobs?region=southern-california",
    fallbackUrl: "https://order.e-arc.com/arcEOC/PWELL_Main.asp?mem=29",
    region: "Southern California",
  },
  {
    url: "https://www.arcplanroom.com/public-jobs?region=northern-california",
    fallbackUrl: "https://order.e-arc.com/arcEOC/PWELL_Main.asp?mem=23",
    region: "Northern California",
  },
];

export async function scrapeARC(): Promise<Listing[]> {
  const results: Listing[] = [];

  for (const room of ROOMS) {
    let found = 0;

    for (const url of [room.url, room.fallbackUrl]) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,*/*",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          console.warn(`ARC ${room.region} (${url}): HTTP ${res.status}`);
          continue;
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // Try multiple selectors for different versions of the ARC site
        const selectors = [
          "table tbody tr",
          "table tr",
          ".project-row",
          ".job-row",
          "[class*='project']",
          ".list-group-item",
        ];

        for (const sel of selectors) {
          const rows = $(sel);
          if (rows.length === 0) continue;

          rows.each((_, row) => {
            const cells = $(row).find("td");
            if (cells.length < 2) return;

            const getText = (i: number) => $(cells[i]).text().replace(/\s+/g, " ").trim();
            const title = getText(0) || getText(1);
            const agency = cells.length > 2 ? getText(1) : room.region;
            const bidDate = cells.length > 3 ? getText(3) : (cells.length > 2 ? getText(2) : "");
            const link = $(row).find("a").first().attr("href") || "";

            if (!title || title.length < 3) return;
            if (/^(project|name|title|bid|description)/i.test(title)) return;

            results.push({
              title,
              agency: agency.length > 3 ? agency : `ARC ${room.region}`,
              county: extractCounty(title + " " + agency),
              bid_date: parseDate(bidDate),
              description: null,
              source_url: link
                ? (link.startsWith("http") ? link : new URL(link, url).toString())
                : url,
              contact_info: null,
            });
            found++;
          });

          if (found > 0) break;
        }

        if (found > 0) break;
      } catch (err) {
        console.warn(`ARC ${room.region} (${url}) error:`, err instanceof Error ? err.message : err);
      }
    }

    console.log(`ARC ${room.region}: ${found} listings`);
  }

  return results;
}

function extractCounty(text: string): string {
  const counties = [
    "Alameda","Butte","Contra Costa","El Dorado","Fresno","Kern","Kings",
    "Los Angeles","Marin","Merced","Monterey","Napa","Nevada","Orange",
    "Placer","Riverside","Sacramento","San Bernardino","San Diego",
    "San Francisco","San Joaquin","San Luis Obispo","San Mateo","Santa Barbara",
    "Santa Clara","Santa Cruz","Shasta","Solano","Sonoma","Stanislaus",
    "Tulare","Ventura","Yolo",
  ];
  for (const county of counties) {
    if (text.toLowerCase().includes(county.toLowerCase())) return county;
  }
  return "California";
}

function parseDate(raw: string): string | null {
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
