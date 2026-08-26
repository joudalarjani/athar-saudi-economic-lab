import { useStore } from "../store/useStore";

const skills = [
  { category: "Economic Modeling", items: ["SROI Analysis", "Fiscal Multiplier Estimation", "Scenario Modeling", "Cost-Benefit Analysis"] },
  { category: "Data & Visualization", items: ["Data Visualization", "Interactive Dashboards", "Statistical Analysis", "Research Methodology"] },
  { category: "Policy & Research", items: ["Policy Analysis", "Saudi Economic Research", "Evidence-Based Writing", "Stakeholder Communication"] },
  { category: "Technical", items: ["TypeScript", "React", "Three.js", "Zustand", "Data Engineering"] },
];

export function About() {
  const setPhase = useStore((s) => s.setPhase);

  return (
    <section className="section-card" style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">ABOUT THE RESEARCHER</span>
        <h2 className="section-title">Joud Abdullah Al-Arjani</h2>
        <div style={{ fontSize: "1rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Economics Student · Economic Research & Policy Analysis
        </div>
      </div>

      <div className="sub-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1rem" }}>What I Built</h3>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
          ATHAR | أثر is an interactive economic policy lab that demonstrates how social investment allocation decisions impact employment, GDP, and social outcomes in Saudi Arabia. It combines economic modeling with real-time visualization to make complex trade-offs accessible.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {skills.map((s) => (
            <div key={s.category}>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
                {s.category}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {s.items.map((item) => (
                  <span key={item} className="evidence-chip">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sub-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1rem" }}>About This Project</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", fontSize: "0.9rem" }}>
          <div>
            <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Model Type</div>
            <div style={{ color: "var(--text)", fontWeight: 500 }}>SROI + Keynesian Multiplier</div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Data Sources</div>
            <div style={{ color: "var(--text)", fontWeight: 500 }}>GASTAT, SAMA, MoF, World Bank</div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Scope</div>
            <div style={{ color: "var(--text)", fontWeight: 500 }}>7 Economic Sectors, 2020-2035</div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Built With</div>
            <div style={{ color: "var(--text)", fontWeight: 500 }}>TypeScript, React, Three.js</div>
          </div>
        </div>
      </div>

      <div className="sub-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1rem" }}>Disclaimer</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          This project is an educational and research tool developed by an economics student. All data is sourced from official publications and peer-reviewed literature. Model outputs are simulation results based on stated assumptions — they are not policy recommendations and should not be cited as such. Evidence levels (VERIFIED / CASE_STUDY / ESTIMATE / SIMULATION_ASSUMPTION) are explicitly stated for all metrics.
        </p>
      </div>

      <div className="sub-card" style={{ padding: "2rem", textAlign: "center" }}>
        <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)", marginBottom: "1rem" }}>
          ATHAR | أثر
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Saudi Social Investment & Economic Policy Lab
        </div>
        <a
          href="https://www.linkedin.com/in/joud-al-arjani"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{ display: "inline-block", textDecoration: "none", marginBottom: "1rem" }}
        >
          Connect on LinkedIn →
        </a>
        <div style={{ marginTop: "1rem" }}>
          <button
            className="cta-button secondary"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            onClick={() => setPhase("hero")}
          >
            ← Back to Start
          </button>
        </div>
      </div>
    </section>
  );
}
