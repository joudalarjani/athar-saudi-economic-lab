import { useStore } from "../../store/useStore";
import { SECTORS } from "../../data/sectors.db";
import { computeAll } from "../../engine";

export function SROITimeline() {
  const amounts = useStore((s) => s.amounts);
  const weights = useStore((s) => s.weights);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
      <p className="muted">Allocate funds in the Lab to see SROI timeline.</p>
    </div>;
  }

  const years = [0, 1, 3, 5, 10];
  const svgW = 600;
  const svgH = 300;
  const pad = { top: 30, right: 120, bottom: 40, left: 60 };
  const cw = svgW - pad.left - pad.right;
  const ch = svgH - pad.top - pad.bottom;

  const colors = ["#20C997", "#3B82F6", "#C9A227", "#DC3545", "#F59E0B", "#8B5CF6", "#EC4899"];

  // Compute SROI for each sector at each year
  const series = SECTORS.map((sec) => {
    const values = years.map((y) => {
      const r = computeAll(amounts, y, weights);
      return r.sroi[sec.id];
    });
    return { sector: sec, values };
  });

  const allValues = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(...allValues, 0);

  const scaleX = (yearIdx: number) => pad.left + (yearIdx / (years.length - 1)) * cw;
  const scaleY = (val: number) => pad.top + ch - ((val - minVal) / (maxVal - minVal || 1)) * ch;

  return (
    <div className="card">
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Dynamic SROI Timeline</h4>
      <p className="dim" style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
        SROI changes over time — some sectors deliver quickly, others take years.
      </p>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const val = minVal + f * (maxVal - minVal);
          return (
            <g key={f}>
              <line x1={pad.left} y1={scaleY(val)} x2={pad.left + cw} y2={scaleY(val)} stroke="var(--border)" strokeWidth={0.5} />
              <text x={pad.left - 8} y={scaleY(val) + 3} textAnchor="end" fill="var(--text-muted)" fontSize={9}>
                {val.toFixed(1)}x
              </text>
            </g>
          );
        })}

        {/* Year labels */}
        {years.map((y, i) => (
          <text key={y} x={scaleX(i)} y={svgH - 10} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
            Year {y}
          </text>
        ))}

        {/* Lines */}
        {series.map((s, si) => {
          const pathD = s.values.map((v, vi) => `${vi === 0 ? "M" : "L"} ${scaleX(vi)} ${scaleY(v)}`).join(" ");
          return (
            <g key={s.sector.id}>
              <path d={pathD} fill="none" stroke={colors[si]} strokeWidth={1.5} opacity={0.8} />
              {s.values.map((v, vi) => (
                <circle key={vi} cx={scaleX(vi)} cy={scaleY(v)} r={3} fill={colors[si]} />
              ))}
            </g>
          );
        })}

        {/* Legend */}
        {series.map((s, si) => (
          <g key={s.sector.id} transform={`translate(${pad.left + cw + 10}, ${pad.top + si * 18})`}>
            <rect width={10} height={10} fill={colors[si]} rx={2} />
            <text x={14} y={9} fill="var(--text-secondary)" fontSize={8}>{s.sector.nameAr}</text>
          </g>
        ))}
      </svg>

      <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        Note: SROI is allocation-dependent. Higher allocation → lower marginal SROI (diminishing returns).
      </div>
    </div>
  );
}
