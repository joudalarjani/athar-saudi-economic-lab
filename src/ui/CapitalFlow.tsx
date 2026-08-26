import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";

export function CapitalFlow() {
  const amounts = useStore((s) => s.amounts);
  const results = useStore((s) => s.results);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  const activeSectors = SECTORS.filter((s) => amounts[s.id] > 0);

  if (total === 0) return null;

  const totalDirect = Object.values(results.directGDP).reduce((s, v) => s + v, 0);
  const totalIndirect = Object.values(results.indirectGDP).reduce((s, v) => s + v, 0);
  const totalInduced = Object.values(results.inducedGDP).reduce((s, v) => s + v, 0);

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <h4 style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "var(--gold)" }}>Capital Flow</h4>

      {/* Flow visualization */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>

        {/* Source */}
        <div style={{
          padding: "0.5rem 1rem",
          background: "rgba(212,160,23,0.08)",
          border: "1px solid rgba(212,160,23,0.25)",
          borderRadius: "var(--radius-sm)",
          textAlign: "center",
          minWidth: 100,
        }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>CAPITAL</div>
          <div className="mono" style={{ fontSize: "0.85rem", color: "var(--gold)" }}>
            {(total / 1_000_000).toFixed(0)}M
          </div>
        </div>

        {/* Arrow */}
        <div className="flow-arrow">→</div>

        {/* Sectors */}
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {activeSectors.map((sec) => {
            const pct = total > 0 ? (amounts[sec.id] / total) * 100 : 0;
            return (
              <div
                key={sec.id}
                style={{
                  padding: "0.3rem 0.6rem",
                  background: "rgba(15,22,41,0.6)",
                  border: "1px solid rgba(212,160,23,0.12)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.65rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--gold)",
                  opacity: 0.08,
                  width: `${pct}%`,
                }} />
                <span style={{ position: "relative" }}>{sec.nameAr}</span>
                <span className="mono" style={{ position: "relative", marginLeft: 4, color: "var(--gold)" }}>
                  {(amounts[sec.id] / 1_000_000).toFixed(1)}M
                </span>
              </div>
            );
          })}
        </div>

        <div className="flow-arrow">→</div>

        {/* Impact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{
            padding: "0.3rem 0.6rem",
            background: "rgba(15,22,41,0.6)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.65rem",
          }}>
            <span style={{ color: "var(--text-muted)" }}>Direct </span>
            <span className="mono" style={{ color: "var(--gold)" }}>
              {(totalDirect / 1_000_000).toFixed(1)}M
            </span>
          </div>
          <div style={{
            padding: "0.3rem 0.6rem",
            background: "rgba(15,22,41,0.6)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.65rem",
          }}>
            <span style={{ color: "var(--text-muted)" }}>Indirect </span>
            <span className="mono" style={{ color: "var(--emerald)" }}>
              +{(totalIndirect / 1_000_000).toFixed(1)}M
            </span>
          </div>
          <div style={{
            padding: "0.3rem 0.6rem",
            background: "rgba(15,22,41,0.6)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.65rem",
          }}>
            <span style={{ color: "var(--text-muted)" }}>Induced </span>
            <span className="mono" style={{ color: "var(--emerald-light)" }}>
              +{(totalInduced / 1_000_000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
        Total GDP Flow: <span className="mono" style={{ color: "var(--gold)" }}>
          {((totalDirect + totalIndirect + totalInduced) / 1_000_000).toFixed(1)}M SAR
        </span>
        {" "}|{" "}
        Multiplier: <span className="mono" style={{ color: "var(--gold)" }}>
          {totalDirect > 0 ? ((totalDirect + totalIndirect + totalInduced) / totalDirect).toFixed(2) : "0.00"}x
        </span>
      </div>
    </div>
  );
}
