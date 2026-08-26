import { useStore } from "../store/useStore";
import { SECTORS } from "../data/sectors.db";
import { SectorSlider } from "../ui/SectorSlider";
import { CapitalFlow } from "../ui/CapitalFlow";
import { DiminishingReturns } from "../ui/DiminishingReturns";
import { OpportunityCost } from "../ui/OpportunityCost";
import { MetricsPanel } from "../ui/MetricsPanel";
import { SECTOR_DATA } from "../data/sectors.athar";
import { EvidenceChip } from "../ui/EvidenceChip";
import { BUDGET } from "../data/types";

export function AllocationLab() {
  const amounts = useStore((s) => s.amounts);
  const results = useStore((s) => s.results);
  const setAmount = useStore((s) => s.setAmount);
  const resetAmounts = useStore((s) => s.resetAmounts);
  const setPhase = useStore((s) => s.setPhase);
  const year = useStore((s) => s.year);
  const setYear = useStore((s) => s.setYear);

  const totalAllocated = Object.values(amounts).reduce((s, v) => s + v, 0);
  const remaining = BUDGET - totalAllocated;

  return (
    <div className="phase-container">
      <div className="section-pad">
        {/* Header */}
        <div className="section-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "0.25rem", color: "var(--gold)" }}>التجربة التفاعلية</h2>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Allocate your 100M SAR across sectors. Watch how your decisions create impact.
          </p>
        </div>

        {/* Budget Status */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div className="card card-sm" style={{ textAlign: "center", minWidth: 140 }}>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Budget</div>
            <div className="mono" style={{ fontSize: "1.2rem", color: "var(--gold)" }}>100M</div>
          </div>
          <div className="card card-sm" style={{ textAlign: "center", minWidth: 140, borderColor: remaining > 0 ? "rgba(212,160,23,0.3)" : "var(--border)" }}>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Remaining</div>
            <div className="mono" style={{ fontSize: "1.2rem", color: remaining > 0 ? "var(--gold)" : "var(--emerald)" }}>
              {(remaining / 1_000_000).toFixed(1)}M
            </div>
          </div>
        </div>

        {/* Capital Flow */}
        <CapitalFlow />

        {/* Metrics Panel */}
        <MetricsPanel />

        {/* Time Selector */}
        <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            Time Horizon
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            {([0, 1, 3, 5, 10] as const).map((t) => (
              <button
                key={t}
                className="btn-outline"
                style={{
                  borderColor: year === t ? "var(--gold)" : undefined,
                  color: year === t ? "var(--gold)" : undefined,
                  fontSize: "0.75rem",
                }}
                onClick={() => setYear(t)}
              >
                Year {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sector Allocation Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {SECTORS.map((sec) => {
            const sectorData = SECTOR_DATA.find((d) => d.sectorId === sec.id);
            return (
              <div className="card" key={sec.id}>
                <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{sec.nameAr}</span>
                    <span className="dim" style={{ fontSize: "0.75rem", marginLeft: "0.5rem" }}>{sec.nameEn}</span>
                  </div>
                  {sectorData && (
                    <EvidenceChip evidence={{
                      source: sectorData.SROI_source,
                      year: sectorData.SROI_year,
                      method: "SROI estimate",
                      unit: "ratio",
                      tier: sectorData.evidence_type === "VERIFIED" ? "VERIFIED" :
                            sectorData.evidence_type === "CASE_STUDY" ? "CASE_STUDY" :
                            sectorData.evidence_type === "ESTIMATE" ? "ESTIMATE" : "SIM_ASSUMPTION",
                    }} compact />
                  )}
                </div>

                <SectorSlider
                  sector={sec}
                  amount={amounts[sec.id]}
                  onChange={(v) => setAmount(sec.id, v)}
                  impactScore={results.impact[sec.id]}
                />

                {/* Sector-specific metrics */}
                <div style={{ marginTop: "0.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem", fontSize: "0.65rem" }}>
                  <div>
                    <span className="dim">SROI: </span>
                    <span className="mono" style={{ color: "var(--emerald)" }}>{results.sroi[sec.id].toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="dim">Multiplier: </span>
                    <span className="mono" style={{ color: "var(--blue)" }}>{results.totalMultiplier[sec.id].toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="dim">Jobs: </span>
                    <span className="mono">{results.jobs[sec.id].toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="dim">Risk: </span>
                    <span className="mono" style={{ color: results.risk.sectorRisks[sec.id] > 0.05 ? "var(--amber)" : "var(--text-muted)" }}>
                      {(results.risk.sectorRisks[sec.id] * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diminishing Returns */}
        <DiminishingReturns />

        {/* Opportunity Cost */}
        <OpportunityCost />

        {/* SROI vs Multiplier Explanation */}
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "3px solid var(--emerald)" }}>
          <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>SROI ≠ Keynesian Multiplier</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", fontSize: "0.75rem" }}>
            <div>
              <div style={{ color: "var(--emerald)", fontWeight: 600, marginBottom: "0.25rem" }}>SROI (Social Return on Investment)</div>
              <div className="dim">Measures: Social value created per 1 SAR invested</div>
              <div className="dim">Unit: Ratio (e.g., 3.5x = 3.5 SAR social value per 1 SAR)</div>
              <div className="dim">Includes: Monetized social outcomes (health, education, participation)</div>
              <div className="dim">Key: Allocation-dependent due to diminishing returns</div>
            </div>
            <div>
              <div style={{ color: "var(--blue)", fontWeight: 600, marginBottom: "0.25rem" }}>Keynesian Multiplier</div>
              <div className="dim">Measures: GDP flow per 1 SAR of government spending</div>
              <div className="dim">Unit: Ratio (e.g., 1.15 = 1.15 SAR GDP per 1 SAR spent)</div>
              <div className="dim">Includes: Direct + indirect (supply chain) + induced (consumption)</div>
              <div className="dim">Key: Different sectors have different multiplier effects</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button className="btn-outline" onClick={resetAmounts} style={{ marginRight: "1rem" }}>
            Reset
          </button>
          <button className="btn-primary" onClick={() => setPhase("scenarios")}>
            Compare Scenarios
          </button>
        </div>
      </div>
    </div>
  );
}
