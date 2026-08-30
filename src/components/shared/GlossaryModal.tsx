import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { getGlossaryTerm, GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '../../data/glossary';
import type { GlossaryCategory } from '../../data/glossary';

/**
 * Glossary modal — searchable, categorized browser for all model concepts.
 * Store-driven: opens when a glossaryTerm is selected (via GlossaryTag or elsewhere).
 */
export function GlossaryModal() {
  const termId = useLabStore((s) => s.glossaryTerm);
  const setGlossaryTerm = useLabStore((s) => s.setGlossaryTerm);

  const activeTerm = termId ? getGlossaryTerm(termId) : undefined;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<GlossaryCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.labelAr.toLowerCase().includes(q) ||
        t.labelEn.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  return (
    <AnimatePresence>
      {activeTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setGlossaryTerm(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel terminal-border p-6 max-w-2xl w-full relative max-h-[85vh] flex flex-col"
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

            {/* Search */}
            <div className="mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن مصطلح… (SROI, multiplier, PPF)"
                className="w-full bg-midnight-900/60 border border-ivory/15 px-3 py-2 text-sm text-ivory placeholder-ivory/30 focus:border-gold/50 focus:outline-none font-mono"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setCategory('all')}
                className={`px-3 py-1 text-[10px] font-mono uppercase border ${
                  category === 'all'
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-ivory/15 text-ivory/50 hover:border-ivory/30'
                }`}
              >
                الكل
              </button>
              {(Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase border ${
                    category === c
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-ivory/15 text-ivory/50 hover:border-ivory/30'
                  }`}
                >
                  {GLOSSARY_CATEGORIES[c].labelAr}
                </button>
              ))}
            </div>

            {/* Term list */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-2">
              {filtered.length === 0 && (
                <div className="text-sm text-ivory/40 py-8 text-center">
                  لا توجد نتائج مطابقة
                </div>
              )}
              {filtered.map((t) => {
                const isActive = t.id === termId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setGlossaryTerm(t.id)}
                    className={`w-full text-left p-3 border transition-colors ${
                      isActive
                        ? 'border-gold/50 bg-gold/5'
                        : 'border-ivory/10 hover:border-ivory/25 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-ivory">{t.labelAr}</div>
                      <div
                        className={`text-[9px] font-mono uppercase ${GLOSSARY_CATEGORIES[t.category].color}`}
                      >
                        {GLOSSARY_CATEGORIES[t.category].labelAr}
                      </div>
                    </div>
                    <div className="text-[10px] text-ivory/40 font-mono mt-0.5">{t.labelEn}</div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 border-t border-ivory/10 pt-2"
                      >
                        <p className="text-xs text-ivory/80 leading-relaxed">{t.body}</p>
                        {t.formula && (
                          <div className="mt-2 p-2 bg-midnight-900/60 border border-gold/15 rounded-sm">
                            <div className="text-[9px] text-ivory/40 font-mono mb-1">FORMULA</div>
                            <div className="text-xs text-gold font-mono">{t.formula}</div>
                          </div>
                        )}
                        {t.example && (
                          <div className="mt-2 text-[11px] text-emerald-300/70">
                            <span className="text-ivory/40 font-mono">مثال:</span> {t.example}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
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
