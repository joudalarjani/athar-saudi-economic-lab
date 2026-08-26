import { useStore } from "../store/useStore";

export function MyThesis() {
  const setPhase = useStore((s) => s.setPhase);
  const results = useStore((s) => s.results);

  return (
    <section className="section-card" style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="section-header">
        <span className="section-tag">09 — MY THESIS</span>
        <h2 className="section-title">Joud's Economic Thesis</h2>
      </div>

      <div style={{ marginBottom: "2.5rem" }}>
        <blockquote style={{
          borderLeft: "3px solid var(--primary)",
          paddingLeft: "1.5rem",
          fontSize: "1.3rem",
          lineHeight: 1.8,
          color: "var(--text)",
          fontStyle: "italic",
          marginBottom: "1.5rem",
        }}>
          "Social investment should not be evaluated only by its immediate fiscal cost, but by its long-term effect on human capital, productivity and household resilience."
        </blockquote>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          As an economics student, I believe that the traditional approach of measuring social programs solely through budget line items misses the broader picture. When SAR 1 is invested in education, it does not simply disappear — it transforms into skills, productivity, income, and eventually GDP growth. The challenge is not whether to invest, but how to invest optimally.
        </div>
      </div>

      <div className="sub-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1.25rem" }}>The Core Argument</h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {[
            { num: "01", text: "Social spending is investment, not consumption. Every SAR spent generates measurable returns through multiplier effects and human capital development." },
            { num: "02", text: "Optimization matters more than increase. The same budget can yield 40-60% higher social returns if allocated based on SROI and multiplier evidence rather than historical precedent." },
            { num: "03", text: "Trade-offs are real and must be explicit. There is no allocation that maximizes everything — policymakers must choose weights and communicate them transparently." },
            { num: "04", text: "Models are tools, not truths. This model simplifies reality — but it forces structured thinking, which is more valuable than intuition alone." },
          ].map((item) => (
            <div key={item.num} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span className="mono" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }}>
                {item.num}
              </span>
              <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {results.totalJobs > 0 && (
        <div className="sub-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "1rem" }}>Your Allocation as Evidence</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1rem" }}>
            Based on your allocation, the model estimates:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div className="mono" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>
                {results.totalJobs.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Jobs Created</div>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div className="mono" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>
                {(results.totalGDP / 1_000_000).toFixed(0)}M
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>GDP Added</div>
            </div>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div className="mono" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)" }}>
                {results.totalImpact.toFixed(0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Impact Score</div>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7, marginTop: "1rem", textAlign: "center" }}>
            This demonstrates that data-driven allocation yields measurable social returns — supporting the thesis that optimization, not just spending, is the key lever.
          </p>
        </div>
      )}

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button className="cta-button" onClick={() => setPhase("about")}>
          About the Researcher →
        </button>
      </div>
    </section>
  );
}
