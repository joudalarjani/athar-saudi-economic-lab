import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { computeAll, computeOptimalAllocation } from "../engine";

interface Dimension {
  id: string;
  label: string;
  labelAr: string;
  score: number; // 0-100
  verdict: "strength" | "weakness" | "neutral";
  explanation: string;
}

export function PolicyReview() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);
  const results = useStore((s) => s.results);
  const year = useStore((s) => s.year);
  const setPhase = useStore((s) => s.setPhase);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  const optimal = useMemo(() => computeOptimalAllocation(weights), [weights]);
  const optResults = useMemo(() => computeAll(optimal, year, weights), [optimal, year, weights]);

  const dimensions = useMemo((): Dimension[] => {
    if (total === 0) return [];

    // 1. Opportunity Cost
    const oppCost = Object.values(results.opportunityCost).reduce((s, v) => s + v, 0);
    const maxOppCost = 50; // threshold
    const oppScore = Math.max(0, 100 - (oppCost / maxOppCost) * 100);

    // 2. Concentration Risk
    const allocShares = SECTORS.map((s) => amounts[s.id] / total);
    const hhi = allocShares.reduce((s, p) => s + p * p, 0);
    const concScore = Math.max(0, 100 - (hhi - 1 / 7) * 300);

    // 3. Equity
    const eqScore = results.equityIndex * 100;

    // 4. Efficiency
    const effRatio = total > 0 ? results.totalImpact / (total / 1_000_000) : 0;
    const effScore = Math.min(100, effRatio * 25);

    // 5. Sustainability
    const susScore = results.resilience * 20;

    // 6. Resilience
    const resScore = results.resilience * 25;

    // 7. Short-term Bias
    const year0Impact = computeAll(amounts, 0, weights).totalImpact;
    const year10Impact = computeAll(amounts, 10, weights).totalImpact;
    const stBias = year10Impact > 0 ? year0Impact / year10Impact : 0;
    const stScore = stBias > 0.8 ? 60 : stBias > 0.5 ? 80 : 95; // Low ST bias = good

    // 8. Long-term Impact
    const ltScore = Math.min(100, (year10Impact / 200) * 100);

    return [
      {
        id: "opportunity",
        label: "Opportunity Cost",
        labelAr: "التكلفة الفرصة",
        score: oppScore,
        verdict: oppScore >= 70 ? "strength" : oppScore >= 40 ? "neutral" : "weakness",
        explanation: oppScore >= 70
          ? `Opportunity cost is manageable at ${(oppCost / 1_000_000).toFixed(1)}M SAR equivalent. Your allocation captures most of the available value.`
          : `High opportunity cost of ${(oppCost / 1_000_000).toFixed(1)}M SAR. Redirecting funds from low-impact to high-impact sectors could yield significant gains.`,
      },
      {
        id: "concentration",
        label: "Concentration Risk",
        labelAr: "تركيز المخاطر",
        score: concScore,
        verdict: concScore >= 70 ? "strength" : concScore >= 40 ? "neutral" : "weakness",
        explanation: concScore >= 70
          ? "Well-diversified across sectors. No single sector dominates the portfolio."
          : `Portfolio is concentrated. The Herfindahl index is ${hhi.toFixed(3)} — consider diversifying to reduce sector-specific risk.`,
      },
      {
        id: "equity",
        label: "Equity",
        labelAr: "العدالة",
        score: eqScore,
        verdict: eqScore >= 70 ? "strength" : eqScore >= 40 ? "neutral" : "weakness",
        explanation: eqScore >= 70
          ? `Strong equity index at ${(results.equityIndex * 100).toFixed(1)}%. Resources are reaching underserved regions and populations.`
          : `Equity index at ${(results.equityIndex * 100).toFixed(1)}% suggests imbalance. Consider increasing allocation to sectors with higher regional equity impact.`,
      },
      {
        id: "efficiency",
        label: "Efficiency",
        labelAr: "الكفاءة",
        score: effScore,
        verdict: effScore >= 70 ? "strength" : effScore >= 40 ? "neutral" : "weakness",
        explanation: effScore >= 70
          ? `High impact per SAR invested. Your allocation maximizes economic output relative to budget.`
          : `Impact per SAR is moderate. Optimized allocation could yield ${((optResults.totalImpact - results.totalImpact) / 1_000_000).toFixed(1)}M more impact.`,
      },
      {
        id: "sustainability",
        label: "Sustainability",
        labelAr: "الاستدامة",
        score: susScore,
        verdict: susScore >= 70 ? "strength" : susScore >= 40 ? "neutral" : "weakness",
        explanation: susScore >= 70
          ? "Portfolio shows strong long-term sustainability. Diversification and shock retention are healthy."
          : "Sustainability concerns exist. Consider increasing allocation to sectors with higher maturity curves and lower volatility.",
      },
      {
        id: "resilience",
        label: "Resilience",
        labelAr: "المرونة",
        score: resScore,
        verdict: resScore >= 70 ? "strength" : resScore >= 40 ? "neutral" : "weakness",
        explanation: resScore >= 70
          ? `Resilience score of ${results.resilience.toFixed(1)} indicates the portfolio can absorb shocks effectively.`
          : `Resilience at ${results.resilience.toFixed(1)} is below optimal. Diversification or shock-resistant sectors could improve this.`,
      },
      {
        id: "stBias",
        label: "Short-term Bias",
        labelAr: "التحيزقصيرالمدى",
        score: stScore,
        verdict: stScore >= 70 ? "strength" : stScore >= 40 ? "neutral" : "weakness",
        explanation: stScore >= 70
          ? "Balanced time horizon. Your allocation does not excessively favor short-term gains."
          : "Short-term bias detected. The portfolio front-loads impact at the expense of long-term economic development.",
      },
      {
        id: "ltImpact",
        label: "Long-term Impact",
        labelAr: "الأثرطويلالمدى",
        score: ltScore,
        verdict: ltScore >= 70 ? "strength" : ltScore >= 40 ? "neutral" : "weakness",
        explanation: ltScore >= 70
          ? `Strong long-term projection. Year 10 impact reaches ${year10Impact.toFixed(0)} points.`
          : `Long-term impact is limited. Year 10 projection is ${year10Impact.toFixed(0)} — consider sectors with higher maturity potential.`,
      },
    ];
  }, [amounts, weights, results, total, year, optimal, optResults]);

  const strengths = dimensions.filter((d) => d.verdict === "strength");
  const weaknesses = dimensions.filter((d) => d.verdict === "weakness");
  const avgScore = dimensions.length > 0
    ? dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
    : 0;

  if (total === 0) {
    return (
      <div className="phase-container">
        <div className="section-pad" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Economic Policy Review</h2>
          <p className="muted" style={{ marginTop: "1rem" }}>Allocate funds in the Lab first to enable policy review.</p>
          <button className="btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => setPhase("lab")}>
            Go to Lab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-container">
      <div className="section-pad">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "0.5rem",
          }}>
            Policy Evaluation
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Economic Policy Review</h2>
          <p className="muted" style={{ fontSize: "0.85rem", maxWidth: 600, margin: "0 auto" }}>
            Independent assessment of your portfolio across 8 dimensions.
          </p>
        </div>

        {/* Overall Score */}
        <div className="card" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Overall Policy Score
          </div>
          <div className="mono" style={{ fontSize: "2.5rem", color: avgScore >= 70 ? "var(--emerald-light)" : avgScore >= 40 ? "var(--gold)" : "#DC3545" }}>
            {avgScore.toFixed(0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {avgScore >= 70 ? "Strong portfolio — few adjustments needed" : avgScore >= 40 ? "Moderate portfolio — targeted improvements recommended" : "Weak portfolio — significant restructuring advised"}
          </div>
        </div>

        {/* Dimensions Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {dimensions.map((dim) => (
            <div key={dim.id} className="card" style={{ borderLeft: `3px solid ${dim.verdict === "strength" ? "var(--emerald)" : dim.verdict === "weakness" ? "#DC3545" : "var(--gold)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{dim.label}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{dim.labelAr}</div>
                </div>
                <div className="mono" style={{
                  fontSize: "1.1rem",
                  color: dim.verdict === "strength" ? "var(--emerald-light)" : dim.verdict === "weakness" ? "#DC3545" : "var(--gold)",
                }}>
                  {dim.score.toFixed(0)}
                </div>
              </div>

              {/* Score bar */}
              <div style={{ height: 4, borderRadius: 2, background: "var(--bg-tertiary)", marginBottom: "0.5rem", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${dim.score}%`,
                  background: dim.verdict === "strength" ? "var(--emerald)" : dim.verdict === "weakness" ? "#DC3545" : "var(--gold)",
                  borderRadius: 2,
                }} />
              </div>

              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                {dim.explanation}
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses Summary */}
        <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
          <div className="card">
            <h4 style={{ fontSize: "0.85rem", color: "var(--emerald-light)", marginBottom: "0.75rem" }}>
              Strengths ({strengths.length})
            </h4>
            {strengths.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>No strengths identified.</div>
            ) : (
              strengths.map((s) => (
                <div key={s.id} style={{ fontSize: "0.75rem", marginBottom: "0.5rem", paddingLeft: "0.75rem", borderLeft: "2px solid var(--emerald)" }}>
                  <strong>{s.label}</strong> ({s.score.toFixed(0)}) — {s.explanation.split(".")[0]}.
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h4 style={{ fontSize: "0.85rem", color: "#DC3545", marginBottom: "0.75rem" }}>
              Weaknesses ({weaknesses.length})
            </h4>
            {weaknesses.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>No major weaknesses identified.</div>
            ) : (
              weaknesses.map((w) => (
                <div key={w.id} style={{ fontSize: "0.75rem", marginBottom: "0.5rem", paddingLeft: "0.75rem", borderLeft: "2px solid #DC3545" }}>
                  <strong>{w.label}</strong> ({w.score.toFixed(0)}) — {w.explanation.split(".")[0]}.
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comparison with Optimal */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Your Allocation vs Optimal Under Selected Assumptions</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>YOUR ALLOCATION</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Impact</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{results.totalImpact.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Risk</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{(results.risk.portfolio * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Resilience</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{results.resilience.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Equity</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{(results.equityIndex * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--gold)", marginBottom: "0.5rem" }}>OPTIMAL UNDER SELECTED ASSUMPTIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Impact</div>
                  <div className="mono" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>{optResults.totalImpact.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Risk</div>
                  <div className="mono" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>{(optResults.risk.portfolio * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Resilience</div>
                  <div className="mono" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>{optResults.resilience.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Equity</div>
                  <div className="mono" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>{(optResults.equityIndex * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className="btn-outline" onClick={() => setPhase("defend")}>
            Back to Defend
          </button>
          <button className="btn-outline" onClick={() => setPhase("lab")}>
            Revise Allocation
          </button>
          <button className="btn-primary" onClick={() => setPhase("brief")}>
            Generate Policy Brief
          </button>
        </div>
      </div>
    </div>
  );
}
