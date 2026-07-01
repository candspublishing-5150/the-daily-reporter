// Caltrans Contract Advertisements — updated every Monday
// https://ppmoe.dot.ca.gov/cc?id=cc_advertisement&timespan=all

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const URL = "https://ppmoe.dot.ca.gov/cc?id=cc_advertisement&timespan=all";

// Caltrans district → county mapping (approximate)
const DISTRICT_COUNTY: Record<string, string> = {
  "01": "Humboldt",   "02": "Shasta",     "03": "Sacramento",
  "04": "Alameda",    "05": "San Luis Obispo", "06": "Fresno",
  "07": "Los Angeles","08": "San Bernardino", "09": "Mono",
  "10": "Stockton",   "11": "San Diego",  "12": "Orange",
};

export async function scrapeCaltrans(): Promise<Listing[]> {
  const results: Listing[] = [];

  try {
    const res = await fetch(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TDRBot/1.0; +https://thedailyreporter.net)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Caltrans renders an HTML table — find all rows
    $("table tbody tr, table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 4) return;

      const getText = (i: number) => $(cells[i]).text().trim();
      const contractNo = getText(0);
      const district = getText(1);
      const description = getText(2);
      const bidDate = getText(3);
      const location = getText(4) || "";
      const link = $(cells[0]).find("a").attr("href") || "";

      if (!contractNo || contractNo.toLowerCase() === "contract no") return;

      const county = inferCounty(location, district);
      const parsedDate = parseCaltransDate(bidDate);

      results.push({
        title: description || contractNo,
        agency: `Caltrans District ${district}`,
        county,
        bid_date: parsedDate,
        description: `Contract No: ${contractNo}${location ? ` · ${location}` : ""}`,
        source_url: link
          ? (link.startsWith("http") ? link : `https://ppmoe.dot.ca.gov${link}`)
          : URL,
        contact_info: null,
      });
    });

    console.log(`Caltrans: ${results.length} listings`);
  } catch (err) {
    console.error("Caltrans scrape error:", err);
  }

  return results;
}

function inferCounty(location: string, district: string): string {
  if (!location) return DISTRICT_COUNTY[district.padStart(2, "0")] || "California";
  // Try to extract county from location string
  const counties = [
    "Alameda","Butte","Contra Costa","El Dorado","Fresno","Humboldt","Imperial",
    "Kern","Kings","Los Angeles","Marin","Merced","Monterey","Napa","Nevada",
    "Orange","Placer","Riverside","Sacramento","San Bernardino","San Diego",
    "San Francisco","San Joaquin","San Luis Obispo","San Mateo","Santa Barbara",
    "Santa Clara","Santa Cruz","Shasta","Solano","Sonoma","Stanislaus","Tulare",
    "Ventura","Yolo",
  ];
  for (const county of counties) {
    if (location.toLowerCase().includes(county.toLowerCase())) return county;
  }
  return DISTRICT_COUNTY[district.padStart(2, "0")] || "California";
}

function parseCaltransDate(raw: string): string | null {
  if (!raw) return null;
  // Formats: "July 15, 2026", "07/15/26", "07-15-2026"
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
