import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PortfolioMetrics } from '../../engine/portfolio';
import { calculateAtharScore } from '../../engine/impactScore';
import { SECTORS } from '../../data/sectors';
import { useLabStore } from '../../state/labStore';

/**
 * IMPACT RINGS — minimal data-rings replacing bar/column KPIs.
 *
 * Six circular gauges driven directly by the economic model:
 *   ATHAR SCORE · ECONOMIC RETURN · SOCIAL IMPACT · EMPLOYMENT · RISK · TIME
 *
 * Rings are restrained (no neon), values in Western numerals, and every arc
 * fraction is computed from `PortfolioMetrics` + `calculateAtharScore` so the
 * visualization moves exactly with the user's allocation decision.
 */

interface RingDatum {
  id: string;
  label: string;
  ar: string;
  color: string;
  /** 0..1 driving the arc sweep */
  frac: number;
  display: string;
  sub: string;
}

function ringPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = start - Math.PI / 2;
  const e = end - Math.PI / 2;
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function Ring({ d, size = 120 }: { d: RingDatum; size?: number }) {
  const cx = 50;
  const cy = 50;
  const r = 42;
  const sweep = Math.max(0.02, Math.min(1, d.frac)) * Math.PI * 2;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
          <motion.path
            d={ringPath(cx, cy, r, 0, sweep)}
            fill="none"
            stroke={d.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold tabular-nums leading-none" style={{ fontSize: size * 0.16, color: d.color }}>
            {d.display}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-[rgba(240,230,211,0.4)] mt-0.5">
            {d.id}
          </span>
        </div>
      </div>
      <div className="text-center leading-tight">
        <div className="text-[10px] text-[rgba(240,230,211,0.8)]">{d.label}</div>
        <div className="text-[8px] text-[rgba(240,230,211,0.35)]">{d.ar}</div>
      </div>
    </div>
  );
}

/** Compute "years to 50% impact" from the portfolio time profile. */
function yearsToHalfImpact(metrics: PortfolioMetrics): number {
  const years = metrics.timeProfile.years;
  if (!years || years.length === 0) return 0;
  const peak = years[years.length - 1].totalSocialValue;
  if (peak <= 0) return years[years.length - 1].year;
  const half = peak / 2;
  for (const y of years) {
    if (y.totalSocialValue >= half && y.year > 0) return y.year;
  }
  return years[years.length - 1].year;
}

export function ImpactRings({ metrics }: { metrics: PortfolioMetrics }) {
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const atharWeights = useLabStore((s) => s.atharWeights);

  const score = useMemo(
    () => calculateAtharScore(SECTORS, metricsToAllocations(metrics), atharWeights, discountRate, horizon),
    [metrics, atharWeights, discountRate, horizon]
  );

  const rings = useMemo<RingDatum[]>(() => {
    const budget = Math.max(metrics.totalBudget, 1);

    // ATHAR score
    const atharFrac = Math.max(0, Math.min(1, score.overall / 100));

    // Economic return: GDP impact as % of invested capital (bounded arc)
    const econReturn = (metrics.totalGdpImpact / (budget / 100)) >= 0 ? (metrics.totalGdpImpact / budget) * 100 : 0;
    const econFrac = Math.max(0, Math.min(1, econReturn / 120));

    // Social impact index: social value as % of capital (bounded arc)
    const socialIdx = (metrics.totalSocialValue / budget) * 100;
    const socFrac = Math.max(0, Math.min(1, socialIdx / 150));

    // Employment (jobs per million)
    const jobsPerM = metrics.totalEmployment / (metrics.totalBudget / 1_000_000);

    // Risk (safety): resilienceScore 0-100
    const res = Math.max(0, Math.min(100, metrics.resilienceScore));
    const riskLabel = res >= 70 ? 'LOW' : res >= 40 ? 'MED' : 'HIGH';

    // Time to impact
    const tti = yearsToHalfImpact(metrics);

    return [
      {
        id: 'SCORE',
        label: 'Athar Score',
        ar: 'سكور أثر',
        color: '#f0d67c',
        frac: atharFrac,
        display: score.overall.toFixed(1),
        sub: '/ 100',
      },
      {
        id: 'RETURN',
        label: 'Economic Return',
        ar: 'العائد الاقتصادي',
        color: '#4ed6c0',
        frac: econFrac,
        display: `+${econReturn.toFixed(1)}%`,
        sub: 'GDP',
      },
      {
        id: 'SOCIAL',
        label: 'Social Impact',
        ar: 'الأثر الاجتماعي',
        color: '#38b89a',
        frac: socFrac,
        display: socialIdx.toFixed(1),
        sub: 'x',
      },
      {
        id: 'JOBS',
        label: 'Employment',
        ar: 'التوظيف',
        color: '#a78bfa',
        frac: Math.max(0, Math.min(1, jobsPerM / 40)),
        display: jobsPerM >= 10 ? `${jobsPerM.toFixed(1)}K` : jobsPerM.toFixed(1),
        sub: 'jobs / M',
      },
      {
        id: 'RISK',
        label: 'Risk',
        ar: 'المخاطر',
        color: res >= 70 ? '#38b89a' : res >= 40 ? '#f0d67c' : '#f87171',
        frac: res / 100,
        display: riskLabel,
        sub: `${res.toFixed(0)}`,
      },
      {
        id: 'TIME',
        label: 'Time to Impact',
        ar: 'زمن الأثر',
        color: '#f59e0b',
        frac: Math.max(0, Math.min(1, tti / 10)),
        display: `${tti.toFixed(1)}Y`,
        sub: '50%',
      },
    ];
  }, [metrics, score.overall]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-5">
      {rings.map((r) => (
        <Ring key={r.id} d={r} />
      ))}
    </div>
  );
}

/** Reconstruct allocations record keyed by sector id (all values present). */
function metricsToAllocations(metrics: PortfolioMetrics): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of metrics.sectorMetrics) out[m.sectorId] = m.allocation;
  return out;
}
