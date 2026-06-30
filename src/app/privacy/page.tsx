import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — The Daily Reporter",
  description: "How The Daily Reporter collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  const lastUpdated = "June 30, 2026";

  return (
    <>
      <Header />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "36px 22px 72px", width: "100%" }}>

        <div style={{ borderBottom: "2px solid var(--dark)", paddingBottom: 18, marginBottom: 36 }}>
          <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: "clamp(24px,3vw,36px)", margin: "0 0 8px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", margin: 0 }}>
            Last updated: {lastUpdated} · The Daily Reporter / C&amp;S Publishing
          </p>
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text-body)" }}>

          <Section title="Who we are">
            <p>
              The Daily Reporter is published by C&amp;S Publishing, a woman-owned small business (DBE/WBE/SBE/SMBE certified)
              located at 8258 Scarlet Oak Cir, Citrus Heights CA 95610. We publish California construction bidding leads
              and GFE outreach advertising. You can reach us at{" "}
              <a href="mailto:CandSPublishing@gmail.com" style={{ color: "var(--red)" }}>CandSPublishing@gmail.com</a>{" "}
              or (916) 729-5432.
            </p>
          </Section>

          <Section title="Information we collect">
            <p>We collect only what we need to provide our services:</p>
            <ul>
              <li><strong>Email address</strong> — when you sign up for our free weekly digest or create an account.</li>
              <li><strong>Account information</strong> — name and email if you create a customer account to manage advertising campaigns.</li>
              <li><strong>Payment information</strong> — processed securely through our payment provider. We do not store your full card number.</li>
              <li><strong>Usage data</strong> — pages visited, links clicked, and general analytics to help us improve the site. This data is not linked to your identity.</li>
            </ul>
            <p>We do not use cookies for tracking beyond what is necessary to keep you logged in.</p>
          </Section>

          <Section title="How we use your information">
            <ul>
              <li>To send you the weekly construction bidding digest (if subscribed).</li>
              <li>To manage your advertising campaigns and send you status updates.</li>
              <li>To process payments and send invoices.</li>
              <li>To improve the site based on aggregate, anonymous usage patterns.</li>
            </ul>
          </Section>

          <Section title="We never sell your email">
            <p>
              <strong>Your email address is never sold, rented, or shared with third parties for marketing purposes.</strong>{" "}
              We have maintained this policy since 1994. Our subscriber list is used exclusively to deliver
              The Daily Reporter weekly digest and service-related communications (ad approvals, invoices, account notices).
            </p>
          </Section>

          <Section title="Email communications">
            <p>
              If you subscribe to the weekly digest, you will receive one email per week containing that week&rsquo;s
              construction bidding leads. You can unsubscribe at any time by clicking the unsubscribe link at the
              bottom of any email, or by emailing us directly.
            </p>
            <p>
              If you create an advertising account, you may receive transactional emails related to your campaigns
              (submission confirmation, approval/rejection notices, invoices). These are essential service emails
              and cannot be opted out of while your account is active.
            </p>
          </Section>

          <Section title="Data storage and security">
            <p>
              Your data is stored securely using Supabase, which uses industry-standard encryption at rest and
              in transit. We use row-level security policies to ensure you can only access your own account data.
              Payment processing is handled by our payment provider and is subject to their security standards.
            </p>
          </Section>

          <Section title="Your rights">
            <p>You have the right to:</p>
            <ul>
              <li>Request a copy of the personal data we hold about you.</li>
              <li>Request correction of any inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Unsubscribe from all marketing emails at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:CandSPublishing@gmail.com" style={{ color: "var(--red)" }}>CandSPublishing@gmail.com</a>.
              We will respond within 10 business days.
            </p>
          </Section>

          <Section title="Third-party services">
            <p>We use the following third-party services to operate the site:</p>
            <ul>
              <li><strong>Vercel</strong> — website hosting.</li>
              <li><strong>Supabase</strong> — database, authentication, and file storage.</li>
              <li><strong>Flipsnack</strong> — online newspaper viewer for digital editions.</li>
              <li><strong>Mailchimp</strong> — email delivery for the weekly digest.</li>
            </ul>
            <p>Each of these services has its own privacy policy governing their use of your data.</p>
          </Section>

          <Section title="California residents (CCPA)">
            <p>
              As a California-based business serving California residents, we comply with the California Consumer
              Privacy Act (CCPA). Under the CCPA, you have the right to know what personal information we collect,
              to request deletion, and to opt out of the sale of your personal information.{" "}
              <strong>We do not sell personal information.</strong>
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at
              the top of this page. Continued use of the site after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Contact us:
            </p>
            <address style={{ fontStyle: "normal", lineHeight: 1.8 }}>
              C&amp;S Publishing / The Daily Reporter<br />
              8258 Scarlet Oak Cir, Citrus Heights CA 95610<br />
              <a href="mailto:CandSPublishing@gmail.com" style={{ color: "var(--red)" }}>CandSPublishing@gmail.com</a><br />
              (916) 729-5432
            </address>
          </Section>

        </div>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <Link href="/" style={{ fontSize: 13, fontFamily: "var(--font-zilla)", fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 19, borderBottom: "1px solid var(--border)", paddingBottom: 9, marginBottom: 16, color: "var(--dark)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
