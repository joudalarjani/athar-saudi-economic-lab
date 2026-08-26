import { useState } from "react";

const STACK_SOURCES = [
  { id: "govt", label: "Government Grants", color: "#198754", desc: "Direct fiscal allocation from federal budget" },
  { id: "waqf", label: "Waqf / Endowment", color: "#C9A227", desc: "Islamic endowment returns and assets" },
  { id: "social", label: "Social Investment", color: "#3B82F6", desc: "Impact bonds, social finance, CSR" },
  { id: "outcome", label: "Outcome-based Finance", color: "#8B5CF6", desc: "Pay-for-success, results-based contracts" },
] as const;

const INITIAL = { govt: 50, waqf: 20, social: 20, outcome: 10 };

export function CapitalStackBuilder() {
  const [shares, setShares] = useState(INITIAL);

  const total = Object.values(shares).reduce((s, v) => s + v, 0);
  const isValid = Math.abs(total - 100) < 0.5;

  const handleChange = (id: keyof typeof shares, val: number) => {
    setShares((prev) => ({ ...prev, [id]: val }));
  };

  const normalize = () => {
    const factor = 100 / total;
    setShares((prev) => {
      const n = { ...prev };
      for (const k of Object.keys(n) as (keyof typeof shares)[]) {
        n[k] = Math.round(n[k] * factor);
      }
      // Fix rounding
      const newTotal = Object.values(n).reduce((s, v) => s + v, 0);
      n.govt += 100 - newTotal;
      return n;
    });
  };

  // Cost implications
  const costMultipliers: Record<string, number> = {
    govt: 1.0,    // Base cost
    waqf: 0.85,   // Lower admin cost
    social: 1.15,  // Higher admin cost
    outcome: 1.3,  // Highest admin, but performance-linked
  };

  const totalCost = STACK_SOURCES.reduce((s, src) => {
    const share = shares[src.id as keyof typeof shares] / 100;
    return s + share * 100_000_000 * costMultipliers[src.id];
  }, 0);

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Capital Stack Builder</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
        How is the 100M funded? Different sources have different costs and conditions.
      </p>

      {/* Stacked bar */}
      <div style={{ height: 40, borderRadius: "var(--radius-sm)", overflow: "hidden", display: "flex", marginBottom: "1rem", border: "1px solid var(--border)" }}>
        {STACK_SOURCES.map((src) => (
          <div
            key={src.id}
            style={{
              width: `${shares[src.id as keyof typeof shares]}%`,
              background: src.color,
              opacity: 0.7,
              transition: "width 300ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {shares[src.id as keyof typeof shares] >= 10 && (
              <span style={{ fontSize: "0.65rem", color: "#fff", fontWeight: 600 }}>
                {shares[src.id as keyof typeof shares]}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Sliders */}
      {STACK_SOURCES.map((src) => (
        <div key={src.id} style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: src.color }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{src.label}</span>
            </div>
            <span className="mono" style={{ fontSize: "0.75rem", color: src.color }}>
              {shares[src.id as keyof typeof shares]}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={shares[src.id as keyof typeof shares]}
            onChange={(e) => handleChange(src.id as keyof typeof shares, Number(e.target.value))}
            className="slider"
          />
          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            {src.desc}
          </div>
        </div>
      ))}

      {/* Total check */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem",
        borderRadius: "var(--radius-sm)",
        background: isValid ? "rgba(25,135,84,0.1)" : "rgba(220,53,69,0.1)",
        border: `1px solid ${isValid ? "var(--emerald)" : "#DC3545"}`,
        marginTop: "0.5rem",
      }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="mono" style={{ fontSize: "0.8rem", color: isValid ? "var(--emerald-light)" : "#DC3545" }}>
            {total}%
          </span>
          {!isValid && (
            <button className="btn-outline" style={{ padding: "0.2rem 0.5rem", fontSize: "0.65rem" }} onClick={normalize}>
              Normalize
            </button>
          )}
        </div>
      </div>

      {/* Cost analysis */}
      <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 600 }}>
          Cost Analysis
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Blended Admin Cost</div>
            <div className="mono" style={{ fontSize: "0.85rem", color: "var(--emerald-light)" }}>
              {((totalCost / 100_000_000 - 1) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Effective Leverage</div>
            <div className="mono" style={{ fontSize: "0.85rem", color: "var(--gold)" }}>
              {(100_000_000 / (totalCost / 100_000_000) / 1_000_000).toFixed(1)}M
            </div>
          </div>
        </div>
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Source: ADMIN_COST_ASSUMPTIONS. Government grants = base cost; outcome-based finance = highest admin cost but performance-linked.
        </div>
      </div>
    </div>
  );
}
