import { useState } from "react";
import { useStore } from "../store/useStore";
import { SROITimeline } from "../ui/charts/SROITimeline";
import { PPFChart } from "../ui/charts/PPFChart";
import { EquityEfficiency } from "../ui/charts/EquityEfficiency";
import { EfficientFrontier } from "../ui/charts/EfficientFrontier";
import { RegionalAllocation } from "../ui/charts/RegionalAllocation";
import { CapitalStackBuilder } from "../ui/CapitalStackBuilder";
import { SensitivityTornado } from "../ui/charts/SensitivityTornado";

const TABS = [
  { id: "sroi", label: "SROI Timeline" },
  { id: "ppf", label: "PPF" },
  { id: "equity", label: "Equity vs Efficiency" },
  { id: "frontier", label: "Efficient Frontier" },
  { id: "regional", label: "Regional" },
  { id: "stack", label: "Capital Stack" },
  { id: "sensitivity", label: "Sensitivity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Analysis() {
  const [activeTab, setActiveTab] = useState<TabId>("sroi");
  const setPhase = useStore((s) => s.setPhase);

  return (
    <div className="phase-container">
      <div className="section-pad">
        <div className="section-header" style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h2>Advanced Analysis</h2>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Explore trade-offs, frontiers, sensitivity, and regional dynamics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          gap: "0.25rem",
          overflowX: "auto",
          marginBottom: "1.5rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid var(--border)",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: activeTab === tab.id ? "var(--emerald-light)" : "var(--text-secondary)",
                background: activeTab === tab.id ? "var(--emerald-dim)" : "transparent",
                border: `1px solid ${activeTab === tab.id ? "var(--emerald)" : "transparent"}`,
                transition: "all 180ms ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ minHeight: 400 }}>
          {activeTab === "sroi" && <SROITimeline />}
          {activeTab === "ppf" && <PPFChart />}
          {activeTab === "equity" && <EquityEfficiency />}
          {activeTab === "frontier" && <EfficientFrontier />}
          {activeTab === "regional" && <RegionalAllocation />}
          {activeTab === "stack" && <CapitalStackBuilder />}
          {activeTab === "sensitivity" && <SensitivityTornado />}
        </div>

        {/* Actions */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="btn-outline" onClick={() => setPhase("optimize")} style={{ marginRight: "1rem" }}>
            Back to Optimization
          </button>
          <button className="btn-primary" onClick={() => setPhase("stress")}>
            Stress Test
          </button>
        </div>
      </div>
    </div>
  );
}
