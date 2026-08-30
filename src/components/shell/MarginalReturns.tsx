import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { formatNumber, formatSAR } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

/**
 * Sector Marginal Returns — 7 diminishing returns curves
 *
 * Each sector has:
 *   D(x) = D_max × (1 - e^(-λx))
 *
 * Where D_max is the theoretical maximum beneficiaries if the entire
 * budget were allocated to that sector, and λ is the diminishing
 * returns parameter.
 *
 *   D_max = (max_allocation / cost_per_beneficiary) × reach_rate
 *
 * These curves visually answer:
 *   "What does the LAST riyal buy in each sector?"
 *
 * A steep curve = linear returns (sector can absorb more funding)
 * A flat curve = saturates fast (diminishing returns kick in early)
 */

interface CurveData {
  sector: typeof SECTORS[number];
  lambda: number;
  dMax: number;
  points: { x: number; y: number; marginal: number }[];
  currentX: number;
  currentY: number;
  saturationRatio: number;
}

function buildCurve(
  sector: typeof SECTORS[number],
  allocation: number,
  numPoints: number = 50
): CurveData {
  const { value: lambda } = sector.diminishingLambda;
  const { value: costPerBeneficiary } = sector.costPerBeneficiary;
  const reachRate = 0.7;

  const theoreticalMax = sector.maxAllocation / costPerBeneficiary;
  const dMax = theoreticalMax * reachRate;

  const xMax = sector.maxAllocation;
  const points: { x: number; y: number; marginal: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * xMax;
    const y = dMax * (1 - Math.exp(-lambda * x));
    // Marginal = derivative of D(x) = dMax * lambda * e^(-lambda * x)
    const marginal = dMax * lambda * Math.exp(-lambda * x);
    points.push({ x, y, marginal });
  }

  // User's current point
  const currentX = Math.min(allocation, xMax);
  const currentY = dMax * (1 - Math.exp(-lambda * currentX));
  const saturationRatio = currentY / dMax;

  return { sector, lambda, dMax, points, currentX, currentY, saturationRatio };
}

const CHART_W = 280;
const CHART_H = 140;
const PAD_L = 36;
const PAD_R = 8;
const PAD_T = 14;
const PAD_B = 24;

function SectorChart({ data, isSelected }: { data: CurveData; isSelected: boolean }) {
  const { sector, points, currentX, currentY, dMax, saturationRatio } = data;

  const xScale = (x: number) => {
    const w = CHART_W - PAD_L - PAD_R;
    return PAD_L + (x / sector.maxAllocation) * w;
  };

  const yScale = (y: number) => {
    const h = CHART_H - PAD_T - PAD_B;
    return PAD_T + (1 - y / dMax) * h;
  };

  // Build path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(2)} ${yScale(p.y).toFixed(2)}`)
    .join(' ');

  // Find saturation zone (>80% of dMax)
  const saturationX = points.find((p) => p.y >= dMax * 0.8)?.x ?? sector.maxAllocation;

  return (
    <div
      className={`glass-panel p-3 ${
        isSelected ? 'border-gold/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: sector.color }}
          />
          <div className="text-xs text-ivory">{sector.arName}</div>
        </div>
        <div
          className="text-[9px] font-mono"
          style={{ color: sector.color }}
        >
          λ = {data.lambda.toExponential(1)}
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full">
        {/* Background grid */}
        <defs>
          <linearGradient id={`gradient-${sector.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sector.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={sector.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Saturation zone (>80%) */}
        <rect
          x={xScale(saturationX)}
          y={PAD_T}
          width={xScale(sector.maxAllocation) - xScale(saturationX)}
          height={CHART_H - PAD_T - PAD_B}
          fill="rgba(255, 200, 100, 0.05)"
        />
        <line
          x1={xScale(saturationX)}
          y1={PAD_T}
          x2={xScale(saturationX)}
          y2={CHART_H - PAD_B}
          stroke="rgba(255, 200, 100, 0.3)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <text
          x={xScale(saturationX) + 3}
          y={PAD_T + 10}
          fill="rgba(255, 200, 100, 0.6)"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
        >
          80% saturation
        </text>

        {/* Axes */}
        <line
          x1={PAD_L}
          y1={CHART_H - PAD_B}
          x2={CHART_W - PAD_R}
          y2={CHART_H - PAD_B}
          stroke="rgba(199, 160, 74, 0.3)"
          strokeWidth="1"
        />
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={CHART_H - PAD_B}
          stroke="rgba(199, 160, 74, 0.3)"
          strokeWidth="1"
        />

        {/* Filled area under curve */}
        <path
          d={`${pathD} L ${xScale(points[points.length - 1].x)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`}
          fill={`url(#gradient-${sector.id})`}
        />

        {/* Curve */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          d={pathD}
          fill="none"
          stroke={sector.color}
          strokeWidth="1.5"
        />

        {/* Current allocation point */}
        {currentX > 0 && (
          <g>
            {/* Vertical line to current point */}
            <line
              x1={xScale(currentX)}
              y1={yScale(currentY)}
              x2={xScale(currentX)}
              y2={CHART_H - PAD_B}
              stroke="rgba(232, 233, 240, 0.2)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <circle
              cx={xScale(currentX)}
              cy={yScale(currentY)}
              r="3.5"
              fill="#FFD580"
              stroke="#0A0E1A"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Axis labels */}
        <text
          x={PAD_L - 4}
          y={PAD_T - 2}
          fill="rgba(232, 233, 240, 0.4)"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          {formatNumber(dMax, 0)}
        </text>
        <text
          x={PAD_L - 4}
          y={CHART_H - PAD_B + 2}
          fill="rgba(232, 233, 240, 0.4)"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          0
        </text>
        <text
          x={CHART_W - PAD_R}
          y={CHART_H - PAD_B + 12}
          fill="rgba(232, 233, 240, 0.4)"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          {formatSAR(sector.maxAllocation, { compact: true })}
        </text>
      </svg>

      {/* Stats below */}
      <div className="mt-1 grid grid-cols-2 gap-1 text-[9px] font-mono">
        <div>
          <span className="text-ivory/40">Beneficiaries:</span>{' '}
          <span className="text-ivory/80">{formatNumber(currentY)}</span>
        </div>
        <div>
          <span className="text-ivory/40">Saturation:</span>{' '}
          <span
            className={
              saturationRatio > 0.7
                ? 'text-yellow-400'
                : saturationRatio > 0.4
                ? 'text-emerald-400'
                : 'text-blue-400'
            }
          >
            {(saturationRatio * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function MarginalReturns() {
  const allocations = useLabStore((s) => s.allocations);
  const setStage = useLabStore((s) => s.setStage);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const curves = useMemo(
    () => SECTORS.map((s) => buildCurve(s, allocations[s.id] ?? 0)),
    [allocations]
  );

  // Find sectors with highest marginal returns (room to grow)
  const rankedByOpportunity = useMemo(() => {
    return [...curves]
      .filter((c) => c.saturationRatio < 0.6)
      .sort((a, b) => {
        const marginalA = a.dMax * a.lambda * Math.exp(-a.lambda * a.currentX);
        const marginalB = b.dMax * b.lambda * Math.exp(-b.lambda * b.currentX);
        return marginalB - marginalA;
      });
  }, [curves]);

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 11 / Marginal Returns
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            منحنيات العوائد الحدية
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            Diminishing Marginal Returns per sector.
            <br />
            <span className="text-ivory/40 text-xs">
              D(x) = D_max × (1 − e^(−λx)) — كل ريال إضافي يشتري أقل من سابقه.
            </span>
          </p>
        </div>

        {/* Key insight at top */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-5 mb-6"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
                Where to allocate next?
              </div>
              <div className="text-sm text-ivory/80 leading-relaxed">
                القطاعات ذات <span className="text-emerald-300">المساحة المتبقية</span>{' '}
                (saturation &lt; 60%) تعطي عائدًا حدّيًا أعلى للريال الإضافي.
                أولوية لإعادة التخصيص.
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-emerald-400 font-mono mb-2">
                Top Opportunities
              </div>
              <div className="space-y-1">
                {rankedByOpportunity.slice(0, 3).map((c) => (
                  <div
                    key={c.sector.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: c.sector.color }}
                    />
                    <div className="flex-1 text-ivory/80">{c.sector.arName}</div>
                    <div className="font-mono text-emerald-300 text-[10px]">
                      {(c.saturationRatio * 100).toFixed(0)}% مشبع
                    </div>
                  </div>
                ))}
                {rankedByOpportunity.length === 0 && (
                  <div className="text-xs text-ivory/50">
                    كل القطاعات قريبة من التشبع — قلّل التخصيص في بعضها
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7 charts in grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6"
        >
          {curves.map((curve) => (
            <motion.div
              key={curve.sector.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * SECTORS.indexOf(curve.sector) }}
              onMouseEnter={() => setSelectedId(curve.sector.id)}
              onMouseLeave={() => setSelectedId(null)}
              className="cursor-pointer"
            >
              <SectorChart data={curve} isSelected={selectedId === curve.sector.id} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mathematical deep-dive for selected */}
        {selectedId && (() => {
          const curve = curves.find((c) => c.sector.id === selectedId);
          if (!curve) return null;
          const marginalAtCurrent = curve.dMax * curve.lambda * Math.exp(-curve.lambda * curve.currentX);
          const nextRiyalBenefit = marginalAtCurrent / curve.sector.costPerBeneficiary.value;

          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel terminal-border p-5 mb-6"
            >
              <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
                Deep Dive: {curve.sector.arName}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-ivory/50 font-mono">D(x) Formula</div>
                  <div className="text-gold font-mono mt-1">
                    D = {formatNumber(curve.dMax, 0)} × (1 − e^(−{curve.lambda.toExponential(1)}x))
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ivory/50 font-mono">Current D</div>
                  <div className="text-emerald-300 font-mono mt-1">
                    {formatNumber(curve.currentY)} مستفيد
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ivory/50 font-mono">Marginal at x</div>
                  <div className="text-blue-300 font-mono mt-1">
                    dD/dx = {marginalAtCurrent.toFixed(2)} / ريال
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ivory/50 font-mono">Next 1M SAR yields</div>
                  <div className="text-gold font-mono mt-1">
                    ≈ {formatNumber(nextRiyalBenefit * 1_000_000)} مستفيد
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Methodology */}
        <div className="flex items-center gap-2 mb-6 text-[10px] text-ivory/40 font-mono">
          <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          <span>
            λ from sectors.ts. D_max = (max_alloc / cost_per_beneficiary) × reach_rate (0.7).
            Each curve = same formula, different parameters.
          </span>
        </div>

        {/* Educational note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
            Economics Note
          </div>
          <div className="text-sm text-ivory/80 leading-relaxed">
            <p>
              هذا هو قانون <span className="text-gold">العوائد الحدية المتناقصة</span>{' '}
              (Law of Diminishing Marginal Returns) — أحد أعمدة الاقتصاد الكلاسيكي.
            </p>
            <p className="mt-2 text-ivory/60">
              في كل قطاع،{' '}
              <span className="text-ivory/90">الريال الإضافي</span> يشتري{' '}
              <span className="text-emerald-300">مستفيدين أقل</span> من الريال السابق.
              هذا يفسر لماذا{' '}
              <span className="text-gold">التنويع بين القطاعات</span> أفضل من التركيز في واحد.
            </p>
          </div>
        </motion.div>

        {/* Nav */}
        <div className="flex gap-3">
          <button
            onClick={() => setStage('ppf')}
            className="flex-1 py-3 border border-ivory/20 text-ivory/70 text-xs font-mono tracking-widest uppercase hover:bg-ivory/5"
          >
            ← PPF Frontier
          </button>
          <button
            onClick={() => setStage('critique')}
            className="flex-1 py-3 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10"
          >
            → Policy Critique
          </button>
        </div>
      </motion.div>
    </div>
  );
}
