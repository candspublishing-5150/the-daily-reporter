// Cal eProcure — State of California procurement portal
// https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx

import type { Listing } from "../types";

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
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://caleprocure.ca.gov",
        "Referer": "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      console.warn(`Cal eProcure: HTTP ${res.status}`);
      return results;
    }

    const data = await res.json() as CalEProcureResponse;
    const items: CalEProcureItem[] = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);

    for (const item of items) {
      const title = item.eventTitle || item.title || item.description;
      if (!title) continue;

      results.push({
        title,
        agency: item.buyerName || item.departmentName || "State of California",
        county: inferCounty(item.buyerName || item.departmentName || ""),
        bid_date: item.eventEndDate || item.bidDueDate || item.closingDate || null,
        description: [item.eventNumber, item.eventType].filter(Boolean).join(" · ") || null,
        source_url: item.eventId
          ? `https://caleprocure.ca.gov/pages/Events-BS3/event-detail.aspx?id=${item.eventId}`
          : "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
        contact_info: item.contactName
          ? `${item.contactName}${item.contactEmail ? " · " + item.contactEmail : ""}`.trim()
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
  data?: CalEProcureItem[];
}

interface CalEProcureItem {
  eventId?: string;
  eventNumber?: string;
  eventTitle?: string;
  title?: string;
  description?: string;
  eventType?: string;
  eventEndDate?: string;
  bidDueDate?: string;
  closingDate?: string;
  buyerName?: string;
  departmentName?: string;
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
