import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { computeAll } from "../../engine";
import { SECTORS } from "../../data/sectors.db";
import type { SectorId } from "../../data/types";

export function EfficientFrontier() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  // Generate random portfolios and find frontier
  const { frontier, randoms } = useMemo(() => {
    const portfolios: { risk: number; impact: number; sroi: number }[] = [];

    // Random allocations
    for (let n = 0; n < 200; n++) {
      const rand: Record<SectorId, number> = Object.fromEntries(
        SECTORS.map((s) => [s.id, 0])
      ) as Record<SectorId, number>;
      let rem = 100_000_000;
      const step = 5_000_000;
      for (const sec of SECTORS) {
        const alloc = Math.floor(Math.random() * (rem / step)) * step;
        rand[sec.id] = alloc;
        rem -= alloc;
      }
      rand[SECTORS[0].id] += rem;
      const r = computeAll(rand, 3, weights);
      portfolios.push({ risk: r.risk.portfolio, impact: r.totalImpact, sroi: 0 });
    }

    // Sort by risk, extract frontier (max impact for each risk level)
    portfolios.sort((a, b) => a.risk - b.risk);
    const frontierPts: typeof portfolios = [];
    let maxImpact = -Infinity;
    for (const p of portfolios) {
      if (p.impact > maxImpact) {
        frontierPts.push(p);
        maxImpact = p.impact;
      }
    }

    return { frontier: frontierPts, randoms: portfolios };
  }, [weights]);

  const myResult = total > 0
    ? (() => { const r = computeAll(amounts, 3, weights); return { risk: r.risk.portfolio, impact: r.totalImpact }; })()
    : null;

  const allPts = [...randoms, ...(myResult ? [myResult] : [])];
  const maxRisk = Math.max(...allPts.map((p) => p.risk), 1);
  const maxImpact = Math.max(...allPts.map((p) => p.impact), 1);

  const svgW = 500;
  const svgH = 320;
  const pad = { top: 20, right: 20, bottom: 45, left: 55 };
  const cw = svgW - pad.left - pad.right;
  const ch = svgH - pad.top - pad.bottom;

  const sx = (v: number) => pad.left + (v / maxRisk) * cw;
  const sy = (v: number) => pad.top + ch - (v / maxImpact) * ch;

  const frontierPath = frontier.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.risk)} ${sy(p.impact)}`).join(" ");

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Efficient Frontier</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
        Risk vs return — the frontier shows the best possible return for each risk level.
      </p>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.left} y1={sy(f * maxImpact)} x2={pad.left + cw} y2={sy(f * maxImpact)} stroke="var(--border)" strokeWidth={0.5} />
            <line x1={sx(f * maxRisk)} y1={pad.top} x2={sx(f * maxRisk)} y2={pad.top + ch} stroke="var(--border)" strokeWidth={0.5} />
          </g>
        ))}

        <text x={pad.left + cw / 2} y={svgH - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
          Risk Score
        </text>
        <text x={8} y={pad.top + ch / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={10} transform={`rotate(-90, 8, ${pad.top + ch / 2})`}>
          Total Impact (M SAR)
        </text>

        {/* Random portfolios as dots */}
        {randoms.map((p, i) => (
          <circle key={i} cx={sx(p.risk)} cy={sy(p.impact)} r={2} fill="var(--text-muted)" opacity={0.25} />
        ))}

        {/* Frontier */}
        <path d={frontierPath} fill="none" stroke="var(--emerald)" strokeWidth={2} />
        {frontier.map((p, i) => (
          <circle key={i} cx={sx(p.risk)} cy={sy(p.impact)} r={3} fill="var(--emerald)" />
        ))}

        {/* Area under frontier */}
        <path
          d={`${frontierPath} L ${sx(frontier[frontier.length - 1].risk)} ${sy(0)} L ${sx(0)} ${sy(0)} Z`}
          fill="var(--emerald)" opacity={0.04}
        />

        {myResult && (
          <g>
            <circle cx={sx(myResult.risk)} cy={sx(myResult.impact)} r={6} fill="var(--gold)" stroke="var(--bg-primary)" strokeWidth={2} />
            <text x={sx(myResult.risk) + 10} y={sx(myResult.impact) - 8} fill="var(--gold)" fontSize={9} fontWeight={600}>
              MY ALLOCATION
            </text>
          </g>
        )}
      </svg>

      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        Gray dots = random allocations. Green line = efficient frontier. Your allocation above the frontier is impossible; below means inefficiency.
      </div>
    </div>
  );
}
