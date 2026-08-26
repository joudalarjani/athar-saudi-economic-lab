import { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import { BUDGET } from "./data/types";
import { Hero } from "./sections/Hero";
import { TheQuestion } from "./sections/TheQuestion";
import { TheEvidence } from "./sections/TheEvidence";
import { TheMechanism } from "./sections/TheMechanism";
import { AllocationLab } from "./sections/AllocationLab";
import { TheScenarios } from "./sections/TheScenarios";
import { TheTradeOff } from "./sections/TheTradeOff";
import { PolicyReview } from "./sections/PolicyReview";
import { PolicyBrief } from "./sections/PolicyBrief";
import { MyThesis } from "./sections/MyThesis";
import { About } from "./sections/About";
import { LabScene } from "./three/LabScene";
import { LabFallback2D } from "./three/LabFallback2D";

const PHASES = [
  { id: "hero" as const, label: "Start" },
  { id: "question" as const, label: "01 The Question" },
  { id: "evidence" as const, label: "02 The Evidence" },
  { id: "mechanism" as const, label: "03 The Mechanism" },
  { id: "model" as const, label: "04 The Model" },
  { id: "scenarios" as const, label: "05 The Scenarios" },
  { id: "tradeoff" as const, label: "06 The Trade-off" },
  { id: "policy" as const, label: "07 The Policy" },
  { id: "impact" as const, label: "08 The Impact" },
  { id: "thesis" as const, label: "09 My Thesis" },
  { id: "about" as const, label: "About" },
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

          {phase === "model" && (
            <div style={{ padding: "0 1.5rem", paddingTop: "0.5rem" }}>
              {isMobile ? <LabFallback2D /> : <LabScene />}
            </div>
          )}
        </>
      )}

      {phase === "hero" && <Hero />}
      {phase === "question" && <TheQuestion />}
      {phase === "evidence" && <TheEvidence />}
      {phase === "mechanism" && <TheMechanism />}
      {phase === "model" && <AllocationLab />}
      {phase === "scenarios" && <TheScenarios />}
      {phase === "tradeoff" && <TheTradeOff />}
      {phase === "policy" && <PolicyReview />}
      {phase === "impact" && <PolicyBrief />}
      {phase === "thesis" && <MyThesis />}
      {phase === "about" && <About />}

      {phase !== "hero" && phase !== "about" && (
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
