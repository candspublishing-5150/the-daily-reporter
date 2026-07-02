// Caltrans Construction Contract Advertisements
// Public page: https://dot.ca.gov/programs/construction/current-bids

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const URL = "https://dot.ca.gov/programs/construction/current-bids";

const DISTRICT_COUNTY: Record<string, string> = {
  "01": "Humboldt",       "02": "Shasta",          "03": "Sacramento",
  "04": "Alameda",        "05": "San Luis Obispo",  "06": "Fresno",
  "07": "Los Angeles",    "08": "San Bernardino",   "09": "Mono",
  "10": "San Joaquin",    "11": "San Diego",        "12": "Orange",
};

export async function scrapeCaltrans(): Promise<Listing[]> {
  const results: Listing[] = [];

  try {
    const res = await fetch(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // dot.ca.gov uses a standard HTML table for current bids
    $("table tbody tr, table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 3) return;

      const getText = (i: number) => $(cells[i]).text().replace(/\s+/g, " ").trim();

      // Common column layouts: [Contract#, District, Description, County/Route, BidDate]
      const contractNo = getText(0);
      const col1 = getText(1);
      const col2 = getText(2);
      const col3 = getText(3) || "";
      const col4 = getText(4) || "";

      if (!contractNo || /^(contract|no\.|number|bid)/i.test(contractNo)) return;

      // Try to find a date in any column
      const bidDateRaw = [col4, col3, col2].find(v => /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},\s*\d{4}/.test(v)) || "";
      const description = col2.length > col1.length ? col2 : col1;
      const districtMatch = (col1 + col2).match(/\b(0?[1-9]|1[0-2])\b/);
      const district = districtMatch ? districtMatch[1].padStart(2, "0") : "";
      const county = inferCounty(col3 + " " + col2, district);

      const link = $(cells[0]).find("a").attr("href") || $(cells[2]).find("a").attr("href") || "";

      results.push({
        title: description || `Contract ${contractNo}`,
        agency: `Caltrans${district ? ` District ${district}` : ""}`,
        county,
        bid_date: parseCaltransDate(bidDateRaw),
        description: `Contract No: ${contractNo}`,
        source_url: link
          ? (link.startsWith("http") ? link : `https://dot.ca.gov${link}`)
          : URL,
        contact_info: null,
      });
    });

    // Fallback: look for links with bid-related text if table is empty
    if (results.length === 0) {
      $("a").each((_, a) => {
        const text = $(a).text().replace(/\s+/g, " ").trim();
        const href = $(a).attr("href") || "";
        if (text.length < 10 || !/contract|bid|project|construct/i.test(text)) return;
        if (!/\.(pdf|aspx|html?)/i.test(href) && !href.includes("dot.ca.gov")) return;
        results.push({
          title: text,
          agency: "Caltrans",
          county: "California",
          bid_date: null,
          description: null,
          source_url: href.startsWith("http") ? href : `https://dot.ca.gov${href}`,
          contact_info: null,
        });
      });
    }

    console.log(`Caltrans: ${results.length} listings`);
  } catch (err) {
    console.error("Caltrans scrape error:", err instanceof Error ? err.message : err);
  }

  return results;
}

function inferCounty(text: string, district: string): string {
  const counties = [
    "Alameda","Butte","Contra Costa","El Dorado","Fresno","Humboldt","Imperial",
    "Kern","Kings","Los Angeles","Marin","Merced","Monterey","Napa","Nevada",
    "Orange","Placer","Riverside","Sacramento","San Bernardino","San Diego",
    "San Francisco","San Joaquin","San Luis Obispo","San Mateo","Santa Barbara",
    "Santa Clara","Santa Cruz","Shasta","Solano","Sonoma","Stanislaus","Tulare",
    "Ventura","Yolo",
  ];
  for (const county of counties) {
    if (text.toLowerCase().includes(county.toLowerCase())) return county;
  }
  return DISTRICT_COUNTY[district] || "California";
}

function parseCaltransDate(raw: string): string | null {
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
