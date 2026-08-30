import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { buildChallenges, analyzeDefense, type AnchorType, type DefenseVerdict } from '../../engine/reviewer';
import { EvidenceBadge } from '../shared/EvidenceBadge';

const ANCHOR_STYLE: Record<AnchorType, { label: string; ar: string; cls: string }> = {
  REAL_DATA: { label: 'REAL DATA', ar: 'بيانات فعلية (تخصيصك)', cls: 'text-[#10b981] bg-emerald-900/30 border-emerald-700/40' },
  MODEL_ASSUMPTION: { label: 'MODEL ASSUMPTION', ar: 'افتراض نموذج (بمرجع)', cls: 'text-yellow-300 bg-yellow-900/30 border-yellow-700/40' },
  SIMULATION_OUTPUT: { label: 'SIMULATION OUTPUT', ar: 'مخرجات محاكاة', cls: 'text-orange-300 bg-orange-900/30 border-orange-700/40' },
};

const SEVERITY_ICON: Record<string, string> = { critical: '⊗', warning: '⚠', info: 'ⓘ' };
const SEVERITY_COLOR: Record<string, string> = { critical: 'text-red-400', warning: 'text-yellow-400', info: 'text-blue-400' };

const BAND_STYLE: Record<DefenseVerdict['band'], { color: string; bar: string; label: string }> = {
  REFUTED: { color: 'text-[#10b981]', bar: 'bg-emerald-500', label: 'DEFENSE OBSERVED' },
  PARTIAL: { color: 'text-yellow-400', bar: 'bg-yellow-500', label: 'PARTIAL DEFENSE' },
  OVERMATCHED: { color: 'text-red-400', bar: 'bg-red-500', label: 'OVERMATCHED' },
};

export function DefendDecision() {
  const allocations = useLabStore((s) => s.allocations);
  const [defense, setDefense] = useState('');

  const verdict = useMemo(() => analyzeDefense(SECTORS, allocations, defense), [allocations, defense]);
  const transcript = useMemo(() => buildChallenges(SECTORS, allocations), [allocations]);
  const live = defense.trim().length > 2;
  const band = BAND_STYLE[verdict.band];
  const shownChallenges = live ? verdict.challenges : transcript;

  return (
    <div className="glass-panel terminal-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          ✦ Defend Your Decision — AI Economic Reviewer
        </div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>

      <p className="text-[10px] text-ivory/40 mb-5">
        The reviewer challenges your allocation with the numbers it actually produced
        (your choices are real data; model scores and simulations are labeled). Write
        your defense — coverage is analysed live. This measures articulation, not truth.
      </p>

      {/* Transcript */}
      <div className="space-y-2 mb-6">
        {shownChallenges.length === 0 ? (
          <div className="lux-glass p-4 text-[11px] text-[#10b981]">
            ✓ No structural challenges — the portfolio numbers raise no red flags.
          </div>
        ) : (
          shownChallenges.map((c) => {
            const anchor = ANCHOR_STYLE[c.anchor];
            const addressed = live && c.addressed === true;
            const stateCls =
              live && addressed
                ? 'border-emerald-700/40 bg-emerald-900/10'
                : 'border-ivory/10 bg-midnight-800/30';
            return (
              <div key={c.id} className={`border ${stateCls} rounded-sm p-3 transition`}>
                <div className="flex items-start gap-3">
                  <div className={`text-base mt-0.5 ${SEVERITY_COLOR[c.severity]}`}>
                    {SEVERITY_ICON[c.severity]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-ivory font-medium">{c.questionAr}</span>
                    </div>
                    <div className="text-[10px] text-ivory/50 mb-2">{c.questionEn}</div>
                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono">
                      <span className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 ${anchor.cls}`}>
                        {anchor.label}
                      </span>
                      <span className="text-ivory/40">{anchor.ar}</span>
                      <span className="text-gold/70 tabular-nums">{c.figure}</span>
                      <span className="text-ivory/30 truncate max-w-[200px]">#{c.evidence.name.slice(0, 46)}…</span>
                      {live && addressed && (
                        <span className="text-[#10b981]">✓ addressed in defense</span>
                      )}
                      {live && !addressed && (
                        <span className="text-orange-300/80">still open</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Defense input */}
      <div className="mb-5">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
          Your Defense / اكتب تبريرك
        </div>
        <textarea
          value={defense}
          onChange={(e) => setDefense(e.target.value)}
          rows={4}
          placeholder="مثال: خصصت للتعليم رغم تركيزه لأن رأس المال البشري أولوية رؤية 2030، وأوافق أن الصحة تحتاج حصة أكبر في المرحلة الثانية…"
          className="w-full bg-midnight-800/60 border border-ivory/15 rounded px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 resize-none leading-relaxed"
        />
        <div className="mt-1.5 text-[10px] text-ivory/35 font-mono">
          {live
            ? `تحليل مباشر — غطيت ${verdict.addressed} من ${verdict.total} تحديًا`
            : 'اكتب 3 أحرف فأكثر ليبدأ مراجعة التغطية'}
        </div>
      </div>

      {/* Reviewer verdict */}
      {live && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gold/25 bg-gold/[0.04] rounded p-4"
        >
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-[10px] font-mono tracking-widest uppercase ${band.color}`}>
              {band.label} — {Math.round(verdict.score * 100)} / 100
            </span>
            <span className="text-[10px] text-ivory/40 font-mono tabular-nums">
              {verdict.addressed} addressed · {verdict.unaddressed} open
            </span>
          </div>
          <div className="h-2.5 bg-midnight-700 rounded-sm overflow-hidden mb-3">
            <motion.div
              className={`h-full ${band.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${verdict.score * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-ivory/80 leading-relaxed">{verdict.reviewerCommentAr}</p>
          <div className="mt-2 text-[9px] text-ivory/35 font-mono">
            Keyword-based, illustrative analysis — records your rationale as input, never as fact.
          </div>
        </motion.div>
      )}

      <div className="mt-4 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
        Joud Al-Arjani
      </div>
    </div>
  );
}