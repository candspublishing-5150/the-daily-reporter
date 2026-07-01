"use client";

import type { WizardState } from "./PortalWizard";

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function days(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.max(0, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

export default function OrderSummary({ state, currentStep }: { state: WizardState; currentStep: number }) {
  const duration = days(state.startDate, state.endDate);

  return (
    <div style={{ position: "sticky", top: 20, background: "var(--dark)", color: "#f6f1e8", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ background: "#1e2026", padding: "14px 18px", borderBottom: "1px solid #2c2e34" }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".16em", color: "#a08a52", fontWeight: 700 }}>ORDER SUMMARY</div>
      </div>

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Placement */}
        <Row label="Placement" done={!!state.placement}>
          {state.placement ? (
            <>
              <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14 }}>{state.placement.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9a968c" }}>{state.placement.dims} · ${state.placement.cpm} CPM</div>
            </>
          ) : <Pending />}
        </Row>

        {/* Creative */}
        <Row label="Creative" done={currentStep > 1 && !!state.headline}>
          {state.headline ? (
            <>
              <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{state.headline}</div>
              {state.cta && <div style={{ fontSize: 11, color: "#9a968c", marginTop: 3 }}>CTA: {state.cta}</div>}
            </>
          ) : <Pending />}
        </Row>

        {/* Schedule */}
        <Row label="Schedule" done={currentStep > 2 && !!state.startDate}>
          {state.startDate && state.endDate ? (
            <>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {formatDate(state.startDate)} → {formatDate(state.endDate)}
              </div>
              <div style={{ fontSize: 11, color: "#9a968c", marginTop: 2 }}>{duration} days · {Math.ceil(duration / 7)} email sends</div>
            </>
          ) : <Pending />}
        </Row>

        {/* Budget */}
        <div style={{ borderTop: "1px solid #2c2e34", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#9a968c", letterSpacing: ".06em" }}>TOTAL BUDGET</div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "#fff" }}>
              ${state.budget.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "#9a968c", marginTop: 6, lineHeight: 1.5 }}>
            Invoice sent after approval. No payment collected now.
          </div>
        </div>

        {/* Inclusions */}
        <div style={{ background: "#1e2026", borderRadius: 2, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", color: "#a08a52", fontWeight: 700, marginBottom: 8 }}>INCLUDED</div>
          {[
            "Website listing (all run dates)",
            "Weekly email digest sends",
            "Printed newspaper edition(s)",
            "Tear sheet + Proof of Publication",
          ].map((item) => (
            <div key={item} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5, fontSize: 12.5, color: "#cfcabd", lineHeight: 1.4 }}>
              <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, done, children }: { label: string; done: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
          background: done ? "var(--green)" : "#3d3f47",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "#fff", fontWeight: 700,
        }}>
          {done ? "✓" : ""}
        </div>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "#9a968c", fontWeight: 700 }}>{label.toUpperCase()}</span>
      </div>
      <div style={{ paddingLeft: 22 }}>{children}</div>
    </div>
  );
}

function Pending() {
  return <span style={{ fontSize: 12.5, color: "#4a4c54", fontStyle: "italic" }}>Not set yet</span>;
}
