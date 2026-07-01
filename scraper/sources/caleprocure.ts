// Cal eProcure — State of California procurement
// https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx
// This is an Angular SPA — we hit the underlying JSON API directly

import type { Listing } from "../types";

// Cal eProcure has a public REST API backing the search page
const API_URL = "https://caleprocure.ca.gov/caleprocure-api/public/events/search";

export async function scrapeCalEProcure(): Promise<Listing[]> {
  const results: Listing[] = [];

  try {
    const body = {
      pageNumber: 1,
      pageSize: 100,
      sortBy: "eventEndDate",
      sortOrder: "asc",
      buyerState: "CA",
      eventTypes: ["IFB", "RFP", "RFQ", "ITB"],
      eventStatuses: ["OPEN"],
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": "https://caleprocure.ca.gov",
        "Referer": "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`Cal eProcure: HTTP ${res.status}`);
      return results;
    }

    const data = await res.json() as CalEProcureResponse;
    const items = data?.items || data?.results || (Array.isArray(data) ? data : []);

    for (const item of items as CalEProcureItem[]) {
      if (!item.eventTitle && !item.title) continue;

      results.push({
        title: item.eventTitle || item.title || "Untitled",
        agency: item.buyerName || item.agency || "State of California",
        county: inferCounty(item.buyerName || item.agency || ""),
        bid_date: item.eventEndDate || item.bidDueDate || null,
        description: [item.eventNumber, item.eventType].filter(Boolean).join(" · ") || null,
        source_url: item.eventId
          ? `https://caleprocure.ca.gov/pages/Events-BS3/event-detail.aspx?id=${item.eventId}`
          : "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
        contact_info: item.contactName
          ? `${item.contactName} · ${item.contactEmail || ""}`.trim().replace(/·\s*$/, "")
          : null,
      });
    }

    console.log(`Cal eProcure: ${results.length} listings`);
  } catch (err) {
    console.error("Cal eProcure error:", err instanceof Error ? err.message : err);
  }

  return results;
}

interface CalEProcureResponse {
  items?: CalEProcureItem[];
  results?: CalEProcureItem[];
}

interface CalEProcureItem {
  eventId?: string;
  eventNumber?: string;
  eventTitle?: string;
  title?: string;
  eventType?: string;
  eventEndDate?: string;
  bidDueDate?: string;
  buyerName?: string;
  agency?: string;
  contactName?: string;
  contactEmail?: string;
}

function inferCounty(agency: string): string {
  const counties = [
    "Alameda","Butte","Contra Costa","El Dorado","Fresno","Kern","Kings",
    "Los Angeles","Marin","Merced","Monterey","Napa","Nevada","Orange",
    "Placer","Riverside","Sacramento","San Bernardino","San Diego",
    "San Francisco","San Joaquin","San Luis Obispo","San Mateo","Santa Barbara",
    "Santa Clara","Santa Cruz","Shasta","Solano","Sonoma","Stanislaus",
    "Tulare","Ventura","Yolo",
  ];
  for (const county of counties) {
    if (agency.toLowerCase().includes(county.toLowerCase())) return county;
  }
  return "California";
}
