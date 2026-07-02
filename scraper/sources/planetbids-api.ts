// PlanetBids scraper using the public JSON API the vendor portal SPA calls.
// No login required for searching bids. Endpoint discovered by capturing the
// Ember app's XHR traffic:
//   GET https://api-external.prod.planetbids.com/papi/bids?cid={portalId}&stage_id=3&...
// Requires a visit-id header obtained from GET /papi/version?new_session=true
// and Accept: application/vnd.api+json. stage_id=3 = "Bidding" (open bids).

import type { Listing } from "../types";

// Every portal ID below was verified live against GET /papi/agencies/{id}
// on 2026-07-02 — the API returns the agency name shown in the comment.
// Agencies NOT on PlanetBids (verified): San Jose (Biddingo), Oakland (iSupplier),
// Anaheim + Alameda County (OpenGov), Fremont/Stockton/Contra Costa (own sites).
const PORTALS = [
  // Water districts
  { id: "16151", agency: "Metropolitan Water District of Southern California", county: "Los Angeles" },
  { id: "48397", agency: "Santa Clara Valley Water District", county: "Santa Clara" },
  { id: "27355", agency: "Santa Clarita Valley Water Agency", county: "Los Angeles" },
  // Cities
  { id: "14769", agency: "City of Fresno", county: "Fresno" },
  { id: "15300", agency: "City of Sacramento", county: "Sacramento" },
  { id: "17950", agency: "City of San Diego", county: "San Diego" },
  { id: "39475", agency: "City of Riverside", county: "Riverside" },
  { id: "20137", agency: "City of Santa Ana", county: "Orange" },
  { id: "14660", agency: "City of Bakersfield", county: "Kern" },
  { id: "15381", agency: "City of Chula Vista", county: "San Diego" },
  { id: "14210", agency: "City of Burbank", county: "Los Angeles" },
  { id: "23532", agency: "City of Palmdale", county: "Los Angeles" },
  { id: "45299", agency: "City of Goleta", county: "Santa Barbara" },
  // Ports / transit / special districts
  { id: "19236", agency: "Port of Long Beach", county: "Los Angeles" },
  { id: "29905", agency: "Foothill Transit", county: "Los Angeles" },
  { id: "14771", agency: "San Diego Metropolitan Transit System", county: "San Diego" },
  { id: "20134", agency: "North County Transit District", county: "San Diego" },
  { id: "68007", agency: "San Mateo County Transit District", county: "San Mateo" },
  { id: "39501", agency: "San Joaquin Regional Rail Commission", county: "San Joaquin" },
  { id: "16725", agency: "San Diego County Regional Airport Authority", county: "San Diego" },
  { id: "15588", agency: "San Gabriel Valley Council of Governments", county: "Los Angeles" },
  // Schools / colleges
  { id: "21372", agency: "Los Angeles Community College District", county: "Los Angeles" },
  { id: "39502", agency: "San Jose Evergreen Community College District", county: "Santa Clara" },
  { id: "61954", agency: "Los Angeles County Office of Education", county: "Los Angeles" },
];

const API = "https://api-external.prod.planetbids.com/papi";
const PORTAL_BASE = "https://vendors.planetbids.com/portal";
const STAGE_BIDDING = 3;
const PER_PAGE = 30; // API rejects anything above 30 with HTTP 400
const MAX_PAGES = 10; // safety cap per portal (300 open bids)

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface PbBidAttributes {
  bidId: number;
  title: string;
  invitationNum: string;
  bidDueDate: string;
  stageStr: string;
  bidTypeId: number;
}

function pbHeaders(visitId: string, portalId: string): Record<string, string> {
  return {
    "User-Agent": UA,
    Accept: "application/vnd.api+json",
    Origin: "https://vendors.planetbids.com",
    Referer: "https://vendors.planetbids.com/",
    "em-version": "",
    "visit-id": visitId,
    "company-id": portalId,
    "vendor-id": "null",
    "vendor-login-id": "null",
    "timezone-name": "America/Los_Angeles",
  };
}

async function getVisitId(): Promise<string> {
  const res = await fetch(`${API}/version?new_session=true`, {
    headers: {
      "User-Agent": UA,
      Accept: "application/vnd.api+json",
      Origin: "https://vendors.planetbids.com",
    },
  });
  if (!res.ok) throw new Error(`PlanetBids version endpoint HTTP ${res.status}`);
  const json = await res.json();
  const visitId = json?.data?.attributes?.visitId;
  if (!visitId) throw new Error("PlanetBids version endpoint returned no visitId");
  return String(visitId);
}

function parsePbDate(raw: string): string | null {
  if (!raw) return null;
  // Format: "2026-07-07 14:00:00.000" (portal-local time; treat as-is)
  const d = new Date(raw.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export async function scrapePlanetBidsApi(): Promise<Listing[]> {
  const results: Listing[] = [];
  const visitId = await getVisitId();

  for (const portal of PORTALS) {
    try {
      let page = 1;
      let totalPages = 1;
      let found = 0;

      while (page <= totalPages && page <= MAX_PAGES) {
        const url =
          `${API}/bids?bid_type_id=0&cid=${portal.id}&dept_id=0&due_date_from=&due_date_to=` +
          `&keyword=&page=${page}&per_page=${PER_PAGE}&sort_by=&sort_order=-1&stage_id=${STAGE_BIDDING}`;
        const res = await fetch(url, { headers: pbHeaders(visitId, portal.id) });
        if (!res.ok) {
          console.warn(`PlanetBids ${portal.agency}: HTTP ${res.status}`);
          break;
        }
        const json = await res.json();
        totalPages = Number(json?.meta?.totalPages) || 1;
        const bids: PbBidAttributes[] = (json?.data || []).map(
          (d: { attributes: PbBidAttributes }) => d.attributes
        );

        for (const bid of bids) {
          if (!bid.title) continue;
          results.push({
            title: bid.title,
            agency: portal.agency,
            county: portal.county,
            bid_date: parsePbDate(bid.bidDueDate),
            description: bid.invitationNum ? `Invitation #${bid.invitationNum}` : null,
            source_url: `${PORTAL_BASE}/${portal.id}/bo/bo-detail/${bid.bidId}`,
            contact_info: null,
          });
          found++;
        }
        page++;
      }

      console.log(`PlanetBids ${portal.agency}: ${found} listings`);
    } catch (err) {
      console.error(`PlanetBids ${portal.agency} error:`, err instanceof Error ? err.message : err);
    }
  }

  return results;
}
