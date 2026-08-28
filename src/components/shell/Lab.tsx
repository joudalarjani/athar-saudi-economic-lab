import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { computeAllMultipliers } from '../../engine/multiplier';
import { formatSAR, formatSROIRange, formatNumber } from '../../lib/format';

const SECTOR_ICONS: Record<string, string> = {
  education: '📚',
  health: '🏥',
  housing: '🏘️',
  employment: '💼',
  women: '⚡',
  environment: '🌿',
  hajj: '🕋',
};

const GOLD = '#d4a017';

export function Lab() {
  const allocations = useLabStore((s) => s.allocations);
  const setAllocation = useLabStore((s) => s.setAllocation);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const setStage = useLabStore((s) => s.setStage);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const multResults = useMemo(
    () => computeAllMultipliers(SECTORS, allocations),
    [allocations]
  );

  const allocated = metrics.totalBudget;

  const directImpact = useMemo(() => {
    let sum = 0;
    for (const s of SECTORS) {
      sum += (allocations[s.id] ?? 0) * s.sroiRange.median;
    }
    return sum;
  }, [allocations]);

  const inducedImpact = useMemo(() => {
    let sum = 0;
    for (const s of SECTORS) {
      const r = multResults.find((m) => m.sectorId === s.id);
      sum += (allocations[s.id] ?? 0) * (r?.effectiveMultiplier ?? 0);
    }
    return sum * 0.65 * 0.7;
  }, [allocations, multResults]);

  // Radar axes
  const radar = useMemo(() => {
    const eff = Math.min(metrics.portfolioSROI / 4, 1);
    const impact = Math.min(metrics.totalBeneficiaries / 12_000_000, 1);
    const equityAlloc = (allocations.women ?? 0) + (allocations.employment ?? 0) + (allocations.housing ?? 0);
    const equity = Math.min(equityAlloc / allocated, 1);
    const sust = SECTORS.reduce((s, sec) => s + sec.sustainabilityScore.value * (allocations[sec.id] ?? 0), 0) / Math.max(allocated, 1);
    const res = Math.max(0, Math.min(metrics.resilienceScore / 100, 1));
    return {
      efficiency: eff,
      impact,
      equity,
      sustainability: Math.max(0, Math.min(sust, 1)),
      resilience: res,
    };
  }, [metrics, allocations, allocated]);

  const radarData = [
    { label: 'الكفاءة', value: radar.efficiency },
    { label: 'الأثر', value: radar.impact },
    { label: 'الإنصاف', value: radar.equity },
    { label: 'الاستدامة', value: radar.sustainability },
    { label: 'المرونة', value: radar.resilience },
  ];

  // 3 most funded sectors for marginal returns
  const topSectors = useMemo(() => {
    return [...SECTORS]
      .map((s) => ({ s, a: allocations[s.id] ?? 0 }))
      .sort((x, y) => y.a - x.a)
      .slice(0, 3);
  }, [allocations]);

  const unfunded = SECTORS.filter((s) => (allocations[s.id] ?? 0) === 0);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#f0e6d3] p-3 md:p-4">
      {/* Bloomberg top bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 rounded-md bg-[#0d1527] border border-[rgba(212,160,23,0.12)] text-xs font-mono mb-3">
        <span className="text-[#d4a017] font-bold tracking-wider">[ATHAR POLICY LAB]</span>
        <span className="text-[rgba(240,230,211,0.7)]">
          Budget: <span className="text-[#d4a017]">{formatSAR(TOTAL_BUDGET, { compact: true })}</span>
        </span>
        <span className="text-[rgba(240,230,211,0.7)] flex items-center gap-2">
          Allocated: <span className="text-[#d4a017]">{formatSAR(allocated, { compact: true })}</span>
          <span className="inline-block w-24 h-2 rounded-sm bg-[#1a2138] overflow-hidden">
            <span
              className="block h-full bg-[#10b981]"
              style={{ width: `${(allocated / TOTAL_BUDGET) * 100}%` }}
            />
          </span>
        </span>
        <span className="text-[rgba(240,230,211,0.7)]">
          Remaining: <span className="text-[#10b981]">{formatSAR(Math.max(0, TOTAL_BUDGET - allocated), { compact: true })}</span>
        </span>
        <span className="text-[rgba(240,230,211,0.7)]">
          Resilience: <span className={metrics.resilienceScore >= 60 ? 'text-[#10b981]' : 'text-[#ef4444]'}>{metrics.resilienceScore.toFixed(0)}/100</span>
        </span>
        <span className="text-[rgba(240,230,211,0.7)]">
          SROI: <span className="text-[#d4a017]">{formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax)}</span>
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* LEFT — Sector Allocation (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-2">
          <SectionTitle>التخصيص القطاعي ({SECTORS.length})</SectionTitle>
          {SECTORS.map((s, i) => {
            const val = allocations[s.id] ?? 0;
            const pct = (val / TOTAL_BUDGET) * 100;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-lg bg-[#0d1527] border border-[rgba(212,160,23,0.12)] p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-base"
                      style={{ backgroundColor: `${s.color}1A`, border: `1px solid ${s.color}55` }}
                    >
                      {SECTOR_ICONS[s.iconKey] ?? s.iconKey}
                    </div>
                    <span className="text-sm">{s.arName}</span>
                  </div>
                  <span className="text-[#d4a017] font-mono font-semibold text-sm">
                    {formatSAR(val, { compact: true })}
                  </span>
                </div>

                <input
                  type="range"
                  min={s.minAllocation}
                  max={s.maxAllocation}
                  step={1_000_000}
                  value={val}
                  onChange={(e) => setAllocation(s.id, parseInt(e.target.value))}
                  className="mt-3 w-full h-1.5 appearance-none cursor-pointer accent-[#10b981]"
                />

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[rgba(240,230,211,0.45)]">
                    SROI {formatSROIRange(s.sroiRange.min, s.sroiRange.max)}
                  </span>
                  <span className="text-[#10b981]">{pct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1 rounded-sm bg-[#1a2138] overflow-hidden">
                  <div
                    className="h-full bg-[#d4a017]"
                    style={{ width: `${(val % 100) === 0 ? pct : pct}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT — Live Analytics (60%) */}
        <div className="lg:w-[60%] flex flex-col gap-3">
          <SectionTitle>تحليلات مباشرة</SectionTitle>

          <div className="grid md:grid-cols-2 gap-3">
            {/* Radar */}
            <Panel label="بوصلة المحفظة">
              <RadarChart data={radarData} />
            </Panel>

            {/* Marginal returns */}
            <Panel label="العائد الهامشي — القطاعات الأكثر تمويلاً">
              <div className="space-y-2">
                {topSectors.map(({ s, a }) => (
                  <MarginalMini
                    key={s.id}
                    color={s.color}
                    lambda={s.diminishingLambda.value}
                    maxX={60_000_000}
                    allocation={a}
                    icon={SECTOR_ICONS[s.iconKey] ?? s.iconKey}
                    arName={s.arName}
                  />
                ))}
              </div>
            </Panel>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Direct Impact"
              sub="Σ التخصيص × SROI"
              value={directImpact}
              color={GOLD}
            />
            <MetricCard
              label="Induced Impact"
              sub="Σ × multiplier × 0.65 × 0.7"
              value={inducedImpact}
              color={GOLD}
            />
          </div>

          {/* Opportunity cost alert */}
          {unfunded.length > 0 && (
            <div className="rounded-md px-4 py-3 bg-[#d4a017]/10 border border-[#d4a017]/30 text-sm text-[#d4a017]">
              {unfunded.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span>⚠</span>
                  <span>
                    {s.arName} غير ممول — تكلفة الفرصة: {formatSAR(TOTAL_BUDGET - allocated, { compact: true })}{' '}
                    ذهب لقطاع آخر
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStage('analysis')}
              className="rounded-md px-5 py-2.5 font-semibold text-[#0a0e1a] text-sm"
              style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }}
            >
              تحليل متقدم →
            </button>
            <div className="text-xs text-[rgba(240,230,211,0.4)]">
              المستفيدون الكلي: <span className="text-[#10b981] font-mono">{formatNumber(metrics.totalBeneficiaries)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-[#d4a017] font-semibold tracking-wide text-sm mb-1">{children}</div>
  );
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-[#0d1527] border border-[rgba(212,160,23,0.12)] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.45)] font-mono mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, sub, value, color }: { label: string; sub: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-[#0d1527] border border-[rgba(212,160,23,0.12)] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.45)] font-mono">
        {label}
      </div>
      <div className="text-2xl md:text-3xl text-[#d4a017] font-mono font-bold mt-1 tabular-nums">
        {formatSAR(value, { compact: true })}
      </div>
      <div className="text-[9px] text-[rgba(240,230,211,0.35)] font-mono mt-1">{sub}</div>
    </div>
  );
}

function RadarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const n = data.length;
  const point = (i: number, v: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(angle) * r * v, cy + Math.sin(angle) * r * v];
  };
  const gridLevels = [0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox="0 0 200 200" className="w-full h-auto">
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={data.map((_, i) => point(i, lv).join(',')).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        );
      })}
      <polygon
        points={data.map((d, i) => point(i, Math.max(0, Math.min(1, d.value))).join(',')).join(' ')}
        fill="rgba(16,185,129,0.2)"
        stroke="#10b981"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const [x, y] = point(i, d.value);
        return <circle key={i} cx={x} cy={y} r="1.6" fill="#10b981" />;
      })}
      {data.map((d, i) => {
        const [x, y] = point(i, 1.16);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fontSize="6.5" fill="rgba(240,230,211,0.55)">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function MarginalMini({
  color,
  lambda,
  maxX,
  allocation,
  icon,
  arName,
}: {
  color: string;
  lambda: number;
  maxX: number;
  allocation: number;
  icon: string;
  arName: string;
}) {
  const W = 240;
  const H = 70;
  const pad = 6;
  const n = 24;
  const xAt = (x: number) => pad + (x / maxX) * (W - pad * 2);
  const yAt = (v: number) => pad + (1 - v) * (H - pad * 2);
  const impact = (x: number) => 1 - Math.exp(-lambda * x);
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * maxX;
    pts.push(`${xAt(x).toFixed(1)},${yAt(impact(x)).toFixed(1)}`);
  }
  const allocX = xAt(Math.min(allocation, maxX));
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 text-center text-base">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] text-[rgba(240,230,211,0.6)] mb-1">{arName}</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <polyline
            points={pts.join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
          <line x1={allocX} y1={pad} x2={allocX} y2={H - pad} stroke="#d4a017" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1={pad} y1={yAt(0)} x2={W - pad} y2={yAt(0)} stroke="rgba(255,255,255,0.06)" />
        </svg>
      </div>
      <div className="text-[#d4a017] font-mono text-[10px]">
        {Math.round((impact(Math.min(allocation, maxX)) * 100))}%
      </div>
    </div>
  );
}
