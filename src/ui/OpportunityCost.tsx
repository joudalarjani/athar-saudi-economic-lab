import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { computeOpportunityCostBreakdown } from "../engine";

export function OpportunityCost() {
  const amounts = useStore((s) => s.amounts);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  if (total === 0) return null;

  const breakdown = computeOpportunityCostBreakdown(amounts);
  const sectorsWithImpact = breakdown.filter((b) => b.lostImpact > 0);

  if (sectorsWithImpact.length === 0) return null;

  const maxLost = Math.max(...sectorsWithImpact.map((b) => b.lostImpact), 1);

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <h4 style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>Opportunity Cost</h4>
      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        What you gave up by not allocating to these sectors
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {sectorsWithImpact.map((item) => {
          const sec = SECTORS.find((s) => s.id === item.sector);
          if (!sec) return null;
          const barWidth = (item.lostImpact / maxLost) * 100;

          return (
            <div key={item.sector}>
              <div className="flex-between" style={{ fontSize: "0.7rem", marginBottom: "0.15rem" }}>
                <span>{sec.nameAr}</span>
                <span className="mono" style={{ color: "var(--gold)" }}>
                  -{item.lostImpact.toFixed(1)} impact
                </span>
              </div>
              <div className="meter-bar">
                <div
                  className="fill"
                  style={{
                    width: `${barWidth}%`,
                    background: "var(--gold)",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        Total opportunity cost: <span className="mono" style={{ color: "var(--gold)" }}>
          {sectorsWithImpact.reduce((s, b) => s + b.lostImpact, 0).toFixed(1)}
        </span>
        {" "}impact units across {sectorsWithImpact.length} unfunded sectors
      </div>
    </div>
  );
}
