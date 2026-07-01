/**
 * TDR Job-Finding Bot
 * Scrapes public works bid sites and upserts results into Supabase listings table.
 * Run via: npx tsx scraper/index.ts
 * Scheduled via: .github/workflows/scraper.yml (every Monday 8am PT)
 */

// Node 24 has native WebSocket but @supabase/supabase-js needs it on globalThis
import { WebSocket } from "ws";
if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).WebSocket = WebSocket;
}

import { createClient } from "@supabase/supabase-js";
import { scrapeCaltrans } from "./sources/caltrans";
import { scrapePlanetBids } from "./sources/planetbids";
import { scrapeARC } from "./sources/arc";
import { scrapeCalEProcure } from "./sources/caleprocure";
import { scrapeGenericSites } from "./sources/generic-html";
import type { Listing } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log(`\n🔍 TDR Scraper starting — ${new Date().toISOString()}\n`);
  const allListings: Listing[] = [];

  // Run all scrapers (some may fail — that's ok, we collect what we get)
  const scrapers = [
    { name: "Caltrans",       fn: scrapeCaltrans },
    { name: "PlanetBids",     fn: scrapePlanetBids },
    { name: "ARC Plan Rooms", fn: scrapeARC },
    { name: "Cal eProcure",   fn: scrapeCalEProcure },
    { name: "Generic HTML",   fn: scrapeGenericSites },
  ];

  for (const scraper of scrapers) {
    console.log(`\n--- ${scraper.name} ---`);
    try {
      const listings = await scraper.fn();
      allListings.push(...listings);
      console.log(`  → ${listings.length} listings`);
    } catch (err) {
      console.error(`  ✗ ${scraper.name} failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n📦 Total scraped: ${allListings.length} listings`);

  if (allListings.length === 0) {
    console.log("Nothing to save. Exiting.");
    return;
  }

  // Filter out listings with no title or source_url, sanitize unicode
  function sanitize(s: string | null): string | null {
    if (!s) return null;
    // Replace smart quotes, em/en dashes, and other non-latin1 chars with ASCII equivalents
    return s
      .replace(/[–—]/g, "-")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^\x00-\xFF]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const valid = allListings
    .filter(l => l.title && l.title.length > 2 && l.source_url)
    .map(l => ({ ...l, title: sanitize(l.title)!, agency: sanitize(l.agency)!, description: sanitize(l.description), contact_info: sanitize(l.contact_info) }));
  console.log(`Valid listings: ${valid.length}`);

  // Upsert by source_url — deduplicates across runs
  let saved = 0;
  let skipped = 0;
  const BATCH = 50;

  for (let i = 0; i < valid.length; i += BATCH) {
    const batch = valid.slice(i, i + BATCH);

    const { error } = await supabase
      .from("listings")
      .upsert(
        batch.map(l => ({
          title: l.title,
          agency: l.agency,
          county: l.county,
          bid_date: l.bid_date,
          description: l.description,
          source_url: l.source_url,
          contact_info: l.contact_info,
        })),
        { onConflict: "source_url", ignoreDuplicates: false }
      );

    if (error) {
      console.error(`Batch ${i}-${i + BATCH} upsert error:`, error.message);
      skipped += batch.length;
    } else {
      saved += batch.length;
    }
  }

  console.log(`\n✅ Done — saved/updated: ${saved}, skipped: ${skipped}`);
  console.log(`   Run at: ${new Date().toISOString()}\n`);
}

run().catch(err => {
  console.error("Fatal scraper error:", err);
  process.exit(1);
});
