import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SHOCKS, getShock, type ShockId } from '../../data/shocks';
import { runStressTest } from '../../engine/stress';
import { SECTORS } from '../../data/sectors';
import { formatNumber, formatSAR, formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

export function StressTest() {
  const allocations = useLabStore((s) => s.allocations);
  const setStage = useLabStore((s) => s.setStage);
  const [activeShockId, setActiveShockId] = useState<ShockId>('pandemic');

  const shock = useMemo(() => getShock(activeShockId), [activeShockId]);
  const result = useMemo(() => {
    if (!shock) return null;
    return runStressTest(SECTORS, allocations, shock);
  }, [shock, allocations]);

  if (!shock || !result) return null;

  const retentionPct = result.retentionRate * 100;

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 06 / Stress Test
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            اختبار الصدمات
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            Test Your Policy under plausible economic scenarios
            <br />
            <span className="text-ivory/40 text-xs">
              Scenarios inspired by historical events but parameterized for generalization.
              SIMULATION ASSUMPTION.
            </span>
          </p>
        </div>

        {/* Shock selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Select Shock / اختر الصدمة
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SHOCKS.map((s) => {
              const isActive = s.id === activeShockId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveShockId(s.id)}
                  className={`text-right p-3 border transition ${
                    isActive
                      ? 'border-gold bg-gold/10'
                      : 'border-ivory/10 hover:border-ivory/30 bg-midnight-800/30'
                  }`}
                >
                  <div className="text-sm text-ivory">{s.arName}</div>
                  <div className="text-[10px] text-ivory/50 font-mono mt-1">
                    {s.enName}
                  </div>
                  {s.historicalInspiration && (
                    <div className="text-[9px] text-ivory/40 mt-1">
                      {s.historicalInspiration}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Before / After comparison */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Before vs After / قبل وبعد
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Beneficiaries', before: result.before.beneficiaries, after: result.after.beneficiaries, unit: '' },
              { label: 'Social Value', before: result.before.socialValue, after: result.after.socialValue, unit: 'sar' },
              { label: 'GDP Impact', before: result.before.gdpImpact, after: result.after.gdpImpact, unit: 'sar' },
            ].map((metric) => {
              const change = metric.after - metric.before;
              const changePct = metric.before > 0 ? (change / metric.before) * 100 : 0;
              const formatValue = (v: number) =>
                metric.unit === 'sar' ? formatSAR(v, { compact: true }) : formatNumber(v);

              return (
                <div key={metric.label}>
                  <div className="text-[10px] text-ivory/50 font-mono mb-2">
                    {metric.label}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ivory/40">Before:</span>
                      <span className="font-mono text-ivory/70 tabular-nums">
                        {formatValue(metric.before)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ivory/40">After:</span>
                      <span className="font-mono text-gold tabular-nums">
                        {formatValue(metric.after)}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-ivory/10 flex items-center justify-between">
                      <span className="text-[10px] text-ivory/40 font-mono">Δ</span>
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          change >= 0 ? 'text-[#10b981]' : 'text-red-400'
                        }`}
                      >
                        {change >= 0 ? '+' : ''}
                        {formatPercent(changePct / 100, 1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Retention indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
            Impact Retention / الأثر المحفوظ
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`text-5xl font-mono tabular-nums ${
                retentionPct > 80
                  ? 'text-[#10b981]'
                  : retentionPct > 60
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {retentionPct.toFixed(0)}%
            </div>
            <div className="flex-1">
              <div className="h-3 bg-midnight-700 rounded-sm overflow-hidden">
                <motion.div
                  className={`h-full ${
                    retentionPct > 80
                      ? 'bg-emerald-500'
                      : retentionPct > 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${retentionPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="text-[10px] text-ivory/40 mt-1 font-mono">
                {retentionPct > 80
                  ? 'محفظة مرنة — تصمد جيدًا أمام الصدمة'
                  : retentionPct > 60
                  ? 'مرونة متوسطة — قد تحتاج إعادة تخصيص'
                  : 'مرونة ضعيفة — الصدمة تكشف هشاشة بنيوية'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sector impact breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Sector Sensitivity to {shock.arName}
          </div>
          <div className="space-y-1.5">
            {SECTORS.map((sector) => {
              const mult = shock.sectorEffectivenessMultiplier[sector.id] ?? 1.0;
              const alloc = allocations[sector.id] ?? 0;
              if (alloc === 0) return null;
              return (
                <div key={sector.id} className="flex items-center gap-3 text-xs">
                  <div
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: sector.color }}
                  />
                  <div className="flex-1 text-ivory/80">{sector.arName}</div>
                  <div className="flex-1 max-w-[200px]">
                    <div className="h-2 bg-midnight-700 rounded-sm overflow-hidden">
                      <div
                        className={`h-full ${
                          mult > 1
                            ? 'bg-emerald-500'
                            : mult > 0.8
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${mult * 100}%` }}
                      />
                    </div>
                  </div>
                  <div
                    className={`font-mono tabular-nums w-14 text-right ${
                      mult > 1
                        ? 'text-[#10b981]'
                        : mult > 0.8
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {(mult * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Evidence */}
        <div className="flex items-center gap-2 mb-6 text-[10px] text-ivory/40 font-mono">
          <EvidenceBadge level={shock.evidenceSource.url ? 'VERIFIED' : 'SIMULATION_ASSUMPTION'} size="xs" />
          <span>Source: {shock.evidenceSource.name} ({shock.evidenceSource.year})</span>
        </div>

        {/* Nav */}
        <div className="flex gap-3">
          <button
            onClick={() => setStage('lab')}
            className="flex-1 py-3 border border-ivory/20 text-ivory/70 text-xs font-mono tracking-widest uppercase hover:bg-ivory/5"
          >
            ← Back to Lab
          </button>
          <button
            onClick={() => setStage('sensitivity')}
            className="flex-1 py-3 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10"
          >
            → Sensitivity Analysis
          </button>
        </div>
      </motion.div>
    </div>
  );
}
