import { useState } from "react";
import { useStore } from "../store/useStore";
import type { SectorId } from "../data/types";

type ScenarioId = "baseline" | "conservative" | "moderate" | "ambitious";

interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  allocations: Record<SectorId, number>;
  expected: {
    employment: string;
    gdpImpact: string;
    socialReturn: string;
    fiscalCost: string;
    riskLevel: string;
  };
}

const scenarios: Scenario[] = [
  {
    id: "baseline",
    label: "Baseline",
    description: "Current allocation — no change. Used as control scenario.",
    allocations: { education: 15, healthcare: 12, housing: 10, employment: 18, women_empowerment: 15, environment: 10, community: 10, hajj: 10 },
    expected: { employment: "0%", gdpImpact: "+0.8%", socialReturn: "1.2x", fiscalCost: "0", riskLevel: "Low" },
  },
  {
    id: "conservative",
    label: "Conservative",
    description: "Modest reallocation favoring education and employment. Low fiscal risk.",
    allocations: { education: 20, healthcare: 10, housing: 8, employment: 22, women_empowerment: 12, environment: 8, community: 10, hajj: 10 },
    expected: { employment: "+2.1%", gdpImpact: "+1.4%", socialReturn: "1.5x", fiscalCost: "SAR 12M", riskLevel: "Low" },
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Balanced optimization across all sectors. Medium fiscal risk.",
    allocations: { education: 18, healthcare: 10, housing: 8, employment: 20, women_empowerment: 14, environment: 12, community: 8, hajj: 10 },
    expected: { employment: "+4.7%", gdpImpact: "+2.3%", socialReturn: "1.8x", fiscalCost: "SAR 28M", riskLevel: "Medium" },
  },
  {
    id: "ambitious",
    label: "Ambitious",
    description: "High-investment model prioritizing employment and women empowerment. Higher risk, higher return.",
    allocations: { education: 16, healthcare: 8, housing: 6, employment: 24, women_empowerment: 18, environment: 12, community: 8, hajj: 8 },
    expected: { employment: "+7.3%", gdpImpact: "+3.8%", socialReturn: "2.1x", fiscalCost: "SAR 52M", riskLevel: "High" },
  },
];

export function TheScenarios() {
  const [selected, setSelected] = useState<ScenarioId>("baseline");
  const setPhase = useStore((s) => s.setPhase);
  const setAmount = useStore((s) => s.setAmount);
  const resetAmounts = useStore((s) => s.resetAmounts);

  const scenario = scenarios.find((s) => s.id === selected)!;

  const applyScenario = () => {
    resetAmounts();
    Object.entries(scenario.allocations).forEach(([k, v]) => {
      setAmount(k as SectorId, (v / 100) * 100_000_000);
    });
  };

  return (
    <section className="section-card" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">05 — THE SCENARIOS</span>
        <h2 className="section-title">What If?</h2>
      </div>

      <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
        Compare four policy scenarios — each with different risk-return profiles and social impact trade-offs.
        Click "Apply" to load a scenario into the model for deeper analysis.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {scenarios.map((s) => (
          <div
            key={s.id}
            className="sub-card"
            style={{
              padding: "1.25rem",
              cursor: "pointer",
              border: selected === s.id ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "border-color 0.2s",
            }}
            onClick={() => setSelected(s.id)}
          >
            <div className="mono" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}>
              {s.label}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1rem" }}>
              {s.description}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", fontSize: "0.75rem" }}>
              <div><span style={{ color: "var(--text-muted)" }}>Jobs: </span><span className="mono" style={{ color: "var(--accent)" }}>{s.expected.employment}</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>GDP: </span><span className="mono" style={{ color: "var(--accent)" }}>{s.expected.gdpImpact}</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>SROI: </span><span className="mono" style={{ color: "var(--primary)" }}>{s.expected.socialReturn}</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>Cost: </span><span className="mono" style={{ color: "var(--accent)" }}>{s.expected.fiscalCost}</span></div>
            </div>
            {selected === s.id && (
              <button
                className="cta-button"
                style={{ width: "100%", marginTop: "1rem", padding: "0.6rem" }}
                onClick={(e) => { e.stopPropagation(); applyScenario(); setPhase("model"); }}
              >
                Apply & Explore
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="sub-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", color: "var(--text)", marginBottom: "1rem" }}>Scenario Comparison Table</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "0.6rem", color: "var(--text-muted)" }}>Scenario</th>
                <th style={{ textAlign: "right", padding: "0.6rem", color: "var(--text-muted)" }}>Employment</th>
                <th style={{ textAlign: "right", padding: "0.6rem", color: "var(--text-muted)" }}>GDP Impact</th>
                <th style={{ textAlign: "right", padding: "0.6rem", color: "var(--text-muted)" }}>Social Return</th>
                <th style={{ textAlign: "right", padding: "0.6rem", color: "var(--text-muted)" }}>Fiscal Cost</th>
                <th style={{ textAlign: "right", padding: "0.6rem", color: "var(--text-muted)" }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", background: selected === s.id ? "rgba(212, 160, 23, 0.05)" : undefined }}>
                  <td style={{ padding: "0.6rem", fontWeight: selected === s.id ? 600 : 400, color: "var(--text)" }}>{s.label}</td>
                  <td className="mono" style={{ padding: "0.6rem", textAlign: "right", color: "var(--accent)" }}>{s.expected.employment}</td>
                  <td className="mono" style={{ padding: "0.6rem", textAlign: "right", color: "var(--accent)" }}>{s.expected.gdpImpact}</td>
                  <td className="mono" style={{ padding: "0.6rem", textAlign: "right", color: "var(--primary)", fontWeight: 600 }}>{s.expected.socialReturn}</td>
                  <td className="mono" style={{ padding: "0.6rem", textAlign: "right", color: "var(--accent)" }}>{s.expected.fiscalCost}</td>
                  <td style={{ padding: "0.6rem", textAlign: "right" }}>
                    <span className="evidence-chip" style={{
                      background: s.expected.riskLevel === "High" ? "rgba(239, 68, 68, 0.15)" : s.expected.riskLevel === "Medium" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: s.expected.riskLevel === "High" ? "#ef4444" : s.expected.riskLevel === "Medium" ? "#f59e0b" : "#10b981",
                    }}>
                      {s.expected.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button className="cta-button" onClick={() => setPhase("tradeoff")}>
          Analyze Trade-offs →
        </button>
      </div>
    </section>
  );
}
