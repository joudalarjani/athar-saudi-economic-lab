import { useState, useMemo } from "react";
import { useStore } from "../../store/useStore";
import { computeAll } from "../../engine";
import { SECTORS } from "../../data/sectors.db";
import type { SectorId } from "../../data/types";

export function EquityEfficiency() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  const [equityWeight, setEquityWeight] = useState(0.5);

  const sweep = useMemo(() => {
    const steps = 20;
    const pts: { eq: number; ef: number; w: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const w = i / steps;
      const testAmounts: Record<SectorId, number> = Object.fromEntries(
        SECTORS.map((s) => [s.id, 0])
      ) as Record<SectorId, number>;

      const step = 1_000_000;
      let rem = 100_000_000;

      while (rem >= step) {
        let best = SECTORS[0].id;
        let bestS = -Infinity;
        for (const sec of SECTORS) {
          const test = { ...testAmounts, [sec.id]: testAmounts[sec.id] + step };
          const r = computeAll(test, 3, { ...weights, equity: w, resilience: 1 - w });
          const score = r.totalImpact;
          if (score > bestS) { bestS = score; best = sec.id; }
        }
        testAmounts[best] += step;
        rem -= step;
      }

      const r = computeAll(testAmounts, 3, { ...weights, equity: w });
      pts.push({ eq: r.equityIndex, ef: r.totalImpact, w });
    }
    return pts;
  }, [weights]);

  const myResult = total > 0
    ? (() => { const r = computeAll(amounts, 3, weights); return { eq: r.equityIndex, ef: r.totalImpact }; })()
    : null;

  const maxEq = Math.max(...sweep.map((p) => p.eq), myResult?.eq ?? 0, 1);
  const maxEf = Math.max(...sweep.map((p) => p.ef), myResult?.ef ?? 0, 1);

  const svgW = 500;
  const svgH = 320;
  const pad = { top: 20, right: 20, bottom: 45, left: 55 };
  const cw = svgW - pad.left - pad.right;
  const ch = svgH - pad.top - pad.bottom;

  const sx = (v: number) => pad.left + (v / maxEf) * cw;
  const sy = (v: number) => pad.top + ch - (v / maxEq) * ch;

  const pathD = sweep.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.ef)} ${sy(p.eq)}`).join(" ");

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Equity vs Efficiency Curve</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}>
        Drag the slider to see how prioritizing equity shifts the allocation.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Equity: {(equityWeight * 100).toFixed(0)}%</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={equityWeight}
          onChange={(e) => setEquityWeight(Number(e.target.value))}
          className="slider"
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Efficiency: {((1 - equityWeight) * 100).toFixed(0)}%</span>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.left} y1={sy(f * maxEq)} x2={pad.left + cw} y2={sy(f * maxEq)} stroke="var(--border)" strokeWidth={0.5} />
            <line x1={sx(f * maxEf)} y1={pad.top} x2={sx(f * maxEf)} y2={pad.top + ch} stroke="var(--border)" strokeWidth={0.5} />
          </g>
        ))}

        <text x={pad.left + cw / 2} y={svgH - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
          Economic Efficiency (Total Impact)
        </text>
        <text x={8} y={pad.top + ch / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={10} transform={`rotate(-90, 8, ${pad.top + ch / 2})`}>
          Equity Score
        </text>

        <path d={pathD} fill="none" stroke="var(--gold)" strokeWidth={2} />
        {sweep.map((p, i) => (
          <circle key={i} cx={sx(p.ef)} cy={sy(p.eq)} r={2.5} fill="var(--gold)" opacity={0.5} />
        ))}

        {/* Current slider position */}
        {(() => {
          const closest = sweep.reduce((best, p) =>
            Math.abs(p.w - equityWeight) < Math.abs(best.w - equityWeight) ? p : best
          );
          return <circle cx={sx(closest.ef)} cy={sy(closest.eq)} r={5} fill="var(--gold)" stroke="var(--bg-primary)" strokeWidth={2} />;
        })()}

        {myResult && (
          <g>
            <circle cx={sx(myResult.ef)} cy={sy(myResult.eq)} r={6} fill="var(--emerald)" stroke="var(--bg-primary)" strokeWidth={2} />
            <text x={sx(myResult.ef) + 10} y={sy(myResult.eq) - 8} fill="var(--emerald-light)" fontSize={9} fontWeight={600}>
              MY ALLOCATION
            </text>
          </g>
        )}
      </svg>

      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        Dragging toward equity prioritizes regions and sectors with higher need. Dragging toward efficiency maximizes total economic output.
      </div>
    </div>
  );
}
