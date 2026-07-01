"use client";

import type { WizardState } from "../PortalWizard";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.max(0, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

const today = new Date().toISOString().split("T")[0];

const PRESETS = [
  { label: "1 week",  days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
];

export default function StepSchedule({
  state, update, onNext, onBack,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const duration = daysBetween(state.startDate, state.endDate);
  const canContinue = state.startDate && state.endDate && duration > 0;

  function applyPreset(days: number) {
    const start = state.startDate || today;
    update({ startDate: start, endDate: addDays(new Date(start), days) });
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 24, margin: "0 0 6px" }}>
        Set your schedule
      </h2>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>
        Your ad runs from the start date through the end date — online and in the weekly email digest.
      </p>

      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 3, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Date pickers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Start date</label>
            <input
              type="date"
              value={state.startDate}
              min={today}
              onChange={(e) => update({ startDate: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>End date</label>
            <input
              type="date"
              value={state.endDate}
              min={state.startDate || today}
              onChange={(e) => update({ endDate: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 600, letterSpacing: ".06em" }}>QUICK SELECT</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PRESETS.map((p) => {
              const isActive = state.startDate && daysBetween(state.startDate, state.endDate) === p.days;
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.days)}
                  style={{
                    padding: "8px 16px",
                    border: isActive ? "2px solid var(--dark)" : "1px solid var(--border)",
                    borderRadius: 2,
                    background: isActive ? "var(--dark)" : "#fff",
                    color: isActive ? "#fff" : "var(--dark)",
                    fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration display */}
        {duration > 0 && (
          <div style={{ background: "#faf7f2", border: "1px solid var(--border)", borderRadius: 2, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 600, color: "var(--dark)", lineHeight: 1 }}>{duration}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>DAY RUN</div>
            </div>
            <div style={{ flex: 1, fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.6 }}>
              Your ad will appear on the website every day, and in the weekly email digest{" "}
              <strong>{Math.ceil(duration / 7)}</strong> time{Math.ceil(duration / 7) !== 1 ? "s" : ""} — sent every Wednesday to 13,000+ California construction firms.
            </div>
          </div>
        )}

        {/* Note about GFE outreach */}
        <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <strong style={{ color: "var(--dark)" }}>Note:</strong> GFE outreach ads also appear in the printed newspaper edition(s) published during your run dates. A Tear Sheet and Proof of Publication with wet signature will be mailed first-class after publication.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            padding: "12px 24px", border: "none", borderRadius: 2,
            background: canContinue ? "var(--red)" : "var(--border)",
            color: canContinue ? "#fff" : "var(--muted)",
            fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14,
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continue to Checkout →
        </button>
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
