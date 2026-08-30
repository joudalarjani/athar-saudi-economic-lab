import { motion } from 'framer-motion';
import { useLabStore, type Stage } from '../../state/labStore';

const STAGES: Array<{ id: Stage; label: string; ar: string }> = [
  { id: 'lab', label: 'Lab', ar: 'مختبر' },
  { id: 'analysis', label: 'Analysis', ar: 'تحليل' },
  { id: 'optimization', label: 'Optimize', ar: 'تحسين' },
  { id: 'stress', label: 'Stress', ar: 'صدمات' },
  { id: 'sensitivity', label: 'Sensitivity', ar: 'حساسية' },
  { id: 'capitalStack', label: 'Capital', ar: 'تمويل' },
  { id: 'regional', label: 'Regional', ar: 'إقليمي' },
  { id: 'ppf', label: 'PPF', ar: 'PPF' },
  { id: 'marginalReturns', label: 'Marginal', ar: 'عائد حدي' },
  { id: 'critique', label: 'Critique', ar: 'مراجعة' },
  { id: 'brief', label: 'Brief', ar: 'موجز' },
  { id: 'credits', label: 'Credits', ar: 'شكراً' },
];

export function GlobalNav() {
  const stage = useLabStore((s) => s.stage);
  const setStage = useLabStore((s) => s.setStage);
  const setShowModelExplainer = useLabStore((s) => s.setShowModelExplainer);
  const setShowSources = useLabStore((s) => s.setShowSources);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-30 glass-panel border-b border-gold/20"
    >
      <div className="px-3 md:px-6 py-3 flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setStage('hero')}
          className="text-[10px] tracking-widest text-ivory/50 hover:text-gold uppercase font-mono flex-shrink-0"
        >
          ← HERO
        </button>
        <div className="w-px h-4 bg-ivory/20 hidden md:block" />
        <div className="hidden md:block">
          <div className="text-[10px] tracking-[0.25em] uppercase text-gold font-mono">
            ATHAR
          </div>
          <div className="text-[9px] text-ivory/40 -mt-0.5">
            Saudi Social Investment & Economic Policy Lab
          </div>
        </div>

        {/* Stage navigation - scrollable on small */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={`text-[10px] tracking-widest px-2.5 py-1.5 font-mono uppercase rounded-sm transition flex-shrink-0 ${
                  stage === s.id
                    ? 'bg-gold text-midnight-900'
                    : 'text-ivory/50 hover:text-ivory hover:bg-ivory/5'
                }`}
              >
                {s.ar}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowSources(true)}
          className="text-[10px] tracking-widest text-gold/80 hover:text-gold uppercase font-mono border border-gold/30 px-2 py-1 flex-shrink-0"
        >
          المصادر
        </button>

        <button
          onClick={() => setShowModelExplainer(true)}
          className="text-[10px] tracking-widest text-gold/80 hover:text-gold uppercase font-mono border border-gold/30 px-2 py-1 flex-shrink-0"
        >
          How it works
        </button>
      </div>
    </motion.div>
  );
}
