import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";

export function MetricsPanel() {
  const amounts = useStore((s) => s.amounts);
  const results = useStore((s) => s.results);
  const year = useStore((s) => s.year);

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const totalDirect = Object.values(results.directGDP).reduce((s, v) => s + v, 0);
  const totalIndirect = Object.values(results.indirectGDP).reduce((s, v) => s + v, 0);
  const totalInduced = Object.values(results.inducedGDP).reduce((s, v) => s + v, 0);
  const totalGDP = totalDirect + totalIndirect + totalInduced;
  const overallMultiplier = totalDirect > 0 ? totalGDP / totalDirect : 0;

  const weightedSROI = SECTORS.reduce((s, sec) => {
    const alloc = amounts[sec.id];
    if (alloc <= 0) return s;
    const secSROI = results.sroi[sec.id];
    return s + (alloc / total) * secSROI;
  }, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
      {/* Direct Social Impact */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Direct Social Impact
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", color: "var(--emerald-light)", marginTop: "0.25rem" }}>
          {results.totalImpact.toFixed(1)}
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Weighted impact units across all sectors
        </div>
      </div>

      {/* SROI */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          SROI (Weighted Average)
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", color: "var(--emerald-light)", marginTop: "0.25rem" }}>
          {weightedSROI.toFixed(2)}x
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Social value per 1 SAR invested
        </div>
      </div>

      {/* Keynesian Multiplier */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Keynesian Multiplier
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", color: "var(--blue)", marginTop: "0.25rem" }}>
          {overallMultiplier.toFixed(2)}x
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          GDP output per 1 SAR of spending
        </div>
      </div>

      {/* Economic Impact */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Economic Impact (GDP Flow)
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", marginTop: "0.25rem" }}>
          {(totalGDP / 1_000_000).toFixed(1)}M
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Annual SAR of economic activity
        </div>
      </div>

      {/* Risk */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Portfolio Risk
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", color: results.risk.portfolio > 0.25 ? "var(--red)" : "var(--text-primary)", marginTop: "0.25rem" }}>
          {(results.risk.portfolio * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Weighted sector risk (σ)
        </div>
      </div>

      {/* Resilience */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Resilience Score
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", color: results.resilience < 40 ? "var(--amber)" : "var(--text-primary)", marginTop: "0.25rem" }}>
          {results.resilience.toFixed(1)}
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Out of 100 — shock absorption capacity
        </div>
      </div>

      {/* Equity */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Equity Index
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", marginTop: "0.25rem" }}>
          {(results.equityIndex * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Distribution fairness across sectors
        </div>
      </div>

      {/* Long-term Impact */}
      <div className="card card-sm">
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Long-term Impact (Year {year})
        </div>
        <div className="mono" style={{ fontSize: "1.4rem", color: "var(--emerald-light)", marginTop: "0.25rem" }}>
          {SECTORS.reduce((s, sec) => s + (results.impactTimeSeries[sec.id]?.[year === 0 ? 0 : year === 1 ? 1 : year === 3 ? 2 : year === 5 ? 3 : 4] || 0), 0).toFixed(1)}
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Projected impact at Year {year}
        </div>
      </div>
    </div>
  );
}
