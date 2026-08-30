import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import {
  CONSEQUENCE_SHOCKS,
  buildConsequenceProfile,
  type ConsequenceShockKey,
} from '../../engine/consequence';
import { formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { StageNav } from '../shared/StageNav';

const LEVER_META = [
  {
    key: 'governance' as const,
    labelEn: 'Governance',
    labelAr: 'حوكمة',
    color: '#2dd4bf',
    hint: 'شفافية، رقابة، استمرارية التعليمات التنفيذية',
  },
  {
    key: 'environmental' as const,
    labelEn: 'Environmental',
    labelAr: 'بيئة',
    color: '#22c55e',
    hint: 'استدامة بيئية للتمويل والمنشآت',
  },
  {
    key: 'social' as const,
    labelEn: 'Social',
    labelAr: 'اجتماعي',
    color: '#8b5cf6',
    hint: 'تماسك مجتمعي وشبكات أمان',
  },
];

export function ConsequenceLab() {
  const allocations = useLabStore((s) => s.allocations);
  const setStage = useLabStore((s) => s.setStage);

  const governance = useLabStore((s) => s.governance);
  const setGovernance = useLabStore((s) => s.setGovernance);
  const environmental = useLabStore((s) => s.environmental);
  const setEnvironmental = useLabStore((s) => s.setEnvironmental);
  const social = useLabStore((s) => s.social);
  const setSocial = useLabStore((s) => s.setSocial);

  const [activeKey, setActiveKey] = useState<ConsequenceShockKey>('economic');

  const profile = useMemo(
    () =>
      buildConsequenceProfile(
        SECTORS,
        allocations,
        { governance, environmental, social },
        activeKey
      ),
    [allocations, governance, environmental, social, activeKey]
  );

  const activeShock =
    CONSEQUENCE_SHOCKS.find((s) => s.key === activeKey) ?? CONSEQUENCE_SHOCKS[0];

  const setLever = (key: 'governance' | 'environmental' | 'social', v: number) => {
    if (key === 'governance') setGovernance(v);
    else if (key === 'environmental') setEnvironmental(v);
    else setSocial(v);
  };

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* The bridge */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl text-ivory font-light uppercase"
          >
            But can it <span className="text-gold">survive</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 text-ivory/50 text-sm max-w-2xl mx-auto"
          >
            Your portfolio looks strong on paper. Every allocation is justified, every
            riyal works twice. But the real test of social capital is not its size — it
            is what survives when the ground moves. Enter the Consequence Lab.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-[10px] font-mono tracking-[0.3em] uppercase text-ivory/30"
          >
            / J O U D — E C O N O M I C P O L I C Y L A B
          </motion.div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            The Consequence Lab
          </div>
          <h2 className="text-2xl md:text-3xl text-ivory font-light mt-2">
            ماذا لو؟ — What could go wrong?
          </h2>
          <p className="text-ivory/60 mt-2 text-sm">
            Before the formal stress test, confront your portfolio with the four
            archetypes that actually break social programs.
            <span className="text-ivory/40 text-xs block mt-1 font-mono">
              The ESG levers below are an illustrative model parameter — they do not
              modify the portfolio or the stress engine, only this view.
            </span>
          </p>
        </div>

        {/* Shock archetypes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
              Four Archetype Shocks / أربعة نماذج صدمة
            </div>
            <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CONSEQUENCE_SHOCKS.map((s) => {
              const isActive = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveKey(s.key)}
                  className={`text-right p-3 border rounded-sm transition ${
                    isActive
                      ? 'border-gold bg-gold/10'
                      : 'border-ivory/10 hover:border-ivory/30 bg-midnight-800/30'
                  }`}
                >
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: isActive ? s.color : 'rgba(255,255,255,0.3)' }}
                  >
                    {s.order}
                  </div>
                  <div className="text-sm text-ivory mt-1">{s.titleAr}</div>
                  <div className="text-[10px] text-ivory/50 font-mono mt-0.5">
                    {s.titleEn}
                  </div>
                  <div className="text-[9px] text-ivory/40 mt-1 leading-relaxed">
                    {s.blurb}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ESG levers */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-panel terminal-border p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
                Governance / Environment / Social levers
              </div>
              <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
            </div>
            <p className="text-[10px] text-ivory/40 mb-5">
              Illustrative levers for this view only — they do not touch the portfolio
              model. Higher governance quality may be associated with higher resilience.
            </p>
            <div className="space-y-6">
              {LEVER_META.map((l) => {
                const val =
                  l.key === 'governance'
                    ? governance
                    : l.key === 'environmental'
                    ? environmental
                    : social;
                return (
                  <div key={l.key}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-sm"
                          style={{ backgroundColor: l.color }}
                        />
                        <span className="text-xs text-ivory/80">{l.labelAr}</span>
                        <span className="text-[9px] text-ivory/40 font-mono">
                          {l.labelEn}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-ivory tabular-nums">
                        {Math.round(val * 100)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(val * 100)}
                      onChange={(e) => setLever(l.key, Number(e.target.value) / 100)}
                      className="w-full accent-[#c8a45d]"
                      aria-label={l.labelEn}
                    />
                    <div className="text-[9px] text-ivory/30 mt-1">{l.hint}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Impact profile */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 glass-panel terminal-border p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
                Impact Profile under {activeShock.titleEn}
              </div>
              <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey + '-' + profile.retention.toFixed(0)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="lux-glass p-4">
                    <div className="text-[10px] text-ivory/50 font-mono mb-1">
                      Impact Retention
                      <span className="block text-[9px] text-ivory/30">
                        الأثر المحفوظ بعد الصدمة
                      </span>
                    </div>
                    <div
                      className={`text-4xl font-mono tabular-nums ${
                        profile.retention > 80
                          ? 'text-[#10b981]'
                          : profile.retention > 60
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {profile.retention.toFixed(0)}%
                    </div>
                  </div>
                  <div className="lux-glass p-4">
                    <div className="text-[10px] text-ivory/50 font-mono mb-1">
                      Resilience Score
                      <span className="block text-[9px] text-ivory/30">
                        درجة المرونة الإجمالية
                      </span>
                    </div>
                    <div className="text-4xl font-mono tabular-nums text-ivory">
                      {formatPercent(profile.resilienceWithEsg, 0)}
                    </div>
                  </div>
                  <div className="lux-glass p-4">
                    <div className="text-[10px] text-ivory/50 font-mono mb-1">
                      ESG Composite
                      <span className="block text-[9px] text-ivory/30">
                        المركب التوضيحي
                      </span>
                    </div>
                    <div className="text-4xl font-mono tabular-nums text-gold">
                      {formatPercent(profile.esg.composite, 0)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {profile.dimensions.map((d) => (
                    <div key={d.key} className="flex items-center gap-3">
                      <div className="w-32 flex-shrink-0">
                        <div className="text-[10px] text-ivory/70 font-mono">
                          {d.labelEn}
                        </div>
                        <div className="text-[9px] text-ivory/40">{d.labelAr}</div>
                      </div>
                      <div className="flex-1 h-2.5 bg-midnight-700 rounded-sm overflow-hidden">
                        <motion.div
                          className="h-full rounded-sm"
                          style={{ backgroundColor: d.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${d.score}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="w-12 text-right font-mono text-xs text-ivory tabular-nums">
                        {d.score}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-ivory/10 pt-3">
                  <div className="text-[10px] font-mono text-gold uppercase tracking-widest">
                    {profile.strategyLabel}
                  </div>
                  <p className="text-[12px] text-ivory/60 mt-1">
                    {profile.strategyTaglineAr}
                  </p>
                  <p className="text-[9px] text-ivory/30 mt-2 font-mono">
                    Illustrative model parameter — not a claim that any real outcome is
                    preventable.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bridge to policy review */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel terminal-border p-6 mt-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            From consequence to decision
          </div>
          <p className="text-sm text-ivory/60 mb-4">
            Now that you have seen what could break — walk each consequence back into
            your allocation, then defend it.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStage('regional')}
              className="px-4 py-2.5 border border-ivory/20 text-ivory/70 text-xs font-mono tracking-widest uppercase hover:bg-ivory/5 cursor-pointer"
            >
              Regional View
            </button>
            <button
              onClick={() => setStage('critique')}
              className="px-4 py-2.5 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10 cursor-pointer"
            >
              Defend Your Decision
            </button>
            <button
              onClick={() => setStage('brief')}
              className="px-4 py-2.5 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10 cursor-pointer"
            >
              Policy Brief
            </button>
          </div>
          <div className="mt-4 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
            Joud Al-Arjani
          </div>
        </motion.div>

        <StageNav />
      </motion.div>
    </div>
  );
}