import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { critiquePortfolio } from '../../engine/critique';
import { SECTORS } from '../../data/sectors';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { formatPercent } from '../../lib/format';
import { StageNav } from '../shared/StageNav';

export function Critique() {
  const allocations = useLabStore((s) => s.allocations);
  const setStage = useLabStore((s) => s.setStage);

  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + v, 0),
    [allocations]
  );

  const result = useMemo(() => critiquePortfolio(SECTORS, allocations), [allocations]);

  if (totalAllocated <= 0) {
    return (
      <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
              Stage 04 / Policy Critique
            </div>
            <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
              مراجعة السياسة
            </h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel terminal-border p-10 text-center"
          >
            <div className="text-gold text-4xl mb-4">⚠</div>
            <div className="text-2xl text-ivory font-medium">
              خصّص الميزانية أولاً قبل التحليل
            </div>
            <div className="text-sm text-ivory/60 mt-2">
              عد إلى المختبر ووزّع رأس المال بين القطاعات ثم عُد للمراجعة.
            </div>
            <button
              onClick={() => setStage('lab')}
              className="mt-6 px-6 py-3 border border-gold/40 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10"
            >
              ← العودة إلى المختبر
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 04 / Policy Critique
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            مراجعة السياسة
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            Economic Policy Review — تحليل بنيوي لمحفظتك
          </p>
        </div>

        {/* Health score */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Portfolio Health / صحة المحفظة
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-6xl text-gold font-mono tabular-nums">
                {Math.round(result.healthScore * 100)}
              </div>
              <div className="text-[10px] text-ivory/50 font-mono">/ 100</div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl text-red-400 font-mono">{result.counts.critical}</div>
                  <div className="text-[9px] text-ivory/50 font-mono uppercase">Critical</div>
                </div>
                <div>
                  <div className="text-2xl text-yellow-400 font-mono">{result.counts.warning}</div>
                  <div className="text-[9px] text-ivory/50 font-mono uppercase">Warning</div>
                </div>
                <div>
                  <div className="text-2xl text-blue-400 font-mono">{result.counts.info}</div>
                  <div className="text-[9px] text-ivory/50 font-mono uppercase">Info</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Critiques */}
        {result.critiques.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <div className="text-gold text-4xl mb-3">✓</div>
            <div className="text-lg text-ivory">المحفظة قوية بنيويًا</div>
            <div className="text-sm text-ivory/60 mt-2">
              لا توجد ملاحظات حرجة. التنويع والاستدامة ضمن النطاق المقبول.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {result.critiques.map((c) => {
              const severityStyles = {
                critical: 'border-red-500/40 bg-red-900/10',
                warning: 'border-yellow-500/40 bg-yellow-900/10',
                info: 'border-blue-500/40 bg-blue-900/10',
              }[c.severity];

              const severityIcon = {
                critical: '⊗',
                warning: '⚠',
                info: 'ⓘ',
              }[c.severity];

              const severityLabel = {
                critical: 'حرج',
                warning: 'تحذير',
                info: 'معلوماتي',
              }[c.severity];

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-panel border ${severityStyles} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-xl mt-0.5 ${
                        c.severity === 'critical'
                          ? 'text-red-400'
                          : c.severity === 'warning'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {severityIcon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-ivory font-medium">{c.titleAr}</h3>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm ${
                            c.severity === 'critical'
                              ? 'text-red-400 bg-red-900/30'
                              : c.severity === 'warning'
                              ? 'text-yellow-400 bg-yellow-900/30'
                              : 'text-blue-400 bg-blue-900/30'
                          }`}
                        >
                          {severityLabel}
                        </span>
                        <span className="text-[9px] text-ivory/40 font-mono uppercase">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-ivory/70 leading-relaxed">{c.messageAr}</p>
                      <div className="mt-2 flex items-center gap-2 text-[9px] text-ivory/40 font-mono">
                        <EvidenceBadge level="VERIFIED" size="xs" />
                        <span>Source: {c.evidence.name}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Methodology note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-[10px] text-ivory/40 leading-relaxed font-mono border-t border-ivory/10 pt-4"
        >
          منهجية التحليل: قواعد قائمة على بيانات رسمية سعودية (NCNP، Vision
          2030، KKF). كل قاعدة موثقة بـ Source. هذا تحليل بنيوي، لا تنبؤ.
          <br />
          <br />
          ✦ DEFEND YOUR POLICY: المستخدم يستطيع تقديم تبرير لكل قرار.
          السؤال: لماذا اخترت هذا التخصيص؟ هل تتفق أو تختلف؟
        </motion.div>

        {/* Sequential journey nav */}
        <div className="mt-8">
          <StageNav />
        </div>
      </motion.div>
    </div>
  );
}
