import React, { useMemo } from "react";
import { useStore } from "../store/useStore";
import { SHOCKS } from "../data/shocks.db";
import { computeStressTest } from "../engine";

export const StressTest: React.FC = () => {
  const amounts = useStore((s) => s.amounts);
  const year = useStore((s) => s.year);
  const activeShocks = useStore((s) => s.activeShocks);
  const toggleShock = useStore((s) => s.toggleShock);
  const setPhase = useStore((s) => s.setPhase);

  const totalAllocated = Object.values(amounts).reduce((s, v) => s + v, 0);

  const tests = useMemo(() => {
    if (totalAllocated === 0) return [];
    return SHOCKS.map((shock) => ({
      shock,
      test: computeStressTest(amounts, year, shock.id),
    }));
  }, [amounts, year, totalAllocated]);

  return (
    <div className="phase-container">
      <div className="section-pad">
        <div className="section-header">
          <h2>Stress Test</h2>
          <p className="muted">Test your portfolio against economic shocks. Toggle shocks on/off to see impact.</p>
        </div>

        {totalAllocated === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p className="muted">No allocation yet. Go to the Lab to allocate funds first.</p>
            <button className="btn-primary mt-md" onClick={() => setPhase("lab")}>
              Go to Lab
            </button>
          </div>
        ) : (
          <>
            <div className="grid-3 mb-lg">
              {tests.map(({ shock, test }) => {
                const isActive = activeShocks.includes(shock.id);

                return (
                  <div
                    key={shock.id}
                    className="card"
                    style={{
                      cursor: "pointer",
                      borderColor: isActive ? "var(--red)" : "var(--border)",
                      transition: "all 200ms ease",
                    }}
                    onClick={() => toggleShock(shock.id)}
                  >
                    <div className="flex-between mb-sm">
                      <h4 style={{ fontSize: "0.9rem" }}>{shock.nameEn}</h4>
                      <span
                        className="mono"
                        style={{
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: 4,
                          background: isActive ? "var(--red-dim)" : "transparent",
                          color: isActive ? "var(--red)" : "var(--text-muted)",
                          border: `1px solid ${isActive ? "var(--red)" : "var(--border)"}`,
                        }}
                      >
                        {isActive ? "ACTIVE" : "OFF"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      {shock.description}
                    </p>
                    {isActive && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                        <div className="flex-between" style={{ fontSize: "0.75rem" }}>
                          <span>Impact Change</span>
                          <span className="mono" style={{ color: test.delta.impact < 0 ? "var(--red)" : "var(--emerald-light)" }}>
                            {test.delta.impact > 0 ? "+" : ""}
                            {test.delta.impact.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex-between" style={{ fontSize: "0.75rem" }}>
                          <span>GDP Change</span>
                          <span className="mono" style={{ color: test.delta.gdp < 0 ? "var(--red)" : "var(--emerald-light)" }}>
                            {test.delta.gdp > 0 ? "+" : ""}
                            {(test.delta.gdp / 1_000_000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex-between" style={{ fontSize: "0.75rem" }}>
                          <span>Resilience Change</span>
                          <span className="mono" style={{ color: test.delta.resilience < 0 ? "var(--red)" : "var(--emerald-light)" }}>
                            {test.delta.resilience > 0 ? "+" : ""}
                            {test.delta.resilience.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button className="btn-outline" onClick={() => setPhase("analysis")} style={{ marginRight: "1rem" }}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setPhase("defend")}>
                Defend Your Policy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
