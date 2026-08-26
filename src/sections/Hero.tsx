import { useStore } from "../store/useStore";
import type { SectorId } from "../data/types";
import { SECTORS } from "../data/sectors.db";

const FEATURES = [
  { icon: "🧮", label: "Economic Modeling", desc: "SROI + Multiplier analysis" },
  { icon: "📊", label: "Scenario Comparison", desc: "4 policy scenarios compared" },
  { icon: "⚖️", label: "Trade-off Analysis", desc: "Gain vs loss for every decision" },
  { icon: "📖", label: "Methodology First", desc: "All data sourced and transparent" },
  { icon: "🎯", label: "Policy Brief", desc: "Actionable recommendations" },
];

const INVESTIGATOR_FLOW = [
  "01 THE QUESTION",
  "02 THE EVIDENCE",
  "03 THE MECHANISM",
  "04 THE MODEL",
  "05 THE SCENARIOS",
  "06 THE TRADE-OFF",
  "07 THE POLICY",
  "08 THE IMPACT",
  "09 MY THESIS",
];

const SECTOR_ICONS: Record<SectorId, string> = {
  education: "🎓",
  healthcare: "🏥",
  housing: "🏠",
  employment: "💼",
  women_empowerment: "👩",
  environment: "🌿",
  community: "🤝",
  hajj: "🕋",
};

export function Hero() {
  const setPhase = useStore((s) => s.setPhase);

  return (
    <div className="hero-wrapper" style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem" }}>
        <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>
          ATHAR | أثر
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Saudi Social Investment Lab
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: "1rem" }}>
          Interactive Economic Policy Lab
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.5rem", color: "var(--text)" }}>
          <span style={{ color: "var(--primary)" }}>100M SAR</span> — How Would You Allocate It?
        </h1>

        <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "var(--text-muted)", maxWidth: 680, marginBottom: "2rem" }}>
          Explore the economic impact of social investment across <strong style={{ color: "var(--text)" }}>8 sectors</strong> and <strong style={{ color: "var(--text)" }}>9 policy scenarios</strong>. See where each SAR creates the most jobs, growth, and social return.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
          {SECTORS.map((s) => (
            <span key={s.id} className="evidence-chip" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
              {SECTOR_ICONS[s.id]} {s.nameEn}
            </span>
          ))}
        </div>

        <div className="sub-card" style={{ padding: "1.5rem", marginBottom: "2rem", maxWidth: 700 }}>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.75rem" }}>
            How This Works
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
            {INVESTIGATOR_FLOW.map((step) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>
                  {step.split(" ")[0]}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {step.split(" ").slice(1).join(" ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="cta-button" style={{ maxWidth: 300 }} onClick={() => setPhase("question")}>
          Begin the Investigation →
        </button>

        <div style={{ marginTop: "3rem" }}>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.75rem" }}>
            Built for Policy Analysis
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {FEATURES.map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{f.icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{f.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Built by <a href="https://www.linkedin.com/in/joud-al-arjani" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>Joud Al-Arjani</a>
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          Economic Policy Lab · Educational Use
        </span>
      </footer>
    </div>
  );
}
