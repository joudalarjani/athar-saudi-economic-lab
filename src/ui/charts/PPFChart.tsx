import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { computeAll } from "../../engine";
import { SECTORS } from "../../data/sectors.db";
import type { SectorId } from "../../data/types";

export function PPFChart() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  // Generate PPF by sweeping: maximize short-term impact vs long-term impact
  const frontier = useMemo(() => {
    const points: { st: number; lt: number; label: string }[] = [];
    const steps = 15;

    for (let i = 0; i <= steps; i++) {
      const stWeight = i / steps;
      const ltWeight = 1 - stWeight;

      // Allocate to maximize weighted combination
      const testAmounts: Record<SectorId, number> = Object.fromEntries(
        SECTORS.map((s) => [s.id, 0])
      ) as Record<SectorId, number>;

      const step = 1_000_000;
      let remaining = 100_000_000;

      while (remaining >= step) {
        let bestSector = SECTORS[0].id;
        let bestScore = -Infinity;

        for (const sec of SECTORS) {
          const test = { ...testAmounts, [sec.id]: testAmounts[sec.id] + step };
          const r1 = computeAll(test, 1, weights);
          const r10 = computeAll(test, 10, weights);
          const stScore = r1.totalImpact * stWeight;
          const ltScore = r10.totalImpact * ltWeight;
          const score = stScore + ltScore;
          if (score > bestScore) {
            bestScore = score;
            bestSector = sec.id;
          }
        }

        testAmounts[bestSector] += step;
        remaining -= step;
      }

      const r1 = computeAll(testAmounts, 1, weights);
      const r10 = computeAll(testAmounts, 10, weights);
      points.push({
        st: r1.totalImpact,
        lt: r10.totalImpact,
        label: `${Math.round(stWeight * 100)}% ST`,
      });
    }
    return points;
  }, [weights]);

  const myResults = total > 0
    ? { st: computeAll(amounts, 1, weights).totalImpact, lt: computeAll(amounts, 10, weights).totalImpact }
    : null;

  const allPoints = [...frontier, ...(myResults ? [myResults] : [])];
  const maxSt = Math.max(...allPoints.map((p) => p.st), 1);
  const maxLt = Math.max(...allPoints.map((p) => p.lt), 1);

  const svgW = 500;
  const svgH = 350;
  const pad = { top: 20, right: 20, bottom: 45, left: 55 };
  const cw = svgW - pad.left - pad.right;
  const ch = svgH - pad.top - pad.bottom;

  const sx = (v: number) => pad.left + (v / maxSt) * cw;
  const sy = (v: number) => pad.top + ch - (v / maxLt) * ch;

  const pathD = frontier.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.st)} ${sy(p.lt)}`).join(" ");

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Production Possibility Frontier</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
        Trade-off between short-term social impact and long-term economic impact.
      </p>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.left} y1={sy(f * maxLt)} x2={pad.left + cw} y2={sy(f * maxLt)} stroke="var(--border)" strokeWidth={0.5} />
            <line x1={sx(f * maxSt)} y1={pad.top} x2={sx(f * maxSt)} y2={pad.top + ch} stroke="var(--border)" strokeWidth={0.5} />
          </g>
        ))}

        {/* Axes labels */}
        <text x={pad.left + cw / 2} y={svgH - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
          Short-term Social Impact (Year 1)
        </text>
        <text x={8} y={pad.top + ch / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={10} transform={`rotate(-90, 8, ${pad.top + ch / 2})`}>
          Long-term Economic Impact (Year 10)
        </text>

        {/* Frontier curve */}
        <path d={pathD} fill="none" stroke="var(--emerald)" strokeWidth={2} />

        {/* Area under frontier */}
        <path
          d={`${pathD} L ${sx(frontier[frontier.length - 1].st)} ${sy(0)} L ${sx(0)} ${sy(0)} Z`}
          fill="var(--emerald)"
          opacity={0.05}
        />

        {/* Frontier points */}
        {frontier.map((p, i) => (
          <circle key={i} cx={sx(p.st)} cy={sy(p.lt)} r={3} fill="var(--emerald)" opacity={0.6} />
        ))}

        {/* My allocation */}
        {myResults && (
          <g>
            <circle cx={sx(myResults.st)} cy={sy(myResults.lt)} r={6} fill="var(--gold)" stroke="var(--bg-primary)" strokeWidth={2} />
            <text x={sx(myResults.st) + 10} y={sy(myResults.lt) - 8} fill="var(--gold)" fontSize={10} fontWeight={600}>
              MY ALLOCATION
            </text>
          </g>
        )}
      </svg>

      <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        Points on the frontier represent efficient allocations. Your allocation inside the frontier means there is room for improvement.
      </div>
    </div>
  );
}
