import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { computeAllMultipliers } from '../../engine/multiplier';
import { formatSAR, formatSROIRange, formatNumber, formatMultiplier } from '../../lib/format';
import { useAnimatedValue } from '../../lib/useAnimatedValue';
import { BUDGET_PRESETS, sectorMax, sectorMin } from '../../lib/budget';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { GlossaryTag } from '../shared/GlossaryModal';
import { PortfolioUniverse } from '../3d/PortfolioUniverse';
import { LevelHud, BrandTag } from '../shared/LevelHud';

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
  const prefer2D = useLabStore((s) => s.prefer2D);
  const isMobile = useLabStore((s) => s.isMobile);
  const totalBudget = useLabStore((s) => s.totalBudget);
  const setTotalBudget = useLabStore((s) => s.setTotalBudget);
  const resetModel = useLabStore((s) => s.resetModel);
  const [customBudget, setCustomBudget] = useState('');

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
    <div className="min-h-screen lux-shell text-[#f0e6d3] p-3 md:p-6">
      {/* The economics question — framing before you allocate */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="lux-glass lux-hairline p-5 md:p-6 mb-4 relative overflow-hidden border-r-2 border-[#d4a017]"
      >
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#d4a017] font-mono mb-2">
          The Economic Question / السؤال الاقتصادي
        </div>
        <p className="text-base md:text-lg text-[#f0e6d3]/90 leading-relaxed max-w-3xl">
          الموارد محدودة، لكن الاحتياجات غير محدودة.
          <br />
          <span className="text-[#f4d27a]">فكيف نحدد أين يصنع الريال الإضافي أكبر أثر؟</span>
        </p>
        <p className="text-xs text-[rgba(240,230,211,0.55)] mt-2 max-w-3xl">
          هذا ليس مجرد محاكاة استثمار — بل اختبار المفاضلة بين أربعة أبعاد
          اقتصادية حقيقية، وكل ريال تنقله بين القطاعات يغيّر توازنها:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { k: 'Economic Return', icon: '↗' },
            { k: 'Social Impact', icon: '❤' },
            { k: 'Risk', icon: '⚠' },
            { k: 'Time to Impact', icon: '⏳' },
          ].map((t) => (
            <span
              key={t.k}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono text-[rgba(240,230,211,0.7)] bg-[rgba(212,160,23,0.08)] border border-[rgba(212,160,23,0.2)]"
            >
              <span className="text-[#f4d27a]">{t.icon}</span>
              {t.k}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[9px] text-[rgba(240,230,211,0.35)] font-mono">
          Scarcity → Choice → Trade-off (Opportunity Cost) — the core of economics.
        </p>
      </motion.div>

      {/* Immersive header — big numbers first */}
      <div className="lux-glass lux-hairline p-5 md:p-6 mb-4 relative overflow-hidden">
        <div
          className="absolute -top-16 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.12), transparent 70%)' }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div className="min-w-[260px]">
            <LevelHud compact />
            <h1 className="mt-3 lux-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
              مختبر الاستثمار
            </h1>
            <div className="text-xs text-[rgba(240,230,211,0.6)] font-light mt-1">
              وزّع رأس مالك. وابنِ محفظتك. ثم شاهد الأثر.
            </div>
            <div className="mt-3 flex items-end gap-3">
              <span className="lux-big-number" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}>
                {formatSAR(totalBudget, { compact: false })}
              </span>
              <span className="pb-1 text-sm text-[rgba(240,230,211,0.6)] font-light">ريال للقطاعات</span>
            </div>

            {/* Adjustable capital presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[9px] uppercase tracking-widest font-mono text-[rgba(240,230,211,0.4)] mr-1">
                CAPITAL /
              </span>
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setTotalBudget(p.value); setCustomBudget(''); }}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-sm border transition-colors cursor-pointer ${
                    totalBudget === p.value
                      ? 'border-[#d4a017] text-[#f4d27a] bg-[rgba(212,160,23,0.15)]'
                      : 'border-[rgba(240,230,211,0.15)] text-[rgba(240,230,211,0.55)] hover:border-[rgba(212,160,23,0.4)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  inputMode="numeric"
                  placeholder="مخصص"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = parseFloat(customBudget.replace(/[^0-9]/g, ''));
                      if (!Number.isNaN(v) && v > 0) setTotalBudget(v);
                    }
                  }}
                  className="w-20 bg-midnight-800 border border-[rgba(240,230,211,0.15)] text-ivory text-[10px] font-mono px-2 py-1 rounded-sm focus:border-[#d4a017] outline-none"
                />
                <button
                  onClick={() => {
                    const v = parseFloat(customBudget.replace(/[^0-9]/g, ''));
                    if (!Number.isNaN(v) && v > 0) setTotalBudget(v);
                  }}
                  className="px-2 py-1 text-[10px] font-mono text-[rgba(240,230,211,0.7)] border border-[rgba(240,230,211,0.15)] rounded-sm hover:border-[#d4a017] cursor-pointer"
                  title="Set custom capital"
                >
                  ✓
                </button>
              </div>
              <button
                onClick={() => { resetModel(); setCustomBudget(''); }}
                className="px-2.5 py-1 text-[10px] font-mono rounded-sm border border-[rgba(240,230,211,0.15)] text-[rgba(240,230,211,0.5)] hover:text-red-300 hover:border-red-400/40 transition-colors cursor-pointer"
                title="Reset the whole model to base case (SAR 100M, default allocation, default weights)"
              >
                ↻ RESET MODEL
              </button>
            </div>
            <div className="text-[9px] text-[rgba(240,230,211,0.3)] font-mono mt-1">
              Adjust total capital — كل حدود القطاعات تُعاد قياسها تلقائيًا
            </div>
            <div className="text-xs text-[rgba(240,230,211,0.55)] mt-1 font-light">
              القرار أولاً — ثم راقب كيف يتحرك رأس المال ويتحول إلى أثر.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="px-2">
              <div className="text-[9px] tracking-widest uppercase font-mono text-[rgba(240,230,211,0.4)]">
                <GlossaryTag id="sroi">SROI</GlossaryTag>
              </div>
              <AnimatedNumber value={metrics.portfolioSROI} formatter={(v) => formatMultiplier(v)} className="text-2xl md:text-3xl text-[#10b981]" />
            </div>
            <div className="px-2">
              <div className="text-[9px] tracking-widest uppercase font-mono text-[rgba(240,230,211,0.4)]">Direct Impact</div>
              <AnimatedNumber value={directImpact} formatter={(v) => formatSAR(v, { compact: true })} className="text-2xl md:text-3xl text-[#f0d67c]" />
            </div>
            <div className="px-2">
              <div className="text-[9px] tracking-widest uppercase font-mono text-[rgba(240,230,211,0.4)]">Induced Impact</div>
              <AnimatedNumber value={inducedImpact} formatter={(v) => formatSAR(v, { compact: true })} className="text-2xl md:text-3xl text-[#2dd4bf]" />
            </div>
          </div>
        </div>

        {/* Allocation progress strip */}
        <div className="relative mt-5">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-[rgba(240,230,211,0.45)]">ALLOCATED</span>
            <span className="text-[#d4a017]">{formatSAR(allocated, { compact: true })} / {formatSAR(totalBudget, { compact: true })}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #2dd4bf, #d4a017)' }}
              animate={{ width: `${Math.min(100, (allocated / totalBudget) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* 3D Visual Centerpiece */}
        {!prefer2D && !isMobile && (
          <div className="w-full rounded-xl overflow-hidden border border-[rgba(212,160,23,0.15)] bg-[#0d1527] mb-1">
            <div className="px-4 py-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.45)] font-mono border-b border-[rgba(212,160,23,0.1)]">
              <span>Portfolio Universe — live 3D</span>
              <span className="text-[rgba(16,185,129,0.8)]">● LIVE</span>
            </div>
            <div className="h-[360px]">
              <PortfolioUniverse />
            </div>
          </div>
        )}
        {/* LEFT — Sector Allocation (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-2">
          <SectionTitle>التخصيص القطاعي ({SECTORS.length})</SectionTitle>
          {SECTORS.map((s, i) => {
            const val = allocations[s.id] ?? 0;
            const pct = (val / totalBudget) * 100;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="lux-glass p-3.5 transition-all relative overflow-hidden"
              >
                <motion.div
                  key={Math.round(val)}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(60% 60% at 50% 0%, ${s.color}22, transparent 70%)` }}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                />
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
                  <AnimatedNumber value={val} formatter={(v) => formatSAR(v, { compact: true })} className="text-[#f0d67c] text-sm" />
                </div>

                <input
                  type="range"
                  min={sectorMin(s, totalBudget)}
                  max={sectorMax(s, totalBudget)}
                  step={Math.max(1, Math.round(totalBudget / 100))}
                  value={val}
                  onChange={(e) => setAllocation(s.id, parseInt(e.target.value))}
                  className="mt-3 w-full h-1.5 appearance-none cursor-pointer accent-[#10b981]"
                />

                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[rgba(240,230,211,0.45)] whitespace-nowrap">
                      SROI {formatSROIRange(s.sroiRange.min, s.sroiRange.max)}
                    </span>
                    <EvidenceBadge level={s.sroiRange.evidence.level} size="xs" showLabel={false} />
                  </div>
                  <span className="text-[#10b981] whitespace-nowrap">{pct.toFixed(1)}%</span>
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
            <div className="rounded-md px-4 py-3 bg-[#d4a017] text-[#0a0e1a] text-sm font-semibold shadow-[0_0_18px_rgba(212,160,23,0.25)]">
              {unfunded.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span>⚠</span>
                  <span>
                    {s.arName} غير ممول —{' '}
                    <GlossaryTag id="opportunity">تكلفة الفرصة البديلة</GlossaryTag>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <button
              onClick={() => setStage('analysis')}
              className="lux-btn !px-8 cursor-pointer"
            >
              <span>LEVEL 02 — راقب الأثر</span>
              <span>→</span>
            </button>
            <div className="flex items-center gap-5 text-xs text-[rgba(240,230,211,0.5)]">
              <span>
                المستفيدون: <span className="text-[#10b981] font-mono">{formatNumber(metrics.totalBeneficiaries)}</span>
              </span>
              <span>
                <GlossaryTag id="resilience">Resilience</GlossaryTag>:{' '}
                <span className={metrics.resilienceScore >= 60 ? 'text-[#10b981]' : 'text-[#ef4444]'} font-mono>
                  {metrics.resilienceScore.toFixed(0)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="w-1 h-4 rounded-sm bg-gradient-to-b from-[#f0d67c] to-[#d4a017]" />
      <div className="text-[#f0d67c] font-mono text-[11px] tracking-[0.2em] uppercase">
        {children}
      </div>
    </div>
  );
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="lux-glass p-4">
      <div className="text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.45)] font-mono mb-3 border-b border-[rgba(212,160,23,0.1)] pb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, sub, value, color }: { label: string; sub: string; value: number; color: string }) {
  return (
    <div className="lux-glass p-4 relative overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)` }}
      />
      <div className="relative text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.45)] font-mono">
        {label}
      </div>
      <div className="relative text-2xl md:text-3xl text-[#f0d67c] font-mono font-bold mt-1 tabular-nums">
        {formatSAR(value, { compact: true })}
      </div>
      <div className="relative text-[9px] text-[rgba(240,230,211,0.35)] font-mono mt-1">{sub}</div>
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

/** Number that smoothly animates to its target value. */
function AnimatedNumber({
  value,
  formatter,
  className = '',
}: {
  value: number;
  formatter: (v: number) => string;
  className?: string;
}) {
  const display = useAnimatedValue(value, 500);
  return (
    <motion.div
      key={Math.round(value)}
      animate={{ opacity: 1 }}
      className={`font-mono tabular-nums font-semibold ${className}`}
    >
      {formatter(display)}
    </motion.div>
  );
}
