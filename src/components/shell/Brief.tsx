import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { critiquePortfolio } from '../../engine/critique';
import { SECTORS } from '../../data/sectors';
import { formatSAR, formatMultiplier, formatNumber, formatPercent, formatSROIRange } from '../../lib/format';

export function Brief() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const setStage = useLabStore((s) => s.setStage);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const critique = useMemo(
    () => critiquePortfolio(SECTORS, allocations),
    [allocations]
  );

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8 text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 05 / Policy Brief
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            الموجز التنفيذي
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            ملخص شامل لمحفظتك — جاهز للمشاركة
          </p>
        </div>

        {/* Main brief document */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-8 mb-6"
        >
          {/* Header */}
          <div className="border-b border-gold/20 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
                  ATHAR | أثر
                </div>
                <div className="text-lg text-ivory mt-1">
                  Saudi Social Investment Policy Brief
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-ivory/50 font-mono">Generated</div>
                <div className="text-xs text-ivory/70 font-mono">
                  {new Date().toISOString().split('T')[0]}
                </div>
              </div>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <Section title="01 / Executive Summary" ar="ملخص تنفيذي">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BriefStat label="Total Budget" value={formatSAR(metrics.totalBudget, { compact: true })} />
              <BriefStat label="Beneficiaries" value={formatNumber(metrics.totalBeneficiaries)} />
              <BriefStat label="Social Value (SROI)" value={formatSAR(metrics.totalSocialValue, { compact: true })} />
              <BriefStat label="GDP Impact" value={formatSAR(metrics.totalGdpImpact, { compact: true })} />
            </div>
          </Section>

          {/* 2. Allocation */}
          <Section title="02 / Allocation" ar="التخصيص">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-1.5"
            >
              {SECTORS.map((s) => {
                const a = allocations[s.id] ?? 0;
                const share = a / 100_000_000;
                return (
                  <motion.div
                    key={s.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 text-ivory">{s.arName}</div>
                    <div className="font-mono text-ivory/70 w-20 text-right">
                      {formatSAR(a, { compact: true })}
                    </div>
                    <div className="font-mono text-gold w-12 text-right">
                      {formatPercent(share, 1)}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>

          {/* 3. Expected Impact */}
          <Section title="03 / Expected Impact" ar="الأثر المتوقع">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">SROI (Social)</div>
                <div className="text-lg text-[#10b981] font-mono">
                  {formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Multiplier (Market)</div>
                <div className="text-lg text-blue-300 font-mono">
                  {formatMultiplier(metrics.portfolioMultiplier)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Jobs Created</div>
                <div className="text-lg text-gold font-mono">
                  {formatNumber(Math.round(metrics.totalEmployment))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">NPV ({horizon}Y, {formatPercent(discountRate, 0)})</div>
                <div className="text-lg text-gold font-mono">
                  {formatSAR(metrics.npvTotal, { compact: true })}
                </div>
              </div>
            </div>
          </Section>

          {/* 4. Risk & Sustainability */}
          <Section title="04 / Risk & Sustainability" ar="المخاطر والاستدامة">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Resilience Score</div>
                <div className="text-lg text-gold font-mono">
                  {formatPercent(metrics.resilienceScore, 0)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Health Score</div>
                <div className="text-lg text-gold font-mono">
                  {formatPercent(critique.healthScore, 0)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ivory/50 leading-relaxed">
              Resilience = 0.3 × (1-HHI) + 0.3 × (1-Dependency) + 0.2 × Counter-Cyclicality + 0.2 × (1-σ)
            </div>
          </Section>

          {/* 5. Recommendations */}
          <Section title="05 / Recommendations" ar="التوصيات">
            {critique.critiques.length === 0 ? (
              <div className="text-sm text-ivory/70">
                لا توجد توصيات حرجة. المحفظة قوية.
              </div>
            ) : (
              <div className="space-y-2">
                {critique.critiques.slice(0, 5).map((c) => (
                  <div key={c.id} className="text-xs text-ivory/70 flex items-start gap-2">
                    <span className="text-gold">→</span>
                    <span>{c.titleAr}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 6. Methodology */}
          <Section title="06 / Methodology & Limitations" ar="المنهجية والقيود">
            <div className="text-[10px] text-ivory/50 leading-relaxed space-y-1">
              <div>
                • الحسابات مبنية على بيانات رسمية سعودية (NCNP، Vision 2030، GASTAT، KKF)
              </div>
              <div>
                • SROI من دراسات حالة منشورة (دروب 4.9x، وريف 5.49x، التوحد 3.14x، إنسان)
              </div>
              <div>
                • Multiplier تقديري لـSaudi context (IMF Article IV + SAMA)
              </div>
              <div>
                • معاملات Diminishing Returns و Sustainability: SIMULATION ASSUMPTION
              </div>
              <div>
                • Discount rate افتراضي 3% (UK Treasury Green Book)
              </div>
              <div>
                • الأرقام قابلة للتعديل في Sensitivity Analysis
              </div>
            </div>
          </Section>

          {/* Disclaimer */}
          <div className="mt-6 pt-4 border-t border-ivory/10 text-[10px] text-ivory/40 font-mono italic">
            ⚠ Simulation based on stated assumptions and available evidence.
            <br />
            Not a forecast. Not investment advice. Not a recommendation.
            <br />
            Model is open, JSON-driven, auditable.
          </div>
        </motion.div>

        {/* Final message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <div className="text-2xl md:text-3xl text-ivory/80 font-light leading-relaxed">
            الاقتصاد ليس مجرد أرقام.
            <br />
            <span className="text-gold">إنه قرارات، ومفاضلات، وتكاليف، وآثار.</span>
          </div>
          <div className="text-base text-ivory/50 mt-4 font-mono tracking-wider">
            Every allocation is a choice.
          </div>
        </motion.div>

        {/* Built by */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-8 text-center"
        >
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            BUILT BY
          </div>
          <div className="text-2xl text-ivory mt-2">Joud Abdullah Al-Arjani</div>
          <div className="text-sm text-ivory/60 mt-1">Economics Student</div>
          <a
            href="https://www.linkedin.com/in/joud-al-arjani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10 transition"
          >
            <span>LinkedIn</span>
            <span>↗</span>
          </a>
        </motion.div>

        {/* Restart */}
        <div className="text-center mt-8">
          <button
            onClick={() => setStage('hero')}
            className="text-[10px] text-ivory/40 hover:text-gold font-mono tracking-widest uppercase"
          >
            ↻ Start Over
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Section({ title, ar, children }: { title: string; ar: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">{title}</div>
        <div className="text-xs text-ivory/60">/ {ar}</div>
      </div>
      <div className="border-r-2 border-gold/20 pr-4">{children}</div>
    </div>
  );
}

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-ivory/50 font-mono">{label}</div>
      <div className="text-lg text-gold font-mono tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
