# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Daily Reporter (TDR) is a California construction trade newspaper rewrite. It connects contractors to public construction bidding leads, runs legal outreach advertisements, and manages a 13,000+ subscriber email list. Published by C&S Publishing (DBE/WBE/SBE/SMBE certified, woman-owned).

## Tech Stack

- **Frontend/Hosting**: Next.js deployed on Vercel
- **Database/Auth/Storage**: Supabase (Postgres + Auth + Storage)
- **CI/CD**: GitHub Actions

## Common Commands

Once the project is scaffolded, expected commands will be:

```bash
npm run dev        # Start local dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run test       # Run tests
npx supabase start # Start local Supabase instance (Docker required)
npx supabase db push # Push migrations to Supabase
```

## Architecture

### Data Model (Supabase/Postgres)
Core entities to be built around:
- **Editions** — weekly newspaper editions (Southern CA, Northern CA, CA State Water, Builder's Blueprint) with publish dates and PDF storage
- **Listings** — individual jobs open for bid, associated with an edition and county
- **Ads** — outreach/display ads with status (draft → proof → approved → published), tied to a bid date; ads run in all editions from approval through bid date
- **Subscribers** — email list entries; TDR never sells the list
- **TDR Plus** — premium subscription tier with enhanced access

### Key Business Rules
- Ads automatically run in every edition from approval date through bid date at no extra charge
- Ads are also published on the website and emailed to the subscriber list weekly until bid date
- TDR is certified by the CA Dept. of General Services as both a "Trade Newspaper" and "Focused Newspaper" — legal ad certification matters for ad copy and tear sheet generation
- Tear sheets and Proof of Publication statements (wet signature) are mailed first-class after publication

### Vercel / Next.js Conventions
- Use App Router (`app/` directory)
- Server Components for data fetching from Supabase where possible
- Route handlers (`app/api/`) for form submissions, webhook endpoints, and email triggers
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### GitHub Actions
CI pipeline will handle: lint → test → Vercel preview deploy on PRs, production deploy on merge to `main`.
