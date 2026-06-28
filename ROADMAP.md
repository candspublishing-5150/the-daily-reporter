# The Daily Reporter — Build Roadmap

Live site: https://the-daily-reporter.vercel.app  
Repo: https://github.com/candspublishing-5150/the-daily-reporter  
Design reference: `design/The Daily Reporter (standalone-src).dc.html`

---

## ✅ Phase 1 — Foundation (DONE)

- [x] GitHub repo created
- [x] Next.js 16 scaffolded (TypeScript, Tailwind, App Router)
- [x] Supabase project created and connected
- [x] Database schema deployed (editions, listings, ads, campaigns, subscribers, invoices, articles)
- [x] Homepage built (masthead, nav, outreach ads feed, current issues sidebar, footer)
- [x] Deployed to Vercel with GitHub auto-deploy
- [x] bypassPermissions mode enabled

---

## 🔨 Phase 2 — Core Public Site

### 2.1 Browse Outreach Ads (`/ads`)
- [ ] Page listing all live outreach ads from Supabase
- [ ] Filter by county
- [ ] Each ad shows: agency, title, bid date, county, description
- [ ] Link to individual ad detail page

### 2.2 Email Signup
- [ ] Form on homepage (and /ads page) to join the email list
- [ ] Saves to `subscribers` table in Supabase
- [ ] Confirmation message on submit
- [ ] Privacy policy link

### 2.3 Current Issues / Editions Page (`/editions`)
- [ ] Grid of all editions
- [ ] Each links to Flipsnack viewer
- [ ] Admin can upload new editions (links to Phase 4 admin)

### 2.4 Privacy Policy Page (`/privacy`)
- [ ] Updated privacy policy (email list never sold, etc.)

---

## 🔨 Phase 3 — Auth & Customer Accounts

### 3.1 Magic Link Login (`/login`)
- [ ] Email input → Supabase sends magic link
- [ ] On click, user is logged in and redirected to dashboard
- [ ] No passwords ever

### 3.2 Customer Dashboard (`/dashboard`)
- [ ] View all campaigns and ads
- [ ] See status (draft / pending review / live / ended)
- [ ] Edit ad copy, change run dates
- [ ] Download campaign assets / proof of publication
- [ ] View invoices and payment history

---

## 🔨 Phase 4 — Ad Platform ("Run a Campaign")

This is the core revenue feature. Based on existing ad-form at thedailyreporter.net/ad-form plus new self-serve features.

### 4.1 Outreach Ad Wizard (`/portal`)
- [ ] Step 1: Placement — choose ad size/type (leaderboard, billboard, sidebar, etc.)
- [ ] Step 2: Creative — build with text (headline/body/CTA/color) or upload image; live preview
- [ ] Step 3: Schedule — start/end date picker, presets (1 week / 2 weeks / 30 days)
- [ ] Step 4: Budget & checkout — slider $100–$5,000, est. impressions/clicks, payment form
- [ ] Require login (magic link) to save campaign
- [ ] On submit: save to `ads` + `campaigns` tables, trigger admin validation email

### 4.2 Display Ad Self-Service (`/display-ads/new`)
- [ ] Separate flow from outreach ads
- [ ] Same wizard structure
- [ ] Linked to QuickBooks for payment
- [ ] Admin validation email on submit

### 4.3 Admin Validation Flow
- [ ] Email sent to CandSPublishing@gmail.com when ad is submitted
- [ ] Admin reviews and approves/rejects in admin dashboard
- [ ] Customer gets email notification when approved or rejected

### 4.4 Payment Integration
- [ ] QuickBooks payment via credit card
- [ ] Invoice generated on purchase
- [ ] Invoice stored in `invoices` table
- [ ] Note: may replace QuickBooks with another processor later

### 4.5 Ad Distribution
- [ ] Live ads automatically appear on website
- [ ] Weekly email blast to 13,000+ subscribers until bid date
- [ ] Tear sheet + Proof of Publication mailed first-class after publication

---

## 🔨 Phase 5 — Admin Dashboard (`/admin`)

- [ ] Password-protected admin area (separate from customer magic link)
- [ ] Upload new newspaper editions (PDF → Supabase Storage → Flipsnack or direct)
- [ ] View and edit any customer's ads, campaigns, run dates
- [ ] Approve / reject pending ads
- [ ] View all payments and money collected
- [ ] Manage email subscriber list
- [ ] View all users

---

## 🔨 Phase 6 — Job-Finding Bot

- [ ] Scrape list of public works sites (Caltrans, water agencies, etc.) — Catherine to provide site list
- [ ] Bot runs on schedule (GitHub Actions cron)
- [ ] Extracts: project title, agency, county, bid date, contact info, source URL
- [ ] Saves to `listings` table in Supabase
- [ ] De-duplicates existing listings
- [ ] Powers the Browse Outreach Ads page with real data
- [ ] Used to auto-populate the weekly newspaper editions

---

## 🔨 Phase 7 — Auto-Generated Articles

- [ ] Scrape construction/public works news from the web
- [ ] AI generates article (title, body, tags) from source content
- [ ] Saved to `articles` table, reviewed before publishing
- [ ] Displayed on homepage under "California Construction News"
- [ ] Tagged by topic (county, project type, agency, etc.)

---

## 🔨 Phase 8 — Auto-Design Newspapers

- [ ] Pull this week's listings from Supabase
- [ ] Auto-layout into newspaper PDF format
- [ ] 4 editions: Southern CA, Northern CA, CA State Water, Builder's Blueprint
- [ ] PDF uploaded to Supabase Storage
- [ ] Admin can review/tweak before publishing
- [ ] Published to Flipsnack (or direct embed)

---

## 🔨 Phase 9 — TDR Plus (Fully Automated)

- [ ] Premium subscription tier
- [ ] AI monitors job-finding bot and emails subscriber instantly when new matching bid drops
- [ ] Customizable by county, project type, agency
- [ ] Subscription managed via customer dashboard
- [ ] Payment via QuickBooks (or replacement)

---

## 🔨 Phase 10 — Analytics & Operations

### 10.1 Site Analytics
- [ ] Integrate analytics (Vercel Analytics or PostHog)
- [ ] Track page views, ad clicks, form submissions, email signups

### 10.2 Fix-It Ticket System
- [ ] GitHub Issues used as bug/feature tracker
- [ ] Email notifications from GitHub to CandSPublishing@gmail.com
- [ ] Similar to TTSB's research digest workflow

### 10.3 Email Provider
- [ ] Currently: Mailchimp
- [ ] Evaluate: Sequenzy (or stay on Mailchimp)
- [ ] Integrate with `subscribers` table for automated sends

---

## Notes & Decisions Pending

- **Payment processor:** QuickBooks currently. May replace — decide before Phase 4.
- **Email provider:** Mailchimp vs Sequenzy — decide before Phase 4.3 (ad distribution emails).
- **Scrape site list:** Catherine needs to provide the list of public works sites for Phase 6.
- **Flipsnack vs direct PDF embed:** Currently using Flipsnack for editions. Evaluate whether to host PDFs directly in Phase 8.
- **Admin auth:** Separate from customer magic link — needs a strategy (Supabase role-based or separate password).
