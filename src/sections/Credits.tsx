import React from "react";
import { useStore } from "../store/useStore";

export const Credits: React.FC = () => {
  const setPhase = useStore((s) => s.setPhase);
  const resetAmounts = useStore((s) => s.resetAmounts);

  const handleRestart = () => {
    resetAmounts();
    setPhase("hero");
  };

  return (
    <div
      className="phase-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 600 }}>
        {/* Quote */}
        <div style={{
          fontSize: "1.3rem",
          fontWeight: 500,
          lineHeight: 1.8,
          marginBottom: "3rem",
          color: "var(--text-secondary)",
        }}>
          <div style={{ marginBottom: "1rem", fontFamily: "'Noto Sans Arabic', var(--font-sans)" }}>
            الاقتصاد ليس مجرد أرقام.
          </div>
          <div style={{ marginBottom: "1rem", fontFamily: "'Noto Sans Arabic', var(--font-sans)" }}>
            إنه قرارات، ومفاضلات، وتكاليف، وآثار.
          </div>
          <div style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 600 }}>
            Every allocation is a choice.
          </div>
        </div>

        {/* Brand */}
        <div style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
          letterSpacing: "0.1em",
        }}>
          <span style={{ color: "var(--gold)" }}>ATHAR</span>
          <span style={{ color: "var(--text-muted)", margin: "0 0.5rem" }}>|</span>
          <span style={{ color: "var(--gold)" }}>أثر</span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", marginTop: "2rem" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase" }}>
            Built by
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--gold)" }}>
            Joud Abdullah Al-Arjani
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Economics Student · Imam Mohammad Ibn Saud Islamic University
          </div>
          <a
            href="https://www.linkedin.com/in/joud-al-arjani"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              color: "var(--gold)",
              textDecoration: "none",
              fontSize: "0.85rem",
              border: "1px solid rgba(212,160,23,0.3)",
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-sm)",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,160,23,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            linkedin.com/in/joud-al-arjani
          </a>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: "2.5rem",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          lineHeight: 1.6,
          maxWidth: 400,
          margin: "2.5rem auto 0",
        }}>
          All calculations come from the Economic Engine. AI provides interpretation only.
          No fabricated data. Evidence levels documented per sector.
          SROI ≠ Keynesian Multiplier. Optimal under selected assumptions, not absolute.
        </div>

        {/* Restart */}
        <div style={{ marginTop: "2rem" }}>
          <button className="btn-outline" onClick={handleRestart}>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};
