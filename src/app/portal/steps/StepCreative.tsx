"use client";

import type { WizardState } from "../PortalWizard";

const ACCENT_COLORS = [
  { label: "TDR Red",     value: "#a8242f" },
  { label: "Navy",        value: "#1a3a5c" },
  { label: "Forest",      value: "#2f5e3a" },
  { label: "Gold",        value: "#a08a52" },
  { label: "Charcoal",    value: "#2d2f36" },
  { label: "Slate",       value: "#4a5568" },
];

function AdPreview({ state }: { state: WizardState }) {
  const { headline, body, cta, accentColor, placement } = state;
  const isWide = placement?.id === "leaderboard" || placement?.id === "billboard" || placement?.id === "newsletter";

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--muted)", fontWeight: 700, marginBottom: 10 }}>
        LIVE PREVIEW — {placement?.dims}
      </div>
      <div style={{
        border: "1px solid var(--border)", borderRadius: 2, overflow: "hidden",
        background: "#fff",
        maxWidth: isWide ? "100%" : 300,
      }}>
        {/* Ad header bar */}
        <div style={{ background: accentColor, padding: isWide ? "14px 20px" : "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: isWide ? 20 : 16, color: "#fff", lineHeight: 1.2, flex: 1 }}>
            {headline || <span style={{ opacity: .5 }}>Your headline goes here</span>}
          </div>
          {cta && (
            <div style={{ background: "#fff", color: accentColor, padding: "7px 14px", fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 12.5, borderRadius: 2, whiteSpace: "nowrap", flexShrink: 0 }}>
              {cta}
            </div>
          )}
        </div>
        {/* Body */}
        {body && (
          <div style={{ padding: isWide ? "12px 20px" : "10px 14px", fontSize: 13, color: "var(--text-body)", lineHeight: 1.55 }}>
            {body}
          </div>
        )}
        {/* GFE badge */}
        <div style={{ background: "#faf7f2", borderTop: "1px solid var(--border)", padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, letterSpacing: ".12em", color: "var(--muted)", fontWeight: 600 }}>GFE OUTREACH AD · THE DAILY REPORTER</span>
          <span style={{ fontSize: 9, color: "var(--muted)" }}>Ad</span>
        </div>
      </div>
    </div>
  );
}

export default function StepCreative({
  state, update, onNext, onBack,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = state.headline.trim().length > 0;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 24, margin: "0 0 6px" }}>
        Build your creative
      </h2>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>
        Write your ad copy below — the preview updates live.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Headline *" hint="Keep it under 10 words">
            <input
              type="text"
              value={state.headline}
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="Your project or company name"
              maxLength={80}
              style={inputStyle}
            />
          </Field>

          <Field label="Body copy" hint="Optional — describe the project or bid opportunity">
            <textarea
              value={state.body}
              onChange={(e) => update({ body: e.target.value })}
              placeholder="Brief description of the project, bid date, or what bidders need to know."
              rows={4}
              maxLength={300}
              style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
            />
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {state.body.length}/300
            </div>
          </Field>

          <Field label="Call to action button">
            <input
              type="text"
              value={state.cta}
              onChange={(e) => update({ cta: e.target.value })}
              placeholder="e.g. View Bid, Learn More, Contact Us"
              maxLength={30}
              style={inputStyle}
            />
          </Field>

          <Field label="Link URL" hint="Where should the button go?">
            <input
              type="url"
              value={state.ctaUrl}
              onChange={(e) => update({ ctaUrl: e.target.value })}
              placeholder="https://yoursite.com/bid"
              style={inputStyle}
            />
          </Field>

          <Field label="Accent color">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => update({ accentColor: c.value })}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", border: "none",
                    background: c.value, cursor: "pointer",
                    outline: state.accentColor === c.value ? `3px solid var(--dark)` : "3px solid transparent",
                    outlineOffset: 2,
                  }}
                />
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={state.accentColor}
                  onChange={(e) => update({ accentColor: e.target.value })}
                  style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: "50%", padding: 2, cursor: "pointer", background: "none" }}
                />
                <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Custom</span>
              </div>
            </div>
          </Field>
        </div>

        {/* Live preview */}
        <div style={{ position: "sticky", top: 20 }}>
          <AdPreview state={state} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            ...nextBtnStyle,
            background: canContinue ? "var(--red)" : "var(--border)",
            color: canContinue ? "#fff" : "var(--muted)",
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continue to Schedule →
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: hint ? 2 : 6, color: "var(--dark)" }}>
        {label}
      </label>
      {hint && <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>{hint}</div>}
      {children}
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

const nextBtnStyle: React.CSSProperties = {
  padding: "12px 24px", border: "none", borderRadius: 2,
  fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 14,
};
