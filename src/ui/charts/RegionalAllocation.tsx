import { useState, useMemo } from "react";
import { useStore } from "../../store/useStore";
import { REGIONS } from "../../data/regions.db";

export function RegionalAllocation() {
  const amounts = useStore((s) => s.amounts);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  const [mode, setMode] = useState<"population" | "gap" | "hybrid">("hybrid");
  const [hybridWeight, setHybridWeight] = useState(0.5);

  const totalPop = REGIONS.reduce((s, r) => s + r.popShare, 0);

  const regionData = useMemo(() => {
    return REGIONS.map((reg) => {
      const popShare = reg.popShare / totalPop;
      const gapFactor = reg.gapIndex;
      const hybridShare = popShare * (1 - hybridWeight) + gapFactor * hybridWeight;

      let alloc = 0;
      if (mode === "population") alloc = popShare * total;
      else if (mode === "gap") alloc = (gapFactor / REGIONS.reduce((s, r) => s + r.gapIndex, 0)) * total;
      else alloc = (hybridShare / REGIONS.reduce((s, r) => {
        const ps = r.popShare / totalPop;
        const gf = r.gapIndex;
        return s + ps * (1 - hybridWeight) + gf * hybridWeight;
      }, 0)) * total;

      // Per capita impact
      const perCapita = alloc > 0 && popShare > 0 ? alloc / (popShare * 10_000_000) : 0;

      return {
        id: reg.id,
        name: reg.nameEn,
        popShare,
        gapIndex: gapFactor,
        allocation: alloc / 1_000_000,
        perCapita,
      };
    });
  }, [total, mode, hybridWeight, totalPop]);

  const maxAlloc = Math.max(...regionData.map((r) => r.allocation), 1);
  const maxPop = Math.max(...regionData.map((r) => r.popShare), 0.01);

  const svgW = 500;
  const svgH = 350;
  const pad = { top: 20, right: 20, bottom: 50, left: 100 };
  const cw = svgW - pad.left - pad.right;
  const ch = svgH - pad.top - pad.bottom;
  const barH = ch / regionData.length - 2;

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Regional Allocation</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}>
        How should the budget be distributed across 13 regions?
      </p>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem" }}>
        {(["population", "gap", "hybrid"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "0.3rem 0.6rem",
              fontSize: "0.7rem",
              borderRadius: "var(--radius-sm)",
              color: mode === m ? "var(--emerald-light)" : "var(--text-secondary)",
              background: mode === m ? "var(--emerald-dim)" : "transparent",
              border: `1px solid ${mode === m ? "var(--emerald)" : "var(--border)"}`,
            }}
          >
            {m === "population" ? "Population-based" : m === "gap" ? "Gap-based" : "Hybrid"}
          </button>
        ))}
      </div>

      {mode === "hybrid" && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Pop</span>
          <input
            type="range" min={0} max={1} step={0.01} value={hybridWeight}
            onChange={(e) => setHybridWeight(Number(e.target.value))}
            className="slider" style={{ flex: 1 }}
          />
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Gap</span>
        </div>
      )}

      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        {regionData.map((r, i) => {
          const y = pad.top + i * (ch / regionData.length) + 1;
          const barW = (r.allocation / maxAlloc) * cw;

          return (
            <g key={r.id}>
              {/* Region name */}
              <text x={pad.left - 6} y={y + barH / 2 + 3} textAnchor="end" fill="var(--text-secondary)" fontSize={8}>
                {r.name}
              </text>

              {/* Allocation bar */}
              <rect x={pad.left} y={y} width={barW} height={barH} rx={2}
                fill="var(--emerald)" opacity={0.6} />

              {/* Population reference line */}
              <line
                x1={pad.left + (r.popShare / maxPop) * cw}
                y1={y}
                x2={pad.left + (r.popShare / maxPop) * cw}
                y2={y + barH}
                stroke="var(--gold)" strokeWidth={1.5} strokeDasharray="2,2" opacity={0.5}
              />

              {/* Value label */}
              <text x={pad.left + barW + 4} y={y + barH / 2 + 3} fill="var(--text-muted)" fontSize={7}>
                {r.allocation.toFixed(1)}M
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${pad.left}, ${svgH - 15})`}>
          <rect width={8} height={8} fill="var(--emerald)" opacity={0.6} rx={1} />
          <text x={12} y={8} fill="var(--text-muted)" fontSize={8}>Allocation</text>
          <line x1={80} y1={4} x2={92} y2={4} stroke="var(--gold)" strokeWidth={1.5} strokeDasharray="2,2" />
          <text x={96} y={8} fill="var(--text-muted)" fontSize={8}>Population share</text>
        </g>
      </svg>
    </div>
  );
}
