"use client";

import type { WizardState } from "../PortalWizard";

const MIN_BUDGET = 100;
const MAX_BUDGET = 5000;

function estImpressions(budget: number, cpm: number) {
  return Math.round((budget / cpm) * 1000);
}

function estClicks(impressions: number) {
  return Math.round(impressions * 0.0035); // ~0.35% CTR baseline
}

export default function StepCheckout({
  state, update, onBack, onSubmit, submitting, submitError,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string;
}) {
  const cpm = state.placement?.cpm || 12;
  const impressions = estImpressions(state.budget, cpm);
  const clicks = estClicks(impressions);
  const canSubmit = state.email.trim().length > 4 && state.companyName.trim().length > 0;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 24, margin: "0 0 6px" }}>
        Budget &amp; checkout
      </h2>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>
        Set your budget and we&rsquo;ll follow up with a payment link. No card required right now.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Budget slider */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Total budget</label>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 26, color: "var(--dark)" }}>
              ${state.budget.toLocaleString()}
            </div>
          </div>

          <input
            type="range"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={50}
            value={state.budget}
            onChange={(e) => update({ budget: parseInt(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--red)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            <span>${MIN_BUDGET}</span>
            <span>${MAX_BUDGET.toLocaleString()}</span>
          </div>

          {/* Estimates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {[
              { label: "Est. Impressions", value: impressions.toLocaleString() },
              { label: "Est. Clicks",      value: clicks.toLocaleString() },
              { label: "CPM",              value: `$${cpm}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, color: "var(--dark)" }}>{value}</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", letterSpacing: ".08em", marginTop: 2 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
            Estimates are based on historical averages for this placement. Actual delivery varies.
          </div>
        </div>

        {/* Contact info */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "22px 22px 18px" }}>
          <h3 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 17, margin: "0 0 16px" }}>
            Contact information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Company / agency name *</label>
              <input
                type="text"
                value={state.companyName}
                onChange={(e) => update({ companyName: e.target.value })}
                placeholder="e.g. City of Sacramento, Steve P. Rados Inc."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email address *</label>
              <input
                type="email"
                value={state.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="your@company.com"
                style={inputStyle}
              />
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
                We&rsquo;ll send your approval confirmation and invoice here.
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ background: "#faf7f2", border: "1px solid var(--border)", borderRadius: 3, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>WHAT HAPPENS NEXT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "We review your ad within 1 business day.",
              "You receive an approval email with a payment link.",
              "Once paid, your ad goes live on the scheduled start date.",
              "A Tear Sheet + Proof of Publication is mailed after publication.",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {submitError && (
          <div style={{ background: "#fdf0f1", border: "1px solid #f5c6c6", padding: "12px 16px", borderRadius: 2, fontSize: 13.5, color: "var(--red)" }}>
            {submitError}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onBack} style={backBtnStyle}>← Back</button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            style={{
              flex: 1, padding: "14px 24px", border: "none", borderRadius: 2,
              background: canSubmit && !submitting ? "var(--red)" : "var(--border)",
              color: canSubmit && !submitting ? "#fff" : "var(--muted)",
              fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16,
              cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
              letterSpacing: ".01em",
            }}
          >
            {submitting ? "Submitting…" : `Submit campaign — $${state.budget.toLocaleString()} →`}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          No payment is collected now. You&rsquo;ll receive an invoice by email after approval.
          Questions? Call (916) 729-5432 or email{" "}
          <a href="mailto:CandSPublishing@gmail.com" style={{ color: "var(--red)" }}>CandSPublishing@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1px solid var(--border)", borderRadius: 2,
  fontSize: 14, fontFamily: "inherit",
  background: "#faf7f2", outline: "none", boxSizing: "border-box",
};

const backBtnStyle: React.CSSProperties = {
  padding: "12px 20px", border: "1px solid var(--border)", borderRadius: 2,
  background: "#fff", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14,
  color: "var(--dark)", cursor: "pointer",
};
