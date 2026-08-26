import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { BUDGET } from "../data/types";

export function DefendPolicy() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);
  const results = useStore((s) => s.results);
  const setPhase = useStore((s) => s.setPhase);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  const remaining = BUDGET - total;

  const sorted = SECTORS.map((sec) => ({
    ...sec,
    alloc: amounts[sec.id],
    pct: total > 0 ? (amounts[sec.id] / total) * 100 : 0,
    impact: results.impact[sec.id],
  })).sort((a, b) => b.alloc - a.alloc);

  const top3 = sorted.filter((s) => s.alloc > 0).slice(0, 3);
  const zeroSectors = sorted.filter((s) => s.alloc === 0);

  if (total === 0) {
    return (
      <div className="phase-container">
        <div className="section-pad" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Defend Your Policy</h2>
          <p className="muted" style={{ marginTop: "1rem" }}>Allocate funds in the Lab first.</p>
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
            Before You Proceed
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Defend Your Policy</h2>
          <p className="muted" style={{ fontSize: "0.85rem", maxWidth: 600, margin: "0 auto" }}>
            Review your allocation before entering the policy review.
            You will be asked to justify your choices.
          </p>
        </div>

        {/* Allocation Overview */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>Your Allocation</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Left: Visual bars */}
            <div>
              {sorted.map((sec) => (
                <div key={sec.id} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.15rem" }}>
                    <span style={{ color: sec.alloc > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {sec.nameAr}
                    </span>
                    <span className="mono" style={{ color: sec.alloc > 0 ? "var(--emerald-light)" : "var(--text-muted)" }}>
                      {sec.alloc > 0 ? `${(sec.alloc / 1_000_000).toFixed(1)}M` : "—"}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${sec.pct}%`,
                      background: sec.alloc > 0 ? "var(--emerald)" : "transparent",
                      borderRadius: 3,
                      transition: "width 300ms ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Key metrics */}
            <div>
              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Total Allocated</div>
                <div className="mono" style={{ fontSize: "1.1rem", color: "var(--emerald-light)" }}>
                  {((total / BUDGET) * 100).toFixed(0)}% of budget
                </div>
                {remaining > 0 && (
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {(remaining / 1_000_000).toFixed(1)}M SAR unallocated
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Impact</div>
                  <div className="mono" style={{ fontSize: "0.9rem", color: "var(--emerald-light)" }}>{results.totalImpact.toFixed(1)}</div>
                </div>
                <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Risk</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{(results.risk.portfolio * 100).toFixed(1)}%</div>
                </div>
                <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Resilience</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{results.resilience.toFixed(1)}</div>
                </div>
                <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Equity</div>
                  <div className="mono" style={{ fontSize: "0.9rem" }}>{(results.equityIndex * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Defense Questions */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>Questions to Consider</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {top3.length > 0 && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(25,135,84,0.05)", border: "1px solid rgba(25,135,84,0.15)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--emerald-light)", marginBottom: "0.25rem" }}>
                  Why these top priorities?
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                  You allocated {top3.map((s) => s.nameAr).join("، ")} as your top {top3.length} sectors.
                  What evidence supports this ranking?
                </div>
              </div>
            )}

            {zeroSectors.length > 0 && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(201,162,39,0.05)", border: "1px solid rgba(201,162,39,0.15)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gold)", marginBottom: "0.25rem" }}>
                  What about the excluded sectors?
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                  {zeroSectors.length} sector{zeroSectors.length > 1 ? "s" : ""} received zero allocation: {zeroSectors.map((s) => s.nameAr).join("، ")}.
                  Is the opportunity cost justified?
                </div>
              </div>
            )}

            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(220,53,69,0.05)", border: "1px solid rgba(220,53,69,0.15)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#DC3545", marginBottom: "0.25rem" }}>
                Risk concentration
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                Your portfolio risk is {(results.risk.portfolio * 100).toFixed(1)}%.
                {results.risk.portfolio > 0.3
                  ? " This is relatively high — consider diversifying."
                  : " This is within acceptable range."}
              </div>
            </div>

            <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8B5CF6", marginBottom: "0.25rem" }}>
                Equity implications
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                Your equity index is {(results.equityIndex * 100).toFixed(1)}%.
                {results.equityIndex < 0.5
                  ? " Low equity — resources may be concentrated in already-advantaged regions."
                  : results.equityIndex > 0.7
                    ? " Strong equity performance."
                    : " Moderate equity — room for improvement."}
              </div>
            </div>
          </div>
        </div>

        {/* Objective Weights Reminder */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Your Objective Weights</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} style={{ textAlign: "center", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {key.replace(/_/g, " ")}
                </div>
                <div className="mono" style={{ fontSize: "0.9rem", color: "var(--emerald-light)" }}>
                  {(val * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className="btn-outline" onClick={() => setPhase("stress")}>
            Back to Stress Test
          </button>
          <button className="btn-outline" onClick={() => setPhase("lab")}>
            Revise Allocation
          </button>
          <button className="btn-primary" onClick={() => setPhase("review")}>
            Enter Policy Review
          </button>
        </div>
      </div>
    </div>
  );
}
