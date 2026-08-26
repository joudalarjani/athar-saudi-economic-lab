import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { computeDiminishingCurve } from "../engine";
import { useState } from "react";

export function DiminishingReturns() {
  const amounts = useStore((s) => s.amounts);
  const [selectedSector, setSelectedSector] = useState<string>(SECTORS[0].id);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const sec = SECTORS.find((s) => s.id === selectedSector);
  if (!sec) return null;

  const curve = computeDiminishingCurve(sec, 60_000_000, 20);
  const currentAlloc = amounts[sec.id];
  const currentPoint = curve.find((p) => Math.abs(p.allocation - currentAlloc) < 3_000_000) || curve[0];

  const svgWidth = 500;
  const svgHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const maxImpact = Math.max(...curve.map((p) => p.impact), 1);
  const maxAlloc = 60_000_000;

  const points = curve.map((p) => ({
    x: padding.left + (p.allocation / maxAlloc) * chartWidth,
    y: padding.top + chartHeight - (p.impact / maxImpact) * chartHeight,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const currentX = padding.left + (currentAlloc / maxAlloc) * chartWidth;
  const currentY = padding.top + chartHeight - (currentPoint.impact / maxImpact) * chartHeight;

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="flex-between" style={{ marginBottom: "0.75rem" }}>
        <h4 style={{ fontSize: "0.85rem" }}>Diminishing Marginal Returns</h4>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          style={{
            background: "var(--bg-hover)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            padding: "0.25rem 0.5rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.75rem",
          }}
        >
          {SECTORS.map((s) => (
            <option key={s.id} value={s.id}>{s.nameAr}</option>
          ))}
        </select>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - frac)}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight * (1 - frac)}
            stroke="var(--border)"
            strokeWidth={0.5}
          />
        ))}

        {/* Curve */}
        <path d={pathD} fill="none" stroke="var(--emerald)" strokeWidth={2} />

        {/* Area under curve */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`}
          fill="var(--emerald)"
          opacity={0.08}
        />

        {/* Current allocation point */}
        <circle cx={currentX} cy={currentY} r={4} fill="var(--emerald-light)" />
        <line x1={currentX} y1={currentY} x2={currentX} y2={padding.top + chartHeight} stroke="var(--emerald)" strokeWidth={1} strokeDasharray="3,3" />

        {/* Labels */}
        <text x={padding.left + chartWidth / 2} y={svgHeight - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
          Allocation (SAR)
        </text>
        <text x={5} y={padding.top + chartHeight / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={10} transform={`rotate(-90, 5, ${padding.top + chartHeight / 2})`}>
          Impact
        </text>

        {/* Current value label */}
        <text x={currentX} y={currentY - 8} textAnchor="middle" fill="var(--emerald-light)" fontSize={9} fontWeight={600}>
          {currentPoint.impact.toFixed(1)}
        </text>
      </svg>

      <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        Current allocation: <span className="mono" style={{ color: "var(--emerald-light)" }}>
          {(currentAlloc / 1_000_000).toFixed(1)}M
        </span>
        {" "}| Marginal return: <span className="mono" style={{ color: currentPoint.marginalImpact < 0.5 ? "var(--amber)" : "var(--text-primary)" }}>
          {currentPoint.marginalImpact.toFixed(2)}
        </span>
        {currentPoint.marginalImpact < 0.3 && (
          <span style={{ color: "var(--amber)", marginLeft: 8 }}>⚠ Low marginal return</span>
        )}
      </div>
    </div>
  );
}
