import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { sectorMin, sectorMax } from '../../lib/budget';
import { computeTradeOff } from '../../engine/tradeoff';
import type { TradeOffResult } from '../../engine/tradeoff';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { formatSAR, formatNumber } from '../../lib/format';
import { StageNav } from '../shared/StageNav';
import { GlossaryTag } from '../shared/GlossaryModal';
import { EvidenceBadge } from '../shared/EvidenceBadge';

const SECTOR_ICONS: Record<string, string> = {
  education: '📚',
  health: '🏥',
  housing: '🏘️',
  employment: '💼',
  women: '⚡',
  environment: '🌿',
  hajj: '🕋',
};

export function TradeOff() {
  const allocations = useLabStore((s) => s.allocations);
  const setAllAllocations = useLabStore((s) => s.setAllAllocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const totalBudget = useLabStore((s) => s.totalBudget);

  const [fromId, setFromId] = useState('education');
  const [toId, setToId] = useState('health');
  const [shift, setShift] = useState(10_000_000);

  const maxShift = useMemo(() => {
    const fromS = SECTORS.find((s) => s.id === fromId);
    const toS = SECTORS.find((s) => s.id === toId);
    const fromMin = fromS ? sectorMin(fromS, totalBudget) : 0;
    const toMax = toS ? sectorMax(toS, totalBudget) : 0;
    const available = (allocations[fromId] ?? 0) - fromMin;
    const headroom = toMax - (allocations[toId] ?? 0);
    return Math.max(0, Math.min(available, headroom));
  }, [allocations, fromId, toId, totalBudget]);

  const result = useMemo(
    () =>
      computeTradeOff({
        sectors: SECTORS,
        allocations,
        fromId,
        toId,
        shift,
        budget: totalBudget,
        discountRate,
        horizon,
      }),
    [allocations, fromId, toId, shift, discountRate, horizon, totalBudget]
  );

  const baseMetrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const fromSector = SECTORS.find((s) => s.id === fromId);
  const toSector = SECTORS.find((s) => s.id === toId);

  const apply = () => {
    setAllAllocations(result.proposedAllocation);
  };

  const rows = [
    { deltaKey: 'deltaSocialValue' as const, favorKey: 'socialValue' as const, label: 'Social Value (SROI)', en: 'القيمة الاجتماعية', icon: '❤', unit: 'sar' },
    { deltaKey: 'deltaGdpImpact' as const, favorKey: 'gdpImpact' as const, label: 'GDP Impact', en: 'أثر الناتج المحلي', icon: '📈', unit: 'sar' },
    { deltaKey: 'deltaEmployment' as const, favorKey: 'employment' as const, label: 'Employment', en: 'الوظائف', icon: '💼', unit: 'jobs' },
    { deltaKey: 'deltaBeneficiaries' as const, favorKey: 'beneficiaries' as const, label: 'Beneficiaries', en: 'المستفيدون', icon: '👥', unit: 'count' },
    { deltaKey: 'deltaResilience' as const, favorKey: 'resilience' as const, label: 'Resilience', en: 'المرونة', icon: '🛡', unit: 'pct' },
  ] as {
    deltaKey: keyof TradeOffResult['delta'];
    favorKey: keyof TradeOffResult['favor'];
    label: string;
    en: string;
    icon: string;
    unit: string;
  }[];

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Level 03 / THE TRADE-OFF — المبادلة
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">ماذا تضحي لأجل ماذا؟</h1>
          <p className="text-ivory/60 mt-2 text-sm max-w-2xl mx-auto">
            انقل رأس المال بين قطاعين وشاهد بالضبط ما تكسب وما تخسر عبر كل بُعد.
            لا يوجد ريال مجاني — كل قرار له{' '}
            <GlossaryTag id="opportunity">تكلفة فرصة بديلة</GlossaryTag>.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="glass-panel terminal-border p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ivory/50 font-mono mb-2">
                Take FROM — آخذ من
              </div>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full bg-midnight-800 border border-gold/30 text-ivory px-3 py-2 text-sm rounded-sm"
              >
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {SECTOR_ICONS[s.iconKey] ?? s.iconKey} {s.arName} · {formatSAR(allocations[s.id] ?? 0, { compact: true })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ivory/50 font-mono mb-2">
                Give TO — أعطِ إلى
              </div>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-midnight-800 border border-gold/30 text-ivory px-3 py-2 text-sm rounded-sm"
              >
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {SECTOR_ICONS[s.iconKey] ?? s.iconKey} {s.arName} · {formatSAR(allocations[s.id] ?? 0, { compact: true })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[10px] font-mono mb-2">
              <span className="text-ivory/50">Amount to shift / مبلغ النقل</span>
              <span className="text-gold">{formatSAR(shift, { compact: true })}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(maxShift, 1_000_000)}
              step={Math.max(100_000, Math.round(totalBudget / 100))}
              value={Math.min(shift, maxShift)}
              onChange={(e) => setShift(parseInt(e.target.value))}
              className="w-full h-1.5 appearance-none cursor-pointer accent-[#d4a017]"
            />
            <div className="mt-1 text-[9px] text-ivory/40 font-mono">
              Max available from {fromSector?.arName}: {formatSAR(maxShift, { compact: true })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={apply}
              className="px-5 py-2 text-xs font-semibold text-[#0A0E1A] rounded-sm shadow-lg hover:brightness-110 transition cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #d4a017 0%, #f0c14b 55%, #ffe08a 100%)' }}
            >
              Apply this shift — طبّق النقل
            </button>
            <div className="text-[10px] text-ivory/40 font-mono">
              Total budget preserved: {formatSAR(baseMetrics.totalBudget, { compact: true })}
            </div>
          </div>
        </div>

        {/* GAINED / LOST panel */}
        <div className="glass-panel terminal-border p-6 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-ivory/50 font-mono mb-4 border-b border-ivory/10 pb-2">
            What you GAIN vs what you GIVE UP — ماذا تكسب وماذا تضحي
          </div>
          <div className="space-y-2.5">
            {rows.map((r) => {
              const d = result.delta[r.deltaKey];
              const favor = result.favor[r.favorKey];
              const gain = favor === 'to';
              const neutral = favor === 'even';
              const deltaAbs = Math.abs(d);
              return (
                <div key={r.deltaKey} className="flex items-center gap-3 border border-ivory/10 rounded-sm px-3 py-2.5">
                  <span className="text-base w-6 text-center">{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-ivory/80">{r.label}</div>
                    <div className="text-[9px] text-ivory/40 font-mono">{r.en}</div>
                  </div>
                  {neutral ? (
                    <span className="text-xs text-ivory/60 font-mono">no change</span>
                  ) : (
                    <span className={`text-sm font-mono ${gain ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {gain ? '▲ +' : '▼ −'}{formatDelta(deltaAbs, r.unit)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 border-l-2 border-gold/40 pl-3">
            <span className="text-gold">↝</span>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gold font-mono">Opportunity Cost / تكلفة الفرصة</div>
              <p className="text-xs text-ivory/70 mt-1 leading-relaxed">{result.opportunityCost.ar}</p>
              <p className="text-[10px] text-ivory/40 mt-1 font-mono">{result.opportunityCost.en}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[9px] text-ivory/35 font-mono">
            <span>SIMULATION OUTPUT</span>
            <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" showLabel={false} />
            <span>— derived from your real allocation and parameterized model assumptions, not a forecast.</span>
          </div>
        </div>

        {/* Per-sector SROI context */}
        <div className="glass-panel terminal-border p-6 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-ivory/50 font-mono mb-3">
            The sectors in this trade — القطاعان في هذه المبادلة
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[fromSector, toSector].map((s, i) => {
              const isFrom = i === 0;
              const sm = baseMetrics.sectorMetrics.find((x) => x.sectorId === s?.id);
              return (
                <div
                  key={s?.id ?? i}
                  className={`border rounded-sm p-3 ${isFrom ? 'border-[#ef4444]/30' : 'border-[#10b981]/30'}`}
                >
                  <div className="text-sm">{SECTOR_ICONS[s?.iconKey ?? '']} {s?.arName}</div>
                  <div className="text-[10px] text-ivory/50 font-mono mt-1">SROI</div>
                  <div className="text-lg font-mono text-gold">{sm?.sroi.toFixed(2)}x</div>
                  <div className="text-[10px] text-ivory/40 font-mono mt-1">
                    {isFrom ? 'Losing marginal' : 'Gaining marginal'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <StageNav />
      </div>
    </div>
  );
}

function formatDelta(v: number, unit: string): string {
  if (unit === 'sar') return formatSAR(v, { compact: true });
  if (unit === 'pct') return `${(v * 100).toFixed(1)}pts`;
  return formatNumber(Math.round(v));
}
