// Caltrans Construction Contract Opportunities Portal (CCOP)
// Server-rendered HTML table at ccop.dot.ca.gov/allProjects
// Columns: Project ID, Title, County, License, Advertise Date, Bid Date

import * as cheerio from "cheerio";
import type { Listing } from "../types";

const URL = "https://ccop.dot.ca.gov/allProjects";

export async function scrapeCaltransCCOP(): Promise<Listing[]> {
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
      console.warn(`Caltrans CCOP: HTTP ${res.status}`);
      return results;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Primary table has id="projectsTable"; fall back to first data table
    const table = $("#projectsTable").length ? $("#projectsTable") : $("table").first();

    table.find("tbody tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 2) return;

      const projectId = cells.eq(0).text().trim();
      const title = cells.eq(1).text().replace(/\s+/g, " ").trim();
      const county = cells.eq(2).text().trim();
      const bidDateText = cells.eq(5).text().trim() || cells.eq(4).text().trim();

      if (!title || title.length < 4) return;

      // Build source URL — detail links use project ID
      const href = cells.eq(0).find("a").attr("href") || cells.eq(1).find("a").attr("href") || "";
      const sourceUrl = href
        ? (href.startsWith("http") ? href : `https://ccop.dot.ca.gov${href}`)
        : URL;

      results.push({
        title: projectId ? `[${projectId}] ${title}` : title,
        agency: "Caltrans",
        county: county || "California",
        bid_date: tryParseDate(bidDateText),
        description: null,
        source_url: sourceUrl,
        contact_info: null,
      });
    });

    console.log(`Caltrans CCOP: ${results.length} listings`);
  } catch (err) {
    console.error("Caltrans CCOP error:", err instanceof Error ? err.message : err);
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
