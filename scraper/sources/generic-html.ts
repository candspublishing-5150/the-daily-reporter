// Generic HTML scrapers for sites with consistent table/list structures

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
  linkBase?: string;
};

const SITES: SiteConfig[] = [
  // ── Working ─────────────────────────────────────────────────────────────
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

  // ── SF PUC ──────────────────────────────────────────────────────────────
  {
    name: "SF PUC",
    url: "https://webapps.sfpuc.org/bids/bidlist.aspx?bidtype=1",
    agency: "SF Public Utilities Commission",
    county: "San Francisco",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 2, linkCol: 1, skipRows: 1,
    linkBase: "https://webapps.sfpuc.org",
  },

  // ── Imperial County ──────────────────────────────────────────────────────
  {
    name: "Imperial County Public Works",
    url: "https://publicworks.imperialcounty.org/projects-out-to-bid/",
    agency: "Imperial County Public Works",
    county: "Imperial",
    rowSelector: ".entry-content p, .entry-content li, table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 0,
  },

  // ── City of Long Beach (BuySpeed portal — server-rendered) ───────────────
  {
    name: "City of Long Beach",
    url: "https://longbeachbuys.buyspeed.com/bso/view/search/external/advancedSearchBid.xhtml?openBids=true",
    agency: "City of Long Beach",
    county: "Los Angeles",
    rowSelector: "table tr, .search-results tr, [class*='bid'] tr",
    titleCol: 1, dateCol: 3, linkCol: 1, skipRows: 1,
    linkBase: "https://longbeachbuys.buyspeed.com",
  },

  // ── Sacramento County DGS ────────────────────────────────────────────────
  {
    name: "Sacramento County Procurement",
    url: "https://dgs.saccounty.gov/capsd/Pages/Current-Bid-Opportunities.aspx",
    agency: "Sacramento County",
    county: "Sacramento",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 2, linkCol: 1, skipRows: 1,
    linkBase: "https://dgs.saccounty.gov",
  },

  // ── City of Fresno capital projects ─────────────────────────────────────
  {
    name: "City of Fresno Bids",
    url: "https://www.fresno.gov/capitalprojects/projects/bid-opportunities/",
    agency: "City of Fresno",
    county: "Fresno",
    rowSelector: "table tr, .entry-content li, .wp-block-table tr, article",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.fresno.gov",
  },

  // ── Fresno County ────────────────────────────────────────────────────────
  {
    name: "Fresno County Purchasing",
    url: "https://www.fresnocountyca.gov/Departments/General-Services-Department/Purchasing-Services/Bid-Opportunities",
    agency: "County of Fresno",
    county: "Fresno",
    rowSelector: "table tr, .field-items li, .views-row",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.fresnocountyca.gov",
  },

  // ── Quality Bidders ───────────────────────────────────────────────────────
  {
    name: "Quality Bidders",
    url: "https://www.qualitybidders.com/bids",
    agency: "Various (Quality Bidders)",
    county: "California",
    rowSelector: "table tr, .bid-listing, .project-row, [class*='bid']",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
  },
];

export async function scrapeGenericSites(): Promise<Listing[]> {
  const results: Listing[] = [];

  for (const site of SITES) {
    try {
      const res = await fetch(site.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
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
        if (i < (site.skipRows ?? 1)) return;

        const cells = $(row).find("td, li");
        let title: string;
        let dateText: string;

        if (cells.length > 0) {
          title = cells.eq(site.titleCol).text().replace(/\s+/g, " ").trim();
          dateText = cells.eq(site.dateCol).text().replace(/\s+/g, " ").trim();
        } else {
          // For paragraph/div rows, use the element's own text
          title = $(row).text().replace(/\s+/g, " ").trim();
          dateText = "";
        }

        if (!title || title.length < 4) return;
        if (/^(project|title|description|bid|name|item|solicitation|#)\b/i.test(title)) return;

        const linkEl = site.linkCol !== undefined
          ? cells.eq(site.linkCol).find("a").first()
          : $(row).find("a").first();
        const href = linkEl.attr("href") || $(row).find("a").first().attr("href") || "";
        const base = site.linkBase || new URL(site.url).origin;
        const sourceUrl = href ? resolveUrl(href, base) : site.url;

        results.push({
          title,
          agency: site.agency,
          county: site.county,
          bid_date: tryParseDate(dateText),
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
  try { return new URL(href, base).toString(); } catch { return base; }
}

function tryParseDate(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020) return d.toISOString();
  const match = cleaned.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
  if (match) {
    const d2 = new Date(match[0]);
    if (!isNaN(d2.getTime())) return d2.toISOString();
  }
  return null;
}
