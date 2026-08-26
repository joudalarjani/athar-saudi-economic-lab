import { useStore } from "../store/useStore";

const problems = [
  {
    title: "Youth Unemployment",
    value: "28.7%",
    source: "GASTAT Q4 2025",
    description: "Saudi youth aged 20-29 face unemployment rates nearly 4x the national average. Social investment is a key lever to address this structural challenge.",
  },
  {
    title: "SME Financing Gap",
    value: "~SAR 200B",
    source: "SAMA Financial Stability Report 2024",
    description: "Small and medium enterprises contribute 35% of GDP but face persistent credit constraints that limit growth and job creation potential.",
  },
  {
    title: "Social Spending Efficiency",
    value: "0.62",
    source: "Ministry of Finance Spending Review 2024",
    description: "For every SAR 1 spent on social programs, only SAR 0.62 translates into measurable social outcomes — indicating significant room for optimization.",
  },
  {
    title: "Income Inequality",
    value: "Gini 0.45",
    source: "World Bank Saudi Country Report 2023",
    description: "Regional and demographic income disparities persist. Northern regions lag behind major urban centers by 35% in household income.",
  },
];

export function TheQuestion() {
  const setPhase = useStore((s) => s.setPhase);

  return (
    <section className="section-card" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">01 — THE QUESTION</span>
        <h2 className="section-title">What Problem Are We Solving?</h2>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Saudi Arabia's social investment ecosystem is vast — billions in annual allocation across education, health, housing, employment, and social services. But the fundamental question remains:
        </p>
        <blockquote style={{
          borderLeft: "3px solid var(--primary)",
          paddingLeft: "1.5rem",
          fontSize: "1.4rem",
          fontStyle: "italic",
          color: "var(--text)",
          marginBottom: "2rem",
        }}>
          "How can we allocate limited resources to maximize social impact per SAR spent?"
        </blockquote>
      </div>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--text)" }}>The Evidence Base</h3>

      <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {problems.map((p) => (
          <div key={p.title} className="sub-card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "0.5rem" }}>
              {p.source}
            </div>
            <div className="mono" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.5rem" }}>
              {p.value}
            </div>
            <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.5rem", color: "var(--text)" }}>
              {p.title}
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
              {p.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button className="cta-button" onClick={() => setPhase("evidence")}>
          Explore the Data →
        </button>
      </div>
    </section>
  );
}
