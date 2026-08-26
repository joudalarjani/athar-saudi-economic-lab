import { useStore } from "../store/useStore";

const dataSources = [
  { name: "GASTAT", full: "General Authority for Statistics", description: "Official national statistical agency providing labor market, demographic, and economic data for Saudi Arabia.", variables: ["Labor force participation", "Youth unemployment rate", "Household income distribution", "Regional GDP per capita"] },
  { name: "SAMA", full: "Saudi Central Bank", description: "Monetary authority providing financial stability data, SME lending figures, and economic indicators.", variables: ["Credit growth to private sector", "SME loan portfolio", "Inflation rate", "Deposit rates"] },
  { name: "Ministry of Finance", full: "Kingdom of Saudi Arabia Ministry of Finance", description: "Government budget data, social spending allocations, and fiscal performance reports.", variables: ["Social sector budget allocation", "Government expenditure efficiency", "Fiscal deficit ratio", "Transfer payments"] },
  { name: "World Bank", full: "The World Bank Group", description: "International development data with standardized methodologies for cross-country comparison.", variables: ["Gini coefficient", "Poverty headcount ratio", "Human Capital Index", "Doing Business indicators"] },
  { name: "OECD", full: "Organisation for Economic Co-operation and Development", description: "International standards for social spending measurement and impact assessment frameworks.", variables: ["Social spending as % of GDP", "Transfer efficiency ratios", "Poverty reduction elasticities", "SROI benchmarks"] },
  { name: "Ministry of Human Resources", full: "Ministry of Human Resources and Social Development", description: "Social development programs, employment initiatives, and social safety net data.", variables: ["Hafiz beneficiaries", "Jadarat job placements", "Social assistance coverage", "Training program outcomes"] },
];

const methodology = {
  timePeriod: "2020 – 2025 (Historical Baseline); 2025 – 2035 (Projection Horizon)",
  modelType: "Social Return on Investment (SROI) + Keynesian Fiscal Multiplier",
  assumptions: [
    "Multipliers derived from peer-reviewed literature and calibrated to Saudi fiscal structure",
    "SROI ratios based on empirical case studies with documented methodologies",
    "Population growth projections from GASTAT census data (2022)",
    "GDP contribution estimates use input-output modeling from World Bank",
  ],
  limitations: [
    "Model is simplified — does not capture general equilibrium effects",
    "Social outcomes are proxy-measured; direct causation cannot be established",
    "Regional heterogeneity is aggregated at national level",
    "SROI figures are estimates based on international benchmarks adapted to Saudi context",
  ],
};

export function TheEvidence() {
  const setPhase = useStore((s) => s.setPhase);

  return (
    <section className="section-card" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">02 — THE EVIDENCE</span>
        <h2 className="section-title">What Does the Data Say?</h2>
      </div>

      <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {dataSources.map((ds) => (
          <div key={ds.name} className="sub-card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: "0.25rem" }}>
              {ds.full}
            </div>
            <div className="mono" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.75rem" }}>
              {ds.name}
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-muted)", marginBottom: "1rem" }}>
              {ds.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {ds.variables.map((v) => (
                <span key={v} className="evidence-chip" style={{ fontSize: "0.7rem" }}>{v}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sub-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1rem" }}>Methodology & Assumptions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
              Time Period
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{methodology.timePeriod}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
              Model Type
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{methodology.modelType}</div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
            Key Assumptions
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {methodology.assumptions.map((a, i) => (
              <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.8 }}>{a}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
            Limitations
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {methodology.limitations.map((l, i) => (
              <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.8 }}>{l}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button className="cta-button" onClick={() => setPhase("mechanism")}>
          Understand the Mechanism →
        </button>
      </div>
    </section>
  );
}
