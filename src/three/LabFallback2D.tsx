import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { BUDGET } from "../data/types";

export function LabFallback2D() {
  const amounts = useStore((s) => s.amounts);
  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  return (
    <div style={{
      width: "100%",
      padding: "1.5rem",
      background: "radial-gradient(ellipse at center, rgba(15,22,41,0.8) 0%, var(--bg-primary) 100%)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)",
    }}>
      {/* Central core visualization */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,160,23,${0.2 + (total / BUDGET) * 0.3}) 0%, rgba(212,160,23,0.03) 70%)`,
          border: "2px solid rgba(212,160,23,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
        }}>
          <div className="mono" style={{ fontSize: "0.75rem", color: "var(--gold)" }}>
            {((1 - total / BUDGET) * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Capital Remaining
        </div>
      </div>

      {/* Sector nodes */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.5rem",
        maxWidth: 400,
        margin: "0 auto",
      }}>
        {SECTORS.map((sec) => {
          const alloc = amounts[sec.id];
          const ratio = alloc / BUDGET;
          const isActive = alloc > 0;

          return (
            <div
              key={sec.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <div style={{
                width: 36 + ratio * 20,
                height: 36 + ratio * 20,
                borderRadius: "50%",
                background: isActive
                  ? `radial-gradient(circle, rgba(212,160,23,${0.15 + ratio * 0.35}) 0%, rgba(212,160,23,0.03) 70%)`
                  : "radial-gradient(circle, rgba(30,41,45,0.3) 0%, transparent 70%)",
                border: `1.5px solid ${isActive ? "rgba(212,160,23,0.4)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 300ms ease",
              }}>
                <span className="mono" style={{ fontSize: "0.5rem", color: isActive ? "var(--gold)" : "var(--text-muted)" }}>
                  {isActive ? `${(ratio * 100).toFixed(0)}%` : "—"}
                </span>
              </div>
              <span style={{ fontSize: "0.55rem", color: "var(--text-muted)", textAlign: "center" }}>
                {sec.nameAr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
