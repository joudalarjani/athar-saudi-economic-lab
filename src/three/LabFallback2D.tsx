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
      background: "radial-gradient(ellipse at center, #0d1210 0%, #070a0c 100%)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)",
    }}>
      {/* Central core visualization */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(25,135,84,${0.3 + (total / BUDGET) * 0.4}) 0%, rgba(25,135,84,0.05) 70%)`,
          border: "2px solid var(--emerald)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
        }}>
          <div className="mono" style={{ fontSize: "0.75rem", color: "var(--emerald-light)" }}>
            {((1 - total / BUDGET) * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Capital Remaining
        </div>
      </div>

      {/* Sector nodes as a radial layout */}
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
                  ? `radial-gradient(circle, rgba(25,135,84,${0.2 + ratio * 0.5}) 0%, rgba(25,135,84,0.05) 70%)`
                  : "radial-gradient(circle, rgba(30,41,45,0.3) 0%, transparent 70%)",
                border: `1.5px solid ${isActive ? "var(--emerald)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 300ms ease",
              }}>
                <span className="mono" style={{ fontSize: "0.5rem", color: isActive ? "var(--emerald-light)" : "var(--text-muted)" }}>
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
