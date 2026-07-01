// Generic HTML scrapers for sites with consistent table/list structures
// Covers: eBidBoard (Kern), SF PUC, Imperial County, LA County DPW,
//         LA County Online, LA County Office of Education, City of Roseville,
//         El Dorado Irrigation, Imperial Irrigation (Procureware), Quality Bidders

import * as cheerio from "cheerio";
import type { Listing } from "../types";

type SiteConfig = {
  name: string;
  url: string;
  agency: string;
  county: string;
  rowSelector: string;
  titleCol: number;
  dateCol: number;
  linkCol?: number;
  skipRows?: number;
};

const SITES: SiteConfig[] = [
  {
    name: "Kern County Roads (eBidBoard)",
    url: "https://www.ebidboard.com/public/projects/index.asp?mbrguid=47F30E5A-EB31-43EE-A8CD-59AC6EA9E9BA",
    agency: "County of Kern – Roads",
    county: "Kern",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
  },
  {
    name: "SF PUC",
    url: "https://webapps.sfpuc.org/bids/bidlist.aspx?bidtype=1",
    agency: "SF Public Utilities Commission",
    county: "San Francisco",
    rowSelector: "table tr, .bid-row",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
  },
  {
    name: "Imperial County Public Works",
    url: "https://publicworks.imperialcounty.org/projects-out-to-bid/",
    agency: "Imperial County Public Works",
    county: "Imperial",
    rowSelector: "table tr, .entry-content li, article",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
  },
  {
    name: "LA County Public Works",
    url: "https://dpw.lacounty.gov/contracts/opportunities.aspx",
    agency: "LA County Public Works",
    county: "Los Angeles",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 3, linkCol: 1, skipRows: 1,
  },
  {
    name: "LA County Online Bids",
    url: "https://camisvr.co.la.ca.us/LACoBids/BidLookUp/OpenBidList",
    agency: "Los Angeles County",
    county: "Los Angeles",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 4, linkCol: 1, skipRows: 1,
  },
  {
    name: "LA County Office of Education",
    url: "https://www.lacoe.edu/Business-Services/Doing-Business-With-LACOE/Bid-and-RFP",
    agency: "LA County Office of Education",
    county: "Los Angeles",
    rowSelector: "table tr, .field-items li",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
  },
  {
    name: "City of Roseville",
    url: "https://www.roseville.ca.us/cms/one.aspx?pageId=8944077",
    agency: "City of Roseville",
    county: "Placer",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
  },
  {
    name: "El Dorado Irrigation District",
    url: "https://www.eid.org/doing-business-with-eid/procurement-and-contracts",
    agency: "El Dorado Irrigation District",
    county: "El Dorado",
    rowSelector: "table tr, .field-items li",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 0,
  },
  {
    name: "Imperial Irrigation District (Procureware)",
    url: "https://iid.procureware.com/Bids",
    agency: "Imperial Irrigation District",
    county: "Imperial",
    rowSelector: "table tr, .bid-item",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
  },
  {
    name: "Quality Bidders",
    url: "https://www.qualitybidders.com/bids",
    agency: "Various (Quality Bidders)",
    county: "California",
    rowSelector: "table tr, .bid-listing",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
  },
];

export async function scrapeGenericSites(): Promise<Listing[]> {
  const results: Listing[] = [];

  for (const site of SITES) {
    try {
      const res = await fetch(site.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TDRBot/1.0; +https://thedailyreporter.net)",
          "Accept": "text/html,application/xhtml+xml,*/*",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.warn(`${site.name}: HTTP ${res.status} — skipping`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const rows = $(site.rowSelector);
      let found = 0;

      rows.each((i, row) => {
        if (i < (site.skipRows ?? 1)) return; // skip header rows

        const cells = $(row).find("td, th, li");
        const title = cells.eq(site.titleCol).text().replace(/\s+/g, " ").trim();
        const dateText = cells.eq(site.dateCol).text().replace(/\s+/g, " ").trim();

        if (!title || title.length < 4) return;
        // skip obvious header rows
        if (/^(project|title|description|bid|name|item)/i.test(title)) return;

        const linkEl = site.linkCol !== undefined
          ? cells.eq(site.linkCol).find("a")
          : $(row).find("a").first();
        const href = linkEl.attr("href") || "";
        const sourceUrl = href
          ? resolveUrl(href, site.url)
          : site.url;

        const bidDate = tryParseDate(dateText);

        results.push({
          title,
          agency: site.agency,
          county: site.county,
          bid_date: bidDate,
          description: null,
          source_url: sourceUrl,
          contact_info: null,
        });
        found++;
      });

      console.log(`${site.name}: ${found} listings`);
    } catch (err: unknown) {
      console.error(`${site.name} error:`, err instanceof Error ? err.message : err);
    }
  }

  return results;
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith("http")) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return base;
  }
}

function tryParseDate(raw: string): string | null {
  if (!raw) return null;
  // Try common formats
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020) return d.toISOString();
  // Try extracting a date pattern like MM/DD/YYYY
  const match = cleaned.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
  if (match) {
    const d2 = new Date(match[0]);
    if (!isNaN(d2.getTime())) return d2.toISOString();
  }
  return null;
}
