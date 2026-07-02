// Imperial County Public Works — WordPress REST API
// The site uses Brizy page builder with unpredictable CSS classes;
// scraping HTML is unreliable. The WP REST API returns clean JSON.

import type { Listing } from "../types";

const API_URL =
  "https://publicworks.imperialcounty.org/wp-json/wp/v2/posts?per_page=50&_fields=title,link,date,excerpt";

export async function scrapeImperialCounty(): Promise<Listing[]> {
  const results: Listing[] = [];

  try {
    const res = await fetch(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TDR-Scraper/1.0)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`Imperial County WP API: HTTP ${res.status}`);
      return results;
    }

    const posts = (await res.json()) as WPPost[];

    const cutoff = Date.now() - 90 * 86400000;

    for (const post of posts) {
      const title = decodeHtmlEntities(post.title?.rendered || "").trim();
      if (!title || title.length < 4) continue;
      // Filter to bid-related posts
      if (!/bid|notice|contract|proposal|rfp|rfq|ifb|solicit/i.test(title)) continue;
      // post.date is the WP publish date, NOT the bid due date — use it only
      // to skip stale announcements
      if (post.date && new Date(post.date).getTime() < cutoff) continue;

      const excerpt = post.excerpt?.rendered
        ? decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim()
        : null;

      results.push({
        title,
        agency: "Imperial County Public Works",
        county: "Imperial",
        bid_date: extractDueDate(`${title} ${excerpt || ""}`),
        description: excerpt || null,
        source_url: post.link || "https://publicworks.imperialcounty.org",
        contact_info: null,
      });
    }

    console.log(`Imperial County: ${results.length} listings`);
  } catch (err) {
    console.error("Imperial County error:", err instanceof Error ? err.message : err);
  }

  return results;
}

interface WPPost {
  title?: { rendered: string };
  link?: string;
  date?: string;
  excerpt?: { rendered: string };
}

// Pull a bid due date out of the notice text, e.g. "July 10, 2026" or "7/10/2026".
// Returns the first date that parses and lands within a plausible bid window.
function extractDueDate(text: string): string | null {
  const patterns = [
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
    /\d{1,2}\/\d{1,2}\/\d{4}/g,
  ];
  const now = Date.now();
  const min = now - 30 * 86400000;
  const max = now + 365 * 86400000;
  for (const re of patterns) {
    for (const match of text.match(re) || []) {
      const d = new Date(match);
      const t = d.getTime();
      if (!isNaN(t) && t >= min && t <= max) return d.toISOString();
    }
  }
  return null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}
