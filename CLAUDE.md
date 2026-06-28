# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Daily Reporter (TDR) is a California construction trade newspaper — a complete rewrite of [thedailyreporter.net](https://thedailyreporter.net). It connects contractors to public construction bidding leads, runs legal outreach advertisements (certified by the CA Dept. of General Services since 1994), and manages a 13,000+ subscriber email list. Published by C&S Publishing (DBE/WBE/SBE/SMBE certified, woman-owned small business).

The design prototype lives in `design/` — the canonical source of truth for UI. The main file is `design/The Daily Reporter (standalone-src).dc.html`.

## Tech Stack

- **Frontend/Hosting**: Next.js (App Router) deployed on Vercel
- **Database/Auth/Storage**: Supabase (Postgres + Auth + Storage)
- **CI/CD**: GitHub Actions

## Common Commands

```bash
npm run dev           # Start local dev server
npm run build         # Production build
npm run lint          # Run ESLint
npm run test          # Run tests
npx supabase start    # Start local Supabase (Docker required)
npx supabase db push  # Push migrations
```

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--bg-warm` | `#f3efe7` | Page background |
| `--bg-header` | `#f6f1e8` | Masthead background |
| `--dark` | `#16181d` | Primary dark / nav bar / footer |
| `--red` | `#a8242f` | Primary brand accent (buttons, CTAs, "Reporter" in logo) |
| `--red-bright` | `#c43420` | Logo accent / selection highlight |
| `--red-hover` | `#8c1d27` | Button hover state |
| `--green` | `#2f7d52` | "Live" / active status |
| `--gold` | `#a08a52` | "Sponsored" badge / ad slot labels |
| `--border` | `#e2ddd2` | Standard border |
| `--border-dark` | `#ece7dd` | Dividers inside cards |
| `--muted` | `#9a968c` | Secondary text |
| `--text-body` | `#3d3f47` | Body text |

### Typography
All fonts loaded from Google Fonts:
- **Fraunces** (900) — masthead logo only
- **Zilla Slab** (400/500/600/700) — headlines, nav, buttons, card titles
- **Libre Franklin** (400/500/600/700) — body text, UI labels (base font)
- **IBM Plex Mono** (400/500/600) — dates, edition labels, monospace metadata

### Ad Slot Sizes
| Name | Dimensions | CPM | Placement |
|---|---|---|---|
| Homepage Leaderboard | 970×90 | $12 | Top of homepage |
| Homepage Billboard | 970×250 | $18 | In-feed between stories |
| Sidebar Rectangle | 300×250 | $9 | Right rail beside articles |
| Vertical Sponsor | 300×600 | $14 | Top of vertical / county |
| Newsletter Banner | 600×120 | $22 | Email digest header |

Empty ad slots use a hatched `repeating-linear-gradient(135deg, #faf6ec 11px, #f5efe1 11px, #f5efe1 22px)` pattern with a dashed `#c9b27e` border.

## Pages & Routes

### Home (`/`)
- Top utility bar: date, "My Campaigns" link, Sign in
- Masthead: "The Daily **Reporter**" in Fraunces 900, tagline in IBM Plex Mono
- Nav: Home · Browse Outreach Ads · Display Ads · Services + "Run an ad" CTA (red button)
- Leaderboard ad slot (self-serve CTA when empty)
- **Currently Running GFE Outreach Ads** box: featured hero ad (16:9) + 3 secondary outreach cards with logo, title, bid date
- California Construction News: featured editorial + list of sponsored placements
- Sidebar: Current Issues grid (4 editions, 2×2, dark card with cover image) + two 300×600 sponsor slots
- In-feed billboard self-serve slot

### Ad Portal / Wizard (`/portal`)
4-step self-serve wizard with sticky order summary sidebar:
1. **Placement** — card grid of ad sizes, CPM pricing
2. **Creative** — "Build with text" (headline/body/CTA/URL/color swatch) or "Upload image"; live preview panel
3. **Schedule** — date pickers + 1-week/2-week/30-day presets; shows day count
4. **Budget & checkout** — range slider $100–$5,000; estimated impressions/clicks/effective CPM; payment form

### Campaign Dashboard (`/dashboard`)
- Stats row: Active campaigns · Impressions delivered · Total spend · Avg. CTR
- Campaign table: name + placement + date range · delivery progress bar · spend vs budget · status badge (Live/Scheduled/Ended)

### Footer
Two columns: Browse (Outreach Ads, Display Ads, Verticals) · Advertise (Run an ad, Campaign manager, Media kit)

## Data Model (Supabase/Postgres)

- **editions** — newspaper editions (Builder's Blueprint, Southern CA, Northern CA, CA State Water) with publish date, Flipsnack URL, cover image
- **listings** — jobs open for bid: title, agency, county, bid date, linked edition
- **ads** — outreach/display ads: type, creative (text or image), placement, start/end date, budget, status (draft → approved → live → ended), impressions, clicks
- **subscribers** — email list; never sold; free signup
- **campaigns** — advertiser campaign records linking to ads, with pacing/delivery tracking

## Key Business Rules

- GFE outreach ads run in every edition from approval through bid date at no extra charge
- Ads are also published on the website and emailed to the subscriber list weekly until bid date
- Tear sheets + Proof of Publication (wet signature) mailed first-class after publication
- TDR is certified by CA Dept. of General Services as "Trade Newspaper" and "Focused Newspaper" — legal ad certification is required for GFE outreach ads
- Email list: 13,000+ CA construction firms; never sold

## Real Edition Data

Current editions link to Flipsnack:
- Builder's Blueprint (Mar 31): `https://www.flipsnack.com/66F8CBDD75E/builder-sblueprint-march-31-2026`
- Southern CA (Apr 1): `https://www.flipsnack.com/66F8CBDD75E/reporter-april-1-2026-south`
- Northern CA (Apr 2): `https://www.flipsnack.com/66F8CBDD75E/reporter-april-2-2026-north`
- CA State Water (Mar 27): `https://www.flipsnack.com/66F8CBDD75E/reporter-march-27-2026-water`

Cover images served from `https://thedailyreporter.net/tmp/`.
