import { useStore } from "../store/useStore";

const tradeoffs = [
  {
    category: "Short-term vs Long-term",
    tension: "Short-term fiscal cost vs Long-term social return",
    gain: "Higher SROI (1.5-2.1x), reduced poverty, human capital development",
    loss: "Immediate budget pressure, delayed returns (3-5 years)",
    verdict: "Social investment with 3+ year horizon yields higher cumulative returns than fiscal savings.",
  },
  {
    category: "Employment vs Efficiency",
    tension: "Job creation (labor-intensive) vs Output maximization (capital-intensive)",
    gain: "Lower unemployment, higher household income, social stability",
    loss: "Lower per-unit output efficiency, potentially higher cost per job",
    verdict: "Balanced approach: Employment + Education sectors achieve both employment and efficiency targets.",
  },
  {
    category: "Urban vs Regional",
    tension: "Concentrated investment (higher ROI) vs Distributed investment (equity)",
    gain: "Equitable development, reduced regional disparity, national cohesion",
    loss: "Lower aggregate returns, higher logistics costs",
    verdict: "Digital + Education sectors can serve regional populations with lower marginal cost.",
  },
  {
    category: "Direct vs Indirect",
    tension: "Direct transfers (immediate relief) vs Indirect investment (structural change)",
    gain: "Immediate poverty reduction, political feasibility",
    loss: "Dependency risk, lower long-term multiplier",
    verdict: "Combined approach: direct transfers for vulnerability reduction, investment for structural change.",
  },
];

export function TheTradeOff() {
  const setPhase = useStore((s) => s.setPhase);
  const results = useStore((s) => s.results);

  return (
    <section className="section-card" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">06 — THE TRADE-OFF</span>
        <h2 className="section-title">What Do We Trade?</h2>
      </div>

      <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
        Every allocation decision involves trade-offs. Understanding what you gain versus what you sacrifice is the core of policy analysis.
      </p>

      <div style={{ display: "grid", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {tradeoffs.map((t) => (
          <div key={t.category} className="sub-card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
              {t.category}
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem" }}>
              {t.tension}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.35rem" }}>You Gain</div>
                <div style={{ fontSize: "0.85rem", color: "var(--accent)", lineHeight: 1.6 }}>{t.gain}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>You Lose</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{t.loss}</div>
              </div>
            </div>
            <div style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "0.75rem",
              fontSize: "0.85rem",
              color: "var(--text)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}>
              <strong>Verdict:</strong> {t.verdict}
            </div>
          </div>
        ))}
      </div>

      {results.totalJobs > 0 && (
        <div className="sub-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text)", marginBottom: "1rem" }}>Your Current Trade-off Profile</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>
                {results.totalJobs.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Jobs Created</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>
                {(results.totalGDP / 1_000_000).toFixed(0)}M
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>GDP Contribution</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary)" }}>
                {results.totalImpact.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Impact Score</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary)" }}>
                {results.resilience.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Resilience Score</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button className="cta-button" onClick={() => setPhase("policy")}>
          Review the Policy →
        </button>
      </div>
    </section>
  );
}
