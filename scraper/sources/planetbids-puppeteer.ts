// PlanetBids scraper using Puppeteer (headless Chrome)
// Required because vendors.planetbids.com is a full Ember.js SPA.
// Credentials are read from PLANETBIDS_EMAIL / PLANETBIDS_PASSWORD env vars.
// Falls back to public (unauthenticated) view if no credentials are set.

import type { Listing } from "../types";

const PORTALS = [
  { id: "16151", agency: "Metropolitan Water District of Southern California", county: "Los Angeles" },
  { id: "48397", agency: "Santa Clara Valley Water District", county: "Santa Clara" },
  { id: "14769", agency: "City of Fresno", county: "Fresno" },
];

const BASE = "https://vendors.planetbids.com";
const LOGIN_URL = `${BASE}/login`;
const BID_SEARCH_PATH = (id: string) => `/portal/${id}/bo/bo-search`;

export async function scrapePlanetBidsPuppeteer(): Promise<Listing[]> {
  const email = (process.env.PLANETBIDS_EMAIL || "").replace(/[^\x20-\x7E]/g, "");
  const password = (process.env.PLANETBIDS_PASSWORD || "").replace(/[^\x20-\x7E]/g, "");

  // Dynamic import so the module loads even if puppeteer isn't installed
  let puppeteer: typeof import("puppeteer");
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.warn("PlanetBids (Puppeteer): puppeteer not installed — skipping");
    return [];
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const results: Listing[] = [];

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Log in once if credentials are available
    if (email && password) {
      console.log("PlanetBids: logging in...");
      await page.goto(LOGIN_URL, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for and fill the login form
      await page.waitForSelector("input[type='email'], input[name='email'], input[placeholder*='email' i]", { timeout: 10000 });
      const emailSel = await page.$("input[type='email']") || await page.$("input[name='email']") || await page.$("input[placeholder*='email' i]");
      const passSel = await page.$("input[type='password']");

      if (emailSel && passSel) {
        await emailSel.type(email, { delay: 40 });
        await passSel.type(password, { delay: 40 });

        // Submit — look for a submit button or press Enter
        const submitBtn = await page.$("button[type='submit'], input[type='submit'], button.login-btn");
        if (submitBtn) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
            submitBtn.click(),
          ]);
        } else {
          await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
            passSel.press("Enter"),
          ]);
        }
        console.log("PlanetBids: login submitted, now at", page.url());
      } else {
        console.warn("PlanetBids: could not find login form fields");
      }
    } else {
      console.log("PlanetBids: no credentials set — using public view");
    }

    // Scrape each portal
    for (const portal of PORTALS) {
      let found = 0;
      try {
        const url = `${BASE}${BID_SEARCH_PATH(portal.id)}`;
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        // Wait for bid rows to appear (the SPA renders them after API calls)
        await page.waitForSelector(
          "table tbody tr, .bid-row, [class*='bid-item'], [data-test*='bid'], .bo-list-item, li.bid",
          { timeout: 15000 }
        ).catch(() => {});

        // Extra wait for dynamic content
        await new Promise(r => setTimeout(r, 2000));

        // Extract bid data from the rendered DOM
        const bids = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll(
            "table tbody tr, .bid-row, [class*='bid-item'], .bo-list-item"
          ));

          return rows.map(row => {
            const cells = Array.from(row.querySelectorAll("td"));
            const getText = (el: Element | null) =>
              el ? el.textContent?.replace(/\s+/g, " ").trim() || "" : "";

            const link = row.querySelector("a")?.getAttribute("href") || "";
            const title = cells.length >= 2
              ? getText(cells[1]) || getText(cells[0])
              : getText(row.querySelector("[class*='title'], [class*='name'], [class*='desc']") || row);
            const dateText = cells.length >= 4
              ? getText(cells[3]) || getText(cells[2])
              : "";

            return { title, dateText, link };
          }).filter(b => b.title && b.title.length > 3);
        });

        for (const bid of bids) {
          if (/^(bid|title|description|project|#)/i.test(bid.title)) continue;
          const sourceUrl = bid.link
            ? (bid.link.startsWith("http") ? bid.link : `${BASE}${bid.link}`)
            : url;
          results.push({
            title: bid.title,
            agency: portal.agency,
            county: portal.county,
            bid_date: tryParseDate(bid.dateText),
            description: null,
            source_url: sourceUrl,
            contact_info: null,
          });
          found++;
        }

        // If rows approach failed, try extracting from page text as last resort
        if (found === 0) {
          const pageText = await page.evaluate(() => document.body.innerText);
          if (/login|sign in/i.test(pageText) && !email) {
            console.warn(`PlanetBids ${portal.agency}: login required — set PLANETBIDS_EMAIL/PASSWORD secrets`);
          } else {
            console.log(`PlanetBids ${portal.agency}: no bid rows found (page may use different markup)`);
          }
        }

        console.log(`PlanetBids ${portal.agency}: ${found} listings`);
      } catch (err) {
        console.error(`PlanetBids ${portal.agency} error:`, err instanceof Error ? err.message : err);
      }
    }
  } finally {
    await browser.close();
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
