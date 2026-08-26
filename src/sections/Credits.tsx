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
        <div
          style={{
            fontSize: "1.3rem",
            fontWeight: 500,
            lineHeight: 1.8,
            marginBottom: "3rem",
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            الاقتصاد ليس مجرد أرقام.
          </div>
          <div style={{ marginBottom: "1rem" }}>
            إنه قرارات، ومفاضلات، وتكاليف، وآثار.
          </div>
          <div style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 600 }}>
            Every allocation is a choice.
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", marginTop: "2rem" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase" }}>
            Built by
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Joud Abdullah Al-Arjani
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Economics Student
          </div>
          <a
            href="https://www.linkedin.com/in/joud-al-arjani"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--emerald-light)",
              textDecoration: "none",
              fontSize: "0.85rem",
              borderBottom: "1px solid var(--emerald-dim)",
              paddingBottom: "1px",
            }}
          >
            linkedin.com/in/joud-al-arjani
          </a>
        </div>

        <div style={{ marginTop: "2.5rem" }}>
          <button className="btn-outline" onClick={handleRestart}>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};
