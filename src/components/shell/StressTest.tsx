import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SHOCKS, getShock, type ShockId } from '../../data/shocks';
import { runStressTest, applyShock } from '../../engine/stress';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { getSectorSROI } from '../../engine/sroi';
import { computeMultiplier } from '../../engine/multiplier';
import { SECTORS } from '../../data/sectors';
import { formatNumber, formatSAR, formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { StageNav } from '../shared/StageNav';

export function StressTest() {
  const allocations = useLabStore((s) => s.allocations);
  const setStage = useLabStore((s) => s.setStage);
  const [activeShockId, setActiveShockId] = useState<ShockId>('pandemic');

  const shock = useMemo(() => getShock(activeShockId), [activeShockId]);
  const result = useMemo(() => {
    if (!shock) return null;
    return runStressTest(SECTORS, allocations, shock);
  }, [shock, allocations]);

  const baseMetrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, 0.03, 10),
    [allocations]
  );
  const baseResilience = baseMetrics.resilienceScore;

  const sectorRows = useMemo(() => {
    if (!shock) return [];
    return SECTORS.map((sector) => {
      const a = allocations[sector.id] ?? 0;
      if (a <= 0) return null;
      const beforeSroi = getSectorSROI(sector);
      const beforeSocial = a * beforeSroi.median;
      const { sector: shockedSector, adjustedAllocation } = applyShock(sector, a, shock);
      const afterSroi = getSectorSROI(shockedSector);
      const afterSocial = adjustedAllocation * afterSroi.median;
      const eff = shock.sectorEffectivenessMultiplier[sector.id] ?? 1.0;
      return {
        id: sector.id,
        arName: sector.arName,
        color: sector.color,
        beforeSocial,
        afterSocial,
        eff,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [allocations, shock]);

  if (!shock || !result) return null;

  const retentionPct = result.retentionRate * 100;
  const lostPct =
    ((result.before.socialValue - result.after.socialValue) / (result.before.socialValue || 1)) * 100;
  const postResilience = baseResilience * (result.retentionRate ?? 1);
  const maxSectorBar = Math.max(1, ...sectorRows.map((r) => r.beforeSocial));

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

        {/* Resilience + lost impact + before/after sector bars */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
              Resilience & Lost Impact / المرونة والأثر المفقود
            </div>
            <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <div>
              <div className="text-[10px] text-ivory/50 font-mono mb-1">Resilience قبل</div>
              <div className={`text-3xl font-mono tabular-nums ${baseResilience > 0.6 ? 'text-[#10b981]' : 'text-yellow-400'}`}>
                {formatPercent(baseResilience, 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ivory/50 font-mono mb-1">Resilience بعد الصدمة</div>
              <div className={`text-3xl font-mono tabular-nums ${postResilience > 0.6 ? 'text-[#10b981]' : postResilience > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                {formatPercent(postResilience, 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ivory/50 font-mono mb-1">الخسارة في الأثر</div>
              <div className="text-3xl font-mono tabular-nums text-red-400">
                −{formatPercent(lostPct / 100, 0)}
              </div>
            </div>
          </div>
          <div className="text-xs text-ivory/70 mb-5">
            {lostPct > 0.5 ? (
              <>
                خسرت <span className="text-red-400 font-mono">{lostPct.toFixed(1)}%</span> من الأثر المتوقع بفعل هذه الصدمة.
              </>
            ) : (
              'محفظتك حافظت على أثرها المتوقع أمام هذه الصدمة.'
            )}
            <span className="text-ivory/40 font-mono"> (Simulation based on stated assumptions)</span>
          </div>

          {/* Two side-by-side bar panels */}
          <div className="grid md:grid-cols-2 gap-4" role="img" aria-label="مقارنة الأثر قبل وبعد الصدمة">
            <div className="lux-glass p-4">
              <div className="text-[10px] tracking-widest uppercase text-[#10b981] font-mono mb-3">
                قبل الصدمة
              </div>
              <div className="space-y-2">
                {sectorRows.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <div className="w-20 md:w-28 text-ivory/70 truncate flex-shrink-0">
                      {r.arName}
                    </div>
                    <div className="flex-1 h-2.5 bg-midnight-700 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(r.beforeSocial / maxSectorBar) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lux-glass p-4">
              <div className="text-[10px] tracking-widest uppercase text-[#ef4444] font-mono mb-3">
                بعد الصدمة
              </div>
              <div className="space-y-2">
                {sectorRows.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <div className="w-20 md:w-28 text-ivory/70 truncate flex-shrink-0">
                      {r.arName}
                    </div>
                    <div className="flex-1 h-2.5 bg-midnight-700 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(r.afterSocial / maxSectorBar) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
            Joud Al-Arjani
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

        {/* Sequential journey nav */}
        <StageNav />
      </motion.div>
    </div>
  );
}
