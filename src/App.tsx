import { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import { BUDGET } from "./data/types";
import { Hero } from "./sections/Hero";
import { AllocationLab } from "./sections/AllocationLab";
import { Optimization } from "./sections/Optimization";
import { Analysis } from "./sections/Analysis";
import { StressTest } from "./sections/StressTest";
import { DefendPolicy } from "./sections/DefendPolicy";
import { PolicyReview } from "./sections/PolicyReview";
import { PolicyBrief } from "./sections/PolicyBrief";
import { Credits } from "./sections/Credits";
import { LabScene } from "./three/LabScene";
import { LabFallback2D } from "./three/LabFallback2D";

const PHASES = [
  { id: "hero" as const, label: "Start" },
  { id: "lab" as const, label: "Allocate" },
  { id: "optimize" as const, label: "Optimize" },
  { id: "analysis" as const, label: "Analysis" },
  { id: "stress" as const, label: "Stress Test" },
  { id: "defend" as const, label: "Defend" },
  { id: "review" as const, label: "Review" },
  { id: "brief" as const, label: "Brief" },
  { id: "credits" as const, label: "Done" },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function App() {
  const phase = useStore((s) => s.phase);
  const setPhase = useStore((s) => s.setPhase);
  const year = useStore((s) => s.year);
  const amounts = useStore((s) => s.amounts);
  const isMobile = useIsMobile();

  const totalAllocated = Object.values(amounts).reduce((s, v) => s + v, 0);
  const remaining = BUDGET - totalAllocated;

  return (
    <div className="app-shell">
      {phase !== "hero" && (
        <>
          <nav className="nav-bar">
            {PHASES.map((p) => (
              <button
                key={p.id}
                className={phase === p.id ? "active" : ""}
                onClick={() => setPhase(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>

          {phase === "lab" && (
            <div style={{ padding: "0 1.5rem", paddingTop: "0.5rem" }}>
              {isMobile ? <LabFallback2D /> : <LabScene />}
            </div>
          )}
        </>
      )}

      {phase === "hero" && <Hero />}
      {phase === "lab" && <AllocationLab />}
      {phase === "optimize" && <Optimization />}
      {phase === "analysis" && <Analysis />}
      {phase === "stress" && <StressTest />}
      {phase === "defend" && <DefendPolicy />}
      {phase === "review" && <PolicyReview />}
      {phase === "brief" && <PolicyBrief />}
      {phase === "credits" && <Credits />}

      {phase !== "hero" && phase !== "credits" && (
        <div className="signature-bar">
          <span>Joud — Economic Policy Lab</span>
          <span className="mono">
            Year {year} · Remaining {(remaining / 1_000_000).toFixed(1)}M
          </span>
        </div>
      )}
    </div>
  );
}
