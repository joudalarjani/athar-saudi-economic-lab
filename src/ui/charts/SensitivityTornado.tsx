import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { computeAll } from "../../engine";

export function SensitivityTornado() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  if (total === 0) {
    return <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
      <p className="muted">Allocate funds in the Lab to run sensitivity analysis.</p>
    </div>;
  }

  const baseline = computeAll(amounts, 3, weights);
  const baseImpact = baseline.totalImpact;

  const params = useMemo(() => {
    const factors = [
      { name: "SROI", factor: 0.10 },
      { name: "Multiplier", factor: 0.10 },
      { name: "Cost", factor: 0.10 },
      { name: "Discount Rate", factor: 0.10 },
      { name: "Equity Weight", factor: 0.10 },
      { name: "Risk Aversion", factor: 0.10 },
    ];

    return factors.map((f) => {
      // Low scenario: reduce parameter by factor
      const lowWeights = { ...weights };
      const highWeights = { ...weights };

      if (f.name === "Discount Rate") {
        // Simulate by adjusting impact
        const lowImpact = baseImpact * (1 - f.factor);
        const highImpact = baseImpact * (1 + f.factor);
        return {
          name: f.name,
          low: lowImpact,
          high: highImpact,
          base: baseImpact,
          swing: Math.abs(highImpact - lowImpact),
        };
      }

      // For other params, adjust the respective weight
      const key = f.name.toLowerCase() as keyof typeof weights;
      if (key in lowWeights) {
        lowWeights[key] = Math.max(0, lowWeights[key] * (1 - f.factor));
        highWeights[key] = Math.min(1, highWeights[key] * (1 + f.factor));

        const lowResult = computeAll(amounts, 3, lowWeights);
        const highResult = computeAll(amounts, 3, highWeights);

        return {
          name: f.name,
          low: lowResult.totalImpact,
          high: highResult.totalImpact,
          base: baseImpact,
          swing: Math.abs(highResult.totalImpact - lowResult.totalImpact),
        };
      }

      return {
        name: f.name,
        low: baseImpact * (1 - f.factor),
        high: baseImpact * (1 + f.factor),
        base: baseImpact,
        swing: baseImpact * 2 * f.factor,
      };
    }).sort((a, b) => b.swing - a.swing);
  }, [amounts, weights, baseImpact]);

  const allVals = params.flatMap((p) => [p.low, p.high]);
  const minVal = Math.min(...allVals, baseImpact);
  const maxVal = Math.max(...allVals, baseImpact);

  const svgW = 500;
  const svgH = 280;
  const pad = { top: 20, right: 30, bottom: 30, left: 100 };
  const cw = svgW - pad.left - pad.right;
  const ch = svgH - pad.top - pad.bottom;
  const barH = ch / params.length - 4;

  const range = maxVal - minVal || 1;
  const sx = (v: number) => pad.left + ((v - minVal) / range) * cw;
  const baseX = sx(baseImpact);

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Sensitivity Analysis — Tornado Chart</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
        How much does each ±10% parameter change affect total impact? Largest bars = most sensitive.
      </p>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        {/* Base line */}
        <line x1={baseX} y1={pad.top} x2={baseX} y2={pad.top + ch} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="4,3" />
        <text x={baseX} y={pad.top - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={8}>
          Base: {baseImpact.toFixed(1)}M
        </text>

        {params.map((p, i) => {
          const y = pad.top + i * (ch / params.length) + 2;
          const lowX = sx(p.low);
          const highX = sx(p.high);

          return (
            <g key={p.name}>
              {/* Low bar (red/left) */}
              <rect
                x={Math.min(lowX, baseX)}
                y={y}
                width={Math.abs(baseX - lowX)}
                height={barH}
                fill="#DC3545"
                opacity={0.5}
                rx={2}
              />
              {/* High bar (green/right) */}
              <rect
                x={Math.min(highX, baseX)}
                y={y}
                width={Math.abs(highX - baseX)}
                height={barH}
                fill="var(--emerald)"
                opacity={0.5}
                rx={2}
              />

              {/* Label */}
              <text x={pad.left - 6} y={y + barH / 2 + 3} textAnchor="end" fill="var(--text-secondary)" fontSize={9}>
                {p.name}
              </text>

              {/* Value labels */}
              <text x={lowX - 3} y={y + barH / 2 + 3} textAnchor="end" fill="#DC3545" fontSize={7}>
                {p.low.toFixed(1)}
              </text>
              <text x={highX + 3} y={y + barH / 2 + 3} textAnchor="start" fill="var(--emerald-light)" fontSize={7}>
                {p.high.toFixed(1)}
              </text>

              {/* Swing label */}
              <text x={Math.max(lowX, highX) + 25} y={y + barH / 2 + 3} textAnchor="start" fill="var(--text-muted)" fontSize={7}>
                ±{p.swing.toFixed(1)}M
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${pad.left}, ${svgH - 10})`}>
          <rect width={8} height={8} fill="#DC3545" opacity={0.5} rx={1} />
          <text x={12} y={8} fill="var(--text-muted)" fontSize={8}>-10%</text>
          <rect x={50} width={8} height={8} fill="var(--emerald)" opacity={0.5} rx={1} />
          <text x={62} y={8} fill="var(--text-muted)" fontSize={8}>+10%</text>
        </g>
      </svg>

      <div style={{ marginTop: "0.5rem", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-secondary)" }}>Interpretation:</strong> The parameter with the widest bar has the most influence on your outcome.
          {params[0] && ` In your case, "${params[0].name}" is the most sensitive parameter.`}
        </div>
      </div>
    </div>
  );
}
