import { useStore } from "../store/useStore";

const chain = [
  { step: "Policy Input", icon: "💰", description: "Government allocates funds to specific social/economic sectors" },
  { step: "Economic Mechanism", icon: "⚙️", description: "Funds flow through multiplier channels — direct spending, income generation, and induced consumption" },
  { step: "Estimated Impact", icon: "📊", description: "Measurable outcomes: jobs created, income generated, services delivered" },
  { step: "Social Outcome", icon: "🎯", description: "Broader wellbeing improvements: reduced poverty, increased equity, human capital development" },
];

const equations = [
  { label: "Fiscal Multiplier", formula: "ΔY = k × ΔG", description: "Change in GDP equals multiplier (k) times change in government spending (G)" },
  { label: "Social Return", formula: "SROI = Social Impact Value / Investment Cost", description: "For every SAR invested, how much social value is generated" },
  { label: "Employment Elasticity", formula: "ΔJobs = ε × (ΔSpending / Sector GDP) × Total Employment", description: "How sensitive employment is to spending changes in each sector" },
];

const sectorMechanisms = [
  { sector: "Education", mechanism: "Training → Skill acquisition → Productivity → Higher wages → Consumption", multiplier: 1.7 },
  { sector: "Health", mechanism: "Access → Reduced absenteeism → Workforce participation → Output", multiplier: 1.3 },
  { sector: "Housing", mechanism: "Construction spending → Jobs → Materials demand → Local economy", multiplier: 1.6 },
  { sector: "SMEs", mechanism: "Credit access → Business growth → Hiring → Tax revenue", multiplier: 1.5 },
  { sector: "Digital", mechanism: "Infrastructure → Tech adoption → Efficiency → Innovation ecosystem", multiplier: 2.3 },
  { sector: "Environment", mechanism: "Green investment → New industries → Job creation → Long-term sustainability", multiplier: 1.8 },
  { sector: "Hajj & Umrah", mechanism: "Service capacity → Tourism revenue → Hospitality jobs → Brand equity", multiplier: 1.5 },
];

export function TheMechanism() {
  const setPhase = useStore((s) => s.setPhase);

  return (
    <section className="section-card" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">03 — THE MECHANISM</span>
        <h2 className="section-title">How Does the Model Work?</h2>
      </div>

      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1.25rem" }}>The Economic Transmission Chain</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
          {chain.map((c, i) => (
            <div key={c.step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div className="sub-card" style={{ padding: "1rem 1.25rem", textAlign: "center", minWidth: 180 }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{c.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{c.step}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", lineHeight: 1.5 }}>{c.description}</div>
              </div>
              {i < chain.length - 1 && <span style={{ fontSize: "1.2rem", color: "var(--primary)" }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1.25rem" }}>Core Equations</h3>
        <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {equations.map((eq) => (
            <div key={eq.label} className="sub-card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
                {eq.label}
              </div>
              <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--primary)", marginBottom: "0.5rem" }}>
                {eq.formula}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {eq.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1.25rem" }}>Sector Transmission Mechanisms</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.75rem" }}>
          {sectorMechanisms.map((sm) => (
            <div key={sm.sector} className="sub-card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.25rem" }}>
                  {sm.sector}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {sm.mechanism}
                </div>
              </div>
              <div className="mono" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>
                {sm.multiplier}x
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button className="cta-button" onClick={() => setPhase("model")}>
          Build Your Model →
        </button>
      </div>
    </section>
  );
}
