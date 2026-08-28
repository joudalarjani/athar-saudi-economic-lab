import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { getGlossaryTerm } from '../../data/glossary';

/**
 * Glossary modal — shows a simple Arabic explanation for a selected term.
 */
export function GlossaryModal() {
  const termId = useLabStore((s) => s.glossaryTerm);
  const setGlossaryTerm = useLabStore((s) => s.setGlossaryTerm);

  const term = termId ? getGlossaryTerm(termId) : undefined;

  return (
    <AnimatePresence>
      {term && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setGlossaryTerm(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel terminal-border p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setGlossaryTerm(null)}
              className="absolute top-3 left-3 w-7 h-7 rounded-sm border border-ivory/20 text-ivory/50 hover:text-ivory text-sm"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="text-[10px] tracking-[0.25em] uppercase text-gold font-mono mb-2">
              Glossary / المصطلحات
            </div>
            <h3 className="text-xl text-ivory font-medium">{term.labelAr}</h3>
            <div className="text-[11px] text-ivory/50 font-mono mt-1">{term.labelEn}</div>
            <p className="text-sm text-ivory/80 leading-relaxed mt-4">
              {term.body}
            </p>
            {term.formula && (
              <div className="mt-4 p-3 bg-midnight-900/60 border border-gold/15 rounded-sm">
                <div className="text-[10px] text-ivory/40 font-mono mb-1">FORMULA</div>
                <div className="text-sm text-gold font-mono">{term.formula}</div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Small "?" tag next to a term that opens the glossary for that term.
 */
export function GlossaryTag({ id, children }: { id: Parameters<typeof getGlossaryTerm>[0]; children: React.ReactNode }) {
  const setGlossaryTerm = useLabStore((s) => s.setGlossaryTerm);
  return (
    <span className="inline-flex items-center gap-1">
      <span>{children}</span>
      <button
        onClick={() => setGlossaryTerm(id)}
        className="w-4 h-4 rounded-full border border-gold/40 text-gold text-[9px] leading-none flex items-center justify-center hover:bg-gold/10"
        aria-label={`Explain ${children}`}
      >
        ?
      </button>
    </span>
  );
}
