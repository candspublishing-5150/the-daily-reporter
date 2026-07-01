// ARC (reprographics) plan rooms — SoCal (mem=29) and NorCal (mem=23)
// Older ASP.NET site, server-rendered HTML table

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const ROOMS = [
  { url: "https://order.e-arc.com/arcEOC/PWELL_Main.asp?mem=29", region: "Southern California" },
  { url: "https://order.e-arc.com/arcEOC/PWELL_Main.asp?mem=23", region: "Northern California" },
];

export async function scrapeARC(): Promise<Listing[]> {
  const results: Listing[] = [];

  for (const room of ROOMS) {
    try {
      const res = await fetch(room.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TDRBot/1.0)",
          "Accept": "text/html",
        },
      });
      if (!res.ok) { console.warn(`ARC ${room.region}: HTTP ${res.status}`); continue; }

      const html = await res.text();
      const $ = cheerio.load(html);

      $("table tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 3) return;

        const getText = (i: number) => $(cells[i]).text().replace(/\s+/g, " ").trim();
        const title = getText(0);
        const agency = getText(1);
        const bidDate = getText(2);
        const link = $(cells[0]).find("a").attr("href") || "";

        if (!title || title.toLowerCase().includes("project") && cells.length < 4) return;
        if (title.toLowerCase() === "project name" || title.toLowerCase() === "description") return;

        results.push({
          title,
          agency: agency || `ARC ${room.region}`,
          county: extractCounty(title + " " + agency),
          bid_date: parseDate(bidDate),
          description: null,
          source_url: link
            ? (link.startsWith("http") ? link : `https://order.e-arc.com${link}`)
            : room.url,
          contact_info: null,
        });
      });

      console.log(`ARC ${room.region}: ${results.length} listings`);
    } catch (err) {
      console.error(`ARC ${room.region} error:`, err);
    }
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
  return isNaN(d.getTime()) ? null : d.toISOString();
}
