import React from "react";
import type { SectorParams } from "../data/types";

interface Props {
  sector: SectorParams;
  amount: number;
  onChange: (amount: number) => void;
  impactScore?: number;
}

export const SectorSlider: React.FC<Props> = ({
  sector,
  amount,
  onChange,
  impactScore,
}) => {
  return (
    <div className="sector-slider">
      <div className="sector-header">
        <span className="sector-name">
          {sector.nameAr} <span className="dim">/ {sector.nameEn}</span>
        </span>
        <span className="sector-amount">
          {(amount / 1_000_000).toFixed(1)}M
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100_000_000}
        step={500_000}
        value={amount}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex-between" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
        <span>{sector.impactUnit}</span>
        {impactScore !== undefined && (
          <span>Impact: {impactScore.toFixed(1)}</span>
        )}
      </div>
    </div>
  );
};
