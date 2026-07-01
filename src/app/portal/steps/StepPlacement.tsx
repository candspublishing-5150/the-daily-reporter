"use client";

import type { WizardState, Placement } from "../PortalWizard";
import { PLACEMENTS } from "../PortalWizard";

export default function StepPlacement({
  state, update, onNext,
}: {
  state: WizardState;
  update: (p: Partial<WizardState>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 24, margin: "0 0 6px" }}>
        Choose your placement
      </h2>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>
        Select where your ad will appear. All placements run on the website and in the weekly email digest.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PLACEMENTS.map((p) => {
          const isSelected = state.placement?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => update({ placement: p })}
              style={{
                display: "flex", alignItems: "center", gap: 18,
                padding: "18px 20px",
                border: isSelected ? "2px solid var(--dark)" : "1px solid var(--border)",
                borderRadius: 3,
                background: isSelected ? "#faf7f2" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              {/* Radio indicator */}
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                border: isSelected ? "6px solid var(--dark)" : "2px solid var(--border)",
                background: "#fff",
              }} />

              {/* Dims badge */}
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                color: isSelected ? "var(--dark)" : "var(--muted)",
                letterSpacing: ".06em", whiteSpace: "nowrap",
                background: isSelected ? "var(--border)" : "#f3efe7",
                padding: "4px 10px", borderRadius: 2, flexShrink: 0,
              }}>
                {p.dims}
              </div>

              {/* Label + desc */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-zilla)", fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{p.description}</div>
              </div>

              {/* CPM */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 16, color: "var(--dark)" }}>
                  ${p.cpm}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", letterSpacing: ".06em" }}>CPM</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28 }}>
        <button
          onClick={onNext}
          disabled={!state.placement}
          style={{
            padding: "13px 28px",
            background: state.placement ? "var(--red)" : "var(--border)",
            color: state.placement ? "#fff" : "var(--muted)",
            border: "none", borderRadius: 2,
            fontFamily: "var(--font-zilla)", fontWeight: 600, fontSize: 15,
            cursor: state.placement ? "pointer" : "not-allowed",
          }}
        >
          Continue to Creative →
        </button>
      </div>
    </div>
  );
}
