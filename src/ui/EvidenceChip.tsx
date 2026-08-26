import React from "react";
import type { Evidence } from "../data/types";

interface Props {
  evidence: Evidence;
  compact?: boolean;
}

export const EvidenceChip: React.FC<Props> = ({ evidence, compact }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        className={`evidence-chip ${evidence.tier}`}
        style={{ cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
        title={`${evidence.source} (${evidence.year})`}
      >
        {evidence.tier.replace("_", " ")}
      </span>
      {expanded && (
        <span
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            zIndex: 50,
            width: compact ? 240 : 320,
            padding: "0.75rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-active)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.7rem",
            lineHeight: 1.5,
            color: "var(--text-secondary)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <strong style={{ color: "var(--text-primary)" }}>Source:</strong>{" "}
          {evidence.source}
          <br />
          <strong>Year:</strong> {evidence.year}
          <br />
          <strong>Method:</strong> {evidence.method}
          <br />
          <strong>Unit:</strong> {evidence.unit}
          <br />
          <span className={`evidence-chip ${evidence.tier}`} style={{ marginTop: 4 }}>
            {evidence.tier.replace("_", " ")}
          </span>
        </span>
      )}
    </span>
  );
};
