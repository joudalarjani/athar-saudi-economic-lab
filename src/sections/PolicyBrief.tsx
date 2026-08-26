import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { computeAll, computeOptimalAllocation } from "../engine";

export function PolicyBrief() {
  const amounts = useStore((s) => s.amounts);
  const year = useStore((s) => s.year);
  const weights = useStore((s) => s.weights);
  const results = useStore((s) => s.results);
  const setPhase = useStore((s) => s.setPhase);
  const setYear = useStore((s) => s.setYear);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  const optimal = useMemo(() => computeOptimalAllocation(weights), [weights]);
  const optResults = useMemo(() => computeAll(optimal, year, weights), [optimal, year, weights]);

  const sorted = SECTORS.map((sec) => ({
    ...sec,
    alloc: amounts[sec.id],
    pct: total > 0 ? (amounts[sec.id] / total) * 100 : 0,
    impact: results.impact[sec.id],
    sroi: results.sroi[sec.id],
    gdp: results.directGDP[sec.id] + results.indirectGDP[sec.id] + results.inducedGDP[sec.id],
    jobs: results.jobs[sec.id],
    multiplier: results.totalMultiplier[sec.id],
    risk: results.risk.sectorRisks[sec.id],
    oppCost: results.opportunityCost[sec.id],
  })).sort((a, b) => b.alloc - a.alloc);

  const activeSectors = sorted.filter((s) => s.alloc > 0);

  const totalDirectGDP = Object.values(results.directGDP).reduce((s, v) => s + v, 0);
  const totalIndirectGDP = Object.values(results.indirectGDP).reduce((s, v) => s + v, 0);
  const totalInducedGDP = Object.values(results.inducedGDP).reduce((s, v) => s + v, 0);
  const totalOppCost = Object.values(results.opportunityCost).reduce((s, v) => s + v, 0);

  const year0Impact = useMemo(() => computeAll(amounts, 0, weights).totalImpact, [amounts, weights]);
  const year10Impact = useMemo(() => computeAll(amounts, 10, weights).totalImpact, [amounts, weights]);

  // Generate trade-offs
  const tradeoffs = useMemo(() => {
    const t: string[] = [];
    if (results.risk.portfolio > 0.25) {
      t.push("Higher returns come with elevated portfolio risk — diversification could reduce this at the cost of some impact.");
    }
    if (results.equityIndex < 0.5) {
      t.push("Prioritizing efficiency over equity means some regions receive disproportionately less investment.");
    }
    if (totalOppCost > 10_000_000) {
      t.push(`Opportunity cost of ${(totalOppCost / 1_000_000).toFixed(1)}M suggests value could be unlocked by reallocating from underperforming sectors.`);
    }
    if (year10Impact > year0Impact * 2) {
      t.push("Strong long-term orientation — initial impact is lower but compounds significantly over time.");
    }
    if (activeSectors.length < 4) {
      t.push("Concentrated portfolio in few sectors increases exposure to sector-specific shocks.");
    }
    if (t.length === 0) {
      t.push("Your allocation presents a balanced trade-off profile across all measured dimensions.");
    }
    return t;
  }, [results, totalOppCost, year0Impact, year10Impact, activeSectors]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (results.risk.portfolio > 0.3) {
      recs.push("Consider diversifying across more sectors to reduce concentration risk.");
    }
    if (results.equityIndex < 0.5) {
      recs.push("Increase allocation to sectors with higher regional equity impact (e.g., Health, Education).");
    }
    if (results.resilience < 50) {
      recs.push("Improve portfolio resilience by including more shock-resistant sectors.");
    }
    const zeroCount = SECTORS.filter((s) => amounts[s.id] === 0).length;
    if (zeroCount >= 3) {
      recs.push(`${zeroCount} sectors have zero allocation — consider at least minimal investment for diversification.`);
    }
    if (optResults.totalImpact > results.totalImpact * 1.2) {
      recs.push(`The optimal allocation yields ${((optResults.totalImpact - results.totalImpact) / 1_000_000).toFixed(1)}M more impact — review your weighting assumptions.`);
    }
    if (recs.length === 0) {
      recs.push("Your allocation is well-balanced. Monitor performance annually and adjust based on real-world outcomes.");
    }
    return recs;
  }, [results, optResults, amounts]);

  const handleCopy = () => {
    const lines: string[] = [];
    lines.push("# POLICY BRIEF - ATHAR");
    lines.push("");
    lines.push("## Allocation");
    activeSectors.forEach((s) => {
      lines.push("- " + s.nameAr + " (" + s.nameEn + "): " + (s.alloc / 1_000_000).toFixed(1) + "M SAR (" + s.pct.toFixed(1) + "%)");
    });
    lines.push("");
    lines.push("## Objectives");
    Object.entries(weights).forEach(([k, v]) => {
      lines.push("- " + k.replace(/_/g, " ") + ": " + (v * 100).toFixed(0) + "%");
    });
    lines.push("");
    lines.push("## Expected Impact");
    lines.push("- Total Impact Score: " + results.totalImpact.toFixed(1));
    lines.push("- Total GDP Flow: " + (results.totalGDP / 1_000_000).toFixed(1) + "M SAR");
    lines.push("- Total Jobs: " + results.totalJobs.toFixed(0));
    lines.push("");
    lines.push("## SROI");
    activeSectors.forEach((s) => {
      lines.push("- " + s.nameAr + ": " + s.sroi.toFixed(2) + "x");
    });
    lines.push("");
    lines.push("## Economic Multiplier");
    activeSectors.forEach((s) => {
      lines.push("- " + s.nameAr + ": " + s.multiplier.toFixed(2) + "x");
    });
    lines.push("");
    lines.push("## Economic Impact");
    lines.push("- Direct GDP: " + (totalDirectGDP / 1_000_000).toFixed(1) + "M SAR");
    lines.push("- Indirect GDP: " + (totalIndirectGDP / 1_000_000).toFixed(1) + "M SAR");
    lines.push("- Induced GDP: " + (totalInducedGDP / 1_000_000).toFixed(1) + "M SAR");
    lines.push("");
    lines.push("## Opportunity Cost");
    lines.push("- Total: " + (totalOppCost / 1_000_000).toFixed(1) + "M SAR");
    lines.push("");
    lines.push("## Risk");
    lines.push("- Portfolio Risk: " + (results.risk.portfolio * 100).toFixed(1) + "%");
    lines.push("");
    lines.push("## Sustainability");
    lines.push("- Resilience Score: " + results.resilience.toFixed(1));
    lines.push("");
    lines.push("## Equity");
    lines.push("- Equity Index: " + (results.equityIndex * 100).toFixed(1) + "%");
    lines.push("");
    lines.push("## Resilience");
    Object.entries(results.resilienceBreakdown).forEach(([k, v]) => {
      lines.push("- " + k + ": " + v.toFixed(1));
    });
    lines.push("");
    lines.push("## Trade-offs");
    tradeoffs.forEach((t) => { lines.push("- " + t); });
    lines.push("");
    lines.push("## Recommendations");
    recommendations.forEach((r) => { lines.push("- " + r); });
    lines.push("");
    lines.push("---");
    lines.push("Methodology: Simulation based on stated assumptions. All parameters documented in Model Transparency panel.");
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  };

  if (total === 0) {
    return (
      <div className="phase-container">
        <div className="section-pad" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Policy Brief</h2>
          <p className="muted" style={{ marginTop: "1rem" }}>Allocate funds in the Lab to generate a policy brief.</p>
          <button className="btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => setPhase("model")}>
            Go to Model
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
            Document
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Economic Policy Brief</h2>
          <p className="muted" style={{ fontSize: "0.85rem", maxWidth: 600, margin: "0 auto" }}>
            Complete summary of your allocation, impact, trade-offs, and recommendations.
          </p>
        </div>

        {/* Time Horizon */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Time Horizon</h4>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {([0, 1, 3, 5, 10] as const).map((t) => (
              <button
                key={t}
                onClick={() => setYear(t)}
                style={{
                  padding: "0.35rem 0.7rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  color: year === t ? "var(--gold)" : "var(--text-secondary)",
                  background: year === t ? "rgba(212,160,23,0.1)" : "transparent",
                  border: `1px solid ${year === t ? "rgba(212,160,23,0.3)" : "var(--border)"}`,
                }}
              >
                Year {t}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Allocation */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>1. Allocation</h4>
          <div style={{ display: "flex", height: 24, borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "0.75rem", border: "1px solid var(--border)" }}>
            {activeSectors.map((s) => (
              <div key={s.id} style={{ width: `${s.pct}%`, background: "var(--gold)", opacity: 0.6, transition: "width 300ms" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
            {sorted.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", padding: "0.3rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: s.alloc > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{s.nameAr}</span>
                <span className="mono" style={{ color: s.alloc > 0 ? "var(--gold)" : "var(--text-muted)" }}>
                  {s.alloc > 0 ? `${(s.alloc / 1_000_000).toFixed(1)}M (${s.pct.toFixed(0)}%)` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Objectives */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>2. Objectives</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} style={{ textAlign: "center", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</div>
                <div className="mono" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>{(val * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Expected Impact */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>3. Expected Impact</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div style={{ textAlign: "center", padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Total Impact Score</div>
              <div className="mono" style={{ fontSize: "1.3rem", color: "var(--gold)" }}>{results.totalImpact.toFixed(1)}</div>
            </div>
            <div style={{ textAlign: "center", padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Total GDP Flow</div>
              <div className="mono" style={{ fontSize: "1.3rem" }}>{(results.totalGDP / 1_000_000).toFixed(1)}M</div>
            </div>
            <div style={{ textAlign: "center", padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Total Jobs</div>
              <div className="mono" style={{ fontSize: "1.3rem" }}>{results.totalJobs.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* 4. SROI */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>4. SROI (Social Return on Investment)</h4>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            SROI measures social value per SAR invested. Note: SROI ≠ Keynesian Multiplier. SROI is social value; Multiplier is economic ripple.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.5rem" }}>
            {activeSectors.map((s) => (
              <div key={s.id} style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{s.nameAr}</div>
                <div className="mono" style={{ fontSize: "1rem", color: "var(--emerald)" }}>{s.sroi.toFixed(2)}x</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Economic Multiplier */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>5. Economic Multiplier (Keynesian)</h4>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            The multiplier measures economic ripple — direct + indirect (supply chain) + induced (household spending) effects.
          </p>
          <div className="grid-2">
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Breakdown</div>
              <div style={{ fontSize: "0.75rem", marginBottom: "0.3rem" }}>
                <span className="dim">Direct Output</span>
                <span className="mono" style={{ float: "right" }}>{(totalDirectGDP / 1_000_000).toFixed(1)}M SAR</span>
              </div>
              <div style={{ fontSize: "0.75rem", marginBottom: "0.3rem" }}>
                <span className="dim">Indirect (Supply Chain)</span>
                <span className="mono" style={{ float: "right" }}>{(totalIndirectGDP / 1_000_000).toFixed(1)}M SAR</span>
              </div>
              <div style={{ fontSize: "0.75rem" }}>
                <span className="dim">Induced (Household)</span>
                <span className="mono" style={{ float: "right" }}>{(totalInducedGDP / 1_000_000).toFixed(1)}M SAR</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Per Sector</div>
              {activeSectors.slice(0, 4).map((s) => (
                <div key={s.id} style={{ fontSize: "0.75rem", marginBottom: "0.3rem" }}>
                  <span className="dim">{s.nameAr}</span>
                  <span className="mono" style={{ float: "right" }}>{s.multiplier.toFixed(2)}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Economic Impact */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>6. Economic Impact</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
            {activeSectors.map((s) => (
              <div key={s.id} style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{s.nameAr}</div>
                <div className="mono" style={{ fontSize: "0.85rem" }}>{(s.gdp / 1_000_000).toFixed(2)}M SAR</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Opportunity Cost */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>7. Opportunity Cost</h4>
          <div style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
            Total opportunity cost: <span className="mono" style={{ color: "#DC3545" }}>{(totalOppCost / 1_000_000).toFixed(1)}M SAR</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            This represents potential impact lost by not allocating to the highest-return sectors. Values below are per-sector opportunity costs.
          </div>
        </div>

        {/* 8. Risk */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>8. Risk</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Portfolio Risk (σ)</div>
              <div className="mono" style={{ fontSize: "1.1rem" }}>{(results.risk.portfolio * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Resilience Score</div>
              <div className="mono" style={{ fontSize: "1.1rem" }}>{results.resilience.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* 9. Sustainability */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>9. Sustainability</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
            {Object.entries(results.resilienceBreakdown).map(([key, val]) => (
              <div key={key} style={{ textAlign: "center", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                <div className="mono" style={{ fontSize: "0.9rem" }}>{val.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Equity */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>10. Equity</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Equity Index</div>
              <div className="mono" style={{ fontSize: "1.1rem" }}>{(results.equityIndex * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Interpretation</div>
              <div style={{ fontSize: "0.75rem" }}>
                {results.equityIndex >= 0.7 ? "Strong equity — resources reach underserved regions." : results.equityIndex >= 0.5 ? "Moderate equity — room for improvement." : "Low equity — consider redistributing toward high-need regions."}
              </div>
            </div>
          </div>
        </div>

        {/* 11. Resilience */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>11. Resilience</h4>
          <div style={{ fontSize: "0.75rem" }}>
            Overall resilience: <span className="mono">{results.resilience.toFixed(1)}</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {results.resilience >= 70 ? "Portfolio can absorb shocks effectively." : results.resilience >= 40 ? "Moderate resilience — some vulnerability to shocks." : "Low resilience — portfolio is vulnerable to economic shocks."}
          </div>
        </div>

        {/* 12. Trade-offs */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>12. Trade-offs</h4>
          {tradeoffs.map((t, i) => (
            <div key={i} style={{ fontSize: "0.75rem", marginBottom: "0.5rem", paddingLeft: "0.75rem", borderLeft: "2px solid var(--gold)" }}>
              {t}
            </div>
          ))}
        </div>

        {/* 13. Recommendations */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>13. Recommendations</h4>
          {recommendations.map((r, i) => (
            <div key={i} style={{ fontSize: "0.75rem", marginBottom: "0.5rem", paddingLeft: "0.75rem", borderLeft: "2px solid var(--emerald)" }}>
              {r}
            </div>
          ))}
        </div>

        {/* Methodology Note */}
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "3px solid var(--gold)" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--gold)" }}>Methodology:</strong> All calculations come from the Economic Engine. AI provides interpretation only — no fabricated data.
            SROI values are allocation-dependent due to diminishing marginal returns. Multiplier values reflect Keynesian demand-side effects.
            Evidence levels (VERIFIED / CASE_STUDY / ESTIMATE / SIMULATION_ASSUMPTION) are documented per sector in the Data Transparency panel.
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className="btn-outline" onClick={() => setPhase("policy")}>
            Back to Review
          </button>
          <button className="btn-outline" onClick={handleCopy}>
            Copy Brief
          </button>
          <button className="btn-primary" onClick={() => setPhase("thesis")}>
            My Thesis
          </button>
        </div>
      </div>
    </div>
  );
}
