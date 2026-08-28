import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { getCaseStudiesBySector } from '../../data/caseStudies';
import { EvidenceBadge } from './EvidenceBadge';

const EVIDENCE_LABEL: Record<string, string> = {
  VERIFIED: 'Verified / موثقة',
  CASE_STUDY: 'Case Study / دراسة حالة',
  ESTIMATE: 'Estimate / تقدير',
  SIMULATION_ASSUMPTION: 'Simulation / محاكاة',
};

/**
 * Sources panel — slide-in drawer listing every SROI number, its source,
 * year, and evidence level.
 */
export function SourcesPanel() {
  const open = useLabStore((s) => s.showSources);
  const setOpen = useLabStore((s) => s.setShowSources);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-midnight-800 border-l border-gold/15 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] tracking-[0.25em] uppercase text-gold font-mono">
                  Sources / المصادر
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-sm border border-ivory/20 text-ivory/50 hover:text-ivory text-sm"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-ivory/50 mb-5">
                كل رقم SROI في النموذج يتبع مصدره الموثق، سنة، ومستوى الأدلة.
              </p>

              {SECTORS.map((s) => {
                const cases = getCaseStudiesBySector(s.id);
                const evLevel = s.sroiRange.evidence.level;
                return (
                  <div key={s.id} className="mb-5 glass-panel p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ivory font-medium">{s.arName}</span>
                      <EvidenceBadge level={evLevel} size="xs" showLabel={false} />
                    </div>
                    <div className="text-lg font-mono text-gold tabular-nums">
                      {s.sroiRange.min.toFixed(1)}×–{s.sroiRange.max.toFixed(1)}×
                    </div>
                    <div className="mt-2 text-[11px] text-ivory/70 leading-relaxed">
                      {s.sroiRange.evidence.source.name}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-ivory/50 font-mono">
                      <span>سنة: {s.sroiRange.evidence.source.year}</span>
                      <span>•</span>
                      <span>{EVIDENCE_LABEL[evLevel] ?? evLevel}</span>
                    </div>
                    {s.sroiRange.evidence.source.url && (
                      <a
                        href={s.sroiRange.evidence.source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-[10px] text-gold/80 hover:text-gold font-mono underline"
                      >
                        المصدر ↗
                      </a>
                    )}

                    {cases.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ivory/10 space-y-2">
                        {cases.map((c) => (
                          <div key={c.id}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-ivory/70">{c.program}</span>
                              <span className="text-[11px] font-mono text-emerald-400">
                                {c.reportedSROI.toFixed(2)}×
                              </span>
                            </div>
                            <a
                              href={c.evidenceSource.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block text-[9px] text-gold/70 hover:text-gold font-mono underline mt-0.5"
                            >
                              {c.evidenceSource.name} (سنة {c.evidenceSource.year}) ↗
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
