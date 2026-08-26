import React, { useMemo } from "react";
import { useStore } from "../store/useStore";
import { computeOptimal } from "../engine";
import { SECTORS } from "../data/sectors.db";

export const Optimization: React.FC = () => {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);
  const setWeight = useStore((s) => s.setWeight);
  const setAmount = useStore((s) => s.setAmount);
  const results = useStore((s) => s.results);
  const setPhase = useStore((s) => s.setPhase);

  const { optimal, comparison } = useMemo(() => computeOptimal(amounts, weights), [amounts, weights]);

  const totalAllocated = Object.values(amounts).reduce((s, v) => s + v, 0);

  return (
    <div className="phase-container">
      <div className="section-pad">
        <div className="section-header">
          <h2>Optimization</h2>
          <p className="muted">Set your objective weights. Compare your allocation to the optimized result.</p>
        </div>

        <div className="card mb-lg">
          <h4 className="mb-sm">Objective Weights</h4>
          {(["efficiency", "social_impact", "equity", "sustainability", "resilience"] as const).map((key) => (
            <div key={key} className="flex-between" style={{ marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", textTransform: "capitalize" }}>
                {key.replace("_", " ")}
              </span>
              <div className="flex-row gap-sm">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(weights[key] * 100)}
                  onChange={(e) => setWeight(key, Number(e.target.value) / 100)}
                  style={{ width: 120 }}
                />
                <span className="mono" style={{ fontSize: "0.8rem", width: 40 }}>
                  {Math.round(weights[key] * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <h4 className="mb-md" style={{ color: "var(--gold)" }}>My Allocation</h4>
            {SECTORS.map((sec) => (
              <div key={sec.id} className="flex-between" style={{ marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.8rem" }}>{sec.nameEn}</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>
                  {(amounts[sec.id] / 1_000_000).toFixed(1)}M
                </span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
              <div className="flex-between">
                <span style={{ fontSize: "0.8rem" }}>Impact</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>{results.totalImpact.toFixed(1)}</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: "0.8rem" }}>Risk</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>{(results.risk.portfolio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: "0.8rem" }}>Resilience</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>{results.resilience.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="mb-md" style={{ color: "var(--emerald-light)" }}>Optimized Allocation</h4>
            {SECTORS.map((sec) => (
              <div key={sec.id} className="flex-between" style={{ marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.8rem" }}>{sec.nameEn}</span>
                <div className="flex-row gap-sm">
                  <span className="mono" style={{ fontSize: "0.8rem" }}>
                    {(optimal[sec.id] / 1_000_000).toFixed(1)}M
                  </span>
                  {totalAllocated > 0 && optimal[sec.id] !== amounts[sec.id] && (
                    <button
                      className="btn-outline"
                      style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem" }}
                      onClick={() => setAmount(sec.id, optimal[sec.id])}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
              <div className="flex-between">
                <span style={{ fontSize: "0.8rem" }}>Impact</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>{comparison.optImpact.toFixed(1)}</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: "0.8rem" }}>Risk</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>{(comparison.optRisk * 100).toFixed(1)}%</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: "0.8rem" }}>Resilience</span>
                <span className="mono" style={{ fontSize: "0.8rem" }}>{comparison.optResilience.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="dim mt-md" style={{ fontSize: "0.75rem", textAlign: "center" }}>
          Optimal under the selected objectives and assumptions. Not "The True Optimal Portfolio."
        </p>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="btn-outline" onClick={() => setPhase("lab")} style={{ marginRight: "1rem" }}>
            Back to Lab
          </button>
          <button className="btn-primary" onClick={() => setPhase("analysis")}>
            Advanced Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
