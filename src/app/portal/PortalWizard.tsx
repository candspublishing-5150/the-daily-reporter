"use client";

import { useState } from "react";
import StepPlacement from "./steps/StepPlacement";
import StepCreative from "./steps/StepCreative";
import StepSchedule from "./steps/StepSchedule";
import StepCheckout from "./steps/StepCheckout";
import OrderSummary from "./OrderSummary";

export type Placement = {
  id: string;
  name: string;
  dims: string;
  cpm: number;
  description: string;
};

export const PLACEMENTS: Placement[] = [
  { id: "leaderboard",  name: "Homepage Leaderboard",  dims: "970 × 90",  cpm: 12, description: "Top of every page — maximum visibility." },
  { id: "billboard",   name: "In-Feed Billboard",      dims: "970 × 250", cpm: 18, description: "Large format inside the news feed." },
  { id: "rectangle",   name: "Sidebar Rectangle",      dims: "300 × 250", cpm: 9,  description: "Right rail beside listings and articles." },
  { id: "sponsor",     name: "Vertical Sponsor",        dims: "300 × 600", cpm: 14, description: "Half-page sponsor slot — county or vertical." },
  { id: "newsletter",  name: "Newsletter Banner",       dims: "600 × 120", cpm: 22, description: "Top of the weekly email digest to 13,000+ subscribers." },
];

export type WizardState = {
  placement: Placement | null;
  headline: string;
  body: string;
  cta: string;
  ctaUrl: string;
  accentColor: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  budget: number;
  email: string;
  companyName: string;
};

const INITIAL: WizardState = {
  placement: null,
  headline: "",
  body: "",
  cta: "Learn More",
  ctaUrl: "",
  accentColor: "#a8242f",
  imageUrl: "",
  startDate: "",
  endDate: "",
  budget: 500,
  email: "",
  companyName: "",
};

const STEPS = ["Placement", "Creative", "Schedule", "Checkout"];

export default function PortalWizard() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update(patch: Partial<WizardState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 22px 80px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "var(--green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28, color: "#fff" }}>✓</div>
        <h1 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 30, margin: "0 0 12px" }}>Campaign submitted!</h1>
        <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 28px" }}>
          We&rsquo;ve received your ad and will review it within one business day.
          You&rsquo;ll get an email at <strong style={{ color: "var(--dark)" }}>{state.email}</strong> when it&rsquo;s approved and live.
        </p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 32px" }}>
          Questions? Email <a href="mailto:CandSPublishing@gmail.com" style={{ color: "var(--red)" }}>CandSPublishing@gmail.com</a> or call (916) 729-5432.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/dashboard" style={{ display: "inline-block", background: "var(--red)", color: "#fff", padding: "11px 22px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }}>
            View my campaigns →
          </a>
          <a href="/" style={{ display: "inline-block", border: "1px solid var(--border)", background: "#fff", color: "var(--dark)", padding: "11px 22px", fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, borderRadius: 2, textDecoration: "none" }}>
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 22px 72px", width: "100%" }}>
      {/* Step header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--gold)", fontWeight: 700, marginBottom: 8 }}>
          RUN AN AD — STEP {step + 1} OF {STEPS.length}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "none", cursor: i < step ? "pointer" : "default",
                  padding: 0, flexShrink: 0,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: i < step ? "var(--green)" : i === step ? "var(--dark)" : "var(--border)",
                  color: i <= step ? "#fff" : "var(--muted)",
                  flexShrink: 0,
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14, color: i === step ? "var(--dark)" : "var(--muted)", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? "var(--green)" : "var(--border)", margin: "0 10px" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
        <div>
          {step === 0 && <StepPlacement state={state} update={update} onNext={next} />}
          {step === 1 && <StepCreative state={state} update={update} onNext={next} onBack={back} />}
          {step === 2 && <StepSchedule state={state} update={update} onNext={next} onBack={back} />}
          {step === 3 && (
            <StepCheckout
              state={state}
              update={update}
              onBack={back}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </div>
        <OrderSummary state={state} currentStep={step} />
      </div>
    </main>
  );
}
