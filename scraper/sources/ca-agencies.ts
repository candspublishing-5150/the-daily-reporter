// Additional CA public agencies — server-rendered HTML scrapers
// Covers SF Public Works, SoCal agencies, and more

import * as cheerio from "cheerio";
import type { Listing } from "../types";

type AgencyConfig = {
  name: string;
  url: string;
  agency: string;
  county: string;
  rowSelector: string;
  titleCol: number;
  dateCol?: number;
  linkCol?: number;
  skipRows?: number;
  linkBase?: string;
};

const AGENCIES: AgencyConfig[] = [
  // SF Public Works
  {
    name: "SF Public Works",
    url: "https://sfpublicworks.org/bids",
    agency: "San Francisco Public Works",
    county: "San Francisco",
    rowSelector: "table tr, .view-content .views-row, article.bid",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://sfpublicworks.org",
  },
  // City of San Jose
  {
    name: "City of San Jose Bids",
    url: "https://www.sanjoseca.gov/government/departments-offices/finance/purchasing/bids-rfps",
    agency: "City of San Jose",
    county: "Santa Clara",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
    linkBase: "https://www.sanjoseca.gov",
  },
  // Riverside County
  {
    name: "Riverside County Purchasing",
    url: "https://purchasing.co.riverside.ca.us/sourcing/PublicBids.asp",
    agency: "Riverside County",
    county: "Riverside",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 3, linkCol: 1, skipRows: 1,
    linkBase: "https://purchasing.co.riverside.ca.us",
  },
  // San Bernardino County
  {
    name: "San Bernardino County Bids",
    url: "https://www.sbcounty.gov/cao/purchasing/bids",
    agency: "San Bernardino County",
    county: "San Bernardino",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.sbcounty.gov",
  },
  // Orange County
  {
    name: "Orange County Purchasing",
    url: "https://oc.ca.gov/departments/purchasing/bid-list/",
    agency: "Orange County",
    county: "Orange",
    rowSelector: "table tr, .bid-list tr, article",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://oc.ca.gov",
  },
  // Kern County
  {
    name: "Kern County Bids",
    url: "https://www.kerncounty.com/government/county-departments/administrative-office/purchasing-services/current-bids",
    agency: "Kern County",
    county: "Kern",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.kerncounty.com",
  },
  // Ventura County
  {
    name: "Ventura County Bids",
    url: "https://portalvhb.ventura.org/psp/VHBPRD/EMPLOYEE/ERP/c/COUNTY_PURCH.COUNTY_PURCH_BRD.GBL",
    agency: "Ventura County",
    county: "Ventura",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 3, linkCol: 1, skipRows: 1,
    linkBase: "https://portalvhb.ventura.org",
  },
  // Fresno County (HTML)
  {
    name: "Fresno County Purchasing",
    url: "https://www.co.fresno.ca.us/departments/internal-services/purchasing/bids-rfps",
    agency: "Fresno County",
    county: "Fresno",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.co.fresno.ca.us",
  },
  // Santa Clara County
  {
    name: "Santa Clara County Bids",
    url: "https://sccgov.iqm2.com/Citizens/SplitView.aspx?Mode=OpenBids",
    agency: "Santa Clara County",
    county: "Santa Clara",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://sccgov.iqm2.com",
  },
  // SFMTA (SF Municipal Transportation Agency)
  {
    name: "SFMTA Contracts",
    url: "https://www.sfmta.com/contracts",
    agency: "SF Municipal Transportation Agency",
    county: "San Francisco",
    rowSelector: "table tr, .contract-item",
    titleCol: 0, dateCol: 2, linkCol: 0, skipRows: 1,
    linkBase: "https://www.sfmta.com",
  },
  // San Diego MTS
  {
    name: "San Diego MTS Procurement",
    url: "https://www.sdmts.com/business-center/procurement",
    agency: "San Diego Metropolitan Transit System",
    county: "San Diego",
    rowSelector: "table tr, .field-item a",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.sdmts.com",
  },
  // Port of Long Beach
  {
    name: "Port of Long Beach Bids",
    url: "https://www.polb.com/business/contracts-bids/bids",
    agency: "Port of Long Beach",
    county: "Los Angeles",
    rowSelector: "table tr, .bid-row, article",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.polb.com",
  },
  // Port of Los Angeles
  {
    name: "Port of Los Angeles Bids",
    url: "https://www.portoflosangeles.org/business/bid-solicitations",
    agency: "Port of Los Angeles",
    county: "Los Angeles",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.portoflosangeles.org",
  },
  // City of Riverside
  {
    name: "City of Riverside Bids",
    url: "https://www.riversideca.gov/purchasing/bids",
    agency: "City of Riverside",
    county: "Riverside",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.riversideca.gov",
  },
  // Solano County
  {
    name: "Solano County Bids",
    url: "https://www.solanocounty.com/depts/purchasing/bids.asp",
    agency: "Solano County",
    county: "Solano",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.solanocounty.com",
  },
  // Napa County
  {
    name: "Napa County Bids",
    url: "https://www.countyofnapa.org/2106/Bids-RFPs",
    agency: "Napa County",
    county: "Napa",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.countyofnapa.org",
  },
  // Sonoma County
  {
    name: "Sonoma County Bids",
    url: "https://sonomacounty.ca.gov/purchasing/bids",
    agency: "Sonoma County",
    county: "Sonoma",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://sonomacounty.ca.gov",
  },
  // Marin County
  {
    name: "Marin County Bids",
    url: "https://www.marincounty.org/depts/pur/bids-and-rfps",
    agency: "Marin County",
    county: "Marin",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.marincounty.org",
  },
  // Monterey County
  {
    name: "Monterey County Bids",
    url: "https://www.montereycounty.gov/government/departments/purchasing-and-contracts/current-bids-and-rfps",
    agency: "Monterey County",
    county: "Monterey",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.montereycounty.gov",
  },
  // San Luis Obispo County
  {
    name: "SLO County Bids",
    url: "https://www.slocounty.ca.gov/Departments/General-Services/Purchasing/Bids.aspx",
    agency: "San Luis Obispo County",
    county: "San Luis Obispo",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.slocounty.ca.gov",
  },
  // Santa Barbara County
  {
    name: "Santa Barbara County Bids",
    url: "https://www.countyofsb.org/ceo/purchasing-bids.sbc",
    agency: "Santa Barbara County",
    county: "Santa Barbara",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.countyofsb.org",
  },
  // Tulare County
  {
    name: "Tulare County Bids",
    url: "https://tularecounty.ca.gov/gsoc/purchasing/bids-rfps",
    agency: "Tulare County",
    county: "Tulare",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://tularecounty.ca.gov",
  },
  // San Joaquin County
  {
    name: "San Joaquin County Bids",
    url: "https://purchasing.sjgov.org/sourcing/PublicBids.asp",
    agency: "San Joaquin County",
    county: "San Joaquin",
    rowSelector: "table tr",
    titleCol: 1, dateCol: 3, linkCol: 1, skipRows: 1,
    linkBase: "https://purchasing.sjgov.org",
  },
  // Stanislaus County
  {
    name: "Stanislaus County Bids",
    url: "https://www.stancounty.com/purchasing/bids.shtm",
    agency: "Stanislaus County",
    county: "Stanislaus",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.stancounty.com",
  },
  // El Dorado County
  {
    name: "El Dorado County Bids",
    url: "https://www.edcgov.us/Government/Purchasing/pages/activebidssolicitations.aspx",
    agency: "El Dorado County",
    county: "El Dorado",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.edcgov.us",
  },
  // Placer County
  {
    name: "Placer County Bids",
    url: "https://www.placer.ca.gov/2132/Current-Bids",
    agency: "Placer County",
    county: "Placer",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.placer.ca.gov",
  },
  // Yolo County
  {
    name: "Yolo County Bids",
    url: "https://www.yolocounty.org/general-government-2/general-services/bids-and-purchasing",
    agency: "Yolo County",
    county: "Yolo",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.yolocounty.org",
  },
  // Butte County
  {
    name: "Butte County Bids",
    url: "https://www.buttecounty.net/Departments/General-Services/Purchasing/Bids",
    agency: "Butte County",
    county: "Butte",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.buttecounty.net",
  },
  // Shasta County
  {
    name: "Shasta County Bids",
    url: "https://www.shastacounty.gov/general-services/page/bids-rfps",
    agency: "Shasta County",
    county: "Shasta",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.shastacounty.gov",
  },
  // Humboldt County
  {
    name: "Humboldt County Bids",
    url: "https://humboldtgov.org/317/Bids-RFPs",
    agency: "Humboldt County",
    county: "Humboldt",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://humboldtgov.org",
  },
  // SCVWD (now in PlanetBids but try direct too)
  {
    name: "Santa Clara Valley Water",
    url: "https://www.valleywater.org/doing-business-valley-water/bidding-opportunities",
    agency: "Santa Clara Valley Water District",
    county: "Santa Clara",
    rowSelector: "table tr, .bid-table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.valleywater.org",
  },
  // MWD (also in PlanetBids but check direct page)
  {
    name: "Metropolitan Water District",
    url: "https://www.mwdh2o.com/doing-business/bids-proposals",
    agency: "Metropolitan Water District of Southern California",
    county: "Los Angeles",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.mwdh2o.com",
  },
  // SDCWA (San Diego County Water Authority)
  {
    name: "San Diego County Water Authority Bids",
    url: "https://www.sdcwa.org/business/current-bids-and-rfps",
    agency: "San Diego County Water Authority",
    county: "San Diego",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.sdcwa.org",
  },
  // LADWP
  {
    name: "LADWP Bids",
    url: "https://www.ladwp.com/contractors-vendors/bids",
    agency: "Los Angeles Department of Water and Power",
    county: "Los Angeles",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.ladwp.com",
  },
  // PG&E Capital Projects (public bid notices)
  {
    name: "SJPWA Bids",
    url: "https://publicworks.sanjoseca.gov/doing-business/bids",
    agency: "City of San Jose Public Works",
    county: "Santa Clara",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://publicworks.sanjoseca.gov",
  },
  // City of Sacramento
  {
    name: "City of Sacramento Bids",
    url: "https://www.cityofsacramento.org/Finance/Purchasing/Current-Bids-RFPs",
    agency: "City of Sacramento",
    county: "Sacramento",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.cityofsacramento.org",
  },
  // City of Stockton
  {
    name: "City of Stockton Bids",
    url: "https://www.stocktonca.gov/government/departments/finance/purchasing/bids.html",
    agency: "City of Stockton",
    county: "San Joaquin",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.stocktonca.gov",
  },
  // City of Bakersfield
  {
    name: "City of Bakersfield Bids",
    url: "https://www.bakersfieldcity.us/gov/depts/admin/purchasing/bids.asp",
    agency: "City of Bakersfield",
    county: "Kern",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.bakersfieldcity.us",
  },
  // East Bay Regional Parks
  {
    name: "East Bay Regional Parks Bids",
    url: "https://www.ebparks.org/about/doing-business/bids-rfps",
    agency: "East Bay Regional Park District",
    county: "Alameda",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.ebparks.org",
  },
  // BART procurement (public notice page)
  {
    name: "BART Procurement",
    url: "https://www.bart.gov/contracts",
    agency: "Bay Area Rapid Transit (BART)",
    county: "Alameda",
    rowSelector: "table tr, .views-row",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.bart.gov",
  },
  // Caltrain
  {
    name: "Caltrain Contracts",
    url: "https://www.caltrain.com/business/contracting-opportunities",
    agency: "Caltrain",
    county: "San Mateo",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.caltrain.com",
  },
  // VTA (Santa Clara Valley Transportation Authority)
  {
    name: "VTA Procurement",
    url: "https://www.vta.org/business/vendor-opportunities/active-procurement",
    agency: "Santa Clara Valley Transportation Authority",
    county: "Santa Clara",
    rowSelector: "table tr, .field-items",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.vta.org",
  },
  // Golden Gate Bridge District
  {
    name: "Golden Gate Bridge District Bids",
    url: "https://www.goldengate.org/district/procurement/current-solicitations/",
    agency: "Golden Gate Bridge, Highway and Transportation District",
    county: "Marin",
    rowSelector: "table tr, .bid-list li",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.goldengate.org",
  },
  // UC Berkeley (public construction bids)
  {
    name: "UC Berkeley Capital Projects",
    url: "https://capitalprojects.berkeley.edu/bid-opportunities/",
    agency: "UC Berkeley Capital Projects",
    county: "Alameda",
    rowSelector: "table tr, .view-content .views-row",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://capitalprojects.berkeley.edu",
  },
  // UC Davis
  {
    name: "UC Davis Bids",
    url: "https://www.ucdbid.ucdavis.edu/",
    agency: "UC Davis",
    county: "Yolo",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.ucdbid.ucdavis.edu",
  },
  // San Jose State University (CSU)
  {
    name: "CSU Channel Islands Bids",
    url: "https://www.csuci.edu/purchasing/construction-bids.htm",
    agency: "CSU Channel Islands",
    county: "Ventura",
    rowSelector: "table tr",
    titleCol: 0, dateCol: 1, linkCol: 0, skipRows: 1,
    linkBase: "https://www.csuci.edu",
  },
];

export async function scrapeCaAgencies(): Promise<Listing[]> {
  const results: Listing[] = [];

  for (const agency of AGENCIES) {
    let found = 0;
    try {
      const res = await fetch(agency.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.warn(`${agency.name}: HTTP ${res.status} — skipping`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const base = agency.linkBase || new URL(agency.url).origin;

      $(agency.rowSelector).each((i, row) => {
        if (i < (agency.skipRows ?? 1)) return;

        const cells = $(row).find("td");
        if (cells.length === 0) return;

        const title = cells.eq(agency.titleCol).text().replace(/\s+/g, " ").trim();
        const dateText = agency.dateCol !== undefined
          ? cells.eq(agency.dateCol).text().replace(/\s+/g, " ").trim()
          : "";

        if (!title || title.length < 4) return;
        if (/^(project|title|description|bid|name|item|solicitation|#)\b/i.test(title)) return;

        const linkEl = agency.linkCol !== undefined
          ? cells.eq(agency.linkCol).find("a").first()
          : $(row).find("a").first();
        const href = linkEl.attr("href") || $(row).find("a").first().attr("href") || "";
        const sourceUrl = href
          ? (href.startsWith("http") ? href : new URL(href, base).toString())
          : agency.url;

        results.push({
          title,
          agency: agency.agency,
          county: agency.county,
          bid_date: tryParseDate(dateText),
          description: null,
          source_url: sourceUrl,
          contact_info: null,
        });
        found++;
      });

      console.log(`${agency.name}: ${found} listings`);
    } catch (err) {
      console.error(`${agency.name} error:`, err instanceof Error ? err.message : err);
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
